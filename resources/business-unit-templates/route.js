const controller = require("./controller"),
  schema = require("./schema"),
  validation = require("../../middlewares/validate"),
  path = "/:tenant_id/business-unit-templates";

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
    validation.body(schema.businessUnitTemplateRequestBody),
    controller.Insert
  );
  router.get(
    path + "/:business_unit_template_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.GetById
  );
  router.patch(
    path + "/:business_unit_template_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.body(schema.businessUnitTemplateRequestBody),
    controller.Update
  );
  router.delete(
    path + "/:business_unit_template_id",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    controller.Delete
  );

  return router;
};
