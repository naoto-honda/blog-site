import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { confirmPasswordReset } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../firebase';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { password: '', confirmPassword: '' };

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください。';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください。';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードを再入力してください。';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません。';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!oobCode) {
      setMessage('無効なリセットリンクです。');
      setIsError(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await confirmPasswordReset(auth, oobCode, formData.password);
      setMessage(
        'パスワードが正常に変更されました。ログインページに移動します。'
      );
      setIsError(false);

      // 3秒後にログインページにリダイレクト
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);

      if (error.code === 'auth/expired-action-code') {
        setMessage(
          'リセットリンクの有効期限が切れています。新しいリセットメールを送信してください。'
        );
      } else if (error.code === 'auth/invalid-action-code') {
        setMessage('無効なリセットリンクです。');
      } else if (error.code === 'auth/weak-password') {
        setMessage(
          'パスワードが弱すぎます。より強力なパスワードを設定してください。'
        );
      } else {
        setMessage(
          'パスワードの変更に失敗しました。しばらくしてから再試行してください。'
        );
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#eeedeb',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: { xs: '90%', sm: '400px' },
            backgroundColor: '#fff',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ textAlign: 'center', color: 'error.main' }}
          >
            ❌ 無効なリンク
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }}>
            このリセットリンクは無効です。
            <br />
            新しいパスワードリセットメールを送信してください。
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/')}
            sx={{
              py: 1.5,
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            ログインページに戻る
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eeedeb',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: { xs: '90%', sm: '400px' },
          backgroundColor: '#fff',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3 }}
        >
          🔐 新しいパスワードを設定
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: 'center' }}
        >
          新しいパスワードを入力してください。
          <br />
          セキュリティのため、6文字以上で設定してください。
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="新しいパスワード"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            required
            placeholder="6文字以上で入力"
          />

          <TextField
            label="パスワード（確認）"
            name="confirmPassword"
            type="password"
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            required
            placeholder="同じパスワードを再入力"
          />

          {message && (
            <Alert
              severity={isError ? 'error' : 'success'}
              sx={{ mt: 2, mb: 2 }}
            >
              {message}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
              '&:disabled': {
                backgroundColor: '#bdbdbd',
              },
            }}
            disabled={loading}
          >
            {loading ? '変更中...' : 'パスワードを変更'}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/')}
            sx={{
              py: 1.5,
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            ログインページに戻る
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
