import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface EthiopiaMapProps {
  scene: THREE.Scene;
  position?: [number, number, number];
  scale?: number;
  highlightRegion?: boolean;
}

export function EthiopiaMap({
  scene,
  position = [0, -1, -1],
  scale = 1.5,
  highlightRegion = true,
}: EthiopiaMapProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!scene) return;

    const group = new THREE.Group();
    group.position.set(...position);
    group.scale.setScalar(scale);

    // Simplified Ethiopia outline using a path
    const shape = new THREE.Shape();
    const outline: [number, number][] = [
      [0, 1.2], [0.5, 1.3], [1.0, 1.1], [1.4, 0.8], [1.6, 0.4],
      [1.5, 0], [1.3, -0.4], [1.0, -0.7], [0.6, -0.9], [0.2, -1.0],
      [-0.2, -0.9], [-0.5, -0.6], [-0.7, -0.2], [-0.8, 0.2],
      [-0.6, 0.6], [-0.3, 1.0], [0, 1.2],
    ];
    shape.moveTo(outline[0][0], outline[0][1]);
    outline.slice(1).forEach(([x, y]) => shape.lineTo(x, y));

    const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a5632,
      roughness: 0.5,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const mapMesh = new THREE.Mesh(geometry, material);
    group.add(mapMesh);

    // Highlight Amhara region (north-west)
    if (highlightRegion) {
      const regionMarker = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xfedd00, emissive: 0xfedd00, emissiveIntensity: 0.8 })
      );
      regionMarker.position.set(-0.3, 0.7, 0.06);
      group.add(regionMarker);

      // Pulse ring
      const ringGeometry = new THREE.TorusGeometry(0.08, 0.01, 16, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xfedd00, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(regionMarker.position);
      group.add(ring);
      ring.userData = { pulse: true };
    }

    // Wireframe outline
    const wireframeGeometry = new THREE.EdgesGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x00c853, transparent: true, opacity: 0.3 });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    group.add(wireframe);

    scene.add(group);
    groupRef.current = group;

    return () => {
      scene.remove(group);
      geometry.dispose();
      material.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
    };
  }, [scene, position, scale, highlightRegion]);

  return null;
}