'use client';

import { useEffect } from 'react';
import { useEditorStore } from '../stores/editorStore';

export function useKeybindings() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const cancelWireDraft = useEditorStore((s) => s.cancelWireDraft);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const selectWire = useEditorStore((s) => s.selectWire);
  const deleteComponent = useEditorStore((s) => s.deleteComponent);
  const deleteWire = useEditorStore((s) => s.deleteWire);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const selectedWireId = useEditorStore((s) => s.selectedWireId);
  const setCurrentTool = useEditorStore((s) => s.setCurrentTool);
  const isReadOnly = useEditorStore((s) => s.isReadOnly);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if (cmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Cmd+Shift+Z
      if (
        (cmdOrCtrl && e.key.toLowerCase() === 'y') ||
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isReadOnly) {
          if (selectedComponentId) {
            e.preventDefault();
            deleteComponent(selectedComponentId);
          } else if (selectedWireId) {
            e.preventDefault();
            deleteWire(selectedWireId);
          }
        }
        return;
      }

      // Escape: Cancel active wire draft or clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelWireDraft();
        selectComponent(null);
        selectWire(null);
        return;
      }

      // Quick tool shortcuts
      if (e.key.toLowerCase() === 'v') {
        setCurrentTool('select');
      } else if (e.key.toLowerCase() === 'w') {
        setCurrentTool('wire');
      } else if (e.key.toLowerCase() === 'd') {
        setCurrentTool('delete');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    cancelWireDraft,
    selectComponent,
    selectWire,
    deleteComponent,
    deleteWire,
    selectedComponentId,
    selectedWireId,
    setCurrentTool,
    isReadOnly,
  ]);
}
