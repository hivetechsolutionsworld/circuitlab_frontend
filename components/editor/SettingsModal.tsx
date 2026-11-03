'use client';

import React from 'react';
import { X, Settings, Check } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { WIRE_COLORS } from '@circuitlab/shared';

export const SettingsModal: React.FC = () => {
  const activeModal = useEditorStore((s) => s.activeModal);
  const openModal = useEditorStore((s) => s.openModal);
  const project = useEditorStore((s) => s.project);
  const isReadOnly = useEditorStore((s) => s.isReadOnly);
  const selectedWireColor = useEditorStore((s) => s.selectedWireColor);
  const setWireColor = useEditorStore((s) => s.setWireColor);

  if (activeModal !== 'settings') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-md rounded-xl border border-panel-border bg-panel-bg p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-panel-border pb-3">
          <div className="flex items-center space-x-2 text-blue-400">
            <Settings className="h-5 w-5" />
            <h3 className="font-semibold text-gray-100">Editor Settings</h3>
          </div>
          <button
            onClick={() => openModal(null)}
            className="rounded p-1 text-gray-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-gray-300">
          <div>
            <label className="text-gray-400 font-medium block mb-2">Default Wire Color</label>
            <div className="grid grid-cols-4 gap-2">
              {WIRE_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setWireColor(c.hex)}
                  className={`flex items-center space-x-1.5 rounded bg-panel-header p-2 border transition ${
                    selectedWireColor === c.hex ? 'border-blue-500 bg-panel-hover' : 'border-panel-border'
                  }`}
                >
                  <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span className="text-[10px] text-gray-300 truncate">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-panel-header p-3 border border-panel-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-medium">Auto-Validate Circuit</span>
              <span className="text-emerald-400 font-semibold">Enabled</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Continuously runs electrical rule checks (ERC) and detects shorts, missing GND, and unresisted LEDs.
            </p>
          </div>

          <div className="rounded-lg bg-panel-header p-3 border border-panel-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-medium">Grid Snap Step</span>
              <span className="text-gray-200 font-mono">0.25 units</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Aligns breadboard holes and component pin headers on a realistic 0.1-inch (2.54mm) pitch grid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
