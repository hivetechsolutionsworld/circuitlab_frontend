'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PlacedComponent, generateBreadboardHoles } from '@circuitlab/shared';
import { useEditorStore } from '../../stores/editorStore';
import { getPinWorldPosition } from '../../lib/coords';
import { PinMarker } from './PinMarker';

interface BreadboardModelProps {
  component: PlacedComponent;
  isSelected: boolean;
}

export const BreadboardModel: React.FC<BreadboardModelProps> = ({ component, isSelected }) => {
  const selectComponent = useEditorStore((s) => s.selectComponent);

  const { pins } = useMemo(() => generateBreadboardHoles({ rows: 30, pitch: 0.25 }), []);

  const handleClick = (e: any) => {
    e.stopPropagation();
    const activeDraft = useEditorStore.getState().activeWireDraft;
    if (activeDraft) {
      // Intelligently connect to the breadboard hole nearest to the click point
      if (e.point) {
        const clickVec = new THREE.Vector3(e.point.x, e.point.y, e.point.z);
        let closestPin = pins[0];
        let minDistance = Infinity;

        for (const pin of pins) {
          const pinWorld = getPinWorldPosition(component.position, component.rotation, pin.position);
          const dist = clickVec.distanceTo(new THREE.Vector3(...pinWorld));
          if (dist < minDistance) {
            minDistance = dist;
            closestPin = pin;
          }
        }

        if (closestPin) {
          useEditorStore.getState().completeWireDraft(component.id, closestPin.id);
        }
      }
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
      {/* Selection Highlight */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.2, 8.4]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
        </mesh>
      )}

      {/* Main Breadboard ABS Plastic Base */}
      <mesh
        position={[0, 0, 0]}
        receiveShadow
        castShadow
        onPointerMove={(e) => {
          if (useEditorStore.getState().activeWireDraft) {
            e.stopPropagation();
            useEditorStore.getState().setActiveWireDraftPoint([e.point.x, e.point.y + 0.05, e.point.z]);
          }
        }}
      >
        <boxGeometry args={[4.8, 0.2, 7.8]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.05} />
      </mesh>

      {/* Center Trench Divider */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.3, 0.1, 7.6]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>

      {/* Left Power Rail Red Line (+) */}
      <mesh position={[-1.8, 0.101, 0]}>
        <boxGeometry args={[0.04, 0.002, 7.4]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Left Power Rail Blue Line (-) */}
      <mesh position={[-2.2, 0.101, 0]}>
        <boxGeometry args={[0.04, 0.002, 7.4]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Right Power Rail Red Line (+) */}
      <mesh position={[1.8, 0.101, 0]}>
        <boxGeometry args={[0.04, 0.002, 7.4]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Right Power Rail Blue Line (-) */}
      <mesh position={[2.2, 0.101, 0]}>
        <boxGeometry args={[0.04, 0.002, 7.4]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* All Breadboard Holes as Pin Markers */}
      {pins.map((pin) => (
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
