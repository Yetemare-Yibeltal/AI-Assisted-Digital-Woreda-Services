import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { getThreeConfig, type ThreeSceneConfig } from "@/config/three.config";

interface LightingSetupProps {
  scene: THREE.Scene;
  config?: Partial<ThreeSceneConfig>;
  enableShadows?: boolean;
  shadowMapSize?: number;
}

export function LightingSetup({
  scene,
  config: customConfig,
  enableShadows = false,
  shadowMapSize = 1024,
}: LightingSetupProps) {
  const config = { ...getThreeConfig(), ...customConfig };
  const lightsRef = useRef<THREE.Light[]>([]);
  const helpersRef = useRef<THREE.Object3D[]>([]);

  useEffect(() => {
    if (!scene) return;

    const lights: THREE.Light[] = [];
    const helpers: THREE.Object3D[] = [];

    // Ambient light – subtle base illumination
    const ambientLight = new THREE.AmbientLight(0x404066, 0.6);
    scene.add(ambientLight);
    lights.push(ambientLight);

    // Key directional light (simulates sun)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = enableShadows;
    if (enableShadows) {
      keyLight.shadow.mapSize.width = shadowMapSize;
      keyLight.shadow.mapSize.height = shadowMapSize;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 50;
      keyLight.shadow.camera.left = -10;
      keyLight.shadow.camera.right = 10;
      keyLight.shadow.camera.top = 10;
      keyLight.shadow.camera.bottom = -10;
      keyLight.shadow.bias = -0.0001;
    }
    scene.add(keyLight);
    lights.push(keyLight);

    // Fill light (opposite side, softer)
    const fillLight = new THREE.DirectionalLight(0x8090c0, 0.3);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);
    lights.push(fillLight);

    // Rim light (behind, adds edge definition)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 0, -5);
    scene.add(rimLight);
    lights.push(rimLight);

    // Ethiopian-green accent point light
    const greenLight = new THREE.PointLight(
      config.particleColor || "#009A44",
      0.8,
      8,
      2
    );
    greenLight.position.set(3, 1.5, 2);
    scene.add(greenLight);
    lights.push(greenLight);

    // Ethiopian-gold accent point light
    const goldLight = new THREE.PointLight(
      config.secondaryColor || "#FEDD00",
      0.5,
      6,
      2
    );
    goldLight.position.set(-3, -1, -1);
    scene.add(goldLight);
    lights.push(goldLight);

    // Ethiopian-red subtle point light
    const redLight = new THREE.PointLight(
      config.accentColor || "#EF3340",
      0.3,
      5,
      2
    );
    redLight.position.set(0, -3, -2);
    scene.add(redLight);
    lights.push(redLight);

    // Hemisphere light for sky/ground gradient
    const hemisphereLight = new THREE.HemisphereLight(
      0x206030,
      0x101020,
      0.3
    );
    scene.add(hemisphereLight);
    lights.push(hemisphereLight);

    lightsRef.current = lights;

    // Show light helpers in development
    if (import.meta.env.DEV && false) {
      const keyHelper = new THREE.DirectionalLightHelper(keyLight, 0.5);
      scene.add(keyHelper);
      helpers.push(keyHelper);

      const greenHelper = new THREE.PointLightHelper(greenLight, 0.3);
      scene.add(greenHelper);
      helpers.push(greenHelper);

      const goldHelper = new THREE.PointLightHelper(goldLight, 0.3);
      scene.add(goldHelper);
      helpers.push(goldHelper);
    }

    helpersRef.current = helpers;

    return () => {
      for (const light of lights) {
        scene.remove(light);
        if ((light as any).dispose) (light as any).dispose();
      }
      for (const helper of helpers) {
        scene.remove(helper);
        if ((helper as any).dispose) (helper as any).dispose();
      }
      lightsRef.current = [];
      helpersRef.current = [];
    };
  }, [scene, config, enableShadows, shadowMapSize]);

  return null;
}

export default LightingSetup;