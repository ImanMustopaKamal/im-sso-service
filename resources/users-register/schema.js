const joi = require('@hapi/joi')

module.exports = {
  userRegister: joi.object().keys({
    tenant_id: joi.string().min(8).max(8).required(),
    tenant_name: joi.string().min(3).max(200).required(),
    user_id: joi.string().min(8).max(8).required(),
    name: joi.string().min(3).max(200).required(),
    email: joi.string().min(6).max(100).email().required(),
    phone: joi.string().min(6).max(20).allow(null, "").required(),
    organization_id: joi.string().min(8).max(8).required(),
    user_status_id: joi.number().allow(null, "").required(),
    app_id: joi.number().required(),
    app_role_id: joi.string().min(8).max(8).required(),
  }),
}