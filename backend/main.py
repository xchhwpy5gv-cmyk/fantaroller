import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from database import engine, SessionLocal
from models import Base, User, Athlete, Squadra, Impostazioni
from schemas import UserCreate, UserLogin, Token
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

SECRET_KEY = "fantaroller2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

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
    esistente = db.query(User).filter(User.username == user.username).first()
    if esistente:
        raise HTTPException(status_code=400, detail="Username già esistente")
    hashed = pwd_context.hash(user.password)
    nuovo = User(username=user.username, password=hashed)
    db.add(nuovo)
    db.commit()
    return {"message": "Utente creato"}

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
        for atleta in data:
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
            nuovo_atleta = Athlete(
                name=nome,
                categoria=categoria,
                punti=atleta["punti"],
                prezzo=atleta["prezzo"],
                gare=atleta["gare"],
                malus=atleta.get("malus", 0)
            )
            db.add(nuovo_atleta)
        db.commit()
        return {"message": f"Atleti importati: {len(data)}"}
    except Exception as e:
        db.rollback()
        return {"message": f"Errore: {str(e)}"}

@app.delete("/reset-athletes")
def reset_athletes(db=Depends(get_db)):
    db.query(Athlete).delete()
    db.commit()
    return {"message": "Atleti cancellati"}

@app.get("/athletes/")
def lista_atleti(db=Depends(get_db)):
    atleti = db.query(Athlete).all()
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
    imp = db.query(Impostazioni).filter(Impostazioni.id == 1).first()
    if not imp.mercato_aperto:
        raise HTTPException(status_code=400, detail="Il mercato è chiuso!")

    if not squadra:
        raise HTTPException(status_code=400, detail="Crea prima una squadra")
    atleta = db.query(Athlete).filter(Athlete.id == atleta_id).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta non trovato")
    if atleta in squadra.atleti:
        raise HTTPException(status_code=400, detail="Atleta già in squadra")
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
        "atleti": [{"id": a.id, "name": a.name, "categoria": a.categoria, "prezzo": a.prezzo} for a in squadra.atleti]
    }

@app.post("/squadra/vendi/{atleta_id}")
def vendi_atleta(atleta_id: int, utente=Depends(get_utente_corrente), db=Depends(get_db)):
    squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
    if not squadra:
        raise HTTPException(status_code=400, detail="Nessuna squadra trovata")
    atleta = db.query(Athlete).filter(Athlete.id == atleta_id).first()
    if not atleta:
        raise HTTPException(status_code=404, detail="Atleta non trovato")
    if atleta not in squadra.atleti:
        raise HTTPException(status_code=400, detail="Atleta non in squadra")
    squadra.atleti.remove(atleta)
    utente.budget += atleta.prezzo
    db.commit()
    return {"message": f"{atleta.name} venduto!", "budget_rimasto": utente.budget}

@app.get("/classifica/")
def classifica(db=Depends(get_db)):
    utenti = db.query(User).all()
    risultati = []
    for utente in utenti:
        squadra = db.query(Squadra).filter(Squadra.user_id == utente.id).first()
        if squadra:
            punti_totali = sum(a.punti for a in squadra.atleti)
            risultati.append({
                "username": utente.username,
                "squadra": squadra.nome,
                "punti": punti_totali,
                "n_atleti": len(squadra.atleti)
            })
    risultati.sort(key=lambda x: x["punti"], reverse=True)
    return risultati


@app.get("/admin/stato-mercato")
def stato_mercato(db=Depends(get_db)):
    imp = db.query(Impostazioni).filter(Impostazioni.id == 1).first()
    return {"mercato_aperto": bool(imp.mercato_aperto)}

@app.post("/admin/apri-mercato")
def apri_mercato(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    imp = db.query(Impostazioni).filter(Impostazioni.id == 1).first()
    imp.mercato_aperto = 1
    db.commit()
    return {"message": "Mercato aperto!"}

@app.post("/admin/chiudi-mercato")
def chiudi_mercato(utente=Depends(get_utente_corrente), db=Depends(get_db)):
    if not utente.is_admin:
        raise HTTPException(status_code=403, detail="Non sei admin")
    imp = db.query(Impostazioni).filter(Impostazioni.id == 1).first()
    imp.mercato_aperto = 0
    db.commit()
    return {"message": "Mercato chiuso!"}
