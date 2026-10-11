import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
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
    League,
    PuntiEvento,
    SessionLocal,
    Squadra,
    User,
    acquista_atleta,
    atleti_squadra,
    engine,
    ensure_athlete_listone_columns,
    import_athletes,
    lista_atleti,
    squadra_atleti,
)


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


if __name__ == "__main__":
    unittest.main()
