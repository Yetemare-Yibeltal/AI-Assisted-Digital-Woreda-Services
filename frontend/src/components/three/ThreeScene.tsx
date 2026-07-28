import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { getThreeConfig, type ThreeSceneConfig } from "@/config/three.config";

interface ThreeSceneProps {
  config?: Partial<ThreeSceneConfig>;
  className?: string;
  children?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => React.ReactNode;
}

export function ThreeScene({ config: customConfig, className, children }: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = { ...getThreeConfig(), ...customConfig };

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    try {
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(config.backgroundColor);
      scene.fog = new THREE.FogExp2(config.backgroundColor, 0.0002);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        config.fov,
        width / height,
        config.near,
        config.far
      );
      camera.position.set(...config.cameraPosition);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      setReady(true);

      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(frameRef.current);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        scene.clear();
      };
    } catch (err) {
      console.error("Failed to initialize Three.js scene:", err);
      setError("3D scene could not be loaded");
    }
  }, [config]);

  useEffect(() => {
    const cleanup = initScene();
    return () => cleanup?.();
  }, [initScene]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (error) {
    return (
      <div className="three-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`three-container ${className || ""}`}>
      {!ready && (
        <div className="three-loading">
          <div className="three-loading-spinner" />
          <p>Loading...</p>
        </div>
      )}
      {ready && sceneRef.current && cameraRef.current && rendererRef.current && children
        ? children(sceneRef.current, cameraRef.current, rendererRef.current)
        : null}
    </div>
  );
}