#include "../core/Graph.h"
#include "../core/Dijkstra.h"
#include "../core/AStar.h"
#include "../core/BellmanFord.h"
#include "../core/Benchmark.h"
#include <iostream>
#include <iomanip>
#include <string>
#include <vector>

namespace Color {
    const std::string RESET   = "\033[0m";
    const std::string BOLD    = "\033[1m";
    const std::string RED     = "\033[31m";
    const std::string GREEN   = "\033[32m";
    const std::string YELLOW  = "\033[33m";
    const std::string BLUE    = "\033[34m";
    const std::string MAGENTA = "\033[35m";
    const std::string CYAN    = "\033[36m";
    const std::string WHITE   = "\033[37m";
}

void printBanner() {
    std::cout << Color::CYAN << Color::BOLD;
    std::cout << "======================================================================\n";
    std::cout << "     PMPML PUNE BUS ROUTE OPTIMIZER (C++ College Project Edition)     \n";
    std::cout << "     Algorithms: Dijkstra (Greedy) | A* (Heuristic) | Bellman-Ford    \n";
    std::cout << "======================================================================\n" << Color::RESET;
}

void printStopsTable(const Graph& graph) {
    const auto& stops = graph.getAllStops();
    std::cout << "\n" << Color::BOLD << "Available Transit Hubs (" << stops.size() << " stops):\n" << Color::RESET;
    std::cout << std::string(75, '-') << "\n";
    std::cout << std::left << std::setw(6)  << "No."
              << std::setw(20) << "Stop ID"
              << std::setw(32) << "Stop Name"
              << std::setw(16) << "Category" << "\n";
    std::cout << std::string(75, '-') << "\n";

    for (size_t i = 0; i < stops.size(); ++i) {
        std::cout << std::left << std::setw(6)  << (i + 1)
                  << std::setw(20) << stops[i].id
                  << std::setw(32) << stops[i].name
                  << std::setw(16) << stops[i].category << "\n";
    }
    std::cout << std::string(75, '-') << "\n";
}

void printResult(const RouteResult& res) {
    std::cout << "\n" << Color::BOLD << Color::GREEN;
    std::cout << "----------------------------------------------------------------------\n";
    std::cout << " ROUTE RESULT: " << res.algorithm_name << " (" << res.paradigm << ")\n";
    std::cout << "----------------------------------------------------------------------\n" << Color::RESET;

    if (!res.found) {
        std::cout << Color::RED << " [X] No valid route could be found between endpoints.\n" << Color::RESET;
        return;
    }

    std::cout << Color::BOLD << " Path: " << Color::RESET;
    for (size_t i = 0; i < res.path_stops.size(); ++i) {
        std::cout << Color::YELLOW << res.path_stops[i].name << Color::RESET;
        if (i + 1 < res.path_stops.size()) {
            std::cout << "  ->  ";
        }
    }
    std::cout << "\n\n";

    std::cout << std::fixed << std::setprecision(2);
    std::cout << " * Total Distance    : " << Color::BOLD << res.total_distance_km << " km" << Color::RESET << "\n";
    std::cout << " * Est. Travel Time  : " << Color::BOLD << res.total_time_mins << " mins" << Color::RESET << "\n";
    std::cout << " * Execution Time    : " << Color::CYAN << Color::BOLD << res.execution_time_us << " microseconds (us)" << Color::RESET << "\n";
    std::cout << " * Nodes Explored    : " << Color::BOLD << res.nodes_explored << Color::RESET << "\n";
    std::cout << " * Edge Relaxations  : " << Color::BOLD << res.edge_relaxations << Color::RESET << "\n";
    std::cout << " * Time Complexity   : " << Color::MAGENTA << res.time_complexity << Color::RESET << "\n";
    std::cout << " * Space Complexity  : " << Color::MAGENTA << res.space_complexity << Color::RESET << "\n";
    std::cout << " * Academic Notes    : " << res.notes << "\n";
    std::cout << "----------------------------------------------------------------------\n";
}

void printBenchmark(const BenchmarkComparison& comp) {
    std::cout << "\n" << Color::BOLD << Color::MAGENTA;
    std::cout << "======================================================================\n";
    std::cout << "       SIDE-BY-SIDE ALGORITHM COMPARISON & BENCHMARK MATRIX          \n";
    std::cout << "       Route: " << comp.source_name << " -> " << comp.target_name << "\n";
    std::cout << "======================================================================\n" << Color::RESET;

    std::cout << std::left
              << std::setw(22) << "Metric / Feature"
              << std::setw(16) << "Dijkstra"
              << std::setw(16) << "A* Search"
              << std::setw(16) << "Bellman-Ford" << "\n";
    std::cout << std::string(70, '-') << "\n";

    std::cout << std::left << std::setw(22) << "Paradigm"
              << std::setw(16) << "Greedy"
              << std::setw(16) << "Heuristic"
              << std::setw(16) << "Dyn. Prog." << "\n";

    std::cout << std::left << std::setw(22) << "Time Complexity"
              << std::setw(16) << "O((V+E)logV)"
              << std::setw(16) << "O((V+E)logV)"
              << std::setw(16) << "O(V * E)" << "\n";

    std::cout << std::fixed << std::setprecision(2);
    std::cout << std::left << std::setw(22) << "Distance (km)"
              << std::setw(16) << comp.dijkstra.total_distance_km
              << std::setw(16) << comp.astar.total_distance_km
              << std::setw(16) << comp.bellman_ford.total_distance_km << "\n";

    std::cout << std::left << std::setw(22) << "Travel Time (min)"
              << std::setw(16) << comp.dijkstra.total_time_mins
              << std::setw(16) << comp.astar.total_time_mins
              << std::setw(16) << comp.bellman_ford.total_time_mins << "\n";

    std::cout << std::left << std::setw(22) << "Nodes Explored"
              << std::setw(16) << comp.dijkstra.nodes_explored
              << std::setw(16) << comp.astar.nodes_explored
              << std::setw(16) << comp.bellman_ford.nodes_explored << "\n";

    std::cout << std::left << std::setw(22) << "Edge Relaxations"
              << std::setw(16) << comp.dijkstra.edge_relaxations
              << std::setw(16) << comp.astar.edge_relaxations
              << std::setw(16) << comp.bellman_ford.edge_relaxations << "\n";

    std::cout << std::left << std::setw(22) << "CPU Time (us)"
              << std::setw(16) << comp.dijkstra.execution_time_us
              << std::setw(16) << comp.astar.execution_time_us
              << std::setw(16) << comp.bellman_ford.execution_time_us << "\n";

    std::cout << std::string(70, '-') << "\n";
    std::cout << Color::CYAN << comp.summary << Color::RESET << "\n";
    std::cout << "======================================================================\n";
}

std::string selectStop(const Graph& graph, const std::string& prompt) {
    const auto& stops = graph.getAllStops();
    while (true) {
        std::cout << prompt << " (enter stop ID or number 1-" << stops.size() << ", or 'list'): ";
        std::string input;
        if (!(std::cin >> input)) return "";

        if (input == "list") {
            printStopsTable(graph);
            continue;
        }

        // Try number
        try {
            int num = std::stoi(input);
            if (num >= 1 && num <= static_cast<int>(stops.size())) {
                return stops[num - 1].id;
            }
        } catch (...) {}

        // Try direct ID match
        if (graph.hasStop(input)) {
            return input;
        }

        std::cout << Color::RED << "Invalid stop. Type 'list' to see all stop IDs.\n" << Color::RESET;
    }
}

int main(int argc, char* argv[]) {
    printBanner();

    std::string stops_path = "data/stops.csv";
    std::string routes_path = "data/routes.csv";
    std::string shapes_path = "data/shapes.json";

    // Allow path overrides from arguments
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--stops" && i + 1 < argc) stops_path = argv[++i];
        if (arg == "--routes" && i + 1 < argc) routes_path = argv[++i];
        if (arg == "--shapes" && i + 1 < argc) shapes_path = argv[++i];
    }

    Graph graph;
    if (!graph.loadFromCSV(stops_path, routes_path, shapes_path)) {
        // Fallback to relative path if run from root
        if (!graph.loadFromCSV("cpp_project/" + stops_path, "cpp_project/" + routes_path, "cpp_project/" + shapes_path)) {
            std::cerr << Color::RED << "Error: Failed to load transit CSV files!\n" << Color::RESET;
            std::cerr << "Looked for: " << stops_path << " and " << routes_path << "\n";
            return 1;
        }
    }

    std::cout << Color::GREEN << "[+] Loaded " << graph.getVertexCount()
              << " transit stops and " << (graph.getEdgeCount() / 2)
              << " road corridors successfully.\n" << Color::RESET;

    // Check for CLI non-interactive mode
    std::string cli_from, cli_to, cli_algo;
    bool cli_compare = false;
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--from" && i + 1 < argc) cli_from = argv[++i];
        if (arg == "--to" && i + 1 < argc) cli_to = argv[++i];
        if (arg == "--algo" && i + 1 < argc) cli_algo = argv[++i];
        if (arg == "--compare") cli_compare = true;
    }

    if (!cli_from.empty() && !cli_to.empty()) {
        if (cli_compare) {
            auto comp = Benchmark::compareAll(graph, cli_from, cli_to);
            printBenchmark(comp);
            return 0;
        } else if (cli_algo == "astar") {
            printResult(AStar::findShortestPath(graph, cli_from, cli_to));
            return 0;
        } else if (cli_algo == "bellman") {
            printResult(BellmanFord::findShortestPath(graph, cli_from, cli_to));
            return 0;
        } else {
            printResult(Dijkstra::findShortestPath(graph, cli_from, cli_to));
            return 0;
        }
    }

    // Interactive Loop
    while (true) {
        std::cout << "\n" << Color::BOLD << "MAIN MENU:\n" << Color::RESET;
        std::cout << "  1. View all Pune Bus Terminals & Stops\n";
        std::cout << "  2. Find Route with Dijkstra's Algorithm (Greedy)\n";
        std::cout << "  3. Find Route with A* Search (Heuristic - Haversine)\n";
        std::cout << "  4. Find Route with Bellman-Ford (Dynamic Programming)\n";
        std::cout << "  5. Compare All 3 Algorithms (Side-by-Side Benchmark)\n";
        std::cout << "  6. Import Custom Map (CSV files)\n";
        std::cout << "  0. Exit\n";
        std::cout << Color::CYAN << "Choose an option [0-6]: " << Color::RESET;

        int choice = -1;
        if (!(std::cin >> choice)) {
            break;
        }

        if (choice == 0) {
            std::cout << "\nExiting Pune Transit Optimizer. Have a great day!\n";
            break;
        }

        switch (choice) {
            case 1:
                printStopsTable(graph);
                break;
            case 2: {
                std::string src = selectStop(graph, "Select Source Stop");
                std::string tgt = selectStop(graph, "Select Destination Stop");
                auto res = Dijkstra::findShortestPath(graph, src, tgt);
                printResult(res);
                break;
            }
            case 3: {
                std::string src = selectStop(graph, "Select Source Stop");
                std::string tgt = selectStop(graph, "Select Destination Stop");
                auto res = AStar::findShortestPath(graph, src, tgt);
                printResult(res);
                break;
            }
            case 4: {
                std::string src = selectStop(graph, "Select Source Stop");
                std::string tgt = selectStop(graph, "Select Destination Stop");
                auto res = BellmanFord::findShortestPath(graph, src, tgt);
                printResult(res);
                break;
            }
            case 5: {
                std::string src = selectStop(graph, "Select Source Stop");
                std::string tgt = selectStop(graph, "Select Destination Stop");
                auto comp = Benchmark::compareAll(graph, src, tgt);
                printBenchmark(comp);
                break;
            }
            case 6: {
                std::cout << "Enter path to new stops CSV: ";
                std::string s_csv, r_csv;
                std::cin >> s_csv;
                std::cout << "Enter path to new routes CSV: ";
                std::cin >> r_csv;
                if (graph.loadFromCSV(s_csv, r_csv)) {
                    std::cout << Color::GREEN << "[+] Custom map imported successfully!\n" << Color::RESET;
                } else {
                    std::cout << Color::RED << "[-] Failed to import custom map.\n" << Color::RESET;
                }
                break;
            }
            default:
                std::cout << Color::RED << "Invalid option! Please enter 0-6.\n" << Color::RESET;
                break;
        }
    }

    return 0;
}
