import { ComponentType } from '../types/component';
import { CircuitProject } from '../types/project';
import { CURRENT_SCHEMA_VERSION } from '../schemas/project.schema';

export const SAMPLE_ESP32_PROJECT: CircuitProject = {
  id: 'proj_sample_esp32_smart_home',
  name: 'ESP32 Smart Home System',
  description: 'Functional ESP32 circuit with Solderless Breadboard, Smart LED, Current-Limiting Resistor, Push Button, and DHT22 Sensor.',
  version: 1,
  schemaVersion: CURRENT_SCHEMA_VERSION,
  components: [
    {
      id: 'bb_1',
      type: 'breadboard' as ComponentType,
      name: 'Breadboard',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      properties: { rows: 30, cols: 10, hasPowerRails: true },
    },
    {
      id: 'esp32_1',
      type: 'esp32' as ComponentType,
      name: 'ESP32 NodeMCU',
      position: [-4.2, 0, 0],
      rotation: [0, 0, 0],
      properties: {
        boardName: 'ESP32 NodeMCU',
        gpioStates: { 2: 'HIGH', 4: 'LOW', 5: 'LOW', 18: 'LOW', 19: 'LOW', 21: 'LOW', 22: 'LOW', 23: 'LOW' },
        gpioModes: { 2: 'OUTPUT', 4: 'INPUT_PULLUP', 5: 'OUTPUT', 18: 'OUTPUT', 19: 'OUTPUT', 21: 'OUTPUT', 22: 'OUTPUT', 23: 'OUTPUT' },
      },
    },
    {
      id: 'res_1',
      type: 'resistor' as ComponentType,
      name: '220Ω Resistor',
      position: [0, 0.2, -1.2],
      rotation: [0, 0, 0],
      properties: { resistance: 220, tolerance: 5 },
    },
    {
      id: 'led_1',
      type: 'led' as ComponentType,
      name: 'Smart Lamp LED',
      position: [0.5, 0.3, 0.8],
      rotation: [0, 0, 0],
      properties: { color: 'green', forwardVoltage: 2.1, maxCurrent: 20 },
    },
    {
      id: 'btn_1',
      type: 'push_button' as ComponentType,
      name: 'Wall Switch Button',
      position: [-0.6, 0.2, 2.0],
      rotation: [0, 0, 0],
      properties: { isPressed: false, pullMode: 'pullup' },
    },
    {
      id: 'dht_1',
      type: 'dht22' as ComponentType,
      name: 'DHT22 Room Sensor',
      position: [3.8, 0, -1.5],
      rotation: [0, 0, 0],
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
      style: 'straight',
    },
    // BB Hole B10 -> Resistor Pin 1
    {
      id: 'w_res1',
      color: '#3b82f6',
      from: { componentId: 'bb_1', pinId: 'hole_b10' },
      to: { componentId: 'res_1', pinId: 'pin1' },
      style: 'straight',
    },
    // Resistor Pin 2 -> BB Hole A15
    {
      id: 'w_res2',
      color: '#3b82f6',
      from: { componentId: 'res_1', pinId: 'pin2' },
      to: { componentId: 'bb_1', pinId: 'hole_a15' },
      style: 'straight',
    },
    // BB Hole B15 -> LED Anode
    {
      id: 'w_led_anode',
      color: '#10b981',
      from: { componentId: 'bb_1', pinId: 'hole_b15' },
      to: { componentId: 'led_1', pinId: 'anode' },
      style: 'straight',
    },
    // LED Cathode -> BB Ground Rail
    {
      id: 'w_led_cathode',
      color: '#1f2937',
      from: { componentId: 'led_1', pinId: 'cathode' },
      to: { componentId: 'bb_1', pinId: 'rail_left_neg_15' },
      style: 'straight',
    },
    // ESP32 GND -> BB Ground Rail
    {
      id: 'w_esp_gnd',
      color: '#1f2937',
      from: { componentId: 'esp32_1', pinId: 'gnd1' },
      to: { componentId: 'bb_1', pinId: 'rail_left_neg_1' },
      style: 'straight',
    },
    // Push Button Pin 1A -> ESP32 GPIO4
    {
      id: 'w_btn_gpio',
      color: '#eab308',
      from: { componentId: 'btn_1', pinId: 'pin1a' },
      to: { componentId: 'esp32_1', pinId: 'gpio4' },
      style: 'straight',
    },
    // Push Button Pin 2A -> BB Ground Rail
    {
      id: 'w_btn_gnd',
      color: '#1f2937',
      from: { componentId: 'btn_1', pinId: 'pin2a' },
      to: { componentId: 'bb_1', pinId: 'rail_left_neg_25' },
      style: 'straight',
    },
    // DHT22 VCC -> ESP32 3V3
    {
      id: 'w_dht_vcc',
      color: '#ef4444',
      from: { componentId: 'dht_1', pinId: 'vcc' },
      to: { componentId: 'esp32_1', pinId: '3v3' },
      style: 'straight',
    },
    // DHT22 GND -> ESP32 GND
    {
      id: 'w_dht_gnd',
      color: '#1f2937',
      from: { componentId: 'dht_1', pinId: 'gnd' },
      to: { componentId: 'esp32_1', pinId: 'gnd2' },
      style: 'straight',
    },
    // DHT22 DATA -> ESP32 GPIO18
    {
      id: 'w_dht_data',
      color: '#f97316',
      from: { componentId: 'dht_1', pinId: 'data' },
      to: { componentId: 'esp32_1', pinId: 'gpio18' },
      style: 'straight',
    },
  ],
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
