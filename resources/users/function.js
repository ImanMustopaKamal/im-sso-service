const env = require("../../utils/environment"),
  db_sso = env.sls.DB_SSO;
module.exports = {
  CheckLimitUser: async (g_model, { org_id }) => {
    try {
      let get_org_count = await g_model.FindBy(db_sso + ".ms_organization", {
        filter: {
          type: "and",
          fields: [
            { name: "id", value: org_id, op: "eq" },
            { name: "status", value: "A", op: "eq" },
          ],
        },
        columns: ["user_max_count"],
        limit: 1,
      });
      let get_org_user_count = await g_model.Count(
        db_sso + ".ms_user as u",
        {
          columns: "u.id as count",
          filter: [
            { name: "organization.id", value: org_id, op: "eq" },
            { name: "u.status", value: "A", op: "eq" },
          ],
          join: [
            {
              name: db_sso + ".ms_user_org as urg",
              type: "left",
              constraint: [
                {
                  source: "urg.user_id",
                  dest: "u.id",
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
              name: db_sso + ".ms_business_subunit as subunit",
              type: "left",
              constraint: [
                {
                  source: "urg.org_structure_id",
                  dest: "subunit.id",
                  op: "eq",
                },
              ],
            },
            {
              name: db_sso + ".ms_business_unit as unit",
              type: "left",
              constraint: [
                {
                  source: "urg.org_structure_id",
                  dest: "unit.id",
                  op: "eq",
                },
                {
                  type: "or",
                  source: "subunit.business_unit_id",
                  dest: "unit.id",
                  op: "eq",
                },
              ],
            },
            {
              name: db_sso + ".ms_organization as organization",
              type: "left",
              constraint: [
                {
                  source: "urg.org_structure_id",
                  dest: "organization.id",
                  op: "eq",
                },
                {
                  type: "or",
                  source: "unit.organization_id",
                  dest: "organization.id",
                  op: "eq",
                },
              ],
            },
          ],
          group: ["u.id"]
        }
      );

      let org_count = get_org_count.result[0]["user_max_count"]
        ? get_org_count.result[0]["user_max_count"]
        : 0;

      let org_user_count = get_org_user_count.result.length

      if(org_count === 0) {
        return "User Limit not found. Please contact your provider."
      }
      if(org_user_count >= org_count) {
        return "User Limit has been reached. Please contact your provider to increase the limit." 
      }

      return ""
    } catch (err) {
      throw err;
    }
  },
};
