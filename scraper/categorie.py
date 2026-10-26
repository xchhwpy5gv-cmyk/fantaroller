"""Ricostruzione coerente delle categorie annuali del listone."""

STATI_CATEGORIA = ("R12", "RA1", "RA2", "AL1", "AL2", "JU1", "JU2", "SE")
CATEGORIE_PER_STATO = {
    "R12": {"R12", "R1"},
    "RA1": {"RA"}, "RA2": {"RA"},
    "AL1": {"AL"}, "AL2": {"AL"},
    "JU1": {"JU"}, "JU2": {"JU"},
    "SE": {"SE"},
}
CATEGORIE_VALIDE = {"R1", "R12", "RA", "AL", "JU", "SE"}
PAROLE_EVENTO = (
    "CAMPIONATO", "TROFEO", "GARA", "MEMORIAL", "GRAN PRIX", "GRANPRIX",
    "REGIONALE", "PROVINCIALE", "INTERNAZIONALE", "COPPA", "MEETING",
    "TAPPA", "CRITERIUM", "CIRCUITO",
)


def estrai_storico_categorie(righe, anno_minimo=2010, anno_massimo=2026):
    """Estrae anno e categoria dai titoli gara di una scheda atleta testuale."""
    anno_corrente = None
    storico = []
    for indice, riga in enumerate(righe):
        riga = str(riga).strip()
        if riga.isdigit() and len(riga) == 4:
            anno = int(riga)
            anno_corrente = anno if anno_minimo <= anno <= anno_massimo else None
            continue
        if anno_corrente is None or not any(parola in riga.upper() for parola in PAROLE_EVENTO):
            continue

        categoria = next(
            (str(successiva).strip().upper()
             for successiva in righe[indice + 1:indice + 20]
             if str(successiva).strip().upper() in CATEGORIE_VALIDE),
            None,
        )
        if categoria:
            record = {
                "anno": anno_corrente,
                "manifestazione": riga,
                "categoria": "R12" if categoria == "R1" else categoria,
            }
            if record not in storico:
                storico.append(record)
    return storico


def stato_successivo(stato):
    """Avanza di una stagione nella progressione del gioco."""
    indice = STATI_CATEGORIA.index(stato)
    return STATI_CATEGORIA[min(indice + 1, len(STATI_CATEGORIA) - 1)]


def ricostruisci_stato(storico, anno_obiettivo=2026, fallback=None,
                       assumi_primo_anno=False):
    """Calcola lo stato in un anno usando le categorie osservate per tessera.

    `storico` può essere una mappa anno -> categoria oppure una sequenza di
    record con `anno`/`anno_gara` e `categoria`. I buchi negli anni vengono
    attraversati nella progressione; categorie incompatibili non producono
    una classificazione inventata.
    """
    if isinstance(storico, dict):
        righe = [
            {"anno": anno, "categoria": categoria}
            for anno, categoria in storico.items()
        ]
    else:
        righe = storico or []

    osservazioni = {}
    for riga in righe:
        anno = riga.get("anno", riga.get("anno_gara"))
        categoria = str(riga.get("categoria") or "").strip().upper()
        if anno is None or categoria not in {"R1", "R12", "RA", "AL", "JU", "SE"}:
            continue
        anno = int(anno)
        osservazioni.setdefault(anno, set()).add("R12" if categoria == "R1" else categoria)

    if not osservazioni:
        return fallback if fallback in STATI_CATEGORIA else None

    anni = sorted(osservazioni)
    ultimo = anni[-1]

    # Due stagioni recenti consecutive sono la prova migliore per distinguere
    # il primo dal secondo anno. Se manca la stagione precedente, usiamo anche
    # le osservazioni più vecchie e attraversiamo gli anni senza gare.
    anni_da_usare = anni[-2:] if ultimo - 1 in osservazioni else anni
    primo = anni_da_usare[0]
    possibili = {
        stato for stato, categorie in CATEGORIE_PER_STATO.items()
        if osservazioni[primo].intersection(categorie)
    }
    precedente = primo
    for anno in anni_da_usare[1:]:
        for _ in range(anno - precedente):
            possibili = {stato_successivo(stato) for stato in possibili}
        compatibili = {
            stato for stato in possibili
            if osservazioni[anno].intersection(CATEGORIE_PER_STATO[stato])
        }
        if compatibili:
            possibili = compatibili
        else:
            possibili = {
                stato for stato, categorie in CATEGORIE_PER_STATO.items()
                if osservazioni[anno].intersection(categorie)
            }
        precedente = anno

    for _ in range(max(0, anno_obiettivo - ultimo)):
        possibili = {stato_successivo(stato) for stato in possibili}

    if fallback in possibili:
        return fallback
    if len(possibili) == 1:
        return next(iter(possibili))

    # Per un atleta osservato per la prima volta nell'anno obiettivo, il
    # comportamento già usato dal progetto considera il primo anno categoria.
    if assumi_primo_anno and ultimo == anno_obiettivo:
        categoria = next(iter(osservazioni[ultimo])) if len(osservazioni[ultimo]) == 1 else None
        primo_stato = {"RA": "RA1", "AL": "AL1", "JU": "JU1"}.get(categoria)
        return primo_stato if primo_stato in possibili else None
    return None
