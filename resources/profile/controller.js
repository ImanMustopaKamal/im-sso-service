const model = require("./model"),
  response = require("../../utils/restapi"),
  helpers = require("../../utils/helpers");

module.exports = {
  Get: async (req, res) => {
    try {
      let requesterId = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requesterId) {
        return response.unauthorized(res);
      }

      const request = await model.Get(requesterId);
      if (request) {
        return response.ok({ data: request }, res);
      }

      return response.bad(res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  Update: async (req, res) => {
    try {
      let requesterId = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requesterId) {
        return response.unauthorized(res);
      }

      const reqBody = req.body;

      const request = await model.Update(requesterId, reqBody);
      if (request) {
        return response.ok([], res);
      }

      return response.bad(res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
};
