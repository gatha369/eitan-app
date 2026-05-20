import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const PROMPT = `この画像から英単語と日本語訳のペアを全て抽出してください。

以下の形式のみ出力してください（余計な説明・見出し・番号は不要です）：
英単語,日本語訳
英単語,日本語訳

・1行に1ペア、コンマ（,）区切り
・日本語訳が画像にない場合は文脈から推測して補完してください`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが設定されていません。管理者にお問い合わせください。" },
      { status: 500 }
    );
  }

  const { base64, mimeType } = (await req.json()) as {
    base64: string;
    mimeType: string;
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (res.status === 429) {
    return NextResponse.json(
      { error: "本日の無料枠が上限に達しました。明日また試してください。" },
      { status: 429 }
    );
  }
  if (res.status === 403 || res.status === 401) {
    return NextResponse.json(
      { error: "APIキーが無効です。サーバー設定を確認してください。" },
      { status: res.status }
    );
  }
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const msg =
      (errJson as { error?: { message?: string } })?.error?.message ?? "不明なエラー";
    return NextResponse.json(
      { error: `APIエラー（${res.status}）: ${msg}` },
      { status: res.status }
    );
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  const filtered = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes(",") && !l.startsWith("```") && !l.startsWith("#"))
    .join("\n");

  if (!filtered) {
    return NextResponse.json(
      { error: "単語を抽出できませんでした。別の画像を試してください。" },
      { status: 422 }
    );
  }

  return NextResponse.json({ text: filtered });
}
