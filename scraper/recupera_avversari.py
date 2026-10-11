import requests
from bs4 import BeautifulSoup
import json
import re
import time

BASE_URL = "https://attivita.rollergames.it/corsa/"

MANIFESTAZIONI = {
    # 2021
    2863: 2021,  # Pista R/A/J/S
    2816: 2021,  # Indoor A/J/S
    2814: 2021,  # Indoor R
    2866: 2021,  # Strada R/A/J/S/M

    # 2022
    2966: 2022,  # Strada R/A/J/S/M
    2972: 2022,  # Pista R/A/J/S
    2903: 2022,  # Indoor Ragazzi
    2900: 2022,  # Indoor A/J/S

    # 2023
    3072: 2023,  # Pista J/S
    3065: 2023,  # Strada J/S/M
    3005: 2023,  # Indoor R/A
    3084: 2023,  # Pista R/A
    3068: 2023,  # Strada R/A
    3006: 2023,  # Indoor J/S

    # 2024
    3192: 2024,  # Pista R/R12
    3182: 2024,  # Strada A/J/S/M
    3180: 2024,  # Strada Ragazzi
    3110: 2024,  # Indoor A/J/S
    3193: 2024,  # Pista A/J/S
    3112: 2024,  # Indoor Ragazzi/R12

    # 2025
    3299: 2025,  # Pista A/J/S
    3232: 2025,  # Indoor A/J/S
    3305: 2025,  # Strada A/J/S/M + R12/R
    3233: 2025,  # Indoor R/R12
    3302: 2025,  # Pista R/R12

    # 2026
    3425: 2026,  # Pista A/J/S
    3421: 2026,  # Pista R/R12
    3347: 2026,  # Indoor A/J/S
    3428: 2026,  # Strada R/R12
    3340: 2026,  # Indoor R/R12
    3436: 2026,  # Strada A/J/S
}

OUTPUT = "avversari_gare.json"

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0"})


def scarica(url):
    try:
        r = session.get(url, timeout=60)
        r.raise_for_status()
        return r.text
    except Exception as e:
        print("ERRORE:", url, e)
        return None


def estrai_tessera(href):
    m = re.search(r"tessera=(\d+)", href)
    return m.group(1) if m else None


def analizza_tabella(tabella, manifestazione_id, anno):
    righe = tabella.find_all("tr")

    gare = []
    gara_corrente = None

    categorie = {"R1", "R", "RA", "AL", "JU", "SE"}
    sessi = {"M", "F"}

    for riga in righe:

        celle = riga.find_all(["th", "td"])

        if not celle:
            continue

        testo = riga.get_text(" ", strip=True)
        parti = testo.split()

        testo = riga.get_text(" ", strip=True)

        # Cerchiamo una riga intestazione vera della gara.
        # AL F 1 giri Crono atleti contr.
        categoria = None
        sesso = None

        if parti:
            categoria = parti[0]
            if len(parti) > 1 and parti[1] in ("M", "F"):
                sesso = parti[1]

        # Ignoriamo completamente i Master:
        # non fanno parte del FantaRoller.
        categorie_ammesse = {"R", "R1", "R12", "RA", "AL", "JU", "SE"}

        # Se troviamo una categoria non ammessa (es. Master),
        # chiudiamo la gara corrente e ignoriamo il relativo blocco.
        if categoria and sesso and categoria not in categorie_ammesse:
            if gara_corrente and gara_corrente["atleti"]:
                gare.append(gara_corrente)
            gara_corrente = None
            continue

        # Se abbiamo trovato una nuova gara valida
        if categoria in categorie_ammesse and sesso:

            # Salva quella precedente
            if gara_corrente and gara_corrente["atleti"]:
                gare.append(gara_corrente)

            gara_corrente = {
                "id_gara": len(gare) + 1,
                "anno": anno,
                "id_manifestazione": manifestazione_id,
                "categoria": categoria,
                "sesso": sesso,
                "gara": testo,
                "atleti": []
            }

            continue

        # Se non siamo ancora dentro una gara
        if gara_corrente is None:
            continue

        # Cerchiamo l'atleta
        link = riga.find(
            "a",
            href=re.compile(r"atleta\.php\?tessera=\d+")
        )

        if not link:
            continue

        tessera = estrai_tessera(link.get("href", ""))

        if not tessera:
            continue

        nome = link.get_text(" ", strip=True)

        # La prima cella numerica dovrebbe essere la posizione
        classificazione = None

        for cella in celle:
            valore = cella.get_text(" ", strip=True)

            if valore.isdigit():
                classificazione = int(valore)
                break

        gara_corrente["atleti"].append({
            "tessera": tessera,
            "nome": nome,
            "classificazione": classificazione
        })

    # Ultima gara
    if gara_corrente and gara_corrente["atleti"]:
        gare.append(gara_corrente)

    return gare


def main():

    print("=" * 40)
    print("RECUPERO AVVERSARI GARE")
    print("=" * 40)

    tutte_le_gare = []

    for i, (manifestazione_id, anno) in enumerate(
        MANIFESTAZIONI.items(), 1
    ):

        print(
            f"[{i}/{len(MANIFESTAZIONI)}] "
            f"Manifestazione {manifestazione_id} - {anno}"
        )

        url = (
            f"{BASE_URL}lista_gare.php"
            f"?id={manifestazione_id}"
        )

        html = scarica(url)

        if not html:
            continue

        soup = BeautifulSoup(html, "html.parser")

        tabelle = soup.find_all("table")

        print("  Tabelle trovate:", len(tabelle))

        # Le due tabelle sono duplicate.
        # Usiamo soltanto la prima.
        if not tabelle:
            print("  Nessuna tabella trovata")
            continue

        gare_manifestazione = analizza_tabella(
            tabelle[0],
            manifestazione_id,
            anno
        )

        print(
            "  Gare individuate:",
            len(gare_manifestazione)
        )

        tutte_le_gare.extend(gare_manifestazione)

        time.sleep(0.2)

    with open(
        OUTPUT,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            tutte_le_gare,
            f,
            ensure_ascii=False,
            indent=2
        )

    print()
    print("=" * 40)
    print("COMPLETATO")
    print("Gare:", len(tutte_le_gare))
    print("Creato:", OUTPUT)
    print("=" * 40)


if __name__ == "__main__":
    main()