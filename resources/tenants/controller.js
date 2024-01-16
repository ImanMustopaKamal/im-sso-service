const model = require("./model"),
  response = require("../../utils/restapi"),
  helpers = require("../../utils/helpers");

module.exports = {
  GetById: async (req, res) => {
    try {
      let requesterId = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requesterId) {
        return response.unauthorized(res);
      }
      let requesterTenantId = req.params.tenant_id;
      const request = await model.GetById(requesterTenantId);
      if (request) {
        return response.ok(request, res);
      }

      return response.bad(res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  Create: async (req, res) => {
    try {
      let requesterId = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requesterId) {
        return response.unauthorized(res);
      }

      const reqBody = req.body;
      const dataUpdate = {
        id: reqBody.tenant_id,
        name: reqBody.name,
      };
      let dataFile = req.file;
      if (dataFile) {
        dataFile.coordinates = {
          left: Number(reqBody.left),
          top: Number(reqBody.top),
          width: Number(reqBody.width),
          height: Number(reqBody.height),
        };
      }

      const request = await model.Create(requesterId, dataUpdate, dataFile);
      if (request) {
        return response.ok([], res);
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

      let requesterTenantId = req.params.tenant_id;

      const reqBody = req.body;
      const dataUpdate = {
        name: reqBody.name,
      };
      let dataFile = req.file;
      if (dataFile) {
        dataFile.coordinates = {
          left: Number(reqBody.left),
          top: Number(reqBody.top),
          width: Number(reqBody.width),
          height: Number(reqBody.height),
        };
      }

      const request = await model.Update(
        requesterId,
        requesterTenantId,
        dataUpdate,
        dataFile
      );
      if (request) {
        return response.ok([], res);
      }

      return response.bad(res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  GetAvailableApps: async (req, res) => {
    try {
      let requesterId = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requesterId) {
        return response.unauthorized(res);
      }
      const query = req.query
      const getList = await model.GetAvailableApps(requesterId, query);
      return response.ok(getList, res);
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  RegisterApp: async (req, res) => {
    try {
      let requesterId = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requesterId) {
        return response.unauthorized(res);
      }
      let requesterTenantId = req.params.tenant_id;
      const reqBody = req.body,
        appId = reqBody.app_id,
        request = await model.RegisterApp(
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
  }
};
