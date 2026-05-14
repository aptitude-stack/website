"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "aptitude-theme-mode";
const modes = ["light", "dark", "auto"] as const;
type ThemeMode = (typeof modes)[number];

const modeLabels: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  auto: "Auto",
};

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "auto";
}

function applyThemeMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "auto") {
    root.removeAttribute("data-theme");
    return;
  }
  root.dataset.theme = mode;
}

export function ThemeModeControl() {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    const storedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initialMode = isThemeMode(storedMode) ? storedMode : "auto";
    setMode(initialMode);
    applyThemeMode(initialMode);
  }, []);

  function selectMode(nextMode: ThemeMode) {
    setMode(nextMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    applyThemeMode(nextMode);
  }

  return (
    <fieldset
      className="theme-mode"
      data-mode={mode}
      aria-label="Color Mode"
    >
      <legend className="sr-only">Color Mode</legend>
      {modes.map((themeMode) => (
        <label className="theme-mode__option" key={themeMode}>
          <input
            type="radio"
            name="theme-mode"
            value={themeMode}
            aria-label={`${modeLabels[themeMode]} color mode`}
            checked={mode === themeMode}
            onChange={() => selectMode(themeMode)}
          />
          <span aria-hidden="true">
            <ThemeModeIcon mode={themeMode} />
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function ThemeModeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "light") {
    return (
      <svg
        className="theme-mode__icon"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Sun"
      >
        <circle cx="12" cy="12" r="3.8" />
        <path d="M12 2.8v2.7M12 18.5v2.7M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M2.8 12h2.7M18.5 12h2.7M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9" />
      </svg>
    );
  }

  if (mode === "dark") {
    return (
      <svg
        className="theme-mode__icon"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Moon"
      >
        <path
          className="theme-mode__icon-fill"
          d="M19.4 14.2A7.7 7.7 0 0 1 9.8 4.6a7.8 7.8 0 1 0 9.6 9.6Z"
        />
      </svg>
    );
  }

  return (
    <svg
      className="theme-mode__icon"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Auto"
    >
      <path d="M6.4 9.4A6 6 0 0 1 16.6 7" />
      <path d="M16.6 3.8V7h-3.2" />
      <path d="M17.6 14.6A6 6 0 0 1 7.4 17" />
      <path d="M7.4 20.2V17h3.2" />
    </svg>
  );
}
