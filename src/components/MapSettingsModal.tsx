import React, { useState } from 'react';
import { X, Key, Map, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import { sound } from '../utils/audio';

interface MapSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tileProvider: 'osm_dark' | 'osm_standard' | 'carto' | 'mapbox';
  onSelectProvider: (provider: 'osm_dark' | 'osm_standard' | 'carto' | 'mapbox') => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const MapSettingsModal: React.FC<MapSettingsModalProps> = ({
  isOpen,
  onClose,
  tileProvider,
  onSelectProvider,
  apiKey,
  onSaveApiKey
}) => {
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    sound.playSuccess();
    onSaveApiKey(inputKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Map className="w-4 h-4" /> Map Layer &amp; Tile Provider Settings
            </div>
            <h2 className="text-lg font-bold text-white">Choose Your Map Theme</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Notice */}
        <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-300">OpenStreetMap is active!</span> No API keys, no watermarks, and 100% free open-source road vectors across Pune.
          </div>
        </div>

        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Available Map Layers
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* OSM Dark (Default) */}
            <button
              onClick={() => {
                sound.playClick();
                onSelectProvider('osm_dark');
              }}
              className={`p-3 rounded-xl border text-left transition-all text-xs ${
                tileProvider === 'osm_dark'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>OSM Dark (Default)</span>
                {tileProvider === 'osm_dark' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-medium">✓ No Key Needed (Zero Watermark)</div>
            </button>

            {/* OSM Standard */}
            <button
              onClick={() => {
                sound.playClick();
                onSelectProvider('osm_standard');
              }}
              className={`p-3 rounded-xl border text-left transition-all text-xs ${
                tileProvider === 'osm_standard'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>OSM Clean Street</span>
                {tileProvider === 'osm_standard' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-medium">✓ No Key Needed (Clean Light)</div>
            </button>

            {/* CARTO */}
            <button
              onClick={() => {
                sound.playClick();
                onSelectProvider('carto');
              }}
              className={`p-3 rounded-xl border text-left transition-all text-xs ${
                tileProvider === 'carto'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>CARTO Basemaps</span>
                {tileProvider === 'carto' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-amber-400 mt-1">Requires CARTO Key</div>
            </button>

            {/* Mapbox */}
            <button
              onClick={() => {
                sound.playClick();
                onSelectProvider('mapbox');
              }}
              className={`p-3 rounded-xl border text-left transition-all text-xs ${
                tileProvider === 'mapbox'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Mapbox Dark</span>
                {tileProvider === 'mapbox' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-amber-400 mt-1">Requires Mapbox Token</div>
            </button>
          </div>
        </div>

        {/* API Key Input (for CARTO or Mapbox) */}
        {(tileProvider === 'carto' || tileProvider === 'mapbox') && (
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                {tileProvider === 'carto' ? 'CARTO Basemaps API Key' : 'Mapbox Public Access Token'}
              </span>
              <a
                href={tileProvider === 'carto' ? 'https://carto.com/basemaps/apikey' : 'https://account.mapbox.com/access-tokens/'}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={tileProvider === 'carto' ? 'Enter CARTO API key' : 'pk.eyJ1...'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
              >
                {savedSuccess ? 'Saved! ✓' : 'Save Key'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px]">
            Saved securely in your browser’s localStorage.
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
