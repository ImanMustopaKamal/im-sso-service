const joi = require("@hapi/joi");

module.exports = {
  AppRegister: joi.object({
    app_id: joi.number().required()
  }),
};
