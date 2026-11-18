#pragma once
#include "Stop.h"
#include <string>
#include <vector>
#include <utility>

struct RouteResult {
    bool found{false};
    std::string algorithm_name;
    std::string source_id;
    std::string target_id;
    std::vector<std::string> path_ids;
    std::vector<Stop> path_stops;
    std::vector<std::pair<double, double>> full_polyline; // GPS points for map
    double total_distance_km{0.0};
    double total_time_mins{0.0};
    long long execution_time_us{0}; // Microseconds (µs)
    int nodes_explored{0};
    int edge_relaxations{0};
    std::string time_complexity;
    std::string space_complexity;
    std::string paradigm;
    std::string notes;
};
