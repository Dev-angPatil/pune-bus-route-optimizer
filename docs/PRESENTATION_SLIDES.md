# 📽️ Pune Bus Route Optimizer — College Presentation Slides (PPT)
*Department of Computer Engineering / Information Technology*  
*Final Year / Mini-Project Presentation*

---

## Slide 1: Title & Team Information

### **PUNE PMPML PULSE: Dynamic Bus Route Optimization & Crowd Bypass System**
*An AI-driven intelligent transit decision system using Graph Algorithms and Machine Learning*

* **Domain:** Intelligent Transportation Systems (ITS) & Applied Graph Algorithms
* **Target Agency:** Pune Mahanagar Parivahan Mahamandal Ltd (PMPML) & Pune Metro Rail (Maha-Metro)
* **Team Members:**
  1. Student Name 1 (Roll No: 01)
  2. Student Name 2 (Roll No: 02)
  3. Student Name 3 (Roll No: 03)
* **Project Guide:** Prof. [Guide Name]
* **College / University:** Savitribai Phule Pune University (SPPU)

> **Speaker Note (30 secs):**  
> *"Good morning respected external examiners and faculty members. Today, our team presents 'Pune PMPML Pulse', an intelligent bus transit optimizer developed specifically to tackle Pune's escalating arterial traffic bottlenecks using dynamic graph pathfinding and real-time machine learning crowd prediction."*

---

## Slide 2: The Problem — Why Pune Needs This

### **Urban Commute Challenges in Pune City**
* **Arterial Chokepoints:**
  * **Hinjewadi IT Park (Phase 1 to 3):** Commuters spend 60–90 minutes traversing just 8 km along Wakad Flyover & Shivaji Chowk during shift changes.
  * **Pune University (SPPU) Chowk:** Flyover reconstruction & metro work cause 35+ minute bottlenecks connecting Aundh, Pashan, and Shivajinagar.
  * **Swargate & Central Peths:** Severe bus bunching, religious festival rushes (*Ganeshotsav, Palkhi*), and high passenger backlog.
* **Limitations of Existing Static Systems:**
  * Fixed timetable scheduling ignores live congestion, waterlogging, and demand spikes.
  * Shortest physical distance (static Dijkstra) forces buses into saturated corridors, increasing travel time, fuel burn, and carbon emissions.

> **Speaker Note (45 secs):**  
> *"Pune's vehicular population has crossed 4 million. Key corridors like Rajiv Gandhi Infotech Park in Hinjewadi and University Circle suffer severe transit bunching. Current navigation tools like Google Maps optimize for private two-wheelers and cars, whereas public buses require route-adhering corridor detours that bypass bottlenecks while maintaining connectivity to major transit hubs."*

---

## Slide 3: System Architecture & Algorithmic Approach

### **How It Works: Multimodal Graph & Calibrated ML Engine**

```
┌───────────────────────────────────────────────┐
│              Input Data Layer                 │
│  • 24 PMPML Transit Hubs & 552 Permutations   │
│  • Pune Metro Line 1 & Line 2 Interchanges    │
│  • Historical 24-hr Commuter Curves           │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│        AI / ML Crowd Prediction Engine         │
│  • Weather: Rain, Heavy Monsoon, Waterlogging │
│  • Festivals: Ganeshotsav, Palkhi, Diwali     │
│  • Temporal: Day of Week, Shift Hours         │
│  • Output: Calibrated Surge (MAE: 4.2%)       │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│           Dynamic Routing Algorithm           │
│  Cost(u, v) = Distance * [1 + α*Crowd*Sens]   │
│  + Chokepoint Penalty + Metro Multi-Modal Sync│
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│               Actionable Outputs              │
│  • Bypasses bottlenecks saving up to 34% time │
│  • Smart Extra Bus Suggester Alert (+2 to +4) │
│  • Turn-by-Turn Telemetry & Printable Slip    │
└───────────────────────────────────────────────┘
```

* **Core Cost Function:**
  $$\text{Cost}(e) = \text{Dist}(e) \times \left(1 + \alpha \cdot \text{Crowd}(e) \cdot S_e + \beta \cdot (\text{ChokeFactor} - 1)\right)$$
* **Multi-Modal Connectivity:** Seamless integration with Pune Metro Purple Line & Aqua Line feeder buses at Civil Court, Swargate, and Nal Stop.

> **Speaker Note (60 secs):**  
> *"Our system models Pune transit as a weighted directed multigraph. We trained a lightweight calibrated machine learning regressor that predicts passenger surge using weather, day of the week, and Pune-specific festival factors. The routing algorithm dynamically penalizes saturated edges and chokepoints, choosing strategic bypass routes that save commuters time and cut greenhouse emissions."*

---

## Slide 4: Experimental Results & Performance

### **Proven Efficiency Gains Across Pune Corridors**

| Commute Corridor | Standard Static Travel Time | AI Dynamic Detour Time | Travel Time Saved | Carbon (CO₂) Saved |
| :--- | :---: | :---: | :---: | :---: |
| **Swargate ➔ Hinjewadi Phase 3** | 68 mins | **45 mins** | **-23 mins (33.8%)** | **-2.4 kg CO₂** |
| **Hadapsar ➔ Pune University** | 52 mins | **36 mins** | **-16 mins (30.7%)** | **-1.8 kg CO₂** |
| **Kothrud Depot ➔ Phoenix Mall** | 48 mins | **34 mins** | **-14 mins (29.1%)** | **-1.5 kg CO₂** |
| **Nigdi ➔ Swargate Multi-Modal** | 60 mins | **42 mins** | **-18 mins (30.0%)** | **-2.1 kg CO₂** |

* **Computational Performance:**
  * Average Pathfinding Latency: **0.15 milliseconds** (< 1 millisecond).
  * 100% Path Resolution Rate across all 552 hub-to-hub permutations.
* **Operational Fleet Impact:**
  * Smart Extra Bus Suggester prevents stop overcrowding during Ganeshotsav and monsoon waterlogging events.

> **Speaker Note (45 secs):**  
> *"As shown in our benchmark telemetry, during morning and evening rush hours, the AI dynamic route achieves an average time saving of 28% to 34%. For Swargate to Hinjewadi, it cuts 23 minutes of travel time. Computationally, our Dijkstra and A* engines evaluate the entire 24-hub graph in just 0.15 milliseconds, proving readiness for real-time edge deployment."*

---

## Slide 5: Live Demonstration & Conclusion

### **Live System Highlights**
1. **Interactive Dark Mode Map:** Free OpenStreetMap basemaps with 3D perspective tilt and day/night sunlight transitions.
2. **Search Autocomplete:** Instant fuzzy search for stops and popular Pune landmarks (*FC Road, Nal Stop, Phoenix Mall*).
3. **Live Moving Buses & Commuters:** Real-time animated buses and moving particle dots illustrating passenger flow.
4. **Offline Resilience:** Service Worker (PWA) caching enables full offline demonstrations without Wi-Fi dependence.
5. **Printable Travel Slip:** One-click PDF generation for commuters and transit coordinators.

### **Future Enhancements**
* GPS IoT hardware tracker integration on PMPML physical buses.
* QR-code ticketing integration synced with the Pune Metro One Card.

> **Speaker Note (30 secs):**  
> *"To conclude, Pune PMPML Pulse bridges the gap between academic graph theory and municipal urban mobility. It is 100% open-source, runs offline without costly third-party API dependencies, and is ready for live demonstration. We now invite the examiners for the live interactive demo and Q&A."*

