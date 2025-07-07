# E-commerce Kubernetes Platform Makefile
# This Makefile provides convenient commands for building, testing, and deploying the platform

.PHONY: help build test deploy clean install-tools setup-aws

# Default target
.DEFAULT_GOAL := help

# Variables
AWS_REGION ?= us-east-1
AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --query Account --output text 2>/dev/null)
ECR_REGISTRY := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
IMAGE_TAG ?= latest
CLUSTER_NAME ?= ecommerce-cluster
NAMESPACE ?= ecommerce

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
NC := \033[0m

# Services
SERVICES := users products orders payment delivery warehouse
FRONTEND := frontend

help: ## Show this help message
	@echo "$(BLUE)E-commerce Kubernetes Platform$(NC)"
	@echo "$(BLUE)================================$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(GREEN)Environment Variables:$(NC)"
	@echo "  AWS_REGION      AWS region (default: us-east-1)"
	@echo "  IMAGE_TAG       Docker image tag (default: latest)"
	@echo "  CLUSTER_NAME    EKS cluster name (default: ecommerce-cluster)"
	@echo "  NAMESPACE       Kubernetes namespace (default: ecommerce)"

install-tools: ## Install required tools (kubectl, helm, eksctl, etc.)
	@echo "$(BLUE)Installing required tools...$(NC)"
	@if ! command -v kubectl &> /dev/null; then \
		echo "Installing kubectl..."; \
		curl -LO "https://dl.k8s.io/release/$$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"; \
		chmod +x kubectl; \
		sudo mv kubectl /usr/local/bin/; \
	fi
	@if ! command -v helm &> /dev/null; then \
		echo "Installing Helm..."; \
		curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash; \
	fi
	@if ! command -v eksctl &> /dev/null; then \
		echo "Installing eksctl..."; \
		curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$$(uname -s)_amd64.tar.gz" | tar xz -C /tmp; \
		sudo mv /tmp/eksctl /usr/local/bin; \
	fi
	@echo "$(GREEN)Tools installation completed$(NC)"

setup-aws: ## Setup AWS infrastructure with Terraform
	@echo "$(BLUE)Setting up AWS infrastructure...$(NC)"
	@cd terraform && \
		terraform init && \
		terraform plan && \
		terraform apply -auto-approve
	@echo "$(GREEN)AWS infrastructure setup completed$(NC)"

create-cluster: ## Create EKS cluster
	@echo "$(BLUE)Creating EKS cluster...$(NC)"
	@eksctl create cluster \
		--name $(CLUSTER_NAME) \
		--region $(AWS_REGION) \
		--nodes 3 \
		--node-type t3.medium \
		--managed
	@echo "$(GREEN)EKS cluster created$(NC)"

update-kubeconfig: ## Update kubectl configuration for EKS
	@echo "$(BLUE)Updating kubeconfig...$(NC)"
	@aws eks update-kubeconfig --name $(CLUSTER_NAME) --region $(AWS_REGION)
	@echo "$(GREEN)Kubeconfig updated$(NC)"

install-argocd: ## Install ArgoCD on the cluster
	@echo "$(BLUE)Installing ArgoCD...$(NC)"
	@kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
	@kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
	@echo "$(YELLOW)Waiting for ArgoCD to be ready...$(NC)"
	@kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
	@echo "$(GREEN)ArgoCD installed successfully$(NC)"

install-jenkins: ## Install Jenkins using Helm
	@echo "$(BLUE)Installing Jenkins...$(NC)"
	@helm repo add jenkins https://charts.jenkins.io
	@helm repo update
	@kubectl create namespace jenkins --dry-run=client -o yaml | kubectl apply -f -
	@helm install jenkins jenkins/jenkins -n jenkins --create-namespace
	@echo "$(GREEN)Jenkins installed successfully$(NC)"

build-all: ## Build all Docker images
	@echo "$(BLUE)Building all services...$(NC)"
	@chmod +x scripts/build-all.sh
	@./scripts/build-all.sh
	@echo "$(GREEN)All services built successfully$(NC)"

build-frontend: ## Build frontend Docker image
	@echo "$(BLUE)Building frontend...$(NC)"
	@cd frontend && \
		npm ci && \
		npm run build && \
		docker build -t ecommerce-frontend:$(IMAGE_TAG) . && \
		docker tag ecommerce-frontend:$(IMAGE_TAG) $(ECR_REGISTRY)/ecommerce-frontend:$(IMAGE_TAG)
	@echo "$(GREEN)Frontend built successfully$(NC)"

build-service-%: ## Build specific service (e.g., make build-service-users)
	@echo "$(BLUE)Building $* service...$(NC)"
	@cd services/$* && \
		mvn clean package -DskipTests && \
		docker build -t ecommerce-$*:$(IMAGE_TAG) . && \
		docker tag ecommerce-$*:$(IMAGE_TAG) $(ECR_REGISTRY)/ecommerce-$*:$(IMAGE_TAG)
	@echo "$(GREEN)$* service built successfully$(NC)"

test-frontend: ## Run frontend tests
	@echo "$(BLUE)Running frontend tests...$(NC)"
	@cd frontend && npm test -- --coverage --watchAll=false
	@echo "$(GREEN)Frontend tests completed$(NC)"

test-service-%: ## Run tests for specific service
	@echo "$(BLUE)Running tests for $* service...$(NC)"
	@cd services/$* && mvn test
	@echo "$(GREEN)$* service tests completed$(NC)"

test-all: test-frontend $(addprefix test-service-,$(SERVICES)) ## Run all tests
	@echo "$(GREEN)All tests completed$(NC)"

push-all: ## Push all images to ECR
	@echo "$(BLUE)Pushing all images to ECR...$(NC)"
	@aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_REGISTRY)
	@docker push $(ECR_REGISTRY)/ecommerce-frontend:$(IMAGE_TAG)
	@for service in $(SERVICES); do \
		docker push $(ECR_REGISTRY)/ecommerce-$$service:$(IMAGE_TAG); \
	done
	@echo "$(GREEN)All images pushed successfully$(NC)"

deploy-namespace: ## Create Kubernetes namespaces
	@echo "$(BLUE)Creating namespaces...$(NC)"
	@kubectl apply -f k8s/namespace.yaml
	@echo "$(GREEN)Namespaces created$(NC)"

deploy-frontend: ## Deploy frontend to Kubernetes
	@echo "$(BLUE)Deploying frontend...$(NC)"
	@kubectl apply -f k8s/frontend/ -n $(NAMESPACE)
	@echo "$(GREEN)Frontend deployed$(NC)"

deploy-service-%: ## Deploy specific service to Kubernetes
	@echo "$(BLUE)Deploying $* service...$(NC)"
	@kubectl apply -f k8s/$*/ -n $(NAMESPACE)
	@echo "$(GREEN)$* service deployed$(NC)"

deploy-all: deploy-namespace deploy-frontend $(addprefix deploy-service-,$(SERVICES)) ## Deploy all services to Kubernetes
	@echo "$(GREEN)All services deployed successfully$(NC)"

deploy-argocd-apps: ## Deploy ArgoCD applications
	@echo "$(BLUE)Deploying ArgoCD applications...$(NC)"
	@kubectl apply -f argocd/projects/
	@kubectl apply -f argocd/applications/
	@echo "$(GREEN)ArgoCD applications deployed$(NC)"

status: ## Show deployment status
	@echo "$(BLUE)Deployment Status:$(NC)"
	@echo "$(YELLOW)Namespaces:$(NC)"
	@kubectl get namespaces | grep ecommerce
	@echo ""
	@echo "$(YELLOW)Pods in $(NAMESPACE):$(NC)"
	@kubectl get pods -n $(NAMESPACE)
	@echo ""
	@echo "$(YELLOW)Services in $(NAMESPACE):$(NC)"
	@kubectl get services -n $(NAMESPACE)
	@echo ""
	@echo "$(YELLOW)Ingresses in $(NAMESPACE):$(NC)"
	@kubectl get ingress -n $(NAMESPACE)

logs-%: ## Show logs for specific service
	@echo "$(BLUE)Showing logs for $* service...$(NC)"
	@kubectl logs -l app=$* -n $(NAMESPACE) --tail=100 -f

port-forward-%: ## Port forward to specific service (e.g., make port-forward-frontend)
	@echo "$(BLUE)Port forwarding to $* service...$(NC)"
	@if [ "$*" = "frontend" ]; then \
		kubectl port-forward svc/frontend 3000:80 -n $(NAMESPACE); \
	else \
		kubectl port-forward svc/$* 8080:8080 -n $(NAMESPACE); \
	fi

argocd-ui: ## Access ArgoCD UI
	@echo "$(BLUE)Accessing ArgoCD UI...$(NC)"
	@echo "$(YELLOW)ArgoCD will be available at: http://localhost:8080$(NC)"
	@echo "$(YELLOW)Default username: admin$(NC)"
	@echo "$(YELLOW)Get password with: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d$(NC)"
	@kubectl port-forward svc/argocd-server -n argocd 8080:443

jenkins-ui: ## Access Jenkins UI
	@echo "$(BLUE)Accessing Jenkins UI...$(NC)"
	@echo "$(YELLOW)Jenkins will be available at: http://localhost:8081$(NC)"
	@echo "$(YELLOW)Get password with: kubectl get secret --namespace jenkins jenkins -o jsonpath='{.data.jenkins-admin-password}' | base64 --decode$(NC)"
	@kubectl port-forward svc/jenkins -n jenkins 8081:8080

clean-images: ## Clean up local Docker images
	@echo "$(BLUE)Cleaning up local Docker images...$(NC)"
	@docker rmi ecommerce-frontend:$(IMAGE_TAG) 2>/dev/null || true
	@for service in $(SERVICES); do \
		docker rmi ecommerce-$$service:$(IMAGE_TAG) 2>/dev/null || true; \
	done
	@echo "$(GREEN)Local images cleaned up$(NC)"

clean-k8s: ## Clean up Kubernetes resources
	@echo "$(BLUE)Cleaning up Kubernetes resources...$(NC)"
	@kubectl delete -f k8s/ -n $(NAMESPACE) --ignore-not-found=true
	@kubectl delete namespace $(NAMESPACE) --ignore-not-found=true
	@echo "$(GREEN)Kubernetes resources cleaned up$(NC)"

clean-all: clean-images clean-k8s ## Clean up everything
	@echo "$(GREEN)Cleanup completed$(NC)"

dev-up: ## Start development environment with Docker Compose
	@echo "$(BLUE)Starting development environment...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)Development environment started$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)API Gateway: http://localhost:8080$(NC)"

dev-down: ## Stop development environment
	@echo "$(BLUE)Stopping development environment...$(NC)"
	@docker-compose down
	@echo "$(GREEN)Development environment stopped$(NC)"

dev-logs: ## Show development environment logs
	@docker-compose logs -f

# Quick setup targets
quick-setup: install-tools setup-aws create-cluster update-kubeconfig install-argocd install-jenkins ## Complete setup from scratch
	@echo "$(GREEN)Quick setup completed!$(NC)"

quick-deploy: build-all push-all deploy-all deploy-argocd-apps ## Build and deploy everything
	@echo "$(GREEN)Quick deployment completed!$(NC)"
