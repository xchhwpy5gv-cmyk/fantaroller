import requests
from bs4 import BeautifulSoup
import json

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
    prezzo = round((media / 100) * 20 + gare * 2)
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
