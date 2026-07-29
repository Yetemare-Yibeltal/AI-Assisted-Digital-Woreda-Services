import { useState, useCallback } from "react";

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
  reset: () => void;
}

/**
 * Provides a copy-to-clipboard function with feedback state.
 */
export function useClipboard(resetDelay: number = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
        } catch {
          setCopied(false);
        }
        document.body.removeChild(textArea);
      } else {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }

      if (resetDelay > 0) {
        setTimeout(() => setCopied(false), resetDelay);
      }
    },
    [resetDelay],
  );

  const reset = useCallback(() => setCopied(false), []);

  return { copied, copy, reset };
}

export default useClipboard;
