import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

export default function SplitText({ 
  text, 
  className, 
  delay = 0,
  duration = 800,
  stagger = 50 
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const words = text.split(" ");
    const wordElements = words.map((word, wordIndex) => {
      const letters = word.split("");
      const letterElements = letters.map((letter, letterIndex) => {
        const span = document.createElement("span");
        span.textContent = letter;
        span.style.display = "inline-block";
        span.style.opacity = "0";
        span.style.transform = "translateY(20px)";
        span.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
        span.style.transitionDelay = `${delay + (wordIndex * letters.length + letterIndex) * stagger}ms`;
        return span;
      });

      const wordSpan = document.createElement("span");
      wordSpan.style.display = "inline-block";
      wordSpan.style.marginRight = "0.25em";
      letterElements.forEach(letter => wordSpan.appendChild(letter));
      
      return { element: wordSpan, letters: letterElements };
    });

    // Clear container and add word elements
    containerRef.current.innerHTML = "";
    wordElements.forEach(({ element }) => {
      containerRef.current!.appendChild(element);
    });

    // Trigger animation
    const timer = setTimeout(() => {
      wordElements.forEach(({ letters }) => {
        letters.forEach(letter => {
          letter.style.opacity = "1";
          letter.style.transform = "translateY(0)";
        });
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [text, delay, duration, stagger]);

  return (
    <div 
      ref={containerRef}
      className={cn("inline-block", className)}
      aria-label={text}
    />
  );
}
