import sys
import unittest
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from monitor import analyse_pair  # noqa: E402


def rows(latest=9.1, prior=9.2):
    start = date(2026, 1, 1)
    result = [{"date": (start + timedelta(days=i)).isoformat(), "rate": prior + i * 0.001} for i in range(35)]
    result[-1]["rate"] = latest
    return result


class AnalyseTests(unittest.TestCase):
    def test_detects_30_day_low(self):
        result, alerts = analyse_pair("GBP", "CNY", rows(9.1, 9.2))
        self.assertEqual(result["status"], "30d_low")
        self.assertEqual([a.window for a in alerts], [30])

    def test_detects_normal_rate(self):
        result, alerts = analyse_pair("USD", "CNY", rows(7.5, 7.1))
        self.assertEqual(result["status"], "normal")
        self.assertEqual(alerts, [])

    def test_fingerprint_deduplicates_same_low(self):
        _, alerts = analyse_pair("GBP", "CNY", rows(9.1, 9.2))
        self.assertEqual(alerts[0].fingerprint, "GBP/CNY:30:9.10000000")


if __name__ == "__main__":
    unittest.main()

