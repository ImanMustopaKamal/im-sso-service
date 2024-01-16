const controller = require("./controller"),
  schema = require("./schema"),
  validation = require("../../middlewares/validate"),
  path = "/:tenant_id/business-units";

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
    validation.body(schema.businessUnitRequestBody),
    controller.Insert
  );
  router.get(
    path + "/:business_unit_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.GetById
  );
  router.patch(
    path + "/:business_unit_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.body(schema.businessUnitRequestBody),
    controller.Update
  );
  router.delete(
    path + "/:business_unit_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.Delete
  );

  return router;
};
