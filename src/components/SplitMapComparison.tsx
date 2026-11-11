import React, { useEffect, useRef, useState } from 'react';
import { loadArcGIS, getCustomRenderer } from '../services/arcgis';
import { KISUMU_EXTENT, LAYER_REGISTRY } from '../config/layers';

interface SplitMapComparisonProps {
  currentBasemap: string;
}

export const SplitMapComparison: React.FC<SplitMapComparisonProps> = ({ currentBasemap }) => {
  const leftDivRef = useRef<HTMLDivElement>(null);
  const rightDivRef = useRef<HTMLDivElement>(null);
  const leftViewRef = useRef<any>(null);
  const rightViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initSplitViews() {
      try {
        setLoading(true);
        const { Map, MapView, FeatureLayer, reactiveUtils } = await loadArcGIS();

        if (!isMounted || !leftDivRef.current || !rightDivRef.current) return;

        const getLayer = (id: string, title: string) => {
          const entry = LAYER_REGISTRY.find((layer) => layer.id === id);
          if (!entry) throw new Error(`Comparison layer ${id} is not registered`);
          return new FeatureLayer({
            id: entry.id,
            url: entry.serviceUrl,
            title,
            opacity: entry.opacity,
            renderer: getCustomRenderer(entry.id)
          });
        };

        // Left map: published flood exposure layers.
        const leftMap = new Map({ basemap: currentBasemap });
        leftMap.addMany([
          getLayer('kisumu_boundary', 'Kisumu County Boundary'),
          getLayer('kisumu_wards', 'Kisumu Wards'),
          getLayer('kisumu_flood_zones', 'Flood Zones'),
          getLayer('kisumu_flood_exposed_lines', 'Flood-Exposed Grid Lines'),
          getLayer('kisumu_cgf_aci_lines', 'CGF-ACI Critical Grid Lines')
        ]);

        const leftView = new MapView({
          container: leftDivRef.current,
          map: leftMap,
          extent: KISUMU_EXTENT,
          ui: { components: ['zoom'] }
        });
        leftViewRef.current = leftView;

        // Right map: published heat exposure layers.
        const rightMap = new Map({ basemap: currentBasemap });
        rightMap.addMany([
          getLayer('kisumu_boundary', 'Kisumu County Boundary'),
          getLayer('kisumu_wards', 'Kisumu Wards'),
          getLayer('kisumu_heat_zones', 'Heat Zones'),
          getLayer('kisumu_heat_exposed_lines', 'Heat-Exposed Grid Lines'),
          getLayer('kisumu_heat_exposed_assets', 'Heat-Exposed Assets'),
          getLayer('kisumu_cgf_aci_lines', 'CGF-ACI Critical Grid Lines')
        ]);

        const rightView = new MapView({
          container: rightDivRef.current,
          map: rightMap,
          extent: KISUMU_EXTENT,
          ui: { components: [] }
        });
        rightViewRef.current = rightView;
        await Promise.all([leftView.when(), rightView.when()]);

        // Synchronize camera extents between Left and Right views
        let isSyncing = false;
        reactiveUtils.watch(
          () => [leftView.center, leftView.zoom, leftView.rotation],
          () => {
            if (!isSyncing && rightView) {
              isSyncing = true;
              rightView.viewpoint = leftView.viewpoint;
              setTimeout(() => {
                isSyncing = false;
              }, 100);
            }
          }
        );

        reactiveUtils.watch(
          () => [rightView.center, rightView.zoom, rightView.rotation],
          () => {
            if (!isSyncing && leftView) {
              isSyncing = true;
              leftView.viewpoint = rightView.viewpoint;
              setTimeout(() => {
                isSyncing = false;
              }, 100);
            }
          }
        );

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize split comparison views:', err);
        setLoading(false);
      }
    }

    initSplitViews();

    return () => {
      isMounted = false;
      if (leftViewRef.current) leftViewRef.current.destroy();
      if (rightViewRef.current) rightViewRef.current.destroy();
    };
  }, [currentBasemap]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            background: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <calcite-loader active scale="l" label="Loading Synchronized Views" />
        </div>
      )}

      {/* Synchronized Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'var(--calcite-ui-foreground-1)',
          borderBottom: '1px solid var(--calcite-ui-border-2)',
          fontSize: '12px',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <calcite-icon icon="heavy-rain" scale="s" />
            Pane A: Lake Victoria Basin Flood Inundation Wards
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <calcite-icon icon="heat-chart" scale="s" />
            Pane B: Getis-Ord Gi* Extreme Thermal Anomalies (34 Clusters)
          </span>
        </div>

        <calcite-chip scale="s" kind="brand" icon="compare">
          Extents Synchronized (1:1 Spatial Link)
        </calcite-chip>
      </div>

      {/* Dual Split Container */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', position: 'relative' }}>
        {/* Left Map View: Flood */}
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRight: '1px solid var(--calcite-ui-border-3)' }}>
          <div ref={leftDivRef} style={{ width: '100%', height: '100%' }} />
          <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
            <calcite-chip scale="s" kind="brand" icon="heavy-rain">
              Flood Inundation Risk
            </calcite-chip>
          </div>
        </div>

        {/* Right Map View: Heat */}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div ref={rightDivRef} style={{ width: '100%', height: '100%' }} />
          <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
            <calcite-chip scale="s" kind="danger" icon="heat-chart">
              Thermal Stress Clusters (Gi* Hotspots)
            </calcite-chip>
          </div>
        </div>
      </div>
    </div>
  );
};
