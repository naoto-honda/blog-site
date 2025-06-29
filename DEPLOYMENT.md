# Vercel デプロイ手順

## 📋 前提条件

- GitHub アカウント
- Vercel アカウント
- Firebase プロジェクト

## 🚀 デプロイ手順

### 1. GitHub にリポジトリをプッシュ

```bash
# 現在のディレクトリでGitリポジトリを初期化
git init

# ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit"

# GitHubリポジトリを作成し、リモートを追加
git remote add origin https://github.com/yourusername/blog-site.git

# プッシュ
git push -u origin main
```

### 2. Vercel でプロジェクトをインポート

1. [Vercel](https://vercel.com) にアクセス
2. GitHub アカウントでログイン
3. "New Project" をクリック
4. GitHub リポジトリを選択
5. プロジェクト設定を確認

### 3. 環境変数の設定

Vercel のプロジェクト設定で以下の環境変数を追加：

```
VITE_FIREBASE_API_KEY=AIzaSyBq3ySJQFFr14cjGCn-4dizZD6YvgVNDbg
VITE_FIREBASE_AUTH_DOMAIN=my-blog-app-d10b4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-blog-app-d10b4
VITE_FIREBASE_STORAGE_BUCKET=my-blog-app-d10b4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=210864260533
VITE_FIREBASE_APP_ID=1:210864260533:web:9e365c88173f9bc65ec5fc
VITE_FIREBASE_MEASUREMENT_ID=G-K9V1N9MQTM
```

### 4. ビルド設定

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. デプロイ

"Deploy" ボタンをクリックしてデプロイを開始

## 🔧 トラブルシューティング

### ビルドエラーが発生する場合

1. **依存関係の確認**

   ```bash
   npm install
   ```

2. **TypeScript エラーの確認**

   ```bash
   npm run build
   ```

3. **環境変数の確認**
   - Vercel の環境変数が正しく設定されているか確認
   - 環境変数名が `VITE_` で始まっているか確認

### ルーティングエラーが発生する場合

1. **vercel.json の確認**

   - SPA ルーティングの設定が正しいか確認

2. **React Router の設定確認**
   - BrowserRouter が正しく設定されているか確認

### Firebase 接続エラーが発生する場合

1. **Firebase 設定の確認**

   - 環境変数が正しく設定されているか確認
   - Firebase プロジェクトの設定を確認

2. **Firebase Hosting の設定**
   - Firebase Console でホスティング設定を確認

## 📊 デプロイ後の確認事項

### 1. 基本機能のテスト

- [ ] ページの読み込み
- [ ] ユーザー登録・ログイン
- [ ] 記事の作成・編集・削除
- [ ] 画像アップロード
- [ ] パスワードリセット

### 2. パフォーマンスの確認

- [ ] ページ読み込み速度
- [ ] 画像の最適化
- [ ] モバイル表示

### 3. SEO の確認

- [ ] メタタグの設定
- [ ] ページタイトルの設定
- [ ] 構造化データの確認

## 🔄 継続的デプロイ

### GitHub との連携

1. **自動デプロイの設定**

   - main ブランチへのプッシュで自動デプロイ
   - プレビューデプロイの設定

2. **環境別デプロイ**
   - Production: main ブランチ
   - Preview: feature ブランチ

### カスタムドメインの設定

1. **ドメインの追加**

   - Vercel プロジェクト設定でカスタムドメインを追加

2. **DNS 設定**
   - ドメインプロバイダーで DNS レコードを設定

## 📈 監視・分析

### Vercel Analytics

- ページビューの追跡
- パフォーマンスの監視
- エラーの追跡

### Firebase Analytics

- ユーザー行動の分析
- 機能使用状況の追跡

## 🔒 セキュリティ

### 環境変数の管理

- 機密情報は環境変数で管理
- 本番環境では異なる Firebase プロジェクトを使用

### Firebase Security Rules

- Firestore のセキュリティルールを設定
- Storage のセキュリティルールを設定

---

**注意**: 本番環境では、Firebase 設定を本番用のプロジェクトに変更することを推奨します。
