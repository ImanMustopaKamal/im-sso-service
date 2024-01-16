const controller = require('./controller'),
schema = require('./schema'),
validation = require('../../middlewares/validate')

module.exports = (router) => {
  router.get(
    "/",
    validation.privateConnect,
    validation.userTenantAuthorizer,
    controller.Get
  )
  router.patch(
    "/",
    validation.privateConnect,
    validation.userTenantAuthorizer,
    validation.body(schema.UpdateBody),
    controller.Update
  )

  return router
}