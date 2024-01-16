var aws = require("aws-sdk");
const env = require("../utils/environment");
var lambda = new aws.Lambda({
  accessKeyId: env.sls.SLS_ACCESS_KEY,
  secretAccessKey: env.sls.SLS_SECRET_KEY,
  region: env.sls.POOL_REGION,
});
module.exports = {
  sendMail: async (params) => {
    var _params = {
      FunctionName: env.sls.MAIL_SERVICE,
      Payload: JSON.stringify(params),
    };
    let result = await lambda.invoke(_params).promise();
    console.log(result);
    return result.Payload;
  },
};
