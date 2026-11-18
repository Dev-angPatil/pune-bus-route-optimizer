#include "BellmanFord.h"
#include <chrono>
#include <limits>
#include <algorithm>

RouteResult BellmanFord::findShortestPath(const Graph& graph,
                                         const std::string& source_id,
                                         const std::string& target_id,
                                          bool by_time) {
    RouteResult res;
    res.algorithm_name = "Bellman-Ford Algorithm";
    res.source_id = source_id;
    res.target_id = target_id;
    res.optimized_for_time = by_time;
    res.paradigm = "Dynamic Programming (Edge Relaxation)";
    res.time_complexity = "O(V * E)";
    res.space_complexity = "O(V)";
    res.notes = "Repeatedly relaxes all |E| edges for |V|-1 passes. Detects negative cycles.";
    if (by_time) res.notes += " Optimizes travel time with predicted traffic.";

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

    auto start_time = std::chrono::high_resolution_clock::now();

    const auto& stops = graph.getAllStopIds();
    const auto& edges = graph.getAllEdges();
    size_t V = stops.size();

    std::unordered_map<std::string, double> distances;
    std::unordered_map<std::string, std::string> previous;

    for (const auto& id : stops) {
        distances[id] = std::numeric_limits<double>::infinity();
    }
    distances[source_id] = 0.0;

    int edge_relaxations = 0;
    int passes_completed = 0;

    // Relax all edges |V| - 1 times
    for (size_t i = 1; i < V; ++i) {
        bool any_updated = false;
        passes_completed++;

        for (const auto& edge : edges) {
            const std::string& u = edge.source_id;
            const std::string& v = edge.target_id;
            double w = edge.cost(by_time);

            if (distances[u] != std::numeric_limits<double>::infinity()) {
                if (distances[u] + w < distances[v]) {
                    distances[v] = distances[u] + w;
                    previous[v] = u;
                    any_updated = true;
                    edge_relaxations++;
                }
            }
        }

        // Early stopping optimization: if no distance updated, we have converged
        if (!any_updated) {
            break;
        }
    }

    // Negative cycle detection pass
    bool negative_cycle = false;
    for (const auto& edge : edges) {
        const std::string& u = edge.source_id;
        const std::string& v = edge.target_id;
        double w = edge.cost(by_time);

        if (distances[u] != std::numeric_limits<double>::infinity()) {
            if (distances[u] + w < distances[v]) {
                negative_cycle = true;
                break;
            }
        }
    }

    auto end_time = std::chrono::high_resolution_clock::now();
    res.execution_time_us = std::chrono::duration_cast<std::chrono::microseconds>(end_time - start_time).count();
    res.nodes_explored = passes_completed * static_cast<int>(V);
    res.edge_relaxations = edge_relaxations;

    if (negative_cycle) {
        res.found = false;
        res.notes += " [Warning: Graph contains a negative weight cycle!]";
        return res;
    }

    if (distances[target_id] == std::numeric_limits<double>::infinity()) {
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
            total_time += e->travelTimeMins();
            res.free_flow_time_mins += e->base_time_mins;
        }
    }
    res.total_distance_km = total_dist;
    res.total_time_mins = total_time;
    res.full_polyline = graph.reconstructPolyline(path);

    return res;
}
