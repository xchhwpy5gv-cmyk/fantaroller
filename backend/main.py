import json
import secrets
from database import engine, SessionLocal
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, text
from models import Base, User, Athlete, Squadra, Impostazioni, Gara, PuntiEvento, League, Messaggio
from schemas import UserCreate, UserLogin, Token, AggiornaPrezzoRequest
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

SECRET_KEY = "fantaroller2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 365

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login/")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def crea_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_utente_corrente(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token non valido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token non valido")
    utente = db.query(User).filter(User.username == username).first()
    if utente is None:
        raise HTTPException(status_code=401, detail="Utente non trovato")
    return utente

@app.get("/")
def home():
    return {"message": "Fantaroller online!"}

@app.post("/register/")
def register_user(user: UserCreate, db=Depends(get_db)):
    if len(user.username) < 3:
        raise HTTPException(status_code=400, detail="Username troppo corto (min 3 caratteri)")
    if len(user.username) > 20:
        raise HTTPException(status_code=400, detail="Username troppo lungo (max 20 caratteri)")
    if len(user.password) < 4:
        raise HTTPException(status_code=400, detail="Password troppo corta (min 4 caratteri)")
    if len(user.password) > 30:
        raise HTTPException(status_code=400, detail="Password troppo lunga (max 30 caratteri)")
    esistente = db.query(User).filter(User.username == user.username).first()
    if esistente:
        raise HTTPException(status_code=400, detail="Username già esistente")
    hashed = pwd_context.hash(user.password)
    nuovo = User(username=user.username, password=hashed)
    db.add(nuovo)
    db.commit()
    return {"message": "Utente creato"}

@app.get("/atleta/{atleta_id}/statistiche")
def statistiche_atleta(atleta_id: int, db=Depends(get_db)):
    atleta = db.query(Athlete).filter(Athlete.id == atleta_id).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta non trovato")
    
    # Punti per evento
    punti_eventi = db.query(PuntiEvento).filter(PuntiEvento.atleta_id == atleta_id).all()
    eventi = [{"evento": p.evento, "punti": p.punti} for p in punti_eventi]
    
    # Quante squadre lo hanno
    from sqlalchemy import text
    count = db.execute(text(f"SELECT COUNT(*) FROM squadra_atleti WHERE atleta_id = {atleta_id}")).scalar()
    
    return {
        "name": atleta.name,
        "categoria": atleta.categoria,
        "punti_totali": atleta.punti,
        "gare": atleta.gare,
        "prezzo": atleta.prezzo,
        "eventi": eventi,
        "in_squadre": count
    }


@app.post("/login/", response_model=Token)
def login(user: UserLogin, db=Depends(get_db)):
    utente = db.query(User).filter(User.username == user.username).first()
    if not utente or not pwd_context.verify(user.password, utente.password):
        raise HTTPException(status_code=401, detail="Credenziali errate")
    token = crea_token({"sub": utente.username})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me/")
def chi_sono(utente=Depends(get_utente_corrente)):
    return {"username": utente.username, "id": utente.id, "is_admin": utente.is_admin}

@app.post("/import-athletes")
def import_athletes(db=Depends(get_db)):
    try:
        with open("../scraper/listone.json", "r") as file:
            data = json.load(file)

        importati = 0
        errori = 0
        
        for atleta in data:
            try:
                nome_completo = atleta["nome"]
                separatore = None
                for sep in [" \u2013 ", " - ", "\u2013", "-"]:
                    if sep in nome_completo:
                        separatore = sep
                        break
                if separatore:
                    parti = nome_completo.split(separatore, 1)
                    nome = parti[0].strip()
                    categoria = parti[1].strip()
                else:
                    nome = nome_completo.strip()
                    categoria = ""

                # Controlla se esiste già
                esistente = db.query(Athlete).filter(
                    Athlete.name == nome,
                    Athlete.categoria == categoria
                ).first()
                
                if esistente:
                    esistente.punti = atleta["punti"]
                    esistente.prezzo = atleta["prezzo"]
                    esistente.gare = atleta["gare"]
                    esistente.malus = atleta.get("malus", 0)
                else:
                    nuovo = Athlete(
                        name=nome,
                        categoria=categoria,
                        punti=atleta["punti"],
                        prezzo=atleta["prezzo"],
                        gare=atleta["gare"],
                        malus=atleta.get("malus", 0),
                        visibile=1
                    )
                    db.add(nuovo)
                importati += 1
                
                if importati % 100 == 0:
                    db.commit()
                    
            except Exception as e:
                errori += 1
                print(f"Errore atleta {atleta.get('nome', '?')}: {e}")
                
        db.commit()
        return {"message": f"Atleti importati: {importati}, errori: {errori}"}
    except Exception as e:
        db.rollback()
        return {"message": f"Errore: {str(e)}"}

@app.delete("/reset-athletes")
def reset_athletes(db=Depends(get_db)):
    db.query(PuntiEvento).delete()
    db.query(Athlete).delete()
    db.commit()
    return {"message": "Atleti cancellati"}

@app.get("/athletes/")
def lista_atleti(db=Depends(get_db)):
    atleti = db.query(Athlete).filter(Athlete.visibile == 1).all()
    return atleti

@app.post("/squadra/crea")
def crea_squadra(nome: str, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    esistente = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    if esistente:
        raise HTTPException(status_code=400, detail="Hai già una squadra")
    nuova = Squadra(nome=nome, user_id=utente.id)
    db.add(nuova)
    db.commit()
    return {"message": f"Squadra '{nome}' creata!"}

@app.post("/squadra/acquista/{atleta_id}")
def acquista_atleta(atleta_id: int, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    imp = db.query(Impostazioni).first()
    if not imp.mercato_aperto:
        raise HTTPException(status_code=400, detail="Il mercato è chiuso!")

    if not squadra:
        raise HTTPException(status_code=400, detail="Crea prima una squadra")
atleta = db.query(Athlete).filter(Athlete.id == atleta_id).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta non trovato")
    if atleta in squadra.atleti:
        raise HTTPException(status_code=400, detail="Atleta già in squadra")
    if len(squadra.atleti) >= 16:
        raise HTTPException(status_code=400, detail="Squadra completa! Massimo 16 atleti")
    # Blocca acquisto Ragazzi/Ragazze se squadra già completa con quelle categorie
    categorie_bloccate = ["Ragazzi Maschi", "Ragazze Femminile"]
    if atleta.categoria in categorie_bloccate:
        raise HTTPException(status_code=400, detail="Non puoi più acquistare atleti di questa categoria")
    atleti_stessa_categoria = [a for a in squadra.atleti if a.categoria == atleta.categoria]
    if len(atleti_stessa_categoria) >= 2:
        raise HTTPException(status_code=400, detail=f"Hai già 2 atleti in {atleta.categoria}")

    if utente.budget < atleta.prezzo:
        raise HTTPException(status_code=400, detail="Budget insufficiente")
    squadra.atleti.append(atleta)
    utente.budget -= atleta.prezzo
    db.commit()
    return {"message": f"{atleta.name} acquistato!", "budget_rimasto": utente.budget}

@app.get("/squadra/")
def vedi_squadra(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    if not squadra:
        raise HTTPException(status_code=404, detail="Nessuna squadra trovata")
    return {
        "nome": squadra.nome,
        "budget": utente.budget,
       "atleti": [{
            "id": a.id,
            "name": a.name,
            "categoria": a.categoria,
            "prezzo": a.prezzo,
            "punti": (db.query(PuntiEvento).filter(
                PuntiEvento.atleta_id == a.id,
                PuntiEvento.evento == "Campionati Italiani Pista 2026"
            ).first() or type('', (), {'punti': 0})()).punti
        } for a in squadra.atleti]
    }

@app.post("/squadra/vendi/{atleta_id}")
def vendi_atleta(atleta_id: int, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    imp = db.query(Impostazioni).first()
    if not imp.mercato_aperto:
        raise HTTPException(status_code=400, detail="Il mercato è chiuso, non puoi vendere atleti!")
    squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    if not squadra:
        raise HTTPException(status_code=400, detail="Nessuna squadra trovata")
    atleta = db.query(Athlete).filter(Athlete.id == atleta_id).first()
    if atleta and atleta.categoria in ["Ragazzi Maschi", "Ragazze Femminile"]:
        raise HTTPException(status_code=400, detail="Non puoi vendere atleti di Ragazzi/Ragazze")
    atleta = db.query(Athlete).filter(Athlete.id == atleta_id).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta non trovato")
    if atleta not in squadra.atleti:
        raise HTTPException(status_code=400, detail="Atleta non in squadra")
    squadra.atleti.remove(atleta)
    utente.budget += atleta.prezzo
    db.commit()
    return {"message": f"{atleta.name} venduto!", "budget_rimasto": utente.budget}

@app.get("/admin/stato-mercato")
def stato_mercato(db=Depends(get_db)):
    imp = db.query(Impostazioni).first()
    return {"mercato_aperto": bool(imp.mercato_aperto)}

@app.post("/admin/apri-mercato")
def apri_mercato(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    imp = db.query(Impostazioni).first()
    if not imp:
        imp = Impostazioni(id=1, mercato_aperto=1)
        db.add(imp)
    else:
        imp.mercato_aperto = 1
    db.commit()
    return {"message": "Mercato aperto!"}

@app.post("/admin/chiudi-mercato")
def chiudi_mercato(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    imp = db.query(Impostazioni).first()
    if not imp:
        imp = Impostazioni(id=1, mercato_aperto=0)
        db.add(imp)
    else:
        imp.mercato_aperto = 0
    db.commit()
    return {"message": "Mercato chiuso!"}


@app.post("/admin/set-admin/{username}")
def set_admin(username: str, db=Depends(get_db)):
    utente = db.query(User).filter(User.username == username).first()
    if not utente:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    utente.is_admin = 1
    db.commit()
    return {"message": f"{username} è ora admin"}
   
@app.post("/admin/init")
def init_db(db=Depends(get_db)):
    imp = db.query(Impostazioni).first()
    if not imp:
        db.add(Impostazioni(id=1, mercato_aperto=1))
        db.commit()
        return {"message": "Database inizializzato"}
    return {"message": "Già inizializzato"}

@app.get("/admin/debug-impostazioni")
def debug_impostazioni(db=Depends(get_db)):
    imp = db.query(Impostazioni).all()
    return [{"id": i.id, "mercato_aperto": i.mercato_aperto} for i in imp]

@app.get("/classifica/")
def classifica(evento: str = None, db=Depends(get_db)):
    from sqlalchemy import text
    if evento:
        rows = db.execute(text("""
            SELECT u.username, s.nome, COALESCE(SUM(pe.punti), 0) + COALESCE(s.punti_bonus, 0) as punti, COALESCE(s.is_new, 0) as is_new
            FROM users u
            JOIN squadre s ON s.user_id = u.id
            JOIN squadra_atleti sa ON sa.squadra_id = s.id
            LEFT JOIN punti_evento pe ON pe.atleta_id = sa.atleta_id AND pe.evento = :evento
            GROUP BY u.username, s.nome, s.id, s.punti_bonus, s.is_new
            HAVING COUNT(sa.atleta_id) >= 16
            ORDER BY punti DESC
            LIMIT 1000
        """), {"evento": evento}).fetchall()
    else:
        rows = db.execute(text("""
            SELECT u.username, s.nome, COALESCE(SUM(a.punti), 0) + COALESCE(s.punti_bonus, 0) as punti, COALESCE(s.is_new, 0) as is_new
            FROM users u
            JOIN squadre s ON s.user_id = u.id
            JOIN squadra_atleti sa ON sa.squadra_id = s.id
            JOIN athletes a ON a.id = sa.atleta_id
            GROUP BY u.username, s.nome, s.id, s.punti_bonus, s.is_new
            HAVING COUNT(sa.atleta_id) >= 16
            ORDER BY punti DESC
            LIMIT 1000
        """)).fetchall()
    return [{"username": r[0], "squadra": r[1], "punti": r[2], "n_atleti": 16, "is_new": r[3]} for r in rows]



@app.get("/classifica/eventi")
def lista_eventi(db=Depends(get_db)):
    eventi = db.query(PuntiEvento.evento).distinct().all()
    return [e[0] for e in eventi]


@app.get("/classifica-evento/{evento}")
def classifica_evento(evento: str, db=Depends(get_db)):

    utenti = db.query(User).all()

    risultati = []

    for utente in utenti:

        squadra = db.query(Squadra).filter(
            Squadra.user_id == utente.id
        ).first()

        if squadra:

            punti_totali = 0

            for atleta in squadra.atleti:

                punti_evento = db.query(PuntiEvento).filter(
                    PuntiEvento.atleta_id == atleta.id,
                    PuntiEvento.evento == evento
                ).all()

                punti_totali += sum(p.punti for p in punti_evento)

            risultati.append({
                "username": utente.username,
                "squadra": squadra.nome,
                "punti": punti_totali,
                "n_atleti": len(squadra.atleti)
            })

    risultati.sort(key=lambda x: x["punti"], reverse=True)

    return risultati

@app.get("/eventi")
def lista_eventi(db=Depends(get_db)):

    eventi = db.query(Gara.evento).distinct().all()

    return [e[0] for e in eventi]

    
@app.post("/admin/aggiungi-gara")
def aggiungi_gara(url: str, categoria: str, moltiplicatore: float, evento: str, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    nuova_gara = Gara(url=url, categoria=categoria, moltiplicatore=str(moltiplicatore), evento=evento)
    db.add(nuova_gara)
    db.commit()
    return {"message": "Gara aggiunta!"}

@app.get("/admin/gare")
def lista_gare(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    gare = db.query(Gara).all()
    return gare

@app.delete("/admin/gara/{gara_id}")
def elimina_gara(gara_id: int, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    gara = db.query(Gara).filter(Gara.id == gara_id).first()
    if not gara:
        raise HTTPException(status_code=404, detail="Gara non trovata")
    db.delete(gara)
    db.commit()
    return {"message": "Gara eliminata"}

@app.post("/admin/calcola-punti")
def calcola_punti(evento: str = None, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    import requests
    from bs4 import BeautifulSoup

    def punti_base(pos):
        pos = int(pos)
        if pos == 1: return 100
        elif pos == 2: return 85
        elif pos == 3: return 75
        elif pos == 4: return 65
        elif pos == 5: return 55
        elif pos <= 10: return 50 - (pos-6)*5
        elif pos <= 20: return 20
        else: return 5

    def normalizza_nome(nome):
        return nome.lower().replace("ò", "o").replace("ó", "o").replace("'", "").replace("?", "").strip()

    if evento:
        gare = db.query(Gara).filter(Gara.evento == evento).all()
        db.query(PuntiEvento).filter(PuntiEvento.evento == evento).delete()
        # Ricalcola punti totali sottraendo i punti dell'evento
        atleti_da_aggiornare = db.query(Athlete).all()
        for atleta in atleti_da_aggiornare:
            punti_altri_eventi = db.query(PuntiEvento).filter(PuntiEvento.atleta_id == atleta.id).all()
            atleta.punti = sum(p.punti for p in punti_altri_eventi)
            atleta.gare = len(punti_altri_eventi)
        db.commit()
    else:
        gare = db.query(Gara).all()
        db.query(Athlete).update({"punti": 0, "gare": 0})
        db.query(PuntiEvento).delete()
        db.commit()

    for gara in gare:
        try:
            response = requests.get(gara.url)
            soup = BeautifulSoup(response.text, "html.parser")
            rows = soup.find_all("tr")

            # Mappa pettorale -> nome dalla classifica
            pettorale_nome = {}
            for row in rows:
                cols = row.find_all("td")
                if len(cols) > 3:
                    pettorale = cols[1].text.strip()
                    nome = cols[2].text.strip()
                    if pettorale and pettorale.isdigit():
                        pettorale_nome[pettorale] = nome

            for row in rows:
                cols = row.find_all("td")
                if len(cols) > 3:
                    posizione = cols[0].text.strip()
                    nome = cols[2].text.strip()
                    if posizione and posizione.isdigit():
                        punti = round(punti_base(posizione) * float(gara.moltiplicatore))
                        nome_norm = normalizza_nome(nome)
                        athletes = db.query(Athlete).filter(
                            Athlete.categoria == gara.categoria
                        ).all()
                        atleta = next(
                            (a for a in athletes if normalizza_nome(a.name) == nome_norm),
                            None
                        )
                        if atleta:
                            atleta.punti += punti
                            atleta.gare += 1
                            evento_esistente = db.query(PuntiEvento).filter(
                                PuntiEvento.atleta_id == atleta.id,
                                PuntiEvento.evento == gara.evento
                            ).first()
                            if evento_esistente:
                                evento_esistente.punti += punti
                            else:
                                db.add(PuntiEvento(
                                    atleta_id=atleta.id,
                                    evento=gara.evento,
                                    categoria=gara.categoria,
                                    punti=punti
                                ))

            # Leggi note per malus
            testo_pagina = soup.get_text()
            import re
            diffide = re.findall(r'Diffida al n\.\s*(\d+)\s+([A-Z\s\']+?)(?=Diffida|Ammonizione|Espulsione|$)', testo_pagina)
            ammonizioni = re.findall(r'Ammonizione al n\.\s*(\d+)\s+([A-Z\s\']+?)(?=Diffida|Ammonizione|Espulsione|$)', testo_pagina)
            espulsioni = re.findall(r'Espulsione al n\.\s*(\d+)\s+([A-Z\s\']+?)(?=Diffida|Ammonizione|Espulsione|$)', testo_pagina)

            def applica_malus(sanzioni, malus_punti):
                for pettorale, _ in sanzioni:
                    pettorale = pettorale.strip()
                    nome = pettorale_nome.get(pettorale)
                    if nome:
                        nome_norm = normalizza_nome(nome)
                        athletes = db.query(Athlete).filter(Athlete.categoria == gara.categoria).all()
                        atleta = next((a for a in athletes if normalizza_nome(a.name) == nome_norm), None)
                        if atleta:
                            atleta.punti -= malus_punti
                            evento_esistente = db.query(PuntiEvento).filter(
                                PuntiEvento.atleta_id == atleta.id,
                                PuntiEvento.evento == gara.evento
                            ).first()
                            if evento_esistente:
                                evento_esistente.punti -= malus_punti

            applica_malus(diffide, 20)
            applica_malus(ammonizioni, 10)
            applica_malus(espulsioni, 50)
            db.commit()
        except Exception as e:
            print(f"Errore gara {gara.url}: {e}")

    return {"message": "Punti aggiornati!"}


@app.post("/admin/migrate-db")
def migrate_db(db=Depends(get_db)):
    try:
        db.execute(text("ALTER TABLE punti_evento ADD COLUMN IF NOT EXISTS categoria VARCHAR"))
        db.commit()
        return {"message": "Migrazione completata"}
    except Exception as e:
        return {"message": f"Errore: {str(e)}"}

@app.post("/admin/importa-evento")
def importa_evento(url_index: str, evento: str, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    import requests
    from bs4 import BeautifulSoup
    
    try:
        response = requests.get(url_index)
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Trova tutti i link alle classifiche
        base_url = url_index.rsplit("/", 1)[0]
        links = soup.find_all("a", href=True)
        
        gare_aggiunte = 0
        for link in links:
            href = link["href"]
            testo = link.text.strip()
            
            # Prende solo i link .htm che sembrano classifiche
            if href.endswith(".htm") and href != "index.htm":
                url_gara = f"{base_url}/{href}"
                
                # Determina categoria dal nome del link
                categoria = None
                if "JUM" in href or "Junior Maschi" in testo: categoria = "Junior Maschi"
                elif "JUF" in href or "Junior Femmin" in testo: categoria = "Junior Femminile"
                elif "SEM" in href or "Senior Maschi" in testo: categoria = "Senior Maschi"
                elif "SEF" in href or "Senior Femmin" in testo: categoria = "Senior Femminile"
                elif "ALM" in href or "Allievi Maschi" in testo: categoria = "Allievi Maschi"
                elif "ALF" in href or "Alliev" in testo: categoria = "Allieve Femminile"
                elif "RAM" in href or "Ragazzi Maschi" in testo: categoria = "Ragazzi Maschi"
                elif "RAF" in href or "Ragazz" in testo: categoria = "Ragazze Femminile"
                
                moltiplicatore = 1.2
                
                if categoria:
                    # Controlla se è una staffetta
                    try:
                        res_gara = requests.get(url_gara)
                        soup_gara = BeautifulSoup(res_gara.text, "html.parser")
                        titolo = soup_gara.get_text()
                        if "Staffetta" in titolo or "staffetta" in titolo:
                            continue
                    except:
                        pass
                    
                    nuova_gara = Gara(

                        url=url_gara,
                        categoria=categoria,
                        moltiplicatore=moltiplicatore,
                        evento=evento
                    )
                    db.add(nuova_gara)
                    gare_aggiunte += 1
        
        db.commit()
        return {"message": f"Aggiunte {gare_aggiunte} gare per l'evento '{evento}'"}
    except Exception as e:
        return {"message": f"Errore: {str(e)}"}

@app.delete("/admin/reset-completo")
def reset_completo(db=Depends(get_db)):
    db.query(PuntiEvento).delete()
    db.execute(text("DELETE FROM squadra_atleti"))
    db.query(Athlete).delete()
    squadre = db.query(Squadra).all()

    for squadra in squadre:
        squadra.budget = 150
    db.commit()
    return {"message": "Reset completato"}

@app.post("/league/create")
def create_league(nome: str, password: str, db=Depends(get_db), utente=Depends(get_utente_corrente)):
    esistente = db.query(League).filter(League.nome == nome).first()
    if esistente:
        raise HTTPException(status_code=400, detail="Nome lega già in uso")
    lega = League(nome=nome, codice=password, owner_id=utente.id)
    db.add(lega)
    db.commit()
    db.refresh(lega)
    utente.leghe.append(lega)
    utente.league_id = lega.id
    db.commit()
    return {"message": f"Lega '{nome}' creata!"}

@app.post("/league/join")
def join_league(nome: str, password: str, db=Depends(get_db), utente=Depends(get_utente_corrente)):
    lega = db.query(League).filter(League.nome == nome, League.codice == password).first()
    if not lega:
        raise HTTPException(status_code=404, detail="Lega non trovata o password errata")
    if lega not in utente.leghe:
        utente.leghe.append(lega)
    utente.league_id = lega.id
    db.commit()
    return {"message": f"Sei entrato nella lega '{lega.nome}'!"}

@app.get("/league/mie-leghe")
def mie_leghe(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    return [{"id": l.id, "nome": l.nome} for l in utente.leghe]

@app.post("/league/cambia/{league_id}")
def cambia_lega(league_id: int, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    lega = db.query(League).filter(League.id == league_id).first()
    if not lega or lega not in utente.leghe:
        raise HTTPException(status_code=404, detail="Non sei in questa lega")
    utente.league_id = league_id
    db.commit()
    return {"message": f"Sei passato alla lega '{lega.nome}'"}

@app.get("/league/dettagli")
def dettagli_lega(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.league_id:
        raise HTTPException(status_code=404, detail="Non sei in nessuna lega")
    lega = db.query(League).filter(League.id == utente.league_id).first()
    partecipanti = []
    for m in lega.membri:
        squadra = db.query(Squadra).filter(Squadra.user_id == m.id).first()
        partecipanti.append({
            "username": m.username,
            "squadra": squadra.nome if squadra else None,
            "n_atleti": len(squadra.atleti) if squadra else 0,
            "is_owner": m.id == lega.owner_id
        })
    owner = db.query(User).filter(User.id == lega.owner_id).first()
    return {
        "nome": lega.nome,
        "codice": lega.codice if utente.id == lega.owner_id else None,
        "owner": owner.username,
        "partecipanti": partecipanti
    }




@app.post("/admin/reset-budget")
def reset_budget(db=Depends(get_db)):
    db.query(User).update({"budget": 150})
    db.commit()
    return {"message": "Budget resettato a 150 per tutti"}

@app.post("/admin/migrate-leagues")
def migrate_leagues(db=Depends(get_db)):
    try:
        db.execute(text("CREATE TABLE IF NOT EXISTS leagues (id SERIAL PRIMARY KEY, nome VARCHAR UNIQUE, codice VARCHAR UNIQUE, owner_id INTEGER REFERENCES users(id))"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS league_id INTEGER REFERENCES leagues(id)"))
        db.commit()
        return {"message": "Migrazione completata"}
    except Exception as e:
        db.rollback()
        return {"message": f"Errore: {str(e)}"}

@app.get("/league/dettagli")
def dettagli_lega(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.league_id:
        raise HTTPException(status_code=404, detail="Non sei in nessuna lega")
    lega = db.query(League).filter(League.id == utente.league_id).first()
    membri = db.query(User).filter(User.league_id == utente.league_id).all()
    
    partecipanti = []
    for m in membri:
        squadra = db.query(Squadra).filter(Squadra.user_id == m.id).first()
        partecipanti.append({
            "username": m.username,
            "squadra": squadra.nome if squadra else None,
            "n_atleti": len(squadra.atleti) if squadra else 0,
            "is_owner": m.id == lega.owner_id
        })
    
    return {
        "nome": lega.nome,
        "codice": lega.codice if utente.id == lega.owner_id else None,
        "owner": db.query(User).filter(User.id == lega.owner_id).first().username,
        "partecipanti": partecipanti
    }


@app.get("/league/classifica")
def classifica_lega(evento: str = None, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.league_id:
        raise HTTPException(status_code=404, detail="Non sei in nessuna lega")
    utenti_lega = db.query(User).filter(User.league_id == utente.league_id).all()
    risultati = []
    for u in utenti_lega:
        squadra = db.query(Squadra).filter(Squadra.user_id == u.id).first()
        if squadra and len(squadra.atleti) >= 16:
            if evento:
                punti_totali = 0
                for atleta in squadra.atleti:
                    pe = db.query(PuntiEvento).filter(
                        PuntiEvento.atleta_id == atleta.id,
                        PuntiEvento.evento == evento
                    ).first()
                    if pe:
                        punti_totali += pe.punti
            else:
                punti_totali = sum(a.punti for a in squadra.atleti)
            punti_totali += squadra.punti_bonus or 0
            risultati.append({
                "username": u.username,
                "squadra": squadra.nome,
                "punti": punti_totali,
                "n_atleti": len(squadra.atleti),
                "is_new": squadra.is_new or 0
            })
    risultati.sort(key=lambda x: x["punti"], reverse=True)
    return risultati

@app.post("/admin/migrate-utente-leghe")
def migrate_utente_leghe(db=Depends(get_db)):
    try:
        db.execute(text("CREATE TABLE IF NOT EXISTS utente_leghe (user_id INTEGER REFERENCES users(id), league_id INTEGER REFERENCES leagues(id))"))
        db.commit()
        return {"message": "Migrazione completata"}
    except Exception as e:
        db.rollback()
        return {"message": f"Errore: {str(e)}"}

@app.get("/gare/eventi")
def gare_eventi(db=Depends(get_db)):
    eventi = db.query(PuntiEvento.evento).distinct().all()
    return [e[0] for e in eventi]

@app.get("/gare/risultati")
def gare_risultati(evento: str, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    # Prendi atleti della squadra dell'utente
    squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    atleti_squadra = [a.id for a in squadra.atleti] if squadra else []
    
    # Prendi tutti i risultati dell'evento
    risultati = db.query(PuntiEvento).filter(PuntiEvento.evento == evento).all()
    
    # Raggruppa per categoria
    categorie = {}
    for r in risultati:
        atleta = db.query(Athlete).filter(Athlete.id == r.atleta_id).first()
        if not atleta:
            continue
        cat = r.categoria
        if cat not in categorie:
            categorie[cat] = []
        categorie[cat].append({
            "id": atleta.id,
            "name": atleta.name,
            "punti": r.punti,
            "in_squadra": atleta.id in atleti_squadra
        })
    
    # Ordina ogni categoria per punti
    for cat in categorie:
        categorie[cat].sort(key=lambda x: x["punti"], reverse=True)
    
    return categorie

@app.post("/admin/migrate-visibile")
def migrate_visibile(db=Depends(get_db)):
    try:
        db.execute(text("ALTER TABLE athletes ADD COLUMN IF NOT EXISTS visibile INTEGER DEFAULT 1"))
        db.commit()
        return {"message": "Migrazione completata"}
    except Exception as e:
        db.rollback()
        return {"message": f"Errore: {str(e)}"}

@app.post("/admin/atleta-visibilita/{atleta_id}")
def cambia_visibilita(atleta_id: int, visibile: int, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    atleta = db.query(Athlete).filter(Athlete.id == atleta_id).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta non trovato")
    atleta.visibile = visibile
    db.commit()
    return {"message": f"{atleta.name} {'visibile' if visibile else 'nascosto'}"}

@app.post("/admin/nascondi-tutti")
def nascondi_tutti(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    db.query(Athlete).update({"visibile": 0})
    db.commit()
    return {"message": "Tutti gli atleti nascosti"}

@app.post("/admin/mostra-tutti")
def mostra_tutti(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    db.query(Athlete).update({"visibile": 1})
    db.commit()
    return {"message": "Tutti gli atleti visibili"}

@app.get("/admin/atleti-tutti")
def atleti_tutti(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    atleti = db.query(Athlete).all()
    return atleti
    

@app.post("/admin/reset-totale")
def reset_totale(db=Depends(get_db)):
    try:
        db.execute(text("DELETE FROM squadra_atleti"))
        db.execute(text("DELETE FROM punti_evento"))
        db.execute(text("DELETE FROM athletes"))
        db.commit()
        return {"message": "Reset totale completato"}
    except Exception as e:
        db.rollback()
        return {"message": f"Errore: {str(e)}"}

@app.post("/squadra/rinomina")
def rinomina_squadra(nome: str, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    if not squadra:
        raise HTTPException(status_code=404, detail="Nessuna squadra trovata")
    squadra.nome = nome
    db.commit()
    return {"message": f"Squadra rinominata in '{nome}'"}


@app.post("/admin/aggiungi-budget")
def aggiungi_budget(importo: int, db=Depends(get_db)):
    db.query(User).update({"budget": User.budget + importo})
    db.commit()
    return {"message": f"+{importo} crediti aggiunti a tutti"}


@app.get("/admin/statistiche")
def statistiche(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    
    utenti = db.query(User).all()
    totale_utenti = len(utenti)
    utenti_con_squadra = db.query(Squadra).count()
    squadre_complete = 0
    
    lista_utenti = []
    for u in utenti:
        squadra = db.query(Squadra).filter(Squadra.user_id == u.id).first()
        n_atleti = len(squadra.atleti) if squadra else 0
        if n_atleti == 16:
            squadre_complete += 1
        lista_utenti.append({
            "username": u.username,
            "ha_squadra": squadra is not None,
            "nome_squadra": squadra.nome if squadra else None,
            "n_atleti": n_atleti,
            "completa": n_atleti == 16
        })
    
    return {
        "utenti_registrati": totale_utenti,
        "utenti_con_squadra": utenti_con_squadra,
        "squadre_complete": squadre_complete,
        "utenti_senza_squadra": totale_utenti - utenti_con_squadra,
        "lista": lista_utenti
    }

@app.delete("/admin/elimina-utente/{username}")
def elimina_utente(username: str, db=Depends(get_db)):
    utente = db.query(User).filter(User.username == username).first()
    if not utente:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    if squadra:
        db.execute(text(f"DELETE FROM squadra_atleti WHERE squadra_id = {squadra.id}"))
        db.delete(squadra)
    db.delete(utente)
    db.commit()
    return {"message": f"Utente '{username}' eliminato"}

@app.get("/league/tutte")
def tutte_le_leghe(db=Depends(get_db)):
    leghe = db.query(League).all()
    return [{"id": l.id, "nome": l.nome, "membri": len(db.query(User).filter(User.league_id == l.id).all())} for l in leghe]


@app.delete("/admin/elimina-atleta/{atleta_id}")
def elimina_atleta(atleta_id: int, db=Depends(get_db)):
    db.execute(text(f"DELETE FROM squadra_atleti WHERE atleta_id = {atleta_id}"))
    db.execute(text(f"DELETE FROM punti_evento WHERE atleta_id = {atleta_id}"))
    db.commit()
    atleta = db.query(Athlete).filter(Athlete.id == atleta_id).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta non trovato")
    db.delete(atleta)
    db.commit()
    return {"message": f"{atleta.name} eliminato"}

@app.get("/atleti/piu-acquistati")
def atleti_piu_acquistati(db=Depends(get_db)):
    from sqlalchemy import text
    risultati = db.execute(text("""
        SELECT a.id, a.name, a.categoria, a.prezzo, COUNT(sa.atleta_id) as count
        FROM athletes a
        LEFT JOIN squadra_atleti sa ON a.id = sa.atleta_id
        WHERE a.visibile = 1
        GROUP BY a.id, a.name, a.categoria, a.prezzo
        ORDER BY count DESC
        LIMIT 10
    """)).fetchall()
    return [{"id": r[0], "name": r[1], "categoria": r[2], "prezzo": r[3], "in_squadre": r[4]} for r in risultati]

@app.post("/league/messaggio")
def invia_messaggio(testo: str, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.league_id:
        raise HTTPException(status_code=404, detail="Non sei in nessuna lega")
    if len(testo.strip()) == 0:
        raise HTTPException(status_code=400, detail="Messaggio vuoto")
    if len(testo) > 300:
        raise HTTPException(status_code=400, detail="Messaggio troppo lungo (max 300 caratteri)")
    msg = Messaggio(testo=testo, user_id=utente.id, league_id=utente.league_id)
    db.add(msg)
    db.commit()
    return {"message": "Messaggio inviato"}

@app.get("/league/messaggi")
def get_messaggi(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.league_id:
        raise HTTPException(status_code=404, detail="Non sei in nessuna lega")
    messaggi = db.query(Messaggio).filter(Messaggio.league_id == utente.league_id).order_by(Messaggio.id.desc()).limit(50).all()
    return [{"id": m.id, "testo": m.testo, "username": db.query(User).filter(User.id == m.user_id).first().username} for m in reversed(messaggi)]

@app.post("/admin/fix-utente-vuoto")
def fix_utente_vuoto(db=Depends(get_db)):
    utente = db.query(User).filter(User.username == "").first()
    if not utente:
        utente = db.query(User).filter(User.username == None).first()
    if not utente:
        return {"message": "Nessun utente vuoto trovato"}
    squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    if squadra:
        db.execute(text(f"DELETE FROM squadra_atleti WHERE squadra_id = {squadra.id}"))
        db.delete(squadra)
    db.delete(utente)
    db.commit()
    return {"message": "Utente vuoto eliminato"}

@app.post("/admin/aggiungi-atleta-manuale")
def aggiungi_atleta_manuale(name: str, categoria: str, prezzo: int, db=Depends(get_db)):
    nuovo = Athlete(name=name, categoria=categoria, punti=0, prezzo=prezzo, gare=0, malus=0, visibile=1)
    db.add(nuovo)
    db.commit()
    return {"message": f"{name} aggiunto!"}

@app.post("/admin/fix-budget")
def fix_budget(db=Depends(get_db)):
    utenti = db.query(User).all()
    aggiornati = 0
    for utente in utenti:
        squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
        speso = sum(a.prezzo for a in squadra.atleti) if squadra else 0
        totale = utente.budget + speso
        if totale < 200:
            utente.budget += 200 - totale
            aggiornati += 1
    db.commit()
    return {"message": f"Budget corretto per {aggiornati} utenti"}

@app.get("/league/squadre")
def squadre_lega(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.league_id:
        raise HTTPException(status_code=404, detail="Non sei in nessuna lega")
    imp = db.query(Impostazioni).first()
    if imp and imp.mercato_aperto:
        raise HTTPException(status_code=403, detail="Il mercato è ancora aperto")
    membri = db.query(User).filter(User.league_id == utente.league_id).all()
    risultato = []
    for m in membri:
        squadra = db.query(Squadra).filter(Squadra.user_id == m.id).first()
        if squadra and len(squadra.atleti) == 16:
            risultato.append({
                "username": m.username,
                "squadra": squadra.nome,
                "atleti": [{"name": a.name, "categoria": a.categoria, "prezzo": a.prezzo} for a in squadra.atleti]
            })
    return risultato

@app.post("/admin/reset-password-temp")
def reset_password_temp(db=Depends(get_db)):
    utente = db.query(User).filter(User.username == "Asja").first()
    if not utente:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    utente.password = pwd_context.hash("fantaroller2026")
    db.commit()
    return {"message": "Password resettata a: fantaroller2026"}

@app.get("/league/atleti-squadra")
def atleti_squadra(username: str, evento: str = None, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    utente_target = db.query(User).filter(User.username == username).first()
    if not utente_target:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    squadra = db.query(Squadra).filter(Squadra.user_id == utente_target.id).first()
    if not squadra:
        raise HTTPException(status_code=404, detail="Squadra non trovata")
    risultato = []
    for a in squadra.atleti:
        if evento:
            pe = db.query(PuntiEvento).filter(
                PuntiEvento.atleta_id == a.id,
                PuntiEvento.evento == evento
            ).first()
            punti = pe.punti if pe else 0
        else:
            punti = a.punti
        risultato.append({
            "id": a.id,
            "name": a.name,
            "categoria": a.categoria,
            "punti": punti
        })
    risultato.sort(key=lambda x: x["punti"], reverse=True)
    return risultato

@app.get("/admin/debug-squadre")
def debug_squadre(db=Depends(get_db)):
    from sqlalchemy import text
    totale_squadre = db.execute(text("SELECT COUNT(*) FROM squadre")).scalar()
    atleti_per_squadra = db.execute(text("""
        SELECT squadra_id, COUNT(*) as n
        FROM squadra_atleti
        GROUP BY squadra_id
    """)).fetchall()
    complete = sum(1 for r in atleti_per_squadra if r[1] == 16)
    return {
        "totale_squadre": totale_squadre,
        "squadre_complete": complete,
        "distribuzione": sorted(set(r[1] for r in atleti_per_squadra))
    }

@app.post("/admin/fix-squadre-eccesso")
def fix_squadre_eccesso(db=Depends(get_db)):
    from sqlalchemy import text
    squadre = db.execute(text("""
        SELECT squadra_id, COUNT(*) as n
        FROM squadra_atleti
        GROUP BY squadra_id
        HAVING COUNT(*) > 16
    """)).fetchall()
    sistemate = 0
    for s in squadre:
        squadra_id = s[0]
        atleti = db.execute(text(f"SELECT atleta_id FROM squadra_atleti WHERE squadra_id = {squadra_id}")).fetchall()
        eccesso = len(atleti) - 16
        # Rimuovi gli ultimi atleti in eccesso
        for i in range(eccesso):
            atleta_id = atleti[-(i+1)][0]
            db.execute(text(f"DELETE FROM squadra_atleti WHERE squadra_id = {squadra_id} AND atleta_id = {atleta_id}"))
        sistemate += 1
    db.commit()
    return {"message": f"{sistemate} squadre sistemate"}



@app.get("/admin/debug-utente/{username}")
def debug_utente(username: str, db=Depends(get_db)):
    utente = db.query(User).filter(User.username == username).first()
    if not utente:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    if not squadra:
        raise HTTPException(status_code=404, detail="Squadra non trovata")
    righe = db.execute(text(f"SELECT atleta_id, COUNT(*) as n FROM squadra_atleti WHERE squadra_id = {squadra.id} GROUP BY atleta_id HAVING COUNT(*) > 1")).fetchall()
    tutti = db.execute(text(f"SELECT atleta_id FROM squadra_atleti WHERE squadra_id = {squadra.id}")).fetchall()
    return {
        "squadra_id": squadra.id,
        "totale_righe": len(tutti),
        "duplicati": [{"atleta_id": r[0], "count": r[1]} for r in righe]
    }

@app.post("/admin/fix-duplicato")
def fix_duplicato(squadra_id: int, atleta_id: int, db=Depends(get_db)):
    db.execute(text(f"DELETE FROM squadra_atleti WHERE squadra_id = {squadra_id} AND atleta_id = {atleta_id} AND ctid = (SELECT ctid FROM squadra_atleti WHERE squadra_id = {squadra_id} AND atleta_id = {atleta_id} LIMIT 1)"))
    db.commit()
    return {"message": "Duplicato eliminato"}

@app.get("/admin/debug-tutte-squadre")
def debug_tutte_squadre(db=Depends(get_db)):
    righe = db.execute(text("""
        SELECT s.id, u.username, s.nome, COUNT(sa.atleta_id) as n_righe
        FROM squadre s
        JOIN users u ON u.id = s.user_id
        JOIN squadra_atleti sa ON sa.squadra_id = s.id
        GROUP BY s.id, u.username, s.nome
        HAVING COUNT(sa.atleta_id) > 16
        ORDER BY n_righe DESC
    """)).fetchall()
    return [{"squadra_id": r[0], "username": r[1], "squadra": r[2], "n_righe": r[3]} for r in righe]

@app.post("/admin/fix-tutti-duplicati")
def fix_tutti_duplicati(db=Depends(get_db)):
    squadre = db.execute(text("""
        SELECT squadra_id, COUNT(*) as n
        FROM squadra_atleti
        GROUP BY squadra_id
        HAVING COUNT(*) > 16
    """)).fetchall()
    
    sistemate = 0
    for s in squadre:
        squadra_id = s[0]
        # Trova atleti duplicati
        duplicati = db.execute(text(f"""
            SELECT atleta_id, COUNT(*) as n
            FROM squadra_atleti
            WHERE squadra_id = {squadra_id}
            GROUP BY atleta_id
            HAVING COUNT(*) > 1
        """)).fetchall()
        
        for d in duplicati:
            atleta_id = d[0]
            # Elimina una riga duplicata tenendo la prima
            db.execute(text(f"""
                DELETE FROM squadra_atleti
                WHERE ctid IN (
                    SELECT ctid FROM squadra_atleti
                    WHERE squadra_id = {squadra_id} AND atleta_id = {atleta_id}
                    OFFSET 1
                )
            """))
        sistemate += 1
    
    db.commit()
    return {"message": f"{sistemate} squadre sistemate"}

@app.post("/admin/migrazione-prezzo-precedente")
def migrazione_prezzo_precedente(db=Depends(get_db)):
    try:
        db.execute(text("ALTER TABLE athletes ADD COLUMN prezzo_precedente INTEGER DEFAULT 0"))
        db.commit()
    except:
        pass
    db.execute(text("UPDATE athletes SET prezzo_precedente = prezzo WHERE prezzo_precedente = 0"))
    db.commit()
    return {"message": "Migrazione completata"}

@app.post("/admin/ripristina-prezzi")
def ripristina_prezzi(db=Depends(get_db)):
    atleti = db.query(Athlete).filter(
        Athlete.categoria.in_(["Ragazzi Maschi", "Ragazze Femminile"]),
        Athlete.prezzo_precedente > 0
    ).all()
    ripristinati = 0
    for atleta in atleti:
        atleta.prezzo = atleta.prezzo_precedente
        atleta.prezzo_precedente = 0
        ripristinati += 1
    db.commit()
    return {"message": f"Prezzi ripristinati per {ripristinati} atleti"}

@app.get("/atleti/plusvalenze")
def atleti_plusvalenze(db=Depends(get_db)):
    atleti = db.query(Athlete).filter(
        Athlete.categoria.in_(["Ragazzi Maschi", "Ragazze Femminile"]),
        Athlete.prezzo_precedente > 0,
        Athlete.visibile == 1
    ).all()
    risultati = []
    for a in atleti:
        diff = a.prezzo - a.prezzo_precedente
        if diff > 0:
            risultati.append({
                "id": a.id,
                "name": a.name,
                "categoria": a.categoria,
                "prezzo_precedente": a.prezzo_precedente,
                "prezzo": a.prezzo,
                "diff": diff
            })
    risultati.sort(key=lambda x: x["diff"], reverse=True)
    return risultati[:5]

@app.post("/admin/aggiorna-prezzo-atleta")
def aggiorna_prezzo_atleta(req: AggiornaPrezzoRequest, db=Depends(get_db)):
    atleta = db.query(Athlete).filter(Athlete.id == req.atleta_id).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta non trovato")
    atleta.prezzo_precedente = atleta.prezzo
    atleta.prezzo = req.nuovo_prezzo
    db.commit()
    return {"message": f"{atleta.name}: {atleta.prezzo_precedente}cr → {req.nuovo_prezzo}cr"}

@app.get("/admin/media-campionato")
def media_campionato(db=Depends(get_db)):
    utenti = db.query(User).all()
    punti_totali = []
    crediti_ragazzi = []

    for utente in utenti:
        squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
        if not squadra or len(squadra.atleti) < 16:
            continue

        # Media punti squadra
        punti = sum(
            (db.query(PuntiEvento).filter(
                PuntiEvento.atleta_id == a.id,
                PuntiEvento.evento == "Campionati Italiani Pista 2026"
            ).first() or type('', (), {'punti': 0})()).punti
            for a in squadra.atleti
        )
        punti_totali.append(punti)

        # Crediti spesi su Ragazzi/Ragazze
        speso_ragazzi = sum(
            a.prezzo for a in squadra.atleti
            if a.categoria in ["Ragazzi Maschi", "Ragazze Femminile"]
        )
        crediti_ragazzi.append(speso_ragazzi)

    if not punti_totali:
        return {"media_punti": 0, "media_crediti_ragazzi": 0, "squadre_complete": 0}

    return {
        "media_punti": round(sum(punti_totali) / len(punti_totali)),
        "media_crediti_ragazzi": round(sum(crediti_ragazzi) / len(crediti_ragazzi)),
        "squadre_complete": len(punti_totali)
    }

@app.post("/admin/migrazione-squadre-new")
def migrazione_squadre_new(db=Depends(get_db)):
    try:
        db.execute(text("ALTER TABLE squadre ADD COLUMN punti_bonus INTEGER DEFAULT 0"))
        db.commit()
    except:
        pass
    try:
        db.execute(text("ALTER TABLE squadre ADD COLUMN is_new INTEGER DEFAULT 0"))
        db.commit()
    except:
        pass
    return {"message": "Migrazione completata"}

@app.post("/admin/assegna-bonus-new")
def assegna_bonus_new(username: str, db=Depends(get_db)):
    utente = db.query(User).filter(User.username == username).first()
    if not utente:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    
    # Calcola budget: 200 - media crediti ragazzi - crediti già spesi
    media_crediti_ragazzi = 50  # dal nostro calcolo precedente
    crediti_gia_spesi = sum(
        a.prezzo for a in squadra.atleti
    ) if squadra else 0
    nuovo_budget = 200 - media_crediti_ragazzi - crediti_gia_spesi
    nuovo_budget = max(0, nuovo_budget)

    # Assegna punti bonus e segna come new
    if not squadra:
        squadra = Squadra(user_id=utente.id, nome="Squadra", punti_bonus=358, is_new=1)
        db.add(squadra)
    else:
        squadra.punti_bonus = 358
        squadra.is_new = 1

    utente.budget = nuovo_budget
    db.commit()
    return {
        "message": f"Bonus assegnato a {username}",
        "punti_bonus": 358,
        "budget_assegnato": nuovo_budget,
        "crediti_gia_spesi": crediti_gia_spesi
    }

@app.get("/squadre/pubbliche")
def squadre_pubbliche(db=Depends(get_db)):
    imp = db.query(Impostazioni).first()
    if imp and imp.mercato_aperto:
        raise HTTPException(status_code=403, detail="Il mercato è ancora aperto")
    utenti = db.query(User).all()
    risultato = []
    for u in utenti:
        squadra = db.query(Squadra).filter(Squadra.user_id == u.id).first()
        if squadra and len(squadra.atleti) == 16:
            risultato.append({
                "username": u.username,
                "squadra": squadra.nome,
                "atleti": [{"name": a.name, "categoria": a.categoria, "prezzo": a.prezzo} for a in squadra.atleti]
            })
    return risultato