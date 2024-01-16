const controller = require('./controller'),
schema = require('./schema'),
validation = require('../../middlewares/validate'),
upload = require('../../utils/upload')

module.exports = (router) => {
  // Create a new tenant
  router.post(
    "/",
    upload.single("logo_file"),
    validation.privateConnect,
    validation.userTenantAuthorizer,
    validation.body(schema.TenantBody),
    controller.Create
  )

  // Get a specific tenant
  router.get(
    "/:tenant_id",
    validation.privateConnect,
    validation.userTenantAuthorizer,
    validation.param(schema.ParamTenantId),
    controller.GetById
  )

  // Update a specific tenant
  router.patch(
    "/:tenant_id",
    upload.single("logo_file"),
    validation.privateConnect,
    validation.userTenantAuthorizer,
    validation.param(schema.ParamTenantId),
    validation.body(schema.TenantBody),
    controller.Update
  )

  // Get list of available apps of a tenant
  router.get(
    "/:tenant_id/apps",
    validation.privateConnect,
    validation.userTenantAuthorizer,
    validation.param(schema.ParamTenantId),
    validation.query(schema.GetAvailableApps),
    controller.GetAvailableApps
  )

  // Register tenant to an app
  router.post(
    "/:tenant_id/registerApp",
    validation.privateConnect,
    validation.userTenantAuthorizer,
    validation.param(schema.ParamTenantId),
    validation.body(schema.RegisterApp),
    controller.RegisterApp
  )

  return router
}