import React, { useState } from 'react';
import {
  TrendingDown,
  Clock,
  Gauge,
  Leaf,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  CheckCircle2,
  Bus,
  ArrowRight,
  Download
} from 'lucide-react';
import { OptimizationComparison } from '../types/transit';
import { exportRouteSlip } from '../utils/routeExport';
import { sound } from '../utils/audio';

interface MetricsPanelProps {
  comparison: OptimizationComparison;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ comparison }) => {
  const [showSegments, setShowSegments] = useState<boolean>(false);
  const std = comparison.standard_route;
  const opt = comparison.crowd_optimized_route;
  const m = comparison.metrics;

  const hasSavings = m.time_saved_percentage > 0;

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5 border border-slate-800 shadow-2xl space-y-4">
      {/* Top Banner / Verdict & Export Button */}
      <div className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
        hasSavings
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
      }`}>
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {hasSavings ? 'Crowd Bypass Active' : 'Optimal Direct Corridor'}
            </div>
            <div className="text-xs text-slate-200 font-medium mt-0.5">
              {m.verdict}
            </div>
          </div>
        </div>

        {/* Download Route Summary Slip Button */}
        <button
          onClick={() => {
            sound.playClick();
            exportRouteSlip(comparison);
          }}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-400 transition-all shadow-md active:scale-95"
          title="Download Travel Slip as PDF"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Slip</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Time Saved KPI */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>Time Saved</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg md:text-xl font-extrabold text-cyan-300 font-mono mt-1">
            {m.time_saved_minutes} <span className="text-xs font-normal">mins</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
            <TrendingDown className="w-3 h-3" /> {m.time_saved_percentage}% faster
          </div>
        </div>

        {/* Travel Time */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>Est. Transit</span>
            <Bus className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg md:text-xl font-extrabold text-emerald-300 font-mono mt-1">
            {opt.estimated_travel_time_mins} <span className="text-xs font-normal">mins</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Std: {std.estimated_travel_time_mins} mins
          </div>
        </div>

        {/* Crowd Reduction */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>Avg Crowd</span>
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg md:text-xl font-extrabold text-amber-300 font-mono mt-1">
            {opt.average_crowd_exposure_percent}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Std: {std.average_crowd_exposure_percent}%
          </div>
        </div>

        {/* Green CO2 Emissions */}
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>CO₂ Saved</span>
            <Leaf className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-lg md:text-xl font-extrabold text-teal-300 font-mono mt-1">
            {m.co2_saved_kg > 0 ? `${m.co2_saved_kg} kg` : '0 kg'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Congestion cut
          </div>
        </div>
      </div>

      {/* Side-by-Side Path Breakdown */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Path Comparison Breakdown
        </div>

        {/* Standard Route Card */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-rose-950/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-rose-400 flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span>
              Standard Route (Dijkstra Shortest Physical Path)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">{std.total_distance_km} km</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
            {std.path_names.map((name, idx) => (
              <React.Fragment key={`std-path-${idx}`}>
                <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[11px]">
                  {name}
                </span>
                {idx < std.path_names.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Dynamic Route Card */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-900/60 space-y-2 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              ⚡ Crowd-Optimized Dynamic Route (Adaptive Cost Path)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">{opt.total_distance_km} km</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-200">
            {opt.path_names.map((name, idx) => (
              <React.Fragment key={`opt-path-${idx}`}>
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/70 text-cyan-200 text-[11px] font-medium">
                  {name}
                </span>
                {idx < opt.path_names.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-cyan-500" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* PMPML Dispatch Advisory */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-800/40 flex items-start gap-2.5 text-xs">
        <Bus className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider">
            PMPML Smart Dispatch Advisory
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {m.time_saved_percentage > 20
              ? `High congestion detected along city center corridors. Recommend deploying 4 additional electric feeder buses via Western Ring / NH48 bypass to clear ${comparison.origin} crowd buildup.`
              : `Current passenger flow is operating near normal schedule. PMPML headway intervals of 8-12 minutes are sufficient for this corridor.`}
          </p>
        </div>
      </div>

      {/* Expandable Turn-by-Turn Segments */}
      <div className="pt-1">
        <button
          onClick={() => setShowSegments(!showSegments)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1"
        >
          <span>Segment-by-Segment Transit Telemetry ({opt.segments.length} hops)</span>
          {showSegments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSegments && (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="p-2">Segment Corridor</th>
                  <th className="p-2">Dist</th>
                  <th className="p-2">Est. Time</th>
                  <th className="p-2">Crowd</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300 text-[11px]">
                {opt.segments.map((seg, idx) => (
                  <tr key={`seg-${idx}`} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-2 font-medium">
                      {seg.from} ➔ {seg.to}
                    </td>
                    <td className="p-2 font-mono">{seg.distance_km} km</td>
                    <td className="p-2 font-mono text-cyan-300">{seg.travel_time_mins} min</td>
                    <td className="p-2 font-mono">
                      <span className={seg.crowd_index > 0.7 ? 'text-rose-400' : 'text-emerald-400'}>
                        {Math.round(seg.crowd_index * 100)}%
                      </span>
                    </td>
                    <td className="p-2">
                      {seg.is_chokepoint ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950 text-rose-300 border border-rose-800">
                          Bottleneck
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Clear
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
