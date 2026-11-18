#pragma once
#include "Graph.h"
#include "TrafficModel.h"
#include <string>
#include <vector>

// One row of the "Best time to leave" chart.
struct DepartureSlot {
    DateTime departure;
    double travel_time_mins{0.0};
    double distance_km{0.0};
    std::vector<std::string> path_ids;
};

// "When should I leave?"
//   For every 30-minute slot of the chosen day we predict traffic and run
//   Dijkstra (fastest route). The slot with the smallest travel time wins.
//   It is simply a loop of (predict traffic -> run Dijkstra).
class DeparturePlanner {
public:
    static std::vector<DepartureSlot> sweepDay(Graph& graph,
                                               const TrafficModel& model,
                                               TrafficMode mode,
                                               const std::string& source_id,
                                               const std::string& target_id,
                                               const DateTime& day,
                                               int first_hour = 5,
                                               int last_hour = 23);

    // Index of the fastest slot, or -1 if the list is empty.
    static int bestSlot(const std::vector<DepartureSlot>& slots);
};
