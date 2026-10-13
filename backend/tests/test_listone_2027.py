import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path


REPOSITORY = Path(__file__).resolve().parents[2]
SCRAPER = REPOSITORY / "scraper"
_TEST_DATABASE = tempfile.TemporaryDirectory(prefix="fantaroller-listone-test-")
os.environ["DATABASE_URL"] = f"sqlite:///{Path(_TEST_DATABASE.name) / 'test.sqlite3'}"
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
sys.path.insert(0, str(REPOSITORY / "backend"))

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import inspect, select

from main import (
    Athlete,
    Base,
    CompetizioneLega,
    ClassificaCompetizione,
    CorrezioneRisultato,
    EventoCatalogo,
    EventoLega,
    League,
    PuntiEvento,
    PuntiCompetizione,
    RisultatoPartecipante,
    RosaCompetizione,
    SessionLocal,
    Squadra,
    TransazioneMercato,
    User,
    acquista_atleta,
    apri_mercato_lega,
    avanza_competizione_lega,
    associa_evento_leghe,
    autorizza_transizione_competizione,
    atleti_squadra,
    engine,
    ensure_athlete_listone_columns,
    import_athletes,
    calcola_punti_competizione,
    finalizza_competizione,
    correggi_risultati_finalizzati,
    classifica_lega,
    chiudi_mercato_lega,
    crea_evento_catalogo,
    lista_atleti,
    squadra_atleti,
    seleziona_evento_lega,
    storico_squadra,
    reset_athletes,
    vendi_atleta,
)
from schemas import (AssociaEventoLegheRequest, CorrezionePunteggioAtleta,
                     CorrezioneRisultatoRequest, EventoCatalogoCreate,
                     SelezionaEventoRequest)


LISTONE = json.loads((SCRAPER / "listone.json").read_text(encoding="utf-8"))
CATEGORY_GROUPS = {
    "RA1": "Ragazzi",
    "RA2": "Ragazzi",
    "AL1": "Allievi",
    "AL2": "Allievi",
    "JU1": "Junior",
    "JU2": "Junior",
    "SE": "Senior",
}


def market_category(record):
    group = CATEGORY_GROUPS[record["categoria_2027"]]
    sex = record["sesso"]
    suffixes = {
        ("Ragazzi", "M"): "Ragazzi Maschi",
        ("Ragazzi", "F"): "Ragazze Femminile",
        ("Allievi", "M"): "Allievi Maschi",
        ("Allievi", "F"): "Allieve Femminile",
        ("Junior", "M"): "Junior Maschi",
        ("Junior", "F"): "Junior Femminile",
        ("Senior", "M"): "Senior Maschi",
        ("Senior", "F"): "Senior Femminile",
    }
    return suffixes[group, sex]


class Listone2027Tests(unittest.TestCase):
    def setUp(self):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        ensure_athlete_listone_columns()
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def make_team(self, records=(), limit=2, mode="listone", category_override=None):
        user = User(username="admin-test", password="test", is_admin=1)
        self.db.add(user)
        self.db.flush()
        league = League(
            nome="Lega test",
            owner_id=user.id,
            modalita=mode,
            atleti_per_categoria=limit,
        )
        self.db.add(league)
        self.db.flush()
        user.leghe.append(league)
        squad = Squadra(
            nome="Squadra test",
            user_id=user.id,
            league_id=league.id,
            budget=123,
        )
        self.db.add(squad)
        self.db.flush()

        athletes = []
        for index, record in enumerate(records):
            athlete = Athlete(
                name=record["nome"],
                categoria=category_override or market_category(record),
                punti=71 + index,
                prezzo=19 + index,
                prezzo_precedente=13 + index,
                gare=4 + index,
                malus=2 + index,
                visibile=1,
                tessera=str(record["tessera"]),
            )
            self.db.add(athlete)
            self.db.flush()
            self.db.execute(
                squadra_atleti.insert().values(
                    squadra_id=squad.id,
                    atleta_id=athlete.id,
                    prezzo_pagato=37 + index,
                )
            )
            athletes.append(athlete)

        self.db.commit()
        return user, league, squad, athletes

    def assign_event(self, event, user, league_ids):
        return associa_evento_leghe(
            event["id"], AssociaEventoLegheRequest(league_ids=league_ids),
            utente=user, db=self.db,
        )

    def test_listone_is_regenerated_without_invalid_records_or_duplicates(self):
        repo_dir = Path(tempfile.mkdtemp(prefix="fantaroller-generator-test-"))
        scraper_dir = repo_dir / "scraper"
        backend_dir = repo_dir / "backend"
        scraper_dir.mkdir()
        backend_dir.mkdir()
        self.addCleanup(shutil.rmtree, repo_dir)
        inputs = (
            "calcola_valutazioni.py",
            "risultati_fantaroller.json",
            "avversari_gare.json",
            "candidati_fantaroller.json",
        )
        for filename in inputs:
            shutil.copy2(SCRAPER / filename, scraper_dir / filename)
        shutil.copy2(SCRAPER / "calcola_valutazioni.py", scraper_dir / "calcola_valutazioni.py")

        result = subprocess.run(
            [sys.executable, "calcola_valutazioni.py"],
            cwd=scraper_dir,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        generated = json.loads((scraper_dir / "listone_2027.json").read_text(encoding="utf-8"))
        generated_import = json.loads((scraper_dir / "listone.json").read_text(encoding="utf-8"))
        generated_backend = json.loads((backend_dir / "listone.json").read_text(encoding="utf-8"))
        self.assertEqual(generated, generated_import)
        self.assertEqual(generated, generated_backend)
        self.assertEqual(generated, LISTONE)
        self.assertEqual(len(generated), 1226)

        tessere = [str(record["tessera"]).strip() for record in generated]
        self.assertEqual(len(tessere), len(set(tessere)))
        self.assertTrue(all(tessere))
        for record in generated:
            self.assertTrue(record["nome"].strip())
            self.assertIn(record["sesso"], {"M", "F"})
            self.assertIn(record["categoria_2027"], CATEGORY_GROUPS)
            self.assertGreaterEqual(record["prezzo"], 0)
            self.assertGreaterEqual(record["gare"], 0)
            self.assertGreaterEqual(record["valutazione"], 0)
            self.assertLessEqual(record["valutazione"], 100)

    def test_import_preview_uses_backend_listone_when_scraper_folder_is_not_deployed(self):
        package_dir = Path(tempfile.mkdtemp(prefix="fantaroller-backend-package-test-"))
        self.addCleanup(shutil.rmtree, package_dir)
        for filename in ("main.py", "models.py", "database.py", "schemas.py", "listone.json"):
            shutil.copy2(REPOSITORY / "backend" / filename, package_dir / filename)

        database_path = Path(_TEST_DATABASE.name) / "railway-package-test.sqlite3"
        environment = os.environ.copy()
        environment["DATABASE_URL"] = f"sqlite:///{database_path}"
        environment["PYTHONDONTWRITEBYTECODE"] = "1"
        code = (
            "from types import SimpleNamespace; import main; "
            "db=main.SessionLocal(); "
            "result=main.import_athletes(dry_run=True, "
            "utente=SimpleNamespace(is_admin=1), db=db); "
            "assert result['atleti_listone']==1226 and result['importabile']; "
            "print('BACKEND_ONLY_LISTONE_OK', result['atleti_listone']); db.close()"
        )
        result = subprocess.run(
            [sys.executable, "-c", code],
            cwd=package_dir,
            env=environment,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("BACKEND_ONLY_LISTONE_OK 1226", result.stdout)

    def test_migration_is_idempotent_and_creates_unique_tessera_index(self):
        ensure_athlete_listone_columns()
        columns = {column["name"] for column in inspect(engine).get_columns("athletes")}
        self.assertTrue(
            {"tessera", "sesso", "categoria_2027", "valutazione", "gare_storiche"}.issubset(columns)
        )
        indexes = inspect(engine).get_indexes("athletes")
        unique_tessera_indexes = [
            index for index in indexes
            if index["name"] == "uq_athletes_tessera"
            and index["column_names"] == ["tessera"]
            and index["unique"]
        ]
        self.assertEqual(len(unique_tessera_indexes), 1)
        league_columns = {column["name"] for column in inspect(engine).get_columns("leagues")}
        self.assertIn("modalita_economica", league_columns)
        tables = set(inspect(engine).get_table_names())
        self.assertTrue({"eventi_catalogo", "eventi_leghe", "competizioni_leghe", "rose_competizione", "punti_competizione", "risultati_partecipanti", "classifiche_competizione", "correzioni_risultati", "transazioni_mercato"}.issubset(tables))

    def test_import_preserves_roster_points_and_prices_and_is_repeatable(self):
        record = LISTONE[0]
        user, _, squad, athletes = self.make_team([record], limit=2)
        athlete = athletes[0]

        preview = import_athletes(dry_run=True, utente=user, db=self.db)
        self.assertTrue(preview["importabile"])
        imported = import_athletes(dry_run=False, utente=user, db=self.db)
        self.assertEqual(imported["atleti_listone"], len(LISTONE))
        self.assertEqual(self.db.query(Athlete).count(), len(LISTONE))
        market_rows = lista_atleti(self.db)
        self.assertEqual(
            {row.categoria for row in market_rows},
            {
                "Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile",
                "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile",
            },
        )

        self.db.refresh(athlete)
        self.db.refresh(squad)
        self.assertEqual(athlete.categoria, market_category(record))
        self.assertEqual(athlete.valutazione, record["valutazione"])
        self.assertEqual(athlete.prezzo, record["prezzo"])
        response_row = next(row for row in jsonable_encoder(market_rows) if row["id"] == athlete.id)
        self.assertEqual(response_row["categoria_2027"], record["categoria_2027"])
        self.assertEqual(response_row["sesso"], record["sesso"])
        self.assertEqual(response_row["valutazione"], record["valutazione"])
        self.assertEqual(athlete.punti, 71)
        self.assertEqual(athlete.gare, 4)
        self.assertEqual(athlete.malus, 2)
        self.assertEqual(athlete.prezzo_precedente, 13)
        self.assertEqual(squad.budget, 123)
        paid_price = self.db.execute(
            select(squadra_atleti.c.prezzo_pagato).where(
                squadra_atleti.c.squadra_id == squad.id,
                squadra_atleti.c.atleta_id == athlete.id,
            )
        ).scalar_one()
        self.assertEqual(paid_price, 37)

        repeated = import_athletes(dry_run=False, utente=user, db=self.db)
        self.assertEqual(repeated["atleti_nuovi"], 0)
        self.assertEqual(self.db.query(Athlete).count(), len(LISTONE))

    def test_market_and_event_points_use_2027_athlete_data(self):
        record = next(
            row for row in LISTONE
            if market_category(row) not in {"Ragazzi Maschi", "Ragazze Femminile"}
        )
        user, league, squad, _ = self.make_team(limit=2)
        import_athletes(dry_run=False, utente=user, db=self.db)
        athlete = self.db.query(Athlete).filter_by(tessera=str(record["tessera"])).one()

        market_record = next(row for row in lista_atleti(self.db) if row.id == athlete.id)
        self.assertEqual(market_record.categoria, market_category(record))
        self.assertEqual(market_record.categoria_2027, record["categoria_2027"])
        self.assertEqual(market_record.sesso, record["sesso"])
        self.assertEqual(market_record.valutazione, record["valutazione"])
        self.assertEqual(market_record.prezzo, record["prezzo"])

        acquista_atleta(athlete.id, league.id, utente=user, db=self.db)
        self.db.refresh(squad)
        self.assertEqual(squad.budget, 123 - record["prezzo"])
        self.db.add(
            PuntiEvento(
                atleta_id=athlete.id,
                evento="Gara test",
                categoria=market_category(record),
                punti=15,
            )
        )
        self.db.commit()
        scored_team = atleti_squadra(
            username=user.username,
            league_id=league.id,
            evento="Gara test",
            utente=user,
            db=self.db,
        )
        self.assertEqual(scored_team[0]["categoria"], market_category(record))
        self.assertEqual(scored_team[0]["punti"], 15)

    def test_unmatched_roster_member_blocks_import_without_changes(self):
        user, _, squad, _ = self.make_team()
        legacy = Athlete(
            name="Atleta fuori listone",
            categoria="Senior Maschi",
            punti=88,
            prezzo=22,
            prezzo_precedente=18,
            gare=7,
            malus=3,
            visibile=1,
        )
        self.db.add(legacy)
        self.db.flush()
        self.db.execute(
            squadra_atleti.insert().values(
                squadra_id=squad.id,
                atleta_id=legacy.id,
                prezzo_pagato=42,
            )
        )
        self.db.commit()

        preview = import_athletes(dry_run=True, utente=user, db=self.db)
        self.assertFalse(preview["importabile"])
        self.assertEqual(len(preview["atleti_in_rosa_non_abbinati"]), 1)
        with self.assertRaises(HTTPException) as raised:
            import_athletes(dry_run=False, utente=user, db=self.db)
        self.assertEqual(raised.exception.status_code, 409)
        self.assertEqual(self.db.query(Athlete).count(), 1)
        self.db.refresh(legacy)
        self.db.refresh(squad)
        self.assertEqual(legacy.punti, 88)
        self.assertEqual(legacy.prezzo, 22)
        self.assertEqual(legacy.prezzo_precedente, 18)
        self.assertEqual(legacy.malus, 3)
        self.assertEqual(squad.budget, 123)

    def test_category_overflow_after_category_change_blocks_import(self):
        records_by_category = {}
        for record in LISTONE:
            records_by_category.setdefault(market_category(record), []).append(record)
        records = next(records[:2] for records in records_by_category.values() if len(records) >= 2)
        user, _, squad, athletes = self.make_team(
            records,
            limit=1,
            category_override="Senior Femminile",
        )

        preview = import_athletes(dry_run=True, utente=user, db=self.db)
        self.assertFalse(preview["importabile"])
        self.assertTrue(preview["superamenti_limite_categorie"])
        with self.assertRaises(HTTPException) as raised:
            import_athletes(dry_run=False, utente=user, db=self.db)
        self.assertEqual(raised.exception.status_code, 409)
        for athlete in athletes:
            self.db.refresh(athlete)
            self.assertEqual(athlete.categoria, "Senior Femminile")
        self.db.refresh(squad)
        self.assertEqual(squad.budget, 123)
        self.assertEqual(self.db.query(Athlete).count(), 2)

    def test_competition_freezes_roster_and_finalization_keeps_history(self):
        user, league, squad, athletes = self.make_team([LISTONE[0]])
        athlete = athletes[0]
        league.modalita_economica = "reset"
        self.db.commit()
        event = crea_evento_catalogo(
            EventoCatalogoCreate(nome="Evento isolato", data_evento="2027-05-01"),
            utente=user,
            db=self.db,
        )
        self.assign_event(event, user, [league.id])
        comp_data = seleziona_evento_lega(
            SelezionaEventoRequest(league_id=league.id, evento_id=event["id"]),
            utente=user,
            db=self.db,
        )
        comp = self.db.query(CompetizioneLega).filter_by(id=comp_data["competizione_id"]).one()
        self.assertEqual(comp.fase, "configurata")
        apri_mercato_lega(league.id, utente=user, db=self.db)
        chiudi_mercato_lega(league.id, utente=user, db=self.db)
        frozen = self.db.query(RosaCompetizione).filter_by(competizione_id=comp.id).one()
        self.assertEqual(frozen.atleta_id, athlete.id)
        self.assertEqual(frozen.atleta_nome, athlete.name)
        self.assertEqual(frozen.categoria, athlete.categoria)
        self.assertEqual(frozen.prezzo_pagato, 37)
        with self.assertRaises(HTTPException):
            apri_mercato_lega(league.id, utente=user, db=self.db)

        self.db.add(PuntiEvento(atleta_id=athlete.id, evento="Evento isolato", categoria=athlete.categoria, punti=25))
        self.db.commit()
        for _ in range(2):
            avanza_competizione_lega(league.id, utente=user, db=self.db)
        self.assertEqual(comp.fase, "risultati_inseriti")
        calculated = calcola_punti_competizione(comp.id, utente=user, db=self.db)
        self.assertEqual(calculated["fase"], "punteggi_calcolati")
        final = finalizza_competizione(comp.id, conferma=True, utente=user, db=self.db)
        self.assertEqual(final["fase"], "finalizzato")
        repeated = finalizza_competizione(comp.id, utente=user, db=self.db)
        self.assertTrue(repeated["gia_finalizzata"])
        self.assertEqual(comp.fase, "finalizzato")
        self.assertEqual(self.db.query(PuntiCompetizione).filter_by(competizione_id=comp.id, atleta_id=athlete.id).one().punti, 25)
        self.assertEqual(self.db.query(RisultatoPartecipante).filter_by(competizione_id=comp.id, atleta_id=athlete.id).count(), 1)

        second_event = crea_evento_catalogo(EventoCatalogoCreate(nome="Evento successivo"), utente=user, db=self.db)
        self.assign_event(second_event, user, [league.id])
        before_roster = [a.id for a in squad.atleti]
        before_budget = squad.budget
        seleziona_evento_lega(
            SelezionaEventoRequest(league_id=league.id, evento_id=second_event["id"]),
            utente=user, db=self.db,
        )
        self.db.refresh(squad)
        self.assertEqual([a.id for a in squad.atleti], before_roster)
        self.assertEqual(squad.budget, before_budget)
        next_comp = self.db.query(CompetizioneLega).filter_by(league_id=league.id).order_by(CompetizioneLega.numero.desc()).first()
        self.assertEqual(next_comp.fase, "transizione_in_attesa")
        with patch.object(self.db, "commit", side_effect=RuntimeError("test commit failure")):
            with self.assertRaises(RuntimeError):
                autorizza_transizione_competizione(next_comp.id, utente=user, db=self.db)
        self.db.refresh(next_comp)
        self.db.refresh(squad)
        self.assertEqual(next_comp.fase, "transizione_in_attesa")
        self.assertEqual([a.id for a in squad.atleti], before_roster)
        self.assertEqual(squad.budget, before_budget)
        transition = autorizza_transizione_competizione(next_comp.id, utente=user, db=self.db)
        self.assertTrue(transition["reset_eseguito"])
        self.db.refresh(squad)
        self.assertEqual(len(squad.atleti), 0)
        self.assertEqual(squad.budget, league.crediti_iniziali)
        self.assertEqual(self.db.query(RosaCompetizione).filter_by(competizione_id=comp.id).count(), 1)

    def test_same_global_event_can_be_selected_in_independent_leagues(self):
        user, league, _, _ = self.make_team()
        event = crea_evento_catalogo(EventoCatalogoCreate(nome="Evento condiviso"), utente=user, db=self.db)
        lega_due = League(nome="Lega due", owner_id=user.id, modalita="listone")
        user.leghe.append(lega_due)
        self.db.add(lega_due)
        self.db.commit()
        self.assign_event(event, user, [league.id, lega_due.id])
        first = seleziona_evento_lega(SelezionaEventoRequest(league_id=league.id, evento_id=event["id"]), utente=user, db=self.db)
        second = seleziona_evento_lega(SelezionaEventoRequest(league_id=lega_due.id, evento_id=event["id"]), utente=user, db=self.db)
        self.assertNotEqual(first["competizione_id"], second["competizione_id"])
        self.assertEqual(self.db.query(CompetizioneLega).filter_by(evento_id=event["id"]).count(), 2)

    def test_continuity_mode_preserves_roster_and_remaining_budget(self):
        user, league, squad, athletes = self.make_team([LISTONE[0]])
        athlete = athletes[0]
        squad.budget = 91
        league.modalita_economica = "continuita"
        first_event = crea_evento_catalogo(EventoCatalogoCreate(nome="Continuità uno"), utente=user, db=self.db)
        self.assign_event(first_event, user, [league.id])
        first = seleziona_evento_lega(SelezionaEventoRequest(league_id=league.id, evento_id=first_event["id"]), utente=user, db=self.db)
        comp = self.db.query(CompetizioneLega).filter_by(id=first["competizione_id"]).one()
        comp.fase = "finalizzato"
        self.db.commit()
        next_event = crea_evento_catalogo(EventoCatalogoCreate(nome="Continuità due"), utente=user, db=self.db)
        self.assign_event(next_event, user, [league.id])
        seleziona_evento_lega(SelezionaEventoRequest(league_id=league.id, evento_id=next_event["id"]), utente=user, db=self.db)
        next_comp = self.db.query(CompetizioneLega).filter_by(league_id=league.id).order_by(CompetizioneLega.numero.desc()).first()
        self.assertEqual(next_comp.fase, "transizione_in_attesa")
        autorizza_transizione_competizione(next_comp.id, utente=user, db=self.db)
        self.db.refresh(squad)
        self.assertEqual([a.id for a in squad.atleti], [athlete.id])
        self.assertEqual(squad.budget, 91)

    def test_event_assignment_is_idempotent_and_does_not_change_roster_or_budget(self):
        user, league, squad, athletes = self.make_team([LISTONE[0]])
        event = crea_evento_catalogo(EventoCatalogoCreate(nome="Assegnazione idempotente"), utente=user, db=self.db)
        before_budget = squad.budget
        before_roster = [athlete.id for athlete in squad.atleti]
        first = self.assign_event(event, user, [league.id])
        second = self.assign_event(event, user, [league.id])
        self.assertEqual(first["leghe_aggiunte"], 1)
        self.assertEqual(second["leghe_aggiunte"], 0)
        self.assertEqual(self.db.query(EventoLega).filter_by(evento_id=event["id"], league_id=league.id).count(), 1)
        self.db.refresh(squad)
        self.assertEqual([athlete.id for athlete in squad.atleti], before_roster)
        self.assertEqual(squad.budget, before_budget)

    def test_only_admin_can_manage_and_finalize_competitions(self):
        owner, league, _, _ = self.make_team()
        ordinary = User(username="ordinary", password="test", is_admin=0)
        self.db.add(ordinary)
        self.db.flush()
        event = crea_evento_catalogo(EventoCatalogoCreate(nome="Permessi evento"), utente=owner, db=self.db)
        self.assign_event(event, owner, [league.id])
        comp_data = seleziona_evento_lega(
            SelezionaEventoRequest(league_id=league.id, evento_id=event["id"]),
            utente=owner, db=self.db,
        )
        with self.assertRaises(HTTPException) as create_event:
            crea_evento_catalogo(EventoCatalogoCreate(nome="Non autorizzato"), utente=ordinary, db=self.db)
        self.assertEqual(create_event.exception.status_code, 403)
        with self.assertRaises(HTTPException) as calculate:
            calcola_punti_competizione(comp_data["competizione_id"], utente=ordinary, db=self.db)
        self.assertEqual(calculate.exception.status_code, 403)
        with self.assertRaises(HTTPException) as finalize:
            finalizza_competizione(comp_data["competizione_id"], conferma=True, utente=ordinary, db=self.db)
        self.assertEqual(finalize.exception.status_code, 403)

    def test_calculation_is_not_finalization_and_admin_correction_is_audited(self):
        user, league, _, athletes = self.make_team([LISTONE[0]])
        athlete = athletes[0]
        event = crea_evento_catalogo(EventoCatalogoCreate(nome="Calcolo e correzione"), utente=user, db=self.db)
        self.assign_event(event, user, [league.id])
        selected = seleziona_evento_lega(
            SelezionaEventoRequest(league_id=league.id, evento_id=event["id"]), utente=user, db=self.db,
        )
        comp_id = selected["competizione_id"]
        apri_mercato_lega(league.id, utente=user, db=self.db)
        chiudi_mercato_lega(league.id, utente=user, db=self.db)
        self.db.add(PuntiEvento(atleta_id=athlete.id, evento="Calcolo e correzione", categoria=athlete.categoria, punti=12))
        self.db.commit()
        avanza_competizione_lega(league.id, utente=user, db=self.db)
        avanza_competizione_lega(league.id, utente=user, db=self.db)
        calculation = calcola_punti_competizione(comp_id, utente=user, db=self.db)
        self.assertEqual(calculation["fase"], "punteggi_calcolati")
        self.assertEqual(self.db.query(CompetizioneLega).filter_by(id=comp_id).one().fase, "punteggi_calcolati")
        self.assertEqual(self.db.query(ClassificaCompetizione).filter_by(competizione_id=comp_id).count(), 0)
        with self.assertRaises(HTTPException) as not_final_yet:
            autorizza_transizione_competizione(comp_id, utente=user, db=self.db)
        self.assertEqual(not_final_yet.exception.status_code, 409)
        finalizza_competizione(comp_id, conferma=True, utente=user, db=self.db)
        correction = CorrezioneRisultatoRequest(
            motivazione="Correzione ufficiale",
            risultati=[CorrezionePunteggioAtleta(atleta_id=athlete.id, punti=17)],
        )
        corrected = correggi_risultati_finalizzati(comp_id, correction, utente=user, db=self.db)
        self.assertEqual(corrected["correzioni_registrate"], 1)
        self.assertEqual(self.db.query(PuntiCompetizione).filter_by(competizione_id=comp_id, atleta_id=athlete.id).one().punti, 17)
        self.assertEqual(self.db.query(RisultatoPartecipante).filter_by(competizione_id=comp_id, atleta_id=athlete.id).one().punti, 17)
        standing = self.db.query(ClassificaCompetizione).filter_by(competizione_id=comp_id).one()
        self.assertEqual(standing.punti_totali, 17 + (standing.punti_bonus or 0))
        audit = self.db.query(CorrezioneRisultato).filter_by(competizione_id=comp_id, atleta_id=athlete.id).one()
        self.assertEqual((audit.punti_precedenti, audit.punti_nuovi, audit.motivazione), (12, 17, "Correzione ufficiale"))

    def test_continuity_general_classification_sums_finalized_snapshots(self):
        user, league, squad, _ = self.make_team(mode="listone")
        league.modalita_economica = "continuita"
        self.db.commit()
        categories = ["Ragazzi Maschi", "Ragazze Femminile", "Allievi Maschi", "Allieve Femminile",
                      "Junior Maschi", "Junior Femminile", "Senior Maschi", "Senior Femminile"]
        athletes = []
        for index in range(16):
            athlete = Athlete(name=f"Storico {index}", categoria=categories[index % 8], punti=0,
                              prezzo=10, prezzo_precedente=10, gare=0, malus=0, visibile=1)
            self.db.add(athlete)
            self.db.flush()
            self.db.execute(squadra_atleti.insert().values(squadra_id=squad.id, atleta_id=athlete.id, prezzo_pagato=10))
            athletes.append(athlete)
        self.db.commit()

        def run_finalized_event(name, points):
            event = crea_evento_catalogo(EventoCatalogoCreate(nome=name), utente=user, db=self.db)
            self.assign_event(event, user, [league.id])
            selected = seleziona_evento_lega(
                SelezionaEventoRequest(league_id=league.id, evento_id=event["id"]), utente=user, db=self.db,
            )
            comp_id = selected["competizione_id"]
            if self.db.query(CompetizioneLega).filter_by(league_id=league.id).count() > 1:
                autorizza_transizione_competizione(comp_id, utente=user, db=self.db)
            apri_mercato_lega(league.id, utente=user, db=self.db)
            chiudi_mercato_lega(league.id, utente=user, db=self.db)
            for athlete in athletes:
                self.db.add(PuntiEvento(atleta_id=athlete.id, evento=name, categoria=athlete.categoria,
                                        punti=points if athlete.id == athletes[0].id else 0))
            self.db.commit()
            avanza_competizione_lega(league.id, utente=user, db=self.db)
            avanza_competizione_lega(league.id, utente=user, db=self.db)
            calcola_punti_competizione(comp_id, utente=user, db=self.db)
            finalizza_competizione(comp_id, conferma=True, utente=user, db=self.db)

        run_finalized_event("Classifica uno", 10)
        run_finalized_event("Classifica due", 20)
        standings = classifica_lega(league.id, generale=True, utente=user, db=self.db)
        self.assertEqual(len(standings), 1)
        self.assertEqual(standings[0]["punti"], 30)
        self.assertEqual(standings[0]["eventi_finalizzati"], 2)
        self.assertEqual(self.db.query(RisultatoPartecipante).filter_by(league_id=league.id).count(), 32)
        next_event = crea_evento_catalogo(EventoCatalogoCreate(nome="Vendita dopo storico"), utente=user, db=self.db)
        self.assign_event(next_event, user, [league.id])
        selected = seleziona_evento_lega(
            SelezionaEventoRequest(league_id=league.id, evento_id=next_event["id"]), utente=user, db=self.db,
        )
        autorizza_transizione_competizione(selected["competizione_id"], utente=user, db=self.db)
        apri_mercato_lega(league.id, utente=user, db=self.db)
        vendi_atleta(athletes[0].id, league.id, "sale-after-final", utente=user, db=self.db)
        self.assertEqual(self.db.query(RisultatoPartecipante).filter_by(league_id=league.id).count(), 32)
        standings_after_sale = classifica_lega(league.id, generale=True, utente=user, db=self.db)
        self.assertEqual(standings_after_sale[0]["punti"], 30)

    def test_league_membership_is_required_to_read_private_competition_data(self):
        owner, league, _, _ = self.make_team([LISTONE[0]])
        stranger = User(username="stranger", password="test", is_admin=0)
        self.db.add(stranger)
        self.db.commit()
        with self.assertRaises(HTTPException) as standings:
            classifica_lega(league.id, utente=stranger, db=self.db)
        self.assertEqual(standings.exception.status_code, 404)
        with self.assertRaises(HTTPException) as roster:
            atleti_squadra(username=owner.username, league_id=league.id, utente=stranger, db=self.db)
        self.assertEqual(roster.exception.status_code, 404)
        with self.assertRaises(HTTPException) as history:
            storico_squadra(username=owner.username, league_id=league.id, utente=stranger, db=self.db)
        self.assertEqual(history.exception.status_code, 404)

    def test_auction_sale_refunds_paid_price_without_plusvalence_and_replay_is_safe(self):
        user, league, squad, _ = self.make_team(mode="asta")
        athlete = Athlete(name="Atleta asta", categoria="Senior Maschi", punti=0, prezzo=80, gare=0)
        self.db.add(athlete)
        self.db.flush()
        self.db.execute(squadra_atleti.insert().values(squadra_id=squad.id, atleta_id=athlete.id, prezzo_pagato=35))
        self.db.commit()
        first = vendi_atleta(athlete.id, league.id, idempotency_key="asta-sale-1", utente=user, db=self.db)
        after_first = squad.budget
        replay = vendi_atleta(athlete.id, league.id, idempotency_key="asta-sale-1", utente=user, db=self.db)
        self.assertEqual(first["budget_rimasto"], 123 + 35)
        self.assertEqual(replay["budget_rimasto"], after_first)
        self.assertIsNone(first["plusvalenza"])
        tx = self.db.query(TransazioneMercato).filter_by(chiave_idempotenza="asta-sale-1").one()
        self.assertIsNone(tx.plusvalenza)

    def test_listone_sale_records_realized_plusvalence_once(self):
        user, league, squad, athletes = self.make_team([LISTONE[0]])
        athlete = athletes[0]
        athlete.prezzo = 50
        self.db.execute(select(squadra_atleti.c.prezzo_pagato).where(squadra_atleti.c.squadra_id == squad.id))
        self.db.commit()
        result = vendi_atleta(athlete.id, league.id, idempotency_key="listone-sale-1", utente=user, db=self.db)
        self.assertEqual(result["plusvalenza"], 13)
        self.assertEqual(result["budget_rimasto"], 123 + 50)
        self.assertEqual(self.db.query(TransazioneMercato).filter_by(chiave_idempotenza="listone-sale-1").count(), 1)

    def test_event_catalog_requires_admin_and_legacy_global_reset_is_disabled(self):
        ordinary = User(username="ordinary", password="test", is_admin=0)
        self.db.add(ordinary)
        athlete = Athlete(name="Non eliminare", categoria="Senior Maschi", punti=12, prezzo=7, gare=1)
        self.db.add(athlete)
        self.db.commit()
        with self.assertRaises(HTTPException) as forbidden:
            crea_evento_catalogo(EventoCatalogoCreate(nome="Non autorizzato"), utente=ordinary, db=self.db)
        self.assertEqual(forbidden.exception.status_code, 403)
        with self.assertRaises(HTTPException) as reset:
            reset_athletes(utente=ordinary, db=self.db)
        self.assertEqual(reset.exception.status_code, 403)
        ordinary.is_admin = 1
        self.db.commit()
        with self.assertRaises(HTTPException) as disabled:
            reset_athletes(utente=ordinary, db=self.db)
        self.assertEqual(disabled.exception.status_code, 410)
        self.assertEqual(self.db.query(Athlete).filter_by(name="Non eliminare").count(), 1)


if __name__ == "__main__":
    unittest.main()
