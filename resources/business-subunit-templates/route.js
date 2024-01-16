const controller = require("./controller"),
  schema = require("./schema"),
  validation = require("../../middlewares/validate"),
  path = "/:tenant_id/subunit-templates";

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
    validation.body(schema.subunitTemplateRequestBody),
    controller.Insert
  );
  router.get(
    path + "/:subunit_template_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.GetById
  );
  router.patch(
    path + "/:subunit_template_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.body(schema.subunitTemplateRequestBody),
    controller.Update
  );
  router.delete(
    path + "/:subunit_template_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.Delete
  );

  return router;
};
