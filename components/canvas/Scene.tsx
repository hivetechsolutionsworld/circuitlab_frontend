'use client';

import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { ESP32Model } from '../models/ESP32Model';
import { LEDModel } from '../models/LEDModel';
import { ResistorModel } from '../models/ResistorModel';
import { PushButtonModel } from '../models/PushButtonModel';
import { DHT22Model } from '../models/DHT22Model';
import { BreadboardModel } from '../models/BreadboardModel';
import { WireRenderer } from './WireRenderer';
import { GridPlane } from './GridPlane';
import { CameraController } from './CameraController';

export const Scene: React.FC = () => {
  const components = useEditorStore((s) => s.project.components);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);

  return (
    <>
      {/* Camera Controls */}
      <CameraController />

      {/* Lighting Setup */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.4} />

      {/* Grid Floor */}
      <GridPlane />

      {/* 3D Component Models */}
      <group>
        {components.map((comp) => {
          const isSelected = selectedComponentId === comp.id;
          switch (comp.type) {
            case 'esp32':
              return <ESP32Model key={comp.id} component={comp} isSelected={isSelected} />;
            case 'led':
              return <LEDModel key={comp.id} component={comp} isSelected={isSelected} />;
            case 'resistor':
              return <ResistorModel key={comp.id} component={comp} isSelected={isSelected} />;
            case 'push_button':
              return <PushButtonModel key={comp.id} component={comp} isSelected={isSelected} />;
            case 'dht22':
              return <DHT22Model key={comp.id} component={comp} isSelected={isSelected} />;
            case 'breadboard':
              return <BreadboardModel key={comp.id} component={comp} isSelected={isSelected} />;
            default:
              return null;
          }
        })}
      </group>

      {/* Wires */}
      <WireRenderer />
    </>
  );
};
