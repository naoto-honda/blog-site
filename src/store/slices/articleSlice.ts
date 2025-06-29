import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Article, ArticleState } from '../../types';

const initialState: ArticleState = {
  articles: [],
  loading: false,
  error: null,
  currentArticle: null,
};

// 記事一覧を取得
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async () => {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Article)
    );
  }
);

// 新規記事を作成
export const createArticle = createAsyncThunk(
  'articles/createArticle',
  async (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const articlesRef = collection(db, 'articles');
    const now = Timestamp.now();
    const newArticle = {
      ...article,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
    };
    const docRef = await addDoc(articlesRef, newArticle);
    return { id: docRef.id, ...newArticle } as Article;
  }
);

// 記事を更新
export const updateArticle = createAsyncThunk(
  'articles/updateArticle',
  async ({ id, data }: { id: string; data: Partial<Article> }) => {
    const articleRef = doc(db, 'articles', id);
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(articleRef, updateData);
    return { id, ...updateData };
  }
);

// 記事を削除
export const deleteArticle = createAsyncThunk(
  'articles/deleteArticle',
  async (id: string) => {
    const articleRef = doc(db, 'articles', id);
    await deleteDoc(articleRef);
    return id;
  }
);

export const articleSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    setCurrentArticle: (state, action) => {
      state.currentArticle = action.payload;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchArticles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '記事の取得に失敗しました';
      })
      // createArticle
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.articles.unshift(action.payload);
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '記事の作成に失敗しました';
      })
      // updateArticle
      .addCase(updateArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.articles.findIndex(
          (article) => article.id === action.payload.id
        );
        if (index !== -1) {
          state.articles[index] = {
            ...state.articles[index],
            ...action.payload,
          };
        }
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '記事の更新に失敗しました';
      })
      // deleteArticle
      .addCase(deleteArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = state.articles.filter(
          (article) => article.id !== action.payload
        );
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '記事の削除に失敗しました';
      });
  },
});

export const { setCurrentArticle, clearCurrentArticle } = articleSlice.actions;
export default articleSlice.reducer;
