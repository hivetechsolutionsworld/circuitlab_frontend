'use client';

import React from 'react';
import {
  Compass,
  Square,
  Eye,
  Magnet,
  Cable,
  X,
  RotateCcw,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

export const ViewportControls: React.FC = () => {
  const cameraViewPreset = useEditorStore((s) => s.cameraViewPreset);
  const setCameraViewPreset = useEditorStore((s) => s.setCameraViewPreset);
  const activeWireDraft = useEditorStore((s) => s.activeWireDraft);
  const cancelWireDraft = useEditorStore((s) => s.cancelWireDraft);
  const setActiveWireDraftPoint = useEditorStore((s) => s.setActiveWireDraftPoint);
  const gridSnap = useEditorStore((s) => s.project.editorSettings.gridSnap);
  const isReadOnly = useEditorStore((s) => s.isReadOnly);

  const toggleGridSnap = () => {
    if (isReadOnly) return;
    const settings = useEditorStore.getState().project.editorSettings;
    useEditorStore.setState((s) => ({
      project: {
        ...s.project,
        editorSettings: { ...settings, gridSnap: !settings.gridSnap },
      },
    }));
  };

  const handleCancelWire = () => {
    cancelWireDraft();
    setActiveWireDraftPoint(null);
  };

  return (
    <>
      {/* Active Wire Drafting Prompt Banner */}
      {activeWireDraft && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 rounded-full bg-blue-600/90 backdrop-blur-md px-4 py-1.5 text-xs text-white shadow-xl border border-blue-400/50 animate-pulse">
          <Cable className="h-4 w-4" />
          <span className="font-semibold">
            Connecting Wire from <span className="underline">{activeWireDraft.pinId}</span>: Click any pin to complete connection
          </span>
          <button
            onClick={handleCancelWire}
            className="ml-2 rounded-full bg-black/30 p-1 hover:bg-black/50 transition"
            title="Cancel Wire (Esc)"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Floating Viewport Camera HUD Controls (Inspired by Tinkercad ViewCube / Wokwi) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end space-y-2 pointer-events-auto">
        <div className="flex items-center space-x-1 rounded-lg bg-panel-bg/85 backdrop-blur-md p-1 border border-panel-border shadow-lg">
          <button
            onClick={() => setCameraViewPreset('3d')}
            className={`flex items-center space-x-1 rounded px-2.5 py-1 text-xs font-medium transition ${
              cameraViewPreset === '3d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-panel-hover'
            }`}
            title="3D Perspective / Orbit View"
          >
            <Compass className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">3D View</span>
          </button>

          <button
            onClick={() => setCameraViewPreset('top')}
            className={`flex items-center space-x-1 rounded px-2.5 py-1 text-xs font-medium transition ${
              cameraViewPreset === 'top'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-panel-hover'
            }`}
            title="Top-Down 2D Schematic View"
          >
            <Square className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Top (2D)</span>
          </button>

          <button
            onClick={() => setCameraViewPreset('front')}
            className={`flex items-center space-x-1 rounded px-2.5 py-1 text-xs font-medium transition ${
              cameraViewPreset === 'front'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-panel-hover'
            }`}
            title="Front Level View"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Front</span>
          </button>

          <div className="h-4 w-[1px] bg-panel-border" />

          {/* Grid Snap Toggle */}
          <button
            onClick={toggleGridSnap}
            className={`flex items-center space-x-1 rounded px-2 py-1 text-xs transition ${
              gridSnap
                ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            title={gridSnap ? 'Grid Snap: ON' : 'Grid Snap: OFF'}
          >
            <Magnet className="h-3.5 w-3.5" />
            <span className="hidden md:inline text-[11px] font-mono">{gridSnap ? 'Snap' : 'Free'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
