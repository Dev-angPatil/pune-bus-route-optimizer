#include "AStar.h"
#include <queue>
#include <chrono>
#include <limits>
#include <algorithm>

RouteResult AStar::findShortestPath(const Graph& graph,
                                    const std::string& source_id,
                                    const std::string& target_id) {
    RouteResult res;
    res.algorithm_name = "A* Search Algorithm";
    res.source_id = source_id;
    res.target_id = target_id;
    res.paradigm = "Informed / Heuristic Search";
    res.time_complexity = "O((V + E) log V) - Pruned via Heuristic";
    res.space_complexity = "O(V)";
    res.notes = "Uses admissible Haversine distance heuristic h(n) towards target GPS coordinates.";

    if (!graph.hasStop(source_id) || !graph.hasStop(target_id)) {
        res.found = false;
        return res;
    }

    if (source_id == target_id) {
        res.found = true;
        res.path_ids = {source_id};
        res.path_stops.push_back(*graph.getStop(source_id));
        return res;
    }

    const Stop* target_stop = graph.getStop(target_id);

    auto start_time = std::chrono::high_resolution_clock::now();

    // Min-heap: pair<f_score, stop_id>
    using Element = std::pair<double, std::string>;
    std::priority_queue<Element, std::vector<Element>, std::greater<Element>> open_set;

    std::unordered_map<std::string, double> g_score;
    std::unordered_map<std::string, double> f_score;
    std::unordered_map<std::string, std::string> previous;
    std::unordered_map<std::string, bool> closed_set;

    for (const auto& id : graph.getAllStopIds()) {
        g_score[id] = std::numeric_limits<double>::infinity();
        f_score[id] = std::numeric_limits<double>::infinity();
        closed_set[id] = false;
    }

    g_score[source_id] = 0.0;
    const Stop* source_stop = graph.getStop(source_id);
    double h_start = Graph::haversineDistance(source_stop->lat, source_stop->lon,
                                              target_stop->lat, target_stop->lon);
    f_score[source_id] = h_start;
    open_set.push({h_start, source_id});

    int nodes_explored = 0;
    int edge_relaxations = 0;
    bool target_reached = false;

    while (!open_set.empty()) {
        auto [current_f, u] = open_set.top();
        open_set.pop();

        if (closed_set[u]) continue;
        closed_set[u] = true;
        nodes_explored++;

        if (u == target_id) {
            target_reached = true;
            break;
        }

        for (const auto& edge : graph.getOutgoingEdges(u)) {
            const std::string& v = edge.target_id;
            if (closed_set[v]) continue;

            double tentative_g = g_score[u] + edge.distance_km;

            if (tentative_g < g_score[v]) {
                previous[v] = u;
                g_score[v] = tentative_g;
                const Stop* v_stop = graph.getStop(v);
                double h = Graph::haversineDistance(v_stop->lat, v_stop->lon,
                                                    target_stop->lat, target_stop->lon);
                f_score[v] = tentative_g + h;
                open_set.push({f_score[v], v});
                edge_relaxations++;
            }
        }
    }

    auto end_time = std::chrono::high_resolution_clock::now();
    res.execution_time_us = std::chrono::duration_cast<std::chrono::microseconds>(end_time - start_time).count();
    res.nodes_explored = nodes_explored;
    res.edge_relaxations = edge_relaxations;

    if (!target_reached && g_score[target_id] == std::numeric_limits<double>::infinity()) {
        res.found = false;
        return res;
    }

    // Reconstruct path
    std::vector<std::string> path;
    std::string curr = target_id;
    while (!curr.empty()) {
        path.push_back(curr);
        if (curr == source_id) break;
        auto it = previous.find(curr);
        if (it != previous.end()) {
            curr = it->second;
        } else {
            break;
        }
    }
    std::reverse(path.begin(), path.end());

    if (path.empty() || path.front() != source_id) {
        res.found = false;
        return res;
    }

    res.found = true;
    res.path_ids = path;
    for (const auto& id : path) {
        res.path_stops.push_back(*graph.getStop(id));
    }

    double total_dist = 0.0;
    double total_time = 0.0;
    for (size_t i = 0; i < path.size() - 1; ++i) {
        const Edge* e = graph.findEdge(path[i], path[i+1]);
        if (e) {
            total_dist += e->distance_km;
            total_time += e->base_time_mins;
        }
    }
    res.total_distance_km = total_dist;
    res.total_time_mins = total_time;
    res.full_polyline = graph.reconstructPolyline(path);

    return res;
}
