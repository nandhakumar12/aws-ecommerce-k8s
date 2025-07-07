# 🚀 E-commerce Kubernetes Platform - Deployment Guide

## 📋 **Complete Step-by-Step Deployment Instructions**

This guide will walk you through deploying the complete e-commerce platform on AWS using Kubernetes, Jenkins, ArgoCD, and Helm.

## 🔧 **Prerequisites**

### **Required Tools:**
```bash
# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Install Terraform
wget https://releases.hashicorp.com/terraform/1.5.7/terraform_1.5.7_linux_amd64.zip
unzip terraform_1.5.7_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

### **AWS Account Setup:**
```bash
# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region (us-east-1), and output format (json)

# Verify AWS configuration
aws sts get-caller-identity
```

## 🏗️ **Step 1: Infrastructure Setup**

### **1.1 Create S3 Bucket for Terraform State**
```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://ecommerce-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket ecommerce-terraform-state \
    --versioning-configuration Status=Enabled
```

### **1.2 Deploy Infrastructure with Terraform**
```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the infrastructure
terraform apply -auto-approve

# Note: This will create:
# - VPC and networking
# - EKS cluster
# - ECR repositories
# - IAM roles and policies
# - Security groups
```

### **1.3 Update kubectl Configuration**
```bash
# Update kubeconfig for the new EKS cluster
aws eks update-kubeconfig --name ecommerce-cluster --region us-east-1

# Verify cluster access
kubectl get nodes
```

## 🔄 **Step 2: Install CI/CD Tools**

### **2.1 Install ArgoCD**
```bash
# Create ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# Get ArgoCD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access ArgoCD UI (in another terminal)
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open browser: https://localhost:8080
# Username: admin, Password: (from above command)
```

### **2.2 Install Jenkins**
```bash
# Add Jenkins Helm repository
helm repo add jenkins https://charts.jenkins.io
helm repo update

# Create Jenkins namespace
kubectl create namespace jenkins

# Install Jenkins
helm install jenkins jenkins/jenkins -n jenkins

# Get Jenkins admin password
kubectl get secret --namespace jenkins jenkins -o jsonpath="{.data.jenkins-admin-password}" | base64 --decode

# Access Jenkins UI (in another terminal)
kubectl port-forward svc/jenkins -n jenkins 8081:8080
# Open browser: http://localhost:8081
# Username: admin, Password: (from above command)
```

## 🏭 **Step 3: Build and Deploy Services**

### **3.1 Build All Services**
```bash
# Make build script executable
chmod +x scripts/build-all.sh

# Build all services (this will take 10-15 minutes)
./scripts/build-all.sh

# Or use Makefile
make build-all
```

### **3.2 Create Kubernetes Namespaces**
```bash
# Create namespaces
kubectl apply -f k8s/namespace.yaml

# Verify namespaces
kubectl get namespaces | grep ecommerce
```

### **3.3 Deploy Services to Kubernetes**
```bash
# Deploy all services
kubectl apply -f k8s/ -n ecommerce

# Or use Makefile
make deploy-all

# Check deployment status
kubectl get pods -n ecommerce
kubectl get services -n ecommerce
```

### **3.4 Setup ArgoCD Applications**
```bash
# Deploy ArgoCD project and applications
kubectl apply -f argocd/projects/
kubectl apply -f argocd/applications/

# Verify ArgoCD applications
kubectl get applications -n argocd
```

## 🌐 **Step 4: Access Applications**

### **4.1 Frontend Application**
```bash
# Port forward to frontend
kubectl port-forward svc/frontend -n ecommerce 3000:80

# Open browser: http://localhost:3000
```

### **4.2 API Services**
```bash
# Port forward to specific service (example: users)
kubectl port-forward svc/users -n ecommerce 8080:8080

# Test API endpoint
curl http://localhost:8080/actuator/health
```

### **4.3 Monitoring**
```bash
# If monitoring is enabled, access Grafana
kubectl port-forward svc/grafana -n monitoring 3001:3000

# Open browser: http://localhost:3001
# Default credentials: admin/admin
```

## 🔧 **Step 5: Configure CI/CD Pipeline**

### **5.1 Jenkins Pipeline Setup**
1. Access Jenkins UI (http://localhost:8081)
2. Install required plugins:
   - Docker Pipeline
   - Kubernetes
   - AWS Steps
   - SonarQube Scanner
3. Create credentials:
   - AWS credentials
   - Docker registry credentials
   - Kubernetes config
4. Create pipeline jobs for each service using the provided Jenkinsfile

### **5.2 ArgoCD Configuration**
1. Access ArgoCD UI (https://localhost:8080)
2. Connect your Git repository
3. Sync applications
4. Configure auto-sync and self-healing

## 📊 **Step 6: Monitoring and Logging**

### **6.1 Install Monitoring Stack**
```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Install Grafana (if not included above)
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana -n monitoring
```

### **6.2 Install Logging Stack**
```bash
# Install Elasticsearch, Logstash, Kibana
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging --create-namespace
helm install kibana elastic/kibana -n logging
helm install filebeat elastic/filebeat -n logging
```

## 🔒 **Step 7: Security and Best Practices**

### **7.1 Network Policies**
```bash
# Apply network policies
kubectl apply -f k8s/network-policies/ -n ecommerce
```

### **7.2 RBAC Configuration**
```bash
# Apply RBAC policies
kubectl apply -f k8s/rbac/ -n ecommerce
```

### **7.3 Secrets Management**
```bash
# Create secrets for database connections
kubectl create secret generic users-db-secret \
  --from-literal=url=jdbc:postgresql://users-db:5432/users \
  --from-literal=username=postgres \
  --from-literal=password=your-secure-password \
  -n ecommerce

# Create JWT secret
kubectl create secret generic users-jwt-secret \
  --from-literal=secret=your-jwt-secret-key \
  -n ecommerce
```

## 🧪 **Step 8: Testing**

### **8.1 Health Checks**
```bash
# Check all pods are running
kubectl get pods -n ecommerce

# Check service health endpoints
for service in frontend users products orders payment delivery warehouse; do
  echo "Checking $service..."
  kubectl port-forward svc/$service -n ecommerce 8080:8080 &
  sleep 2
  curl -f http://localhost:8080/actuator/health || curl -f http://localhost:8080/health
  pkill -f "kubectl port-forward svc/$service"
done
```

### **8.2 Integration Tests**
```bash
# Run integration tests
cd tests
npm install
npm run test:integration
```

## 🚀 **Step 9: Production Deployment**

### **9.1 Domain and SSL Setup**
```bash
# Update ingress with your domain
# Edit k8s/frontend/ingress.yaml and replace yourdomain.com

# Create SSL certificate in AWS Certificate Manager
aws acm request-certificate \
  --domain-name ecommerce.yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Update ingress with certificate ARN
```

### **9.2 Auto-scaling Configuration**
```bash
# Apply HPA (Horizontal Pod Autoscaler)
kubectl apply -f k8s/hpa/ -n ecommerce

# Verify HPA
kubectl get hpa -n ecommerce
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

**1. Pods not starting:**
```bash
kubectl describe pod <pod-name> -n ecommerce
kubectl logs <pod-name> -n ecommerce
```

**2. Service not accessible:**
```bash
kubectl get svc -n ecommerce
kubectl get endpoints -n ecommerce
```

**3. ArgoCD sync issues:**
```bash
# Check ArgoCD application status
kubectl get applications -n argocd
argocd app get <app-name>
argocd app sync <app-name> --force
```

**4. Jenkins build failures:**
- Check Jenkins logs
- Verify AWS credentials
- Ensure Docker daemon is running
- Check ECR repository permissions

## 📈 **Scaling and Optimization**

### **Horizontal Scaling:**
```bash
# Scale specific service
kubectl scale deployment users --replicas=5 -n ecommerce

# Auto-scaling based on CPU/Memory
kubectl apply -f k8s/hpa/
```

### **Vertical Scaling:**
```bash
# Update resource requests/limits in deployment YAML
# Apply changes
kubectl apply -f k8s/users/deployment.yaml -n ecommerce
```

## 🔄 **Maintenance**

### **Regular Tasks:**
```bash
# Update images
make build-all push-all

# Restart deployments
kubectl rollout restart deployment/users -n ecommerce

# Backup databases
kubectl exec -it <postgres-pod> -n ecommerce -- pg_dump -U postgres dbname > backup.sql

# Update cluster
eksctl update cluster --name ecommerce-cluster
```

## 📞 **Support**

For issues and questions:
- Check logs: `kubectl logs <pod-name> -n ecommerce`
- Check events: `kubectl get events -n ecommerce`
- ArgoCD UI: https://localhost:8080
- Jenkins UI: http://localhost:8081
- Grafana: http://localhost:3001

---

**🎉 Congratulations! Your e-commerce platform is now running on Kubernetes with full CI/CD! 🎉**
