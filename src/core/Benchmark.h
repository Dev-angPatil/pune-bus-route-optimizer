#pragma once
#include "Graph.h"
#include "RouteResult.h"
#include "Dijkstra.h"
#include "AStar.h"
#include "BellmanFord.h"
#include <string>

struct BenchmarkComparison {
    std::string source_name;
    std::string target_name;
    RouteResult dijkstra;
    RouteResult astar;
    RouteResult bellman_ford;
    std::string summary;
};

class Benchmark {
public:
    static BenchmarkComparison compareAll(const Graph& graph,
                                         const std::string& source_id,
                                         const std::string& target_id);
};
