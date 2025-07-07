#!/bin/bash

# Production Deployment Script for E-commerce Platform
set -e

echo "��� Starting Production Deployment..."

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
CLUSTER_NAME=${CLUSTER_NAME:-ecommerce-cluster}
ECR_REGISTRY=${ECR_REGISTRY}
ENVIRONMENT=${ENVIRONMENT:-prod}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    command -v aws >/dev/null 2>&1 || { print_error "AWS CLI is required but not installed. Aborting."; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { print_error "kubectl is required but not installed. Aborting."; exit 1; }
    command -v helm >/dev/null 2>&1 || { print_error "Helm is required but not installed. Aborting."; exit 1; }
    command -v docker >/dev/null 2>&1 || { print_error "Docker is required but not installed. Aborting."; exit 1; }
    
    print_status "All prerequisites satisfied ✓"
}

# Setup AWS credentials and region
setup_aws() {
    print_status "Setting up AWS configuration..."
    
    aws configure set region $AWS_REGION
    aws sts get-caller-identity > /dev/null || { print_error "AWS credentials not configured. Aborting."; exit 1; }
    
    print_status "AWS configuration verified ✓"
}

# Update kubeconfig for EKS
setup_kubernetes() {
    print_status "Setting up Kubernetes configuration..."
    
    aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
    kubectl cluster-info > /dev/null || { print_error "Cannot connect to Kubernetes cluster. Aborting."; exit 1; }
    
    print_status "Kubernetes configuration verified ✓"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."
    
    cd terraform
    terraform init
    terraform plan -var="environment=$ENVIRONMENT"
    terraform apply -var="environment=$ENVIRONMENT" -auto-approve
    cd ..
    
    print_status "Infrastructure deployment completed ✓"
}

# Build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
    
    # Services to build
    services=("frontend" "users" "products" "orders" "payment" "api-gateway")
    
    for service in "${services[@]}"; do
        print_status "Building $service..."
        
        if [ "$service" = "frontend" ]; then
            docker build -t $service:latest ./frontend/
        else
            docker build -t $service:latest ./services/$service/
        fi
        
        # Tag and push
        docker tag $service:latest $ECR_REGISTRY/$service:latest
        docker tag $service:latest $ECR_REGISTRY/$service:$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)
        
        docker push $ECR_REGISTRY/$service:latest
        docker push $ECR_REGISTRY/$service:$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)
        
        print_status "$service image pushed ✓"
    done
}

# Create Kubernetes namespaces
create_namespaces() {
    print_status "Creating Kubernetes namespaces..."
    
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/monitoring-namespace.yaml
    
    print_status "Namespaces created ✓"
}

# Deploy secrets
deploy_secrets() {
    print_status "Deploying secrets..."
    
    # Create JWT secret
    kubectl create secret generic jwt-secret \
        --from-literal=secret=$JWT_SECRET \
        -n ecommerce --dry-run=client -o yaml | kubectl apply -f -
    
    # Create Stripe secrets
    kubectl create secret generic stripe-secret \
        --from-literal=secret-key=$STRIPE_SECRET_KEY \
        --from-literal=publishable-key=$STRIPE_PUBLISHABLE_KEY \
        -n ecommerce --dry-run=client -o yaml | kubectl apply -f -
    
    # Create database secrets
    kubectl create secret generic db-secret \
        --from-literal=redis-password=$REDIS_PASSWORD \
        -n ecommerce --dry-run=client -o yaml | kubectl apply -f -
    
    print_status "Secrets deployed ✓"
}

# Deploy services with Helm
deploy_services() {
    print_status "Deploying services with Helm..."
    
    # Add Helm repositories
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo add elastic https://helm.elastic.co
    helm repo update
    
    # Deploy monitoring stack
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        -n monitoring --create-namespace \
        -f helm/monitoring/prometheus-values.yaml
    
    helm upgrade --install grafana grafana/grafana \
        -n monitoring \
        -f helm/monitoring/grafana-values.yaml
    
    # Deploy ELK stack
    helm upgrade --install elasticsearch elastic/elasticsearch \
        -n monitoring \
        -f helm/monitoring/elasticsearch-values.yaml
    
    helm upgrade --install kibana elastic/kibana \
        -n monitoring \
        -f helm/monitoring/kibana-values.yaml
    
    # Deploy application services
    helm upgrade --install ecommerce ./helm/ecommerce \
        -n ecommerce \
        --set image.registry=$ECR_REGISTRY \
        --set environment=$ENVIRONMENT \
        -f helm/ecommerce/values-$ENVIRONMENT.yaml
    
    print_status "Services deployed ✓"
}

# Deploy with ArgoCD
deploy_argocd() {
    print_status "Setting up ArgoCD..."
    
    # Install ArgoCD
    kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    
    # Wait for ArgoCD to be ready
    kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
    
    # Deploy ArgoCD applications
    kubectl apply -f argocd/projects/
    kubectl apply -f argocd/applications/
    
    print_status "ArgoCD setup completed ✓"
}

# Configure ingress and SSL
setup_ingress() {
    print_status "Setting up ingress and SSL..."
    
    # Install NGINX Ingress Controller
    helm upgrade --install ingress-nginx ingress-nginx \
        --repo https://kubernetes.github.io/ingress-nginx \
        --namespace ingress-nginx --create-namespace
    
    # Install cert-manager for SSL
    helm upgrade --install cert-manager cert-manager \
        --repo https://charts.jetstack.io \
        --namespace cert-manager --create-namespace \
        --set installCRDs=true
    
    # Apply ingress configurations
    kubectl apply -f k8s/ingress/
    
    print_status "Ingress and SSL setup completed ✓"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check pod status
    kubectl get pods -n ecommerce
    kubectl get pods -n monitoring
    
    # Check services
    kubectl get services -n ecommerce
    
    # Check ingress
    kubectl get ingress -n ecommerce
    
    # Run health checks
    print_status "Running health checks..."
    
    services=("users-service" "products-service" "orders-service" "payment-service")
    for service in "${services[@]}"; do
        kubectl wait --for=condition=ready pod -l app=$service -n ecommerce --timeout=300s
        print_status "$service is ready ✓"
    done
    
    print_status "Deployment verification completed ✓"
}

# Main deployment flow
main() {
    print_status "Starting E-commerce Platform Production Deployment"
    print_status "Environment: $ENVIRONMENT"
    print_status "AWS Region: $AWS_REGION"
    print_status "EKS Cluster: $CLUSTER_NAME"
    
    check_prerequisites
    setup_aws
    setup_kubernetes
    deploy_infrastructure
    build_and_push_images
    create_namespaces
    deploy_secrets
    deploy_services
    deploy_argocd
    setup_ingress
    verify_deployment
    
    print_status "��� Production deployment completed successfully!"
    print_status "Access your application at: https://your-domain.com"
    print_status "ArgoCD UI: kubectl port-forward svc/argocd-server -n argocd 8080:443"
    print_status "Grafana UI: kubectl port-forward svc/grafana -n monitoring 3000:80"
}

# Run main function
main "$@"
