import React from 'react';
import { Bus, Activity, Zap, CheckCircle } from 'lucide-react';
import { ActiveBus } from '../types/transit';

interface ActiveBusesPanelProps {
  buses: ActiveBus[];
}

export const ActiveBusesPanel: React.FC<ActiveBusesPanelProps> = ({ buses }) => {
  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5 border border-slate-800 shadow-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Live Simulated PMPML Fleet ({buses.length} Buses)
          </span>
        </div>
        <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live GPS Feed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {buses.map((bus) => {
          const isCrowded = bus.passenger_occupancy > 85;
          return (
            <div
              key={bus.bus_number}
              className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 hover:border-cyan-500/40 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-cyan-400 flex items-center gap-1">
                  <Bus className="w-3.5 h-3.5" /> Route {bus.route_code}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{bus.bus_number}</span>
              </div>

              <div className="text-[11px] font-medium text-slate-200 truncate" title={bus.route_name}>
                {bus.route_name}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="text-emerald-400 font-semibold">{bus.speed_kmh} km/h</span>
                <span className={isCrowded ? 'text-rose-400 font-semibold' : 'text-amber-300'}>
                  {bus.passenger_occupancy}% Full
                </span>
              </div>

              {/* Occupancy bar */}
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isCrowded ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${bus.passenger_occupancy}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
