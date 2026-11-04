import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../stores/editorStore';
import {
  COMPONENT_METADATA,
  generateBreadboardHoles,
  CircuitGraph,
  validateCircuit,
  SimulationEngine,
  SAMPLE_ESP32_PROJECT,
} from '@circuitlab/shared';

describe('Complete CircuitLab Functionality & Workflow Audit', () => {
  beforeEach(() => {
    // Reset to blank project for isolated testing
    useEditorStore.getState().newProject();
  });

  describe('1. Circuit Editor: Placement, Manipulation & Selection', () => {
    it('adds, selects, moves, rotates, and deletes components', () => {
      const store = useEditorStore.getState();

      // 1. Add components from library
      store.addComponent('esp32', [-4, 0, 0]);
      store.addComponent('led', [2, 0, 0]);
      store.addComponent('resistor', [0, 0, 0]);

      let state = useEditorStore.getState();
      expect(state.project.components).toHaveLength(3);

      const esp32 = state.project.components.find((c) => c.type === 'esp32')!;
      const led = state.project.components.find((c) => c.type === 'led')!;
      const resistor = state.project.components.find((c) => c.type === 'resistor')!;

      // 2. Select component
      store.selectComponent(led.id);
      expect(useEditorStore.getState().selectedComponentId).toBe(led.id);
      expect(useEditorStore.getState().isPropertiesOpen).toBe(true);

      // 3. Move component
      store.updateComponentPosition(led.id, [3.5, 0, 1.5]);
      const movedLed = useEditorStore.getState().project.components.find((c) => c.id === led.id)!;
      expect(movedLed.position).toEqual([3.5, 0, 1.5]);

      // 4. Rotate component by 90° (Math.PI / 2)
      const initialRotationY = resistor.rotation[1];
      store.rotateComponent(resistor.id, Math.PI / 2);
      const rotatedRes = useEditorStore.getState().project.components.find((c) => c.id === resistor.id)!;
      expect(rotatedRes.rotation[1]).toBeCloseTo(initialRotationY + Math.PI / 2, 4);

      // 5. Update component properties
      store.updateComponentProperty(resistor.id, 'resistance', 470);
      const updatedRes = useEditorStore.getState().project.components.find((c) => c.id === resistor.id)!;
      expect((updatedRes.properties as any).resistance).toBe(470);

      // 6. Delete component
      store.deleteComponent(esp32.id);
      state = useEditorStore.getState();
      expect(state.project.components).toHaveLength(2);
      expect(state.project.components.some((c) => c.id === esp32.id)).toBe(false);
    });

    it('supports undo and redo for editing actions', () => {
      const store = useEditorStore.getState();

      store.addComponent('led', [0, 0, 0]);
      const ledId = useEditorStore.getState().project.components[0].id;

      store.rotateComponent(ledId, Math.PI / 2);
      expect(useEditorStore.getState().canUndo).toBe(true);

      // Undo rotation
      store.undo();
      const undoneLed = useEditorStore.getState().project.components.find((c) => c.id === ledId)!;
      expect(undoneLed.rotation[1]).toBeCloseTo(0, 4);
      expect(useEditorStore.getState().canRedo).toBe(true);

      // Redo rotation
      store.redo();
      const redoneLed = useEditorStore.getState().project.components.find((c) => c.id === ledId)!;
      expect(redoneLed.rotation[1]).toBeCloseTo(Math.PI / 2, 4);
    });
  });

  describe('2. Circuit Wiring & Breadboard Connectivity', () => {
    it('creates wires between valid pins and removes them when component is deleted', () => {
      const store = useEditorStore.getState();

      store.addComponent('esp32', [-3, 0, 0]);
      store.addComponent('led', [3, 0, 0]);

      const [esp, led] = useEditorStore.getState().project.components;

      // Start wire from ESP32 GPIO2
      store.startWireDraft(esp.id, 'gpio2');
      expect(useEditorStore.getState().activeWireDraft).toEqual({
        componentId: esp.id,
        pinId: 'gpio2',
      });

      // Complete to LED Anode
      store.completeWireDraft(led.id, 'anode');
      expect(useEditorStore.getState().activeWireDraft).toBeNull();
      expect(useEditorStore.getState().project.wires).toHaveLength(1);

      const wire = useEditorStore.getState().project.wires[0];
      expect(wire.from).toEqual({ componentId: esp.id, pinId: 'gpio2' });
      expect(wire.to).toEqual({ componentId: led.id, pinId: 'anode' });

      // Delete connected component: attached wire must be cleaned up
      store.deleteComponent(led.id);
      expect(useEditorStore.getState().project.wires).toHaveLength(0);
    });

    it('verifies breadboard electrical node connectivity', () => {
      const { pins, groupMap, pinToGroup } = generateBreadboardHoles({
        rows: 30,
        pitch: 0.25,
        splitRails: false,
      });

      // 1. Verify terminal strip connectivity (A10, B10, C10, D10, E10 share group row_10_left)
      const groupA10 = pinToGroup.get('hole_a10');
      const groupB10 = pinToGroup.get('hole_b10');
      const groupE10 = pinToGroup.get('hole_e10');
      expect(groupA10).toBe('row_10_left');
      expect(groupB10).toBe('row_10_left');
      expect(groupE10).toBe('row_10_left');

      // 2. Verify center trench isolation (A10 and F10 must NOT be in the same group)
      const groupF10 = pinToGroup.get('hole_f10');
      expect(groupF10).toBe('row_10_right');
      expect(groupA10).not.toBe(groupF10);

      // 3. Verify power rail connectivity (Negative rail connects along rows)
      const groupRail1 = pinToGroup.get('rail_left_neg_1');
      const groupRail15 = pinToGroup.get('rail_left_neg_15');
      const groupRail30 = pinToGroup.get('rail_left_neg_30');
      expect(groupRail1).toBe('rail_left_neg');
      expect(groupRail15).toBe('rail_left_neg');
      expect(groupRail30).toBe('rail_left_neg');
    });

    it('detects disconnected components and produces validation warnings', () => {
      const store = useEditorStore.getState();

      // Add two components with no connections
      store.addComponent('led', [0, 0, 0]);
      store.addComponent('resistor', [2, 0, 0]);

      const graph = new CircuitGraph(
        useEditorStore.getState().project.components,
        useEditorStore.getState().project.wires
      );
      const validation = validateCircuit(graph);

      // Should identify missing connections / incomplete circuit
      expect(validation.isValid).toBe(true); // Warnings do not strictly block execution
      expect(
        validation.issues.some(
          (i) => i.code === 'MISSING_CONNECTIONS' || i.code === 'INCOMPLETE_CIRCUIT'
        )
      ).toBe(true);
    });
  });

  describe('3. Simulation Engine: Behavioral Verification', () => {
    it('executes the ESP32 Smart Home Monitoring System correctly', () => {
      const store = useEditorStore.getState();

      // Load sample ESP32 Smart Home project
      store.loadSampleProject();
      const project = useEditorStore.getState().project;

      expect(project.components.length).toBeGreaterThanOrEqual(6);
      expect(project.wires.length).toBeGreaterThanOrEqual(10);

      // Initialize simulation engine with the circuit
      const engine = new SimulationEngine(project.components, project.wires);
      const startResult = engine.start();
      expect(startResult.success).toBe(true);
      expect(engine.getStatus()).toBe('running');

      // 1. In default state, ESP32 GPIO2 is HIGH -> LED should be illuminated
      const ledState = engine.getComponentState('led_1');
      expect(ledState).toBeDefined();
      expect(ledState.lit).toBe(true);
      expect(ledState.current_mA).toBeGreaterThan(0);

      // 2. Toggle GPIO2 to LOW -> LED must turn OFF
      engine.digitalWrite('esp32_1', 2, 'LOW');
      const ledOffState = engine.getComponentState('led_1');
      expect(ledOffState.lit).toBe(false);

      // 3. Toggle GPIO2 back to HIGH -> LED must turn ON again
      engine.digitalWrite('esp32_1', 2, 'HIGH');
      expect(engine.getComponentState('led_1').lit).toBe(true);

      // 4. Test Push Button input state
      engine.setButtonState('btn_1', true);
      const btnState = engine.getComponentState('btn_1');
      expect(btnState.pressed).toBe(true);

      // 5. Test DHT22 Sensor readings
      engine.setSensorEnvironment('dht_1', 28.5, 62.0);
      const dhtState = engine.getComponentState('dht_1');
      expect(dhtState.temperature).toBeCloseTo(28.5);
      expect(dhtState.humidity).toBeCloseTo(62.0);
      expect(dhtState.active).toBe(true); // Connected to 3V3 and GND

      // 6. Stop simulation: outputs should safely reset
      engine.stop();
      expect(engine.getStatus()).toBe('stopped');
      expect(engine.getComponentState('led_1').lit).toBe(false);
    });

    it('verifies that LED illumination depends on real circuit continuity, not hardcoded flags', () => {
      const store = useEditorStore.getState();
      store.loadSampleProject();
      const project = useEditorStore.getState().project;

      // Intentionally break the Ground return path by removing the GND wire
      const brokenWires = project.wires.filter((w) => w.id !== 'w_esp_gnd');
      const brokenEngine = new SimulationEngine(project.components, brokenWires);
      brokenEngine.start();

      // Even if GPIO2 is HIGH, broken ground path means no current can flow!
      brokenEngine.digitalWrite('esp32_1', 2, 'HIGH');
      const ledState = brokenEngine.getComponentState('led_1');
      expect(ledState.lit).toBe(false);
    });
  });

  describe('4. Viewport Controls & Camera Presets', () => {
    it('updates camera view preset and grid snap settings', () => {
      const store = useEditorStore.getState();

      expect(store.cameraViewPreset).toBe('3d');

      store.setCameraViewPreset('top');
      expect(useEditorStore.getState().cameraViewPreset).toBe('top');

      store.setCameraViewPreset('front');
      expect(useEditorStore.getState().cameraViewPreset).toBe('front');

      store.setCameraViewPreset('3d');
      expect(useEditorStore.getState().cameraViewPreset).toBe('3d');
    });
  });
});
