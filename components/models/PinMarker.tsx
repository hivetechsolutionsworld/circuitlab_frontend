'use client';

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useEditorStore } from '../../stores/editorStore';
import { PinDefinition } from '@circuitlab/shared';

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

  const isSelectedForWire =
    activeWireDraft?.componentId === componentId && activeWireDraft?.pinId === pin.id;

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!activeWireDraft) {
      startWireDraft(componentId, pin.id);
    } else {
      completeWireDraft(componentId, pin.id);
    }
  };

  const getPinColor = () => {
    if (isSelectedForWire) return '#f59e0b'; // Amber pulsing
    if (hovered) return '#60a5fa'; // Bright blue
    if (pin.type === 'power') return '#ef4444'; // Red
    if (pin.type === 'ground') return '#374151'; // Dark
    if (pin.type === 'gpio') return '#10b981'; // Green
    return '#9ca3af'; // Silver
  };

  return (
    <group position={position}>
      {/* Visual terminal pin */}
      <mesh
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.15, 8]} />
        <meshStandardMaterial
          color={getPinColor()}
          metalness={0.8}
          roughness={0.2}
          emissive={isSelectedForWire || hovered ? getPinColor() : '#000000'}
          emissiveIntensity={isSelectedForWire ? 0.8 : hovered ? 0.4 : 0}
        />
      </mesh>

      {/* Larger invisible hit sphere for effortless clicking */}
      <mesh
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        visible={false}
      >
        <sphereGeometry args={[0.12, 8, 8]} />
      </mesh>

      {/* Tooltip on hover */}
      {hovered && (
        <Html distanceFactor={10} position={[0, 0.25, 0]} center pointerEvents="none">
          <div className="rounded bg-black/90 px-1.5 py-0.5 text-[10px] font-mono text-white shadow-lg border border-gray-700 whitespace-nowrap pointer-events-none z-50">
            <span className="font-semibold text-blue-400">{pin.name}</span>
            {pin.description && <span className="text-gray-400 ml-1">({pin.description})</span>}
          </div>
        </Html>
      )}
    </group>
  );
};
