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
        // Tu ID de credencial para Docker Hub
        REGISTRY_CREDENTIALS_ID = 'dc346772-1eb6-498e-820f-e8b7b5e1cd83'
        // Tu ID de credencial para GitHub
        GIT_CREDENTIALS_ID = 'b98410a3-ed25-43e4-8477-4bd70d39c0d8'
    }

    stages {
        stage('Build & Push Image') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId: "${env.REGISTRY_CREDENTIALS_ID}", usernameVariable: 'DUSER', passwordVariable: 'DPASS')]) {
                        sh "echo \$DPASS | docker login -u \$DUSER --password-stdin"
                        
                        // El Dockerfile debe estar configurado para puerto 3033 y npm
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
                // Utilizamos tu ID de GitHub para clonar y actualizar
                git branch: 'main', credentialsId: "${env.GIT_CREDENTIALS_ID}", url: 'https://github.com/sergioga06/admin-panel-frontend.git'
                
                script {
                    // Actualizamos el tag de la imagen en el manifiesto de K8s
                    sh "sed -i 's|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}|g' deploy/k8s-app/frontend-deployment.yaml"
                    
                    sh "git config user.email 'jenkins@vps.com'"
                    sh "git config user.name 'Jenkins CI'"
                    sh "git add deploy/k8s-app/frontend-deployment.yaml"
                    
                    // El '|| true' evita que el pipeline falle si no hay cambios reales que guardar
                    sh "git commit -m 'Update admin-panel image to version ${env.BUILD_NUMBER}' || echo 'Sin cambios nuevos'"
                    
                    // Empujamos los cambios de vuelta a GitHub para que Argo CD los vea
                    sh "git push origin main"
                }
            }
        }
    }
}