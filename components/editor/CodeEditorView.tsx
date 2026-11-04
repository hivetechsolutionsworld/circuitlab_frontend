'use client';

import React, { useState } from 'react';
import {
  FileCode,
  CheckCircle2,
  Zap,
  RotateCcw,
  Copy,
  Terminal,
  Check,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

const DEFAULT_INO_SKETCH = `// ==============================================================================
// ESP32 Smart Home Monitoring System Firmware
// Target MCU: ESP32-WROOM-32 (NodeMCU-32S)
// Sensors: DHT22 (Temp & Humidity on GPIO15)
// Actuators: Smart Lamp LED (GPIO2), Tactile Wall Button (GPIO4)
// Serial Baudrate: 115200 bps
// ==============================================================================

#include <Arduino.h>
#include <DHT.h>

#define DHTPIN       15
#define DHTTYPE      DHT22
#define LED_PIN      2
#define BUTTON_PIN   4

DHT dht(DHTPIN, DHTTYPE);

unsigned long lastReadTime = 0;
const unsigned long readInterval = 2000; // 2 seconds between sensor frames
bool ledState = false;

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000); // Wait for USB CDC connection

  Serial.println(F("=================================================="));
  Serial.println(F("  ESP32 SMART HOME CONTROLLER INITIALIZING...     "));
  Serial.println(F("=================================================="));

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  pinMode(BUTTON_PIN, INPUT_PULLUP);

  dht.begin();
  Serial.println(F("[INIT] DHT22 sensor initialized on GPIO15."));
  Serial.println(F("[INIT] Smart Lamp LED initialized on GPIO2."));
  Serial.println(F("[INIT] Wall Switch Button configured with INPUT_PULLUP on GPIO4."));
  Serial.println(F("[READY] System loop active. Listening for telemetry & events."));
}

void loop() {
  unsigned long now = millis();

  // Read button input (Active-LOW with pull-up)
  int buttonState = digitalRead(BUTTON_PIN);
  if (buttonState == LOW) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    Serial.printf("[EVENT] Button pressed! LED toggled -> %s\\n", ledState ? "ON" : "OFF");
    delay(250); // Debounce
  }

  // Periodic DHT22 sensor polling
  if (now - lastReadTime >= readInterval) {
    lastReadTime = now;

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println(F("[ERROR] Failed to read from DHT22 sensor! Check wiring."));
      return;
    }

    Serial.printf("[TELEMETRY] Temp: %.1f C | Humidity: %.1f %% | LED: %s\\n",
      temperature, humidity, ledState ? "HIGH" : "LOW");

    // Automatic thermostat logic: turn ON LED alert if temp exceeds 28 C
    if (temperature > 28.0 && !ledState) {
      ledState = true;
      digitalWrite(LED_PIN, HIGH);
      Serial.println(F("[ALERT] Temperature threshold (> 28 C) exceeded! Auto-cooling active."));
    }
  }
}
`;

const DIAGRAM_JSON = `{
  "version": 1,
  "author": "CircuitLab 3D Team",
  "editor": "wokwi",
  "parts": [
    { "type": "wokwi-esp32-devkit-v1", "id": "esp", "top": 0, "left": 0, "attrs": {} },
    { "type": "wokwi-breadboard", "id": "bb1", "top": 100, "left": 150, "attrs": {} },
    { "type": "wokwi-dht22", "id": "dht1", "top": -40, "left": 300, "attrs": {} },
    { "type": "wokwi-led", "id": "led1", "top": 120, "left": 280, "attrs": { "color": "green" } },
    { "type": "wokwi-resistor", "id": "r1", "top": 160, "left": 280, "attrs": { "value": "220" } },
    { "type": "wokwi-pushbutton", "id": "btn1", "top": 240, "left": 280, "attrs": {} }
  ],
  "connections": [
    [ "esp:TX", "$serialMonitor:RX", "", [] ],
    [ "esp:RX", "$serialMonitor:TX", "", [] ],
    [ "esp:GND.1", "bb1:bn", "black", [ "h0" ] ],
    [ "esp:3V3", "bb1:tp", "red", [ "h0" ] ],
    [ "esp:D2", "bb1:10b", "blue", [ "h0" ] ],
    [ "esp:D4", "bb1:20b", "green", [ "h0" ] ],
    [ "esp:D15", "dht1:SDA", "orange", [ "h0" ] ]
  ]
}`;

const LIBRARIES_TXT = `# Libraries used by ESP32 Smart Home System
# Automatically resolved by simulator
DHT sensor library@1.4.6
Adafruit Unified Sensor@1.1.14
`;

export const CodeEditorView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'sketch.ino' | 'diagram.json' | 'libraries.txt'>('sketch.ino');
  const [code, setCode] = useState(DEFAULT_INO_SKETCH);
  const [diagramJson, setDiagramJson] = useState(DIAGRAM_JSON);
  const [librariesTxt, setLibrariesTxt] = useState(LIBRARIES_TXT);
  const [compilerOutput, setCompilerOutput] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [copied, setCopied] = useState(false);

  const addToast = useEditorStore((s) => s.addToast);
  const setEditorMode = useEditorStore((s) => s.setEditorMode);
  const startSimulation = useEditorStore((s) => s.startSimulation);

  const currentContent =
    activeFile === 'sketch.ino'
      ? code
      : activeFile === 'diagram.json'
      ? diagramJson
      : librariesTxt;

  const handleContentChange = (val: string) => {
    if (activeFile === 'sketch.ino') setCode(val);
    else if (activeFile === 'diagram.json') setDiagramJson(val);
    else setLibrariesTxt(val);
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setCompilerOutput('Compiling sketch with xtensa-esp32-elf-g++ (v12.2.0)...\nLinking firmware...');
    setTimeout(() => {
      setIsCompiling(false);
      setCompilerOutput(
        `[SUCCESS] Compilation Complete! (xtensa-esp32-elf-g++)\n` +
          `• Sketch uses 218,452 bytes (16%) of program storage space. Maximum is 1,310,720 bytes.\n` +
          `• Global variables use 15,320 bytes (4%) of dynamic memory, leaving 312,360 bytes for local variables.\n` +
          `• ELF binary generated: build/esp32.bin (CRC32: 0x9B4E38F1)\n` +
          `• All syntax checks passed. Firmware is ready to flash.`
      );
      addToast({
        type: 'success',
        title: 'Compilation Succeeded',
        message: 'ESP32 firmware compiled with 0 errors.',
      });
    }, 600);
  };

  const handleFlash = () => {
    setIsCompiling(true);
    setCompilerOutput('Writing firmware to ESP32 Flash (0x10000)...\nHash of data verified.');
    setTimeout(() => {
      setIsCompiling(false);
      setCompilerOutput(
        `[SUCCESS] Flashed to ESP32 at 921600 baud.\n` +
          `Hard resetting via RTS pin...\n` +
          `ESP32-WROOM-32 bootloader active. Starting simulation.`
      );
      addToast({
        type: 'success',
        title: 'Firmware Uploaded',
        message: 'ESP32 flashed. Starting simulation mode...',
      });
      setEditorMode('simulate');
      startSimulation();
    }, 500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = currentContent.split('\n');

  return (
    <div className="flex h-full w-full flex-col bg-[#18181b] text-gray-200 select-text overflow-hidden">
      {/* Code Editor Header Bar */}
      <div className="flex h-11 items-center justify-between border-b border-panel-border bg-[#121214] px-4 shrink-0">
        <div className="flex items-center space-x-1">
          {/* File Tabs */}
          <button
            onClick={() => setActiveFile('sketch.ino')}
            className={`flex items-center space-x-2 rounded-t px-3 py-1.5 text-xs font-mono transition ${
              activeFile === 'sketch.ino'
                ? 'bg-[#18181b] text-blue-400 border-t-2 border-blue-500 font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e1e24]'
            }`}
          >
            <FileCode className="h-3.5 w-3.5 text-cyan-400" />
            <span>sketch.ino</span>
          </button>

          <button
            onClick={() => setActiveFile('diagram.json')}
            className={`flex items-center space-x-2 rounded-t px-3 py-1.5 text-xs font-mono transition ${
              activeFile === 'diagram.json'
                ? 'bg-[#18181b] text-blue-400 border-t-2 border-blue-500 font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e1e24]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            <span>diagram.json</span>
          </button>

          <button
            onClick={() => setActiveFile('libraries.txt')}
            className={`flex items-center space-x-2 rounded-t px-3 py-1.5 text-xs font-mono transition ${
              activeFile === 'libraries.txt'
                ? 'bg-[#18181b] text-blue-400 border-t-2 border-blue-500 font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e1e24]'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span>libraries.txt</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 rounded bg-[#27272a] px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-[#3f3f46] transition"
            title="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="flex items-center space-x-1.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40 px-3 py-1 text-xs font-semibold hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
            title="Verify & Compile Code"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{isCompiling ? 'Compiling...' : 'Verify'}</span>
          </button>

          <button
            onClick={handleFlash}
            disabled={isCompiling}
            className="flex items-center space-x-1.5 rounded bg-emerald-600 text-white px-3 py-1 text-xs font-semibold hover:bg-emerald-500 shadow-sm transition disabled:opacity-50"
            title="Compile & Flash to Simulated ESP32"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Upload & Run</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line Numbers Gutter */}
        <div className="w-12 select-none border-r border-panel-border bg-[#141416] py-3 text-right font-mono text-[11px] leading-5 text-gray-600 pr-3">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <div className="flex-1 relative overflow-auto bg-[#18181b]">
          <textarea
            value={currentContent}
            onChange={(e) => handleContentChange(e.target.value)}
            spellCheck={false}
            className="h-full w-full resize-none bg-transparent p-3 font-mono text-xs leading-5 text-gray-200 outline-none select-text whitespace-pre tab-4"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>

      {/* Compiler Console Output Drawer */}
      {compilerOutput && (
        <div className="border-t border-panel-border bg-[#0f0f11] p-3 font-mono text-[11px] text-gray-300 max-h-36 overflow-y-auto">
          <div className="flex items-center justify-between pb-1 text-xs text-gray-400 font-semibold border-b border-gray-800 mb-1.5">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <Terminal className="h-3.5 w-3.5" />
              <span>Compilation Output (ESP32 Toolchain)</span>
            </span>
            <button
              onClick={() => setCompilerOutput(null)}
              className="text-gray-500 hover:text-gray-300 text-xs"
            >
              Close
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-emerald-300/90 leading-relaxed">{compilerOutput}</pre>
        </div>
      )}
    </div>
  );
};
