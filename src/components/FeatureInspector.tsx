import React from 'react';
import { AssetRecord } from '../services/dataService';

interface FeatureInspectorProps {
  asset: AssetRecord | null;
  onClose: () => void;
  onZoomToAsset: (asset: AssetRecord) => void;
}

export const FeatureInspector: React.FC<FeatureInspectorProps> = ({
  asset,
  onClose,
  onZoomToAsset
}) => {
  if (!asset) {
    return (
      <calcite-panel
        heading="Asset Inspector"
        description="Select an asset on the map or table"
      >
        <calcite-block open heading="Inspection Instructions">
          <calcite-notice open kind="info" icon="information">
            <div slot="message">
              Click any infrastructure feature on the map or select from the watchlist to inspect verified attributes, hazard exposure, and CGF-ACI scores.
            </div>
          </calcite-notice>
        </calcite-block>
      </calcite-panel>
    );
  }

  const getChipKind = (priority: string) => {
    switch (priority) {
      case 'Severe Priority':
        return 'danger';
      case 'High Priority':
        return 'danger';
      case 'Moderate Priority':
        return 'neutral';
      default:
        return 'brand';
    }
  };

  return (
    <calcite-panel
      heading={asset.name}
      description={`ID: ${asset.id} · ${asset.category}`}
      closable
      onCalcitePanelClose={onClose}
    >
      {/* Priority & Voltage Badges in panel header slot */}
      <div slot="header-actions-end">
        <calcite-chip
          scale="s"
          kind={getChipKind(asset.priorityClass)}
          value={asset.priorityClass}
        >
          {asset.priorityClass}
        </calcite-chip>
      </div>

      {/* CGF-ACI Score Block */}
      <calcite-block
        open
        collapsible
        heading="CGF-ACI Composite Index"
        description={`Calculated score: ${asset.cgfAciScore.toFixed(2)}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>Grid Hierarchy Impact (30%)</span>
            <strong>{(asset.componentScores.gridHierarchyScore * 100).toFixed(0)}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>Flood Hazard Exposure (25%)</span>
            <strong>{(asset.componentScores.floodScore * 100).toFixed(0)}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>Extreme Thermal Stress (25%)</span>
            <strong>{(asset.componentScores.heatScore * 100).toFixed(0)}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>Lifeline Proximity Impact (20%)</span>
            <strong>{(asset.componentScores.lifelineProximityScore * 100).toFixed(0)}%</strong>
          </div>
        </div>
      </calcite-block>

      {/* Grid Electrical Specification Block */}
      {(asset.originSubstation || asset.feederName || asset.lengthKm) && (
        <calcite-block
          open
          collapsible
          heading="Grid Electrical Specification"
          description="Origin substation and feeder corridor"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px', fontSize: '12px' }}>
            {asset.originSubstation && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--calcite-ui-text-2)' }}>Source Substation</span>
                <strong>{asset.originSubstation}</strong>
              </div>
            )}
            {asset.feederName && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--calcite-ui-text-2)' }}>Feeder / Circuit</span>
                <strong>{asset.feederName}</strong>
              </div>
            )}
            {asset.lengthKm !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--calcite-ui-text-2)' }}>Segment Length</span>
                <strong>{asset.lengthKm.toFixed(2)} km</strong>
              </div>
            )}
          </div>
        </calcite-block>
      )}

      {/* Hazard Intersection Status */}
      <calcite-block
        open
        collapsible
        heading="Climate Hazard Intersects"
        description="Lake Victoria basin flood & heat stress"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <calcite-icon icon="heavy-rain" scale="s" />
              Flood Inundation Zone
            </span>
            <calcite-chip
              scale="s"
              kind={asset.floodExposed ? 'danger' : 'neutral'}
            >
              {asset.floodExposed ? 'Directly Intersected' : 'Outside Zone'}
            </calcite-chip>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <calcite-icon icon="heat-chart" scale="s" />
              Thermal Hotspot Cluster
            </span>
            <calcite-chip
              scale="s"
              kind={asset.heatExposed ? 'danger' : 'neutral'}
            >
              {asset.heatExposed ? 'Thermal Hotspot' : 'Normal Temperature'}
            </calcite-chip>
          </div>
        </div>
      </calcite-block>

      {/* Lifeline Proximity Block */}
      <calcite-block
        open
        collapsible
        heading="Critical Lifeline Proximity"
        description="Distances to emergency and educational lifelines"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <calcite-icon icon="plus-circle" scale="s" />
              Nearest Healthcare Facility
            </span>
            <strong>{asset.nearestClinicDistanceM} m</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <calcite-icon icon="education" scale="s" />
              Nearest School Facility
            </span>
            <strong>{asset.nearestSchoolDistanceM} m</strong>
          </div>
        </div>
      </calcite-block>

      {/* Administrative Location */}
      {asset.wardName && (
        <calcite-block
          collapsible
          heading="Administrative Location"
          description={asset.wardName}
        >
          <div style={{ fontSize: '12px', padding: '4px' }}>
            Sub-County / Basin: {asset.subcounty || 'Central Kisumu'}
          </div>
        </calcite-block>
      )}

      {/* Zoom to feature button in footer */}
      <div slot="footer" style={{ padding: '8px' }}>
        <calcite-button
          width="full"
          appearance="solid"
          kind="brand"
          iconStart="navigation"
          onClick={() => onZoomToAsset(asset)}
        >
          Zoom to Asset Geometry
        </calcite-button>
      </div>
    </calcite-panel>
  );
};
