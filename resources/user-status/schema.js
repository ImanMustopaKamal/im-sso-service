const joi = require("@hapi/joi");

module.exports = {
  query: joi.object().keys({
    name: joi.string().allow(null, "").optional(),
    offset: joi.number().min(0).allow(null, "").optional(),
    limit: joi.number().min(0).allow(null, "").optional(),
  }),
};
