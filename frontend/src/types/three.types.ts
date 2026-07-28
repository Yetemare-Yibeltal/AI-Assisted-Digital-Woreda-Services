export interface ThreeSceneConfig {
  particleCount: number;
  particleSize: number;
  particleColor: string;
  speed: number;
  opacity: number;
  enableInteraction: boolean;
}

export interface ThreeBackgroundProps {
  config?: Partial<ThreeSceneConfig>;
  className?: string;
  children?: React.ReactNode;
}

export const DEFAULT_THREE_CONFIG: ThreeSceneConfig = {
  particleCount: 150,
  particleSize: 0.02,
  particleColor: "#009A44",
  speed: 0.3,
  opacity: 0.6,
  enableInteraction: true,
};
