import React from 'react';
import { CountySituationMetrics, AssetRecord } from '../services/dataService';

interface SituationViewProps {
  metrics: CountySituationMetrics | null;
  onSelectAsset: (asset: AssetRecord) => void;
  assets: AssetRecord[];
}

export const SituationView: React.FC<SituationViewProps> = ({
  metrics,
  onSelectAsset,
  assets
}) => {
  if (!metrics) {
    return (
      <calcite-panel heading="Situation Overview" loading>
        <calcite-loader active scale="m" />
      </calcite-panel>
    );
  }

  const severeAssets = assets.filter((a) => a.priorityClass === 'Severe Priority');

  return (
    <calcite-panel
      heading="Situation Intelligence"
      description="Kisumu County multi-hazard overview"
    >
      {/* Strategic Notice */}
      <calcite-block open heading="County Strategic Overview">
        <calcite-notice open kind="brand" icon="information">
          <div slot="title">Compound Grid Exposure</div>
          <div slot="message">
            Concentrated electric infrastructure traverses both high-susceptibility Lake Victoria flood plains and urban thermal stress corridors, threatening continuous power to critical community lifelines.
          </div>
        </calcite-notice>
      </calcite-block>

      {/* Key Strategic Indicators */}
      <calcite-block open heading="Key Strategic Indicators">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px' }}>
          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Grid Segments</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.gridSegmentsCount}</div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>66kV & 11kV verified</div>
          </div>

          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Severe Priority</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--calcite-ui-danger)' }}>
              {metrics.severePriorityAssetsCount}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>Urgent assessment</div>
          </div>

          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Flood Intersected</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.floodExposedAssetsCount}</div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>Basin inundation</div>
          </div>

          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Heat Intersected</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{metrics.heatExposedAssetsCount}</div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>Gi* Hotspots</div>
          </div>
        </div>
      </calcite-block>

      {/* Essential Lifelines Count */}
      <calcite-block open heading="Essential Community Lifelines">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <calcite-icon icon="plus-circle" scale="m" />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{metrics.totalHealthFacilities}</div>
              <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Hospitals & Clinics</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <calcite-icon icon="education" scale="m" />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{metrics.totalSchools}</div>
              <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Schools Inventoried</div>
            </div>
          </div>
        </div>
      </calcite-block>

      {/* Critical Assets Watchlist */}
      <calcite-block open heading="Severe Priority Watchlist" description={`${severeAssets.length} assets flagged`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {severeAssets.slice(0, 5).map((asset) => (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              style={{
                padding: '8px 10px',
                border: '1px solid var(--calcite-ui-border-2)',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                background: 'var(--calcite-ui-foreground-1)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{asset.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>
                  {asset.voltage} · {asset.type}
                </div>
              </div>
              <calcite-chip scale="s" kind="danger">
                {asset.cgfAciScore.toFixed(2)}
              </calcite-chip>
            </div>
          ))}
        </div>
      </calcite-block>
    </calcite-panel>
  );
};
