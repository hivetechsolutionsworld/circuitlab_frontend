'use client';

import React from 'react';
import { PlacedComponent, COMPONENT_METADATA } from '@circuitlab/shared';
import { useEditorStore } from '../../stores/editorStore';
import { PinMarker } from './PinMarker';

interface DHT22ModelProps {
  component: PlacedComponent;
  isSelected: boolean;
}

export const DHT22Model: React.FC<DHT22ModelProps> = ({ component, isSelected }) => {
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const simState = useEditorStore((s) => s.componentSimStates[component.id]);
  const meta = COMPONENT_METADATA.dht22;

  const isActive = !!simState?.active;

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (useEditorStore.getState().activeWireDraft) {
      useEditorStore.getState().completeWireDraftToComponent(component.id, [e.point.x, e.point.y, e.point.z]);
      return;
    }
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
        <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.15, 24]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Sensor White Plastic Housing */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[1.5, 1.8, 0.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>

      {/* Sensor Ventilation Grille Louvers (Horizontal slots) */}
      {[-0.3, -0.1, 0.1, 0.3, 0.5].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0.36]}>
          <boxGeometry args={[1.1, 0.06, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
      ))}

      {/* Sensor Active Status LED Indicator */}
      <mesh position={[0.45, 0.75, 0.36]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
        <meshStandardMaterial
          color={isActive ? '#10b981' : '#64748b'}
          emissive={isActive ? '#10b981' : '#000000'}
          emissiveIntensity={isActive ? 1.5 : 0}
        />
      </mesh>

      {/* Pins */}
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
