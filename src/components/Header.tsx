import React from 'react';
import { Bus, Volume2, VolumeX, BookOpen, Layers, Flame, Map, Train, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  showAllCorridors: boolean;
  onToggleCorridors: () => void;
  showMetro: boolean;
  onToggleMetro: () => void;
  onOpenAlgorithmGuide: () => void;
  onOpenMapSettings: () => void;
  tileProvider: string;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  showHeatmap,
  onToggleHeatmap,
  showAllCorridors,
  onToggleCorridors,
  showMetro,
  onToggleMetro,
  onOpenAlgorithmGuide,
  onOpenMapSettings,
  tileProvider
}) => {
  return (
    <header className="h-16 px-4 md:px-8 bg-white/85 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between z-30 sticky top-0 shadow-2xs">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 p-0.5 flex items-center justify-center shadow-md shadow-blue-500/20">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Bus className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              PUNE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">TRANSIT</span> PULSE
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
              <Sparkles className="w-2.5 h-2.5" /> PMPML + Metro
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden md:block font-medium">
            Smart Commute &amp; Congestion Avoidance Platform
          </p>
        </div>
      </div>

      {/* Action Controls & Navigation Pills */}
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* Pune Metro Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleMetro();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            showMetro
              ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-xs'
              : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
          }`}
          title="Toggle Pune Metro Rail Network"
        >
          <Train className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden sm:inline">Pune Metro</span>
        </button>

        {/* Heatmap Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleHeatmap();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            showHeatmap
              ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs'
              : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
          }`}
          title="Toggle Crowd Density Heatmap"
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden sm:inline">Heatmap</span>
        </button>

        {/* Corridors Grid Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleCorridors();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            showAllCorridors
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
              : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
          }`}
          title="Toggle Road Network Grid"
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden lg:inline">Network Grid</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            onToggleSound();
            sound.playClick();
          }}
          className={`p-2 rounded-xl text-xs transition-colors border ${
            soundEnabled
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
          }`}
          title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* College Project Viva / Algorithm Guide Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenAlgorithmGuide();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Project Guide &amp; Viva</span>
          <span className="sm:hidden">Docs</span>
        </button>
      </div>
    </header>
  );
};
