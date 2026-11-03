'use client';

import React, { useRef } from 'react';
import {
  Cpu,
  Save,
  Undo2,
  Redo2,
  Play,
  Square,
  RotateCcw,
  Share2,
  Download,
  Upload,
  HelpCircle,
  Settings,
  MousePointer,
  Cable,
  Trash2,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { WIRE_COLORS } from '@circuitlab/shared';
import { updateProjectApi, createProjectApi } from '../../lib/api-client';

export const HeaderToolbar: React.FC = () => {
  const project = useEditorStore((s) => s.project);
  const setProjectName = useEditorStore((s) => s.setProjectName);
  const isReadOnly = useEditorStore((s) => s.isReadOnly);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const currentTool = useEditorStore((s) => s.currentTool);
  const setCurrentTool = useEditorStore((s) => s.setCurrentTool);
  const selectedWireColor = useEditorStore((s) => s.selectedWireColor);
  const setWireColor = useEditorStore((s) => s.setWireColor);

  const simulationStatus = useEditorStore((s) => s.simulationStatus);
  const startSimulation = useEditorStore((s) => s.startSimulation);
  const stopSimulation = useEditorStore((s) => s.stopSimulation);
  const resetSimulation = useEditorStore((s) => s.resetSimulation);

  const isSidebarOpen = useEditorStore((s) => s.isSidebarOpen);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const isPropertiesOpen = useEditorStore((s) => s.isPropertiesOpen);
  const toggleProperties = useEditorStore((s) => s.toggleProperties);

  const openModal = useEditorStore((s) => s.openModal);
  const addToast = useEditorStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (isReadOnly) return;
    try {
      if (project.id && !project.id.startsWith('proj_default') && !project.id.startsWith('proj_sample')) {
        try {
          await updateProjectApi(project.id, {
            name: project.name,
            components: project.components,
            wires: project.wires,
            camera: project.camera,
            editorSettings: project.editorSettings,
          });
        } catch {
          const saved = await createProjectApi({
            name: project.name,
            components: project.components,
            wires: project.wires,
            camera: project.camera,
            editorSettings: project.editorSettings,
          });
          useEditorStore.getState().setProject(saved);
        }
      } else {
        const saved = await createProjectApi({
          name: project.name,
          components: project.components,
          wires: project.wires,
          camera: project.camera,
          editorSettings: project.editorSettings,
        });
        useEditorStore.getState().setProject(saved);
      }
      addToast({ type: 'success', title: 'Project Saved', message: 'All changes saved to database.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.replace(/\s+/g, '_')}.circuitlab.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast({ type: 'success', title: 'Project Exported', message: 'Project downloaded as JSON.' });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        useEditorStore.getState().setProject(json);
        addToast({ type: 'success', title: 'Import Successful', message: `Imported "${json.name}"` });
      } catch (err: any) {
        addToast({ type: 'error', title: 'Import Failed', message: err.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-panel-border bg-panel-bg px-2 sm:px-4 select-none z-20 overflow-x-auto scrollbar-none gap-2">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Left Group: Sidebar Toggle, Brand & Project Title */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {/* Component Library Drawer Toggle */}
        <button
          onClick={() => toggleSidebar()}
          className={`rounded p-1.5 transition ${
            isSidebarOpen
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'text-gray-400 hover:text-white hover:bg-panel-hover'
          }`}
          title="Toggle Component Library (C)"
          aria-label="Toggle Component Library"
        >
          <Layers className="h-4 w-4" />
        </button>

        {/* Brand Logo */}
        <div className="flex items-center space-x-1.5 text-blue-400 font-bold tracking-wide">
          <Cpu className="h-5 w-5 text-blue-500 shrink-0" />
          <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase text-gray-200">
            CircuitLab <span className="text-blue-500">3D</span>
          </span>
          <span className="sm:hidden text-xs font-bold text-blue-400">CL3D</span>
        </div>

        <div className="hidden sm:block h-4 w-[1px] bg-panel-border" />

        {/* Project Title Input */}
        <input
          type="text"
          value={project.name}
          onChange={(e) => setProjectName(e.target.value)}
          disabled={isReadOnly}
          className="bg-transparent px-1.5 py-1 text-xs font-medium text-gray-200 hover:bg-panel-hover focus:bg-panel-hover focus:outline-none focus:ring-1 focus:ring-blue-500 rounded transition-all w-24 sm:w-36 md:w-44 lg:w-56 truncate"
          title="Click to rename project"
        />

        {isReadOnly && (
          <span className="hidden md:inline-flex rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-400 border border-yellow-500/30">
            Read-Only
          </span>
        )}
      </div>

      {/* Center Group: Undo/Redo, Tools & Simulation Controls */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center rounded-lg bg-panel-header p-0.5 border border-panel-border">
          <button
            onClick={undo}
            disabled={!canUndo || isReadOnly}
            className="rounded p-1 sm:p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo || isReadOnly}
            className="rounded p-1 sm:p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Editing Tools: Select, Wire, Delete */}
        <div className="flex items-center rounded-lg bg-panel-header p-0.5 border border-panel-border">
          <button
            onClick={() => setCurrentTool('select')}
            className={`rounded px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium flex items-center space-x-1 sm:space-x-1.5 transition ${
              currentTool === 'select'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Select & Move Tool (V)"
          >
            <MousePointer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Select</span>
          </button>

          <button
            onClick={() => setCurrentTool('wire')}
            className={`rounded px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium flex items-center space-x-1 sm:space-x-1.5 transition ${
              currentTool === 'wire'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Wire Tool (W)"
          >
            <Cable className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Wire</span>
          </button>

          <button
            onClick={() => setCurrentTool('delete')}
            className={`rounded px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium flex items-center space-x-1 sm:space-x-1.5 transition ${
              currentTool === 'delete'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Delete Tool (D)"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Wire Color Palette Quick Selector */}
        {currentTool === 'wire' && (
          <div className="hidden xs:flex items-center space-x-1 rounded-lg bg-panel-header px-1.5 sm:px-2 py-1 border border-panel-border">
            {WIRE_COLORS.slice(0, 4).map((wc) => (
              <button
                key={wc.hex}
                onClick={() => setWireColor(wc.hex)}
                style={{ backgroundColor: wc.hex }}
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border transition-all ${
                  selectedWireColor === wc.hex
                    ? 'border-white scale-110 shadow-sm'
                    : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                title={wc.name}
              />
            ))}
          </div>
        )}

        <div className="hidden sm:block h-4 w-[1px] bg-panel-border" />

        {/* Simulation Execution Controls */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 rounded-lg bg-panel-header p-0.5 sm:p-1 border border-panel-border">
          {simulationStatus !== 'running' ? (
            <button
              onClick={startSimulation}
              className="flex items-center space-x-1 sm:space-x-1.5 rounded bg-emerald-600 px-2 sm:px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm transition"
              title="Start Circuit Simulation"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span className="hidden sm:inline">Simulate</span>
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="flex items-center space-x-1 sm:space-x-1.5 rounded bg-red-600 px-2 sm:px-3 py-1 text-xs font-semibold text-white hover:bg-red-500 shadow-sm transition"
              title="Stop Simulation"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          )}

          <button
            onClick={resetSimulation}
            className="rounded p-1 sm:p-1.5 text-gray-400 hover:text-white hover:bg-panel-hover transition"
            title="Reset Simulation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right Group: Save, Share, Settings, Inspector Toggle */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
        <button
          onClick={handleSave}
          disabled={isReadOnly}
          className="flex items-center space-x-1 sm:space-x-1.5 rounded bg-blue-600 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40 transition shadow-sm"
          title="Save to MongoDB"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={() => openModal('share')}
          className="flex items-center space-x-1 rounded bg-panel-header border border-panel-border px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium text-gray-300 hover:bg-panel-hover transition"
          title="Share Project Link"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-400" />
          <span className="hidden md:inline">Share</span>
        </button>

        <button
          onClick={handleExport}
          className="hidden sm:inline-flex rounded p-1 sm:p-1.5 text-gray-400 hover:text-white hover:bg-panel-hover transition"
          title="Export Project JSON"
        >
          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        <button
          onClick={handleImportClick}
          className="hidden sm:inline-flex rounded p-1 sm:p-1.5 text-gray-400 hover:text-white hover:bg-panel-hover transition"
          title="Import Project JSON"
        >
          <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        <div className="hidden sm:block h-4 w-[1px] bg-panel-border" />

        <button
          onClick={() => openModal('help')}
          className="rounded p-1 sm:p-1.5 text-gray-400 hover:text-white hover:bg-panel-hover transition"
          title="Shortcuts & Documentation"
        >
          <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        <button
          onClick={() => openModal('settings')}
          className="rounded p-1 sm:p-1.5 text-gray-400 hover:text-white hover:bg-panel-hover transition"
          title="Editor Settings"
        >
          <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        {/* Properties / Inspector Drawer Toggle */}
        <button
          onClick={() => toggleProperties()}
          className={`rounded p-1 sm:p-1.5 transition flex items-center space-x-1 ${
            isPropertiesOpen
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'text-gray-400 hover:text-white hover:bg-panel-hover'
          }`}
          title="Toggle Properties & Inspector (P)"
          aria-label="Toggle Properties & Inspector"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </header>
  );
};
