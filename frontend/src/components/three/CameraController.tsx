import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { getThreeConfig, type ThreeSceneConfig } from "@/config/three.config";

interface CameraControllerProps {
  camera: THREE.PerspectiveCamera;
  config?: Partial<ThreeSceneConfig>;
  enableParallax?: boolean;
  enableScroll?: boolean;
  parallaxStrength?: number;
  scrollStrength?: number;
  lerpFactor?: number;
}

export function CameraController({
  camera,
  config: customConfig,
  enableParallax = true,
  enableScroll = false,
  parallaxStrength = 0.5,
  scrollStrength = 0.3,
  lerpFactor = 0.05,
}: CameraControllerProps) {
  const config = { ...getThreeConfig(), ...customConfig };
  const targetPosition = useRef(new THREE.Vector3(...config.cameraPosition));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const frameRef = useRef<number>(0);
  const initialPosition = useRef(new THREE.Vector3(...config.cameraPosition));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    if (enableParallax) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }
    if (enableScroll) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [enableParallax, enableScroll]);

  useEffect(() => {
    if (!camera || !config.enableInteraction) return;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (enableParallax) {
        const offsetX = mouseRef.current.x * parallaxStrength;
        const offsetY = -mouseRef.current.y * parallaxStrength * 0.6;

        targetPosition.current.set(
          initialPosition.current.x + offsetX,
          initialPosition.current.y + offsetY,
          initialPosition.current.z
        );

        targetLookAt.current.set(offsetX * 0.3, offsetY * 0.3, 0);
      }

      if (enableScroll) {
        const scrollOffset = scrollRef.current * scrollStrength * 0.001;
        targetPosition.current.y += scrollOffset;
      }

      camera.position.lerp(targetPosition.current, lerpFactor);
      if (enableParallax) {
        const currentLookAt = new THREE.Vector3();
        camera.getWorldDirection(currentLookAt);
        const desiredLookAt = targetLookAt.current.clone();
        const lerpedLookAt = new THREE.Vector3().lerpVectors(
          camera.position.clone().add(currentLookAt),
          desiredLookAt,
          lerpFactor
        );
        camera.lookAt(lerpedLookAt);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [camera, config.enableInteraction, enableParallax, enableScroll, parallaxStrength, scrollStrength, lerpFactor]);

  return null;
}

export default CameraController;