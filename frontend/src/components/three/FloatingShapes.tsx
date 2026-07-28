import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { getThreeConfig, type ThreeSceneConfig } from "@/config/three.config";

interface FloatingShapesProps {
  scene: THREE.Scene;
  config?: Partial<ThreeSceneConfig>;
  count?: number;
  spread?: number;
  verticalSpread?: number;
  depthSpread?: number;
  minSize?: number;
  maxSize?: number;
}

export function FloatingShapes({
  scene,
  config: customConfig,
  count = 8,
  spread = 12,
  verticalSpread = 8,
  depthSpread = 6,
  minSize = 0.15,
  maxSize = 0.4,
}: FloatingShapesProps) {
  const config = { ...getThreeConfig(), ...customConfig };
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const frameRef = useRef<number>(0);

  const geometries = useMemo(
    () => [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TorusKnotGeometry(0.7, 0.15, 64, 8, 2, 3),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.DodecahedronGeometry(1, 0),
      new THREE.TorusGeometry(0.8, 0.2, 16, 32),
      new THREE.ConeGeometry(0.7, 1.2, 8, 1),
      new THREE.SphereGeometry(0.8, 16, 12),
    ],
    []
  );

  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({
        color: config.particleColor || "#009A44",
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.18,
        emissive: config.particleColor || "#009A44",
        emissiveIntensity: 0.25,
        wireframe: false,
      }),
      new THREE.MeshStandardMaterial({
        color: config.secondaryColor || "#FEDD00",
        roughness: 0.3,
        metalness: 0.15,
        transparent: true,
        opacity: 0.15,
        emissive: config.secondaryColor || "#FEDD00",
        emissiveIntensity: 0.2,
        wireframe: false,
      }),
      new THREE.MeshStandardMaterial({
        color: config.accentColor || "#EF3340",
        roughness: 0.35,
        metalness: 0.05,
        transparent: true,
        opacity: 0.12,
        emissive: config.accentColor || "#EF3340",
        emissiveIntensity: 0.2,
        wireframe: false,
      }),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.4,
        metalness: 0.2,
        transparent: true,
        opacity: 0.08,
        emissive: "#ffffff",
        emissiveIntensity: 0.1,
        wireframe: true,
      }),
    ],
    [config]
  );

  useEffect(() => {
    if (!scene) return;

    const meshes: THREE.Mesh[] = [];

    for (let i = 0; i < count; i++) {
      const geoIndex = i % geometries.length;
      const matIndex = i % materials.length;
      const geometry = geometries[geoIndex].clone();
      const material = materials[matIndex].clone();

      const scale = minSize + Math.random() * (maxSize - minSize);
      geometry.scale(scale, scale, scale);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * verticalSpread,
        (Math.random() - 0.5) * depthSpread - 2
      );
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.3,
          y: (Math.random() - 0.5) * 0.3,
          z: (Math.random() - 0.5) * 0.2,
        },
        floatAmplitude: 0.3 + Math.random() * 0.7,
        floatFrequency: 0.3 + Math.random() * 0.4,
        floatOffset: Math.random() * Math.PI * 2,
        initialY: mesh.position.y,
        driftX: (Math.random() - 0.5) * 0.05,
        driftZ: (Math.random() - 0.5) * 0.03,
      };

      scene.add(mesh);
      meshes.push(mesh);
    }

    meshesRef.current = meshes;

    const clock = new THREE.Clock();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.elapsedTime;

      for (const mesh of meshes) {
        const data = mesh.userData;
        mesh.rotation.x += data.rotationSpeed.x * delta;
        mesh.rotation.y += data.rotationSpeed.y * delta;
        mesh.rotation.z += data.rotationSpeed.z * delta;

        mesh.position.y =
          data.initialY + Math.sin(time * data.floatFrequency + data.floatOffset) * data.floatAmplitude;
        mesh.position.x += data.driftX * delta;
        mesh.position.z += data.driftZ * delta;

        if (Math.abs(mesh.position.x) > spread / 2) data.driftX *= -1;
        if (Math.abs(mesh.position.z) > depthSpread / 2) data.driftZ *= -1;
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      for (const mesh of meshes) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      meshesRef.current = [];
    };
  }, [scene, count, geometries, materials, spread, verticalSpread, depthSpread, minSize, maxSize]);

  return null;
}

export default FloatingShapes;