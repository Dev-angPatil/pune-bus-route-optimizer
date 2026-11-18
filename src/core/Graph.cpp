#include "Graph.h"
#include "TrafficModel.h"
#include <fstream>
#include <sstream>
#include <iostream>
#include <algorithm>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

double Graph::haversineDistance(double lat1, double lon1, double lat2, double lon2) {
    constexpr double R = 6371.0; // Earth's mean radius in kilometers
    double dLat = (lat2 - lat1) * (M_PI / 180.0);
    double dLon = (lon2 - lon1) * (M_PI / 180.0);
    double rlat1 = lat1 * (M_PI / 180.0);
    double rlat2 = lat2 * (M_PI / 180.0);

    double a = std::sin(dLat / 2.0) * std::sin(dLat / 2.0) +
               std::cos(rlat1) * std::cos(rlat2) *
               std::sin(dLon / 2.0) * std::sin(dLon / 2.0);
    double c = 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));
    return R * c;
}

std::vector<std::string> Graph::parseCSVLine(const std::string& line) {
    std::vector<std::string> fields;
    std::string current;
    bool in_quotes = false;

    for (size_t i = 0; i < line.size(); ++i) {
        char ch = line[i];
        if (ch == '\"') {
            in_quotes = !in_quotes;
        } else if (ch == ',' && !in_quotes) {
            fields.push_back(current);
            current.clear();
        } else {
            current += ch;
        }
    }
    fields.push_back(current);

    // Trim whitespace
    for (auto& f : fields) {
        size_t start = f.find_first_not_of(" \t\r\n");
        size_t end = f.find_last_not_of(" \t\r\n");
        if (start == std::string::npos) {
            f.clear();
        } else {
            f = f.substr(start, end - start + 1);
        }
    }
    return fields;
}

bool Graph::loadShapes(const std::string& shapes_csv_path) {
    if (shapes_csv_path.empty()) return false;
    std::ifstream file(shapes_csv_path);
    if (!file.is_open()) return false;

    std::string line;
    bool is_header = true;
    while (std::getline(file, line)) {
        if (line.empty()) continue;
        auto fields = parseCSVLine(line);
        if (is_header) {
            is_header = false;
            continue;
        }
        if (fields.size() < 5) continue;

        std::string src = fields[0];
        std::string tgt = fields[1];
        try {
            double lat = std::stod(fields[3]);
            double lon = std::stod(fields[4]);
            std::string key = src + "--" + tgt;
            m_shapes[key].emplace_back(lat, lon);
        } catch (...) {}
    }
    return !m_shapes.empty();
}

void Graph::clear() {
    m_stops.clear();
    m_all_stops_list.clear();
    m_all_stop_ids.clear();
    m_adjacency.clear();
    m_all_edges.clear();
    m_shapes.clear();
}

bool Graph::loadFromCSV(const std::string& stops_csv_path,
                        const std::string& routes_csv_path,
                        const std::string& shapes_csv_path) {
    clear();

    if (!shapes_csv_path.empty()) {
        loadShapes(shapes_csv_path);
    }

    // 1. Read Stops
    std::ifstream stops_file(stops_csv_path);
    if (!stops_file.is_open()) {
        std::cerr << "[Graph] Error: Could not open stops CSV: " << stops_csv_path << std::endl;
        return false;
    }

    std::string line;
    bool is_header = true;
    while (std::getline(stops_file, line)) {
        if (line.empty()) continue;
        auto fields = parseCSVLine(line);
        if (is_header) {
            is_header = false;
            continue;
        }
        if (fields.size() < 4) continue;

        Stop s;
        s.id = fields[0];
        s.name = fields[1];
        try {
            s.lat = std::stod(fields[2]);
            s.lon = std::stod(fields[3]);
        } catch (...) {
            continue;
        }
        if (fields.size() > 4) s.category = fields[4];
        if (fields.size() > 5) s.description = fields[5];

        m_stops[s.id] = s;
        m_all_stops_list.push_back(s);
        m_all_stop_ids.push_back(s.id);
    }
    stops_file.close();

    // 2. Read Routes
    std::ifstream routes_file(routes_csv_path);
    if (!routes_file.is_open()) {
        std::cerr << "[Graph] Error: Could not open routes CSV: " << routes_csv_path << std::endl;
        return false;
    }

    is_header = true;
    while (std::getline(routes_file, line)) {
        if (line.empty()) continue;
        auto fields = parseCSVLine(line);
        if (is_header) {
            is_header = false;
            continue;
        }
        if (fields.size() < 4) continue;

        std::string src = fields[0];
        std::string tgt = fields[1];
        double dist = 0.0;
        double btime = 0.0;
        try {
            dist = std::stod(fields[2]);
            btime = std::stod(fields[3]);
        } catch (...) {
            continue;
        }

        std::string road = (fields.size() > 4) ? fields[4] : "";
        bool bidirectional = (fields.size() > 5) ? (fields[5] == "1" || fields[5] == "true" || fields[5] == "TRUE") : true;
        std::string road_type = (fields.size() > 6 && !fields[6].empty()) ? fields[6] : "arterial";

        // Forward Edge
        Edge fwd;
        fwd.source_id = src;
        fwd.target_id = tgt;
        fwd.distance_km = dist;
        fwd.base_time_mins = btime;
        fwd.road_name = road;
        fwd.bidirectional = bidirectional;
        fwd.road_type = road_type;

        std::string fwd_key = src + "--" + tgt;
        if (m_shapes.find(fwd_key) != m_shapes.end()) {
            fwd.polyline = m_shapes[fwd_key];
        } else if (hasStop(src) && hasStop(tgt)) {
            fwd.polyline.push_back({m_stops[src].lat, m_stops[src].lon});
            fwd.polyline.push_back({m_stops[tgt].lat, m_stops[tgt].lon});
        }

        m_adjacency[src].push_back(fwd);
        m_all_edges.push_back(fwd);

        // Backward Edge if bidirectional
        if (bidirectional) {
            Edge rev;
            rev.source_id = tgt;
            rev.target_id = src;
            rev.distance_km = dist;
            rev.base_time_mins = btime;
            rev.road_name = road;
            rev.bidirectional = bidirectional;
            rev.road_type = road_type;

            std::string rev_key = tgt + "--" + src;
            if (m_shapes.find(rev_key) != m_shapes.end()) {
                rev.polyline = m_shapes[rev_key];
            } else if (!fwd.polyline.empty()) {
                rev.polyline = fwd.polyline;
                std::reverse(rev.polyline.begin(), rev.polyline.end());
            } else if (hasStop(tgt) && hasStop(src)) {
                rev.polyline.push_back({m_stops[tgt].lat, m_stops[tgt].lon});
                rev.polyline.push_back({m_stops[src].lat, m_stops[src].lon});
            }

            m_adjacency[tgt].push_back(rev);
            m_all_edges.push_back(rev);
        }
    }
    routes_file.close();

    return (!m_stops.empty() && !m_all_edges.empty());
}

bool Graph::hasStop(const std::string& stop_id) const {
    return m_stops.find(stop_id) != m_stops.end();
}

const Stop* Graph::getStop(const std::string& stop_id) const {
    auto it = m_stops.find(stop_id);
    if (it != m_stops.end()) return &it->second;
    return nullptr;
}

const std::vector<Stop>& Graph::getAllStops() const {
    return m_all_stops_list;
}

const std::vector<std::string>& Graph::getAllStopIds() const {
    return m_all_stop_ids;
}

const std::vector<Edge>& Graph::getOutgoingEdges(const std::string& stop_id) const {
    static const std::vector<Edge> empty_edges;
    auto it = m_adjacency.find(stop_id);
    if (it != m_adjacency.end()) return it->second;
    return empty_edges;
}

const std::vector<Edge>& Graph::getAllEdges() const {
    return m_all_edges;
}

const Edge* Graph::findEdge(const std::string& u, const std::string& v) const {
    auto it = m_adjacency.find(u);
    if (it == m_adjacency.end()) return nullptr;
    for (const auto& e : it->second) {
        if (e.target_id == v) return &e;
    }
    return nullptr;
}

std::vector<std::pair<double, double>> Graph::reconstructPolyline(const std::vector<std::string>& path_ids) const {
    std::vector<std::pair<double, double>> points;
    if (path_ids.size() < 2) return points;

    for (size_t i = 0; i < path_ids.size() - 1; ++i) {
        const std::string& u = path_ids[i];
        const std::string& v = path_ids[i + 1];
        const Edge* edge = findEdge(u, v);
        if (edge && !edge->polyline.empty()) {
            for (size_t p = (points.empty() ? 0 : 1); p < edge->polyline.size(); ++p) {
                points.push_back(edge->polyline[p]);
            }
        } else {
            const Stop* su = getStop(u);
            const Stop* sv = getStop(v);
            if (su && points.empty()) points.push_back({su->lat, su->lon});
            if (sv) points.push_back({sv->lat, sv->lon});
        }
    }
    return points;
}

void Graph::applyTraffic(const TrafficModel& model, TrafficMode mode, const DateTime& when) {
    // Edges are stored twice (adjacency list + flat edge list), so update both.
    for (auto& [stop_id, edges] : m_adjacency) {
        for (auto& e : edges) e.traffic_factor = model.predict(mode, e.road_type, when);
    }
    for (auto& e : m_all_edges) e.traffic_factor = model.predict(mode, e.road_type, when);
}

double Graph::maxFreeFlowSpeedKmph() const {
    double best = 1.0;
    for (const auto& e : m_all_edges) {
        if (e.base_time_mins > 0) best = std::max(best, e.distance_km / (e.base_time_mins / 60.0));
    }
    return best;
}
