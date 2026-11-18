#pragma once
#include "Graph.h"
#include "RouteResult.h"
#include <string>

class AStar {
public:
    static RouteResult findShortestPath(const Graph& graph,
                                        const std::string& source_id,
                                        const std::string& target_id);
};
