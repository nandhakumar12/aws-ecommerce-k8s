# 🛍️ E-commerce Kubernetes Platform

## 📋 **Project Overview**

A complete containerized e-commerce platform with modern DevOps practices using Kubernetes, Jenkins, ArgoCD, and Helm.

### **Architecture Components:**
- 🛍️ **React Frontend** - Modern e-commerce UI
- 🔧 **Microservices** - Users, Products, Orders, Payment, Delivery, Warehouse
- 🔄 **CI/CD Pipeline** - Jenkins with Maven/SonarQube
- ☸️ **Kubernetes Deployment** - EKS with ArgoCD GitOps
- 📦 **Container Registry** - Amazon ECR
- 📊 **Monitoring** - Prometheus, Grafana, ELK Stack

## 🚀 **Quick Start Guide**

### **Prerequisites:**
```bash
# Install required tools
- AWS CLI v2
- kubectl
- Helm v3
- Docker
- Java 11+
- Node.js 18+
- Maven 3.8+
- Terraform 1.5+
```

### **1. AWS Setup**
```bash
# Configure AWS credentials
aws configure

# Create EKS cluster
eksctl create cluster --name ecommerce-cluster --region us-east-1 --nodes 3

# Update kubectl config
aws eks update-kubeconfig --name ecommerce-cluster --region us-east-1
```

### **2. Deploy Infrastructure**
```bash
# Clone repository
git clone <your-repo-url>
cd ecommerce-k8s-platform

# Deploy AWS infrastructure
cd terraform
terraform init
terraform apply

# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Install Jenkins
helm repo add jenkins https://charts.jenkins.io
helm repo update
helm install jenkins jenkins/jenkins -n jenkins --create-namespace
```

### **3. Build and Deploy Services**
```bash
# Build all services
./scripts/build-all.sh

# Deploy to Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/

# Deploy via ArgoCD
kubectl apply -f argocd/applications/
```

### **4. Access Applications**
```bash
# Get service URLs
kubectl get ingress -n ecommerce

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access Jenkins
kubectl port-forward svc/jenkins -n jenkins 8081:8080

# Access E-commerce Frontend
kubectl port-forward svc/frontend -n ecommerce 3000:80
```

## 📁 **Project Structure**

```
ecommerce-k8s-platform/
├── README.md                          # This file
├── docker-compose.yml                 # Local development
├── .gitignore                         # Git ignore rules
├── Makefile                           # Build automation
│
├── frontend/                          # React E-commerce UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── ProductCard.js
│   │   │   ├── Cart.js
│   │   │   └── Checkout.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── ProductsPage.js
│   │   │   ├── CartPage.js
│   │   │   └── OrdersPage.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── services/                          # Backend Microservices
│   ├── users/
│   │   ├── src/main/java/com/ecommerce/users/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── Jenkinsfile
│   ├── products/
│   │   ├── src/main/java/com/ecommerce/products/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── Jenkinsfile
│   ├── orders/
│   │   ├── src/main/java/com/ecommerce/orders/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── Jenkinsfile
│   ├── payment/
│   │   ├── src/main/java/com/ecommerce/payment/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── Jenkinsfile
│   ├── delivery/
│   │   ├── src/main/java/com/ecommerce/delivery/
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   └── Jenkinsfile
│   └── warehouse/
│       ├── src/main/java/com/ecommerce/warehouse/
│       ├── pom.xml
│       ├── Dockerfile
│       └── Jenkinsfile
│
├── terraform/                         # AWS Infrastructure
│   ├── main.tf
│   ├── eks.tf
│   ├── ecr.tf
│   ├── vpc.tf
│   ├── variables.tf
│   └── outputs.tf
│
├── k8s/                              # Kubernetes Manifests
│   ├── namespace.yaml
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   ├── users/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── configmap.yaml
│   ├── products/
│   ├── orders/
│   ├── payment/
│   ├── delivery/
│   └── warehouse/
│
├── helm/                             # Helm Charts
│   ├── ecommerce/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── monitoring/
│       ├── Chart.yaml
│       └── values.yaml
│
├── jenkins/                          # Jenkins Configuration
│   ├── Jenkinsfile
│   ├── pipelines/
│   └── sonar-project.properties
│
├── argocd/                          # ArgoCD Applications
│   ├── applications/
│   │   ├── frontend-app.yaml
│   │   ├── users-app.yaml
│   │   ├── products-app.yaml
│   │   ├── orders-app.yaml
│   │   ├── payment-app.yaml
│   │   ├── delivery-app.yaml
│   │   └── warehouse-app.yaml
│   └── projects/
│       └── ecommerce-project.yaml
│
├── monitoring/                       # Monitoring Stack
│   ├── prometheus/
│   ├── grafana/
│   └── elasticsearch/
│
└── scripts/                          # Build Scripts
    ├── build-all.sh
    ├── deploy-all.sh
    └── cleanup.sh
```

## 🔧 **Development Workflow**

### **Local Development:**
```bash
# Start local services
docker-compose up -d

# Run individual service
cd services/users
mvn spring-boot:run

# Run frontend
cd frontend
npm start
```

### **CI/CD Pipeline:**
```bash
# 1. Code commit triggers Jenkins
# 2. Maven builds and tests
# 3. SonarQube quality analysis
# 4. Docker image build
# 5. Push to ECR
# 6. ArgoCD deploys to Kubernetes
```

## 🎯 **Key Features**

### **E-commerce Frontend:**
- ✅ Product catalog and search
- ✅ Shopping cart and checkout
- ✅ User authentication
- ✅ Order management
- ✅ Responsive design

### **Microservices:**
- ✅ Users service (authentication, profiles)
- ✅ Products service (catalog, inventory)
- ✅ Orders service (order processing)
- ✅ Payment service (payment processing)
- ✅ Delivery service (shipping, tracking)
- ✅ Warehouse service (inventory management)

### **DevOps:**
- ✅ Automated CI/CD with Jenkins
- ✅ GitOps with ArgoCD
- ✅ Container orchestration with Kubernetes
- ✅ Infrastructure as Code with Terraform

## 📊 **Monitoring & Observability**

### **Metrics:**
- Application performance (Prometheus)
- Business metrics (Grafana)
- Log aggregation (ELK Stack)
- Error tracking

### **Health Checks:**
- Kubernetes liveness/readiness probes
- Application health endpoints
- Database connectivity
- Service dependencies

## 🚀 **Deployment Environments**

### **Development:**
```bash
# Deploy to dev namespace
kubectl apply -f k8s/ -n ecommerce-dev
```

### **Staging:**
```bash
# Deploy via ArgoCD
argocd app sync ecommerce-staging
```

### **Production:**
```bash
# Production deployment
argocd app sync ecommerce-prod --prune
```

## 🛠️ **Build Commands**

### **Build All Services:**
```bash
# Build all Docker images
make build-all

# Push to ECR
make push-all

# Deploy to Kubernetes
make deploy-all
```

### **Individual Service:**
```bash
# Build specific service
make build-users
make build-products
make build-orders

# Deploy specific service
make deploy-users
make deploy-products
```

## 📈 **Scaling**

### **Auto-scaling:**
```bash
# Enable HPA for services
kubectl apply -f k8s/hpa/
```

## 🔐 **Security**

### **Authentication:**
- JWT token-based auth
- OAuth2 integration
- Role-based access control
- API rate limiting

## 🚀 **Getting Started Steps**

1. **Setup AWS Environment**
2. **Deploy Infrastructure with Terraform**
3. **Install Jenkins and ArgoCD**
4. **Build and Push Docker Images**
5. **Deploy Services via ArgoCD**
6. **Access Applications**

---

**Ready to scale your e-commerce platform! 🚀**
