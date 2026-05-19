"use client";

import { useState, useRef } from "react";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const PROMPT = `この画像から英単語と日本語訳のペアを全て抽出してください。

以下の形式のみ出力してください（余計な説明・見出し・番号は不要です）：
英単語,日本語訳
英単語,日本語訳

・1行に1ペア、コンマ（,）区切り
・日本語訳が画像にない場合は文脈から推測して補完してください`;

interface Props {
  onExtracted: (text: string) => void;
  onBack: () => void;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageExtract({ onExtracted, onBack }: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください（JPG・PNG・WEBP等）。");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    setResult("");
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
    setResult("");
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) applyFile(file);
  };

  const handleExtract = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
    if (!apiKey) {
      setError("APIキーが設定されていません。管理者にお問い合わせください。");
      return;
    }
    if (!imageFile) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const base64 = await readFileAsBase64(imageFile);

      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: imageFile.type, data: base64 } },
                { text: PROMPT },
              ],
            },
          ],
        }),
      });

      if (res.status === 429) {
        setError("本日の無料枠が上限に達しました。明日また試してください。");
        return;
      }
      if (res.status === 403 || res.status === 401) {
        setError("APIキーが無効です。サーバー設定を確認してください。");
        return;
      }
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = (errJson as { error?: { message?: string } })?.error?.message ?? "不明なエラー";
        setError(`APIエラー（${res.status}）: ${msg}`);
        return;
      }

      const data = await res.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      const filtered = raw
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.includes(",") && !l.startsWith("```") && !l.startsWith("#"))
        .join("\n");

      if (!filtered) {
        setError("単語を抽出できませんでした。別の画像を試してください。");
        return;
      }
      setResult(filtered);
    } catch {
      setError("通信エラーが発生しました。ネットワーク接続を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result.trim()) onExtracted(result.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-8">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📷</div>
          <h1 className="text-2xl font-bold text-white mb-1">
            画像から単語を読み取る
          </h1>
          <p className="text-purple-200 text-sm">
            教科書・単語帳の画像をアップロード
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 space-y-4">
          {/* Upload / Preview */}
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-purple-300 rounded-xl p-10 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all select-none"
            >
              <div className="text-5xl mb-3">🖼️</div>
              <p className="text-gray-600 font-semibold">
                タップして画像を選択
              </p>
              <p className="text-gray-400 text-xs mt-1">
                またはドラッグ＆ドロップ
              </p>
              <p className="text-gray-300 text-xs mt-2">JPG / PNG / WEBP 対応</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              <img
                src={previewUrl}
                alt="選択された画像"
                className="w-full max-h-64 object-contain"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full text-sm hover:bg-black/80 transition-all flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) applyFile(file);
              e.target.value = "";
            }}
          />

          {/* Extract button */}
          <button
            onClick={handleExtract}
            disabled={!imageFile || loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AI が読み取り中...
              </span>
            ) : (
              "単語を読み取る →"
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-gray-700 font-semibold text-sm">
                  抽出された単語
                </p>
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full">
                  {result.split("\n").filter(Boolean).length} 語
                </span>
              </div>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full h-48 border-2 border-purple-200 rounded-xl p-3 text-sm font-mono focus:outline-none focus:border-purple-400 resize-none transition-colors"
              />
              <p className="text-xs text-gray-400">内容を確認・編集できます</p>
              <button
                onClick={handleApply}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                単語リストに反映する →
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onBack}
          className="mt-6 w-full py-3 text-white/70 hover:text-white text-sm transition-colors"
        >
          ← タイトルに戻る
        </button>
        <p className="mt-2 text-center text-white/20 text-xs">ver.2.0</p>
      </div>
    </div>
  );
}
