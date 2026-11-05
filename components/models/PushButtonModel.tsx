'use client';

import React from 'react';
import { PlacedComponent, COMPONENT_METADATA } from '@circuitlab/shared';
import { useEditorStore } from '../../stores/editorStore';
import { PinMarker } from './PinMarker';

interface PushButtonModelProps {
  component: PlacedComponent;
  isSelected: boolean;
}

export const PushButtonModel: React.FC<PushButtonModelProps> = ({ component, isSelected }) => {
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const setButtonState = useEditorStore((s) => s.setButtonState);
  const simState = useEditorStore((s) => s.componentSimStates[component.id]);
  const meta = COMPONENT_METADATA.push_button;

  const isPressed = !!simState?.pressed;

  const handleBodyClick = (e: any) => {
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

  const handlePlungerClick = (e: any) => {
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
    // Toggle momentary press
    setButtonState(component.id, !isPressed);
  };

  return (
    <group
      position={component.position}
      rotation={component.rotation}
      onClick={handleBodyClick}
      onPointerDown={(e) => {
        if (useEditorStore.getState().activeWireDraft || useEditorStore.getState().currentTool === 'wire') {
          e.stopPropagation();
        }
      }}
    >
      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <ringGeometry args={[0.65, 0.75, 24]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Main Square Plastic Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.25, 0.7]} />
        <meshStandardMaterial color="#27272a" roughness={0.7} />
      </mesh>

      {/* Metal Top Plate */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.62, 0.02, 0.62]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Push Button Plunger (Depresses downward when pressed) */}
      <mesh
        position={[0, isPressed ? 0.18 : 0.26, 0]}
        onClick={handlePlungerClick}
        castShadow
      >
        <cylinderGeometry args={[0.18, 0.18, 0.16, 20]} />
        <meshStandardMaterial
          color={isPressed ? '#f97316' : '#ef4444'}
          roughness={0.3}
          emissive={isPressed ? '#f97316' : '#000000'}
          emissiveIntensity={isPressed ? 0.5 : 0}
        />
      </mesh>

      {/* Terminal Pins */}
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
