import { PhotoCamera } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from '../components/Header';
import { auth, db } from '../firebase';

interface UserProfile {
  nickname: string;
  introduction: string;
  profileImageUrl?: string;
}

const About = () => {
  const [user, authLoading, authError] = useAuthState(auth);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    nickname: '',
    introduction: '',
    profileImageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true); // For initial data loading
  const [saving, setSaving] = useState(false); // For saving process
  const [uploading, setUploading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        // Optionally, redirect to login or show a message
        return;
      }

      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfileData(data);
          setFormData(data); // Initialize form with existing data
          if (data.profileImageUrl) {
            setImagePreview(data.profileImageUrl);
          }
        } else {
          // No profile yet, set defaults or empty
          setProfileData({
            nickname: '未設定のニックネーム',
            introduction: '自己紹介を記入してください。',
            profileImageUrl: '',
          });
          setFormData({ nickname: '', introduction: '', profileImageUrl: '' });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Handle error (e.g., show a message)
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  const handleEditToggle = () => {
    if (isEditMode && profileData) {
      // Cancel edit, revert form data
      setFormData(profileData);
      setImagePreview(profileData.profileImageUrl || null);
      setImageFile(null);
    }
    setIsEditMode(!isEditMode);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleRemoveImage = async (imageUrlToRemove?: string) => {
    const url = imageUrlToRemove || formData.profileImageUrl;
    if (url) {
      try {
        const storage = getStorage();
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
        console.log('Image removed from storage');
      } catch (error) {
        console.error('Error removing image from storage:', error);
        // Potentially show a non-blocking error to user
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let newImageUrl = formData.profileImageUrl || '';

    try {
      // 1. If there's a new image file, upload it
      if (imageFile) {
        setUploading(true);
        // If there was an old image, and it's different from the new potential URL (or if featuredImage was cleared)
        // and it's different from the imageFile we are about to upload.
        if (
          profileData?.profileImageUrl &&
          profileData.profileImageUrl !== imagePreview
        ) {
          await handleRemoveImage(profileData.profileImageUrl);
        }
        const storage = getStorage();
        const imageRef = ref(
          storage,
          `profile-images/${user.uid}/${Date.now()}-${imageFile.name}`
        );
        await uploadBytes(imageRef, imageFile);
        newImageUrl = await getDownloadURL(imageRef);
        setUploading(false);
      } else if (!imagePreview && profileData?.profileImageUrl) {
        // 2. If no new image file, but imagePreview is null (meaning image was removed) and there was an original image.
        await handleRemoveImage(profileData.profileImageUrl);
        newImageUrl = '';
      }

      const updatedProfile: UserProfile = {
        nickname: formData.nickname,
        introduction: formData.introduction,
        profileImageUrl: newImageUrl,
      };

      const userDocRef = doc(db, 'users', user.uid);
      // Use setDoc with merge:true or updateDoc. setDoc is fine if we're managing the whole profile here.
      // If the document might not exist, setDoc is safer initially.
      await setDoc(userDocRef, updatedProfile, { merge: true });

      setProfileData(updatedProfile);
      setFormData(updatedProfile);
      if (updatedProfile.profileImageUrl) {
        setImagePreview(updatedProfile.profileImageUrl);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
      setIsEditMode(false);
      // Show success message
    } catch (error) {
      console.error('Error saving profile:', error);
      // Show error message
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (authLoading || loading) {
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

  if (authError || !user) {
    return (
      <>
        <Header />
        <Box sx={{ textAlign: 'center', mt: 14 }}>
          <Typography variant="h6" color="error">
            {authError
              ? `認証エラー: ${authError.message}`
              : 'プロフィールを表示・編集するにはログインが必要です。'}
          </Typography>
          {/* Optionally, add a login button here */}
        </Box>
      </>
    );
  }

  // Display content (either static or form based on isEditMode)
  return (
    <>
      <Header />
      <Box
        sx={{
          maxWidth: '800px',
          width: '90%',
          px: 2,
          mx: 'auto',
          mt: 14,
          mb: 5,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ textAlign: 'center', mb: 3 }}
        >
          {isEditMode ? 'プロフィール編集' : 'About'}
        </Typography>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {isEditMode ? (
            // EDIT MODE FORM
            <Box component="form" noValidate autoComplete="off">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Avatar
                  src={imagePreview || undefined}
                  sx={{ width: 100, height: 100, mb: { xs: 2, sm: 0 } }}
                />
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                    type="file"
                    onChange={handleImageChange}
                    disabled={saving || uploading}
                  />
                  <label htmlFor="profile-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      disabled={saving || uploading}
                    >
                      {uploading ? 'アップロード中...' : '画像を選択'}
                    </Button>
                  </label>
                  {imagePreview && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        // We don't delete from storage here, only on save if applicable
                      }}
                      disabled={saving || uploading}
                      sx={{ ml: 1 }}
                    >
                      画像を削除
                    </Button>
                  )}
                </Box>
              </Box>

              <TextField
                label="ニックネーム"
                name="nickname"
                fullWidth
                value={formData.nickname}
                onChange={handleChange}
                sx={{ mb: 2 }}
                disabled={saving}
              />
              <TextField
                label="自己紹介"
                name="introduction"
                fullWidth
                multiline
                rows={4}
                value={formData.introduction}
                onChange={handleChange}
                sx={{ mb: 3 }}
                disabled={saving}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleEditToggle}
                  disabled={saving}
                >
                  キャンセル
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || uploading}
                >
                  {saving ? '保存中...' : '保存する'}
                </Button>
              </Box>
            </Box>
          ) : (
            // DISPLAY MODE
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Avatar
                  src={profileData?.profileImageUrl || undefined}
                  alt={profileData?.nickname || 'User Avatar'}
                  sx={{
                    width: 150,
                    height: 150,
                    mb: 2,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  }}
                />
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ textAlign: 'center' }}
                >
                  {profileData?.nickname || 'ニックネーム未設定'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleEditToggle}
                  sx={{ mt: 1 }}
                >
                  プロフィールを編集
                </Button>
              </Box>
              <Box sx={{ flex: 2, minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>
                  自己紹介
                </Typography>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {profileData?.introduction || '自己紹介がありません。'}
                </Typography>
                <Typography variant="caption" color="text.secondary" paragraph>
                  FirebaseとReactで構築されたブログサイトです。
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default About;
