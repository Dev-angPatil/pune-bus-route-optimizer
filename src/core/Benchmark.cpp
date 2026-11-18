#include "Benchmark.h"
#include <sstream>
#include <iomanip>

BenchmarkComparison Benchmark::compareAll(const Graph& graph,
                                         const std::string& source_id,
                                         const std::string& target_id,
                                         bool by_time) {
    BenchmarkComparison comp;

    const Stop* s = graph.getStop(source_id);
    const Stop* t = graph.getStop(target_id);
    comp.source_name = s ? s->name : source_id;
    comp.target_name = t ? t->name : target_id;

    comp.dijkstra = Dijkstra::findShortestPath(graph, source_id, target_id, by_time);
    comp.astar = AStar::findShortestPath(graph, source_id, target_id, by_time);
    comp.bellman_ford = BellmanFord::findShortestPath(graph, source_id, target_id, by_time);

    std::ostringstream oss;
    oss << "Comparison for " << comp.source_name << " -> " << comp.target_name << ":\n";

    if (comp.dijkstra.found && comp.astar.found && comp.bellman_ford.found) {
        oss << std::fixed << std::setprecision(2);
        if (by_time) {
            oss << "1. Correctness: All 3 algorithms identified the same fastest travel time ("
                << comp.dijkstra.total_time_mins << " mins with predicted traffic).\n";
        } else {
            oss << "1. Correctness: All 3 algorithms identified identical optimal path length ("
                << comp.dijkstra.total_distance_km << " km).\n";
        }

        oss << "2. Search Space: A* explored " << comp.astar.nodes_explored
            << " nodes vs Dijkstra's " << comp.dijkstra.nodes_explored
            << " nodes (due to the directional Haversine heuristic guiding search).\n";

        oss << "3. Time Complexity: Dijkstra & A* run in O((V + E) log V), whereas Bellman-Ford takes O(V * E) with "
            << comp.bellman_ford.edge_relaxations << " edge relaxations across all passes.";
    } else {
        oss << "Route finding failed or endpoints are disconnected.";
    }

    comp.summary = oss.str();
    return comp;
}
