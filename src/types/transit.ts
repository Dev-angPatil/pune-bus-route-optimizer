export interface Hub {
  id: string;
  name: string;
  marathi: string;
  lat: number;
  lon: number;
  category: string;
  capacity: number;
  peak_rush_multiplier: number;
  description: string;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  source_name: string;
  target_name: string;
  corridor: string;
  bus_routes: string[];
  distance_km: number;
  base_time_mins: number;
  crowd_sensitivity: number;
  is_chokepoint: boolean;
  polyline: [number, number][];
}

export interface GraphNeighbor {
  neighbor: string;
  edge_id: string;
  distance: number;
  base_time: number;
  crowd_sensitivity: number;
  is_chokepoint: boolean;
}

export interface ActiveBus {
  bus_number: string;
  route_code: string;
  route_name: string;
  type: string;
  source: string;
  destination: string;
  current_edge: string;
  passenger_occupancy: number;
  status: string;
  speed_kmh: number;
}

export interface Scenario {
  id: string;
  title: string;
  hour: number;
  description: string;
  crowd_boost_nodes: string[];
  recommended_origin: string;
  recommended_destination: string;
}

export interface RouteSegment {
  from: string;
  to: string;
  distance_km: number;
  travel_time_mins: number;
  crowd_index: number;
  is_chokepoint: boolean;
}

export interface RouteResult {
  success: boolean;
  mode: 'standard' | 'crowd_optimized' | 'astar';
  origin: string;
  destination: string;
  path_node_ids: string[];
  path_names: string[];
  total_distance_km: number;
  estimated_travel_time_mins: number;
  free_flow_time_mins: number;
  congestion_delay_mins: number;
  average_crowd_exposure_percent: number;
  estimated_co2_kg: number;
  nodes_explored: number;
  segments: RouteSegment[];
  error?: string;
}

export interface OptimizationComparison {
  origin: string;
  destination: string;
  simulation_hour: string;
  standard_route: RouteResult;
  crowd_optimized_route: RouteResult;
  metrics: {
    time_saved_minutes: number;
    time_saved_percentage: number;
    crowd_reduction_percentage: number;
    distance_overhead_km: number;
    co2_saved_kg: number;
    verdict: string;
  };
}
