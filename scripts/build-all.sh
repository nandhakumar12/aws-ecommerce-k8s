#!/bin/bash

# E-commerce K8s Platform - Build All Services Script
# This script builds all Docker images for the e-commerce platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_TAG=${IMAGE_TAG:-latest}

# Services to build
SERVICES=("frontend" "users" "products" "orders" "payment" "delivery" "warehouse")

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        log_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        log_warning "kubectl is not installed. You won't be able to deploy to Kubernetes."
    fi
    
    log_success "Prerequisites check completed"
}

create_ecr_repositories() {
    log_info "Creating ECR repositories if they don't exist..."
    
    for service in "${SERVICES[@]}"; do
        if [ "$service" = "frontend" ]; then
            repo_name="ecommerce-frontend"
        else
            repo_name="ecommerce-${service}"
        fi
        
        # Check if repository exists
        if aws ecr describe-repositories --repository-names "$repo_name" --region "$AWS_REGION" >/dev/null 2>&1; then
            log_info "ECR repository $repo_name already exists"
        else
            log_info "Creating ECR repository: $repo_name"
            aws ecr create-repository \
                --repository-name "$repo_name" \
                --region "$AWS_REGION" \
                --image-scanning-configuration scanOnPush=true \
                --encryption-configuration encryptionType=AES256
            log_success "Created ECR repository: $repo_name"
        fi
    done
}

login_to_ecr() {
    log_info "Logging in to Amazon ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin "$ECR_REGISTRY"
    log_success "Successfully logged in to ECR"
}

build_frontend() {
    log_info "Building frontend service..."
    
    cd frontend
    
    # Install dependencies and build
    log_info "Installing npm dependencies..."
    npm ci
    
    log_info "Running linting..."
    npm run lint
    
    log_info "Running tests..."
    npm test -- --coverage --watchAll=false
    
    log_info "Building React application..."
    npm run build
    
    # Build Docker image
    log_info "Building Docker image for frontend..."
    docker build -t "ecommerce-frontend:${IMAGE_TAG}" .
    
    # Tag for ECR
    docker tag "ecommerce-frontend:${IMAGE_TAG}" "${ECR_REGISTRY}/ecommerce-frontend:${IMAGE_TAG}"
    docker tag "ecommerce-frontend:${IMAGE_TAG}" "${ECR_REGISTRY}/ecommerce-frontend:latest"
    
    cd ..
    log_success "Frontend build completed"
}

build_service() {
    local service=$1
    log_info "Building $service service..."
    
    cd "services/$service"
    
    # Build with Maven
    log_info "Running Maven build for $service..."
    mvn clean compile
    mvn test
    mvn package -DskipTests
    
    # Build Docker image
    log_info "Building Docker image for $service..."
    docker build -t "ecommerce-${service}:${IMAGE_TAG}" .
    
    # Tag for ECR
    docker tag "ecommerce-${service}:${IMAGE_TAG}" "${ECR_REGISTRY}/ecommerce-${service}:${IMAGE_TAG}"
    docker tag "ecommerce-${service}:${IMAGE_TAG}" "${ECR_REGISTRY}/ecommerce-${service}:latest"
    
    cd ../..
    log_success "$service build completed"
}

push_images() {
    log_info "Pushing images to ECR..."
    
    for service in "${SERVICES[@]}"; do
        if [ "$service" = "frontend" ]; then
            repo_name="ecommerce-frontend"
        else
            repo_name="ecommerce-${service}"
        fi
        
        log_info "Pushing $repo_name:${IMAGE_TAG}..."
        docker push "${ECR_REGISTRY}/${repo_name}:${IMAGE_TAG}"
        docker push "${ECR_REGISTRY}/${repo_name}:latest"
        log_success "Pushed $repo_name"
    done
}

cleanup_local_images() {
    log_info "Cleaning up local images..."
    
    for service in "${SERVICES[@]}"; do
        if [ "$service" = "frontend" ]; then
            repo_name="ecommerce-frontend"
        else
            repo_name="ecommerce-${service}"
        fi
        
        docker rmi "${repo_name}:${IMAGE_TAG}" 2>/dev/null || true
        docker rmi "${ECR_REGISTRY}/${repo_name}:${IMAGE_TAG}" 2>/dev/null || true
        docker rmi "${ECR_REGISTRY}/${repo_name}:latest" 2>/dev/null || true
    done
    
    log_success "Local images cleaned up"
}

main() {
    log_info "Starting build process for e-commerce platform..."
    log_info "AWS Account ID: $AWS_ACCOUNT_ID"
    log_info "AWS Region: $AWS_REGION"
    log_info "ECR Registry: $ECR_REGISTRY"
    log_info "Image Tag: $IMAGE_TAG"
    
    check_prerequisites
    create_ecr_repositories
    login_to_ecr
    
    # Build frontend
    build_frontend
    
    # Build backend services
    for service in "${SERVICES[@]}"; do
        if [ "$service" != "frontend" ]; then
            build_service "$service"
        fi
    done
    
    # Push all images
    push_images
    
    # Cleanup
    cleanup_local_images
    
    log_success "All services built and pushed successfully!"
    log_info "You can now deploy using: kubectl apply -f k8s/ or ArgoCD"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Build all e-commerce platform services and push to ECR"
        echo ""
        echo "Environment Variables:"
        echo "  AWS_REGION     AWS region (default: us-east-1)"
        echo "  IMAGE_TAG      Docker image tag (default: latest)"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --no-push      Build images but don't push to ECR"
        echo "  --frontend     Build only frontend"
        echo "  --backend      Build only backend services"
        exit 0
        ;;
    --no-push)
        # Override push function to do nothing
        push_images() {
            log_info "Skipping push to ECR (--no-push flag)"
        }
        ;;
    --frontend)
        SERVICES=("frontend")
        ;;
    --backend)
        SERVICES=("users" "products" "orders" "payment" "delivery" "warehouse")
        ;;
esac

# Run main function
main
