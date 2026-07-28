import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface DocumentStackProps {
  scene: THREE.Scene;
  position?: [number, number, number];
  count?: number;
}

export function DocumentStack({
  scene,
  position = [-1.5, -0.5, -1],
  count = 5,
}: DocumentStackProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!scene) return;

    const group = new THREE.Group();
    group.position.set(...position);

    const paperGeometry = new THREE.BoxGeometry(0.6, 0.02, 0.8);
    const colors = [0xffffff, 0xf5f5dc, 0xfaf0e6, 0xfff8dc, 0xfffdd0];

    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.7,
      });
      const paper = new THREE.Mesh(paperGeometry, material);
      paper.position.y = i * 0.025;
      paper.rotation.x = (Math.random() - 0.5) * 0.1;
      paper.rotation.z = (Math.random() - 0.5) * 0.1;
      paper.castShadow = true;
      group.add(paper);
    }

    // Top document with Ethiopian seal
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
    });
    const topPaper = new THREE.Mesh(paperGeometry, topMaterial);
    topPaper.position.y = count * 0.025;
    group.add(topPaper);

    scene.add(group);
    groupRef.current = group;

    return () => {
      scene.remove(group);
      paperGeometry.dispose();
    };
  }, [scene, position, count]);

  return null;
}