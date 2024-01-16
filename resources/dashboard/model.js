const globalModel = require("../../utils/globalmodel"),
  cognito = require("../../services/cognito")
  helpers = require("../../utils/helpers"),
  env = require("../../utils/environment"),
  dbSso = env.sls.DB_SSO;

module.exports = {
  AppList: async (userId) => {
    try {
      let table = dbSso + ".ms_app",
        tableAs = "app",
        columns = [tableAs + ".id", tableAs + ".name", tableAs + ".url"],
        filter = [
          { name: tableAs + ".status", value: "A", op: "eq" },
          { name: tableAs + ".id", value: "3", op: "neq" },
        ],
        getData = await globalModel.FindAll(table + " as " + tableAs, {
          columns,
          filter,
        });

      const appListData = getData.result;

      if (appListData.length > 0) {
        table = dbSso + ".ms_user_app";
        tableAs = "app_org";
        columns = [tableAs + ".id", tableAs + ".user_id", tableAs + ".app_id"];
        filter = [
          { name: tableAs + ".status", value: "A", op: "eq" },
          { name: tableAs + ".user_id", value: userId, op: "eq" },
        ];
        getData = await globalModel.FindAll(table + " as " + tableAs, {
          columns,
          filter,
        });

        const appUserListData = getData.result;

        let finalData = [];
        appListData.forEach((item) => {
          const appUserListDataFind = appUserListData.find(
            (itemUser) => itemUser.app_id == item.id
          );
          if (appUserListDataFind) {
            item.registered = true;
          } else {
            item.registered = false;
          }
          finalData.push(item);
        });

        return finalData;
      }
      return [];
    } catch (err) {
      throw err;
    }
  },
  AppRegister: async (userId, tenantId, appId) => {
    try {
      const tableTenantApp = dbSso + ".ms_tenant_app";
      const tableUserApp = dbSso + ".ms_user_app";

      let doCheckDuplicateTenant = {
        "Tenant App": [
          { name: "tenant_id", value: tenantId, op: "eq" },
          { name: "app_id", value: appId, op: "eq" },
          { name: "status", value: "A", op: "eq" },
        ],
      };
      let checkDuplicateTenant = await helpers.CheckDuplicate(globalModel, {
        table: tableTenantApp,
        data_check: doCheckDuplicateTenant,
      });
      if (checkDuplicateTenant) {
        return {
          error: true,
          message: checkDuplicateTenant,
        };
      }

      let doCheckDuplicateUser = {
        "User App": [
          { name: "user_id", value: userId, op: "eq" },
          { name: "app_id", value: appId, op: "eq" },
          { name: "status", value: "A", op: "eq" },
        ],
      };
      let checkDuplicateUser = await helpers.CheckDuplicate(globalModel, {
        table: tableUserApp,
        data_check: doCheckDuplicateUser,
      });
      if (checkDuplicateUser) {
        return {
          error: true,
          message: checkDuplicateUser,
        };
      }

      let generateUserAppId = await GenerateRandomString(tableUserApp, "id");
      let generateTenantAppId = await GenerateRandomString(
        tableTenantApp,
        "id"
      );
      let userAppDb = [
        helpers.BuildInsertData(
          {
            id: generateUserAppId,
            user_id: userId,
            app_id: appId,
          },
          userId
        ),
      ];
      let userTenantAppDb = [
        helpers.BuildInsertData(
          {
            id: generateTenantAppId,
            tenant_id: tenantId,
            app_id: appId,
          },
          userId
        ),
      ];
      let doUserApp = await globalModel.Insert(tableUserApp, userAppDb);
      let doTenantApp = await globalModel.Insert(
        tableTenantApp,
        userTenantAppDb
      );
      if (doUserApp.status == 201 && doTenantApp.status == 201) {
        if (appId == 1) {
          const updateAttr = [
            { Name: "custom:role", Value: "Super Admin" }
          ];
          await cognito.UpdateAttribute({username: userId, userAttributes: updateAttr});
        }
        else if (appId == 2) {
          await cognito.AdminAddUserToGroup(userId, "CoreAdmin");
        }
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  },
};

async function GenerateRandomString(table, field, length = 8) {
  var id_generate = helpers.GenerateId(length);
  let columns = [field];

  let filter = {
    fields: [{ name: field, value: id_generate, op: "eq" }],
  };

  while (true) {
    let get_data = await globalModel.FindBy(table, {
      filter: filter,
      columns: columns,
      limit: 1,
    });
    if (get_data.result.length > 0) {
      id_generate = helpers.GenerateId(length);
    } else {
      break;
    }
  }

  return id_generate;
}
