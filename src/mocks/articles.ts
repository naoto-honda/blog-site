// src/mocks/articles.ts

export interface Article {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  content: string;
  imageUrl?: string;
}

export const articles: Article[] = [
  {
    id: '1',
    title: 'Reactの基本を学ぼう',
    description: 'Reactのコンポーネントや状態管理について解説します。',
    publishedAt: '2024-07-01 10:00:00',
    content:
      'ReactはUI構築のためのJavaScriptライブラリです。コンポーネントベースの設計や、useStateやuseEffectといったフックを用いた状態管理が特徴です。',
  },
  {
    id: '2',
    title: 'TypeScript入門',
    description: 'TypeScriptの型やインターフェースの基本を紹介します。',
    publishedAt: '2024-07-02 09:30:00',
    content:
      'TypeScriptはJavaScriptに型の概念を加えた言語です。開発時に型エラーを検出できるため、コードの保守性が向上します。',
  },
  {
    id: '3',
    title: 'MUIでスタイリング',
    description: 'MUI（Material UI）を使ったReactアプリのスタイリング方法。',
    publishedAt: '2024-07-03 08:45:00',
    content:
      'MUIはGoogleのMaterial Designに基づいたReact向けのUIライブラリです。ButtonやCardなど多くのコンポーネントが提供されています。',
  },
  {
    id: '4',
    title: 'Reactの基本を学ぼう',
    description: 'Reactのコンポーネントや状態管理について解説します。',
    publishedAt: '2024-07-01 10:00:00',
    content:
      'Reactの再利用可能なコンポーネントを活用することで、保守性と拡張性に優れたアプリケーションが構築できます。',
  },
  {
    id: '5',
    title: 'TypeScript入門',
    description: 'TypeScriptの型やインターフェースの基本を紹介します。',
    publishedAt: '2024-07-02 09:30:00',
    content:
      'インターフェースを使ってオブジェクトの形を定義することで、明確な設計と安全なコードが可能になります。',
  },
  {
    id: '6',
    title: 'MUIでスタイリング',
    description: 'MUI（Material UI）を使ったReactアプリのスタイリング方法。',
    publishedAt: '2024-07-03 08:45:00',
    content:
      'テーマ機能を使えば、全体のデザインを一貫させることができます。レスポンシブデザインも簡単に実装可能です。',
  },
  {
    id: '7',
    title: 'Reactの基本を学ぼう',
    description: 'Reactのコンポーネントや状態管理について解説します。',
    publishedAt: '2024-07-01 10:00:00',
    content:
      'Reactでは仮想DOMを用いることで、DOM操作のパフォーマンスが向上します。コンポーネント間のデータ共有にはpropsを使用します。',
  },
  {
    id: '8',
    title: 'TypeScript入門',
    description: 'TypeScriptの型やインターフェースの基本を紹介します。',
    publishedAt: '2024-07-02 09:30:00',
    content:
      'TypeScriptはJavaScriptとの互換性が高く、既存のコードベースに導入しやすいのが特徴です。',
  },
  {
    id: '9',
    title: 'MUIでスタイリング',
    description: 'MUI（Material UI）を使ったReactアプリのスタイリング方法。',
    publishedAt: '2024-07-03 08:45:00',
    content:
      'MUIでは、コンポーネントに対して`sx`プロパティで直接スタイルを定義することができ、柔軟なカスタマイズが可能です。',
  },
];
