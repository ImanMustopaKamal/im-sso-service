const express = require('express'),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  response = require('./utils/restapi'),
  // serverless = require('serverless-http'),
  env = require("./utils/environment"),
  port = env.app.port,
  app = express(),
  baseUrl = '/v1',
  baseUrlTenant = baseUrl + "/tenants";

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(baseUrl + '/auth', require('./resources/auth/route')(express.Router()));
app.use(baseUrl + '/tenants', require('./resources/tenants/route')(express.Router()));
app.use(baseUrlTenant, require('./resources/business-unit-templates/route')(express.Router()));
app.use(baseUrlTenant, require('./resources/business-subunit-templates/route')(express.Router()));
app.use(baseUrlTenant, require('./resources/organizations/route')(express.Router()));
app.use(baseUrlTenant, require('./resources/business-units/route')(express.Router()));
app.use(baseUrlTenant, require('./resources/business-subunits/route')(express.Router()));
app.use(baseUrlTenant, require('./resources/users/route')(express.Router()));
app.use(baseUrl + '/user-status', require('./resources/user-status/route')(express.Router()));
app.use(baseUrl + '/apps', require('./resources/apps/route')(express.Router()));
app.use(baseUrl + '/users/register', require('./resources/users-register/route')(express.Router()));

app.get('/health', (req, res) => {
  const healthcheck = {
    status: 200,
    message: 'Health check passed. The service is up and running',
    uptime: process.uptime(),
    timestamp: Date.now(),
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).send();
  }
});

app.use('/', (req, res) => {
  return response.notFound(res);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason);
});

const server = app.listen(port, () => {
  console.log(`app listening at http://::${port}`);
});

server.keepAliveTimeout = 30000;