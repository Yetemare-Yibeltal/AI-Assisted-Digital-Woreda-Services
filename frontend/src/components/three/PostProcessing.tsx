import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { getThreeConfig, type ThreeSceneConfig } from "@/config/three.config";

interface PostProcessingProps {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  config?: Partial<ThreeSceneConfig>;
  enabled?: boolean;
}

export function PostProcessing({
  scene,
  camera,
  renderer,
  config: customConfig,
  enabled = true,
}: PostProcessingProps) {
  const config = { ...getThreeConfig(), ...customConfig };
  const composerRef = useRef<{
    renderTargetA: THREE.WebGLRenderTarget;
    renderTargetB: THREE.WebGLRenderTarget;
    bloomMaterial: THREE.ShaderMaterial;
    finalMaterial: THREE.ShaderMaterial;
    quad: THREE.Mesh;
  } | null>(null);

  useEffect(() => {
    if (!enabled || !renderer || !scene || !camera) return;

    const width = renderer.domElement.width;
    const height = renderer.domElement.height;

    const renderTargetA = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    });

    const renderTargetB = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    });

    const bloomVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const bloomFragmentShader = `
      uniform sampler2D tDiffuse;
      uniform float uBloomStrength;
      uniform float uBloomRadius;
      uniform float uBloomThreshold;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        float contribution = max(0.0, brightness - uBloomThreshold);
        contribution *= uBloomStrength;
        vec3 bloom = color.rgb * contribution * uBloomRadius;
        gl_FragColor = vec4(bloom, 1.0);
      }
    `;

    const finalVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const finalFragmentShader = `
      uniform sampler2D tDiffuse;
      uniform sampler2D tBloom;
      varying vec2 vUv;
      void main() {
        vec4 sceneColor = texture2D(tDiffuse, vUv);
        vec4 bloomColor = texture2D(tBloom, vUv);
        gl_FragColor = sceneColor + bloomColor * 0.6;
      }
    `;

    const bloomMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uBloomStrength: { value: config.bloomStrength || 0.5 },
        uBloomRadius: { value: config.bloomRadius || 0.5 },
        uBloomThreshold: { value: config.bloomThreshold || 0.1 },
      },
      vertexShader: bloomVertexShader,
      fragmentShader: bloomFragmentShader,
    });

    const finalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tBloom: { value: null },
      },
      vertexShader: finalVertexShader,
      fragmentShader: finalFragmentShader,
    });

    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(quadGeometry, finalMaterial);

    const composer = {
      renderTargetA,
      renderTargetB,
      bloomMaterial,
      finalMaterial,
      quad,
    };

    composerRef.current = composer;

    const originalRender = renderer.render.bind(renderer);
    const scene2D = new THREE.Scene();
    const camera2D = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene2D.add(quad);

    renderer.render = (s: THREE.Scene, c: THREE.Camera) => {
      // Render scene to target A
      renderer.setRenderTarget(renderTargetA);
      originalRender(s, c);

      // Bloom pass
      bloomMaterial.uniforms.tDiffuse.value = renderTargetA.texture;
      quad.material = bloomMaterial;
      renderer.setRenderTarget(renderTargetB);
      renderer.render(scene2D, camera2D);

      // Final composite
      finalMaterial.uniforms.tDiffuse.value = renderTargetA.texture;
      finalMaterial.uniforms.tBloom.value = renderTargetB.texture;
      quad.material = finalMaterial;
      renderer.setRenderTarget(null);
      renderer.render(scene2D, camera2D);
    };

    return () => {
      renderer.render = originalRender;
      renderTargetA.dispose();
      renderTargetB.dispose();
      bloomMaterial.dispose();
      finalMaterial.dispose();
      quadGeometry.dispose();
      scene2D.clear();
      composerRef.current = null;
    };
  }, [enabled, renderer, scene, camera, config]);

  return null;
}

export default PostProcessing;