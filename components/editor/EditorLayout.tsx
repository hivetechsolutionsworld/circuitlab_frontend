'use client';

import React, { useEffect } from 'react';
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
import { useEditorStore } from '../../stores/editorStore';

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

  const isSidebarOpen = useEditorStore((s) => s.isSidebarOpen);
  const isPropertiesOpen = useEditorStore((s) => s.isPropertiesOpen);
  const setSidebarOpen = useEditorStore((s) => s.setSidebarOpen);
  const setPropertiesOpen = useEditorStore((s) => s.setPropertiesOpen);

  // Initialize desktop panels on mount if screen is desktop width (>= 1024px)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSidebarOpen(true);
      setPropertiesOpen(true);
    }
  }, [setSidebarOpen, setPropertiesOpen]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground antialiased select-none">
      {/* Top Header Toolbar */}
      <HeaderToolbar />

      {/* Main Workspace (Sidebar, 3D Canvas, Properties) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop for Sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close component sidebar"
          />
        )}

        {/* Component Sidebar (Collapsible Drawer on Mobile, Static on Desktop) */}
        <ComponentSidebar />

        {/* 3D Canvas Area */}
        <main className="flex-1 h-full relative overflow-hidden touch-none">
          <CircuitCanvas />
        </main>

        {/* Mobile Backdrop for Properties */}
        {isPropertiesOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setPropertiesOpen(false)}
            aria-label="Close properties panel"
          />
        )}

        {/* Properties Panel (Collapsible Drawer on Mobile, Static on Desktop) */}
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
