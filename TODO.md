# 📋 Pune PMPML Bus Route Optimizer — Project Roadmap & TODO

This document tracks upcoming improvements, testing targets, feature additions, and academic presentation enhancements for the **Pune Bus Route Optimization System**.

---

## 🎯 1. Things to Make (New Features)

### 🚏 Transit & Micro-Stop Search
- [ ] **Full 6,745 Micro-Stop Fuzzy Search**: Implement client-side fuzzy search (using `Fuse.js` or `MiniSearch`) so users can search for any small local bus stop across Pune (e.g. *Goodluck Cafe, Nal Stop, Pune Station Sassoon, Balewadi High Street*), which snaps to the nearest major corridor hub.
- [ ] **Custom Waypoint Routing (Via Stops)**: Allow commuters to add intermediate "Via" stops (e.g. Swargate ➔ *via Deccan Gymkhana* ➔ Hinjewadi Phase 3).
- [ ] **Multi-Modal Metro Integration**: Overlay the Pune Metro Line 1 (Purple - PCMC to Swargate) and Line 2 (Aqua - Vanaz to Ramwadi) interchange stations with feeder bus synchronization.

### 🚌 Fleet Operations & Smart Dispatch
- [ ] **Automated Bus Re-allocation Solver**: Implement a Hungarian Matching / Linear Programming module that calculates how many extra feeder buses to deploy from low-demand depots (e.g. Upper Depot) to choked hubs (e.g. Hinjewadi / Swargate).
- [ ] **Headway & Passenger Waiting Queue Model**: Model passenger platform queue accumulation:
  $$\text{Queue}(t) = \text{Queue}(t-1) + \lambda(t) \cdot \Delta t - \mu \cdot \text{BusesArrived}$$
- [ ] **Fare & Ticket Savings Calculator**: Estimate commuter fare savings against auto-rickshaw surge pricing during peak hours.

### 📱 Presentation & Offline Resilience
- [ ] **Progressive Web App (PWA) Offline Mode**: Add `vite-plugin-pwa` with Service Workers caching map tiles and GTFS graph so the demo works smoothly in college auditoriums with weak Wi-Fi.
- [ ] **Exportable Route PDF / Itinerary**: One-click download button for commuters/examiners containing turn-by-turn bus schedules, stops, and crowd risk advisory.

---

## 🎨 2. Things to Improve (Visual Thrills & UI/UX)

### 🗺️ Map Aesthetics & Cyberpunk Transit HUD
- [ ] **Animated Commuter Streamlines (Particle Flow)**: Add Canvas/WebGL animated particle trails along road lines indicating commuter flow velocity (faster moving particles = fluid traffic; slow red particles = bottleneck crawl).
- [ ] **3D Iso-Perspective / Pitch Tilt**: Add a 3D isometric pitch tilt control (`map.setPitch` with MapLibre or Leaflet 2.5D building extrusion).
- [ ] **Dynamic Day/Night Lighting Shift**: Smoothly transition map background lighting, ambient glow, and sky colors as the user drags the 24-hour time slider from dawn to dusk.
- [ ] **Interactive Chokepoint Pulse Rings**: Enhance bottleneck hubs with concentric radar sweep animations when crowd exceeds 80%.

### 📊 Comparative Analytics
- [ ] **Interactive Speed & Delay Graph**: Add a lightweight Recharts/Chart.js timeline comparing standard vs optimized travel times across each hour of the day.
- [ ] **Carbon Offset Certificate**: Display a gamified badge showing kilograms of carbon prevented by avoiding idling gridlock.

---

## 🧪 3. Things to Test (Quality Assurance & Benchmarking)

### 🔬 Algorithmic Unit & Integration Testing
- [ ] **Graph Solver Correctness (`vitest` / `pytest`)**:
  - Test Dijkstra and A* return identical optimal paths under uniform edge weights.
  - Test graph connectivity (ensure every node has at least one valid path to every other node).
  - Verify boundary edge cases (same origin and destination; cyclic loops; zero-crowd midnight conditions).
- [ ] **Performance & Stress Benchmarking**:
  - Benchmark 500 consecutive random origin-destination routing queries to verify sub-5ms average latency.
  - Memory heap profiling: ensure the client-side graph stays under 15 MB in memory.

### 🌐 Cross-Browser & Device Compatibility
- [ ] **Mobile Touch Responsiveness**: Verify bottom drawer sheet behavior and pinch-to-zoom on iOS Safari and Android Chrome.
- [ ] **Tile Provider Fallbacks**: Test automatic fallback if OpenStreetMap CDN has high latency (switch seamlessly between OSM and fallback mirror).
- [ ] **Web Audio API Policy Test**: Verify sound effects unlock gracefully on initial user tap without throwing autoplay warnings.

---

## 🎓 4. Academic & College Viva Deliverables

- [ ] **IEEE-Style Research Project Report**: Scaffold `docs/IEEE_Project_Report.md` complete with:
  - Literature survey (comparing Dijkstra, Bellman-Ford, Contraction Hierarchies, and Ant Colony Optimization).
  - Mathematical formulation of BPR congestion latency function.
  - Experimental validation tables for Pune traffic corridors.
- [ ] **Project Presentation Slides (PPT Template)**: Create structured slide decks covering:
  - Slide 1: Title, Team Members, Guide / College Name.
  - Slide 2: Problem Statement (Pune Traffic Bottlenecks).
  - Slide 3: PMPML GTFS Data Architecture.
  - Slide 4: Mathematical Optimization Equations.
  - Slide 5: Live Case Study (Swargate to Hinjewadi 34.3% Time Savings).
  - Slide 6: Results, Future Scope & Conclusions.
- [ ] **Examiner Q&A Rehearsal Script**: Documenting 20 common viva questions with concise technical answers.

---

## 📈 Status Dashboard

| Milestone | Target Date | Status |
| :--- | :--- | :--- |
| **Phase 1: Core PMPML GTFS Extraction & Graph Generation** | Completed | ✅ Done |
| **Phase 2: Adaptive Dijkstra Optimization Engine (Python + TS)** | Completed | ✅ Done |
| **Phase 3: Interactive Leaflet Map with Zero-Key OSM Dark Mode** | Completed | ✅ Done |
| **Phase 4: Side-by-Side Comparison HUD & Sound Effects** | Completed | ✅ Done |
| **Phase 5: GitHub Pages Automated Deployment** | Completed | ✅ Done |
| **Phase 6: Micro-Stop Search & Multi-Modal Feeder Optimization** | Upcoming | ⏳ Planned |
| **Phase 7: PWA Offline Support & IEEE Academic Report** | Upcoming | ⏳ Planned |
