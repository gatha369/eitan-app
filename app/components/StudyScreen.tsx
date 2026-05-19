"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { Word } from "../page";
import FlashCard from "./FlashCard";

interface Props {
  words: Word[];
  onAnswer: (id: string, result: "correct" | "wrong" | "unknown") => void;
  onQuit: () => void;
}

function pickNext(words: Word[], excludeId?: string): Word | null {
  const active = words.filter((w) => !w.completed && w.id !== excludeId);
  if (active.length === 0) {
    // If only the current word is left, allow it
    const fallback = words.find((w) => !w.completed);
    return fallback ?? null;
  }

  const totalWeight = active.reduce((s, w) => s + w.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const w of active) {
    rand -= w.weight;
    if (rand <= 0) return w;
  }
  return active[active.length - 1];
}

export default function StudyScreen({ words, onAnswer, onQuit }: Props) {
  const [currentId, setCurrentId] = useState<string>(() => {
    const w = pickNext(words);
    return w ? w.id : "";
  });
  const [cardKey, setCardKey] = useState(0);

  // Track when words change after an answer to advance to next card
  const prevWordsRef = useRef(words);
  useEffect(() => {
    if (prevWordsRef.current === words) return;
    prevWordsRef.current = words;
    const next = pickNext(words, currentId);
    setCurrentId(next ? next.id : "");
    setCardKey((k) => k + 1);
  }, [words, currentId]);

  const completedCount = useMemo(
    () => words.filter((w) => w.completed).length,
    [words]
  );
  const total = words.length;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;

  const currentWord = useMemo(
    () => words.find((w) => w.id === currentId) ?? null,
    [words, currentId]
  );

  const handleAnswer = useCallback(
    (result: "correct" | "wrong" | "unknown") => {
      if (!currentId) return;
      onAnswer(currentId, result);
    },
    [currentId, onAnswer]
  );

  if (!currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <button
          onClick={onQuit}
          className="text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          ← 終了
        </button>
        <span className="text-white font-bold text-sm">
          {completedCount} / {total} 語 完了
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-8 animate-fade-in">
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-white/60 text-xs mt-1.5">
          <span>0</span>
          <span className="text-emerald-300 font-semibold">
            {Math.round(progress)}% 達成
          </span>
          <span>{total}</span>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 flex-wrap mb-6 animate-fade-in">
        <StatusPill
          label="未完了"
          count={total - completedCount}
          color="bg-white/20 text-white"
        />
        <StatusPill
          label="完了"
          count={completedCount}
          color="bg-emerald-400/30 text-emerald-200"
        />
      </div>

      {/* Flash card */}
      <div className="flex-1 flex flex-col justify-center">
        <FlashCard
          key={cardKey}
          word={currentWord}
          onAnswer={handleAnswer}
        />
      </div>

      <p className="text-center text-white/40 text-xs mt-6">
        重み付けにより間違えた単語は頻繁に出題されます
      </p>
    </div>
  );
}

function StatusPill({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${color}`}>
      {label}: {count}
    </span>
  );
}
