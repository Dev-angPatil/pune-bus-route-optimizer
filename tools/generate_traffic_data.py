#!/usr/bin/env python3
"""
Synthetic traffic history generator for the Pune Transit Route Optimizer.

WHY SYNTHETIC?
  Real hourly traffic data for Pune is not freely available, so we simulate
  one year (2025) of "observed" congestion using well-known Pune patterns:
    - Weekday morning rush (8-11 AM) and evening rush (5-9 PM)
    - IT corridors (Hinjewadi, Kharadi, Magarpatta) get the worst peaks
    - Old city centre roads are busy all day
    - Weekends / holidays are lighter, monsoon (Jun-Sep) is slower
    - Random noise, because real traffic is never perfectly regular

OUTPUT: data/traffic_history.csv  with columns
    date,hour,road_type,congestion_factor
  congestion_factor = actual travel time / free-flow travel time  (always >= 1.0)

The C++ TrafficModel learns from this file. Uses only the Python standard
library. Fixed random seed, so the output is identical every run.

Run from the project root:   python3 tools/generate_traffic_data.py
"""
import csv
import datetime
import math
import random

random.seed(42)

ROAD_TYPES = ["it_corridor", "city_center", "arterial", "highway"]

# Free-flow congestion level of each road type (1.0 = empty road)
BASE = {"it_corridor": 1.10, "city_center": 1.25, "arterial": 1.10, "highway": 1.00}
# Extra congestion at the height of the morning / evening rush
MORNING_PEAK = {"it_corridor": 1.50, "city_center": 0.90, "arterial": 0.70, "highway": 0.35}
EVENING_PEAK = {"it_corridor": 1.30, "city_center": 1.00, "arterial": 0.70, "highway": 0.40}


def load_holidays(path="data/holidays.csv"):
    with open(path, newline="") as f:
        return {row["date"] for row in csv.DictReader(f)}


def bell(hour, centre, width):
    """Smooth bump that is 1.0 at `centre` and fades to 0 away from it."""
    return math.exp(-((hour - centre) ** 2) / (2 * width ** 2))


def true_congestion(day, hour, road, holidays):
    weekend = day.weekday() >= 5
    holiday = day.isoformat() in holidays

    if hour >= 23 or hour <= 5:          # night: roads are empty
        f = 1.0
    elif weekend or holiday:             # light, shopping-type traffic around midday
        f = BASE[road] + 0.30 * bell(hour, 14, 3.0)
        if holiday:
            f -= 0.05
    else:                                # normal working day
        f = (BASE[road]
             + MORNING_PEAK[road] * bell(hour, 9.5, 1.2)
             + EVENING_PEAK[road] * bell(hour, 18.5, 1.5))

    if 6 <= day.month <= 9:              # monsoon rain slows everything down
        f += 0.10 + 0.20 * (f - 1.0)

    f += random.gauss(0, 0.08)           # day-to-day randomness
    return round(max(1.0, f), 2)


def main():
    holidays = load_holidays()
    start = datetime.date(2025, 1, 1)
    days = [start + datetime.timedelta(days=i) for i in range(365)]
    sampled = sorted(random.sample(days, 150))   # 150 observed days of 2025

    with open("data/traffic_history.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["date", "hour", "road_type", "congestion_factor"])
        for day in sampled:
            for hour in range(24):
                for road in ROAD_TYPES:
                    w.writerow([day.isoformat(), hour, road,
                                true_congestion(day, hour, road, holidays)])
    print(f"Wrote {len(sampled) * 24 * len(ROAD_TYPES)} rows to data/traffic_history.csv")


if __name__ == "__main__":
    main()
