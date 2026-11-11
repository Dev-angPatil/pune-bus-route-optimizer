import json
import time
from optimizer_engine import PuneRouteOptimizer

def test_full_hub_matrix():
    print("Testing all permutations of the 24 Pune Transit Hubs...")
    optimizer = PuneRouteOptimizer("src/data/puneTransitData.json")
    hubs = list(optimizer.hubs.keys())
    total_pairs = len(hubs) * (len(hubs) - 1)

    errors = []
    times = []

    start_total = time.time()
    for origin in hubs:
        for destination in hubs:
            if origin == destination:
                continue

            t0 = time.time()
            comparison = optimizer.compare_routes(origin, destination, hour=8)
            dt = time.time() - t0
            times.append(dt)

            if not comparison['standard_route']['success'] or not comparison['crowd_optimized_route']['success']:
                errors.append((origin, destination))

    total_duration = time.time() - start_total
    avg_time = sum(times) / len(times) * 1000 # in ms
    max_time = max(times) * 1000 # in ms

    print(f"Total pairs tested: {total_pairs}")
    print(f"Errors / disconnected pairs: {len(errors)}")
    print(f"Average pathfinding time: {avg_time:.2f} ms")
    print(f"Max pathfinding time: {max_time:.2f} ms")
    print(f"Total batch time: {total_duration:.2f} seconds")

    assert len(errors) == 0, f"Found disconnected hub pairs: {errors}"
    assert max_time < 1000, f"Pathfinding took longer than 1 second: {max_time} ms"
    print("SUCCESS: All 24x24 (552) hub routes solved with 0 errors in sub-second latency!")

if __name__ == '__main__':
    test_full_hub_matrix()
