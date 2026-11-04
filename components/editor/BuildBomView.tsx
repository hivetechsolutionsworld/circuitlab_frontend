'use client';

import React from 'react';
import {
  Layers,
  Download,
  ExternalLink,
  CheckCircle2,
  DollarSign,
  Package,
  Cpu,
  ArrowLeft,
} from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

interface BomItem {
  ref: string;
  name: string;
  category: string;
  specs: string;
  qty: number;
  unitPrice: number;
  simulatable: boolean;
  datasheetUrl: string;
}

const DEFAULT_BOM: BomItem[] = [
  {
    ref: 'U1',
    name: 'ESP32 NodeMCU DevKit V1',
    category: 'Microcontroller',
    specs: 'ESP-WROOM-32, 240MHz Dual Core, Wi-Fi & BLE, 30-pin DIP',
    qty: 1,
    unitPrice: 4.5,
    simulatable: true,
    datasheetUrl: 'https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf',
  },
  {
    ref: 'S1',
    name: 'DHT22 (AM2302) Room Sensor',
    category: 'Sensor',
    specs: 'Digital Temp (-40 to 80°C ±0.5°C) & Humidity (0-100% ±2% RH)',
    qty: 1,
    unitPrice: 2.2,
    simulatable: true,
    datasheetUrl: 'https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf',
  },
  {
    ref: 'D1',
    name: '5mm Through-Hole LED (Smart Lamp)',
    category: 'Optoelectronics',
    specs: 'Forward Voltage 2.1V, Forward Current 20mA, Red diffused dome',
    qty: 1,
    unitPrice: 0.1,
    simulatable: true,
    datasheetUrl: 'https://en.wikipedia.org/wiki/Light-emitting_diode',
  },
  {
    ref: 'R1',
    name: '220Ω 1/4W Carbon Film Resistor',
    category: 'Passive',
    specs: '220 Ohm, ±5% tolerance, EIA 4-band (Red-Red-Brown-Gold)',
    qty: 1,
    unitPrice: 0.05,
    simulatable: true,
    datasheetUrl: 'https://en.wikipedia.org/wiki/Resistor',
  },
  {
    ref: 'SW1',
    name: 'Tactile Push Button Switch',
    category: 'Electromechanical',
    specs: '6x6mm 4-pin momentary tact switch, SPST normally open',
    qty: 1,
    unitPrice: 0.2,
    simulatable: true,
    datasheetUrl: 'https://en.wikipedia.org/wiki/Push-button',
  },
  {
    ref: 'BB1',
    name: 'Full-Size Solderless Breadboard',
    category: 'Prototyping',
    specs: '830 tie-points, dual power buses (+/-), 2.54mm pitch',
    qty: 1,
    unitPrice: 2.8,
    simulatable: true,
    datasheetUrl: 'https://en.wikipedia.org/wiki/Breadboard',
  },
];

export const BuildBomView: React.FC = () => {
  const setEditorMode = useEditorStore((s) => s.setEditorMode);
  const project = useEditorStore((s) => s.project);
  const addToast = useEditorStore((s) => s.addToast);

  const totalCost = DEFAULT_BOM.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  const handleExportCsv = () => {
    let csv = 'Reference,Part Name,Category,Specifications,Qty,Unit Price (USD),Total Price (USD),Simulatable\n';
    DEFAULT_BOM.forEach((item) => {
      csv += `"${item.ref}","${item.name}","${item.category}","${item.specs}",${item.qty},$${item.unitPrice.toFixed(
        2
      )},$${(item.unitPrice * item.qty).toFixed(2)},${item.simulatable ? 'YES' : 'NO'}\n`;
    });
    csv += `\n"TOTAL","","","","",,$${totalCost.toFixed(2)},""\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_BOM.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'BOM Exported',
      message: 'Bill of Materials downloaded as CSV.',
    });
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#121214] text-gray-200 select-text overflow-hidden">
      {/* Header Bar */}
      <div className="flex h-12 items-center justify-between border-b border-panel-border bg-[#18181b] px-4 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setEditorMode('design')}
            className="flex items-center space-x-1.5 rounded bg-panel-header px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-panel-hover border border-panel-border transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Canvas</span>
          </button>

          <div className="h-4 w-[1px] bg-panel-border" />

          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-100">
              Bill of Materials (BOM) & Parts List
            </h2>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center space-x-1.5 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 shrink-0 bg-[#141416] border-b border-panel-border">
        <div className="flex items-center space-x-3 rounded-lg border border-panel-border bg-[#18181b] p-3">
          <Layers className="h-7 w-7 text-blue-400 shrink-0" />
          <div>
            <div className="text-[11px] text-gray-400">Total Unique Parts</div>
            <div className="text-lg font-bold text-gray-100">{DEFAULT_BOM.length} items</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 rounded-lg border border-panel-border bg-[#18181b] p-3">
          <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[11px] text-gray-400">Simulation Coverage</div>
            <div className="text-lg font-bold text-emerald-400">100% Simulatable</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 rounded-lg border border-panel-border bg-[#18181b] p-3">
          <DollarSign className="h-7 w-7 text-amber-400 shrink-0" />
          <div>
            <div className="text-[11px] text-gray-400">Est. Total Hardware Cost</div>
            <div className="text-lg font-bold text-amber-300">${totalCost.toFixed(2)} USD</div>
          </div>
        </div>
      </div>

      {/* Parts Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-lg border border-panel-border bg-[#18181b] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-panel-border bg-[#141416] font-mono text-[11px] text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Ref</th>
                <th className="py-2.5 px-3">Component Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Specifications</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Est. Price</th>
                <th className="py-2.5 px-3 text-center">Simulation</th>
                <th className="py-2.5 px-3 text-center">Docs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-border font-sans">
              {DEFAULT_BOM.map((item) => (
                <tr key={item.ref} className="hover:bg-white/[0.02] transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{item.ref}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-200">{item.name}</td>
                  <td className="py-2.5 px-3 text-gray-400">{item.category}</td>
                  <td className="py-2.5 px-3 text-gray-300 font-mono text-[11px]">{item.specs}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-gray-200">{item.qty}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                    ${(item.unitPrice * item.qty).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center space-x-1 rounded bg-emerald-950/60 border border-emerald-900 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Simulatable</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <a
                      href={item.datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-[11px] underline"
                    >
                      <span>Datasheet</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
