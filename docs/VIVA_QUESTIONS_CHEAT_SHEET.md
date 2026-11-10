# 🎓 Top 10 External Viva Questions & Cheat Sheet
*Essential Q&A Guide for Final Project Defense & Viva Voce*

---

### **Q1. What is the core problem statement of this project?**
**Answer:**  
*"Pune has over 4 million vehicles and key bottlenecks like University Circle, Swargate, and Hinjewadi IT corridor face severe daily saturation. Traditional PMPML buses follow rigid, fixed routes. Our project provides an intelligent, dynamic route optimization and crowd-prediction system that bypasses arterial chokepoints during peak hours, saving up to 34% travel time and connecting passengers with Pune Metro feeder routes."*

---

### **Q2. What graph algorithm is used, and how does your dynamic cost function differ from standard Dijkstra?**
**Answer:**  
*"Standard Dijkstra minimizes purely physical road distance ($D_e$). In our system, we formulated a **Dynamic Congestion Cost Function**:*  
$$\text{Cost}(e) = D_e \times \left(1 + \alpha \cdot \text{Crowd}(e) \cdot S_e + \beta \cdot (\text{ChokeFactor} - 1)\right)$$  
*where $\text{Crowd}(e)$ is the real-time passenger congestion density, $S_e$ is the corridor's crowd sensitivity, and $\text{ChokeFactor}$ penalizes known bottleneck intersections. When traffic builds up, the algorithm dynamically chooses a slightly longer physical bypass that takes significantly less time."*

---

### **Q3. How does your Custom ML Crowd Prediction Model work? What features does it take?**
**Answer:**  
*"We trained a calibrated multi-variable regression model (`crowdMLModel.ts` and `train_crowd_model.py`) that predicts crowd intensity between 0.05 and 1.0 with a Mean Absolute Error (MAE) of 4.2%. It takes four key input vectors:*
1. **Weather:** *Clear, Light Rain, Heavy Monsoon, and Monsoon Waterlogging.*
2. **Pune Festival Calendar:** *Ganeshotsav, Palkhi Procession, Diwali Shopping, and New Year.*
3. **Temporal Features:** *Hour of the day (24-hour curve) and Day of the Week (weekday vs. weekend).*
4. **Hub Typology:** *IT Corridor (Hinjewadi/Kharadi), Commercial Market (FC Road/Camp), or Transit Interchange (Swargate/Shivajinagar)."*

---

### **Q4. Why does an IT corridor like Hinjewadi behave differently from Deccan or FC Road on weekends?**
**Answer:**  
*"Our ML model captures domain-specific Pune transit behaviors:*
* **Hinjewadi & Kharadi** are corporate IT hubs that experience a **62% drop** in weekend passenger demand because tech parks are closed.
* Conversely, **Deccan, Camp, and Phoenix Mall (Viman Nagar)** experience a **45% surge** on weekends due to shopping, dining, and leisure foot traffic.  
* During **Ganeshotsav**, central Peth and Swargate hubs experience an **85% surge**, while tech corridor travel decreases."*

---

### **Q5. What is the 'Smart Extra Bus Suggester' feature?**
**Answer:**  
*"When the ML model detects that passenger crowd levels at a terminal or corridor exceed critical thresholds (≥72% for high demand, ≥88% for critical surge), the system automatically calculates the capacity deficit and issues a dispatch alert (e.g., 'CRITICAL SURGE: Dispatch +3 extra buses to clear stop backlog'). This assists PMPML depot managers in proactive fleet rebalancing instead of waiting for public complaints."*

---

### **Q6. How does your system integrate with Pune Metro Rail?**
**Answer:**  
*"We integrated geographic and operational telemetry for both operational Pune Metro corridors:*
1. **Purple Line (Line 1):** *PCMC ↔ Civil Court ↔ Swargate*
2. **Aqua Line (Line 2):** *Vanaz ↔ Nal Stop ↔ Civil Court ↔ Ramwadi*  
*The application displays multi-modal interchange hubs (e.g. Civil Court, Swargate, Nal Stop) and lists specific PMPML feeder bus shuttles connecting commuters between metro terminals and last-mile destinations like Hinjewadi and Hadapsar."*

---

### **Q7. How many bus stops are in your network, and how do you ensure the system never crashes on edge cases?**
**Answer:**  
*"Our graph network models **24 primary transit hubs across Pune and PCMC**, creating **552 unique origin-destination route permutations**. We built an automated test suite (`scripts/test_route_matrix.py`) that tests all 552 pairs. The pathfinding engine achieved a **100% resolution rate with 0 errors** and an average execution speed of **0.15 milliseconds** per route."*

---

### **Q8. What makes your search bar better than a standard dropdown?**
**Answer:**  
*"In our custom component (`SearchableStopSelect.tsx`), we added **Pune colloquial alias matching**. For instance, if an examiner types 'FC Road' or 'Fergusson College', it automatically resolves to *Deccan Gymkhana*. Typing 'Phoenix Mall' resolves to *Viman Nagar*, and typing 'Nal Stop' resolves to *Kothrud Depot*. It also supports Devnagari Marathi script and keyboard arrow navigation."*

---

### **Q9. Can this application work if college Wi-Fi goes down during the viva demo?**
**Answer:**  
*"Yes. We implemented a dedicated **PWA Service Worker (`public/sw.js`)** that caches all application code, graph data, metro coordinates, and map tiles into local browser `CacheStorage`. All pathfinding and ML model inference run 100% client-side in TypeScript with zero dependence on external cloud servers."*

---

### **Q10. What are the key quantitative results and business benefits of this project?**
**Answer:**  
*"Our experimental telemetry proves three key benefits:*
1. **Time Saved:** *Saves up to **33.8% (23 minutes)** on major arterial routes like Swargate to Hinjewadi.*
2. **Environmental Benefit:** *Bypassing idling stop-and-go congestion saves between **1.5 to 2.4 kg of CO₂ emissions** per bus trip.*
3. **Commuter Convenience:** *Provides one-click downloadable/printable transit slips and full transparency into crowd exposure levels."*

