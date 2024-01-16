const crypto = require("crypto");
const env = require("./environment");
const db_sso = env.sls.DB_SSO;
const jwt_decode = require("jwt-decode");

function RandomString(length, chars) {
  var mask = "";
  if (chars.indexOf("a") > -1) mask += "abcdefghijklmnopqrstuvwxyz";
  if (chars.indexOf("A") > -1) mask += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (chars.indexOf("#") > -1) mask += "0123456789";
  if (chars.indexOf("!") > -1) mask += "~`!@#$%^&*()_+-={}[]:\";'<>?,./|\\";
  var result = "";
  for (var i = length; i > 0; --i)
    result += mask[Math.floor(Math.random() * mask.length)];

  return result;
}

String.prototype.pick = function (min, max) {
  var n,
    chars = "";

  if (typeof max === "undefined") {
    n = min;
  } else {
    n = min + Math.floor(Math.random() * (max - min + 1));
  }

  for (var i = 0; i < n; i++) {
    chars += this.charAt(Math.floor(Math.random() * this.length));
  }

  return chars;
};

String.prototype.shuffle = function () {
  var array = this.split("");
  var tmp,
    current,
    top = array.length;

  if (top)
    while (--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
    }

  return array.join("");
};

module.exports = {
  EncryptToken: (token) => {
    try {
      const cipher = crypto.createCipher("aes-256-cbc", env.token.KEY);
      const encryptedToken = Buffer.concat([
        cipher.update(token),
        cipher.final(),
      ]);
      return encryptedToken.toString("base64");
    } catch (error) {
      throw new Error(
        "Invalid token format, please contact us for further information"
      );
    }
  },
  DecryptToken: (encryptedToken) => {
    try {
      const decipher = crypto.createDecipher("aes-256-cbc", env.token.KEY);
      const decryptedToken = Buffer.concat([
        decipher.update(Buffer.from(encryptedToken, "base64")),
        decipher.final(),
      ]);
      return decryptedToken.toString();
    } catch (error) {
      throw new Error(
        "Invalid token format, please contact us for further information"
      );
    }
  },
  SplitTableAlias: (table) => {
    if (table.indexOf(" as ") > -1) {
      const [tbl, as] = table.split(" as ");
      if (as.trim().length > 0) {
        return as.trim();
      }
      return tbl.trim();
    }
    return table.trim();
  },
  ParseJwt: (token) => {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  },
  GenerateVerificationCode: (length, chars) => {
    return RandomString(length, chars);
  },
  BuildInsertData: (body, user_id, additional_object = {}) => {
    return {
      ...additional_object,
      ...body,
      created_by: user_id,
      created_date: { raw: "now()" },
      last_modify_by: user_id,
      last_modify_date: { raw: "now()" },
      status: "A",
    };
  },
  BuildUpdateData: (body, user_id, additional_object = {}) => {
    return {
      ...additional_object,
      ...body,
      last_modify_by: user_id,
      last_modify_date: { raw: "now()" },
    };
  },
  GenerateId: (length) => {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  },
  CheckDuplicate: async (
    g_model,
    { table, join = [], data_check = {}, current_id = null }
  ) => {
    try {
      let tbl_alias = module.exports.SplitTableAlias(table);

      let message = "";
      for (const [key, value] of Object.entries(data_check)) {
        let columns = [tbl_alias + ".id"];
        let filter = {
          type: "and",
          fields: value,
        };

        let get_data = await g_model.FindBy(table, {
          filter: filter,
          columns: columns,
          join: join,
          limit: 1,
        });

        if (get_data.result.length > 0) {
          if (current_id == null) {
            message = key + " already exists";
            break;
          } else {
            if (current_id == get_data.result[0].id) {
              continue;
            }

            message = key + " already exists";
            break;
          }
        }
      }

      return message;
    } catch (err) {
      throw err;
    }
  },
  GetRequesterUserID: (token) => {
    if (token) {
      let data = jwt_decode(token);

      if (data["custom:user_id"] !== undefined && data["custom:user_id"]) {
        return data["custom:user_id"];
      }
    }

    return "";
  },
  GetRequesterTenantID: (token) => {
    if (token) {
      let data = jwt_decode(token);

      if (data["custom:tenant_id"] !== undefined && data["custom:tenant_id"]) {
        return data["custom:tenant_id"];
      }
    }

    return "";
  },
  GetRequesterGroups: (token) => {
    if (token) {
      let data = jwt_decode(token);

      if (data["cognito:groups"] !== undefined && data["cognito:groups"]) {
        return data["cognito:groups"];
      }
    }

    return "";
  },
  GenerateRandomString: (length, chars) => {
    return RandomString(length, chars);
  },
  GenerateRandomStringTable: async (g_model, { table, field }) => {
    var id_generate = module.exports.GenerateRandomString(8, "#aA");
    let column = [field];
    let filter = {
      fields: [{ name: field, value: id_generate, op: "eq" }],
    };

    while (true) {
      let get_data = await g_model.FindBy(table, {
        columns: column,
        filter: filter,
      });

      if (get_data.result.length > 0) {
        id_generate = module.exports.GenerateRandomString(8, "#aA");
      } else {
        break;
      }
    }

    return id_generate;
  },
  GeneratePassword: () => {
    var specials = "!@#$%^&*()_+{}:\"<>?|[];',./`~";
    var lowercase = "abcdefghijklmnopqrstuvwxyz";
    var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var numbers = "0123456789";

    var password = "";
    password += specials.pick(2);
    password += lowercase.pick(2);
    password += uppercase.pick(2);
    password += numbers.pick(2);
    password = password.shuffle();

    return password;
  },
  CreateCognitoAccount: async (cognito, { params, group_name }) => {
    try {
      await cognito.AdminCreateUser(params);
      if (group_name) {
        await cognito.AdminAddUserToGroup(params.username, group_name);
      }
    } catch (err) {
      throw {
        type: "cognito",
        ...err,
      };
    }
  },
  UpdateCognitoAccount: async (
    cognito,
    { username, params, group_name, old_group_name }
  ) => {
    try {
      if (params) {
        await cognito.AdminUpdateUser({ username: username, ...params });
      }
      if (group_name) {
        await cognito.AdminAddUserToGroup(username, group_name);
      }
      if (old_group_name) {
        await cognito.AdminRemoveUserFromGroup(username, old_group_name);
        if (group_name !== old_group_name) {
          await cognito.AdminUserGlobalSignOut(username);
        }
      }
    } catch (err) {
      console.log(err);
      throw {
        type: "cognito",
        ...err,
      };
    }
  },
  AddCognitoGroup: async (cognito, { username, group_name }) => {
    try {
      await cognito.AdminAddUserToGroup(username, group_name);
    } catch (err) {
      throw {
        type: "cognito",
        ...err,
      };
    }
  },
  GetSpesificFieldDataFromTable: async (g_model, { table, filter, column }) => {
    try {
      let get_data = await g_model.FindBy(table, {
        filter: filter,
        columns: [column],
        limit: 1,
      });
      if (get_data.result.length > 0) {
        return get_data.result[0][column];
      }

      return "";
    } catch (err) {
      throw err;
    }
  },
  GenerateRawFilter: (data_filter = [], type = "and") => {
    var raw_filter = "";
    data_filter.forEach((obj) => {
      let name = obj.name;
      let op = get_sql_op(obj.op, obj.value);
      let value = obj.op === "like" ? `'%${obj.value}%'` : `'${obj.value}'`;

      if (obj.op === "like") {
        raw_filter = raw_filter + `${name} ${op} ${value} ${type} `;
      } else {
        raw_filter = raw_filter + `${name}${op}${value} ${type} `;
      }
    });

    if (raw_filter) {
      if (type == "and") {
        raw_filter = raw_filter.slice(0, -5);
      } else if (type == "or") {
        raw_filter = raw_filter.slice(0, -4);
      }
    }

    return raw_filter;
  },
  GetOrganizationByStructure: async (
    g_model,
    { org_structure_id, org_structure_type_id }
  ) => {
    try {
      let field_name = "";
      if (org_structure_type_id === 1) {
        field_name = "o.id";
      } else if (org_structure_type_id === 2) {
        field_name = "bu.id";
      } else if (org_structure_type_id === 3) {
        field_name = "bsu.id";
      }

      let get_org = await g_model.FindBy(
        db_sso + ".ms_organization as o",
        {
          columns: ["o.*"],
          filter: {
            type: "and",
            fields: [
              { name: field_name, value: org_structure_id, op: "eq" },
              { name: "o.status", value: "A", op: "eq" },
            ],
          },
          join: [
            {
              name: db_sso + ".ms_business_unit as bu",
              type: "left",
              constraint: [
                {
                  source: "bu.organization_id",
                  dest: "o.id",
                  op: "eq",
                },
                {
                  type: "and",
                  source: "bu.status",
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
                  source: "bsu.business_unit_id",
                  dest: "bu.id",
                  op: "eq",
                },
                {
                  type: "and",
                  source: "bsu.status",
                  value: "A",
                  op: "eq",
                },
              ],
            }
          ],
        }
      );

      if(get_org.result.length > 0){
        return get_org.result[0]
      }

      return {}
    } catch (ex) {
      throw ex;
    }
  },
};

function get_sql_op(op, value) {
  if (op == "eq") {
    if (value != null) {
      return "=";
    } else {
      return "is";
    }
  }
  if (op == "neq") {
    if (value != null) {
      return "!=";
    } else {
      return "is not";
    }
  }
  if (op == "gt") {
    return ">";
  }
  if (op == "gte") {
    return ">=";
  }
  if (op == "lt") {
    return "<";
  }
  if (op == "lte") {
    return "<=";
  }
  if (op == "like") {
    return "like";
  }
  return "undefined";
}
