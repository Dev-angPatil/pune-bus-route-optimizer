import React from 'react';
import { ArrowLeftRight, Clock, Zap, MapPin, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';
import transitData from '../data/puneTransitData.json';
import { Hub, Scenario } from '../types/transit';
import { sound } from '../utils/audio';

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
      <div className="space-y-2.5">
        <div className="relative">
          <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span> Origin Hub (प्रस्थान)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={origin}
              onChange={(e) => {
                sound.playClick();
                onSelectOrigin(e.target.value);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 text-slate-100 rounded-xl text-xs md:text-sm border border-slate-700/80 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 appearance-none cursor-pointer"
            >
              {hubs.map((hub) => (
                <option key={`origin-${hub.id}`} value={hub.id} disabled={hub.id === destination}>
                  {hub.name} ({hub.category})
                </option>
              ))}
            </select>
          </div>
        </div>

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

        <div className="relative">
          <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Destination Hub (गंतव्य)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={destination}
              onChange={(e) => {
                sound.playClick();
                onSelectDestination(e.target.value);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 text-slate-100 rounded-xl text-xs md:text-sm border border-slate-700/80 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 appearance-none cursor-pointer"
            >
              {hubs.map((hub) => (
                <option key={`dest-${hub.id}`} value={hub.id} disabled={hub.id === origin}>
                  {hub.name} ({hub.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Time of Day Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Commute Time
          </span>
          <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {formatHour(hour)}
          </span>
        </div>
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
