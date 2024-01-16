const joi = require('@hapi/joi')

module.exports = {
  query: joi.object().keys({
      name: joi.string().min(3).max(150).allow(null, "").optional(),
      offset: joi.number().min(0).allow(null, "").optional(),
      limit: joi.number().min(0).allow(null, "").optional(),
  }),
  paramId: joi.object().keys({
    app_id: joi.number().required(),
  })
}