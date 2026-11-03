'use client';

import React from 'react';
import { X, HelpCircle, Keyboard, Cpu, Cable, Play } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

export const HelpModal: React.FC = () => {
  const activeModal = useEditorStore((s) => s.activeModal);
  const openModal = useEditorStore((s) => s.openModal);

  if (activeModal !== 'help') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg rounded-xl border border-panel-border bg-panel-bg p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-panel-border pb-3">
          <div className="flex items-center space-x-2 text-blue-400">
            <HelpCircle className="h-5 w-5" />
            <h3 className="font-semibold text-gray-100">Help & Shortcuts</h3>
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
            <h4 className="font-semibold text-gray-200 mb-2 flex items-center space-x-1.5">
              <Keyboard className="h-4 w-4 text-blue-400" />
              <span>Keyboard Shortcuts</span>
            </h4>
            <div className="rounded-lg bg-panel-header p-3 border border-panel-border space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Undo Action</span>
                <kbd className="rounded bg-black/50 px-2 py-0.5 font-mono text-[11px] text-gray-200 border border-gray-700">Ctrl+Z / Cmd+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Redo Action</span>
                <kbd className="rounded bg-black/50 px-2 py-0.5 font-mono text-[11px] text-gray-200 border border-gray-700">Ctrl+Y / Cmd+Shift+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delete Selected</span>
                <kbd className="rounded bg-black/50 px-2 py-0.5 font-mono text-[11px] text-gray-200 border border-gray-700">Delete / Backspace</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cancel Wire Draft</span>
                <kbd className="rounded bg-black/50 px-2 py-0.5 font-mono text-[11px] text-gray-200 border border-gray-700">Escape</kbd>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-200 mb-2 flex items-center space-x-1.5">
              <Cable className="h-4 w-4 text-blue-400" />
              <span>How Wiring Works</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-400 pl-1 leading-relaxed">
              <li>Click on any terminal pin or breadboard hole to attach the wire lead.</li>
              <li>Move your cursor to the target pin or breadboard terminal strip.</li>
              <li>Click the destination pin to complete the connection.</li>
              <li>Wires automatically adjust and re-route whenever you move or rotate components!</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-gray-200 mb-2 flex items-center space-x-1.5">
              <Play className="h-4 w-4 text-emerald-400" />
              <span>Simulation Engine</span>
            </h4>
            <p className="text-gray-400 leading-relaxed">
              The real-time simulation engine solves the electrical connectivity graph across breadboard groups and jumper wires. It verifies current paths, simulates forward-biased LEDs, tracks tactile button presses, and reads live DHT22 environmental telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
