import { describe, it, expect } from 'vitest';
import { getPinWorldPosition, snapToGrid } from '../lib/coords';

describe('3D Pin World Coordinates Transformation', () => {
  it('calculates unrotated world position correctly', () => {
    const compPos: [number, number, number] = [2, 0, 5];
    const compRot: [number, number, number] = [0, 0, 0];
    const pinOffset: [number, number, number] = [-0.15, 0.1, 0.25];

    const worldPos = getPinWorldPosition(compPos, compRot, pinOffset);
    expect(worldPos).toEqual([1.85, 0.1, 5.25]);
  });

  it('calculates rotated world position (90 degrees around Y axis)', () => {
    const compPos: [number, number, number] = [0, 0, 0];
    const compRot: [number, number, number] = [0, Math.PI / 2, 0];
    const pinOffset: [number, number, number] = [1, 0, 0];

    // Rotating [1, 0, 0] by 90 deg around Y results in [0, 0, -1]
    const worldPos = getPinWorldPosition(compPos, compRot, pinOffset);
    expect(worldPos[0]).toBeCloseTo(0, 2);
    expect(worldPos[1]).toBeCloseTo(0, 2);
    expect(worldPos[2]).toBeCloseTo(-1, 2);
  });

  it('snaps values to 0.25 unit grid step', () => {
    expect(snapToGrid(0.24, 0.25)).toBe(0.25);
    expect(snapToGrid(0.12, 0.25)).toBe(0);
    expect(snapToGrid(1.6, 0.5)).toBe(1.5);
  });
});
