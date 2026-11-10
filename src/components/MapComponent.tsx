import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import transitData from '../data/puneTransitData.json';
import { Hub, NetworkEdge, ActiveBus, OptimizationComparison } from '../types/transit';

interface MapComponentProps {
  comparison: OptimizationComparison | null;
  activeHour: number;
  surgeNodes: string[];
  activeBuses: ActiveBus[];
  onSelectHub: (hub: Hub) => void;
  showHeatmap: boolean;
  showAllCorridors: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  comparison,
  activeHour,
  surgeNodes,
  activeBuses,
  onSelectHub,
  showHeatmap,
  showAllCorridors
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Layer groups for clean updates without flickering
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const nodesLayerRef = useRef<L.LayerGroup | null>(null);
  const busesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [18.5284, 73.8446], // Centered around Central Pune (Shivajinagar/Deccan)
      zoom: 12,
      minZoom: 10,
      maxZoom: 17,
      zoomControl: false
    });

    // Sleek CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | PMPML Pune Transit',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    corridorsLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    nodesLayerRef.current = L.layerGroup().addTo(map);
    busesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Background Corridors
  useEffect(() => {
    if (!corridorsLayerRef.current) return;
    corridorsLayerRef.current.clearLayers();

    if (!showAllCorridors) return;

    (transitData.edges as unknown as NetworkEdge[]).forEach(edge => {
      const isChoke = edge.is_chokepoint;
      const poly = L.polyline(edge.polyline, {
        color: isChoke ? '#f59e0b' : '#334155',
        weight: isChoke ? 3 : 2,
        opacity: isChoke ? 0.6 : 0.35,
        dashArray: isChoke ? '4, 4' : undefined
      });

      poly.bindTooltip(
        `<div class="text-xs">
          <span class="font-bold text-cyan-400">${edge.corridor}</span><br/>
          <span class="text-slate-300">Distance: ${edge.distance_km} km | Routes: ${edge.bus_routes.join(', ')}</span>
        </div>`,
        { sticky: true }
      );

      corridorsLayerRef.current?.addLayer(poly);
    });
  }, [showAllCorridors]);

  // Render Crowd Heatmap
  useEffect(() => {
    if (!heatmapLayerRef.current) return;
    heatmapLayerRef.current.clearLayers();

    if (!showHeatmap) return;

    (transitData.hubs as unknown as Hub[]).forEach(hub => {
      const baseCurve = transitData.hourly_crowd_curve[activeHour % 24] || 0.5;
      let crowd = Math.min(1.0, baseCurve * (hub.peak_rush_multiplier / 2.5));
      if (surgeNodes.includes(hub.id)) crowd = Math.min(1.0, crowd * 1.45 + 0.15);

      if (crowd > 0.4) {
        const radius = Math.round(500 + crowd * 1400);
        const color = crowd > 0.75 ? '#ef4444' : crowd > 0.55 ? '#f59e0b' : '#06b6d4';
        
        const circle = L.circle([hub.lat, hub.lon], {
          radius,
          color,
          weight: 0,
          fillColor: color,
          fillOpacity: crowd * 0.28
        });

        heatmapLayerRef.current?.addLayer(circle);
      }
    });
  }, [showHeatmap, activeHour, surgeNodes]);

  // Render Optimized vs Standard Route Comparison
  useEffect(() => {
    if (!routesLayerRef.current || !mapInstanceRef.current) return;
    routesLayerRef.current.clearLayers();

    if (!comparison) return;

    const std = comparison.standard_route;
    const opt = comparison.crowd_optimized_route;

    // Helper to get full polyline for a path
    const getPathPoints = (pathIds: string[]): [number, number][] => {
      const pts: [number, number][] = [];
      for (let i = 0; i < pathIds.length - 1; i++) {
        const u = pathIds[i];
        const v = pathIds[i + 1];
        const edge = (transitData.edges as unknown as NetworkEdge[]).find(
          e => (e.source === u && e.target === v) || (e.source === v && e.target === u)
        );
        if (edge && edge.polyline) {
          if (edge.source === u) {
            pts.push(...edge.polyline);
          } else {
            pts.push(...[...edge.polyline].reverse());
          }
        }
      }
      return pts;
    };

    const stdPoints = getPathPoints(std.path_node_ids);
    const optPoints = getPathPoints(opt.path_node_ids);

    // Standard Route: Red Dashed Line
    if (stdPoints.length > 0) {
      const stdPoly = L.polyline(stdPoints, {
        color: '#ef4444',
        weight: 4,
        opacity: 0.75,
        dashArray: '8, 8',
        className: 'animated-congested-route'
      });
      stdPoly.bindTooltip(
        `<div class="text-xs">
          <strong class="text-rose-400">Standard Route (Dijkstra)</strong><br/>
          Time: ${std.estimated_travel_time_mins} mins | Delay: +${std.congestion_delay_mins} mins<br/>
          Crowd Exposure: ${std.average_crowd_exposure_percent}%
        </div>`,
        { sticky: true }
      );
      routesLayerRef.current.addLayer(stdPoly);
    }

    // Optimized Route: Glowing Neon Cyan Flowing Line
    if (optPoints.length > 0) {
      // Glow underlay
      const glowPoly = L.polyline(optPoints, {
        color: '#06b6d4',
        weight: 8,
        opacity: 0.35
      });
      routesLayerRef.current.addLayer(glowPoly);

      // Core electric line
      const optPoly = L.polyline(optPoints, {
        color: '#10b981',
        weight: 5,
        opacity: 0.95,
        className: 'animated-route-flow animated-route-pulse'
      });
      optPoly.bindTooltip(
        `<div class="text-xs">
          <strong class="text-emerald-400">⚡ Crowd-Adaptive Dynamic Route</strong><br/>
          Time: ${opt.estimated_travel_time_mins} mins (${comparison.metrics.time_saved_percentage}% faster)<br/>
          Distance: ${opt.total_distance_km} km | CO₂: ${opt.estimated_co2_kg} kg
        </div>`,
        { sticky: true }
      );
      routesLayerRef.current.addLayer(optPoly);

      // Fit bounds to show route smoothly
      const allBounds = L.latLngBounds([...optPoints, ...stdPoints]);
      mapInstanceRef.current.fitBounds(allBounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [comparison]);

  // Render Pune Hub Nodes
  useEffect(() => {
    if (!nodesLayerRef.current) return;
    nodesLayerRef.current.clearLayers();

    (transitData.hubs as unknown as Hub[]).forEach(hub => {
      const baseCurve = transitData.hourly_crowd_curve[activeHour % 24] || 0.5;
      let crowd = Math.min(1.0, baseCurve * (hub.peak_rush_multiplier / 2.5));
      if (surgeNodes.includes(hub.id)) crowd = Math.min(1.0, crowd * 1.45 + 0.15);

      const crowdPct = Math.round(crowd * 100);
      const isHighCrowd = crowdPct > 70;
      const isMedCrowd = crowdPct > 45;

      const nodeColor = isHighCrowd ? '#ef4444' : isMedCrowd ? '#f59e0b' : '#06b6d4';
      const nodeBorder = isHighCrowd ? '#fca5a5' : isMedCrowd ? '#fde68a' : '#a5f3fc';

      const customIcon = L.divIcon({
        className: 'custom-hub-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 28px; height: 28px;">
            ${isHighCrowd ? `<div class="absolute inset-0 rounded-full animate-ping bg-rose-500 opacity-60"></div>` : ''}
            <div class="relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-lg transition-transform duration-200 group-hover:scale-125"
                 style="background: ${nodeColor}; border: 2px solid ${nodeBorder}; box-shadow: 0 0 10px ${nodeColor};">
            </div>
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-900/90 text-slate-200 border border-slate-700/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
              ${hub.name.split(' ')[0]} (${crowdPct}%)
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([hub.lat, hub.lon], { icon: customIcon });

      marker.on('click', () => {
        onSelectHub(hub);
      });

      marker.bindTooltip(
        `<div class="text-xs space-y-1">
          <div class="font-bold text-cyan-300 text-sm">${hub.name}</div>
          <div class="text-slate-400 font-medium">${hub.marathi}</div>
          <div class="flex items-center gap-2 pt-1 border-t border-slate-700">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold ${isHighCrowd ? 'bg-rose-950 text-rose-300 border border-rose-800' : isMedCrowd ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'}">
              ${crowdPct}% Crowd Load
            </span>
            <span class="text-[10px] text-slate-400">Cap: ${(hub.capacity / 1000).toFixed(0)}k/day</span>
          </div>
          <div class="text-[10px] text-slate-400 italic pt-0.5">Click for full stop analytics</div>
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      nodesLayerRef.current?.addLayer(marker);
    });
  }, [activeHour, surgeNodes, onSelectHub]);

  // Render Real-time Simulated Active Buses
  useEffect(() => {
    if (!busesLayerRef.current) return;
    busesLayerRef.current.clearLayers();

    activeBuses.forEach(bus => {
      // Find edge for bus
      const edge = (transitData.edges as unknown as NetworkEdge[]).find(e => e.id === bus.current_edge);
      if (!edge || !edge.polyline || edge.polyline.length === 0) return;

      // Position bus at midpoint of polyline
      const midIdx = Math.floor(edge.polyline.length / 2);
      const [bLat, bLon] = edge.polyline[midIdx];

      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer" style="width: 32px; height: 32px;">
            <div class="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping"></div>
            <div class="relative z-10 px-1.5 py-0.5 rounded-md bg-cyan-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-lg border border-cyan-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M8 15h.01"/><path d="M16 15h.01"/><path d="M6 19v2"/><path d="M18 19v2"/></svg>
              ${bus.route_code}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const busMarker = L.marker([bLat, bLon], { icon: busIcon });
      busMarker.bindTooltip(
        `<div class="text-xs space-y-1">
          <div class="font-bold text-cyan-400">PMPML Bus #${bus.route_code} (${bus.bus_number})</div>
          <div class="text-slate-200">${bus.route_name}</div>
          <div class="text-slate-400 text-[11px]">${bus.type}</div>
          <div class="flex items-center justify-between text-[10px] pt-1 border-t border-slate-700">
            <span class="text-emerald-400 font-semibold">${bus.speed_kmh} km/h</span>
            <span class="text-amber-400 font-semibold">${bus.passenger_occupancy}% Load</span>
          </div>
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      busesLayerRef.current?.addLayer(busMarker);
    });
  }, [activeBuses]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Visual Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel rounded-xl p-3 text-xs space-y-2 border border-slate-800 shadow-xl backdrop-blur-md max-w-[240px]">
        <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Map Legend</div>
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></div>
            <span className="text-slate-300">Crowd-Optimized Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-b-2 border-dashed border-rose-500"></div>
            <span className="text-slate-300">Congested Standard Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#ef4444]"></div>
            <span className="text-slate-300">Severe Chokepoint (&gt;75%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <span className="text-slate-300">Moderate Crowd (45-75%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-1 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold text-[9px]">PMPML</div>
            <span className="text-slate-300">Live PMPML Bus in Transit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
