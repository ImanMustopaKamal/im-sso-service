const controller = require("./controller"),
  schema = require("./schema"),
  validation = require("../../middlewares/validate");

module.exports = (router) => {
  router.post(
    "/",
    validation.userAuthorizer,
    validation.body(schema.userRegister),
    controller.UserRegister
  );

  return router;
};
