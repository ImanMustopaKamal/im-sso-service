const cognito = require("../../services/cognito"),
global_model = require("../../utils/globalmodel"),
  env = require("../../utils/environment"),
  db_sso = env.sls.DB_SSO,
  table = db_sso + ".ms_user",
  tbl_alias = "usr",
  table_name = table + " as " + tbl_alias;

module.exports = {
  UserRegister: async (body, user_id) => {
    try {
      let tenant_id = body.tenant_id
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
        Tenant: [
          { name: tbl_alias + ".tenant_id", value: tenant_id, op: "eq" },
        ],
        Email: [
          { name: tbl_alias + ".email", value: body.email, op: "eq" },
          { name: tbl_alias + ".status", value: "A", op: "eq" },
        ],
        "Unit Kerja": [
          { name: tbl_alias + ".tenant_id", value: tenant_id, op: "eq" },
          { name: "urg.org_structure_id", value: org_structure_id, op: "eq" },
          { name: tbl_alias + ".status", value: "A", op: "eq" },
        ],
        Data: [
          { name: tbl_alias + ".name", value: body.name, op: "eq" },
          {
            name: tbl_alias + ".email",
            value: body.email,
            op: "eq",
          },
          { name: "urg.org_structure_id", value: org_structure_id, op: "eq" },
          { name: "urol.app_role_id", value: body.app_role_id, op: "eq" },
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
          {
            name: db_sso + ".ms_user_role as urol",
            type: "left",
            constraint: [
              {
                source: tbl_alias + ".id",
                dest: "urol.user_id",
                op: "eq",
              },
              {
                type: "and",
                source: "urol.status",
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
      let userrole_id = await helpers.GenerateRandomStringTable(global_model, {
        table: db_sso + ".ms_user_role",
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
            {
              Name: "custom:user_status_id",
              Value: body.user_status_id ? body.user_status_id.toString() : "",
            },
          ],
        };
        await helpers.CreateCognitoAccount(cognito, {
          params: cognito_params,
          group_name: "AccountMember",
        });
      }

      let data_insert = [
        {
          table: db_sso + ".ms_tenant",
          column_values: [
            helpers.BuildInsertData(
              {
                id: tenant_id,
                name: body.tenant_name,
              },
              user_id
            ),
          ],
        },
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
        {
          table: db_sso + ".ms_user_app",
          column_values: [
            helpers.BuildInsertData(
              {
                id: userorg_id,
                user_id: newuser_id,
                app_id: body.app_id,
              },
              user_id
            ),
          ],
        },
        {
          table: db_sso + ".ms_user_role",
          column_values: [
            helpers.BuildInsertData(
              {
                id: userrole_id,
                user_id: newuser_id,
                app_role_id: body.app_role_id,
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
};
