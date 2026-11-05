'use client';

import React from 'react';
import { useEditorStore } from '../../stores/editorStore';

export const GridPlane: React.FC = () => {
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const selectWire = useEditorStore((s) => s.selectWire);
  const cancelWireDraft = useEditorStore((s) => s.cancelWireDraft);
  const activeWireDraft = useEditorStore((s) => s.activeWireDraft);
  const setActiveWireDraftPoint = useEditorStore((s) => s.setActiveWireDraftPoint);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (Date.now() - useEditorStore.getState().lastWireActionAt < 400) {
      return;
    }
    // If user clicked the empty grid
    if (activeWireDraft) {
      cancelWireDraft();
      setActiveWireDraftPoint(null);
    }
    selectComponent(null);
    selectWire(null);
  };

  const handlePointerMove = (e: any) => {
    if (activeWireDraft) {
      e.stopPropagation();
      setActiveWireDraftPoint([e.point.x, e.point.y + 0.1, e.point.z]);
    }
  };

  return (
    <group position={[0, -0.01, 0]}>
      {/* Visual Engineering Grid */}
      <gridHelper args={[40, 80, '#3b82f6', '#1a2234']} />

      {/* Invisible plane to intercept raycasts on floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
};
