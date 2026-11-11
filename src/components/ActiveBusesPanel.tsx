import React from 'react';
import { Bus, Activity } from 'lucide-react';
import { ActiveBus } from '../types/transit';

interface ActiveBusesPanelProps {
  buses: ActiveBus[];
}

export const ActiveBusesPanel: React.FC<ActiveBusesPanelProps> = ({ buses }) => {
  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Live Simulated PMPML Fleet Telemetry ({buses.length} Active Buses)
          </span>
        </div>
        <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Fleet Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {buses.map((bus) => {
          const isCrowded = bus.passenger_occupancy > 85;
          return (
            <div
              key={bus.bus_number}
              className="bg-slate-50 hover:bg-blue-50/30 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all space-y-2 shadow-2xs hover:shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-700 flex items-center gap-1.5 text-sm">
                  <Bus className="w-4 h-4 text-blue-600" /> Route {bus.route_code}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {bus.bus_number}
                </span>
              </div>

              <div className="text-xs font-medium text-slate-800 truncate" title={bus.route_name}>
                {bus.route_name}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
                <span className="text-emerald-700 font-semibold">{bus.speed_kmh} km/h</span>
                <span className={isCrowded ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                  {bus.passenger_occupancy}% Full
                </span>
              </div>

              {/* Occupancy bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isCrowded ? 'bg-rose-500' : 'bg-blue-600'
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
