# 📊 Presentation Slide Deck — PortFlow AI (Team Arjuna)

Place your slide deck in this folder. The evaluation pipeline specifically searches for `slides.pdf` or `slides.pptx`.

---

## Accepted Formats

- `slides.pdf` ← **Recommended (universally viewable across all devices)**
- `slides.pptx` ← Microsoft PowerPoint

---

## 🎯 Recommended Presentation Outline for PortFlow AI (8 Slides)

1. **Slide 1: Title & Team**
   - Project: **PortFlow AI** — Autonomous Maritime Digital Twin & Operations Optimizer
   - Team: **Team Arjuna** (Track: AI)
   - Members: Jay Ladva (Lead), Param Shah, Nishant Virani, Smit Bhesaniya
2. **Slide 2: The Maritime Port Congestion Crisis**
   - Over $10B annual supply chain losses in demurrage penalties and stranded cargo.
   - Stochastic arrival delays + tidal windows force vessels into anchorages burning 35 tons fuel/day.
   - Legacy TOS and spreadsheets react *after* gridlocks have formed.
3. **Slide 3: The Solution — PortFlow AI Digital Twin**
   - Proactive 72-hour predictive congestion modeling + mathematical discrete optimization.
   - Live digital twin dashboard connecting berths, cranes, gates, and navigation fairways.
4. **Slide 4: Technical Architecture & Core Engines**
   - Random Forest Regressor ($R^2 > 0.96$) forecasting Zone A–F congestion indices.
   - Priority-queue berth allocator enforcing draft + 1.0m UKC safety margins.
   - Earliest Deadline First (EDF) crane scheduler & Dijkstra tidal channel routing.
   - **Maritime AI Engine:** Live AIS telemetry stream, Open-Meteo marine weather ingestion, and Gradient Boosting ETA regressor.
   - **100% Oceanic Dynamic Rerouting:** Strict deepwater fairways bypassing storm centers with zero land or shoal traversal.
   - Enterprise cloud persistence in **Supabase PostgreSQL**.
5. **Slide 5: Explainable Route Acceptance & Grounded AI Copilot**
   - Natural language dispatcher powered by IBM watsonx.ai Granite / Groq / Gemini (zero hallucinations).
   - **Interactive Route Authorization:** Side-by-side "Why Accept" vs "Why Decline" trade-off matrix (fuel delta, ETA impact, structural stress reduction, demurrage avoided).
   - Dynamic multi-currency valuation engine across 8 international currencies (USD, EUR, GBP, JPY, SGD, INR, CNY, AED).
6. **Slide 6: Live Product Showcase & UI**
   - Screenshots of the Oceanic Digital Twin Dashboard, 72h Gantt horizon, and live Copilot drawer.
   - High-definition Maritime World Map: Live vessel tracking, storm hazard overlays, one-click route acceptance, and automatic red hazard line suppression upon route approval.
7. **Slide 7: Quantifiable Business & Environmental Impact**
   - 22%–28% reduction in vessel anchorage waiting time.
   - 18% increase in net quayside crane moves per hour.
   - Millions in avoided demurrage losses and thousands of metric tons of avoidable CO2 emissions eliminated.
8. **Slide 8: Conclusion, Tech Stack & Next Steps**
   - Scalability to global oceanic container ports, offshore pilotage, and multi-port hinterland integration.

---

> **Note for User:** Copy your final exported PDF or PPTX into this folder named `slides.pdf` or `slides.pptx`.
