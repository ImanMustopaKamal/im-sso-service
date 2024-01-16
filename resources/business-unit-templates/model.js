const helpers = require("../../utils/helpers"),
  global_model = require("../../utils/globalmodel"),
  env = require("../../utils/environment"),
  db_sso = env.sls.DB_SSO,
  table = db_sso+".ms_business_unit_template",
  tbl_alias = "business_unit_template",
  table_name = table + " as " + tbl_alias;

module.exports = {
  GetAll: async (tenant_id, params) => {
    try {
      let filter = [
        {
          name: tbl_alias + ".tenant_id",
          value: tenant_id,
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
        tbl_alias + ".id",
        tbl_alias + ".name"
      ];
      let order_by = [
        {
          name: tbl_alias + ".last_modify_date",
          type: "desc",
        },
      ];

      let val_data = {
        filter: filter,
        columns: columns,
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
  },
  GetById: async (id) => {
    try {
      let columns = [
        tbl_alias + ".id",
        tbl_alias + ".name",
        tbl_alias + ".description"
      ];

      let get_data = await global_model.FindById(table_name, {
        id,
        columns
      });
      if (get_data.result.length > 0) {
        return {
          data: get_data.result
        };
      }

      return [];
    } catch (err) {
      throw err;
    }
  },
  Insert: async (tenant_id, body, user_id) => {
    try {
      let data_check_duplicate = {
        "Data": [
          { name: "tenant_id", value: tenant_id, op: "eq" },
          { name: "name", value: body.name, op: "eq" },
          { name: "status", value: "A", op: "eq" },
        ],
      }
      
      let is_duplicate = await helpers.CheckDuplicate(global_model, {
        table: table_name,
        data_check: data_check_duplicate,
      });

      if (is_duplicate) {
        return "duplicate";
      }

      let new_id = await helpers.GenerateRandomStringTable(global_model, {
        table: table,
        field: "id",
      });

      let values = [helpers.BuildInsertData({ 
        id: new_id, 
        tenant_id: tenant_id,
        ...body
      }, user_id)];

      let do_insert = await global_model.Insert(table, values);
      if (do_insert.status == 201) {
        return true;
      }

      return false;
    } catch (err) {
      throw err;
    }
  },
  Update: async (params, body, user_id) => {
    try {
      let data_check_duplicate = {
        "Data": [
          { name: "tenant_id", value: params.tenant_id, op: "eq" },
          { name: "name", value: body.name, op: "eq" },
          { name: "status", value: "A", op: "eq" },
        ],
      }
      
      let is_duplicate = await helpers.CheckDuplicate(global_model, {
        table: table_name,
        data_check: data_check_duplicate,
        current_id: params.id
      });

      if (is_duplicate) {
        return "duplicate";
      }

      let value = helpers.BuildUpdateData(body, user_id);
      let filter = {
        type: "and",
        fields: [{ name: "id", value: params.id, op: "eq" }],
      };

      let do_update = await global_model.Update(table, value, filter);
      if (do_update.status == 200) {
        return true;
      }

      return false;
    } catch (err) {
      throw err;
    }
  },
  Delete: async (id, user_id) => {
    try {
      let filter = {
        type: "and",
        fields: [{ name: "id", value: id, op: "eq" }],
      };

      let do_delete = await global_model.Delete(table, {
        id: id,
        filter: filter,
        user_id: user_id,
      });
      if (do_delete) {
        return true;
      }

      return false;
    } catch (err) {
      throw err;
    }
  },
};
