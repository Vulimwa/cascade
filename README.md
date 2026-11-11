# Power Under Pressure

Power Under Pressure is a map-first geospatial intelligence application for
understanding climate exposure and electricity infrastructure criticality in
Kisumu County, Kenya.

The application combines a verified ArcGIS Feature Service with interactive
map exploration, infrastructure layers, climate hazard comparison, lifeline
context, and CGF-ACI prioritisation.

## Features

- Map-first Calcite Design System interface
- Situation, Infrastructure, Climate Exposure, and Criticality workspaces
- Verified layer registry for all published service sublayers
- Distinct renderers for grid voltage, hazards, lifelines, and criticality
- Layer legend with visibility controls and zoom thresholds
- Zoom-aware layer visibility to reduce map clutter
- Feature selection, map highlighting, inspection, and zoom-to-asset
- Interactive attribute table with search and priority/voltage filters
- Flood versus extreme heat split-map comparison
- Single-map Priority Corridor Replay:
  1. Hazard footprint
  2. Affected grid corridors
  3. Nearby lifeline corridors
  4. CGF-ACI priority assets
- Basemap switching and synchronized comparison extents

## Data source

The application uses the published POWER UNDER PRESSURE KISUMU ArcGIS Feature
Service:

<https://services8.arcgis.com/oTalEaSXAuyNT7xf/arcgis/rest/services/POWER_UNDER_PRESSURE_KISUMU/FeatureServer>

The service is referenced centrally in
[`src/config/layers.ts`](./src/config/layers.ts). Layer IDs, service URLs,
geometry types, categories, default visibility, and zoom thresholds are
defined in `LAYER_REGISTRY`.

Published sublayers currently registered by the application:

| Layer | Geometry |
| --- | --- |
| `kisumu_cgf_aci_points` | Point |
| `kisumu_energy_points` | Point |
| `kisumu_service_proximity` | Point |
| `kisumu_healthcare` | Point |
| `kisumu_heat_exposed_assets` | Point |
| `kisumu_schools` | Point |
| `kisumu_grid_unidentified` | Polyline |
| `kisumu_cgf_aci_lines` | Polyline |
| `kisumu_flood_exposed_lines` | Polyline |
| `kisumu_service_proximity_lines` | Polyline |
| `kisumu_grid_132kv` | Polyline |
| `kisumu_grid_33kv` | Polyline |
| `kisumu_heat_exposed_lines` | Polyline |
| `kisumu_boundary` | Polygon |
| `kisumu_wards` | Polygon |
| `kisumu_flood_zones` | Polygon |
| `kisumu_heat_zones` | Polygon |
| `kisumu_ward_heat_statistics` | Polygon |

The service must be shared publicly in ArcGIS Online for the public application
to load without a sign-in prompt. Do not put ArcGIS usernames, passwords,
client secrets, or permanent tokens in this frontend repository.

## Technology

- React 18
- TypeScript
- Vite
- ArcGIS Maps SDK for JavaScript 4.31, loaded from the ArcGIS CDN
- Calcite Design System web components
- Tailwind CSS
- Motion and Lucide React dependencies already declared in `package.json`

## Project structure

```text
src/
  App.tsx                    Application shell and workspace state
  index.css                  Global layout and map styles
  components/
    AppHeader.tsx            Search, basemap, and global controls
    AttributeTable.tsx       Filterable infrastructure table
    FeatureInspector.tsx     Selected-feature inspection panel
    MapWorkspace.tsx         Main map, layers, legend, selection, replay
    SplitMapComparison.tsx   Synchronized flood/heat comparison maps
  config/
    layers.ts                Central verified layer registry
  services/
    arcgis.ts                ArcGIS SDK loading, queries, and renderers
    dataService.ts           Live queries and application metrics
  workspaces/
    SituationView.tsx
    InfrastructureView.tsx
    ClimateExposureView.tsx
    CriticalityView.tsx
```

## Requirements

- Node.js 18 or newer
- npm
- Network access to the ArcGIS CDN and the public ArcGIS Feature Service

## Local development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite. The configured development server uses
port `3000`.

## Validation

Run the TypeScript check:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Limitations

CGF-ACI is an analytical prioritisation aid. It does not prove that an asset
will fail, establish electrical connectivity, or predict a specific outage.
The application should only present hazard exposure and infrastructure
relationships supported by the published service.
