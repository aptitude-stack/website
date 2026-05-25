"use client";

import {
  createElement,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";

type TextTypeProps<T extends ElementType = "div"> = {
  text: string | string[];
  as?: T;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: ReactNode;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

export function TextType<T extends ElementType = "div">({
  text,
  as: Component = "div" as T,
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}: TextTypeProps<T>) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) {
      return typingSpeed;
    }

    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [typingSpeed, variableSpeed]);

  const currentText = textArray[currentTextIndex] ?? "";
  const shouldHideCursor =
    hideCursorWhileTyping && (currentCharIndex < currentText.length || isDeleting);
  const currentTextColor =
    textColors.length > 0 ? textColors[currentTextIndex % textColors.length] : "inherit";

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!showCursor || !cursorRef.current) {
      return;
    }

    gsap.set(cursorRef.current, { opacity: 1 });
    const cursorTween = gsap.to(cursorRef.current, {
      duration: cursorBlinkDuration,
      ease: "power2.inOut",
      opacity: 0,
      repeat: -1,
      yoyo: true,
    });

    return () => {
      cursorTween.kill();
    };
  }, [cursorBlinkDuration, showCursor]);

  useEffect(() => {
    if (!isVisible || currentText.length === 0) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    const processedText = reverseMode
      ? currentText.split("").reverse().join("")
      : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false);

          if (currentTextIndex === textArray.length - 1 && !loop) {
            return;
          }

          onSentenceComplete?.(currentText, currentTextIndex);
          setCurrentTextIndex((previousIndex) => (previousIndex + 1) % textArray.length);
          setCurrentCharIndex(0);
          return;
        }

        timeout = setTimeout(() => {
          setDisplayedText((previousText) => previousText.slice(0, -1));
        }, deletingSpeed);
        return;
      }

      if (currentCharIndex < processedText.length) {
        timeout = setTimeout(
          () => {
            setDisplayedText((previousText) => previousText + processedText[currentCharIndex]);
            setCurrentCharIndex((previousIndex) => previousIndex + 1);
          },
          variableSpeed ? getRandomSpeed() : typingSpeed,
        );
        return;
      }

      if (!loop && currentTextIndex === textArray.length - 1) {
        return;
      }

      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    currentText,
    currentTextIndex,
    deletingSpeed,
    displayedText,
    getRandomSpeed,
    initialDelay,
    isDeleting,
    isVisible,
    loop,
    onSentenceComplete,
    pauseDuration,
    reverseMode,
    textArray.length,
    typingSpeed,
    variableSpeed,
  ]);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: ["text-type", className].filter(Boolean).join(" "),
      ...props,
    },
    <span className="text-type__content" style={{ color: currentTextColor }}>
      {displayedText}
    </span>,
    showCursor && (
      <span
        ref={cursorRef}
        className={[
          "text-type__cursor",
          cursorClassName,
          shouldHideCursor ? "text-type__cursor--hidden" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {cursorCharacter}
      </span>
    ),
  );
}
