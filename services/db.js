var aws = require("aws-sdk");
const env = require("../utils/environment");
var lambda = new aws.Lambda({
  apiVersion: '2015-03-31',
  endpoint: 'http://127.0.0.1:4002',
  region: 'ap-southeast-1',
  s3ForcePathStyle: true,
});

module.exports = {
  request: async (operation, data) => {
    data.operation = operation

    var params = {
      InvocationType: 'RequestResponse',
      FunctionName: env.sls.DB_SERVICE_FUNCTION,
      Payload: JSON.stringify(data),
    };

    let result = await lambda.invoke(params).promise();

    return JSON.parse(result.Payload);
  },
};