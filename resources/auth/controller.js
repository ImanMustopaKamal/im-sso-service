const model = require("./model"),
  dashboard_model = require("../dashboard/model"),
  response = require("../../utils/restapi"),
  helpers = require("../../utils/helpers");

module.exports = {
  Login: async (req, res) => {
    try {
      const reqHeaders = req.headers,
        appClientId = reqHeaders["app-client-id"] ?? null;

      if (appClientId) {
        const appInfo = await model.GetAppInfo(appClientId);
        if (appInfo) {
          const reqBody = req.body,
            loginData = {
              username: reqBody.username,
              password: reqBody.password,
            },
            result = await model.Login(loginData)

          if (result) {
            if (result.error == true) {
              return response.bad(res, result.message);
            }
            const idTokenParse = helpers.ParseJwt(result.IdToken)
            if (idTokenParse["custom:tenant_id"] || (idTokenParse["cognito:groups"] && idTokenParse["cognito:groups"].includes("AccountOwner"))) {
              const responseData = {
                id_token: result.IdToken,
                access_token: result.AccessToken,
                refresh_token: result.RefreshToken,
                expires_in: result.ExpiresIn,
                user_id: idTokenParse["custom:user_id"],
                tenant_id: idTokenParse["custom:tenant_id"],
                username: idTokenParse["cognito:username"],
                name: idTokenParse["name"],
                groups: idTokenParse["cognito:groups"],
                auth_time: idTokenParse["auth_time"],
                app_user: await dashboard_model.AppList(
                  idTokenParse["custom:user_id"]
                ),
              };
              return response.ok(responseData, res);
            }
            else {
              return response.bad(res, "Invalid username or password.");
            }
          }
          return response.error(res, {});
        }
        return response.bad(res);
      }

      return response.bad(res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  Logout: async (req, res) => {
    try {
      const reqHeaders = req.headers;
      (appClientId = reqHeaders["app-client-id"] ?? null),
        (accessToken = reqHeaders.authorization);

      if (appClientId) {
        const appInfo = await model.GetAppInfo(appClientId);
        if (appInfo && accessToken) {
          const result = await model.Logout(accessToken);

          return response.ok(result, res);
        }

        return response.bad(res);
      }
      return response.bad(res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  RefreshToken: async (req, res) => {
    try {
      const reqHeaders = req.headers,
        appClientId = reqHeaders["app-client-id"] ?? null;

      if (appClientId) {
        const appInfo = await model.GetAppInfo(appClientId);
        if (appInfo) {
          const refreshTokenData = {
              clientId: appInfo.cognito_app_client_id,
              refreshToken: reqHeaders.token,
            },
            result = await model.RefreshToken(refreshTokenData),
            idTokenParse = helpers.ParseJwt(result.IdToken),
            responseData = {
              id_token: result.IdToken,
              access_token: result.AccessToken,
              refresh_token: result.RefreshToken,
              expires_in: result.ExpiresIn,
              user_id: idTokenParse["custom:user_id"],
              username: idTokenParse["cognito:username"],
              name: idTokenParse["name"],
              groups: idTokenParse["cognito:groups"],
              auth_time: idTokenParse["auth_time"],
            };
          return response.ok(responseData, res);
        }

        return response.bad(res);
      }

      return response.bad(res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  CheckToken: async (req, res) => {
    try {
      const reqHeaders = req.headers,
      appClientId = reqHeaders['app-client-id'] ?? null

      if (appClientId) {
        const appInfo = await model.GetAppInfo(appClientId)
        if (appInfo) {
          const idTokenParse = helpers.ParseJwt(reqHeaders.authorization),
          tokenExp = idTokenParse.exp,
          currentTimestamp = Math.floor(Date.now() / 1000);

          if (tokenExp && tokenExp > currentTimestamp) {
            responseData = {
              expired_in: new Date(tokenExp * 1000),
            }
            return response.ok(responseData, res)
          }

          return response.unauthorized(res)
        }

        return response.bad(res)
      }

      return response.bad(res)
    } catch (err) {
      console.log(err);
      return response.error(res, err.message)
    }
  },
  Forgot: async (req, res) => {
    try {
      let email = req.body.email

      let do_forgot = await model.Forgot(email)
      if(Object.keys(do_forgot).length > 0){
        if(do_forgot.error === "not found"){
          return response.notFound(res, do_forgot.message)
        }
      }
      if(do_forgot == true){
        return response.ok(null, res)
      }

      return response.bad(res)
    } catch (err) {
      return response.error(res)
    }
  },
  Reset: async (req, res) => {
    try {
      let body = req.body

      let do_reset = await model.Reset(body)
      if(Object.keys(do_reset).length > 0){
        if(do_reset.error === "not found"){
          return response.notFound(res, do_reset.message)
        }
      }

      if(do_reset == true){
        return response.ok(null, res)
      }

      return response.bad(res)
    } catch (err) {
      return response.error(res)
    }
  },
  VerifyToken: async (req, res) => {
    try {
      let token = req.params.token

      let do_verify = await model.VerifyReset(token)
      
      if(Object.keys(do_verify).length > 0){
        if(do_verify.error === "not found"){
          return response.notFound(res, do_verify.message)
        }
      }

      if(do_verify == true){
        return response.ok(null, res)
      }

      return response.bad(res)
    } catch (err) {
      console.log(err)
      return response.error(res)
    }
  },
  Register: async (req, res) => {
    try {
      const reqHeaders = req.headers,
        appClientId = reqHeaders["app-client-id"] ?? null;

      if (appClientId) {
        const appInfo = await model.GetAppInfo(appClientId);
        if (appInfo) {
          const reqBody = req.body,
            registerData = {
              companyName: reqBody.company_name,
              name: reqBody.name,
              email: reqBody.email,
              phone: reqBody.phone,
              password: reqBody.password,
            };
          
          let doRegister = await model.Register(registerData);
          if (Object.keys(doRegister).length > 0) {
            if (doRegister.error == true) {
              return response.error(res, doRegister.message);
            }
          }
          return response.ok({}, res);
        }
        return response.bad(res);
      }
      return response.bad(res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  VerifyRequest: async (req, res) => {
    try {
      const reqHeaders = req.headers,
        appClientId = reqHeaders["app-client-id"] ?? null;

      if (appClientId) {
        const appInfo = await model.GetAppInfo(appClientId);
        if (appInfo) {
          let username = req.body.username;

          let doVerifyRequest = await model.VerifyRequest(username);
          if (Object.keys(doVerifyRequest).length > 0) {
            if (doVerifyRequest.error == true) {
              return response.error(res, doVerifyRequest.message);
            }
          }
          
          return response.ok(doVerifyRequest, res);
        }

        return response.bad(res);
      }

      return response.bad(res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  Verify: async (req, res) => {
    try {
      let reqBody = req.body;
      let verifyData = {
        username: reqBody.username,
        confirmationCode: reqBody.confirmation_code
      }
      let doVerify = await model.Verify(verifyData);
      if (doVerify) {
        if (Object.keys(doVerify).length > 0) {
          if (doVerify.error == true) {
            return response.bad(res, doVerify.message);
          }
        }
        return response.ok(null, res, "Email verifified successfully");
      }
      return response.unauthorized(
        res,
        "Email verification failed, possibly the link is invalid or expired"
      );
    } catch (err) {
      return response.error(res, err.message);
    }
  },
};
