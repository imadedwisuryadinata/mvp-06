pipeline {
    agent {
        any {
            image 'node:6-alpine' 
            args '-p 3000:3000' 
        }
    }
    tools {nodejs "nodejs"}
    stages {
        stage('Install Module') { 
            steps {
                sh 'npm install' 
            }
        }
         stage('Building') { 
            steps {
                sh 'npm run start.dev' 
            }
        }
        
    }
}