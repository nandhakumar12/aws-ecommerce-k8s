import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Google, Facebook } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setErrors({});
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (tabValue === 1) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (tabValue === 0) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setErrors({ submit: result.error || 'Login failed' });
        }
      } else {
        const result = await signup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        });
        if (result.success) {
          setMessage('Account created successfully! Please login.');
          setTabValue(0);
          setFormData({
            email: formData.email,
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
          });
        } else {
          setErrors({ submit: result.error || 'Signup failed' });
        }
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  const handleSocialLogin = (provider) => {
    setMessage(`${provider} login coming soon!`);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ mt: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            {tabValue === 0 ? 'Sign in to your account' : 'Create a new account'}
          </Typography>

          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {message && (
            <Alert severity={message.includes('successful') ? 'success' : 'info'} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {tabValue === 1 && (
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  fullWidth
                  required
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  fullWidth
                  required
                />
              </Box>
            )}

            <TextField
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            <TextField
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
              required
              sx={{ mb: 2 }}
            />

            {tabValue === 1 && (
              <TextField
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                tabValue === 0 ? 'Sign In' : 'Create Account'
              )}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Google />}
                onClick={() => handleSocialLogin('Google')}
              >
                Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Facebook />}
                onClick={() => handleSocialLogin('Facebook')}
              >
                Facebook
              </Button>
            </Box>

            {tabValue === 0 && (
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="text"
                  onClick={() => setMessage('Password reset coming soon!')}
                >
                  Forgot Password?
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0 ? "Don't have an account? " : "Already have an account? "}
              <Button
                variant="text"
                onClick={() => setTabValue(tabValue === 0 ? 1 : 0)}
                sx={{ textTransform: 'none' }}
              >
                {tabValue === 0 ? 'Sign up here' : 'Sign in here'}
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Demo Credentials
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: demo@example.com<br />
            Password: demo123
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
