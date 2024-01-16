const joi = require('@hapi/joi')

module.exports = {
  query: joi.object().keys({
    app_id: joi.number().allow(null, "").optional(),
    name: joi.string().allow(null, "").optional(),
    employee_number: joi.string().allow(null, "").optional(),
    email: joi.string().email().allow(null, "").optional(),
    role_id: joi.string().min(8).max(8).allow(null, "").optional(),
    organization_id: joi.string().min(8).max(8).allow(null, "").optional(),
    business_unit_id: joi.string().min(8).max(8).allow(null, "").optional(),
    subunit_id: joi.string().min(8).max(8).allow(null, "").optional(),
    business_unit_template_id: joi.string().min(8).max(8).allow(null, "").optional(),
    subunit_template_id: joi.string().min(8).max(8).allow(null, "").optional(),
    user_status_id: joi.number().allow(null, "").optional(),
    offset: joi.number().optional(),
    limit: joi.number().optional(),
  }),
  paramTenantId: joi.object().keys({
    tenant_id: joi.string().min(8).max(8).required()
  }),
  paramId: joi.object().keys({
    tenant_id: joi.string().min(8).max(8).required(),
    user_id: joi.string().min(8).max(8).required()
  }),
  userRequestBody: joi.object().keys({
    user_id: joi.string().min(8).max(8).optional(),
    name: joi.string().min(3).max(150).required(),
    employee_number: joi.string().min(3).max(20).allow(null, "").optional(),
    email: joi.string().min(6).max(100).email().required(),
    phone: joi.string().min(6).max(20).allow(null, "").optional(),
    organization_id: joi.string().min(8).max(8).required(),
    business_unit_id: joi.string().min(8).max(8).allow(null, "").optional(),
    subunit_id: joi.string().min(8).max(8).allow(null, "").optional(),
    user_status_id: joi.number().allow(null, "").optional()
  }),
  registerAppRequestBody: joi.object().keys({
    app_id: joi.number().required()
  }),
  userRoleRequestBody: joi.object().keys({
    app_id: joi.number().required(),
    app_role_id: joi.string().min(8).max(8).allow(null, "").optional()
  }),
  userStatusRequestBody: joi.object().keys({
    user_status_id: joi.number().required()
  }),
}