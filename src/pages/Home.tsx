import {
  Box,
  CircularProgress,
  List,
  ListItem,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { auth, db } from '../firebase';

// Define Article interface based on Firestore data structure
interface Article {
  id: string;
  title: string;
  content: string; // Keep content if needed for other parts, or remove if only summary is used
  imageUrl?: string;
  createdAt: Date; // Assuming createdAt is a Firebase Timestamp, will be converted to Date
  authorId: string; // Added authorId
  // Add other fields if necessary, e.g., summary
}

const Home = () => {
  const [user, authLoading] = useAuthState(auth);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const articlesLimit = 3; // Number of articles to show on home

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    // No need to block rendering if user is not logged in for Home page,
    // but fetchArticles will only run if user is available.
    // Or, we could show a generic "latest articles" if not logged in.
    // For now, let's keep it simple: fetch user's articles if logged in.

    const fetchArticles = async () => {
      if (!user) {
        // Only fetch if user is logged in
        setLoading(false);
        setArticles([]); // Clear articles if user logs out
        // Optionally set a message like "Login to see your articles"
        return;
      }
      setLoading(true);
      setFetchError(null);
      try {
        const q = query(
          collection(db, 'articles'),
          where('authorId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(articlesLimit)
        );
        const querySnapshot = await getDocs(q);
        const articlesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          authorId: doc.data().authorId,
        })) as Article[];
        setArticles(articlesData);
      } catch (err) {
        console.error('ホームページ記事の取得に失敗しました:', err);
        setFetchError('記事の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [user, authLoading]);

  // getDate function is no longer needed as we fetch actual data
  // const getDate = (): string => { ... };

  // Determine what to display based on loading states and data
  let articleContent;
  if (loading || authLoading) {
    articleContent = (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  } else if (fetchError) {
    articleContent = (
      <Typography color="error" sx={{ textAlign: 'center' }}>
        {fetchError}
      </Typography>
    );
  } else if (!user) {
    articleContent = (
      <Typography sx={{ textAlign: 'center' }}>
        ログインしてあなたの記事を表示しましょう。
      </Typography>
    );
  } else if (articles.length === 0) {
    articleContent = (
      <Typography sx={{ textAlign: 'center' }}>
        まだ投稿した記事がありません。新しい記事を作成しましょう！
      </Typography>
    );
  } else {
    articleContent = (
      <List sx={{ width: '100%' }}>
        {articles.map((article) => (
          <ListItem key={article.id} sx={{ width: '100%', mb: 2 }}>
            <ArticleCard
              id={article.id}
              title={article.title}
              imageUrl={article.imageUrl}
              createdAt={article.createdAt.toISOString()}
              sx={{ width: '100%' }}
            />
          </ListItem>
        ))}
        {user && articles.length > 0 && (
          <ListItem sx={{ justifyContent: 'center', mt: 2 }}>
            <MuiLink
              component={Link}
              to="/articles"
              underline="hover"
              sx={{ fontWeight: 'bold' }}
            >
              記事一覧へ
            </MuiLink>
          </ListItem>
        )}
      </List>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ width: '95%', mx: 'auto', mt: 14, height: 'auto' }}>
        <Box
          component="img"
          src="./images/blog-image.jpg" // This can remain a static image
          alt="Blog main image"
          sx={{
            width: '100%',
            height: 'auto',
            mb: 3,
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: {
              lg: 'row',
              md: 'row',
              sm: 'column-reverse',
              xs: 'column-reverse',
            },
            gap: 2,
            alignItems: 'flex-start',
          }}
        >
          <Sidebar />{' '}
          {/* Sidebar might also need to fetch dynamic data if it displays articles */}
          <Box
            sx={{
              width: { lg: '70%', md: '70%', sm: '100%', xs: '100%' },
              height: 'auto',
              boxShadow: 3,
              p: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                mb: 2, // Added margin bottom for spacing
              }}
            >
              {user ? '最近のあなたの記事' : '記事'}
            </Typography>
            {articleContent}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Home;
