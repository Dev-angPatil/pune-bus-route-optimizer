import React from 'react';
import { ArrowLeftRight, Clock, Zap, MapPin, Navigation, AlertTriangle, ShieldCheck, BarChart3 } from 'lucide-react';
import transitData from '../data/puneTransitData.json';
import { Hub, Scenario } from '../types/transit';
import { sound } from '../utils/audio';
import { SearchableStopSelect } from './SearchableStopSelect';

interface ControlsPanelProps {
  origin: string;
  destination: string;
  onSelectOrigin: (id: string) => void;
  onSelectDestination: (id: string) => void;
  onSwap: () => void;
  hour: number;
  onChangeHour: (hour: number) => void;
  selectedScenario: string;
  onSelectScenario: (scenario: Scenario) => void;
  onRunOptimization: () => void;
  isOptimizing: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
  onSwap,
  hour,
  onChangeHour,
  selectedScenario,
  onSelectScenario,
  onRunOptimization,
  isOptimizing
}) => {
  const hubs = transitData.hubs as unknown as Hub[];
  const scenarios = transitData.scenarios as unknown as Scenario[];

  // Format hour string (e.g., "08:30 AM")
  const formatHour = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${ampm}`;
  };

  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5 border border-slate-800 shadow-2xl space-y-4">
      {/* Title & Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Route Configuration</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isPeak ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60 animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5" /> High Rush Hour
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              <ShieldCheck className="w-2.5 h-2.5" /> Normal Flow
            </span>
          )}
        </div>
      </div>

      {/* Origin & Destination Selectors */}
      <div className="space-y-3">
        <SearchableStopSelect
          label="Origin Hub"
          marathiLabel="प्रस्थान"
          value={origin}
          onChange={(newOrigin) => {
            sound.playClick();
            onSelectOrigin(newOrigin);
          }}
          hubs={hubs}
          disabledId={destination}
          pinColorClass="bg-cyan-400 text-cyan-400 shadow-cyan-500/50"
          accentBorderClass="border-cyan-400 ring-cyan-400"
          placeholder="Search origin stop (e.g. FC Road, Hinjewadi)..."
        />

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={() => {
              sound.playClick();
              onSwap();
            }}
            className="p-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 shadow-md transition-all hover:scale-110 active:scale-95"
            title="Swap Origin and Destination"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <SearchableStopSelect
          label="Destination Hub"
          marathiLabel="गंतव्य"
          value={destination}
          onChange={(newDest) => {
            sound.playClick();
            onSelectDestination(newDest);
          }}
          hubs={hubs}
          disabledId={origin}
          pinColorClass="bg-emerald-400 text-emerald-400 shadow-emerald-500/50"
          accentBorderClass="border-emerald-400 ring-emerald-400"
          placeholder="Search destination stop (e.g. Phoenix Mall, Swargate)..."
        />
      </div>

      {/* Hourly Traffic Bar Chart & Time of Day Slider */}
      <div className="space-y-2 pt-1 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Commute Time & Hourly Traffic
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {formatHour(hour)}
            </span>
          </div>
        </div>

        {/* Mini 24-Hour Traffic Bar Chart */}
        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
          <div className="flex items-end gap-1 h-12 w-full pt-1 pb-1">
            {transitData.hourly_crowd_curve.map((val: number, h: number) => {
              const isCurrentHour = h === hour;
              // Color based on congestion
              const barColor =
                val > 0.75
                  ? 'bg-rose-500 hover:bg-rose-400'
                  : val > 0.45
                  ? 'bg-amber-500 hover:bg-amber-400'
                  : 'bg-emerald-500 hover:bg-emerald-400';

              const heightPct = Math.max(14, Math.round(val * 100));

              return (
                <button
                  key={`traffic-bar-${h}`}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onChangeHour(h);
                  }}
                  title={`${formatHour(h)}: ${Math.round(val * 100)}% traffic density`}
                  className={`flex-1 transition-all rounded-t-sm flex flex-col justify-end relative group ${
                    isCurrentHour ? 'scale-y-110 z-10' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ height: '100%' }}
                >
                  <div
                    className={`w-full rounded-t-sm transition-all ${barColor} ${
                      isCurrentHour ? 'ring-2 ring-cyan-300 ring-offset-1 ring-offset-slate-950 shadow-lg shadow-cyan-500/50' : ''
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-100 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-md z-30 transition-opacity">
                    {h}:00 ({Math.round(val * 100)}%)
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bar Chart Legend */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Clear (&lt;45%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Moderate (45-75%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Heavy Rush (&gt;75%)
            </span>
          </div>
        </div>

        {/* Range slider */}
        <input
          type="range"
          min="0"
          max="23"
          step="1"
          value={hour}
          onChange={(e) => {
            sound.playClick();
            onChangeHour(parseInt(e.target.value));
          }}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>00:00 (Night)</span>
          <span className="text-rose-400 font-semibold">08:30 (Morning Peak)</span>
          <span className="text-amber-400">14:00 (Lull)</span>
          <span className="text-rose-400 font-semibold">18:45 (Eve Peak)</span>
        </div>
      </div>

      {/* Viva / Demo Scenarios */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Preset Pune Traffic Scenarios
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {scenarios.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  sound.playClick();
                  onSelectScenario(sc);
                }}
                className={`p-2 rounded-xl text-left border transition-all text-xs ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400/80 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="font-semibold truncate">{sc.title.split('(')[0]}</div>
                <div className="text-[10px] text-slate-400 truncate">{formatHour(sc.hour)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Action Button */}
      <button
        onClick={() => {
          sound.playOptimizing();
          onRunOptimization();
        }}
        disabled={isOptimizing}
        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      >
        <Zap className="w-4 h-4 fill-current animate-bounce" />
        <span>{isOptimizing ? 'Computing Dynamic Graph...' : '⚡ Optimize Bus Route'}</span>
      </button>
    </div>
  );
};
