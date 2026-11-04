'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { ViewportControls } from './ViewportControls';
import { useEditorStore } from '../../stores/editorStore';

export const CircuitCanvas: React.FC = () => {
  const cameraState = useEditorStore((s) => s.project.camera);

  return (
    <div className="relative h-full w-full select-none bg-background">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{
          position: cameraState?.position || [0, 10, 14],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: false }}
        className="h-full w-full"
      >
        <color attach="background" args={['#0c101a']} />
        <Scene />
      </Canvas>

      {/* Floating Viewport and Camera Controls Overlay */}
      <ViewportControls />
    </div>
  );
};
