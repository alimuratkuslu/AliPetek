pipeline {
    agent any
    tools {
        jdk 'openjdk:17'
        maven '4.0.0'
       
    }
    stages {
        stage("build project") {
            steps {
               // git 'https://github.com/alimuratkuslu/AliPetek'
                echo "Java VERSION"
                sh 'java -version'
                echo "Maven VERSION"
                sh 'mvn -version'
                echo 'building project...'
                sh "mvn compile"
                sh "mvn package"
                //sh "mvn test"
                sh "mvn clean install"
            }
        }
    }
}