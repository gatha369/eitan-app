"use client";

import { useState, useEffect } from "react";

export const GEMINI_KEY_STORAGE = "gemini_api_key";

interface Props {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(GEMINI_KEY_STORAGE);
    if (stored) setApiKey(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem(GEMINI_KEY_STORAGE, apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
    setApiKey("");
    setSaved(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚙️</div>
          <h1 className="text-2xl font-bold text-white mb-1">設定</h1>
          <p className="text-purple-200 text-sm">Gemini API キーの管理</p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6">
          <label className="text-gray-700 font-semibold text-sm block mb-2">
            Gemini API キー
          </label>

          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
              placeholder="AIza..."
              className="w-full border-2 border-gray-200 rounded-xl p-3 pr-14 text-sm font-mono focus:outline-none focus:border-purple-400 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-1"
            >
              {showKey ? "隠す" : "表示"}
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-xl p-4 space-y-1.5">
            <p className="font-semibold text-gray-600 mb-2">APIキーの取得方法</p>
            <p>① Google AI Studio（aistudio.google.com）にアクセス</p>
            <p>② 「Get API key」から無料のAPIキーを発行</p>
            <p>③ 上のフォームに貼り付けて「保存する」をタップ</p>
            <p className="text-gray-400 pt-1">※ APIキーはこのデバイスにのみ保存されます</p>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow hover:from-purple-600 hover:to-indigo-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saved ? "保存しました ✓" : "保存する"}
            </button>
            {apiKey && (
              <button
                onClick={handleClear}
                className="px-4 py-3 border-2 border-red-200 text-red-400 rounded-xl hover:bg-red-50 active:scale-95 transition-all text-sm font-medium"
              >
                削除
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-6 w-full py-3 text-white/70 hover:text-white text-sm transition-colors"
        >
          ← 戻る
        </button>
        <p className="mt-2 text-center text-white/20 text-xs">ver.1.3</p>
      </div>
    </div>
  );
}
