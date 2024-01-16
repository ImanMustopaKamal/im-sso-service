var aws = require("aws-sdk");
const path = require("path");
const env = require("../utils/environment");
var s3 = new aws.S3({
  accessKeyId: env.sls.SLS_ACCESS_KEY,
  secretAccessKey: env.sls.SLS_SECRET_KEY,
  region: env.sls.POOL_REGION,
});

module.exports = {
  upload: async (file, folder_path, prefix_filename, bucket_name = "") => {
    try {
      let filename = Date.now().toString() + path.extname(file.originalname);
      if (prefix_filename) {
        filename = prefix_filename + "_" + filename;
      }

      const param = {
        Bucket: bucket_name ? bucket_name : env.sls.S3_BUCKET_NAME,
        Key: folder_path + filename,
        Body: file.buffer,
      };

      var results = await s3.upload(param).promise();
      results.Location = env.sls.CLOUDFRONT_URL + folder_path + filename;

      return results;
    } catch (ex) {
      throw ex;
    }
  },
};
