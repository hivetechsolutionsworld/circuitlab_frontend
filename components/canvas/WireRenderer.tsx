'use client';

import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Wire, COMPONENT_METADATA, generateBreadboardHoles } from '@circuitlab/shared';
import { useEditorStore } from '../../stores/editorStore';
import { getPinWorldPosition } from '../../lib/coords';

interface WireRendererProps {
  wire: Wire;
  isSelected: boolean;
}

export const SingleWire: React.FC<WireRendererProps> = ({ wire, isSelected }) => {
  const components = useEditorStore((s) => s.project.components);
  const selectWire = useEditorStore((s) => s.selectWire);
  const deleteWire = useEditorStore((s) => s.deleteWire);
  const currentTool = useEditorStore((s) => s.currentTool);
  const [hovered, setHovered] = useState(false);

  // Cache breadboard holes for lookup
  const bbPins = useMemo(() => generateBreadboardHoles().pins, []);

  // Compute exact world positions of from and to pins
  const points = useMemo(() => {
    const fromComp = components.find((c) => c.id === wire.from.componentId);
    const toComp = components.find((c) => c.id === wire.to.componentId);

    if (!fromComp || !toComp) return null;

    let fromPinLocal: [number, number, number] = [0, 0, 0];
    if (fromComp.type === 'breadboard') {
      const p = bbPins.find((pin) => pin.id === wire.from.pinId);
      if (p) fromPinLocal = p.position;
    } else {
      const meta = COMPONENT_METADATA[fromComp.type];
      const p = meta?.pins.find((pin) => pin.id === wire.from.pinId);
      if (p) fromPinLocal = p.position;
    }

    let toPinLocal: [number, number, number] = [0, 0, 0];
    if (toComp.type === 'breadboard') {
      const p = bbPins.find((pin) => pin.id === wire.to.pinId);
      if (p) toPinLocal = p.position;
    } else {
      const meta = COMPONENT_METADATA[toComp.type];
      const p = meta?.pins.find((pin) => pin.id === wire.to.pinId);
      if (p) toPinLocal = p.position;
    }

    const startPos = getPinWorldPosition(fromComp.position, fromComp.rotation, fromPinLocal);
    const endPos = getPinWorldPosition(toComp.position, toComp.rotation, toPinLocal);

    const vStart = new THREE.Vector3(...startPos);
    const vEnd = new THREE.Vector3(...endPos);

    // Natural arch / catenary elevation based on distance
    const dist = vStart.distanceTo(vEnd);
    const midY = Math.max(vStart.y, vEnd.y) + Math.min(1.5, 0.4 + dist * 0.15);
    const vControl = new THREE.Vector3(
      (vStart.x + vEnd.x) / 2,
      midY,
      (vStart.z + vEnd.z) / 2
    );

    const curve = new THREE.QuadraticBezierCurve3(vStart, vControl, vEnd);
    return curve.getPoints(24);
  }, [components, wire, bbPins]);

  const tubeGeometry = useMemo(() => {
    if (!points || points.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 24, 0.03, 8, false);
  }, [points]);

  if (!tubeGeometry) return null;

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (currentTool === 'delete') {
      deleteWire(wire.id);
    } else {
      selectWire(wire.id);
    }
  };

  const wireColor = wire.color || '#3b82f6';
  const displayColor = isSelected ? '#fbbf24' : hovered ? '#60a5fa' : wireColor;

  return (
    <mesh
      geometry={tubeGeometry}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      <meshStandardMaterial
        color={displayColor}
        roughness={0.4}
        metalness={0.1}
        emissive={isSelected || hovered ? displayColor : '#000000'}
        emissiveIntensity={isSelected ? 0.6 : hovered ? 0.3 : 0}
      />
    </mesh>
  );
};

export const ActiveDraftWire: React.FC = () => {
  const activeWireDraft = useEditorStore((s) => s.activeWireDraft);
  const activeWireDraftPoint = useEditorStore((s) => s.activeWireDraftPoint);
  const components = useEditorStore((s) => s.project.components);
  const selectedWireColor = useEditorStore((s) => s.selectedWireColor) || '#3b82f6';
  const bbPins = useMemo(() => generateBreadboardHoles().pins, []);

  const points = useMemo(() => {
    if (!activeWireDraft || !activeWireDraftPoint) return null;

    const fromComp = components.find((c) => c.id === activeWireDraft.componentId);
    if (!fromComp) return null;

    let fromPinLocal: [number, number, number] = [0, 0, 0];
    if (fromComp.type === 'breadboard') {
      const p = bbPins.find((pin) => pin.id === activeWireDraft.pinId);
      if (p) fromPinLocal = p.position;
    } else {
      const meta = COMPONENT_METADATA[fromComp.type];
      const p = meta?.pins.find((pin) => pin.id === activeWireDraft.pinId);
      if (p) fromPinLocal = p.position;
    }

    const startPos = getPinWorldPosition(fromComp.position, fromComp.rotation, fromPinLocal);
    const vStart = new THREE.Vector3(...startPos);
    const vEnd = new THREE.Vector3(...activeWireDraftPoint);

    const dist = vStart.distanceTo(vEnd);
    if (dist < 0.05) {
      vEnd.y += 0.08;
    }

    const midY = Math.max(vStart.y, vEnd.y) + Math.min(1.2, 0.25 + dist * 0.12);
    const vControl = new THREE.Vector3(
      (vStart.x + vEnd.x) / 2,
      midY,
      (vStart.z + vEnd.z) / 2
    );

    const curve = new THREE.QuadraticBezierCurve3(vStart, vControl, vEnd);
    return curve.getPoints(20);
  }, [activeWireDraft, activeWireDraftPoint, components, bbPins]);

  const tubeGeometry = useMemo(() => {
    if (!points || points.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 20, 0.038, 8, false);
  }, [points]);

  return (
    <group raycast={() => null}>
      {tubeGeometry && (
        <mesh geometry={tubeGeometry} raycast={() => null}>
          <meshStandardMaterial
            color={selectedWireColor}
            emissive={selectedWireColor}
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Terminal bead at current cursor/pin position */}
      {activeWireDraftPoint && (
        <mesh position={activeWireDraftPoint} raycast={() => null}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial
            color={selectedWireColor}
            emissive={selectedWireColor}
            emissiveIntensity={1.0}
            roughness={0.2}
          />
        </mesh>
      )}
    </group>
  );
};

export const WireRenderer: React.FC = () => {
  const wires = useEditorStore((s) => s.project.wires);
  const selectedWireId = useEditorStore((s) => s.selectedWireId);

  return (
    <group>
      {wires.map((wire) => (
        <SingleWire
          key={wire.id}
          wire={wire}
          isSelected={selectedWireId === wire.id}
        />
      ))}
      <ActiveDraftWire />
    </group>
  );
};
