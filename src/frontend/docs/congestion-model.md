# Tideline Congestion Prediction Model — Operational Documentation

**Audience:** Terminal Shift Supervisors, Berth Schedulers, Operations Administration  
**Target Systems:** Quayside Slips, Landside Inbound Gates, Intermodal Yard Blocks  

---

## 1. Mathematical Formulation

Tideline derives operational congestion scores on an explainable **0 to 100 integer scale**, partitioned into three operational tiers:
- **0–49 (Nominal / OK):** Operations within standard service-level agreements (SLAs).
- **50–74 (Elevated / Warning):** Buffer margins degrading; corrective intervention advised within 4–6 hours.
- **75–100 (Critical):** Immediate bottleneck violation; demurrage penalties or truck queue spillover active.

---

### 1.1 Quayside Berth Zone Congestion Score

The Quayside Congestion Score $S_{\text{berth}}$ evaluates vessel arrival pressure, crane discharge velocity, and navigational tide windows:

$$S_{\text{berth}} = B_0 + (\omega_v \cdot N_{\text{queue}}) + P_{\text{tide}} + P_{\text{crane}} - M_{\text{div}}$$

Where:
- $B_0 = 35$: Quayside base operational friction.
- $N_{\text{queue}}$: Number of vessels currently in arrival or anchorage queue (weight $\omega_v = 9.0$).
- $P_{\text{tide}}$: Navigational Tide Clearance Penalty.
  $$P_{\text{tide}} = \begin{cases} 22 & \text{if } \text{draft}_{\max} > \text{channel datum} + h_{\text{tide}} \\ 8 & \text{otherwise} \end{cases}$$
  Vessels requiring high-tide slack water (e.g. MV Solvane Star, 15.6m draft) cannot transit the fairway during low tide without incurring grounding risk.
- $P_{\text{crane}}$: Crane Capacity Deficit Penalty.
  If an assigned Ship-to-Shore (STS) crane is operating under thermal/mechanical throttle (e.g., C-04 at 22 GMPH vs 34 GMPH benchmark), $P_{\text{crane}} = 18$.
- $M_{\text{div}}$: Mitigation credit. When a vessel diversion to an open slip (such as Berth 6) is authorized, $M_{\text{div}} = 38$, relieving the quayside bottleneck.

---

### 1.2 Landside Gate Corridor Congestion Score

The Gate Congestion Score $S_{\text{gate}}$ models queuing dynamics:

$$S_{\text{gate}} = 20 + P_{\text{ocr}} + \left(\frac{Q_{\text{trucks}}}{Q_{\max}} \times 40\right) - M_{\text{gate}}$$

Where:
- $P_{\text{ocr}} = 32$ when Optical Character Recognition (OCR) scanner degradation occurs. When OCR is offline, processing drops from **1.4 minutes/truck** (automated portal) to **6.8 minutes/truck** (manual physical clerk inspection).
- $Q_{\text{trucks}}$: Live waiting truck queue depth (benchmark SLA limit = 15 trucks).
- $M_{\text{gate}} = 44$: Mitigation credit when a 50% dynamic diversion to Gate 2 (West Commercial Access) is activated.

---

### 1.3 Financial Demurrage & Cost of Delay Formulation

Financial exposure is computed dynamically from real vessel laytime SLAs and drayage queue metrics:

$$\text{Total Cost} = C_{\text{demurrage}} + C_{\text{drayage}} + C_{\text{crane\_deficit}}$$

1. **Vessel Charter Demurrage ($C_{\text{demurrage}}$):**
   $$C_{\text{demurrage}} = \sum_{v \in \text{Delayed}} \left( \frac{\Delta t_{\text{delay}}}{24} \times \$38,500 \right)$$
   Based on Baltic and International Maritime Council (BIMCO) standard charter rates for Ultra-Large Container Vessels (ULCVs).

2. **Drayage Truck Idling ($C_{\text{drayage}}$):**
   $$C_{\text{drayage}} = Q_{\text{delayed}} \times \left(\frac{\Delta t_{\text{wait}}}{60}\right) \times \$95.00/\text{hr}$$
   Accounts for commercial driver overtime and engine fuel burn during extended gate turnarounds.

---

## 2. Decision Logic for Alternate Routing Recommendations

When $S_{\text{zone}} \ge 50$, the `routingEngine` scans real system candidates:
1. **Quayside:** Checks for idle berths ($N_{\text{vessels}} = 0$) where berth depth $D \ge \text{draft}_{\text{vessel}} + 1.0\text{m}$. Matches MV Coral Voyager (11.4m draft) to Berth 6 (14.5m depth).
2. **Gates:** Identifies adjacent portals with $\ge 2$ spare online lanes and queue $< 15$ trucks. Reroutes 50% approaching drayage from Gate 3 to Gate 2.
3. **Anchorage Holding:** Holds deep-draft vessels until high tide crest (+2.4m datum) to ensure $\ge 1.8\text{m}$ under-keel clearance.

---

## 3. Maritime Voyage Risk & 100% Oceanic Dynamic Rerouting Model

### 3.1 Oceanic Weather Hazard Risk Index ($R_{\text{route}}$)

The route safety index evaluates wave front heights, wind speeds, and current vectors:

$$R_{\text{route}} = \min\left(100, \, \alpha \cdot H_s^2 + \beta \cdot U_{\text{wind}} + \gamma \cdot V_{\text{current}} \cdot \cos(\theta_{\text{rel}})\right)$$

Where:
- $H_s$: Significant wave height in meters ($\alpha = 3.2$). Wave energy scales quadratically with height.
- $U_{\text{wind}}$: Wind velocity in knots ($\beta = 0.85$).
- $V_{\text{current}} \cdot \cos(\theta_{\text{rel}})$: Longitudinal opposing marine current component ($\gamma = 4.5$).
- **Thresholds:**
  - $R_{\text{route}} < 30$: **LOW** (Safe to navigate standard fairway).
  - $30 \le R_{\text{route}} < 65$: **MODERATE** (Precautionary speed reduction advised).
  - $R_{\text{route}} \ge 65$: **SEVERE** (Automatic Oceanic Bypass Rerouting triggered).

### 3.2 100% Oceanic Deepwater Fairway Synthesis (Zero Land Traversal)

To guarantee that synthesized bypass routes never traverse landmasses or shallow shoals:
1. **Seaward Coordinate Clamping:** Waypoints are bounded by minimum ocean bathymetric depth:
   $$\text{Bathymetry}(w_i) \ge \text{Draught}_{\text{vessel}} + 5.0\text{m}$$
2. **Storm Evasion Offset:** Calculates the normal vector $\hat{n}_{\perp}$ perpendicular to the voyage transit vector, displacing waypoints seaward into deep international waters by offset $\Delta d \ge R_{\text{storm}} + 15\text{ NM}$.
3. **Visual Acceptance Isolation:** Upon operator confirmation (`ACCEPTED`), the UI strictly suppresses the hazardous red trajectory, rendering solely the safe green corridor to prevent bridge crew confusion.

