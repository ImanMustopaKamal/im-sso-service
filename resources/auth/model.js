const cognito = require("../../services/cognito"),
  globalModel = require("../../utils/globalmodel"),
  helpers = require("../../utils/helpers"),
  env = require("../../utils/environment"),
  db_sso = env.sls.DB_SSO,
  table = db_sso + ".ms_user",
  mail = require("../../services/mail"),
  forgot_mail = require("../../utils/mail_content/forgot_password"),
  jwt = require("jsonwebtoken");

module.exports = {
  Login: async (loginData) => {
    try {
      let get_user = await globalModel.FindBy(table, {
        columns: ["id", "tenant_id", "name", "email", "user_status_id"],
        filter: {
          type: "and",
          fields: [
            { name: "email", value: loginData.username, op: "eq" },
            { name: "status", value: "A", op: "eq" },
          ],
        },
      });

      if (get_user.result.length == 0) {
        return {
          error: true,
          message: "Invalid username or password.",
        };
      }

      if (get_user.result.length > 0) {
        if (get_user.result[0].user_status_id == 3) {
          return {
            error: true,
            message: "User has been suspended.",
          };
        }
      }

      return await cognito.Login(loginData);
    } catch (error) {
      let errorMessage = "An error occurred.";
      switch (error.code) {
        case "NotAuthorizedException":
          errorMessage =
            "Invalid username or password.";
          break;
        case "UserNotFoundException":
          errorMessage = "The user was not found.";
          break;
        case "UserNotConfirmedException":
          errorMessage =
            "The user has not been confirmed. Please confirm the user first.";
          break;
        case "PasswordResetRequiredException":
          errorMessage = "Password reset is required for the user.";
          break;
        case "ResourceNotFoundException":
          errorMessage =
            "The specified client or other resource was not found.";
          break;
        case "InvalidParameterException":
          errorMessage = "Invalid parameters were provided in the request.";
          break;
        case "InternalErrorException":
          errorMessage = "An internal server error occurred.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
          break;
      }
      throw new Error(errorMessage);
    }
  },
  Logout: async (accessToken) => {
    try {
      return await cognito.Logout(accessToken);
    } catch (error) {
      let errorMessage = "An error occurred.";
      switch (err.code) {
        case "NotAuthorizedException":
          errorMessage =
            "The user is not authorized to perform the global sign-out.";
          break;
        case "ResourceNotFoundException":
          errorMessage =
            "The specified client or other resource was not found.";
          break;
        case "UserNotFoundException":
          errorMessage = "The user was not found.";
          break;
        case "InvalidParameterException":
          errorMessage = "Invalid parameters were provided in the request.";
          break;
        case "InternalErrorException":
          errorMessage = "An internal server error occurred.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
          break;
      }
      throw new Error(errorMessage);
    }
  },
  RefreshToken: async (refreshTokenData) => {
    try {
      return await cognito.RefreshToken(refreshTokenData);
    } catch (error) {
      let errorMessage = "An error occurred.";
      switch (error.code) {
        case "NotAuthorizedException":
          errorMessage =
            "The user is not authorized for the requested authentication flow.";
          break;
        case "UserNotFoundException":
          errorMessage = "The user was not found.";
          break;
        case "UserNotConfirmedException":
          errorMessage =
            "The user has not been confirmed. Please confirm the user first.";
          break;
        case "PasswordResetRequiredException":
          errorMessage = "Password reset is required for the user.";
          break;
        case "ResourceNotFoundException":
          errorMessage =
            "The specified client or other resource was not found.";
          break;
        case "InvalidParameterException":
          errorMessage = "Invalid parameters were provided in the request.";
          break;
        case "InternalErrorException":
          errorMessage = "An internal server error occurred.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
          break;
      }
      throw new Error(errorMessage);
    }
  },
  Forgot: async (email) => {
    try {
      let get_user = await globalModel.FindBy(table, {
        columns: ["*"],
        filter: {
          type: "and",
          fields: [
            { name: "email", value: email, op: "eq" },
            { name: "status", value: "A", op: "eq" }
          ]
        }
      })

      if(get_user.result.length === 0){
        return {
          error: "not found",
          message: "User not found",
        };
      }

      let data_user = get_user.result[0]

      // email
      try{
        let mail_body = forgot_mail.MailBody({ email: data_user.email, name: data_user.name })

        if(mail_body){
          mail.sendMail({
            recipient: email,
            subject: "[Riskobs] Reset Riskobs Account Password",
            params: {
              body: mail_body
            }
          })
        }
      }catch(ex){
        console.log(ex)
      }

      return true

    } catch (error) {
      throw error
    }
  },
  Reset: async (body) => {
    try {
      let data_decoded = null
      //verifying 
      jwt.verify(body.token, env.token.KEY, function(err, decoded) {
        if(err){
          console.log(err)
          return {
            error: "not found",
            message: "Sorry, the link is invalid or expired",
          };
        }

        data_decoded = decoded
      })

      if(!data_decoded){
        return {
          error: "not found",
          message: "Sorry, the link is invalid or expired",
        };
      }

      //update password
      let do_reset = await cognito.ChangePassword(data_decoded.email, body.password, true)

      if(do_reset) {
        return true
      }
      
      return false
    } catch (error) {
      throw error
    }
  },
  VerifyReset: async (token) => {
    //verifying 
    jwt.verify(token, env.token.KEY, function(err, decoded) {
      if(err){
        console.log(err)
        return {
          error: "not found",
          message: "Sorry, the link is invalid or expired",
        };
      }

      return true
    })
  },
  Register: async (registerData) => {
    try {
      let doCheckDuplicate = {
        "Email": [
          { name: 'email', value: registerData.email, op: 'eq'},
          { name: 'status', value: 'A', op: 'eq'}
        ]
      }
      let checkDuplicate = await helpers.CheckDuplicate(globalModel, { table: table, data_check: doCheckDuplicate })
      if(checkDuplicate){
        return {
          error: true,
          message: checkDuplicate
        }
      }

      const table_tenant = db_sso + ".ms_tenant";
      const table_role = db_sso + ".ms_user_role";
      let generateTenantId = await GenerateRandomString(table_tenant, "id");
      let generateUserId = await GenerateRandomString(table, "id");
      let generateRoleId = await GenerateRandomString(table_role, "id");
      let userRegisterDb = [
        helpers.BuildInsertData(
          {
            id: generateUserId,
            tenant_id: generateTenantId,
            employee_number: generateUserId,
            name: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            user_status_id: 1,
          },
          generateUserId
        ),
      ];
      let userRegisterTenantDb = [
        helpers.BuildInsertData(
          {
            id: generateTenantId,
            name: registerData.companyName,
          },
          generateUserId
        ),
      ];
      let userRegisterRoleDb = [
        helpers.BuildInsertData(
          {
            id: generateRoleId,
            app_role_id: "ROLE0020",
            user_id: generateUserId,
          },
          generateUserId
        ),
      ];
      let doUserRegister = await globalModel.Insert(table, userRegisterDb);
      let doUserRegisterTenant = await globalModel.Insert(table_tenant, userRegisterTenantDb);
      let doUserRegisterRole = await globalModel.Insert(table_role, userRegisterRoleDb);
      if (doUserRegister.status == 201 && doUserRegisterTenant.status == 201 && doUserRegisterRole.status == 201) {
        const registerCognitoData = {
          tenantId: generateTenantId,
          userId: generateUserId,
          name: registerData.name,
          email: registerData.email,
          phoneNumber: registerData.phone,
          username: generateUserId,
          password: registerData.password,
        };
        await cognito.SignUp(registerCognitoData);

        return true;
      }
      throw new Error("Internal server error");
    } catch (error) {
      console.log(error);
      if (error.code == "ForbiddenException") {
        throw new Error("Forbidden");
      } else if (error.code == "NotAuthorizedException") {
        throw new Error("Not authorized");
      } else {
        throw new Error("Internal server error");
      }
    }
  },
  VerifyRequest: async (username) => {
    try {
      return await cognito.ResendConfirmationCode(username);
    } catch (error) {
      console.log(error);
      let errorMessage = "An error occurred.";
      switch (error.code) {
        case "LimitExceededException":
          errorMessage =
            "You have exceeded the rate limit for sending confirmation codes.";
          break;
        case "NotAuthorizedException":
          errorMessage =
            "The user is not authorized to resend the confirmation code.";
          break;
        case "ResourceNotFoundException":
          errorMessage = "The specified user was not found.";
          break;
        case "UserNotFoundException":
          errorMessage = "The user was not found.";
          break;
        case "InvalidParameterException":
          errorMessage = "Invalid parameters were provided in the request.";
          break;
        case "CodeDeliveryFailureException":
          errorMessage = "Failed to deliver the confirmation code to the user.";
          break;
        case "TooManyRequestsException":
          errorMessage = "Too many requests have been made in a short period.";
          break;
        case "InternalErrorException":
          errorMessage = "An internal server error occurred.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
          break;
      }
      throw new Error(errorMessage);
    }
  },
  Verify: async ({ username, confirmationCode }) => {
    try {
      let get_user = await globalModel.FindBy(table, {
        columns: ["id", "name", "email", "user_status_id"],
        filter: {
          type: "and",
          fields: [
            { name: "id", value: username, op: "eq" },
            { name: "status", value: "A", op: "eq" },
          ],
        },
      });
      if (get_user.result.length === 0) {
        return {
          error: true,
          message: "User not found",
        };
      }
      if (get_user.result[0].user_status_id == 2) {
        return {
          error: true,
          message: "User has been verified",
        };
      }
      if (get_user.result[0].user_status_id == 3) {
        return {
          error: true,
          message: "User has been suspended",
        };
      }
      await cognito.ConfirmSignUp({
        username: username,
        confirmationCode: confirmationCode,
      });

      await globalModel.Update(table, {user_status_id: 2}, {
        type: "and",
        fields: [{ name: table + ".id", value: username, op: "eq" }],
      });

      return true
    } catch (error) {
      let errorMessage = "An error occurred.";
      switch (error.code) {
        case "CodeMismatchException":
          errorMessage = "The verification code provided does not match.";
          break;
        case "ExpiredCodeException":
          errorMessage =
            "The verification code has expired. Please request a new one.";
          break;
        case "NotAuthorizedException":
          errorMessage = "The user is not authorized to confirm the signup.";
          break;
        case "ResourceNotFoundException":
          errorMessage = "The specified user was not found.";
          break;
        case "UserNotFoundException":
          errorMessage = "The user was not found.";
          break;
        case "InvalidParameterException":
          errorMessage = "Invalid parameters were provided in the request.";
          break;
        case "InternalErrorException":
          errorMessage = "An internal server error occurred.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
          break;
      }
      throw new Error(errorMessage);
    }
  },
  GetAppInfo: async (id) => {
    try {
      const columns = ["id", "cognito_app_client_id", "name"],
        getData = await globalModel.FindById("ssodev.ms_app", {
          id,
          columns,
        });

      if (getData.result.length > 0) {
        return getData.result[0];
      }

      return [];
    } catch (err) {
      throw err;
    }
  },
};

async function GenerateRandomString(table, field, length = 8) {
  var id_generate = helpers.GenerateId(length);
  let columns = [field];

  let filter = {
    fields: [{ name: field, value: id_generate, op: "eq" }],
  };

  while (true) {
    let get_data = await globalModel.FindBy(table, {
      filter: filter,
      columns: columns,
      limit: 1,
    });
    if (get_data.result.length > 0) {
      id_generate = helpers.GenerateId(length);
    } else {
      break;
    }
  }

  return id_generate;
}
