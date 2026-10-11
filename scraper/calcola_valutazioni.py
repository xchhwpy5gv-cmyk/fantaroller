import json
import math
from collections import defaultdict
from pathlib import Path

RISULTATI_FILE = "risultati_fantaroller.json"
AVVERSARI_FILE = "avversari_gare.json"

RISULTATI_GLOBALI = []

CANDIDATI_FILE = "candidati_fantaroller.json"
# ---------------------------------------------------------
# PESI TEMPORALI
# ---------------------------------------------------------

PESO_ANNO = {
    2021: 0.04,
    2022: 0.06,
    2023: 0.08,
    2024: 0.12,
    2025: 0.35,
    2026: 0.35,
}
# Penalità specifiche 2027
PENALITA_SENIOR = 0.15
PENALITA_R12 = 0.15


def categoria_2027(categoria_2026, anno_categoria):
    """
    Ricostruisce la categoria 2027 partendo dalla situazione 2026.

    Progressione:
    R12 -> RA1
    RA1 -> RA2
    RA2 -> AL1
    AL1 -> AL2
    AL2 -> JU1
    JU1 -> JU2
    JU2 -> SE
    SE -> SE
    """

    if categoria_2026 == "R1":
        return "RA1"

    if categoria_2026 == "R12":
        return "RA1"

    if categoria_2026 == "RA":
        if anno_categoria == 1:
            return "RA2"
        if anno_categoria == 2:
            return "AL1"

    if categoria_2026 == "AL":
        if anno_categoria == 1:
            return "AL2"
        if anno_categoria == 2:
            return "JU1"

    if categoria_2026 == "JU":
        if anno_categoria == 1:
            return "JU2"
        if anno_categoria == 2:
            return "SE"

    if categoria_2026 == "SE":
        return "SE"

    return None

def ricostruisci_categoria_2026(storico):
    """
    Ricostruisce categoria e anno di categoria nel 2026.

    La progressione è:
    R12 -> RA1 -> RA2 -> AL1 -> AL2 -> JU1 -> JU2 -> SE
    SE -> SE

    Se ci sono due anni consecutivi nella stessa categoria,
    il secondo anno viene riconosciuto come 2° anno.

    Gli anni mancanti all'inizio non sono penalizzati.
    """

    storico_per_anno = {}

    for r in storico:
        anno = r.get("anno_gara")
        categoria = r.get("categoria")

        if anno is None or not categoria:
            continue

        anno = int(anno)

        if categoria == "R1":
            categoria = "R12"

        if categoria not in ("R12", "RA", "AL", "JU", "SE"):
            continue

        if anno not in storico_per_anno:
            storico_per_anno[anno] = categoria

    # Caso speciale: R12 nel solo 2026
    if (
        len(storico_per_anno) == 1
        and storico_per_anno.get(2026) == "R12"
    ):
        return "R12", None

    if not storico_per_anno:
        return None, None

    anni = sorted(storico_per_anno.keys())

    # Progressione teorica completa
    ordine = ["R12", "RA", "AL", "JU", "SE"]

    categoria = storico_per_anno[anni[0]]
    anno_categoria = None

    # Se partiamo da R12, è necessariamente R12
    if categoria == "R12":
        anno_categoria = None

    for i in range(1, len(anni)):
        anno_precedente = anni[i - 1]
        anno_corrente = anni[i]

        categoria_reale = storico_per_anno[anno_corrente]

        # Se manca un anno, non possiamo usare automaticamente
        # la ripetizione per stabilire il 1°/2° anno.
        if anno_corrente != anno_precedente + 1:
            if categoria_reale != categoria:
                indice_vecchio = ordine.index(categoria)
                indice_nuovo = ordine.index(categoria_reale)

                if indice_nuovo != indice_vecchio + 1:
                    return None, None

                categoria = categoria_reale
                anno_categoria = 1

            continue

        # Stessa categoria per due anni consecutivi
        if categoria_reale == categoria:
            if categoria == "R12":
                return None, None

            anno_categoria = 2

        # Passaggio alla categoria successiva
        elif (
            categoria in ordine
            and categoria_reale in ordine
            and ordine.index(categoria_reale)
            == ordine.index(categoria) + 1
        ):
            categoria = categoria_reale

            if categoria == "SE":
                anno_categoria = None
            else:
                anno_categoria = 1

        else:
            return None, None

    # Se abbiamo dati fino al 2026, restituiamo direttamente.
    if 2026 in storico_per_anno:
        return categoria, anno_categoria

    # Proiettiamo gli anni mancanti fino al 2026.
    ultimo_anno = anni[-1]
    anni_mancanti = 2026 - ultimo_anno

    if anni_mancanti <= 0:
        return categoria, anno_categoria

    # Se non conosciamo il primo/secondo anno,
    # non inventiamo la categoria futura.
    if categoria == "R12":
        if anni_mancanti == 1:
            return "RA", 1
        return None, None

    if categoria == "RA":
        if anno_categoria == 1 and anni_mancanti == 1:
            return "RA", 2
        if anno_categoria == 2 and anni_mancanti == 1:
            return "AL", 1
        return None, None

    if categoria == "AL":
        if anno_categoria == 1 and anni_mancanti == 1:
            return "AL", 2
        if anno_categoria == 2 and anni_mancanti == 1:
            return "JU", 1
        return None, None

    if categoria == "JU":
        if anno_categoria == 1 and anni_mancanti == 1:
            return "JU", 2
        if anno_categoria == 2 and anni_mancanti == 1:
            return "SE", None
        return None, None

    if categoria == "SE":
        return "SE", None

    return None, None


def penalita_transizione_2027(
    categoria_2026,
    anno_categoria
):
    """
    Calcola automaticamente la penalità 2027.

    JU2 -> Senior:
        penalità Senior.

    R12 -> Ragazzi1:
        riduzione R12.

    Tutte le altre transizioni:
        nessuna penalità extra.
    """

    # R12 -> Ragazzi 1
    if categoria_2026 == "R1":
        return 1 - PENALITA_R12

    # JU2 -> Senior
    if (
        categoria_2026 == "JU"
        and anno_categoria == 2
    ):
        return 1 - PENALITA_SENIOR

    return 1.0


def carica_json(nome):
    with open(nome, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------
# PIAZZAMENTO
# ---------------------------------------------------------

def posizione_score(posizione, partecipanti):
    """
    Converte il piazzamento in un punteggio 0-100.

    La differenza tra le prime posizioni è significativa,
    ma non eccessiva.

    1° = 100
    ultimo = 0
    """

    if posizione is None or partecipanti <= 1:
        return None

    if posizione < 1 or posizione > partecipanti:
        return None

    # Percentuale di atleti superati.
    percentile = (
        partecipanti - posizione
    ) / (partecipanti - 1)

    percentile = max(
        0.0,
        min(1.0, percentile)
    )

    # Curva più equilibrata rispetto alla precedente.
    #
    # Manteniamo un vantaggio importante per le prime
    # posizioni senza schiacciare tutto verso 100.
    score = (
        100 * (
            0.70 * percentile +
            0.30 * (percentile ** 1.8)
        )
    )

    return max(
        0.0,
        min(100.0, score)
    )


# ---------------------------------------------------------
# COSTRUZIONE GARE
# ---------------------------------------------------------

def costruisci_gare(avversari):

    gare = []

    for gara in avversari:

        atleti = gara.get("atleti", [])

        if not atleti:
            continue

        risultati = {}

        for atleta in atleti:

            tessera = str(
                atleta.get("tessera")
            )

            posizione = atleta.get(
                "classificazione"
            )

            if posizione is None:
                continue

            risultati[tessera] = posizione

        if not risultati:
            continue

        gare.append({
            "anno": int(gara["anno"]),
            "categoria": gara.get("categoria"),
            "sesso": gara.get("sesso"),
            "gara": gara.get("gara"),
            "id_manifestazione": gara.get(
                "id_manifestazione"
            ),
            "partecipanti": len(atleti),
            "risultati": risultati,
        })

    return gare


# ---------------------------------------------------------
# FORZA BASE DEGLI ATLETI
# ---------------------------------------------------------

def calcola_forza_base(gare):

    somme = defaultdict(float)
    pesi = defaultdict(float)

    for gara in gare:

        peso_anno = PESO_ANNO.get(
            gara["anno"],
            0
        )

        if peso_anno == 0:
            continue

        for tessera, posizione in gara[
            "risultati"
        ].items():

            score = posizione_score(
                posizione,
                gara["partecipanti"]
            )

            if score is None:
                continue

            somme[tessera] += (
                score * peso_anno
            )

            pesi[tessera] += peso_anno

    forza = {}

    for tessera in somme:

        if pesi[tessera] > 0:

            forza[tessera] = (
                somme[tessera] /
                pesi[tessera]
            )

    return forza


# ---------------------------------------------------------
# FORZA DEGLI AVVERSARI
# ---------------------------------------------------------

def calcola_forza_avversari(gare):
    """
    Calcola la forza degli avversari senza permettere
    che la forza si gonfi indefinitamente.

    La forza viene mantenuta sempre tra 0 e 100.
    """

    forza = calcola_forza_base(gare)

    # Le iterazioni servono solo a correggere leggermente
    # il valore in base alla qualità del campo.
    for _ in range(3):

        nuova_forza = {}

        somme = defaultdict(float)
        pesi = defaultdict(float)

        for gara in gare:

            peso_anno = PESO_ANNO.get(
                gara["anno"],
                0
            )

            if peso_anno == 0:
                continue

            risultati = gara["risultati"]

            for tessera, posizione in risultati.items():

                score = posizione_score(
                    posizione,
                    gara["partecipanti"]
                )

                if score is None:
                    continue

                altri = [
                    forza[a]
                    for a in risultati
                    if a != tessera
                    and a in forza
                ]

                if altri:

                    forza_campo = (
                        sum(altri) /
                        len(altri)
                    )

                else:
                    forza_campo = 50.0

                # Effetto volutamente piccolo.
                # Campo 75 -> circa +10%
                # Campo 25 -> circa -10%
                fattore_campo = (
                    1
                    + (forza_campo - 50)
                    / 500
                )

                score_corretto = (
                    score *
                    fattore_campo
                )

                # Limitiamo il singolo risultato.
                score_corretto = max(
                    0,
                    min(100, score_corretto)
                )

                somme[tessera] += (
                    score_corretto *
                    peso_anno
                )

                pesi[tessera] += peso_anno

        for tessera in somme:

            if pesi[tessera] > 0:

                valore = (
                    somme[tessera] /
                    pesi[tessera]
                )

                nuova_forza[tessera] = max(
                    0,
                    min(100, valore)
                )

        forza = nuova_forza

    return forza


# ---------------------------------------------------------
# GARE PER ATLETA
# ---------------------------------------------------------

def conta_gare_atleta(gare):

    conteggio = defaultdict(int)

    for gara in gare:

        for tessera in gara[
            "risultati"
        ]:

            conteggio[tessera] += 1

    return conteggio


# ---------------------------------------------------------
# VALUTAZIONE ATLETA
# ---------------------------------------------------------

def applica_penalita_transizione(
    valore,
    tessera,
    risultati
):
    """
    Applica automaticamente la penalità prevista
    per la transizione verso il 2027.
    """

    storico_atleta = [
        r
        for r in risultati
        if str(r.get("tessera")) == str(tessera)
    ]

    categoria_2026, anno_categoria = (
        ricostruisci_categoria_2026(
            storico_atleta
        )
    )

    if categoria_2026 is None:
        return valore, None, None, None

    categoria_2027_finale = categoria_2027(
        categoria_2026,
        anno_categoria
    )

    moltiplicatore = penalita_transizione_2027(
        categoria_2026,
        anno_categoria
    )

    valore *= moltiplicatore

    return (
        valore,
        categoria_2026,
        anno_categoria,
        categoria_2027_finale,
    )

def prezzo_da_valutazione(v):
    if v >= 90:
        prezzo = 65 + (v - 90) * 1.5
    elif v >= 85:
        prezzo = 52 + (v - 85) * 1.6
    elif v >= 80:
        prezzo = 45 + (v - 80) * 1.4
    elif v >= 75:
        prezzo = 38 + (v - 75) * 1.4
    elif v >= 65:
        prezzo = 32 + (v - 65) * 0.6
    elif v >= 50:
        prezzo = 22 + (v - 50) * (10 / 15)
    else:
        prezzo = max(5, 22 * v / 50)

    return round(prezzo)

def calcola_valutazione(
    tessera,
    gare,
    forza_avversari,
    conteggio_gare
):

    risultati = []

    for gara in gare:

        if tessera not in gara[
            "risultati"
        ]:
            continue

        posizione = gara[
            "risultati"
        ][tessera]

        score = posizione_score(
            posizione,
            gara["partecipanti"]
        )

        if score is None:
            continue

        altri = [
            forza_avversari[a]
            for a in gara["risultati"]
            if a != tessera
            and a in forza_avversari
        ]

        if altri:

            forza_campo = (
                sum(altri) /
                len(altri)
            )

        else:
            forza_campo = 50.0

        # Correzione leggera della qualità del campo.
        fattore_campo = (
            1
            + (forza_campo - 50)
            / 500
        )

        score_corretto = (
            score *
            fattore_campo
        )

        score_corretto = max(
            0,
            min(100, score_corretto)
        )

        risultati.append({
            "anno": gara["anno"],
            "score": score_corretto,
            "peso": PESO_ANNO.get(
                gara["anno"],
                0
            ),
            "posizione": posizione,
            "partecipanti": gara[
                "partecipanti"
            ],
            "forza_campo": forza_campo,
        })

    if not risultati:
        return None, {}

    # -----------------------------------------------------
    # MEDIA PER ANNO
    # -----------------------------------------------------

    per_anno = {}

    for anno in PESO_ANNO:

        valori = [
            r for r in risultati
            if r["anno"] == anno
        ]

        if not valori:
            continue

        media = sum(
            r["score"]
            for r in valori
        ) / len(valori)

        per_anno[anno] = {
            "media": media,
            "gare": len(valori),
        }

    # -----------------------------------------------------
    # MEDIA STORICA PESATA
    # -----------------------------------------------------

    pesi_disponibili = {
        anno: PESO_ANNO[anno]
        for anno in per_anno
        if anno in PESO_ANNO
    }

    somma_pesi = sum(pesi_disponibili.values())

    if somma_pesi <= 0:
        return None, per_anno

    valore = sum(
        per_anno[anno]["media"] * pesi_disponibili[anno]
        for anno in pesi_disponibili
    ) / somma_pesi

    if 2026 not in per_anno:
        valore *= 0.90

    # -----------------------------------------------------
    # AFFIDABILITÀ
    # -----------------------------------------------------
    #
    # Non premiamo chi fa più gare.
    # Evitiamo soltanto che pochissimi risultati
    # producano una valutazione troppo estrema.
    #

    n = conteggio_gare[tessera]

    affidabilita = min(
        1.0,
        0.75 +
        0.25 * (
            1 - math.exp(-n / 10)
        )
    )

    valore = (
        50 +
        (valore - 50) *
        affidabilita
    )

    # -----------------------------------------------------
    # TRANSIZIONE AUTOMATICA 2027
    # -----------------------------------------------------

    valore, cat_2026, anno_cat, cat_2027 = (
        applica_penalita_transizione(
            valore,
            tessera,
            RISULTATI_GLOBALI
        )
    )

    valore = max(
        0,
        min(100, valore)
    )

    return (
        valore,
        per_anno,
        cat_2026,
        anno_cat,
        cat_2027
    )


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------

def main():

    print("=" * 65)
    print("VALUTAZIONE FANTAROLLER 2027 - MODELLO V2")
    print("=" * 65)

    risultati = carica_json(
        RISULTATI_FILE
    )

    global RISULTATI_GLOBALI
    RISULTATI_GLOBALI = risultati

    avversari = carica_json(
        AVVERSARI_FILE
    )

    print()
    print(
        "Risultati caricati:",
        len(risultati)
    )

    print(
        "Gare avversari:",
        len(avversari)
    )

    gare = costruisci_gare(
        avversari
    )

    print(
        "Gare utilizzabili:",
        len(gare)
    )

    forza = calcola_forza_avversari(
        gare
    )

    conteggio = conta_gare_atleta(
        gare
    )

    print()
    print("=" * 65)
    print("RISULTATI TEST")
    print("=" * 65)

    # Recupera il sesso degli atleti dai risultati ufficiali
    sesso_atleti = {}

    for risultato in risultati:
        tessera = str(risultato.get("tessera", ""))
        sesso = risultato.get("sesso")

        if tessera and sesso in ("M", "F"):
            sesso_atleti.setdefault(tessera, sesso)

    listone = []

    candidati = carica_json(CANDIDATI_FILE)

    for tessera, dati_atleta in candidati.items():
        nome = dati_atleta.get("nome", "SCONOSCIUTO")

        (
            valore,
            per_anno,
            cat_2026,
            anno_cat,
            cat_2027
        ) = calcola_valutazione(
            tessera,
            gare,
            forza,
            conteggio
        )

        print()
        print(nome)
        print("-" * 45)

        print(
            "Tessera:",
            tessera
        )

        print(
            "Gare:",
            conteggio.get(
                tessera,
                0
            )
        )

        print(
            "Categoria 2026:",
            cat_2026
        )

        print(
            "Anno categoria:",
            anno_cat
        )

        print(
            "Categoria 2027:",
            cat_2027
        )

        print(
            "Forza storica:",
            round(
                forza.get(
                    tessera,
                    0
                ),
                2
            )
        )

        if valore is None or cat_2027 not in {"RA1", "RA2", "AL1", "AL2", "JU1", "JU2", "SE"}:
            continue


        prezzo = prezzo_da_valutazione(valore)

        if cat_2027 is None:
            stato_2027 = dati_atleta.get("stato_2027")

            mappa_categorie = {
                "Ragazzi 1° anno": "RA1",
                "Ragazzi 2° anno": "RA2",
                "Allievi 1° anno": "AL1",
                "Allievi 2° anno": "AL2",
                "Junior 1° anno": "JU1",
                "Junior 2° anno": "JU2",
                "Senior": "SE",
            }

            cat_2027 = mappa_categorie.get(stato_2027, stato_2027)

        listone.append({
            "tessera": tessera,
            "nome": nome,
            "sesso": sesso_atleti.get(str(tessera)),
            "valutazione": round(valore, 2),
            "prezzo": prezzo,
            "categoria_2026": cat_2026,
            "anno_categoria_2026": anno_cat,
            "categoria_2027": cat_2027,
            "gare": conteggio.get(tessera, 0),
        })

        print(
            "VALUTAZIONE 2027:",
            round(
                valore,
                2
            ),
            "/ 100"
        )

        print(
            "PREZZO:",
            prezzo,
            "crediti"
        )

        print()
        print("DETTAGLIO ANNUALE:")

        for anno in sorted(
            per_anno
        ):

            dati = per_anno[anno]

            print(
                f"  {anno}: "
                f"{dati['media']:.2f} "
                f"({dati['gare']} gare)"
            )

    output_paths = (
        Path("listone_2027.json"),
        Path("listone.json"),
        Path(__file__).resolve().parent.parent / "backend" / "listone.json",
    )
    for file_output in output_paths:
        file_output.parent.mkdir(parents=True, exist_ok=True)
        with file_output.open("w", encoding="utf-8") as f:
            json.dump(listone, f, ensure_ascii=False, indent=2)

    print()
    print("=" * 65)
    print("FINE TEST")
    print("=" * 65)


if __name__ == "__main__":
    main()
