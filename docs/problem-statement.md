# Problem Statement — Maritime Port Congestion & Bottlenecks

## Background

Global maritime trade carries over 80% of world merchandise by volume. High-throughput container hubs such as Los Angeles/Long Beach, Singapore, Rotterdam, and India's western deep-water corridor operate under tight physical and hydrographic constraints. In modern maritime logistics, container vessels have scaled up to Ultra-Large Container Vessels (ULCVs) exceeding 24,000 TEU capacity and 16-meter drafts, while terminal footprints, turning basins, and quay crane infrastructure remain physically bounded.

## The Problem

Port operations teams allocate multi-million-dollar assets—deep-water berths, Ship-to-Shore (STS) gantry cranes, and yard stacking blocks—using fragmented spreadsheets, manual radio handoffs, and rigid legacy TOS (Terminal Operating System) rules. Crucially, congestion hotspots are identified **reactively**:
1. Port dispatchers learn of yard gridlock only after container dwell times spike and gate turnarounds exceed 90 minutes.
2. Vessel arrivals are subject to stochastic maritime delays (weather, canal choke points, engine deratings), yet berth windows are static.
3. Tidal variations dictate under-keel clearance (UKC); low-water windows force deep-draft vessels into unplanned anchorage delays, burning up to 35 metric tons of heavy fuel oil daily per waiting vessel.

## Who is Affected

- **Terminal Operations Directors & Shift Superintendents:** Tasked with managing daily berth schedules, crane split allocations, and labor gangs while absorbing cascading vessel delays.
- **Harbor Masters & Marine Pilots:** Responsible for fairway navigational safety, tug allocation, and enforcing strict Under-Keel Clearance (UKC) during tidal slack water.
- **Ocean Carriers & Vessel Operators:** Face catastrophic demurrage costs ($30,000 to $80,000 per vessel-day) when ships wait at anchor.
- **Drayage Trucking Operators & Intermodal Rail:** Incur costly gate waiting times when terminal yard stacks become congested.

## Why It Matters

- **Global Supply Chain Disruption:** The 2021 Southern California backlog stranded over 100 vessels offshore for weeks, tying up over $10B in inventory and inflating trans-Pacific spot freight rates by 400%.
- **Avoidable Carbon Emissions:** Idle container vessels waiting at anchor with auxiliary diesel generators running emit hundreds of thousands of metric tons of avoidable CO2 and particulate matter in coastal regions.
- **Port Economic Competitiveness:** Ports with high dwell times and demurrage volatility lose liner service loops to automated competitors.

## Why Existing Solutions Fall Short

1. **Legacy TOS Systems (e.g. Navis, COSMOS):** Focus on micro-execution (crane telematics and box moves) rather than holistic, multi-horizon (72-hour) congestion forecasting.
2. **Disconnected Spreadsheets:** Berth planning and crane allocation are maintained in siloed Excel sheets that cannot dynamically account for tide cycles or yard saturation.
3. **Generic AI Prototypes:** Conventional hackathon dashboards show static numbers without mathematical constraints (vessel LOA, minimum 1.0m UKC, cargo type compatibility) or live grounding, making them impractical for real-world dispatchers.
