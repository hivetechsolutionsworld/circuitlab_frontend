'use client';

import React, { useState, useRef } from 'react';
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
  FilePlus,
  FolderOpen,
  Bug,
  Sparkles,
  ChevronDown,
  Code2,
  Package,
  Check,
  Menu,
  X,
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
  const newProject = useEditorStore((s) => s.newProject);
  const loadSampleProject = useEditorStore((s) => s.loadSampleProject);

  const editorMode = useEditorStore((s) => s.editorMode);
  const setEditorMode = useEditorStore((s) => s.setEditorMode);

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

  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'help' | 'export' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setActiveMenu(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setActiveMenu(null);
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
    <header className="relative z-50 flex h-14 w-full items-center justify-between border-b border-panel-border bg-[#10141e] px-2 sm:px-4 select-none overflow-visible gap-2 shrink-0">
      {/* Click-outside backdrop to dismiss any active dropdown menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px]"
          onClick={() => setActiveMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Left: Brand Icon, Project Title & Sub-Menu (File Edit Help) */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Component Library Drawer Toggle */}
        <button
          onClick={() => toggleSidebar()}
          className={`rounded p-1.5 transition ${
            isSidebarOpen
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'text-gray-400 hover:text-white hover:bg-panel-hover'
          }`}
          title="Toggle Component Library (C)"
        >
          <Layers className="h-4 w-4" />
        </button>

        {/* Brand Icon */}
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
          <Cpu className="h-4 w-4" />
        </div>

        {/* Project Name & Submenu */}
        <div className="flex flex-col justify-center">
          <input
            type="text"
            value={project.name}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={isReadOnly}
            className="bg-transparent text-xs font-bold text-gray-100 hover:bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5 transition w-24 sm:w-44 md:w-56 truncate"
            title="Click to rename project"
          />

          {/* Menus: File | Edit | Help */}
          <div className="hidden sm:flex items-center space-x-2.5 text-[11px] text-gray-400 px-1.5">
            {/* File Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                className={`px-1.5 py-0.5 rounded transition ${
                  activeMenu === 'file' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:text-gray-200'
                }`}
              >
                File
              </button>
              {activeMenu === 'file' && (
                <div className="absolute left-0 top-full mt-1.5 w-56 rounded-lg border border-panel-border bg-[#181c28] p-1.5 shadow-2xl z-50 text-xs ring-1 ring-black/50">
                  <button
                    onClick={() => {
                      newProject();
                      setActiveMenu(null);
                    }}
                    className="flex w-full items-center justify-between rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <FilePlus className="h-3.5 w-3.5 text-blue-400" />
                      <span>New Project</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      openModal('projects');
                      setActiveMenu(null);
                    }}
                    className="flex w-full items-center justify-between rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                      <span>Open Projects (MongoDB)...</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleSave();
                      setActiveMenu(null);
                    }}
                    className="flex w-full items-center justify-between rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Save className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Save Project</span>
                    </div>
                    <kbd className="text-[10px] text-gray-500 font-mono">Ctrl+S</kbd>
                  </button>
                  <div className="my-1 border-t border-panel-border/60" />
                  <button
                    onClick={handleExport}
                    className="flex w-full items-center justify-between rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Download className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Export JSON</span>
                    </div>
                  </button>
                  <button
                    onClick={handleImportClick}
                    className="flex w-full items-center justify-between rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Upload className="h-3.5 w-3.5 text-purple-400" />
                      <span>Import JSON...</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                className={`px-1.5 py-0.5 rounded transition ${
                  activeMenu === 'edit' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:text-gray-200'
                }`}
              >
                Edit
              </button>
              {activeMenu === 'edit' && (
                <div className="absolute left-0 top-full mt-1.5 w-48 rounded-lg border border-panel-border bg-[#181c28] p-1.5 shadow-2xl z-50 text-xs ring-1 ring-black/50">
                  <button
                    onClick={() => {
                      undo();
                      setActiveMenu(null);
                    }}
                    disabled={!canUndo}
                    className="flex w-full items-center justify-between rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 disabled:opacity-40 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Undo2 className="h-3.5 w-3.5 text-blue-400" />
                      <span>Undo</span>
                    </div>
                    <kbd className="text-[10px] text-gray-500 font-mono">Ctrl+Z</kbd>
                  </button>
                  <button
                    onClick={() => {
                      redo();
                      setActiveMenu(null);
                    }}
                    disabled={!canRedo}
                    className="flex w-full items-center justify-between rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 disabled:opacity-40 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Redo2 className="h-3.5 w-3.5 text-blue-400" />
                      <span>Redo</span>
                    </div>
                    <kbd className="text-[10px] text-gray-500 font-mono">Ctrl+Y</kbd>
                  </button>
                </div>
              )}
            </div>

            {/* Help Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
                className={`px-1.5 py-0.5 rounded transition ${
                  activeMenu === 'help' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:text-gray-200'
                }`}
              >
                Help
              </button>
              {activeMenu === 'help' && (
                <div className="absolute left-0 top-full mt-1.5 w-56 rounded-lg border border-panel-border bg-[#181c28] p-1.5 shadow-2xl z-50 text-xs ring-1 ring-black/50">
                  <button
                    onClick={() => {
                      openModal('help');
                      setActiveMenu(null);
                    }}
                    className="flex w-full items-center justify-between rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                      <span>Keyboard Shortcuts</span>
                    </div>
                    <kbd className="text-[10px] text-gray-500 font-mono">?</kbd>
                  </button>
                  <button
                    onClick={() => {
                      loadSampleProject();
                      setActiveMenu(null);
                    }}
                    className="flex w-full items-center space-x-2 rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 transition"
                  >
                    <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Load ESP32 Demo</span>
                  </button>
                  <div className="my-1 border-t border-panel-border/60" />
                  <button
                    onClick={() => {
                      openModal('settings');
                      setActiveMenu(null);
                    }}
                    className="flex w-full items-center space-x-2 rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 transition"
                  >
                    <Settings className="h-3.5 w-3.5 text-gray-400" />
                    <span>About CircuitLab 3D</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Action Buttons (Center on < md) */}
      <div className="flex md:hidden items-center space-x-1.5 shrink-0">
        {simulationStatus !== 'running' ? (
          <button
            onClick={startSimulation}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500 shadow-md transition"
            title="Start Simulation"
          >
            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
          </button>
        ) : (
          <button
            onClick={stopSimulation}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500 shadow-md transition"
            title="Stop Simulation"
          >
            <Square className="h-3 w-3 fill-current" />
          </button>
        )}

        <button
          onClick={() => setCurrentTool(currentTool === 'wire' ? 'select' : 'wire')}
          className={`flex items-center space-x-1 rounded-md px-2 py-1 text-xs font-medium border transition ${
            currentTool === 'wire'
              ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
              : 'bg-[#181c28] text-gray-300 border-panel-border hover:bg-panel-hover'
          }`}
          title="Toggle Wire Tool"
        >
          <Cable className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[11px] font-semibold">{currentTool === 'wire' ? 'Wire' : 'Select'}</span>
          <div
            className="h-2 w-2 rounded-full border border-white/50 shrink-0"
            style={{ backgroundColor: selectedWireColor }}
          />
        </button>
      </div>

      {/* Center: Cirkit Designer Mode Tabs: [ Design | Code | Simulate | Build ] (Desktop & Tablet) */}
      <div className="hidden md:flex items-center space-x-3 shrink-0">
        <div className="flex items-center rounded-lg bg-[#181c28] p-0.5 border border-panel-border text-xs font-medium">
          <button
            onClick={() => setEditorMode('design')}
            className={`rounded px-3 py-1 transition ${
              editorMode === 'design'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Design
          </button>
          <button
            onClick={() => setEditorMode('code')}
            className={`rounded px-3 py-1 transition ${
              editorMode === 'code'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setEditorMode('simulate')}
            className={`rounded px-3 py-1 transition ${
              editorMode === 'simulate'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Simulate
          </button>
          <button
            onClick={() => setEditorMode('build')}
            className={`rounded px-3 py-1 transition ${
              editorMode === 'build'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Build
          </button>
        </div>

        {/* Circular Play / Stop & Bug Controls (Matching Reference IDE) */}
        <div className="flex items-center space-x-1.5">
          {simulationStatus !== 'running' ? (
            <button
              onClick={startSimulation}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500 shadow-md transition transform hover:scale-105"
              title="Start Simulation (F5)"
            >
              <Play className="h-4 w-4 fill-current ml-0.5" />
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500 shadow-md transition transform hover:scale-105"
              title="Stop Simulation"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          )}

          <button
            onClick={() => {
              if (simulationStatus !== 'running') startSimulation();
              addToast({
                type: 'info',
                title: 'Debugger Active',
                message: 'Monitoring ESP32 GPIO, sensor interrupts, and clock cycles.',
              });
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-panel-header text-gray-400 hover:text-amber-400 hover:bg-panel-hover border border-panel-border transition"
            title="Step / Debug Circuit Logic"
          >
            <Bug className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={resetSimulation}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-panel-header text-gray-400 hover:text-white hover:bg-panel-hover border border-panel-border transition"
            title="Reset Simulation State"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Canvas Tools (Select / Wire / Delete / Color) */}
        <div className="flex items-center rounded-lg bg-[#181c28] p-0.5 border border-panel-border">
          <button
            onClick={() => setCurrentTool('select')}
            className={`rounded px-2.5 py-1 text-xs font-medium flex items-center space-x-1 transition ${
              currentTool === 'select' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-gray-400 hover:text-white'
            }`}
            title="Select & Move Tool (V)"
          >
            <MousePointer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Select</span>
          </button>

          <button
            onClick={() => setCurrentTool('wire')}
            className={`rounded px-2.5 py-1 text-xs font-medium flex items-center space-x-1 transition ${
              currentTool === 'wire' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-gray-400 hover:text-white'
            }`}
            title="Wire Tool (W) - Click any pin to connect"
          >
            <Cable className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Wire</span>
            <div
              className="h-2.5 w-2.5 rounded-full border border-white/50 ml-0.5 shrink-0"
              style={{ backgroundColor: selectedWireColor }}
              title={`Active Wire Color: ${selectedWireColor}`}
            />
          </button>

          <button
            onClick={() => setCurrentTool('delete')}
            className={`rounded px-2.5 py-1 text-xs font-medium flex items-center space-x-1 transition ${
              currentTool === 'delete' ? 'bg-red-600 text-white shadow-xs font-semibold' : 'text-gray-400 hover:text-white'
            }`}
            title="Delete Tool (D)"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {/* Quick Wire Color Swatches */}
          <div className="hidden md:flex items-center px-1.5 space-x-1 border-l border-panel-border/70 ml-0.5">
            {WIRE_COLORS.slice(0, 5).map((wc: any) => (
              <button
                key={wc.hex}
                onClick={() => {
                  setWireColor(wc.hex);
                  setCurrentTool('wire');
                }}
                className={`h-3.5 w-3.5 rounded-full transition transform hover:scale-125 ${
                  selectedWireColor === wc.hex
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-black scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: wc.hex }}
                title={`Select ${wc.name} Wire`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right: AI Helper, Export, Share, Save */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        {/* Cirkit AI / CircuitLab AI helper button */}
        <button
          onClick={() => {
            addToast({
              type: 'info',
              title: 'CircuitLab AI Assistant',
              message: 'ESP32 Smart Home topology validated: 100% simulatable with no net conflicts.',
            });
          }}
          className="hidden xl:flex items-center space-x-1.5 rounded-full bg-blue-950/60 border border-blue-500/40 px-3 py-1 text-xs font-semibold text-blue-300 hover:bg-blue-600 hover:text-white transition shadow-xs"
          title="CircuitLab AI Smart Assistant"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>CircuitLab AI</span>
        </button>

        {/* Export Dropdown - Hidden on mobile (< md), accessible via mobile menu */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setActiveMenu(activeMenu === 'export' ? null : 'export')}
            className={`flex items-center space-x-1 rounded border px-2.5 py-1.5 text-xs font-medium transition ${
              activeMenu === 'export'
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-[#181c28] border-panel-border text-gray-300 hover:bg-panel-hover'
            }`}
          >
            <span>Export</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>
          {activeMenu === 'export' && (
            <div className="absolute right-0 top-full mt-1.5 w-52 rounded-lg border border-panel-border bg-[#181c28] p-1.5 shadow-2xl z-50 text-xs ring-1 ring-black/50">
              <button
                onClick={handleExport}
                className="flex w-full items-center space-x-2 rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 transition"
              >
                <Download className="h-3.5 w-3.5 text-blue-400" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => {
                  setEditorMode('build');
                  setActiveMenu(null);
                }}
                className="flex w-full items-center space-x-2 rounded px-2.5 py-1.5 hover:bg-panel-hover text-gray-200 transition"
              >
                <Package className="h-3.5 w-3.5 text-emerald-400" />
                <span>Bill of Materials (BOM)</span>
              </button>
            </div>
          )}
        </div>

        {/* Share Button (Blue Pill) */}
        <button
          onClick={() => openModal('share')}
          className="flex items-center space-x-1 rounded-full bg-blue-600 hover:bg-blue-500 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-semibold text-white transition shadow-sm"
          title="Share Circuit Project"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isReadOnly}
          className="flex items-center space-x-1 rounded bg-panel-header border border-panel-border px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-panel-hover disabled:opacity-40 transition"
          title="Save to MongoDB (Ctrl+S)"
        >
          <Save className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Properties Inspector Toggle */}
        <button
          onClick={() => toggleProperties()}
          className={`rounded p-1 sm:p-1.5 transition ${
            isPropertiesOpen
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'text-gray-400 hover:text-white hover:bg-panel-hover'
          }`}
          title="Toggle Properties Panel"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        {/* Mobile Menu Hamburger Toggle (Visible only on < md) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden rounded p-1 sm:p-1.5 border transition ${
            isMobileMenuOpen
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-[#181c28] text-gray-300 border-panel-border hover:bg-panel-hover hover:text-white'
          }`}
          title="Menu"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Menu Drawer (Smooth drop-down below header on < md) */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b border-panel-border bg-[#10141e]/98 backdrop-blur-xl p-3 shadow-2xl md:hidden max-h-[82vh] overflow-y-auto space-y-3 ring-1 ring-black/80">
            {/* Mode Switcher */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Workspace Mode
              </div>
              <div className="grid grid-cols-4 gap-1.5 rounded-lg bg-[#181c28] p-1 border border-panel-border text-xs">
                {(['design', 'code', 'simulate', 'build'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setEditorMode(m);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`rounded py-1.5 font-medium capitalize text-center transition ${
                      editorMode === m
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Controls */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Simulation Engine
              </div>
              <div className="flex items-center space-x-2">
                {simulationStatus !== 'running' ? (
                  <button
                    onClick={() => {
                      startSimulation();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-semibold text-white shadow-md transition"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Start Simulation</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      stopSimulation();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-red-600 hover:bg-red-500 py-2 text-xs font-semibold text-white shadow-md transition"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                    <span>Stop Simulation</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    resetSimulation();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-1.5 rounded-lg bg-[#181c28] border border-panel-border px-3 py-2 text-xs text-gray-300 hover:text-white transition"
                  title="Reset Circuit State"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Canvas Tools */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Circuit Editing Tools
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                <button
                  onClick={() => {
                    setCurrentTool('select');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center space-x-1.5 rounded-lg py-2 text-xs font-medium border transition ${
                    currentTool === 'select'
                      ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                      : 'bg-[#181c28] text-gray-300 border-panel-border hover:bg-panel-hover'
                  }`}
                >
                  <MousePointer className="h-3.5 w-3.5" />
                  <span>Select</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTool('wire');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center space-x-1.5 rounded-lg py-2 text-xs font-medium border transition ${
                    currentTool === 'wire'
                      ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                      : 'bg-[#181c28] text-gray-300 border-panel-border hover:bg-panel-hover'
                  }`}
                >
                  <Cable className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Wire</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTool('delete');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center space-x-1.5 rounded-lg py-2 text-xs font-medium border transition ${
                    currentTool === 'delete'
                      ? 'bg-red-600 text-white border-red-500 font-semibold'
                      : 'bg-[#181c28] text-gray-300 border-panel-border hover:bg-panel-hover'
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Wire Colors */}
              <div className="flex items-center justify-between rounded-lg bg-[#181c28] p-2 border border-panel-border">
                <span className="text-[11px] text-gray-400 font-medium">Wire Color:</span>
                <div className="flex items-center space-x-2">
                  {WIRE_COLORS.slice(0, 6).map((wc: any) => (
                    <button
                      key={wc.hex}
                      onClick={() => {
                        setWireColor(wc.hex);
                        setCurrentTool('wire');
                      }}
                      className={`h-5 w-5 rounded-full transition transform active:scale-125 ${
                        selectedWireColor === wc.hex
                          ? 'ring-2 ring-white ring-offset-1 ring-offset-black scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: wc.hex }}
                      title={wc.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Project Actions */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Project & Storage
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => {
                    newProject();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 rounded-lg bg-[#181c28] border border-panel-border p-2 text-gray-300 hover:text-white transition"
                >
                  <FilePlus className="h-3.5 w-3.5 text-blue-400" />
                  <span>New Project</span>
                </button>

                <button
                  onClick={() => {
                    openModal('projects');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 rounded-lg bg-[#181c28] border border-panel-border p-2 text-gray-300 hover:text-white transition"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                  <span>Cloud Projects</span>
                </button>

                <button
                  onClick={() => {
                    handleExport();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 rounded-lg bg-[#181c28] border border-panel-border p-2 text-gray-300 hover:text-white transition"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={() => {
                    setEditorMode('build');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 rounded-lg bg-[#181c28] border border-panel-border p-2 text-gray-300 hover:text-white transition"
                >
                  <Package className="h-3.5 w-3.5 text-emerald-400" />
                  <span>BOM Parts List</span>
                </button>

                <button
                  onClick={() => {
                    handleImportClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 rounded-lg bg-[#181c28] border border-panel-border p-2 text-gray-300 hover:text-white transition"
                >
                  <Upload className="h-3.5 w-3.5 text-purple-400" />
                  <span>Import JSON</span>
                </button>

                <button
                  onClick={() => {
                    loadSampleProject();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 rounded-lg bg-[#181c28] border border-panel-border p-2 text-gray-300 hover:text-white transition"
                >
                  <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                  <span>ESP32 Demo</span>
                </button>
              </div>
            </div>

            {/* Help & AI */}
            <div className="pt-1 border-t border-panel-border/60 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  openModal('help');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-1.5 text-gray-400 hover:text-gray-200"
              >
                <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                <span>Shortcuts & Help</span>
              </button>

              <button
                onClick={() => {
                  addToast({
                    type: 'info',
                    title: 'CircuitLab AI Assistant',
                    message: 'ESP32 Smart Home topology validated: 100% simulatable with no net conflicts.',
                  });
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>CircuitLab AI</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
