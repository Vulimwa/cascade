import React, { useEffect, useRef, useState } from 'react';
import { loadArcGIS, getCustomRenderer } from '../services/arcgis';
import { KISUMU_EXTENT, LAYER_REGISTRY } from '../config/layers';
import { AssetRecord, calculateCGFACI } from '../services/dataService';

interface MapWorkspaceProps {
  activeWorkspace: string;
  selectedAsset: AssetRecord | null;
  onSelectAsset: (asset: AssetRecord | null) => void;
  visibleLayerIds: string[];
  onToggleLayer: (id: string) => void;
  currentBasemap: string;
  allAssets: AssetRecord[];
  replayHazard: 'flood' | 'heat' | null;
  onReplayStageChange: (stage: string | null) => void;
}

export const MapWorkspace: React.FC<MapWorkspaceProps> = ({
  activeWorkspace,
  selectedAsset,
  onSelectAsset,
  visibleLayerIds,
  onToggleLayer,
  currentBasemap,
  allAssets,
  replayHazard,
  onReplayStageChange
}) => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const layersMapRef = useRef<Map<string, any>>(new Map());
  const interactiveGraphicsLayerRef = useRef<any>(null);
  const GraphicRef = useRef<any>(null);
  const selectedHighlightRef = useRef<any>(null);
  const selectedGeometryRef = useRef<any>(null);
  const selectedGeometryAssetIdRef = useRef<string | null>(null);
  const visibleLayerIdsRef = useRef(visibleLayerIds);
  const replayHandlesRef = useRef<any[]>([]);
  const replayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replayRunRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [legendOpen, setLegendOpen] = useState(false);

  // Initialize ArcGIS Map & View
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      try {
        setLoading(true);
        const { Map, MapView, FeatureLayer, GraphicsLayer, Graphic, reactiveUtils } = await loadArcGIS();

        if (!isMounted || !mapDivRef.current) return;

        const map = new Map({
          basemap: currentBasemap
        });
        mapRef.current = map;

        const view = new MapView({
          container: mapDivRef.current,
          map: map,
          extent: KISUMU_EXTENT,
          constraints: {
            minZoom: 8,
            maxZoom: 18
          },
          ui: {
            components: ['zoom', 'compass']
          }
        });
        viewRef.current = view;

        // Create GraphicsLayer for high-priority interactive asset markers
        const interactiveGraphicsLayer = new GraphicsLayer({
          id: 'interactive_assets',
          title: 'Infrastructure & Criticality Markers'
        });
        interactiveGraphicsLayerRef.current = interactiveGraphicsLayer;
        GraphicRef.current = Graphic;

        // Add FeatureLayers from registry
        for (const entry of LAYER_REGISTRY) {
          try {
            const fl = new FeatureLayer({
              id: entry.id,
              url: entry.serviceUrl,
              title: entry.displayLabel,
              visible: visibleLayerIds.includes(entry.id),
              minScale: entry.minZoom ? zoomToScale(entry.minZoom) : undefined,
              opacity: entry.opacity || 0.8,
              renderer: getCustomRenderer(entry.id)
            });
            map.add(fl);
            layersMapRef.current.set(entry.id, fl);
          } catch (err) {
            console.warn(`Layer ${entry.id} initialization skipped:`, err);
          }
        }

        map.add(interactiveGraphicsLayer);
        reactiveUtils.watch(
          () => view.zoom,
          () => applyLayerVisibility(view.zoom, layersMapRef.current, visibleLayerIdsRef.current)
        );

        // Click interaction handler
        view.on('click', async (event: any) => {
          const response = await view.hitTest(event);
          const results = response.results || [];

          if (results.length > 0) {
            // Check for graphic in interactive layer
            const graphicHit = results.find(
              (r: any) => r.graphic && r.graphic.layer?.id === 'interactive_assets'
            );

            if (graphicHit) {
              const assetAttr = graphicHit.graphic.attributes as AssetRecord;
              selectedGeometryRef.current = graphicHit.graphic.geometry;
              selectedGeometryAssetIdRef.current = assetAttr.id;
              if (selectedHighlightRef.current) {
                selectedHighlightRef.current.remove();
                selectedHighlightRef.current = null;
              }
              view.goTo(graphicHit.graphic.geometry, { zoom: 14, duration: 800 });
              onSelectAsset(assetAttr);
              return;
            }

            // Check if feature layer feature hit
            const featureHit = results.find((r: any) => r.graphic && r.graphic.layer);
            if (featureHit) {
              const feat = featureHit.graphic;
              const layerId = feat.layer?.id;
              const fid = feat.attributes?.FID || feat.attributes?.OBJECTID_1 || feat.attributes?.OBJECTID;
              selectedGeometryRef.current = feat.geometry;
              selectedGeometryAssetIdRef.current = `${layerId}_${fid || 1}`;
              if (selectedHighlightRef.current) {
                selectedHighlightRef.current.remove();
              }
              try {
                const layerView = await view.whenLayerView(feat.layer);
                selectedHighlightRef.current = layerView.highlight(feat);
              } catch (err) {
                console.warn('Feature highlight unavailable:', err);
              }
              view.goTo(feat.geometry, { duration: 800 });

              // Match against real compiled assets by ID
              let matchedAsset: AssetRecord | undefined;
              matchedAsset = allAssets.find((a) => a.id === `${layerId}_${fid}`);

              if (matchedAsset) {
                onSelectAsset(matchedAsset);
                return;
              }

              const matchedRegistry = LAYER_REGISTRY.find((l) => l.id === layerId);
              const voltage = matchedRegistry?.voltageClass || 'Grid';
              const isFlood = layerId === 'kisumu_flood_zones' || layerId === 'kisumu_flood_exposed_lines';
              const isHeat = layerId === 'kisumu_heat_zones' || layerId === 'kisumu_heat_exposed_lines';

              const calculated = calculateCGFACI(voltage, isFlood, isHeat, Number.NaN, Number.NaN);

              const featureAsset: AssetRecord = {
                id: `${layerId}_${fid || 1}`,
                name:
                  feat.attributes?.Facility_n ||
                  feat.attributes?.Name_of_Sc ||
                  feat.attributes?.Branch3 ||
                  feat.attributes?.ward ||
                  matchedRegistry?.displayLabel ||
                  'Spatial Feature',
                category: matchedRegistry?.category || 'Infrastructure',
                type: matchedRegistry?.displayLabel || 'Spatial Feature',
                voltage: matchedRegistry?.voltageClass,
                geometryType: (feat.geometry?.type as any) || 'point',
                coordinates: [event.mapPoint.longitude, event.mapPoint.latitude],
                floodExposed: isFlood,
                heatExposed: isHeat,
                nearestClinicDistanceM: Number.NaN,
                nearestSchoolDistanceM: Number.NaN,
                cgfAciScore: calculated.score,
                priorityClass: calculated.priorityClass,
                componentScores: calculated.components,
                wardName: feat.attributes?.ward || feat.attributes?.Admin1 || feat.attributes?.County2
              };

              onSelectAsset(featureAsset);
            }
          }
        });

        setLoading(false);
      } catch (err) {
        console.error('Error initializing MapView:', err);
        setLoading(false);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      stopReplay(replayHandlesRef, replayTimerRef, replayRunRef, onReplayStageChange);
      if (viewRef.current) {
        if (selectedHighlightRef.current) {
          selectedHighlightRef.current.remove();
          selectedHighlightRef.current = null;
        }
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [onReplayStageChange]);

  useEffect(() => {
    if (!viewRef.current || !replayHazard) {
      stopReplay(replayHandlesRef, replayTimerRef, replayRunRef, onReplayStageChange);
      return;
    }

    startReplay(
      replayHazard,
      layersMapRef.current,
      viewRef.current,
      replayHandlesRef,
      replayTimerRef,
      replayRunRef,
      onReplayStageChange
    );

    return () => stopReplay(replayHandlesRef, replayTimerRef, replayRunRef, onReplayStageChange);
  }, [replayHazard, onReplayStageChange]);

  useEffect(() => {
    const layer = interactiveGraphicsLayerRef.current;
    const Graphic = GraphicRef.current;
    if (!layer || !Graphic) return;

    layer.removeAll();
    allAssets.forEach((asset) => {
      if (asset.geometryType !== 'point' || !Array.isArray(asset.coordinates)) return;
      const [lon, lat] = asset.coordinates as [number, number];
      let markerColor = [34, 197, 94, 0.9];
      if (asset.priorityClass === 'Severe Priority') markerColor = [239, 68, 68, 1.0];
      else if (asset.priorityClass === 'High Priority') markerColor = [249, 115, 22, 1.0];
      else if (asset.priorityClass === 'Moderate Priority') markerColor = [234, 179, 8, 1.0];

      layer.add(new Graphic({
        geometry: { type: 'point', longitude: lon, latitude: lat },
        symbol: {
          type: 'simple-marker',
          color: markerColor,
          size: asset.type === 'Substation' ? 12 : 9,
          outline: { color: [255, 255, 255, 1], width: 1.5 }
        },
        attributes: asset
      }));
    });
  }, [allAssets]);

  // Update Basemap when changed in header
  useEffect(() => {
    if (mapRef.current && currentBasemap) {
      mapRef.current.basemap = currentBasemap;
    }
  }, [currentBasemap]);

  // Update Layer Visibility
  useEffect(() => {
    visibleLayerIdsRef.current = visibleLayerIds;
    layersMapRef.current.forEach((layer, id) => {
      const entry = LAYER_REGISTRY.find((candidate) => candidate.id === id);
      layer.visible =
        visibleLayerIds.includes(id) &&
        (!entry?.minZoom || (viewRef.current?.zoom ?? entry.minZoom) >= entry.minZoom) &&
        (!entry?.maxZoom || (viewRef.current?.zoom ?? entry.maxZoom) <= entry.maxZoom);
    });
  }, [visibleLayerIds]);

  // Handle selected asset zoom & highlight
  useEffect(() => {
    if (viewRef.current && selectedAsset && selectedAsset.coordinates) {
      if (
        selectedGeometryRef.current &&
        selectedGeometryAssetIdRef.current === selectedAsset.id
      ) {
        viewRef.current.goTo(selectedGeometryRef.current, { duration: 800 });
        return;
      }
      selectedGeometryRef.current = null;
      selectedGeometryAssetIdRef.current = null;
      if (Array.isArray(selectedAsset.coordinates) && selectedAsset.coordinates.length === 2) {
        const [lon, lat] = selectedAsset.coordinates as [number, number];
        viewRef.current.goTo(
          {
            center: [lon, lat],
            zoom: 14
          },
          { duration: 800 }
        );
      }
    }
  }, [selectedAsset]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Map Canvas */}
      <div ref={mapDivRef} className="map-view-container" />

      {/* Loading Indicator */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30
          }}
        >
          <calcite-loader active scale="m" label="Loading Kisumu spatial workspace..." />
        </div>
      )}

      {/* Floating Layer Visibility & Legend Control */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        <calcite-button
          scale="s"
          appearance="solid"
          kind="neutral"
          iconStart="layers"
          onClick={() => setLegendOpen(!legendOpen)}
        >
          Layer Legend
        </calcite-button>

        {legendOpen && (
          <calcite-panel
            heading="Map Layer Legend"
            closable
            onCalcitePanelClose={() => setLegendOpen(false)}
            style={{ width: '280px', maxHeight: '380px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
              {LAYER_REGISTRY.map((layer) => {
                const isVisible = visibleLayerIds.includes(layer.id);
                return (
                  <div
                    key={layer.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      padding: '4px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span
                        style={{
                          width: layer.geometryType === 'polyline' ? '22px' : '12px',
                          height: layer.geometryType === 'polyline' ? '4px' : '12px',
                          borderRadius: layer.geometryType === 'point' ? '50%' : '2px',
                          flexShrink: 0,
                          backgroundColor: getLegendColor(layer.id),
                          border: layer.geometryType === 'polygon' ? `2px solid ${getLegendColor(layer.id)}` : undefined
                        }}
                      />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {layer.displayLabel}
                      </span>
                      {layer.minZoom && (
                        <span style={{ color: 'var(--calcite-ui-text-3)', fontSize: '10px' }}>
                          z{layer.minZoom}+
                        </span>
                      )}
                    </div>

                    <calcite-action
                      scale="s"
                      icon={isVisible ? 'view-visible' : 'view-hide'}
                      text={isVisible ? 'Hide layer' : 'Show layer'}
                      textEnabled={false}
                      onClick={() => onToggleLayer(layer.id)}
                    />
                  </div>
                );
              })}
            </div>
          </calcite-panel>
        )}
      </div>

      {/* Floating Extent Reset Button */}
      <div style={{ position: 'absolute', bottom: '24px', left: '16px', zIndex: 10 }}>
        <calcite-button
          scale="s"
          appearance="solid"
          kind="neutral"
          iconStart="reset"
          onClick={() => {
            if (viewRef.current) {
              viewRef.current.goTo(
                {
                  center: [34.767, -0.102],
                  zoom: 11
                },
                { duration: 600 }
              );
            }
          }}
        >
          Reset Kisumu Extent
        </calcite-button>
      </div>
    </div>
  );
};

function getLegendColor(layerId: string): string {
  const colors: Record<string, string> = {
    kisumu_boundary: '#1e293b',
    kisumu_wards: '#64748b',
    kisumu_grid_132kv: '#7c3aed',
    kisumu_grid_33kv: '#2563eb',
    kisumu_grid_unidentified: '#64748b',
    kisumu_cgf_aci_lines: '#dc2626',
    kisumu_flood_exposed_lines: '#0284c7',
    kisumu_heat_exposed_lines: '#ea580c',
    kisumu_service_proximity_lines: '#10b981',
    kisumu_flood_zones: '#0ea5e9',
    kisumu_heat_zones: '#f97316',
    kisumu_ward_heat_statistics: '#f97316',
    kisumu_cgf_aci_points: '#dc2626',
    kisumu_energy_points: '#1e40af',
    kisumu_healthcare: '#e11d48',
    kisumu_schools: '#059669',
    kisumu_heat_exposed_assets: '#ea580c',
    kisumu_service_proximity: '#10b981'
  };
  return colors[layerId] || '#94a3b8';
}

function applyLayerVisibility(
  zoom: number,
  layers: Map<string, any>,
  selectedLayerIds: string[]
): void {
  layers.forEach((layer, id) => {
    const entry = LAYER_REGISTRY.find((candidate) => candidate.id === id);
    layer.visible =
      selectedLayerIds.includes(id) &&
      (!entry?.minZoom || zoom >= entry.minZoom) &&
      (!entry?.maxZoom || zoom <= entry.maxZoom);
  });
}

function zoomToScale(zoom: number): number {
  return 591657527.591555 / 2 ** zoom;
}

type ReplayHazard = 'flood' | 'heat';

interface ReplayStage {
  label: string;
  layerIds: string[];
}

function getReplayStages(hazard: ReplayHazard): ReplayStage[] {
  const exposedLines =
    hazard === 'flood' ? 'kisumu_flood_exposed_lines' : 'kisumu_heat_exposed_lines';
  const hazardZones = hazard === 'flood' ? 'kisumu_flood_zones' : 'kisumu_heat_zones';
  const hazardLabel = hazard === 'flood' ? 'Flood hazard footprint' : 'Extreme heat footprint';

  return [
    { label: hazardLabel, layerIds: [hazardZones] },
    { label: 'Affected grid corridors', layerIds: [exposedLines] },
    { label: 'Nearby lifeline corridors', layerIds: ['kisumu_service_proximity_lines'] },
    {
      label: 'CGF-ACI priority assets',
      layerIds: ['kisumu_cgf_aci_lines', 'kisumu_cgf_aci_points']
    }
  ];
}

async function startReplay(
  hazard: ReplayHazard,
  layers: Map<string, any>,
  view: any,
  handlesRef: React.MutableRefObject<any[]>,
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  runRef: React.MutableRefObject<number>,
  onStageChange: (stage: string | null) => void
): Promise<void> {
  stopReplay(handlesRef, timerRef, runRef, onStageChange);
  const runId = runRef.current;
  const stages = getReplayStages(hazard);

  for (const stage of stages) {
    if (runRef.current !== runId) return;
    clearReplayHighlights(handlesRef);
    onStageChange(stage.label);

    const features: any[] = [];
    for (const layerId of stage.layerIds) {
      const layer = layers.get(layerId);
      if (!layer) continue;

      layer.visible = true;
      try {
        const result = await layer.queryFeatures({
          where: '1=1',
          outFields: ['*'],
          returnGeometry: true,
          resultRecordCount: 150
        });
        if (runRef.current !== runId) return;
        const layerView = await view.whenLayerView(layer);
        const stageFeatures = result.features || [];
        if (stageFeatures.length > 0) {
          handlesRef.current.push(layerView.highlight(stageFeatures));
          features.push(...stageFeatures);
        }
      } catch (error) {
        console.warn(`Replay could not load ${layerId}:`, error);
      }
    }

    if (runRef.current !== runId) return;
    if (features.length > 0) {
      try {
        await view.goTo(features, { duration: 700 });
      } catch (error) {
        console.warn(`Replay could not navigate to ${stage.label}:`, error);
      }
    }

    await new Promise<void>((resolve) => {
      timerRef.current = setTimeout(resolve, 1800);
    });
  }

  if (runRef.current === runId) {
    onStageChange('Replay complete');
    timerRef.current = setTimeout(() => {
      if (runRef.current === runId) onStageChange(null);
    }, 1200);
  }
}

function clearReplayHighlights(handlesRef: React.MutableRefObject<any[]>): void {
  handlesRef.current.forEach((handle) => handle.remove());
  handlesRef.current = [];
}

function stopReplay(
  handlesRef: React.MutableRefObject<any[]>,
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  runRef: React.MutableRefObject<number>,
  onStageChange: (stage: string | null) => void
): void {
  runRef.current += 1;
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
  clearReplayHighlights(handlesRef);
  onStageChange(null);
}
