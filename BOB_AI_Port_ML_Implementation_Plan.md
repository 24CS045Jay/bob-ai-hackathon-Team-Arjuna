# BOB AI Hackathon -- Port Congestion ML Implementation Plan

## 1. Project Objective

### Project goal

Convert the existing BOB AI Hackathon Team Arjuna port-operations
website into a **real-data, ML-driven Port Congestion Prediction and
Decision Support System**.

The final system should:

``` text
Real AIS Data
     ↓
Data Cleaning
     ↓
Feature Engineering
     ↓
ML Congestion Prediction
     ↓
6h / 12h / 24h / 48h / 72h Forecast
     ↓
Decision Support
 ┌────────┬──────────┬─────────────┐
 ↓        ↓          ↓
Berth    Routing    72h Operations
Planning Recommendation Planning
 ↓        ↓          ↓
Existing Optimization Logic
     ↓
React Dashboard
```

### Important scope

The existing UI, theme, navigation, pages, and operational features
should be preserved.

The main change is:

``` text
OLD:
Mock/local data → JavaScript rules → dashboard

NEW:
Real AIS data → ML prediction → existing optimization → dashboard
```

------------------------------------------------------------------------

# 2. Data Strategy

We will use **two real AIS sources**, with different responsibilities.

## Dataset A -- NOAA AccessAIS

NOAA AccessAIS provides real historical U.S. AIS point data for a
user-selected geographic area and time period.

Official source: https://marinecadastre.gov/accessais/

NOAA describes AccessAIS as a tool for downloading vessel traffic data
for user-defined geographies and time periods. It provides AIS point
data and quick traffic visualizations.

### Use NOAA for

-   Historical ML training
-   Historical vessel movement patterns
-   Vessel density
-   Vessel counts
-   Speed patterns
-   Vessel type distribution
-   Draft/length/width information
-   Time-based traffic patterns
-   Real observed congestion proxies

### Important

AccessAIS provides **point data**, not trackline/transit-count data.
Therefore, the ML pipeline must derive traffic features from the AIS
points.

------------------------------------------------------------------------

## Dataset B -- AISHub Live AIS

Official API documentation: https://www.aishub.net/api

AISHub provides AIS data through JSON, XML, and CSV for members.

The API can provide fields including:

-   MMSI
-   Timestamp
-   Latitude
-   Longitude
-   Course Over Ground
-   Speed Over Ground
-   Heading
-   Navigation status
-   IMO
-   Vessel name
-   Vessel type
-   Vessel dimensions
-   Draft
-   Destination
-   ETA

AISHub explicitly states that its webservice should not be queried more
frequently than once per minute.

### Use AISHub for

-   Live vessel positions
-   Current vessel count
-   Current traffic density
-   Current vessel ETA
-   Current destination
-   Current speed
-   Current draft
-   Live dashboard updates
-   Feeding current conditions into the trained ML model

### Important AISHub limitation

AISHub API access requires joining AISHub and obtaining credentials. The
implementation must read the username/key from environment variables and
never hard-code credentials.

------------------------------------------------------------------------

# 3. Why We Use Both Sources

Do NOT try to train the model directly on the live AISHub feed.

Instead:

``` text
NOAA Historical AIS
       ↓
Training Dataset
       ↓
ML Model
```

Then:

``` text
AISHub Live AIS
       ↓
Current Features
       ↓
Trained ML Model
       ↓
Current/Future Congestion Prediction
```

Final architecture:

``` text
                 NOAA HISTORICAL
                       │
                       ▼
                Data Processing
                       │
                       ▼
                Feature Engineering
                       │
                       ▼
                Train ML Model
                       │
                       ▼
               congestion_model.pkl
                       │
                       │
AISHub LIVE ───────────┤
                       ▼
                Current Features
                       │
                       ▼
                 ML Prediction
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
         Congestion  Risk      Forecast
             │
             ▼
     Existing Optimizers
             │
     ┌───────┼────────┐
     ▼       ▼        ▼
   Berth   Routing   72h Plan
```

------------------------------------------------------------------------

# 4. Existing Website -- What Must Be Preserved

Do NOT rebuild the website.

Keep the existing modules:

-   Dashboard
-   Congestion
-   Vessels
-   Berths
-   Routing
-   Gates
-   Event Cascade
-   Simulation
-   72h Plan
-   Alerts
-   Datasheet
-   World Map

The ML work should enhance these pages.

------------------------------------------------------------------------

# 5. Target ML Features

The model should use real AIS-derived features.

## Primary features

``` text
vessel_count
vessel_density
average_speed
median_speed
average_draft
average_length
cargo_vessel_count
tanker_count
container/cargo vessel count
arrival_density
slow_vessel_count
anchored_vessel_count
moving_vessel_count
hour
day_of_week
```

## AISHub-specific live features

``` text
live_vessel_count
live_vessel_density
eta_count_next_2h
eta_count_next_6h
eta_count_next_12h
destination_distribution
current_average_speed
current_average_draft
current_slow_vessel_count
```

------------------------------------------------------------------------

# 6. ETA

ETA means **Estimated Time of Arrival**.

For this project:

``` text
Vessel ETA
    ↓
Expected arrivals in next 2/6/12 hours
    ↓
Arrival pressure
    ↓
Congestion risk
```

Example:

``` text
Next 2 hours:

V01 → 10:15
V02 → 10:32
V03 → 10:48
V04 → 11:03
V05 → 11:17

ETA bunching = 5 vessels
```

This should become an important ML feature.

------------------------------------------------------------------------

# 7. Congestion Target / Label Strategy

Do NOT create random labels.

The project must not use synthetic training data.

AIS data does not automatically give us a ready-made `congestion_label`.

Therefore, create a **documented observed congestion proxy** from real
AIS behavior.

## Recommended target

Create an hourly/30-minute congestion index from observed AIS traffic.

Possible components:

``` text
Traffic Density
+
Vessel Arrival Pressure
+
Slow/Stopped Vessel Ratio
+
Anchored Vessel Ratio
+
Local Vessel Count
```

Normalize each component to 0--100 and combine them using a documented
formula.

Example conceptual formula:

``` text
Congestion Index =
    0.40 × normalized vessel density
  + 0.25 × normalized arrival pressure
  + 0.20 × normalized slow-vessel ratio
  + 0.15 × normalized anchored-vessel ratio
```

The exact formula must be documented in the code and README.

### Prediction target

Use:

``` text
future_congestion_6h
```

Meaning:

> Given the current observed traffic features, predict the congestion
> index approximately 6 hours later.

This is a much more defensible ML target than randomly assigning
Low/Medium/High labels.

------------------------------------------------------------------------

# 8. Optional Classification Layer

After predicting the continuous score, convert it to risk classes:

``` text
0–34   LOW
35–64  MEDIUM
65–84  HIGH
85–100 CRITICAL
```

Important:

The underlying ML model predicts the continuous congestion score.

The risk class is derived from the score.

------------------------------------------------------------------------

# 9. ML Model

## Primary model

Use:

**Random Forest Regressor**

Reason:

-   Already compatible with the current project
-   Fast to train
-   Works well with tabular data
-   Handles nonlinear relationships
-   Easy to explain
-   Provides feature importance
-   Fast enough for a 4-hour implementation

Do not spend the 4-hour window building LSTM/CNN/Transformer models.

------------------------------------------------------------------------

# 10. Project ML Directory

Create/organize:

``` text
src/ml/
├── data/
│   ├── raw/
│   ├── processed/
│   └── live/
├── preprocessing.py
├── feature_engineering.py
├── label_generation.py
├── train.py
├── evaluate.py
├── predict.py
├── live_ingestion.py
├── model_manager.py
├── models/
│   ├── congestion_model.pkl
│   ├── feature_columns.json
│   ├── feature_importance.json
│   └── model_metrics.json
└── README.md
```

Backend:

``` text
backend/
├── main.py
├── ml_service.py
├── live_ais_service.py
├── prediction_routes.py
└── .env
```

------------------------------------------------------------------------

# 11. Environment Variables

Create:

``` text
AISHUB_USERNAME=your_aishub_username
AISHUB_API_URL=https://data.aishub.net/ws.php
```

Never commit `.env`.

Add:

``` text
.env
```

to `.gitignore`.

Create:

``` text
.env.example
```

containing only:

``` text
AISHUB_USERNAME=
AISHUB_API_URL=https://data.aishub.net/ws.php
```

If any real credential has already been exposed in GitHub, rotate it
before continuing.

------------------------------------------------------------------------

# 12. Phase 0 -- Inspect Existing Project

### Time: 0--20 minutes

The coding agent must first inspect the complete repository.

Identify:

``` text
frontend entry point
backend entry point
ML files
mock data
API services
OperationalContext
CongestionPage
Dashboard
Vessels
Berths
Routing
Simulation
72h planner
Event Cascade
Alerts
World Map
```

Do not modify files during the first inspection.

Create a short architecture summary.

### Output

``` text
Current architecture:
Frontend:
Backend:
ML:
Data:
Optimization:
Main prediction flow:
```

------------------------------------------------------------------------

# 13. Phase 1 -- Remove Synthetic ML Dependency

### Time: 20--35 minutes

Find the existing:

``` text
data_generator.py
```

and any code generating synthetic training records.

Do not use it for final ML training.

Do not necessarily delete it immediately.

Move it to:

``` text
legacy/
```

or clearly mark it as demo-only.

The production ML pipeline must use:

``` text
NOAA AIS → preprocessing → feature engineering → label generation → training
```

------------------------------------------------------------------------

# 14. Phase 2 -- Download NOAA Data

### Time: 35--60 minutes

Open:

https://marinecadastre.gov/accessais/

## Step-by-step

1.  Open AccessAIS.
2.  Select a manageable historical time period.
3.  Select a manageable U.S. coastal port region.
4.  Draw the area of interest around the port/approach.
5.  Request/download AIS point data.
6.  Save the downloaded data inside:

``` text
src/ml/data/raw/noaa/
```

Do not download a massive nationwide dataset.

For a 4-hour project, use a focused port region and manageable period.

------------------------------------------------------------------------

# 15. Phase 3 -- NOAA Data Cleaning

### Time: 60--80 minutes

Create:

``` text
preprocessing.py
```

Perform:

``` text
Remove duplicate records
Remove invalid coordinates
Remove impossible speed values
Handle missing vessel type
Handle missing draft
Handle missing dimensions
Convert timestamps to UTC datetime
Sort by MMSI + timestamp
```

Expected NOAA fields include:

``` text
MMSI
BaseDateTime
LAT
LON
SOG
COG
Heading
VesselName
IMO
CallSign
VesselType
Status
Length
Width
Draft
Cargo
TransceiverClass
```

Save:

``` text
src/ml/data/processed/noaa_clean.csv
```

------------------------------------------------------------------------

# 16. Phase 4 -- Feature Engineering

### Time: 80--105 minutes

Create:

``` text
feature_engineering.py
```

Aggregate AIS observations into hourly buckets.

For each hour/region calculate:

``` text
vessel_count
unique_vessel_count
vessel_density
average_speed
median_speed
average_draft
average_length
cargo_vessel_count
tanker_count
passenger_vessel_count
slow_vessel_count
anchored_vessel_count
moving_vessel_count
hour
day_of_week
```

Create geographic zones if useful:

``` text
PORT_APPROACH
ANCHORAGE
TERMINAL
OUTER_WATER
```

Use a simple geographic grid or manually defined bounding boxes.

Save:

``` text
features.csv
```

------------------------------------------------------------------------

# 17. Phase 5 -- Generate Real Congestion Target

### Time: 105--120 minutes

Create:

``` text
label_generation.py
```

For every hourly observation:

1.  Calculate current congestion proxy.
2.  Shift the target forward by 6 hours.

Example:

``` text
10:00 features
     ↓
predict
     ↓
16:00 congestion index
```

Create:

``` text
future_congestion_6h
```

Remove rows where the future target does not exist.

Final dataset:

``` text
X = current traffic features
y = future_congestion_6h
```

------------------------------------------------------------------------

# 18. Phase 6 -- Train ML Model

### Time: 120--145 minutes

Create/update:

``` text
train.py
```

Pipeline:

``` text
Load features
     ↓
Sort chronologically
     ↓
Time-based train/test split
     ↓
Train RandomForestRegressor
     ↓
Evaluate
     ↓
Save model
```

IMPORTANT:

Do NOT randomly shuffle time-series data before splitting.

Use chronological splitting such as:

``` text
First 80% → training
Last 20% → testing
```

Save:

``` text
models/congestion_model.pkl
models/feature_columns.json
models/feature_importance.json
models/model_metrics.json
```

------------------------------------------------------------------------

# 19. Phase 7 -- Model Evaluation

### Time: 145--155 minutes

Calculate:

``` text
MAE
RMSE
R²
```

Example output:

``` text
Model: Random Forest Regressor

MAE:  X.XX
RMSE: X.XX
R²:   X.XX

Train samples: XXXX
Test samples: XXXX
Features: XX
```

Do not hard-code example metrics.

Display actual metrics produced by the real dataset.

------------------------------------------------------------------------

# 20. Phase 8 -- AISHub Live Integration

### Time: 155--180 minutes

First obtain AISHub membership/API access.

Official documentation:

https://www.aishub.net/api

Create:

``` text
live_ingestion.py
```

The service should:

``` text
Call AISHub
     ↓
Receive JSON
     ↓
Validate records
     ↓
Convert timestamps
     ↓
Filter target region
     ↓
Create current features
```

AISHub supports geographic filters:

``` text
latmin
latmax
lonmin
lonmax
```

Use them to avoid downloading unnecessary global data.

### Polling rule

Do not poll more frequently than once per minute.

For the hackathon dashboard, a 60-second or slower refresh is
sufficient.

------------------------------------------------------------------------

# 21. Live Feature Generation

From AISHub live records calculate:

``` text
live_vessel_count
live_vessel_density
current_average_speed
current_average_draft
current_average_length
live_slow_vessel_count
live_anchored_vessel_count
live_moving_vessel_count
eta_count_next_2h
eta_count_next_6h
eta_count_next_12h
hour
day_of_week
```

Use the same feature names and units as the training pipeline.

This is extremely important.

The live data must be transformed using the same feature schema used
during training.

------------------------------------------------------------------------

# 22. Phase 9 -- ML Prediction API

### Time: 180--200 minutes

Create:

``` text
POST /api/predictions/congestion
```

Input:

``` json
{
  "vessel_count": 14,
  "vessel_density": 0.72,
  "average_speed": 8.4,
  "average_draft": 8.1,
  "average_length": 180,
  "arrival_density": 7,
  "slow_vessel_count": 3,
  "anchored_vessel_count": 2,
  "hour": 14,
  "day_of_week": 5
}
```

Output:

``` json
{
  "congestion_score": 78.4,
  "risk": "HIGH",
  "prediction_horizon": "6h",
  "model": "RandomForestRegressor"
}
```

------------------------------------------------------------------------

# 23. Phase 10 -- Forecast API

Create:

``` text
GET /api/predictions/forecast
```

Return:

``` json
{
  "forecast": [
    {"horizon": "6h", "score": 78},
    {"horizon": "12h", "score": 83},
    {"horizon": "24h", "score": 87},
    {"horizon": "48h", "score": 79},
    {"horizon": "72h", "score": 71}
  ]
}
```

If the model was trained only for 6-hour prediction, do NOT falsely
claim that it independently predicts 12/24/48/72 hours.

For the MVP, either:

1.  Train separate horizon models, or
2.  Clearly implement recursive/multi-step forecasting and document it.

Preferred if time allows:

``` text
model_6h.pkl
model_12h.pkl
model_24h.pkl
model_48h.pkl
model_72h.pkl
```

If time is too limited, make **6-hour prediction the primary ML
forecast** and use the existing planning engine for the longer horizon.

Do not fake ML forecasts.

------------------------------------------------------------------------

# 24. Phase 11 -- Feature Importance API

Create:

``` text
GET /api/predictions/features
```

Example response:

``` json
{
  "features": [
    {
      "name": "vessel_density",
      "importance": 0.42
    },
    {
      "name": "arrival_density",
      "importance": 0.27
    }
  ]
}
```

Frontend should show:

``` text
WHY IS CONGESTION HIGH?

Vessel Density       ████████████
Arrival Pressure     ███████
Slow Vessels         █████
Anchored Vessels     ███
Average Speed        ██
```

------------------------------------------------------------------------

# 25. Phase 12 -- What-If ML API

Create:

``` text
POST /api/predictions/what-if
```

Input:

``` json
{
  "additional_vessels": 5,
  "traffic_multiplier": 1.2,
  "slow_vessel_count": 4,
  "anchored_vessel_count": 3
}
```

The backend modifies the current feature vector and sends it through the
trained model.

Output:

``` json
{
  "current_score": 64,
  "scenario_score": 81,
  "change": 17,
  "risk": "HIGH"
}
```

This becomes the strongest demonstration feature.

------------------------------------------------------------------------

# 26. Phase 13 -- Dashboard Integration

Do not redesign the dashboard.

Add ML information to the existing cards.

Show:

``` text
Current Congestion
6h Predicted
Risk Level
Critical Zones
Model Confidence
```

Example:

``` text
CURRENT
64

6H FORECAST
78

RISK
HIGH

CRITICAL ZONES
2
```

------------------------------------------------------------------------

# 27. Phase 14 -- Congestion Page

This becomes the main ML page.

Add:

``` text
ML Congestion Score
Current Risk
6h Prediction
Feature Importance
Confidence
ETA Bunching
Vessel Density
```

Add forecast visualization:

``` text
Now ─── 6h ─── 12h ─── 24h ─── 48h ─── 72h
 64      78      83       87       79       71
```

Only show horizons that are genuinely produced by the implemented model.

------------------------------------------------------------------------

# 28. Phase 15 -- Simulation Page

Add:

``` text
ML WHAT-IF SIMULATOR
```

Inputs:

``` text
Additional vessels
Traffic increase
Slow vessels
Anchored vessels
```

Button:

``` text
RUN ML PREDICTION
```

Show:

``` text
Current congestion: 64
Scenario congestion: 81
Change: +17
Risk: HIGH
```

Then show recommended operational actions.

------------------------------------------------------------------------

# 29. Phase 16 -- Berth Planner Integration

Do NOT replace the existing berth optimizer.

Use:

``` text
ML congestion prediction
        ↓
Berth pressure
        ↓
Existing berth optimizer
        ↓
Recommended berth
```

Show:

``` text
Vessel: MSC ARJUNA

B01 → predicted pressure 91%
B02 → predicted pressure 84%
B03 → predicted pressure 61%
B04 → predicted pressure 57%

Recommended berth:
B04
```

The recommendation must also respect existing berth constraints.

------------------------------------------------------------------------

# 30. Phase 17 -- Routing Integration

Do NOT replace the existing routing engine.

Add predicted congestion as one route cost.

Example:

``` text
ROUTE A
Distance: 18.4 NM
Congestion risk: HIGH

ROUTE B
Distance: 21.1 NM
Congestion risk: LOW
```

Use:

``` text
route cost =
distance cost
+ congestion cost
+ feasibility constraints
```

Do not select an infeasible route simply because it has lower
congestion.

------------------------------------------------------------------------

# 31. Phase 18 -- 72-Hour Planning

Use ML as an input to the existing planning system.

``` text
ML congestion forecast
        ↓
Expected pressure
        ↓
Existing berth/crane optimizer
        ↓
72-hour operational plan
```

The planner should produce:

``` text
Expected congestion
Vessel schedule
Berth allocation
Crane allocation
Recommended actions
```

------------------------------------------------------------------------

# 32. Phase 19 -- Alerts

Generate ML-driven alerts.

Example:

``` text
CRITICAL CONGESTION PREDICTED

Zone B

Current: 72
6h prediction: 86

Main factors:
• Vessel density
• ETA bunching
• Slow vessels

Recommended:
Reallocate berth/crane capacity.
```

------------------------------------------------------------------------

# 33. Phase 20 -- World Map

Keep the existing map.

Add an ML congestion layer:

``` text
LOW       GREEN
MEDIUM    YELLOW
HIGH      ORANGE
CRITICAL  RED
```

Clicking a zone should show:

``` text
Current congestion
Predicted congestion
Vessel count
ETA pressure
Top ML factors
```

------------------------------------------------------------------------

# 34. Phase 21 -- Live Data Refresh

Recommended architecture:

``` text
AISHub
  ↓
FastAPI
  ↓
Cache latest live AIS data
  ↓
Feature aggregation
  ↓
ML prediction
  ↓
React dashboard
```

Do not make every React component call AISHub directly.

The browser should call your backend.

Use:

``` text
React
  ↓
/api/live/vessels
/api/predictions/congestion
/api/predictions/forecast
```

Backend:

``` text
AISHub
```

This keeps credentials private.

------------------------------------------------------------------------

# 35. Phase 22 -- Caching

Because AISHub should not be called more frequently than once per
minute:

``` text
AISHub
  ↓
60-second cache
  ↓
FastAPI
  ↓
multiple frontend requests
```

Do not call AISHub separately for every UI component.

One backend fetch can feed:

-   World Map
-   Vessel page
-   Dashboard
-   Congestion page
-   ML prediction

------------------------------------------------------------------------

# 36. Phase 23 -- Error Handling

If AISHub is temporarily unavailable:

``` text
AISHub unavailable
       ↓
Use last successful live snapshot
       ↓
Show:
"Live data temporarily unavailable"
```

Do not silently replace live data with fake data.

------------------------------------------------------------------------

# 37. Phase 24 -- Datasheet Page

Add ML fields:

``` text
Timestamp
MMSI
Latitude
Longitude
Speed
Draft
Vessel Type
ETA
Destination
Vessel Density
Congestion Score
Predicted Congestion
Risk
```

Add:

``` text
Data Source:
NOAA / AISHub
```

This makes it easy to prove to judges that the data is real.

------------------------------------------------------------------------

# 38. Phase 25 -- Model Explainability

Show:

``` text
Top factors affecting prediction
```

For Random Forest, use feature importance.

If time permits, add SHAP later.

Do not spend the core 4-hour window implementing SHAP unless the basic
system is already working.

------------------------------------------------------------------------

# 39. Phase 26 -- Testing

Test the pipeline independently.

## Test 1 -- NOAA

``` text
Download
↓
Read
↓
Clean
↓
Feature engineering
```

## Test 2 -- Training

``` text
features.csv
↓
train.py
↓
model.pkl
```

## Test 3 -- Prediction

``` text
test JSON
↓
API
↓
prediction
```

## Test 4 -- AISHub

``` text
AISHub
↓
live JSON
↓
live features
```

## Test 5 -- Frontend

``` text
React
↓
API
↓
ML result
```

## Test 6 -- Existing functionality

Verify:

``` text
Dashboard
Congestion
Vessels
Berths
Routing
Simulation
72h Plan
Alerts
World Map
```

------------------------------------------------------------------------

# 40. Phase 27 -- Final End-to-End Test

Run:

``` text
NOAA historical data
       ↓
training
       ↓
model
       ↓
AISHub live data
       ↓
current features
       ↓
prediction
       ↓
React dashboard
       ↓
ML-informed optimization
```

The complete pipeline must work before adding optional advanced
features.

------------------------------------------------------------------------

# 41. Recommended API Structure

``` text
/api/live/vessels
/api/live/summary

/api/predictions/congestion
/api/predictions/forecast
/api/predictions/features
/api/predictions/what-if

/api/optimization/berth
/api/optimization/routing
/api/optimization/72h
```

------------------------------------------------------------------------

# 42. Recommended Frontend Data Flow

``` text
src/
├── services/
│   ├── liveApi.js
│   ├── predictionApi.js
│   └── optimizationApi.js
│
├── ml/
│   └── ...
│
├── pages/
│   ├── Dashboard
│   ├── Congestion
│   ├── Vessels
│   ├── Berths
│   ├── Routing
│   ├── Simulation
│   ├── Plan72h
│   ├── Alerts
│   └── WorldMap
```

------------------------------------------------------------------------

# 43. Advanced Features -- Only After Core Pipeline Works

These are optional.

## A. ETA Bunching

``` text
Vessels arriving within 2h
```

## B. Congestion Cascade

``` text
Congestion
 ↓
Berth delay
 ↓
Crane queue
 ↓
Yard pressure
 ↓
Gate pressure
```

## C. ML Confidence

Show prediction confidence carefully.

If using Random Forest, do not incorrectly claim the raw prediction is a
calibrated probability.

Instead, use a documented uncertainty/ensemble-spread method if
implemented.

## D. Feature importance

Already recommended.

## E. Scenario comparison

``` text
Normal
vs
+5 vessels
vs
+10 vessels
```

## F. Model monitoring

Show:

``` text
Model version
Training data period
Test metrics
Last model update
Last live-data update
```

------------------------------------------------------------------------

# 44. What NOT to Do

Do NOT:

-   redesign the entire UI
-   remove existing modules
-   create synthetic training data
-   randomly generate congestion labels
-   claim live prediction if only historical data is being used
-   claim 72-hour ML forecasting if the model only predicts 6 hours
-   hard-code AISHub credentials
-   call AISHub directly from React
-   train using future information
-   randomly shuffle a time series before evaluation
-   replace all optimization algorithms with ML
-   spend the first hours on UI animations
-   implement deep learning before the baseline works

------------------------------------------------------------------------

# 45. 4-Hour Execution Schedule

## Hour 1 -- Data

``` text
00:00–00:20  Inspect project
00:20–00:35  Remove synthetic ML dependency
00:35–00:60  NOAA AccessAIS download
```

## Hour 2 -- ML

``` text
60–80   Cleaning
80–105  Feature engineering
105–120 Congestion target
120–145 Random Forest training
145–155 Evaluation
```

## Hour 3 -- Live + Backend

``` text
155–180 AISHub integration
180–200 Prediction API
200–215 Forecast API
215–225 Feature importance API
```

## Hour 4 -- Frontend

``` text
225–235 Dashboard ML
235–245 Congestion ML
245–252 Simulation
252–257 Berth/Routing integration
257–260 Testing/demo
```

If AISHub access takes longer than expected, finish the NOAA + ML + API
pipeline first and keep live ingestion isolated so it can be enabled
immediately once credentials are available.

------------------------------------------------------------------------

# 46. Definition of Done

The project is considered complete when:

### Data

-   [ ] NOAA real AIS data downloaded
-   [ ] NOAA data cleaned
-   [ ] Real feature dataset generated
-   [ ] No synthetic training data

### ML

-   [ ] Real-data congestion target generated
-   [ ] Random Forest trained
-   [ ] MAE calculated
-   [ ] RMSE calculated
-   [ ] R² calculated
-   [ ] Model saved
-   [ ] Feature importance saved

### Live

-   [ ] AISHub credentials configured
-   [ ] Live AIS endpoint working
-   [ ] Live data filtered to target region
-   [ ] Live features generated
-   [ ] One-minute-or-slower polling respected
-   [ ] Latest snapshot cached

### Backend

-   [ ] Congestion API working
-   [ ] Forecast API working
-   [ ] Feature importance API working
-   [ ] What-if API working
-   [ ] Live vessel API working

### Frontend

-   [ ] Dashboard uses ML
-   [ ] Congestion page uses ML
-   [ ] Simulation uses ML
-   [ ] Berth optimizer receives ML pressure
-   [ ] Routing receives congestion cost
-   [ ] 72h plan receives forecast information
-   [ ] Alerts use predicted risk
-   [ ] Map shows live/ML information

### Security

-   [ ] `.env` excluded from Git
-   [ ] AISHub credentials not exposed
-   [ ] `.env.example` created
-   [ ] Exposed credentials rotated if necessary

------------------------------------------------------------------------

# 47. Final Demo Story

The presentation should demonstrate one complete scenario.

## Step 1 -- Live situation

``` text
AISHub Live AIS

18 vessels detected
7 approaching port
4 arriving within 2 hours
```

## Step 2 -- ML prediction

``` text
Current congestion: 64

Predicted 6h congestion: 82

Risk: HIGH
```

## Step 3 -- Explain why

``` text
Top factors:

Vessel density
ETA bunching
Slow vessel ratio
Anchored vessels
```

## Step 4 -- What-if

``` text
Add 5 incoming vessels

Prediction:
64 → 88

Risk:
HIGH → CRITICAL
```

## Step 5 -- Decision support

``` text
ML detects future pressure
        ↓
Berth optimizer recommends B04
        ↓
Routing optimizer selects lower-congestion route
        ↓
72-hour planner updates schedule
```

## Step 6 -- Dashboard

Show:

``` text
LIVE AIS
   ↓
ML PREDICTION
   ↓
CONGESTION FORECAST
   ↓
OPTIMIZATION
   ↓
OPERATIONAL PLAN
```

------------------------------------------------------------------------

# 48. Final Architecture

``` text
                         ┌─────────────────────┐
                         │ NOAA AccessAIS      │
                         │ Historical AIS      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                           Data Preprocessing
                                    │
                                    ▼
                          Feature Engineering
                                    │
                                    ▼
                         Real Congestion Target
                                    │
                                    ▼
                       Random Forest Regressor
                                    │
                  ┌─────────────────┴────────────────┐
                  │                                  │
                  ▼                                  ▼
          Model + Metrics                    Feature Importance
                  │
                  │
                  │       ┌──────────────────────┐
                  └──────►│ AISHub Live AIS      │
                          └──────────┬───────────┘
                                     │
                                     ▼
                              Live Features
                                     │
                                     ▼
                              ML Prediction API
                                     │
                       ┌─────────────┼─────────────┐
                       ▼             ▼             ▼
                  Congestion      Forecast      What-if
                       │
                       ▼
                 Decision Layer
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
            Berth    Routing   72h Plan
           Optimizer Optimizer Planner
              │        │        │
              └────────┼────────┘
                       ▼
                React Dashboard
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
   Congestion       Simulation       World Map
       │
       ▼
     Alerts
```

------------------------------------------------------------------------

# 49. Official Data References

### AISHub API

https://www.aishub.net/api

AISHub documents JSON/XML/CSV AIS access, geographic filtering, ETA,
destination, draft, vessel type, speed, heading and other AIS fields. It
also states that API calls should not be made more frequently than once
per minute.

### NOAA AccessAIS

https://marinecadastre.gov/accessais/

NOAA AccessAIS allows users to select a geographic area and time period
and download AIS point data.

### NOAA AccessAIS Documentation

https://coast.noaa.gov/data/marinecadastre/ais/accessais-help.pdf

The documentation explains the time-period and geographic-area selection
process and notes that AccessAIS provides point data.

### NOAA AIS Data Dictionary

https://coast.noaa.gov/data/marinecadastre/ais/data-dictionary.pdf

The current AIS data dictionary documents fields such as MMSI,
timestamp, latitude, longitude, SOG, COG, heading, vessel type, status,
length, width, draft, cargo and transceiver class.

------------------------------------------------------------------------

# 50. Final Instruction to the Coding Agent

The priority order is:

``` text
1. REAL DATA
2. CORRECT ML TARGET
3. WORKING MODEL
4. BACKEND API
5. AISHub LIVE INGESTION
6. FRONTEND ML INTEGRATION
7. OPTIMIZATION INTEGRATION
8. ADVANCED FEATURES
9. UI POLISH
```

Never sacrifice the correctness of the ML/data pipeline for visual
changes.

The final project must clearly demonstrate:

> **Real AIS data → ML prediction → congestion forecast → explainable
> factors → what-if analysis → berth/routing/72-hour decision support.**
