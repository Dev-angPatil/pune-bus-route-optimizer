#include "DeparturePlanner.h"
#include "Dijkstra.h"

std::vector<DepartureSlot> DeparturePlanner::sweepDay(Graph& graph,
                                                      const TrafficModel& model,
                                                      TrafficMode mode,
                                                      const std::string& source_id,
                                                      const std::string& target_id,
                                                      const DateTime& day,
                                                      int first_hour,
                                                      int last_hour) {
    std::vector<DepartureSlot> slots;
    for (int hour = first_hour; hour <= last_hour; ++hour) {
        for (int minute : {0, 30}) {
            DateTime when = day;
            when.hour = hour;
            when.minute = minute;

            graph.applyTraffic(model, mode, when);
            RouteResult r = Dijkstra::findShortestPath(graph, source_id, target_id, /*by_time=*/true);
            if (!r.found) continue;

            DepartureSlot slot;
            slot.departure = when;
            slot.travel_time_mins = r.total_time_mins;
            slot.distance_km = r.total_distance_km;
            slot.path_ids = r.path_ids;
            slots.push_back(slot);
        }
    }
    return slots;
}

int DeparturePlanner::bestSlot(const std::vector<DepartureSlot>& slots) {
    int best = -1;
    for (size_t i = 0; i < slots.size(); ++i) {
        if (best < 0 || slots[i].travel_time_mins < slots[best].travel_time_mins) {
            best = static_cast<int>(i);
        }
    }
    return best;
}
