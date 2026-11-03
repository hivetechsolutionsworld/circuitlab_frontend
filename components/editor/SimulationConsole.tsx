'use client';

import React, { useState } from 'react';
import {
  Terminal,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Cpu,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

export const SimulationConsole: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'validation' | 'gpio'>('events');

  const events = useEditorStore((s) => s.simulationEvents);
  const validation = useEditorStore((s) => s.validationResult);
  const simulationStatus = useEditorStore((s) => s.simulationStatus);
  const simStates = useEditorStore((s) => s.componentSimStates);

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
      className={`border-t border-panel-border bg-panel-bg z-20 flex flex-col transition-all duration-200 select-none ${
        isExpanded ? 'h-44 sm:h-52' : 'h-8'
      }`}
    >
      {/* Console Header Bar */}
      <div className="flex h-8 items-center justify-between border-b border-panel-border bg-panel-header px-2 sm:px-4 text-xs overflow-x-auto scrollbar-none gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1.5 font-semibold text-gray-300 hover:text-white"
          >
            <Terminal className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">Simulation Console</span>
            <span className="sm:hidden font-mono text-xs">Console</span>
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
            )}
          </button>

          {isExpanded && (
            <div className="flex items-center space-x-1 pl-2 sm:pl-4 border-l border-panel-border">
              <button
                onClick={() => setActiveTab('events')}
                className={`rounded px-2 sm:px-2.5 py-0.5 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === 'events'
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="hidden sm:inline">Event Log </span>
                <span className="sm:hidden">Events </span>
                ({events.length})
              </button>

              <button
                onClick={() => setActiveTab('validation')}
                className={`flex items-center space-x-1 rounded px-2 sm:px-2.5 py-0.5 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === 'validation'
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="hidden sm:inline">Validation</span>
                <span className="sm:hidden">Valid</span>
                {errorCount > 0 && (
                  <span className="rounded-full bg-red-600 px-1.5 text-[10px] text-white">
                    {errorCount}
                  </span>
                )}
                {warningCount > 0 && errorCount === 0 && (
                  <span className="rounded-full bg-yellow-600 px-1.5 text-[10px] text-white">
                    {warningCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('gpio')}
                className={`rounded px-2 sm:px-2.5 py-0.5 text-xs font-medium transition whitespace-nowrap ${
                  activeTab === 'gpio'
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="hidden sm:inline">GPIO & Sensors</span>
                <span className="sm:hidden">GPIO</span>
              </button>
            </div>
          )}
        </div>

        {/* Status indicator on right */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
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
            <span className="font-mono text-[11px] uppercase text-gray-300">
              {simulationStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Console Body */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 font-mono text-xs text-gray-300">
          {activeTab === 'events' && (
            <div className="space-y-1">
              {events.length === 0 ? (
                <div className="text-gray-500 py-4 text-center">
                  Simulation console ready. Click &quot;Simulate&quot; to begin testing circuit logic.
                </div>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="flex items-center space-x-2 py-0.5 hover:bg-white/[0.02] text-xs">
                    <span className="text-[10px] text-gray-500 shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                    {getEventBadge(ev.type)}
                    <span className="text-gray-200 truncate sm:whitespace-normal">{ev.message}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-2">
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

          {activeTab === 'gpio' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {Object.entries(simStates).map(([id, state]: [string, any]) => {
                if (state.gpioOutputs) {
                  return (
                    <div key={id} className="rounded bg-panel-header p-2.5 border border-panel-border space-y-1.5">
                      <div className="flex items-center space-x-1 text-blue-400 font-bold">
                        <Cpu className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{id} (ESP32)</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
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
                      <div className="text-[11px] space-y-1">
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
          )}
        </div>
      )}
    </footer>
  );
};
