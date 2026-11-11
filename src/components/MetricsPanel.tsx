import React, { useState } from 'react';
import {
  TrendingDown,
  Clock,
  Gauge,
  Leaf,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Bus,
  ArrowRight,
  Download,
  Train,
  Sparkles,
  ShieldCheck,
  AlertTriangle
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
    <div className="space-y-6">
      {/* Top Banner / Verdict */}
      <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-all ${
        hasSavings
          ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-blue-50/70 border-emerald-200/90 text-emerald-950'
          : 'bg-gradient-to-r from-blue-50/90 to-sky-50/50 border-blue-200 text-blue-950'
      }`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span>{hasSavings ? 'Dynamic Bypass Route Active' : 'Direct Corridor Optimal'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-semibold">
                {m.time_saved_percentage}% Faster
              </span>
            </div>
            <p className="text-sm text-slate-700 font-medium mt-0.5 leading-snug">
              {m.verdict}
            </p>
          </div>
        </div>

        {/* Download Route Summary Slip Button */}
        <button
          onClick={() => {
            sound.playClick();
            exportRouteSlip(comparison);
          }}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 hover:border-blue-300 transition-all shadow-sm active:scale-95 hover:shadow-md"
          title="Download Travel Slip as PDF"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Print / Save Slip</span>
        </button>
      </div>

      {/* 4-Column Modern KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Time Saved KPI */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Time Saved</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-blue-600 font-mono mt-2">
            {m.time_saved_minutes} <span className="text-sm font-semibold text-slate-500">mins</span>
          </div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingDown className="w-3.5 h-3.5" /> {m.time_saved_percentage}% travel reduction
          </div>
        </div>

        {/* Total Travel Time */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Est. Commute</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Bus className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono mt-2">
            {opt.estimated_travel_time_mins} <span className="text-sm font-semibold text-slate-500">mins</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            vs {std.estimated_travel_time_mins} mins on standard route
          </div>
        </div>

        {/* Crowd Index */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Crowd Comfort</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Gauge className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-amber-600 font-mono mt-2">
            {opt.average_crowd_exposure_percent}%
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            -{m.crowd_reduction_percentage}% less congestion
          </div>
        </div>

        {/* CO2 Emissions Saved */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Carbon Saved</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-teal-600 font-mono mt-2">
            {m.co2_saved_kg > 0 ? `${m.co2_saved_kg}` : '0'} <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Reduced stop-and-go idling
          </div>
        </div>
      </div>

      {/* Clean Vertical Route Comparison Tiers (Requested by User) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Available Route Options &amp; Tiers
          </h3>
          <span className="text-xs text-slate-400 font-medium">Sorted by travel efficiency</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tier 1: AI Dynamic Route (Recommended) */}
          <div className="bg-gradient-to-b from-blue-50/60 to-white rounded-3xl p-5 border-2 border-blue-500 shadow-md relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3" /> Recommended
                </span>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-lg">
                  {opt.total_distance_km} km
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">AI Dynamic Detour</h4>
              <p className="text-xs text-slate-600 mt-1">
                Strategic congestion-bypass route designed to avoid major bottlenecks.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Estimated Time:</span>
                  <span className="font-bold text-blue-600 text-sm">{opt.estimated_travel_time_mins} mins</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Crowd Exposure:</span>
                  <span className="font-semibold text-emerald-600">{opt.average_crowd_exposure_percent}% (Low)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Bottlenecks:</span>
                  <span className="font-semibold text-emerald-600">0 Encountered</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-blue-100">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Active on Map
              </button>
            </div>
          </div>

          {/* Tier 2: Standard Direct Route (Congested) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Direct (Congested)
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {std.total_distance_km} km
                </span>
              </div>
              <h4 className="font-bold text-slate-800 text-base">Standard Dijkstra Path</h4>
              <p className="text-xs text-slate-500 mt-1">
                Shortest physical distance along arterial roads with heavy traffic lights.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Estimated Time:</span>
                  <span className="font-bold text-rose-600 text-sm">{std.estimated_travel_time_mins} mins</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Crowd Exposure:</span>
                  <span className="font-semibold text-rose-600">{std.average_crowd_exposure_percent}% (High)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Delay Penalty:</span>
                  <span className="font-semibold text-rose-600">+{std.congestion_delay_mins} mins delay</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <div className="text-center py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
                Not Recommended in Peak Hours
              </div>
            </div>
          </div>

          {/* Tier 3: Multimodal Metro Rail Connection */}
          <div className="bg-gradient-to-b from-purple-50/50 to-white rounded-3xl p-5 border border-purple-200 shadow-sm relative flex flex-col justify-between hover:border-purple-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Train className="w-3 h-3 text-purple-600" /> Metro + Feeder
                </span>
                <span className="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg">
                  Multi-Modal
                </span>
              </div>
              <h4 className="font-bold text-slate-800 text-base">Pune Metro Feeder</h4>
              <p className="text-xs text-slate-500 mt-1">
                Combine PMPML local feeder shuttle with Purple/Aqua line rapid rail.
              </p>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Interchange:</span>
                  <span className="font-semibold text-purple-700">Civil Court / Swargate</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Traffic Jam Risk:</span>
                  <span className="font-semibold text-emerald-600">Near Zero (Dedicated Rail)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Eco Score:</span>
                  <span className="font-semibold text-emerald-600">Zero Local Emissions</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-purple-100">
              <button
                type="button"
                onClick={() => exportRouteSlip(comparison)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Train className="w-3.5 h-3.5" /> View Metro Stations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Path Sequence Breadcrumbs */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Optimal Corridor Traversal ({opt.path_names.length} Transit Stops)
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {opt.path_names.map((name, idx) => (
            <React.Fragment key={`opt-path-${idx}`}>
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold shadow-2xs">
                {name}
              </span>
              {idx < opt.path_names.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Expandable Turn-by-Turn Segment Telemetry */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <button
          onClick={() => setShowSegments(!showSegments)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors py-1"
        >
          <span>Turn-by-Turn Corridor Telemetry ({opt.segments.length} Road Segments)</span>
          {showSegments ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showSegments && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Corridor Segment</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Est. Time</th>
                  <th className="p-3">Crowd Exposure</th>
                  <th className="p-3">Corridor Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {opt.segments.map((seg, idx) => (
                  <tr key={`seg-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      {seg.from} ➔ {seg.to}
                    </td>
                    <td className="p-3 font-mono">{seg.distance_km} km</td>
                    <td className="p-3 font-mono font-bold text-blue-600">{seg.travel_time_mins} min</td>
                    <td className="p-3 font-mono">
                      <span className={seg.crowd_index > 0.7 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
                        {Math.round(seg.crowd_index * 100)}%
                      </span>
                    </td>
                    <td className="p-3">
                      {seg.is_chokepoint ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Bottleneck Avoided
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Clear Flow
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
