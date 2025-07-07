# DynamoDB Tables for E-commerce Platform

# Users Table
resource "aws_dynamodb_table" "users" {
  name           = "users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name     = "email-index"
    hash_key = "email"
  }

  tags = {
    Name        = "users"
    Environment = var.environment
    Service     = "users-service"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

# Products Table
resource "aws_dynamodb_table" "products" {
  name           = "products"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "productId"

  attribute {
    name = "productId"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  attribute {
    name = "name"
    type = "S"
  }

  global_secondary_index {
    name     = "category-index"
    hash_key = "category"
    range_key = "name"
  }

  global_secondary_index {
    name     = "name-index"
    hash_key = "name"
  }

  tags = {
    Name        = "products"
    Environment = var.environment
    Service     = "products-service"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

# Orders Table
resource "aws_dynamodb_table" "orders" {
  name           = "orders"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "orderId"

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "orderDate"
    type = "S"
  }

  global_secondary_index {
    name     = "user-orders-index"
    hash_key = "userId"
    range_key = "orderDate"
  }

  tags = {
    Name        = "orders"
    Environment = var.environment
    Service     = "orders-service"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

# Payments Table
resource "aws_dynamodb_table" "payments" {
  name           = "payments"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "paymentId"

  attribute {
    name = "paymentId"
    type = "S"
  }

  attribute {
    name = "orderId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name     = "order-payment-index"
    hash_key = "orderId"
  }

  global_secondary_index {
    name     = "user-payment-index"
    hash_key = "userId"
  }

  tags = {
    Name        = "payments"
    Environment = var.environment
    Service     = "payment-service"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

# Shopping Cart Table (for persistent cart storage)
resource "aws_dynamodb_table" "shopping_cart" {
  name           = "shopping-cart"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Name        = "shopping-cart"
    Environment = var.environment
    Service     = "cart-service"
  }

  server_side_encryption {
    enabled = true
  }
}

# Product Reviews Table
resource "aws_dynamodb_table" "product_reviews" {
  name           = "product-reviews"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "productId"
  range_key      = "reviewId"

  attribute {
    name = "productId"
    type = "S"
  }

  attribute {
    name = "reviewId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name     = "user-reviews-index"
    hash_key = "userId"
  }

  tags = {
    Name        = "product-reviews"
    Environment = var.environment
    Service     = "reviews-service"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}

# Inventory Table
resource "aws_dynamodb_table" "inventory" {
  name           = "inventory"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "productId"

  attribute {
    name = "productId"
    type = "S"
  }

  tags = {
    Name        = "inventory"
    Environment = var.environment
    Service     = "warehouse-service"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }
}
