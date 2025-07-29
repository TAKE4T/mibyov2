# 未病診断システム (Mibyou Diagnosis System)

機能医学と伝統医学を組み合わせた包括的な健康診断システム

## 📁 プロジェクト構成

```
mibyov2/
├── frontend/          # React + TypeScript フロントエンド
├── backend/           # Node.js + Express API
├── DEPLOY_GUIDE.md    # Render デプロイガイド
└── README.md          # このファイル
```

## 🎯 システム概要

### 医学的アプローチ
- **機能医学**: 自律神経、ホルモン、免疫系の評価
- **伝統医学**: 気・血・水・精の東洋医学的体質診断
- **AI分析**: OpenAI GPT + RAG による個別化診断

### 主要機能
- 多言語対応（日本語・英語）
- パーソナライズされた健康アドバイス
- 薬草蒸し療法レシピ推奨
- レスポンシブWebデザイン

## 🚀 クイックスタート

### 1. Frontend (React SPA)

```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

**技術スタック**: React 18, TypeScript, Vite, Tailwind CSS

### 2. Backend (API Server)

```bash
cd backend
npm install
npm start    # http://localhost:3000
```

**技術スタック**: Node.js, Express, OpenAI API, Firebase (optional)

## ⚙️ 環境設定

### Backend 環境変数
```bash
# backend/.env
OPENAI_API_KEY=sk-xxxxx
NODE_ENV=development
PORT=3000
```

### Frontend 環境変数
```bash
# frontend/.env
VITE_API_URL=http://localhost:3000/api
```

## 📡 API エンドポイント

### 診断API
```http
POST /api/diagnosis
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "M1",
      "answer": "よくある"
    }
  ]
}
```

### ヘルスチェック
```http
GET /health
```

## 🚢 デプロイ

### Render でのデプロイ (推奨)

**詳細手順**: `DEPLOY_GUIDE.md` を参照

1. **Backend**: Web Service として
   - Root Directory: `/backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Frontend**: Static Site として
   - Root Directory: `/frontend`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`

### 必要な環境変数
- **Backend**: `OPENAI_API_KEY` (必須)
- **Frontend**: `VITE_API_URL` (自動設定)

## 🏥 診断システム

### 質問カテゴリ
- **M系**: 機能医学（自律神経、ホルモン、免疫）
- **F系**: 伝統医学（気血水精）

### 推奨治療
- **リズム巡り蒸し**: ホルモンバランス調整
- **デトックス蒸し**: 免疫サポート・解毒
- **安眠ゆるり蒸し**: 自律神経調整

## 🗃 データ構造

### RAG データベース
- `questions_rag.json`: 診断質問データ
- `symptoms_rag.json`: 症状パターンマッピング
- `solutions_rag.json`: 治療ソリューション
- `herb_descriptions_rag.json`: 薬草データベース

### フォールバック機能
Firebase 未設定時は自動的にローカルJSONデータを使用

## 🔒 セキュリティ

- CORS設定（本番環境対応）
- Rate Limiting（15分100リクエスト）
- 入力値検証
- セキュリティヘッダー設定

## 🧪 開発・テスト

```bash
# Frontend 開発サーバー
cd frontend && npm run dev

# Backend 開発サーバー
cd backend && npm run dev

# 本番ビルド確認
cd frontend && npm run build && npm run preview
```

## 📊 システム構成図

```
User Interface (React)
       ↓
Frontend (Vite/Tailwind)
       ↓ API calls
Backend (Express/Node.js)
       ↓ RAG Processing
AI Analysis (OpenAI GPT)
       ↓ Database
Local JSON / Firebase
```

## 🌐 デプロイ済みURL (予定)

- **Frontend**: https://mibyou-diagnosis-frontend.onrender.com
- **Backend API**: https://mibyou-diagnosis-api.onrender.com

## 📚 ドキュメント

- **デプロイガイド**: `DEPLOY_GUIDE.md`
- **Frontend README**: `frontend/README.md`

## ⚠️ 注意事項

このシステムは健康指導・ウェルネス目的のものです。医療診断や治療には使用せず、必ず医療従事者にご相談ください。

## 🤝 開発支援

プロジェクトへの貢献や質問は GitHub Issues でお気軽にどうぞ。

---

🤖 **Generated with Claude Code** - Anthropic