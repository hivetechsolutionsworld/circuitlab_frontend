'use client';

import React from 'react';
import { PlacedComponent, COMPONENT_METADATA } from '@circuitlab/shared';
import { useEditorStore } from '../../stores/editorStore';
import { PinMarker } from './PinMarker';

interface LEDModelProps {
  component: PlacedComponent;
  isSelected: boolean;
}

const LED_HEX_COLORS: Record<string, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
  white: '#f8fafc',
};

export const LEDModel: React.FC<LEDModelProps> = ({ component, isSelected }) => {
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const simState = useEditorStore((s) => s.componentSimStates[component.id]);
  const meta = COMPONENT_METADATA.led;

  const colorKey = (component.properties as any)?.color || 'red';
  const baseColor = LED_HEX_COLORS[colorKey] || '#ef4444';
  const isLit = !!simState?.lit;

  const handleClick = (e: any) => {
    e.stopPropagation();
    const state = useEditorStore.getState();
    if (Date.now() - state.lastWireActionAt < 400) return;

    if (state.activeWireDraft) {
      state.completeWireDraftToComponent(component.id, [e.point.x, e.point.y, e.point.z]);
      return;
    }
    if (state.currentTool === 'wire') {
      state.startWireDraftFromComponent(component.id, [e.point.x, e.point.y, e.point.z]);
      return;
    }
    selectComponent(component.id);
  };

  return (
    <group
      position={component.position}
      rotation={component.rotation}
      onClick={handleClick}
      onPointerDown={(e) => {
        if (useEditorStore.getState().activeWireDraft || useEditorStore.getState().currentTool === 'wire') {
          e.stopPropagation();
        }
      }}
    >
      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <ringGeometry args={[0.5, 0.6, 24]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Point Light emitted when lit */}
      {isLit && (
        <pointLight
          position={[0, 0.4, 0]}
          color={baseColor}
          intensity={1.8}
          distance={4}
          decay={2}
        />
      )}

      {/* LED Lens Dome (Hemisphere) */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.25, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={isLit ? 0.95 : 0.75}
          emissive={isLit ? baseColor : '#000000'}
          emissiveIntensity={isLit ? 2.5 : 0}
        />
      </mesh>

      {/* LED Cylinder Body */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.4, 24]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={isLit ? 0.95 : 0.75}
          emissive={isLit ? baseColor : '#000000'}
          emissiveIntensity={isLit ? 2.0 : 0}
        />
      </mesh>

      {/* LED Bottom Rim Collar */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 24]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.2}
          emissive={isLit ? baseColor : '#000000'}
          emissiveIntensity={isLit ? 1.0 : 0}
        />
      </mesh>

      {/* Anode Metal Lead (Longer) */}
      <mesh position={[-0.15, -0.25, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Cathode Metal Lead (Shorter) */}
      <mesh position={[0.15, -0.22, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.34, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Pin Markers */}
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
