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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Map className="w-4 h-4" /> Map Layer &amp; Tile Provider
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Choose Map Style</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Notice */}
        <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-800">100% Free Open Data:</span> High-resolution light vector cartography across Pune with zero watermarks or third-party limits.
          </div>
        </div>

        {/* Provider List */}
        <div className="space-y-2.5">
          {/* CARTO Positron Light */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectProvider('carto');
            }}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              tileProvider === 'carto'
                ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">CARTO Positron Light (Default)</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Crisp, modern, high-contrast light map optimized for transit telemetry.
              </p>
            </div>
            {tileProvider === 'carto' && <Check className="w-5 h-5 text-blue-600 shrink-0" />}
          </div>

          {/* Standard OpenStreetMap */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectProvider('osm_standard');
            }}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              tileProvider === 'osm_standard'
                ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">OpenStreetMap Standard</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard classic street names, landmarks, and terrain topology.
              </p>
            </div>
            {tileProvider === 'osm_standard' && <Check className="w-5 h-5 text-blue-600 shrink-0" />}
          </div>
        </div>

        {/* Optional Custom API Key */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-600" /> Optional Custom Map API Key
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Optional</span>
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter CARTO or Mapbox Token (Optional)"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {savedSuccess ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
