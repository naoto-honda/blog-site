// pages/Articles.tsx
import { Clear, Search } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import ArticleCard from '../components/ArticleCard';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { auth, db } from '../firebase';

// Define Article interface based on Firestore data structure
interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  authorId: string;
  category?: string;
  tags?: string[];
}

const Articles = () => {
  const [user, authLoading] = useAuthState(auth);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    const fetchArticles = async () => {
      if (!user) {
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
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const articlesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          authorId: doc.data().authorId,
        })) as Article[];
        setArticles(articlesData);
        setFilteredArticles(articlesData);
      } catch (err) {
        console.error('記事の取得に失敗しました:', err);
        setFetchError('記事の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [user, authLoading]);

  // Filter and search articles
  useEffect(() => {
    let filtered = [...articles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (article) => article.category === selectedCategory
      );
    }

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredArticles(filtered);
  }, [articles, searchTerm, selectedCategory, sortBy]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleCategoryChange = (e: any) => {
    setSelectedCategory(e.target.value);
  };

  const handleSortChange = (e: any) => {
    setSortBy(e.target.value);
  };

  // Get unique categories from articles
  const categories = [
    'all',
    ...Array.from(
      new Set(articles.map((article) => article.category).filter(Boolean))
    ),
  ];

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
        ログインして記事を表示しましょう。
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
      <>
        {/* Search and Filter Controls */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="記事を検索..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClearSearch} size="small">
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>カテゴリ</InputLabel>
                <Select
                  value={selectedCategory}
                  label="カテゴリ"
                  onChange={handleCategoryChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category === 'all' ? 'すべて' : category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>並び順</InputLabel>
                <Select
                  value={sortBy}
                  label="並び順"
                  onChange={handleSortChange}
                >
                  <MenuItem value="newest">新しい順</MenuItem>
                  <MenuItem value="oldest">古い順</MenuItem>
                  <MenuItem value="title">タイトル順</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Search Results Summary */}
          {searchTerm && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                検索結果: "{searchTerm}" で {filteredArticles.length}{' '}
                件の記事が見つかりました
              </Typography>
            </Box>
          )}
        </Box>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>
            条件に一致する記事が見つかりませんでした。
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {filteredArticles.map((article) => (
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
          </List>
        )}
      </>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ width: '95%', mx: 'auto', mt: 14, height: 'auto' }}>
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
          <Sidebar />
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
                mb: 2,
              }}
            >
              記事一覧
            </Typography>
            {articleContent}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Articles;
