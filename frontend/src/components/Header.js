import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  InputBase,
  alpha,
} from '@mui/material';
import {
  ShoppingCart,
  Search,
  AccountCircle,
  Store,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const SearchBox = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* Logo */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          <Store />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: 'pointer', mr: 3 }}
          onClick={() => navigate('/')}
        >
          E-Commerce
        </Typography>

        {/* Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 3 }}>
          <Button color="inherit" onClick={() => navigate('/products')}>
            Products
          </Button>
          <Button color="inherit" onClick={() => navigate('/products/electronics')}>
            Electronics
          </Button>
          <Button color="inherit" onClick={() => navigate('/products/clothing')}>
            Clothing
          </Button>
          <Button color="inherit" onClick={() => navigate('/products/books')}>
            Books
          </Button>
        </Box>

        {/* Search */}
        <SearchBox sx={{ flexGrow: 1, maxWidth: 400 }}>
          <SearchIconWrapper>
            <Search />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search products..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </SearchBox>

        <Box sx={{ flexGrow: 1 }} />

        {/* Cart */}
        <IconButton
          color="inherit"
          onClick={() => navigate('/cart')}
          sx={{ mr: 2 }}
        >
          <Badge badgeContent={cartItemCount} color="secondary">
            <ShoppingCart />
          </Badge>
        </IconButton>

        {/* User Menu */}
        {user ? (
          <>
            <IconButton
              edge="end"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => { navigate('/orders'); handleMenuClose(); }}>
                My Orders
              </MenuItem>
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
