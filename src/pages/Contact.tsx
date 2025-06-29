import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import Header from '../components/Header';

const Contact = () => {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
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
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    alert('お問い合わせ内容を送信しました（デモ）');
    setFormData({ name: '', email: '', message: '' });
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
          Contact
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
          <form onSubmit={handleSubmit}>
            <TextField
              label="お名前"
              name="name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="メールアドレス"
              name="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="メッセージ"
              name="message"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleChange}
              error={!!errors.message}
              helperText={errors.message}
            />
            <Box mt={3} textAlign="right">
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#998675',
                  '&:hover': {
                    backgroundColor: '#7f6a59',
                  },
                }}
              >
                送信
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default Contact;
