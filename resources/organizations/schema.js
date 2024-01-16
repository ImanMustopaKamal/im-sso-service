const joi = require("@hapi/joi");

module.exports = {
  query: joi.object().keys({
    name: joi.string().allow(null, "").optional(),
    offset: joi.number().min(0).allow(null, "").optional(),
    limit: joi.number().min(0).allow(null, "").optional(),
  }),
  paramTenantId: joi.object().keys({
    tenant_id: joi.string().min(8).max(8).required()
  }),
  paramId: joi.object().keys({
    tenant_id: joi.string().min(8).max(8).required(),
    organization_id: joi.string().min(8).max(8).required()
  }),
  organizationRequestBody: joi.object().keys({
    name: joi.string().min(3).max(200).required(),
    description: joi.string().max(500).allow(null, "").optional(),
  }),
};
