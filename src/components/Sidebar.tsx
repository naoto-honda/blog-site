import {
  Box,
  CardMedia,
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
import { Link as RouterLink } from 'react-router-dom';
import { auth, db } from '../firebase';

// Define Article interface based on Firestore data structure
interface Article {
  id: string;
  title: string;
  imageUrl?: string;
  createdAt: Date; // Assuming createdAt is a Firebase Timestamp, will be converted to Date
  authorId: string; // Added authorId
  // Add other fields if necessary, e.g., summary, viewCount for popular articles
}

const Sidebar = () => {
  const [user, authLoading] = useAuthState(auth);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const maxArticles = 3; // Number of articles to display in the sidebar

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    const fetchArticles = async () => {
      if (!user) {
        // Only fetch if user is logged in
        setLoading(false);
        setArticles([]);
        return;
      }
      setLoading(true);
      setFetchError(null);
      try {
        const q = query(
          collection(db, 'articles'),
          where('authorId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(maxArticles)
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
        console.error('サイドバー記事の取得に失敗しました:', err);
        setFetchError('記事の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [user, authLoading]);

  let content;
  if (loading || authLoading) {
    content = (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100px',
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  } else if (fetchError) {
    content = (
      <Typography
        color="error"
        sx={{ textAlign: 'center', fontSize: '0.875rem' }}
      >
        {fetchError}
      </Typography>
    );
  } else if (!user) {
    content = (
      <Typography sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
        あなたの記事はありません
      </Typography>
    ); // Or hide sidebar/show login prompt
  } else if (articles.length === 0) {
    content = (
      <Typography sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
        投稿記事がありません
      </Typography>
    );
  } else {
    content = (
      <List sx={{ width: '100%' }}>
        {articles.map((article) => (
          <ListItem
            key={article.id}
            sx={{
              width: '100%',
              p: 0,
              mb: 1.5,
              backgroundColor: 'white',
              borderRadius: 2,
            }}
          >
            <MuiLink
              component={RouterLink}
              to={`/articles/${article.id}`}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1 /* Added padding to Link */,
              }}
            >
              {article.imageUrl ? (
                <CardMedia
                  component="img"
                  image={article.imageUrl}
                  alt={article.title}
                  sx={{
                    width: 40,
                    height: 40,
                    objectFit: 'cover',
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.200',
                    border: '1px solid',
                    borderColor: 'grey.300',
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    noImg
                  </Typography>
                </Box>
              )}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'medium',
                  flexGrow: 1,
                  ml: 1,
                  lineHeight: 1.4,
                }}
              >
                {' '}
                {/* Adjusted typography */}
                {article.title}
              </Typography>
            </MuiLink>
          </ListItem>
        ))}
      </List>
    );
  }

  return (
    <Box
      sx={{
        width: { lg: '30%', md: '30%', sm: '100%', xs: '100%' },
        height: 'auto',
        boxShadow: 3,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper', // Added background color for consistency
      }}
    >
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
        {user ? 'あなたの最近の記事' : '記事'}
      </Typography>
      {content}
    </Box>
  );
};

export default Sidebar;
