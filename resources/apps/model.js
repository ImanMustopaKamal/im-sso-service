const global_model = require('../../utils/globalmodel'),
env = require("../../utils/environment"),
db_sso = env.sls.DB_SSO

module.exports = {
  GetRoles: async (app_id, params) => {
    try {
      const table = db_sso+".ms_app_role",
      tbl_alias = "role",
      table_name = table+" as "+tbl_alias

      let filter = [
        {
          name: tbl_alias + ".app_id",
          value: app_id,
          op: "eq",
        },
      ];

      if (params.name) {
        filter.push({
          name: tbl_alias + ".name",
          value: `%${params.name}%`,
          op: "like",
        });
      }

      let column_count = tbl_alias + ".id as count";
      let columns = [
        tbl_alias+".id",
        tbl_alias+".name",
        tbl_alias+".cognito_name"
      ]

      let val_data = {
        filter: filter,
        columns: columns,
        offset: params.offset,
        limit: params.limit,
      };

      let get_data = await global_model.FindAll(table_name, val_data);
      let get_count = await global_model.Count(table_name, {
        columns: column_count,
        filter: filter
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
      throw err
    }
  }
}