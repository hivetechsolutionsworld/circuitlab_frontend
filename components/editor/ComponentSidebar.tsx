'use client';

import React, { useState } from 'react';
import {
  Search,
  Cpu,
  Activity,
  Lightbulb,
  Radio,
  Sliders,
  Grid,
  Zap,
  Sparkles,
  Plus,
  X,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { ComponentType, COMPONENT_METADATA } from '@circuitlab/shared';

const CATEGORIES = [
  { id: 'all', label: 'All Components' },
  { id: 'microcontroller', label: 'Microcontrollers' },
  { id: 'actuator', label: 'LEDs & Displays' },
  { id: 'passive', label: 'Resistors & Passives' },
  { id: 'input', label: 'Buttons & Switches' },
  { id: 'sensor', label: 'Sensors' },
  { id: 'prototyping', label: 'Breadboards' },
];

export const ComponentSidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const addComponent = useEditorStore((s) => s.addComponent);
  const isReadOnly = useEditorStore((s) => s.isReadOnly);
  const isSidebarOpen = useEditorStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useEditorStore((s) => s.setSidebarOpen);

  const componentList = Object.entries(COMPONENT_METADATA).map(([type, meta]) => ({
    type: type as ComponentType,
    ...meta,
  }));

  const filteredComponents = componentList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'microcontroller':
        return <Cpu className="h-4 w-4 text-blue-400" />;
      case 'actuator':
        return <Lightbulb className="h-4 w-4 text-yellow-400" />;
      case 'passive':
        return <Sliders className="h-4 w-4 text-orange-400" />;
      case 'input':
        return <Radio className="h-4 w-4 text-purple-400" />;
      case 'sensor':
        return <Activity className="h-4 w-4 text-emerald-400" />;
      case 'prototyping':
        return <Grid className="h-4 w-4 text-cyan-400" />;
      default:
        return <Zap className="h-4 w-4 text-blue-400" />;
    }
  };

  const handleAddComponent = (type: ComponentType) => {
    if (isReadOnly) return;
    addComponent(type);
    // On small screens, close the sidebar after adding so user can see the 3D canvas
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLoadSample = () => {
    // Generate ESP32 Smart Home LED Controller circuit
    const sampleProject = {
      id: `proj_sample_${Date.now().toString(36)}`,
      name: 'ESP32 Smart Home LED Controller',
      description: 'Smart home system with ESP32, Breadboard, LED, Resistor, Push Button, and DHT22.',
      version: 1,
      schemaVersion: 2,
      components: [
        {
          id: 'bb_1',
          type: 'breadboard' as ComponentType,
          name: 'Breadboard',
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          properties: { rows: 30, cols: 10, hasPowerRails: true },
        },
        {
          id: 'esp32_1',
          type: 'esp32' as ComponentType,
          name: 'ESP32 NodeMCU',
          position: [-4.2, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          properties: {
            boardName: 'ESP32 NodeMCU',
            gpioStates: { 2: 'HIGH', 4: 'LOW' },
            gpioModes: { 2: 'OUTPUT', 4: 'INPUT_PULLUP' },
          },
        },
        {
          id: 'res_1',
          type: 'resistor' as ComponentType,
          name: '220Ω Resistor',
          position: [0, 0.2, -1.2] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          properties: { resistance: 220, tolerance: 5 },
        },
        {
          id: 'led_1',
          type: 'led' as ComponentType,
          name: 'Smart Lamp LED',
          position: [0.5, 0.3, 0.8] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          properties: { color: 'green', forwardVoltage: 2.1, maxCurrent: 20 },
        },
        {
          id: 'btn_1',
          type: 'push_button' as ComponentType,
          name: 'Wall Switch Button',
          position: [-0.6, 0.2, 2.0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          properties: { isPressed: false, pullMode: 'pullup' },
        },
        {
          id: 'dht_1',
          type: 'dht22' as ComponentType,
          name: 'DHT22 Room Sensor',
          position: [3.8, 0, -1.5] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          properties: { temperature: 24.5, humidity: 48.0 },
        },
      ],
      wires: [
        // ESP32 GPIO2 -> BB Hole A10
        {
          id: 'w_gpio2',
          color: '#3b82f6',
          from: { componentId: 'esp32_1', pinId: 'gpio2' },
          to: { componentId: 'bb_1', pinId: 'hole_a10' },
          style: 'straight' as const,
        },
        // BB Hole B10 -> Resistor Pin 1
        {
          id: 'w_res1',
          color: '#3b82f6',
          from: { componentId: 'bb_1', pinId: 'hole_b10' },
          to: { componentId: 'res_1', pinId: 'pin1' },
          style: 'straight' as const,
        },
        // Resistor Pin 2 -> BB Hole A15
        {
          id: 'w_res2',
          color: '#3b82f6',
          from: { componentId: 'res_1', pinId: 'pin2' },
          to: { componentId: 'bb_1', pinId: 'hole_a15' },
          style: 'straight' as const,
        },
        // BB Hole B15 -> LED Anode
        {
          id: 'w_led_anode',
          color: '#10b981',
          from: { componentId: 'bb_1', pinId: 'hole_b15' },
          to: { componentId: 'led_1', pinId: 'anode' },
          style: 'straight' as const,
        },
        // LED Cathode -> BB Ground Rail
        {
          id: 'w_led_cathode',
          color: '#1f2937',
          from: { componentId: 'led_1', pinId: 'cathode' },
          to: { componentId: 'bb_1', pinId: 'rail_left_neg_15' },
          style: 'straight' as const,
        },
        // ESP32 GND -> BB Ground Rail
        {
          id: 'w_esp_gnd',
          color: '#1f2937',
          from: { componentId: 'esp32_1', pinId: 'gnd1' },
          to: { componentId: 'bb_1', pinId: 'rail_left_neg_1' },
          style: 'straight' as const,
        },
        // Push Button Pin 1A -> ESP32 GPIO4
        {
          id: 'w_btn_gpio',
          color: '#eab308',
          from: { componentId: 'btn_1', pinId: 'pin1a' },
          to: { componentId: 'esp32_1', pinId: 'gpio4' },
          style: 'straight' as const,
        },
        // Push Button Pin 2A -> BB Ground Rail
        {
          id: 'w_btn_gnd',
          color: '#1f2937',
          from: { componentId: 'btn_1', pinId: 'pin2a' },
          to: { componentId: 'bb_1', pinId: 'rail_left_neg_25' },
          style: 'straight' as const,
        },
        // DHT22 VCC -> ESP32 3V3
        {
          id: 'w_dht_vcc',
          color: '#ef4444',
          from: { componentId: 'dht_1', pinId: 'vcc' },
          to: { componentId: 'esp32_1', pinId: '3v3' },
          style: 'straight' as const,
        },
        // DHT22 GND -> ESP32 GND
        {
          id: 'w_dht_gnd',
          color: '#1f2937',
          from: { componentId: 'dht_1', pinId: 'gnd' },
          to: { componentId: 'esp32_1', pinId: 'gnd2' },
          style: 'straight' as const,
        },
        // DHT22 DATA -> ESP32 GPIO18
        {
          id: 'w_dht_data',
          color: '#f97316',
          from: { componentId: 'dht_1', pinId: 'data' },
          to: { componentId: 'esp32_1', pinId: 'gpio18' },
          style: 'straight' as const,
        },
      ],
      camera: { position: [0, 10, 14] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
      editorSettings: {
        gridSnap: true,
        gridSize: 0.5,
        defaultWireColor: '#3b82f6',
        theme: 'dark' as const,
        showLabels: true,
        autoValidate: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useEditorStore.getState().setProject(sampleProject);
    useEditorStore.getState().addToast({
      type: 'success',
      title: 'Sample Project Loaded',
      message: 'ESP32 Smart Home LED Controller is ready to simulate.',
    });
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col w-72 sm:w-80 max-w-[85vw] h-full border-r border-panel-border bg-panel-bg shadow-2xl transition-transform duration-300 ease-in-out select-none lg:static lg:w-64 lg:max-w-none lg:shadow-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-panel-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Components
          </span>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={handleLoadSample}
              disabled={isReadOnly}
              className="flex items-center space-x-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 disabled:opacity-30 transition"
              title="Load ESP32 Smart Home sample project"
            >
              <Sparkles className="h-3 w-3" />
              <span>Sample</span>
            </button>

            {/* Close Button for Mobile / Tablet */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden rounded p-1 text-gray-400 hover:text-white hover:bg-panel-hover transition"
              title="Close Components"
              aria-label="Close Components"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search parts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded bg-panel-header pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 border border-panel-border focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded px-2 py-0.5 text-[10px] whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-panel-header text-gray-400 hover:text-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Component Library List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredComponents.map((c) => (
          <div
            key={c.type}
            className="group rounded-lg border border-panel-border bg-panel-header p-2.5 hover:border-blue-500/50 hover:bg-panel-hover transition cursor-pointer"
            onClick={() => handleAddComponent(c.type)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="rounded p-1 bg-black/40 border border-gray-800">
                  {getCategoryIcon(c.category)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-200 group-hover:text-blue-400 transition">
                    {c.name}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {c.pins.length > 0 ? `${c.pins.length} Pins` : 'Solderless Matrix'}
                  </span>
                </div>
              </div>

              <button
                disabled={isReadOnly}
                className="opacity-0 group-hover:opacity-100 rounded bg-blue-600/30 p-1 text-blue-400 hover:bg-blue-600 hover:text-white transition"
                title="Add to Scene"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="mt-1 text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
              {c.description}
            </p>
          </div>
        ))}

        {filteredComponents.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-500">
            No components match your search.
          </div>
        )}
      </div>
    </aside>
  );
};
