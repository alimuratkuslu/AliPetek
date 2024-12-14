pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/alimuratkuslu/AliPetek.git'
            }
        }

        stage('Build') {
            steps {
                sh './mvnw clean package -X'
            }
        }

        stage('Test') {
            steps {
                // Run tests
                sh './mvnw test'
            }
        }

        stage('Deploy') {
            steps {
                sh 'java -jar target/alipetek.jar'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}