const model = require('./model'),
response = require('../../utils/restapi'),
helpers = require('../../utils/helpers')

module.exports = {
  GetAll: async (req, res) => {
    try {
      const tenant_id = req.params.tenant_id
      const query = req.query

      let get_data = await model.GetAll(tenant_id, query)
      if(Object.keys(get_data).length > 0){
        return response.ok(get_data, res)
      }

      return response.notFound(res)
    } catch (err) {
      console.log(err)
      return response.error(res)
    }
  },
  GetById: async (req, res) => {
    try {
      const params_id = req.params.user_id

      let get_data = await model.GetById(params_id)
      if(Object.keys(get_data).length > 0){
        return response.ok(get_data, res)
      }

      return response.notFound(res)
    } catch (err) {
      console.log(err)
      return response.error(res)
    }
  },
  Insert: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])

      const request_body = req.body
      const tenant_id = req.params.tenant_id

      let do_insert = await model.Insert(tenant_id, request_body, requester_id)
      if(Object.keys(do_insert).length > 0){
        if(do_insert.error === "not found"){
          return response.notFound(res, do_insert.message)
        }
        if(do_insert.error == "duplicate"){
          return response.duplicated(res, do_insert.message)
        }
      }
      if(do_insert === true){
        return response.ok(null, res, "Data was created successfully")
      }

      return response.bad(res)
    } catch (err) {
      console.log(err)
      return response.error(res)
    }
  },
  Update: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])

      const request_body = req.body
      const params = {
        id: req.params.user_id,
        tenant_id: req.params.tenant_id
      }

      let do_update = await model.Update(params, request_body, requester_id)
      if(Object.keys(do_update).length > 0){
        if(do_update.error === "not found"){
          return response.notFound(res, do_update.message)
        }
        if(do_update.error === "duplicate"){
          return response.duplicated(res, do_update.message)
        }
      }
      if(do_update === true){
        return response.ok(null, res, "Data was updated successfully")
      }

      return response.bad(res)
    } catch (err) {
      console.log(err)
      return response.error(res)
    }
  },
  Delete: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])

      const params_id = req.params.user_id

      let do_delete = await model.Delete(params_id, requester_id)
      if(do_delete){
        return response.ok(null, res, "Data was deleted successfully")
      }

      return response.bad(res)
    } catch (err) {
      console.log(err)
      return response.error(res)
    }
  },
  RegisterApp: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])

      const request_body = req.body
      const params = {
        id: req.params.user_id,
        tenant_id: req.params.tenant_id
      }

      let do_register = await model.RegisterApp(params, request_body, requester_id)
      if(Object.keys(do_register).length > 0){
        if(do_register.error === "not found"){
          return response.notFound(res, do_register.message)
        }
      }
      if(do_register === true){
        return response.ok(null, res, "Data was updated successfully")
      }

      return response.bad(res)
    } catch (err) {
      console.log(err)
      return response.error(res)
    }
  },
  DeregisterApp: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])

      const request_body = req.body
      const params = {
        id: req.params.user_id,
        tenant_id: req.params.tenant_id
      }

      let do_deregister = await model.DeregisterApp(params, request_body, requester_id)
      if(Object.keys(do_deregister).length > 0){
        if(do_deregister.error === "not found"){
          return response.notFound(res, do_deregister.message)
        }
      }
      if(do_deregister === true){
        return response.ok(null, res, "Data was updated successfully")
      }

      return response.bad(res)
    } catch (err) {
      console.log(err)
      return response.error(res)
    }
  },
  ChangeRole: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])

      const request_body = req.body
      const params = {
        id: req.params.user_id,
        tenant_id: req.params.tenant_id
      }

      let do_changerole = await model.ChangeRole(params, request_body, requester_id)
      if(Object.keys(do_changerole).length > 0){
        if(do_changerole.error === "not found"){
          return response.notFound(res, do_changerole.message)
        }
      }
      if(do_changerole === true){
        return response.ok(null, res, "Data was updated successfully")
      }

      return response.bad(res)
    } catch (err) {
      console.log(err)
      return response.error(res)
    }
  },
  ChangeStatus: async (req, res) => {
    try {
      let requester_id = helpers.GetRequesterUserID(req.headers["authorization"])

      const request_body = req.body
      const params = {
        id: req.params.user_id,
        tenant_id: req.params.tenant_id
      }

      let do_changestatus = await model.ChangeStatus(params, request_body, requester_id)
      if(Object.keys(do_changestatus).length > 0){
        if(do_changestatus.error === "not found"){
          return response.notFound(res, do_changestatus.message)
        }
      }
      if(do_changestatus === true){
        return response.ok(null, res, "Data was updated successfully")
      }

      return response.bad(res)
    } catch (err) {
      console.log(err)
      return response.error(res)
    }
  },
}