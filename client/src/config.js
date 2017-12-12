export default {
  MAX_ATTACHMENT_SIZE: 5000000,
  cognito: {
    USER_POOL_ID: 'us-west-2_c5KY5qNW4',
    APP_CLIENT_ID: '1fndnrtsvj3vm9jcaaupqlc8hl',
    IDENTITY_POOL_ID: 'us-west-2:20af9961-7e5d-4cbe-a623-029d92129baf',
    REGION: 'us-west-2',
  },
  apiGateway: {
    URL: 'https://fqfifzpc38.execute-api.us-west-2.amazonaws.com/prod',
    REGION: 'us-west-2',
  },
  s3: {
    BUCKET: 'my-note-app-attachments',
    REGION: 'us-east-1',
  },
}
