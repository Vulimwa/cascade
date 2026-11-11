/**
 * ArcGIS Maps SDK for JavaScript Service Connector
 * Handles dynamic ESM module loading, layer instantiation,
 * and server-side feature querying.
 */

// Cache loaded modules
let arcgisModules: any = null;

export interface ArcGISCoreModules {
  Map: any;
  MapView: any;
  FeatureLayer: any;
  GraphicsLayer: any;
  Graphic: any;
  PopupTemplate: any;
  Legend: any;
  reactiveUtils: any;
  esriConfig: any;
}

export async function loadArcGIS(): Promise<ArcGISCoreModules> {
  if (arcgisModules) {
    return arcgisModules;
  }

  try {
    // Dynamic ESM import helper to bypass static bundler/tsc resolution
    const dynamicImport = (url: string) =>
      new Function('u', 'return import(u)')(url);

    const [
      { default: Map },
      { default: MapView },
      { default: FeatureLayer },
      { default: GraphicsLayer },
      { default: Graphic },
      { default: PopupTemplate },
      { default: Legend },
      reactiveUtils,
      { default: esriConfig }
    ] = await Promise.all([
      dynamicImport('https://js.arcgis.com/4.31/@arcgis/core/Map.js'),
      dynamicImport('https://js.arcgis.com/4.31/@arcgis/core/views/MapView.js'),
      dynamicImport('https://js.arcgis.com/4.31/@arcgis/core/layers/FeatureLayer.js'),
      dynamicImport('https://js.arcgis.com/4.31/@arcgis/core/layers/GraphicsLayer.js'),
      dynamicImport('https://js.arcgis.com/4.31/@arcgis/core/Graphic.js'),
      dynamicImport('https://js.arcgis.com/4.31/@arcgis/core/PopupTemplate.js'),
      dynamicImport('https://js.arcgis.com/4.31/@arcgis/core/widgets/Legend.js'),
      dynamicImport('https://js.arcgis.com/4.31/@arcgis/core/core/reactiveUtils.js'),
      dynamicImport('https://js.arcgis.com/4.31/@arcgis/core/config.js')
    ]);

    arcgisModules = {
      Map,
      MapView,
      FeatureLayer,
      GraphicsLayer,
      Graphic,
      PopupTemplate,
      Legend,
      reactiveUtils,
      esriConfig
    };

    return arcgisModules;
  } catch (err) {
    console.error('Failed to load ArcGIS Maps SDK modules from CDN:', err);
    throw err;
  }
}

/**
 * Executes a REST query against an ArcGIS FeatureServer sublayer
 */
export async function queryArcGISLayer(
  serviceUrl: string,
  options: {
    where?: string;
    outFields?: string[];
    returnGeometry?: boolean;
    resultRecordCount?: number;
  } = {}
) {
  const {
    where = '1=1',
    outFields = ['*'],
    returnGeometry = false,
    resultRecordCount = 50
  } = options;

  const queryUrl = `${serviceUrl}/query?f=json&where=${encodeURIComponent(where)}&outFields=${encodeURIComponent(
    outFields.join(',')
  )}&returnGeometry=${returnGeometry}&resultRecordCount=${resultRecordCount}`;

  const response = await fetch(queryUrl);
  if (!response.ok) {
    throw new Error(`REST query failed with HTTP status ${response.status}`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || 'REST query error');
  }
  return data;
}

/**
 * Creates custom symbology for layers
 */
export function getCustomRenderer(layerId: string) {
  switch (layerId) {
    case 'kisumu_boundary':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [240, 243, 246, 0.15],
          outline: {
            color: [30, 41, 59, 0.9],
            width: 2.2,
            style: 'solid'
          }
        }
      };

    case 'kisumu_wards':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [148, 163, 184, 0.04],
          outline: { color: [71, 85, 105, 0.7], width: 1, style: 'dash' }
        }
      };

    case 'kisumu_grid_132kv':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [124, 58, 237, 1.0],
          width: 3.5
        }
      };

    case 'kisumu_grid_33kv':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [37, 99, 235, 1.0],
          width: 2.5
        }
      };

    case 'kisumu_grid_unidentified':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [100, 116, 139, 0.85],
          width: 1.5,
          style: 'dash'
        }
      };

    case 'kisumu_cgf_aci_lines':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [220, 38, 38, 1.0],
          width: 4
        }
      };

    case 'kisumu_flood_exposed_lines':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [2, 132, 199, 1.0],
          width: 3,
          style: 'dash'
        }
      };

    case 'kisumu_heat_exposed_lines':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [234, 88, 12, 1.0],
          width: 3,
          style: 'dot'
        }
      };

    case 'kisumu_service_proximity_lines':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [16, 185, 129, 1.0],
          width: 2,
          style: 'dash'
        }
      };

    case 'kisumu_flood_zones':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [14, 165, 233, 0.25],
          outline: {
            color: [3, 105, 161, 0.85],
            width: 1.2
          }
        }
      };

    case 'kisumu_heat_zones':
    case 'kisumu_ward_heat_statistics':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [249, 115, 22, 0.27],
          outline: {
            color: [194, 65, 12, 0.85],
            width: 1.2
          }
        }
      };

    case 'kisumu_cgf_aci_points':
      return {
        type: 'unique-value',
        field: 'priority_class',
        defaultSymbol: {
          type: 'simple-marker',
          style: 'diamond',
          color: [100, 116, 139, 0.95],
          size: 9,
          outline: { color: [255, 255, 255, 1], width: 1.3 }
        },
        uniqueValueInfos: [
          { value: 'Severe Priority', symbol: { type: 'simple-marker', style: 'diamond', color: [185, 28, 28, 1], size: 14, outline: { color: [255, 255, 255, 1], width: 1.8 } } },
          { value: 'High Priority', symbol: { type: 'simple-marker', style: 'diamond', color: [234, 88, 12, 1], size: 12, outline: { color: [255, 255, 255, 1], width: 1.6 } } },
          { value: 'Moderate Priority', symbol: { type: 'simple-marker', style: 'diamond', color: [202, 138, 4, 1], size: 10, outline: { color: [255, 255, 255, 1], width: 1.4 } } },
          { value: 'Low Priority', symbol: { type: 'simple-marker', style: 'diamond', color: [22, 163, 74, 1], size: 8, outline: { color: [255, 255, 255, 1], width: 1.2 } } }
        ]
      };

    case 'kisumu_energy_points':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          color: [30, 64, 175, 1],
          size: 9,
          outline: {
            color: [255, 255, 255, 1],
            width: 1.5
          }
        }
      };

    case 'kisumu_healthcare':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'cross',
          color: [225, 29, 72, 1],
          size: 11,
          outline: {
            color: [255, 255, 255, 1],
            width: 1.2
          }
        }
      };

    case 'kisumu_schools':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'square',
          color: [5, 150, 105, 1],
          size: 9,
          outline: { color: [255, 255, 255, 1], width: 1.2 }
        }
      };

    case 'kisumu_heat_exposed_assets':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'triangle',
          color: [234, 88, 12, 1],
          size: 10,
          outline: { color: [255, 255, 255, 1], width: 1.2 }
        }
      };

    case 'kisumu_service_proximity':
      return {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          color: [16, 185, 129, 0.9],
          size: 8,
          outline: { color: [255, 255, 255, 1], width: 1.2 }
        }
      };

    default:
      return undefined;
  }
}
