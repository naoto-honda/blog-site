// src/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { collection, getFirestore } from 'firebase/firestore';

// Firebase設定（本番環境では環境変数を使用）
const firebaseConfig = {
  apiKey: 'AIzaSyBq3ySJQFFr14cjGCn-4dizZD6YvgVNDbg',
  authDomain: 'my-blog-app-d10b4.firebaseapp.com',
  projectId: 'my-blog-app-d10b4',
  storageBucket: 'my-blog-app-d10b4.firebasestorage.app',
  messagingSenderId: '210864260533',
  appId: '1:210864260533:web:9e365c88173f9bc65ec5fc',
  measurementId: 'G-K9V1N9MQTM',
};

// 開発環境でのデバッグ用
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// 認証の永続性を設定
setPersistence(auth, browserLocalPersistence);

// Firestoreの初期化
export const db = getFirestore(app);

// コレクションの参照を追加
export const articlesRef = collection(db, 'articles');
export const tagsRef = collection(db, 'tags');
export const commentsRef = collection(db, 'comments');
export const userProfilesRef = collection(db, 'userProfiles');
