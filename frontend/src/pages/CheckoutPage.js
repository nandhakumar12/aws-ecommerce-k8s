import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { CreditCard, LocalShipping, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  const [errors, setErrors] = useState({});

  const steps = ['Shipping Information', 'Payment Details', 'Order Confirmation'];

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) return;
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 3) return;
    }

    setPaymentInfo(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingInfo.firstName) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.email) newErrors.email = 'Email is required';
    if (!shippingInfo.address) newErrors.address = 'Address is required';
    if (!shippingInfo.city) newErrors.city = 'City is required';
    if (!shippingInfo.state) newErrors.state = 'State is required';
    if (!shippingInfo.zipCode) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors = {};
    if (!paymentInfo.cardNumber || paymentInfo.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Valid card number is required';
    }
    if (!paymentInfo.expiryDate || paymentInfo.expiryDate.length < 5) {
      newErrors.expiryDate = 'Valid expiry date is required';
    }
    if (!paymentInfo.cvv || paymentInfo.cvv.length < 3) {
      newErrors.cvv = 'Valid CVV is required';
    }
    if (!paymentInfo.cardName) newErrors.cardName = 'Cardholder name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateShipping()) return;
    if (activeStep === 1 && !validatePayment()) return;
    
    if (activeStep === 2) {
      handlePlaceOrder();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOrderPlaced(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (error) {
      setErrors({ submit: 'Failed to place order. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Cart is Empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Add some products to your cart before checkout.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/products')}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  if (orderPlaced) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Order Placed Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Thank you for your purchase. You will receive a confirmation email shortly.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Redirecting to your orders...
        </Typography>
      </Container>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.submit}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {activeStep === 0 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocalShipping sx={{ mr: 1 }} />
                  <Typography variant="h6">Shipping Information</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="firstName"
                      label="First Name"
                      value={shippingInfo.firstName}
                      onChange={handleShippingChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="lastName"
                      label="Last Name"
                      value={shippingInfo.lastName}
                      onChange={handleShippingChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="email"
                      label="Email Address"
                      type="email"
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="address"
                      label="Street Address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      error={!!errors.address}
                      helperText={errors.address}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="city"
                      label="City"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      error={!!errors.city}
                      helperText={errors.city}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      name="state"
                      label="State"
                      value={shippingInfo.state}
                      onChange={handleShippingChange}
                      error={!!errors.state}
                      helperText={errors.state}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      name="zipCode"
                      label="ZIP Code"
                      value={shippingInfo.zipCode}
                      onChange={handleShippingChange}
                      error={!!errors.zipCode}
                      helperText={errors.zipCode}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Country</InputLabel>
                      <Select
                        name="country"
                        value={shippingInfo.country}
                        label="Country"
                        onChange={handleShippingChange}
                      >
                        <MenuItem value="United States">United States</MenuItem>
                        <MenuItem value="Canada">Canada</MenuItem>
                        <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {activeStep === 1 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CreditCard sx={{ mr: 1 }} />
                  <Typography variant="h6">Payment Information</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="cardName"
                      label="Cardholder Name"
                      value={paymentInfo.cardName}
                      onChange={handlePaymentChange}
                      error={!!errors.cardName}
                      helperText={errors.cardName}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="cardNumber"
                      label="Card Number"
                      value={paymentInfo.cardNumber}
                      onChange={handlePaymentChange}
                      error={!!errors.cardNumber}
                      helperText={errors.cardNumber}
                      placeholder="1234 5678 9012 3456"
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="expiryDate"
                      label="Expiry Date"
                      value={paymentInfo.expiryDate}
                      onChange={handlePaymentChange}
                      error={!!errors.expiryDate}
                      helperText={errors.expiryDate}
                      placeholder="MM/YY"
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="cvv"
                      label="CVV"
                      value={paymentInfo.cvv}
                      onChange={handlePaymentChange}
                      error={!!errors.cvv}
                      helperText={errors.cvv}
                      placeholder="123"
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Demo Payment:</strong> Use any card number (e.g., 4111 1111 1111 1111), 
                    any future expiry date, and any 3-digit CVV for testing.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Confirmation
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Shipping Address:
                  </Typography>
                  <Typography variant="body2">
                    {shippingInfo.firstName} {shippingInfo.lastName}<br />
                    {shippingInfo.address}<br />
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                    {shippingInfo.country}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Method:
                  </Typography>
                  <Typography variant="body2">
                    **** **** **** {paymentInfo.cardNumber.slice(-4)}<br />
                    {paymentInfo.cardName}
                  </Typography>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Order Items:
                </Typography>
                {cartItems.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.name} x {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${subtotal.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>${shipping.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax:</Typography>
                <Typography>${tax.toFixed(2)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ${total.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    fullWidth
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={processing}
                  fullWidth
                >
                  {processing ? 'Processing...' : 
                   activeStep === 2 ? 'Place Order' : 'Next'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
