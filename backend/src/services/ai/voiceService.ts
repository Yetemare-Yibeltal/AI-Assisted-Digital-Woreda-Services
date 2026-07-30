interface VoiceProcessResult {
  transcript: string;
  confidence: number;
  language: string;
  duration: number;
}

export const processVoice = async (
  audioBuffer: Buffer,
  language: string
): Promise<VoiceProcessResult> => {
  // In production, integrate with Google Speech-to-Text or similar
  return {
    transcript: "[Voice transcription requires STT service integration]",
    confidence: 0,
    language: language || "en",
    duration: 0,
  };
};

export const isVoiceSupported = (language: string): boolean => {
  const supported = ["en", "am"];
  return supported.includes(language);
};

export default { processVoice, isVoiceSupported };
