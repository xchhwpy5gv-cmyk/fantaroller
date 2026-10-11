import requests
import json
import os
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

BASE_URL = "https://attivita.rollergames.it/corsa/"

CAMPIONATI = {
    2025: {
        "Indoor A/J/S": 3232,
        "Pista A/J/S": 3299,
        "Strada A/J/S": 3305,
        "Indoor R/R12": 3233,
        "Pista R/R12": 3302,
    },

    2026: {
        "Indoor A/J/S": 3347,
        "Pista A/J/S": 3425,
        "Strada A/J/S": 3436,
        "Indoor R/R12": 3340,
        "Pista R/R12": 3421,
        "Strada R/R12": 3428,
    }
}

FILE_OUTPUT = "atleti_storico.json"


def scarica(url):

    response = requests.get(
        url,
        headers=HEADERS,
        timeout=20
    )

    response.raise_for_status()

    return BeautifulSoup(
        response.text,
        "html.parser"
    )


# ============================================================
# 1. RACCOLTA DEGLI ATLETI
# ============================================================

atleti = {}

print()
print("=" * 80)
print("FASE 1 - RACCOLTA ATLETI")
print("=" * 80)

for anno, campionati in CAMPIONATI.items():

    for nome_campionato, id_gara in campionati.items():

        url = f"{BASE_URL}lista_gare.php?id={id_gara}"

        print(
            f"{anno} | {nome_campionato}"
        )

        try:

            soup = scarica(url)

            for link in soup.find_all("a", href=True):

                href = urljoin(url, link["href"])

                if "atleta.php?tessera=" not in href:
                    continue

                nome = " ".join(
                    link.get_text(" ", strip=True).split()
                )

                if not nome:
                    continue

                tessera = (
                    href
                    .split("tessera=")[-1]
                    .split("&")[0]
                )

                if tessera not in atleti:

                    atleti[tessera] = {
                        "tessera": tessera,
                        "nome": nome,
                        "url": href,
                        "partecipazioni": []
                    }

                partecipazione = {
                    "anno": anno,
                    "campionato": nome_campionato,
                    "id": id_gara
                }

                if partecipazione not in atleti[tessera]["partecipazioni"]:
                    atleti[tessera]["partecipazioni"].append(
                        partecipazione
                    )

        except Exception as e:

            print(
                "ERRORE:",
                e
            )


print()
print(
    f"ATLETI CANDIDATI: {len(atleti)}"
)


# ============================================================
# 2. RECUPERO STORICO RISULTATI 2021-2026
# ============================================================

FILE_BASE = "atleti_2025_2026.json"
FILE_OUTPUT = "atleti_storico.json"

# Carichiamo i dati già raccolti
if not os.path.exists(FILE_BASE):

    print()
    print("ERRORE: non trovo", FILE_BASE)
    print("Esegui prima il crawler precedente.")
    exit()

with open(
    FILE_BASE,
    "r",
    encoding="utf-8"
) as f:

    risultati_base = json.load(f)


risultati = {}

print()
print("=" * 80)
print("FASE 2 - RECUPERO STORICO 2021-2024")
print("=" * 80)

totale = len(risultati_base)

for indice, (tessera, atleta) in enumerate(
    risultati_base.items(),
    start=1
):

    print(
        f"[{indice}/{totale}] "
        f"{atleta['nome']} "
        f"({tessera})"
    )

    try:

        soup = scarica(
            atleta["url"]
        )

        righe = [
            r.strip()
            for r in soup.get_text(
                "\n",
                strip=True
            ).splitlines()
            if r.strip()
        ]

        anno_corrente = None

        storico = []

        for i, riga in enumerate(righe):

            # Individuiamo l'anno
            if riga.isdigit() and len(riga) == 4:

                anno = int(riga)

                if 2021 <= anno <= 2024:
                    anno_corrente = anno
                else:
                    anno_corrente = None

                continue

            if anno_corrente not in [
                2021,
                2022,
                2023,
                2024
            ]:
                continue

            # Consideriamo solo i Campionati Italiani
            if "CAMPIONATO ITALIANO" not in riga.upper():
                continue

            # Escludiamo Maratona e 1/2 Maratona
            if "MARATONA" in riga.upper():
                continue

            categoria = None

            # Cerchiamo la categoria nelle righe successive
            for successiva in righe[i + 1:i + 20]:

                if successiva in [
                    "R1",
                    "R12",
                    "RA",
                    "AL",
                    "JU",
                    "SE"
                ]:

                    categoria = successiva
                    break

            if categoria is None:
                continue

            # Normalizziamo R1 e R12
            if categoria == "R1":
                categoria = "R12"

            record = {
                "anno": anno_corrente,
                "manifestazione": riga,
                "categoria": categoria
            }

            if record not in storico:
                storico.append(record)


        # Copiamo i dati già raccolti 2025-2026
        partecipazioni_recenti = atleta.get(
            "partecipazioni_2025_2026",
            []
        )

        # Normalizziamo eventuali R1
        for p in partecipazioni_recenti:

            if p.get("categoria") == "R1":
                p["categoria"] = "R12"


        # Uniamo tutto
        partecipazioni_storiche = (
            storico +
            partecipazioni_recenti
        )

        # Ordiniamo dal più recente al più vecchio
        partecipazioni_storiche.sort(
            key=lambda x: x["anno"],
            reverse=True
        )

        risultati[tessera] = {
            "tessera": atleta["tessera"],
            "nome": atleta["nome"],
            "url": atleta["url"],
            "partecipazioni": partecipazioni_storiche
        }

        # Salvataggio progressivo
        with open(
            FILE_OUTPUT,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                risultati,
                f,
                ensure_ascii=False,
                indent=2
            )

        time.sleep(0.15)

    except Exception as e:

        print(
            "ERRORE:",
            e
        )


print()
print("=" * 80)
print("STORICO COMPLETATO")
print("=" * 80)

print(
    "Profili elaborati:",
    len(risultati)
)

print(
    "File creato:",
    FILE_OUTPUT
)

# ============================================================
# 3. CATEGORIA 2026 E PROIEZIONE 2027
# ============================================================

def categoria_stato(categoria, anno, storico):
    """
    Determina lo stato 1°/2° anno usando la progressione storica.

    Progressione:
    R12 → RA 1°
    RA 1° → RA 2°
    RA 2° → AL 1°
    AL 1° → AL 2°
    AL 2° → JU 1°
    JU 1° → JU 2°
    JU 2° → SE
    SE → SE
    """

    # R12 non ha 1°/2° anno
    if categoria == "R12":
        return "R12"

    # Senior
    if categoria == "SE":
        return "SE"

    # Ordine degli stati
    stati = [
        "RA1",
        "RA2",
        "AL1",
        "AL2",
        "JU1",
        "JU2",
        "SE"
    ]

    # Cerchiamo di ricostruire lo stato
    # partendo dal primo anno disponibile.
    anni = sorted(storico.keys())

    stato = None

    for a in anni:

        cat = storico[a]

        if cat == "R12":
            stato = "RA1"

        elif cat == "RA":

            if stato == "RA1":
                stato = "RA2"
            elif stato in [None, "R12"]:
                stato = "RA1"

        elif cat == "AL":

            if stato == "RA2":
                stato = "AL1"
            elif stato == "AL1":
                stato = "AL2"
            elif stato in [None, "RA"]:
                stato = "AL1"

        elif cat == "JU":

            if stato == "AL2":
                stato = "JU1"
            elif stato == "JU1":
                stato = "JU2"
            elif stato in [None, "AL"]:
                stato = "JU1"

        elif cat == "SE":
            stato = "SE"

    return stato or categoria


def prossimo_stato(stato):

    progressione = {
        "R12": "RA1",
        "RA1": "RA2",
        "RA2": "AL1",
        "AL1": "AL2",
        "AL2": "JU1",
        "JU1": "JU2",
        "JU2": "SE",
        "SE": "SE"
    }

    return progressione.get(stato, stato)


def nome_categoria(stato):

    nomi = {
        "R12": "Ragazzi 12",
        "RA1": "Ragazzi 1° anno",
        "RA2": "Ragazzi 2° anno",
        "AL1": "Allievi 1° anno",
        "AL2": "Allievi 2° anno",
        "JU1": "Junior 1° anno",
        "JU2": "Junior 2° anno",
        "SE": "Senior"
    }

    return nomi.get(stato, stato)


candidati_fanta = {}

for tessera, atleta in risultati.items():

    partecipazioni = atleta.get(
        "partecipazioni",
        []
    )

    # --------------------------------------------------------
    # COSTRUIAMO LA CATEGORIA PRINCIPALE DI OGNI ANNO
    # --------------------------------------------------------

    storico = {}

    for p in partecipazioni:

        anno = p.get("anno")
        categoria = p.get("categoria")

        if not anno or not categoria:
            continue

        if categoria == "R1":
            categoria = "R12"

        # Per ogni anno teniamo la categoria
        if anno not in storico:
            storico[anno] = categoria


    # --------------------------------------------------------
    # DEVONO ESSERCI 2025 O 2026
    # --------------------------------------------------------

    if 2025 not in storico and 2026 not in storico:
        continue


    # --------------------------------------------------------
    # DETERMINIAMO LO STATO 2026
    # --------------------------------------------------------

    categoria_2026 = storico.get(2026)

    # Se non ha gare nel 2026, usiamo il 2025
    if categoria_2026 is None:

        categoria_2026 = storico.get(2025)

    stato_2026 = categoria_stato(
        categoria_2026,
        2026,
        storico
    )


    # --------------------------------------------------------
    # PROIEZIONE 2027
    # --------------------------------------------------------

    categoria_2027_stato = prossimo_stato(
        stato_2026
    )

    categoria_2027 = nome_categoria(
        categoria_2027_stato
    )


    # --------------------------------------------------------
    # SALVIAMO L'ATLETA
    # --------------------------------------------------------

    atleta["storico_categorie"] = storico

    atleta["stato_2026"] = stato_2026

    atleta["categoria_2026"] = nome_categoria(
        stato_2026
    )

    atleta["stato_2027"] = categoria_2027_stato

    atleta["categoria_2027"] = categoria_2027

    candidati_fanta[tessera] = atleta


# ============================================================
# 4. SALVATAGGIO CANDIDATI
# ============================================================

with open(
    "candidati_fantaroller.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        candidati_fanta,
        f,
        ensure_ascii=False,
        indent=2
    )


# ============================================================
# 5. STAMPA CONTROLLO
# ============================================================

print()
print("=" * 80)
print("COMPLETATO")
print("=" * 80)

print(
    "Profili elaborati:",
    len(risultati)
)

print(
    "Candidati FantaRoller:",
    len(candidati_fanta)
)

print()
print("Esempio categoria 2027:")

for tessera, atleta in list(
    candidati_fanta.items()
)[:10]:

    print(
        f"{atleta['nome']} | "
        f"2026: {atleta['categoria_2026']} | "
        f"2027: {atleta['categoria_2027']}"
    )

print()
print("File creati:")
print("- atleti_storico.json")
print("- candidati_fantaroller.json")