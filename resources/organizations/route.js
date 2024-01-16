const controller = require("./controller"),
  schema = require("./schema"),
  validation = require("../../middlewares/validate"),
  path = "/:tenant_id/organizations";

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
    validation.body(schema.organizationRequestBody),
    controller.Insert
  );
  router.get(
    path + "/:organization_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.GetById
  );
  router.patch(
    path + "/:organization_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.body(schema.organizationRequestBody),
    controller.Update
  );
  router.delete(
    path + "/:organization_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.Delete
  );

  return router;
};
