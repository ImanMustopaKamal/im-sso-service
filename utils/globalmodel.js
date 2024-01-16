const db = require('../services/db'),
env = require('./environment'),
helpers = require('./helpers')

module.exports = {
  FindAll: async (table, { filter, columns = [], join = [], group = [], order_by = [], offset, limit, order_null = false }) => {
    try {
      const tbl_alias = helpers.SplitTableAlias(table)

      let filter_data = {}
      let filter_fields = []
      if(Array.isArray(filter)){
        filter_fields = [
          {
            name: tbl_alias + '.status',
            value: 'A',
            op: 'eq'
          },
          ...filter
        ]

        filter_data = {
          type: 'and',
          fields: filter_fields
        }
      }else {
        filter_data = {
          expression: filter
        }
      }
      
      var order = []

      if (order_null) {
        order = order_by
      }
      else {
        order = [
          {
            name: tbl_alias + '.last_modify_date',
            type: 'desc'
          },
          ...order_by
        ]
      }
      
      let event = { 
        table: table,
        column: columns,
        filter: filter_data,
        join: join,
        group: group,
        order: order
      }
      
      if(limit){ event.limit = Number(limit) }
      if(offset){ event.offset = Number(offset) }
      
      let result = await db.request(env.sls.DB_SERVICE_SELECT, event)
      if(result.status == 500){
        throw new Error(result.errorMessage)
      }

      return result
    } catch (ex) {
      throw ex
    }
  },
  FindBy: async (table, { filter, columns = [], join = [], order_by = [], limit = 0, group = [] }) => {
    try {
      let event = { 
        table: table,
        column: columns,
        filter: filter,
        join: join,
        order: order_by,
        group: group
      }
      
      if(limit > 0 ){
        event.limit = Number(limit)
      }
      
      let result = await db.request(env.sls.DB_SERVICE_SELECT, event)
      if(result.status == 500){
        throw new Error(result.errorMessage)
      }

      return result
    } catch (ex) {
      throw ex
    }
  },
  FindById: async (table, { id, columns = [], join = [], group = [] }) => {
    try {
      const tbl_alias = helpers.SplitTableAlias(table)
      
      let event = { 
        table: table,
        column: columns,
        filter: {
          type: 'and',
          fields: [
            {
              name: tbl_alias + '.id',
              value: id,
              op: 'eq'
            },
            {
              name: tbl_alias + '.status',
              value: 'A',
              op: 'eq'
            }
          ]
        },
        join: join,
        group: group
      }
      
      let result = await db.request(env.sls.DB_SERVICE_SELECT, event)
      if(result.status == 500){
        throw new Error(result.errorMessage)
      }
      
      return result
    } catch (ex) {
      throw ex
    }
  },
  Insert: async (table, values = [], prefix_id = null) => {
    try {
      let event = { table: table, column_values: values }
      
      if(prefix_id){
        event.prefix_id = prefix_id
      }
      
      let result = await db.request(env.sls.DB_SERVICE_INSERT, event)
      if(result.status == 500){
        throw new Error(result.errorMessage)
      }
      
      return result
    } catch (ex) {
      throw ex
    }
  },
  Update: async (table, value, filter = {}) => {
    try {
      let event = { table: table, column_value: value, filter: filter }
      
      let result = await db.request(env.sls.DB_SERVICE_UPDATE, event)
      if(result.status == 500){
        throw new Error(result.errorMessage)
      }

      return result
    } catch (ex) {
      throw ex
    }
  },
  Delete: async (table, { id, filter = {}, user_id = "" }) => {
    try {
      let column_value_update = {
        last_modify_date: { raw: "now()" },
        last_modify_by: user_id,
        status: "D"
      }

      let filter_fields = {
        type: 'and',
        fields: [{
            name: 'id',
            value: id,
            op: 'eq'
        }]
      }
      
      if(Object.keys(filter).length > 0){
        filter_fields = filter
      }
      
      let event = { 
        table: table, 
        column_value: column_value_update, 
        filter: filter_fields
      }

      let result = await db.request(env.sls.DB_SERVICE_UPDATE, event)
      if(result.status == 500){
        throw new Error(result.errorMessage)
      }

      return result
    } catch (ex) {
      throw ex
    }
  },
  HardDelete: async (table, { id, filter = {} }) => {
    try {
      let filter_fields = {
        type: 'and',
        fields: [{
            name: 'id',
            value: id,
            op: 'eq'
        }]
      }
      
      if(Object.keys(filter).length > 0){
        filter_fields = filter
      }
      
      let event = { 
        table: table,
        filter: filter_fields
      }

      let result = await db.request(env.sls.DB_SERVICE_DELETE, event)
      if(result.status == 500){
        throw new Error(result.errorMessage)
      }

      return result
    } catch (ex) {
      throw ex
    }
  },
  Count: async (table, { columns = [], filter = [], join = [], group = [] }) => {
    try {
      const tbl_alias = helpers.SplitTableAlias(table)
      let filter_data = {}
      let filter_fields = []
      if(Array.isArray(filter)){
        filter_fields = [
          {
            name: tbl_alias + '.status',
            value: 'A',
            op: 'eq'
          },
          ...filter
        ]

        filter_data = {
          type: 'and',
          fields: filter_fields
        }
      }else {
        filter_data = {
          expression: filter
        }
      }
      
      let event = { 
        table: table,
        column: columns,
        filter: filter_data,
        join: join,
        group: group
      }
      
      let result = await db.request(env.sls.DB_SERVICE_COUNT, event)
      if(result.status == 500){
        throw new Error(result.errorMessage)
      }

      return result
    } catch (ex) {
      throw ex
    }
  },
  MultipleInsert: async (queries) => {
    try {
      let event = { 
        type: "multiple", 
        queries: queries
      }

      let result = await db.request(env.sls.DB_SERVICE_INSERT, event)
      if(result.status == 500){
        throw new Error(result.errorMessage)
      }

      return result
    } catch (ex) {
      throw ex
    }
  },
  MultipleUpdate: async (queries) => {
    try {
      let event = { 
        type: "multiple", 
        queries: queries
      }

      let result = await db.request(env.sls.DB_SERVICE_UPDATE, event)
      if(result.status == 500){
        throw new Error(result.errorMessage)
      }

      return result
    } catch (ex) {
      throw ex
    }
  },
}