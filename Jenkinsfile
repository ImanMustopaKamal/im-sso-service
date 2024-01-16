pipeline {
  agent any
  environment {
    APP_ENV = "dev"
    APP_PORT = "7777"
    APP_URL = "https://appsdev.riskobs.com"
    SLS_POOL_REGION = "ap-southeast-1"
    SLS_ACCESS_KEY = "serverless_secret"
    SLS_SECRET_KEY = "serverless_real_secret"
    SLS_USERPOOL_ID = "ap-southeast-1_lEfVdgIYi"
    SLS_USERPOOL_CLIENT_ID = "59l5h186ndrclvo43eiqf6mc3d"
    S3_BUCKET_NAME = "incident-management-app"
    CLOUDFRONT_URL = "https://d33vl41ubmyst.cloudfront.net/"
    DB_SERVICE_FUNCTION = "RiskObsDBHelper"
    DB_SSO = "ssodev"
    MAIL_SERVICE = "IncidentEmailService"
    TOKEN_KEY = "0xriskobs@manos1092Fjxsiw7jMkl28"
    DOCKER_IMAGE = "riskobs-sso-service:latest"
    DOCKER_IMAGE_REPO = "riskobs-sso-service"
    DOCKER_REGION = "ap-southeast-1"
    DOCKER_BUILD_URL = "549879428689.dkr.ecr.ap-southeast-1.amazonaws.com"
    DOCKER_BUILD_USERNAME = "AWS"
  }
  stages {
    stage('Preparation') {
      steps {
        echo 'Render config file'
        withCredentials([string(credentialsId: "${env.SLS_ACCESS_KEY}", variable: "SERVERLESS_ACCESS_KEY")]){
          withCredentials([string(credentialsId: "${env.SLS_SECRET_KEY}", variable: "SERVERLESS_SECRET_KEY")]){
            sh "j2 configs/config.template.yaml - -o configs/config.yaml"
          }
        }

        echo 'Render Dockerfile'
        sh "j2 Dockerfile - -o Dockerfile"
      }
    }
    stage('Build Docker Image'){
      steps {
				sh "aws ecr get-login-password --region $DOCKER_REGION | docker login --username $DOCKER_BUILD_USERNAME --password-stdin $DOCKER_BUILD_URL"
        sh "aws ecr describe-repositories --region $DOCKER_REGION --repository-names $DOCKER_IMAGE_REPO || aws ecr create-repository --repository-name $DOCKER_IMAGE_REPO --region $DOCKER_REGION"
        sh "docker build -t $DOCKER_IMAGE ."
        sh "docker tag $DOCKER_IMAGE $DOCKER_BUILD_URL/$DOCKER_IMAGE"
        sh "docker push $DOCKER_BUILD_URL/$DOCKER_IMAGE"
      }
    }
  }
  post {
    failure {
      slackSend (color: "#FF0000", message: "Failed: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'\n (Build URL: ${env.BUILD_URL})")
    }
  }
}