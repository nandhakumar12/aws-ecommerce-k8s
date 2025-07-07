# íº€ Complete AWS Deployment Guide for E-commerce Platform

## í³‹ **Step 1: Prerequisites Setup**

### **1.1 Install Required Tools**

#### **Windows (PowerShell as Administrator):**
```powershell
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install AWS CLI
choco install awscli

# Install kubectl
choco install kubernetes-cli

# Install Helm
choco install kubernetes-helm

# Install Terraform
choco install terraform

# Install Docker Desktop
choco install docker-desktop
```

#### **macOS:**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install tools
brew install awscli kubectl helm terraform docker
```

#### **Linux (Ubuntu/Debian):**
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Terraform
wget https://releases.hashicorp.com/terraform/1.5.7/terraform_1.5.7_linux_amd64.zip
unzip terraform_1.5.7_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### **1.2 Verify Installations**
```bash
aws --version
kubectl version --client
helm version
terraform version
docker --version
```

---

## í´ **Step 2: AWS Account Setup**

### **2.1 Create AWS Account**
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Follow the registration process
4. Add payment method (required for AWS services)

### **2.2 Create IAM User for Deployment**
```bash
# Login to AWS Console
# Go to IAM > Users > Create User

# User Details:
Name: ecommerce-deployer
Access Type: Programmatic access

# Attach Policies:
- AdministratorAccess (for initial setup)
- AmazonEKSClusterPolicy
- AmazonEKSWorkerNodePolicy
- AmazonEKS_CNI_Policy
- AmazonEC2ContainerRegistryFullAccess
- AmazonDynamoDBFullAccess
- AmazonS3FullAccess
```

### **2.3 Configure AWS CLI**
```bash
# Configure AWS credentials
aws configure

# Enter when prompted:
AWS Access Key ID: [Your Access Key]
AWS Secret Access Key: [Your Secret Key]
Default region name: us-east-1
Default output format: json

# Verify configuration
aws sts get-caller-identity
```

---

## í¿—ï¸ **Step 3: Infrastructure Deployment**

### **3.1 Prepare Environment Variables**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your values:
nano .env
```

### **3.2 Initialize Terraform**
```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan deployment (review what will be created)
terraform plan
```

### **3.3 Deploy AWS Infrastructure**
```bash
# Apply Terraform configuration
terraform apply

# Type 'yes' when prompted
# This will create:
# - VPC with public/private subnets
# - EKS cluster
# - ECR repositories
# - DynamoDB tables
# - Security groups
# - IAM roles
```

**â±ï¸ Expected Time: 15-20 minutes**

### **3.4 Verify Infrastructure**
```bash
# Check EKS cluster
aws eks describe-cluster --name ecommerce-cluster --region us-east-1

# Check ECR repositories
aws ecr describe-repositories --region us-east-1

# Check DynamoDB tables
aws dynamodb list-tables --region us-east-1
```

---

## â˜¸ï¸ **Step 4: Kubernetes Configuration**

### **4.1 Update kubectl Configuration**
```bash
# Update kubeconfig for EKS
aws eks update-kubeconfig --region us-east-1 --name ecommerce-cluster

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### **4.2 Install Essential Kubernetes Components**
```bash
# Install AWS Load Balancer Controller
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.4/docs/install/iam_policy.json

aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json

# Create service account
eksctl create iamserviceaccount \
  --cluster=ecommerce-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/AWSLoadBalancerControllerIAMPolicy \
  --approve

# Install Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=ecommerce-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### **4.3 Install Metrics Server**
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## í°³ **Step 5: Build and Push Docker Images**

### **5.1 Login to ECR**
```bash
# Get ECR login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com
```

### **5.2 Build and Push Images**
```bash
# Get your ECR registry URL
ECR_REGISTRY=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com

# Build and push frontend
cd frontend
docker build -t ecommerce-frontend .
docker tag ecommerce-frontend:latest $ECR_REGISTRY/ecommerce-frontend:latest
docker push $ECR_REGISTRY/ecommerce-frontend:latest

# Build and push users service
cd ../services/users
docker build -t users-service .
docker tag users-service:latest $ECR_REGISTRY/users-service:latest
docker push $ECR_REGISTRY/users-service:latest

# Build and push products service
cd ../products
docker build -t products-service .
docker tag products-service:latest $ECR_REGISTRY/products-service:latest
docker push $ECR_REGISTRY/products-service:latest

# Build and push orders service
cd ../orders
docker build -t orders-service .
docker tag orders-service:latest $ECR_REGISTRY/orders-service:latest
docker push $ECR_REGISTRY/orders-service:latest

# Build and push payment service
cd ../payment
docker build -t payment-service .
docker tag payment-service:latest $ECR_REGISTRY/payment-service:latest
docker push $ECR_REGISTRY/payment-service:latest

# Build and push api gateway
cd ../api-gateway
docker build -t api-gateway .
docker tag api-gateway:latest $ECR_REGISTRY/api-gateway:latest
docker push $ECR_REGISTRY/api-gateway:latest
```

**â±ï¸ Expected Time: 10-15 minutes**

---

## í´‘ **Step 6: Configure Secrets**

### **6.1 Create Kubernetes Secrets**
```bash
# Create namespace
kubectl create namespace ecommerce

# Create JWT secret
kubectl create secret generic jwt-secret \
  --from-literal=secret=your-super-secret-jwt-key-here \
  -n ecommerce

# Create Stripe secrets (get from stripe.com)
kubectl create secret generic stripe-secret \
  --from-literal=secret-key=sk_test_your_stripe_secret_key \
  --from-literal=publishable-key=pk_test_your_stripe_publishable_key \
  -n ecommerce

# Create database secrets
kubectl create secret generic db-secret \
  --from-literal=redis-password=your-redis-password \
  -n ecommerce
```

### **6.2 Verify Secrets**
```bash
kubectl get secrets -n ecommerce
```

---

## í³Š **Step 7: Deploy Monitoring Stack**

### **7.1 Create Monitoring Namespace**
```bash
kubectl create namespace monitoring
```

### **7.2 Install Prometheus and Grafana**
```bash
# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=20Gi

# Install Grafana
helm install grafana grafana/grafana \
  -n monitoring \
  --set persistence.enabled=true \
  --set persistence.size=10Gi \
  --set adminPassword=admin123
```

### **7.3 Install ELK Stack**
```bash
# Add Elastic Helm repository
helm repo add elastic https://helm.elastic.co
helm repo update

# Install Elasticsearch
helm install elasticsearch elastic/elasticsearch \
  -n monitoring \
  --set replicas=1 \
  --set minimumMasterNodes=1

# Install Kibana
helm install kibana elastic/kibana \
  -n monitoring
```

**â±ï¸ Expected Time: 10-15 minutes**

---

## íº€ **Step 8: Deploy Application Services**

### **8.1 Deploy Services**
```bash
# Navigate back to project root
cd ../../..

# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/ -n ecommerce
```

### **8.2 Verify Deployments**
```bash
# Check pod status
kubectl get pods -n ecommerce

# Check services
kubectl get services -n ecommerce

# Check deployments
kubectl get deployments -n ecommerce
```

### **8.3 Wait for Pods to be Ready**
```bash
# Wait for all pods to be ready
kubectl wait --for=condition=ready pod --all -n ecommerce --timeout=300s
```

---

## í¼ **Step 9: Configure Domain and SSL**

### **9.1 Get Load Balancer URL**
```bash
# Get the load balancer URL
kubectl get ingress -n ecommerce
```

### **9.2 Configure Domain (Optional)**
```bash
# If you have a domain, create CNAME record:
# CNAME: yourdomain.com -> [load-balancer-url]
```

### **9.3 Install cert-manager for SSL**
```bash
# Install cert-manager
helm install cert-manager cert-manager \
  --repo https://charts.jetstack.io \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

---

## âœ… **Step 10: Verify Deployment**

### **10.1 Check Application Health**
```bash
# Check all pods are running
kubectl get pods -n ecommerce

# Check services are accessible
kubectl get services -n ecommerce

# Port forward to test locally
kubectl port-forward svc/frontend -n ecommerce 3000:80
```

### **10.2 Access Applications**
```bash
# Frontend (in browser)
http://localhost:3000

# API Gateway
kubectl port-forward svc/api-gateway -n ecommerce 8080:8080

# Grafana Dashboard
kubectl port-forward svc/grafana -n monitoring 3001:80
# Username: admin, Password: admin123

# Prometheus
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090
```

---

## í¾‰ **Congratulations!**

Your e-commerce platform is now deployed on AWS! 

### **What's Running:**
- âœ… Frontend React application
- âœ… Backend microservices (Users, Products, Orders, Payment)
- âœ… DynamoDB databases
- âœ… Redis caching
- âœ… Elasticsearch search
- âœ… Prometheus monitoring
- âœ… Grafana dashboards
- âœ… Auto-scaling enabled

### **Next Steps:**
1. Configure your domain name
2. Set up SSL certificates
3. Configure email notifications
4. Add more products to your catalog
5. Customize the frontend design

### **Estimated Total Cost:**
- **Development**: ~$50-100/month
- **Production**: ~$200-500/month (depending on traffic)

Your platform is now ready to handle real customers and transactions! íº€
