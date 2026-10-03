# 物語を作ろう (Story Creator AI)

AI（Gemini）とユーザーが対話しながら、起承転結のまとまった1つの物語を作成するWebアプリケーションです。選択したジャンルや行動によって、毎回異なるストーリーが展開されます。

## 機能概要

- **ジャンル選択**: タイトル画面でSF、ファンタジー、ミステリーなどのジャンルを指定可能。
- **インタラクティブなストーリー展開**: AIが生成した物語（約140文字）に対し、提示される3つの選択肢からユーザーが次の行動を決定。
- **起承転結システム**: 「起・承・転」の各フェーズで選択を繰り返し、「結」で最終的な物語が完成。
- **結果振り返り**: 最後に、ユーザーが紡いだ起承転結の物語全体を一覧表示。

## 使用技術 (Tech Stack)

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js (ES Modules)
- **Infrastructure**: Firebase Hosting, Cloud Functions for Firebase (v2)
- **AI / LLM**: Gemini API (`gemini-3.1-flash-lite` via `@google/genai` SDK)
- **Security**: Firebase Secret Manager

## アーキテクチャの特徴

- クライアント側（ブラウザ）にGemini APIキーを露出させないため、Cloud FunctionsをバックエンドAPIとして配置。
- Gemini APIの `responseSchema` を活用し、AIの出力を厳密なJSONフォーマット（物語本文＋選択肢配列）に固定することで、安定したシステム連携を実現。
