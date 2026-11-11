import React from 'react';
import { AssetRecord } from '../services/dataService';

interface CriticalityViewProps {
  assets: AssetRecord[];
  onSelectAsset: (asset: AssetRecord) => void;
  selectedAsset: AssetRecord | null;
  priorityFilter: string;
  onFilterChange: (priority: string) => void;
}

export const CriticalityView: React.FC<CriticalityViewProps> = ({
  assets,
  onSelectAsset,
  selectedAsset,
  priorityFilter,
  onFilterChange
}) => {
  const severeCount = assets.filter((a) => a.priorityClass === 'Severe Priority').length;
  const highCount = assets.filter((a) => a.priorityClass === 'High Priority').length;
  const modCount = assets.filter((a) => a.priorityClass === 'Moderate Priority').length;
  const lowCount = assets.filter((a) => a.priorityClass === 'Low Priority').length;

  const filteredAssets =
    priorityFilter === 'ALL'
      ? assets
      : assets.filter((a) => a.priorityClass === priorityFilter);

  return (
    <calcite-panel
      heading="Cascade Grid Failure (CGF-ACI)"
      description="Asset Criticality and Prioritization Framework"
    >
      {/* Methodology Notice */}
      <calcite-block open heading="Framework Principles">
        <calcite-notice open kind="info" icon="information">
          <div slot="title">Resilience Assessment Support</div>
          <div slot="message">
            The CGF-ACI index combines grid hierarchy (30%), flood hazard (25%), extreme heat stress (25%), and essential lifeline proximity (20%) to identify infrastructure warranting immediate resilience attention.
          </div>
        </calcite-notice>
      </calcite-block>

      {/* Priority Tier Filters */}
      <calcite-block open heading="Criticality Tiers (Click to Filter)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px' }}>
          <div
            onClick={() => onFilterChange(priorityFilter === 'Severe Priority' ? 'ALL' : 'Severe Priority')}
            style={{
              padding: '8px',
              border: `1px solid ${priorityFilter === 'Severe Priority' ? 'var(--calcite-ui-danger)' : 'var(--calcite-ui-border-2)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              background: 'var(--calcite-ui-foreground-1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <calcite-chip scale="s" kind="danger">Severe</calcite-chip>
              <strong style={{ fontSize: '14px', color: 'var(--calcite-ui-danger)' }}>{severeCount}</strong>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)', marginTop: '4px' }}>Score ≥ 0.75</div>
          </div>

          <div
            onClick={() => onFilterChange(priorityFilter === 'High Priority' ? 'ALL' : 'High Priority')}
            style={{
              padding: '8px',
              border: `1px solid ${priorityFilter === 'High Priority' ? 'var(--calcite-ui-danger)' : 'var(--calcite-ui-border-2)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              background: 'var(--calcite-ui-foreground-1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <calcite-chip scale="s" kind="danger">High</calcite-chip>
              <strong style={{ fontSize: '14px' }}>{highCount}</strong>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)', marginTop: '4px' }}>0.55 – 0.74</div>
          </div>

          <div
            onClick={() => onFilterChange(priorityFilter === 'Moderate Priority' ? 'ALL' : 'Moderate Priority')}
            style={{
              padding: '8px',
              border: `1px solid ${priorityFilter === 'Moderate Priority' ? 'var(--calcite-ui-brand)' : 'var(--calcite-ui-border-2)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              background: 'var(--calcite-ui-foreground-1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <calcite-chip scale="s" kind="neutral">Moderate</calcite-chip>
              <strong style={{ fontSize: '14px' }}>{modCount}</strong>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)', marginTop: '4px' }}>0.35 – 0.54</div>
          </div>

          <div
            onClick={() => onFilterChange(priorityFilter === 'Low Priority' ? 'ALL' : 'Low Priority')}
            style={{
              padding: '8px',
              border: `1px solid ${priorityFilter === 'Low Priority' ? 'var(--calcite-ui-brand)' : 'var(--calcite-ui-border-2)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              background: 'var(--calcite-ui-foreground-1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <calcite-chip scale="s" kind="brand">Low</calcite-chip>
              <strong style={{ fontSize: '14px' }}>{lowCount}</strong>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)', marginTop: '4px' }}>Score &lt; 0.35</div>
          </div>
        </div>
      </calcite-block>

      {/* Ranked Infrastructure Watchlist */}
      <calcite-block
        open
        heading={`Ranked Infrastructure (${filteredAssets.length})`}
        description="Ranked by composite CGF-ACI index"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredAssets
            .sort((a, b) => b.cgfAciScore - a.cgfAciScore)
            .map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  style={{
                    padding: '8px 10px',
                    border: isSelected
                      ? '1px solid var(--calcite-ui-brand)'
                      : '1px solid var(--calcite-ui-border-2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: isSelected
                      ? 'var(--calcite-ui-foreground-2)'
                      : 'var(--calcite-ui-foreground-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{asset.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>
                      {asset.voltage || 'Grid'} · {asset.type}
                    </div>
                  </div>

                  <calcite-chip
                    scale="s"
                    kind={
                      asset.priorityClass === 'Severe Priority'
                        ? 'danger'
                        : asset.priorityClass === 'High Priority'
                        ? 'danger'
                        : asset.priorityClass === 'Moderate Priority'
                        ? 'neutral'
                        : 'brand'
                    }
                  >
                    {asset.cgfAciScore.toFixed(2)}
                  </calcite-chip>
                </div>
              );
            })}
        </div>
      </calcite-block>
    </calcite-panel>
  );
};
