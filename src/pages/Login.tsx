// src/components/Login.tsx
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from '../store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State for password reset
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isResetError, setIsResetError] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(signInStart());
    setResetMessage(''); // Clear any previous reset messages

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // ユーザー情報をReduxストアに保存
      dispatch(
        signInSuccess({
          email: userCredential.user.email,
          uid: userCredential.user.uid,
        })
      );

      // ローカルストレージにユーザー情報を保存（開発用）
      localStorage.setItem(
        'user',
        JSON.stringify({
          email: userCredential.user.email,
          uid: userCredential.user.uid,
        })
      );

      navigate('/home');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage =
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。';

      // Firebase特有のエラーコードに基づいてメッセージをカスタマイズ
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'メールアドレスまたはパスワードが間違っています。';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage =
          'ログイン試行回数が多すぎます。しばらく時間をおいてから再試行してください。';
      }

      dispatch(signInFailure(errorMessage));
    }
  };

  const handleToggleResetForm = () => {
    setShowResetForm(!showResetForm);
    setResetMessage(''); // Clear message when toggling form
    setResetEmail(''); // Clear email when toggling form
    setResetSuccess(false); // Reset success state
  };

  const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetEmail(e.target.value);
  };

  const handleContinueAfterReset = () => {
    console.log('Continue button clicked - starting reset process');

    // リセットフォームを非表示にして、ログインフォームに戻る
    setShowResetForm(false);
    setResetMessage('');
    setResetEmail('');
    setResetSuccess(false);
    setIsResetError(false);

    // フォームの状態をリセット
    setFormData({
      email: '',
      password: '',
    });

    console.log('Continue button - state reset completed');
  };

  const handleSendResetEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetMessage('メールアドレスを入力してください。');
      setIsResetError(true);
      return;
    }
    setResetLoading(true);
    setResetMessage('');
    setIsResetError(false);
    setResetSuccess(false);

    console.log('Sending password reset email to:', resetEmail);

    try {
      // シンプルなパスワードリセットメール送信（アクションURLなし）
      await sendPasswordResetEmail(auth, resetEmail);

      console.log('Password reset email sent successfully');
      setResetMessage(
        'パスワード再設定用のメールを送信しました。メールボックスと迷惑メールフォルダをご確認ください。'
      );
      setIsResetError(false);
      setResetSuccess(true);
      setResetEmail(''); // Clear the input field
    } catch (error: any) {
      console.error('Password reset error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 'auth/user-not-found') {
        setResetMessage('入力されたメールアドレスは登録されていません。');
      } else if (error.code === 'auth/invalid-email') {
        setResetMessage('有効なメールアドレスを入力してください。');
      } else if (error.code === 'auth/too-many-requests') {
        setResetMessage(
          'リクエストが多すぎます。しばらく時間をおいてから再試行してください。'
        );
      } else if (error.code === 'auth/network-request-failed') {
        setResetMessage(
          'ネットワークエラーが発生しました。インターネット接続を確認してください。'
        );
      } else if (error.code === 'auth/unauthorized-continue-uri') {
        setResetMessage(
          'ドメインが許可されていません。管理者にお問い合わせください。'
        );
      } else if (error.code === 'auth/invalid-continue-uri') {
        setResetMessage(
          '無効なリダイレクトURLです。管理者にお問い合わせください。'
        );
      } else if (error.code === 'auth/api-key-not-valid') {
        setResetMessage('APIキーが無効です。管理者にお問い合わせください。');
        console.error('API Key Error Details:', {
          errorCode: error.code,
          errorMessage: error.message,
          firebaseConfig: {
            apiKey: '***',
            authDomain: 'my-blog-app-d10b4.firebaseapp.com',
            projectId: 'my-blog-app-d10b4',
          },
        });
      } else {
        setResetMessage(
          `パスワード再設定メールの送信に失敗しました。エラー: ${error.message}`
        );
      }
      setIsResetError(true);
      setResetSuccess(false);
    } finally {
      setResetLoading(false);
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
        my: 5,
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
          ログイン
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
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              type="button"
              onClick={handleToggleResetForm}
              underline="hover"
              sx={{
                display: 'block',
                mb: 1,
                color: '#1976d2',
                fontSize: '14px',
                '&:hover': {
                  color: '#1565c0',
                  textDecoration: 'underline',
                },
              }}
            >
              🔑 パスワードをお忘れですか？
            </Link>
            <Link
              component={RouterLink}
              to="/register"
              underline="hover"
              sx={{
                color: '#666',
                fontSize: '14px',
                '&:hover': {
                  color: '#1976d2',
                },
              }}
            >
              新規アカウントを作成
            </Link>
          </Box>
        </form>

        {showResetForm && (
          <Paper
            elevation={0}
            sx={{ mt: 3, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                textAlign: 'center',
                mb: 2,
                color: '#1976d2',
                fontWeight: 'bold',
              }}
            >
              🔐 パスワードリセット
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: 'center', lineHeight: 1.6 }}
            >
              登録したメールアドレスを入力してください。
              <br />
              パスワード再設定用のリンクをお送りします。
            </Typography>

            {/* ヘルプ情報 */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '12px' }}
              >
                <strong>💡 ヘルプ：</strong>
                <br />
                • メールが届かない場合は、迷惑メールフォルダもご確認ください
                <br />
                • リンクの有効期限は1時間です
                <br />• セキュリティのため、リクエストは記録されます
              </Typography>
            </Box>

            <form onSubmit={handleSendResetEmail}>
              {resetMessage && (
                <Alert
                  severity={isResetError ? 'error' : 'success'}
                  sx={{ mt: 2, mb: 2 }}
                  icon={isResetError ? undefined : <span>✅</span>}
                >
                  {resetMessage}
                </Alert>
              )}

              {!resetSuccess ? (
                <>
                  <TextField
                    label="登録したメールアドレス"
                    name="resetEmail"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={resetEmail}
                    onChange={handleResetEmailChange}
                    required
                    placeholder="example@email.com"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 2,
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
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <>
                        <span style={{ marginRight: '8px' }}>⏳</span>
                        送信中...
                      </>
                    ) : (
                      <>
                        <span style={{ marginRight: '8px' }}>📧</span>
                        リセットメールを送信
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="contained"
                  fullWidth
                  onClick={handleContinueAfterReset}
                  sx={{
                    mt: 2,
                    mb: 2,
                    py: 1.5,
                    backgroundColor: '#4caf50',
                    '&:hover': {
                      backgroundColor: '#45a049',
                    },
                    cursor: 'pointer',
                    zIndex: 1,
                  }}
                >
                  <span style={{ marginRight: '8px' }}>✅</span>
                  Continue
                </Button>
              )}

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  type="button"
                  onClick={handleContinueAfterReset}
                  underline="hover"
                  sx={{
                    color: '#666',
                    '&:hover': {
                      color: '#1976d2',
                    },
                  }}
                >
                  ← ログインに戻る
                </Link>
              </Box>
            </form>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
