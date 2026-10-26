import requests
import json
import os
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin
try:
    from .categorie import estrai_storico_categorie, ricostruisci_stato
except ImportError:
    from categorie import estrai_storico_categorie, ricostruisci_stato

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

# Integra gli elenchi nazionali appena letti con il file storico già presente:
# così non si perdono partecipanti che mancano nella raccolta precedente.
for tessera, atleta in atleti.items():
    scheda = risultati_base.setdefault(tessera, {
        "tessera": tessera,
        "nome": atleta["nome"],
        "url": atleta["url"],
        "partecipazioni_2025_2026": [],
    })
    scheda.setdefault("partecipazioni_2025_2026", [])
    scheda["nome"] = atleta["nome"]
    scheda["url"] = atleta["url"]


risultati = {}

print()
print("=" * 80)
print("FASE 2 - RECUPERO CATEGORIE STORICHE DAL PROFILO ATLETA")
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

        storico = estrai_storico_categorie(righe)

        # Uniamo i campionati 2025-2026 della raccolta esistente con quelli
        # appena letti dalle pagine ufficiali, usando la categoria del profilo.
        partecipazioni_recenti = list(atleta.get("partecipazioni_2025_2026", []))
        categorie_profilo = {}
        for record in storico:
            categorie_profilo.setdefault(record["anno"], record["categoria"])

        for partecipazione in atleti.get(str(tessera), {}).get("partecipazioni", []):
            anno = partecipazione["anno"]
            categoria = categorie_profilo.get(anno)
            if not categoria:
                continue
            partecipazioni_recenti.append({
                "anno": anno,
                "manifestazione": partecipazione["campionato"],
                "categoria": categoria,
            })

        # Normalizziamo eventuali R1
        for p in partecipazioni_recenti:

            if p.get("categoria") == "R1":
                p["categoria"] = "R12"


        # Uniamo tutto
        partecipazioni_storiche = []
        viste = set()
        for partecipazione in storico + partecipazioni_recenti:
            chiave = (
                partecipazione.get("anno"),
                partecipazione.get("manifestazione"),
                partecipazione.get("categoria"),
            )
            if chiave not in viste:
                partecipazioni_storiche.append(partecipazione)
                viste.add(chiave)

        # Ordiniamo dal più recente al più vecchio
        partecipazioni_storiche.sort(
            key=lambda x: x["anno"],
            reverse=True
        )

        risultati[tessera] = {
            "tessera": atleta["tessera"],
            "nome": atleta["nome"],
            "url": atleta["url"],
            "partecipazioni": partecipazioni_storiche,
            "storico_categorie": {
                str(anno): categoria
                for anno, categoria in sorted(
                    {
                        int(p["anno"]): p["categoria"]
                        for p in partecipazioni_storiche
                        if p.get("anno") and p.get("categoria")
                    }.items()
                )
            },
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

        # Se il profilo non risponde, conserviamo comunque le categorie già
        # fornite dagli elenchi ufficiali dei campionati 2025/2026. La
        # proiezione successiva scarterà i casi in cui queste osservazioni non
        # bastano a determinare una categoria univoca.
        partecipazioni_base = atleta.get("partecipazioni_2025_2026", [])
        if partecipazioni_base:
            risultati[tessera] = {
                "tessera": atleta.get("tessera", str(tessera)),
                "nome": atleta.get("nome", "SCONOSCIUTO"),
                "url": atleta.get("url", ""),
                "partecipazioni": [
                    {
                        "anno": record.get("anno"),
                        "manifestazione": record.get("manifestazione", ""),
                        "categoria": "R12" if record.get("categoria") == "R1"
                        else record.get("categoria"),
                    }
                    for record in partecipazioni_base
                    if record.get("anno") and record.get("categoria")
                ],
                "storico_categorie": {
                    str(anno): categoria
                    for anno, categoria in sorted(
                        {
                            int(record["anno"]): "R12" if record.get("categoria") == "R1"
                            else record.get("categoria")
                            for record in partecipazioni_base
                            if record.get("anno") and record.get("categoria")
                        }.items()
                    )
                },
            }


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

    osservazioni = dict(storico or {})
    osservazioni[int(anno)] = "R12" if categoria == "R1" else categoria
    return ricostruisci_stato(
        osservazioni,
        anno_obiettivo=2026,
        assumi_primo_anno=True,
    )


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

    anno_categoria_nota = 2026 if storico.get(2026) else 2025
    categoria_nota = storico.get(anno_categoria_nota)
    stato_2026 = categoria_stato(
        categoria_nota,
        anno_categoria_nota,
        storico,
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
