/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AppHeader } from './components/AppHeader';
import { MapWorkspace } from './components/MapWorkspace';
import { SplitMapComparison } from './components/SplitMapComparison';
import { FeatureInspector } from './components/FeatureInspector';
import { AttributeTable } from './components/AttributeTable';
import { SituationView } from './workspaces/SituationView';
import { InfrastructureView } from './workspaces/InfrastructureView';
import { ClimateExposureView } from './workspaces/ClimateExposureView';
import { CriticalityView } from './workspaces/CriticalityView';
import {
  fetchCountyIntelligence,
  CountySituationMetrics,
  AssetRecord,
  WardStatistic
} from './services/dataService';
import { LAYER_REGISTRY } from './config/layers';

export default function App() {
  // Navigation & Workspace State
  const [activeWorkspace, setActiveWorkspace] = useState<'situation' | 'infrastructure' | 'climate' | 'criticality'>('situation');
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [currentBasemap, setCurrentBasemap] = useState('gray-vector');
  const [searchQuery, setSearchQuery] = useState('');
  const [leftNavCollapsed, setLeftNavCollapsed] = useState(false);

  // Data & Feature State
  const [metrics, setMetrics] = useState<CountySituationMetrics | null>(null);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [wards, setWards] = useState<WardStatistic[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [replayHazard, setReplayHazard] = useState<'flood' | 'heat' | null>(null);
  const [replayStage, setReplayStage] = useState<string | null>(null);

  // Default visible layers
  const [visibleLayerIds, setVisibleLayerIds] = useState<string[]>(
    () => LAYER_REGISTRY.filter((layer) => layer.defaultVisibility).map((layer) => layer.id)
  );

  // Load authoritative county intelligence
  useEffect(() => {
    let mounted = true;
    fetchCountyIntelligence()
      .then((data) => {
        if (mounted) {
          setMetrics(data.metrics);
          setAssets(data.assets);
          setWards(data.wards);
        }
      })
      .catch((err) => {
        console.error('Failed to load county intelligence:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Filter assets by search query
  const searchedAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        (a.voltage && a.voltage.toLowerCase().includes(q))
    );
  }, [assets, searchQuery]);

  const handleToggleLayer = (id: string) => {
    setVisibleLayerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleZoomToAsset = (asset: AssetRecord) => {
    setSelectedAsset(asset);
  };

  const handleReplay = (hazard: 'flood' | 'heat') => {
    setReplayHazard((current) => (current === hazard ? null : hazard));
    if (replayHazard === hazard) setReplayStage(null);
  };

  return (
    <calcite-shell>
      {/* Persistent Calcite Header */}
      <AppHeader
        activeWorkspace={activeWorkspace}
        onBasemapChange={setCurrentBasemap}
        currentBasemap={currentBasemap}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        isOnline={true}
      />

      {/* Primary Left Navigation Rail & Analytical Panel */}
      <calcite-shell-panel
        slot="panel-start"
        position="start"
        resizable
        widthScale="m"
        collapsed={leftNavCollapsed}
      >
        <calcite-action-bar slot="action-bar">
          <calcite-action
            text="Situation Overview"
            icon="dashboard"
            active={activeWorkspace === 'situation'}
            onClick={() => {
              setActiveWorkspace('situation');
              setIsSplitMode(false);
              setIsTableOpen(false);
              setLeftNavCollapsed(false);
            }}
          />
          <calcite-action
            text="Infrastructure Explorer"
            icon="transmission-line"
            active={activeWorkspace === 'infrastructure'}
            onClick={() => {
              setActiveWorkspace('infrastructure');
              setIsSplitMode(false);
              setIsTableOpen(false);
              setLeftNavCollapsed(false);
            }}
          />
          <calcite-action
            text="Climate Exposure"
            icon="heat-chart"
            active={activeWorkspace === 'climate'}
            onClick={() => {
              setActiveWorkspace('climate');
              setIsTableOpen(false);
              setLeftNavCollapsed(false);
            }}
          />
          <calcite-action
            text="Criticality Analysis"
            icon="exclamation-mark-triangle"
            active={activeWorkspace === 'criticality'}
            onClick={() => {
              setActiveWorkspace('criticality');
              setIsSplitMode(false);
              setIsTableOpen(false);
              setLeftNavCollapsed(false);
            }}
          />

          <calcite-action
            slot="actions-end"
            text="Attribute Table"
            icon="table"
            active={isTableOpen}
            onClick={() => setIsTableOpen(!isTableOpen)}
          />
          <calcite-action
            slot="actions-end"
            text={leftNavCollapsed ? 'Expand workspace panel' : 'Collapse workspace panel'}
            icon={leftNavCollapsed ? 'chevron-right' : 'chevron-left'}
            onClick={() => setLeftNavCollapsed((collapsed) => !collapsed)}
          />
        </calcite-action-bar>

        {activeWorkspace === 'situation' && (
          <SituationView
            metrics={metrics}
            onSelectAsset={setSelectedAsset}
            assets={searchedAssets}
          />
        )}

        {activeWorkspace === 'infrastructure' && (
          <InfrastructureView
            visibleLayerIds={visibleLayerIds}
            onToggleLayer={handleToggleLayer}
            metrics={metrics}
          />
        )}

        {activeWorkspace === 'climate' && (
          <ClimateExposureView
            isSplitMode={isSplitMode}
            onToggleSplitMode={setIsSplitMode}
            replayHazard={replayHazard}
            replayStage={replayStage}
            onReplay={handleReplay}
            wards={wards}
            metrics={metrics}
          />
        )}

        {activeWorkspace === 'criticality' && (
          <CriticalityView
            assets={searchedAssets}
            onSelectAsset={setSelectedAsset}
            selectedAsset={selectedAsset}
            priorityFilter={priorityFilter}
            onFilterChange={setPriorityFilter}
          />
        )}
      </calcite-shell-panel>

      {/* Main Map Workspace Canvas */}
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {activeWorkspace === 'climate' && isSplitMode ? (
            <SplitMapComparison currentBasemap={currentBasemap} />
          ) : (
            <MapWorkspace
              activeWorkspace={activeWorkspace}
              selectedAsset={selectedAsset}
              onSelectAsset={setSelectedAsset}
              visibleLayerIds={visibleLayerIds}
              onToggleLayer={handleToggleLayer}
              currentBasemap={currentBasemap}
              allAssets={searchedAssets}
              replayHazard={replayHazard}
              onReplayStageChange={setReplayStage}
            />
          )}
        </div>

        {/* Collapsible Bottom Calcite Attribute Table */}
        {isTableOpen && (
          <AttributeTable
            assets={searchedAssets}
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedAsset}
            onZoomToAsset={handleZoomToAsset}
            onClose={() => setIsTableOpen(false)}
          />
        )}
      </div>

      {/* Right Contextual Asset Inspector in Calcite Shell Panel */}
      {selectedAsset && (
        <calcite-shell-panel
          slot="panel-end"
          position="end"
          resizable
          widthScale="m"
        >
          <FeatureInspector
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
            onZoomToAsset={handleZoomToAsset}
          />
        </calcite-shell-panel>
      )}

    </calcite-shell>
  );
}
