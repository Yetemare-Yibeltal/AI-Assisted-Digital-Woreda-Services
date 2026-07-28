import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface StampAnimationProps {
  scene: THREE.Scene;
  position?: [number, number, number];
  onComplete?: () => void;
  duration?: number;
}

export function StampAnimation({
  scene,
  position = [0, 0.5, 0],
  onComplete,
  duration = 1.5,
}: StampAnimationProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!scene) return;

    const group = new THREE.Group();
    group.position.set(...position);
    group.visible = true;

    // Stamp base
    const baseGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.15, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b0000,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x330000,
      emissiveIntensity: 0.3,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    group.add(base);

    // Handle
    const handleGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.5, 16);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a0000,
      roughness: 0.2,
      metalness: 0.5,
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0.3;
    group.add(handle);

    // Top knob
    const knobGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const knob = new THREE.Mesh(knobGeometry, handleMaterial);
    knob.position.y = 0.55;
    group.add(knob);

    // Text ring
    const ringGeometry = new THREE.TorusGeometry(0.3, 0.03, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x554400,
      emissiveIntensity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.08;
    group.add(ring);

    scene.add(group);
    groupRef.current = group;

    // Animation
    const startTime = Date.now();
    const startY = position[1];
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Stamp down and up
      if (progress < 0.3) {
        group.position.y = startY - progress * 1.5;
        group.scale.setScalar(1 + progress * 0.3);
      } else if (progress < 0.6) {
        const p = (progress - 0.3) / 0.3;
        group.position.y = startY - 0.45 + p * 0.45;
        group.scale.setScalar(1.09 - p * 0.09);
      } else {
        group.scale.setScalar(1);
        if (progress >= 1) {
          onComplete?.();
          return;
        }
      }

      group.rotation.z = Math.sin(progress * Math.PI * 2) * 0.1;
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      scene.remove(group);
      [baseGeometry, handleGeometry, knobGeometry, ringGeometry].forEach(g => g.dispose());
      [baseMaterial, handleMaterial, ringMaterial].forEach(m => m.dispose());
    };
  }, [scene, position, duration, onComplete]);

  return null;
}