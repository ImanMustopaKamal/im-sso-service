const model = require("./model"),
  response = require("../../utils/restapi"),
  helpers = require("../../utils/helpers");

module.exports = {
  AppList: async (req, res) => {
    try {
      let requesterId = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requesterId) {
        return response.unauthorized(res);
      }

      const getList = await model.AppList(requesterId);
      return response.ok({ data: getList }, res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  AppRegister: async (req, res) => {
    try {
      let requesterId = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requesterId) {
        return response.unauthorized(res);
      }
      let requesterTenantId = helpers.GetRequesterTenantID(
        req.headers["authorization"]
      );
      const reqBody = req.body,
        appId = reqBody.app_id,
        request = await model.AppRegister(
          requesterId,
          requesterTenantId,
          appId
        );
      if (request) {
        if (request.error == true) {
          return response.bad(res, request.message);
        }
        return response.ok([], res);
      }
      return response.bad(res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
};
