"use client";

import { useState, useCallback } from "react";
import WordRegistration from "./components/WordRegistration";
import StudyScreen from "./components/StudyScreen";
import CompleteScreen from "./components/CompleteScreen";
import ImageExtract from "./components/ImageExtract";
import SettingsScreen from "./components/SettingsScreen";

export interface Word {
  id: string;
  english: string;
  japanese: string;
  weight: number;
  completed: boolean;
}

export type StudyDirection = "en-to-ja" | "ja-to-en";

type View = "registration" | "study" | "complete" | "imageExtract" | "settings";

export default function Home() {
  const [view, setView] = useState<View>("registration");
  const [words, setWords] = useState<Word[]>([]);
  const [direction, setDirection] = useState<StudyDirection>("en-to-ja");
  const [extractedText, setExtractedText] = useState("");
  const [settingsReturnTo, setSettingsReturnTo] = useState<View>("registration");

  const handleStart = useCallback((rawWords: Word[], dir: StudyDirection) => {
    setWords(rawWords);
    setDirection(dir);
    setView("study");
  }, []);

  const handleAnswer = useCallback(
    (id: string, result: "correct" | "wrong" | "unknown") => {
      setWords((prev) => {
        const updated = prev.map((w) => {
          if (w.id !== id) return w;
          if (result === "correct") return { ...w, weight: 0, completed: true };
          if (result === "wrong") return { ...w, weight: w.weight + 3 };
          return { ...w, weight: w.weight + 5 };
        });
        const allDone = updated.every((w) => w.completed);
        if (allDone) setTimeout(() => setView("complete"), 0);
        return updated;
      });
    },
    []
  );

  const handleRestart = useCallback(() => {
    setWords([]);
    setView("registration");
  }, []);

  const handleRetry = useCallback(() => {
    setWords((prev) =>
      prev.map((w) => ({ ...w, weight: 5, completed: false }))
    );
    setView("study");
  }, []);

  const handleExtracted = useCallback((text: string) => {
    setExtractedText(text);
    setView("registration");
  }, []);

  const handleGoToSettings = useCallback((returnTo: View = "registration") => {
    setSettingsReturnTo(returnTo);
    setView("settings");
  }, []);

  if (view === "settings") {
    return <SettingsScreen onBack={() => setView(settingsReturnTo)} />;
  }

  if (view === "imageExtract") {
    return (
      <ImageExtract
        onExtracted={handleExtracted}
        onBack={() => setView("registration")}
        onNeedSettings={() => handleGoToSettings("imageExtract")}
      />
    );
  }

  if (view === "registration") {
    return (
      <WordRegistration
        key={extractedText}
        initialText={extractedText}
        onStart={handleStart}
        onImageExtract={() => setView("imageExtract")}
        onSettings={() => handleGoToSettings("registration")}
      />
    );
  }

  if (view === "complete") {
    return (
      <CompleteScreen
        total={words.length}
        onRestart={handleRestart}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <StudyScreen
      words={words}
      direction={direction}
      onAnswer={handleAnswer}
      onQuit={handleRestart}
    />
  );
}
