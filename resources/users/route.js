const controller = require("./controller"),
  schema = require("./schema"),
  validation = require("../../middlewares/validate"),
  path = "/:tenant_id/users";

module.exports = (router) => {
  router.get(
    path,
    validation.userTenantAuthorizer,
    validation.param(schema.paramTenantId),
    validation.query(schema.query),
    controller.GetAll
  );
  router.post(
    path,
    validation.userTenantAuthorizer,
    validation.param(schema.paramTenantId),
    validation.body(schema.userRequestBody),
    controller.Insert
  );
  router.get(
    path + "/:user_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.GetById
  );
  router.patch(
    path + "/:user_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.body(schema.userRequestBody),
    controller.Update
  );
  router.delete(
    path + "/:user_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.Delete
  );
  router.post(
    path + "/:user_id/registerApp",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.body(schema.registerAppRequestBody),
    controller.RegisterApp
  );
  router.post(
    path + "/:user_id/deregisterApp",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.body(schema.registerAppRequestBody),
    controller.DeregisterApp
  );
  router.post(
    path + "/:user_id/changeRole",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.body(schema.userRoleRequestBody),
    controller.ChangeRole
  );
  router.post(
    path + "/:user_id/changeStatus",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.body(schema.userStatusRequestBody),
    controller.ChangeStatus
  );

  return router;
};