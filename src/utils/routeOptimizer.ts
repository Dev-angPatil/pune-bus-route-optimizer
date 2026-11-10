import transitData from '../data/puneTransitData.json';
import {
  Hub,
  NetworkEdge,
  GraphNeighbor,
  RouteResult,
  RouteSegment,
  OptimizationComparison
} from '../types/transit';

const hubs: Record<string, Hub> = {};
transitData.hubs.forEach((h: unknown) => {
  const hub = h as Hub;
  hubs[hub.id] = hub;
});

const edges: Record<string, NetworkEdge> = {};
transitData.edges.forEach((e: unknown) => {
  const edge = e as NetworkEdge;
  edges[edge.id] = edge;
});

const adjacency: Record<string, GraphNeighbor[]> = transitData.adjacency as unknown as Record<string, GraphNeighbor[]>;
const hourlyCurve: number[] = transitData.hourly_crowd_curve;

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getNodeCrowd(nodeId: string, hour: number, surgeNodes: string[] = []): number {
  const baseCurve = hourlyCurve[hour % 24] || 0.5;
  const hub = hubs[nodeId];
  if (!hub) return baseCurve;

  const multiplier = hub.peak_rush_multiplier || 1.0;
  let crowd = Math.min(1.0, baseCurve * (multiplier / 2.5));

  if (surgeNodes.includes(nodeId)) {
    crowd = Math.min(1.0, crowd * 1.45 + 0.15);
  }

  return Math.round(crowd * 100) / 100;
}

export function calculateEdgeWeight(
  u: string,
  v: string,
  dist: number,
  baseTime: number,
  crowdSens: number,
  isChokepoint: boolean,
  hour: number,
  alpha: number = 1.8,
  beta: number = 1.2,
  surgeNodes: string[] = []
): { dynamicCost: number; actualTimeMins: number; avgCrowd: number } {
  const cU = getNodeCrowd(u, hour, surgeNodes);
  const cV = getNodeCrowd(v, hour, surgeNodes);
  const avgCrowd = (cU + cV) / 2.0;

  const chokeFactor = isChokepoint && avgCrowd > 0.55 ? 1.55 : 1.0;
  const congestionDelay = 1.0 + Math.pow(avgCrowd, 2) * crowdSens * 2.2 * chokeFactor;
  const actualTimeMins = baseTime * congestionDelay;

  const dynamicCost = dist * (1.0 + alpha * avgCrowd * crowdSens + beta * (chokeFactor - 1.0));

  return { dynamicCost, actualTimeMins, avgCrowd };
}

export function solveRoute(
  start: string,
  end: string,
  mode: 'standard' | 'crowd_optimized' | 'astar' = 'crowd_optimized',
  hour: number = 8,
  surgeNodes: string[] = []
): RouteResult {
  if (!hubs[start] || !hubs[end]) {
    return {
      success: false,
      mode,
      origin: start,
      destination: end,
      path_node_ids: [],
      path_names: [],
      total_distance_km: 0,
      estimated_travel_time_mins: 0,
      free_flow_time_mins: 0,
      congestion_delay_mins: 0,
      average_crowd_exposure_percent: 0,
      estimated_co2_kg: 0,
      nodes_explored: 0,
      segments: [],
      error: 'Invalid start or destination node'
    };
  }

  const allNodeIds = Object.keys(hubs);
  const costs: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();

  allNodeIds.forEach(id => {
    costs[id] = Infinity;
    previous[id] = null;
  });

  costs[start] = 0;
  let nodesExplored = 0;

  while (visited.size < allNodeIds.length) {
    let curr: string | null = null;
    let minCost = Infinity;

    for (const id of allNodeIds) {
      if (!visited.has(id) && costs[id] < minCost) {
        minCost = costs[id];
        curr = id;
      }
    }

    if (!curr || minCost === Infinity || curr === end) {
      break;
    }

    visited.add(curr);
    nodesExplored++;

    const neighbors = adjacency[curr] || [];
    for (const edge of neighbors) {
      const neighbor = edge.neighbor;
      if (visited.has(neighbor)) continue;

      let edgeCost = edge.distance;

      if (mode === 'crowd_optimized' || mode === 'astar') {
        const { dynamicCost } = calculateEdgeWeight(
          curr,
          neighbor,
          edge.distance,
          edge.base_time,
          edge.crowd_sensitivity,
          edge.is_chokepoint,
          hour,
          2.0,
          1.5,
          surgeNodes
        );
        edgeCost = dynamicCost;

        if (mode === 'astar') {
          const h = hubs[neighbor];
          const target = hubs[end];
          const heuristic = haversineDistance(h.lat, h.lon, target.lat, target.lon);
          edgeCost += heuristic * 0.4;
        }
      }

      const totalCost = costs[curr] + edgeCost;
      if (totalCost < costs[neighbor]) {
        costs[neighbor] = totalCost;
        previous[neighbor] = curr;
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let step: string | null = end;
  while (step) {
    path.push(step);
    step = previous[step];
  }
  path.reverse();

  if (path.length === 0 || path[0] !== start) {
    return {
      success: false,
      mode,
      origin: hubs[start].name,
      destination: hubs[end].name,
      path_node_ids: [],
      path_names: [],
      total_distance_km: 0,
      estimated_travel_time_mins: 0,
      free_flow_time_mins: 0,
      congestion_delay_mins: 0,
      average_crowd_exposure_percent: 0,
      estimated_co2_kg: 0,
      nodes_explored: nodesExplored,
      segments: [],
      error: 'No path found'
    };
  }

  let totalDist = 0;
  let totalTime = 0;
  let baseTime = 0;
  let crowdAcc = 0;
  const segments: RouteSegment[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    const neighborEdge = (adjacency[u] || []).find(e => e.neighbor === v);
    if (!neighborEdge) continue;

    const { actualTimeMins, avgCrowd } = calculateEdgeWeight(
      u,
      v,
      neighborEdge.distance,
      neighborEdge.base_time,
      neighborEdge.crowd_sensitivity,
      neighborEdge.is_chokepoint,
      hour,
      2.0,
      1.5,
      surgeNodes
    );

    totalDist += neighborEdge.distance;
    totalTime += actualTimeMins;
    baseTime += neighborEdge.base_time;
    crowdAcc += avgCrowd;

    segments.push({
      from: hubs[u].name,
      to: hubs[v].name,
      distance_km: neighborEdge.distance,
      travel_time_mins: Math.round(actualTimeMins * 10) / 10,
      crowd_index: Math.round(avgCrowd * 100) / 100,
      is_chokepoint: neighborEdge.is_chokepoint
    });
  }

  const avgCrowdPct = Math.round((crowdAcc / Math.max(1, segments.length)) * 1000) / 10;
  const fuelPenalty = 1.0 + (avgCrowdPct / 100) * 0.4;
  const co2 = Math.round(totalDist * 0.95 * fuelPenalty * 100) / 100;

  return {
    success: true,
    mode,
    origin: hubs[start].name,
    destination: hubs[end].name,
    path_node_ids: path,
    path_names: path.map(p => hubs[p].name),
    total_distance_km: Math.round(totalDist * 10) / 10,
    estimated_travel_time_mins: Math.round(totalTime * 10) / 10,
    free_flow_time_mins: Math.round(baseTime * 10) / 10,
    congestion_delay_mins: Math.round(Math.max(0, totalTime - baseTime) * 10) / 10,
    average_crowd_exposure_percent: avgCrowdPct,
    estimated_co2_kg: co2,
    nodes_explored: nodesExplored,
    segments
  };
}

export function comparePuneRoutes(
  start: string,
  end: string,
  hour: number = 8,
  surgeNodes: string[] = []
): OptimizationComparison {
  const standard = solveRoute(start, end, 'standard', hour, surgeNodes);
  const optimized = solveRoute(start, end, 'crowd_optimized', hour, surgeNodes);

  const timeDiff = Math.max(0, standard.estimated_travel_time_mins - optimized.estimated_travel_time_mins);
  const timeSavedPct =
    standard.estimated_travel_time_mins > 0
      ? Math.round((timeDiff / standard.estimated_travel_time_mins) * 1000) / 10
      : 0;
  const crowdDiff = Math.round((standard.average_crowd_exposure_percent - optimized.average_crowd_exposure_percent) * 10) / 10;
  const distDiff = Math.round((optimized.total_distance_km - standard.total_distance_km) * 10) / 10;
  const co2Saved = Math.round((standard.estimated_co2_kg - optimized.estimated_co2_kg) * 100) / 100;

  let verdict = '';
  if (timeSavedPct > 15) {
    verdict = `Dynamic route bypasses congested chokepoints, saving ${Math.round(timeDiff)} mins (${timeSavedPct}%) travel time!`;
  } else if (timeSavedPct > 0) {
    verdict = `Mild congestion avoided. Saves ${Math.round(timeDiff)} mins with smoother transit flow.`;
  } else {
    verdict = `Shortest physical route is already optimal under current off-peak crowd conditions.`;
  }

  return {
    origin: hubs[start]?.name || start,
    destination: hubs[end]?.name || end,
    simulation_hour: `${String(hour).padStart(2, '0')}:00 hrs`,
    standard_route: standard,
    crowd_optimized_route: optimized,
    metrics: {
      time_saved_minutes: Math.round(timeDiff * 10) / 10,
      time_saved_percentage: timeSavedPct,
      crowd_reduction_percentage: crowdDiff,
      distance_overhead_km: distDiff,
      co2_saved_kg: co2Saved,
      verdict
    }
  };
}
