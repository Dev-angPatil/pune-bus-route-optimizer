import React, { useState } from 'react';
import { X, Key, Map, Check, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface MapSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tileProvider: 'cartodb' | 'osm' | 'mapbox' | 'maptiler';
  onSelectProvider: (provider: 'cartodb' | 'osm' | 'mapbox' | 'maptiler') => void;
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
              <Map className="w-4 h-4" /> Map Providers &amp; API Key Configuration
            </div>
            <h2 className="text-lg font-bold text-white">Choose Your Map Source</h2>
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
        <div className="bg-cyan-950/40 p-3 rounded-xl border border-cyan-800/40 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-300">No API Key is required by default!</span> CartoDB Dark Matter and OpenStreetMap operate 100% free with 0 API keys. If your college professor requires a commercial key (like Mapbox or MapTiler), you can configure it below.
          </div>
        </div>

        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Select Active Map Provider
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* CartoDB */}
            <button
              onClick={() => {
                sound.playClick();
                onSelectProvider('cartodb');
              }}
              className={`p-3 rounded-xl border text-left transition-all text-xs ${
                tileProvider === 'cartodb'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                CartoDB Dark
                {tileProvider === 'cartodb' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Default dark neon. 0 Key needed.</div>
            </button>

            {/* OpenStreetMap */}
            <button
              onClick={() => {
                sound.playClick();
                onSelectProvider('osm');
              }}
              className={`p-3 rounded-xl border text-left transition-all text-xs ${
                tileProvider === 'osm'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                OpenStreetMap
                {tileProvider === 'osm' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Standard street map. 0 Key needed.</div>
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
                Mapbox Dark
                {tileProvider === 'mapbox' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Requires Mapbox Public Token.</div>
            </button>

            {/* MapTiler */}
            <button
              onClick={() => {
                sound.playClick();
                onSelectProvider('maptiler');
              }}
              className={`p-3 rounded-xl border text-left transition-all text-xs ${
                tileProvider === 'maptiler'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                MapTiler
                {tileProvider === 'maptiler' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Requires MapTiler API Key.</div>
            </button>
          </div>
        </div>

        {/* API Key Input (for Mapbox / MapTiler) */}
        {(tileProvider === 'mapbox' || tileProvider === 'maptiler') && (
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                {tileProvider === 'mapbox' ? 'Mapbox Public Access Token (pk.eyJ...)' : 'MapTiler API Key'}
              </span>
              <a
                href={tileProvider === 'mapbox' ? 'https://account.mapbox.com/access-tokens/' : 'https://cloud.maptiler.com/account/keys/'}
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
                placeholder={tileProvider === 'mapbox' ? 'pk.eyJ1...' : 'Enter your MapTiler API key'}
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
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
