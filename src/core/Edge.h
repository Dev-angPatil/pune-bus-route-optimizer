#pragma once
#include <string>
#include <vector>
#include <utility>

struct Edge {
    std::string source_id;
    std::string target_id;
    double distance_km{0.0};
    double base_time_mins{0.0};      // free-flow travel time (empty road)
    std::string road_name;
    bool bidirectional{true};
    std::string road_type{"arterial"};  // it_corridor | city_center | arterial | highway
    double traffic_factor{1.0};      // predicted congestion (>= 1.0), set by Graph::applyTraffic
    std::vector<std::pair<double, double>> polyline; // list of [lat, lon]

    // Travel time once predicted traffic is taken into account.
    double travelTimeMins() const { return base_time_mins * traffic_factor; }

    // The weight the shortest-path algorithms minimise:
    //   by_time = false -> kilometres, by_time = true -> minutes with traffic.
    double cost(bool by_time) const { return by_time ? travelTimeMins() : distance_km; }
};
