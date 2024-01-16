const controller = require('./controller'),
schema = require('./schema'),
validation = require('../../middlewares/validate')

module.exports = (router) => {
  router.get(
    "/app-list",
    validation.privateConnect,
    validation.userTenantAuthorizer,
    controller.AppList
  )
  router.post(
    "/app-register",
    validation.privateConnect,
    validation.userTenantAuthorizer,
    validation.body(schema.AppRegister),
    controller.AppRegister
  )

  return router
}