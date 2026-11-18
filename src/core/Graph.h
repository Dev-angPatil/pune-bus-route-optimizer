#pragma once
#include "Stop.h"
#include "Edge.h"
#include <string>
#include <vector>
#include <unordered_map>
#include <cmath>

class Graph {
public:
    Graph() = default;

    // Load graph from CSV files
    bool loadFromCSV(const std::string& stops_csv_path,
                     const std::string& routes_csv_path,
                     const std::string& shapes_csv_path = "");

    // Haversine formula to compute great-circle distance between two coordinates in km
    static double haversineDistance(double lat1, double lon1, double lat2, double lon2);

    // Queries
    bool hasStop(const std::string& stop_id) const;
    const Stop* getStop(const std::string& stop_id) const;
    const std::vector<Stop>& getAllStops() const;
    const std::vector<std::string>& getAllStopIds() const;

    const std::vector<Edge>& getOutgoingEdges(const std::string& stop_id) const;
    const std::vector<Edge>& getAllEdges() const;
    const Edge* findEdge(const std::string& u, const std::string& v) const;

    size_t getVertexCount() const { return m_stops.size(); }
    size_t getEdgeCount() const { return m_all_edges.size(); }

    // Reconstruct continuous GPS polyline for a path
    std::vector<std::pair<double, double>> reconstructPolyline(const std::vector<std::string>& path_ids) const;

    // Clear all graph data
    void clear();

private:
    std::unordered_map<std::string, Stop> m_stops;
    std::vector<Stop> m_all_stops_list;
    std::vector<std::string> m_all_stop_ids;

    std::unordered_map<std::string, std::vector<Edge>> m_adjacency;
    std::vector<Edge> m_all_edges;

    // Shape polylines map: "u--v" -> vector<pair<lat, lon>>
    std::unordered_map<std::string, std::vector<std::pair<double, double>>> m_shapes;

    // Helper CSV parser for lines with potential quotes
    static std::vector<std::string> parseCSVLine(const std::string& line);
    bool loadShapes(const std::string& shapes_csv_path);
};
