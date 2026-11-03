import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../stores/editorStore';

describe('Editor Store State & Actions', () => {
  beforeEach(() => {
    useEditorStore.getState().setProject({
      id: 'proj_test',
      name: 'Test Project',
      description: '',
      version: 1,
      schemaVersion: 2,
      components: [],
      wires: [],
      camera: { position: [0, 8, 12], target: [0, 0, 0] },
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
    });
  });

  it('adds components to the workspace', () => {
    const store = useEditorStore.getState();
    store.addComponent('esp32', [0, 0, 0]);

    const updated = useEditorStore.getState().project;
    expect(updated.components).toHaveLength(1);
    expect(updated.components[0].type).toBe('esp32');
    expect(useEditorStore.getState().canUndo).toBe(true);
  });

  it('completes wire connection and links two components', () => {
    const store = useEditorStore.getState();
    store.addComponent('esp32', [-2, 0, 0]);
    store.addComponent('led', [2, 0, 0]);

    const comps = useEditorStore.getState().project.components;
    const espId = comps[0].id;
    const ledId = comps[1].id;

    // Draft wire from ESP32 GPIO2
    store.startWireDraft(espId, 'gpio2');
    expect(useEditorStore.getState().activeWireDraft).toEqual({
      componentId: espId,
      pinId: 'gpio2',
    });

    // Complete wire to LED Anode
    store.completeWireDraft(ledId, 'anode');
    expect(useEditorStore.getState().activeWireDraft).toBeNull();

    const wires = useEditorStore.getState().project.wires;
    expect(wires).toHaveLength(1);
    expect(wires[0].from).toEqual({ componentId: espId, pinId: 'gpio2' });
    expect(wires[0].to).toEqual({ componentId: ledId, pinId: 'anode' });
  });

  it('deleting a component safely removes all connected wires', () => {
    const store = useEditorStore.getState();
    store.addComponent('esp32');
    store.addComponent('resistor');

    const comps = useEditorStore.getState().project.components;
    const espId = comps[0].id;
    const resId = comps[1].id;

    store.startWireDraft(espId, '3v3');
    store.completeWireDraft(resId, 'pin1');
    expect(useEditorStore.getState().project.wires).toHaveLength(1);

    // Delete resistor
    store.deleteComponent(resId);

    const updated = useEditorStore.getState().project;
    expect(updated.components).toHaveLength(1);
    expect(updated.components[0].id).toBe(espId);
    // Wire should be safely removed!
    expect(updated.wires).toHaveLength(0);
  });

  it('manages responsive sidebar and properties drawer state', () => {
    const store = useEditorStore.getState();

    expect(store.isSidebarOpen).toBe(false);
    expect(store.isPropertiesOpen).toBe(false);

    store.toggleSidebar();
    expect(useEditorStore.getState().isSidebarOpen).toBe(true);

    store.toggleSidebar(false);
    expect(useEditorStore.getState().isSidebarOpen).toBe(false);

    store.toggleProperties();
    expect(useEditorStore.getState().isPropertiesOpen).toBe(true);

    // Selecting a component should auto-open properties drawer
    store.addComponent('led');
    const ledId = useEditorStore.getState().project.components[0].id;

    store.setPropertiesOpen(false);
    expect(useEditorStore.getState().isPropertiesOpen).toBe(false);

    store.selectComponent(ledId);
    expect(useEditorStore.getState().isPropertiesOpen).toBe(true);
    expect(useEditorStore.getState().selectedComponentId).toBe(ledId);
  });
});
