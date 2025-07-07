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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const allProducts = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
      category: 'electronics',
      rating: 4.5,
      description: 'High-quality wireless headphones with noise cancellation',
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop',
      category: 'electronics',
      rating: 4.8,
      description: 'Advanced smartwatch with health monitoring',
    },
    {
      id: 3,
      name: 'Running Shoes',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
      category: 'clothing',
      rating: 4.3,
      description: 'Comfortable running shoes for all terrains',
    },
    {
      id: 4,
      name: 'Programming Book',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=200&fit=crop',
      category: 'books',
      rating: 4.7,
      description: 'Learn modern programming techniques',
    },
    {
      id: 5,
      name: 'Bluetooth Speaker',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop',
      category: 'electronics',
      rating: 4.4,
      description: 'Portable speaker with excellent sound quality',
    },
    {
      id: 6,
      name: 'Casual T-Shirt',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop',
      category: 'clothing',
      rating: 4.2,
      description: 'Comfortable cotton t-shirt for everyday wear',
    },
  ];

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = !category || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : 'All Products'}
      </Typography>

      {/* Search and Filter */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search products"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortBy}
            label="Sort by"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {sortedProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
                sx={{ objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => navigate(`/product/${product.id}`)}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {product.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    ${product.price}
                  </Typography>
                  <Chip label={`⭐ ${product.rating}`} size="small" />
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {sortedProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No products found matching your criteria.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ProductsPage;
