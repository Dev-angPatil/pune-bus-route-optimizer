import React from 'react';
import { X, Users, Bus, AlertCircle, Clock } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider">
              {hub.category}
            </span>
            <h2 className="text-xl font-extrabold text-white">{hub.name}</h2>
            <div className="text-sm font-semibold text-slate-400">{hub.marathi}</div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Crowd Level Gauge */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" /> Real-time Crowd Pressure
            </span>
            <span className={`font-mono font-bold ${crowdPct > 70 ? 'text-rose-400' : crowdPct > 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {crowdPct}% ({crowdPct > 70 ? 'Severe Bottleneck' : crowdPct > 45 ? 'Moderate' : 'Smooth Flow'})
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                crowdPct > 70
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_12px_#ef4444]'
                  : crowdPct > 45
                  ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500'
              }`}
              style={{ width: `${crowdPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Daily Footfall Capacity: {(hub.capacity).toLocaleString()} pass/day</span>
            <span>Surge Sensitivity: {hub.peak_rush_multiplier}x</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" /> Transit Significance
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
            {hub.description}
          </p>
        </div>

        {/* Serving PMPML Routes */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Bus className="w-3.5 h-3.5 text-emerald-400" /> Active PMPML Bus Services ({busRoutes.length} Routes)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {busRoutes.map(route => (
              <span
                key={`route-badge-${route}`}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-cyan-300 border border-slate-700"
              >
                Bus {route}
              </span>
            ))}
          </div>
        </div>

        {/* Coords & Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
          <span>Lat: {hub.lat}° N, Lon: {hub.lon}° E</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
