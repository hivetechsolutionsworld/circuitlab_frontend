'use client';

import React, { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PlacedComponent } from '@circuitlab/shared';
import { useEditorStore } from '../../stores/editorStore';

interface DraggableComponentProps {
  component: PlacedComponent;
  children: React.ReactNode;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({ component, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const selectedComponentId = useEditorStore((s) => s.selectedComponentId);
  const currentTool = useEditorStore((s) => s.currentTool);
  const activeWireDraft = useEditorStore((s) => s.activeWireDraft);
  const deleteComponent = useEditorStore((s) => s.deleteComponent);
  const isReadOnly = useEditorStore((s) => s.isReadOnly);
  const updateComponentPosition = useEditorStore((s) => s.updateComponentPosition);
  const setIsDraggingComponent = useEditorStore((s) => s.setIsDraggingComponent);
  const gridSnap = useEditorStore((s) => s.project.editorSettings.gridSnap);
  const gridSize = useEditorStore((s) => s.project.editorSettings.gridSize) || 0.5;

  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -component.position[1]));
  const planeIntersect = useRef(new THREE.Vector3());
  const offset = useRef(new THREE.Vector3());
  const initialPos = useRef<[number, number, number]>(component.position);
  const hasMoved = useRef(false);

  const isSelected = selectedComponentId === component.id;

  const handlePointerDown = (e: any) => {
    // Only drag in select tool mode, when not read-only, and NOT currently drafting a wire
    if (isReadOnly || activeWireDraft) return;

    if (currentTool === 'delete') {
      e.stopPropagation();
      deleteComponent(component.id);
      return;
    }

    if (currentTool !== 'select') return;

    e.stopPropagation();
    selectComponent(component.id);

    // Prepare horizontal plane at component height
    dragPlane.current.constant = -component.position[1];

    if (e.ray.intersectPlane(dragPlane.current, planeIntersect.current)) {
      offset.current.set(
        component.position[0] - planeIntersect.current.x,
        0,
        component.position[2] - planeIntersect.current.z
      );
    }

    initialPos.current = [...component.position];
    hasMoved.current = false;
    setIsDragging(true);
    setIsDraggingComponent(true);

    try {
      e.target?.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore if pointer capture isn't supported by target
    }
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || isReadOnly) return;
    e.stopPropagation();

    if (e.ray.intersectPlane(dragPlane.current, planeIntersect.current)) {
      let rawX = planeIntersect.current.x + offset.current.x;
      let rawZ = planeIntersect.current.z + offset.current.z;

      if (gridSnap) {
        rawX = Math.round(rawX / gridSize) * gridSize;
        rawZ = Math.round(rawZ / gridSize) * gridSize;
      }

      // Constrain within visible table boundary
      const clampedX = Math.max(-18, Math.min(18, rawX));
      const clampedZ = Math.max(-18, Math.min(18, rawZ));

      hasMoved.current = true;
      updateComponentPosition(component.id, [clampedX, component.position[1], clampedZ]);
    }
  };

  const handlePointerUp = (e: any) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    setIsDraggingComponent(false);

    try {
      e.target?.releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }

    if (hasMoved.current) {
      // Record undo state if moved
      const history = useEditorStore.getState().history;
      const project = useEditorStore.getState().project;
      history.record({
        components: project.components,
        wires: project.wires,
      });
      useEditorStore.setState({
        canUndo: history.canUndo(),
        canRedo: history.canRedo(),
      });
    }
  };

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {children}
    </group>
  );
};
