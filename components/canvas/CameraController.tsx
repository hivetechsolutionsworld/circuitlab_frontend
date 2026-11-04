'use client';

import React, { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useEditorStore } from '../../stores/editorStore';

export const CameraController: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const isDraggingComponent = useEditorStore((s) => s.isDraggingComponent);
  const cameraViewPreset = useEditorStore((s) => s.cameraViewPreset);

  useEffect(() => {
    if (!controlsRef.current) return;
    if (cameraViewPreset === 'top') {
      camera.position.set(0, 22, 0.001);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    } else if (cameraViewPreset === 'front') {
      camera.position.set(0, 4, 18);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    } else if (cameraViewPreset === '3d') {
      camera.position.set(0, 10, 14);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [cameraViewPreset, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!isDraggingComponent}
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2 - 0.01} // don't go below floor
    />
  );
};
