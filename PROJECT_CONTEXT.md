# 📋 Project Context: Pune Bus Transit Route Optimizer

> **Document Type:** Project Requirements, Philosophy & Course Alignment Context  
> **Target Course:** Data Structures & Algorithms (DSA) / Design & Analysis of Algorithms (DAA) / Object-Oriented C++ Programming  
> **Academic Level:** Undergraduate Engineering (B.E. / B.Tech / B.Sc Computer Science & IT)

---

## 🎯 1. Why This Project Exists
This project was specifically designed to meet college project evaluation and viva requirements:
- **Problem Statement:** Public transit route optimization across Pune's road corridors using graph theory algorithms.
- **Core Motivation:** Many modern transit projects are overly complex (involving heavy Node.js runtimes, hundreds of dependencies, or machine learning models that are impossible to explain in a 10-minute viva).
- **Our Goal:** Provide a **clean, understandable, modular C++ implementation** that is easy to explain to professors, compiles in seconds with zero dependency headaches, and features a clean, working visual map interface.

---

## 💡 2. Guiding Principles & Design Constraints

### Principle 1: Keep Code Clean, Transparent & Readable
- Written in **Modern C++17** using standard library structures (`std::vector`, `std::unordered_map`, `std::priority_queue`, `std::pair`).
- No complicated 3rd-party graph libraries (like Boost.Graph). Every algorithm is implemented from scratch in its own clean `.h` and `.cpp` file so students can point to any line of code and explain it.

### Principle 2: Showcase 3 Classic Algorithmic Paradigms
Rather than implementing only one algorithm, this project implements three distinct, classic syllabus algorithms to demonstrate breadth and depth:
1. **Greedy Strategy**: Dijkstra's Algorithm (Priority Queue Min-Heap).
2. **Heuristic / Informed Search**: A* Search (admissible Haversine distance on Earth's sphere).
3. **Dynamic Programming**: Bellman-Ford Algorithm (Edge relaxation passes + Negative Cycle Detection).

### Principle 3: Simple But Working User Interface
- **Desktop GUI**: Built with native Qt6 Widgets and an embedded OpenStreetMap Leaflet view. It shows the real map of Pune, pins for bus stops, and draws the actual road route.
- **Standalone Terminal CLI**: Pure C++ with zero external dependencies (`g++ -std=c++17`) that runs formatted color comparison tables in any terminal, ideal for lab computers where Qt may not be installed.

### Principle 4: Transparent, Accessible Data Format
- All transit data is stored in **plain, human-readable CSV files** (`data/stops.csv`, `data/routes.csv`, `data/shapes.csv`, plus `data/traffic_history.csv` and `data/holidays.csv` for traffic prediction).
- No databases (SQL/Mongo) or large JSON blobs needed.
- Professors can open the CSV in Excel, edit coordinates, or test the student on custom imported graphs.

---

## 👥 3. Team Presentation Roles
When presenting as a group:
- **Member 1 (Graph Modeling & Data Layer):** Explains how Pune's transit network is represented as an adjacency list and how CSV parsing works (`Graph.h`, `Graph.cpp`, `Stop.h`, `Edge.h`).
- **Member 2 (Dijkstra & A* Search):** Explains the Greedy approach, the Min-Heap priority queue, and how the Haversine heuristic prunes the search space (`Dijkstra.cpp`, `AStar.cpp`).
- **Member 3 (Bellman-Ford & Benchmarking):** Explains Dynamic Programming, edge relaxation over $|V|-1$ passes, negative cycle detection, and the side-by-side performance matrix (`BellmanFord.cpp`, `Benchmark.cpp`).
- **Member 4 (Traffic Prediction):** Explains the synthetic traffic data, the Historical Average and Linear Regression (Gradient Descent) models, the train/test accuracy, and how predicted minutes become edge weights (`TrafficModel.cpp`, `DeparturePlanner.cpp`, `tools/generate_traffic_data.py`).

### Principle 5: Prediction Without a Black Box
- Traffic prediction uses models that fit on a whiteboard: a lookup table of averages, and a 9-weight linear regression trained by hand-written gradient descent.
- No ML libraries. Every learned weight has a plain-English meaning.
