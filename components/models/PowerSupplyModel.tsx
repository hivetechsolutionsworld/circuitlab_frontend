'use client';

import React from 'react';
import { PlacedComponent, COMPONENT_METADATA } from '@circuitlab/shared';
import { useEditorStore } from '../../stores/editorStore';
import { PinMarker } from './PinMarker';

interface PowerSupplyModelProps {
  component: PlacedComponent;
  isSelected: boolean;
}

export const PowerSupplyModel: React.FC<PowerSupplyModelProps> = ({ component, isSelected }) => {
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const simulationStatus = useEditorStore((s) => s.simulationStatus);
  const meta = COMPONENT_METADATA.power_supply;

  const isPowerOn = simulationStatus === 'running';

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
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Main Module PCB (Black) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.1, 1.8]} />
        <meshStandardMaterial
          color={isSelected ? '#1e293b' : '#0f172a'}
          roughness={0.5}
        />
      </mesh>

      {/* DC Barrel Jack Connector */}
      <mesh position={[-1.1, 0.25, -0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.7, 16]} />
        <meshStandardMaterial color="#18181b" roughness={0.4} />
      </mesh>

      {/* Power Latch Push Switch (Red Button) */}
      <mesh position={[-0.2, 0.2, -0.4]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.4]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>

      {/* AMS1117 Linear Voltage Regulators */}
      <mesh position={[0.6, 0.12, -0.4]}>
        <boxGeometry args={[0.5, 0.1, 0.3]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Power Indicator LED (Green) */}
      <mesh position={[-0.6, 0.15, 0.4]}>
        <cylinderGeometry args={[0.1, 0.1, 0.15, 12]} />
        <meshStandardMaterial
          color={isPowerOn ? '#22c55e' : '#14532d'}
          emissive={isPowerOn ? '#22c55e' : '#000000'}
          emissiveIntensity={isPowerOn ? 0.8 : 0}
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
