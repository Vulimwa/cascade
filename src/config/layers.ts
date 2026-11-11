/**
 * Verified layer registry for the published POWER UNDER PRESSURE service.
 * Layer IDs and names are taken from data.md and are intentionally not inferred.
 */

export type LayerCategory =
  | 'boundary'
  | 'grid'
  | 'energy_point'
  | 'flood'
  | 'heat'
  | 'criticality'
  | 'lifeline';

export interface LayerRegistryEntry {
  id: string;
  name: string;
  displayLabel: string;
  category: LayerCategory;
  geometryType: 'point' | 'polyline' | 'polygon';
  serviceUrl: string;
  defaultVisibility: boolean;
  opacity?: number;
  participatesInAnalytics: boolean;
  minZoom?: number;
  maxZoom?: number;
  voltageClass?: string;
  popupTitle: string;
  popupFields: { fieldName: string; label: string; format?: string }[];
  rendererConfig?: any;
}

export const KISUMU_EXTENT = {
  xmin: 34.40,
  ymin: -0.92,
  xmax: 35.38,
  ymax: 0.25,
  spatialReference: { wkid: 4326 }
};

export const UNIFIED_PUP_SERVICE_URL =
  'https://services8.arcgis.com/oTalEaSXAuyNT7xf/arcgis/rest/services/POWER_UNDER_PRESSURE_KISUMU/FeatureServer';

export const BASE_SERVICE_URL =
  'https://services8.arcgis.com/oTalEaSXAuyNT7xf/arcgis/rest/services';

const layer = (
  id: number,
  name: string,
  displayLabel: string,
  category: LayerCategory,
  geometryType: LayerRegistryEntry['geometryType'],
  options: Partial<LayerRegistryEntry> = {}
): LayerRegistryEntry => ({
  id: name,
  name,
  displayLabel,
  category,
  geometryType,
  serviceUrl: `${UNIFIED_PUP_SERVICE_URL}/${id}`,
  defaultVisibility: options.defaultVisibility ?? false,
  opacity: options.opacity ?? 0.85,
  participatesInAnalytics: options.participatesInAnalytics ?? true,
  voltageClass: options.voltageClass,
  minZoom: options.minZoom,
  maxZoom: options.maxZoom,
  popupTitle: displayLabel,
  popupFields: [],
  rendererConfig: options.rendererConfig
});

export const LAYER_REGISTRY: LayerRegistryEntry[] = [
  layer(0, 'kisumu_cgf_aci_points', 'CGF-ACI Critical Point Assets', 'criticality', 'point', { defaultVisibility: true, minZoom: 12 }),
  layer(1, 'kisumu_energy_points', 'Energy Infrastructure Points', 'energy_point', 'point', { defaultVisibility: true, minZoom: 12 }),
  layer(2, 'kisumu_service_proximity', 'Service Proximity Assets', 'lifeline', 'point'),
  layer(3, 'kisumu_healthcare', 'Healthcare Facilities', 'lifeline', 'point', { defaultVisibility: true, minZoom: 12 }),
  layer(4, 'kisumu_heat_exposed_assets', 'Heat-Exposed Assets', 'heat', 'point', { defaultVisibility: true, minZoom: 12 }),
  layer(5, 'kisumu_schools', 'Schools', 'lifeline', 'point', { defaultVisibility: true, minZoom: 12 }),
  layer(6, 'kisumu_grid_unidentified', 'Unidentified Grid Lines', 'grid', 'polyline', { minZoom: 11 }),
  layer(7, 'kisumu_cgf_aci_lines', 'CGF-ACI Critical Grid Lines', 'criticality', 'polyline', { defaultVisibility: true, minZoom: 10 }),
  layer(8, 'kisumu_flood_exposed_lines', 'Flood-Exposed Grid Lines', 'flood', 'polyline', { defaultVisibility: true, minZoom: 10 }),
  layer(9, 'kisumu_service_proximity_lines', 'Grid Lines Near Services', 'lifeline', 'polyline', { minZoom: 10 }),
  layer(10, 'kisumu_grid_132kv', '132kV Grid', 'grid', 'polyline', { defaultVisibility: true, voltageClass: '132kV', minZoom: 9 }),
  layer(11, 'kisumu_grid_33kv', '33kV Grid', 'grid', 'polyline', { defaultVisibility: true, voltageClass: '33kV', minZoom: 10 }),
  layer(12, 'kisumu_heat_exposed_lines', 'Heat-Exposed Grid Lines', 'heat', 'polyline', { defaultVisibility: true, minZoom: 10 }),
  layer(13, 'kisumu_boundary', 'Kisumu County Boundary', 'boundary', 'polygon', { defaultVisibility: true, participatesInAnalytics: false }),
  layer(14, 'kisumu_wards', 'Kisumu Wards', 'boundary', 'polygon', { defaultVisibility: true, minZoom: 9 }),
  layer(15, 'kisumu_flood_zones', 'Flood Zones', 'flood', 'polygon', { defaultVisibility: true, minZoom: 9 }),
  layer(16, 'kisumu_heat_zones', 'Heat Zones', 'heat', 'polygon', { defaultVisibility: true, minZoom: 9 }),
  layer(17, 'kisumu_ward_heat_statistics', 'Ward Heat Statistics', 'heat', 'polygon')
];
