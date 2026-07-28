export interface ThreeSceneConfig {
  particleCount: number;
  particleSize: number;
  particleColor: string;
  secondaryColor: string;
  accentColor: string;
  speed: number;
  opacity: number;
  enableInteraction: boolean;
  enableRotation: boolean;
  cameraPosition: [number, number, number];
  fov: number;
  near: number;
  far: number;
  backgroundColor: string;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
}

export const defaultThreeConfig: ThreeSceneConfig = {
  particleCount: 200,
  particleSize: 0.03,
  particleColor: "#009A44",
  secondaryColor: "#FEDD00",
  accentColor: "#EF3340",
  speed: 0.2,
  opacity: 0.6,
  enableInteraction: true,
  enableRotation: true,
  cameraPosition: [0, 0, 5],
  fov: 75,
  near: 0.1,
  far: 1000,
  backgroundColor: "#060a08",
  bloomStrength: 0.5,
  bloomRadius: 0.5,
  bloomThreshold: 0.1,
};

export const lowPerformanceThreeConfig: ThreeSceneConfig = {
  ...defaultThreeConfig,
  particleCount: 80,
  particleSize: 0.05,
  speed: 0.1,
  enableInteraction: false,
  enableRotation: false,
  bloomStrength: 0,
};

export const getThreeConfig = (): ThreeSceneConfig => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isMobile = window.innerWidth < 768;
  const isLowPower =
    navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

  if (prefersReducedMotion || isLowPower) {
    return {
      ...lowPerformanceThreeConfig,
      particleCount: isMobile ? 30 : 60,
    };
  }

  if (isMobile) {
    return {
      ...defaultThreeConfig,
      particleCount: 100,
      speed: 0.15,
      enableInteraction: false,
    };
  }

  return defaultThreeConfig;
};
