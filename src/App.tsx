import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import transitData from './data/puneTransitData.json';
import { Hub, Scenario, OptimizationComparison, ActiveBus } from './types/transit';
import { comparePuneRoutes } from './utils/routeOptimizer';
import { sound } from './utils/audio';

import { Header } from './components/Header';
import { MapComponent } from './components/MapComponent';
import { ControlsPanel } from './components/ControlsPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { ActiveBusesPanel } from './components/ActiveBusesPanel';
import { StopInspectorModal } from './components/StopInspectorModal';
import { AlgorithmGuideModal } from './components/AlgorithmGuideModal';
import { MapSettingsModal } from './components/MapSettingsModal';
import { MLPredictorPanel } from './components/MLPredictorPanel';
import { WeatherCondition, FestivalType } from './utils/crowdMLModel';

export const App: React.FC = () => {
  // State
  const [origin, setOrigin] = useState<string>('swargate');
  const [destination, setDestination] = useState<string>('hinjewadi_ph3');
  const [hour, setHour] = useState<number>(8); // 8:30 AM Morning Rush by default
  const [selectedScenario, setSelectedScenario] = useState<string>('morning_rush');
  const [surgeNodes, setSurgeNodes] = useState<string[]>([
    'hinjewadi_ph1',
    'hinjewadi_ph3',
    'pune_university',
    'swargate'
  ]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [comparison, setComparison] = useState<OptimizationComparison | null>(null);
  
  // UI toggles
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showAllCorridors, setShowAllCorridors] = useState<boolean>(true);
  const [showMetro, setShowMetro] = useState<boolean>(true);

  // Machine Learning Crowd Factors State
  const [weather, setWeather] = useState<WeatherCondition>('clear');
  const [festival, setFestival] = useState<FestivalType>('none');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday by default
  const [showMLPanel, setShowMLPanel] = useState<boolean>(false);
  
  // Map Provider & API Key State (Default: osm_dark - 100% Free OpenStreetMap with zero watermarks & zero keys)
  const [tileProvider, setTileProvider] = useState<'osm_dark' | 'osm_standard' | 'carto' | 'mapbox'>(() => {
    return (localStorage.getItem('pmpml_tile_provider') as 'osm_dark' | 'osm_standard' | 'carto' | 'mapbox') || 'osm_dark';
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('pmpml_map_api_key') || '';
  });
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState<boolean>(false);

  // Modals
  const [inspectedHub, setInspectedHub] = useState<Hub | null>(null);
  const [isAlgorithmGuideOpen, setIsAlgorithmGuideOpen] = useState<boolean>(false);

  // Active buses state
  const [activeBuses, setActiveBuses] = useState<ActiveBus[]>(
    transitData.active_buses as unknown as ActiveBus[]
  );

  // Initial optimization on mount
  useEffect(() => {
    runOptimization(origin, destination, hour, surgeNodes);
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('pmpml_map_api_key', newKey);
  };

  const handleSelectProvider = (prov: 'osm_dark' | 'osm_standard' | 'carto' | 'mapbox') => {
    setTileProvider(prov);
    localStorage.setItem('pmpml_tile_provider', prov);
  };

  // Run optimization logic
  const runOptimization = (
    startNode: string,
    endNode: string,
    simHour: number,
    surgeList: string[],
    overrideML?: { weather?: WeatherCondition; festival?: FestivalType; dayOfWeek?: number }
  ) => {
    setIsOptimizing(true);
    const mlFactors = {
      weather: overrideML?.weather ?? weather,
      festival: overrideML?.festival ?? festival,
      dayOfWeek: overrideML?.dayOfWeek ?? dayOfWeek
    };

    setTimeout(() => {
      const res = comparePuneRoutes(startNode, endNode, simHour, surgeList, mlFactors);
      setComparison(res);
      setIsOptimizing(false);

      if (res.metrics.time_saved_percentage > 15) {
        sound.playSuccess();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#06b6d4', '#10b981', '#38bdf8']
        });
      }
    }, 200);
  };

  const handleRunOptimization = () => {
    runOptimization(origin, destination, hour, surgeNodes);
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    runOptimization(destination, temp, hour, surgeNodes);
  };

  const handleSelectScenario = (sc: Scenario) => {
    setSelectedScenario(sc.id);
    setHour(sc.hour);
    setSurgeNodes(sc.crowd_boost_nodes);
    if (sc.recommended_origin && sc.recommended_destination) {
      setOrigin(sc.recommended_origin);
      setDestination(sc.recommended_destination);
      runOptimization(sc.recommended_origin, sc.recommended_destination, sc.hour, sc.crowd_boost_nodes);
    } else {
      runOptimization(origin, destination, sc.hour, sc.crowd_boost_nodes);
    }
  };

  const handleChangeHour = (newHour: number) => {
    setHour(newHour);
    setSelectedScenario('');
    runOptimization(origin, destination, newHour, surgeNodes);
  };

  const handleChangeWeather = (newWeather: WeatherCondition) => {
    setWeather(newWeather);
    runOptimization(origin, destination, hour, surgeNodes, { weather: newWeather });
  };

  const handleChangeFestival = (newFestival: FestivalType) => {
    setFestival(newFestival);
    runOptimization(origin, destination, hour, surgeNodes, { festival: newFestival });
  };

  const handleChangeDayOfWeek = (newDow: number) => {
    setDayOfWeek(newDow);
    runOptimization(origin, destination, hour, surgeNodes, { dayOfWeek: newDow });
  };

  // Periodic bus speed fluctuation to simulate live traffic
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBuses(prev =>
        prev.map(bus => {
          const delta = (Math.random() - 0.5) * 4;
          const newSpeed = Math.max(15, Math.min(50, Math.round(bus.speed_kmh + delta)));
          return { ...bus, speed_kmh: newSpeed };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100">
      {/* Top Navigation */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          setSoundEnabled(!soundEnabled);
          sound.enabled = !soundEnabled;
        }}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
        showAllCorridors={showAllCorridors}
        onToggleCorridors={() => setShowAllCorridors(!showAllCorridors)}
        showMetro={showMetro}
        onToggleMetro={() => setShowMetro(!showMetro)}
        onOpenAlgorithmGuide={() => setIsAlgorithmGuideOpen(true)}
        onOpenMapSettings={() => setIsMapSettingsOpen(true)}
        tileProvider={tileProvider}
      />

      {/* Main View Area */}
      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        {/* Full-bleed Map View */}
        <div className="w-full h-full relative">
          <MapComponent
            comparison={comparison}
            activeHour={hour}
            surgeNodes={surgeNodes}
            activeBuses={activeBuses}
            onSelectHub={(hub) => {
              sound.playClick();
              setInspectedHub(hub);
            }}
            showHeatmap={showHeatmap}
            showAllCorridors={showAllCorridors}
            showMetro={showMetro}
            tileProvider={tileProvider}
            apiKey={apiKey}
          />
        </div>

        {/* Floating Left Control Overlay */}
        <div className="absolute top-4 left-4 z-10 w-[92vw] sm:w-[380px] md:w-[420px] max-h-[calc(100vh-100px)] overflow-y-auto space-y-4 pointer-events-auto pr-1">
          <ControlsPanel
            origin={origin}
            destination={destination}
            onSelectOrigin={(id) => {
              setOrigin(id);
              runOptimization(id, destination, hour, surgeNodes);
            }}
            onSelectDestination={(id) => {
              setDestination(id);
              runOptimization(origin, id, hour, surgeNodes);
            }}
            onSwap={handleSwap}
            hour={hour}
            onChangeHour={handleChangeHour}
            selectedScenario={selectedScenario}
            onSelectScenario={handleSelectScenario}
            onRunOptimization={handleRunOptimization}
            isOptimizing={isOptimizing}
          />

          {/* Collapsible ML Crowd & Weather Predictor Toggle */}
          <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowMLPanel(!showMLPanel);
              }}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-cyan-300 transition-colors bg-slate-900/60"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>AI / ML Crowd &amp; Weather Engine</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>{showMLPanel ? 'Hide Controls' : 'Weather & Festivals'}</span>
                {showMLPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showMLPanel && (
              <div className="p-1 border-t border-slate-800/80">
                <MLPredictorPanel
                  selectedHubId={origin}
                  hour={hour}
                  weather={weather}
                  onChangeWeather={handleChangeWeather}
                  festival={festival}
                  onChangeFestival={handleChangeFestival}
                  dayOfWeek={dayOfWeek}
                  onChangeDayOfWeek={handleChangeDayOfWeek}
                />
              </div>
            )}
          </div>

          {comparison && (
            <MetricsPanel comparison={comparison} />
          )}

          {/* Active Buses Panel */}
          <ActiveBusesPanel buses={activeBuses.slice(0, 4)} />
        </div>
      </div>

      {/* Stop Inspector Modal */}
      <StopInspectorModal
        hub={inspectedHub}
        onClose={() => setInspectedHub(null)}
        activeHour={hour}
      />

      {/* College Project Viva / Algorithm Guide Modal */}
      <AlgorithmGuideModal
        isOpen={isAlgorithmGuideOpen}
        onClose={() => setIsAlgorithmGuideOpen(false)}
      />

      {/* Map Settings & Optional API Key Modal */}
      <MapSettingsModal
        isOpen={isMapSettingsOpen}
        onClose={() => setIsMapSettingsOpen(false)}
        tileProvider={tileProvider}
        onSelectProvider={handleSelectProvider}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
};

export default App;
