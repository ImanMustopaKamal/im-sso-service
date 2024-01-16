const model = require("./model"),
  response = require("../../utils/restapi"),
  helpers = require("../../utils/helpers");

module.exports = {
  UserRegister: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requester_id) {
        return response.unauthorized(res);
      }

      const request_body = req.body;

      let do_insert = await model.UserRegister(request_body, requester_id);
      if (Object.keys(do_insert).length > 0) {
        if (do_insert.error === "not found") {
          return response.notFound(res, do_insert.message);
        }
        if (do_insert.error == "duplicate") {
          return response.duplicated(res, do_insert.message);
        }
      }
      if (do_insert === true) {
        return response.ok(null, res, "Data was created successfully");
      }

      return response.bad(res);
    } catch (err) {
      console.log(err);
      return response.error(res);
    }
  },
};
