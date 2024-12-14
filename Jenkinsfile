pipeline {
    agent any

    stages {
        echo "Java VERSION"
        sh 'java -version'
        echo "Maven VERSION"
        sh 'mvn -version'
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