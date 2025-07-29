# Mibyou Diagnosis API

未病診断アプリケーション用のバックエンドAPIサーバーです。LangChainとOpenAI APIを使用したRAG（Retrieval-Augmented Generation）システムで、ユーザーの健康診断回答から適切な蒸し療法と生薬を推奨します。

## 🚀 主要機能

- **診断API**: ユーザーの回答を分析し、症状に応じた蒸し療法と生薬を推奨
- **RAG検索**: ベクトル検索による症状・解決策・生薬の関連性抽出
- **AI診断**: OpenAI GPTによる診断サマリーと推奨事項の生成
- **Firebase連携**: Firestoreからの診断データ取得（ローカルデータも対応）
- **Renderデプロイ対応**: 本番環境での稼働を想定した設定

## 📋 APIエンドポイント

### メイン診断エンドポイント
```
POST /api/diagnosis
```

**リクエスト例:**
```json
{
  "answers": [
    {
      "questionId": "M1",
      "answer": "夜中に2-3回目が覚める"
    },
    {
      "questionId": "M2", 
      "answer": "不安で緊張することが多い"
    }
  ],
  "userId": "user123",
  "sessionId": "session456"
}
```

**レスポンス例:**
```json
{
  "success": true,
  "sessionId": "session456",
  "diagnosis": {
    "summary": "自律神経の乱れによる睡眠障害と不安症状が見られます...",
    "primary_conditions": ["睡眠障害", "自律神経失調"],
    "recommended_solutions": [
      {
        "recipe_id": "R003",
        "name": "安眠ゆるり蒸し",
        "reason": "自律神経を整え、心身をリラックス",
        "priority": "high"
      }
    ],
    "recommended_herbs": [
      {
        "name": "カモミール",
        "reason": "鎮静・抗不安作用",
        "effect": "深いリラクゼーション効果"
      }
    ]
  }
}
```

### ヘルスチェック
```
GET /health
GET /api/diagnosis/health
```

### データ情報取得
```
GET /api/diagnosis/data-info
```

## 🛠 セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.example`を`.env`にコピーして必要な値を設定:

```bash
cp .env.example .env
```

必要な環境変数:
- `OPENAI_API_KEY`: OpenAI APIキー
- `FIREBASE_PROJECT_ID`: Firebase プロジェクID
- `FIREBASE_PRIVATE_KEY`: Firebase サービスアカウント秘密鍵
- `FIREBASE_CLIENT_EMAIL`: Firebase サービスアカウントメール

### 3. 開発サーバーの起動
```bash
npm run dev
```

### 4. 本番サーバーの起動
```bash
npm start
```

## 🏗 システム構成

```
mibyov2/
├── server.js                 # メインサーバーファイル
├── routes/
│   └── diagnosis.js          # 診断API ルート
├── services/
│   ├── firebaseService.js    # Firebase/Firestore接続
│   └── ragService.js         # RAG検索・OpenAI連携
├── middleware/
│   └── errorHandler.js       # エラーハンドリング
├── questions_rag.json        # 質問データ
├── symptoms_rag.json         # 症状データ  
├── solutions_rag.json        # 蒸し療法データ
├── herb_descriptions_rag.json # 生薬データ
└── render.yaml              # Renderデプロイ設定
```

## 🔧 技術スタック

- **Node.js + Express**: APIサーバー
- **LangChain**: RAG実装・ベクトル検索
- **OpenAI API**: GPT-4による診断生成・テキスト埋め込み
- **Firebase Admin SDK**: Firestore接続
- **その他**: CORS、Rate Limiting、Helmet (セキュリティ)

## 🚀 Renderデプロイ

### 1. Renderアカウントでリポジトリを接続

### 2. 環境変数を設定
Renderダッシュボードで以下を設定:
- `OPENAI_API_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`

### 3. デプロイ実行
`render.yaml`設定により自動的にデプロイされます。

## 📊 データ構造

### 質問データ (`questions_rag.json`)
機能医学カテゴリーと症状の対応関係

### 蒸し療法データ (`solutions_rag.json`)
各レシピの効果・対象症状・使用生薬

### 生薬データ (`herb_descriptions_rag.json`)
生薬の薬理作用・成分・蒸気効果

### 症状データ (`symptoms_rag.json`)
東洋医学的分類と機能医学的対応

## 🔍 診断処理フロー

1. **ユーザー回答受信**: 質問IDと回答テキストの配列
2. **ベクトル検索**: 回答内容に関連する症状・解決策・生薬を抽出
3. **AI診断生成**: OpenAI GPTで診断サマリーと推奨事項を生成
4. **結果返却**: 構造化された診断結果をJSON形式で返却

## 🛡 セキュリティ

- **Rate Limiting**: IPあたり15分間に100リクエストまで
- **CORS**: 指定ドメインからのアクセスのみ許可
- **Helmet**: セキュリティヘッダーの設定
- **入力検証**: Joiによるリクエストデータ検証

## 📝 ログとモニタリング

- 詳細なコンソールログ出力
- エラー処理とスタックトレース
- ヘルスチェックエンドポイント
- 処理時間と結果の統計情報

## 🤝 フロントエンド連携

このAPIは以下のフロントエンドシステムと連携します:
- **React + Next.js** (mastra framework)
- **Figma → React変換** コンポーネント
- **診断フォーム** からのPOSTリクエスト処理
- **結果表示** 用のレスポンス構造化