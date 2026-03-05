pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker
    image: docker:24.0.5-dind
    securityContext:
      privileged: true
"""
        }
    }

    environment {
        DOCKER_IMAGE = "sergiogg06/admin-panel-frontend" 
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        // AQUÍ COLOCAS TU ID ESPECÍFICO
        REGISTRY_CREDENTIALS_ID = 'dc346772-1eb6-498e-820f-e8b7b5e1cd83' 
    }

    stages {
        stage('Build & Push Image') {
            steps {
                container('docker') {
                    // El pipeline buscará ahora tu credencial personal
                    withCredentials([usernamePassword(credentialsId: "${env.REGISTRY_CREDENTIALS_ID}", usernameVariable: 'DUSER', passwordVariable: 'DPASS')]) {
                        sh "echo \$DPASS | docker login -u \$DUSER --password-stdin"
                        
                        sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                        sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                        
                        sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                        sh "docker push ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Update GitOps Manifests') {
            steps {
                // Aquí actualizamos el archivo de despliegue para Argo CD
                // Asegúrate de tener el ID 'git-credentials-id' creado para GitHub
                git branch: 'main', credentialsId: 'git-credentials-id', url: 'https://github.com/sergioga06/admin-panel-frontend.git'
                
                sh "sed -i 's|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}|g' deploy/k8s-app/frontend-deployment.yaml"
                
                sh "git config user.email 'jenkins@vps.com'"
                sh "git config user.name 'Jenkins CI'"
                sh "git add deploy/k8s-app/frontend-deployment.yaml"
                sh "git commit -m 'Update admin-panel image to version ${env.BUILD_NUMBER}'"
                sh "git push origin main"
            }
        }
    }
}