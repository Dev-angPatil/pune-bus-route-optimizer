import React from 'react';
import { Bus, Volume2, VolumeX, Sparkles, BookOpen, Layers, Flame } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  showAllCorridors: boolean;
  onToggleCorridors: () => void;
  onOpenAlgorithmGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  showHeatmap,
  onToggleHeatmap,
  showAllCorridors,
  onToggleCorridors,
  onOpenAlgorithmGuide
}) => {
  return (
    <header className="h-16 px-4 md:px-6 bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-20 sticky top-0">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.35)]">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Bus className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              PUNE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">PMPML</span> PULSE
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
              AI Transit Optimizer
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Adaptive Graph Optimization &amp; Crowd Bottleneck Bypass for Pune City
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Heatmap Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleHeatmap();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showHeatmap
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
          title="Toggle Crowd Density Heatmap"
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Heatmap</span>
        </button>

        {/* Corridors Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleCorridors();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showAllCorridors
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
          title="Toggle Road Network Network Grid"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Network Grid</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            onToggleSound();
            sound.playClick();
          }}
          className={`p-2 rounded-lg text-xs transition-colors border ${
            soundEnabled
              ? 'bg-slate-900 text-cyan-400 border-slate-800 hover:bg-slate-800'
              : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Project Guide &amp; Viva</span>
          <span className="sm:hidden">Docs</span>
        </button>
      </div>
    </header>
  );
};
