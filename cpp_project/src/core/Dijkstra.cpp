#include "Dijkstra.h"
#include <queue>
#include <chrono>
#include <limits>
#include <algorithm>

RouteResult Dijkstra::findShortestPath(const Graph& graph,
                                       const std::string& source_id,
                                       const std::string& target_id) {
    RouteResult res;
    res.algorithm_name = "Dijkstra's Algorithm";
    res.source_id = source_id;
    res.target_id = target_id;
    res.paradigm = "Greedy Strategy";
    res.time_complexity = "O((V + E) log V)";
    res.space_complexity = "O(V)";
    res.notes = "Standard Dijkstra using min-heap priority queue. Optimizes physical road distance.";

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

    // Min-heap: pair<distance, stop_id>
    using Element = std::pair<double, std::string>;
    std::priority_queue<Element, std::vector<Element>, std::greater<Element>> pq;

    std::unordered_map<std::string, double> distances;
    std::unordered_map<std::string, std::string> previous;
    std::unordered_map<std::string, bool> visited;

    for (const auto& id : graph.getAllStopIds()) {
        distances[id] = std::numeric_limits<double>::infinity();
        visited[id] = false;
    }

    distances[source_id] = 0.0;
    pq.push({0.0, source_id});

    int nodes_explored = 0;
    int edge_relaxations = 0;
    bool target_reached = false;

    while (!pq.empty()) {
        auto [current_dist, u] = pq.top();
        pq.pop();

        if (visited[u]) continue;
        visited[u] = true;
        nodes_explored++;

        if (u == target_id) {
            target_reached = true;
            break;
        }

        if (current_dist > distances[u]) continue;

        for (const auto& edge : graph.getOutgoingEdges(u)) {
            const std::string& v = edge.target_id;
            double weight = edge.distance_km;

            if (distances[u] + weight < distances[v]) {
                distances[v] = distances[u] + weight;
                previous[v] = u;
                pq.push({distances[v], v});
                edge_relaxations++;
            }
        }
    }

    auto end_time = std::chrono::high_resolution_clock::now();
    res.execution_time_us = std::chrono::duration_cast<std::chrono::microseconds>(end_time - start_time).count();
    res.nodes_explored = nodes_explored;
    res.edge_relaxations = edge_relaxations;

    if (!target_reached && distances[target_id] == std::numeric_limits<double>::infinity()) {
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

    // Accumulate metrics
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
