import { Box, Button, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
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
          width: { xs: '90%', sm: '500px' },
          backgroundColor: '#fff',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '4rem', sm: '6rem' },
            fontWeight: 'bold',
            color: '#1976d2',
            mb: 2,
          }}
        >
          404
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mb: 2, color: '#333' }}>
          ページが見つかりません
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, lineHeight: 1.6 }}
        >
          お探しのページは存在しないか、移動または削除された可能性があります。
          <br />
          URLが正しいかご確認ください。
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            component={Link}
            to="/home"
            sx={{
              py: 1.5,
              px: 3,
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            ホームに戻る
          </Button>

          <Button
            variant="outlined"
            component={Link}
            to="/articles"
            sx={{
              py: 1.5,
              px: 3,
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            記事一覧を見る
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFound;
