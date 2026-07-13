import requests
from bs4 import BeautifulSoup
import json

def get_atleti_da_index(url_index):
    """Legge tutti gli atleti da un index di gare, restituisce {nome: categoria}"""
    import re
    response = requests.get(url_index)
    soup = BeautifulSoup(response.text, "html.parser")
    base_url = url_index.rsplit("/", 1)[0]
    links = soup.find_all("a", href=True)
    
    atleti = {}
    
    for link in links:
        href = link["href"]
        if not href.endswith(".htm") or href == "index.htm":
            continue
            
        # Determina categoria
        categoria = None
        if "JUM" in href: categoria = "Junior Maschi"
        elif "JUF" in href: categoria = "Junior Femminile"
        elif "SEM" in href: categoria = "Senior Maschi"
        elif "SEF" in href: categoria = "Senior Femminile"
        elif "ALM" in href: categoria = "Allievi Maschi"
        elif "ALF" in href: categoria = "Allieve Femminile"
        elif "RAM" in href: categoria = "Ragazzi Maschi"
        elif "RAF" in href: categoria = "Ragazze Femminile"
        
        if not categoria:
            continue
            
        try:
            url_gara = f"{base_url}/{href}"
            res = requests.get(url_gara)
            s = BeautifulSoup(res.text, "html.parser")
            
            # Controlla se è staffetta
            titolo = s.get_text()
            if "Staffetta" in titolo or "staffetta" in titolo:
                continue
                
            rows = s.find_all("tr")
            for row in rows:
                cols = row.find_all("td")
                if len(cols) > 3:
                    posizione = cols[0].text.strip()
                    nome = cols[2].text.strip().replace("?", "'").upper()
                    if posizione and posizione.isdigit():
                        atleti[nome] = categoria
        except:
            pass
    
    return atleti

def get_gare_da_index(url_index, categorie_incluse, promuovi=False, anno=2024):
    """Legge tutte le gare da un index, filtra per categorie"""
    response = requests.get(url_index)
    soup = BeautifulSoup(response.text, "html.parser")
    base_url = url_index.rsplit("/", 1)[0]
    links = soup.find_all("a", href=True)
    
    gare_trovate = []
    
    for link in links:
        href = link["href"]
        if not href.endswith(".htm") or href == "index.htm":
            continue
        
        categoria = None
        if "JUM" in href: categoria = "Junior Maschi"
        elif "JUF" in href: categoria = "Junior Femminile"
        elif "SEM" in href: categoria = "Senior Maschi"
        elif "SEF" in href: categoria = "Senior Femminile"
        elif "ALM" in href: categoria = "Allievi Maschi"
        elif "ALF" in href: categoria = "Allieve Femminile"
        elif "RAM" in href: categoria = "Ragazzi Maschi"
        elif "RAF" in href: categoria = "Ragazze Femminile"
        
        if categoria and categoria in categorie_incluse:
            # Estrai numero dalla gara
            import re
            numeri = re.findall(r'_(\d+)\.htm', href)
            if numeri:
                num = int(numeri[0])
                cat_ragazzi = ["Ragazzi Maschi", "Ragazze Femminile"]
                escludi_ragazzi = [4, 8]
                escludi_altri = [4, 8, 18, 22]
                
                if categoria in cat_ragazzi and num in escludi_ragazzi:
                    continue
                if categoria not in cat_ragazzi and num in escludi_altri:
                    continue
            try:
                url_gara = f"{base_url}/{href}"
                res = requests.get(url_gara)
                titolo = BeautifulSoup(res.text, "html.parser").get_text()
                if "Staffetta" in titolo or "staffetta" in titolo:
                    continue
                cat_finale = promozioni_categoria.get(categoria, categoria) if promuovi else categoria
                gare_trovate.append({
                    "url": url_gara,
                    "moltiplicatore": 1.2,
                    "categoria": cat_finale,
                    "anno": anno
                })
                print(f"  Aggiunta: {cat_finale} - {href}")
            except:
                pass
    
    return gare_trovate


promozioni_categoria = {
    "Ragazzi Maschi": "Allievi Maschi",
    "Ragazze Femminile": "Allieve Femminile", 
    "Allievi Maschi": "Junior Maschi",
    "Allieve Femminile": "Junior Femminile",
    "Junior Maschi": "Senior Maschi",
    "Junior Femminile": "Senior Femminile",
}

ranking_nazionale = {
    # RAGAZZI FEMMINE
    "NOLLI BIANCA": 1,
    "SANTACROCE ARIANNA": 2,
    "BIFFI SVEVA": 3,
    "PRINCIGALLI VALERIA NUNZIA": 4,
    "DI SCIUVA ELISABETTA": 5,
    "LATINO GIULIA": 6,
    "BARICCI CHIARA": 7,
    "ILLUMINATI CHIARA": 7,
    "IDDA AURORA ANGELICA": 8,
    "PILLI CRISTINA": 9,
    "CAPOVILLA MATILDE": 10,
    "MEO AURORA": 11,
    "GRANDI ANITA": 12,
    "TATTI CHIARA": 12,
    "ALLEGRI ALLEGRA": 13,
    "ANZELLOTTI SOFIA": 13,
    "PINNA SARA GIOVANNA": 13,
    "EBAI SOVIRA VIANA AWAYOR": 14,
    "TORQUATI GIULIA": 14,
    # RAGAZZI MASCHI
    "MURRU GIOELE": 1,
    "CHIUMIENTO ROMEO": 2,
    "GRITTI MARCO": 3,
    "CARNIELETTO NICOLO'": 4,
    "CAMPAGNA SIMONE": 5,
    "MAZZI PAUL MARIE": 6,
    "TONON JACOPO": 7,
    "GIOLITTO MATTEO": 8,
    "PANUNZIO GIOELE": 8,
    "BORRACELLI ALESSANDRO": 9,
    "BONACCORSO F. CRISTIAN": 10,
    "ACCIAIO NICCOLO' LAPO": 11,
    "TONON ALVISE": 12,
    "STELLA TOMMASO": 13,
    "PICCHI GIOVANNI": 14,
    "CASTELLAZZI FILIPPO": 15,
    "FARINACCI ALESSANDRO": 15,
    "GORIN ALBERTO": 15,
    # ALLIEVI FEMMINE
    "ANDREETTA VITTORIA": 1,
    "PERALTA CARRILLO L. FERNANDA": 2,
    "CHINELLATO MELISSA": 3,
    "GUERCIO SOFIA": 4,
    "BARICCI GIULIA": 5,
    "RAMINZONI ELISA": 6,
    "ZORZI ALICE": 7,
    "DOLCI RACHELE YARA": 8,
    "CATTANEO CAMILLA": 9,
    "NOLLI MARIASOLE": 9,
    "CHINELLATO MATILDE": 10,
    "DI FILIPPO GINEVRA": 11,
    "MASSA ELIZBET": 11,
    "BARBAGALLO FRIDA": 12,
    "ANGELUCCI EVA": 13,
    "PAPIRIO REBECCA": 13,
    "BRUZZESE CHIARA": 14,
    "MARENAJ ANAISSA": 15,
    "MANTOVANELLI ILARIA": 16,
    "PIRILLO MARZIA": 17,
    "CALDARELLI GIADA": 3,
    "CANI EMILI": 5,
    "PROIETTI BENEDETTA": 6,
    "VALLIN ANNA": 7,
    "BECK ALICE": 9,
    "PASQUINI VIOLA": 10,
    "PEREGO AURORA": 11,
    "TRAMONTANI ALICE": 12,
    # ALLIEVI MASCHI
    "PACIONI SANTE": 1,
    "RODI ALBERTO": 2,
    "NICOLETTI CARLO": 3,
    "BORSANI PIETRO": 4,
    "VINCI GABRIELE": 5,
    "FIORINI GABRIELE": 6,
    "ROSSI DARIO": 7,
    "CANGIANO DIEGO": 8,
    "BASSETTI GIACOMO": 9,
    "GIACOMETTI GIONA": 9,
    "PENNAVARIA DANIELE": 10,
    "TRIGILA ALESSANDRO": 11,
    "BRAGIOTO ALBERTO": 12,
    "MORNAGHI CHRISTIAN": 12,
    "PITTATORE MATTIA": 12,
    "CALZAVARA L. SAMUEL": 13,
    "MEZZADRI ANDREA": 14,
    "USAI GABRIELE": 15,
    "IULIANI ANDREA": 4,
    "RIZZA PAOLO RICARDHO": 6,
    "SIRINGO GIOELE": 7,
    "ROSSINI CRISTIANO": 9,
    "DI BELLO COSIMO": 10,
    "PECORARO LORIS": 12,
    "BRAVI FEDERICO": 13,
    # JUNIOR FEMMINE
    "CHIUMIENTO SOFIA PAOLA": 1,
    "DEIMANI LUDOVICA CLELIA": 2,
    "SCOTTO SARA": 3,
    "ORLANDI VALENTINA": 4,
    "MATTII GIULIA": 5,
    "VISINI CATIA SILVIA": 6,
    "CRIVELLARI MATILDE": 7,
    "DI PASQUALE CHIARA": 8,
    "MARELLI GIULIA": 9,
    "FALCIONI VIOLA": 10,
    "DENGO KRISTAL": 11,
    "PITTATORE ALESSIA": 12,
    "PASSERO SARA": 13,
    "GRANATO ELISA": 14,
    "BAILO ASIA": 15,
    "DOMINONI AGNESE": 1,
    "FOSSEMO' SALVEMME GIORGIA": 3,
    "GRANNO' VALENTINA": 7,
    "BALLONE CARLOTTA": 8,
    "MARCHIOTTO VITTORIA": 9,
    "FIORATO AGNESE": 10,
    # JUNIOR MASCHI
    "ONESTI FRANCESCO": 1,
    "GEROSA RICCARDO": 2,
    "MAGGIONI LORENZO": 3,
    "RAVELLI FILIPPO": 4,
    "OSENDA NICCOLO'": 5,
    "LICHERI GIORDANO": 6,
    "LEVORATO JURI": 7,
    "FRIGE' LORENZO": 8,
    "ARENA GIOELE": 9,
    "MAGGIOLO TOMMASO": 9,
    "PAPPALARDO MATTIA": 10,
    "TURANO FLAVIO": 11,
    "MORI ALESSANDRO": 12,
    "SITNIC CRISTIANO": 13,
    "INCANDELA NICOLAS": 14,
    "BEDIN JACOPO": 15,
    "COLLE EDOARDO": 15,
    "GHISIO ERBA GIORGIO": 1,
    "PONZIANI MATTEO": 2,
    "GIANNETTONI PIETRO": 3,
    "TAGLIABUE CARLO": 6,
    "MARZUCCHI TOMMASO": 7,
    "GIOLO ANDREA": 8,
    "FIORINI GIOVANNI": 9,
    "RICCA MATTIA": 10,
    "SIVIGLIA FILIPPO": 12,
    "PICCOLI SIMONE": 13,
    "LOMAGISTRO RICCARDO": 15,
    "ROSSETTO FEDERICO": 15,
    "NISI ELIA": 17,
    "ROCCHETTI MICHELE": 19,
}

def bonus_ranking(nome):
    pos = ranking_nazionale.get(nome.upper())
    if pos is None:
        return 0
    if pos <= 3:
        return 5
    elif pos <= 7:
        return 3
    elif pos <= 15:
        return 2
    else:
        return 1


url = "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEM_7.htm"

moltiplicatore = 1.2

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

def parse_gara(url, moltiplicatore, categoria, anno=2026):
    print(f"Leggendo: {url}")
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    soup = BeautifulSoup(response.text, "html.parser")

    rows = soup.find_all("tr")
    print(f"Righe trovate: {len(rows)}")

    risultati = []

    for row in rows:
        cols = row.find_all("td")
        if len(cols) > 3:
            posizione = cols[0].text.strip()
            nome = cols[2].text.strip()
            nome = nome.replace("?", "'")
            nome = nome.replace("FRIG' ", "FRIGO' ")
            nome = nome.replace("FRIGE'", "FRIGO'")


            if posizione and posizione.isdigit():
                punti = round(
                    punti_base(posizione) * moltiplicatore
                )
                risultati.append({
                    "nome": nome,
                    "punti": punti,
                    "categoria": categoria,
                    "anno": anno,
                    "_url": url
                })

    # Leggi sanzioni dal testo della pagina
    testo = soup.get_text()
    sanzioni = {}

    for riga in testo.split("\n"):
        riga = riga.strip()
        if riga.startswith("Ammonizione al n."):
            # Ammonizione al n. 123 NOME COGNOME
            parti = riga.replace("Ammonizione al n.", "").strip()
            nome_atleta = " ".join(parti.split()[1:])
            sanzioni[nome_atleta.upper()] = -10
        elif riga.startswith("Diffida al n."):
            parti = riga.replace("Diffida al n.", "").strip()
            nome_atleta = " ".join(parti.split()[1:])
            sanzioni[nome_atleta.upper()] = -20
        elif riga.startswith("Espulsione al n."):
            parti = riga.replace("Espulsione al n.", "").strip()
            nome_atleta = " ".join(parti.split()[1:])
            sanzioni[nome_atleta.upper()] = -50

    # Applica sanzioni ai risultati
    for r in risultati:
        nome_upper = r["nome"].upper()
        for nome_san, malus in sanzioni.items():
            if nome_san in nome_upper or nome_upper in nome_san:
                r["punti"] += malus
                print(f"SANZIONE: {r['nome']} {malus} punti")

    return risultati


    return risultati

gare_pista2026_ragazzi = [
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/630840/RW00010.1/RAM_6.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazzi Maschi",
        "anno": 2026,
        "tipo": "pista"
    },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/630840/RW00010.1/RAM_7.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazzi Maschi",
        "anno": 2026,
        "tipo": "pista"
    },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/630840/RW00010.1/RAM_8.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazzi Maschi",
        "anno": 2026,
        "tipo": "pista"
    },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/630840/RW00010.1/RAM_9.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazzi Maschi",
        "anno": 2026,
        "tipo": "pista"
    },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/630840/RW00010.1/RAF_1.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazze Femminile",
        "anno": 2026,
        "tipo": "pista"
    },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/630840/RW00010.1/RAF_2.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazze Femminile",
        "anno": 2026,
        "tipo": "pista"
    },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/630840/RW00010.1/RAF_3.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazze Femminile",
        "anno": 2026,
        "tipo": "pista"
    },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/630840/RW00010.1/RAF_4.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazze Femminile",
        "anno": 2026,
        "tipo": "pista"
    },
]

gare = [
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUM_13.htm",
        "moltiplicatore": 1.5,
        "categoria": "Junior Maschi",
        "anno": 2026
    },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUM_14.htm",
        "moltiplicatore": 1.2,
        "categoria": "Junior Maschi",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUM_12.htm",
        "moltiplicatore": 1.2,
        "categoria": "Junior Maschi",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEM_5.htm",
        "moltiplicatore": 1.2,
        "categoria": "Senior Maschi",
        "anno": 2026
        
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEM_6.htm",
        "moltiplicatore": 1.5,
        "categoria": "Senior Maschi",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEM_7.htm",
        "moltiplicatore": 1.2,
        "categoria": "Senior Maschi",
        "anno": 2026
        
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALM_19.htm",
        "moltiplicatore": 1.2,
        "categoria": "Allievi Maschi",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALM_20.htm",
        "moltiplicatore": 1.2,
        "categoria": "Allievi Maschi",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALM_21.htm",
        "moltiplicatore": 1.5,
        "categoria": "Allievi Maschi",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEF_1.htm",
        "moltiplicatore": 1.2,
        "categoria": "Senior Femminile",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEF_3.htm",
        "moltiplicatore": 1.2,
        "categoria": "Senior Femminile",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEF_2.htm",
        "moltiplicatore": 1.5,
        "categoria": "Senior Femminile",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUF_9.htm",
        "moltiplicatore": 1.2,
        "categoria": "Junior Femminile",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUF_10.htm",
        "moltiplicatore": 1.5,
        "categoria": "Junior Femminile",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUF_11.htm",
        "moltiplicatore": 1.2,
        "categoria": "Junior Femminile",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALF_15.htm",
        "moltiplicatore": 1.2,
        "categoria": "Allieve Femminile",
        "anno": 2026  
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALF_16.htm",
        "moltiplicatore": 1.2,
        "categoria": "Allieve Femminile",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALF_17.htm",
        "moltiplicatore": 1.5,
        "categoria": "Allieve Femminile",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/197997/RW00088.1/RAM_5.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazzi Maschi",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/197997/RW00088.1/RAM_7.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazzi Maschi",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/197997/RW00088.1/RAM_6.htm",
        "moltiplicatore": 1.5,
        "categoria": "Ragazzi Maschi",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/197997/RW00088.1/RAF_1.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazze Femminile",
        "anno": 2026
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/197997/RW00088.1/RAF_3.htm",
        "moltiplicatore": 1.5,
        "categoria": "Ragazze Femminile",
        "anno": 2026
        }
]

# Aggiungi gare 2024 per avere tutti gli atleti
gare += get_gare_da_index(
    "https://attivita.rollergames.it/corsa/rrunn/2024/197997/RW00045.1/index.htm",
    ["Ragazzi Maschi", "Ragazze Femminile"],
    promuovi=True,
    anno=2024
)

gare += get_gare_da_index(
    "https://attivita.rollergames.it/corsa/rrunn/2024/361245/RW00013.1/index.htm",
    ["Allievi Maschi", "Allieve Femminile", "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"],
    promuovi=True,
    anno=2024
)

print(f"Totale gare da processare: {len(gare)}")

# Categorie precedenti per chi cambia categoria
CAMBIO_CATEGORIA = {
    "Junior Maschi": "Allievi Maschi",
    "Junior Femminile": "Allieve Femminile",
    "Allievi Maschi": "Ragazzi Maschi",
    "Allieve Femminile": "Ragazze Femminile",
    "Senior Maschi": "Junior Maschi",
    "Senior Femminile": "Junior Femminile",
}

print("Caricamento atleti 2025 per confronto categorie...")
atleti_2025 = get_atleti_da_index("https://attivita.rollergames.it/corsa/rrunn/2025/197482/RW00100.1/index.htm")
print(f"Trovati {len(atleti_2025)} atleti nel 2025")

def e_primo_anno(nome, categoria_2026):
    """Ritorna True se l'atleta è al primo anno nella categoria 2026"""
    nome_upper = nome.upper()
    cat_precedente = CAMBIO_CATEGORIA.get(categoria_2026)
    if not cat_precedente:
        return False
    # Era nella categoria precedente nel 2025?
    cat_2025 = atleti_2025.get(nome_upper)
    return cat_2025 == cat_precedente

tutti_risultati = []

for gara in gare:
    risultati = parse_gara(
        gara["url"],
        gara["moltiplicatore"],
        gara["categoria"],
        gara.get("anno", 2026)
    )
    tutti_risultati.extend(risultati)

classifica_2026 = {}
classifica_2024 = {}

for r in tutti_risultati:
    nome = r["nome"] + " \u2013 " + r["categoria"]
    punti = r["punti"]
    anno = r.get("anno", 2026)
    
    classifica_target = classifica_2026 if anno == 2026 else classifica_2024
    
    if nome not in classifica_target:
        classifica_target[nome] = {"punti": 0, "gare": 0, "malus": 0}
    classifica_target[nome]["punti"] += punti
    classifica_target[nome]["gare"] += 1

# Unisci le due classifiche
classifica = {}
tutti_nomi = set(classifica_2026.keys()) | set(classifica_2024.keys())

for nome in tutti_nomi:
    dati_2026 = classifica_2026.get(nome)
    dati_2024 = classifica_2024.get(nome)
    
    if dati_2026 and dati_2024:
        media_2026 = dati_2026["punti"] / dati_2026["gare"]
        media_2024 = dati_2024["punti"] / dati_2024["gare"]
        prezzo_2026 = round((media_2026 / 100) * 20 + dati_2026["gare"] * 2)
        prezzo_2024 = round((media_2024 / 100) * 20 + dati_2024["gare"] * 2)
        prezzo_medio = round((prezzo_2026 + prezzo_2024) / 2)
        classifica[nome] = {
            "punti": dati_2026["punti"],
            "gare": dati_2026["gare"],
            "malus": 0,
            "prezzo_override": prezzo_medio
        }
    elif dati_2026:
        classifica[nome] = dati_2026
    else:
        classifica[nome] = dati_2024

max_punti = max(atleta["punti"] for atleta in classifica.values())
prezzi = {}

for nome, dati in classifica.items():
    punti = dati["punti"]
    n_gare = dati["gare"]
    media = punti / n_gare
    
    if " \u2013 " in nome:
        nome_atleta = nome.split(" \u2013 ")[0].strip()
        categoria_corrente = nome.split(" \u2013 ")[1].strip()
    else:
        nome_atleta = nome.strip()
        categoria_corrente = ""
    
    prezzo_base = round((media / 100) * 20 + n_gare * 2) + bonus_ranking(nome_atleta)

    # Se ha un prezzo override (media tra anni), usalo
    if "prezzo_override" in dati:
        prezzo_base = dati["prezzo_override"] + bonus_ranking(nome_atleta)

    APPLICA_CAMBIO_CATEGORIA = False

    if APPLICA_CAMBIO_CATEGORIA and e_primo_anno(nome_atleta, categoria_corrente):
        prezzo_base = round(prezzo_base * 0.7)
        print(f"PRIMO ANNO: {nome_atleta} prezzo ridotto a {prezzo_base}")

    prezzo = prezzo_base
    if prezzo > 30:
        prezzo = 30
    if prezzo < 1:
        prezzo = 1
    prezzi[nome] = prezzo

output = []

for nome, dati in classifica.items():
    output.append({
        "nome": nome,
        "punti": dati["punti"],
        "gare": dati["gare"],
        "prezzo": prezzi[nome],
        "malus": dati.get("malus", 0)
    })

with open("listone.json", "w") as f:
    json.dump(output, f, indent=4)

print("Listone salvato!")

# Aggiorna prezzi per TUTTE le categorie (stessa logica già usata per Ragazzi/Ragazze)
# Ottimizzato: riusa tutti_risultati già calcolato nel primo ciclo, niente doppio scraping
import requests as req

API_URL = "https://fantaroller-api.onrender.com"
CATEGORIE_AGGIORNAMENTO = [
    "Ragazzi Maschi", "Ragazze Femminile",
    "Allievi Maschi", "Allieve Femminile",
    "Junior Maschi", "Junior Femminile",
    "Senior Maschi", "Senior Femminile"
]

# Raccogli gli URL già processati per evitare di contare due volte la stessa gara
# (es. RAM/RAF compaiono sia nella lista "gare" principale sia in gare_pista2026_ragazzi)
url_gare_pista = set()
gare_pista_2026_tutte = []
for g in gare + gare_pista2026_ragazzi:
    if g.get("anno", 2026) != 2026:
        continue
    if g["url"] in url_gare_pista:
        continue
    url_gare_pista.add(g["url"])
    gare_pista_2026_tutte.append(g)

risultati_pista = {}
for gara in gare_pista_2026_tutte:
    # Riusa i risultati già calcolati in tutti_risultati per questo URL, se disponibili
    trovati = [r for r in tutti_risultati if r.get("_url") == gara["url"]]
    if not trovati:
        # Fallback: se per qualche motivo non è in tutti_risultati, scraping diretto
        trovati = parse_gara(gara["url"], gara["moltiplicatore"], gara["categoria"], gara.get("anno", 2026))
    for r in trovati:
        chiave = r["nome"].upper().strip() + "|" + gara["categoria"]
        if chiave not in risultati_pista:
            risultati_pista[chiave] = {"punti": 0, "gare": 0}
        risultati_pista[chiave]["punti"] += r["punti"]
        risultati_pista[chiave]["gare"] += 1
print(f"Atleti unici in pista: {len(risultati_pista)}")
print("Esempio chiavi:", list(risultati_pista.keys())[:10])

# Carica atleti dal DB
risposta = req.get(f"{API_URL}/athletes/")
atleti_db = risposta.json()

aggiornati = 0
for atleta in atleti_db:
    if atleta["categoria"] not in CATEGORIE_AGGIORNAMENTO:
        continue

    chiave_db = atleta["name"].upper().strip() + "|" + atleta["categoria"]
    dati_pista = risultati_pista.get(chiave_db)

    if not dati_pista:
        continue

    # Cerca prezzo indoor nel listone
    nome_chiave_output = atleta["name"] + " \u2013 " + atleta["categoria"]
    dati_output = next((o for o in output if o["nome"] == nome_chiave_output), None)

    media_pista = dati_pista["punti"] / dati_pista["gare"]
    prezzo_pista = round((media_pista / 100) * 20 + dati_pista["gare"] * 2)

    if dati_output:
        prezzo_indoor = dati_output["prezzo"]
        nuovo_prezzo = round(prezzo_pista * 0.5 + prezzo_indoor * 0.5)
    else:
        nuovo_prezzo = prezzo_pista

    nuovo_prezzo = max(1, min(30, nuovo_prezzo + bonus_ranking(atleta["name"])))
    # Nessun atleta può perdere più di 5cr
    nuovo_prezzo = max(nuovo_prezzo, atleta["prezzo"] - 5)

    if nuovo_prezzo != atleta["prezzo"]:
        req.post(f"{API_URL}/admin/aggiorna-prezzo-atleta", json={
            "atleta_id": atleta["id"],
            "nuovo_prezzo": nuovo_prezzo
        })
        aggiornati += 1
        print(f"{atleta['name']}: {atleta['prezzo']}cr → {nuovo_prezzo}cr")

print(f"\nPrezzi aggiornati: {aggiornati} atleti")
