import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Sun, Moon } from 'lucide-react';
import transitData from '../data/puneTransitData.json';
import metroData from '../data/puneMetroData.json';
import { Hub, NetworkEdge, ActiveBus, OptimizationComparison } from '../types/transit';
import { sound } from '../utils/audio';

interface MapComponentProps {
  comparison: OptimizationComparison | null;
  activeHour: number;
  surgeNodes: string[];
  activeBuses: ActiveBus[];
  onSelectHub: (hub: Hub) => void;
  showHeatmap: boolean;
  showAllCorridors: boolean;
  showMetro?: boolean;
  tileProvider: 'osm_dark' | 'osm_standard' | 'carto' | 'mapbox';
  apiKey?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  comparison,
  activeHour,
  surgeNodes,
  activeBuses,
  onSelectHub,
  showHeatmap,
  showAllCorridors,
  showMetro = true,
  tileProvider,
  apiKey
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  
  // 3D Perspective Tilt state
  const [is3D, setIs3D] = useState<boolean>(false);
  
  // Layer groups for clean updates without flickering
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const metroLayerRef = useRef<L.LayerGroup | null>(null);
  const nodesLayerRef = useRef<L.LayerGroup | null>(null);
  const busesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [18.5284, 73.8446], // Centered around Central Pune (Shivajinagar/Deccan)
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    corridorsLayerRef.current = L.layerGroup().addTo(map);
    metroLayerRef.current = L.layerGroup().addTo(map);
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

  // Update Base Tile Layer dynamically based on provider and optional API key
  useEffect(() => {
    if (!mapInstanceRef.current || !mapContainerRef.current) return;
    const map = mapInstanceRef.current;
    const container = mapContainerRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }

    // Manage container dark filter class & Day/Night transitions
    container.classList.remove('osm-dark-tiles', 'osm-day-tiles', 'clean-tiles');

    const isDaytime = activeHour >= 6 && activeHour < 18;

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors | PMPML Pune';
    let subdomains = 'abc';
    let maxZoom = 19;

    if (tileProvider === 'osm_dark') {
      // Automatic Day / Night transition based on commute time slider
      if (isDaytime) {
        container.classList.add('osm-day-tiles');
      } else {
        container.classList.add('osm-dark-tiles');
      }
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> | PMPML Pune';
    } else if (tileProvider === 'osm_standard') {
      // 100% Free Standard OpenStreetMap (Clean unfiltered road & geography)
      container.classList.add('clean-tiles');
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>';
    } else if (tileProvider === 'carto') {
      // CARTO Basemaps (Appends key if user provided one from carto.com/basemaps/apikey)
      container.classList.add('clean-tiles');
      const keyParam = apiKey && apiKey.trim().length > 0 ? `?key=${apiKey.trim()}` : '';
      url = `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${keyParam}`;
      attribution = '&copy; <a href="https://carto.com/">CARTO</a>';
      subdomains = 'abcd';
    } else if (tileProvider === 'mapbox' && apiKey && apiKey.trim().length > 0) {
      container.classList.add('clean-tiles');
      url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${apiKey.trim()}`;
      attribution = '&copy; <a href="https://mapbox.com/">Mapbox</a>';
      subdomains = 'a';
      maxZoom = 20;
    }

    const tileLayer = L.tileLayer(url, {
      attribution,
      subdomains,
      maxZoom
    });

    tileLayer.addTo(map);
    baseTileLayerRef.current = tileLayer;
  }, [tileProvider, apiKey, activeHour]);

  // Render Background Corridors
  useEffect(() => {
    if (!corridorsLayerRef.current) return;
    corridorsLayerRef.current.clearLayers();

    if (!showAllCorridors) return;

    (transitData.edges as unknown as NetworkEdge[]).forEach(edge => {
      const isChoke = edge.is_chokepoint;
      const poly = L.polyline(edge.polyline, {
        color: isChoke ? '#f59e0b' : '#38bdf8',
        weight: isChoke ? 3 : 2,
        opacity: isChoke ? 0.7 : 0.4,
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

  // Render Pune Metro Rail Network & Multi-Modal Transfer Stations
  useEffect(() => {
    if (!metroLayerRef.current) return;
    metroLayerRef.current.clearLayers();

    if (!showMetro) return;

    metroData.lines.forEach((line) => {
      const latlngs: [number, number][] = line.stations.map((s) => [s.lat, s.lon]);

      // Metro Track Line (Dashed bold line with high visibility)
      const metroTrackGlow = L.polyline(latlngs, {
        color: line.color,
        weight: 6,
        opacity: 0.35
      });
      metroLayerRef.current?.addLayer(metroTrackGlow);

      const metroTrack = L.polyline(latlngs, {
        color: line.color,
        weight: 3.5,
        opacity: 0.9,
        dashArray: '6, 6'
      });

      metroTrack.bindTooltip(
        `<div class="text-xs">
          <strong style="color: ${line.color};">${line.name}</strong><br/>
          <span>${line.marathi} • ${line.length_km} km</span><br/>
          <span class="text-slate-300">${line.corridor}</span>
        </div>`,
        { sticky: true }
      );
      metroLayerRef.current?.addLayer(metroTrack);

      // Metro Station Markers
      line.stations.forEach((st) => {
        const isInterchange = !!st.interchange;
        const stationIcon = L.divIcon({
          className: 'metro-station-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group" style="width: 22px; height: 22px;">
              ${
                isInterchange
                  ? `<div class="absolute inset-0 rounded-full animate-ping opacity-75" style="background: ${line.color};"></div>`
                  : ''
              }
              <div class="relative z-10 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                   style="background: ${line.color}; box-shadow: 0 0 8px ${line.color};">
              </div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const feeder = metroData.multimodal_feeder_routes.find((f) => f.metro_station.includes(st.name));

        const marker = L.marker([st.lat, st.lon], { icon: stationIcon });
        marker.bindTooltip(
          `<div class="text-xs space-y-1">
            <div class="font-bold flex items-center gap-1" style="color: ${line.color};">
              🚆 ${st.name}
            </div>
            <div class="text-[10px] text-slate-300">${line.name}</div>
            ${
              feeder
                ? `<div class="pt-1 border-t border-slate-700/80 text-[10px] text-emerald-400">
                    <strong>PMPML Feeder Buses:</strong> ${feeder.pmpml_feeder_buses.join(', ')}<br/>
                    <span class="text-slate-300">Connects: ${feeder.connects_to.join(', ')}</span>
                  </div>`
                : ''
            }
          </div>`,
          { direction: 'top', offset: [0, -6] }
        );
        metroLayerRef.current?.addLayer(marker);
      });
    });
  }, [showMetro]);

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
        opacity: 0.85,
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

      // Moving Crowd Dots (Congested / Backlogged Commuter Flow)
      const stdCrowdDots = L.polyline(stdPoints, {
        color: '#fecdd3',
        weight: 2.5,
        opacity: 0.85,
        className: 'animated-crowd-dots'
      });
      routesLayerRef.current.addLayer(stdCrowdDots);
    }

    // Optimized Route: Glowing Neon Cyan Flowing Line
    if (optPoints.length > 0) {
      const glowPoly = L.polyline(optPoints, {
        color: '#06b6d4',
        weight: 8,
        opacity: 0.35
      });
      routesLayerRef.current.addLayer(glowPoly);

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

      // Moving Crowd Dots (Smooth High-Velocity Commuter Stream)
      const optCrowdDots = L.polyline(optPoints, {
        color: '#ffffff',
        weight: 3.5,
        opacity: 0.95,
        className: 'animated-crowd-dots'
      });
      routesLayerRef.current.addLayer(optCrowdDots);

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
      const edge = (transitData.edges as unknown as NetworkEdge[]).find(e => e.id === bus.current_edge);
      if (!edge || !edge.polyline || edge.polyline.length === 0) return;

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

  const isDaytime = activeHour >= 6 && activeHour < 18;

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 transition-all duration-700 ${is3D ? 'map-container-3d' : ''}`}
      />

      {/* Floating Map Perspective & Day/Night Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
        {/* Day / Night ambient indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-lg transition-all ${
            isDaytime
              ? 'bg-amber-950/50 text-amber-300 border-amber-600/40 shadow-amber-500/10'
              : 'bg-slate-900/80 text-cyan-300 border-slate-700/80 shadow-cyan-500/10'
          }`}
          title={`Commute ambient tone: ${isDaytime ? 'Daylight (06:00 - 18:00)' : 'Night Neon Glow'}`}
        >
          {isDaytime ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isDaytime ? 'Sunlight' : 'Night Glow'}</span>
        </div>

        {/* 3D Map Tilt Perspective Button */}
        <button
          onClick={() => {
            sound.playClick();
            setIs3D(!is3D);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border shadow-lg transition-all active:scale-95 ${
            is3D
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-400 shadow-cyan-500/30'
              : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-500'
          }`}
          title="Toggle 3D Perspective Aerial Tilt"
        >
          <Compass className={`w-3.5 h-3.5 transition-transform duration-300 ${is3D ? 'rotate-45 text-white' : 'text-cyan-400'}`} />
          <span>{is3D ? '2D View' : '3D Tilt'}</span>
        </button>
      </div>

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
            <div className="w-4 h-0.5 border-b-2 border-dotted border-white"></div>
            <span className="text-slate-300">Moving Crowd Particles</span>
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
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
            <div className="w-4 h-0.5 border-b-2 border-dashed border-purple-500"></div>
            <span className="text-purple-300 font-medium">Metro Line 1 (Purple)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-b-2 border-dashed border-cyan-400"></div>
            <span className="text-cyan-300 font-medium">Metro Line 2 (Aqua)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
