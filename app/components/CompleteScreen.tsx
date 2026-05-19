"use client";

interface Props {
  total: number;
  onRestart: () => void;
  onRetry: () => void;
}

export default function CompleteScreen({ total, onRestart, onRetry }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-bounce-in text-center">
        {/* Trophy */}
        <div className="text-8xl mb-6">🏆</div>

        <h1 className="text-3xl font-bold text-white mb-2">
          おめでとう！
        </h1>
        <p className="text-purple-200 mb-2">
          全 <span className="text-white font-bold">{total}</span> 語を正解しました
        </p>
        <p className="text-purple-300 text-sm mb-10">
          素晴らしい学習成果です！
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-10 text-3xl">
          {"★★★".split("").map((s, i) => (
            <span
              key={i}
              className="text-yellow-400 animate-bounce-in"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full py-4 bg-white text-purple-600 font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:bg-purple-50 active:scale-95 transition-all"
          >
            もう一度練習する
          </button>
          <button
            onClick={onRestart}
            className="w-full py-4 bg-white/20 text-white font-semibold text-base rounded-2xl border border-white/30 hover:bg-white/30 active:scale-95 transition-all"
          >
            新しい単語を登録する
          </button>
        </div>
      </div>

      <p className="mt-8 text-white/30 text-xs">ver.1.2</p>
    </div>
  );
}
