import { CognitoUserPool } from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk';
import config from '../config';
import sigV4Client from './sigV4Client';

export async function authUser() {
  if (AWS.config.credentials && Date.now() < AWS.config.credentials.expireTime - 60000) {
    return true;
  }

  const currentUser = getCurrentUser();

  if (currentUser === null) {
    return false;
  }

  const userToken = await getUserToken(currentUser);
  await getAwsCredentials(userToken);

  return true;
}

export function signOutUser() {
  const currentUser = getCurrentUser();

  if (currentUser !== null) {
    currentUser.signOut();
  }

  if (AWS.config.credentials) {
    AWS.config.credentials.clearCachedId();
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({});
  }
}

export async function s3Upload(file) {
  if (!await authUser()) {
    throw new Error('User is not logged in');
  }

  const s3 = new AWS.S3({
    region: config.s3.REGION,
    params: {
      Bucket: config.s3.BUCKET
    }
  });
  const filename = `${AWS.config.credentials.identityId}-${Date.now()}-${file.name}`;

  return s3
    .upload({
      Key: filename,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read'
    })
    .promise();
}

export async function invokeApig({
  path,
  method = 'GET',
  headers = {},
  queryParams = {},
  body
}) {
  if (!await authUser()) {
    throw new Error('User is not logged in');
  }

  const {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    sessionToken
  } = AWS.config.credentials;
  const { REGION: region, URL: endpoint } = config.apiGateway;

  const signedRequest = sigV4Client
    .newClient({
      accessKey,
      secretKey,
      sessionToken,
      region,
      endpoint
    })
    .signRequest({
      method,
      path,
      headers,
      queryParams,
      body
    });

  body = body ? JSON.stringify(body) : body;
  headers = signedRequest.headers;

  const results = await fetch(signedRequest.url, {
    method,
    headers,
    body,
  });

  if (results.status !== 200) {
    throw new Error(await results.text());
  }

  return results.json();
}

function getAwsCredentials(userToken) {
  const authenticator = `cognito-idp.${config.cognito.REGION}.amazonaws.com/${config.cognito.USER_POOL_ID}`;

  AWS.config.update({ region: config.cognito.REGION });

  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: config.cognito.IDENTITY_POOL_ID,
    Logins: {
      [authenticator]: userToken
    }
  });

  return AWS.config.credentials.getPromise();
}

function getUserToken(currentUser) {
  return new Promise((resolve, reject) => {
    currentUser.getSession((err, session) => {
      if (err) {
        return reject(err);
      }
      resolve(session.getIdToken().getJwtToken());
    });
  });
}

function getCurrentUser() {
  const userPool = new CognitoUserPool({
    UserPoolId: config.cognito.USER_POOL_ID,
    ClientId: config.cognito.APP_CLIENT_ID,
  });
  return userPool.getCurrentUser();
}
