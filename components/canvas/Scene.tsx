'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEditorStore } from '../../stores/editorStore';
import { ESP32Model } from '../models/ESP32Model';
import { LEDModel } from '../models/LEDModel';
import { ResistorModel } from '../models/ResistorModel';
import { PushButtonModel } from '../models/PushButtonModel';
import { DHT22Model } from '../models/DHT22Model';
import { BreadboardModel } from '../models/BreadboardModel';
import { OLEDModel } from '../models/OLEDModel';
import { PowerSupplyModel } from '../models/PowerSupplyModel';
import { WireRenderer } from './WireRenderer';
import { GridPlane } from './GridPlane';
import { CameraController } from './CameraController';
import { DraggableComponent } from './DraggableComponent';

/**
 * Mathematically tracks cursor position in world space on the component plane
 * WITHOUT rendering any 3D meshes that would intercept or block pin clicks!
 */
const ActiveWirePointerTracker: React.FC = () => {
  const activeWireDraft = useEditorStore((s) => s.activeWireDraft);
  const setActiveWireDraftPoint = useEditorStore((s) => s.setActiveWireDraftPoint);
  const { raycaster } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.2), []);
  const intersectPoint = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!activeWireDraft) return;
    if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
      setActiveWireDraftPoint([intersectPoint.x, intersectPoint.y + 0.05, intersectPoint.z]);
    }
  });

  return null;
};

export const Scene: React.FC = () => {
  const components = useEditorStore((s) => s.project.components);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);

  return (
    <>
      {/* Camera Controls */}
      <CameraController />

      {/* Lighting Setup */}
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-10, 12, -10]} intensity={0.5} />
      <directionalLight position={[0, -10, 0]} intensity={0.2} />

      {/* Grid Floor */}
      <GridPlane />

      {/* Cursor tracking for live wire spline (pure math, no blocking mesh) */}
      <ActiveWirePointerTracker />

      {/* 3D Component Models with Interactive Dragging */}
      <group>
        {components.map((comp) => {
          const isSelected = selectedComponentId === comp.id;
          let modelNode = null;
          switch (comp.type) {
            case 'esp32':
              modelNode = <ESP32Model component={comp} isSelected={isSelected} />;
              break;
            case 'led':
              modelNode = <LEDModel component={comp} isSelected={isSelected} />;
              break;
            case 'resistor':
              modelNode = <ResistorModel component={comp} isSelected={isSelected} />;
              break;
            case 'push_button':
              modelNode = <PushButtonModel component={comp} isSelected={isSelected} />;
              break;
            case 'dht22':
              modelNode = <DHT22Model component={comp} isSelected={isSelected} />;
              break;
            case 'breadboard':
              modelNode = <BreadboardModel component={comp} isSelected={isSelected} />;
              break;
            case 'oled':
              modelNode = <OLEDModel component={comp} isSelected={isSelected} />;
              break;
            case 'power_supply':
              modelNode = <PowerSupplyModel component={comp} isSelected={isSelected} />;
              break;
            default:
              modelNode = null;
          }

          return (
            <DraggableComponent key={comp.id} component={comp}>
              {modelNode}
            </DraggableComponent>
          );
        })}
      </group>

      {/* Active and Existing Wires */}
      <WireRenderer />
    </>
  );
};
