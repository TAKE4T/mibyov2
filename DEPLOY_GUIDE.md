# Render デプロイガイド

両方のサービスを Render でデプロイする手順です。

## 🎯 デプロイ構成

```
Frontend (Static Site) → Backend (Web Service)
https://mibyou-diagnosis-frontend.onrender.com → https://mibyou-diagnosis-api.onrender.com
```

## 📋 事前準備

1. **GitHub リポジトリにコードをプッシュ済み**
2. **Render アカウント作成** (https://render.com)
3. **必要な環境変数を準備**（Firebase、OpenAI API Key）

## 🚀 デプロイ手順

### 1. Backend (API) のデプロイ

1. **Render Dashboard** → **New** → **Web Service**
2. **Connect Repository**: `TAKE4T/mibyov2` を選択
3. **設定**:
   - **Name**: `mibyou-diagnosis-api`
   - **Root Directory**: `/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **環境変数設定**:
   ```
   NODE_ENV=production
   PORT=3000
   OPENAI_API_KEY=sk-xxxxx (実際のキーを設定)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id  
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_CLIENT_ID=your-client-id
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   FRONTEND_URL=https://mibyou-diagnosis-frontend.onrender.com
   ```

5. **Deploy** ボタンをクリック

### 2. Frontend (Static Site) のデプロイ

1. **Render Dashboard** → **New** → **Static Site**
2. **Connect Repository**: `TAKE4T/mibyov2` を選択
3. **設定**:
   - **Name**: `mibyou-diagnosis-frontend`
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`

4. **環境変数設定**:
   ```
   VITE_API_URL=https://mibyou-diagnosis-api.onrender.com/api
   ```

5. **Deploy** ボタンをクリック

## ⚙️ 重要な設定ポイント

### Backend
- ✅ **Health Check**: `/health` エンドポイントで自動監視
- ✅ **CORS設定**: Frontend URLを許可
- ✅ **Rate Limiting**: 15分間で100リクエスト制限
- ✅ **Auto-scaling**: CPU 70%で最大3インスタンス

### Frontend  
- ✅ **SPA Routing**: すべてのルートを `/index.html` にリダイレクト
- ✅ **Security Headers**: XSS保護設定済み
- ✅ **Pull Request Previews**: 有効化済み

## 🔧 デプロイ後の確認

### 1. Backend 確認
```bash
curl https://mibyou-diagnosis-api.onrender.com/health
```
正常レスポンス:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "mibyou-diagnosis-api"
}
```

### 2. Frontend 確認
ブラウザで `https://mibyou-diagnosis-frontend.onrender.com` にアクセス

### 3. API 連携確認
Frontend から診断を実行して Backend への API 通信を確認

## 🚨 トラブルシューティング

### よくある問題

**❌ Build Failed (Backend)**
- 環境変数が設定されているか確認
- `package.json` の `scripts.start` が `node server.js` になっているか確認

**❌ Build Failed (Frontend)**  
- `Root Directory` が `/frontend` になっているか確認
- `Build Command` が `npm ci && npm run build` になっているか確認

**❌ CORS Error**
- Backend の `FRONTEND_URL` 環境変数が正しいか確認
- Frontend の `VITE_API_URL` が正しいか確認

**❌ Free Plan Sleep**
- Render Free Plan は15分間アクセスがないとスリープします
- 初回アクセス時に起動まで30秒程度かかる場合があります

## 📊 監視とメンテナンス

### ログ確認
- Render Dashboard → サービス選択 → **Logs** タブ

### 再デプロイ
- **Manual Deploy** ボタンで手動再デプロイ
- GitHub にプッシュで自動デプロイ

### アップデート手順
1. ローカルで変更
2. `git push origin main`
3. Render が自動的に再デプロイ

## 🎉 完了!

両方のサービスが正常にデプロイされれば、以下のURLでアクセス可能です:

- **Frontend**: https://mibyou-diagnosis-frontend.onrender.com
- **Backend API**: https://mibyou-diagnosis-api.onrender.com

---

💡 **ヒント**: 初回デプロイ時は Backend を先にデプロイしてから Frontend をデプロイすることを推奨します。