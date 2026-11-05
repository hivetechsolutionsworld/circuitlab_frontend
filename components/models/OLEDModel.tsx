'use client';

import React from 'react';
import { PlacedComponent, COMPONENT_METADATA } from '@circuitlab/shared';
import { useEditorStore } from '../../stores/editorStore';
import { PinMarker } from './PinMarker';

interface OLEDModelProps {
  component: PlacedComponent;
  isSelected: boolean;
}

export const OLEDModel: React.FC<OLEDModelProps> = ({ component, isSelected }) => {
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const simulationStatus = useEditorStore((s) => s.simulationStatus);
  const simState = useEditorStore((s) => s.componentSimStates[component.id]);
  const meta = COMPONENT_METADATA.oled;

  const isSimActive = simulationStatus === 'running' || !!simState?.active;

  const handleClick = (e: any) => {
    e.stopPropagation();
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
          <ringGeometry args={[1.6, 1.8, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Main PCB Substrate (Blue) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.08, 2.8]} />
        <meshStandardMaterial
          color={isSelected ? '#2563eb' : '#1e3a8a'}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* OLED Glass Frame & Screen */}
      <mesh position={[0, 0.08, -0.2]} castShadow>
        <boxGeometry args={[2.4, 0.06, 1.6]} />
        <meshStandardMaterial
          color={isSimActive ? '#0284c7' : '#030712'}
          emissive={isSimActive ? '#0284c7' : '#000000'}
          emissiveIntensity={isSimActive ? 0.6 : 0}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Inner Screen Display Pixel Matrix */}
      <mesh position={[0, 0.12, -0.2]}>
        <boxGeometry args={[2.1, 0.01, 1.3]} />
        <meshStandardMaterial
          color={isSimActive ? '#38bdf8' : '#0f172a'}
          emissive={isSimActive ? '#38bdf8' : '#000000'}
          emissiveIntensity={isSimActive ? 0.9 : 0}
          roughness={0.1}
        />
      </mesh>

      {/* 4 Pin Header Plastic Housing */}
      <mesh position={[0, 0.1, 1.2]}>
        <boxGeometry args={[1.6, 0.15, 0.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* 4 Interactive Pins */}
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
