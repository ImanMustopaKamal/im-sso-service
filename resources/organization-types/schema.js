const joi = require("@hapi/joi");

module.exports = {
  query: joi.object().keys({
    name: joi.string().allow(null, "").optional(),
    offset: joi.number().min(0).allow(null, "").optional(),
    limit: joi.number().min(0).allow(null, "").optional(),
  }),
  paramId: joi.object().keys({
    organization_type_id: joi.string().min(8).max(8).required(),
  }),
  body: joi.object().keys({
    name: joi.string().min(3).max(200).required(),
    description: joi.string().max(500).allow(null, "").optional(),
  }),
};
