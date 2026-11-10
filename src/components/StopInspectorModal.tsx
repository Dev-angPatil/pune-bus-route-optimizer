import React from 'react';
import { X, Users, Bus, AlertCircle } from 'lucide-react';
import { Hub } from '../types/transit';
import transitData from '../data/puneTransitData.json';
import { sound } from '../utils/audio';

interface StopInspectorModalProps {
  hub: Hub | null;
  onClose: () => void;
  activeHour: number;
}

export const StopInspectorModal: React.FC<StopInspectorModalProps> = ({
  hub,
  onClose,
  activeHour
}) => {
  if (!hub) return null;

  const baseCurve = transitData.hourly_crowd_curve[activeHour % 24] || 0.5;
  const crowd = Math.min(1.0, baseCurve * (hub.peak_rush_multiplier / 2.5));
  const crowdPct = Math.round(crowd * 100);

  // Find incoming and outgoing routes serving this hub
  const connectedEdges = (transitData.edges as unknown as {
    source: string;
    target: string;
    bus_routes: string[];
    corridor: string;
  }[]).filter(e => e.source === hub.id || e.target === hub.id);

  const busRoutes = Array.from(
    new Set(connectedEdges.flatMap(e => e.bus_routes))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
              {hub.category}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">{hub.name}</h2>
            <div className="text-sm font-semibold text-slate-500">{hub.marathi}</div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Crowd Level Gauge */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" /> Real-time Crowd Pressure
            </span>
            <span className={`font-mono font-bold ${crowdPct > 70 ? 'text-rose-600' : crowdPct > 45 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {crowdPct}% ({crowdPct > 70 ? 'Severe Bottleneck' : crowdPct > 45 ? 'Moderate Flow' : 'Smooth Flow'})
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                crowdPct > 70
                  ? 'bg-rose-500'
                  : crowdPct > 45
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${crowdPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
            <span>Daily Capacity: {(hub.capacity).toLocaleString()} pass/day</span>
            <span>Surge Multiplier: {hub.peak_rush_multiplier}x</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Transit Significance
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            {hub.description}
          </p>
        </div>

        {/* Serving PMPML Routes */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Bus className="w-3.5 h-3.5 text-blue-600" /> Connected Bus Corridors ({busRoutes.length} Routes)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {busRoutes.map(route => (
              <span
                key={`route-badge-${route}`}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
              >
                Bus {route}
              </span>
            ))}
          </div>
        </div>

        {/* Coords & Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>Lat: {hub.lat}° N, Lon: {hub.lon}° E</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
