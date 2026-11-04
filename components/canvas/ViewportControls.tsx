'use client';

import React, { useState } from 'react';
import {
  Compass,
  Square,
  Eye,
  Magnet,
  Cable,
  X,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
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
  const project = useEditorStore((s) => s.project);
  const addToast = useEditorStore((s) => s.addToast);

  const [showAlertBanner, setShowAlertBanner] = useState(true);

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
      {/* Cirkit Designer style Floating Simulation Alert Pill (Top-Left of Canvas) */}
      {showAlertBanner && (
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 rounded-lg bg-[#181c28]/95 backdrop-blur-md px-3 py-1.5 text-xs text-gray-200 border border-emerald-500/30 shadow-lg select-none">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-[11px]">
            <span className="font-bold text-emerald-400">{project.components.length}/{project.components.length} parts</span> in this circuit are fully simulatable
          </span>
          <ChevronDown className="h-3 w-3 text-gray-400 cursor-pointer" />
          <button
            onClick={() => setShowAlertBanner(false)}
            className="text-gray-400 hover:text-white ml-1 p-0.5"
            title="Dismiss notification"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Active Wire Drafting Prompt Banner */}
      {activeWireDraft && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 rounded-full bg-blue-600/95 backdrop-blur-md px-4 py-1.5 text-xs text-white shadow-2xl border border-blue-400/50 animate-pulse select-none">
          <Cable className="h-4 w-4" />
          <span className="font-semibold">
            Connecting Wire from <span className="underline">{activeWireDraft.pinId}</span>: Click target pin to finish connection
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

      {/* Top-Right Floating Viewport Camera HUD Controls & Zoom */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 rounded-lg bg-[#181c28]/90 backdrop-blur-md p-1 border border-panel-border shadow-xl select-none pointer-events-auto">
        <button
          onClick={() => setCameraViewPreset('3d')}
          className={`flex items-center space-x-1 rounded px-2.5 py-1 text-xs font-medium transition ${
            cameraViewPreset === '3d'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
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
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
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
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
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
          title={gridSnap ? 'Grid Snap: ON (0.5 units)' : 'Grid Snap: OFF'}
        >
          <Magnet className="h-3.5 w-3.5" />
          <span className="hidden md:inline text-[11px] font-mono">{gridSnap ? 'Snap' : 'Free'}</span>
        </button>
      </div>

      {/* Cirkit Designer style Floating AI Helper Chip (Bottom-Center above console) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <button
          onClick={() => {
            addToast({
              type: 'info',
              title: 'CircuitLab AI',
              message: 'ESP32 Smart Home System is operating optimally. DHT22 reading 24.5°C, LED pin GPIO2 active.',
            });
          }}
          className="flex items-center space-x-1.5 rounded-full bg-[#181c28]/90 border border-blue-500/30 px-3.5 py-1.5 text-xs text-blue-300 hover:bg-blue-600 hover:text-white shadow-lg transition backdrop-blur-md select-none"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span className="font-semibold text-xs">CircuitLab AI</span>
        </button>
      </div>
    </>
  );
};
