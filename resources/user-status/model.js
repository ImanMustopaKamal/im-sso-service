const helpers = require("../../utils/helpers"),
  global_model = require("../../utils/globalmodel"),
  env = require("../../utils/environment"),
  db_sso = env.sls.DB_SSO,
  table = db_sso+".lt_user_status",
  tbl_alias = "us",
  table_name = table + " as " + tbl_alias;

module.exports = {
  GetAll: async (params) => {
    try {
      let filter = [];
      if (params.name) {
        filter.push({
          name: tbl_alias + ".name",
          value: `%${params.name}%`,
          op: "like",
        });
      }

      let column_count = tbl_alias + ".id as count";
      let columns = [
        tbl_alias + ".id",
        tbl_alias + ".name"
      ];
      let join = [];
      let group = [tbl_alias + ".id"];
      let order_by = [
        {
          name: tbl_alias + ".last_modify_date",
          type: "desc",
        },
      ];

      let val_data = {
        filter: filter,
        columns: columns,
        join: join,
        group: group,
        order_by: order_by,
        offset: params.offset,
        limit: params.limit,
      };

      let get_data = await global_model.FindAll(table_name, val_data);
      let get_count = await global_model.Count(table_name, {
        columns: column_count,
        filter: filter,
      });
      if (get_data.result.length > 0) {
        let total_data = get_count.result[0].count;

        return {
          dataCount: total_data,
          data: get_data.result,
        };
      }

      return {};
    } catch (err) {
      throw err;
    }
  }
};
