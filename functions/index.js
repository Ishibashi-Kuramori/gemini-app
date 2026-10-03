import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenAI, Type } from "@google/genai";

export const generateContent = onRequest(
  {
    cors: true,
    secrets: ["GEMINI_API_KEY"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
      const { phase, genre, history, selectedOption } = req.body;
      // phase: "起", "承", "転", "結" のいずれか
      // genre: 作品のジャンル(追加)
      // history: これまでの物語本文と選択肢の配列
      // selectedOption: ユーザーが直前に選んだ選択肢

      if (!phase) {
        return res.status(400).json({ error: "フェーズ（起承転結）が指定されていません。" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // プロンプトの組み立て
      let prompt = `【作品ジャンル】: ${genre || "ファンタジー"}\n`;
      prompt += `現在のフェーズは「${phase}」です。\n`;
      if (history && history.length > 0) {
        prompt += `これまでの物語の展開:\n${JSON.stringify(history, null, 2)}\n`;
      }
      if (selectedOption) {
        prompt += `ユーザーが選択した次の展開: 「${selectedOption}」\n`;
      }

      // Gemini に返させたい JSON の構造（スキーマ）を定義
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          story: {
            type: Type.STRING,
            description: "生成された物語本文（約140文字）。説明や挨拶は含めないこと。",
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "次の展開の選択肢（3つ）。フェーズが「結」の場合は空配列[]にすること。",
          },
        },
        required: ["story", "options"],
      };

      // システム指示
      const systemInstruction = `あなたは物語を作るインターアクティブなAIアシスタントです。
指定されたジャンル（${genre || "ファンタジー"}）の世界観・雰囲気・口調・トーンに沿って、ユーザーと一緒に「起承転結」の物語を作成します。

【制約事項】
1. story（物語本文）は指定ジャンルにふさわしい内容で、日本語で約140文字程度とし、物語本文のみを出力してください。挨拶や説明は一切禁止です。
2. options（選択肢）は、「起」「承」「転」のときはジャンルの展開に合った選択肢を必ず3つ作成してください。
3. フェーズが「結」のときは、物語を完結させ、options は空の配列 [] にしてください。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      // API から返ってきた JSON をパースしてレスポンスとして返す
      const resultJson = JSON.parse(response.text);
      return res.status(200).json(resultJson);

    } catch (error) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({ error: error.message || "サーバーエラーが発生しました。" });
    }
  }
);
