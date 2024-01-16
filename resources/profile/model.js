const cognito = require("../../services/cognito"),
  globalModel = require("../../utils/globalmodel");

module.exports = {
  Get: async (user_id) => {
    try {
      let table = "ssodev.ms_user as msu",
        columns = [
          "msu.id",
          "msu.employee_number",
          "msu.name",
          "msu.email",
          "msu.phone",
          "mar.name as app_role",
        ],
        join = [
          {
            name: "ssodev.ms_user_role as msur",
            type: "left",
            constraint: [
              {
                source: "msur.user_id",
                dest: "msu.id",
                op: "eq",
              },
              {
                type: "and",
                source: "msur.status",
                value: "A",
                op: "eq",
              },
            ],
          },
          {
            name: "ssodev.ms_app_role as mar",
            type: "left",
            constraint: [
              {
                source: "mar.id",
                dest: "msur.app_role_id",
                op: "eq",
              },
              {
                type: "and",
                source: "mar.status",
                value: "A",
                op: "eq",
              },
            ],
          },
        ],
        doGet = await globalModel.FindById(table, {
          id: user_id,
          columns,
          join,
        });
      if (doGet && doGet.result.length > 0) {
        return doGet.result[0];
      }
      return false;
    } catch (err) {
      throw err;
    }
  },
  Update: async (user_id, value) => {
    try {
      let table = "ssodev.ms_user";
      columns = ["id", "employee_number", "name", "email", "phone"];
      const getData = await globalModel.FindById(table, {
        id: user_id,
        columns,
      });

      const getDataResult = getData.result;
      if (getDataResult) {
        const userAttributes = [
          { Name: "name", Value: value.name },
          { Name: "email", Value: value.email },
          { Name: "phone_number", Value: value.phone },
          { Name: "email_verified", Value: "true" },
        ];
        await cognito.UpdateAttribute({
          username: getDataResult[0].employee_number,
          userAttributes,
        });

        table = "ssodev.ms_user";
        let filter = {
            type: "and",
            fields: [{ name: table + ".id", value: user_id, op: "eq" }],
          },
          doUpdate = await globalModel.Update(table, value, filter);
        if (doUpdate && doUpdate.status == 200) {
          return true;
        }
        return false;
      }
      return false;
    } catch (err) {
      throw err;
    }
  },
};
