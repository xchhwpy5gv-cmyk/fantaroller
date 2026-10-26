import unittest

from scraper.calcola_valutazioni import applica_penalita_transizione, ricostruisci_stato_2026
from scraper.categorie import estrai_storico_categorie, ricostruisci_stato


class CategoryHistoryTests(unittest.TestCase):
    def test_gabriel_2025_and_2026_ragazzi_projects_to_allievi_first_year(self):
        _, categoria_2026, anno_categoria, categoria_2027 = applica_penalita_transizione(
            50,
            "616939",
            [],
            storico_categorie={"2025": "RA", "2026": "RA"},
            stato_2026_fallback="RA1",
        )

        self.assertEqual((categoria_2026, anno_categoria, categoria_2027), ("RA", 2, "AL1"))

    def test_sophie_single_2026_ragazzi_record_uses_verified_first_year_fallback(self):
        _, categoria_2026, anno_categoria, categoria_2027 = applica_penalita_transizione(
            50,
            "615414",
            [],
            storico_categorie={"2026": "RA"},
            stato_2026_fallback="RA1",
        )

        self.assertEqual((categoria_2026, anno_categoria, categoria_2027), ("RA", 1, "RA2"))

    def test_older_category_history_advances_through_missing_seasons(self):
        _, categoria_2026, anno_categoria, categoria_2027 = applica_penalita_transizione(
            50,
            "616939",
            [],
            storico_categorie={"2024": "R12", "2026": "RA"},
        )

        self.assertEqual((categoria_2026, anno_categoria, categoria_2027), ("RA", 2, "AL1"))

    def test_r12_to_ra_observed_in_consecutive_years_projects_to_ragazzi_second_year(self):
        stato_2026 = ricostruisci_stato(
            {"2025": "R1", "2026": "RA"},
            anno_obiettivo=2026,
        )
        stato_2027 = ricostruisci_stato(
            {"2025": "R1", "2026": "RA"},
            anno_obiettivo=2027,
        )

        self.assertEqual((stato_2026, stato_2027), ("RA1", "RA2"))

    def test_one_ambiguous_ra_observation_does_not_invent_school_year(self):
        self.assertIsNone(
            ricostruisci_stato({"2025": "RA"}, anno_obiettivo=2027)
        )

    def test_inconsistent_fallback_does_not_override_observed_history(self):
        stato = ricostruisci_stato_2026(
            {"2025": "RA", "2026": "RA"},
            stato_fallback="RA1",
        )

        self.assertEqual(stato, "RA2")

    def test_profile_parser_keeps_non_national_race_categories(self):
        storico = estrai_storico_categorie([
            "2025",
            "TROFEO REGIONALE DI PATTINAGGIO",
            "RA",
            "300 m Sprint",
            "2026",
            "CAMPIONATO ITALIANO INDOOR RAGAZZI",
            "RA",
        ])

        self.assertEqual(
            [(gara["anno"], gara["categoria"]) for gara in storico],
            [(2025, "RA"), (2026, "RA")],
        )

    def test_single_year_category_can_use_the_profile_candidate_state(self):
        self.assertEqual(
            ricostruisci_stato({"2026": "RA"}, fallback="RA1"),
            "RA1",
        )


if __name__ == "__main__":
    unittest.main()
