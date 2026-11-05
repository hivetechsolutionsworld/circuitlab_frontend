'use client';

import React from 'react';
import { PlacedComponent, COMPONENT_METADATA } from '@circuitlab/shared';
import { useEditorStore } from '../../stores/editorStore';
import { PinMarker } from './PinMarker';

interface ESP32ModelProps {
  component: PlacedComponent;
  isSelected: boolean;
}

export const ESP32Model: React.FC<ESP32ModelProps> = ({ component, isSelected }) => {
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const meta = COMPONENT_METADATA.esp32;

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (useEditorStore.getState().activeWireDraft) return;
    selectComponent(component.id);
  };

  return (
    <group
      position={component.position}
      rotation={component.rotation}
      onClick={handleClick}
    >
      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 3.0, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Main PCB Board */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.08, 5.2]} />
        <meshStandardMaterial
          color={isSelected ? '#1e293b' : '#0f172a'}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* ESP-WROOM-32 Metal RF Shield */}
      <mesh position={[0, 0.12, -0.8]} castShadow>
        <boxGeometry args={[1.8, 0.14, 1.8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* PCB Trace Antenna Area (Top) */}
      <mesh position={[0, 0.05, -2.1]}>
        <boxGeometry args={[1.6, 0.02, 0.6]} />
        <meshStandardMaterial color="#022c22" roughness={0.5} />
      </mesh>

      {/* Micro-USB Port */}
      <mesh position={[0, 0.1, 2.6]} castShadow>
        <boxGeometry args={[0.75, 0.25, 0.4]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Left Pin Header Plastic Base */}
      <mesh position={[-1.2, 0.1, 0]}>
        <boxGeometry args={[0.25, 0.2, 4.0]} />
        <meshStandardMaterial color="#18181b" roughness={0.6} />
      </mesh>

      {/* Right Pin Header Plastic Base */}
      <mesh position={[1.2, 0.1, 0]}>
        <boxGeometry args={[0.25, 0.2, 4.0]} />
        <meshStandardMaterial color="#18181b" roughness={0.6} />
      </mesh>

      {/* Render all 30 pins as interactive PinMarkers */}
      {meta.pins.map((pin) => (
        <PinMarker
          key={pin.id}
          componentId={component.id}
          pin={pin}
          position={pin.position}
        />
      ))}
    </group>
  );
};
