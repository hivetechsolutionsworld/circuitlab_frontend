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
    useEditorStore.getState().loadSampleProject();
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
