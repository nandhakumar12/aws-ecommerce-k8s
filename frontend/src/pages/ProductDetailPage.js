import React, { useState } from 'react';
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
  Rating,
  TextField,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Mock product data - in real app, this would come from API
  const products = {
    1: {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop',
      category: 'Electronics',
      rating: 4.5,
      description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.',
      features: [
        'Active Noise Cancellation',
        '30-hour battery life',
        'Bluetooth 5.0',
        'Quick charge (15 min = 3 hours)',
        'Premium materials',
        'Comfortable fit'
      ],
      inStock: true,
      reviews: 128
    },
    2: {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop',
      category: 'Electronics',
      rating: 4.8,
      description: 'Advanced smartwatch with health monitoring, GPS tracking, and smartphone integration.',
      features: ['Heart rate monitor', 'GPS tracking', 'Water resistant', 'Sleep tracking'],
      inStock: true,
      reviews: 89
    }
  };

  const product = products[productId] || products[1]; // Fallback to first product

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${quantity} x ${product.name} added to cart!`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={product.image}
              alt={product.name}
              sx={{ height: 400, objectFit: 'cover' }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box>
            <Chip label={product.category} color="primary" sx={{ mb: 2 }} />
            
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={product.rating} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({product.reviews} reviews)
              </Typography>
            </Box>

            <Typography variant="h5" color="primary" gutterBottom>
              ${product.price}
            </Typography>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Features:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 3 }}>
              {product.features.map((feature, index) => (
                <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                  {feature}
                </Typography>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1">Quantity:</Typography>
              <TextField
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: 10 }}
                sx={{ width: 80 }}
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                sx={{ flex: 1 }}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/cart')}
              >
                View Cart
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;
