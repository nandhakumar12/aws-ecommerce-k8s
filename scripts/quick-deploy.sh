#!/bin/bash

# Quick AWS Deployment Script for E-commerce Platform
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
CLUSTER_NAME=${CLUSTER_NAME:-ecommerce-cluster}

echo "Ì∫Ä E-commerce Platform Quick Deployment"
echo "========================================"
echo "Region: $AWS_REGION"
echo "Cluster: $CLUSTER_NAME"
echo ""

# Step 1: Check Prerequisites
print_step "1. Checking prerequisites..."
command -v aws >/dev/null 2>&1 || { print_error "AWS CLI not found. Please install it first."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { print_error "kubectl not found. Please install it first."; exit 1; }
command -v helm >/dev/null 2>&1 || { print_error "Helm not found. Please install it first."; exit 1; }
command -v terraform >/dev/null 2>&1 || { print_error "Terraform not found. Please install it first."; exit 1; }
command -v docker >/dev/null 2>&1 || { print_error "Docker not found. Please install it first."; exit 1; }
print_success "All prerequisites satisfied"

# Step 2: Verify AWS Configuration
print_step "2. Verifying AWS configuration..."
aws sts get-caller-identity > /dev/null || { print_error "AWS credentials not configured. Run 'aws configure' first."; exit 1; }
print_success "AWS credentials verified"

# Step 3: Deploy Infrastructure
print_step "3. Deploying AWS infrastructure with Terraform..."
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
cd ..
print_success "Infrastructure deployed"

# Step 4: Configure kubectl
print_step "4. Configuring kubectl for EKS..."
aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
kubectl cluster-info > /dev/null || { print_error "Cannot connect to EKS cluster"; exit 1; }
print_success "kubectl configured"

# Step 5: Install Essential Components
print_step "5. Installing essential Kubernetes components..."

# Install AWS Load Balancer Controller
print_step "5a. Installing AWS Load Balancer Controller..."
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.4/docs/install/iam_policy.json

aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json 2>/dev/null || true

eksctl create iamserviceaccount \
  --cluster=$CLUSTER_NAME \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/AWSLoadBalancerControllerIAMPolicy \
  --approve 2>/dev/null || true

helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=$CLUSTER_NAME \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller 2>/dev/null || true

# Install Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml 2>/dev/null || true

print_success "Essential components installed"

# Step 6: Build and Push Docker Images
print_step "6. Building and pushing Docker images..."

# Get ECR registry URL
ECR_REGISTRY=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push images
services=("frontend" "users" "products" "orders" "payment" "api-gateway")

for service in "${services[@]}"; do
    print_step "Building $service..."
    
    if [ "$service" = "frontend" ]; then
        docker build -t $service:latest ./frontend/
    else
        docker build -t $service:latest ./services/$service/
    fi
    
    docker tag $service:latest $ECR_REGISTRY/$service:latest
    docker push $ECR_REGISTRY/$service:latest
    print_success "$service image pushed"
done

# Step 7: Create Secrets
print_step "7. Creating Kubernetes secrets..."

kubectl create namespace ecommerce 2>/dev/null || true

# Create JWT secret
kubectl create secret generic jwt-secret \
  --from-literal=secret=your-super-secret-jwt-key-here-$(date +%s) \
  -n ecommerce --dry-run=client -o yaml | kubectl apply -f -

# Create Stripe secrets (placeholder - user needs to update)
kubectl create secret generic stripe-secret \
  --from-literal=secret-key=sk_test_placeholder \
  --from-literal=publishable-key=pk_test_placeholder \
  -n ecommerce --dry-run=client -o yaml | kubectl apply -f -

print_success "Secrets created"

# Step 8: Deploy Monitoring
print_step "8. Deploying monitoring stack..."

kubectl create namespace monitoring 2>/dev/null || true

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=20Gi

# Install Grafana
helm upgrade --install grafana grafana/grafana \
  -n monitoring \
  --set persistence.enabled=true \
  --set persistence.size=10Gi \
  --set adminPassword=admin123

print_success "Monitoring stack deployed"

# Step 9: Deploy Application
print_step "9. Deploying application services..."

# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml 2>/dev/null || true
kubectl apply -f k8s/ -n ecommerce

# Wait for deployments
kubectl wait --for=condition=available --timeout=300s deployment --all -n ecommerce

print_success "Application services deployed"

# Step 10: Display Access Information
print_step "10. Getting access information..."

echo ""
echo "Ìæâ Deployment Complete!"
echo "======================="
echo ""
echo "Access your applications:"
echo ""
echo "Frontend:"
echo "  kubectl port-forward svc/frontend -n ecommerce 3000:80"
echo "  Then open: http://localhost:3000"
echo ""
echo "API Gateway:"
echo "  kubectl port-forward svc/api-gateway -n ecommerce 8080:8080"
echo "  Then open: http://localhost:8080"
echo ""
echo "Grafana Dashboard:"
echo "  kubectl port-forward svc/grafana -n monitoring 3001:80"
echo "  Then open: http://localhost:3001"
echo "  Username: admin, Password: admin123"
echo ""
echo "Prometheus:"
echo "  kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090"
echo "  Then open: http://localhost:9090"
echo ""

# Get Load Balancer URLs
echo "Load Balancer URLs:"
kubectl get ingress -n ecommerce 2>/dev/null || echo "  No ingress configured yet"
echo ""

echo "‚ö†Ô∏è  Important Next Steps:"
echo "1. Update Stripe secrets with real API keys"
echo "2. Configure your domain name (optional)"
echo "3. Set up SSL certificates"
echo "4. Add products to your catalog"
echo ""

print_success "Quick deployment completed successfully!"
