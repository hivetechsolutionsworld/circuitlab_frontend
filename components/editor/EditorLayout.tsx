'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { HeaderToolbar } from './HeaderToolbar';
import { ComponentSidebar } from './ComponentSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { SimulationConsole } from './SimulationConsole';
import { ShareModal } from './ShareModal';
import { SettingsModal } from './SettingsModal';
import { HelpModal } from './HelpModal';
import { ToastContainer } from './Toast';
import { useKeybindings } from '../../hooks/useKeybindings';

// Dynamically import Three.js Canvas to guarantee pure client-side rendering with no SSR hydration mismatches
const CircuitCanvas = dynamic(
  () => import('../canvas/CircuitCanvas').then((mod) => mod.CircuitCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background text-xs font-mono text-gray-500">
        Initializing 3D WebGL Engine...
      </div>
    ),
  }
);

export const EditorLayout: React.FC = () => {
  useKeybindings();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground antialiased select-none">
      {/* Top Header Toolbar */}
      <HeaderToolbar />

      {/* Main Workspace (Sidebar, 3D Canvas, Properties) */}
      <div className="flex flex-1 overflow-hidden relative">
        <ComponentSidebar />

        <main className="flex-1 h-full relative overflow-hidden">
          <CircuitCanvas />
        </main>

        <PropertiesPanel />
      </div>

      {/* Bottom Console Panel */}
      <SimulationConsole />

      {/* Overlays, Dialogs & Notifications */}
      <ShareModal />
      <SettingsModal />
      <HelpModal />
      <ToastContainer />
    </div>
  );
};
