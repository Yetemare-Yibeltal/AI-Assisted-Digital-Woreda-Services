import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { ThreeScene } from "./ThreeScene";
import { getThreeConfig, type ThreeSceneConfig } from "@/config/three.config";

interface ThreeBackgroundProps {
  config?: Partial<ThreeSceneConfig>;
  className?: string;
  children?: React.ReactNode;
}

export function ThreeBackground({ config: customConfig, className, children }: ThreeBackgroundProps) {
  const config = { ...getThreeConfig(), ...customConfig };
  const particlesRef = useRef<THREE.Points | null>(null);
  const shapesRef = useRef<THREE.Mesh[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const setupScene = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, _renderer: THREE.WebGLRenderer) => {
    // Particle system
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = config.particleCount;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const colorGreen = new THREE.Color(config.particleColor);
    const colorYellow = new THREE.Color(config.secondaryColor);
    const colorRed = new THREE.Color(config.accentColor);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 15;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 8;

      const mix = Math.random();
      let color: THREE.Color;
      if (mix < 0.6) color = colorGreen.clone().lerp(colorYellow, mix / 0.6);
      else if (mix < 0.9) color = colorYellow.clone().lerp(colorRed, (mix - 0.6) / 0.3);
      else color = colorRed;

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * config.particleSize * 2 + 0.01;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: config.particleSize,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: config.opacity,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Floating shapes
    const shapeGeometries = [
      new THREE.IcosahedronGeometry(0.3, 0),
      new THREE.OctahedronGeometry(0.25, 0),
      new THREE.TorusGeometry(0.2, 0.05, 8, 12),
      new THREE.TetrahedronGeometry(0.22, 0),
    ];

    const shapeMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const geo = shapeGeometries[i % shapeGeometries.length];
      const mat = new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? config.particleColor : i % 3 === 1 ? config.secondaryColor : config.accentColor,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0.15,
        emissive: i % 3 === 0 ? config.particleColor : i % 3 === 1 ? config.secondaryColor : config.accentColor,
        emissiveIntensity: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 2
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.userData = {
        speed: 0.2 + Math.random() * 0.3,
        axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        floatOffset: Math.random() * Math.PI * 2,
        initialY: mesh.position.y,
      };
      scene.add(mesh);
      shapeMeshes.push(mesh);
    }
    shapesRef.current = shapeMeshes;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(1, 2, 3);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(config.particleColor, 0.5, 5);
    pointLight1.position.set(3, 1, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(config.secondaryColor, 0.3, 4);
    pointLight2.position.set(-3, -1, -1);
    scene.add(pointLight2);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.elapsedTime;

      // Smooth mouse follow
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.02;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.02;

      if (config.enableInteraction) {
        camera.position.x += (mouseRef.current.x * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (-mouseRef.current.y * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
      }

      if (config.enableRotation) {
        particles.rotation.y += delta * config.speed * 0.1;
        particles.rotation.x += delta * config.speed * 0.05;
      }

      shapeMeshes.forEach((mesh, i) => {
        const data = mesh.userData;
        mesh.rotation.x += delta * data.speed * 0.5;
        mesh.rotation.y += delta * data.speed * 0.3;
        mesh.position.y = data.initialY + Math.sin(time * 0.5 + data.floatOffset) * 0.5;
        mesh.position.x += Math.sin(time * 0.3 + i) * delta * 0.1;
      });

      requestAnimationFrame(animate);
    };
    animate();
  };

  return (
    <ThreeScene config={config} className={className}>
      {(scene, camera, renderer) => {
        setupScene(scene, camera, renderer);
        return null;
      }}
    </ThreeScene>
  );
}

export default ThreeBackground;