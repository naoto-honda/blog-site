import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from '../components/Header';
import { auth, db } from '../firebase';

const Contact = () => {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    // 送信ステータスをクリア
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: '', email: '', message: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'お名前を入力してください';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
      valid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'メッセージを入力してください';
      valid = false;
    } else if (formData.message.length < 10) {
      newErrors.message = 'メッセージは10文字以上で入力してください';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Firestoreにコンタクト情報を保存
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        userId: user?.uid || null,
        userEmail: user?.email || null,
        createdAt: serverTimestamp(),
        status: 'new', // new, read, replied
        ipAddress: null, // 必要に応じて追加
      };

      await addDoc(collection(db, 'contacts'), contactData);

      // 成功時の処理
      setSubmitStatus({
        type: 'success',
        message: 'お問い合わせを送信しました。ありがとうございます。',
      });

      // フォームをリセット
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus({
        type: 'error',
        message:
          '送信に失敗しました。しばらく時間をおいてから再試行してください。',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          maxWidth: '700px',
          width: '90%',
          px: 2,
          mx: 'auto',
          mt: 14,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          📧 お問い合わせ
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 3 }}
        >
          ご質問やご意見がございましたら、お気軽にお問い合わせください。
        </Typography>

        <Paper
          elevation={3}
          sx={{
            maxWidth: 600,
            width: '100%',
            p: 4,
            backgroundColor: '#fff',
            borderRadius: 2,
            mt: 3.5,
            mx: 'auto',
          }}
        >
          {/* 送信ステータス表示 */}
          {submitStatus.type && (
            <Alert
              severity={submitStatus.type}
              sx={{ mb: 3 }}
              onClose={() => setSubmitStatus({ type: null, message: '' })}
            >
              {submitStatus.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="お名前 *"
              name="name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
              placeholder="山田 太郎"
            />
            <TextField
              label="メールアドレス *"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              placeholder="example@email.com"
            />
            <TextField
              label="メッセージ *"
              name="message"
              fullWidth
              margin="normal"
              multiline
              rows={6}
              value={formData.message}
              onChange={handleChange}
              error={!!errors.message}
              helperText={errors.message || '10文字以上で入力してください'}
              disabled={loading}
              placeholder="お問い合わせ内容を詳しくお聞かせください..."
            />

            <Box mt={3} textAlign="right">
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                  '&:disabled': {
                    backgroundColor: '#bdbdbd',
                  },
                  minWidth: 120,
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ mr: 1, color: 'white' }}
                    />
                    送信中...
                  </>
                ) : (
                  '送信する'
                )}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* 追加情報 */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ※ 通常2-3営業日以内にご返信いたします
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ※ ログイン済みの場合は、アカウント情報と紐付けて保存されます
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default Contact;
