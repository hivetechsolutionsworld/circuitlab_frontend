import { PlacedComponent, Wire } from '@circuitlab/shared';

export interface EditorSnapshot {
  components: PlacedComponent[];
  wires: Wire[];
}

export class HistoryManager {
  private past: EditorSnapshot[] = [];
  private future: EditorSnapshot[] = [];
  private maxDepth: number = 50;

  constructor(maxDepth: number = 50) {
    this.maxDepth = maxDepth;
  }

  public record(current: EditorSnapshot) {
    // Deep clone to ensure immutability
    this.past.push(JSON.parse(JSON.stringify(current)));
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
    // Any new action clears redo future
    this.future = [];
  }

  public undo(current: EditorSnapshot): EditorSnapshot | null {
    if (this.past.length === 0) return null;

    const previous = this.past.pop()!;
    this.future.push(JSON.parse(JSON.stringify(current)));
    return previous;
  }

  public redo(current: EditorSnapshot): EditorSnapshot | null {
    if (this.future.length === 0) return null;

    const next = this.future.pop()!;
    this.past.push(JSON.parse(JSON.stringify(current)));
    return next;
  }

  public canUndo(): boolean {
    return this.past.length > 0;
  }

  public canRedo(): boolean {
    return this.future.length > 0;
  }

  public clear() {
    this.past = [];
    this.future = [];
  }
}
