import requests
import json
import os
import time
from bs4 import BeautifulSoup

# ============================================================
# CONFIGURAZIONE
# ============================================================

INPUT_FILE = "atleti_storico.json"
OUTPUT_FILE = "risultati_fantaroller.json"
PROGRESS_FILE = "progress_risultati.json"

BASE_URL = (
    "https://attivita.rollergames.it/"
    "corsa/atleta.php?tessera="
)

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

CATEGORIE_VALIDE = {
    "R",
    "R1",
    "R12",
    "RA",
    "AL",
    "JU",
    "SE"
}


# ============================================================
# MANIFESTAZIONI NAZIONALI
# ============================================================

MANIFESTAZIONI_NAZIONALI = {

    # 2021
    2816,  # Indoor A/J/S
    2814,  # Indoor R
    2863,  # Pista R/A/J/S
    2866,  # Strada R/A/J/S/M

    # 2022
    2900,  # Indoor A/J/S
    2903,  # Indoor Ragazzi
    2972,  # Pista R/A/J/S
    2966,  # Strada R/A/J/S/M

    # 2023
    3005,  # Indoor R/A
    3006,  # Indoor J/S
    3084,  # Pista R/A
    3072,  # Pista J/S
    3068,  # Strada R/A
    3065,  # Strada J/S/M

    # 2024
    3112,  # Indoor R/R12
    3110,  # Indoor A/J/S
    3192,  # Pista R/R12
    3193,  # Pista A/J/S
    3180,  # Strada R/R12
    3182,  # Strada A/J/S/M

    # 2025
    3233,  # Indoor R/R12
    3232,  # Indoor A/J/S
    3302,  # Pista R/R12
    3299,  # Pista A/J/S
    3305,  # Strada A/J/S/M + R12/R

    # 2026
    3340,  # Indoor R/R12
    3347,  # Indoor A/J/S
    3421,  # Pista R/R12
    3425,  # Pista A/J/S
    3428,  # Strada R/R12
    3436,  # Strada A/J/S/M
}


# ============================================================
# ANNO DELLA MANIFESTAZIONE
# ============================================================

ANNO_MANIFESTAZIONE = {

    # 2021
    2816: 2021,
    2814: 2021,
    2863: 2021,
    2866: 2021,

    # 2022
    2900: 2022,
    2903: 2022,
    2972: 2022,
    2966: 2022,

    # 2023
    3005: 2023,
    3006: 2023,
    3084: 2023,
    3072: 2023,
    3068: 2023,
    3065: 2023,

    # 2024
    3112: 2024,
    3110: 2024,
    3192: 2024,
    3193: 2024,
    3180: 2024,
    3182: 2024,

    # 2025
    3233: 2025,
    3232: 2025,
    3302: 2025,
    3299: 2025,
    3305: 2025,

    # 2026
    3340: 2026,
    3347: 2026,
    3421: 2026,
    3425: 2026,
    3428: 2026,
    3436: 2026,
}


# ============================================================
# CARICAMENTO ATLETI
# ============================================================

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as f:

    dati = json.load(f)


if isinstance(dati, dict):
    atleti = list(dati.values())
else:
    atleti = dati


print()
print("=" * 80)
print("CRAWLER RISULTATI FANTAROLLER")
print("=" * 80)

print(
    "Atleti da elaborare:",
    len(atleti)
)


# ============================================================
# CARICAMENTO PROGRESSO
# ============================================================

if os.path.exists(PROGRESS_FILE):

    with open(
        PROGRESS_FILE,
        "r",
        encoding="utf-8"
    ) as f:

        progresso = json.load(f)

else:

    progresso = {
        "elaborati": 0,
        "risultati": []
    }


risultati = progresso.get(
    "risultati",
    []
)

elaborati = progresso.get(
    "elaborati",
    0
)


print(
    "Già elaborati:",
    elaborati
)

print(
    "Risultati già salvati:",
    len(risultati)
)

print()


# ============================================================
# SESSIONE HTTP
# ============================================================

session = requests.Session()

session.headers.update(
    HEADERS
)


# ============================================================
# PARSER PROFILO ATLETA
# ============================================================

def estrai_risultati(tessera):

    url = BASE_URL + str(tessera)

    response = session.get(
        url,
        timeout=20
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    risultati_atleta = []

    manifestazione_corrente = None
    id_manifestazione = None


    # ========================================================
    # SCANSIONE TABELLA
    # ========================================================

    for tr in soup.find_all("tr"):

        celle = tr.find_all("td")

        if not celle:
            continue

        testi = [
            c.get_text(
                " ",
                strip=True
            )
            for c in celle
        ]


        # ====================================================
        # MANIFESTAZIONE
        # ====================================================

        link = tr.find(
            "a",
            href=lambda x:
                x and "lista_gare.php?id=" in x
        )

        if link:

            href = link.get(
                "href",
                ""
            )

            try:

                id_manifestazione = int(
                    href.split(
                        "id="
                    )[-1]
                )

            except:

                id_manifestazione = None


            manifestazione_corrente = (
                link.get_text(
                    " ",
                    strip=True
                )
            )

            continue


        # ====================================================
        # CONTROLLO MANIFESTAZIONE
        # ====================================================

        if (
            id_manifestazione
            not in MANIFESTAZIONI_NAZIONALI
        ):
            continue


        # ====================================================
        # RIGA RISULTATO
        # ====================================================

        if len(testi) < 6:
            continue


        categoria = testi[0]
        sesso = testi[1]
        gara = testi[2]

        classificazione = testi[-2]
        punti = testi[-1]


        if categoria not in CATEGORIE_VALIDE:
            continue


        try:

            classificazione = int(
                classificazione
            )

        except:

            continue


        try:

            punti = float(
                punti.replace(",", ".")
            )

        except:

            continue


        # ====================================================
        # ANNO REALE DELLA GARA
        # ====================================================

        anno_gara = ANNO_MANIFESTAZIONE.get(
            id_manifestazione
        )


        if anno_gara is None:
            continue


        # ====================================================
        # SALVATAGGIO
        # ====================================================

        risultati_atleta.append({

            "tessera":
                str(tessera),

            "anno_gara":
                anno_gara,

            "id_manifestazione":
                id_manifestazione,

            "manifestazione":
                manifestazione_corrente,

            "categoria":
                categoria,

            "sesso":
                sesso,

            "gara":
                gara,

            "classificazione":
                classificazione,

            "punti":
                punti
        })


    return risultati_atleta


# ============================================================
# CRAWLER
# ============================================================

for indice in range(
    elaborati,
    len(atleti)
):

    atleta = atleti[indice]

    tessera = atleta.get(
        "tessera"
    )

    nome = atleta.get(
        "nome",
        "Sconosciuto"
    )


    if not tessera:

        print(
            f"[{indice + 1}/{len(atleti)}] "
            f"⚠️ Tessera mancante: {nome}"
        )

        elaborati = indice + 1

        continue


    print(
        f"[{indice + 1}/{len(atleti)}] "
        f"{nome} "
        f"(tessera {tessera})"
    )


    try:

        nuovi_risultati = (
            estrai_risultati(
                tessera
            )
        )


        risultati.extend(
            nuovi_risultati
        )


        print(
            "   → risultati nazionali:",
            len(nuovi_risultati)
        )


    except Exception as e:

        print(
            "   ❌ ERRORE:",
            e
        )


    # ========================================================
    # AGGIORNAMENTO PROGRESSO
    # ========================================================

    elaborati = indice + 1


    progresso = {

        "elaborati":
            elaborati,

        "risultati":
            risultati
    }


    with open(
        PROGRESS_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            progresso,
            f,
            ensure_ascii=False,
            indent=2
        )


    # Piccola pausa
    time.sleep(0.15)


# ============================================================
# OUTPUT FINALE
# ============================================================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        risultati,
        f,
        ensure_ascii=False,
        indent=2
    )


print()
print("=" * 80)
print("CRAWLER COMPLETATO")
print("=" * 80)

print(
    "Atleti elaborati:",
    elaborati
)

print(
    "Risultati nazionali:",
    len(risultati)
)

print()
print(
    "Creato:",
    OUTPUT_FILE
)

print(
    "Progressi:",
    PROGRESS_FILE
)