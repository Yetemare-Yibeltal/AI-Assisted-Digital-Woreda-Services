import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export function useThree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    containerRef.current.appendChild(renderer.domElement);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    setReady(true);
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      renderer.dispose();
    };
  }, []);

  return {
    containerRef,
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    ready,
  };
}
