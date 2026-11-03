import * as THREE from 'three';

/**
 * Computes the exact 3D world-space coordinates of a pin, given the component's
 * world position, Euler rotation (in radians), and the pin's local offset.
 */
export function getPinWorldPosition(
  componentPosition: [number, number, number],
  componentRotation: [number, number, number],
  pinLocalOffset: [number, number, number]
): [number, number, number] {
  const pinVec = new THREE.Vector3(...pinLocalOffset);
  const euler = new THREE.Euler(...componentRotation, 'XYZ');

  // Rotate local offset
  pinVec.applyEuler(euler);

  // Translate by component position
  const worldX = componentPosition[0] + pinVec.x;
  const worldY = componentPosition[1] + pinVec.y;
  const worldZ = componentPosition[2] + pinVec.z;

  return [
    Math.round(worldX * 1000) / 1000,
    Math.round(worldY * 1000) / 1000,
    Math.round(worldZ * 1000) / 1000,
  ];
}

/**
 * Snaps a 3D coordinate to a grid step (default 0.25 units).
 */
export function snapToGrid(val: number, step: number = 0.25): number {
  return Math.round(val / step) * step;
}
