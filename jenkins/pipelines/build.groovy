// Jenkins Pipeline Library for E-commerce Platform
// Build Pipeline Functions

def buildFrontend() {
    dir('frontend') {
        sh 'npm ci'
        sh 'npm run lint'
        sh 'npm test -- --coverage --watchAll=false'
        sh 'npm run build'
    }
}

def buildBackendService(serviceName) {
    dir("services/${serviceName}") {
        sh 'mvn clean compile'
        sh 'mvn test'
        sh 'mvn package -DskipTests'
    }
}

def runSonarAnalysis(serviceName, projectKey) {
    def scannerHome = tool 'SonarQubeScanner'
    withSonarQubeEnv('SonarQube') {
        if (serviceName == 'frontend') {
            dir('frontend') {
                sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${projectKey}-frontend"
            }
        } else {
            dir("services/${serviceName}") {
                sh "mvn sonar:sonar -Dsonar.projectKey=${projectKey}-${serviceName}"
            }
        }
    }
}

def buildDockerImage(serviceName, imageTag) {
    def dockerfilePath = serviceName == 'frontend' ? 'frontend/Dockerfile' : "services/${serviceName}/Dockerfile"
    def imageName = serviceName == 'frontend' ? 'ecommerce-frontend' : "ecommerce-${serviceName}"
    
    script {
        def image = docker.build("${imageName}:${imageTag}", "-f ${dockerfilePath} .")
        return image
    }
}

def pushToECR(serviceName, imageTag, ecrRegistry) {
    def imageName = serviceName == 'frontend' ? 'ecommerce-frontend' : "ecommerce-${serviceName}"
    
    sh """
        aws ecr get-login-password --region \${AWS_REGION} | \\
        docker login --username AWS --password-stdin ${ecrRegistry}
        
        docker tag ${imageName}:${imageTag} ${ecrRegistry}/${imageName}:${imageTag}
        docker push ${ecrRegistry}/${imageName}:${imageTag}
        
        # Also tag as latest for the environment
        docker tag ${imageName}:${imageTag} ${ecrRegistry}/${imageName}:\${ENVIRONMENT}-latest
        docker push ${ecrRegistry}/${imageName}:\${ENVIRONMENT}-latest
    """
}

def runSecurityScan(imageName, imageTag) {
    sh """
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
        -v \$(pwd):/tmp/.cache/ aquasec/trivy:latest image \\
        --exit-code 0 --severity HIGH,CRITICAL \\
        --format template --template "@contrib/sarif.tpl" \\
        -o /tmp/.cache/trivy-results.sarif \\
        ${imageName}:${imageTag}
    """
}

def deployToKubernetes(serviceName, imageTag, environment) {
    sh """
        # Update image tag in ArgoCD application
        argocd app set ecommerce-${serviceName} \\
        --parameter image.tag=${imageTag} \\
        --parameter image.repository=\${ECR_REGISTRY}/ecommerce-${serviceName}
        
        # Sync the application
        argocd app sync ecommerce-${serviceName} --prune
        
        # Wait for deployment
        argocd app wait ecommerce-${serviceName} --timeout 300
    """
}

def runIntegrationTests(serviceName, environment) {
    sh """
        # Run integration tests against deployed service
        kubectl port-forward svc/${serviceName} 8080:8080 -n ecommerce-${environment} &
        sleep 10
        
        # Run API tests
        newman run tests/integration/${serviceName}-api-tests.json \\
        --environment tests/environments/${environment}.json \\
        --reporters cli,junit --reporter-junit-export newman-results.xml
        
        # Kill port-forward
        pkill -f "kubectl port-forward"
    """
}

return this
