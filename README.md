# My Blog App - ポートフォリオ

## 📋 プロジェクト概要

React + TypeScript + Firebase を使用したフルスタックブログアプリケーションです。モダンな Web 技術を活用し、実用的な機能を備えたブログプラットフォームを構築しました。

## 🚀 デモ

- **URL**: [Vercel でデプロイ後に追加]
- **テストアカウント**:
  - Email: `test@example.com`
  - Password: `password123`

## 🚀 デプロイ

このプロジェクトは Vercel でデプロイすることを想定しています。

### クイックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/blog-site)

### 手動デプロイ

詳細な手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

## 🛠️ 技術スタック

### フロントエンド

- **React 18.2.0** - モダンな UI ライブラリ
- **TypeScript 5.8.3** - 型安全性の確保
- **Material-UI 5.15.11** - プロフェッショナルな UI コンポーネント
- **React Router 6** - SPA のルーティング
- **Redux Toolkit** - 状態管理

### バックエンド・インフラ

- **Firebase Authentication** - ユーザー認証
- **Firestore** - NoSQL データベース
- **Firebase Storage** - 画像ファイル管理
- **Firebase Hosting** - 静的サイトホスティング

### 開発ツール

- **Vite 6.3.5** - 高速なビルドツール
- **ESLint** - コード品質管理
- **TypeScript** - 静的型チェック

## ✨ 主要機能

### 🔐 認証システム

- **ユーザー登録・ログイン** - Firebase Authentication
- **パスワードリセット** - メール認証による安全なリセット
- **セッション管理** - ローカルストレージでの永続化
- **保護されたルート** - 認証状態に基づくアクセス制御

### 📝 記事管理

- **記事の作成・編集・削除** - 完全な CRUD 操作
- **画像アップロード** - Firebase Storage 統合
- **リッチテキストエディタ** - 直感的な記事作成
- **記事一覧表示** - レスポンシブなグリッドレイアウト

### 🔍 検索・フィルタリング

- **リアルタイム検索** - タイトル・内容での検索
- **カテゴリフィルタ** - 記事の分類表示
- **ソート機能** - 日付・タイトルでの並び替え
- **検索結果表示** - ヒット件数の表示

### 📱 レスポンシブデザイン

- **モバイルファースト** - 全デバイス対応
- **Material Design** - 統一された UI/UX
- **アクセシビリティ** - キーボードナビゲーション対応

## 🏗️ アーキテクチャ

### ディレクトリ構造

```
src/
├── components/          # 再利用可能なコンポーネント
├── pages/              # ページコンポーネント
├── hooks/              # カスタムフック
├── store/              # Redux状態管理
├── types/              # TypeScript型定義
├── firebase.ts         # Firebase設定
└── App.tsx            # メインアプリケーション
```

### 状態管理

- **Redux Toolkit** - グローバル状態管理
- **React Hooks** - ローカル状態管理
- **Firebase Hooks** - リアルタイムデータ同期

### セキュリティ

- **Firebase Security Rules** - データベースアクセス制御
- **認証状態の検証** - 全保護ルートでの権限チェック
- **入力値検証** - フロントエンド・バックエンド両方での検証

## 🚀 セットアップ・実行

### 前提条件

- Node.js 18.0.0 以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone [repository-url]
cd blog-site

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルにFirebase設定を追加
```

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

## 📊 パフォーマンス最適化

### 実装済み

- **コード分割** - React.lazy()による遅延読み込み
- **画像最適化** - Firebase Storage での自動最適化
- **バンドルサイズ最適化** - Vite による高速ビルド

### 今後の改善予定

- **メモ化** - React.memo()による再レンダリング最適化
- **仮想スクロール** - 大量データの効率的な表示
- **Service Worker** - オフライン対応

## 🧪 テスト戦略

### 実装予定

- **Jest + React Testing Library** - コンポーネントテスト
- **Cypress** - E2E テスト
- **Firebase Emulator** - ローカルテスト環境

## 🔮 今後の機能拡張

### 高優先度

- [ ] コメント機能
- [ ] ユーザープロフィール管理
- [ ] 記事のカテゴリ・タグ機能
- [ ] いいね・ブックマーク機能

### 中優先度

- [ ] 記事の公開/非公開設定
- [ ] 記事のシェア機能
- [ ] RSS フィード
- [ ] 管理者ダッシュボード

### 低優先度

- [ ] 多言語対応
- [ ] ダークモード
- [ ] PWA 対応
- [ ] 記事の印刷機能

## 🐛 既知の制限事項

1. **画像アップロード** - 現在は Firebase Storage のみ対応
2. **検索機能** - フロントエンド側での検索（バックエンド検索は未実装）
3. **コメント機能** - 未実装
4. **テストコード** - 未実装

## 📈 学習成果

### 技術スキル

- **React Hooks** - useState, useEffect, useContext の活用
- **TypeScript** - 型安全性の確保と開発効率の向上
- **Firebase** - クラウドサービスの実践的な活用
- **Material-UI** - デザインシステムの理解と実装
- **状態管理** - Redux Toolkit による効率的な状態管理

### ソフトスキル

- **プロジェクト管理** - 機能要件の整理と実装計画
- **問題解決** - 技術的課題の調査と解決
- **ドキュメント作成** - コードの可読性と保守性の向上

## 📞 お問い合わせ

- **GitHub**: [GitHub URL]
- **LinkedIn**: [LinkedIn URL]
- **Email**: [Email Address]

---

**開発期間**: 2024 年 1 月 - 現在  
**最終更新**: 2024 年 1 月
