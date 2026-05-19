"use client";

import { useState, useEffect } from "react";
import type { Word } from "../page";
import type { StudyDirection } from "../page";

interface Props {
  word: Word;
  direction: StudyDirection;
  onAnswer: (result: "correct" | "wrong" | "unknown") => void;
}

export default function FlashCard({ word, direction, onAnswer }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setFlipped(false);
    setAnimating(false);
  }, [word.id]);

  const handleFlip = () => {
    if (flipped) return;
    setFlipped(true);
  };

  const handleAnswer = (result: "correct" | "wrong" | "unknown") => {
    if (animating) return;
    setAnimating(true);
    onAnswer(result);
  };

  const isEnToJa = direction === "en-to-ja";
  const frontLabel = isEnToJa ? "English" : "日本語";
  const backLabel = isEnToJa ? "日本語" : "English";
  const frontText = isEnToJa ? word.english : word.japanese;
  const backText = isEnToJa ? word.japanese : word.english;
  const backSubText = isEnToJa ? word.english : word.japanese;

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-slide-up">
      {/* Card */}
      <div
        className="card-scene w-full cursor-pointer"
        style={{ height: "240px" }}
        onClick={handleFlip}
        role="button"
        aria-label={flipped ? "カード（めくり済み）" : "カードをタップしてめくる"}
      >
        <div className={`card-body ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="card-face">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 select-none">
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-4">
                {frontLabel}
              </p>
              <p className="text-white text-4xl font-bold text-center break-words">
                {frontText}
              </p>
              {!flipped && (
                <p className="text-purple-300 text-xs mt-6 animate-pulse">
                  タップしてめくる
                </p>
              )}
            </div>
          </div>

          {/* Back */}
          <div className="card-face card-back-face">
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 select-none">
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-4">
                {backLabel}
              </p>
              <p className="text-white text-3xl font-bold text-center break-words">
                {backText}
              </p>
              <p className="text-emerald-200 text-sm mt-3 opacity-70">
                {backSubText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Answer buttons — shown only after flip */}
      <div
        className={`w-full grid grid-cols-3 gap-3 transition-all duration-300 ${
          flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <button
          onClick={() => handleAnswer("correct")}
          className="flex flex-col items-center gap-1.5 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl shadow-lg transition-all font-semibold"
        >
          <span className="text-2xl">✓</span>
          <span className="text-sm">正解</span>
        </button>

        <button
          onClick={() => handleAnswer("unknown")}
          className="flex flex-col items-center gap-1.5 py-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl shadow-lg transition-all font-semibold"
        >
          <span className="text-2xl">?</span>
          <span className="text-sm">わからない</span>
        </button>

        <button
          onClick={() => handleAnswer("wrong")}
          className="flex flex-col items-center gap-1.5 py-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-2xl shadow-lg transition-all font-semibold"
        >
          <span className="text-2xl">✗</span>
          <span className="text-sm">間違った</span>
        </button>
      </div>
    </div>
  );
}
