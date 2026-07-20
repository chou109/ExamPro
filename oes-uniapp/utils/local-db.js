/**
 * 本地数据库操作类
 * 使用 uni-app 的 Storage API 模拟数据库
 */

const DB_NAME = 'exam_pro_db'

const TABLES = {
  USER: 'sys_user',
  SUBJECT: 'exam_subject',
  QUESTION: 'exam_question',
  PAPER: 'exam_paper',
  EXAM: 'exam_exam',
  EXAM_RECORD: 'exam_exam_record',
  ANSWER: 'exam_answer',
  WRONG_QUESTION: 'exam_wrong_question',
  CLASS: 'sys_class',
  CLASS_MEMBER: 'sys_class_member',
  CLASS_MESSAGE: 'sys_class_message',
  DEPARTMENT: 'sys_department',
  LOG: 'sys_log'
}

class LocalDB {
  constructor() {
    this.db = this.loadDB()
    this.ensureData()
  }

  loadDB() {
    const stored = uni.getStorageSync(DB_NAME)
    if (stored) {
      try {
        const loadedDb = JSON.parse(stored)
        const emptyDb = this.createEmptyDB()
        for (const tableName in emptyDb) {
          if (!loadedDb[tableName]) {
            loadedDb[tableName] = emptyDb[tableName]
          }
        }
        return loadedDb
      } catch (e) {
        return this.createEmptyDB()
      }
    }
    return this.createEmptyDB()
  }

  createEmptyDB() {
    return {
      sys_user: [],
      exam_subject: [],
      exam_question: [],
      exam_paper: [],
      exam_exam: [],
      exam_exam_record: [],
      exam_answer: [],
      exam_wrong_question: [],
      sys_class: [],
      sys_class_member: [],
      sys_class_message: [],
      sys_department: [],
      sys_log: []
    }
  }

  saveDB() {
    uni.setStorageSync(DB_NAME, JSON.stringify(this.db))
  }

  ensureData() {
    if (this.db.sys_user.length === 0) {
      this.initData()
    }
  }

  initData() {
    const now = new Date().toISOString()
    
    this.db.sys_department = [
      { id: 1, name: '计算机科学学院', code: 'CS', parent_id: null, sort_order: 1, deleted: 0, create_time: now, update_time: now },
      { id: 2, name: '信息工程学院', code: 'IE', parent_id: null, sort_order: 2, deleted: 0, create_time: now, update_time: now },
      { id: 3, name: '软件工程学院', code: 'SE', parent_id: null, sort_order: 3, deleted: 0, create_time: now, update_time: now }
    ]

    this.db.exam_subject = [
      { id: 1, name: '数据结构与算法', code: 'DSA', department_id: 1, description: '数据结构与算法设计', deleted: 0, create_time: now, update_time: now },
      { id: 2, name: '操作系统原理', code: 'OS', department_id: 1, description: '操作系统原理与应用', deleted: 0, create_time: now, update_time: now },
      { id: 3, name: '计算机网络', code: 'CN', department_id: 1, description: '计算机网络基础', deleted: 0, create_time: now, update_time: now }
    ]

    this.db.sys_user = [
      { id: 1, username: 'admin', password: 'admin', real_name: '系统管理员', email: 'admin@exampro.com', phone: null, avatar: null, role: 'ADMIN', status: 1, department_id: 1, deleted: 0, create_time: now, update_time: now }
    ]

    this.db.sys_log = [
      { id: 1, username: 'admin', operation: '用户登录', ip: '127.0.0.1', method: 'POST', params: '{"username":"admin"}', create_time: now },
      { id: 2, username: 'admin', operation: '创建用户', ip: '127.0.0.1', method: 'POST', params: '{"username":"teacher","role":"TEACHER"}', create_time: now },
      { id: 3, username: 'admin', operation: '创建试卷', ip: '127.0.0.1', method: 'POST', params: '{"title":"数据结构期末测试","subjectId":1}', create_time: now },
      { id: 4, username: 'admin', operation: '发布考试', ip: '127.0.0.1', method: 'PUT', params: '{"examId":1,"status":"PUBLISHED"}', create_time: now },
      { id: 5, username: 'admin', operation: '用户登出', ip: '127.0.0.1', method: 'POST', params: '{}', create_time: now }
    ]

    this.saveDB()
  }

  nextId(table) {
    const records = this.db[table] || []
    if (records.length === 0) return 1
    return Math.max(...records.map(r => r.id)) + 1
  }

  insert(table, data) {
    const records = this.db[table] || []
    const now = new Date().toISOString()
    const record = {
      id: this.nextId(table),
      deleted: 0,
      create_time: now,
      update_time: now,
      ...data
    }
    records.push(record)
    this.db[table] = records
    this.saveDB()
    return record
  }

  update(table, id, data) {
    const records = this.db[table] || []
    const index = records.findIndex(r => r.id === id && r.deleted === 0)
    if (index >= 0) {
      records[index] = {
        ...records[index],
        ...data,
        update_time: new Date().toISOString()
      }
      this.db[table] = records
      this.saveDB()
      return records[index]
    }
    return null
  }

  delete(table, id) {
    return this.update(table, id, { deleted: 1 })
  }

  findById(table, id) {
    const records = this.db[table] || []
    return records.find(r => r.id === id && r.deleted === 0)
  }

  findAll(table, filter = {}) {
    let records = this.db[table] || []
    records = records.filter(r => r.deleted === 0)
    
    Object.keys(filter).forEach(key => {
      records = records.filter(r => r[key] === filter[key])
    })
    
    return records
  }

  findOne(table, filter = {}) {
    const records = this.findAll(table, filter)
    return records[0] || null
  }

  count(table, filter = {}) {
    return this.findAll(table, filter).length
  }

  query(table, options = {}) {
    let records = this.findAll(table)
    
    if (options.where) {
      Object.keys(options.where).forEach(key => {
        const value = options.where[key]
        if (Array.isArray(value)) {
          records = records.filter(r => value.includes(r[key]))
        } else {
          records = records.filter(r => r[key] === value)
        }
      })
    }
    
    if (options.keyword) {
      const keyword = options.keyword.toLowerCase()
      records = records.filter(r => {
        return Object.values(r).some(v => 
          typeof v === 'string' && v.toLowerCase().includes(keyword)
        )
      })
    }
    
    if (options.sort) {
      records.sort((a, b) => {
        const field = options.sort.field || 'id'
        const order = options.sort.order === 'desc' ? -1 : 1
        return (a[field] > b[field] ? 1 : -1) * order
      })
    }
    
    if (options.offset !== undefined && options.limit !== undefined) {
      records = records.slice(options.offset, options.offset + options.limit)
    }
    
    return records
  }
}

const db = new LocalDB()

export { db, TABLES }
