pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "tu-usuario/admin-panel-frontend"
        REGISTRY_CREDENTIALS = 'docker-hub-credentials-id'
        GIT_REPO_URL = "https://github.com/tu-usuario/mi-repo-manifests.git"
    }
    stages {
        stage('Build & Push Docker Image') {
            steps {
                script {
                    def imageTag = "${env.BUILD_NUMBER}"
                    docker.withRegistry('', REGISTRY_CREDENTIALS) {
                        def customImage = docker.build("${DOCKER_IMAGE}:${imageTag}")
                        customImage.push()
                        customImage.push("latest")
                    }
                }
            }
        }
        stage('Update Kubernetes Manifests') {
            steps {
                // Clonar el repo de manifiestos y actualizar el tag de la imagen
                git branch: 'main', credentialsId: 'git-credentials-id', url: GIT_REPO_URL
                sh "sed -i 's|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}|g' k8s/deployment.yaml"
                sh "git add k8s/deployment.yaml"
                sh "git commit -m 'Update image tag to ${env.BUILD_NUMBER}'"
                sh "git push origin main"
            }
        }
    }
}