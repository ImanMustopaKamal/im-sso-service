const model = require("./model"),
  response = require("../../utils/restapi"),
  helpers = require('../../utils/helpers')

module.exports = {
  GetAll: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])
      if(!requester_id){
        return response.unauthorized(res)
      }
      
      const query = req.query;

      let get_data = await model.GetAll(query);
      if (Object.keys(get_data).length > 0) {
        return response.ok(get_data, res);
      }

      return response.notFound(res);
    } catch (err) {
      console.log(err);
      return response.error(res);
    }
  }
};
