import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { getThreeConfig, type ThreeSceneConfig } from "@/config/three.config";

interface ParticleFieldProps {
  scene: THREE.Scene;
  config?: Partial<ThreeSceneConfig>;
  mouseRef?: React.RefObject<{ x: number; y: number }>;
  density?: number;
  spread?: number;
  verticalSpread?: number;
  depthSpread?: number;
}

export function ParticleField({
  scene,
  config: customConfig,
  mouseRef,
  density = 1,
  spread = 15,
  verticalSpread = 10,
  depthSpread = 8,
}: ParticleFieldProps) {
  const config = { ...getThreeConfig(), ...customConfig };
  const particlesRef = useRef<THREE.Points | null>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const frameRef = useRef<number>(0);

  const particleCount = useMemo(
    () => Math.floor(config.particleCount * density),
    [config.particleCount, density]
  );

  useEffect(() => {
    if (!scene) return;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const colorGreen = new THREE.Color(config.particleColor || "#009A44");
    const colorYellow = new THREE.Color(config.secondaryColor || "#FEDD00");
    const colorRed = new THREE.Color(config.accentColor || "#EF3340");
    const colorWhite = new THREE.Color("#ffffff");

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * verticalSpread;
      positions[i3 + 2] = (Math.random() - 0.5) * depthSpread;

      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

      const mix = Math.random();
      let color: THREE.Color;
      if (mix < 0.6) {
        color = colorGreen.clone().lerp(colorYellow, mix / 0.6);
      } else if (mix < 0.85) {
        color = colorYellow.clone().lerp(colorRed, (mix - 0.6) / 0.25);
      } else if (mix < 0.95) {
        color = colorRed.clone().lerp(colorWhite, (mix - 0.85) / 0.1);
      } else {
        color = colorWhite;
      }

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * (config.particleSize || 0.03) * 3 + 0.005;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 32;
    textureCanvas.height = 32;
    const ctx = textureCanvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(textureCanvas);

    const material = new THREE.PointsMaterial({
      size: config.particleSize || 0.03,
      map: texture,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: config.opacity || 0.6,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;
    velocitiesRef.current = velocities;

    const clock = new THREE.Clock();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.elapsedTime;
      const positionsArray = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        positionsArray[i3] += velocities[i3] * delta * 10;
        positionsArray[i3 + 1] += velocities[i3 + 1] * delta * 10;
        positionsArray[i3 + 2] += velocities[i3 + 2] * delta * 5;

        if (positionsArray[i3] > spread / 2) positionsArray[i3] = -spread / 2;
        if (positionsArray[i3] < -spread / 2) positionsArray[i3] = spread / 2;
        if (positionsArray[i3 + 1] > verticalSpread / 2) positionsArray[i3 + 1] = -verticalSpread / 2;
        if (positionsArray[i3 + 1] < -verticalSpread / 2) positionsArray[i3 + 1] = verticalSpread / 2;
        if (positionsArray[i3 + 2] > depthSpread / 2) positionsArray[i3 + 2] = -depthSpread / 2;
        if (positionsArray[i3 + 2] < -depthSpread / 2) positionsArray[i3 + 2] = depthSpread / 2;

        if (mouseRef?.current && config.enableInteraction) {
          const dx = positionsArray[i3] - mouseRef.current.x * 2;
          const dy = positionsArray[i3 + 1] - mouseRef.current.y * 1.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 2) {
            positionsArray[i3] += dx * delta * 0.5;
            positionsArray[i3 + 1] += dy * delta * 0.5;
          }
        }
      }

      geometry.attributes.position.needsUpdate = true;

      if (config.enableRotation) {
        particles.rotation.y += delta * (config.speed || 0.2) * 0.1;
        particles.rotation.x += delta * (config.speed || 0.2) * 0.03;
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      scene.remove(particles);
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [scene, particleCount, config, spread, verticalSpread, depthSpread, mouseRef]);

  return null;
}

export default ParticleField;