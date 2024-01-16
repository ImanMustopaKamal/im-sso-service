const joi = require("@hapi/joi");

module.exports = {
  Login: joi.object({
    username: joi.string().required(),
    password: joi.string().required()
  }),
  Forgot: joi.object({
    email: joi.string().required()
  }),
  Reset: joi.object({
    password: joi.string().required(),
    token: joi.string().required()
  }),
  Register: joi.object({
    company_name: joi.string().min(3).max(200).required(),
    name: joi.string().min(3).max(150).required(),
    email: joi.string().min(3).max(100).required(),
    phone: joi.string().min(10).max(14).required(),
    password: joi.string().required()
  }),
  VerifyRequest: joi.object({
    username: joi.string().required()
  }),
  Verify: joi.object({
    username: joi.string().required(),
    confirmation_code: joi.string().required()
  }),
};
