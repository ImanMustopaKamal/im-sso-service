const controller = require("./controller"),
  schema = require("./schema"),
  validation = require("../../middlewares/validate");

module.exports = (router) => {
  router.get("/", validation.query(schema.query), controller.GetAll);
  router.post("/", validation.body(schema.body), controller.Insert);
  router.get(
    "/:organization_type_id",
    validation.param(schema.paramId),
    controller.GetById
  );
  router.patch(
    "/:organization_type_id",
    validation.param(schema.paramId),
    validation.body(schema.body),
    controller.Update
  );
  router.delete(
    "/:organization_type_id",
    validation.param(schema.paramId),
    controller.Delete
  );

  return router;
};
