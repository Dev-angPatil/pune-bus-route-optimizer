#pragma once
#include <string>
#include <vector>
#include <utility>

struct Edge {
    std::string source_id;
    std::string target_id;
    double distance_km{0.0};
    double base_time_mins{0.0};
    std::string road_name;
    bool bidirectional{true};
    std::vector<std::pair<double, double>> polyline; // list of [lat, lon]
};
