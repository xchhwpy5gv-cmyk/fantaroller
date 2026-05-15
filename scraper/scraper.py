import requests
from bs4 import BeautifulSoup
import json

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

def parse_gara(url, moltiplicatore, categoria):
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


            if posizione and posizione.isdigit():
                punti = round(
                    punti_base(posizione) * moltiplicatore
                )
                risultati.append({
                    "nome": nome,
                    "punti": punti,
                    "categoria": categoria
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
gare = [
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUM_13.htm",
        "moltiplicatore": 1.5,
        "categoria": "Junior Maschi"
    },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUM_14.htm",
        "moltiplicatore": 1.2,
        "categoria": "Junior Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUM_12.htm",
        "moltiplicatore": 1.2,
        "categoria": "Junior Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEM_5.htm",
        "moltiplicatore": 1.2,
        "categoria": "Senior Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEM_6.htm",
        "moltiplicatore": 1.5,
        "categoria": "Senior Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEM_7.htm",
        "moltiplicatore": 1.2,
        "categoria": "Senior Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALM_19.htm",
        "moltiplicatore": 1.2,
        "categoria": "Allievi Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALM_20.htm",
        "moltiplicatore": 1.2,
        "categoria": "Allievi Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALM_21.htm",
        "moltiplicatore": 1.5,
        "categoria": "Allievi Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEF_1.htm",
        "moltiplicatore": 1.2,
        "categoria": "Senior Femminile"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEF_3.htm",
        "moltiplicatore": 1.2,
        "categoria": "Senior Femminile"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/SEF_2.htm",
        "moltiplicatore": 1.5,
        "categoria": "Senior Femminile"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUF_9.htm",
        "moltiplicatore": 1.2,
        "categoria": "Junior Femminile"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUF_10.htm",
        "moltiplicatore": 1.5,
        "categoria": "Junior Femminile"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/JUF_11.htm",
        "moltiplicatore": 1.2,
        "categoria": "Junior Femminile"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALF_15.htm",
        "moltiplicatore": 1.2,
        "categoria": "Allieve Femminile"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALF_16.htm",
        "moltiplicatore": 1.2,
        "categoria": "Allieve Femminile"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/362435/RW00120.1/ALF_17.htm",
        "moltiplicatore": 1.5,
        "categoria": "Allieve Femminile"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/197997/RW00088.1/RAM_5.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazzi Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/197997/RW00088.1/RAM_7.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazzi Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/197997/RW00088.1/RAM_6.htm",
        "moltiplicatore": 1.5,
        "categoria": "Ragazzi Maschi"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/197997/RW00088.1/RAF_1.htm",
        "moltiplicatore": 1.2,
        "categoria": "Ragazze Femminile"
        },
    {
        "url": "https://attivita.rollergames.it/corsa/rrunn/2026/197997/RW00088.1/RAF_3.htm",
        "moltiplicatore": 1.5,
        "categoria": "Ragazze Femminile"
        }
]


tutti_risultati = []

for gara in gare:
    risultati = parse_gara(
        gara["url"],
        gara["moltiplicatore"],
        gara["categoria"]
    )
    tutti_risultati.extend(risultati)

classifica = {}

for r in tutti_risultati:
    nome = r["nome"] + " \u2013 " + r["categoria"]
    punti = r["punti"]

    if nome not in classifica:
        classifica[nome] = {"punti": 0, "gare": 0}
    
    classifica[nome]["punti"] += punti
    classifica[nome]["gare"] += 1
    if "malus" not in classifica[nome]:
        classifica[nome]["malus"] = 0

max_punti = max(atleta["punti"] for atleta in classifica.values())
prezzi = {}

for nome, dati in classifica.items():
    punti = dati["punti"]
    gare = dati["gare"]
    media = punti / gare
    prezzo = round((media / 100) * 20 + gare * 2) + bonus_ranking(nome)
    if prezzo > 30:
        prezzo = 30
    if prezzo < 1:
        prezzo = 1
    prezzi[nome] = prezzo

classifica_ordinata = sorted(
    classifica.items(),
    key=lambda x: x[1]["punti"],
    reverse=True
)

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
