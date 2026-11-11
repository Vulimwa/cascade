import React from "react";

interface AppHeaderProps {
  activeWorkspace: string;
  onBasemapChange: (basemap: string) => void;
  currentBasemap: string;
  onSearch: (query: string) => void;
  searchQuery: string;
  isOnline: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeWorkspace,
  onBasemapChange,
  currentBasemap,
  onSearch,
  searchQuery,
  isOnline,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <calcite-navigation slot="header">
      <calcite-navigation-logo
        slot="logo"
        icon="flash"
        heading="POWER UNDER PRESSURE"
        description="Kisumu County, Kenya"
      />

      {/* Center & End Controls */}
      <div
        slot="content-end"
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        {/* Quick Search */}
        <calcite-input
          scale="s"
          icon="magnifying-glass"
          placeholder="Search infrastructure..."
          clearable
          value={searchQuery}
          onInput={(e: any) => onSearch(e.target.value || "")}
          style={{ width: "220px" }}
        />

        {/* Basemap Selection */}
        <calcite-select
          scale="s"
          label="Basemap"
          value={currentBasemap}
          onCalciteSelectChange={(e: any) => onBasemapChange(e.target.value)}
          style={{ width: "160px" }}
        >
          <calcite-option
            value="gray-vector"
            selected={currentBasemap === "gray-vector"}
          >
            Light Gray Canvas
          </calcite-option>
          <calcite-option
            value="topo-vector"
            selected={currentBasemap === "topo-vector"}
          >
            Topographic
          </calcite-option>
          <calcite-option
            value="streets-vector"
            selected={currentBasemap === "streets-vector"}
          >
            Streets
          </calcite-option>
          <calcite-option value="hybrid" selected={currentBasemap === "hybrid"}>
            Satellite Hybrid
          </calcite-option>
          <calcite-option
            value="dark-gray-vector"
            selected={currentBasemap === "dark-gray-vector"}
          >
            Dark Canvas
          </calcite-option>
        </calcite-select>

        {/* Fullscreen Button */}
        <calcite-action
          scale="s"
          icon="full-screen"
          text="Toggle Fullscreen"
          textEnabled={false}
          onClick={toggleFullscreen}
        />
      </div>
    </calcite-navigation>
  );
};
