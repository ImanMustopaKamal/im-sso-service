const model = require("./model"),
  response = require("../../utils/restapi"),
  helpers = require('../../utils/helpers')

module.exports = {
  GetAll: async (req, res) => {
    try {
      const tenant_id = req.params.tenant_id
      const query = req.query;

      let get_data = await model.GetAll(tenant_id, query);
      if (Object.keys(get_data).length > 0) {
        return response.ok(get_data, res);
      }

      return response.notFound(res);
    } catch (err) {
      console.log(err);
      return response.error(res);
    }
  },
  GetById: async (req, res) => {
    try {
      const params_id = req.params.subunit_template_id;

      let get_data = await model.GetById(params_id);
      if (Object.keys(get_data).length > 0) {
        return response.ok(get_data, res);
      }

      return response.notFound(res);
    } catch (err) {
      console.log(err);
      return response.error(res);
    }
  },
  Insert: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])
      if(!requester_id){
        return response.unauthorized(res)
      }

      const request_body = req.body;
      const tenant_id = req.params.tenant_id

      let do_insert = await model.Insert(tenant_id, request_body, requester_id);
      if (do_insert === "duplicate") {
        return response.duplicated(res);
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
  Update: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])
      if(!requester_id){
        return response.unauthorized(res)
      }
      
      const params = {
        id: req.params.subunit_template_id,
        tenant_id: req.params.tenant_id
      }
      const request_body = req.body;

      let do_update = await model.Update(params, request_body, requester_id);
      if (do_update === "duplicate") {
        return response.duplicated(res);
      }
      if (do_update) {
        return response.ok(null, res, "Data was updated successfully");
      }

      return response.bad(res);
    } catch (err) {
      console.log(err);
      return response.error(res);
    }
  },
  Delete: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])
      if(!requester_id){
        return response.unauthorized(res)
      }
      
      const params_id = req.params.subunit_template_id;

      let do_delete = await model.Delete(params_id, requester_id);
      if (do_delete) {
        return response.ok(null, res, "Data was deleted successfully");
      }

      return response.bad(res);
    } catch (err) {
      console.log(err);
      return response.error(res);
    }
  },
};
