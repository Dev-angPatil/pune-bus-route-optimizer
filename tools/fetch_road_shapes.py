#!/usr/bin/env python3
"""
Regenerates data/shapes.csv with REAL road geometry for every corridor.

For each row of data/routes.csv it asks the free public OSRM router
(https://router.project-osrm.org, built on OpenStreetMap) for the driving
path between the two stops, and saves the points so the map can draw the
corridor along actual Pune streets.

Only the public stop coordinates from data/stops.csv are sent.
Uses only the Python standard library. Waits ~1 second between requests
to respect the demo server's fair-use policy.

Run from the project root:   python3 tools/fetch_road_shapes.py
Output columns:              source_id,target_id,seq,lat,lon
"""
import csv
import json
import time
import urllib.request

OSRM = "https://router.project-osrm.org/route/v1/driving/{},{};{},{}?overview=full&geometries=geojson"
HEADERS = {"User-Agent": "pune-transit-route-optimizer/1.0 (college project)"}


def fetch_path(src, dst):
    url = OSRM.format(src[1], src[0], dst[1], dst[0])   # OSRM wants lon,lat
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.load(resp)
    if data.get("code") != "Ok":
        raise RuntimeError(data.get("message", data.get("code")))
    route = data["routes"][0]
    points = [(lat, lon) for lon, lat in route["geometry"]["coordinates"]]
    return points, route["distance"] / 1000.0


def main():
    stops = {}
    with open("data/stops.csv", newline="") as f:
        for row in csv.DictReader(f):
            stops[row["id"]] = (float(row["lat"]), float(row["lon"]))

    with open("data/routes.csv", newline="") as f:
        routes = list(csv.DictReader(f))

    rows = []
    for i, r in enumerate(routes, 1):
        s, t = r["source_id"], r["target_id"]
        points, km = fetch_path(stops[s], stops[t])
        # Make sure the line starts and ends exactly on the stop markers.
        points = [stops[s]] + points + [stops[t]]
        for seq, (lat, lon) in enumerate(points):
            rows.append([s, t, seq, f"{lat:.6f}", f"{lon:.6f}"])
        print(f"[{i:2}/{len(routes)}] {s} -> {t}: {len(points)} points, "
              f"road {km:.1f} km (routes.csv says {r['distance_km']} km)")
        time.sleep(1.1)

    with open("data/shapes.csv", "w", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["source_id", "target_id", "seq", "lat", "lon"])
        w.writerows(rows)
    print(f"Wrote {len(rows)} points for {len(routes)} corridors to data/shapes.csv")


if __name__ == "__main__":
    main()
