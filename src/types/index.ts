import { Timestamp } from 'firebase/firestore';

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  status: 'draft' | 'published';
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewCount: number;
}

export interface ArticleState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  currentArticle: Article | null;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  articleId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  articleCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
