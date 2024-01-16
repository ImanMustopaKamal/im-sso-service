const controller = require("./controller"),
  schema = require("./schema"),
  validation = require("../../middlewares/validate");

module.exports = (router) => {
  router.get("/", validation.query(schema.query), controller.GetAll);
  
  return router;
};
