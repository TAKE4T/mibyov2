# 未病診断システム - Frontend

機能医学と伝統医学に基づく健康状態診断システムのフロントエンドアプリケーション

## 技術スタック

- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **Tailwind CSS** - スタイリング
- **Render** - デプロイプラットフォーム

## 開発環境のセットアップ

### 前提条件
- Node.js 18.0.0 以上

### インストール
```bash
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### プロダクション環境での実行
```bash
npm start
```

## Render でのデプロイ

このプロジェクトは Render での静的サイトホスティングに最適化されています。

### デプロイ手順

1. GitHub リポジトリにコードをプッシュ
2. Render で新しい Static Site を作成
3. リポジトリを接続
4. 以下の設定を使用：
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: `18`

### 環境変数

必要に応じて Render の環境変数設定で以下を設定：

- `NODE_ENV`: `production`

## プロジェクト構成

```
frontend/
├── src/
│   └── main.tsx          # エントリーポイント
├── components/           # Reactコンポーネント
├── services/            # API サービス
├── styles/              # CSS スタイル
├── App.tsx              # メインアプリケーション
├── index.html           # HTML テンプレート
├── package.json         # パッケージ設定
├── vite.config.ts       # Vite 設定
├── tailwind.config.js   # Tailwind CSS 設定
└── render.yaml          # Render デプロイ設定
```

## 機能

- 多言語対応（日本語・英語）
- レスポンシブデザイン
- 機能医学に基づく症状評価
- 伝統医学（東洋医学）に基づく体質診断
- パーソナライズされた健康アドバイス

## ライセンス

Private Project