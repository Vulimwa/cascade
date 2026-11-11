import React, { useState, useMemo } from 'react';
import { AssetRecord } from '../services/dataService';

interface AttributeTableProps {
  assets: AssetRecord[];
  selectedAsset: AssetRecord | null;
  onSelectAsset: (asset: AssetRecord) => void;
  onZoomToAsset: (asset: AssetRecord) => void;
  onClose?: () => void;
}

export const AttributeTable: React.FC<AttributeTableProps> = ({
  assets,
  selectedAsset,
  onSelectAsset,
  onZoomToAsset,
  onClose
}) => {
  const [filterText, setFilterText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [voltageFilter, setVoltageFilter] = useState('ALL');

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (priorityFilter !== 'ALL' && a.priorityClass !== priorityFilter) return false;
      if (voltageFilter !== 'ALL' && a.voltage !== voltageFilter) return false;
      if (filterText) {
        const q = filterText.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assets, filterText, priorityFilter, voltageFilter]);

  return (
    <calcite-panel
      heading={`Infrastructure Inventory Table (${filteredAssets.length} records)`}
      description="Interactive spatial attribute and priority table"
      style={{ height: '320px', borderTop: '1px solid var(--calcite-ui-border-2)' }}
    >
      {onClose && (
        <calcite-action
          slot="header-actions-end"
          scale="s"
          icon="x"
          text="Close attribute table"
          onClick={onClose}
        />
      )}
      {/* Controls slot */}
      <div
        slot={onClose ? 'header-actions-start' : 'header-actions-end'}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <calcite-input
          scale="s"
          icon="magnifying-glass"
          placeholder="Filter rows..."
          clearable
          value={filterText}
          onInput={(e: any) => setFilterText(e.target.value || '')}
          style={{ width: '180px' }}
        />

        <calcite-select
          scale="s"
          label="Priority"
          value={priorityFilter}
          onChange={(e: any) => setPriorityFilter(e.target.value)}
          style={{ width: '140px' }}
        >
          <calcite-option value="ALL" selected={priorityFilter === 'ALL'}>
            All Priorities
          </calcite-option>
          <calcite-option value="Severe Priority" selected={priorityFilter === 'Severe Priority'}>
            Severe Priority
          </calcite-option>
          <calcite-option value="High Priority" selected={priorityFilter === 'High Priority'}>
            High Priority
          </calcite-option>
          <calcite-option value="Moderate Priority" selected={priorityFilter === 'Moderate Priority'}>
            Moderate Priority
          </calcite-option>
          <calcite-option value="Low Priority" selected={priorityFilter === 'Low Priority'}>
            Low Priority
          </calcite-option>
        </calcite-select>

        <calcite-select
          scale="s"
          label="Voltage"
          value={voltageFilter}
          onChange={(e: any) => setVoltageFilter(e.target.value)}
          style={{ width: '120px' }}
        >
          <calcite-option value="ALL" selected={voltageFilter === 'ALL'}>
            All Voltages
          </calcite-option>
          <calcite-option value="132kV" selected={voltageFilter === '132kV'}>
            132kV
          </calcite-option>
          <calcite-option value="66kV" selected={voltageFilter === '66kV'}>
            66kV
          </calcite-option>
          <calcite-option value="33kV" selected={voltageFilter === '33kV'}>
            33kV
          </calcite-option>
          <calcite-option value="11kV" selected={voltageFilter === '11kV'}>
            11kV
          </calcite-option>
        </calcite-select>
      </div>

      {/* Calcite Table */}
      <calcite-table striped bordered selectionMode="single">
        <calcite-table-header slot="table-header" heading="Asset ID" />
        <calcite-table-header slot="table-header" heading="Asset Name" />
        <calcite-table-header slot="table-header" heading="Origin Substation" />
        <calcite-table-header slot="table-header" heading="Type" />
        <calcite-table-header slot="table-header" heading="Voltage" />
        <calcite-table-header slot="table-header" heading="Length (km)" />
        <calcite-table-header slot="table-header" heading="CGF-ACI Score" />
        <calcite-table-header slot="table-header" heading="Priority Tier" />
        <calcite-table-header slot="table-header" heading="Flood Hazard" />
        <calcite-table-header slot="table-header" heading="Heat Stress" />
        <calcite-table-header slot="table-header" heading="Nearest Clinic" />
        <calcite-table-header slot="table-header" heading="Navigate" />

        {filteredAssets.slice(0, 100).map((asset) => {
          const isSelected = selectedAsset?.id === asset.id;
          return (
            <calcite-table-row
              key={asset.id}
              selected={isSelected}
              onClick={() => onSelectAsset(asset)}
              style={{ cursor: 'pointer' }}
            >
              <calcite-table-cell>{asset.id}</calcite-table-cell>
              <calcite-table-cell>{asset.name}</calcite-table-cell>
              <calcite-table-cell>{asset.originSubstation || 'Regional Hub'}</calcite-table-cell>
              <calcite-table-cell>{asset.type}</calcite-table-cell>
              <calcite-table-cell>{asset.voltage || 'Grid'}</calcite-table-cell>
              <calcite-table-cell>
                {asset.lengthKm ? `${asset.lengthKm.toFixed(2)} km` : 'Point Asset'}
              </calcite-table-cell>
              <calcite-table-cell>
                <strong>{asset.cgfAciScore.toFixed(2)}</strong>
              </calcite-table-cell>
              <calcite-table-cell>
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
                  {asset.priorityClass}
                </calcite-chip>
              </calcite-table-cell>
              <calcite-table-cell>
                {asset.floodExposed ? 'Inundated' : 'Clear'}
              </calcite-table-cell>
              <calcite-table-cell>
                {asset.heatExposed ? 'Hotspot' : 'Normal'}
              </calcite-table-cell>
              <calcite-table-cell>{asset.nearestClinicDistanceM} m</calcite-table-cell>
              <calcite-table-cell>
                <calcite-button
                  scale="s"
                  appearance="transparent"
                  iconStart="navigation"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    onSelectAsset(asset);
                    onZoomToAsset(asset);
                  }}
                />
              </calcite-table-cell>
            </calcite-table-row>
          );
        })}
      </calcite-table>
    </calcite-panel>
  );
};
