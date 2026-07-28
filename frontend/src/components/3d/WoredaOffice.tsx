import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface WoredaOfficeProps {
  scene: THREE.Scene;
  position?: [number, number, number];
  scale?: number;
}

export function WoredaOffice({
  scene,
  position = [2, -1.5, -2],
  scale = 0.8,
}: WoredaOfficeProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!scene) return;

    const group = new THREE.Group();
    group.position.set(...position);
    group.scale.setScalar(scale);

    // Main building body
    const bodyGeometry = new THREE.BoxGeometry(1.2, 1.0, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4c5a9,
      roughness: 0.4,
      metalness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    group.add(body);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(0.8, 0.4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.6,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.2;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // Door
    const doorGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.05);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.2, 0.41);
    group.add(door);

    // Windows
    const windowGeometry = new THREE.BoxGeometry(0.12, 0.15, 0.02);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      emissive: 0x112233,
      emissiveIntensity: 0.3,
    });
    for (let x = -0.3; x <= 0.3; x += 0.3) {
      for (let y = 0.5; y <= 0.9; y += 0.3) {
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(x, y, 0.41);
        group.add(windowMesh);
        const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
        windowBack.position.set(x, y, -0.41);
        group.add(windowBack);
      }
    }

    // Flag pole
    const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(0.7, 0.7, 0);
    group.add(pole);

    // Ethiopian flag (small plane)
    const flagGeometry = new THREE.PlaneGeometry(0.2, 0.12);
    const flagCanvas = document.createElement("canvas");
    flagCanvas.width = 60;
    flagCanvas.height = 36;
    const ctx = flagCanvas.getContext("2d")!;
    ctx.fillStyle = "#009A44";
    ctx.fillRect(0, 0, 60, 12);
    ctx.fillStyle = "#FEDD00";
    ctx.fillRect(0, 12, 60, 12);
    ctx.fillStyle = "#EF3340";
    ctx.fillRect(0, 24, 60, 12);
    const flagTexture = new THREE.CanvasTexture(flagCanvas);
    const flagMaterial = new THREE.MeshBasicMaterial({ map: flagTexture, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    flag.position.set(0.8, 1.05, 0);
    flag.rotation.y = Math.PI / 4;
    group.add(flag);

    scene.add(group);
    groupRef.current = group;

    return () => {
      scene.remove(group);
      [bodyGeometry, roofGeometry, doorGeometry, windowGeometry, poleGeometry, flagGeometry].forEach(g => g.dispose());
      [bodyMaterial, roofMaterial, doorMaterial, windowMaterial, poleMaterial, flagMaterial].forEach(m => m.dispose());
      flagTexture.dispose();
    };
  }, [scene, position, scale]);

  return null;
}