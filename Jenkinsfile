pipeline {
    agent any
        tools {
            maven 'maven'
        }
        environment {
            JAVA_HOME = '/opt/java/openjdk/bin/java'
            PATH = "${JAVA_HOME}/bin:${env.PATH}"
        }

    stages {
        stage('Checkout') {
            steps {
                script {
                    checkout scm
                }
            }
        }

        stage('Check Versions') {
            steps {
                echo 'Checking Java version...'
                sh 'java -version'
                echo 'Checking Maven version...'
                sh 'mvn -version'
            }
        }

        stage('Build and Test') {
            steps {
                script {
                    sh 'mvn clean package'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t alimuratkuslu/alipetek:latest .'
                }
            }
        }
    }
}