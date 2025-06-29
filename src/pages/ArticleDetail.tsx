// pages/ArticleDetail.tsx
import {
  Alert,
  AlertProps,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link as MuiLink,
  Snackbar,
  Typography,
} from '@mui/material';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { auth, db } from '../firebase';

interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertProps['severity']>('success');

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setArticle({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            authorId: data.authorId,
          } as Article);
        } else {
          setError('記事が見つかりません。');
        }
      } catch (err) {
        console.error('記事の取得に失敗しました:', err);
        setError('記事の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const showSnackbar = (message: string, severity: AlertProps['severity']) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleDeleteArticle = async () => {
    if (!id || !article) return;
    if (auth.currentUser?.uid !== article.authorId) {
      showSnackbar('この記事を削除する権限がありません。', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      if (article.imageUrl) {
        try {
          const storage = getStorage();
          const imageRef = ref(storage, article.imageUrl);
          await deleteObject(imageRef);
          console.log('アイキャッチ画像がStorageから削除されました。');
        } catch (storageError) {
          console.error('Storageからの画像削除に失敗しました:', storageError);
          showSnackbar(
            'アイキャッチ画像の削除に失敗しました。Storageにファイルが残る可能性があります。',
            'warning'
          );
        }
      }

      const articleRef = doc(db, 'articles', id);
      await deleteDoc(articleRef);
      showSnackbar('記事が削除されました。', 'success');
      navigate('/articles');
    } catch (err) {
      console.error('記事の削除に失敗しました:', err);
      showSnackbar('記事の削除に失敗しました。', 'error');
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/articles/${id}/edit`);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 14 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Header />
        <Box sx={{ width: '80%', mx: 'auto', mt: 14 }}>
          <Typography variant="h6" color="error">
            {error || '記事が見つかりません。'}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <MuiLink
              component={Link}
              to="/articles"
              underline="hover"
              sx={{ fontWeight: 'bold' }}
            >
              記事一覧へ戻る
            </MuiLink>
          </Box>
        </Box>
      </>
    );
  }

  const isAuthor = auth.currentUser?.uid === article.authorId;

  return (
    <>
      <Header />
      <Box sx={{ width: '80%', mx: 'auto', mt: 14, mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          {article.title}
        </Typography>
        {article.imageUrl ? (
          <Box
            component="img"
            src={article.imageUrl}
            alt={article.title}
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '400px',
              objectFit: 'cover',
              mb: 3,
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '200px',
              maxHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed grey',
              mb: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              noImage
            </Typography>
          </Box>
        )}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          作成日時: {new Date(article.createdAt).toLocaleDateString()}{' '}
          {new Date(article.createdAt).toLocaleTimeString()}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          更新日時: {new Date(article.updatedAt).toLocaleDateString()}{' '}
          {new Date(article.updatedAt).toLocaleTimeString()}
        </Typography>
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-line', mb: 4, mt: 2 }}
        >
          {article.content}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mt: 3,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isAuthor && (
              <Button variant="outlined" color="primary" onClick={handleEdit}>
                編集
              </Button>
            )}
            {isAuthor && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleOpenDeleteDialog}
                disabled={isDeleting}
              >
                {isDeleting ? '削除中...' : '削除'}
              </Button>
            )}
          </Box>
          <MuiLink
            component={Link}
            to="/articles"
            underline="hover"
            sx={{ fontWeight: 'bold' }}
          >
            記事一覧へ戻る
          </MuiLink>
        </Box>
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">記事の削除</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            本当にこの記事を削除しますか？この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            color="primary"
            disabled={isDeleting}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteArticle}
            color="error"
            autoFocus
            disabled={isDeleting}
          >
            {isDeleting ? '削除中...' : '削除する'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ArticleDetail;
