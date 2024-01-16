const controller = require("./controller"),
  schema = require("./schema"),
  validation = require("../../middlewares/validate");

module.exports = (router) => {
  router.get(
    "/:app_id/roles",
    validation.userTenantAuthorizer,
    validation.param(schema.paramId),
    validation.query(schema.query),
    controller.GetRoles
  );

  return router;
};
