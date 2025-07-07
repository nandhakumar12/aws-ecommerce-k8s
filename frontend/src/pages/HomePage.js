import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const featuredProducts = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
      category: 'Electronics',
      rating: 4.5,
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
      category: 'Electronics',
      rating: 4.8,
    },
    {
      id: 3,
      name: 'Running Shoes',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
      category: 'Clothing',
      rating: 4.3,
    },
    {
      id: 4,
      name: 'Programming Book',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=200&fit=crop',
      category: 'Books',
      rating: 4.7,
    },
  ];

  const categories = [
    { name: 'Electronics', count: 150, color: 'primary' },
    { name: 'Clothing', count: 200, color: 'secondary' },
    { name: 'Books', count: 80, color: 'success' },
    { name: 'Home & Garden', count: 120, color: 'warning' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          color: 'white',
          p: 6,
          mb: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to E-Commerce
        </Typography>
        <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
          Discover amazing products at unbeatable prices
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            '&:hover': { bgcolor: 'grey.100' },
          }}
          onClick={() => navigate('/products')}
        >
          Shop Now
        </Button>
      </Box>

      {/* Categories Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Shop by Category
        </Typography>
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={6} md={3} key={category.name}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
                onClick={() => navigate(`/products/${category.name.toLowerCase()}`)}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    {category.name}
                  </Typography>
                  <Chip
                    label={`${category.count} items`}
                    color={category.color}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Products */}
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Products
        </Typography>
        <Grid container spacing={3}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {product.category}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                    <Typography variant="body2">
                      ⭐ {product.rating}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
