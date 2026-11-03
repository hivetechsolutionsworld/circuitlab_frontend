'use client';

import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { snapToGrid } from '../../lib/coords';

export const GridPlane: React.FC = () => {
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const selectWire = useEditorStore((s) => s.selectWire);
  const cancelWireDraft = useEditorStore((s) => s.cancelWireDraft);
  const activeWireDraft = useEditorStore((s) => s.activeWireDraft);

  const handlePointerDown = (e: any) => {
    // If user clicked the empty grid
    if (activeWireDraft) {
      cancelWireDraft();
    }
    selectComponent(null);
    selectWire(null);
  };

  return (
    <group position={[0, -0.01, 0]}>
      {/* Visual Engineering Grid */}
      <gridHelper args={[40, 80, '#334155', '#1e293b']} />

      {/* Invisible plane to intercept raycasts on floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        onPointerDown={handlePointerDown}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
};
