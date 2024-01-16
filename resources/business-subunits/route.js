const controller = require("./controller"),
  schema = require("./schema"),
  validation = require("../../middlewares/validate"),
  path = "/:tenant_id/subunits";

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
    validation.body(schema.subunitRequestBody),
    controller.Insert
  );
  router.get(
    path + "/:subunit_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.GetById
  );
  router.patch(
    path + "/:subunit_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.body(schema.subunitRequestBody),
    controller.Update
  );
  router.delete(
    path + "/:subunit_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.Delete
  );

  return router;
};
