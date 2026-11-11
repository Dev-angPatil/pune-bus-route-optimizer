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
    <div className="relative w-full" ref={containerRef}>
      {/* Label */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
        <span className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${pinColorClass} inline-block shadow-sm`}></span>
          <span className="text-slate-700">{label}</span>
          <span className="text-slate-400 font-normal">({marathiLabel})</span>
        </span>
        {selectedHub && (
          <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 font-medium">
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
        className={`w-full flex items-center justify-between px-3.5 py-3 bg-white text-slate-800 rounded-2xl text-sm border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all shadow-sm ${
          isOpen ? 'ring-2 ring-blue-500/20 border-blue-500 shadow-md' : ''
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <MapPin className={`w-4 h-4 ${pinColorClass}`} />
          </div>
          <div className="truncate text-left">
            <span className="font-semibold text-slate-900 block truncate text-sm">
              {selectedHub ? selectedHub.name : 'Choose bus stop or landmark'}
            </span>
            {selectedHub?.marathi && (
              <span className="text-xs text-slate-500 block truncate">
                {selectedHub.marathi}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Box */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                className="w-full pl-9 pr-8 py-2 bg-white text-slate-800 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 shadow-inner"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Keyword Pills for Viva / Fast demo */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar text-xs">
              <span className="text-slate-400 text-[11px] font-medium shrink-0">Quick picks:</span>
              {['FC Road', 'Phoenix Mall', 'Nal Stop', 'Swargate', 'Hinjewadi'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuery(term);
                    setHighlightedIndex(0);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 shrink-0 text-[11px] font-medium transition-all shadow-2xs"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Hubs List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {filteredHubs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No stops found matching <span className="text-slate-700 font-semibold">"{query}"</span>
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
                    className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-600'
                        : isHighlighted
                        ? 'bg-slate-50 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">{hub.name}</span>
                        {hub.id.includes('station') || hub.id.includes('shivajinagar') || hub.id.includes('swargate') ? (
                          <span title="Metro / Train Interchange" className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-100 text-[10px] flex items-center gap-0.5 font-medium shrink-0">
                            <Train className="w-2.5 h-2.5 text-purple-600" /> Metro Hub
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        {hub.marathi && <span className="font-medium text-slate-600">{hub.marathi}</span>}
                        <span>•</span>
                        <span className="text-slate-500">{hub.category}</span>
                        {aliases.length > 0 && query && (
                          <span className="text-blue-600 italic truncate font-medium">
                            (Matches: {aliases.filter((a) => a.includes(query.toLowerCase())).join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
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
