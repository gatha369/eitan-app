"use client";

import { useState } from "react";
import type { Word } from "../page";

const MAX_WORDS = 200;

const EXAMPLE = `apple,りんご
book,本
cat,猫
dog,犬
elephant,ゾウ`;

interface Props {
  onStart: (words: Word[]) => void;
}

export default function WordRegistration({ onStart }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const parse = (): Word[] | null => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError("単語を入力してください。");
      return null;
    }
    if (lines.length > MAX_WORDS) {
      setError(`最大 ${MAX_WORDS} 語までです（現在 ${lines.length} 語）。`);
      return null;
    }

    const words: Word[] = [];
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(",");
      if (parts.length < 2 || !parts[0].trim() || !parts[1].trim()) {
        setError(
          `${i + 1}行目の形式が正しくありません：「${lines[i]}」\n「英語,日本語」の形式で入力してください。`
        );
        return null;
      }
      words.push({
        id: `${Date.now()}-${i}`,
        english: parts[0].trim(),
        japanese: parts.slice(1).join(",").trim(),
        weight: 5,
        completed: false,
      });
    }
    setError("");
    return words;
  };

  const handleStart = () => {
    const words = parse();
    if (words) onStart(words);
  };

  const handleExample = () => {
    setText(EXAMPLE);
    setError("");
  };

  const lineCount = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            英単語フラッシュカード
          </h1>
          <p className="text-purple-200 text-sm">
            重み付き反復学習で効率よく暗記
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-gray-700 font-semibold text-sm">
              単語リスト
            </label>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  lineCount > MAX_WORDS
                    ? "bg-red-100 text-red-600"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                {lineCount} / {MAX_WORDS} 語
              </span>
              <button
                onClick={handleExample}
                className="text-xs text-purple-500 hover:text-purple-700 underline"
              >
                サンプルを入力
              </button>
            </div>
          </div>

          <textarea
            className="w-full h-52 border-2 border-gray-200 rounded-xl p-3 text-sm font-mono focus:outline-none focus:border-purple-400 resize-none transition-colors placeholder-gray-300"
            placeholder={"apple,りんご\nbook,本\ncat,猫"}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
          />

          {error && (
            <div className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg p-2 whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="mt-3 text-xs text-gray-400">
            形式：<code className="bg-gray-100 px-1 rounded">英語,日本語</code>{" "}
            （1行に1単語、最大 {MAX_WORDS} 語）
          </div>

          <button
            onClick={handleStart}
            disabled={lineCount === 0}
            className="mt-5 w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-indigo-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            学習スタート →
          </button>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white/10 rounded-xl p-4 text-white/80 text-xs space-y-1.5">
          <p className="font-semibold text-white/90 mb-2">重み付けルール</p>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center text-white text-xs">✓</span>
            <span>正解 → 出題頻度を下げる</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center text-white text-xs">✗</span>
            <span>間違った → 出題頻度を上げる</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs">?</span>
            <span>わからなかった → 最高頻度で繰り返す</span>
          </div>
        </div>
      </div>
    </div>
  );
}
