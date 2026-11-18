#include "../core/Graph.h"
#include "../core/Dijkstra.h"
#include "../core/AStar.h"
#include "../core/BellmanFord.h"
#include "../core/Benchmark.h"
#include "../core/TrafficModel.h"
#include "../core/DeparturePlanner.h"
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
    if (res.optimized_for_time) {
        std::cout << " * Free-flow Time    : " << res.free_flow_time_mins << " mins  (traffic delay: "
                  << Color::RED << "+" << (res.total_time_mins - res.free_flow_time_mins) << " mins" << Color::RESET << ")\n";
        std::cout << " * Optimized For     : " << Color::BOLD << "Fastest travel time (with predicted traffic)" << Color::RESET << "\n";
    } else {
        std::cout << " * Optimized For     : " << Color::BOLD << "Shortest distance" << Color::RESET << "\n";
    }
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

// ===================== Traffic prediction helpers =========================

const char* WEEKDAY_NAMES[] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};

TrafficMode parseMode(const std::string& text) {
    if (text == "avg" || text == "average") return TrafficMode::HistoricalAverage;
    if (text == "off" || text == "none") return TrafficMode::Off;
    return TrafficMode::LinearRegression;
}

void printTrafficContext(const TrafficModel& model, TrafficMode mode, const DateTime& when) {
    std::cout << "\n" << Color::BOLD << " Departure : " << Color::RESET << when.toString()
              << " (" << WEEKDAY_NAMES[when.dayOfWeek()] << ", " << model.dayType(when);
    std::string holiday = model.holidayName(when);
    if (!holiday.empty()) std::cout << ": " << holiday;
    std::cout << ")\n";
    std::cout << Color::BOLD << " Model     : " << Color::RESET << trafficModeName(mode) << "\n";
    std::cout << Color::BOLD << " Predicted congestion factor (1.00 = empty road):\n" << Color::RESET;
    for (const char* road : {"it_corridor", "city_center", "arterial", "highway"}) {
        std::cout << "   " << std::left << std::setw(14) << road << std::fixed << std::setprecision(2)
                  << model.predict(mode, road, when) << "x\n";
    }
}

void printModelInfo(const TrafficModel& model) {
    std::cout << "\n" << Color::BOLD << Color::MAGENTA
              << "======================================================================\n"
              << "        TRAFFIC PREDICTION MODEL (trained on data/traffic_history.csv)\n"
              << "======================================================================\n" << Color::RESET;
    std::cout << " Training rows: " << model.trainRows() << "   Test rows: " << model.testRows()
              << "   (80/20 split)\n\n";

    std::cout << Color::BOLD << " Linear Regression weights (learned by Gradient Descent):\n" << Color::RESET;
    std::cout << "   congestion_factor = sum of (weight x feature), each feature is 0 or 1\n\n";
    const auto& names = TrafficModel::featureNames();
    const auto& w = model.weights();
    for (size_t i = 0; i < names.size() && i < w.size(); ++i) {
        std::cout << "   " << std::left << std::setw(34) << names[i]
                  << (w[i] >= 0 ? Color::GREEN + "+" : Color::RED) << std::fixed << std::setprecision(3)
                  << w[i] << Color::RESET << "\n";
    }

    std::cout << "\n" << Color::BOLD << " Accuracy on unseen test data (Mean Absolute Error, lower is better):\n" << Color::RESET;
    std::cout << "   No traffic (always 1.0)  : " << model.maeNoTraffic() << "\n";
    std::cout << "   Historical Average       : " << model.maeAverage() << "\n";
    std::cout << "   Linear Regression        : " << model.maeRegression()
              << "   (R^2 = " << model.r2Regression() << ")\n";
    std::cout << "======================================================================\n";
}

void printBestDeparture(Graph& graph, const TrafficModel& model, TrafficMode mode,
                        const std::string& src, const std::string& tgt, const DateTime& day) {
    if (mode == TrafficMode::Off) mode = TrafficMode::LinearRegression;  // a sweep needs traffic
    auto slots = DeparturePlanner::sweepDay(graph, model, mode, src, tgt, day);
    int best = DeparturePlanner::bestSlot(slots);
    if (best < 0) {
        std::cout << Color::RED << " [X] No route found between these stops.\n" << Color::RESET;
        return;
    }

    double worst = 0;
    for (const auto& s : slots) worst = std::max(worst, s.travel_time_mins);

    std::cout << "\n" << Color::BOLD << Color::MAGENTA
              << "======================================================================\n"
              << "   BEST TIME TO LEAVE  |  " << day.dateString() << " ("
              << WEEKDAY_NAMES[day.dayOfWeek()] << ", " << model.dayType(day) << ")  |  " << trafficModeName(mode) << "\n"
              << "======================================================================\n" << Color::RESET;
    for (size_t i = 0; i < slots.size(); ++i) {
        const auto& s = slots[i];
        int bar = static_cast<int>(40.0 * s.travel_time_mins / worst);
        char time_buf[8];
        std::snprintf(time_buf, sizeof(time_buf), "%02d:%02d", s.departure.hour, s.departure.minute);
        bool is_best = static_cast<int>(i) == best;
        std::cout << " " << time_buf << "  " << (is_best ? Color::GREEN : Color::YELLOW)
                  << std::string(bar, '#') << Color::RESET << " " << std::fixed << std::setprecision(1)
                  << s.travel_time_mins << " min" << (is_best ? Color::GREEN + "  <-- best" + Color::RESET : "") << "\n";
    }
    const auto& b = slots[best];
    std::cout << "----------------------------------------------------------------------\n";
    std::cout << Color::GREEN << Color::BOLD << " Leave at " << b.departure.toString().substr(11)
              << " -> about " << std::setprecision(0) << b.travel_time_mins << " mins"
              << " (worst slot: " << worst << " mins)\n" << Color::RESET;
    graph.applyTraffic(model, TrafficMode::Off, day);  // restore free-flow weights
}

bool askDateTime(DateTime& out) {
    std::cout << "Enter departure date & time (YYYY-MM-DD HH:MM): ";
    std::string date, time;
    if (!(std::cin >> date >> time)) return false;
    if (!DateTime::parse(date + " " + time, out)) {
        std::cout << Color::RED << "Invalid date/time format.\n" << Color::RESET;
        return false;
    }
    return true;
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
    std::string shapes_path = "data/shapes.csv";

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
    std::string cli_from, cli_to, cli_algo, cli_at, cli_model = "lr";
    std::string history_path = "data/traffic_history.csv";
    std::string holidays_path = "data/holidays.csv";
    bool cli_compare = false, cli_best = false, cli_model_info = false;
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--from" && i + 1 < argc) cli_from = argv[++i];
        if (arg == "--to" && i + 1 < argc) cli_to = argv[++i];
        if (arg == "--algo" && i + 1 < argc) cli_algo = argv[++i];
        if (arg == "--compare") cli_compare = true;
        if (arg == "--at" && i + 1 < argc) cli_at = argv[++i];
        if (arg == "--model" && i + 1 < argc) cli_model = argv[++i];
        if (arg == "--best-departure") cli_best = true;
        if (arg == "--model-info") cli_model_info = true;
        if (arg == "--history" && i + 1 < argc) history_path = argv[++i];
        if (arg == "--holidays" && i + 1 < argc) holidays_path = argv[++i];
    }

    // Train the traffic prediction models (takes a fraction of a second)
    TrafficModel traffic;
    if (traffic.load(history_path, holidays_path)) {
        std::cout << Color::GREEN << "[+] Traffic model trained on " << traffic.trainRows()
                  << " historical observations.\n" << Color::RESET;
    } else {
        std::cout << Color::YELLOW << "[!] Traffic history not found (" << history_path
                  << "): traffic prediction disabled.\n" << Color::RESET;
    }
    TrafficMode mode = parseMode(cli_model);

    if (cli_model_info) {
        printModelInfo(traffic);
        return 0;
    }

    if (!cli_from.empty() && !cli_to.empty()) {
        DateTime when;
        bool use_traffic = !cli_at.empty() && mode != TrafficMode::Off;
        if (!cli_at.empty() && !DateTime::parse(cli_at, when)) {
            std::cerr << Color::RED << "Invalid --at value. Use \"YYYY-MM-DD HH:MM\".\n" << Color::RESET;
            return 1;
        }

        if (cli_best) {
            if (cli_at.empty()) {
                std::cerr << Color::RED << "--best-departure needs --at \"YYYY-MM-DD\".\n" << Color::RESET;
                return 1;
            }
            printBestDeparture(graph, traffic, mode, cli_from, cli_to, when);
            return 0;
        }

        if (use_traffic) {
            graph.applyTraffic(traffic, mode, when);
            printTrafficContext(traffic, mode, when);
        }

        if (cli_compare) {
            auto comp = Benchmark::compareAll(graph, cli_from, cli_to, use_traffic);
            printBenchmark(comp);
            return 0;
        } else if (cli_algo == "astar") {
            printResult(AStar::findShortestPath(graph, cli_from, cli_to, use_traffic));
            return 0;
        } else if (cli_algo == "bellman") {
            printResult(BellmanFord::findShortestPath(graph, cli_from, cli_to, use_traffic));
            return 0;
        } else {
            printResult(Dijkstra::findShortestPath(graph, cli_from, cli_to, use_traffic));
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
        std::cout << "  7. Fastest Route at a Date & Time (Traffic Prediction)\n";
        std::cout << "  8. Best Time to Leave (sweep the whole day)\n";
        std::cout << "  9. Show Trained Traffic Model (weights & accuracy)\n";
        std::cout << "  0. Exit\n";
        std::cout << Color::CYAN << "Choose an option [0-9]: " << Color::RESET;

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
            case 7: {
                std::string src = selectStop(graph, "Select Source Stop");
                std::string tgt = selectStop(graph, "Select Destination Stop");
                DateTime when;
                if (!askDateTime(when)) break;
                TrafficMode m = (mode == TrafficMode::Off) ? TrafficMode::LinearRegression : mode;
                graph.applyTraffic(traffic, m, when);
                printTrafficContext(traffic, m, when);
                printBenchmark(Benchmark::compareAll(graph, src, tgt, true));
                graph.applyTraffic(traffic, TrafficMode::Off, when);  // back to free-flow
                break;
            }
            case 8: {
                std::string src = selectStop(graph, "Select Source Stop");
                std::string tgt = selectStop(graph, "Select Destination Stop");
                DateTime when;
                if (!askDateTime(when)) break;
                printBestDeparture(graph, traffic, mode, src, tgt, when);
                break;
            }
            case 9:
                printModelInfo(traffic);
                break;
            default:
                std::cout << Color::RED << "Invalid option! Please enter 0-9.\n" << Color::RESET;
                break;
        }
    }

    return 0;
}
