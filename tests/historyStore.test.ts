import { describe, it, expect } from 'vitest';
import { HistoryManager, EditorSnapshot } from '../stores/historyStore';

describe('Undo / Redo History Manager', () => {
  it('records states and supports undo and redo transitions', () => {
    const history = new HistoryManager(10);

    const s0: EditorSnapshot = { components: [], wires: [] };
    const s1: EditorSnapshot = {
      components: [
        {
          id: 'esp1',
          type: 'esp32',
          name: 'ESP32',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          properties: {},
        },
      ],
      wires: [],
    };
    const s2: EditorSnapshot = {
      components: [...s1.components],
      wires: [
        {
          id: 'w1',
          color: '#ff0000',
          from: { componentId: 'esp1', pinId: 'gpio2' },
          to: { componentId: 'esp1', pinId: 'gnd1' },
        },
      ],
    };

    history.record(s0);
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    history.record(s1);

    // Undo from s2 -> returns s1
    const undoneToS1 = history.undo(s2);
    expect(undoneToS1).not.toBeNull();
    expect(undoneToS1?.components).toHaveLength(1);
    expect(history.canRedo()).toBe(true);

    // Undo from s1 -> returns s0
    const undoneToS0 = history.undo(undoneToS1!);
    expect(undoneToS0).not.toBeNull();
    expect(undoneToS0?.components).toHaveLength(0);

    // Redo from s0 -> returns s1
    const redoneToS1 = history.redo(undoneToS0!);
    expect(redoneToS1).not.toBeNull();
    expect(redoneToS1?.components).toHaveLength(1);
  });
});
