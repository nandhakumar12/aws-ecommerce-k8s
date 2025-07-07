# Cluster outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = module.eks.cluster_iam_role_name
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "cluster_oidc_issuer_url" {
  description = "The URL on the EKS cluster for the OpenID Connect identity provider"
  value       = module.eks.cluster_oidc_issuer_url
}

# VPC outputs
output "vpc_id" {
  description = "ID of the VPC where the cluster is deployed"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "List of IDs of private subnets"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "List of IDs of public subnets"
  value       = module.vpc.public_subnets
}

output "database_subnets" {
  description = "List of IDs of database subnets"
  value       = module.vpc.database_subnets
}

# ECR outputs
output "ecr_repositories" {
  description = "Map of ECR repository URLs"
  value = var.enable_ecr_repositories ? {
    for repo in var.ecr_repositories : repo => aws_ecr_repository.repositories[repo].repository_url
  } : {}
}

output "ecr_registry_id" {
  description = "The registry ID where the repositories were created"
  value = var.enable_ecr_repositories ? {
    for repo in var.ecr_repositories : repo => aws_ecr_repository.repositories[repo].registry_id
  } : {}
}

# Load Balancer Controller IAM Role
output "aws_load_balancer_controller_role_arn" {
  description = "The Amazon Resource Name (ARN) specifying the IAM role for AWS Load Balancer Controller"
  value       = module.load_balancer_controller_irsa_role.iam_role_arn
}

# EBS CSI Driver IAM Role
output "ebs_csi_irsa_role_arn" {
  description = "The Amazon Resource Name (ARN) specifying the IAM role for EBS CSI Driver"
  value       = module.ebs_csi_irsa_role.iam_role_arn
}

# Region
output "region" {
  description = "AWS region"
  value       = var.aws_region
}

# Account ID
output "account_id" {
  description = "AWS Account ID"
  value       = data.aws_caller_identity.current.account_id
}

# Kubectl config command
output "configure_kubectl" {
  description = "Configure kubectl: make sure you're able to connect to the cluster"
  value       = "aws eks --region ${var.aws_region} update-kubeconfig --name ${module.eks.cluster_name}"
}

# ArgoCD access
output "argocd_access" {
  description = "Commands to access ArgoCD"
  value = {
    install = "kubectl create namespace argocd && kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml"
    password = "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
    port_forward = "kubectl port-forward svc/argocd-server -n argocd 8080:443"
    url = "https://localhost:8080"
  }
}

# Jenkins access
output "jenkins_access" {
  description = "Commands to access Jenkins"
  value = {
    install = "helm repo add jenkins https://charts.jenkins.io && helm repo update && helm install jenkins jenkins/jenkins -n jenkins --create-namespace"
    password = "kubectl get secret --namespace jenkins jenkins -o jsonpath='{.data.jenkins-admin-password}' | base64 --decode"
    port_forward = "kubectl port-forward svc/jenkins -n jenkins 8081:8080"
    url = "http://localhost:8081"
  }
}
