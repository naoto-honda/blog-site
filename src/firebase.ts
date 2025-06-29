// src/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { collection, getFirestore } from 'firebase/firestore';

// 環境変数からFirebase設定を取得
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyBq3ySJQFFr14cjGCn-4dizZD6YvgVNDbg',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'my-blog-app-d10b4.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'my-blog-app-d10b4',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'my-blog-app-d10b4.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '210864260533',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:210864260533:web:9e365c88173f9bc65ec5fc',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-K9V1N9MQTM',
};

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
