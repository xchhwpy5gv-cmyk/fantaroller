# Istruzioni per Codex — FantaRoller

## Contesto del progetto

FantaRoller è un fantasy game dedicato al pattinaggio corsa in linea, basato sui risultati reali delle gare.

- Frontend: React, nella cartella `frontend/`.
- Backend: Python con FastAPI, nella cartella `backend/`.
- Database: SQLAlchemy; in locale è stato usato SQLite. La produzione è su Railway e può usare PostgreSQL.
- Frontend online: Vercel, dominio `fantaroller.it`.
- Backend online: `https://fantaroller-production.up.railway.app`.
- `scraper/` contiene script e dati JSON degli atleti e dei risultati.

Queste informazioni sono un orientamento: prima di intervenire verifica sempre la struttura, la configurazione e il codice attuali. Non presumere che deploy, commit o dati locali siano aggiornati.

## Regole di lavoro

1. Prima di modificare il progetto, leggi i file reali interessati e ricostruisci i flussi coinvolti tra frontend, backend, database e scraper.
2. Non inventare nomi di file, campi, endpoint, modelli o regole di gioco. Cercali nel repository e verifica come vengono usati.
3. Procedi per passi piccoli e mirati. Spiega in italiano, con parole semplici, cosa stai facendo e cosa hai trovato.
4. Prima di modifiche importanti, controlla `git status` e le differenze locali. Conserva tutto il lavoro già presente: non sovrascrivere, ripristinare, cancellare o includere modifiche preesistenti senza istruzioni esplicite.
5. Evita refactoring, dipendenze e cambiamenti non necessari. Mantieni funzionanti le altre parti dell’app.
6. Dopo le modifiche esegui verifiche mirate e appropriate al cambiamento, senza alterare dati o file dell’utente. Riporta chiaramente l’esito e gli eventuali limiti.
7. Non pubblicare, distribuire o fare deploy automaticamente. Prima descrivi cosa cambierebbe e lascia all’utente la verifica dei passaggi importanti.

## Precauzioni per dati e produzione

- Non cancellare utenti, leghe, squadre, rose, crediti, atleti o dati delle gare.
- Non chiamare endpoint di reset e non eseguire operazioni distruttive o irreversibili sul database.
- Non eseguire importazioni in produzione senza aver prima verificato il codice esatto, il file e lo schema sorgente, la modalità di abbinamento/aggiornamento dei record e il rischio per i dati esistenti.
- Non collegarti né inviare richieste al database o al backend di produzione durante analisi e diagnosi. Un’operazione in produzione richiede un’autorizzazione esplicita dell’utente dopo che le conseguenze sono state spiegate.
- Prima di una migrazione o importazione, individua effetti su chiavi e relazioni, squadre esistenti, prezzi pagati, punti evento e compatibilità SQLite/PostgreSQL. Preferisci un piano reversibile e una prova locale con dati di test.
- Tratta i JSON in `scraper/` come dati dell’utente: leggili senza riscriverli o riformattarli se non richiesto.

## Compatibilità del gioco

Prima di cambiare atleti, categorie, prezzi o punti, verifica entrambi i lati dell’applicazione:

- Il modello `Athlete` e gli endpoint backend che leggono o aggiornano i relativi campi.
- Importazione e identificazione degli atleti, relazioni con le squadre e punti per evento.
- Logica di mercato: acquisto, vendita, budget, limiti per categoria e visibilità.
- Regole di composizione della rosa e numero totale di atleti.
- Filtri, ordinamento e visualizzazione nel frontend.
- Eventuali dipendenze da sesso, categoria, nome, tessera o stagione nei dati dello scraper.

Non assumere che una valutazione del listone equivalga ai punti sportivi, né che un codice di categoria nuovo sia compatibile con le categorie testuali usate dalle rose. Chiarisci la mappatura e verifica tutte le regole collegate prima di importare o migrare.

Per il listone 2027, la fonte generata da `scraper/calcola_valutazioni.py` usa tessera, nome, sesso, valutazione, prezzo, categoria 2026, categoria 2027 e gare storiche. Il prezzo fantasia va letto direttamente da `prezzo`; non va ricalcolato dai vecchi punti. `categoria_2027` e `sesso` si mappano sugli otto gruppi di mercato già usati (Ragazzi, Allievi, Junior e Senior, maschi e femmine). Conserva valutazione, codice categoria e gare storiche separatamente dai punti e dalle gare fantasy: `Athlete.punti` e `Athlete.gare` restano legati ai risultati del gioco.

Il listone principale è generato da `scraper/calcola_valutazioni.py` sia in `scraper/listone.json` sia in `scraper/listone_2027.json`. Il servizio Railway usa `/backend` come root directory: il generatore produce quindi anche `backend/listone.json`, che deve restare identico alle altre due copie. L’importazione usa `scraper/listone.json` nel repository completo e ripiega su `backend/listone.json` nel pacchetto Railway. Il vecchio `scraper/scraper.py` è stato rimosso dopo aver verificato che il backend gestisce già l’importazione degli eventi e che non esistono riferimenti attivi allo script.

## Comunicazione

- Rispondi in italiano, in modo semplice e concreto.
- Distingui fatti verificati da ipotesi e proposte.
- Quando l’utente chiede soltanto un’analisi, non modificare file né toccare servizi o database.
- Quando il lavoro è finito, indica file modificati, motivazione, verifiche eseguite e risultato; chiedi conferma prima di qualunque azione in produzione o pubblicazione.
