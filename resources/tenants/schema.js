const joi = require("@hapi/joi");

module.exports = {
  ParamTenantId: joi.object().keys({
    tenant_id: joi.string().min(8).max(8).required(),
  }),
  TenantBody: joi.object({
    tenant_id: joi.string().min(8).max(8).optional(),
    name: joi.string().min(3).max(200).required(),
    logo_file: joi.string().optional(),
    height: joi.string().optional(),
    width: joi.string().optional(),
    left: joi.string().optional(),
    top: joi.string().optional(),
  }),
  GetAvailableApps: joi.object({
    offset: joi.number().min(0).allow(null, "").optional(),
    limit: joi.number().min(0).allow(null, "").optional(),
  }),
  RegisterApp: joi.object({
    app_id: joi.number().required()
  }),
};
