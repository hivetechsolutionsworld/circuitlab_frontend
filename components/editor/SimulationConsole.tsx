'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Cpu,
  Send,
  Trash2,
  Minimize2,
  Maximize2,
  Lock,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

interface SerialLine {
  id: string;
  timestamp: string;
  text: string;
  type: 'incoming' | 'outgoing' | 'system' | 'alert';
}

const INITIAL_SERIAL_LINES: SerialLine[] = [
  {
    id: 's_0',
    timestamp: '00:00.000',
    text: 'ESP32-WROOM-32 (NodeMCU) bootloader v4.4: 240MHz, 4MB Flash',
    type: 'system',
  },
  {
    id: 's_1',
    timestamp: '00:00.045',
    text: 'UART0 serial monitor online at 115200 baud (8N1).',
    type: 'system',
  },
  {
    id: 's_2',
    timestamp: '00:00.120',
    text: 'Start simulation to view live serial output, or type "HELP" below.',
    type: 'system',
  },
];

export const SimulationConsole: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'serial' | 'events' | 'validation' | 'gpio'>('serial');
  const [serialLines, setSerialLines] = useState<SerialLine[]>(INITIAL_SERIAL_LINES);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('esp32_1');

  const events = useEditorStore((s) => s.simulationEvents);
  const validation = useEditorStore((s) => s.validationResult);
  const simulationStatus = useEditorStore((s) => s.simulationStatus);
  const simStates = useEditorStore((s) => s.componentSimStates);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When simulation starts/stops or events change, stream into serial lines
  useEffect(() => {
    if (simulationStatus === 'running' && events.length > 0) {
      const lastEvent = events[events.length - 1];
      const now = new Date(lastEvent.timestamp);
      const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(
        2,
        '0'
      )}.${String(now.getMilliseconds()).padStart(3, '0').slice(0, 3)}`;

      setSerialLines((prev) => {
        if (prev.some((l) => l.id === lastEvent.id)) return prev;
        return [
          ...prev.slice(-150),
          {
            id: lastEvent.id,
            timestamp: timeStr,
            text: `[${lastEvent.type.toUpperCase()}] ${lastEvent.message}`,
            type: lastEvent.type === 'error' ? 'alert' : 'incoming',
          },
        ];
      });
    }
  }, [events, simulationStatus]);

  useEffect(() => {
    if (activeTab === 'serial' && isExpanded) {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialLines, activeTab, isExpanded]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const trimmed = inputMessage.trim();
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(
      2,
      '0'
    )}.${String(now.getMilliseconds()).padStart(3, '0').slice(0, 3)}`;

    const userMsg: SerialLine = {
      id: `out_${Date.now()}`,
      timestamp: timeStr,
      text: `> ${trimmed}`,
      type: 'outgoing',
    };

    let responseText = '';
    const upper = trimmed.toUpperCase();
    if (upper === 'HELP') {
      responseText = '[ESP32] Commands available: HELP, STATUS, GET_TEMP, GET_HUMID, LED ON, LED OFF, PING';
    } else if (upper === 'STATUS') {
      responseText = `[ESP32] Status: ${simulationStatus.toUpperCase()} | Free Heap: 298,416 B | Board: NodeMCU-32S`;
    } else if (upper === 'GET_TEMP' || upper === 'TEMP') {
      const dhtState = simStates['dht_1'];
      const temp = dhtState?.temperature ?? 24.5;
      responseText = `[DHT22] Current Temperature reading: ${temp.toFixed(1)} °C`;
    } else if (upper === 'GET_HUMID' || upper === 'HUMID') {
      const dhtState = simStates['dht_1'];
      const hum = dhtState?.humidity ?? 48.0;
      responseText = `[DHT22] Current Relative Humidity reading: ${hum.toFixed(1)} %`;
    } else if (upper === 'LED ON') {
      responseText = '[GPIO2] Smart Lamp LED driven HIGH [5.5 mA forward current]';
    } else if (upper === 'LED OFF') {
      responseText = '[GPIO2] Smart Lamp LED driven LOW (OFF)';
    } else if (upper === 'PING') {
      responseText = '[ESP32] PONG (Latency: 0.8ms)';
    } else {
      responseText = `[ESP32 Serial Echo] "${trimmed}" received (115200 baud).`;
    }

    const responseMsg: SerialLine = {
      id: `in_${Date.now() + 1}`,
      timestamp: timeStr,
      text: responseText,
      type: 'incoming',
    };

    setSerialLines((prev) => [...prev, userMsg, responseMsg]);
    setInputMessage('');
  };

  const handleClear = () => {
    setSerialLines([
      {
        id: `clear_${Date.now()}`,
        timestamp: '00:00.000',
        text: 'Serial monitor buffer cleared. Listening on UART0 (115200)...',
        type: 'system',
      },
    ]);
  };

  const errorCount = validation?.issues.filter((i) => i.severity === 'error').length || 0;
  const warningCount = validation?.issues.filter((i) => i.severity === 'warning').length || 0;

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'error':
        return <span className="rounded bg-red-950/60 px-1.5 py-0.5 text-[10px] font-mono text-red-400 border border-red-900 shrink-0">ERR</span>;
      case 'warning':
        return <span className="rounded bg-yellow-950/60 px-1.5 py-0.5 text-[10px] font-mono text-yellow-400 border border-yellow-900 shrink-0">WARN</span>;
      case 'gpio':
        return <span className="rounded bg-blue-950/60 px-1.5 py-0.5 text-[10px] font-mono text-blue-400 border border-blue-900 shrink-0">GPIO</span>;
      case 'led':
        return <span className="rounded bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-900 shrink-0">LED</span>;
      case 'button':
        return <span className="rounded bg-purple-950/60 px-1.5 py-0.5 text-[10px] font-mono text-purple-400 border border-purple-900 shrink-0">BTN</span>;
      case 'sensor':
        return <span className="rounded bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-900 shrink-0">SENS</span>;
      default:
        return <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 shrink-0">INFO</span>;
    }
  };

  return (
    <footer
      className={`border-t border-panel-border bg-[#10131d] z-20 flex flex-col transition-all duration-200 select-none ${
        isExpanded ? 'h-48 sm:h-56' : 'h-8'
      }`}
    >
      {/* Console Header Bar (Styled exactly like Cirkit Designer IDE) */}
      <div className="flex h-8 items-center justify-between border-b border-panel-border bg-[#151926] px-2 sm:px-4 text-xs overflow-x-auto scrollbar-none gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1.5 font-semibold text-gray-200 hover:text-white"
          >
            <Terminal className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="font-semibold text-xs text-gray-200">Simulation Console</span>
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
            )}
          </button>

          {/* Board Selector (Cirkit Designer style) */}
          <div className="hidden sm:flex items-center space-x-1 pl-3 border-l border-panel-border text-[11px] text-gray-400">
            <span>Board</span>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="rounded bg-[#1e2436] border border-panel-border px-2 py-0.5 text-[11px] font-mono text-blue-300 focus:outline-none"
            >
              <option value="esp32_1">ESP32 NodeMCU (esp32_1)</option>
            </select>
          </div>

          {/* Navigation Tabs */}
          {isExpanded && (
            <div className="flex items-center space-x-1 pl-2 border-l border-panel-border">
              <button
                onClick={() => setActiveTab('serial')}
                className={`rounded px-2.5 py-0.5 text-xs font-medium transition ${
                  activeTab === 'serial' ? 'bg-blue-600/30 text-blue-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Serial Output
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`rounded px-2.5 py-0.5 text-xs font-medium transition ${
                  activeTab === 'events' ? 'bg-blue-600/30 text-blue-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Event Log ({events.length})
              </button>

              <button
                onClick={() => setActiveTab('validation')}
                className={`flex items-center space-x-1 rounded px-2.5 py-0.5 text-xs font-medium transition ${
                  activeTab === 'validation' ? 'bg-blue-600/30 text-blue-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>Validation</span>
                {errorCount > 0 && (
                  <span className="rounded-full bg-red-600 px-1.5 text-[10px] text-white">{errorCount}</span>
                )}
                {warningCount > 0 && errorCount === 0 && (
                  <span className="rounded-full bg-yellow-600 px-1.5 text-[10px] text-white">{warningCount}</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('gpio')}
                className={`rounded px-2.5 py-0.5 text-xs font-medium transition ${
                  activeTab === 'gpio' ? 'bg-blue-600/30 text-blue-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                GPIO & Sensors
              </button>
            </div>
          )}
        </div>

        {/* Right Header: Clear, Debug, Status, Collapse */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-white transition p-1"
            title="Clear Console Output"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center space-x-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                simulationStatus === 'running'
                  ? 'bg-emerald-500 animate-pulse'
                  : simulationStatus === 'error'
                  ? 'bg-red-500'
                  : 'bg-gray-500'
              }`}
            />
            <span className="font-mono text-[11px] uppercase text-gray-300">{simulationStatus}</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition p-1"
            title={isExpanded ? 'Minimize Console' : 'Expand Console'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Console Body Area */}
      {isExpanded && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1017]">
          {/* Serial Monitor Tab (Matching Cirkit Designer) */}
          {activeTab === 'serial' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-gray-300 space-y-1">
                {serialLines.map((line) => (
                  <div
                    key={line.id}
                    className={`leading-relaxed ${
                      line.type === 'outgoing'
                        ? 'text-cyan-400 font-bold'
                        : line.type === 'alert'
                        ? 'text-red-400'
                        : line.type === 'system'
                        ? 'text-gray-500'
                        : 'text-gray-200'
                    }`}
                  >
                    <span className="text-[10px] text-gray-600 mr-2 select-none font-mono">[{line.timestamp}]</span>
                    <span>{line.text}</span>
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>

              {/* Cirkit Designer style Interactive Message Input Line */}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center border-t border-panel-border bg-[#151926] px-3 py-1.5 gap-2 shrink-0"
              >
                <span className="text-gray-500 font-mono text-xs select-none">&gt;</span>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Message to send here ... (e.g. HELP, STATUS, GET_TEMP, LED ON)"
                  className="flex-1 bg-transparent text-xs font-mono text-gray-100 placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="flex items-center space-x-1 rounded bg-blue-600 hover:bg-blue-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40 transition shadow-xs"
                >
                  <Send className="h-3 w-3" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* Event Log Tab */}
          {activeTab === 'events' && (
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-gray-300 space-y-1">
              {events.length === 0 ? (
                <div className="text-gray-500 py-4 text-center">
                  Simulation console ready. Click &quot;Simulate&quot; to begin testing circuit logic.
                </div>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="flex items-center space-x-2 py-0.5 hover:bg-white/[0.02] text-xs">
                    <span className="text-[10px] text-gray-500 shrink-0 font-mono" suppressHydrationWarning>
                      {mounted ? new Date(ev.timestamp).toLocaleTimeString() : '--:--:--'}
                    </span>
                    {getEventBadge(ev.type)}
                    <span className="text-gray-200 truncate sm:whitespace-normal">{ev.message}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Validation Tab */}
          {activeTab === 'validation' && (
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-gray-300 space-y-2">
              {validation?.issues.length === 0 ? (
                <div className="flex items-center space-x-2 text-emerald-400 py-2">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Circuit topology is valid! No electrical errors detected.</span>
                </div>
              ) : (
                validation?.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2 rounded p-2 border ${
                      issue.severity === 'error'
                        ? 'bg-red-950/20 border-red-900/50 text-red-300'
                        : issue.severity === 'warning'
                        ? 'bg-yellow-950/20 border-yellow-900/50 text-yellow-300'
                        : 'bg-blue-950/20 border-blue-900/50 text-blue-300'
                    }`}
                  >
                    {issue.severity === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold mr-1">[{issue.code}]</span>
                      <span>{issue.message}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* GPIO & Sensors Tab */}
          {activeTab === 'gpio' && (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {Object.entries(simStates).map(([id, state]: [string, any]) => {
                  if (state.gpioOutputs) {
                    return (
                      <div key={id} className="rounded bg-panel-header p-2.5 border border-panel-border space-y-1.5">
                        <div className="flex items-center space-x-1 text-blue-400 font-bold">
                          <Cpu className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{id} (ESP32)</span>
                        </div>
                        <div className="space-y-1 text-[11px] font-mono">
                          {Object.entries(state.gpioOutputs).map(([gpio, val]) => (
                            <div key={gpio} className="flex justify-between">
                              <span className="text-gray-400">GPIO{gpio}:</span>
                              <span className={val === 'HIGH' ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                                {val as string}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (state.temperature !== undefined) {
                    return (
                      <div key={id} className="rounded bg-panel-header p-2.5 border border-panel-border space-y-1.5">
                        <div className="flex items-center space-x-1 text-cyan-400 font-bold">
                          <Activity className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{id} (DHT22)</span>
                        </div>
                        <div className="text-[11px] font-mono space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Temp:</span>
                            <span className="text-gray-200">{state.temperature.toFixed(1)} °C</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Humidity:</span>
                            <span className="text-gray-200">{state.humidity.toFixed(1)} %</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </footer>
  );
};
