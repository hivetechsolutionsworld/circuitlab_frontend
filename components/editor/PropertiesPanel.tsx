'use client';

import React from 'react';
import {
  Trash2,
  RotateCw,
  Sliders,
  Cpu,
  Layers,
  Thermometer,
  Droplets,
  Activity,
  Cable,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { COMPONENT_METADATA } from '@circuitlab/shared';

export const PropertiesPanel: React.FC = () => {
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const selectedWireId = useEditorStore((s) => s.selectedWireId);
  const components = useEditorStore((s) => s.project.components);
  const wires = useEditorStore((s) => s.project.wires);
  const isReadOnly = useEditorStore((s) => s.isReadOnly);

  const updatePosition = useEditorStore((s) => s.updateComponentPosition);
  const rotateComponent = useEditorStore((s) => s.rotateComponent);
  const updateProperty = useEditorStore((s) => s.updateComponentProperty);
  const deleteComponent = useEditorStore((s) => s.deleteComponent);
  const deleteWire = useEditorStore((s) => s.deleteWire);
  const toggleGpio = useEditorStore((s) => s.toggleGpio);
  const setButtonState = useEditorStore((s) => s.setButtonState);
  const setSensorValues = useEditorStore((s) => s.setSensorValues);

  const simStates = useEditorStore((s) => s.componentSimStates);

  const selectedComp = components.find((c) => c.id === selectedComponentId);
  const selectedWire = wires.find((w) => w.id === selectedWireId);

  // If a wire is selected
  if (selectedWire) {
    const fromComp = components.find((c) => c.id === selectedWire.from.componentId);
    const toComp = components.find((c) => c.id === selectedWire.to.componentId);

    return (
      <aside className="flex flex-col w-72 h-[calc(100vh-3.5rem)] border-l border-panel-border bg-panel-bg z-10 select-none overflow-y-auto">
        <div className="p-3 border-b border-panel-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cable className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-200">
              Wire Properties
            </h3>
          </div>
          <button
            onClick={() => deleteWire(selectedWire.id)}
            disabled={isReadOnly}
            className="rounded p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 disabled:opacity-30 transition"
            title="Delete Wire"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 space-y-4 text-xs">
          <div>
            <label className="text-gray-400 block mb-1">Wire ID</label>
            <input
              type="text"
              readOnly
              value={selectedWire.id}
              className="w-full rounded bg-panel-header px-2 py-1 text-gray-400 font-mono text-[11px] border border-panel-border"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1">From Terminal</label>
            <div className="rounded bg-panel-header p-2 border border-panel-border space-y-1">
              <span className="text-gray-200 font-semibold">{fromComp?.name || selectedWire.from.componentId}</span>
              <div className="text-gray-400 text-[11px]">Pin: <span className="text-blue-400 font-mono">{selectedWire.from.pinId}</span></div>
            </div>
          </div>

          <div>
            <label className="text-gray-400 block mb-1">To Terminal</label>
            <div className="rounded bg-panel-header p-2 border border-panel-border space-y-1">
              <span className="text-gray-200 font-semibold">{toComp?.name || selectedWire.to.componentId}</span>
              <div className="text-gray-400 text-[11px]">Pin: <span className="text-blue-400 font-mono">{selectedWire.to.pinId}</span></div>
            </div>
          </div>

          <div>
            <label className="text-gray-400 block mb-1">Wire Color</label>
            <div className="flex items-center space-x-2">
              <div
                className="h-5 w-5 rounded border border-gray-600"
                style={{ backgroundColor: selectedWire.color }}
              />
              <span className="text-gray-300 font-mono text-xs">{selectedWire.color}</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // If a component is selected
  if (selectedComp) {
    const meta = COMPONENT_METADATA[selectedComp.type];
    const compSim = simStates[selectedComp.id];

    return (
      <aside className="flex flex-col w-72 h-[calc(100vh-3.5rem)] border-l border-panel-border bg-panel-bg z-10 select-none overflow-y-auto">
        {/* Panel Header */}
        <div className="p-3 border-b border-panel-border flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-gray-200">{selectedComp.name}</h3>
            <span className="text-[10px] uppercase font-mono text-blue-400">
              {selectedComp.type}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => rotateComponent(selectedComp.id, Math.PI / 2)}
              disabled={isReadOnly}
              className="rounded p-1 text-gray-400 hover:text-white hover:bg-panel-hover disabled:opacity-30 transition"
              title="Rotate 90°"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteComponent(selectedComp.id)}
              disabled={isReadOnly}
              className="rounded p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 disabled:opacity-30 transition"
              title="Delete Component"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-3 space-y-4 text-xs">
          {/* Position Coordinates */}
          <div>
            <label className="text-gray-400 font-medium block mb-1.5">Position (X, Y, Z)</label>
            <div className="grid grid-cols-3 gap-1">
              {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                <div key={axis} className="flex items-center rounded bg-panel-header px-1.5 py-1 border border-panel-border">
                  <span className="text-gray-500 font-mono text-[10px] mr-1">{axis}:</span>
                  <input
                    type="number"
                    step="0.5"
                    disabled={isReadOnly}
                    value={Math.round(selectedComp.position[i] * 10) / 10}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const nextPos: [number, number, number] = [...selectedComp.position];
                      nextPos[i] = val;
                      updatePosition(selectedComp.id, nextPos);
                    }}
                    className="w-full bg-transparent text-gray-200 text-xs font-mono focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Component Specific Properties */}
          {selectedComp.type === 'resistor' && (
            <div className="space-y-3 pt-2 border-t border-panel-border">
              <div>
                <label className="text-gray-400 block mb-1">Resistance (Ω)</label>
                <select
                  disabled={isReadOnly}
                  value={(selectedComp.properties as any).resistance ?? 220}
                  onChange={(e) =>
                    updateProperty(selectedComp.id, 'resistance', parseInt(e.target.value, 10))
                  }
                  className="w-full rounded bg-panel-header px-2 py-1.5 text-xs text-gray-200 border border-panel-border focus:border-blue-500 focus:outline-none"
                >
                  <option value="100">100 Ω</option>
                  <option value="220">220 Ω (LED Typical)</option>
                  <option value="330">330 Ω</option>
                  <option value="470">470 Ω</option>
                  <option value="1000">1 kΩ</option>
                  <option value="4700">4.7 kΩ</option>
                  <option value="10000">10 kΩ (Pull-up)</option>
                  <option value="100000">100 kΩ</option>
                </select>
              </div>

              {compSim && (
                <div className="rounded bg-black/40 p-2 border border-gray-800 space-y-1">
                  <span className="text-gray-400 text-[11px]">Live Resistor Telemetry:</span>
                  <div className="text-gray-300 font-mono text-xs">
                    Current: <span className="text-blue-400">{(compSim.current_mA || 0).toFixed(2)} mA</span>
                  </div>
                  <div className="text-gray-300 font-mono text-xs">
                    Voltage Drop: <span className="text-yellow-400">{(compSim.voltageDrop || 0).toFixed(2)} V</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedComp.type === 'led' && (
            <div className="space-y-3 pt-2 border-t border-panel-border">
              <div>
                <label className="text-gray-400 block mb-1">LED Color</label>
                <select
                  disabled={isReadOnly}
                  value={(selectedComp.properties as any).color || 'red'}
                  onChange={(e) => updateProperty(selectedComp.id, 'color', e.target.value)}
                  className="w-full rounded bg-panel-header px-2 py-1.5 text-xs text-gray-200 border border-panel-border focus:border-blue-500 focus:outline-none"
                >
                  <option value="red">Red (2.0V)</option>
                  <option value="green">Green (2.1V)</option>
                  <option value="blue">Blue (3.0V)</option>
                  <option value="yellow">Yellow (2.0V)</option>
                  <option value="white">White (3.0V)</option>
                </select>
              </div>

              <div className="rounded bg-black/40 p-2 border border-gray-800 space-y-1">
                <span className="text-gray-400 text-[11px]">Live LED State:</span>
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      compSim?.lit ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-gray-600'
                    }`}
                  />
                  <span className="text-gray-200 font-semibold font-mono">
                    {compSim?.lit ? 'ILLUMINATED (ON)' : 'OFF'}
                  </span>
                </div>
                {compSim?.lit && (
                  <div className="text-gray-400 text-[11px] font-mono">
                    Current: {(compSim.current_mA || 0).toFixed(1)} mA
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedComp.type === 'push_button' && (
            <div className="space-y-3 pt-2 border-t border-panel-border">
              <label className="text-gray-400 block mb-1">Interactive Button State</label>
              <button
                onClick={() => setButtonState(selectedComp.id, !compSim?.pressed)}
                className={`w-full rounded py-2 text-xs font-bold uppercase tracking-wider transition ${
                  compSim?.pressed
                    ? 'bg-orange-600 text-white shadow-[0_0_12px_#ea580c]'
                    : 'bg-panel-header text-gray-300 hover:bg-panel-hover border border-panel-border'
                }`}
              >
                {compSim?.pressed ? 'PRESSED (Closed)' : 'RELEASED (Open)'}
              </button>
              <p className="text-[10px] text-gray-500">
                You can also click the button directly in the 3D scene.
              </p>
            </div>
          )}

          {selectedComp.type === 'dht22' && (
            <div className="space-y-3 pt-2 border-t border-panel-border">
              <div>
                <div className="flex justify-between text-gray-400 mb-1">
                  <span className="flex items-center space-x-1">
                    <Thermometer className="h-3.5 w-3.5 text-red-400" />
                    <span>Temperature</span>
                  </span>
                  <span className="font-mono text-gray-200">{compSim?.temperature ?? 24}°C</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="60"
                  step="0.5"
                  value={compSim?.temperature ?? 24}
                  onChange={(e) =>
                    setSensorValues(
                      selectedComp.id,
                      parseFloat(e.target.value),
                      compSim?.humidity ?? 50
                    )
                  }
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-400 mb-1">
                  <span className="flex items-center space-x-1">
                    <Droplets className="h-3.5 w-3.5 text-blue-400" />
                    <span>Humidity</span>
                  </span>
                  <span className="font-mono text-gray-200">{compSim?.humidity ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={compSim?.humidity ?? 50}
                  onChange={(e) =>
                    setSensorValues(
                      selectedComp.id,
                      compSim?.temperature ?? 24,
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="rounded bg-black/40 p-2 border border-gray-800">
                <span className="text-gray-400 text-[11px]">Sensor Power:</span>
                <span className={`ml-2 font-mono font-semibold ${compSim?.active ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {compSim?.active ? 'ACTIVE (VCC + GND Connected)' : 'OFFLINE'}
                </span>
              </div>
            </div>
          )}

          {selectedComp.type === 'esp32' && (
            <div className="space-y-3 pt-2 border-t border-panel-border">
              <label className="text-gray-400 font-medium block">ESP32 GPIO Controls</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {[2, 4, 5, 18, 19, 21, 22, 23].map((gpio) => {
                  const stateVal = compSim?.gpioOutputs?.[gpio] || 'LOW';
                  const isHigh = stateVal === 'HIGH';

                  return (
                    <div
                      key={gpio}
                      className="flex items-center justify-between rounded bg-panel-header px-2 py-1 border border-panel-border text-xs"
                    >
                      <span className="font-mono text-gray-300">GPIO{gpio}</span>
                      <button
                        onClick={() => toggleGpio(selectedComp.id, gpio)}
                        className={`rounded px-2 py-0.5 font-mono text-[11px] font-semibold transition ${
                          isHigh
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {stateVal}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pin Summary */}
          {meta && meta.pins.length > 0 && (
            <div className="pt-2 border-t border-panel-border">
              <label className="text-gray-400 font-medium block mb-1">Component Pins ({meta.pins.length})</label>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-[11px] font-mono">
                {meta.pins.map((pin) => (
                  <div key={pin.id} className="flex items-center justify-between py-0.5 text-gray-400">
                    <span>{pin.name}</span>
                    <span className="text-gray-500 text-[10px]">{pin.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // Default empty state when nothing selected
  return (
    <aside className="flex flex-col w-72 h-[calc(100vh-3.5rem)] border-l border-panel-border bg-panel-bg z-10 select-none p-4 text-xs text-gray-400 space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-200">Circuit Workspace</h3>
        <p className="text-[11px] text-gray-500">
          Select any component or wire to inspect and edit its properties.
        </p>
      </div>

      <div className="rounded-lg bg-panel-header p-3 border border-panel-border space-y-2">
        <h4 className="font-semibold text-gray-300">Project Overview</h4>
        <div className="flex justify-between py-0.5 text-[11px]">
          <span>Placed Components:</span>
          <span className="font-mono text-gray-200 font-bold">{components.length}</span>
        </div>
        <div className="flex justify-between py-0.5 text-[11px]">
          <span>Active Wires:</span>
          <span className="font-mono text-gray-200 font-bold">{wires.length}</span>
        </div>
      </div>

      <div className="rounded-lg bg-panel-header p-3 border border-panel-border space-y-2 text-[11px]">
        <h4 className="font-semibold text-gray-300">Quick Tips</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-400">
          <li>Click any component pin to start a wire.</li>
          <li>Click another pin to finish wiring.</li>
          <li>Click the breadboard to make solderless connections.</li>
          <li>Press Simulate to run circuit simulation.</li>
        </ul>
      </div>
    </aside>
  );
};
