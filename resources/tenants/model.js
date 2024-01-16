const cognito = require("../../services/cognito"),
  s3 = require("../../services/s3"),
  globalModel = require("../../utils/globalmodel"),
  helpers = require("../../utils/helpers"),
  env = require("../../utils/environment"),
  dbSso = env.sls.DB_SSO,
  sharp = require("sharp");

module.exports = {
  GetById: async (id) => {
    try {
      let table = dbSso + ".ms_tenant as mt",
        tableAs = "mt",
        columns = [tableAs + ".id", tableAs + ".name", tableAs + ".logo_file_url"],
        columnCount = tableAs + ".id as count",
        doGet = await globalModel.FindById(table, {
          id: id,
          columns,
        }),
        doGetCount = await globalModel.Count(table, {
          columns: columnCount,
        });

      if (doGet && doGet.result.length > 0) {
        return {
          dataCount: doGetCount.result[0].count,
          data: doGet.result[0],
        };
      }

      return {
        dataCount: 0,
        data: []
      };
    } catch (err) {
      throw err;
    }
  },
  Create: async (user_id, value, file) => {
    try {
      let table = dbSso + ".ms_tenant";
      let generateTenantId = value.id ? value.id : await GenerateRandomString(table, "id");

      if (file) {
        const imageBuffer = file.buffer;
        const cropCoordinates = file.coordinates;
        const resizeBuffer = await sharp(imageBuffer)
          .extract(cropCoordinates)
          .toBuffer();
        file.buffer = resizeBuffer;
        const s3Uploader = await s3.upload(
          file,
          `${generateTenantId}/`,
          "tenant-logo"
        );
        value.logo_file_url = s3Uploader.Location;
      }

      let userRegisterTenantDb = [
        helpers.BuildInsertData(
          {
            id: generateTenantId,
            ...value,
          },
          user_id
        ),
      ];
      let doUserRegisterTenant = await globalModel.Insert(
        table,
        userRegisterTenantDb
      );
      if (doUserRegisterTenant && doUserRegisterTenant.status == 201) {
        table = dbSso + ".ms_user";
        let filter = {
          type: "and",
          fields: [{ name: table + ".id", value: user_id, op: "eq" }],
        };
        await globalModel.Update(
          table,
          { tenant_id: generateTenantId },
          filter
        );

        return true;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  Update: async (user_id, id, value, file) => {
    try {
      if (file) {
        const imageBuffer = file.buffer;
        const cropCoordinates = file.coordinates;
        const resizeBuffer = await sharp(imageBuffer)
          .extract(cropCoordinates)
          .toBuffer();
        file.buffer = resizeBuffer;
        const s3Uploader = await s3.upload(file, `${id}/`, "tenant-logo");
        value.logo_file_url = s3Uploader.Location;
      }

      let table = dbSso + ".ms_tenant";

      if (id) {
        let filter = {
          type: "and",
          fields: [{ name: table + ".id", value: id, op: "eq" }],
        };

        const doUpdate = await globalModel.Update(table, value, filter);
        if (doUpdate && doUpdate.status == 200) {
          return true;
        }
      } else {
        let generateTenantId = await GenerateRandomString(table, "id");
        let userRegisterTenantDb = [
          helpers.BuildInsertData(
            {
              id: generateTenantId,
              ...value,
            },
            user_id
          ),
        ];

        let doUserRegisterTenant = await globalModel.Insert(
          table,
          userRegisterTenantDb
        );
        if (doUserRegisterTenant && doUserRegisterTenant.status == 201) {
          table = dbSso + ".ms_user";
          let filter = {
            type: "and",
            fields: [{ name: table + ".id", value: user_id, op: "eq" }],
          };
          await globalModel.Update(
            table,
            { tenant_id: generateTenantId },
            filter
          );

          // await helpers.UpdateCognitoAccount(cognito, {
          //   username: user_id,
          //   params: {
          //     user_attributes: [
          //       { name: "tenant_id", value: generateTenantId },
          //       { name: "tenant_name", value: value.name },
          //     ],
          //   },
          // });

          return true;
        }
      }
    } catch (err) {
      throw err;
    }
  },
  GetAvailableApps: async (user_id, query) => {
    try {
      let tableAs = "app",
        table = dbSso + ".ms_app as " + tableAs,
        columns = [tableAs + ".id", tableAs + ".name", tableAs + ".url"],
        columnCount = tableAs + ".id as count",
        filter = [
          { name: tableAs + ".status", value: "A", op: "eq" },
          { name: tableAs + ".id", value: "3", op: "neq" },
        ],
        orderBy = [
          {
            name: tableAs + ".created_date",
            type: "ASC",
          },
        ],
        getData = await globalModel.FindAll(table, {
          columns,
          filter,
          offset: query.offset,
          limit: query.limit,
          order_by: orderBy,
          order_null: true
        }),
        doGetCount = await globalModel.Count(table, {
          columns: columnCount,
          filter,
        });

      const appListData = getData.result;

      if (appListData.length > 0) {
        table = dbSso + ".ms_user_app";
        tableAs = "app_org";
        columns = [tableAs + ".id", tableAs + ".user_id", tableAs + ".app_id"];
        filter = [
          { name: tableAs + ".status", value: "A", op: "eq" },
          { name: tableAs + ".user_id", value: user_id, op: "eq" },
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
            item.is_registered = true;
          } else {
            item.is_registered = false;
          }
          finalData.push(item);
        });

        return {
          dataCount: doGetCount.result[0].count,
          data: finalData
        };
      }
      return {
        dataCount: 0,
        data: []
      };
    } catch (err) {
      throw err;
    }
  },
  RegisterApp: async (userId, tenantId, appId) => {
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
