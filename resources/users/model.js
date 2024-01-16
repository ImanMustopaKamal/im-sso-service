const helpers = require("../../utils/helpers"),
  global_model = require("../../utils/globalmodel"),
  cognito = require("../../services/cognito"),
  func = require("./function"),
  env = require("../../utils/environment"),
  db_sso = env.sls.DB_SSO,
  table = db_sso + ".ms_user",
  tbl_alias = "usr",
  table_name = table + " as " + tbl_alias;

module.exports = {
  GetAll: async (tenant_id, params) => {
    try {
      let filter = [
        {
          name: tbl_alias + ".status",
          value: "A",
          op: "eq",
        },
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

      if (params.employee_number) {
        filter.push({
          name: tbl_alias + ".employee_number",
          value: `%${params.employee_number}%`,
          op: "like",
        });
      }

      if (params.email) {
        filter.push({
          name: tbl_alias + ".email",
          value: `%${params.email}%`,
          op: "like",
        });
      }

      if (params.organization_id) {
        filter.push({
          name: "org.id",
          value: params.organization_id,
          op: "eq",
        });
      }

      if (params.business_unit_id) {
        filter.push({
          name: "bu.id",
          value: params.business_unit_id,
          op: "eq",
        });
      }

      if (params.subunit_id) {
        filter.push({ name: "bsu.id", value: params.subunit_id, op: "eq" });
      }

      if (params.business_unit_template_id) {
        filter.push({
          name: "but.id",
          value: params.business_unit_template_id,
          op: "eq",
        });
      }

      if (params.subunit_template_id) {
        filter.push({
          name: "bst.id",
          value: params.subunit_template_id,
          op: "eq",
        });
      }

      if (params.user_status_id) {
        filter.push({ name: tbl_alias+".user_status_id", value: params.user_status_id, op: "eq" });
      }

      if (params.role_id) {
        filter.push({
          name: "ar.id",
          value: params.role_id,
          op: "eq",
        });
      }

      let column_count = tbl_alias + ".id as count";
      let columns = [
        tbl_alias + ".id",
        tbl_alias + ".name",
        tbl_alias + ".employee_number",
        tbl_alias + ".email",
        tbl_alias + ".phone",
        "org.id as organization_id",
        "org.name as organization_name",
        "bu.id as business_unit_id",
        "bu.name as business_unit_name",
        "bsu.id as subunit_id",
        "bsu.name as subunit_name",
        "us.id as user_status_id",
        "us.name as user_status_name",
        {
          type: "expression",
          colname: "max(ar.id) as role_id",
          value: {},
        },
        {
          type: "expression",
          colname: "max(ar.name) as role_name",
          value: {},
        }
      ];
      let join = [
        {
          name: db_sso + ".ms_user_org as urg",
          type: "left",
          constraint: [
            {
              source: tbl_alias + ".id",
              dest: "urg.user_id",
              op: "eq",
            },
            {
              type: "and",
              source: "urg.status",
              value: "A",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".ms_business_subunit as bsu",
          type: "left",
          constraint: [
            {
              source: "urg.org_structure_id",
              dest: "bsu.id",
              op: "eq",
            },
            {
              type: "and",
              source: "bsu.status",
              value: "A",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".ms_business_unit as bu",
          type: "left",
          constraint: [
            {
              source: "urg.org_structure_id",
              dest: "bu.id",
              op: "eq",
            },
            {
              type: "or",
              source: "bsu.business_unit_id",
              dest: "bu.id",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".ms_organization as org",
          type: "left",
          constraint: [
            {
              source: "urg.org_structure_id",
              dest: "org.id",
              op: "eq",
            },
            {
              type: "or",
              source: "bu.organization_id",
              dest: "org.id",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".lt_user_status as us",
          type: "left",
          constraint: [
            {
              source: tbl_alias + ".user_status_id",
              dest: "us.id",
              op: "eq",
            },
            {
              type: "and",
              source: "us.status",
              value: "A",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".ms_business_unit_template as but",
          type: "left",
          constraint: [
            {
              source: "bu.business_unit_template_id",
              dest: "but.id",
              op: "eq",
            },
            {
              type: "and",
              source: "but.status",
              value: "A",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".ms_business_subunit_template as bst",
          type: "left",
          constraint: [
            {
              source: "bsu.business_subunit_template_id",
              dest: "bst.id",
              op: "eq",
            },
            {
              type: "and",
              source: "bst.status",
              value: "A",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".ms_user_role as ur",
          type: "left",
          constraint: [
            {
              source: "ur.user_id",
              dest: tbl_alias+".id",
              op: "eq",
            },
            {
              type: "and",
              source: "ur.status",
              value: "A",
              op: "eq",
            },
          ],
        },
      ];
      let group = [tbl_alias + ".id"];

      let raw_filter = helpers.GenerateRawFilter(filter)
      if (params.app_id) {
        // raw_filter = raw_filter + ` and (ar.app_id = ${params.app_id} or ar.app_id is null)`
        columns.push(
          {
            type: "expression",
            colname: "IF(ua.id is null, 'false', 'true') as is_app_enabled",
            value: {},
          },
        )
        join.push(
          {
            name: db_sso + ".ms_app_role as ar",
            type: "left",
            constraint: [
              {
                source: "ur.app_role_id",
                dest: "ar.id",
                op: "eq",
              },
              {
                type: "and",
                source: "ar.status",
                value: "A",
                op: "eq",
              },
              {
                type: "and",
                source: "ar.app_id",
                value: params.app_id,
                op: "eq",
              },
            ],
          },
          {
            name: db_sso+".ms_user_app as ua",
            type: "left",
            constraint: [
            {
                source: "ua.user_id",
                dest: tbl_alias+".id",
                op: "eq",
            },
            {
                type: "and",
                source: "ua.app_id",
                value: params.app_id,
                op: "eq",
            },
            {
                type: "and",
                source: "ua.status",
                value: "A",
                op: "eq",
            },
            ]
          },
        )
      }else {
        join.push({
          name: db_sso + ".ms_app_role as ar",
          type: "left",
          constraint: [
            {
              source: "ur.app_role_id",
              dest: "ar.id",
              op: "eq",
            },
            {
              type: "and",
              source: "ar.status",
              value: "A",
              op: "eq",
            }
          ],
        })
      }

      let val_data = {
        filter: raw_filter,
        columns: columns,
        join: join,
        group: group,
      };

      if (params.limit) {
        val_data.limit = params.limit
      }
      if (params.offset) {
        val_data.offset = params.offset
      }

      let get_data = await global_model.FindAll(table_name, val_data);
      let get_count = await global_model.Count(table_name, {
        columns: column_count,
        filter: raw_filter,
        join: join,
        group: group,
      });
      if (get_data.result.length > 0) {
        let total_data = get_count.result.length;

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
        tbl_alias + ".employee_number",
        tbl_alias + ".email",
        tbl_alias + ".phone",
        "org.id as organization_id",
        "org.name as organization_name",
        "bu.id as business_unit_id",
        "bu.name as business_unit_name",
        "bsu.id as subunit_id",
        "bsu.name as subunit_name",
        "us.id as user_status_id",
        "us.name as user_status_name",
      ];
      let join = [
        {
          name: db_sso + ".ms_user_org as urg",
          type: "left",
          constraint: [
            {
              source: tbl_alias + ".id",
              dest: "urg.user_id",
              op: "eq",
            },
            {
              type: "and",
              source: "urg.status",
              value: "A",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".ms_business_subunit as bsu",
          type: "left",
          constraint: [
            {
              source: "urg.org_structure_id",
              dest: "bsu.id",
              op: "eq",
            },
            {
              type: "and",
              source: "bsu.status",
              value: "A",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".ms_business_unit as bu",
          type: "left",
          constraint: [
            {
              source: "urg.org_structure_id",
              dest: "bu.id",
              op: "eq",
            },
            {
              type: "or",
              source: "bsu.business_unit_id",
              dest: "bu.id",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".ms_organization as org",
          type: "left",
          constraint: [
            {
              source: "urg.org_structure_id",
              dest: "org.id",
              op: "eq",
            },
            {
              type: "or",
              source: "bu.organization_id",
              dest: "org.id",
              op: "eq",
            },
          ],
        },
        {
          name: db_sso + ".lt_user_status as us",
          type: "left",
          constraint: [
            {
              source: tbl_alias + ".user_status_id",
              dest: "us.id",
              op: "eq",
            },
            {
              type: "and",
              source: "us.status",
              value: "A",
              op: "eq",
            },
          ],
        },
      ];

      let get_data = await global_model.FindById(table_name, {
        id,
        columns,
        join,
      });
      if (get_data.result.length > 0) {
        return {
          data: get_data.result,
        };
      }

      return [];
    } catch (err) {
      throw err;
    }
  },
  Insert: async (tenant_id, body, user_id) => {
    try {
      let org_structure_type_id = body.subunit_id
        ? 3
        : body.business_unit_id
        ? 2
        : 1;
      let org_structure_id = body.subunit_id
        ? body.subunit_id
        : body.business_unit_id
        ? body.business_unit_id
        : body.organization_id;

      let get_org = await helpers.GetOrganizationByStructure(global_model, {
        org_structure_id: org_structure_id,
        org_structure_type_id: org_structure_type_id
      })

      if(Object.keys(get_org).length === 0){
        return {
          error: "not found",
          message: "Organization structure not found, please add or choose another organization structure",
        };
      }

      let check_limit = await func.CheckLimitUser(global_model, { org_id: get_org.id })
      if(check_limit){
        return {
          error: "not found",
          message: check_limit
        }
      }

      let data_check_duplicate = {
        Email: [
          { name: tbl_alias + ".email", value: body.email, op: "eq" },
          { name: tbl_alias + ".status", value: "A", op: "eq" },
        ],
        // "Unit Kerja": [
        //   { name: tbl_alias + ".tenant_id", value: tenant_id, op: "eq" },
        //   { name: "urg.org_structure_id", value: org_structure_id, op: "eq" },
        //   { name: tbl_alias + ".status", value: "A", op: "eq" },
        // ],
        Data: [
          { name: tbl_alias + ".name", value: body.name, op: "eq" },
          {
            name: tbl_alias + ".email",
            value: body.email,
            op: "eq",
          },
          { name: "urg.org_structure_id", value: org_structure_id, op: "eq" },
          { name: tbl_alias + ".tenant_id", value: tenant_id, op: "eq" },
          { name: tbl_alias + ".status", value: "A", op: "eq" },
        ],
      };

      let is_duplicate = await helpers.CheckDuplicate(global_model, {
        table: table_name,
        join: [
          {
            name: db_sso + ".ms_user_org as urg",
            type: "left",
            constraint: [
              {
                source: tbl_alias + ".id",
                dest: "urg.user_id",
                op: "eq",
              },
              {
                type: "and",
                source: "urg.status",
                value: "A",
                op: "eq",
              },
            ],
          },
        ],
        data_check: data_check_duplicate,
      });
      if (is_duplicate) {
        return {
          error: "duplicate",
          message: is_duplicate,
        };
      }

      let newuser_id = body.user_id
        ? body.user_id
        : await helpers.GenerateRandomStringTable(global_model, {
            table: table,
            field: "id",
          });
      let userorg_id = await helpers.GenerateRandomStringTable(global_model, {
        table: db_sso + ".ms_user_org",
        field: "id",
      });

      const cognito_user_check = await cognito.AdminGetUser(newuser_id);

      if (cognito_user_check == false) {
        let cognito_params = {
          username: newuser_id,
          password: helpers.GeneratePassword(),
          user_attributes: [
            { Name: "name", Value: body.name },
            { Name: "email", Value: body.email },
            { Name: "email_verified", Value: "true" },
            { Name: "phone_number", Value: body.phone ? body.phone : "+62838" },
            { Name: "custom:user_id", Value: newuser_id },
            { Name: "custom:tenant_id", Value: tenant_id },
            { Name: "custom:user_status_id", Value: body.user_status_id ? body.user_status_id.toString() : '' },
          ],
        };
        await helpers.CreateCognitoAccount(cognito, {
          params: cognito_params,
          group_name: "AccountMember",
        });
      }

      let data_insert = [
        {
          table: table,
          column_values: [
            helpers.BuildInsertData(
              {
                id: newuser_id,
                tenant_id: tenant_id,
                name: body.name,
                employee_number: body.employee_number,
                email: body.email,
                phone: body.phone,
                user_status_id: body.user_status_id,
              },
              user_id
            ),
          ],
        },
        {
          table: db_sso + ".ms_user_org",
          column_values: [
            helpers.BuildInsertData(
              {
                id: userorg_id,
                user_id: newuser_id,
                org_structure_id: org_structure_id,
                org_structure_type_id: org_structure_type_id,
              },
              user_id
            ),
          ],
        },
      ];

      let do_insert = await global_model.MultipleInsert(data_insert);
      if (do_insert.status == 201) {
        return true;
      }

      return false;
    } catch (err) {
      if (Object.keys(err).length > 0) {
        if (err.hasOwnProperty("type") && err.type === "cognito") {
          if (err.code === "UsernameExistsException") {
            console.log(err.message);
            if (err.message.indexOf("email already exists") > -1) {
              return {
                error: "duplicate",
                message: "Email already exists",
              };
            } else if (
              err.message.indexOf("User account already exists") > -1
            ) {
              return {
                error: "duplicate",
                message: "Account already exists",
              };
            }
          }
        }
      }

      throw err;
    }
  },
  Update: async (params, body, user_id) => {
    try {
      let get_data_user = await global_model.FindById(table_name, {
        id: params.id,
        columns: [tbl_alias + ".*"],
      });

      let get_data_user_org = await global_model.FindBy(
        db_sso + ".ms_user_org as urg",
        {
          columns: ["*"],
          filter: {
            type: "and",
            fields: [
              { name: "user_id", value: params.id, op: "eq" },
              { name: "status", value: "A", op: "eq" },
            ],
          },
        }
      );

      if (get_data_user.result.length === 0) {
        return {
          error: "not found",
          message: "Data was not found",
        };
      }

      let data_user = get_data_user.result[0];

      let org_structure_type_id = body.subunit_id
        ? 3
        : body.business_unit_id
        ? 2
        : 1;
      let org_structure_id = body.subunit_id
        ? body.subunit_id
        : body.business_unit_id
        ? body.business_unit_id
        : body.organization_id;

      let data_check_duplicate = {
        Email: [
          { name: tbl_alias + ".email", value: body.email, op: "eq" },
          { name: tbl_alias + ".status", value: "A", op: "eq" },
        ],
        // "Unit Kerja": [
        //   { name: tbl_alias + ".tenant_id", value: params.tenant_id, op: "eq" },
        //   { name: "urg.org_structure_id", value: org_structure_id, op: "eq" },
        //   { name: tbl_alias + ".status", value: "A", op: "eq" },
        // ],
        Data: [
          { name: tbl_alias + ".name", value: body.name, op: "eq" },
          {
            name: tbl_alias + ".email",
            value: body.email,
            op: "eq",
          },
          { name: "urg.org_structure_id", value: org_structure_id, op: "eq" },
          { name: tbl_alias + ".tenant_id", value: params.tenant_id, op: "eq" },
          { name: tbl_alias + ".status", value: "A", op: "eq" },
        ],
      };

      let is_duplicate = await helpers.CheckDuplicate(global_model, {
        table: table_name,
        join: [
          {
            name: db_sso + ".ms_user_org as urg",
            type: "left",
            constraint: [
              {
                source: tbl_alias + ".id",
                dest: "urg.user_id",
                op: "eq",
              },
              {
                type: "and",
                source: "urg.status",
                value: "A",
                op: "eq",
              },
            ],
          },
        ],
        data_check: data_check_duplicate,
        current_id: params.id,
      });
      if (is_duplicate) {
        return {
          error: "duplicate",
          message: is_duplicate,
        };
      }

      let cognito_params = {
        user_attributes: [
          { name: "name", value: body.name },
          { name: "email", value: body.email },
          { name: "email_verified", value: "true" },
          { name: "custom:user_id", value: data_user.id },
          { name: "custom:tenant_id", value: params.tenant_id }
        ],
      };
      if (body.phone) {
        cognito_params.user_attributes.phone = {
          name: "phone_number",
          value: body.phone,
        };
      }
      if (body.user_status_id) {
        cognito_params.user_attributes.user_status_id = {
          name: "custom:user_status_id",
          value: body.user_status_id.toString(),
        };
      }

      // await helpers.UpdateCognitoAccount(cognito, {
      //   username: data_user.id,
      //   params: cognito_params,
      // });

      let data_update = [
        {
          table: table,
          filter: {
            type: "and",
            fields: [{ name: "id", value: params.id, op: "eq" }],
          },
          column_value: helpers.BuildUpdateData(
            {
              name: body.name,
              employee_number: body.employee_number,
              email: body.email,
              phone: body.phone,
              user_status_id: body.user_status_id,
            },
            user_id
          ),
        },
      ];

      if (get_data_user_org.result.length > 0) {
        let data_update_org = {
          table: db_sso + ".ms_user_org",
          filter: {
            type: "and",
            fields: [{ name: "user_id", value: params.id, op: "eq" }],
          },
          column_value: helpers.BuildUpdateData(
            {
              org_structure_type_id: org_structure_type_id,
              org_structure_id: org_structure_id,
            },
            user_id
          ),
        };

        data_update.push(data_update_org);
      } else {
        let userorg_id = await helpers.GenerateRandomStringTable(global_model, {
          table: db_sso + ".ms_user_org",
          field: "id",
        });

        let data_insert_org = [
          helpers.BuildInsertData(
            {
              id: userorg_id,
              user_id: params.id,
              org_structure_id: org_structure_id,
              org_structure_type_id: org_structure_type_id,
            },
            user_id
          ),
        ];

        let do_insert = await global_model.Insert(
          db_sso + ".ms_user_org",
          data_insert_org
        );
      }

      let do_update = await global_model.MultipleUpdate(data_update);
      if (do_update.status == 200) {
        return true;
      }

      return false;
    } catch (err) {
      console.log(err);
      if (Object.keys(err).length > 0) {
        if (err.hasOwnProperty("type") && err.type === "cognito") {
          if (err.code === "UsernameExistsException") {
            console.log(err.message);
            if (err.message.indexOf("email already exists") > -1) {
              return {
                error: "duplicate",
                message: "Email already exists",
              };
            } else if (
              err.message.indexOf("User account already exists") > -1
            ) {
              return {
                error: "duplicate",
                message: "Account already exists",
              };
            }
          }
        }
      }

      throw err;
    }
  },
  Delete: async (id, user_id) => {
    try {
      let get_data_user = await global_model.FindById(table_name, {
        id: id,
        columns: [tbl_alias + ".*"],
      });

      if (get_data_user.result.length === 0) {
        return {
          error: "not found",
          message: "Data was not found",
        };
      }

      let data_user = get_data_user.result[0];

      await cognito.AdminDeleteUser(data_user.email);

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
  RegisterApp: async (params, body, user_id) => {
    try {
      let get_data_user = await global_model.FindById(table_name, {
        id: params.id,
        columns: [tbl_alias + ".*"],
      });

      if (get_data_user.result.length === 0) {
        return {
          error: "not found",
          message: "User not found",
        };
      }

      let check_user_app = await global_model.FindBy(db_sso + ".ms_user_app", {
        columns: ["*"],
        filter: {
          type: "and",
          fields: [
            { name: "user_id", value: params.id, op: "eq" },
            { name: "app_id", value: body.app_id, op: "eq" },
          ],
        },
      });

      if (check_user_app.result.length > 0) {
        let do_update = await global_model.Update(
          db_sso + ".ms_user_app",
          helpers.BuildUpdateData(
            {
              status: "A",
            },
            user_id
          ),
          {
            type: "and",
            fields: [
              { name: "user_id", value: params.id, op: "eq" },
              { name: "app_id", value: body.app_id, op: "eq" },
            ],
          }
        );
        if (do_update.status == 200) {
          return true;
        }
      } else {
        let new_id = await helpers.GenerateRandomStringTable(global_model, {
          table: db_sso + ".ms_user_app",
          field: "id",
        });

        let data_insert = [
          helpers.BuildInsertData(
            {
              id: new_id,
              user_id: params.id,
              app_id: body.app_id,
            },
            user_id
          ),
        ];

        let do_insert = await global_model.Insert(
          db_sso + ".ms_user_app",
          data_insert
        );
        if (do_insert.status == 201) {
          return true;
        }
      }

      return false;
    } catch (err) {
      throw err;
    }
  },
  DeregisterApp: async (params, body, user_id) => {
    try {
      let get_data_user = await global_model.FindById(table_name, {
        id: params.id,
        columns: [tbl_alias + ".*"],
      });

      if (get_data_user.result.length === 0) {
        return {
          error: "not found",
          message: "User not found",
        };
      }

      let check_user_app = await global_model.FindBy(db_sso + ".ms_user_app", {
        columns: ["*"],
        filter: {
          type: "and",
          fields: [
            { name: "user_id", value: params.id, op: "eq" },
            { name: "app_id", value: body.app_id, op: "eq" },
          ],
        },
      });

      if (check_user_app.result.length > 0) {
        let do_delete = await global_model.Delete(db_sso + ".ms_user_app", {
          filter: {
            type: "and",
            fields: [
              { name: "user_id", value: params.id, op: "eq" },
              { name: "app_id", value: body.app_id, op: "eq" },
            ],
          },
          user_id: user_id,
        });

        if (do_delete.status == 200) {
          return true;
        }
      } else {
        return true;
      }

      return false;
    } catch (err) {
      throw err;
    }
  },
  ChangeRole: async (params, body, user_id) => {
    try {
      let get_data_user = await global_model.FindById(table_name, {
        id: params.id,
        columns: [tbl_alias + ".*"],
      });

      if (get_data_user.result.length === 0) {
        return {
          error: "not found",
          message: "User not found",
        };
      }

      let data_user = get_data_user.result[0];

      let check_role_user = await global_model.FindBy(
        db_sso + ".ms_user_role as ur",
        {
          columns: ["ur.*", "ar.name as role_name", "ar.cognito_name"],
          join: [
            {
              name: db_sso + ".ms_app_role as ar",
              type: "inner",
              constraint: [
                {
                  source: "ar.id",
                  dest: "ur.app_role_id",
                  op: "eq",
                },
                {
                  type: "and",
                  source: "ar.app_id",
                  value: body.app_id,
                  op: "eq",
                },
                {
                  type: "and",
                  source: "ar.status",
                  value: "A",
                  op: "eq",
                },
              ],
            },
          ],
          filter: {
            type: "and",
            fields: [{ name: "ur.user_id", value: params.id, op: "eq" }],
          },
        }
      );

      if (check_role_user.result.length > 0) {
        if (!body.app_role_id) {
          let data_cognito = {
            username: data_user.id,
          };

          if (body.app_id == 1) {
            data_cognito.params = {
              user_attributes: [{ name: "custom:role", value: "" }],
            };
          } else {
            data_cognito.old_group_name =
              check_role_user.result[0].cognito_name;
            data_cognito.group_name = "";
          }

          // await helpers.UpdateCognitoAccount(cognito, data_cognito);

          let do_delete = await global_model.Delete(db_sso + ".ms_user_role", {
            id: check_role_user.result[0].id,
          });
          if (do_delete) {
            return true;
          }
        } else {
          let get_role = await global_model.FindBy(db_sso + ".ms_app_role", {
            columns: ["*"],
            filter: {
              type: "and",
              fields: [
                { name: "id", value: body.app_role_id, op: "eq" },
                { name: "status", value: "A", op: "eq" },
              ],
            },
          });

          if (get_role.result.length === 0) {
            return {
              error: "not found",
              message: "Role not found",
            };
          }

          let data_cognito = {
            username: data_user.id,
          };

          if (body.app_id == 1) {
            data_cognito.params = {
              user_attributes: [
                { name: "custom:role", value: get_role.result[0].name },
              ],
            };
          } else {
            data_cognito.old_group_name =
              check_role_user.result[0].cognito_name;
            data_cognito.group_name = get_role.result[0].cognito_name;
          }

          // await helpers.UpdateCognitoAccount(cognito, data_cognito);

          let do_update = await global_model.Update(
            db_sso + ".ms_user_role",
            helpers.BuildUpdateData(
              {
                app_role_id: body.app_role_id,
                status: "A",
              },
              user_id
            ),
            {
              type: "and",
              fields: [
                { name: "id", value: check_role_user.result[0].id, op: "eq" },
                { name: "user_id", value: params.id, op: "eq" },
              ],
            }
          );

          if (do_update.status == 200) {
            return true;
          }
        }
      } else {
        if (body.app_role_id) {
          let get_role = await global_model.FindBy(db_sso + ".ms_app_role", {
            columns: ["*"],
            filter: {
              type: "and",
              fields: [
                { name: "id", value: body.app_role_id, op: "eq" },
                { name: "status", value: "A", op: "eq" },
              ],
            },
          });

          if (get_role.result.length === 0) {
            return {
              error: "not found",
              message: "Role not found",
            };
          }

          // if (body.app_id == 1) {
          //   await helpers.UpdateCognitoAccount(cognito, {
          //     username: data_user.id,
          //     params: {
          //       user_attributes: [
          //         { name: "custom:role", value: get_role.result[0].name },
          //       ],
          //     },
          //   });
          // } else {
          //   await helpers.AddCognitoGroup(cognito, {
          //     username: data_user.id,
          //     group_name: get_role.result[0].cognito_name,
          //   });
          // }

          let new_id = await helpers.GenerateRandomStringTable(global_model, {
            table: db_sso + ".ms_user_role",
            field: "id",
          });

          let data_insert = [
            helpers.BuildInsertData(
              {
                id: new_id,
                user_id: params.id,
                app_role_id: body.app_role_id,
              },
              user_id
            ),
          ];

          let do_insert = await global_model.Insert(
            db_sso + ".ms_user_role",
            data_insert
          );
          if (do_insert.status == 201) {
            return true;
          }
        } else {
          return true;
        }
      }

      return false;
    } catch (err) {
      throw err;
    }
  },
  ChangeStatus: async (params, body, user_id) => {
    try {
      let get_data_user = await global_model.FindById(table_name, {
        id: params.id,
        columns: [tbl_alias + ".*"],
      });

      if (get_data_user.result.length === 0) {
        return {
          error: "not found",
          message: "User not found",
        };
      }

      let do_update = await global_model.Update(
        table,
        helpers.BuildUpdateData(
          {
            user_status_id: body.user_status_id,
          },
          user_id
        ),
        {
          type: "and",
          fields: [{ name: "user_id", value: params.id, op: "eq" }],
        }
      );

      if (do_update.status == 200) {
        return true;
      }

      return false;
    } catch (err) {
      throw err;
    }
  },
};
