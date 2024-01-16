const joi = require("@hapi/joi");

module.exports = {
  UpdateBody: joi.object({
    name: joi.string().min(3).max(150),
    email: joi.string().min(3).max(100),
    phone: joi.string().min(3).max(20),
  }),
};
