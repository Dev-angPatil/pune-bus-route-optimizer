import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, ChevronDown, Check, Train } from 'lucide-react';
import { Hub } from '../types/transit';

interface SearchableStopSelectProps {
  label: string;
  marathiLabel: string;
  value: string;
  onChange: (hubId: string) => void;
  hubs: Hub[];
  disabledId?: string;
  pinColorClass: string;
  accentBorderClass: string;
  placeholder?: string;
}

// Common Pune colloquial aliases to make search intuitive
const STOP_ALIASES: Record<string, string[]> = {
  deccan_gymkhana: ['fc road', 'fergusson college', 'jm road', 'goodluck chowk', 'deccan'],
  viman_nagar: ['phoenix mall', 'phoenix marketcity', 'symbiosis', 'airport road'],
  kothrud_depot: ['nal stop', 'karve road', 'paud road', 'vanaz'],
  pune_university: ['sppu', 'pashan circle', 'khadki', 'university circle'],
  manapa_pmc: ['pmc', 'shaniwar wada', 'dengle bridge', 'corporation'],
  swargate: ['jedhe chowk', 'laxmi road', 'sarasbaug', 'satara road'],
  pune_station: ['railway station', 'sassoon hospital', 'dhole patil road'],
  hinjewadi_ph1: ['infosys ph1', 'wipro circle', 'tcs', 'rgip'],
  hinjewadi_ph3: ['megapolis', 'phase 3', 'maan', 'tech mahendra'],
  camp_pulgate: ['mg road', 'camp', 'command hospital', 'east street'],
  yerawada_chowk: ['bund garden', 'koregaon park junction', 'gunjan talkies'],
  chandani_chowk: ['bavdhan', 'nda road', 'mumbai-bangalore bypass'],
  hadapsar_gadital: ['magarpatta backgate', 'solapur road', 'gadital'],
  magarpatta_city: ['cybercity', 'seasons mall', 'tower chowk'],
  kharadi_bypass: ['eon free zone', 'world trade center', 'radisson'],
  wakad_bridge: ['dange chowk link', 'hinjewadi flyover', 'wakad'],
  shivajinagar: ['metro interchange', 'coep', 'simla office', 'district court']
};

export const SearchableStopSelect: React.FC<SearchableStopSelectProps> = ({
  label,
  marathiLabel,
  value,
  onChange,
  hubs,
  disabledId,
  pinColorClass,
  accentBorderClass,
  placeholder = 'Type to search stops (e.g. FC Road, Phoenix Mall)...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedHub = hubs.find((h) => h.id === value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter hubs by name, marathi, category, or popular aliases
  const filteredHubs = hubs.filter((hub) => {
    if (hub.id === disabledId) return false;
    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    const nameMatch = hub.name.toLowerCase().includes(q);
    const marathiMatch = (hub.marathi || '').toLowerCase().includes(q);
    const categoryMatch = hub.category.toLowerCase().includes(q);
    const aliases = STOP_ALIASES[hub.id] || [];
    const aliasMatch = aliases.some((alias) => alias.includes(q));

    return nameMatch || marathiMatch || categoryMatch || aliasMatch;
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredHubs.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredHubs.length) % Math.max(1, filteredHubs.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredHubs[highlightedIndex]) {
        onChange(filteredHubs[highlightedIndex].id);
        setIsOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (hubId: string) => {
    onChange(hubId);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Label */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${pinColorClass} inline-block shadow-sm`}></span>
          <span>{label}</span>
          <span className="text-slate-500 font-normal">({marathiLabel})</span>
        </span>
        {selectedHub && (
          <span className="text-[10px] text-slate-400 px-1.5 py-0.2 bg-slate-800/80 rounded border border-slate-700/60 font-mono">
            {selectedHub.category}
          </span>
        )}
      </div>

      {/* Main trigger / Search button */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-slate-900/90 text-slate-100 rounded-xl text-xs md:text-sm border border-slate-700/80 cursor-pointer hover:border-slate-600 transition-all shadow-inner ${
          isOpen ? `ring-1 ${accentBorderClass} border-transparent` : ''
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <MapPin className={`w-4 h-4 shrink-0 ${pinColorClass}`} />
          <div className="truncate text-left">
            <span className="font-medium text-slate-100 block truncate">
              {selectedHub ? selectedHub.name : 'Select a hub'}
            </span>
            {selectedHub?.marathi && (
              <span className="text-[10px] text-slate-400 block -mt-0.5 truncate">
                {selectedHub.marathi}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Box */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-800/90 text-slate-100 rounded-lg text-xs border border-slate-700/70 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Keyword Pills for Viva / Fast demo */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar text-[10px] text-slate-400">
              <span className="text-slate-400 shrink-0">Quick:</span>
              {['FC Road', 'Phoenix Mall', 'Nal Stop', 'Swargate', 'Hinjewadi'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuery(term);
                    setHighlightedIndex(0);
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 shrink-0 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Hubs List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/50">
            {filteredHubs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No stops found matching <span className="text-slate-200 font-mono">"{query}"</span>
              </div>
            ) : (
              filteredHubs.map((hub, idx) => {
                const isSelected = hub.id === value;
                const isHighlighted = idx === highlightedIndex;
                const aliases = STOP_ALIASES[hub.id] || [];

                return (
                  <div
                    key={hub.id}
                    onClick={() => handleSelect(hub.id)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/60 text-cyan-200'
                        : isHighlighted
                        ? 'bg-slate-800/80 text-slate-100'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-100 truncate">{hub.name}</span>
                        {hub.id.includes('station') || hub.id.includes('shivajinagar') || hub.id.includes('swargate') ? (
                          <span title="Metro / Train Interchange">
                            <Train className="w-3 h-3 text-purple-400 shrink-0" />
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        {hub.marathi && <span className="text-slate-400">{hub.marathi}</span>}
                        <span>•</span>
                        <span className="text-slate-400">{hub.category}</span>
                        {aliases.length > 0 && query && (
                          <span className="text-cyan-400/80 italic truncate">
                            (Matches: {aliases.filter((a) => a.includes(query.toLowerCase())).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
