const controller = require('./controller'),
schema = require('./schema'),
validation = require('../../middlewares/validate')

module.exports = (router) => {
  router.post(
    "/login",
    validation.privateConnect,
    validation.body(schema.Login),
    controller.Login
  )
  router.post(
    "/logout",
    validation.privateConnect,
    controller.Logout
  )
  router.post(
    "/refresh-token",
    validation.privateConnect,
    controller.RefreshToken
  )
  router.post(
    "/check-token",
    validation.privateConnect,
    controller.CheckToken
  )
  router.post(
    "/forgot",
    validation.privateConnect,
    validation.body(schema.Forgot),
    controller.Forgot
  )
  router.post(
    "/reset",
    validation.privateConnect,
    validation.body(schema.Reset),
    controller.Reset
  )
  router.get(
    "/verify/:token",
    validation.privateConnect,
    validation.param(schema.Verify),
    controller.VerifyToken
  )
  router.post(
    "/register",
    validation.privateConnect,
    validation.body(schema.Register),
    controller.Register
  )
  router.post(
    "/verify-request",
    validation.privateConnect,
    validation.body(schema.VerifyRequest),
    controller.VerifyRequest
  )
  router.post(
    "/verify",
    validation.privateConnect,
    validation.body(schema.Verify),
    controller.Verify
  )

  return router
}