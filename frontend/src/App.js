import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Badge,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  TextField
} from '@mui/material';
import {
  ShoppingCart,
  Add,
  Remove,
  Delete,
  Store
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const sampleProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 99.99,
    image: 'https://via.placeholder.com/300x200?text=Wireless+Headphones',
    category: 'Electronics',
    description: 'High-quality wireless headphones with noise cancellation'
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 199.99,
    image: 'https://via.placeholder.com/300x200?text=Smart+Watch',
    category: 'Electronics',
    description: 'Feature-rich smartwatch with health monitoring'
  },
  {
    id: 3,
    name: 'Running Shoes',
    price: 79.99,
    image: 'https://via.placeholder.com/300x200?text=Running+Shoes',
    category: 'Sports',
    description: 'Comfortable running shoes for all terrains'
  }
];

function App() {
  const [products] = useState(sampleProducts);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Store sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ÌªçÔ∏è AWS E-Commerce Store - LIVE!
          </Typography>
          <IconButton color="inherit" onClick={() => setCartOpen(true)}>
            <Badge badgeContent={getTotalItems()} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Ìæâ Your E-Commerce Store is LIVE!
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Deployed on AWS EKS with Kubernetes ‚Ä¢ EU-West-1
          </Typography>
          <Chip label="Ì∫Ä LIVE ON AWS" color="success" variant="outlined" />
        </Box>

        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="h6" color="primary">
                    ${product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => addToCart(product)}
                    sx={{ mt: 2 }}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
