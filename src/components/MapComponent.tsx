import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Sun, Moon, Layers, Bus as BusIcon, Train } from 'lucide-react';
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

  // Update Base Tile Layer dynamically with clean light style
  useEffect(() => {
    if (!mapInstanceRef.current || !mapContainerRef.current) return;
    const map = mapInstanceRef.current;
    const container = mapContainerRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }

    container.classList.remove('osm-dark-tiles', 'osm-day-tiles', 'clean-tiles', 'osm-light-tiles');
    container.classList.add('clean-tiles');

    // High quality light tile provider: CARTO Positron by default for crisp contrast
    let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>';
    let subdomains = 'abcd';
    let maxZoom = 19;

    if (tileProvider === 'osm_standard') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> | PMPML Pune';
      subdomains = 'abc';
    } else if (tileProvider === 'mapbox' && apiKey && apiKey.trim().length > 0) {
      url = `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${apiKey.trim()}`;
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

  // Render Background Corridors with smooth light gray/sky lines
  useEffect(() => {
    if (!corridorsLayerRef.current) return;
    corridorsLayerRef.current.clearLayers();

    if (!showAllCorridors) return;

    (transitData.edges as unknown as NetworkEdge[]).forEach(edge => {
      const isChoke = edge.is_chokepoint;
      const poly = L.polyline(edge.polyline, {
        color: isChoke ? '#f59e0b' : '#cbd5e1',
        weight: isChoke ? 2.5 : 1.5,
        opacity: isChoke ? 0.75 : 0.45,
        dashArray: isChoke ? '4, 4' : undefined,
        lineCap: 'round',
        lineJoin: 'round'
      });

      poly.bindTooltip(
        `<div class="text-xs font-sans">
          <span class="font-bold text-blue-600">${edge.corridor}</span><br/>
          <span class="text-slate-600">Distance: ${edge.distance_km} km | Bus Lines: ${edge.bus_routes.slice(0, 3).join(', ')}</span>
        </div>`,
        { sticky: true }
      );

      corridorsLayerRef.current?.addLayer(poly);
    });
  }, [showAllCorridors]);

  // Render Pune Metro Rail Network (Purple Line & Aqua Line)
  useEffect(() => {
    if (!metroLayerRef.current) return;
    metroLayerRef.current.clearLayers();

    if (!showMetro) return;

    metroData.lines.forEach((line) => {
      const latlngs: [number, number][] = line.stations.map((s) => [s.lat, s.lon]);

      // Metro Track Line (sleek distinctive line)
      const metroTrack = L.polyline(latlngs, {
        color: line.color,
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 6',
        lineCap: 'round'
      });

      metroTrack.bindTooltip(
        `<div class="text-xs font-sans">
          <strong style="color: ${line.color}; font-size: 13px;">${line.name}</strong><br/>
          <span class="text-slate-700">${line.marathi} • ${line.length_km} km</span><br/>
          <span class="text-slate-500 font-medium">${line.corridor}</span>
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
                  ? `<div class="absolute inset-0 rounded-full animate-ping opacity-60" style="background: ${line.color};"></div>`
                  : ''
              }
              <div class="relative z-10 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                   style="background: ${line.color};">
              </div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const feeder = metroData.multimodal_feeder_routes.find((f) => f.metro_station.includes(st.name));

        const marker = L.marker([st.lat, st.lon], { icon: stationIcon });
        marker.bindTooltip(
          `<div class="text-xs space-y-1 font-sans">
            <div class="font-bold flex items-center gap-1" style="color: ${line.color}; font-size: 13px;">
              🚆 ${st.name}
            </div>
            <div class="text-[11px] text-slate-600 font-medium">${line.name}</div>
            ${
              feeder
                ? `<div class="pt-1.5 border-t border-slate-100 text-[11px] text-blue-700">
                    <strong>PMPML Feeders:</strong> ${feeder.pmpml_feeder_buses.join(', ')}<br/>
                    <span class="text-slate-600">Connects: ${feeder.connects_to.join(', ')}</span>
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

  // Render Crowd Heatmap with soft amber/blue tones
  useEffect(() => {
    if (!heatmapLayerRef.current) return;
    heatmapLayerRef.current.clearLayers();

    if (!showHeatmap) return;

    (transitData.hubs as unknown as Hub[]).forEach(hub => {
      const baseCurve = transitData.hourly_crowd_curve[activeHour % 24] || 0.5;
      let crowd = Math.min(1.0, baseCurve * (hub.peak_rush_multiplier / 2.5));
      if (surgeNodes.includes(hub.id)) crowd = Math.min(1.0, crowd * 1.45 + 0.15);

      if (crowd > 0.45) {
        const radius = Math.round(500 + crowd * 1300);
        const color = crowd > 0.75 ? '#f43f5e' : crowd > 0.55 ? '#f59e0b' : '#3b82f6';
        
        const circle = L.circle([hub.lat, hub.lon], {
          radius,
          color,
          weight: 0,
          fillColor: color,
          fillOpacity: crowd * 0.18
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

    // Standard Route: Soft Slate Dashed Line (Non-intrusive)
    if (stdPoints.length > 0) {
      const stdPoly = L.polyline(stdPoints, {
        color: '#94a3b8',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round'
      });
      stdPoly.bindTooltip(
        `<div class="text-xs font-sans">
          <strong class="text-slate-800">Standard Direct Route (Congested)</strong><br/>
          <span class="text-slate-600">Travel Time: ${std.estimated_travel_time_mins} mins | Delay: +${std.congestion_delay_mins} mins</span><br/>
          <span class="text-amber-600 font-semibold">Crowd Exposure: ${std.average_crowd_exposure_percent}%</span>
        </div>`,
        { sticky: true }
      );
      routesLayerRef.current.addLayer(stdPoly);
    }

    // Optimized Route: Vibrant Electric Blue Path (#2563eb)
    if (optPoints.length > 0) {
      // Soft translucent glow backing
      const glowPoly = L.polyline(optPoints, {
        color: '#93c5fd',
        weight: 9,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round'
      });
      routesLayerRef.current.addLayer(glowPoly);

      // Primary crisp electric blue path
      const optPoly = L.polyline(optPoints, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.98,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'animated-route-flow animated-route-pulse'
      });
      optPoly.bindTooltip(
        `<div class="text-xs font-sans space-y-0.5">
          <div class="font-bold text-blue-600 flex items-center gap-1">
            ⚡ Optimal Dynamic Bypass Route
          </div>
          <div class="text-slate-800 font-medium">Time: ${opt.estimated_travel_time_mins} mins (${comparison.metrics.time_saved_percentage}% faster)</div>
          <div class="text-slate-500">Distance: ${opt.total_distance_km} km | CO₂: ${opt.estimated_co2_kg} kg</div>
        </div>`,
        { sticky: true }
      );
      routesLayerRef.current.addLayer(optPoly);

      // Moving Crowd Dots (White & Sky Blue commuter particles)
      const optCrowdDots = L.polyline(optPoints, {
        color: '#ffffff',
        weight: 3,
        opacity: 0.95,
        className: 'animated-crowd-dots'
      });
      routesLayerRef.current.addLayer(optCrowdDots);

      // Smooth camera fit
      const allBounds = L.latLngBounds([...optPoints, ...stdPoints]);
      mapInstanceRef.current.fitBounds(allBounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [comparison]);

  // Render Pune Hub Nodes - Clean White Circles with Vibrant Blue / Amber Rings
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

      const ringColor = isHighCrowd ? '#f43f5e' : isMedCrowd ? '#f59e0b' : '#2563eb';

      const customIcon = L.divIcon({
        className: 'custom-hub-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 26px; height: 26px;">
            ${isHighCrowd ? `<div class="absolute inset-0 rounded-full animate-ping opacity-40 bg-rose-500"></div>` : ''}
            <div class="relative z-10 w-4 h-4 rounded-full flex items-center justify-center bg-white shadow-md transition-transform duration-200 group-hover:scale-125"
                 style="border: 3px solid ${ringColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-slate-800 border border-slate-200 shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
              ${hub.name.split(' ')[0]} (${crowdPct}%)
            </div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([hub.lat, hub.lon], { icon: customIcon });

      marker.on('click', () => {
        onSelectHub(hub);
      });

      marker.bindTooltip(
        `<div class="text-xs space-y-1 font-sans">
          <div class="font-bold text-slate-900 text-sm">${hub.name}</div>
          <div class="text-slate-500 font-medium">${hub.marathi}</div>
          <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isHighCrowd
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : isMedCrowd
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }">
              ${crowdPct}% Crowd Load
            </span>
            <span class="text-[11px] text-slate-500 font-medium">Cap: ${(hub.capacity / 1000).toFixed(0)}k/day</span>
          </div>
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
      const [bLat, bLon] = edge.polyline[midIdx] || [18.5204, 73.8567];

      const busIcon = L.divIcon({
        className: 'active-bus-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 30px; height: 30px;">
            <div class="w-6 h-6 rounded-xl bg-white border border-blue-400 text-blue-600 flex items-center justify-center shadow-md transition-transform group-hover:scale-125">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="16" height="16" x="4" y="3" rx="2"/>
                <path d="M4 11h16"/>
                <path d="M8 15h.01"/>
                <path d="M16 15h.01"/>
                <path d="M6 19v2"/>
                <path d="M18 19v2"/>
              </svg>
            </div>
            <div class="absolute -top-4 bg-blue-600 text-white font-mono font-bold text-[8px] px-1 rounded shadow-xs">
              ${bus.route_code}
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const busMarker = L.marker([bLat, bLon], { icon: busIcon });
      busMarker.bindTooltip(
        `<div class="text-xs space-y-1 font-sans">
          <div class="font-bold text-blue-700">PMPML Bus #${bus.route_code} (${bus.bus_number})</div>
          <div class="text-slate-800 font-medium">${bus.route_name}</div>
          <div class="text-slate-500 text-[11px]">${bus.type}</div>
          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 font-medium">
            <span class="text-emerald-600 font-semibold">${bus.speed_kmh} km/h</span>
            <span class="text-amber-600 font-semibold">${bus.passenger_occupancy}% Load</span>
          </div>
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      busesLayerRef.current?.addLayer(busMarker);
    });
  }, [activeBuses]);

  const isDaytime = activeHour >= 6 && activeHour < 18;

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 transition-all duration-700 ${is3D ? 'map-container-3d' : ''}`}
      />

      {/* Floating Map Perspective & Day/Night Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
        {/* Day / Night ambient indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm ${
            isDaytime ? 'text-amber-700' : 'text-blue-700'
          }`}
          title={`Commute ambient tone: ${isDaytime ? 'Daylight (06:00 - 18:00)' : 'Night Ambient'}`}
        >
          {isDaytime ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
          <span>{isDaytime ? 'Daylight' : 'Night'}</span>
        </div>

        {/* 3D Map Tilt Perspective Button */}
        <button
          onClick={() => {
            sound.playClick();
            setIs3D(!is3D);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/95 backdrop-blur-md border shadow-sm transition-all active:scale-95 ${
            is3D
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'text-slate-700 border-slate-200 hover:text-blue-600 hover:border-blue-300'
          }`}
          title="Toggle 3D Perspective Aerial Tilt"
        >
          <Compass className={`w-3.5 h-3.5 transition-transform duration-300 ${is3D ? 'rotate-45 text-white' : 'text-blue-600'}`} />
          <span>{is3D ? '2D Top-Down' : '3D View'}</span>
        </button>
      </div>

      {/* Modern Clean Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 text-xs space-y-2.5 border border-slate-200 shadow-lg max-w-[240px]">
        <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Map Legend</div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-blue-600 shadow-xs"></div>
            <span className="text-slate-800 font-medium">Optimal AI Route</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-0.5 border-b-2 border-dashed border-slate-400"></div>
            <span className="text-slate-600">Standard Congested Route</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-0.5 border-b-2 border-dotted border-blue-500"></div>
            <span className="text-slate-600">Moving Commuter Stream</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <span className="text-slate-600">Severe Chokepoint (&gt;75%)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <span className="text-slate-600">Moderate Rush (45-75%)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <BusIcon className="w-2.5 h-2.5" />
            </div>
            <span className="text-slate-800 font-medium">Active PMPML Bus</span>
          </div>
          <div className="flex items-center gap-2.5 pt-1.5 border-t border-slate-100">
            <div className="w-4 h-0.5 border-b-2 border-dashed border-purple-600"></div>
            <span className="text-purple-700 font-semibold">Metro Line 1 (Purple)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-0.5 border-b-2 border-dashed border-sky-500"></div>
            <span className="text-sky-700 font-semibold">Metro Line 2 (Aqua)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
