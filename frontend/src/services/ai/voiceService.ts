export function isVoiceSupported(): boolean {
  return !!(
    window.SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

export function isSpeechSynthesisSupported(): boolean {
  return "speechSynthesis" in window;
}

export function speakText(text: string, language: "en" | "am" = "en") {
  return new Promise<void>((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "am" ? "am-ET" : "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export default { isVoiceSupported, isSpeechSynthesisSupported, speakText };
