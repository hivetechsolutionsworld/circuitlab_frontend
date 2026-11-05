'use client';

import React from 'react';
import { PlacedComponent, COMPONENT_METADATA, getResistorColorBands } from '@circuitlab/shared';
import { useEditorStore } from '../../stores/editorStore';
import { PinMarker } from './PinMarker';

interface ResistorModelProps {
  component: PlacedComponent;
  isSelected: boolean;
}

export const ResistorModel: React.FC<ResistorModelProps> = ({ component, isSelected }) => {
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const meta = COMPONENT_METADATA.resistor;

  const resistance = (component.properties as any)?.resistance ?? 220;
  const tolerance = (component.properties as any)?.tolerance ?? 5;
  const bands = getResistorColorBands(resistance, tolerance);

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
        <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <ringGeometry args={[0.9, 1.0, 24]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Main Ceramic Body */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.8, 20]} />
        <meshStandardMaterial color="#d4b996" roughness={0.5} />
      </mesh>

      {/* Resistor Color Bands */}
      {/* Band 1 */}
      <mesh position={[-0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.165, 0.165, 0.06, 20]} />
        <meshStandardMaterial color={bands.band1} roughness={0.3} />
      </mesh>

      {/* Band 2 */}
      <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.165, 0.165, 0.06, 20]} />
        <meshStandardMaterial color={bands.band2} roughness={0.3} />
      </mesh>

      {/* Multiplier Band */}
      <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.165, 0.165, 0.06, 20]} />
        <meshStandardMaterial color={bands.multiplier} roughness={0.3} />
      </mesh>

      {/* Tolerance Band (Gold / Silver) */}
      <mesh position={[0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.165, 0.165, 0.06, 20]} />
        <meshStandardMaterial color={bands.tolerance} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Lead 1 Metal Wire */}
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Lead 2 Metal Wire */}
      <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
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
