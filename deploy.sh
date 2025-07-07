#!/bin/bash

echo "Ì∫Ä E-commerce Platform - One-Click AWS Deployment"
echo "=================================================="
echo ""
echo "This script will deploy your complete e-commerce platform to AWS."
echo "Estimated time: 45-60 minutes"
echo "Estimated cost: $200-400/month"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "Starting deployment..."
echo ""

# Run the quick deploy script
./scripts/quick-deploy.sh

echo ""
echo "Ìæâ Deployment completed!"
echo ""
echo "Next steps:"
echo "1. Update your Stripe API keys"
echo "2. Add products to your catalog"
echo "3. Configure your domain (optional)"
echo ""
echo "Your e-commerce platform is now live! ÔøΩÔøΩÔ∏è"
