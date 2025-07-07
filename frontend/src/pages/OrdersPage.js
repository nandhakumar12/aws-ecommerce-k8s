import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { CheckCircle, LocalShipping, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Simulate fetching orders from API
    const mockOrders = [
      {
        id: 'ORD-001',
        date: new Date().toLocaleDateString(),
        status: 'delivered',
        total: 129.97,
        items: [
          { name: 'Wireless Headphones', quantity: 1, price: 99.99 },
          { name: 'Programming Book', quantity: 1, price: 29.99 }
        ]
      },
      {
        id: 'ORD-002',
        date: new Date(Date.now() - 86400000).toLocaleDateString(),
        status: 'shipped',
        total: 79.99,
        items: [
          { name: 'Running Shoes', quantity: 1, price: 79.99 }
        ]
      },
      {
        id: 'ORD-003',
        date: new Date(Date.now() - 172800000).toLocaleDateString(),
        status: 'processing',
        total: 199.99,
        items: [
          { name: 'Smart Watch', quantity: 1, price: 199.99 }
        ]
      }
    ];
    setOrders(mockOrders);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'shipped':
        return <LocalShipping sx={{ color: 'info.main' }} />;
      case 'processing':
        return <Schedule sx={{ color: 'warning.main' }} />;
      default:
        return <Schedule sx={{ color: 'grey.500' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Please Login
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You need to be logged in to view your orders.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't placed any orders yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
          >
            Start Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Order #{order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {order.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(order.status)}
                      <Chip
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Items:
                  </Typography>
                  {order.items.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {item.name} x {item.quantity}
                      </Typography>
                      <Typography variant="body2">
                        ${item.price.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Total: ${order.total.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" size="small">
                        View Details
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="contained" size="small">
                          Reorder
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Demo Orders:</strong> These are sample orders for demonstration purposes. 
          In a real application, orders would be fetched from your backend API.
        </Typography>
      </Alert>
    </Container>
  );
};

export default OrdersPage;
