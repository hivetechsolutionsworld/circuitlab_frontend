'use client';

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useEditorStore } from '../../stores/editorStore';
import { PinDefinition } from '@circuitlab/shared';
import { getPinWorldPosition } from '../../lib/coords';

interface PinMarkerProps {
  componentId: string;
  pin: PinDefinition;
  position: [number, number, number]; // Local or world offset
}

export const PinMarker: React.FC<PinMarkerProps> = ({ componentId, pin, position }) => {
  const [hovered, setHovered] = useState(false);
  const activeWireDraft = useEditorStore((s) => s.activeWireDraft);
  const startWireDraft = useEditorStore((s) => s.startWireDraft);
  const completeWireDraft = useEditorStore((s) => s.completeWireDraft);
  const setActiveWireDraftPoint = useEditorStore((s) => s.setActiveWireDraftPoint);
  const components = useEditorStore((s) => s.project.components);

  const isSelectedForWire =
    activeWireDraft?.componentId === componentId && activeWireDraft?.pinId === pin.id;

  const handlePointerDown = (e: any) => {
    // CRITICAL: Stop propagation to prevent DraggableComponent and OrbitControls from intercepting!
    e.stopPropagation();
  };

  const handlePinAction = (e: any) => {
    e.stopPropagation();
    const state = useEditorStore.getState();
    if (state.isReadOnly) return;

    if (!state.activeWireDraft) {
      // Start wiring from this pin
      startWireDraft(componentId, pin.id);
      const comp = components.find((c) => c.id === componentId);
      if (comp) {
        const worldPos = getPinWorldPosition(comp.position, comp.rotation, position);
        setActiveWireDraftPoint([worldPos[0], worldPos[1] + 0.15, worldPos[2]]);
      }
    } else {
      // Complete wiring to this pin
      completeWireDraft(componentId, pin.id);
      setActiveWireDraftPoint(null);
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    if (activeWireDraft) {
      const comp = components.find((c) => c.id === componentId);
      if (comp) {
        const worldPos = getPinWorldPosition(comp.position, comp.rotation, position);
        setActiveWireDraftPoint([worldPos[0], worldPos[1] + 0.1, worldPos[2]]);
      }
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  const getPinColor = () => {
    if (isSelectedForWire) return '#f59e0b'; // Amber pulsing for wire source
    if (hovered) return '#38bdf8'; // Bright cyan on hover
    if (pin.type === 'power') return '#ef4444'; // Red for VCC
    if (pin.type === 'ground') return '#374151'; // Dark for GND
    if (pin.type === 'gpio') return '#10b981'; // Green for GPIO
    return '#94a3b8'; // Silver
  };

  return (
    <group position={position}>
      {/* Visual terminal pin */}
      <mesh
        position={[0, 0.02, 0]}
        onPointerDown={handlePointerDown}
        onClick={handlePinAction}
        onPointerUp={(e) => {
          e.stopPropagation();
          if (
            activeWireDraft &&
            (activeWireDraft.componentId !== componentId || activeWireDraft.pinId !== pin.id)
          ) {
            handlePinAction(e);
          }
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={hovered || isSelectedForWire ? [1.35, 1.35, 1.35] : [1, 1, 1]}
      >
        <cylinderGeometry args={[0.048, 0.048, 0.18, 8]} />
        <meshStandardMaterial
          color={getPinColor()}
          metalness={0.8}
          roughness={0.2}
          emissive={isSelectedForWire || hovered ? getPinColor() : '#000000'}
          emissiveIntensity={isSelectedForWire ? 1.0 : hovered ? 0.7 : 0}
        />
      </mesh>

      {/* Raised hit sphere with renderOrder for effortless clicking & priority raycasting */}
      <mesh
        position={[0, 0.04, 0]}
        onPointerDown={handlePointerDown}
        onClick={handlePinAction}
        onPointerUp={(e) => {
          e.stopPropagation();
          if (
            activeWireDraft &&
            (activeWireDraft.componentId !== componentId || activeWireDraft.pinId !== pin.id)
          ) {
            handlePinAction(e);
          }
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
        renderOrder={100}
      >
        <sphereGeometry args={[0.13, 8, 8]} />
      </mesh>

      {/* Tooltip on hover */}
      {hovered && (
        <Html distanceFactor={10} position={[0, 0.28, 0]} center pointerEvents="none">
          <div className="rounded-md bg-black/95 px-2 py-1 text-[11px] font-mono text-white shadow-2xl border border-blue-500/50 whitespace-nowrap pointer-events-none z-50">
            <span className="font-bold text-cyan-400">{pin.name}</span>
            {pin.description && <span className="text-gray-300 ml-1.5">({pin.description})</span>}
            <div className="text-[9px] text-gray-400">
              {activeWireDraft ? 'Click to connect wire' : 'Click or drag to start wire'}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
