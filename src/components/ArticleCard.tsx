// components/ArticleCard.tsx
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

interface Props {
  id: string;
  title: string;
  imageUrl?: string;
  createdAt: string;
  sx?: SxProps<Theme>;
}

const ArticleCard = ({ id, title, imageUrl, createdAt, sx }: Props) => {
  return (
    <Card
      component={Link}
      to={`/articles/${id}`}
      sx={{
        display: 'block',
        textDecoration: 'none',
        height: '100%',
        '&:hover': {
          opacity: 0.8,
        },
        ...sx,
      }}
    >
      {imageUrl ? (
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px dashed grey', // To match CardMedia style
          }}
        >
          <Typography variant="h6" color="text.secondary">
            noImage
          </Typography>
        </Box>
      )}
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
