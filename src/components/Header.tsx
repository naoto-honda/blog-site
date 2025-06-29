import { AppBar, Box, Button, Link, Toolbar, Typography } from '@mui/material';
import { signOut } from 'firebase/auth';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAppDispatch } from '../hooks/redux';
import { signOut as signOutAction } from '../store/slices/authSlice';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(signOutAction());
      navigate('/');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: '#eeedeb', color: 'black', mb: 5 }}
    >
      <Toolbar sx={{ maxWidth: 1000, mx: 'auto', width: '100%' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link
            to="/home"
            component={RouterLink}
            style={{ textDecoration: 'none', color: 'inherit' }}
            sx={{
              '&:hover': {
                opacity: 0.8,
                cursor: 'pointer',
              },
            }}
          >
            Naolog
          </Link>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink as React.ElementType}
            to="/about"
            sx={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            About
          </Button>
          <Button
            color="inherit"
            component={RouterLink as React.ElementType}
            to="/articles"
            sx={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Articles
          </Button>
          <Button
            color="inherit"
            component={RouterLink as React.ElementType}
            to="/articles/new"
            sx={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Create Post
          </Button>
          <Button
            color="inherit"
            component={RouterLink as React.ElementType}
            to="/contact"
            sx={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Contact
          </Button>
          <Button
            color="inherit"
            component={RouterLink as React.ElementType}
            to="/admin-contacts"
            sx={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Admin
          </Button>
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            LOGOUT
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
