import { PhotoCamera } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { auth, db } from '../firebase';

const CreatePost = () => {
  const { id: articleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(articleId);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featuredImage: '',
  });
  const [errors, setErrors] = useState({
    title: '',
    content: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [originalAuthorId, setOriginalAuthorId] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');

  useEffect(() => {
    if (isEditMode && articleId) {
      setPageLoading(true);
      const fetchArticleData = async () => {
        try {
          const articleRef = doc(db, 'articles', articleId);
          const docSnap = await getDoc(articleRef);
          if (docSnap.exists()) {
            const articleData = docSnap.data();
            if (auth.currentUser?.uid !== articleData.authorId) {
              alert('この記事を編集する権限がありません。');
              navigate('/articles');
              return;
            }
            setFormData({
              title: articleData.title || '',
              content: articleData.content || '',
              featuredImage: articleData.imageUrl || '',
            });
            if (articleData.imageUrl) {
              setImagePreview(articleData.imageUrl);
              setOriginalImageUrl(articleData.imageUrl);
            }
            setOriginalAuthorId(articleData.authorId);
          } else {
            alert('編集する記事が見つかりません。');
            navigate('/articles');
          }
        } catch (error) {
          console.error('記事データの取得エラー:', error);
          alert('記事データの取得に失敗しました。');
          navigate('/articles');
        } finally {
          setPageLoading(false);
        }
      };
      fetchArticleData();
    } else {
      setPageLoading(false);
    }
  }, [articleId, isEditMode, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const storage = getStorage();
      const imageRef = ref(
        storage,
        `featured-images/${Date.now()}-${file.name}`
      );
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      throw new Error('画像アップロードに失敗しました。');
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { title: '', content: '' };
    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です。';
      isValid = false;
    }
    if (!formData.content.trim()) {
      newErrors.content = '内容は必須です。';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleRemoveImage = async () => {
    const imageUrlToDelete = formData.featuredImage;

    if (imageUrlToDelete) {
      try {
        const storage = getStorage();
        const imageRefToDelete = ref(storage, imageUrlToDelete);
        await deleteObject(imageRefToDelete);
        console.log('画像がStorageから削除されました。');
        if (imageUrlToDelete === originalImageUrl) {
          setOriginalImageUrl('');
        }
      } catch (error) {
        console.error('画像の削除エラー (Storage):', error);
        alert(
          '画像の削除に失敗しました。Storage上のファイルが残っている可能性があります。'
        );
      }
    }
    setFormData((prev) => ({ ...prev, featuredImage: '' }));
    setImagePreview(null);
    setImageFile(null);
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;
    if (!auth.currentUser) {
      alert('ログインが必要です。');
      navigate('/');
      return;
    }

    setLoading(true);
    let finalImageUrl = formData.featuredImage;

    try {
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);

        if (
          isEditMode &&
          originalImageUrl &&
          originalImageUrl !== finalImageUrl
        ) {
          try {
            const storage = getStorage();
            const oldImageRef = ref(storage, originalImageUrl);
            await deleteObject(oldImageRef);
            console.log(
              '古い画像がStorageから削除されました (フォーム送信時)。'
            );
            setOriginalImageUrl('');
          } catch (error) {
            console.error('古い画像の削除エラー (フォーム送信時):', error);
            alert(
              '古い画像の削除に失敗しました。Storageに不要なファイルが残っている可能性があります。'
            );
          }
        }
      } else if (!formData.featuredImage && originalImageUrl && isEditMode) {
        if (originalImageUrl) {
          try {
            const storage = getStorage();
            const oldImageRef = ref(storage, originalImageUrl);
            await deleteObject(oldImageRef);
            console.log(
              '元の画像がStorageから削除されました (フォーム送信時、画像なし更新)。'
            );
            setOriginalImageUrl('');
          } catch (error) {
            console.error(
              '元の画像の削除エラー (フォーム送信時、画像なし更新):',
              error
            );
            alert(
              '元の画像の削除に失敗しました。Storageに不要なファイルが残っている可能性があります。'
            );
          }
        }
      }

      const articleDataToSave: any = {
        title: formData.title,
        content: formData.content,
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode && articleId) {
        if (auth.currentUser.uid !== originalAuthorId) {
          alert('編集中に権限エラーが発生しました。');
          setLoading(false);
          return;
        }
        const articleRef = doc(db, 'articles', articleId);
        await updateDoc(articleRef, articleDataToSave);
        alert('記事が更新されました。');
        navigate(`/articles/${articleId}`);
      } else {
        const newArticleData = {
          ...articleDataToSave,
          createdAt: serverTimestamp(),
          authorId: auth.currentUser.uid,
          authorEmail: auth.currentUser.email,
        };
        await addDoc(collection(db, 'articles'), newArticleData);
        alert('記事が投稿されました。');
        navigate('/articles');
      }
    } catch (error) {
      console.error('記事の処理に失敗しました:', error);
      alert(`記事の${isEditMode ? '更新' : '投稿'}に失敗しました。`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  if (pageLoading && isEditMode) {
    return (
      <>
        <Header />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 64px)',
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ width: '80%', mx: 'auto', mt: 14, mb: 5 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          {isEditMode ? '記事を編集' : '記事を作成'}
        </Typography>
        <Box sx={{ backgroundColor: 'white', p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              タイトル
            </Typography>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              内容
            </Typography>
            <TextField
              label="Content"
              name="content"
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              value={formData.content}
              onChange={handleChange}
              error={!!errors.content}
              helperText={errors.content}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              アイキャッチ画像
            </Typography>
            <TextField
              type="file"
              inputProps={{
                accept: 'image/*',
              }}
              sx={{ display: 'none' }}
              id="featured-image"
              onChange={handleImageChange}
              key={imageFile ? 'file-selected' : 'file-empty'}
            />
            <label htmlFor="featured-image">
              <IconButton
                color="primary"
                aria-label="upload image"
                component="span"
                disabled={uploading}
              >
                <PhotoCamera />
              </IconButton>
              <Typography
                variant="body1"
                component="span"
                sx={{ ml: 1, verticalAlign: 'middle' }}
              >
                {uploading
                  ? 'アップロード中...'
                  : imagePreview
                  ? '画像を変更'
                  : '画像をアップロード'}
              </Typography>
            </label>
            {imagePreview && (
              <Box sx={{ mt: 2 }}>
                <Card
                  sx={{
                    maxWidth: '300px',
                    display: 'inline-block',
                    verticalAlign: 'top',
                  }}
                >
                  <CardMedia
                    component="img"
                    image={imagePreview}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                </Card>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{ ml: 2, verticalAlign: 'top' }}
                  disabled={uploading}
                >
                  画像を削除
                </Button>
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={handleFormSubmit}
              disabled={loading || uploading}
              sx={{
                minWidth: 200,
                backgroundColor: '#998675',
                '&:hover': {
                  backgroundColor: '#998675',
                },
              }}
            >
              {loading
                ? isEditMode
                  ? '更新中...'
                  : '投稿中...'
                : isEditMode
                ? '更新する'
                : '投稿する'}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default CreatePost;
