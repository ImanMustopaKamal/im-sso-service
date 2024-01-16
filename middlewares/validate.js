const response = require("../utils/restapi");
(globalModel = require("../utils/globalmodel")),
(env = require("../utils/environment")),
(helpers = require("../utils/helpers")),
  (dbSso = env.sls.DB_SSO),
  (table = dbSso + ".ms_user"),
  (module.exports = {
    privateConnect: (req, res, next) => {
      // var ip = req.connection.remoteAddress;
      // console.log("ip", ip);
      // if(ip !== process.env.IP_WHITELIST){
      //     return response.unauthorized({}, res);
      // }
      return next();
    },
    userTenantAuthorizer: async (req, res, next) => {
      // validate header key
      let requesterUserId = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requesterUserId) {
        return response.unauthorized(res);
      }
      let requesterTenantId = helpers.GetRequesterTenantID(
        req.headers["authorization"]
      );
      if (!requesterTenantId) {
        return response.unauthorized(res);
      }

      // validate user groups
      let requesterGroups = helpers.GetRequesterGroups(
        req.headers["authorization"]
      );
      if (
        requesterGroups.length == 0 ||
        requesterGroups.includes("AccountOwner") ||
        requesterGroups.includes("AccountMember")
      ) {
      } else {
        return response.unauthorized(res);
      }

      // validate user tenant if tenant_id exist
      const paramsTenantId = req.params['tenant_id']
      if (paramsTenantId && paramsTenantId != requesterTenantId) {
        return response.unauthorized(res);
      }

      // validate whether the user exists or not and check the tenant in the database
      let getUser = await globalModel.FindBy(table, {
        columns: ["id", "tenant_id", "email"],
        filter: {
          type: "and",
          fields: [
            { name: "id", value: requesterUserId, op: "eq" },
            { name: "status", value: "A", op: "eq" },
          ],
        },
      });
      if (getUser.result.length == 0) {
        return response.unauthorized(res);
      }
      if (getUser.result.length > 0) {
        if (
          getUser.result[0].tenant_id == requesterTenantId &&
          getUser.result[0].id == requesterUserId
        ) {
        } else {
          return response.unauthorized(res);
        }
      }

      return next();
    },
    userAuthorizer: async (req, res, next) => {
      // validate header key
      let requesterUserId = helpers.GetRequesterUserID(
        req.headers["authorization"]
      );
      if (!requesterUserId) {
        return response.unauthorized(res);
      }

      // validate user groups
      let requesterGroups = helpers.GetRequesterGroups(
        req.headers["authorization"]
      );
      if (
        requesterGroups.length == 0 ||
        requesterGroups.includes("AccountOwner") ||
        requesterGroups.includes("AccountMember")
      ) {
      } else {
        return response.unauthorized(res);
      }

      return next();
    },
    body: (schema) => {
      return (req, res, next) => {
        const { value, error } = schema.validate(req.body);
        const valid = error == null;

        if (valid) {
          return next();
        }
        const { details } = error;
        console.error(details);
        // console.log(req.body);
        return response.bad(res);
      };
    },
    query: (schemaParam) => {
      return (req, res, next) => {
        var { value, error } = schemaParam.validate(req.query);
        const valid = error == null;
        if (valid) {
          if (req.query.sort_by) {
            if (req.query.sort_by.indexOf(".") > -1) {
              let [prop, sort] = req.query.sort_by.split(".");
              if (sort == "asc" || sort == "desc") {
                return next();
              }
            }
            return response.bad(res);
          }
          return next();
        }
        const { details } = error;
        console.error(details);
        return response.bad(res);
      };
    },
    param: (schemaParam) => {
      return (req, res, next) => {
        const { value, error } = schemaParam.validate(req.params);
        const valid = error == null;

        if (valid) {
          return next();
        }
        const { details } = error;
        console.error(details);
        return response.bad(res);
      };
    },
  });
