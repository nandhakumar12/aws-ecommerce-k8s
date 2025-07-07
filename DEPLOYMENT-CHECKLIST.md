# âœ… AWS Deployment Checklist

## í¾¯ **Before You Start**

### **Prerequisites (Complete These First):**
- [ ] AWS Account created and payment method added
- [ ] AWS CLI installed and configured
- [ ] kubectl installed
- [ ] Helm installed  
- [ ] Terraform installed
- [ ] Docker installed and running
- [ ] Stripe account created (for payments)

---

## íº€ **Step-by-Step Deployment**

### **Phase 1: AWS Setup (15 minutes)**
- [ ] **Step 1:** Install required tools (AWS CLI, kubectl, Helm, Terraform, Docker)
- [ ] **Step 2:** Create AWS account and add payment method
- [ ] **Step 3:** Create IAM user with required permissions
- [ ] **Step 4:** Configure AWS CLI with credentials
- [ ] **Step 5:** Verify AWS access with `aws sts get-caller-identity`

### **Phase 2: Infrastructure (20 minutes)**
- [ ] **Step 6:** Navigate to terraform directory
- [ ] **Step 7:** Run `terraform init`
- [ ] **Step 8:** Run `terraform plan` (review what will be created)
- [ ] **Step 9:** Run `terraform apply` (creates EKS, DynamoDB, ECR, etc.)
- [ ] **Step 10:** Verify infrastructure with AWS console

### **Phase 3: Kubernetes Setup (10 minutes)**
- [ ] **Step 11:** Update kubectl config: `aws eks update-kubeconfig --region us-east-1 --name ecommerce-cluster`
- [ ] **Step 12:** Verify connection: `kubectl cluster-info`
- [ ] **Step 13:** Install AWS Load Balancer Controller
- [ ] **Step 14:** Install Metrics Server
- [ ] **Step 15:** Create namespaces

### **Phase 4: Build & Deploy (15 minutes)**
- [ ] **Step 16:** Login to ECR
- [ ] **Step 17:** Build and push Docker images (6 services)
- [ ] **Step 18:** Create Kubernetes secrets (JWT, Stripe, etc.)
- [ ] **Step 19:** Deploy monitoring stack (Prometheus, Grafana)
- [ ] **Step 20:** Deploy application services

### **Phase 5: Verification (5 minutes)**
- [ ] **Step 21:** Check all pods are running
- [ ] **Step 22:** Port-forward and test frontend
- [ ] **Step 23:** Test API endpoints
- [ ] **Step 24:** Access monitoring dashboards
- [ ] **Step 25:** Verify complete functionality

---

## í¾¯ **Quick Commands Reference**

### **Essential Commands:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Deploy infrastructure
cd terraform && terraform apply

# Update kubectl
aws eks update-kubeconfig --region us-east-1 --name ecommerce-cluster

# Check cluster
kubectl cluster-info
kubectl get nodes

# Check deployments
kubectl get pods -n ecommerce
kubectl get services -n ecommerce

# Access applications
kubectl port-forward svc/frontend -n ecommerce 3000:80
kubectl port-forward svc/grafana -n monitoring 3001:80
```

---

## í´§ **Configuration Required**

### **Environment Variables (.env file):**
```bash
# Copy template and edit
cp .env.example .env

# Required values:
AWS_REGION=us-east-1
CLUSTER_NAME=ecommerce-cluster
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### **Stripe Setup:**
1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Get test API keys from dashboard
4. Add keys to Kubernetes secrets

---

## í¾‰ **Success Indicators**

### **You'll know it's working when:**
- [ ] All pods show "Running" status
- [ ] Frontend loads at http://localhost:3000
- [ ] You can register/login users
- [ ] Products are displayed
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Grafana shows metrics
- [ ] No error logs in pods

---

## í¶˜ **Troubleshooting**

### **Common Issues:**

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n ecommerce
kubectl logs <pod-name> -n ecommerce
```

**Can't connect to cluster:**
```bash
aws eks update-kubeconfig --region us-east-1 --name ecommerce-cluster
kubectl config current-context
```

**Images not found:**
```bash
# Check ECR repositories
aws ecr describe-repositories --region us-east-1

# Re-push images
docker push <ecr-url>/<service>:latest
```

**Services not accessible:**
```bash
kubectl get services -n ecommerce
kubectl get ingress -n ecommerce
```

---

## í²° **Cost Monitoring**

### **Expected AWS Costs:**
- **EKS Cluster:** ~$73/month
- **EC2 Instances:** ~$95/month (3 t3.medium)
- **DynamoDB:** ~$5-20/month (pay-per-request)
- **Load Balancer:** ~$23/month
- **Total:** ~$200-250/month

### **Cost Optimization:**
- Use Spot instances for worker nodes
- Enable auto-scaling to scale down during low traffic
- Monitor DynamoDB usage
- Set up billing alerts

---

## í¾¯ **Post-Deployment Tasks**

### **Production Readiness:**
- [ ] Configure custom domain name
- [ ] Set up SSL certificates
- [ ] Configure email notifications
- [ ] Add real product data
- [ ] Set up backup strategies
- [ ] Configure monitoring alerts
- [ ] Perform security audit
- [ ] Load testing
- [ ] Documentation for team

---

## í³ž **Support**

### **If you need help:**
1. Check the logs: `kubectl logs <pod-name> -n ecommerce`
2. Verify resources: `kubectl get all -n ecommerce`
3. Check AWS console for infrastructure issues
4. Review Terraform state: `terraform show`

### **Useful Resources:**
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)

---

**í¾‰ Your e-commerce platform will be production-ready after completing this checklist!**
