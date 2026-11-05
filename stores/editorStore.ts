import { create } from 'zustand';
import * as THREE from 'three';
import {
  CircuitProject,
  PlacedComponent,
  Wire,
  ComponentType,
  COMPONENT_METADATA,
  SimulationEngine,
  SimulationStatus,
  SimulationEvent,
  CircuitValidationResult,
  validateCircuit,
  CircuitGraph,
  CURRENT_SCHEMA_VERSION,
  SAMPLE_ESP32_PROJECT,
} from '@circuitlab/shared';
import { HistoryManager } from './historyStore';
import { getPinWorldPosition } from '../lib/coords';

export interface ToastItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface EditorState {
  // Project
  project: CircuitProject;
  isReadOnly: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;

  // Selection & Tools
  selectedComponentId: string | null;
  selectedWireId: string | null;
  activeWireDraft: { componentId: string; pinId: string } | null;
  currentTool: 'select' | 'wire' | 'delete';
  selectedWireColor: string;
  history: HistoryManager;

  // Simulation
  simulationEngine: SimulationEngine;
  simulationStatus: SimulationStatus;
  componentSimStates: Record<string, any>;
  simulationEvents: SimulationEvent[];
  validationResult: CircuitValidationResult | null;

  // Modals & UI
  editorMode: 'design' | 'code' | 'simulate' | 'build';
  activeModal: 'share' | 'settings' | 'help' | 'projects' | null;
  toasts: ToastItem[];
  isSidebarOpen: boolean;
  isPropertiesOpen: boolean;
  isDraggingComponent: boolean;
  activeWireDraftPoint: [number, number, number] | null;
  cameraViewPreset: '3d' | 'top' | 'front';

  // Actions
  toggleSidebar: (force?: boolean) => void;
  toggleProperties: (force?: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setPropertiesOpen: (open: boolean) => void;
  setIsDraggingComponent: (isDragging: boolean) => void;
  setActiveWireDraftPoint: (pt: [number, number, number] | null) => void;
  setCameraViewPreset: (preset: '3d' | 'top' | 'front') => void;
  setEditorMode: (mode: 'design' | 'code' | 'simulate' | 'build') => void;
  newProject: () => void;
  loadSampleProject: () => void;
  setProject: (project: CircuitProject, readOnly?: boolean) => void;
  setProjectName: (name: string) => void;
  addComponent: (type: ComponentType, position?: [number, number, number]) => void;
  updateComponentPosition: (id: string, position: [number, number, number]) => void;
  rotateComponent: (id: string, deltaY?: number) => void;
  updateComponentProperty: (id: string, key: string, value: any) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;

  startWireDraft: (componentId: string, pinId: string) => void;
  completeWireDraft: (componentId: string, pinId: string) => void;
  completeWireDraftToComponent: (componentId: string, hitPoint?: [number, number, number]) => void;
  cancelWireDraft: () => void;
  selectWire: (id: string | null) => void;
  deleteWire: (id: string) => void;
  setWireColor: (color: string) => void;
  setCurrentTool: (tool: 'select' | 'wire' | 'delete') => void;

  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  toggleGpio: (esp32Id: string, pinNumber: number) => void;
  setButtonState: (buttonId: string, isPressed: boolean) => void;
  setSensorValues: (dhtId: string, temp: number, hum: number) => void;
  runValidation: () => void;

  undo: () => void;
  redo: () => void;

  openModal: (modal: 'share' | 'settings' | 'help' | 'projects' | null) => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const defaultInitialProject: CircuitProject = JSON.parse(
  JSON.stringify(SAMPLE_ESP32_PROJECT)
);

export const useEditorStore = create<EditorState>((set, get) => {
  const history = new HistoryManager(50);
  const initialEngine = new SimulationEngine(
    defaultInitialProject.components,
    defaultInitialProject.wires
  );

  initialEngine.setOnStateChange((states, events) => {
    set({
      componentSimStates: states,
      simulationEvents: events,
      simulationStatus: initialEngine.getStatus(),
    });
  });

  return {
    project: defaultInitialProject,
    isReadOnly: false,
    isSaving: false,
    canUndo: false,
    canRedo: false,

    selectedComponentId: null,
    selectedWireId: null,
    activeWireDraft: null,
    currentTool: 'select',
    selectedWireColor: '#3b82f6',
    history,

    simulationEngine: initialEngine,
    simulationStatus: 'stopped',
    componentSimStates: initialEngine.getComponentStates(),
    simulationEvents: initialEngine.getEvents(),
    validationResult: null,

    activeModal: null,
    toasts: [],
    isSidebarOpen: false,
    isPropertiesOpen: false,
    isDraggingComponent: false,
    activeWireDraftPoint: null,
    cameraViewPreset: '3d',
    editorMode: 'design',

    setEditorMode: (mode) => {
      set({ editorMode: mode });
      if (mode === 'simulate') {
        const state = get();
        if (state.simulationStatus !== 'running') {
          state.startSimulation();
        }
      }
    },

    setProject: (project, readOnly = false) => {
      history.clear();
      const engine = new SimulationEngine(project.components, project.wires);

      engine.setOnStateChange((states, events) => {
        set({
          componentSimStates: states,
          simulationEvents: events,
          simulationStatus: engine.getStatus(),
        });
      });

      set({
        project,
        isReadOnly: readOnly,
        selectedComponentId: null,
        selectedWireId: null,
        activeWireDraft: null,
        simulationEngine: engine,
        simulationStatus: 'stopped',
        componentSimStates: engine.getComponentStates(),
        simulationEvents: engine.getEvents(),
        canUndo: false,
        canRedo: false,
      });

      get().runValidation();
    },

    setProjectName: (name) => {
      if (get().isReadOnly) return;
      set((state) => ({
        project: { ...state.project, name },
      }));
    },

    addComponent: (type, position) => {
      const state = get();
      if (state.isReadOnly) return;

      const meta = COMPONENT_METADATA[type];
      const count = state.project.components.filter((c) => c.type === type).length + 1;
      const id = `${type}_${Date.now().toString(36)}`;

      // Default positioning: place slightly staggered on breadboard or workspace
      const pos: [number, number, number] = position || [
        (count - 1) * 1.5 - 2,
        0,
        (count % 2) * 2 - 1,
      ];

      const newComponent: PlacedComponent = {
        id,
        type,
        name: `${meta?.name || type} ${count}`,
        position: pos,
        rotation: [0, 0, 0],
        properties: JSON.parse(JSON.stringify(meta?.defaultProperties || {})),
      };

      state.history.record({
        components: state.project.components,
        wires: state.project.wires,
      });

      const updatedComponents = [...state.project.components, newComponent];
      state.simulationEngine.updateCircuit(updatedComponents, state.project.wires);

      set({
        project: { ...state.project, components: updatedComponents },
        selectedComponentId: id,
        selectedWireId: null,
        canUndo: state.history.canUndo(),
        canRedo: state.history.canRedo(),
      });

      get().runValidation();
      get().addToast({
        type: 'info',
        title: 'Component Added',
        message: `${newComponent.name} placed in workspace.`,
      });
    },

    updateComponentPosition: (id, position) => {
      const state = get();
      if (state.isReadOnly) return;

      const updated = state.project.components.map((c) =>
        c.id === id ? { ...c, position } : c
      );

      set({
        project: { ...state.project, components: updated },
      });
    },

    rotateComponent: (id, deltaY = Math.PI / 2) => {
      const state = get();
      if (state.isReadOnly) return;

      state.history.record({
        components: state.project.components,
        wires: state.project.wires,
      });

      const updated = state.project.components.map((c) => {
        if (c.id === id) {
          const newRot: [number, number, number] = [
            c.rotation[0],
            c.rotation[1] + deltaY,
            c.rotation[2],
          ];
          return { ...c, rotation: newRot };
        }
        return c;
      });

      set({
        project: { ...state.project, components: updated },
        canUndo: state.history.canUndo(),
        canRedo: state.history.canRedo(),
      });
    },

    updateComponentProperty: (id, key, value) => {
      const state = get();
      if (state.isReadOnly) return;

      state.history.record({
        components: state.project.components,
        wires: state.project.wires,
      });

      const updated = state.project.components.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            properties: { ...c.properties, [key]: value },
          };
        }
        return c;
      });

      state.simulationEngine.updateCircuit(updated, state.project.wires);

      set({
        project: { ...state.project, components: updated },
        canUndo: state.history.canUndo(),
        canRedo: state.history.canRedo(),
      });

      get().runValidation();
    },

    deleteComponent: (id) => {
      const state = get();
      if (state.isReadOnly) return;

      state.history.record({
        components: state.project.components,
        wires: state.project.wires,
      });

      // Also clean up any connected wires safely!
      const updatedComponents = state.project.components.filter((c) => c.id !== id);
      const updatedWires = state.project.wires.filter(
        (w) => w.from.componentId !== id && w.to.componentId !== id
      );

      state.simulationEngine.updateCircuit(updatedComponents, updatedWires);

      set({
        project: {
          ...state.project,
          components: updatedComponents,
          wires: updatedWires,
        },
        selectedComponentId: null,
        canUndo: state.history.canUndo(),
        canRedo: state.history.canRedo(),
      });

      get().runValidation();
      get().addToast({ type: 'info', title: 'Component Deleted' });
    },

    selectComponent: (id) => {
      set((state) => ({
        selectedComponentId: id,
        selectedWireId: null,
        isPropertiesOpen: id ? true : state.isPropertiesOpen,
      }));
    },

    startWireDraft: (componentId, pinId) => {
      const state = get();
      if (state.isReadOnly) return;

      set({
        activeWireDraft: { componentId, pinId },
        currentTool: 'wire',
        selectedComponentId: null,
        selectedWireId: null,
      });
    },

    completeWireDraft: (componentId, pinId) => {
      const state = get();
      if (state.isReadOnly || !state.activeWireDraft) return;

      const from = state.activeWireDraft;
      const to = { componentId, pinId };

      // Prevent connecting pin to itself
      if (from.componentId === to.componentId && from.pinId === to.pinId) {
        set({ activeWireDraft: null, currentTool: 'select' });
        return;
      }

      state.history.record({
        components: state.project.components,
        wires: state.project.wires,
      });

      const wireId = `w_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;
      const newWire: Wire = {
        id: wireId,
        color: state.selectedWireColor,
        from,
        to,
        style: 'straight',
      };

      const updatedWires = [...state.project.wires, newWire];
      state.simulationEngine.updateCircuit(state.project.components, updatedWires);

      set({
        project: { ...state.project, wires: updatedWires },
        activeWireDraft: null,
        currentTool: 'select',
        selectedWireId: wireId,
        canUndo: state.history.canUndo(),
        canRedo: state.history.canRedo(),
      });

      get().runValidation();
      get().addToast({
        type: 'success',
        title: 'Wire Connected',
        message: `Connected ${from.pinId} to ${to.pinId}`,
      });
    },

    completeWireDraftToComponent: (componentId, hitPoint) => {
      const state = get();
      if (state.isReadOnly || !state.activeWireDraft) return;

      const comp = state.project.components.find((c) => c.id === componentId);
      if (!comp || comp.type === 'breadboard') return;

      const meta = COMPONENT_METADATA[comp.type];
      if (!meta || !meta.pins || meta.pins.length === 0) return;

      let chosenPin = meta.pins[0];
      if (hitPoint) {
        let minDist = Infinity;
        const hitVec = new THREE.Vector3(...hitPoint);
        for (const p of meta.pins) {
          const worldPos = getPinWorldPosition(comp.position, comp.rotation, p.position);
          const d = hitVec.distanceTo(new THREE.Vector3(...worldPos));
          if (d < minDist) {
            minDist = d;
            chosenPin = p;
          }
        }
      }

      get().completeWireDraft(componentId, chosenPin.id);
    },

    cancelWireDraft: () => {
      set({ activeWireDraft: null, currentTool: 'select' });
    },

    selectWire: (id) => {
      set((state) => ({
        selectedWireId: id,
        selectedComponentId: null,
        isPropertiesOpen: id ? true : state.isPropertiesOpen,
      }));
    },

    deleteWire: (id) => {
      const state = get();
      if (state.isReadOnly) return;

      state.history.record({
        components: state.project.components,
        wires: state.project.wires,
      });

      const updatedWires = state.project.wires.filter((w) => w.id !== id);
      state.simulationEngine.updateCircuit(state.project.components, updatedWires);

      set({
        project: { ...state.project, wires: updatedWires },
        selectedWireId: null,
        canUndo: state.history.canUndo(),
        canRedo: state.history.canRedo(),
      });

      get().runValidation();
      get().addToast({ type: 'info', title: 'Wire Removed' });
    },

    setWireColor: (color) => {
      set({ selectedWireColor: color });
    },

    setCurrentTool: (tool) => {
      set({ currentTool: tool, activeWireDraft: null });
    },

    startSimulation: () => {
      const state = get();
      const res = state.simulationEngine.start();
      set({
        simulationStatus: state.simulationEngine.getStatus(),
        componentSimStates: state.simulationEngine.getComponentStates(),
        simulationEvents: state.simulationEngine.getEvents(),
      });

      if (res.success) {
        get().addToast({ type: 'success', title: 'Simulation Started' });
      } else {
        get().addToast({
          type: 'error',
          title: 'Simulation Error',
          message: 'Circuit has errors. Check simulation console.',
        });
      }
    },

    stopSimulation: () => {
      const state = get();
      state.simulationEngine.stop();
      set({
        simulationStatus: state.simulationEngine.getStatus(),
        componentSimStates: state.simulationEngine.getComponentStates(),
        simulationEvents: state.simulationEngine.getEvents(),
      });
      get().addToast({ type: 'info', title: 'Simulation Stopped' });
    },

    resetSimulation: () => {
      const state = get();
      state.simulationEngine.reset();
      set({
        simulationStatus: state.simulationEngine.getStatus(),
        componentSimStates: state.simulationEngine.getComponentStates(),
        simulationEvents: state.simulationEngine.getEvents(),
      });
      get().addToast({ type: 'info', title: 'Simulation Reset' });
    },

    toggleGpio: (esp32Id, pinNumber) => {
      const state = get();
      const espState = state.componentSimStates[esp32Id];
      const current = espState?.gpioOutputs?.[pinNumber] || 'LOW';
      const next = current === 'HIGH' ? 'LOW' : 'HIGH';
      state.simulationEngine.digitalWrite(esp32Id, pinNumber, next);
      set({
        componentSimStates: state.simulationEngine.getComponentStates(),
        simulationEvents: state.simulationEngine.getEvents(),
      });
    },

    setButtonState: (buttonId, isPressed) => {
      const state = get();
      state.simulationEngine.setButtonState(buttonId, isPressed);
      set({
        componentSimStates: state.simulationEngine.getComponentStates(),
        simulationEvents: state.simulationEngine.getEvents(),
      });
    },

    setSensorValues: (dhtId, temp, hum) => {
      const state = get();
      state.simulationEngine.setSensorEnvironment(dhtId, temp, hum);
      set({
        componentSimStates: state.simulationEngine.getComponentStates(),
        simulationEvents: state.simulationEngine.getEvents(),
      });
    },

    runValidation: () => {
      const state = get();
      const graph = new CircuitGraph(state.project.components, state.project.wires);
      const result = validateCircuit(graph);
      set({ validationResult: result });
    },

    undo: () => {
      const state = get();
      if (state.isReadOnly || !state.history.canUndo()) return;

      const current = {
        components: state.project.components,
        wires: state.project.wires,
      };

      const restored = state.history.undo(current);
      if (restored) {
        state.simulationEngine.updateCircuit(restored.components, restored.wires);
        set({
          project: {
            ...state.project,
            components: restored.components,
            wires: restored.wires,
          },
          canUndo: state.history.canUndo(),
          canRedo: state.history.canRedo(),
          selectedComponentId: null,
          selectedWireId: null,
        });
        get().runValidation();
      }
    },

    redo: () => {
      const state = get();
      if (state.isReadOnly || !state.history.canRedo()) return;

      const current = {
        components: state.project.components,
        wires: state.project.wires,
      };

      const restored = state.history.redo(current);
      if (restored) {
        state.simulationEngine.updateCircuit(restored.components, restored.wires);
        set({
          project: {
            ...state.project,
            components: restored.components,
            wires: restored.wires,
          },
          canUndo: state.history.canUndo(),
          canRedo: state.history.canRedo(),
        });
        get().runValidation();
      }
    },

    toggleSidebar: (force) =>
      set((state) => ({
        isSidebarOpen: force !== undefined ? force : !state.isSidebarOpen,
      })),

    toggleProperties: (force) =>
      set((state) => ({
        isPropertiesOpen: force !== undefined ? force : !state.isPropertiesOpen,
      })),

    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    setPropertiesOpen: (open) => set({ isPropertiesOpen: open }),

    setIsDraggingComponent: (isDragging) => set({ isDraggingComponent: isDragging }),

    setActiveWireDraftPoint: (pt) => set({ activeWireDraftPoint: pt }),

    setCameraViewPreset: (preset) => set({ cameraViewPreset: preset }),

    newProject: () => {
      const emptyProject: CircuitProject = {
        id: `proj_${Date.now().toString(36)}`,
        name: 'New Circuit Project',
        description: 'Custom electronic circuit',
        version: 1,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        components: [],
        wires: [],
        camera: { position: [0, 10, 14], target: [0, 0, 0] },
        editorSettings: {
          gridSnap: true,
          gridSize: 0.5,
          defaultWireColor: '#3b82f6',
          theme: 'dark',
          showLabels: true,
          autoValidate: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      get().setProject(emptyProject);
      get().addToast({
        type: 'info',
        title: 'New Project Created',
        message: 'Empty workspace ready. Place components from the left sidebar.',
      });
    },

    loadSampleProject: () => {
      get().setProject(JSON.parse(JSON.stringify(SAMPLE_ESP32_PROJECT)));
      get().addToast({
        type: 'success',
        title: 'ESP32 Smart Home Loaded',
        message: 'Demonstration circuit ready to simulate.',
      });
    },

    openModal: (modal) => set({ activeModal: modal }),

    addToast: (toast) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
      setTimeout(() => {
        get().removeToast(id);
      }, 4000);
    },

    removeToast: (id) => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },
  };
});
