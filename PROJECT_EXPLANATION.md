# 🎓 Pune Transit Route Optimizer: Project Presentation & Explanation Guide

> **Purpose:** Use this comprehensive cheat-sheet to explain your project to professors, external examiners, and evaluators during presentations and Viva Voce examinations.

---

## ⚡ 1. The 30-Second Elevator Pitch
*(Say this when the examiner asks: "What is your project about?")*

> *"Respected Sir/Madam, our project is a **Graph-Theoretic Public Transit Route Optimization System** developed in **Modern C++**. It solves the shortest path problem across Pune’s major public bus corridors (PMPML).  
> Instead of just one algorithm, we implemented and benchmarked **three distinct algorithmic paradigms**:
> 1. **Dijkstra's Algorithm** (Greedy Strategy)
> 2. **A\* Search** (Informed Heuristic Search using geographic Haversine distance)
> 3. **Bellman-Ford Algorithm** (Dynamic Programming with Negative Cycle Detection)  
> We have built a working **Desktop GUI** with an interactive **Real OpenStreetMap** of Pune, as well as a standalone **Terminal CLI** with side-by-side benchmarking."*

---

## 🖥️ 2. Step-by-Step Live Demo Script
*(Follow these exact steps when demonstrating the project on your laptop)*

### Step 1: Launch the GUI
```bash
./run_gui.sh
```
- **Show on screen**: The two-pane window opens.
  - Left pane: Origin dropdown, Destination dropdown, Algorithm selector, and KPI metric cards.
  - Right pane: Real OpenStreetMap of Pune rendered with bus stop markers and connecting road lines.

### Step 2: Run a Standard Route
1. Set **Origin Stop**: `Swargate Multi-Modal Hub`
2. Set **Destination Stop**: `Hinjewadi Phase 3 (Maan)`
3. Select Algorithm: `🟢 Dijkstra's Algorithm (Greedy)`
4. Click **`🚀 Find Optimal Route`**.
- **What to point out**:
  - Distance: **26.40 km**
  - Travel Time: **93.0 mins**
  - Execution Time: **~70 µs (microseconds)**
  - Nodes Explored: **24 nodes**
  - The map zooms and highlights the exact road route in emerald green.

### Step 3: Run the Heuristic Search (A*)
1. Switch Algorithm to: `🔵 A* Search Algorithm (Haversine Heuristic)`
2. Click **`🚀 Find Optimal Route`**.
- **What to point out**:
  - Distance remains identical (**26.40 km**), proving correctness.
  - Nodes Explored drops from 24 down to **16 nodes**!
  - **Explain to examiner**: *"Because A\* uses the Haversine great-circle distance as an admissible heuristic, it prioritizes nodes pointing toward Hinjewadi, exploring 33% fewer nodes."*

### Step 4: Run the Benchmark ("Compare All 3")
1. Switch Algorithm to: `⚡ Compare All 3 (Side-by-Side Benchmark)`
2. Click **`🚀 Find Optimal Route`**.
- **What to point out**:
  - A side-by-side comparison table appears displaying:
    - Distance: All 3 find the identical **26.40 km**.
    - Search Space: A\* explores **16 nodes** vs Dijkstra's **24** vs Bellman-Ford's **192**.
    - Complexity: Dijkstra & A\* run in $\mathcal{O}((V+E)\log V)$, whereas Bellman-Ford takes $\mathcal{O}(V \cdot E)$.

### Step 5: Demo Terminal Mode (CLI)
```bash
./run_cli.sh --from swargate --to hinjewadi_ph3 --compare
```
- **What to point out**: *"For evaluation in headless environments or computers without Qt, our project compiles directly with standard `g++ -std=c++17` with zero external dependencies."*

### Step 6: Traffic Prediction (the route changes with time)
1. Origin `Kothrud Depot`, Destination `Swargate`, Traffic Model `🤖 Linear Regression (ML)`.
2. Departure **Wednesday 2:00 PM** → Find Route: goes **Kothrud → Deccan → Swargate**, 7.7 km, **~41 min**.
3. Change departure to **Wednesday 9:00 AM** → Find Route: switches to the **Chandani Chowk → Warje → Sinhagad Road** bypass, 13.8 km, **~57 min**.
- **What to point out**: *"At rush hour the city-centre roads are predicted to be 2× slower, so the fastest route is now a longer road that avoids the city."* The map colours the roads green / yellow / red.
4. Click **`📈 Best Time to Leave`**: a bar chart shows the predicted travel time for every 30-minute slot. The green bar is the best departure.
5. CLI version: `./run_cli.sh --model-info` prints the learned weights and accuracy.

---

## 🧠 3. The 3 Algorithms Explained (Student Friendly)

### 1. Dijkstra's Algorithm (Greedy Paradigm)
- **Concept:** Finds the shortest path from a starting vertex to all other vertices in a non-negative weighted graph.
- **How it works:**
  1. Sets distance to start node as `0`, all other nodes as $\infty$.
  2. Uses a **Min-Heap (`std::priority_queue`)** to always pick the unvisited node with the smallest tentative distance.
  3. Relaxes all outgoing edges from this node (`if dist[u] + weight < dist[v]`, update `dist[v]`).
  4. Marks the node as visited so it is never re-processed.
- **Time Complexity:** $\mathcal{O}((V + E) \log V)$ using a binary min-heap.
- **Space Complexity:** $\mathcal{O}(V)$ for distances, visited set, and previous pointers.
- **Limitation:** Cannot handle negative edge weights.

---

### 2. A* Search Algorithm (Heuristic Paradigm)
- **Concept:** An informed search algorithm that uses domain knowledge (GPS coordinates) to direct the search toward the destination.
- **Evaluation Function:**
  $$f(n) = g(n) + h(n)$$
  - $g(n)$: Exact distance from origin to current node $n$.
  - $h(n)$: Estimated distance from node $n$ to the goal.
- **Our Heuristic:** The **Haversine Formula**, which computes the great-circle spherical distance between two GPS coordinates $(lat_1, lon_1)$ and $(lat_2, lon_2)$.
- **Why it is Admissible:** On Earth's sphere, the straight-line spherical distance is the shortest possible physical path. Actual road distance can never be shorter than $h(n)$. Because $h(n) \le \text{TrueCost}(n, \text{goal})$, A* is mathematically guaranteed to find the optimal path while exploring fewer nodes than Dijkstra.
- **Time Complexity:** $\mathcal{O}((V + E) \log V)$, with significantly fewer iterations in practice.

---

### 3. Bellman-Ford Algorithm (Dynamic Programming Paradigm)
- **Concept:** A bottom-up dynamic programming approach that solves the single-source shortest path problem by repeatedly relaxing all edges.
- **How it works:**
  1. Sets `dist[source] = 0`, all others to $\infty$.
  2. In any graph with $|V|$ vertices and no negative cycles, the shortest simple path contains at most $|V| - 1$ edges.
  3. Loops $|V| - 1$ times. In each pass, relaxes **every edge $(u, v) \in \mathcal{E}$**.
  4. **Early Exit Optimization:** If an entire pass produces 0 updates, the algorithm terminates early.
  5. **Negative Cycle Check:** Runs one final $|V|$-th pass. If any edge can still be relaxed, a negative weight cycle exists.
- **Time Complexity:** $\mathcal{O}(V \cdot E)$.
- **Space Complexity:** $\mathcal{O}(V)$.
- **Why it matters:** Works with negative edge weights and detects negative cycles where Dijkstra fails.

---

### 4. Traffic Prediction Model (Simple Machine Learning)
- **Goal:** Predict the *congestion factor* of a road = actual time ÷ free-flow time (1.0 = empty road).
- **Data:** `data/traffic_history.csv`, 14,400 rows of `date, hour, road_type, factor`. It is **synthetic** (generated by `tools/generate_traffic_data.py`) because real Pune data is not public. Say this honestly in the viva.
- **Train/test split:** every 5th row is kept aside (80% train / 20% test) to measure accuracy on unseen data.
- **Model A: Historical Average.** Group past rows by (road type, weekday/weekend/holiday, hour) and take the mean. Basically a lookup table.
- **Model B: Linear Regression.** `factor = w0·1 + w1·x1 + … + w8·x8`, where each `x` is a yes/no (0/1) feature such as "weekday morning rush" or "rush hour AND IT corridor".
  - **Training = Gradient Descent:** start with all `w = 0`; for 1000 rounds, compute `error = prediction − actual` for every row, then nudge each weight: `w_j -= 0.5 × average(error × x_j)`.
  - Because the features are 0/1, each weight reads directly as "this condition adds +0.44 to the factor".
- **Results (test set MAE):** no-traffic 0.328, Historical Average **0.083**, Linear Regression 0.117 (R² = 0.79).
  - The average is more accurate here because it sees every hour separately. The regression is smaller (9 numbers instead of a table), explains itself through its weights, and captures **monsoon**, which the lookup table ignores.
- **Clamp:** predictions are clamped to [1.0, 4.0], so traffic can only slow a road down.
- **Using it for routing:** `edge weight = base_time_mins × predicted_factor`, then run the normal algorithms on minutes. Nothing inside Dijkstra changes.
- **Best time to leave:** a simple loop. For each 30-minute slot: predict traffic → run Dijkstra → record the time. Pick the minimum.

---

## 🏗️ 4. Data Structures Used

| Data Structure | C++ Standard Library Type | Where Used | Why Selected |
| :--- | :--- | :--- | :--- |
| **Adjacency List** | `std::unordered_map<std::string, std::vector<Edge>>` | `Graph.h` | $\mathcal{O}(1)$ average vertex lookup, $\mathcal{O}(\text{degree}(u))$ neighbor traversal. Optimal for sparse road graphs. |
| **Min-Heap** | `std::priority_queue<Element, vector<Element>, greater<Element>>` | `Dijkstra.cpp`, `AStar.cpp` | $\mathcal{O}(\log V)$ extraction of minimum distance/f-score element. |
| **Distance Map** | `std::unordered_map<std::string, double>` | All algorithms | $\mathcal{O}(1)$ average read and write for vertex distances. |
| **Parent/Path Map** | `std::unordered_map<std::string, std::string>` | All algorithms | Reconstructs the exact path from destination back to origin. |

---

## ❓ 5. Top 18 Viva Voce Questions & Model Answers

#### Q1: Why did you choose an Adjacency List over an Adjacency Matrix?
> **Answer:**  
> *"Sir, road transit graphs are sparse graphs where $|E| \ll |V|^2$. For our 24 hubs, an adjacency matrix would allocate $24 \times 24 = 576$ entries ($\mathcal{O}(V^2)$ memory), with mostly zeroes. An adjacency list uses only $\mathcal{O}(V + E)$ memory and allows us to iterate directly over connected neighbors in $\mathcal{O}(\text{deg}(u))$ time without checking all vertices."*

#### Q2: What is the main difference between Dijkstra and A*?
> **Answer:**  
> *"Dijkstra is blind/unguided—it expands equally in all directions based only on distance from start $g(n)$. A\* is an informed search that adds a heuristic $h(n)$ estimating the remaining distance to the goal. This prioritizes exploration towards the goal and reduces the number of explored nodes."*

#### Q3: What makes your heuristic in A* admissible? What happens if it is not admissible?
> **Answer:**  
> *"A heuristic is admissible if it never overestimates the actual cost to reach the goal ($h(n) \le h^*(n)$). We used the Haversine formula (spherical straight-line distance between GPS coordinates). Since roads cannot be shorter than a straight line, our heuristic is guaranteed to be admissible. If a heuristic is not admissible, A\* is not guaranteed to find the optimal shortest path."*

#### Q4: Why is Bellman-Ford slower than Dijkstra?
> **Answer:**  
> *"Dijkstra greedily finalizes the shortest distance to one vertex per iteration using a Min-Heap in $\mathcal{O}((V + E) \log V)$. Bellman-Ford does not use a greedy choice; it blindly relaxes all $|E|$ edges $|V| - 1$ times in $\mathcal{O}(V \cdot E)$, making it computationally heavier but more versatile."*

#### Q5: Can Dijkstra handle negative weights? Why?
> **Answer:**  
> *"No, sir. Dijkstra assumes that once a vertex is extracted from the priority queue and marked visited, its shortest distance is finalized. A negative edge weight later in the graph violates this assumption because a path through that negative edge could yield a smaller total distance."*

#### Q6: How does Bellman-Ford detect negative weight cycles?
> **Answer:**  
> *"In a graph with $V$ vertices without negative cycles, any shortest path contains at most $V - 1$ edges. Thus, all distances must converge after $V - 1$ passes. If we run one extra pass (the $V$-th pass) and any distance decreases (`dist[u] + w < dist[v]`), it mathematically proves that a negative cycle exists."*

#### Q7: How did you measure execution time?
> **Answer:**  
> *"We used `std::chrono::high_resolution_clock` from the standard C++ `<chrono>` header. We record the timestamp immediately before the algorithm loop begins and immediately after target arrival, calculating the duration in microseconds ($\mu s$)."*

#### Q8: How does the C++ GUI interact with the real map?
> **Answer:**  
> *"We use Qt6 WebEngine with an embedded Leaflet OpenStreetMap. When the user selects stops and clicks 'Find Route' in Qt, the C++ code computes the route, serializes the path coordinates into a JSON string, and calls `m_webView->page()->runJavaScript(\"displayRoute(...)\")` which draws the glowing road polyline on the Leaflet map."*

#### Q9: What happens if the origin and destination are not connected?
> **Answer:**  
> *"The distance to the destination remains infinity (`std::numeric_limits<double>::infinity()`). The function detects that the target was never reached, sets `res.found = false`, and the UI displays an alert stating that no valid path connects the stops."*

#### Q10: How does your project support custom map data?
> **Answer:**  
> *"The transit data is decoupled into plain CSV files (`stops.csv`, `routes.csv`, and `shapes.csv`). Through the 'Import Map (CSV)' button in the GUI or command-line flags in the CLI, any user can load their own custom stops and road networks without modifying or recompiling the code."*

#### Q11: What is the space complexity of each algorithm?
> **Answer:**  
> *"All three algorithms have a space complexity of $\mathcal{O}(V)$ because they store distance arrays, previous pointers, and visited/open sets proportional to the number of vertices."*

#### Q12: What C++ version and standard features did you use?
> **Answer:**  
> *"We used Modern C++17. Key features include structured binding (`auto [dist, u] = pq.top()`), standard template library containers (`unordered_map`, `vector`, `priority_queue`), `<chrono>` for microsecond precision timing, and RAII file stream management (`std::ifstream`)."*

#### Q13: How does your traffic prediction model work?
> **Answer:**  
> *"It is a linear regression with 9 yes/no features such as weekday morning rush, IT corridor during rush, and monsoon month. We train it from scratch in C++ using batch gradient descent on mean squared error. We also have a simpler Historical Average model, which is just the mean factor per road type, day type and hour. Both learn from a CSV of past observations."*

#### Q14: Is your traffic data real?
> **Answer:**  
> *"No, it is synthetic. Real hourly Pune traffic data isn't freely available, so we generated it with a script based on known patterns (rush hours, IT corridors, monsoon, holidays) plus random noise. The pipeline is the point: replace the CSV with real data in the same format and both models retrain automatically."*

#### Q15: How do you know the model is any good?
> **Answer:**  
> *"We hold out 20% of the data as a test set the model never trains on and measure Mean Absolute Error. Predicting no traffic gives an error of 0.33; regression gives 0.12 (R² 0.79) and the historical average gives 0.08."*

#### Q16: Does traffic break Dijkstra or A*?
> **Answer:**  
> *"No. Only the edge weights change, from km to predicted minutes, and they stay positive, so Dijkstra is still correct. For A* we convert the straight-line distance into minutes at the fastest free-flow speed on the network. Since every factor is at least 1.0, no route can beat that, so the heuristic is still admissible."*

#### Q17: Why does the route change at 9 AM?
> **Answer:**  
> *"At rush hour the model predicts city-centre roads to be about 2× slower but highways only about 1.3× slower. A longer highway bypass then has a smaller total time, so the algorithm picks it."*

#### Q18: What is a limitation of your traffic approach?
> **Answer:**  
> *"We predict traffic once for the departure time and use it for the whole trip, even if the trip crosses into the next hour. A full time-dependent shortest path would re-evaluate each edge at the time the bus actually reaches it. That would be the next improvement."*
