import React from 'react';
import { ArrowLeftRight, Clock, Zap, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';
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
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/90 shadow-xl space-y-4">
      {/* Title & Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Trip Planner</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isPeak ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Rush Hour
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Normal Flow
            </span>
          )}
        </div>
      </div>

      {/* Origin & Destination Selectors */}
      <div className="space-y-3">
        <SearchableStopSelect
          label="Departure Hub"
          marathiLabel="प्रस्थान"
          value={origin}
          onChange={(newOrigin) => {
            sound.playClick();
            onSelectOrigin(newOrigin);
          }}
          hubs={hubs}
          disabledId={destination}
          pinColorClass="bg-blue-600 text-blue-600"
          accentBorderClass="border-blue-500 ring-blue-500"
          placeholder="Search departure stop (e.g. Swargate, Katraj)..."
        />

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={() => {
              sound.playClick();
              onSwap();
            }}
            className="p-2 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 shadow-xs transition-all hover:scale-110 active:scale-95"
            title="Swap Departure and Destination"
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
          pinColorClass="bg-indigo-600 text-indigo-600"
          accentBorderClass="border-indigo-500 ring-indigo-500"
          placeholder="Search arrival stop (e.g. Hinjewadi, Phoenix Mall)..."
        />
      </div>

      {/* Hourly Traffic Bar Chart & Time of Day Slider */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Commute Time &amp; Hourly Traffic
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              {formatHour(hour)}
            </span>
          </div>
        </div>

        {/* Mini 24-Hour Traffic Bar Chart */}
        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
          <div className="flex items-end gap-1 h-12 w-full pt-1 pb-1">
            {transitData.hourly_crowd_curve.map((val: number, h: number) => {
              const isCurrentHour = h === hour;
              const barColor =
                val > 0.75
                  ? 'bg-rose-400 hover:bg-rose-500'
                  : val > 0.45
                  ? 'bg-amber-400 hover:bg-amber-500'
                  : 'bg-emerald-400 hover:bg-emerald-500';

              const heightPct = Math.max(16, Math.round(val * 100));

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
                      isCurrentHour ? 'ring-2 ring-blue-600 ring-offset-1 ring-offset-white shadow-sm' : ''
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-md z-30 transition-opacity">
                    {h}:00 ({Math.round(val * 100)}%)
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bar Chart Legend */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/60 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Clear (&lt;45%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Moderate (45-75%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Peak Rush (&gt;75%)
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
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
          <span>12:00 AM (Night)</span>
          <span className="text-rose-600 font-semibold">8:30 AM (Peak)</span>
          <span className="text-amber-600">2:00 PM (Lull)</span>
          <span className="text-rose-600 font-semibold">6:45 PM (Peak)</span>
        </div>
      </div>

      {/* Preset Pune Commuter Scenarios */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Preset Commute Scenarios
        </span>
        <div className="grid grid-cols-2 gap-2">
          {scenarios.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  sound.playClick();
                  onSelectScenario(sc);
                }}
                className={`p-2.5 rounded-2xl text-left border transition-all text-xs ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                }`}
              >
                <div className="font-semibold truncate text-slate-900">{sc.title.split('(')[0]}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{formatHour(sc.hour)}</div>
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
        className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>{isOptimizing ? 'Evaluating Dynamic Corridors...' : 'Calculate Optimal Route'}</span>
      </button>
    </div>
  );
};
