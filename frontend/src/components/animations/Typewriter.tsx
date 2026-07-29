import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";

interface TypewriterProps {
  text: string | string[];
  speed?: number;
  deleteSpeed?: number;
  delay?: number;
  loop?: boolean;
  cursor?: boolean;
  cursorChar?: string;
  cursorBlinkSpeed?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
  startDelay?: number;
}

export function Typewriter({
  text,
  speed = 80,
  deleteSpeed = 40,
  delay = 2000,
  loop = false,
  cursor = true,
  cursorChar = "|",
  cursorBlinkSpeed = 530,
  className,
  onComplete,
  showCursor = true,
  startDelay = 0,
}: TypewriterProps) {
  const texts = Array.isArray(text) ? text : [text];
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cursor blink
  useEffect(() => {
    if (!showCursor) return;
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, cursorBlinkSpeed);
    return () => clearInterval(interval);
  }, [cursorBlinkSpeed, showCursor]);

  // Initial start delay
  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  const handleTyping = useCallback(() => {
    if (!hasStarted) return;

    const currentText = texts[textIndex];
    if (!currentText) return;

    if (isWaiting) return;

    if (!isDeleting) {
      // Typing forward
      if (charIndex < currentText.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(currentText.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }, speed);
      } else {
        // Finished typing
        onComplete?.();
        if (loop && texts.length > 1) {
          setIsWaiting(true);
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true);
            setIsWaiting(false);
          }, delay);
        } else if (loop) {
          setIsWaiting(true);
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true);
            setIsWaiting(false);
          }, delay);
        }
      }
    } else {
      // Deleting
      if (charIndex > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(currentText.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        }, deleteSpeed);
      } else {
        // Move to next text
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }
  }, [hasStarted, texts, textIndex, charIndex, isDeleting, isWaiting, loop, speed, deleteSpeed, delay, onComplete]);

  useEffect(() => {
    handleTyping();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [handleTyping]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span>{displayText}</span>
      {cursor && showCursor && (
        <span
          className={cn(
            "ml-0.5 font-light",
            cursorVisible ? "opacity-100" : "opacity-0",
            "transition-opacity duration-100"
          )}
          style={{ color: "inherit" }}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}

export default Typewriter;