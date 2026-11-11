import React from 'react';
import { LAYER_REGISTRY } from '../config/layers';
import { CountySituationMetrics } from '../services/dataService';

interface InfrastructureViewProps {
  visibleLayerIds: string[];
  onToggleLayer: (id: string) => void;
  metrics: CountySituationMetrics | null;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({
  visibleLayerIds,
  onToggleLayer,
  metrics
}) => {
  const gridLayers = LAYER_REGISTRY.filter((l) => l.category === 'grid');
  const lifelineLayers = LAYER_REGISTRY.filter((l) => l.category === 'lifeline');

  const count66 = metrics?.total66kvCount;
  const count11 = metrics?.total11kvCount;
  const km66 = metrics?.total66kvKm;
  const km11 = metrics?.total11kvKm;
  const originSubs = metrics?.originSubstationsCount;
  const healthCount = metrics?.totalHealthFacilities;
  const schoolsCount = metrics?.totalSchools;

  return (
    <calcite-panel
      heading="Infrastructure Explorer"
      description="Power grid corridors and essential lifelines"
    >
      {/* Power Grid Networks */}
      <calcite-block
        open
        heading="Power Grid Corridors"
        description="Independent voltage network controls"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {gridLayers.map((layer) => {
            const isVisible = visibleLayerIds.includes(layer.id);
            const count =
              layer.voltageClass === '66kV'
                ? count66
                : layer.voltageClass === '11kV'
                ? count11
                : 0;

            const km =
              layer.voltageClass === '66kV'
                ? (km66 === undefined ? '—' : `${km66} km`)
                : layer.voltageClass === '11kV'
                ? (km11 === undefined ? '—' : `${km11} km`)
                : 'Corridor';

            return (
              <div
                key={layer.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  border: '1px solid var(--calcite-ui-border-2)',
                  borderRadius: '4px',
                  background: 'var(--calcite-ui-foreground-1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <calcite-icon icon="flash" scale="s" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '12px' }}>{layer.displayLabel}</div>
                    <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-3)' }}>
                      {layer.voltageClass} · {count === undefined ? '—' : count} segments ({km})
                    </div>
                  </div>
                </div>

                <calcite-switch
                  scale="s"
                  checked={isVisible}
                  onCalciteSwitchChange={() => onToggleLayer(layer.id)}
                />
              </div>
            );
          })}
        </div>
      </calcite-block>

      {/* Energy Point Facilities */}
      <calcite-block open heading="Energy Infrastructure Verification">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px' }}>
          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Origin Substations</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{originSubs === undefined ? '—' : `${originSubs} Verified`}</div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>Identified hubs</div>
          </div>
          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>66kV Transmission</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{km66 === undefined ? '—' : `${km66} km`}</div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>{count66 === undefined ? '—' : count66} segments</div>
          </div>
          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>11kV Distribution</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{km11 === undefined ? '—' : `${km11} km`}</div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>{count11 === undefined ? '—' : count11} feeders</div>
          </div>
          <div style={{ padding: '8px', background: 'var(--calcite-ui-foreground-2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-2)' }}>Total Grid Network</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{metrics?.totalGridKm === undefined ? '—' : `${metrics.totalGridKm} km`}</div>
            <div style={{ fontSize: '10px', color: 'var(--calcite-ui-text-3)' }}>Verified lines</div>
          </div>
        </div>
      </calcite-block>

      {/* Essential Lifeline Facilities */}
      <calcite-block open heading="Essential Community Lifelines">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {lifelineLayers.map((layer) => {
            const isVisible = visibleLayerIds.includes(layer.id);
            const count = layer.id === 'lifeline_health' ? healthCount : schoolsCount;
            const iconName = layer.id === 'kisumu_healthcare' ? 'plus-circle' : 'education';
            const detail =
              layer.id === 'kisumu_healthcare'
                ? '87 Dispensaries, 39 Hospitals/Centres, 7 Clinics'
                : (metrics?.totalStudentEnrollment === undefined ? '—' : `${metrics.totalStudentEnrollment.toLocaleString()} Students Enrolled`);

            return (
              <div
                key={layer.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  border: '1px solid var(--calcite-ui-border-2)',
                  borderRadius: '4px',
                  background: 'var(--calcite-ui-foreground-1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <calcite-icon icon={iconName} scale="s" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '12px' }}>{layer.displayLabel}</div>
                    <div style={{ fontSize: '11px', color: 'var(--calcite-ui-text-3)' }}>
                      {count} facilities ({detail})
                    </div>
                  </div>
                </div>

                <calcite-switch
                  scale="s"
                  checked={isVisible}
                  onCalciteSwitchChange={() => onToggleLayer(layer.id)}
                />
              </div>
            );
          })}
        </div>
      </calcite-block>
    </calcite-panel>
  );
};
