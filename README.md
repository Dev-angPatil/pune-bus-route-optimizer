# 🚍 Pune PMPML Transit Route Optimizer (C++ & DAA College Project)

> **A minimal, clean, and complete Graph Theory & Data Structures and Algorithms (DAA) project in Modern C++ (C++17) with interactive GUI, real OpenStreetMap navigation, and standalone CLI.**

Developed using authentic transit hub coordinates and arterial corridors from **PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)**.

---

## 🎯 Highlights for College Evaluation & Viva

1. **Core Algorithms Implemented**:
   - 🟢 **Dijkstra's Algorithm**: Single-source shortest path using a Min-Heap priority queue (`std::priority_queue`). Demonstrates the **Greedy Paradigm**.
   - 🔵 **A\* Search Algorithm**: Informed spatial search using an admissible **Haversine Distance Heuristic** $h(n)$ derived from real GPS coordinates. Explores significantly fewer nodes than Dijkstra.
   - 🟠 **Bellman-Ford Algorithm**: Single-source shortest path via bottom-up edge relaxation over $|V| - 1$ passes with **Negative Cycle Detection**. Demonstrates the **Dynamic Programming Paradigm**.
   - ⚡ **Side-by-Side Benchmark Engine**: Directly compares distance, travel time, nodes explored, edge relaxations, and CPU execution time in microseconds ($\mu s$).

2. **Dual-Mode User Interface**:
   - 🖥️ **Desktop GUI**: Sleek two-pane native Qt6 window featuring an embedded **Real OpenStreetMap** of Pune with interactive stop pins, route polylines, and dynamic algorithm performance cards.
   - 💻 **Standalone Terminal CLI**: Pure standard C++17 with **zero external dependencies** (`g++ -std=c++17`), featuring formatted ANSI color tables and interactive menus. Perfect for running on any university lab machine.

3. **Custom Map & CSV Import**:
   - Easily import custom transit graphs using standard CSV files (`stops.csv` and `routes.csv`) via the GUI file picker or command line.

---

## 📐 Algorithmic & Mathematical Breakdown

### 1. Graph Representation
The transit network is modeled as a weighted directed graph:
$$\mathcal{G} = (\mathcal{V}, \mathcal{E})$$
- $\mathcal{V}$ = 24 Key Pune Transit Hubs (Swargate, Hinjewadi, Pune Station, Katraj, Hadapsar, Shivajinagar, etc.)
- $\mathcal{E}$ = 38 Connecting Arterial Road Corridors
- Stored as an **Adjacency List** using `std::unordered_map<std::string, std::vector<Edge>>` for optimal $O(1)$ vertex lookup and $O(\text{deg}(u))$ neighbor traversal.

---

### 2. Algorithm Comparison Matrix

| Algorithm | Paradigm | Time Complexity | Space Complexity | Heuristic Admissibility | Key Strength |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dijkstra** | Greedy | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}(V)$ | None (Dijkstra is unguided) | Finds optimal shortest path in non-negative graphs |
| **A\* Search** | Informed / Heuristic | $\mathcal{O}((V + E) \log V)$ (pruned) | $\mathcal{O}(V)$ | **Admissible & Consistent** ($h(n) \le d(n, \text{goal})$) | Explores significantly fewer nodes |
| **Bellman-Ford** | Dynamic Programming | $\mathcal{O}(V \cdot E)$ | $\mathcal{O}(V)$ | None | Handles negative edges & detects negative cycles |

---

### 3. Haversine Geographic Heuristic Formula (A*)
To ensure the A* algorithm is guaranteed to find the true optimal shortest path, the heuristic function $h(n)$ must be **admissible** (it must never overestimate the true remaining distance).

We compute the great-circle distance on the Earth's sphere between stop $n$ $(\phi_1, \lambda_1)$ and target stop $(\phi_2, \lambda_2)$:
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$
$$h(n) = R \cdot c \quad (R = 6371.0 \text{ km})$$

Because the straight-line spherical distance is the shortest possible path between two geographic points, $h(n) \le \text{TrueRoadDistance}(n, \text{target})$. Thus:
- $h(n)$ is **admissible**.
- $h(n)$ satisfies the triangle inequality and is therefore **monotonic / consistent**.

---

## 🚦 Traffic Prediction (Date & Time Aware Routing)

Pick a departure date and time, and the optimizer **predicts congestion on every road** and finds the **fastest** route (instead of the shortest one).

```
predicted_time(edge) = base_time_mins × congestion_factor(road_type, date, time)
```

- `congestion_factor` is **1.0 on an empty road** and goes up to about 2.5× on Hinjewadi at 9 AM.
- Every road in `routes.csv` has a `road_type`: `it_corridor`, `city_center`, `arterial` or `highway`.

### Two prediction models (both learned from `data/traffic_history.csv`)

| Model | How it works | Test error (MAE) |
|:---|:---|:---|
| No traffic (baseline) | Always predicts 1.0 | 0.328 |
| **Historical Average** | Mean of past rows with the same (road type, weekday/weekend/holiday, hour) | **0.083** |
| **Linear Regression** | `factor = w · x`, 9 yes/no features, trained with **Gradient Descent** | 0.117 (R² = 0.79) |

The learned regression weights are readable on their own (`./pune_route_cli --model-info`):

| Feature (0 or 1) | Weight |
|:---|---:|
| bias (always 1) | +1.011 |
| daytime (6 AM – 10 PM) | +0.149 |
| weekday morning rush (8–11 AM) | +0.441 |
| weekday evening rush (5–9 PM) | +0.419 |
| rush hour AND IT corridor | +0.502 |
| rush hour AND city centre | +0.148 |
| rush hour AND highway | −0.338 |
| city centre road (daytime) | +0.200 |
| monsoon month (Jun–Sep) | +0.148 |

So on a weekday at 9 AM on an IT corridor: 1.011 + 0.149 + 0.441 + 0.502 = **2.10×** slower than an empty road.

### About the data (please read)
Real hourly Pune traffic data is not freely available, so `data/traffic_history.csv` is **synthetic**. `tools/generate_traffic_data.py` simulates 150 days of 2025 from known Pune patterns (rush hours, IT corridors, monsoon, holidays) plus random noise. The project demonstrates the **method**. Swap in real data with the same 4 columns and both models retrain automatically on start-up.

### Features
- **Fastest route at a given time:** e.g. Kothrud → Swargate goes through Deccan at 2 PM (41 min) but takes the Chandani Chowk / Warje bypass at 9 AM (57 min).
- **Best time to leave:** tries every 30-minute departure slot of the day and charts the travel time.
- **Congestion map:** roads coloured green / yellow / red by predicted traffic.
- **Holidays:** `data/holidays.csv` (editable) marks days with lighter traffic.

---

## 🚀 Quick Start & Compilation

### Prerequisites
- **For CLI Mode**: Any standard C++17 compiler (`g++` or `clang++`). No libraries required!
- **For GUI Mode**: `qt6-base`, `qt6-webengine`, `qt6-webchannel`.

### Build Targets

Run from inside the `cpp_project` directory:

```bash
# 1. Build Standalone CLI (Zero Dependencies)
make cli

# 2. Build Desktop GUI with Real Map
make gui

# 3. Build Both
make all
```

### Running the Applications

#### Run the Desktop GUI:
```bash
./pune_route_optimizer
# Or:
make run
```

#### Run the Terminal CLI:
```bash
# Interactive Menu
./pune_route_cli

# Direct Comparison Command
./pune_route_cli --from swargate --to hinjewadi_ph3 --compare

# Single Algorithm Execution
./pune_route_cli --from swargate --to hinjewadi_ph3 --algo astar

# Fastest route with predicted traffic (model: lr = regression, avg = average, off)
./pune_route_cli --from kothrud_depot --to swargate --at "2026-11-18 09:00" --compare
./pune_route_cli --from kothrud_depot --to swargate --at "2026-11-18 14:00" --model avg

# Best time to leave over the whole day
./pune_route_cli --from swargate --to hinjewadi_ph3 --at "2026-11-18" --best-departure

# Show the trained model's weights and accuracy
./pune_route_cli --model-info
```

---

## 📂 Project Structure

```text
cpp_project/
├── data/
│   ├── stops.csv             # 24 Pune Hubs (ID, Name, Lat, Lon, Category)
│   ├── routes.csv            # 38 Transit Corridors (Source, Target, Distance, Time, Road Type)
│   ├── shapes.csv            # Road geometry coordinates for real map curves
│   ├── traffic_history.csv   # 14,400 synthetic traffic observations (date, hour, road type, factor)
│   └── holidays.csv          # Public holidays & festivals (lighter traffic)
├── tools/
│   └── generate_traffic_data.py # Regenerates traffic_history.csv (Python stdlib only)
├── src/
│   ├── core/
│   │   ├── Stop.h            # Stop data structure
│   │   ├── Edge.h            # Road corridor data structure
│   │   ├── RouteResult.h     # Result metrics (Distance, Time, Exec Time, Path)
│   │   ├── Graph.h / .cpp    # Adjacency list & Haversine distance engine
│   │   ├── Dijkstra.h / .cpp # Dijkstra's algorithm (Min-Heap Greedy)
│   │   ├── AStar.h / .cpp    # A* search algorithm (Heuristic)
│   │   ├── BellmanFord.h / .cpp # Bellman-Ford algorithm (Dynamic Programming)
│   │   ├── Benchmark.h / .cpp   # 3-way side-by-side comparison engine
│   │   ├── TrafficModel.h / .cpp # Traffic prediction: Historical Average + Linear Regression
│   │   └── DeparturePlanner.h / .cpp # "Best time to leave" day sweep
│   ├── cli/
│   │   └── cli_main.cpp      # Standalone Terminal interactive menu & runner
│   └── gui/
│       ├── gui_main.cpp      # GUI entry point
│       ├── MainWindow.h / .cpp # Two-pane Qt6 window with KPI metrics & controls
│       ├── DepartureChart.h  # Bar chart for "Best Time to Leave" (QPainter)
│       └── MapBridge.h       # C++ to JavaScript WebChannel bridge
├── web/
│   ├── map.html              # Embedded Leaflet OpenStreetMap frontend
│   ├── leaflet.js / .css     # Offline Leaflet 1.9.4 map engine
│   └── qwebchannel.js        # Qt WebChannel JavaScript client
├── Makefile                  # Portable build automation
├── pune_router.pro           # QMake project file for Qt Creator
└── README.md                 # College documentation & Viva guide
```

---

## 🎓 College Viva Voce Q&A Preparation

### Q1: Why did you choose an Adjacency List instead of an Adjacency Matrix?
> **Answer**:  
> In public road networks, graphs are very sparse ($|E| \ll |V|^2$). For our 24 hubs, $|V|^2 = 576$, but there are only 38 road corridors.  
> An adjacency list uses $\mathcal{O}(V + E)$ memory compared to an adjacency matrix's $\mathcal{O}(V^2)$ and allows traversing neighbors of a node in $\mathcal{O}(\text{degree}(u))$ rather than checking all $V$ entries.

### Q2: Why does A* explore fewer nodes than Dijkstra?
> **Answer**:  
> Dijkstra expands outward uniformly in all directions (like a circle) because it only knows the cost from the origin $g(n)$.  
> A* uses an evaluation function $f(n) = g(n) + h(n)$, where $h(n)$ is the Haversine distance to the destination. This heuristic guides the search beam towards the destination, pruning nodes that lead away from the target.

### Q3: What makes a heuristic "admissible" in A*?
> **Answer**:  
> A heuristic is admissible if it never overestimates the actual cost to reach the goal ($h(n) \le h^*(n)$). Because a straight-line great-circle distance is the shortest possible path between two points on Earth, the actual road distance can never be shorter than the Haversine distance. Therefore, our Haversine heuristic is mathematically guaranteed to be admissible and yields the optimal shortest path.

### Q4: When would you use Bellman-Ford over Dijkstra?
> **Answer**:  
> Dijkstra assumes all edge weights are non-negative ($w(u,v) \ge 0$). If a network contains negative edge weights (such as financial credits or fuel-regeneration sections), Dijkstra can fail. Bellman-Ford handles negative weights and can detect negative weight cycles. However, its time complexity is $\mathcal{O}(V \cdot E)$, making it slower than Dijkstra's $\mathcal{O}((V + E) \log V)$.

### Q5: How does your implementation detect negative cycles in Bellman-Ford?
> **Answer**:  
> In any graph without negative cycles, the shortest path between any two vertices contains at most $|V| - 1$ edges. Thus, all shortest paths are finalized after $|V| - 1$ relaxation rounds.  
> We run one extra pass (the $|V|$-th round). If any edge can still be relaxed (`dist[u] + w < dist[v]`), it proves that a cycle with negative total weight exists.

---

### Q6: How does the traffic prediction change the shortest-path algorithms?
**Answer**: It doesn't change the algorithms at all, only the edge weights. We predict a congestion factor for each road at the departure time, multiply it by the free-flow time, and run the same Dijkstra / A* / Bellman-Ford on those minutes instead of kilometres.

### Q7: Is A* still admissible with traffic?
**Answer**: Yes. In time mode, $h(n) = \text{Haversine}(n, \text{target}) / v_{max}$, where $v_{max}$ is the fastest free-flow speed on the network. Factors are clamped to $\ge 1.0$, so no road can be faster than free-flow, and $h(n)$ never over-estimates.

---

## 👥 Authors & Academic Attribution
- **Course**: Data Structures & Algorithms / Design & Analysis of Algorithms
- **Institution**: Pune University (SPPU) / Engineering College Project
- **Data Agency**: Pune Mahanagar Parivahan Mahamandal Ltd (PMPML) GTFS Dataset
