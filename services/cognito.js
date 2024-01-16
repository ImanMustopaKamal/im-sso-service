const AWS = require("aws-sdk");
const env = require("../utils/environment");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: env.sls.POOL_REGION,
  accessKeyId: env.sls.SLS_ACCESS_KEY,
  secretAccessKey: env.sls.SLS_SECRET_KEY,
});

async function SignUp({
  tenantId,
  userId,
  name,
  email,
  phoneNumber,
  username,
  password,
}) {
  const params = {
    ClientId: env.sls.SLS_USERPOOL_CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [
      {
        Name: "name",
        Value: name,
      },
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "phone_number",
        Value: phoneNumber,
      },
      {
        Name: "custom:user_id",
        Value: userId,
      },
      {
        Name: "custom:tenant_id",
        Value: tenantId,
      },
    ],
  };
  // const params = {
  //   Username: username,
  //   DesiredDeliveryMediums: ["EMAIL"],
  //   MessageAction: "SUPPRESS",
  //   TemporaryPassword: password,
  //   UserPoolId: env.sls.SLS_USERPOOL_ID,
  //   UserAttributes: [
  //     {
  //       Name: "name",
  //       Value: name,
  //     },
  //     {
  //       Name: "email",
  //       Value: email,
  //     },
  //     {
  //       Name: "phone_number",
  //       Value: phoneNumber,
  //     },
  //     {
  //       Name: "custom:user_id",
  //       Value: userId,
  //     },
  //     {
  //       Name: "custom:tenant_id",
  //       Value: tenantId,
  //     },
  //   ],
  // };
  // const paramsSetUserPwd = {
  //   UserPoolId: env.sls.SLS_USERPOOL_ID,
  //   Username: username,
  //   Password: password,
  //   Permanent: true,
  // };
  const paramsAddUserToGroup = {
    GroupName: "AccountOwner",
    Username: username,
    UserPoolId: env.sls.SLS_USERPOOL_ID,
  };

  try {
    const result = await cognito.signUp(params).promise();
    cognito.adminAddUserToGroup(paramsAddUserToGroup).promise();
    // await cognito.adminSetUserPassword(paramsSetUserPwd).promise();
    return result;
  } catch (error) {
    throw error;
  }
}

async function ConfirmSignUp({ username, confirmationCode }) {
  const params = {
    ClientId: env.sls.SLS_USERPOOL_CLIENT_ID,
    Username: username,
    ConfirmationCode: confirmationCode,
  };

  try {
    const result = await cognito.confirmSignUp(params).promise();
    return result;
  } catch (error) {
    throw error;
  }
}

async function ResendConfirmationCode(username) {
  const params = {
    ClientId: env.sls.SLS_USERPOOL_CLIENT_ID,
    Username: username,
  };

  try {
    const result = await cognito.resendConfirmationCode(params).promise();
    return result;
  } catch (error) {
    throw error;
  }
}

async function Login({ username, password }) {
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: env.sls.SLS_USERPOOL_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const result = await cognito.initiateAuth(params).promise();
    return result.AuthenticationResult;
  } catch (error) {
    throw error;
  }
}

async function Logout(accessToken) {
  const params = {
    AccessToken: accessToken,
  };

  try {
    await cognito.globalSignOut(params).promise();
  } catch (error) {
    throw error;
  }
}

async function RefreshToken({ clientId, refreshToken }) {
  const params = {
    ClientId: clientId,
    AuthFlow: "REFRESH_TOKEN_AUTH",
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  };

  try {
    const result = await cognito.initiateAuth(params).promise();
    return result.AuthenticationResult;
  } catch (error) {
    throw error;
  }
}

async function UpdateAttribute({ username, userAttributes }) {
  const params = {
    UserPoolId: env.sls.SLS_USERPOOL_ID,
    Username: username,
    UserAttributes: userAttributes,
  };

  try {
    const result = await cognito.adminUpdateUserAttributes(params).promise();
    return result;
  } catch (error) {
    throw error;
  }
}

async function ChangePassword(username, password, permanent = false) {
  return await new Promise((resolve, reject) => {
    var params = {
      Username: username,
      Password: password,
      Permanent: permanent,
      UserPoolId: env.sls.SLS_USERPOOL_ID,
    };

    cognito.adminSetUserPassword(params, (err, results) => {
      if (err) {
        reject(err);
      }

      resolve(results);
    });
  });
}

async function AdminGetUser(username) {
  return await new Promise((resolve, reject) => {
    var params = {
      Username: username,
      UserPoolId: env.sls.SLS_USERPOOL_ID,
    };

    cognito.adminGetUser(params, (err, results) => {
      if (err) {
        if (err.code == "UserNotFoundException") {
          resolve(false)
        }
        reject(err);
      }

      resolve(results);
    });
  });
}

async function AdminCreateUser(body) {
  return await new Promise((resolve, reject) => {
    var params = {
      Username: body.username,
      DesiredDeliveryMediums: ["EMAIL"],
      TemporaryPassword: body.password,
      UserAttributes: body.user_attributes,
      UserPoolId: env.sls.SLS_USERPOOL_ID,
    };

    cognito.adminCreateUser(params, (err, results) => {
      if (err) {
        reject(err);
      }

      resolve(results);
    });
  });
}

async function AdminUpdateUser(body) {
  return await new Promise((resolve, reject) => {
    var list_attribute = [];
    var user_attributes = body.user_attributes;
    for (var i = 0; i < user_attributes.length; i++) {
      if (
        user_attributes[i].hasOwnProperty("name") &&
        user_attributes[i].hasOwnProperty("value")
      ) {
        list_attribute.push(
          new AmazonCognitoIdentity.CognitoUserAttribute({
            Name: user_attributes[i].name,
            Value: user_attributes[i].value,
          })
        );
      }
    }

    var params = {
      Username: body.username,
      UserAttributes: list_attribute,
      UserPoolId: env.sls.SLS_USERPOOL_ID,
    };

    cognito.adminUpdateUserAttributes(params, (err, results) => {
      if (err) {
        reject(err);
      }

      resolve(results);
    });
  });
}

async function AdminDeleteUser(username) {
  return await new Promise((resolve, reject) => {
    var params = {
      Username: username,
      UserPoolId: env.sls.SLS_USERPOOL_ID,
    };

    cognito.adminDeleteUser(params, (err, results) => {
      if (err) {
        reject(err);
      }

      resolve(results);
    });
  });
}

async function AdminAddUserToGroup(username, group_name) {
  return await new Promise((resolve, reject) => {
    var params = {
      GroupName: group_name,
      Username: username,
      UserPoolId: env.sls.SLS_USERPOOL_ID,
    };

    cognito.adminAddUserToGroup(params, (err, results) => {
      if (err) {
        reject(err);
      }

      resolve(results);
    });
  });
}

async function AdminRemoveUserFromGroup(username, group_name) {
  return await new Promise((resolve, reject) => {
    var params = {
      GroupName: group_name,
      Username: username,
      UserPoolId: env.sls.SLS_USERPOOL_ID,
    };

    cognito.adminRemoveUserFromGroup(params, (err, results) => {
      if (err) {
        reject(err);
      }

      resolve(results);
    });
  });
}

async function AdminUserGlobalSignOut(username) {
  return await new Promise((resolve, reject) => {
    var params = {
      Username: username,
      UserPoolId: env.sls.SLS_USERPOOL_ID,
    };

    cognito.adminUserGlobalSignOut(params, (err, results) => {
      if (err) {
        reject(err);
      }

      resolve(results);
    });
  });
}

module.exports = {
  SignUp,
  ConfirmSignUp,
  ResendConfirmationCode,
  Login,
  Logout,
  RefreshToken,
  UpdateAttribute,
  ChangePassword,
  AdminCreateUser,
  AdminGetUser,
  AdminUpdateUser,
  AdminDeleteUser,
  AdminAddUserToGroup,
  AdminRemoveUserFromGroup,
  AdminUserGlobalSignOut,
};
