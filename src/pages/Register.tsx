import { Box, Button, Link, Paper, TextField, Typography } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from '../store/slices/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      dispatch(signInFailure('パスワードが一致しません'));
      return;
    }

    dispatch(signInStart());

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      dispatch(
        signInSuccess({
          email: userCredential.user.email || '',
          uid: userCredential.user.uid,
        })
      );
      navigate('/home');
    } catch (error: any) {
      let errorMessage = 'アカウント作成に失敗しました';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'パスワードは6文字以上である必要があります';
      }
      dispatch(signInFailure(errorMessage));
    }
  };

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
      <Box
        component="img"
        src="./images/blog-image.jpg"
        alt="Blog Logo"
        sx={{
          width: { xs: '90%', sm: '60%', md: '50%' },
          maxWidth: '600px',
          height: 'auto',
          mb: 4,
        }}
      />
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
          アカウント作成
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="メールアドレス"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="パスワード"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <TextField
            label="パスワード（確認）"
            name="confirmPassword"
            type="password"
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              backgroundColor: '#4285f4',
              '&:hover': {
                backgroundColor: '#357abd',
              },
            }}
            disabled={loading}
          >
            {loading ? '作成中...' : 'アカウントを作成'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link component={RouterLink} to="/" underline="hover">
              既にアカウントをお持ちの方はこちら
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;
