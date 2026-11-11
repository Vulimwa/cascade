import React from 'react';
import { WardStatistic, CountySituationMetrics } from '../services/dataService';

interface ClimateExposureViewProps {
  isSplitMode: boolean;
  onToggleSplitMode: (enabled: boolean) => void;
  replayHazard: 'flood' | 'heat' | null;
  replayStage: string | null;
  onReplay: (hazard: 'flood' | 'heat') => void;
  wards: WardStatistic[];
  metrics: CountySituationMetrics | null;
}

export const ClimateExposureView: React.FC<ClimateExposureViewProps> = ({
  isSplitMode,
  onToggleSplitMode,
  replayHazard,
  replayStage,
  onReplay,
  wards,
  metrics
}) => {
  return (
    <calcite-panel
      heading="Climate Hazard Exposure"
      description="Flood inundation and extreme heat stress"
    >
      {/* Exploration Canvas Mode */}
      <calcite-block open heading="Comparison Mode">
        <div style={{ padding: '4px' }}>
          <calcite-segmented-control
            width="full"
            scale="m"
            onCalciteSegmentedControlChange={(e: any) => {
              const value = e.currentTarget?.value || e.target?.value;
              onToggleSplitMode(value === 'split');
            }}
          >
            <calcite-segmented-control-item
              value="split"
              checked={isSplitMode}
              iconStart="compare"
            >
              Side-by-Side Split
            </calcite-segmented-control-item>
            <calcite-segmented-control-item
              value="single"
              checked={!isSplitMode}
              iconStart="layers"
            >
              Single Map View
            </calcite-segmented-control-item>
          </calcite-segmented-control>
        </div>
      </calcite-block>

      <calcite-block open heading="Priority Corridor Replay">
        <calcite-notice open kind="info" icon="play">
          <div slot="title">Trace hazard to critical infrastructure</div>
          <div slot="message">
            The replay reveals exposed corridors, nearby lifelines, and CGF-ACI priorities in sequence on the single map.
          </div>
        </calcite-notice>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
          {isSplitMode && (
            <calcite-notice open kind="warning" icon="information">
              <div slot="message">Switch to Single Map View to run the synchronized corridor replay.</div>
            </calcite-notice>
          )}
          {replayStage && (
            <div style={{ fontSize: '12px', color: 'var(--calcite-ui-text-2)' }}>
              Now showing: <strong>{replayStage}</strong>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <calcite-button
              width="full"
              kind="brand"
              iconStart={replayHazard === 'flood' ? 'pause' : 'play'}
              disabled={isSplitMode}
              onClick={() => onReplay('flood')}
            >
              {replayHazard === 'flood' ? 'Stop Flood Replay' : 'Replay Flood Corridor'}
            </calcite-button>
            <calcite-button
              width="full"
              kind="danger"
              iconStart={replayHazard === 'heat' ? 'pause' : 'play'}
              disabled={isSplitMode}
              onClick={() => onReplay('heat')}
            >
              {replayHazard === 'heat' ? 'Stop Heat Replay' : 'Replay Heat Corridor'}
            </calcite-button>
          </div>
        </div>
      </calcite-block>

      {/* Lake Victoria Flood Basin */}
      <calcite-block open heading="Lake Victoria Basin Flood Hazard">
        <calcite-notice open kind="brand" icon="heavy-rain">
          <div slot="title">Nyando River & Lake Victoria Inundation Zone</div>
          <div slot="message">
            Kano Plains and river overflow waters intersect low-elevation distribution lines, substations, and community lifelines.
          </div>
        </calcite-notice>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Exposed Line Segments</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {metrics?.floodExposedAssetsCount ?? 0} Segments
            </div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>Directly intersecting</div>
          </div>
          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Exposed Grid Network</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {metrics?.floodExposedGridKm ?? 0} km
            </div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>Flooded corridor length</div>
          </div>
        </div>
      </calcite-block>

      {/* Extreme Heat Stress */}
      <calcite-block open heading="Getis-Ord Gi* Thermal Anomalies">
        <calcite-notice open kind="danger" icon="heat-chart">
          <div slot="title">Urban Heat Island Clusters</div>
          <div slot="message">
            Statistically significant thermal anomalies in high-density commercial corridors accelerate transformer winding degradation and overheating.
          </div>
        </calcite-notice>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Hotspot Clusters</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {metrics?.heatHotspotCount === undefined ? '—' : metrics.heatHotspotCount} Polygons
            </div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>Gi* spatial clusters</div>
          </div>
          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Peak Gi* Z-Score</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {metrics?.peakGiZScore === undefined ? '—' : `+${metrics.peakGiZScore} SD`}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>99% confidence level</div>
          </div>
        </div>
      </calcite-block>

      {/* Ward Vulnerability Ranking */}
      <calcite-block
        open
        heading={`Administrative Ward Vulnerability (${wards.length} Verified)`}
        description="Ranked by census population and multi-hazard exposure"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {wards.slice(0, 10).map((ward) => (
            <div
              key={ward.ward}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                border: '1px solid var(--calcite-ui-border-2)',
                borderRadius: '4px',
                fontSize: '12px',
                background: 'var(--calcite-ui-foreground-1)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{ward.ward}</div>
                <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>
                  Pop: {ward.population.toLocaleString()} · {ward.subcounty}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>{ward.gridLengthKm} km</div>
                <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>
                  {ward.healthCount} clinics · {ward.schoolCount} schools
                </div>
              </div>
            </div>
          ))}
        </div>
      </calcite-block>
    </calcite-panel>
  );
};
