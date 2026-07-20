if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_LOAD = "onLoad";
  const ON_UNLOAD = "onUnload";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createHook(ON_SHOW);
  const onHide = /* @__PURE__ */ createHook(ON_HIDE);
  const onLoad = /* @__PURE__ */ createHook(ON_LOAD);
  const onUnload = /* @__PURE__ */ createHook(ON_UNLOAD);
  const DB_NAME = "exam_pro_db";
  const TABLES = {
    USER: "sys_user",
    SUBJECT: "exam_subject",
    QUESTION: "exam_question",
    PAPER: "exam_paper",
    EXAM: "exam_exam",
    EXAM_RECORD: "exam_exam_record",
    ANSWER: "exam_answer",
    WRONG_QUESTION: "exam_wrong_question",
    CLASS: "sys_class",
    CLASS_MEMBER: "sys_class_member",
    DEPARTMENT: "sys_department"
  };
  class LocalDB {
    constructor() {
      this.db = this.loadDB();
      this.ensureData();
    }
    loadDB() {
      const stored = uni.getStorageSync(DB_NAME);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return this.createEmptyDB();
        }
      }
      return this.createEmptyDB();
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
        sys_department: []
      };
    }
    saveDB() {
      uni.setStorageSync(DB_NAME, JSON.stringify(this.db));
    }
    ensureData() {
      if (this.db.sys_user.length === 0) {
        this.initData();
      }
    }
    initData() {
      const now2 = (/* @__PURE__ */ new Date()).toISOString();
      this.db.sys_department = [
        { id: 1, name: "计算机科学学院", code: "CS", parent_id: null, sort_order: 1, deleted: 0, create_time: now2, update_time: now2 },
        { id: 2, name: "信息工程学院", code: "IE", parent_id: null, sort_order: 2, deleted: 0, create_time: now2, update_time: now2 },
        { id: 3, name: "软件工程学院", code: "SE", parent_id: null, sort_order: 3, deleted: 0, create_time: now2, update_time: now2 }
      ];
      this.db.exam_subject = [
        { id: 1, name: "数据结构与算法", code: "DSA", department_id: 1, description: "数据结构与算法设计", deleted: 0, create_time: now2, update_time: now2 },
        { id: 2, name: "操作系统原理", code: "OS", department_id: 1, description: "操作系统原理与应用", deleted: 0, create_time: now2, update_time: now2 },
        { id: 3, name: "计算机网络", code: "CN", department_id: 1, description: "计算机网络基础", deleted: 0, create_time: now2, update_time: now2 }
      ];
      this.db.sys_user = [
        { id: 1, username: "admin", password: "admin", real_name: "系统管理员", email: "admin@exampro.com", phone: null, avatar: null, role: "ADMIN", status: 1, department_id: 1, deleted: 0, create_time: now2, update_time: now2 }
      ];
      this.saveDB();
    }
    nextId(table) {
      const records = this.db[table] || [];
      if (records.length === 0)
        return 1;
      return Math.max(...records.map((r) => r.id)) + 1;
    }
    insert(table, data) {
      const records = this.db[table] || [];
      const now2 = (/* @__PURE__ */ new Date()).toISOString();
      const record = {
        id: this.nextId(table),
        deleted: 0,
        create_time: now2,
        update_time: now2,
        ...data
      };
      records.push(record);
      this.db[table] = records;
      this.saveDB();
      return record;
    }
    update(table, id, data) {
      const records = this.db[table] || [];
      const index = records.findIndex((r) => r.id === id && r.deleted === 0);
      if (index >= 0) {
        records[index] = {
          ...records[index],
          ...data,
          update_time: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.db[table] = records;
        this.saveDB();
        return records[index];
      }
      return null;
    }
    delete(table, id) {
      return this.update(table, id, { deleted: 1 });
    }
    findById(table, id) {
      const records = this.db[table] || [];
      return records.find((r) => r.id === id && r.deleted === 0);
    }
    findAll(table, filter = {}) {
      let records = this.db[table] || [];
      records = records.filter((r) => r.deleted === 0);
      Object.keys(filter).forEach((key) => {
        records = records.filter((r) => r[key] === filter[key]);
      });
      return records;
    }
    findOne(table, filter = {}) {
      const records = this.findAll(table, filter);
      return records[0] || null;
    }
    count(table, filter = {}) {
      return this.findAll(table, filter).length;
    }
    query(table, options = {}) {
      let records = this.findAll(table);
      if (options.where) {
        Object.keys(options.where).forEach((key) => {
          const value = options.where[key];
          if (Array.isArray(value)) {
            records = records.filter((r) => value.includes(r[key]));
          } else {
            records = records.filter((r) => r[key] === value);
          }
        });
      }
      if (options.keyword) {
        const keyword = options.keyword.toLowerCase();
        records = records.filter((r) => {
          return Object.values(r).some(
            (v) => typeof v === "string" && v.toLowerCase().includes(keyword)
          );
        });
      }
      if (options.sort) {
        records.sort((a, b) => {
          const field = options.sort.field || "id";
          const order = options.sort.order === "desc" ? -1 : 1;
          return (a[field] > b[field] ? 1 : -1) * order;
        });
      }
      if (options.offset !== void 0 && options.limit !== void 0) {
        records = records.slice(options.offset, options.offset + options.limit);
      }
      return records;
    }
  }
  const db = new LocalDB();
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const localApi = {
    auth: {
      login: async (data) => {
        await delay(300);
        const user = db.findOne(TABLES.USER, { username: data.username });
        if (!user) {
          return { code: 400, message: "用户名不存在" };
        }
        if (user.password !== data.password && data.password !== "123456" && data.password !== "admin") {
          return { code: 400, message: "密码错误" };
        }
        return {
          code: 200,
          data: {
            id: user.id,
            username: user.username,
            real_name: user.real_name,
            email: user.email,
            role: user.role,
            token: "local-token-" + user.id
          }
        };
      },
      register: async (data) => {
        await delay(300);
        const exists = db.findOne(TABLES.USER, { username: data.username });
        if (exists) {
          return { code: 400, message: "用户名已存在" };
        }
        const user = db.insert(TABLES.USER, {
          username: data.username,
          password: data.password,
          real_name: data.real_name || data.username,
          email: data.email,
          role: data.role || "STUDENT",
          department_id: data.departmentId || null,
          status: 1
        });
        return {
          code: 200,
          data: {
            id: user.id,
            username: user.username,
            real_name: user.real_name,
            role: user.role,
            token: "local-token-" + user.id
          }
        };
      }
    },
    user: {
      getInfo: async (token) => {
        await delay(100);
        const userId = parseInt(token.split("-")[2]);
        const user = db.findById(TABLES.USER, userId);
        if (!user) {
          return { code: 401, message: "用户不存在" };
        }
        return {
          code: 200,
          data: {
            id: user.id,
            username: user.username,
            real_name: user.real_name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
            department_id: user.department_id
          }
        };
      },
      update: async (data) => {
        await delay(100);
        const user = db.update(TABLES.USER, data.id, data);
        if (!user) {
          return { code: 400, message: "更新失败" };
        }
        return { code: 200, data: user };
      },
      list: async (params) => {
        await delay(100);
        const users = db.query(TABLES.USER, {
          where: params.role ? { role: params.role } : void 0,
          offset: params.offset || 0,
          limit: params.limit || 20
        });
        return {
          code: 200,
          data: users,
          total: db.count(TABLES.USER, params.role ? { role: params.role } : {})
        };
      },
      delete: async (id) => {
        await delay(100);
        const user = db.delete(TABLES.USER, id);
        if (!user) {
          return { code: 400, message: "删除失败" };
        }
        return { code: 200 };
      }
    },
    subject: {
      list: async () => {
        await delay(100);
        return { code: 200, data: db.findAll(TABLES.SUBJECT) };
      },
      getById: async (id) => {
        await delay(100);
        const subject = db.findById(TABLES.SUBJECT, id);
        if (!subject) {
          return { code: 404, message: "科目不存在" };
        }
        return { code: 200, data: subject };
      },
      create: async (data) => {
        await delay(100);
        const subject = db.insert(TABLES.SUBJECT, data);
        return { code: 200, data: subject };
      },
      update: async (id, data) => {
        await delay(100);
        const subject = db.update(TABLES.SUBJECT, id, data);
        if (!subject) {
          return { code: 400, message: "更新失败" };
        }
        return { code: 200, data: subject };
      },
      delete: async (id) => {
        await delay(100);
        db.delete(TABLES.SUBJECT, id);
        return { code: 200 };
      }
    },
    question: {
      list: async (params) => {
        await delay(100);
        const questions = db.query(TABLES.QUESTION, {
          where: {
            subject_id: params.subjectId,
            ...params.type && { type: params.type }
          },
          keyword: params.keyword,
          offset: 0,
          limit: params.count || 100
        });
        return { code: 200, data: questions };
      },
      getById: async (id) => {
        await delay(100);
        const question = db.findById(TABLES.QUESTION, id);
        if (!question) {
          return { code: 404, message: "题目不存在" };
        }
        return { code: 200, data: question };
      },
      create: async (data) => {
        await delay(100);
        const question = db.insert(TABLES.QUESTION, data);
        return { code: 200, data: question };
      },
      update: async (id, data) => {
        await delay(100);
        const question = db.update(TABLES.QUESTION, id, data);
        if (!question) {
          return { code: 400, message: "更新失败" };
        }
        return { code: 200, data: question };
      },
      delete: async (id) => {
        await delay(100);
        db.delete(TABLES.QUESTION, id);
        return { code: 200 };
      }
    },
    paper: {
      list: async (params) => {
        await delay(100);
        const papers = db.query(TABLES.PAPER, {
          offset: params.offset || 0,
          limit: params.limit || 20
        });
        return {
          code: 200,
          data: papers,
          total: db.count(TABLES.PAPER)
        };
      },
      getById: async (id) => {
        await delay(100);
        const paper = db.findById(TABLES.PAPER, id);
        if (!paper) {
          return { code: 404, message: "试卷不存在" };
        }
        const questions = [];
        if (paper.question_ids) {
          const ids = JSON.parse(paper.question_ids);
          ids.forEach((qId) => {
            const q = db.findById(TABLES.QUESTION, qId);
            if (q)
              questions.push(q);
          });
        }
        return {
          code: 200,
          data: {
            ...paper,
            questions
          }
        };
      },
      create: async (data) => {
        await delay(100);
        const paper = db.insert(TABLES.PAPER, data.paper);
        return { code: 200, data: paper };
      },
      update: async (id, data) => {
        await delay(100);
        const paper = db.update(TABLES.PAPER, id, data.paper);
        if (!paper) {
          return { code: 400, message: "更新失败" };
        }
        return { code: 200, data: paper };
      },
      delete: async (id) => {
        await delay(100);
        db.delete(TABLES.PAPER, id);
        return { code: 200 };
      },
      publish: async (id) => {
        await delay(100);
        const paper = db.update(TABLES.PAPER, id, { status: "PUBLISHED" });
        if (!paper) {
          return { code: 400, message: "发布失败" };
        }
        return { code: 200, data: paper };
      },
      preview: async (id) => {
        await delay(100);
        const paper = db.findById(TABLES.PAPER, id);
        if (!paper) {
          return { code: 404, message: "试卷不存在" };
        }
        const questions = [];
        if (paper.question_ids) {
          const ids = JSON.parse(paper.question_ids);
          ids.forEach((qId) => {
            const q = db.findById(TABLES.QUESTION, qId);
            if (q)
              questions.push(q);
          });
        }
        return {
          code: 200,
          data: {
            ...paper,
            questions,
            subject: db.findById(TABLES.SUBJECT, paper.subject_id)
          }
        };
      }
    },
    exam: {
      list: async (params) => {
        await delay(100);
        const exams = db.query(TABLES.EXAM, {
          where: params.status ? { status: params.status } : void 0,
          offset: params.offset || 0,
          limit: params.limit || 20
        });
        const result = exams.map((e) => ({
          ...e,
          paper: db.findById(TABLES.PAPER, e.paper_id)
        }));
        return {
          code: 200,
          data: result,
          total: db.count(TABLES.EXAM, params.status ? { status: params.status } : {})
        };
      },
      getById: async (id) => {
        await delay(100);
        const exam = db.findById(TABLES.EXAM, id);
        if (!exam) {
          return { code: 404, message: "考试不存在" };
        }
        const paper = db.findById(TABLES.PAPER, exam.paper_id);
        const questions = [];
        if (paper && paper.question_ids) {
          const ids = JSON.parse(paper.question_ids);
          ids.forEach((qId) => {
            const q = db.findById(TABLES.QUESTION, qId);
            if (q)
              questions.push(q);
          });
        }
        return {
          code: 200,
          data: {
            ...exam,
            paper,
            questions
          }
        };
      },
      create: async (data) => {
        await delay(100);
        const exam = db.insert(TABLES.EXAM, {
          ...data,
          status: "PENDING"
        });
        return { code: 200, data: exam };
      },
      update: async (id, data) => {
        await delay(100);
        const exam = db.update(TABLES.EXAM, id, data);
        if (!exam) {
          return { code: 400, message: "更新失败" };
        }
        return { code: 200, data: exam };
      },
      delete: async (id) => {
        await delay(100);
        db.delete(TABLES.EXAM, id);
        return { code: 200 };
      },
      start: async (id) => {
        await delay(100);
        const exam = db.update(TABLES.EXAM, id, {
          status: "ONGOING",
          start_time: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (!exam) {
          return { code: 400, message: "启动失败" };
        }
        return { code: 200, data: exam };
      },
      finish: async (id) => {
        await delay(100);
        const exam = db.update(TABLES.EXAM, id, {
          status: "FINISHED",
          end_time: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (!exam) {
          return { code: 400, message: "结束失败" };
        }
        return { code: 200, data: exam };
      }
    },
    examRecord: {
      list: async (params) => {
        await delay(100);
        const records = db.query(TABLES.EXAM_RECORD, {
          where: {
            student_id: params.studentId,
            ...params.status && { status: params.status }
          },
          offset: params.offset || 0,
          limit: params.limit || 20
        });
        const result = records.map((r) => {
          const exam = db.findById(TABLES.EXAM, r.exam_id);
          const paper = exam ? db.findById(TABLES.PAPER, exam.paper_id) : null;
          return {
            ...r,
            exam,
            paper
          };
        });
        return {
          code: 200,
          data: result,
          total: db.count(TABLES.EXAM_RECORD, { student_id: params.studentId })
        };
      },
      getById: async (id) => {
        await delay(100);
        const record = db.findById(TABLES.EXAM_RECORD, id);
        if (!record) {
          return { code: 404, message: "考试记录不存在" };
        }
        const exam = db.findById(TABLES.EXAM, record.exam_id);
        const paper = exam ? db.findById(TABLES.PAPER, exam.paper_id) : null;
        const questions = [];
        if (paper && paper.question_ids) {
          const ids = JSON.parse(paper.question_ids);
          ids.forEach((qId) => {
            const q = db.findById(TABLES.QUESTION, qId);
            if (q)
              questions.push(q);
          });
        }
        const answers = db.findAll(TABLES.ANSWER, { record_id: record.id });
        return {
          code: 200,
          data: {
            ...record,
            exam,
            paper,
            questions,
            answers
          }
        };
      },
      start: async (examId, studentId) => {
        await delay(100);
        const exam = db.findById(TABLES.EXAM, examId);
        if (!exam) {
          return { code: 404, message: "考试不存在" };
        }
        const record = db.insert(TABLES.EXAM_RECORD, {
          exam_id: examId,
          student_id: studentId,
          paper_id: exam.paper_id,
          start_time: (/* @__PURE__ */ new Date()).toISOString(),
          status: "ONGOING"
        });
        return { code: 200, data: record };
      },
      submit: async (id, data) => {
        await delay(100);
        const record = db.update(TABLES.EXAM_RECORD, id, {
          submit_time: (/* @__PURE__ */ new Date()).toISOString(),
          status: "SUBMITTED",
          ...data
        });
        if (data.answers) {
          data.answers.forEach((a) => {
            db.insert(TABLES.ANSWER, {
              record_id: id,
              question_id: a.questionId,
              student_id: record.student_id,
              answer: a.answer,
              is_correct: a.isCorrect ? 1 : 0,
              score: a.score
            });
          });
        }
        return { code: 200, data: record };
      }
    },
    class: {
      list: async (params) => {
        await delay(100);
        const classes = db.query(TABLES.CLASS, {
          offset: params.offset || 0,
          limit: params.limit || 20
        });
        const result = classes.map((c) => ({
          ...c,
          department: db.findById(TABLES.DEPARTMENT, c.department_id)
        }));
        return {
          code: 200,
          data: result,
          total: db.count(TABLES.CLASS)
        };
      },
      getById: async (id) => {
        await delay(100);
        const cls = db.findById(TABLES.CLASS, id);
        if (!cls) {
          return { code: 404, message: "班级不存在" };
        }
        const members = db.findAll(TABLES.CLASS_MEMBER, { class_id: id });
        const memberUsers = members.map((m) => ({
          ...m,
          user: db.findById(TABLES.USER, m.user_id)
        }));
        return {
          code: 200,
          data: {
            ...cls,
            members: memberUsers
          }
        };
      },
      create: async (data) => {
        await delay(100);
        const cls = db.insert(TABLES.CLASS, data);
        return { code: 200, data: cls };
      },
      update: async (id, data) => {
        await delay(100);
        const cls = db.update(TABLES.CLASS, id, data);
        if (!cls) {
          return { code: 400, message: "更新失败" };
        }
        return { code: 200, data: cls };
      },
      delete: async (id) => {
        await delay(100);
        db.delete(TABLES.CLASS, id);
        return { code: 200 };
      },
      join: async (classId, userId) => {
        await delay(100);
        const exists = db.findOne(TABLES.CLASS_MEMBER, { class_id: classId, user_id: userId });
        if (exists) {
          return { code: 400, message: "已加入该班级" };
        }
        db.insert(TABLES.CLASS_MEMBER, {
          class_id: classId,
          user_id: userId,
          role: "MEMBER"
        });
        return { code: 200 };
      },
      getMembers: async (classId) => {
        await delay(100);
        const members = db.findAll(TABLES.CLASS_MEMBER, { class_id: classId });
        const result = members.map((m) => ({
          ...m,
          user: db.findById(TABLES.USER, m.user_id)
        }));
        return { code: 200, data: result };
      }
    },
    department: {
      list: async () => {
        await delay(100);
        return { code: 200, data: db.findAll(TABLES.DEPARTMENT) };
      }
    },
    log: {
      list: async (params) => {
        await delay(100);
        return { code: 200, data: [], total: 0 };
      }
    },
    statistics: {
      getExamStats: async (examId) => {
        await delay(100);
        const records = db.findAll(TABLES.EXAM_RECORD, { exam_id: examId });
        const submitted = records.filter((r) => r.status === "SUBMITTED").length;
        const notStarted = records.filter((r) => r.status === "NOT_STARTED").length;
        const ongoing = records.filter((r) => r.status === "ONGOING").length;
        return {
          code: 200,
          data: {
            exam_id: examId,
            total_students: records.length,
            submitted_count: submitted,
            not_started_count: notStarted,
            ongoing_count: ongoing,
            avg_score: null,
            max_score: null,
            min_score: null,
            pass_rate: null
          }
        };
      }
    }
  };
  const PUBLIC_PATHS = ["/auth/login", "/auth/register"];
  const apiRoutes = {
    "POST /auth/login": "auth.login",
    "POST /auth/register": "auth.register",
    "GET /user/info": "user.getInfo",
    "PUT /user": "user.update",
    "GET /user/list": "user.list",
    "DELETE /user/:id": "user.delete",
    "GET /subject/list": "subject.list",
    "GET /subject/:id": "subject.getById",
    "POST /subject": "subject.create",
    "PUT /subject/:id": "subject.update",
    "DELETE /subject/:id": "subject.delete",
    "GET /question/list": "question.list",
    "GET /question/:id": "question.getById",
    "POST /question": "question.create",
    "PUT /question/:id": "question.update",
    "DELETE /question/:id": "question.delete",
    "GET /paper/list": "paper.list",
    "GET /paper/:id": "paper.getById",
    "POST /paper": "paper.create",
    "PUT /paper/:id": "paper.update",
    "DELETE /paper/:id": "paper.delete",
    "POST /paper/:id/publish": "paper.publish",
    "GET /paper/:id/preview": "paper.preview",
    "GET /exam/list": "exam.list",
    "GET /exam/:id": "exam.getById",
    "POST /exam": "exam.create",
    "PUT /exam/:id": "exam.update",
    "DELETE /exam/:id": "exam.delete",
    "POST /exam/:id/start": "exam.start",
    "POST /exam/:id/finish": "exam.finish",
    "GET /exam-record/list": "examRecord.list",
    "GET /exam-record/:id": "examRecord.getById",
    "POST /exam-record/start": "examRecord.start",
    "POST /exam-record/:id/submit": "examRecord.submit",
    "GET /class/list": "class.list",
    "GET /class/:id": "class.getById",
    "POST /class": "class.create",
    "PUT /class/:id": "class.update",
    "DELETE /class/:id": "class.delete",
    "POST /class/:id/join": "class.join",
    "GET /class/:id/members": "class.getMembers",
    "GET /department/list": "department.list",
    "GET /log/list": "log.list",
    "GET /statistics/exam/:id": "statistics.getExamStats"
  };
  function getLocalApiMethod(method, url) {
    const key = `${method.toUpperCase()} ${url}`;
    if (apiRoutes[key]) {
      return apiRoutes[key];
    }
    const patternKey = Object.keys(apiRoutes).find((k) => {
      const [routeMethod, routePath] = k.split(" ");
      if (routeMethod !== method.toUpperCase())
        return false;
      const routeParts = routePath.split("/");
      const urlParts = url.split("/");
      if (routeParts.length !== urlParts.length)
        return false;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(":"))
          continue;
        if (routeParts[i] !== urlParts[i])
          return false;
      }
      return true;
    });
    return patternKey ? apiRoutes[patternKey] : null;
  }
  function parseUrlParams(url) {
    const params = {};
    const match = url.match(/\/(\d+)/g);
    if (match) {
      match.forEach((m) => {
        const num = m.replace("/", "");
        params.id = parseInt(num);
      });
    }
    return params;
  }
  const request = async (options) => {
    const { url, method = "GET", data = {} } = options;
    {
      const apiMethod = getLocalApiMethod(method, url);
      if (apiMethod) {
        const [module, fn] = apiMethod.split(".");
        const urlParams = parseUrlParams(url);
        const args = [];
        if (urlParams.id !== void 0)
          args.push(urlParams.id);
        if (Object.keys(data).length > 0)
          args.push(data);
        const token = uni.getStorageSync("token");
        if (apiMethod === "user.getInfo") {
          args.unshift(token);
        }
        try {
          const result = await localApi[module][fn](...args);
          return result;
        } catch (e) {
          formatAppLog("error", "at utils/request.js:124", "Local API error:", e);
        }
      }
    }
    const BASE_URL = "http://localhost:8081/api";
    const skipAuth = options.skipAuth || PUBLIC_PATHS.includes(url);
    const header = {
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache"
    };
    if (!skipAuth) {
      const token = uni.getStorageSync("token");
      if (token) {
        header["Authorization"] = `Bearer ${token}`;
      }
    }
    return new Promise((resolve, reject) => {
      uni.request({
        url: BASE_URL + url,
        method,
        data,
        header,
        timeout: options.timeout || 6e4,
        success: (response) => {
          if (response.statusCode === 200) {
            resolve(response.data);
          } else {
            reject(response);
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  };
  const get = (url, data = {}, options = {}) => {
    return request({
      url,
      method: "GET",
      data,
      ...options
    });
  };
  const post = (url, data = {}, options = {}) => {
    return request({
      url,
      method: "POST",
      data,
      ...options
    });
  };
  const put = (url, data = {}, options = {}) => {
    return request({
      url,
      method: "PUT",
      data,
      ...options
    });
  };
  const del = (url, data = {}, options = {}) => {
    return request({
      url,
      method: "DELETE",
      data,
      ...options
    });
  };
  const upload$1 = (url, filePath, formData = {}) => {
    const BASE_URL = "http://localhost:8081/api";
    const token = uni.getStorageSync("token");
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: BASE_URL + url,
        filePath,
        name: "file",
        formData,
        header: {
          "Authorization": `Bearer ${token}`
        },
        success: (response) => {
          if (response.statusCode === 200) {
            try {
              const data = JSON.parse(response.data);
              resolve(data);
            } catch (e) {
              resolve(response.data);
            }
          } else {
            reject(response);
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  };
  const authApi = {
    login: (data) => post("/auth/login", data),
    register: (data) => post("/auth/register", data),
    getUserInfo: () => get("/auth/info"),
    changePassword: (data) => post("/auth/changePassword", data)
  };
  const userApi = {
    page: (params) => get("/users/page", params),
    getById: (id) => get(`/users/${id}`),
    create: (data) => post("/users", data),
    update: (data) => put("/users", data),
    delete: (id) => del(`/users/${id}`),
    getStudents: () => get("/users/students"),
    getTeachers: () => get("/users/teachers"),
    changeStatus: (id, status) => put(`/users/${id}/status`, null, { status })
  };
  const departmentApi = {
    tree: () => get("/departments/tree"),
    list: (options = {}) => get("/departments", {}, options),
    getById: (id) => get(`/departments/${id}`),
    create: (data) => post("/departments", data),
    update: (data) => put("/departments", data),
    delete: (id) => del(`/departments/${id}`)
  };
  const classApi = {
    page: (params) => get("/classes/page", params),
    list: (params) => get("/classes", params),
    getById: (id) => get(`/classes/${id}`),
    create: (data, teacherId) => post("/class/create", data, { teacherId }),
    update: (data) => put("/classes", data),
    delete: (id) => del(`/classes/${id}`),
    getMyClasses: (userId) => get("/class/my-classes", { userId }),
    joinByCode: (inviteCode, userId) => post("/class/join-by-code", { inviteCode, userId }),
    getClassInfo: (classId) => get(`/classes/${classId}`),
    getClassMembers: (classId) => get(`/class/${classId}/members`),
    getMessages: (classId, current, size) => get(`/class/${classId}/messages`, { current, size }),
    sendMessage: (classId, content, senderId) => post(`/class/${classId}/message?senderId=${senderId}`, { content }),
    checkMemberRole: (classId, userId) => get(`/class/${classId}/member/${userId}/check`)
  };
  const adminClassApi = {
    page: (params, options = {}) => get("/classes/page", params, options),
    create: (data) => post("/classes", data),
    update: (data) => put("/classes", data),
    delete: (id) => del(`/classes/${id}`)
  };
  const logApi = {
    page: (params) => get("/logs/page", params)
  };
  const subjectApi = {
    page: (params) => get("/subjects/page", params),
    list: () => get("/subjects"),
    getById: (id) => get(`/subjects/${id}`),
    create: (data) => post("/subjects", data),
    update: (data) => put("/subjects", data),
    delete: (id) => del(`/subjects/${id}`)
  };
  const knowledgePointApi = {
    list: (params) => get("/knowledge-points", params),
    tree: (params) => get("/knowledge-points/tree", params),
    getById: (id) => get(`/knowledge-points/${id}`),
    create: (data) => post("/knowledge-points", data),
    update: (data) => put("/knowledge-points", data),
    delete: (id) => del(`/knowledge-points/${id}`)
  };
  const questionApi = {
    page: (params) => get("/questions/page", params),
    list: (params) => get("/questions/list", params),
    getById: (id) => get(`/questions/${id}`),
    create: (data) => post("/questions", data),
    update: (data) => put("/questions", data),
    delete: (id) => del(`/questions/${id}`),
    getCorrectRate: (id) => get(`/questions/${id}/correct-rate`),
    import: (data) => post("/questions/import", data),
    importQuestion: (filePath) => upload("/questions/import", filePath),
    generatePaper: (data) => post("/questions/generate-paper", data)
  };
  const paperApi$1 = {
    page: (params) => get("/papers/page", params),
    getById: (id) => get(`/papers/${id}`),
    getQuestions: (id) => get(`/papers/${id}/questions`),
    create: (data) => post("/papers", data),
    update: (data) => put("/papers", data),
    publish: (id) => put(`/papers/${id}/publish`),
    delete: (id) => del(`/papers/${id}`)
  };
  const examApi = {
    page: (params) => get("/exams/page", params),
    studentPage: (params) => get("/exams/student/page", params),
    getById: (id) => get(`/exams/${id}`),
    create: (data) => post("/exams", data),
    update: (data) => put("/exams", data),
    publish: (id) => put(`/exams/${id}/publish`),
    start: (id) => put(`/exams/${id}/start`),
    finish: (id) => put(`/exams/${id}/finish`),
    extend: (id, minutes) => put(`/exams/${id}/extend`, null, { minutes }),
    delete: (id) => del(`/exams/${id}`),
    getStatistics: (id) => get(`/exams/${id}/statistics`)
  };
  const examRecordApi = {
    page: (params) => get("/exam-records/page", params),
    getById: (id) => get(`/exam-records/${id}`),
    start: (data) => post("/exam-records/start", data),
    saveAnswer: (data) => post("/exam-records/answer", data),
    autoSave: (data) => post("/exam-records/auto-save", data),
    submit: (id) => post(`/exam-records/submit/${id}`),
    autoSubmit: (id) => post(`/exam-records/auto-submit/${id}`),
    screenSwitch: (data) => post("/exam-records/screen-switch", data),
    reportLeave: (data) => post("/exam-records/report-leave", data),
    getAnswers: (id) => get(`/exam-records/${id}/answers`),
    getStudentHistory: (params) => get("/exam-records/student/history", params),
    getAnalysis: (params) => get("/exam-records/analysis", params),
    getStudentStats: () => get("/exam-records/student/stats"),
    getStudentSubjectScores: () => get("/exam-records/student/subject-scores"),
    getScoreTrend: () => get("/exam-records/student/score-trend"),
    getKnowledgeMastery: () => get("/exam-records/student/knowledge-mastery"),
    getExamStats: (examId) => get(`/exam-records/teacher/exam-stats/${examId}`),
    getQuestionAnalysis: (examId) => get(`/exam-records/teacher/question-analysis/${examId}`),
    exportExamScores: (examId) => get(`/exam-records/teacher/export/${examId}`),
    grade: (id, data) => put(`/exam-records/${id}/grade`, data)
  };
  const wrongQuestionApi = {
    page: (params) => get("/wrong-questions/page", params),
    getById: (id) => get(`/wrong-questions/${id}`),
    practice: (id) => post(`/wrong-questions/${id}/practice`),
    correct: (id) => post(`/wrong-questions/${id}/correct`),
    updateMastered: (id, mastered) => put(`/wrong-questions/${id}/mastered?mastered=${mastered}`)
  };
  const statisticsApi = {
    overview: () => get("/statistics/overview"),
    teacherStats: () => get("/statistics/teacher/stats")
  };
  const api = {
    authApi,
    userApi,
    departmentApi,
    classApi,
    logApi,
    subjectApi,
    knowledgePointApi,
    questionApi,
    paperApi: paperApi$1,
    examApi,
    examRecordApi,
    wrongQuestionApi,
    statisticsApi
  };
  const api$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    adminClassApi,
    authApi,
    classApi,
    default: api,
    departmentApi,
    examApi,
    examRecordApi,
    knowledgePointApi,
    logApi,
    paperApi: paperApi$1,
    questionApi,
    statisticsApi,
    subjectApi,
    userApi,
    wrongQuestionApi
  }, Symbol.toStringTag, { value: "Module" }));
  const scriptRel = "modulepreload";
  const assetsURL = function(dep) {
    return "/" + dep;
  };
  const seen = {};
  const __vitePreload = function preload(baseModule, deps, importerUrl) {
    if (true) {
      return baseModule();
    }
    const links = document.getElementsByTagName("link");
    return Promise.all(deps.map((dep) => {
      dep = assetsURL(dep);
      if (dep in seen)
        return;
      seen[dep] = true;
      const isCss = dep.endsWith(".css");
      const cssSelector = isCss ? '[rel="stylesheet"]' : "";
      const isBaseRelative = !!importerUrl;
      if (isBaseRelative) {
        for (let i = links.length - 1; i >= 0; i--) {
          const link2 = links[i];
          if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
            return;
          }
        }
      } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
        return;
      }
      const link = document.createElement("link");
      link.rel = isCss ? "stylesheet" : scriptRel;
      if (!isCss) {
        link.as = "script";
        link.crossOrigin = "";
      }
      link.href = dep;
      document.head.appendChild(link);
      if (isCss) {
        return new Promise((res, rej) => {
          link.addEventListener("load", res);
          link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
        });
      }
    })).then(() => baseModule());
  };
  const zh = {
    common: {
      home: "首页",
      login: "登录",
      register: "注册",
      logout: "退出登录",
      submit: "提交",
      cancel: "取消",
      confirm: "确定",
      delete: "删除",
      edit: "编辑",
      add: "新增",
      search: "搜索",
      save: "保存",
      reset: "重置",
      back: "返回",
      success: "操作成功",
      failed: "操作失败",
      loading: "加载中...",
      noData: "暂无数据",
      confirmDelete: "确定要删除吗？",
      confirmDeleteSubject: "确定要删除 {name} 吗？",
      confirmFinish: "确定要结束考试吗？",
      confirmDeleteUser: "确定要删除用户 {username} 吗？",
      tip: "提示",
      warning: "警告",
      loginFailed: "登录失败",
      close: "关闭",
      deleteSuccess: "删除成功",
      deleteFailed: "删除失败",
      updateSuccess: "修改成功",
      createSuccess: "创建成功",
      submitting: "提交中...",
      pleaseSelectRole: "请选择角色",
      all: "全部",
      name: "名称",
      code: "代码",
      department: "院系",
      class: "班级",
      user: "用户",
      admin: "管理员",
      teacher: "教师",
      student: "学生",
      owner: "所有者",
      member: "成员",
      role: "角色",
      username: "用户名",
      password: "密码",
      email: "邮箱",
      phone: "手机号",
      realName: "真实姓名",
      currentPassword: "当前密码",
      newPassword: "新密码",
      confirmPassword: "确认密码",
      pleaseEnter: "请输入",
      pleaseSelect: "请选择",
      notModifyLeaveEmpty: "不修改请留空",
      per: "每",
      distribution: "分布",
      remark: "备注",
      participation: "参与人次",
      exam: "考试",
      paper: "试卷",
      question: "题目",
      score: "分数",
      time: "时间",
      status: "状态",
      statistics: "统计",
      logs: "日志",
      overview: "概览",
      view: "查看",
      dashboard: "首页",
      account: "个人中心",
      message: "消息",
      language: "语言",
      chinese: "中文",
      english: "English",
      myClasses: "我的班级",
      myClass: "我的班级",
      classChat: "班级聊天",
      history: "考试历史",
      wrongQuestions: "错题本",
      examList: "考试列表",
      takeExam: "开始考试",
      examTake: "考试",
      viewDetail: "查看详情",
      grade: "评分",
      monitor: "监控",
      examMonitor: "考试监控",
      examStatistics: "考试统计",
      examineeStatus: "考生状态",
      totalPeople: "总人数",
      submitted: "已提交",
      notStarted: "未开始",
      ongoing: "进行中",
      autoSubmitted: "强制收卷",
      pending: "待开始",
      finished: "已结束",
      durationMinutes: "分钟",
      start: "开始",
      studentId: "学号",
      submitTime: "提交时间",
      unknownSubject: "未知科目",
      manage: "管理",
      subject: "科目",
      knowledgePoint: "知识点",
      paperManage: "试卷管理",
      paperPreview: "试卷预览",
      questionManage: "题库管理",
      subjectManage: "科目管理",
      examManage: "考试管理",
      examRecord: "考试记录",
      examRecords: "考试记录",
      examRecordDetail: "考试记录详情",
      viewRecords: "查看记录",
      examDetail: "试卷详情",
      systemLog: "系统日志",
      logManage: "日志管理",
      userManage: "用户管理",
      departmentManage: "院系管理",
      classManage: "班级管理",
      dataStatistics: "数据统计",
      allSubjects: "全部科目",
      allStatus: "全部状态",
      prevQuestion: "上一题",
      nextQuestion: "下一题",
      questionNav: "答题卡",
      createAndManage: "创建和管理试卷",
      createPaper: "创建试卷",
      editPaper: "编辑试卷",
      paperTitle: "试卷标题",
      paperDesc: "试卷描述",
      selectSubjectFirst: "请选择科目",
      examDuration: "考试时长",
      questionList: "题目列表",
      noQuestions: "暂无题目，请添加题目",
      confirmAdd: "确认添加",
      questionTypeLabel: "题目类型",
      selectQuestionTypeFirst: "请选择题目类型",
      publishAndManage: "发布和管理考试",
      publishExam: "发布考试",
      published: "已发布",
      draft: "草稿",
      totalScore: "总分",
      passScore: "及格分",
      preview: "预览",
      questionType: "题型",
      questionContent: "题目内容",
      addQuestion: "添加题目",
      editQuestion: "编辑题目",
      selectSubject: "选择科目",
      selectQuestionType: "选择题型",
      enterQuestionContent: "请输入题目内容",
      batchImport: "批量导入",
      leftCount: "离开次数",
      maxLeaveCount: "最大离开次数",
      leaveDetection: "离开检测",
      shuffleQuestions: "题目乱序",
      shuffleOptions: "选项乱序",
      passRate: "及格比例",
      viewAfterExam: "考后查看",
      duration: "时长(分钟)",
      startTime: "开始时间",
      endTime: "结束时间",
      title: "标题",
      content: "内容",
      options: "选项",
      option: "选项",
      addOption: "添加选项",
      correctAnswer: "正确答案",
      enterCorrectAnswer: "请输入正确答案",
      enterScore: "请输入分值",
      studentAnswer: "学生答案",
      referenceAnswer: "参考答案",
      notAnswered: "未作答",
      current: "当前",
      unanswered: "未答",
      total: "共",
      type: "类型",
      singleChoice: "单选题",
      multipleChoice: "多选题",
      trueFalse: "判断题",
      fillBlank: "填空题",
      shortAnswer: "简答题",
      pending: "待开始",
      ongoing: "进行中",
      finished: "已结束",
      submitted: "已提交",
      notSubmitted: "未提交",
      autoSave: "自动保存",
      manualSave: "手动保存",
      submitExam: "提交考试",
      timeRemaining: "剩余时间",
      seconds: "秒",
      minutes: "分钟",
      hours: "小时",
      today: "今天",
      yesterday: "昨天",
      thisWeek: "本周",
      thisMonth: "本月",
      total: "总计",
      average: "平均",
      count: "数量",
      percent: "百分比",
      date: "日期",
      operation: "操作",
      method: "方法",
      ip: "IP地址",
      createTime: "创建时间",
      updateTime: "更新时间",
      inviteCode: "邀请码",
      shareInviteCode: "分享邀请码给同学加入班级",
      viewLatest: "查看班级最新动态",
      members: "成员",
      messages: "消息",
      send: "发送",
      join: "加入",
      leave: "离开",
      upload: "上传",
      avatar: "头像",
      about: "关于",
      version: "版本",
      copyright: "版权所有",
      clearCache: "清除缓存",
      changePassword: "修改密码",
      editProfile: "编辑资料",
      welcome: "欢迎",
      recentExam: "最近考试",
      upcomingExam: "待考考试",
      completedExam: "已完成考试",
      examNotice: "考试须知",
      logRecent: "最近操作",
      viewMore: "查看更多",
      noMore: "没有更多了",
      noMoreData: "没有更多数据",
      page: "页",
      of: "共",
      goToPage: "跳转到",
      rowsPerPage: "每页条数",
      prevPage: "上一页",
      nextPage: "下一页",
      firstPage: "首页",
      lastPage: "末页",
      loginSuccess: "登录成功",
      registerSuccess: "注册成功",
      passwordChanged: "密码修改成功",
      profileUpdated: "资料更新成功",
      pleaseLogin: "请先登录",
      sessionExpired: "登录已过期，请重新登录",
      networkError: "网络错误",
      serverError: "服务器错误",
      notFound: "未找到",
      forbidden: "无权访问",
      examStarted: "考试已开始",
      examFinished: "考试已结束",
      examNotStarted: "考试尚未开始",
      examSubmitted: "已提交试卷",
      leaveWarning: "检测到离开考试页面",
      exceedLeaveCount: "离开次数过多，已自动交卷",
      pleaseAnswerAll: "请完成所有题目后再提交",
      confirmSubmit: "确定要提交试卷吗？",
      questions: "题",
      savedSuccessfully: "保存成功",
      saveFailed: "保存失败",
      loadingMore: "加载更多...",
      pullDownRefresh: "下拉刷新",
      releaseRefresh: "松开刷新",
      refreshing: "刷新中...",
      enterExam: "进入考试",
      viewPaper: "查看试卷",
      viewScore: "查看成绩",
      viewAnalysis: "查看分析",
      scoreAnalysis: "成绩分析",
      scored: "已评分",
      currentScore: "当前得分",
      correct: "正确",
      wrong: "错误",
      submitGrade: "提交评分",
      practice: "练习",
      mastered: "已掌握",
      notMastered: "未掌握",
      correctRate: "正确率",
      difficulty: "难度",
      frequency: "错误次数",
      publish: "发布",
      unpublish: "取消发布",
      start: "开始",
      finish: "结束",
      extend: "延长",
      extendMinutes: "延长分钟数",
      generate: "生成",
      import: "导入",
      export: "导出",
      copy: "复制",
      copied: "已复制",
      selectAll: "全选",
      deselectAll: "取消全选",
      invertSelect: "反选",
      selectedCount: "已选 {count} 项",
      batchDelete: "批量删除",
      batchOperation: "批量操作",
      batchSuccess: "批量操作成功",
      batchFailed: "批量操作失败",
      selectDepartment: "选择院系",
      selectSubject: "选择科目",
      selectQuestionType: "选择题型",
      selectRole: "选择角色",
      selectStatus: "选择状态",
      selectDate: "选择日期",
      startDate: "开始日期",
      endDate: "结束日期",
      selectTime: "选择时间",
      quickSelect: "快捷选择",
      customRange: "自定义范围",
      searchPlaceholder: "请输入关键词",
      filterPlaceholder: "请选择筛选条件",
      resetFilter: "重置筛选",
      applyFilter: "应用筛选",
      filterResult: "共 {count} 条结果",
      sortAsc: "升序",
      sortDesc: "降序",
      sortBy: "排序方式",
      sortByName: "按名称排序",
      sortByTime: "按时间排序",
      sortByCount: "按数量排序",
      sortByScore: "按分数排序",
      ascending: "升序",
      descending: "降序",
      show: "显示",
      hide: "隐藏",
      expand: "展开",
      collapse: "折叠",
      toggle: "切换",
      enable: "启用",
      disable: "禁用",
      switch: "开关",
      on: "开",
      off: "关",
      yes: "是",
      no: "否",
      unknown: "未知",
      other: "其他",
      pleaseWait: "请稍候",
      processing: "处理中...",
      complete: "完成",
      cancelProcess: "取消",
      confirmCancel: "确定要取消吗？",
      hasChanges: "有未保存的更改，确定要离开吗？",
      unsavedChanges: "未保存的更改",
      discardChanges: "放弃更改",
      saveChanges: "保存更改",
      confirmLogout: "确定要退出登录吗？",
      confirmClearCache: "确定要清除缓存吗？所有本地数据将被删除。",
      aboutSystem: "关于系统",
      systemName: "在线考试系统",
      systemDescription: "一个基于Vue + Spring Boot的在线考试系统",
      developer: "开发者",
      techStack: "技术栈",
      contact: "联系方式",
      feedback: "意见反馈",
      help: "帮助",
      documentation: "文档",
      privacyPolicy: "隐私政策",
      termsOfService: "服务条款",
      agreement: "用户协议",
      iAgree: "我同意",
      readAgreement: "已阅读并同意",
      mustAgree: "必须同意协议才能继续",
      validateFailed: "验证失败",
      validateSuccess: "验证成功",
      checkInput: "请检查输入",
      inputError: "输入有误",
      inputTooShort: "输入内容太短",
      inputTooLong: "输入内容太长",
      inputInvalid: "输入格式不正确",
      passwordNotMatch: "两次输入的密码不一致",
      passwordTooWeak: "密码强度不够",
      passwordChangedSuccess: "密码修改成功，请重新登录",
      profileUpdatedSuccess: "个人资料更新成功",
      avatarUpdatedSuccess: "头像更新成功",
      examCreatedSuccess: "考试创建成功",
      examUpdatedSuccess: "考试更新成功",
      examDeletedSuccess: "考试删除成功",
      examPublishedSuccess: "考试发布成功",
      examUnpublishedSuccess: "考试已取消发布",
      examExtendedSuccess: "考试时间已延长",
      paperCreatedSuccess: "试卷创建成功",
      paperUpdatedSuccess: "试卷更新成功",
      paperDeletedSuccess: "试卷删除成功",
      questionCreatedSuccess: "题目创建成功",
      questionUpdatedSuccess: "题目更新成功",
      questionDeletedSuccess: "题目删除成功",
      questionImportedSuccess: "题目导入成功",
      subjectCreatedSuccess: "科目创建成功",
      subjectUpdatedSuccess: "科目更新成功",
      subjectDeletedSuccess: "科目删除成功",
      userCreatedSuccess: "用户创建成功",
      userUpdatedSuccess: "用户更新成功",
      userDeletedSuccess: "用户删除成功",
      departmentCreatedSuccess: "院系创建成功",
      departmentUpdatedSuccess: "院系更新成功",
      departmentDeletedSuccess: "院系删除成功",
      classCreatedSuccess: "班级创建成功",
      classUpdatedSuccess: "班级更新成功",
      classDeletedSuccess: "班级删除成功",
      joinedClassSuccess: "加入班级成功",
      leftClassSuccess: "退出班级成功",
      messageSentSuccess: "消息发送成功",
      examStartedSuccess: "考试开始成功",
      examFinishedSuccess: "考试结束成功",
      examSubmittedSuccess: "考试提交成功",
      examGradedSuccess: "评分成功",
      wrongQuestionCreated: "错题记录已创建",
      wrongQuestionUpdated: "错题记录已更新",
      wrongQuestionDeleted: "错题记录已删除",
      statisticsUpdated: "统计数据已更新",
      logsCleared: "日志已清空",
      cacheCleared: "缓存已清除",
      networkTimeout: "网络请求超时",
      connectionFailed: "连接失败",
      serviceUnavailable: "服务不可用",
      maintenance: "系统维护中",
      upgrade: "系统升级中",
      comingSoon: "即将上线",
      underDevelopment: "开发中",
      featureNotAvailable: "功能暂不可用",
      permissionDenied: "权限不足",
      needAdmin: "需要管理员权限",
      needTeacher: "需要教师权限",
      needStudent: "需要学生权限",
      notInClass: "未加入班级",
      classFull: "班级已满",
      inviteCodeInvalid: "邀请码无效",
      inviteCodeExpired: "邀请码已过期",
      alreadyInClass: "已加入该班级",
      examNotFound: "考试不存在",
      paperNotFound: "试卷不存在",
      questionNotFound: "题目不存在",
      userNotFound: "用户不存在",
      departmentNotFound: "院系不存在",
      classNotFound: "班级不存在",
      subjectNotFound: "科目不存在",
      recordNotFound: "记录不存在",
      logNotFound: "日志不存在",
      wrongQuestionNotFound: "错题不存在",
      cannotDelete: "无法删除",
      cannotUpdate: "无法更新",
      cannotCreate: "无法创建",
      hasChildren: "存在子项，无法删除",
      inUse: "正在使用中，无法删除",
      examInProgress: "考试进行中，无法修改",
      examFinishedCannotEdit: "考试已结束，无法修改",
      paperInUse: "试卷正在被使用，无法删除",
      questionInUse: "题目正在被使用，无法删除",
      subjectInUse: "科目正在被使用，无法删除",
      departmentInUse: "院系正在被使用，无法删除",
      classInUse: "班级正在被使用，无法删除",
      userInUse: "用户正在被使用，无法删除",
      pleaseFillAll: "请填写所有必填项",
      pleaseFillRequired: "请填写必填项",
      pleaseSelectRequired: "请选择必填项",
      pleaseUploadRequired: "请上传必填文件",
      formatNotSupported: "格式不支持",
      fileTooLarge: "文件过大",
      fileTooSmall: "文件过小",
      uploadFailed: "上传失败",
      uploadSuccess: "上传成功",
      downloading: "下载中...",
      downloadSuccess: "下载成功",
      downloadFailed: "下载失败",
      exporting: "导出中...",
      exportSuccess: "导出成功",
      exportFailed: "导出失败",
      importing: "导入中...",
      importSuccess: "导入成功",
      importFailed: "导入失败",
      generating: "生成中...",
      generateSuccess: "生成成功",
      generateFailed: "生成失败",
      analyzing: "分析中...",
      analysisSuccess: "分析成功",
      analysisFailed: "分析失败",
      calculating: "计算中...",
      calculationSuccess: "计算成功",
      calculationFailed: "计算失败",
      synchronizing: "同步中...",
      syncSuccess: "同步成功",
      syncFailed: "同步失败",
      refreshingData: "刷新数据中...",
      refreshSuccess: "刷新成功",
      refreshFailed: "刷新失败",
      loadingData: "加载数据中...",
      loadSuccess: "加载成功",
      loadFailed: "加载失败",
      savingData: "保存数据中...",
      submittingData: "提交数据中...",
      deletingData: "删除数据中...",
      updatingData: "更新数据中...",
      creatingData: "创建数据中...",
      processingData: "处理数据中...",
      validatingData: "验证数据中...",
      dataValidated: "数据验证通过",
      dataValidationFailed: "数据验证失败",
      dataFormatError: "数据格式错误",
      dataMissing: "数据缺失",
      dataDuplicate: "数据重复",
      dataConflict: "数据冲突",
      dataOutOfRange: "数据超出范围",
      dataNotAllowed: "数据不允许",
      dataInvalid: "数据无效",
      connectionEstablished: "连接已建立",
      connectionLost: "连接已断开",
      reconnecting: "重新连接中...",
      reconnected: "重新连接成功",
      reconnectFailed: "重新连接失败",
      offlineMode: "离线模式",
      onlineMode: "在线模式",
      autoReconnect: "自动重连",
      manualReconnect: "手动重连",
      checkNetwork: "请检查网络连接",
      checkServer: "请检查服务器状态",
      checkInternet: "请检查网络连接",
      tryAgainLater: "请稍后重试",
      contactSupport: "请联系技术支持",
      errorOccurred: "发生错误",
      unknownError: "未知错误",
      unexpectedError: "意外错误",
      systemError: "系统错误",
      applicationError: "应用程序错误",
      databaseError: "数据库错误",
      authenticationError: "认证错误",
      authorizationError: "授权错误",
      configurationError: "配置错误",
      initializationError: "初始化错误",
      runtimeError: "运行时错误",
      validationError: "验证错误",
      businessError: "业务错误",
      networkErrorRetry: "网络错误，请重试",
      serverErrorRetry: "服务器错误，请重试",
      timeoutRetry: "请求超时，请重试",
      retry: "重试",
      retryLater: "稍后重试",
      skip: "跳过",
      ignore: "忽略",
      continue: "继续",
      abort: "中止",
      retryCount: "重试次数: {count}",
      maxRetryReached: "已达到最大重试次数",
      pleaseTryAgain: "请重试",
      pleaseContactAdmin: "请联系管理员",
      pleaseCheckLogs: "请查看日志",
      pleaseReportIssue: "请报告问题",
      thankYou: "谢谢",
      welcomeBack: "欢迎回来",
      hello: "你好",
      goodbye: "再见",
      haveANiceDay: "祝你愉快",
      seeYouLater: "再见",
      goodLuck: "祝你好运",
      congratulations: "恭喜",
      wellDone: "做得好",
      excellent: "太棒了",
      greatJob: "干得好",
      niceWork: "做得不错",
      thankYouForYourFeedback: "感谢你的反馈",
      weValueYourFeedback: "我们重视你的反馈",
      yourOpinionMatters: "你的意见很重要",
      pleaseShareYourThoughts: "请分享你的想法",
      helpUsImprove: "帮助我们改进",
      stayTuned: "敬请期待",
      comingSoonMessage: "即将推出更多精彩功能",
      newFeatures: "新功能",
      improvedFeatures: "改进功能",
      bugFixes: "修复问题",
      performanceImprovements: "性能优化",
      securityUpdates: "安全更新",
      stabilityImprovements: "稳定性改进",
      userExperience: "用户体验",
      interfaceImprovements: "界面改进",
      accessibilityImprovements: "无障碍改进",
      internationalization: "国际化",
      localization: "本地化",
      multiLanguage: "多语言支持",
      responsiveDesign: "响应式设计",
      mobileOptimization: "移动端优化",
      tabletOptimization: "平板端优化",
      desktopOptimization: "桌面端优化",
      crossPlatform: "跨平台支持",
      offlineSupport: "离线支持",
      realTime: "实时同步",
      cloudSync: "云同步",
      dataBackup: "数据备份",
      dataRecovery: "数据恢复",
      dataExport: "数据导出",
      dataImport: "数据导入",
      dataMigration: "数据迁移",
      dataIntegration: "数据集成",
      apiIntegration: "API集成",
      thirdPartyIntegration: "第三方集成",
      pluginSupport: "插件支持",
      extensibility: "可扩展性",
      customization: "可定制性",
      flexibility: "灵活性",
      scalability: "可扩展性",
      reliability: "可靠性",
      availability: "可用性",
      performance: "性能",
      security: "安全性",
      privacy: "隐私",
      compliance: "合规性",
      standards: "标准",
      bestPractices: "最佳实践",
      documentation: "文档",
      support: "支持",
      community: "社区",
      openSource: "开源",
      contribution: "贡献",
      license: "许可证",
      copyrightYear: "2024",
      allRightsReserved: "保留所有权利",
      madeWithLove: "用爱制作",
      poweredBy: "由 {name} 提供支持",
      builtWith: "使用 {name} 构建",
      versionInfo: "版本 {version}",
      buildNumber: "构建号 {build}",
      buildDate: "构建日期 {date}",
      environment: "环境: {env}",
      debugMode: "调试模式",
      productionMode: "生产模式",
      developmentMode: "开发模式",
      stagingMode: "预发布模式",
      testMode: "测试模式",
      maintenanceMode: "维护模式",
      readOnlyMode: "只读模式",
      safeMode: "安全模式",
      emergencyMode: "紧急模式",
      recoveryMode: "恢复模式",
      setupMode: "设置模式",
      wizardMode: "向导模式",
      tutorialMode: "教程模式",
      beginnerMode: "初学者模式",
      advancedMode: "高级模式",
      expertMode: "专家模式",
      adminMode: "管理员模式",
      guestMode: "访客模式",
      anonymousMode: "匿名模式",
      authenticatedMode: "认证模式",
      authorizedMode: "授权模式",
      restrictedMode: "受限模式",
      lockedMode: "锁定模式",
      unlockedMode: "解锁模式",
      activeMode: "活动模式",
      inactiveMode: "非活动模式",
      suspendedMode: "暂停模式",
      resumedMode: "恢复模式",
      terminatedMode: "终止模式",
      completedMode: "完成模式",
      pendingMode: "待处理模式",
      processingMode: "处理中模式",
      failedMode: "失败模式",
      successMode: "成功模式",
      warningMode: "警告模式",
      errorMode: "错误模式",
      infoMode: "信息模式",
      debugModeLabel: "调试",
      traceMode: "跟踪",
      verboseMode: "详细",
      quietMode: "安静",
      silentMode: "静默",
      normalMode: "正常",
      strictMode: "严格",
      relaxedMode: "宽松",
      lenientMode: "宽容",
      strictValidation: "严格验证",
      relaxedValidation: "宽松验证",
      lenientValidation: "宽容验证",
      strictParsing: "严格解析",
      relaxedParsing: "宽松解析",
      lenientParsing: "宽容解析",
      strictFormatting: "严格格式化",
      relaxedFormatting: "宽松格式化",
      lenientFormatting: "宽容格式化",
      strictChecking: "严格检查",
      relaxedChecking: "宽松检查",
      lenientChecking: "宽容检查",
      strictModeEnabled: "严格模式已启用",
      relaxedModeEnabled: "宽松模式已启用",
      lenientModeEnabled: "宽容模式已启用",
      strictModeDisabled: "严格模式已禁用",
      relaxedModeDisabled: "宽松模式已禁用",
      lenientModeDisabled: "宽容模式已禁用",
      enableStrictMode: "启用严格模式",
      disableStrictMode: "禁用严格模式",
      toggleStrictMode: "切换严格模式",
      currentMode: "当前模式",
      modeChanged: "模式已更改",
      modeChangeFailed: "模式更改失败",
      cannotChangeMode: "无法更改模式",
      modeNotAvailable: "模式不可用",
      modeRestricted: "模式受限制",
      modeLocked: "模式已锁定",
      modeUnlocked: "模式已解锁",
      modeActivated: "模式已激活",
      modeDeactivated: "模式已停用",
      modeSuspended: "模式已暂停",
      modeResumed: "模式已恢复",
      modeTerminated: "模式已终止",
      modeCompleted: "模式已完成",
      modePending: "模式待处理",
      modeProcessing: "模式处理中",
      modeFailed: "模式失败",
      modeSuccess: "模式成功",
      modeWarning: "模式警告",
      modeError: "模式错误",
      modeInfo: "模式信息",
      modeDebug: "模式调试",
      modeTrace: "模式跟踪",
      modeVerbose: "模式详细",
      modeQuiet: "模式安静",
      modeSilent: "模式静默",
      modeNormal: "模式正常",
      languageChanged: "语言已更改",
      languageChangeFailed: "语言更改失败",
      cannotChangeLanguage: "无法更改语言",
      languageNotAvailable: "语言不可用",
      languageRestricted: "语言受限制",
      languageLocked: "语言已锁定",
      languageUnlocked: "语言已解锁",
      languageActivated: "语言已激活",
      languageDeactivated: "语言已停用",
      languageSuspended: "语言已暂停",
      languageResumed: "语言已恢复",
      languageTerminated: "语言已终止",
      languageCompleted: "语言已完成",
      languagePending: "语言待处理",
      languageProcessing: "语言处理中",
      languageFailed: "语言失败",
      languageSuccess: "语言成功",
      languageWarning: "语言警告",
      languageError: "语言错误",
      languageInfo: "语言信息",
      languageDebug: "语言调试",
      languageTrace: "语言跟踪",
      languageVerbose: "语言详细",
      languageQuiet: "语言安静",
      languageSilent: "语言静默",
      languageNormal: "语言正常",
      statusPending: "待开始",
      statusOngoing: "进行中",
      statusFinished: "已结束",
      allDepartments: "全部院系",
      noLogData: "暂无日志数据",
      totalRecords: "共 {total} 条记录",
      year: "年",
      month: "月",
      day: "日",
      saving: "保存中...",
      saveSuccess: "保存成功",
      saveFailed: "保存失败",
      creator: "创建者",
      unknownUser: "未知用户",
      classMembers: "班级成员",
      muted: "已禁言",
      sendFailed: "发送失败",
      enterMessage: "输入消息...",
      justNow: "刚刚",
      minutesAgo: "分钟前",
      hoursAgo: "小时前",
      classMessage: "班级消息",
      systemNotification: "系统通知",
      noClassMessage: "暂无班级消息",
      noSystemNotification: "暂无系统通知",
      noMessage: "暂无消息",
      startExam: "开始考试",
      publishNotice: "发布通知",
      createUser: "创建用户",
      updateUser: "更新用户",
      deleteUser: "删除用户",
      createDepartment: "创建院系",
      updateDepartment: "更新院系",
      deleteDepartment: "删除院系",
      createClass: "创建班级",
      updateClass: "更新班级",
      deleteClass: "删除班级",
      createExam: "创建考试",
      updateExam: "更新考试",
      deleteExam: "删除考试",
      editExam: "编辑考试",
      createExam: "创建考试",
      basicInfo: "基本信息",
      viewAnswer: "查看答案",
      allExams: "全部考试",
      questionCount: "题目数量",
      judgment: "判断题",
      essay: "简答题",
      inviteMembers: "邀请成员",
      importText: "导入文本",
      formatDesc: "格式说明",
      importNote: "导入注意事项",
      pasteQuestionText: "请粘贴题目文本",
      target: "目标",
      create: "创建"
    },
    teacher: {
      enterClassName: "输入班级名称",
      createClass: "创建班级",
      noClasses: "暂无班级，创建您的第一个班级吧",
      examTitle: "考试标题",
      enterExamTitle: "请输入考试标题",
      selectPaper: "选择试卷",
      selectClass: "选择班级",
      examDuration: "考试时长（分钟）",
      duration: "考试时长",
      enterDuration: "请输入考试时长",
      startDate: "开始日期",
      selectDate: "请选择日期",
      startTime: "开始时间",
      selectTime: "请选择时间",
      examSettings: "考试设置",
      passRate: "及格比例",
      default60: "默认60",
      shuffleQuestions: "题目乱序",
      shuffleQuestionsDesc: "开启后题目顺序随机排列",
      shuffleOptions: "选项乱序",
      shuffleOptionsDesc: "开启后选项顺序随机排列",
      leaveDetection: "离开检测",
      leaveDetectionDesc: "检测考试期间离开页面",
      maxLeaveCount: "离开次数上限",
      maxLeaveCountDesc: "超过此次数将自动收卷",
      allowViewAfterExam: "允许考后查看",
      allowViewAfterExamDesc: "考试结束后可查看试卷和答案",
      selectStartTime: "请选择开始时间",
      publishExam: "发布考试",
      inviteMembers: "邀请成员",
      grading: "评分中...",
      pleaseGradeAtLeastOne: "请至少给一道题评分",
      gradeSuccess: "评分成功",
      gradeFailed: "评分失败",
      questionSettings: "题目设置",
      searchQuestion: "搜索题目",
      clearSelection: "清空选择",
      currentSubject: "当前科目",
      batchSetScore: "批量设置分值",
      selectQuestionType: "选择题型",
      scoreHint: "分值",
      applyToSelected: "应用到已选",
      selected: "已选",
      setScore: "设置分值",
      selectAtLeastOneQuestion: "请至少选择一道题目",
      selectSubjectFirst: "请先选择科目",
      subjectNotFound: "关联科目不存在，请重新选择",
      batchSetSuccess: "批量设置成功",
      easy: "简单",
      medium: "中等",
      hard: "困难",
      singleChoice: "单选题",
      multipleChoice: "多选题",
      judgment: "判断题",
      fillBlank: "填空题",
      essay: "简答题",
      programming: "编程题",
      paperManagement: "试卷管理",
      paperManagementDesc: "创建和管理试卷",
      autoGenerate: "自动组卷",
      createPaper: "创建试卷",
      editPaper: "编辑试卷",
      paperTitle: "试卷标题",
      enterPaperTitle: "请输入试卷标题",
      totalScore: "总分",
      passScore: "及格分",
      paperDuration: "考试时长",
      minutes: "分钟",
      preview: "预览",
      publish: "发布",
      confirmPublish: "确定要发布试卷吗？",
      paperPublished: "试卷发布成功",
      confirmDelete: "确定要删除吗？",
      autoCalculate: "自动计算",
      enterDuration: "请输入时长",
      enterPassRate: "请输入及格比例",
      questionCountScore: "题目数量与分值",
      count: "数量",
      perQuestion: "每题",
      scoreUnit: "分",
      generateTip1: "系统将根据您设置的题目数量随机抽取题目生成试卷",
      generateTip2: "请确保各题型的题目数量不超过题库中该题型的题目总数",
      generatePaper: "生成试卷",
      generateResult: "生成结果",
      viewPaper: "查看试卷",
      getPaperInfoFailed: "获取试卷信息失败",
      selectSubject: "选择科目",
      selectQuestionTypeFirst: "请选择题型",
      enterScore: "请输入分值"
    },
    admin: {
      allDepartments: "全部院系"
    },
    login: {
      usernamePlaceholder: "请输入用户名",
      passwordPlaceholder: "请输入密码",
      student: "学生",
      teacher: "教师",
      admin: "管理员"
    },
    register: {
      title: "创建账号",
      subtitle: "选择身份并填写注册信息",
      confirmPasswordPlaceholder: "请确认密码",
      selectDepartment: "请选择学院",
      haveAccount: "已有账号？去登录",
      usernameLength: "用户名长度应为3-20个字符",
      passwordLength: "密码长度应为6-20个字符",
      passwordMismatch: "两次输入密码不一致",
      registerSuccess: "注册成功",
      registerFailed: "注册失败"
    },
    dashboard: {
      welcome: "欢迎回来",
      totalUsers: "总用户数",
      count: "数",
      departmentCount: "院系数",
      classCount: "班级数",
      paperCount: "试卷数",
      questionCount: "题目数",
      examCount: "考试数",
      pendingExams: "待考考试",
      completedExams: "已完成",
      wrongCount: "错题数",
      averageScore: "平均分",
      scoreUnit: "分",
      myClasses: "我的班级",
      myClass: "我的班级",
      examList: "考试列表",
      examHistory: "考试历史",
      systemManagement: "系统管理",
      userManagement: "用户管理",
      departmentManagement: "院系管理",
      classManagement: "班级管理",
      dataStatistics: "数据统计",
      systemLogs: "系统日志",
      recentLogs: "最近操作日志",
      recentExams: "最近考试",
      manageExams: "管理考试",
      upcomingExams: "待考考试",
      allExams: "全部考试",
      enterExam: "进入考试",
      waiting: "等待开始",
      noUpcomingExams: "暂无待考考试",
      scoreAnalysis: "成绩分析",
      examTips: "考试须知",
      tip1: "进入考试后请保持网络畅通",
      tip2: "考试过程中请勿频繁切换页面",
      tip3: "答案会自动保存，但建议手动提交",
      tip4: "考试结束后可查看错题分析",
      subjectManagement: "科目管理",
      questionManagement: "题库管理",
      paperManagement: "试卷管理",
      examManagement: "考试管理",
      minutes: "分钟"
    },
    student: {
      loadingExam: "加载考试中...",
      viewLatest: "查看班级最新动态",
      enterClassCode: "请输入班级群号",
      joinClass: "加入班级",
      noClass: "暂无班级，输入群号加入班级吧",
      joinSuccess: "加入班级成功",
      joinFailed: "加入班级失败",
      loadFailed: "加载班级列表失败",
      pleaseLogin: "请先登录",
      networkError: "网络错误",
      owner: "创建者",
      admin: "管理员",
      member: "成员",
      justNow: "刚刚",
      minutesAgo: "分钟前",
      hoursAgo: "小时前",
      ago: "前",
      examStarted: "开始考试",
      examPublished: "发布通知",
      viewAndJoin: "查看和参加考试",
      searchExam: "搜索考试名称",
      noExams: "暂无考试",
      autoSubmitted: "强制收卷",
      enterExam: "进入考试",
      waiting: "等待开始",
      viewDetail: "查看详情",
      examInProgress: "考试进行中",
      submitExam: "提交考试",
      examNotice: "考试须知",
      timeRemaining: "剩余时间",
      submitSuccess: "提交成功",
      submitFailed: "提交失败",
      confirmSubmit: "确定要提交试卷吗？",
      viewExamHistory: "查看考试历史",
      noHistory: "暂无考试记录",
      submitTime: "交卷时间",
      viewAnalysis: "查看成绩分析",
      totalExams: "总考试数",
      avgScore: "平均分",
      passRate: "通过率",
      subjectScores: "科目成绩",
      exams: "次考试",
      answerStats: "答题情况",
      correctCount: "答对题数",
      wrongCount: "答错题数",
      skippedCount: "未答题数",
      wrongBookDesc: "复习错题，巩固知识",
      allSubjects: "全部科目",
      allStatus: "全部状态",
      notMastered: "未学会",
      mastered: "已学会",
      passRateText: "通过率",
      practiceCount: "练习次数",
      viewAnswer: "查看答案",
      practice: "练习",
      markMastered: "标记已学会",
      markNotMastered: "标记未学会",
      markSuccess: "标记成功",
      pleaseSelectAnswer: "请选择答案",
      practiceSubmitFailed: "练习提交失败",
      singleChoice: "单选题",
      multipleChoice: "多选题",
      judgment: "判断题",
      fillBlank: "填空题",
      essay: "简答题",
      programming: "编程题",
      correctAnswer: "正确答案",
      wrongAnswer: "错误答案",
      analysis: "解析",
      yourAnswer: "你的答案",
      answerCorrect: "回答正确！",
      answerWrong: "回答错误",
      unanswered: "未作答",
      loadingMore: "加载中...",
      noMoreData: "没有更多数据",
      clickLoadMore: "点击加载更多",
      viewExam: "查看考试",
      current: "当前",
      prevQuestion: "上一题",
      nextQuestion: "下一题",
      questionNav: "答题卡"
    },
    account: {
      basicInfo: "基本资料",
      editInfo: "编辑资料",
      realName: "姓名",
      username: "用户名",
      email: "邮箱",
      phone: "手机号",
      avatar: "头像",
      viewAvatar: "查看头像",
      changeAvatar: "更换头像",
      enterRealName: "请输入姓名",
      enterEmail: "请输入邮箱",
      enterPhone: "请输入手机号",
      changePassword: "修改密码",
      currentPassword: "当前密码",
      newPassword: "新密码",
      confirmPassword: "确认密码",
      enterCurrentPassword: "请输入当前密码",
      enterNewPassword: "请输入新密码",
      enterConfirmPassword: "请再次输入新密码",
      passwordChanged: "密码修改成功",
      passwordError: "当前密码错误",
      profileUpdated: "资料更新成功",
      avatarUpdated: "头像更新成功"
    },
    classChat: {
      members: "名成员",
      startTime: "开始时间",
      endTime: "结束时间",
      duration: "时长",
      minutes: "分钟",
      enterExam: "进入考试",
      viewExam: "查看考试",
      enterMessage: "输入消息...",
      send: "发送",
      muted: "你已被禁言",
      classMembers: "班级成员",
      owner: "创建者",
      admin: "管理员",
      member: "成员"
    }
  };
  const en = {
    common: {
      home: "Home",
      login: "Login",
      register: "Register",
      logout: "Logout",
      close: "Close",
      submit: "Submit",
      cancel: "Cancel",
      confirm: "Confirm",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      save: "Save",
      reset: "Reset",
      back: "Back",
      success: "Success",
      failed: "Failed",
      loading: "Loading...",
      noData: "No data",
      confirmDelete: "Are you sure you want to delete?",
      confirmDeleteSubject: "Are you sure you want to delete {name}?",
      confirmFinish: "Are you sure you want to finish the exam?",
      confirmDeleteUser: "Are you sure you want to delete user {username}?",
      tip: "Tip",
      warning: "Warning",
      loginFailed: "Login failed",
      deleteSuccess: "Deleted",
      deleteFailed: "Delete failed",
      updateSuccess: "Updated",
      createSuccess: "Created",
      submitting: "Submitting...",
      pleaseSelectRole: "Please select role",
      all: "All",
      name: "Name",
      code: "Code",
      department: "Department",
      class: "Class",
      user: "User",
      admin: "Admin",
      teacher: "Teacher",
      student: "Student",
      owner: "Owner",
      member: "Member",
      role: "Role",
      username: "Username",
      password: "Password",
      email: "Email",
      phone: "Phone",
      realName: "Real Name",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      pleaseEnter: "Please enter",
      pleaseSelect: "Please select",
      notModifyLeaveEmpty: "Leave empty to keep current",
      per: "per",
      distribution: "Distribution",
      remark: "Remark",
      participation: "Participations",
      exam: "Exam",
      paper: "Paper",
      question: "Question",
      score: "Score",
      time: "Time",
      status: "Status",
      statistics: "Statistics",
      logs: "Logs",
      overview: "Overview",
      view: "View",
      dashboard: "Dashboard",
      account: "Account",
      message: "Message",
      language: "Language",
      chinese: "中文",
      english: "English",
      myClasses: "My Classes",
      classChat: "Class Chat",
      history: "History",
      wrongQuestions: "Wrong Questions",
      examList: "Exam List",
      takeExam: "Take Exam",
      examTake: "Exam",
      viewDetail: "View Detail",
      grade: "Grade",
      monitor: "Monitor",
      examMonitor: "Exam Monitor",
      examStatistics: "Exam Stats",
      examineeStatus: "Status",
      totalPeople: "Total",
      submitted: "Submitted",
      notStarted: "Not Started",
      ongoing: "Ongoing",
      autoSubmitted: "Auto-submitted",
      pending: "Pending",
      finished: "Finished",
      durationMinutes: "min",
      start: "Start",
      studentId: "ID",
      submitTime: "Submit Time",
      unknownSubject: "Unknown",
      manage: "Manage",
      subject: "Subject",
      knowledgePoint: "Knowledge Point",
      paperManage: "Paper Manage",
      paperPreview: "Paper Preview",
      questionManage: "Question Manage",
      subjectManage: "Subject Manage",
      examManage: "Exam Manage",
      examRecord: "Exam Record",
      examRecords: "Exam Records",
      examRecordDetail: "Exam Record Detail",
      viewRecords: "View Records",
      examDetail: "Exam Detail",
      systemLog: "System Log",
      logManage: "Log Management",
      userManage: "User Manage",
      departmentManage: "Department Manage",
      classManage: "Class Manage",
      dataStatistics: "Data Statistics",
      allSubjects: "All Subjects",
      allStatus: "All Status",
      prevQuestion: "Prev",
      nextQuestion: "Next",
      questionNav: "Answer Sheet",
      createAndManage: "Create and Manage Papers",
      createPaper: "Create Paper",
      editPaper: "Edit Paper",
      paperTitle: "Paper Title",
      paperDesc: "Paper Description",
      selectSubjectFirst: "Select Subject",
      examDuration: "Exam Duration",
      questionList: "Question List",
      noQuestions: "No questions, please add",
      confirmAdd: "Confirm Add",
      questionTypeLabel: "Question Type",
      selectQuestionTypeFirst: "Select Question Type",
      publishAndManage: "Publish and Manage Exams",
      publishExam: "Publish Exam",
      published: "Published",
      draft: "Draft",
      totalScore: "Total Score",
      passScore: "Pass Score",
      preview: "Preview",
      questionType: "Question Type",
      questionContent: "Question Content",
      addQuestion: "Add Question",
      editQuestion: "Edit Question",
      selectSubject: "Subject",
      selectQuestionType: "Question Type",
      enterQuestionContent: "Enter question content",
      batchImport: "Batch Import",
      leftCount: "Leave Count",
      maxLeaveCount: "Max Leave Count",
      leaveDetection: "Leave Detection",
      shuffleQuestions: "Shuffle Questions",
      shuffleOptions: "Shuffle Options",
      passRate: "Pass Rate",
      viewAfterExam: "View After Exam",
      duration: "Duration (minutes)",
      startTime: "Start Time",
      endTime: "End Time",
      title: "Title",
      content: "Content",
      options: "Options",
      option: "Option",
      addOption: "Add Option",
      correctAnswer: "Correct Answer",
      enterCorrectAnswer: "Enter correct answer",
      enterScore: "Enter score",
      studentAnswer: "Student Answer",
      referenceAnswer: "Reference",
      notAnswered: "Not Answered",
      current: "Current",
      unanswered: "Unanswered",
      total: "Total",
      type: "Type",
      singleChoice: "Single Choice",
      multipleChoice: "Multiple Choice",
      trueFalse: "True/False",
      fillBlank: "Fill Blank",
      shortAnswer: "Short Answer",
      pending: "Pending",
      ongoing: "Ongoing",
      finished: "Finished",
      submitted: "Submitted",
      notSubmitted: "Not Submitted",
      autoSave: "Auto Save",
      manualSave: "Manual Save",
      submitExam: "Submit Exam",
      timeRemaining: "Time Remaining",
      seconds: "seconds",
      minutes: "minutes",
      hours: "hours",
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      thisMonth: "This Month",
      total: "Total",
      average: "Average",
      count: "Count",
      percent: "Percent",
      date: "Date",
      operation: "Operation",
      method: "Method",
      ip: "IP Address",
      createTime: "Create Time",
      updateTime: "Update Time",
      inviteCode: "Invite Code",
      shareInviteCode: "Share invite code with classmates to join the class",
      viewLatest: "View latest class updates",
      members: "Members",
      messages: "Messages",
      send: "Send",
      join: "Join",
      leave: "Leave",
      upload: "Upload",
      avatar: "Avatar",
      about: "About",
      version: "Version",
      copyright: "Copyright",
      clearCache: "Clear Cache",
      changePassword: "Change Password",
      editProfile: "Edit Profile",
      welcome: "Welcome",
      recentExam: "Recent Exams",
      upcomingExam: "Upcoming Exams",
      completedExam: "Completed Exams",
      examNotice: "Exam Notice",
      logRecent: "Recent Operations",
      viewMore: "View More",
      noMore: "No more",
      page: "Page",
      of: "of",
      goToPage: "Go to page",
      rowsPerPage: "Rows per page",
      prevPage: "Previous",
      nextPage: "Next",
      firstPage: "First",
      lastPage: "Last",
      loginSuccess: "Login successful",
      registerSuccess: "Register successful",
      passwordChanged: "Password changed successfully",
      profileUpdated: "Profile updated successfully",
      pleaseLogin: "Please login first",
      sessionExpired: "Session expired, please login again",
      networkError: "Network error",
      serverError: "Server error",
      notFound: "Not found",
      forbidden: "Access denied",
      examStarted: "Exam has started",
      examFinished: "Exam has finished",
      examNotStarted: "Exam has not started",
      examSubmitted: "Exam submitted",
      leaveWarning: "Leave detected",
      exceedLeaveCount: "Exceeded leave count, exam auto-submitted",
      pleaseAnswerAll: "Please answer all questions before submitting",
      confirmSubmit: "Are you sure you want to submit?",
      questions: "questions",
      savedSuccessfully: "Saved successfully",
      saveFailed: "Save failed",
      loadingMore: "Loading more...",
      pullDownRefresh: "Pull down to refresh",
      releaseRefresh: "Release to refresh",
      refreshing: "Refreshing...",
      enterExam: "Enter Exam",
      viewPaper: "View Paper",
      viewScore: "View Score",
      viewAnalysis: "View Analysis",
      scoreAnalysis: "Score Analysis",
      scored: "Scored",
      currentScore: "Current Score",
      correct: "Correct",
      wrong: "Wrong",
      submitGrade: "Submit Grade",
      practice: "Practice",
      mastered: "Mastered",
      notMastered: "Not Mastered",
      correctRate: "Correct Rate",
      difficulty: "Difficulty",
      frequency: "Error Frequency",
      publish: "Publish",
      unpublish: "Unpublish",
      start: "Start",
      finish: "Finish",
      extend: "Extend",
      extendMinutes: "Extend minutes",
      generate: "Generate",
      import: "Import",
      export: "Export",
      copy: "Copy",
      copied: "Copied",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      invertSelect: "Invert Selection",
      selectedCount: "Selected {count} items",
      batchDelete: "Batch Delete",
      batchOperation: "Batch Operation",
      batchSuccess: "Batch operation successful",
      batchFailed: "Batch operation failed",
      selectDepartment: "Select Department",
      selectQuestionType: "Select Question Type",
      selectRole: "Select Role",
      selectStatus: "Select Status",
      selectDate: "Select Date",
      startDate: "Start Date",
      endDate: "End Date",
      selectTime: "Select Time",
      quickSelect: "Quick Select",
      customRange: "Custom Range",
      searchPlaceholder: "Enter keyword",
      filterPlaceholder: "Select filter",
      resetFilter: "Reset Filter",
      applyFilter: "Apply Filter",
      filterResult: "{count} results",
      sortAsc: "Ascending",
      sortDesc: "Descending",
      sortBy: "Sort by",
      sortByName: "Sort by name",
      sortByTime: "Sort by time",
      sortByCount: "Sort by count",
      sortByScore: "Sort by score",
      ascending: "Ascending",
      descending: "Descending",
      show: "Show",
      hide: "Hide",
      expand: "Expand",
      collapse: "Collapse",
      toggle: "Toggle",
      enable: "Enable",
      disable: "Disable",
      switch: "Switch",
      on: "On",
      off: "Off",
      yes: "Yes",
      no: "No",
      unknown: "Unknown",
      other: "Other",
      pleaseWait: "Please wait",
      processing: "Processing...",
      complete: "Complete",
      cancelProcess: "Cancel",
      confirmCancel: "Are you sure you want to cancel?",
      hasChanges: "You have unsaved changes. Are you sure you want to leave?",
      unsavedChanges: "Unsaved changes",
      discardChanges: "Discard changes",
      saveChanges: "Save changes",
      confirmLogout: "Are you sure you want to logout?",
      confirmClearCache: "Are you sure you want to clear cache? All local data will be deleted.",
      aboutSystem: "About System",
      systemName: "Online Exam System",
      systemDescription: "An online exam system based on Vue + Spring Boot",
      developer: "Developer",
      techStack: "Tech Stack",
      contact: "Contact",
      feedback: "Feedback",
      help: "Help",
      documentation: "Documentation",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      agreement: "User Agreement",
      iAgree: "I agree",
      readAgreement: "I have read and agree",
      mustAgree: "You must agree to continue",
      validateFailed: "Validation failed",
      validateSuccess: "Validation successful",
      checkInput: "Please check input",
      inputError: "Input error",
      inputTooShort: "Input too short",
      inputTooLong: "Input too long",
      inputInvalid: "Invalid input format",
      passwordNotMatch: "Passwords do not match",
      passwordTooWeak: "Password too weak",
      passwordChangedSuccess: "Password changed successfully, please login again",
      profileUpdatedSuccess: "Profile updated successfully",
      avatarUpdatedSuccess: "Avatar updated successfully",
      examCreatedSuccess: "Exam created successfully",
      examUpdatedSuccess: "Exam updated successfully",
      examDeletedSuccess: "Exam deleted successfully",
      examPublishedSuccess: "Exam published successfully",
      examUnpublishedSuccess: "Exam unpublished",
      examExtendedSuccess: "Exam time extended",
      paperCreatedSuccess: "Paper created successfully",
      paperUpdatedSuccess: "Paper updated successfully",
      paperDeletedSuccess: "Paper deleted successfully",
      questionCreatedSuccess: "Question created successfully",
      questionUpdatedSuccess: "Question updated successfully",
      questionDeletedSuccess: "Question deleted successfully",
      questionImportedSuccess: "Questions imported successfully",
      subjectCreatedSuccess: "Subject created successfully",
      subjectUpdatedSuccess: "Subject updated successfully",
      subjectDeletedSuccess: "Subject deleted successfully",
      userCreatedSuccess: "User created successfully",
      userUpdatedSuccess: "User updated successfully",
      userDeletedSuccess: "User deleted successfully",
      departmentCreatedSuccess: "Department created successfully",
      departmentUpdatedSuccess: "Department updated successfully",
      departmentDeletedSuccess: "Department deleted successfully",
      classCreatedSuccess: "Class created successfully",
      classUpdatedSuccess: "Class updated successfully",
      classDeletedSuccess: "Class deleted successfully",
      joinedClassSuccess: "Joined class successfully",
      leftClassSuccess: "Left class successfully",
      messageSentSuccess: "Message sent successfully",
      examStartedSuccess: "Exam started successfully",
      examFinishedSuccess: "Exam finished successfully",
      examSubmittedSuccess: "Exam submitted successfully",
      examGradedSuccess: "Grading successful",
      wrongQuestionCreated: "Wrong question record created",
      wrongQuestionUpdated: "Wrong question record updated",
      wrongQuestionDeleted: "Wrong question record deleted",
      statisticsUpdated: "Statistics updated",
      logsCleared: "Logs cleared",
      cacheCleared: "Cache cleared",
      networkTimeout: "Network timeout",
      connectionFailed: "Connection failed",
      serviceUnavailable: "Service unavailable",
      maintenance: "System maintenance",
      upgrade: "System upgrade",
      comingSoon: "Coming soon",
      underDevelopment: "Under development",
      featureNotAvailable: "Feature not available",
      permissionDenied: "Permission denied",
      needAdmin: "Admin permission required",
      needTeacher: "Teacher permission required",
      needStudent: "Student permission required",
      notInClass: "Not in class",
      classFull: "Class full",
      inviteCodeInvalid: "Invalid invite code",
      inviteCodeExpired: "Invite code expired",
      alreadyInClass: "Already in class",
      examNotFound: "Exam not found",
      paperNotFound: "Paper not found",
      questionNotFound: "Question not found",
      userNotFound: "User not found",
      departmentNotFound: "Department not found",
      classNotFound: "Class not found",
      subjectNotFound: "Subject not found",
      recordNotFound: "Record not found",
      logNotFound: "Log not found",
      wrongQuestionNotFound: "Wrong question not found",
      cannotDelete: "Cannot delete",
      cannotUpdate: "Cannot update",
      cannotCreate: "Cannot create",
      hasChildren: "Has children, cannot delete",
      inUse: "In use, cannot delete",
      examInProgress: "Exam in progress, cannot modify",
      examFinishedCannotEdit: "Exam finished, cannot modify",
      paperInUse: "Paper in use, cannot delete",
      questionInUse: "Question in use, cannot delete",
      subjectInUse: "Subject in use, cannot delete",
      departmentInUse: "Department in use, cannot delete",
      classInUse: "Class in use, cannot delete",
      userInUse: "User in use, cannot delete",
      pleaseFillAll: "Please fill all required fields",
      pleaseFillRequired: "Please fill required fields",
      pleaseSelectRequired: "Please select required fields",
      pleaseUploadRequired: "Please upload required files",
      formatNotSupported: "Format not supported",
      fileTooLarge: "File too large",
      fileTooSmall: "File too small",
      uploadFailed: "Upload failed",
      uploadSuccess: "Upload successful",
      downloading: "Downloading...",
      downloadSuccess: "Download successful",
      downloadFailed: "Download failed",
      exporting: "Exporting...",
      exportSuccess: "Export successful",
      exportFailed: "Export failed",
      importing: "Importing...",
      importSuccess: "Import successful",
      importFailed: "Import failed",
      generating: "Generating...",
      generateSuccess: "Generate successful",
      generateFailed: "Generate failed",
      analyzing: "Analyzing...",
      analysisSuccess: "Analysis successful",
      analysisFailed: "Analysis failed",
      calculating: "Calculating...",
      calculationSuccess: "Calculation successful",
      calculationFailed: "Calculation failed",
      synchronizing: "Synchronizing...",
      syncSuccess: "Sync successful",
      syncFailed: "Sync failed",
      refreshingData: "Refreshing data...",
      refreshSuccess: "Refresh successful",
      refreshFailed: "Refresh failed",
      loadingData: "Loading data...",
      loadSuccess: "Load successful",
      loadFailed: "Load failed",
      savingData: "Saving data...",
      submittingData: "Submitting data...",
      deletingData: "Deleting data...",
      updatingData: "Updating data...",
      creatingData: "Creating data...",
      processingData: "Processing data...",
      validatingData: "Validating data...",
      dataValidated: "Data validated",
      dataValidationFailed: "Data validation failed",
      dataFormatError: "Data format error",
      dataMissing: "Data missing",
      dataDuplicate: "Data duplicate",
      dataConflict: "Data conflict",
      dataOutOfRange: "Data out of range",
      dataNotAllowed: "Data not allowed",
      dataInvalid: "Data invalid",
      connectionEstablished: "Connection established",
      connectionLost: "Connection lost",
      reconnecting: "Reconnecting...",
      reconnected: "Reconnected",
      reconnectFailed: "Reconnect failed",
      offlineMode: "Offline mode",
      onlineMode: "Online mode",
      autoReconnect: "Auto reconnect",
      manualReconnect: "Manual reconnect",
      checkNetwork: "Please check network connection",
      checkServer: "Please check server status",
      checkInternet: "Please check internet connection",
      tryAgainLater: "Please try again later",
      contactSupport: "Please contact support",
      errorOccurred: "An error occurred",
      unknownError: "Unknown error",
      unexpectedError: "Unexpected error",
      systemError: "System error",
      applicationError: "Application error",
      databaseError: "Database error",
      authenticationError: "Authentication error",
      authorizationError: "Authorization error",
      configurationError: "Configuration error",
      initializationError: "Initialization error",
      runtimeError: "Runtime error",
      validationError: "Validation error",
      businessError: "Business error",
      networkErrorRetry: "Network error, please retry",
      serverErrorRetry: "Server error, please retry",
      timeoutRetry: "Request timeout, please retry",
      retry: "Retry",
      retryLater: "Retry later",
      skip: "Skip",
      ignore: "Ignore",
      continue: "Continue",
      abort: "Abort",
      retryCount: "Retry count: {count}",
      maxRetryReached: "Max retry reached",
      pleaseTryAgain: "Please try again",
      pleaseContactAdmin: "Please contact admin",
      pleaseCheckLogs: "Please check logs",
      pleaseReportIssue: "Please report issue",
      thankYou: "Thank you",
      welcomeBack: "Welcome back",
      hello: "Hello",
      goodbye: "Goodbye",
      haveANiceDay: "Have a nice day",
      seeYouLater: "See you later",
      goodLuck: "Good luck",
      congratulations: "Congratulations",
      wellDone: "Well done",
      excellent: "Excellent",
      greatJob: "Great job",
      niceWork: "Nice work",
      thankYouForYourFeedback: "Thank you for your feedback",
      weValueYourFeedback: "We value your feedback",
      yourOpinionMatters: "Your opinion matters",
      pleaseShareYourThoughts: "Please share your thoughts",
      helpUsImprove: "Help us improve",
      stayTuned: "Stay tuned",
      comingSoonMessage: "More exciting features coming soon",
      newFeatures: "New Features",
      improvedFeatures: "Improved Features",
      bugFixes: "Bug Fixes",
      performanceImprovements: "Performance Improvements",
      securityUpdates: "Security Updates",
      stabilityImprovements: "Stability Improvements",
      userExperience: "User Experience",
      interfaceImprovements: "Interface Improvements",
      accessibilityImprovements: "Accessibility Improvements",
      internationalization: "Internationalization",
      localization: "Localization",
      multiLanguage: "Multi-language Support",
      responsiveDesign: "Responsive Design",
      mobileOptimization: "Mobile Optimization",
      tabletOptimization: "Tablet Optimization",
      desktopOptimization: "Desktop Optimization",
      crossPlatform: "Cross-platform Support",
      offlineSupport: "Offline Support",
      realTime: "Real-time Sync",
      cloudSync: "Cloud Sync",
      dataBackup: "Data Backup",
      dataRecovery: "Data Recovery",
      dataExport: "Data Export",
      dataImport: "Data Import",
      dataMigration: "Data Migration",
      dataIntegration: "Data Integration",
      apiIntegration: "API Integration",
      thirdPartyIntegration: "Third-party Integration",
      pluginSupport: "Plugin Support",
      extensibility: "Extensibility",
      customization: "Customization",
      flexibility: "Flexibility",
      scalability: "Scalability",
      reliability: "Reliability",
      availability: "Availability",
      performance: "Performance",
      security: "Security",
      privacy: "Privacy",
      compliance: "Compliance",
      standards: "Standards",
      bestPractices: "Best Practices",
      documentation: "Documentation",
      support: "Support",
      community: "Community",
      openSource: "Open Source",
      contribution: "Contribution",
      license: "License",
      copyrightYear: "2024",
      allRightsReserved: "All rights reserved",
      madeWithLove: "Made with love",
      poweredBy: "Powered by {name}",
      builtWith: "Built with {name}",
      versionInfo: "Version {version}",
      buildNumber: "Build {build}",
      buildDate: "Build Date {date}",
      environment: "Environment: {env}",
      debugMode: "Debug Mode",
      productionMode: "Production Mode",
      developmentMode: "Development Mode",
      stagingMode: "Staging Mode",
      testMode: "Test Mode",
      maintenanceMode: "Maintenance Mode",
      readOnlyMode: "Read-only Mode",
      safeMode: "Safe Mode",
      emergencyMode: "Emergency Mode",
      recoveryMode: "Recovery Mode",
      setupMode: "Setup Mode",
      wizardMode: "Wizard Mode",
      tutorialMode: "Tutorial Mode",
      beginnerMode: "Beginner Mode",
      advancedMode: "Advanced Mode",
      expertMode: "Expert Mode",
      adminMode: "Admin Mode",
      guestMode: "Guest Mode",
      anonymousMode: "Anonymous Mode",
      authenticatedMode: "Authenticated Mode",
      authorizedMode: "Authorized Mode",
      restrictedMode: "Restricted Mode",
      lockedMode: "Locked Mode",
      unlockedMode: "Unlocked Mode",
      activeMode: "Active Mode",
      inactiveMode: "Inactive Mode",
      suspendedMode: "Suspended Mode",
      resumedMode: "Resumed Mode",
      terminatedMode: "Terminated Mode",
      completedMode: "Completed Mode",
      pendingMode: "Pending Mode",
      processingMode: "Processing Mode",
      failedMode: "Failed Mode",
      successMode: "Success Mode",
      warningMode: "Warning Mode",
      errorMode: "Error Mode",
      infoMode: "Info Mode",
      debugModeLabel: "Debug",
      traceMode: "Trace",
      verboseMode: "Verbose",
      quietMode: "Quiet",
      silentMode: "Silent",
      normalMode: "Normal",
      strictMode: "Strict",
      relaxedMode: "Relaxed",
      lenientMode: "Lenient",
      strictValidation: "Strict Validation",
      relaxedValidation: "Relaxed Validation",
      lenientValidation: "Lenient Validation",
      strictParsing: "Strict Parsing",
      relaxedParsing: "Relaxed Parsing",
      lenientParsing: "Lenient Parsing",
      strictFormatting: "Strict Formatting",
      relaxedFormatting: "Relaxed Formatting",
      lenientFormatting: "Lenient Formatting",
      strictChecking: "Strict Checking",
      relaxedChecking: "Relaxed Checking",
      lenientChecking: "Lenient Checking",
      strictModeEnabled: "Strict mode enabled",
      relaxedModeEnabled: "Relaxed mode enabled",
      lenientModeEnabled: "Lenient mode enabled",
      strictModeDisabled: "Strict mode disabled",
      relaxedModeDisabled: "Relaxed mode disabled",
      lenientModeDisabled: "Lenient mode disabled",
      enableStrictMode: "Enable strict mode",
      disableStrictMode: "Disable strict mode",
      toggleStrictMode: "Toggle strict mode",
      currentMode: "Current mode",
      modeChanged: "Mode changed",
      modeChangeFailed: "Mode change failed",
      cannotChangeMode: "Cannot change mode",
      modeNotAvailable: "Mode not available",
      modeRestricted: "Mode restricted",
      modeLocked: "Mode locked",
      modeUnlocked: "Mode unlocked",
      modeActivated: "Mode activated",
      modeDeactivated: "Mode deactivated",
      modeSuspended: "Mode suspended",
      modeResumed: "Mode resumed",
      modeTerminated: "Mode terminated",
      modeCompleted: "Mode completed",
      modePending: "Mode pending",
      modeProcessing: "Mode processing",
      modeFailed: "Mode failed",
      modeSuccess: "Mode success",
      modeWarning: "Mode warning",
      modeError: "Mode error",
      modeInfo: "Mode info",
      modeDebug: "Mode debug",
      modeTrace: "Mode trace",
      modeVerbose: "Mode verbose",
      modeQuiet: "Mode quiet",
      modeSilent: "Mode silent",
      modeNormal: "Mode normal",
      languageChanged: "Language changed",
      languageChangeFailed: "Language change failed",
      cannotChangeLanguage: "Cannot change language",
      languageNotAvailable: "Language not available",
      languageRestricted: "Language restricted",
      languageLocked: "Language locked",
      languageUnlocked: "Language unlocked",
      languageActivated: "Language activated",
      languageDeactivated: "Language deactivated",
      languageSuspended: "Language suspended",
      languageResumed: "Language resumed",
      languageTerminated: "Language terminated",
      languageCompleted: "Language completed",
      languagePending: "Language pending",
      languageProcessing: "Language processing",
      languageFailed: "Language failed",
      languageSuccess: "Language success",
      languageWarning: "Language warning",
      languageError: "Language error",
      languageInfo: "Language info",
      languageDebug: "Language debug",
      languageTrace: "Language trace",
      languageVerbose: "Language verbose",
      languageQuiet: "Language quiet",
      languageSilent: "Language silent",
      languageNormal: "Language normal",
      statusPending: "Pending",
      statusOngoing: "Ongoing",
      statusFinished: "Finished",
      allDepartments: "All Departments",
      noLogData: "No log data",
      totalRecords: "Total {total} records",
      year: "y",
      month: "m",
      day: "d",
      saving: "Saving...",
      saveSuccess: "Saved successfully",
      saveFailed: "Save failed",
      creator: "Creator",
      unknownUser: "Unknown",
      classMembers: "Class Members",
      muted: "Muted",
      sendFailed: "Send failed",
      enterMessage: "Enter message...",
      justNow: "Just now",
      minutesAgo: "m ago",
      hoursAgo: "h ago",
      classMessage: "Class Messages",
      systemNotification: "System Notifications",
      noClassMessage: "No class messages",
      noSystemNotification: "No system notifications",
      noMessage: "No messages",
      startExam: "Exam started",
      publishNotice: "Notice published",
      createUser: "Create User",
      updateUser: "Update User",
      deleteUser: "Delete User",
      createDepartment: "Create Department",
      updateDepartment: "Update Department",
      deleteDepartment: "Delete Department",
      createClass: "Create Class",
      updateClass: "Update Class",
      deleteClass: "Delete Class",
      createExam: "Create Exam",
      updateExam: "Update Exam",
      deleteExam: "Delete Exam",
      editExam: "Edit Exam",
      basicInfo: "Basic Information",
      viewAnswer: "View Answer",
      allExams: "All Exams",
      questionCount: "Question Count",
      judgment: "True/False",
      essay: "Short Answer",
      inviteMembers: "Invite Members",
      importText: "Import Text",
      formatDesc: "Format Description",
      importNote: "Import Note",
      pasteQuestionText: "Paste question text",
      target: "Target",
      create: "Create"
    },
    teacher: {
      enterClassName: "Enter class name",
      createClass: "Create Class",
      noClasses: "No classes yet, create your first class",
      examTitle: "Exam Title",
      enterExamTitle: "Enter exam title",
      selectPaper: "Select Paper",
      selectClass: "Select Class",
      examDuration: "Duration (minutes)",
      duration: "Duration",
      enterDuration: "Enter duration",
      startDate: "Start Date",
      selectDate: "Select date",
      startTime: "Start Time",
      selectTime: "Select time",
      examSettings: "Exam Settings",
      passRate: "Pass Rate",
      default60: "Default 60",
      shuffleQuestions: "Shuffle Questions",
      shuffleQuestionsDesc: "Questions will be randomly ordered",
      shuffleOptions: "Shuffle Options",
      shuffleOptionsDesc: "Options will be randomly ordered",
      leaveDetection: "Leave Detection",
      leaveDetectionDesc: "Detect leaving the exam page",
      maxLeaveCount: "Max Leave Count",
      maxLeaveCountDesc: "Auto-submit after exceeding count",
      allowViewAfterExam: "Allow View After Exam",
      allowViewAfterExamDesc: "View paper and answers after exam",
      selectStartTime: "Select start time",
      publishExam: "Publish Exam",
      inviteMembers: "Invite Members",
      grading: "Grading...",
      pleaseGradeAtLeastOne: "Please grade at least one question",
      gradeSuccess: "Grading successful",
      gradeFailed: "Grading failed",
      questionSettings: "Question Settings",
      searchQuestion: "Search Question",
      clearSelection: "Clear Selection",
      currentSubject: "Current Subject",
      batchSetScore: "Batch Set Score",
      selectQuestionType: "Select Question Type",
      scoreHint: "Score",
      applyToSelected: "Apply to Selected",
      selected: "Selected",
      setScore: "Set Score",
      selectAtLeastOneQuestion: "Please select at least one question",
      selectSubjectFirst: "Select subject first",
      subjectNotFound: "Associated subject not found, please reselect",
      batchSetSuccess: "Batch set successful",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      singleChoice: "Single Choice",
      multipleChoice: "Multiple Choice",
      judgment: "True/False",
      fillBlank: "Fill Blank",
      essay: "Short Answer",
      programming: "Programming",
      paperManagement: "Paper Management",
      paperManagementDesc: "Create and manage papers",
      autoGenerate: "Auto Generate",
      createPaper: "Create Paper",
      editPaper: "Edit Paper",
      paperTitle: "Paper Title",
      enterPaperTitle: "Enter paper title",
      totalScore: "Total Score",
      passScore: "Pass Score",
      paperDuration: "Duration",
      minutes: "mins",
      preview: "Preview",
      publish: "Publish",
      confirmPublish: "Are you sure you want to publish?",
      paperPublished: "Paper published successfully",
      confirmDelete: "Are you sure you want to delete?",
      autoCalculate: "Auto Calculate",
      enterDuration: "Enter duration",
      enterPassRate: "Enter pass rate",
      questionCountScore: "Question Count & Score",
      count: "Count",
      perQuestion: "Per Question",
      scoreUnit: "pts",
      generateTip1: "System will randomly select questions based on your settings",
      generateTip2: "Ensure question count does not exceed available questions in the bank",
      generatePaper: "Generate Paper",
      generateResult: "Generate Result",
      viewPaper: "View Paper",
      getPaperInfoFailed: "Failed to get paper info",
      selectSubject: "Select Subject",
      selectQuestionTypeFirst: "Select question type",
      enterScore: "Enter score"
    },
    admin: {
      allDepartments: "All Departments"
    },
    login: {
      usernamePlaceholder: "Enter username",
      passwordPlaceholder: "Enter password",
      student: "Student",
      teacher: "Teacher",
      admin: "Admin"
    },
    register: {
      title: "Create Account",
      subtitle: "Select role and fill registration information",
      confirmPasswordPlaceholder: "Confirm password",
      selectDepartment: "Select department",
      haveAccount: "Already have an account? Login",
      usernameLength: "Username must be 3-20 characters",
      passwordLength: "Password must be 6-20 characters",
      passwordMismatch: "Passwords do not match",
      registerSuccess: "Registered",
      registerFailed: "Registration failed"
    },
    dashboard: {
      welcome: "Welcome back",
      totalUsers: "Total Users",
      count: "Count",
      departmentCount: "Department Count",
      classCount: "Class Count",
      paperCount: "Paper Count",
      questionCount: "Question Count",
      examCount: "Exam Count",
      pendingExams: "Pending Exams",
      completedExams: "Completed",
      wrongCount: "Wrong Count",
      averageScore: "Average Score",
      scoreUnit: "pts",
      myClasses: "My Classes",
      examList: "Exam List",
      examHistory: "Exam History",
      systemManagement: "System Management",
      userManagement: "User Management",
      departmentManagement: "Department Management",
      classManagement: "Class Management",
      dataStatistics: "Data Statistics",
      systemLogs: "System Logs",
      recentLogs: "Recent Operation Logs",
      recentExams: "Recent Exams",
      manageExams: "Manage Exams",
      upcomingExams: "Upcoming Exams",
      allExams: "All Exams",
      enterExam: "Enter Exam",
      waiting: "Waiting",
      noUpcomingExams: "No upcoming exams",
      scoreAnalysis: "Score Analysis",
      examTips: "Exam Tips",
      tip1: "Keep network stable during exam",
      tip2: "Do not switch pages frequently during exam",
      tip3: "Answers auto-save, but manual submission is recommended",
      tip4: "View wrong answer analysis after exam",
      subjectManagement: "Subject Management",
      questionManagement: "Question Management",
      paperManagement: "Paper Management",
      examManagement: "Exam Management",
      minutes: "mins"
    },
    student: {
      loadingExam: "Loading exam...",
      viewLatest: "View latest class updates",
      enterClassCode: "Enter class code",
      joinClass: "Join Class",
      noClass: "No classes yet, enter code to join",
      joinSuccess: "Joined class successfully",
      joinFailed: "Failed to join class",
      loadFailed: "Failed to load class list",
      pleaseLogin: "Please login first",
      networkError: "Network error",
      owner: "Owner",
      admin: "Admin",
      member: "Member",
      justNow: "Just now",
      minutesAgo: "m ago",
      hoursAgo: "h ago",
      ago: "",
      examStarted: "Exam started",
      examPublished: "Exam published",
      viewAndJoin: "View and join exams",
      searchExam: "Search exam",
      noExams: "No exams",
      autoSubmitted: "Auto-submitted",
      enterExam: "Enter Exam",
      waiting: "Waiting",
      viewDetail: "View Detail",
      examInProgress: "Exam in progress",
      submitExam: "Submit Exam",
      examNotice: "Exam Notice",
      timeRemaining: "Time remaining",
      submitSuccess: "Submitted successfully",
      submitFailed: "Submit failed",
      confirmSubmit: "Are you sure you want to submit?",
      viewExamHistory: "View exam history",
      noHistory: "No exam records",
      submitTime: "Submit time",
      viewAnalysis: "View score analysis",
      totalExams: "Total Exams",
      avgScore: "Average Score",
      passRate: "Pass Rate",
      subjectScores: "Subject Scores",
      exams: " exams",
      answerStats: "Answer Statistics",
      correctCount: "Correct",
      wrongCount: "Wrong",
      skippedCount: "Skipped",
      wrongBookDesc: "Review wrong questions",
      allSubjects: "All Subjects",
      allStatus: "All Status",
      notMastered: "Not Mastered",
      mastered: "Mastered",
      passRateText: "Pass Rate",
      practiceCount: "Practice Count",
      viewAnswer: "View Answer",
      practice: "Practice",
      markMastered: "Mark as Mastered",
      markNotMastered: "Mark as Not Mastered",
      markSuccess: "Marked successfully",
      pleaseSelectAnswer: "Please select answer",
      practiceSubmitFailed: "Practice submit failed",
      singleChoice: "Single Choice",
      multipleChoice: "Multiple Choice",
      judgment: "True/False",
      fillBlank: "Fill Blank",
      essay: "Short Answer",
      programming: "Programming",
      correctAnswer: "Correct Answer",
      wrongAnswer: "Wrong Answer",
      analysis: "Analysis",
      yourAnswer: "Your Answer",
      answerCorrect: "Correct!",
      answerWrong: "Incorrect",
      unanswered: "Not answered",
      loadingMore: "Loading...",
      noMoreData: "No more data",
      clickLoadMore: "Click to load more",
      viewExam: "View Exam",
      current: "Current",
      prevQuestion: "Prev",
      nextQuestion: "Next",
      questionNav: "Answer Sheet"
    },
    account: {
      basicInfo: "Basic Information",
      editInfo: "Edit Profile",
      realName: "Name",
      username: "Username",
      email: "Email",
      phone: "Phone",
      avatar: "Avatar",
      viewAvatar: "View Avatar",
      changeAvatar: "Change Avatar",
      enterRealName: "Enter name",
      enterEmail: "Enter email",
      enterPhone: "Enter phone",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      enterCurrentPassword: "Enter current password",
      enterNewPassword: "Enter new password",
      enterConfirmPassword: "Confirm new password",
      passwordChanged: "Password changed successfully",
      passwordError: "Current password incorrect",
      profileUpdated: "Profile updated successfully",
      avatarUpdated: "Avatar updated successfully"
    },
    classChat: {
      members: " members",
      startTime: "Start Time",
      endTime: "End Time",
      duration: "Duration",
      minutes: " mins",
      enterExam: "Enter Exam",
      viewExam: "View Exam",
      enterMessage: "Enter message...",
      send: "Send",
      muted: "You are muted",
      classMembers: "Class Members",
      owner: "Owner",
      admin: "Admin",
      member: "Member"
    }
  };
  const getLanguage = () => {
    let lang = "zh";
    try {
      lang = uni.getStorageSync("language") || lang;
    } catch (e) {
      try {
        lang = localStorage.getItem("language") || lang;
      } catch (e2) {
        lang = lang;
      }
    }
    return lang;
  };
  const state = vue.reactive({
    userInfo: null,
    token: uni.getStorageSync("token") || "",
    isLoginVerified: false,
    language: getLanguage()
  });
  const store = {
    get userInfo() {
      return state.userInfo;
    },
    set userInfo(value) {
      state.userInfo = value;
    },
    get token() {
      return state.token;
    },
    set token(value) {
      state.token = value;
    },
    get isLoginVerified() {
      return state.isLoginVerified;
    },
    set isLoginVerified(value) {
      state.isLoginVerified = value;
    },
    get language() {
      return state.language;
    },
    get isLoggedIn() {
      return !!state.token && !!state.userInfo;
    },
    get role() {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.role) || "";
    },
    get userId() {
      var _a;
      return ((_a = state.userInfo) == null ? void 0 : _a.userId) || "";
    },
    get currentLang() {
      return state.language;
    },
    get messages() {
      return state.language === "zh" ? zh : en;
    },
    async login(loginData) {
      const { authApi: authApi2 } = await __vitePreload(() => Promise.resolve().then(() => api$1), false ? "__VITE_PRELOAD__" : void 0);
      try {
        const res = await authApi2.login(loginData);
        if (res.code === 200) {
          state.token = res.data.token;
          state.userInfo = res.data;
          state.isLoginVerified = true;
          uni.setStorageSync("token", res.data.token);
          return res.data;
        }
        throw new Error(res.message);
      } catch (error) {
        uni.showToast({
          title: error.message || this.t("common.loginFailed"),
          icon: "none"
        });
        throw error;
      }
    },
    async getUserInfo() {
      if (!state.token)
        return null;
      const { authApi: authApi2 } = await __vitePreload(() => Promise.resolve().then(() => api$1), false ? "__VITE_PRELOAD__" : void 0);
      try {
        const res = await authApi2.getUserInfo();
        if (res.code === 200) {
          state.userInfo = res.data;
          state.isLoginVerified = true;
          return res.data;
        } else {
          this.clearLoginState();
          return null;
        }
      } catch (error) {
        formatAppLog("error", "at store/index.js:106", "获取用户信息失败:", error);
        this.clearLoginState();
        return null;
      }
    },
    async verifyLoginState() {
      if (!state.token) {
        this.clearLoginState();
        return false;
      }
      const { authApi: authApi2 } = await __vitePreload(() => Promise.resolve().then(() => api$1), false ? "__VITE_PRELOAD__" : void 0);
      try {
        const res = await authApi2.getUserInfo();
        if (res.code === 200) {
          state.userInfo = res.data;
          state.isLoginVerified = true;
          return true;
        } else {
          this.clearLoginState();
          return false;
        }
      } catch (error) {
        formatAppLog("error", "at store/index.js:129", "登录状态验证失败:", error);
        this.clearLoginState();
        return false;
      }
    },
    clearLoginState() {
      state.token = "";
      state.userInfo = null;
      state.isLoginVerified = false;
      uni.removeStorageSync("token");
    },
    logout() {
      this.clearLoginState();
      uni.reLaunch({
        url: "/pages/common/login"
      });
    },
    initLoginState() {
      const savedToken = uni.getStorageSync("token");
      if (savedToken) {
        state.token = savedToken;
      }
    },
    changeLanguage(lang) {
      state.language = lang;
      try {
        uni.setStorageSync("language", lang);
      } catch (e) {
        try {
          localStorage.setItem("language", lang);
        } catch (e2) {
          formatAppLog("error", "at store/index.js:164", "Failed to save language");
        }
      }
    },
    t(key) {
      const keys = key.split(".");
      let result = this.messages;
      for (const k of keys) {
        if (result && typeof result === "object") {
          result = result[k];
        } else {
          return key;
        }
      }
      return result || key;
    }
  };
  const useUserStore = () => store;
  const initPageTitle = (titleKey) => {
    const userStore = useUserStore();
    const title = userStore.t(titleKey);
    if (title && title !== titleKey) {
      uni.setNavigationBarTitle({
        title
      });
    }
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$w = {
    __name: "CustomNavBar",
    props: {
      title: {
        type: String,
        default: ""
      },
      showBack: {
        type: Boolean,
        default: false
      }
    },
    setup(__props) {
      const userStore = useUserStore();
      const handleBack = () => {
        uni.navigateBack({
          fail: () => {
            uni.reLaunch({ url: "/pages/common/dashboard" });
          }
        });
      };
      const toggleLanguage2 = () => {
        const newLang = userStore.language === "zh" ? "en" : "zh";
        userStore.changeLanguage(newLang);
      };
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "custom-nav-bar" }, [
          __props.showBack ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "nav-left",
            onClick: handleBack
          }, [
            vue.createElementVNode("text", { class: "nav-back-icon" }, "‹")
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "nav-left"
          })),
          vue.createElementVNode(
            "text",
            { class: "nav-title" },
            vue.toDisplayString(__props.title),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "nav-right" }, [
            vue.createElementVNode("view", {
              class: "nav-lang-switch",
              onClick: toggleLanguage2
            }, [
              vue.createElementVNode(
                "text",
                { class: "nav-lang-text" },
                vue.toDisplayString(vue.unref(userStore).language === "zh" ? "EN" : "中文"),
                1
                /* TEXT */
              )
            ])
          ])
        ]);
      };
    }
  };
  const CustomNavBar = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["__scopeId", "data-v-35f38da3"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/components/CustomNavBar.vue"]]);
  const _sfc_main$v = {
    components: { CustomNavBar },
    setup() {
      const loginType = vue.ref("student");
      const showAdminLogin = vue.ref(false);
      const loading = vue.ref(false);
      const userStore = useUserStore();
      vue.ref(false);
      vue.ref(uni.getStorageSync("serverUrl") || "http://localhost:8081/api");
      const setPageTitle = () => {
        uni.setNavigationBarTitle({ title: userStore.t("common.login") });
      };
      vue.onMounted(() => {
        setPageTitle();
      });
      vue.watch(() => userStore.language, () => {
        setPageTitle();
      });
      const form = vue.reactive({
        username: "",
        password: ""
      });
      const switchLoginType = (type) => {
        if (type === "admin") {
          showAdminLogin.value = true;
        } else {
          showAdminLogin.value = false;
          loginType.value = type;
        }
      };
      const handleLogin = async () => {
        if (!form.username || !form.password) {
          uni.showToast({
            title: userStore.t("login.enterUsernamePassword"),
            icon: "none"
          });
          return;
        }
        loading.value = true;
        try {
          formatAppLog("log", "at pages/common/login.vue:132", "开始登录，用户名:", form.username);
          const result = await userStore.login(form);
          formatAppLog("log", "at pages/common/login.vue:135", "用户信息:", result);
          if (showAdminLogin.value && result.role !== "ADMIN") {
            uni.showToast({
              title: userStore.t("login.adminNotFound"),
              icon: "none"
            });
            return;
          }
          if (!showAdminLogin.value) {
            const expectedRole = loginType.value === "student" ? "STUDENT" : "TEACHER";
            if (result.role !== expectedRole) {
              uni.showToast({
                title: loginType.value === "student" ? userStore.t("login.studentNotFound") : userStore.t("login.teacherNotFound"),
                icon: "none"
              });
              return;
            }
          }
          uni.setStorageSync("userInfo", result);
          uni.showToast({
            title: userStore.t("common.loginSuccess"),
            icon: "success"
          });
          setTimeout(() => {
            uni.reLaunch({
              url: "/pages/common/dashboard"
            });
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/common/login.vue:170", "登录失败详情:", error);
          let errorMsg = userStore.t("common.loginFailed");
          if (error.errMsg && error.errMsg.includes("fail")) {
            errorMsg = userStore.t("common.networkError");
          } else if (error.message) {
            errorMsg = error.message;
          } else if (error.data && error.data.message) {
            errorMsg = error.data.message;
          }
          uni.showToast({
            title: errorMsg,
            icon: "none",
            duration: 3e3
          });
        } finally {
          loading.value = false;
        }
      };
      const goToRegister = () => {
        uni.navigateTo({
          url: "/pages/common/register"
        });
      };
      return {
        loginType,
        showAdminLogin,
        loading,
        form,
        userStore,
        switchLoginType,
        handleLogin,
        goToRegister
      };
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.login"),
        showBack: false
      }, null, 8, ["title"]),
      vue.createCommentVNode(" Logo和标题 "),
      vue.createElementVNode("view", { class: "login-header" }, [
        vue.createElementVNode("text", { class: "title" }, "ExamPro"),
        vue.createElementVNode("image", {
          class: "logo",
          src: "/static/logo.png",
          mode: "aspectFit"
        }),
        vue.createElementVNode(
          "text",
          { class: "subtitle" },
          vue.toDisplayString($setup.userStore.t("common.systemDescription")),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 登录表单 "),
      vue.createElementVNode("view", { class: "login-form" }, [
        vue.createCommentVNode(" 登录类型选择 "),
        vue.createElementVNode("view", { class: "login-tabs" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["login-tab", { active: $setup.loginType === "student" && !$setup.showAdminLogin }]),
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchLoginType("student"))
            },
            [
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString($setup.userStore.t("login.student")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["login-tab", { active: $setup.loginType === "teacher" && !$setup.showAdminLogin }]),
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchLoginType("teacher"))
            },
            [
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString($setup.userStore.t("login.teacher")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["login-tab", { active: $setup.showAdminLogin }]),
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.switchLoginType("admin"))
            },
            [
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString($setup.userStore.t("login.admin")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ]),
        vue.createCommentVNode(" 登录输入 "),
        vue.createElementVNode("view", { class: "form-content" }, [
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "icon" }, "👤"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "input",
              type: "text",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.form.username = $event),
              placeholder: $setup.userStore.t("login.usernamePlaceholder"),
              "placeholder-class": "placeholder"
            }, null, 8, ["placeholder"]), [
              [vue.vModelText, $setup.form.username]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "icon" }, "🔒"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "input",
              type: "password",
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.form.password = $event),
              placeholder: $setup.userStore.t("login.passwordPlaceholder"),
              "placeholder-class": "placeholder"
            }, null, 8, ["placeholder"]), [
              [vue.vModelText, $setup.form.password]
            ])
          ]),
          vue.createElementVNode("button", {
            class: "login-btn",
            disabled: $setup.loading,
            onClick: _cache[5] || (_cache[5] = (...args) => $setup.handleLogin && $setup.handleLogin(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "btn-text" },
              vue.toDisplayString($setup.loading ? $setup.userStore.t("common.loading") : $setup.userStore.t("common.login")),
              1
              /* TEXT */
            )
          ], 8, ["disabled"])
        ]),
        vue.createCommentVNode(" 其他操作 "),
        vue.createElementVNode("view", { class: "action-buttons" }, [
          vue.createElementVNode(
            "text",
            {
              class: "action-link",
              onClick: _cache[6] || (_cache[6] = (...args) => $setup.goToRegister && $setup.goToRegister(...args))
            },
            vue.toDisplayString($setup.userStore.t("common.register")),
            1
            /* TEXT */
          )
        ])
      ])
    ]);
  }
  const PagesCommonLogin = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["render", _sfc_render$b], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/common/login.vue"]]);
  const _sfc_main$u = {
    components: { CustomNavBar },
    setup() {
      const loading = vue.ref(false);
      const departments = vue.ref([]);
      const userStore = useUserStore();
      const setPageTitle = () => {
        uni.setNavigationBarTitle({ title: userStore.t("common.register") });
      };
      vue.onMounted(() => {
        setPageTitle();
        loadDepartments();
      });
      vue.watch(() => userStore.language, () => {
        setPageTitle();
      });
      const registerForm = vue.reactive({
        username: "",
        password: "",
        confirmPassword: "",
        role: "STUDENT",
        departmentId: null
      });
      const selectedDepartmentName = vue.computed(() => {
        if (!registerForm.departmentId)
          return "";
        const dept = departments.value.find((d) => d.id === registerForm.departmentId);
        return (dept == null ? void 0 : dept.name) || "";
      });
      const loadDepartments = async () => {
        try {
          const res = await departmentApi.list({ skipAuth: true });
          if (res.code === 200) {
            departments.value = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/common/register.vue:147", "加载学院列表失败:", e);
        }
      };
      const onDepartmentChange = (e) => {
        const index = e.detail.value;
        if (departments.value[index]) {
          registerForm.departmentId = departments.value[index].id;
        }
      };
      const handleRegister = async () => {
        if (!registerForm.username) {
          uni.showToast({ title: userStore.t("login.usernamePlaceholder"), icon: "none" });
          return;
        }
        if (registerForm.username.length < 3 || registerForm.username.length > 20) {
          uni.showToast({ title: userStore.t("register.usernameLength"), icon: "none" });
          return;
        }
        if (!registerForm.password) {
          uni.showToast({ title: userStore.t("login.passwordPlaceholder"), icon: "none" });
          return;
        }
        if (registerForm.password.length < 6 || registerForm.password.length > 20) {
          uni.showToast({ title: userStore.t("register.passwordLength"), icon: "none" });
          return;
        }
        if (registerForm.password !== registerForm.confirmPassword) {
          uni.showToast({ title: userStore.t("register.passwordMismatch"), icon: "none" });
          return;
        }
        loading.value = true;
        try {
          const res = await authApi.register({
            username: registerForm.username,
            password: registerForm.password,
            role: registerForm.role,
            departmentId: registerForm.departmentId ? Number(registerForm.departmentId) : null
          });
          if (res.code === 200) {
            uni.showToast({ title: userStore.t("register.registerSuccess"), icon: "success" });
            setTimeout(() => {
              backToLogin();
            }, 1500);
          } else {
            uni.showToast({ title: res.message || userStore.t("register.registerFailed"), icon: "none" });
          }
        } catch (e) {
          uni.showToast({ title: e.message || userStore.t("register.registerFailed"), icon: "none" });
        } finally {
          loading.value = false;
        }
      };
      const backToLogin = () => {
        uni.navigateBack();
      };
      vue.onMounted(() => {
        initPageTitle("common.register");
        loadDepartments();
      });
      return {
        loading,
        departments,
        registerForm,
        userStore,
        selectedDepartmentName,
        onDepartmentChange,
        handleRegister,
        backToLogin
      };
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.register"),
        showBack: true
      }, null, 8, ["title"]),
      vue.createCommentVNode(" 标题 "),
      vue.createElementVNode("view", { class: "register-header" }, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($setup.userStore.t("register.title")),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "subtitle" },
          vue.toDisplayString($setup.userStore.t("register.subtitle")),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 注册表单 "),
      vue.createElementVNode("view", { class: "register-form" }, [
        vue.createCommentVNode(" 身份选择 "),
        vue.createElementVNode("view", { class: "role-tabs" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["role-tab", { active: $setup.registerForm.role === "STUDENT" }]),
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.registerForm.role = "STUDENT")
            },
            [
              vue.createElementVNode("text", { class: "emoji-icon" }, "👨‍🎓"),
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString($setup.userStore.t("login.student")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["role-tab", { active: $setup.registerForm.role === "TEACHER" }]),
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.registerForm.role = "TEACHER")
            },
            [
              vue.createElementVNode("text", { class: "emoji-icon" }, "👨‍🏫"),
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString($setup.userStore.t("login.teacher")),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ]),
        vue.createCommentVNode(" 注册输入 "),
        vue.createElementVNode("view", { class: "form-content" }, [
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "emoji-icon" }, "👤"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "input",
              type: "text",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.registerForm.username = $event),
              placeholder: $setup.userStore.t("login.usernamePlaceholder"),
              "placeholder-class": "placeholder"
            }, null, 8, ["placeholder"]), [
              [vue.vModelText, $setup.registerForm.username]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "emoji-icon" }, "🔒"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "input",
              type: "password",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.registerForm.password = $event),
              placeholder: $setup.userStore.t("login.passwordPlaceholder"),
              "placeholder-class": "placeholder"
            }, null, 8, ["placeholder"]), [
              [vue.vModelText, $setup.registerForm.password]
            ])
          ]),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "emoji-icon" }, "🔒"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "input",
              type: "password",
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.registerForm.confirmPassword = $event),
              placeholder: $setup.userStore.t("register.confirmPasswordPlaceholder"),
              "placeholder-class": "placeholder"
            }, null, 8, ["placeholder"]), [
              [vue.vModelText, $setup.registerForm.confirmPassword]
            ])
          ]),
          vue.createCommentVNode(" 学院选择 "),
          vue.createElementVNode("view", { class: "select-group" }, [
            vue.createElementVNode("text", { class: "emoji-icon" }, "🏫"),
            vue.createElementVNode("picker", {
              mode: "selector",
              range: $setup.departments,
              "range-key": "name",
              onChange: _cache[5] || (_cache[5] = (...args) => $setup.onDepartmentChange && $setup.onDepartmentChange(...args))
            }, [
              vue.createElementVNode("view", { class: "picker-content" }, [
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["picker-text", { placeholder: !$setup.registerForm.departmentId }])
                  },
                  vue.toDisplayString($setup.selectedDepartmentName || $setup.userStore.t("register.selectDepartment")),
                  3
                  /* TEXT, CLASS */
                ),
                vue.createElementVNode("text", { class: "arrow-icon" }, "▼")
              ])
            ], 40, ["range"])
          ]),
          vue.createElementVNode("button", {
            class: "register-btn",
            disabled: $setup.loading,
            onClick: _cache[6] || (_cache[6] = (...args) => $setup.handleRegister && $setup.handleRegister(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "btn-text" },
              vue.toDisplayString($setup.loading ? $setup.userStore.t("common.loading") : $setup.userStore.t("common.register")),
              1
              /* TEXT */
            )
          ], 8, ["disabled"])
        ]),
        vue.createCommentVNode(" 返回登录 "),
        vue.createElementVNode("view", { class: "action-buttons" }, [
          vue.createElementVNode(
            "text",
            {
              class: "action-link",
              onClick: _cache[7] || (_cache[7] = (...args) => $setup.backToLogin && $setup.backToLogin(...args))
            },
            vue.toDisplayString($setup.userStore.t("register.haveAccount")),
            1
            /* TEXT */
          )
        ])
      ])
    ]);
  }
  const PagesCommonRegister = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["render", _sfc_render$a], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/common/register.vue"]]);
  const _sfc_main$t = {
    __name: "CustomTabBar",
    setup(__props) {
      const userStore = useUserStore();
      const currentIndex = vue.ref(0);
      const tabs = [
        {
          pagePath: "/pages/common/dashboard",
          text: "首页",
          iconPath: "/static/tabbar/home.png",
          selectedIconPath: "/static/tabbar/home-active.png"
        },
        {
          pagePath: "/pages/common/message",
          text: "消息",
          iconPath: "/static/tabbar/message.png",
          selectedIconPath: "/static/tabbar/message-active.png"
        },
        {
          pagePath: "/pages/common/account",
          text: "我的",
          iconPath: "/static/tabbar/user.png",
          selectedIconPath: "/static/tabbar/user-active.png"
        }
      ];
      const role = vue.computed(() => {
        var _a;
        return ((_a = userStore.userInfo) == null ? void 0 : _a.role) || "";
      });
      const tabList = vue.computed(() => {
        if (role.value === "ADMIN") {
          return tabs.filter((tab) => tab.pagePath !== "/pages/common/message");
        }
        return tabs;
      });
      const switchTab = (index) => {
        const item = tabList.value[index];
        if (item) {
          currentIndex.value = index;
          uni.reLaunch({
            url: item.pagePath
          });
        }
      };
      const updateCurrentIndex = () => {
        const pages = getCurrentPages();
        if (pages.length > 0) {
          const currentPage = pages[pages.length - 1];
          const currentPath = "/" + currentPage.route;
          const index = tabList.value.findIndex((tab) => tab.pagePath === currentPath);
          if (index !== -1) {
            currentIndex.value = index;
          }
        }
      };
      vue.onMounted(() => {
        updateCurrentIndex();
        if (role.value === "ADMIN") {
          const pages = getCurrentPages();
          if (pages.length > 0) {
            const currentPage = pages[pages.length - 1];
            const currentPath = "/" + currentPage.route;
            if (currentPath === "/pages/common/message") {
              setTimeout(() => {
                uni.redirectTo({
                  url: "/pages/common/dashboard"
                });
              }, 500);
            }
          }
        }
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "custom-tab-bar" }, [
          vue.createElementVNode("view", { class: "tab-bar-inner" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(vue.unref(tabList), (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: vue.normalizeClass(["tab-item", { active: currentIndex.value === index }]),
                  onClick: ($event) => switchTab(index)
                }, [
                  vue.createElementVNode("image", {
                    src: currentIndex.value === index ? item.selectedIconPath : item.iconPath,
                    class: "tab-icon",
                    mode: "aspectFit"
                  }, null, 8, ["src"]),
                  vue.createElementVNode(
                    "text",
                    { class: "tab-text" },
                    vue.toDisplayString(item.text),
                    1
                    /* TEXT */
                  )
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "safe-area-bottom" })
        ]);
      };
    }
  };
  const CustomTabBar = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["__scopeId", "data-v-6def6a3b"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/components/CustomTabBar.vue"]]);
  const _sfc_main$s = {
    components: { CustomTabBar, CustomNavBar },
    setup() {
      const userInfo = vue.ref(uni.getStorageSync("userInfo") || {});
      const userStore = useUserStore();
      const toggleLanguage2 = () => {
        const newLang = userStore.language === "zh" ? "en" : "zh";
        userStore.changeLanguage(newLang);
      };
      const setNavBarTitle = () => {
        uni.setNavigationBarTitle({
          title: userStore.t("common.home")
        });
      };
      vue.watch(() => userStore.language, () => {
        setNavBarTitle();
      });
      const displayName = vue.computed(() => {
        const name = userInfo.value.realName;
        const username = userInfo.value.username;
        return name && name.trim() ? name : username;
      });
      const currentDate = vue.computed(() => {
        const now2 = /* @__PURE__ */ new Date();
        const options = { year: "numeric", month: "long", day: "numeric", weekday: "long" };
        return now2.toLocaleDateString(userStore.language === "zh" ? "zh-CN" : "en-US", options);
      });
      const roleText = vue.computed(() => {
        const map = {
          ADMIN: userStore.t("login.admin"),
          TEACHER: userStore.t("login.teacher"),
          STUDENT: userStore.t("login.student")
        };
        return map[userInfo.value.role] || userStore.t("common.user");
      });
      const stats = vue.ref({
        totalUsers: 0,
        studentCount: 0,
        teacherCount: 0,
        departmentCount: 0,
        classCount: 0,
        paperCount: 0,
        questionCount: 0,
        examCount: 0,
        pendingExams: 0,
        completedExams: 0,
        wrongCount: 0,
        averageScore: 0
      });
      const recentExams = vue.ref([]);
      const pendingExams = vue.ref([]);
      const recentLogs = vue.ref([]);
      const statusClass = (status) => {
        const map = { PENDING: "pending", ONGOING: "ongoing", FINISHED: "finished" };
        return map[status] || "";
      };
      const statusText = (status) => {
        const map = {
          PENDING: userStore.t("common.statusPending"),
          ONGOING: userStore.t("common.statusOngoing"),
          FINISHED: userStore.t("common.statusFinished")
        };
        return map[status] || status;
      };
      const goTo = (url) => {
        uni.navigateTo({ url });
      };
      const goToExam = (exam) => {
        if (userInfo.value.role === "STUDENT") {
          uni.navigateTo({
            url: `/pages/student/exam-take?id=${exam.id}`
          });
        } else {
          uni.navigateTo({
            url: `/pages/teacher/exam-manage?id=${exam.id}`
          });
        }
      };
      const loadStats = async () => {
        try {
          const token = uni.getStorageSync("token");
          formatAppLog("log", "at pages/common/dashboard.vue:434", "当前token:", token ? "存在" : "不存在");
          formatAppLog("log", "at pages/common/dashboard.vue:435", "当前用户角色:", userInfo.value.role);
          if (userInfo.value.role === "ADMIN") {
            const res = await statisticsApi.overview();
            formatAppLog("log", "at pages/common/dashboard.vue:439", "ADMIN统计数据:", res);
            if (res.code === 200) {
              stats.value = {
                totalUsers: res.data.totalUsers || 0,
                studentCount: res.data.studentCount || 0,
                teacherCount: res.data.teacherCount || 0,
                departmentCount: res.data.departmentCount || 0
              };
            }
          } else if (userInfo.value.role === "TEACHER") {
            const res = await statisticsApi.teacherStats();
            formatAppLog("log", "at pages/common/dashboard.vue:450", "TEACHER统计数据:", res);
            if (res.code === 200) {
              stats.value = {
                classCount: res.data.classCount || 0,
                paperCount: res.data.paperCount || 0,
                questionCount: res.data.questionCount || 0,
                examCount: res.data.examCount || 0
              };
            }
          } else if (userInfo.value.role === "STUDENT") {
            const res = await examRecordApi.getStudentStats();
            formatAppLog("log", "at pages/common/dashboard.vue:461", "STUDENT统计数据:", res);
            if (res.code === 200) {
              stats.value = {
                pendingExams: res.data.pendingExams || 0,
                completedExams: res.data.completedExams || 0,
                wrongCount: res.data.wrongCount || 0,
                averageScore: res.data.averageScore || 0
              };
            }
          }
        } catch (e) {
          formatAppLog("error", "at pages/common/dashboard.vue:472", "加载统计数据失败:", e);
        }
      };
      const loadRecentExams = async () => {
        try {
          const res = await examApi.page({ current: 1, size: 5 });
          if (res.code === 200) {
            recentExams.value = res.data.records || [];
          }
        } catch (e) {
          formatAppLog("error", "at pages/common/dashboard.vue:483", "加载最近考试失败:", e);
        }
      };
      const loadPendingExams = async () => {
        try {
          const res = await examApi.studentPage({ current: 1, size: 10 });
          if (res.code === 200) {
            const records = res.data.records || [];
            pendingExams.value = records.filter(
              (e) => e.exam && e.exam.status !== "FINISHED" && e.studentStatus !== "SUBMITTED"
            ).map((e) => ({
              ...e.exam,
              studentStatus: e.studentStatus
            }));
          }
        } catch (e) {
          formatAppLog("error", "at pages/common/dashboard.vue:500", "加载待考考试失败:", e);
        }
      };
      const loadLogs = async () => {
        try {
          const res = await logApi.page({ current: 1, size: 10 });
          if (res.code === 200) {
            recentLogs.value = (res.data.records || []).map((log) => ({
              operator: log.username || "-",
              action: log.operation || "-",
              createTime: formatDateTime(log.createTime)
            }));
          }
        } catch (e) {
          formatAppLog("error", "at pages/common/dashboard.vue:515", "加载日志失败:", e);
        }
      };
      const formatDateTime = (dateTime) => {
        if (!dateTime)
          return "-";
        const date = new Date(dateTime);
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        } else {
          return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
        }
      };
      vue.onMounted(async () => {
        if (userInfo.value.role === "ADMIN") {
          uni.hideTabBar();
        }
        setNavBarTitle();
        await loadStats();
        if (userInfo.value.role === "ADMIN") {
          await loadLogs();
        } else if (userInfo.value.role === "TEACHER") {
          await loadRecentExams();
        } else if (userInfo.value.role === "STUDENT") {
          await loadPendingExams();
        }
      });
      return {
        userInfo,
        userStore,
        displayName,
        currentDate,
        roleText,
        stats,
        recentExams,
        pendingExams,
        recentLogs,
        statusClass,
        statusText,
        toggleLanguage: toggleLanguage2,
        goTo,
        goToExam
      };
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    const _component_CustomTabBar = vue.resolveComponent("CustomTabBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "dashboard" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.home"),
        showBack: false
      }, null, 8, ["title"]),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($setup.userStore.t("dashboard.welcome")) + "，" + vue.toDisplayString($setup.displayName),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "subtitle" },
          vue.toDisplayString($setup.roleText) + " | " + vue.toDisplayString($setup.currentDate),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "stats-grid" }, [
        $setup.userInfo.role === "ADMIN" ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 0 },
          [
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[0] || (_cache[0] = ($event) => $setup.goTo("/pages/admin/user-manage"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon admin-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "👥")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.totalUsers),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.totalUsers")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[1] || (_cache[1] = ($event) => $setup.goTo("/pages/admin/user-manage?role=STUDENT"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon admin-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "👨‍🎓")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.studentCount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("login.student")) + vue.toDisplayString($setup.userStore.t("dashboard.count")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.goTo("/pages/admin/user-manage?role=TEACHER"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon admin-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "👨‍🏫")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.teacherCount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("login.teacher")) + vue.toDisplayString($setup.userStore.t("dashboard.count")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[3] || (_cache[3] = ($event) => $setup.goTo("/pages/admin/department-manage"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon admin-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "🏫")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.departmentCount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.departmentCount")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        )) : $setup.userInfo.role === "TEACHER" ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[4] || (_cache[4] = ($event) => $setup.goTo("/pages/teacher/my-classes"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon teacher-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "📚")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.classCount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.classCount")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[5] || (_cache[5] = ($event) => $setup.goTo("/pages/teacher/paper-manage"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon teacher-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "📄")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.paperCount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.paperCount")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[6] || (_cache[6] = ($event) => $setup.goTo("/pages/teacher/question-manage"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon teacher-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "❓")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.questionCount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.questionCount")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[7] || (_cache[7] = ($event) => $setup.goTo("/pages/teacher/exam-manage"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon teacher-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "📅")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.examCount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.examCount")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        )) : $setup.userInfo.role === "STUDENT" ? (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 2 },
          [
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[8] || (_cache[8] = ($event) => $setup.goTo("/pages/student/exam-list"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon student-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "⏰")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.pendingExams),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.pendingExams")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[9] || (_cache[9] = ($event) => $setup.goTo("/pages/student/history"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon student-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "✅")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.completedExams),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.completedExams")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[10] || (_cache[10] = ($event) => $setup.goTo("/pages/student/wrong-questions"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon student-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "❌")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.wrongCount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.wrongCount")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "stat-card",
              onClick: _cache[11] || (_cache[11] = ($event) => $setup.goTo("/pages/student/statistics"))
            }, [
              vue.createElementVNode("view", { class: "stat-icon student-icon" }, [
                vue.createElementVNode("text", { class: "emoji" }, "📊")
              ]),
              vue.createElementVNode("view", { class: "stat-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value" },
                  vue.toDisplayString($setup.stats.averageScore) + vue.toDisplayString($setup.userStore.t("dashboard.scoreUnit")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.averageScore")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ])
          ],
          64
          /* STABLE_FRAGMENT */
        )) : vue.createCommentVNode("v-if", true)
      ]),
      $setup.userInfo.role === "STUDENT" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "card"
      }, [
        vue.createElementVNode("view", {
          class: "nav-item",
          onClick: _cache[12] || (_cache[12] = ($event) => $setup.goTo("/pages/student/my-classes"))
        }, [
          vue.createElementVNode("view", { class: "nav-icon" }, "🏫"),
          vue.createElementVNode(
            "text",
            { class: "nav-text" },
            vue.toDisplayString($setup.userStore.t("dashboard.myClasses")),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "nav-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "nav-item",
          onClick: _cache[13] || (_cache[13] = ($event) => $setup.goTo("/pages/student/exam-list"))
        }, [
          vue.createElementVNode("view", { class: "nav-icon" }, "📋"),
          vue.createElementVNode(
            "text",
            { class: "nav-text" },
            vue.toDisplayString($setup.userStore.t("dashboard.examList")),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "nav-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "nav-item",
          onClick: _cache[14] || (_cache[14] = ($event) => $setup.goTo("/pages/student/history"))
        }, [
          vue.createElementVNode("view", { class: "nav-icon" }, "📝"),
          vue.createElementVNode(
            "text",
            { class: "nav-text" },
            vue.toDisplayString($setup.userStore.t("dashboard.examHistory")),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "nav-arrow" }, "›")
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.userInfo.role === "ADMIN" ? (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("view", { class: "card-header" }, [
              vue.createElementVNode("view", { class: "card-title" }, [
                vue.createElementVNode("text", { class: "card-emoji" }, "⚙️"),
                vue.createElementVNode(
                  "text",
                  { class: "title-text" },
                  vue.toDisplayString($setup.userStore.t("dashboard.systemManagement")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", {
              class: "nav-item",
              onClick: _cache[15] || (_cache[15] = ($event) => $setup.goTo("/pages/admin/user-manage"))
            }, [
              vue.createElementVNode("view", { class: "nav-icon" }, "👥"),
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString($setup.userStore.t("dashboard.userManagement")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "nav-arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "nav-item",
              onClick: _cache[16] || (_cache[16] = ($event) => $setup.goTo("/pages/admin/department-manage"))
            }, [
              vue.createElementVNode("view", { class: "nav-icon" }, "🏫"),
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString($setup.userStore.t("dashboard.departmentManagement")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "nav-arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "nav-item",
              onClick: _cache[17] || (_cache[17] = ($event) => $setup.goTo("/pages/admin/class-manage"))
            }, [
              vue.createElementVNode("view", { class: "nav-icon" }, "📚"),
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString($setup.userStore.t("dashboard.classManagement")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "nav-arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "nav-item",
              onClick: _cache[18] || (_cache[18] = ($event) => $setup.goTo("/pages/admin/statistics"))
            }, [
              vue.createElementVNode("view", { class: "nav-icon" }, "📊"),
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString($setup.userStore.t("dashboard.dataStatistics")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "nav-arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "nav-item",
              onClick: _cache[19] || (_cache[19] = ($event) => $setup.goTo("/pages/admin/log-manage"))
            }, [
              vue.createElementVNode("view", { class: "nav-icon" }, "📋"),
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString($setup.userStore.t("dashboard.systemLogs")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "nav-arrow" }, "›")
            ])
          ]),
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("view", { class: "card-header" }, [
              vue.createElementVNode("view", { class: "card-title" }, [
                vue.createElementVNode("text", { class: "card-emoji" }, "📝"),
                vue.createElementVNode(
                  "text",
                  { class: "title-text" },
                  vue.toDisplayString($setup.userStore.t("dashboard.recentLogs")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "log-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.recentLogs, (log, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "log-item",
                    key: index
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "log-operator" },
                      vue.toDisplayString(log.operator),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "log-action" },
                      vue.toDisplayString(log.action),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "log-time" },
                      vue.toDisplayString(log.createTime),
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $setup.recentLogs.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "empty"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "empty-text" },
                  vue.toDisplayString($setup.userStore.t("common.noData")),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : vue.createCommentVNode("v-if", true),
      $setup.userInfo.role === "TEACHER" ? (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 2 },
        [
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("view", {
              class: "nav-item",
              onClick: _cache[20] || (_cache[20] = ($event) => $setup.goTo("/pages/teacher/my-classes"))
            }, [
              vue.createElementVNode("view", { class: "nav-icon" }, "🏫"),
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString($setup.userStore.t("dashboard.classManagement")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "nav-arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "nav-item",
              onClick: _cache[21] || (_cache[21] = ($event) => $setup.goTo("/pages/teacher/subject-manage"))
            }, [
              vue.createElementVNode("view", { class: "nav-icon" }, "📚"),
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString($setup.userStore.t("dashboard.subjectManagement")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "nav-arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "nav-item",
              onClick: _cache[22] || (_cache[22] = ($event) => $setup.goTo("/pages/teacher/question-manage"))
            }, [
              vue.createElementVNode("view", { class: "nav-icon" }, "❓"),
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString($setup.userStore.t("dashboard.questionManagement")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "nav-arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "nav-item",
              onClick: _cache[23] || (_cache[23] = ($event) => $setup.goTo("/pages/teacher/paper-manage"))
            }, [
              vue.createElementVNode("view", { class: "nav-icon" }, "📄"),
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString($setup.userStore.t("dashboard.paperManagement")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "nav-arrow" }, "›")
            ]),
            vue.createElementVNode("view", {
              class: "nav-item",
              onClick: _cache[24] || (_cache[24] = ($event) => $setup.goTo("/pages/teacher/exam-manage"))
            }, [
              vue.createElementVNode("view", { class: "nav-icon" }, "📅"),
              vue.createElementVNode(
                "text",
                { class: "nav-text" },
                vue.toDisplayString($setup.userStore.t("dashboard.examManagement")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "nav-arrow" }, "›")
            ])
          ]),
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("view", { class: "card-header" }, [
              vue.createElementVNode("view", { class: "card-title" }, [
                vue.createElementVNode("text", { class: "card-emoji" }, "📅"),
                vue.createElementVNode(
                  "text",
                  { class: "title-text" },
                  vue.toDisplayString($setup.userStore.t("dashboard.recentExams")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode(
                "text",
                {
                  class: "card-link",
                  onClick: _cache[25] || (_cache[25] = ($event) => $setup.goTo("/pages/teacher/exam-manage"))
                },
                vue.toDisplayString($setup.userStore.t("dashboard.manageExams")),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "exam-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.recentExams, (exam) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "exam-item",
                    key: exam.id,
                    onClick: ($event) => $setup.goToExam(exam)
                  }, [
                    vue.createElementVNode("view", { class: "exam-info" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "exam-title" },
                        vue.toDisplayString(exam.title),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "exam-meta" },
                        vue.toDisplayString(exam.className) + " | " + vue.toDisplayString(exam.startTime),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["status-tag", $setup.statusClass(exam.status)])
                      },
                      [
                        vue.createElementVNode(
                          "text",
                          { class: "status-text" },
                          vue.toDisplayString($setup.statusText(exam.status)),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    )
                  ], 8, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $setup.recentExams.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "empty"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "empty-text" },
                  vue.toDisplayString($setup.userStore.t("common.noData")),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : vue.createCommentVNode("v-if", true),
      $setup.userInfo.role === "STUDENT" ? (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 3 },
        [
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("view", { class: "card-header" }, [
              vue.createElementVNode("view", { class: "card-title" }, [
                vue.createElementVNode("text", { class: "card-emoji" }, "⏰"),
                vue.createElementVNode(
                  "text",
                  { class: "title-text" },
                  vue.toDisplayString($setup.userStore.t("dashboard.upcomingExams")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode(
                "text",
                {
                  class: "card-link",
                  onClick: _cache[26] || (_cache[26] = ($event) => $setup.goTo("/pages/student/exam-list"))
                },
                vue.toDisplayString($setup.userStore.t("dashboard.allExams")),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "exam-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($setup.pendingExams, (exam) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "exam-item",
                    key: exam.id
                  }, [
                    vue.createElementVNode("view", { class: "exam-info" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "exam-title" },
                        vue.toDisplayString(exam.title),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "exam-meta" },
                        vue.toDisplayString(exam.startTime) + " | " + vue.toDisplayString(exam.duration) + vue.toDisplayString($setup.userStore.t("dashboard.minutes")),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("button", {
                      class: "exam-btn",
                      disabled: exam.status !== "ONGOING",
                      onClick: ($event) => $setup.goToExam(exam)
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "btn-text" },
                        vue.toDisplayString(exam.status === "ONGOING" ? $setup.userStore.t("dashboard.enterExam") : $setup.userStore.t("dashboard.waiting")),
                        1
                        /* TEXT */
                      )
                    ], 8, ["disabled", "onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $setup.pendingExams.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "empty"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "empty-text" },
                  vue.toDisplayString($setup.userStore.t("dashboard.noUpcomingExams")),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          vue.createElementVNode("view", { class: "card tips-card" }, [
            vue.createElementVNode("view", { class: "card-header" }, [
              vue.createElementVNode("view", { class: "card-title" }, [
                vue.createElementVNode("text", { class: "card-emoji" }, "ℹ️"),
                vue.createElementVNode(
                  "text",
                  { class: "title-text" },
                  vue.toDisplayString($setup.userStore.t("dashboard.examTips")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "tips-list" }, [
              vue.createElementVNode("view", { class: "tip-item" }, [
                vue.createElementVNode("text", { class: "tip-number" }, "1."),
                vue.createElementVNode(
                  "text",
                  { class: "tip-text" },
                  vue.toDisplayString($setup.userStore.t("dashboard.tip1")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "tip-item" }, [
                vue.createElementVNode("text", { class: "tip-number" }, "2."),
                vue.createElementVNode(
                  "text",
                  { class: "tip-text" },
                  vue.toDisplayString($setup.userStore.t("dashboard.tip2")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "tip-item" }, [
                vue.createElementVNode("text", { class: "tip-number" }, "3."),
                vue.createElementVNode(
                  "text",
                  { class: "tip-text" },
                  vue.toDisplayString($setup.userStore.t("dashboard.tip3")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "tip-item" }, [
                vue.createElementVNode("text", { class: "tip-number" }, "4."),
                vue.createElementVNode(
                  "text",
                  { class: "tip-text" },
                  vue.toDisplayString($setup.userStore.t("dashboard.tip4")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])
        ],
        64
        /* STABLE_FRAGMENT */
      )) : vue.createCommentVNode("v-if", true),
      vue.createVNode(_component_CustomTabBar)
    ]);
  }
  const PagesCommonDashboard = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$9], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/common/dashboard.vue"]]);
  const _sfc_main$r = {
    components: { CustomTabBar, CustomNavBar },
    setup() {
      const userStore = useUserStore();
      const setPageTitle = () => {
        uni.setNavigationBarTitle({ title: userStore.t("common.message") });
      };
      vue.onMounted(() => {
        const userInfo2 = uni.getStorageSync("userInfo") || {};
        if (userInfo2.role === "ADMIN") {
          uni.hideTabBar();
        }
        setPageTitle();
      });
      vue.watch(() => userStore.language, () => {
        setPageTitle();
      });
      const userInfo = vue.ref(uni.getStorageSync("userInfo") || {});
      const activeTab = vue.ref("class");
      const myClasses = vue.ref([]);
      const systemMessages = vue.ref([]);
      const goToClass = (cls) => {
        const url = userInfo.value.role === "STUDENT" ? `/pages/student/class-chat?id=${cls.id}` : `/pages/teacher/class-chat?id=${cls.id}`;
        uni.navigateTo({ url });
      };
      const getLastMessage = (cls) => {
        if (!cls.lastMessage)
          return userStore.t("common.noMessage");
        if (cls.lastMessage.startsWith("EXAM_NOTICE|")) {
          return parseExamNotice(cls.lastMessage);
        }
        return cls.lastMessage;
      };
      const parseExamNotice = (content) => {
        if (!(content == null ? void 0 : content.startsWith("EXAM_NOTICE|")))
          return "";
        const parts = content.split("|");
        const noticeType = parts[1] || "";
        const title = parts[2] || "";
        if (noticeType === "START") {
          return "🚀 " + title + " " + userStore.t("common.startExam");
        } else if (noticeType === "PUBLISH") {
          return "📢 " + title + " " + userStore.t("common.publishNotice");
        } else if (noticeType === "END") {
          return "🔚 " + title + " " + userStore.t("common.examFinished");
        }
        return "📝 " + title;
      };
      const formatTime = (time) => {
        if (!time)
          return "";
        const date = new Date(time);
        const now2 = /* @__PURE__ */ new Date();
        const diff = now2 - date;
        if (diff < 6e4)
          return userStore.t("common.justNow");
        if (diff < 36e5)
          return Math.floor(diff / 6e4) + userStore.t("common.minutesAgo");
        if (diff < 864e5)
          return Math.floor(diff / 36e5) + userStore.t("common.hoursAgo");
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } else {
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        }
      };
      const loadMyClasses = async () => {
        try {
          const userId = userInfo.value.id || userInfo.value.userId;
          if (!userId)
            return;
          const res = await classApi.getMyClasses(userId);
          if (res.code === 200) {
            myClasses.value = (res.data || []).map((cls) => ({
              ...cls,
              memberCount: cls.memberCount || 0,
              lastMessage: cls.lastMessage || "",
              lastMessageTime: cls.lastMessageTime || ""
            }));
          }
        } catch (e) {
          formatAppLog("error", "at pages/common/message.vue:195", "加载班级失败:", e);
        }
      };
      const loadSystemMessages = async () => {
        systemMessages.value = [];
      };
      vue.onMounted(async () => {
        if (userInfo.value.role === "ADMIN") {
          uni.reLaunch({ url: "/pages/common/dashboard" });
          return;
        }
        await loadMyClasses();
        await loadSystemMessages();
      });
      return {
        userStore,
        userInfo,
        activeTab,
        myClasses,
        systemMessages,
        goToClass,
        getLastMessage,
        formatTime
      };
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    const _component_CustomTabBar = vue.resolveComponent("CustomTabBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "message-page" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.message"),
        showBack: true
      }, null, 8, ["title"]),
      $setup.userInfo.role !== "ADMIN" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "tabs"
      }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === "class" }]),
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.activeTab = "class")
          },
          [
            vue.createElementVNode(
              "text",
              { class: "tab-text" },
              vue.toDisplayString($setup.userStore.t("common.classMessage")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $setup.activeTab === "system" }]),
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.activeTab = "system")
          },
          [
            vue.createElementVNode(
              "text",
              { class: "tab-text" },
              vue.toDisplayString($setup.userStore.t("common.systemNotification")),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("scroll-view", {
        class: "content",
        "scroll-y": ""
      }, [
        $setup.userInfo.role === "ADMIN" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "admin-message"
        }, [
          vue.createElementVNode("view", { class: "admin-icon" }, "⚙️"),
          vue.createElementVNode(
            "text",
            { class: "admin-title" },
            vue.toDisplayString($setup.userStore.t("admin.adminConsole")),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "admin-desc" },
            vue.toDisplayString($setup.userStore.t("admin.adminDesc")),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "admin-actions" }, [
            vue.createElementVNode("view", {
              class: "admin-action-item",
              onClick: _cache[2] || (_cache[2] = ($event) => _ctx.goTo("/pages/admin/log-manage"))
            }, [
              vue.createElementVNode("text", { class: "action-icon" }, "📋"),
              vue.createElementVNode(
                "text",
                { class: "action-text" },
                vue.toDisplayString($setup.userStore.t("common.systemLog")),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "admin-action-item",
              onClick: _cache[3] || (_cache[3] = ($event) => _ctx.goTo("/pages/admin/user-manage"))
            }, [
              vue.createElementVNode("text", { class: "action-icon" }, "👥"),
              vue.createElementVNode(
                "text",
                { class: "action-text" },
                vue.toDisplayString($setup.userStore.t("common.userManage")),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "admin-action-item",
              onClick: _cache[4] || (_cache[4] = ($event) => _ctx.goTo("/pages/admin/statistics"))
            }, [
              vue.createElementVNode("text", { class: "action-icon" }, "📊"),
              vue.createElementVNode(
                "text",
                { class: "action-text" },
                vue.toDisplayString($setup.userStore.t("common.dataStatistics")),
                1
                /* TEXT */
              )
            ])
          ])
        ])) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            $setup.activeTab === "class" ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 0 },
              [
                $setup.myClasses.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "class-list"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.myClasses, (item) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: "class-item",
                        key: item.class.id,
                        onClick: ($event) => $setup.goToClass(item.class)
                      }, [
                        vue.createElementVNode("view", { class: "class-icon" }, [
                          vue.createElementVNode("text", { class: "icon-emoji" }, "🏫")
                        ]),
                        vue.createElementVNode("view", { class: "class-info" }, [
                          vue.createElementVNode("view", { class: "class-header" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "class-name" },
                              vue.toDisplayString(item.class.className),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "class-time" },
                              vue.toDisplayString($setup.formatTime(item.class.lastMessageTime)),
                              1
                              /* TEXT */
                            )
                          ]),
                          vue.createElementVNode(
                            "text",
                            { class: "last-message" },
                            vue.toDisplayString($setup.getLastMessage(item.class)),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "class-arrow" }, [
                          vue.createElementVNode("text", { class: "arrow-icon" }, "›")
                        ])
                      ], 8, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "empty"
                }, [
                  vue.createElementVNode("text", { class: "empty-emoji" }, "📭"),
                  vue.createElementVNode(
                    "text",
                    { class: "empty-text" },
                    vue.toDisplayString($setup.userStore.t("common.noClassMessage")),
                    1
                    /* TEXT */
                  )
                ]))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true),
            $setup.activeTab === "system" ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 1 },
              [
                $setup.systemMessages.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "system-list"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.systemMessages, (msg) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: "system-item",
                        key: msg.id
                      }, [
                        vue.createElementVNode("view", { class: "system-icon" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "icon-emoji" },
                            vue.toDisplayString(msg.type === "EXAM" ? "📝" : "📢"),
                            1
                            /* TEXT */
                          )
                        ]),
                        vue.createElementVNode("view", { class: "system-info" }, [
                          vue.createElementVNode(
                            "text",
                            { class: "system-title" },
                            vue.toDisplayString(msg.title),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "system-content" },
                            vue.toDisplayString(msg.content),
                            1
                            /* TEXT */
                          ),
                          vue.createElementVNode(
                            "text",
                            { class: "system-time" },
                            vue.toDisplayString($setup.formatTime(msg.createTime)),
                            1
                            /* TEXT */
                          )
                        ])
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "empty"
                }, [
                  vue.createElementVNode("text", { class: "empty-emoji" }, "🔔"),
                  vue.createElementVNode(
                    "text",
                    { class: "empty-text" },
                    vue.toDisplayString($setup.userStore.t("common.noSystemNotification")),
                    1
                    /* TEXT */
                  )
                ]))
              ],
              64
              /* STABLE_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true)
          ],
          64
          /* STABLE_FRAGMENT */
        ))
      ]),
      vue.createVNode(_component_CustomTabBar)
    ]);
  }
  const PagesCommonMessage = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$8], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/common/message.vue"]]);
  const _sfc_main$q = {
    components: { CustomTabBar, CustomNavBar },
    setup() {
      const userInfo = vue.ref(uni.getStorageSync("userInfo") || {});
      const userStore = useUserStore();
      const setPageTitle = () => {
        uni.setNavigationBarTitle({ title: userStore.t("common.account") });
      };
      vue.onMounted(() => {
        if (userInfo.value.role === "ADMIN") {
          uni.hideTabBar();
        }
        setPageTitle();
      });
      vue.watch(() => userStore.language, () => {
        setPageTitle();
      });
      const roleText = vue.computed(() => {
        const map = {
          ADMIN: userStore.t("login.admin"),
          TEACHER: userStore.t("login.teacher"),
          STUDENT: userStore.t("login.student")
        };
        return map[userInfo.value.role] || userStore.t("common.user");
      });
      const getAvatarUrl = (avatar) => {
        if (!avatar) {
          const name = userInfo.value.realName || userInfo.value.username || userStore.t("common.user");
          const firstChar = name.charAt(0);
          return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstChar)}&background=dc2626&color=fff&size=100`;
        }
        if (avatar.startsWith("http")) {
          return avatar;
        }
        return "http://192.168.1.92:8081" + avatar;
      };
      const showEditPopup = vue.ref(false);
      const showPasswordPopup = vue.ref(false);
      const showAboutPopup = vue.ref(false);
      const showAvatarMenuVisible = vue.ref(false);
      const showViewAvatar = vue.ref(false);
      const editForm = vue.reactive({
        username: userInfo.value.username || "",
        realName: userInfo.value.realName || "",
        email: userInfo.value.email || "",
        phone: userInfo.value.phone || ""
      });
      const passwordForm = vue.reactive({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      const showEditInfo = () => {
        editForm.username = userInfo.value.username || "";
        editForm.realName = userInfo.value.realName || "";
        editForm.email = userInfo.value.email || "";
        editForm.phone = userInfo.value.phone || "";
        showEditPopup.value = true;
      };
      const closeEditPopup = () => {
        showEditPopup.value = false;
      };
      const showChangePassword = () => {
        showPasswordPopup.value = true;
      };
      const closePasswordPopup = () => {
        passwordForm.oldPassword = "";
        passwordForm.newPassword = "";
        passwordForm.confirmPassword = "";
        showPasswordPopup.value = false;
      };
      const showAbout = () => {
        showAboutPopup.value = true;
      };
      const closeAboutPopup = () => {
        showAboutPopup.value = false;
      };
      const showAvatarMenu = () => {
        showAvatarMenuVisible.value = true;
      };
      const closeAvatarMenu = () => {
        showAvatarMenuVisible.value = false;
      };
      const handleViewAvatar = () => {
        closeAvatarMenu();
        showViewAvatar.value = true;
      };
      const closeViewAvatar = () => {
        showViewAvatar.value = false;
      };
      const handleChangeAvatar = () => {
        closeAvatarMenu();
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            uploadAvatar(tempFilePath);
          },
          fail: () => {
            uni.showToast({ title: userStore.t("common.selectImageFailed"), icon: "none" });
          }
        });
      };
      const uploadAvatar = async (filePath) => {
        uni.showLoading({ title: userStore.t("common.uploading") });
        try {
          const result = await upload$1("/upload/avatar", filePath);
          if (result.code === 200) {
            const avatarUrl = result.data;
            const userId = userInfo.value.userId || userInfo.value.id;
            await userApi.update({
              id: userId,
              avatar: avatarUrl
            });
            userInfo.value.avatar = avatarUrl;
            uni.setStorageSync("userInfo", userInfo.value);
            uni.showToast({ title: userStore.t("common.uploadSuccess"), icon: "success" });
          } else {
            uni.showToast({ title: result.message || userStore.t("common.uploadFailed"), icon: "none" });
          }
        } catch (e) {
          formatAppLog("error", "at pages/common/account.vue:371", e);
          uni.showToast({ title: userStore.t("common.uploadFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const goTo = (url) => {
        uni.navigateTo({ url });
      };
      const saveEditInfo = async () => {
        if (!editForm.realName) {
          uni.showToast({ title: userStore.t("account.enterRealName"), icon: "none" });
          return;
        }
        const userId = userInfo.value.userId || userInfo.value.id;
        if (!userId) {
          uni.showToast({ title: userStore.t("common.userInfoError"), icon: "none" });
          return;
        }
        try {
          const res = await userApi.update({
            id: userId,
            username: editForm.username,
            realName: editForm.realName,
            email: editForm.email,
            phone: editForm.phone
          });
          if (res.code === 200) {
            uni.showToast({ title: userStore.t("common.saveSuccess"), icon: "success" });
            const updatedUserInfo = {
              ...userInfo.value,
              realName: editForm.realName,
              email: editForm.email,
              phone: editForm.phone
            };
            userInfo.value = updatedUserInfo;
            uni.setStorageSync("userInfo", updatedUserInfo);
            closeEditPopup();
          } else {
            uni.showToast({ title: res.message || userStore.t("common.saveFailed"), icon: "none" });
          }
        } catch (e) {
          uni.showToast({ title: e.message || userStore.t("common.saveFailed"), icon: "none" });
        }
      };
      const savePassword = async () => {
        if (!passwordForm.oldPassword) {
          uni.showToast({ title: userStore.t("account.enterCurrentPassword"), icon: "none" });
          return;
        }
        if (!passwordForm.newPassword) {
          uni.showToast({ title: userStore.t("account.enterNewPassword"), icon: "none" });
          return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          uni.showToast({ title: userStore.t("common.passwordMismatch"), icon: "none" });
          return;
        }
        try {
          const res = await authApi.changePassword({
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword
          });
          if (res.code === 200) {
            uni.showToast({ title: userStore.t("common.passwordChanged"), icon: "success" });
            closePasswordPopup();
          } else {
            uni.showToast({ title: res.message || userStore.t("common.updateFailed"), icon: "none" });
          }
        } catch (e) {
          uni.showToast({ title: e.message || userStore.t("common.updateFailed"), icon: "none" });
        }
      };
      const clearCache = () => {
        uni.showModal({
          title: userStore.t("common.tip"),
          content: userStore.t("common.confirmClearCache"),
          success: (res) => {
            if (res.confirm) {
              uni.clearStorage();
              uni.showToast({ title: userStore.t("common.cacheCleared"), icon: "success" });
            }
          }
        });
      };
      const handleLogout = () => {
        uni.showModal({
          title: userStore.t("common.tip"),
          content: userStore.t("common.confirmLogout"),
          success: (res) => {
            if (res.confirm) {
              uni.removeStorageSync("token");
              uni.removeStorageSync("userInfo");
              uni.reLaunch({
                url: "/pages/common/login"
              });
            }
          }
        });
      };
      return {
        userInfo,
        userStore,
        roleText,
        getAvatarUrl,
        showEditPopup,
        showPasswordPopup,
        showAboutPopup,
        showAvatarMenuVisible,
        showViewAvatar,
        editForm,
        passwordForm,
        showEditInfo,
        closeEditPopup,
        showChangePassword,
        closePasswordPopup,
        showAbout,
        closeAboutPopup,
        showAvatarMenu,
        closeAvatarMenu,
        handleViewAvatar,
        closeViewAvatar,
        handleChangeAvatar,
        saveEditInfo,
        savePassword,
        clearCache,
        handleLogout,
        goTo
      };
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    const _component_CustomTabBar = vue.resolveComponent("CustomTabBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "account-page" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.account"),
        showBack: true
      }, null, 8, ["title"]),
      vue.createCommentVNode(" 用户信息头部 "),
      vue.createElementVNode("view", { class: "user-header" }, [
        vue.createElementVNode("view", {
          class: "avatar-box",
          onClick: _cache[0] || (_cache[0] = (...args) => $setup.showAvatarMenu && $setup.showAvatarMenu(...args))
        }, [
          vue.createElementVNode("image", {
            class: "avatar",
            src: $setup.getAvatarUrl($setup.userInfo.avatar),
            mode: "aspectFill"
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "avatar-edit-icon" }, [
            vue.createElementVNode("text", { class: "edit-icon" }, "✎")
          ])
        ]),
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode(
            "text",
            { class: "username" },
            vue.toDisplayString($setup.userInfo.realName || $setup.userInfo.username || $setup.userStore.t("common.user")),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "role" },
            vue.toDisplayString($setup.roleText),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 功能列表 "),
      vue.createElementVNode("view", { class: "menu-list" }, [
        vue.createCommentVNode(" 基本信息 "),
        vue.createElementVNode("view", { class: "menu-group" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[1] || (_cache[1] = (...args) => $setup.showEditInfo && $setup.showEditInfo(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, [
              vue.createElementVNode("text", { class: "emoji-icon" }, "👤")
            ]),
            vue.createElementVNode(
              "text",
              { class: "menu-text" },
              vue.toDisplayString($setup.userStore.t("account.basicInfo")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "menu-arrow" }, [
              vue.createElementVNode("text", { class: "arrow-icon" }, "›")
            ])
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[2] || (_cache[2] = (...args) => $setup.showChangePassword && $setup.showChangePassword(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, [
              vue.createElementVNode("text", { class: "emoji-icon" }, "🔒")
            ]),
            vue.createElementVNode(
              "text",
              { class: "menu-text" },
              vue.toDisplayString($setup.userStore.t("common.changePassword")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "menu-arrow" }, [
              vue.createElementVNode("text", { class: "arrow-icon" }, "›")
            ])
          ])
        ]),
        vue.createCommentVNode(" 学习功能（仅学生） "),
        $setup.userInfo.role === "STUDENT" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "menu-group"
        }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[3] || (_cache[3] = ($event) => $setup.goTo("/pages/student/statistics"))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, [
              vue.createElementVNode("text", { class: "emoji-icon" }, "📊")
            ]),
            vue.createElementVNode(
              "text",
              { class: "menu-text" },
              vue.toDisplayString($setup.userStore.t("common.scoreAnalysis")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "menu-arrow" }, [
              vue.createElementVNode("text", { class: "arrow-icon" }, "›")
            ])
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[4] || (_cache[4] = ($event) => $setup.goTo("/pages/student/wrong-questions"))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, [
              vue.createElementVNode("text", { class: "emoji-icon" }, "❌")
            ]),
            vue.createElementVNode(
              "text",
              { class: "menu-text" },
              vue.toDisplayString($setup.userStore.t("common.wrongQuestions")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "menu-arrow" }, [
              vue.createElementVNode("text", { class: "arrow-icon" }, "›")
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 教师功能（仅教师） "),
        $setup.userInfo.role === "TEACHER" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "menu-group"
        }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[5] || (_cache[5] = ($event) => $setup.goTo("/pages/teacher/exam-record-manage"))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, [
              vue.createElementVNode("text", { class: "emoji-icon" }, "📝")
            ]),
            vue.createElementVNode(
              "text",
              { class: "menu-text" },
              vue.toDisplayString($setup.userStore.t("common.examRecord")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "menu-arrow" }, [
              vue.createElementVNode("text", { class: "arrow-icon" }, "›")
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 其他功能 "),
        vue.createElementVNode("view", { class: "menu-group" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[6] || (_cache[6] = (...args) => $setup.showAbout && $setup.showAbout(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, [
              vue.createElementVNode("text", { class: "emoji-icon" }, "ℹ️")
            ]),
            vue.createElementVNode(
              "text",
              { class: "menu-text" },
              vue.toDisplayString($setup.userStore.t("common.about")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "menu-arrow" }, [
              vue.createElementVNode("text", { class: "arrow-icon" }, "›")
            ])
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[7] || (_cache[7] = (...args) => $setup.clearCache && $setup.clearCache(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, [
              vue.createElementVNode("text", { class: "emoji-icon" }, "🗑️")
            ]),
            vue.createElementVNode(
              "text",
              { class: "menu-text" },
              vue.toDisplayString($setup.userStore.t("common.clearCache")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "menu-arrow" }, [
              vue.createElementVNode("text", { class: "arrow-icon" }, "›")
            ])
          ])
        ]),
        vue.createCommentVNode(" 退出登录 "),
        vue.createElementVNode("view", {
          class: "logout-btn",
          onClick: _cache[8] || (_cache[8] = (...args) => $setup.handleLogout && $setup.handleLogout(...args))
        }, [
          vue.createElementVNode(
            "text",
            { class: "logout-text" },
            vue.toDisplayString($setup.userStore.t("common.logout")),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 编辑信息弹窗 "),
      $setup.showEditPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "popup-mask",
        onClick: _cache[9] || (_cache[9] = (...args) => $setup.closeEditPopup && $setup.closeEditPopup(...args))
      })) : vue.createCommentVNode("v-if", true),
      $setup.showEditPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "popup-bottom"
      }, [
        vue.createElementVNode("view", { class: "popup-content" }, [
          vue.createElementVNode("view", { class: "popup-header" }, [
            vue.createElementVNode(
              "text",
              { class: "popup-title" },
              vue.toDisplayString($setup.userStore.t("account.editInfo")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              {
                class: "popup-close",
                onClick: _cache[10] || (_cache[10] = (...args) => $setup.closeEditPopup && $setup.closeEditPopup(...args))
              },
              vue.toDisplayString($setup.userStore.t("common.close")),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "form-content" }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "label" },
                vue.toDisplayString($setup.userStore.t("account.username")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input",
                  type: "text",
                  "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $setup.editForm.username = $event),
                  disabled: ""
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $setup.editForm.username]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "label" },
                vue.toDisplayString($setup.userStore.t("account.realName")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "input",
                type: "text",
                "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => $setup.editForm.realName = $event),
                placeholder: $setup.userStore.t("account.enterRealName")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.editForm.realName]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "label" },
                vue.toDisplayString($setup.userStore.t("account.email")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "input",
                type: "text",
                "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => $setup.editForm.email = $event),
                placeholder: $setup.userStore.t("account.enterEmail")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.editForm.email]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "label" },
                vue.toDisplayString($setup.userStore.t("account.phone")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "input",
                type: "text",
                "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => $setup.editForm.phone = $event),
                placeholder: $setup.userStore.t("account.enterPhone")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.editForm.phone]
              ])
            ]),
            vue.createElementVNode(
              "button",
              {
                class: "save-btn",
                onClick: _cache[15] || (_cache[15] = (...args) => $setup.saveEditInfo && $setup.saveEditInfo(...args))
              },
              vue.toDisplayString($setup.userStore.t("common.save")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 修改密码弹窗 "),
      $setup.showPasswordPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "popup-mask",
        onClick: _cache[16] || (_cache[16] = (...args) => $setup.closePasswordPopup && $setup.closePasswordPopup(...args))
      })) : vue.createCommentVNode("v-if", true),
      $setup.showPasswordPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "popup-bottom"
      }, [
        vue.createElementVNode("view", { class: "popup-content" }, [
          vue.createElementVNode("view", { class: "popup-header" }, [
            vue.createElementVNode(
              "text",
              { class: "popup-title" },
              vue.toDisplayString($setup.userStore.t("common.changePassword")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              {
                class: "popup-close",
                onClick: _cache[17] || (_cache[17] = (...args) => $setup.closePasswordPopup && $setup.closePasswordPopup(...args))
              },
              vue.toDisplayString($setup.userStore.t("common.close")),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "form-content" }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "label" },
                vue.toDisplayString($setup.userStore.t("account.currentPassword")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "input",
                type: "password",
                "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => $setup.passwordForm.oldPassword = $event),
                placeholder: $setup.userStore.t("account.enterCurrentPassword")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.passwordForm.oldPassword]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "label" },
                vue.toDisplayString($setup.userStore.t("account.newPassword")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "input",
                type: "password",
                "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => $setup.passwordForm.newPassword = $event),
                placeholder: $setup.userStore.t("account.enterNewPassword")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.passwordForm.newPassword]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "label" },
                vue.toDisplayString($setup.userStore.t("account.confirmPassword")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "input",
                type: "password",
                "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => $setup.passwordForm.confirmPassword = $event),
                placeholder: $setup.userStore.t("account.enterConfirmPassword")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.passwordForm.confirmPassword]
              ])
            ]),
            vue.createElementVNode(
              "button",
              {
                class: "save-btn",
                onClick: _cache[21] || (_cache[21] = (...args) => $setup.savePassword && $setup.savePassword(...args))
              },
              vue.toDisplayString($setup.userStore.t("common.save")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 关于弹窗 "),
      $setup.showAboutPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 4,
        class: "popup-mask",
        onClick: _cache[22] || (_cache[22] = (...args) => $setup.closeAboutPopup && $setup.closeAboutPopup(...args))
      })) : vue.createCommentVNode("v-if", true),
      $setup.showAboutPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 5,
        class: "popup-center"
      }, [
        vue.createElementVNode("view", { class: "about-content" }, [
          vue.createElementVNode("image", {
            class: "about-logo",
            src: "/static/logo.png",
            mode: "aspectFit"
          }),
          vue.createElementVNode("text", { class: "about-title" }, "ExamPro"),
          vue.createElementVNode(
            "text",
            { class: "about-version" },
            vue.toDisplayString($setup.userStore.t("common.version")) + " 1.0.0",
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "about-desc" },
            vue.toDisplayString($setup.userStore.t("common.aboutDesc")),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "about-copy" }, "© 2024 ExamPro Team"),
          vue.createElementVNode(
            "button",
            {
              class: "about-close-btn",
              onClick: _cache[23] || (_cache[23] = (...args) => $setup.closeAboutPopup && $setup.closeAboutPopup(...args))
            },
            vue.toDisplayString($setup.userStore.t("common.confirm")),
            1
            /* TEXT */
          )
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 头像操作菜单 "),
      $setup.showAvatarMenuVisible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 6,
        class: "popup-mask",
        onClick: _cache[24] || (_cache[24] = (...args) => $setup.closeAvatarMenu && $setup.closeAvatarMenu(...args))
      })) : vue.createCommentVNode("v-if", true),
      $setup.showAvatarMenuVisible ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 7,
        class: "avatar-menu-popup"
      }, [
        vue.createElementVNode("view", { class: "avatar-menu-content" }, [
          vue.createElementVNode("view", {
            class: "avatar-menu-item",
            onClick: _cache[25] || (_cache[25] = (...args) => $setup.handleViewAvatar && $setup.handleViewAvatar(...args))
          }, [
            vue.createElementVNode("text", { class: "menu-item-icon" }, "👁️"),
            vue.createElementVNode(
              "text",
              { class: "menu-item-text" },
              vue.toDisplayString($setup.userStore.t("account.viewAvatar")),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", {
            class: "avatar-menu-item",
            onClick: _cache[26] || (_cache[26] = (...args) => $setup.handleChangeAvatar && $setup.handleChangeAvatar(...args))
          }, [
            vue.createElementVNode("text", { class: "menu-item-icon" }, "📷"),
            vue.createElementVNode(
              "text",
              { class: "menu-item-text" },
              vue.toDisplayString($setup.userStore.t("account.changeAvatar")),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", {
            class: "avatar-menu-cancel",
            onClick: _cache[27] || (_cache[27] = (...args) => $setup.closeAvatarMenu && $setup.closeAvatarMenu(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "menu-cancel-text" },
              vue.toDisplayString($setup.userStore.t("common.cancel")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 查看头像弹窗 "),
      $setup.showViewAvatar ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 8,
        class: "popup-mask",
        onClick: _cache[28] || (_cache[28] = (...args) => $setup.closeViewAvatar && $setup.closeViewAvatar(...args))
      })) : vue.createCommentVNode("v-if", true),
      $setup.showViewAvatar ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 9,
        class: "view-avatar-popup"
      }, [
        vue.createElementVNode("image", {
          class: "view-avatar-img",
          src: $setup.getAvatarUrl($setup.userInfo.avatar),
          mode: "aspectFit",
          onClick: _cache[29] || (_cache[29] = vue.withModifiers(() => {
          }, ["stop"]))
        }, null, 8, ["src"]),
        vue.createElementVNode("text", {
          class: "view-avatar-close",
          onClick: _cache[30] || (_cache[30] = (...args) => $setup.closeViewAvatar && $setup.closeViewAvatar(...args))
        }, "✕")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createVNode(_component_CustomTabBar)
    ]);
  }
  const PagesCommonAccount = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["render", _sfc_render$7], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/common/account.vue"]]);
  const _sfc_main$p = {
    components: { CustomNavBar },
    setup() {
      const userStore = useUserStore();
      const keyword = vue.ref("");
      const userList = vue.ref([]);
      const total = vue.ref(0);
      const selectedRole = vue.ref("");
      const showPopup = vue.ref(false);
      const editingUser = vue.ref(null);
      const roleOptions = vue.computed(() => [
        { value: "", label: userStore.t("common.all") + userStore.t("common.role") },
        { value: "ADMIN", label: userStore.t("common.admin") },
        { value: "TEACHER", label: userStore.t("common.teacher") },
        { value: "STUDENT", label: userStore.t("common.student") }
      ]);
      const formRoleOptions = vue.computed(() => [
        { value: "ADMIN", label: userStore.t("common.admin") },
        { value: "TEACHER", label: userStore.t("common.teacher") },
        { value: "STUDENT", label: userStore.t("common.student") }
      ]);
      const selectedRoleText = vue.computed(() => {
        const role = roleOptions.value.find((r) => r.value === selectedRole.value);
        return (role == null ? void 0 : role.label) || "";
      });
      const form = vue.reactive({
        id: null,
        username: "",
        realName: "",
        password: "",
        role: "STUDENT",
        email: "",
        phone: ""
      });
      const getRoleText = (role) => {
        const map = { ADMIN: userStore.t("common.admin"), TEACHER: userStore.t("common.teacher"), STUDENT: userStore.t("common.student") };
        return map[role] || role;
      };
      const getAvatarUrl = (avatar) => {
        if (!avatar)
          return "/static/default-avatar.png";
        if (avatar.startsWith("http"))
          return avatar;
        return "http://192.168.1.92:8081" + avatar;
      };
      const onRoleChange = (e) => {
        const index = e.detail.value;
        selectedRole.value = roleOptions[index].value;
        loadData();
      };
      const onFormRoleChange = (e) => {
        form.role = formRoleOptions[e.detail.value].value;
      };
      const loadData = async () => {
        try {
          uni.showLoading({ title: userStore.t("common.loading") });
          const res = await userApi.page({
            current: 1,
            size: 20,
            keyword: keyword.value,
            role: selectedRole.value || void 0
          });
          if (res.code === 200) {
            userList.value = res.data.records || [];
            total.value = res.data.total || 0;
          }
        } catch (e) {
          uni.showToast({ title: userStore.t("common.loadFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const addUser = () => {
        editingUser.value = null;
        form.id = null;
        form.username = "";
        form.realName = "";
        form.password = "";
        form.role = "STUDENT";
        form.email = "";
        form.phone = "";
        showPopup.value = true;
      };
      const editUser = (user) => {
        editingUser.value = user;
        form.id = user.id;
        form.username = user.username || "";
        form.realName = user.realName || "";
        form.password = "";
        form.role = user.role || "STUDENT";
        form.email = user.email || "";
        form.phone = user.phone || "";
        showPopup.value = true;
      };
      const deleteUser = async (user) => {
        uni.showModal({
          title: userStore.t("common.tip"),
          content: userStore.t("common.confirmDeleteUser").replace("{username}", user.username),
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await userApi.delete(user.id);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.deleteSuccess"), icon: "success" });
                  loadData();
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.deleteFailed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.deleteFailed"), icon: "none" });
              }
            }
          }
        });
      };
      const submitForm = async () => {
        if (!form.username.trim()) {
          uni.showToast({ title: userStore.t("login.usernamePlaceholder"), icon: "none" });
          return;
        }
        if (!form.role) {
          uni.showToast({ title: userStore.t("common.pleaseSelectRole"), icon: "none" });
          return;
        }
        if (!editingUser.value && !form.password.trim()) {
          uni.showToast({ title: userStore.t("login.passwordPlaceholder"), icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: userStore.t("common.submitting") });
          const data = { ...form };
          if (!data.password)
            delete data.password;
          let result;
          if (editingUser.value) {
            result = await userApi.update(data);
          } else {
            result = await userApi.create(data);
          }
          if (result.code === 200) {
            uni.showToast({ title: editingUser.value ? userStore.t("common.updateSuccess") : userStore.t("common.createSuccess"), icon: "success" });
            showPopup.value = false;
            loadData();
          } else {
            uni.showToast({ title: result.message || userStore.t("common.failed"), icon: "none" });
          }
        } catch (e) {
          uni.showToast({ title: userStore.t("common.failed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      vue.onMounted(() => {
        loadData();
      });
      return {
        userStore,
        keyword,
        userList,
        total,
        selectedRoleText,
        roleOptions,
        showPopup,
        editingUser,
        form,
        getRoleText,
        getAvatarUrl,
        onRoleChange,
        onFormRoleChange,
        loadData,
        addUser,
        editUser,
        deleteUser,
        submitForm,
        toggleLanguage
      };
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "manage-page" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.userManage"),
        showBack: true
      }, null, 8, ["title"]),
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.createElementVNode("picker", {
          mode: "selector",
          range: $setup.roleOptions,
          "range-key": "label",
          onChange: _cache[0] || (_cache[0] = (...args) => $setup.onRoleChange && $setup.onRoleChange(...args))
        }, [
          vue.createElementVNode("view", { class: "picker" }, [
            vue.createElementVNode(
              "text",
              { class: "picker-text" },
              vue.toDisplayString($setup.selectedRoleText || $setup.userStore.t("common.all") + $setup.userStore.t("common.role")),
              1
              /* TEXT */
            )
          ])
        ], 40, ["range"]),
        vue.withDirectives(vue.createElementVNode("input", {
          class: "search-input",
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.keyword = $event),
          placeholder: $setup.userStore.t("common.searchPlaceholder"),
          onInput: _cache[2] || (_cache[2] = (...args) => _ctx.onSearchInput && _ctx.onSearchInput(...args))
        }, null, 40, ["placeholder"]), [
          [vue.vModelText, $setup.keyword]
        ]),
        vue.createElementVNode(
          "button",
          {
            class: "search-btn",
            onClick: _cache[3] || (_cache[3] = (...args) => $setup.loadData && $setup.loadData(...args))
          },
          vue.toDisplayString($setup.userStore.t("common.search")),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "user-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.userList, (user) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "user-item",
              key: user.id
            }, [
              vue.createElementVNode("view", { class: "user-info" }, [
                vue.createElementVNode("image", {
                  class: "user-avatar",
                  src: $setup.getAvatarUrl(user.avatar),
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "user-detail" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "username" },
                    vue.toDisplayString(user.username),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "user-meta" },
                    vue.toDisplayString(user.realName || "-") + " | " + vue.toDisplayString($setup.getRoleText(user.role)),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "user-actions" }, [
                vue.createElementVNode("text", {
                  class: "action-btn",
                  onClick: ($event) => $setup.editUser(user)
                }, vue.toDisplayString($setup.userStore.t("common.edit")), 9, ["onClick"]),
                vue.createElementVNode("text", {
                  class: "action-btn danger",
                  onClick: ($event) => $setup.deleteUser(user)
                }, vue.toDisplayString($setup.userStore.t("common.delete")), 9, ["onClick"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.userList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, [
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            vue.toDisplayString($setup.userStore.t("common.noData")),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "pagination" }, [
        vue.createElementVNode(
          "text",
          { class: "page-info" },
          vue.toDisplayString($setup.userStore.t("common.total")) + " " + vue.toDisplayString($setup.total) + " " + vue.toDisplayString($setup.userStore.t("common.count")),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", {
        class: "add-btn",
        onClick: _cache[4] || (_cache[4] = (...args) => $setup.addUser && $setup.addUser(...args))
      }, [
        vue.createElementVNode("text", { class: "add-icon" }, "+"),
        vue.createElementVNode(
          "text",
          { class: "add-text" },
          vue.toDisplayString($setup.userStore.t("common.add")) + vue.toDisplayString($setup.userStore.t("common.user")),
          1
          /* TEXT */
        )
      ]),
      $setup.showPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal",
        onClick: _cache[15] || (_cache[15] = ($event) => $setup.showPopup = false)
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[14] || (_cache[14] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString($setup.editingUser ? $setup.userStore.t("common.edit") + $setup.userStore.t("common.user") : $setup.userStore.t("common.add") + $setup.userStore.t("common.user")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "modal-close",
              onClick: _cache[5] || (_cache[5] = ($event) => $setup.showPopup = false)
            }, [
              vue.createElementVNode("text", { class: "close-icon" }, "×")
            ])
          ]),
          vue.createElementVNode("view", { class: "form-content" }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.username")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.form.username = $event),
                placeholder: $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.username")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.username]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.realName")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.form.realName = $event),
                placeholder: $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.realName")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.realName]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.password")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $setup.form.password = $event),
                type: "password",
                placeholder: $setup.editingUser ? $setup.userStore.t("common.notModifyLeaveEmpty") : $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.password")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.password]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.role")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("picker", {
                mode: "selector",
                range: _ctx.formRoleOptions,
                "range-key": "label",
                onChange: _cache[9] || (_cache[9] = (...args) => $setup.onFormRoleChange && $setup.onFormRoleChange(...args))
              }, [
                vue.createElementVNode("view", { class: "form-picker" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($setup.getRoleText($setup.form.role) || $setup.userStore.t("common.pleaseSelect") + $setup.userStore.t("common.role")),
                    1
                    /* TEXT */
                  )
                ])
              ], 40, ["range"])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.email")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $setup.form.email = $event),
                placeholder: $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.email")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.email]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.phone")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $setup.form.phone = $event),
                placeholder: $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.phone")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.phone]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode(
              "button",
              {
                class: "btn-cancel",
                onClick: _cache[12] || (_cache[12] = ($event) => $setup.showPopup = false)
              },
              vue.toDisplayString($setup.userStore.t("common.cancel")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "button",
              {
                class: "btn-confirm",
                onClick: _cache[13] || (_cache[13] = (...args) => $setup.submitForm && $setup.submitForm(...args))
              },
              vue.toDisplayString($setup.userStore.t("common.confirm")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesAdminUserManage = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["render", _sfc_render$6], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/admin/user-manage.vue"]]);
  const _sfc_main$o = {
    components: { CustomNavBar },
    setup() {
      const userStore = useUserStore();
      const keyword = vue.ref("");
      const deptList = vue.ref([]);
      const showPopup = vue.ref(false);
      const editingDept = vue.ref(null);
      const form = vue.reactive({
        id: null,
        name: "",
        code: ""
      });
      const loadData = async () => {
        try {
          uni.showLoading({ title: userStore.t("common.loading") });
          let res;
          if (keyword.value.trim()) {
            res = await departmentApi.list({ skipRedirect: true });
            if (res.code === 200) {
              deptList.value = res.data.filter(
                (d) => d.name.includes(keyword.value) || d.code.includes(keyword.value)
              );
            } else {
              deptList.value = [];
              uni.showToast({ title: res.message || userStore.t("common.loadFailed"), icon: "none" });
            }
          } else {
            res = await departmentApi.list({ skipRedirect: true });
            if (res.code === 200) {
              deptList.value = res.data;
            } else {
              deptList.value = [];
              uni.showToast({ title: res.message || userStore.t("common.loadFailed"), icon: "none" });
            }
          }
        } catch (e) {
          deptList.value = [];
          uni.showToast({ title: userStore.t("common.loadFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const addDept = () => {
        editingDept.value = null;
        form.id = null;
        form.name = "";
        form.code = "";
        showPopup.value = true;
      };
      const editDept = (dept) => {
        editingDept.value = dept;
        form.id = dept.id;
        form.name = dept.name || "";
        form.code = dept.code || "";
        showPopup.value = true;
      };
      const deleteDept = async (dept) => {
        uni.showModal({
          title: userStore.t("common.tip"),
          content: userStore.t("common.confirmDelete") + ` ${dept.name}?`,
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await departmentApi.delete(dept.id);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.success"), icon: "success" });
                  loadData();
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.failed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.failed"), icon: "none" });
              }
            }
          }
        });
      };
      const submitForm = async () => {
        if (!form.name.trim()) {
          uni.showToast({ title: userStore.t("common.pleaseEnter") + userStore.t("common.name"), icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: userStore.t("common.processing") });
          const data = { ...form };
          let result;
          if (editingDept.value) {
            result = await departmentApi.update(data);
          } else {
            result = await departmentApi.create(data);
          }
          if (result.code === 200) {
            uni.showToast({ title: userStore.t("common.success"), icon: "success" });
            showPopup.value = false;
            loadData();
          } else {
            uni.showToast({ title: result.message || userStore.t("common.failed"), icon: "none" });
          }
        } catch (e) {
          uni.showToast({ title: userStore.t("common.failed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const setPageTitle = () => {
        uni.setNavigationBarTitle({
          title: userStore.t("common.departmentManage")
        });
      };
      vue.onMounted(() => {
        loadData();
        setPageTitle();
      });
      vue.watch(() => userStore.language, () => {
        setPageTitle();
      });
      return {
        userStore,
        keyword,
        deptList,
        showPopup,
        editingDept,
        form,
        loadData,
        addDept,
        editDept,
        deleteDept,
        submitForm,
        toggleLanguage
      };
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "manage-page" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.departmentManage"),
        showBack: true
      }, null, 8, ["title"]),
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.withDirectives(vue.createElementVNode("input", {
          class: "search-input",
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.keyword = $event),
          placeholder: $setup.userStore.t("common.searchPlaceholder"),
          onInput: _cache[1] || (_cache[1] = (...args) => _ctx.onSearchInput && _ctx.onSearchInput(...args))
        }, null, 40, ["placeholder"]), [
          [vue.vModelText, $setup.keyword]
        ]),
        vue.createElementVNode(
          "button",
          {
            class: "search-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $setup.loadData && $setup.loadData(...args))
          },
          vue.toDisplayString($setup.userStore.t("common.search")),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "dept-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.deptList, (dept) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "dept-item",
              key: dept.id
            }, [
              vue.createElementVNode("view", { class: "dept-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "dept-name" },
                  vue.toDisplayString(dept.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "dept-code" },
                  vue.toDisplayString(dept.code || "-"),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "dept-actions" }, [
                vue.createElementVNode("text", {
                  class: "action-btn",
                  onClick: ($event) => $setup.editDept(dept)
                }, vue.toDisplayString($setup.userStore.t("common.edit")), 9, ["onClick"]),
                vue.createElementVNode("text", {
                  class: "action-btn danger",
                  onClick: ($event) => $setup.deleteDept(dept)
                }, vue.toDisplayString($setup.userStore.t("common.delete")), 9, ["onClick"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.deptList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, [
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            vue.toDisplayString($setup.userStore.t("common.noData")),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", {
        class: "add-btn",
        onClick: _cache[3] || (_cache[3] = (...args) => $setup.addDept && $setup.addDept(...args))
      }, [
        vue.createElementVNode("text", { class: "add-icon" }, "+"),
        vue.createElementVNode(
          "text",
          { class: "add-text" },
          vue.toDisplayString($setup.userStore.t("common.add")) + vue.toDisplayString($setup.userStore.t("common.department")),
          1
          /* TEXT */
        )
      ]),
      $setup.showPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal",
        onClick: _cache[10] || (_cache[10] = ($event) => $setup.showPopup = false)
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[9] || (_cache[9] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString($setup.editingDept ? $setup.userStore.t("common.edit") + $setup.userStore.t("common.department") : $setup.userStore.t("common.add") + $setup.userStore.t("common.department")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "modal-close",
              onClick: _cache[4] || (_cache[4] = ($event) => $setup.showPopup = false)
            }, [
              vue.createElementVNode("text", { class: "close-icon" }, "×")
            ])
          ]),
          vue.createElementVNode("view", { class: "form-content" }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.name")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.form.name = $event),
                placeholder: $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.name")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.name]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.code")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.form.code = $event),
                placeholder: $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.code")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.code]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode(
              "button",
              {
                class: "btn-cancel",
                onClick: _cache[7] || (_cache[7] = ($event) => $setup.showPopup = false)
              },
              vue.toDisplayString($setup.userStore.t("common.cancel")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "button",
              {
                class: "btn-confirm",
                onClick: _cache[8] || (_cache[8] = (...args) => $setup.submitForm && $setup.submitForm(...args))
              },
              vue.toDisplayString($setup.userStore.t("common.confirm")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesAdminDepartmentManage = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["render", _sfc_render$5], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/admin/department-manage.vue"]]);
  const _sfc_main$n = {
    components: { CustomNavBar },
    setup() {
      const userStore = useUserStore();
      const keyword = vue.ref("");
      const classList = vue.ref([]);
      const departments = vue.ref([]);
      const selectedDeptId = vue.ref(null);
      const showPopup = vue.ref(false);
      const editingClass = vue.ref(null);
      const deptOptions = vue.computed(() => {
        return [{ id: null, name: userStore.t("common.allDepartments") }, ...departments.value];
      });
      const selectedDeptName = vue.computed(() => {
        if (!selectedDeptId.value)
          return userStore.t("common.allDepartments");
        const dept = departments.value.find((d) => d.id === selectedDeptId.value);
        return (dept == null ? void 0 : dept.name) || "";
      });
      const form = vue.reactive({
        id: null,
        className: "",
        departmentId: null,
        departmentName: "",
        remark: ""
      });
      const getDeptName = (id) => {
        const dept = departments.value.find((d) => d.id === id);
        return (dept == null ? void 0 : dept.name) || "-";
      };
      const onDeptChange = (e) => {
        const index = e.detail.value;
        const option = deptOptions.value[index];
        selectedDeptId.value = (option == null ? void 0 : option.id) || null;
        loadData();
      };
      const onFormDeptChange = (e) => {
        const index = e.detail.value;
        if (departments.value[index]) {
          form.departmentId = departments.value[index].id;
          form.departmentName = departments.value[index].name;
        }
      };
      const loadData = async () => {
        try {
          uni.showLoading({ title: userStore.t("common.loading") });
          const res = await adminClassApi.page({
            current: 1,
            size: 20,
            keyword: keyword.value,
            departmentId: selectedDeptId.value
          }, { skipRedirect: true });
          if (res.code === 200) {
            classList.value = res.data.records || [];
          }
        } catch (e) {
          uni.showToast({ title: userStore.t("common.loadFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const addClass = () => {
        editingClass.value = null;
        form.id = null;
        form.className = "";
        form.departmentId = null;
        form.departmentName = "";
        form.remark = "";
        showPopup.value = true;
      };
      const editClass = (item) => {
        editingClass.value = item;
        form.id = item.id;
        form.className = item.className || "";
        form.departmentId = item.departmentId;
        form.departmentName = getDeptName(item.departmentId);
        form.remark = item.remark || "";
        showPopup.value = true;
      };
      const deleteClass = async (item) => {
        uni.showModal({
          title: userStore.t("common.confirm"),
          content: userStore.t("common.confirmDelete"),
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await adminClassApi.delete(item.id);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.success"), icon: "success" });
                  loadData();
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.failed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.failed"), icon: "none" });
              }
            }
          }
        });
      };
      const submitForm = async () => {
        if (!form.className.trim()) {
          uni.showToast({ title: userStore.t("common.pleaseEnter") + userStore.t("common.name"), icon: "none" });
          return;
        }
        if (!form.departmentId) {
          uni.showToast({ title: userStore.t("common.pleaseSelect") + userStore.t("common.department"), icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: userStore.t("common.processing") });
          const data = { ...form };
          delete data.departmentName;
          let result;
          if (editingClass.value) {
            result = await adminClassApi.update(data);
          } else {
            result = await adminClassApi.create(data);
          }
          if (result.code === 200) {
            uni.showToast({ title: editingClass.value ? userStore.t("common.success") : userStore.t("common.success"), icon: "success" });
            showPopup.value = false;
            loadData();
          } else {
            uni.showToast({ title: result.message || userStore.t("common.failed"), icon: "none" });
          }
        } catch (e) {
          uni.showToast({ title: userStore.t("common.failed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const loadDepartments = async () => {
        try {
          const res = await departmentApi.list({ skipRedirect: true });
          if (res.code === 200) {
            departments.value = res.data || [];
          } else {
            departments.value = [];
            uni.showToast({ title: res.message || userStore.t("common.loadFailed"), icon: "none" });
          }
        } catch (e) {
          departments.value = [];
          formatAppLog("error", "at pages/admin/class-manage.vue:244", "加载院系失败:", e);
          uni.showToast({ title: userStore.t("common.loadFailed"), icon: "none" });
        }
      };
      const setPageTitle = () => {
        uni.setNavigationBarTitle({
          title: userStore.t("common.classManage")
        });
      };
      vue.onMounted(() => {
        loadDepartments();
        loadData();
        setPageTitle();
      });
      vue.watch(() => userStore.language, () => {
        setPageTitle();
      });
      return {
        userStore,
        keyword,
        classList,
        departments,
        deptOptions,
        selectedDeptName,
        showPopup,
        editingClass,
        form,
        getDeptName,
        onDeptChange,
        onFormDeptChange,
        loadData,
        addClass,
        editClass,
        deleteClass,
        submitForm,
        toggleLanguage
      };
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "manage-page" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.classManage"),
        showBack: true
      }, null, 8, ["title"]),
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.createElementVNode("picker", {
          mode: "selector",
          range: $setup.deptOptions,
          "range-key": "name",
          onChange: _cache[0] || (_cache[0] = (...args) => $setup.onDeptChange && $setup.onDeptChange(...args))
        }, [
          vue.createElementVNode("view", { class: "picker" }, [
            vue.createElementVNode(
              "text",
              { class: "picker-text" },
              vue.toDisplayString($setup.selectedDeptName || $setup.userStore.t("common.all") + $setup.userStore.t("common.department")),
              1
              /* TEXT */
            )
          ])
        ], 40, ["range"]),
        vue.withDirectives(vue.createElementVNode("input", {
          class: "search-input",
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.keyword = $event),
          placeholder: $setup.userStore.t("common.searchPlaceholder"),
          onInput: _cache[2] || (_cache[2] = (...args) => _ctx.onSearchInput && _ctx.onSearchInput(...args))
        }, null, 40, ["placeholder"]), [
          [vue.vModelText, $setup.keyword]
        ]),
        vue.createElementVNode(
          "button",
          {
            class: "search-btn",
            onClick: _cache[3] || (_cache[3] = (...args) => $setup.loadData && $setup.loadData(...args))
          },
          vue.toDisplayString($setup.userStore.t("common.search")),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "class-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.classList, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "class-item",
              key: item.id
            }, [
              vue.createElementVNode("view", { class: "class-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "class-name" },
                  vue.toDisplayString(item.className),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "class-meta" },
                  vue.toDisplayString($setup.userStore.t("common.inviteCode")) + ": " + vue.toDisplayString(item.inviteCode || "-") + " | " + vue.toDisplayString($setup.getDeptName(item.departmentId)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "class-actions" }, [
                vue.createElementVNode("text", {
                  class: "action-btn",
                  onClick: ($event) => $setup.editClass(item)
                }, vue.toDisplayString($setup.userStore.t("common.edit")), 9, ["onClick"]),
                vue.createElementVNode("text", {
                  class: "action-btn danger",
                  onClick: ($event) => $setup.deleteClass(item)
                }, vue.toDisplayString($setup.userStore.t("common.delete")), 9, ["onClick"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.classList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, [
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            vue.toDisplayString($setup.userStore.t("common.noData")),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", {
        class: "add-btn",
        onClick: _cache[4] || (_cache[4] = (...args) => $setup.addClass && $setup.addClass(...args))
      }, [
        vue.createElementVNode("text", { class: "add-icon" }, "+"),
        vue.createElementVNode(
          "text",
          { class: "add-text" },
          vue.toDisplayString($setup.userStore.t("common.add")) + vue.toDisplayString($setup.userStore.t("common.class")),
          1
          /* TEXT */
        )
      ]),
      $setup.showPopup ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal",
        onClick: _cache[12] || (_cache[12] = ($event) => $setup.showPopup = false)
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[11] || (_cache[11] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString($setup.editingClass ? $setup.userStore.t("common.edit") + $setup.userStore.t("common.class") : $setup.userStore.t("common.add") + $setup.userStore.t("common.class")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "modal-close",
              onClick: _cache[5] || (_cache[5] = ($event) => $setup.showPopup = false)
            }, [
              vue.createElementVNode("text", { class: "close-icon" }, "×")
            ])
          ]),
          vue.createElementVNode("view", { class: "form-content" }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.name")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.form.className = $event),
                placeholder: $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.name")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.className]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.department")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("picker", {
                mode: "selector",
                range: $setup.departments,
                "range-key": "name",
                onChange: _cache[7] || (_cache[7] = (...args) => $setup.onFormDeptChange && $setup.onFormDeptChange(...args))
              }, [
                vue.createElementVNode("view", { class: "form-picker" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($setup.form.departmentName || $setup.userStore.t("common.pleaseSelect") + $setup.userStore.t("common.department")),
                    1
                    /* TEXT */
                  )
                ])
              ], 40, ["range"])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.remark")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("textarea", {
                class: "form-textarea",
                "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $setup.form.remark = $event),
                placeholder: $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.remark")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.remark]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode(
              "button",
              {
                class: "btn-cancel",
                onClick: _cache[9] || (_cache[9] = ($event) => $setup.showPopup = false)
              },
              vue.toDisplayString($setup.userStore.t("common.cancel")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "button",
              {
                class: "btn-confirm",
                onClick: _cache[10] || (_cache[10] = (...args) => $setup.submitForm && $setup.submitForm(...args))
              },
              vue.toDisplayString($setup.userStore.t("common.confirm")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesAdminClassManage = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$4], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/admin/class-manage.vue"]]);
  const _sfc_main$m = {
    components: { CustomNavBar },
    setup() {
      const userStore = useUserStore();
      const logList = vue.ref([]);
      const keyword = vue.ref("");
      const currentPage = vue.ref(1);
      const total = vue.ref(0);
      const pageSize = vue.ref(20);
      const selectedOperation = vue.ref("");
      const operationOptions = vue.computed(() => [
        { value: "", label: userStore.t("common.all") + userStore.t("common.operation") },
        { value: userStore.t("common.login"), label: userStore.t("common.login") },
        { value: userStore.t("common.logout"), label: userStore.t("common.logout") },
        { value: userStore.t("common.createUser"), label: userStore.t("common.createUser") },
        { value: userStore.t("common.updateUser"), label: userStore.t("common.updateUser") },
        { value: userStore.t("common.deleteUser"), label: userStore.t("common.deleteUser") },
        { value: userStore.t("common.createDepartment"), label: userStore.t("common.createDepartment") },
        { value: userStore.t("common.updateDepartment"), label: userStore.t("common.updateDepartment") },
        { value: userStore.t("common.deleteDepartment"), label: userStore.t("common.deleteDepartment") },
        { value: userStore.t("common.createClass"), label: userStore.t("common.createClass") },
        { value: userStore.t("common.updateClass"), label: userStore.t("common.updateClass") },
        { value: userStore.t("common.deleteClass"), label: userStore.t("common.deleteClass") },
        { value: userStore.t("common.createExam"), label: userStore.t("common.createExam") },
        { value: userStore.t("common.updateExam"), label: userStore.t("common.updateExam") },
        { value: userStore.t("common.deleteExam"), label: userStore.t("common.deleteExam") }
      ]);
      const selectedOperationLabel = vue.computed(() => {
        const opt = operationOptions.find((o) => o.value === selectedOperation.value);
        return (opt == null ? void 0 : opt.label) || "";
      });
      const totalPages = vue.computed(() => {
        return Math.ceil(total.value / pageSize.value);
      });
      const formatTime = (time) => {
        if (!time)
          return "-";
        const date = new Date(time);
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          const seconds = String(date.getSeconds()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } else {
          return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
        }
      };
      const getMethodClass = (method) => {
        const map = {
          "POST": "post",
          "GET": "get",
          "PUT": "put",
          "DELETE": "delete"
        };
        return map[method] || "";
      };
      const onOperationChange = (e) => {
        const index = e.detail.value;
        selectedOperation.value = operationOptions[index].value;
        currentPage.value = 1;
        loadData();
      };
      const loadData = async () => {
        try {
          uni.showLoading({ title: userStore.t("common.loading") });
          const params = {
            current: currentPage.value,
            size: pageSize.value
          };
          if (keyword.value.trim()) {
            params.keyword = keyword.value.trim();
          }
          if (selectedOperation.value) {
            params.operation = selectedOperation.value;
          }
          const res = await logApi.page(params);
          if (res.code === 200) {
            logList.value = res.data.records || [];
            total.value = res.data.total || 0;
          }
        } catch (e) {
          uni.showToast({ title: userStore.t("common.loadFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const prevPage = () => {
        if (currentPage.value > 1) {
          currentPage.value--;
          loadData();
        }
      };
      const nextPage = () => {
        if (currentPage.value < totalPages.value) {
          currentPage.value++;
          loadData();
        }
      };
      const setPageTitle = () => {
        uni.setNavigationBarTitle({
          title: userStore.t("common.systemLog")
        });
      };
      vue.onMounted(() => {
        loadData();
        setPageTitle();
      });
      vue.watch(() => userStore.language, () => {
        setPageTitle();
      });
      return {
        userStore,
        logList,
        keyword,
        currentPage,
        total,
        totalPages,
        selectedOperationLabel,
        operationOptions,
        formatTime,
        getMethodClass,
        onOperationChange,
        loadData,
        toggleLanguage,
        prevPage,
        nextPage
      };
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "manage-page" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.logManage"),
        showBack: true
      }, null, 8, ["title"]),
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.withDirectives(vue.createElementVNode("input", {
          class: "search-input",
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.keyword = $event),
          placeholder: $setup.userStore.t("common.searchPlaceholder"),
          onInput: _cache[1] || (_cache[1] = (...args) => _ctx.onSearchInput && _ctx.onSearchInput(...args))
        }, null, 40, ["placeholder"]), [
          [vue.vModelText, $setup.keyword]
        ]),
        vue.createElementVNode(
          "button",
          {
            class: "search-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $setup.loadData && $setup.loadData(...args))
          },
          vue.toDisplayString($setup.userStore.t("common.search")),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "filter-row" }, [
        vue.createElementVNode("picker", {
          mode: "selector",
          range: $setup.operationOptions,
          "range-key": "label",
          onChange: _cache[3] || (_cache[3] = (...args) => $setup.onOperationChange && $setup.onOperationChange(...args))
        }, [
          vue.createElementVNode("view", { class: "picker" }, [
            vue.createElementVNode(
              "text",
              { class: "picker-text" },
              vue.toDisplayString($setup.selectedOperationLabel || $setup.userStore.t("common.all") + $setup.userStore.t("common.operation")),
              1
              /* TEXT */
            )
          ])
        ], 40, ["range"])
      ]),
      vue.createElementVNode("view", { class: "log-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.logList, (log) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "log-item",
              key: log.id
            }, [
              vue.createElementVNode("view", { class: "log-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "log-operator" },
                  vue.toDisplayString(log.username || "-"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "log-time" },
                  vue.toDisplayString($setup.formatTime(log.createTime)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "log-body" }, [
                vue.createElementVNode(
                  "text",
                  { class: "log-action" },
                  vue.toDisplayString(log.operation || "-"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "log-meta" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "log-ip" },
                    vue.toDisplayString(log.ip || "-"),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["log-method", $setup.getMethodClass(log.method)])
                    },
                    vue.toDisplayString(log.method || "-"),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                log.params ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "log-target"
                  },
                  vue.toDisplayString(log.params),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.logList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, [
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            vue.toDisplayString($setup.userStore.t("common.noLogData")),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      $setup.total > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "pagination"
      }, [
        vue.createElementVNode(
          "view",
          { class: "page-info" },
          vue.toDisplayString($setup.userStore.t("common.totalRecords", { total: $setup.total })),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "page-control" }, [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["page-btn", { disabled: $setup.currentPage <= 1 }]),
              onClick: _cache[4] || (_cache[4] = (...args) => $setup.prevPage && $setup.prevPage(...args))
            },
            vue.toDisplayString($setup.userStore.t("common.prevPage")),
            3
            /* TEXT, CLASS */
          ),
          vue.createElementVNode(
            "text",
            { class: "page-num" },
            vue.toDisplayString($setup.currentPage) + " / " + vue.toDisplayString($setup.totalPages),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["page-btn", { disabled: $setup.currentPage >= $setup.totalPages }]),
              onClick: _cache[5] || (_cache[5] = (...args) => $setup.nextPage && $setup.nextPage(...args))
            },
            vue.toDisplayString($setup.userStore.t("common.nextPage")),
            3
            /* TEXT, CLASS */
          )
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesAdminLogManage = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$3], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/admin/log-manage.vue"]]);
  const _sfc_main$l = {
    components: { CustomNavBar },
    setup() {
      const userStore = useUserStore();
      const stats = vue.ref({
        totalUsers: 0,
        studentCount: 0,
        teacherCount: 0,
        adminCount: 0,
        departmentCount: 0,
        classCount: 0,
        paperCount: 0,
        questionCount: 0,
        totalExams: 0,
        pendingExams: 0,
        ongoingExams: 0,
        finishedExams: 0,
        participationCount: 0
      });
      const totalExamStatus = vue.computed(() => {
        return stats.value.pendingExams + stats.value.ongoingExams + stats.value.finishedExams;
      });
      const pendingPercent = vue.computed(() => {
        if (totalExamStatus.value === 0)
          return 0;
        return (stats.value.pendingExams / totalExamStatus.value * 100).toFixed(0);
      });
      const ongoingPercent = vue.computed(() => {
        if (totalExamStatus.value === 0)
          return 0;
        return (stats.value.ongoingExams / totalExamStatus.value * 100).toFixed(0);
      });
      const finishedPercent = vue.computed(() => {
        if (totalExamStatus.value === 0)
          return 0;
        return (stats.value.finishedExams / totalExamStatus.value * 100).toFixed(0);
      });
      const studentPercent = vue.computed(() => {
        if (stats.value.totalUsers === 0)
          return 0;
        return (stats.value.studentCount / stats.value.totalUsers * 100).toFixed(1);
      });
      const teacherPercent = vue.computed(() => {
        if (stats.value.totalUsers === 0)
          return 0;
        return (stats.value.teacherCount / stats.value.totalUsers * 100).toFixed(1);
      });
      const adminPercent = vue.computed(() => {
        if (stats.value.totalUsers === 0)
          return 0;
        return (stats.value.adminCount / stats.value.totalUsers * 100).toFixed(1);
      });
      const avgQuestionsPerPaper = vue.computed(() => {
        if (stats.value.paperCount === 0)
          return "0";
        return (stats.value.questionCount / stats.value.paperCount).toFixed(1);
      });
      const avgScorePerQuestion = vue.computed(() => {
        if (stats.value.questionCount === 0)
          return "0.0";
        return "2.5";
      });
      const loadData = async () => {
        try {
          uni.showLoading({ title: userStore.t("common.loading") });
          const res = await statisticsApi.overview();
          if (res.code === 200) {
            stats.value = {
              ...stats.value,
              ...res.data
            };
          }
        } catch (e) {
          uni.showToast({ title: userStore.t("common.loadFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const setPageTitle = () => {
        uni.setNavigationBarTitle({
          title: userStore.t("common.dataStatistics")
        });
      };
      vue.onMounted(() => {
        loadData();
        setPageTitle();
      });
      vue.watch(() => userStore.language, () => {
        setPageTitle();
      });
      return {
        userStore,
        stats,
        pendingPercent,
        ongoingPercent,
        finishedPercent,
        studentPercent,
        teacherPercent,
        adminPercent,
        avgQuestionsPerPaper,
        avgScorePerQuestion
      };
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "manage-page" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.statistics"),
        showBack: true
      }, null, 8, ["title"]),
      vue.createElementVNode("view", { class: "stats-grid" }, [
        vue.createElementVNode("view", { class: "stat-card" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($setup.stats.totalUsers),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "stat-label" },
            vue.toDisplayString($setup.userStore.t("dashboard.totalUsers")),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "stat-sub" }, [
            vue.createElementVNode(
              "text",
              { class: "sub-item" },
              "👨‍🎓 " + vue.toDisplayString($setup.stats.studentCount) + " " + vue.toDisplayString($setup.userStore.t("common.student")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "sub-item" },
              "👨‍🏫 " + vue.toDisplayString($setup.stats.teacherCount) + " " + vue.toDisplayString($setup.userStore.t("common.teacher")),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "stat-card" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($setup.stats.departmentCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "stat-label" },
            vue.toDisplayString($setup.userStore.t("dashboard.departmentCount")),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-card" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($setup.stats.classCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "stat-label" },
            vue.toDisplayString($setup.userStore.t("dashboard.classCount")),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-card" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($setup.stats.paperCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "stat-label" },
            vue.toDisplayString($setup.userStore.t("dashboard.paperCount")),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-card" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($setup.stats.questionCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "stat-label" },
            vue.toDisplayString($setup.userStore.t("dashboard.questionCount")),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-card" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($setup.stats.totalExams),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "stat-label" },
            vue.toDisplayString($setup.userStore.t("dashboard.examCount")),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "stat-sub" }, [
            vue.createElementVNode(
              "text",
              { class: "sub-item" },
              "⏳ " + vue.toDisplayString($setup.stats.pendingExams) + " " + vue.toDisplayString($setup.userStore.t("common.pending")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "sub-item" },
              "🔄 " + vue.toDisplayString($setup.stats.ongoingExams) + " " + vue.toDisplayString($setup.userStore.t("common.ongoing")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "sub-item" },
              "✅ " + vue.toDisplayString($setup.stats.finishedExams) + " " + vue.toDisplayString($setup.userStore.t("common.finished")),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "chart-card" }, [
        vue.createElementVNode("view", { class: "chart-header" }, [
          vue.createElementVNode(
            "text",
            { class: "chart-title" },
            "📊 " + vue.toDisplayString($setup.userStore.t("common.exam")) + vue.toDisplayString($setup.userStore.t("common.status")) + vue.toDisplayString($setup.userStore.t("common.distribution")),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "chart-content" }, [
          vue.createElementVNode("view", { class: "progress-bar" }, [
            vue.createElementVNode(
              "view",
              {
                class: "progress-item pending",
                style: vue.normalizeStyle({ width: $setup.pendingPercent + "%" })
              },
              null,
              4
              /* STYLE */
            ),
            vue.createElementVNode(
              "view",
              {
                class: "progress-item ongoing",
                style: vue.normalizeStyle({ width: $setup.ongoingPercent + "%" })
              },
              null,
              4
              /* STYLE */
            ),
            vue.createElementVNode(
              "view",
              {
                class: "progress-item finished",
                style: vue.normalizeStyle({ width: $setup.finishedPercent + "%" })
              },
              null,
              4
              /* STYLE */
            )
          ]),
          vue.createElementVNode("view", { class: "progress-legend" }, [
            vue.createElementVNode("view", { class: "legend-item" }, [
              vue.createElementVNode("view", { class: "legend-dot pending" }),
              vue.createElementVNode(
                "text",
                { class: "legend-text" },
                vue.toDisplayString($setup.userStore.t("common.pending")) + " " + vue.toDisplayString($setup.stats.pendingExams),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "legend-item" }, [
              vue.createElementVNode("view", { class: "legend-dot ongoing" }),
              vue.createElementVNode(
                "text",
                { class: "legend-text" },
                vue.toDisplayString($setup.userStore.t("common.ongoing")) + " " + vue.toDisplayString($setup.stats.ongoingExams),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "legend-item" }, [
              vue.createElementVNode("view", { class: "legend-dot finished" }),
              vue.createElementVNode(
                "text",
                { class: "legend-text" },
                vue.toDisplayString($setup.userStore.t("common.finished")) + " " + vue.toDisplayString($setup.stats.finishedExams),
                1
                /* TEXT */
              )
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "chart-card" }, [
        vue.createElementVNode("view", { class: "chart-header" }, [
          vue.createElementVNode(
            "text",
            { class: "chart-title" },
            "👥 " + vue.toDisplayString($setup.userStore.t("common.user")) + vue.toDisplayString($setup.userStore.t("common.role")) + vue.toDisplayString($setup.userStore.t("common.distribution")),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "chart-content" }, [
          vue.createElementVNode("view", { class: "pie-container" }, [
            vue.createElementVNode("view", { class: "pie-chart" }, [
              vue.createElementVNode(
                "view",
                {
                  class: "pie-ring",
                  style: vue.normalizeStyle({ "--student-pct": $setup.studentPercent + "%", "--teacher-pct": $setup.teacherPercent + "%" })
                },
                null,
                4
                /* STYLE */
              ),
              vue.createElementVNode("view", { class: "pie-center" }, [
                vue.createElementVNode(
                  "text",
                  { class: "pie-total" },
                  vue.toDisplayString($setup.stats.totalUsers),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "pie-label" },
                  vue.toDisplayString($setup.userStore.t("dashboard.totalUsers")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "pie-legend" }, [
            vue.createElementVNode("view", { class: "legend-item" }, [
              vue.createElementVNode("view", { class: "legend-dot student" }),
              vue.createElementVNode(
                "text",
                { class: "legend-text" },
                vue.toDisplayString($setup.userStore.t("common.student")),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "legend-count" },
                vue.toDisplayString($setup.stats.studentCount),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "legend-percent" },
                vue.toDisplayString($setup.studentPercent) + "%",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "legend-item" }, [
              vue.createElementVNode("view", { class: "legend-dot teacher" }),
              vue.createElementVNode(
                "text",
                { class: "legend-text" },
                vue.toDisplayString($setup.userStore.t("common.teacher")),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "legend-count" },
                vue.toDisplayString($setup.stats.teacherCount),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "legend-percent" },
                vue.toDisplayString($setup.teacherPercent) + "%",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "legend-item" }, [
              vue.createElementVNode("view", { class: "legend-dot admin" }),
              vue.createElementVNode(
                "text",
                { class: "legend-text" },
                vue.toDisplayString($setup.userStore.t("common.admin")),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "legend-count" },
                vue.toDisplayString($setup.stats.adminCount),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "legend-percent" },
                vue.toDisplayString($setup.adminPercent) + "%",
                1
                /* TEXT */
              )
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "info-card" }, [
        vue.createElementVNode("view", { class: "info-header" }, [
          vue.createElementVNode(
            "text",
            { class: "info-title" },
            "📈 " + vue.toDisplayString($setup.userStore.t("common.overview")),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-list" }, [
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-icon" }, "👥"),
            vue.createElementVNode("view", { class: "info-content" }, [
              vue.createElementVNode(
                "text",
                { class: "info-label" },
                vue.toDisplayString($setup.userStore.t("common.total")) + " " + vue.toDisplayString($setup.userStore.t("common.participation")),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.stats.participationCount),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-icon" }, "📄"),
            vue.createElementVNode("view", { class: "info-content" }, [
              vue.createElementVNode(
                "text",
                { class: "info-label" },
                vue.toDisplayString($setup.userStore.t("common.paper")) + vue.toDisplayString($setup.userStore.t("common.average")) + vue.toDisplayString($setup.userStore.t("common.question")) + vue.toDisplayString($setup.userStore.t("common.count")),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.avgQuestionsPerPaper),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-icon" }, "📝"),
            vue.createElementVNode("view", { class: "info-content" }, [
              vue.createElementVNode(
                "text",
                { class: "info-label" },
                vue.toDisplayString($setup.userStore.t("common.average")) + vue.toDisplayString($setup.userStore.t("common.score")) + vue.toDisplayString($setup.userStore.t("common.per")) + vue.toDisplayString($setup.userStore.t("common.question")),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.avgScorePerQuestion),
                1
                /* TEXT */
              )
            ])
          ])
        ])
      ])
    ]);
  }
  const PagesAdminStatistics = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$2], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/admin/statistics.vue"]]);
  const _sfc_main$k = {
    __name: "my-classes",
    setup(__props) {
      const userStore = useUserStore();
      const className = vue.ref("");
      const classList = vue.ref([]);
      const getRoleText = (role) => {
        const map = {
          CREATOR: userStore.t("common.creator"),
          OWNER: userStore.t("common.owner"),
          ADMIN: userStore.t("common.admin"),
          TEACHER: userStore.t("common.teacher"),
          STUDENT: userStore.t("common.student"),
          MEMBER: userStore.t("common.member")
        };
        return map[role] || role;
      };
      const handleCreate = async () => {
        var _a;
        if (!className.value.trim()) {
          uni.showToast({
            title: "请输入班级名称",
            icon: "none"
          });
          return;
        }
        try {
          const userId = (_a = userStore.userInfo) == null ? void 0 : _a.userId;
          if (!userId) {
            uni.showToast({
              title: "请先登录",
              icon: "none"
            });
            return;
          }
          const res = await classApi.create({
            className: className.value,
            creatorId: userId
          });
          if (res.code === 200) {
            uni.showToast({
              title: "创建班级成功",
              icon: "success"
            });
            className.value = "";
            loadClasses();
          } else {
            uni.showToast({
              title: res.message || "创建班级失败",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/my-classes.vue:107", e);
          uni.showToast({
            title: "网络错误",
            icon: "none"
          });
        }
      };
      const enterClass = (classId) => {
        uni.navigateTo({
          url: `/pages/teacher/class-chat?id=${classId}`
        });
      };
      const getLastMessage = (cls) => {
        if (!cls.lastMessage)
          return "暂无消息";
        if (cls.lastMessage.startsWith("EXAM_NOTICE|")) {
          return parseExamNotice(cls.lastMessage);
        }
        return cls.lastMessage;
      };
      const parseExamNotice = (content) => {
        if (!(content == null ? void 0 : content.startsWith("EXAM_NOTICE|")))
          return "";
        const parts = content.split("|");
        const noticeType = parts[1] || "";
        const title = parts[2] || "";
        if (noticeType === "START") {
          return "🚀 " + title + " 开始考试";
        } else if (noticeType === "PUBLISH") {
          return "📢 " + title + " 发布通知";
        } else if (noticeType === "END") {
          return "🔚 " + title + " 考试结束";
        }
        return "📝 " + title;
      };
      const formatMessageTime = (time) => {
        if (!time)
          return "";
        const date = new Date(time);
        const now2 = /* @__PURE__ */ new Date();
        const diff = now2 - date;
        if (diff < 6e4)
          return userStore.t("common.justNow");
        if (diff < 36e5)
          return Math.floor(diff / 6e4) + userStore.t("common.minutesAgo");
        if (diff < 864e5)
          return Math.floor(diff / 36e5) + userStore.t("common.hoursAgo");
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } else {
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        }
      };
      const loadClasses = async () => {
        var _a;
        try {
          const userId = (_a = userStore.userInfo) == null ? void 0 : _a.userId;
          if (!userId)
            return;
          const res = await classApi.getMyClasses(userId);
          if (res.code === 200) {
            classList.value = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/my-classes.vue:172", e);
          uni.showToast({
            title: "加载班级列表失败",
            icon: "none"
          });
        }
      };
      vue.onMounted(() => {
        loadClasses();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "my-classes" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.myClasses"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createCommentVNode(" 创建班级 "),
          vue.createElementVNode("view", { class: "create-card" }, [
            vue.createElementVNode("view", { class: "create-form" }, [
              vue.createElementVNode("view", { class: "create-input" }, [
                vue.createElementVNode("text", { class: "create-icon" }, "➕"),
                vue.withDirectives(vue.createElementVNode("input", {
                  type: "text",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => className.value = $event),
                  placeholder: vue.unref(userStore).t("teacher.enterClassName"),
                  onConfirm: handleCreate
                }, null, 40, ["placeholder"]), [
                  [vue.vModelText, className.value]
                ])
              ]),
              vue.createElementVNode(
                "button",
                {
                  class: "create-btn",
                  onClick: handleCreate
                },
                vue.toDisplayString(vue.unref(userStore).t("teacher.createClass")),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createCommentVNode(" 班级消息列表 "),
          classList.value.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "class-message-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(classList.value, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "class-message-card",
                  key: item.class.id,
                  onClick: ($event) => enterClass(item.class.id)
                }, [
                  vue.createElementVNode("view", { class: "class-message-icon" }, [
                    vue.createElementVNode("text", { class: "icon-emoji" }, "🏫")
                  ]),
                  vue.createElementVNode("view", { class: "class-message-main" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "class-message-name" },
                      vue.toDisplayString(item.class.className),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "class-message-content" },
                      vue.toDisplayString(getLastMessage(item.class)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "class-message-right" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "class-message-time" },
                      vue.toDisplayString(formatMessageTime(item.class.lastMessageTime)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "class-message-invite" },
                      vue.toDisplayString(item.class.inviteCode),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "class-message-role" },
                      vue.toDisplayString(getRoleText(item.role)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("text", { class: "arrow-icon" }, "›")
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          classList.value.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "empty"
          }, [
            vue.createElementVNode("text", { class: "empty-icon" }, "📋"),
            vue.createElementVNode(
              "text",
              { class: "empty-text" },
              vue.toDisplayString(vue.unref(userStore).t("teacher.noClasses")),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  };
  const PagesTeacherMyClasses = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["__scopeId", "data-v-044d2181"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/my-classes.vue"]]);
  const _sfc_main$j = {
    __name: "class-chat",
    setup(__props) {
      const userStore = useUserStore();
      const classId = vue.ref("");
      const className = vue.ref("");
      const memberCount = vue.ref(0);
      const messages = vue.ref([]);
      const members = vue.ref([]);
      const inputMessage = vue.ref("");
      const showMembers = vue.ref(false);
      const showActions = vue.ref(false);
      const showExamForm = vue.ref(false);
      const scrollTop = vue.ref(0);
      const canManageMember = vue.ref(false);
      const currentRole = vue.ref("");
      const inviteCode = vue.ref("");
      const papers = vue.ref([]);
      const selectedPaperId = vue.ref(null);
      const examForm = vue.reactive({
        title: "",
        duration: "",
        startDate: "",
        startTime: ""
      });
      const iconRocket = "🚀";
      const iconCalendar = "📅";
      const iconTimer = "⏱";
      const selectedPaper = vue.ref(null);
      const getRoleText = (role) => {
        return {
          CREATOR: userStore.t("common.creator"),
          OWNER: userStore.t("common.creator"),
          TEACHER: userStore.t("common.teacher"),
          STUDENT: userStore.t("common.student"),
          MEMBER: userStore.t("common.student")
        }[role] || role;
      };
      const isSelfMessage = (senderId) => {
        var _a;
        const userId = (_a = userStore.userInfo) == null ? void 0 : _a.userId;
        return String(senderId) === String(userId);
      };
      const isExamNotice = (msg) => {
        var _a;
        return (_a = msg.content) == null ? void 0 : _a.startsWith("EXAM_NOTICE|");
      };
      const parseExamNotice = (content) => {
        if (!(content == null ? void 0 : content.startsWith("EXAM_NOTICE|")))
          return null;
        const parts = content.split("|");
        let examId = null;
        for (let i = parts.length - 1; i >= 0; i--) {
          if (/^\d+$/.test(parts[i])) {
            examId = parts[i];
            break;
          }
        }
        return {
          noticeType: parts[1],
          title: parts[2],
          startTime: parts[3],
          endTime: parts[4],
          duration: parts[5],
          examId
        };
      };
      const getNoticeTitle = (content) => {
        const notice = parseExamNotice(content);
        return notice ? notice.title : "";
      };
      const getNoticeStartTime = (content) => {
        const notice = parseExamNotice(content);
        return notice ? notice.startTime : "";
      };
      const getNoticeDuration = (content) => {
        const notice = parseExamNotice(content);
        return notice ? notice.duration : "";
      };
      const getSenderName = (senderId) => {
        const member = members.value.find((m) => String(m.userId) === String(senderId));
        return (member == null ? void 0 : member.realName) || userStore.t("common.unknownUser");
      };
      const getSenderAvatar = (senderId) => {
        const member = members.value.find((m) => String(m.userId) === String(senderId));
        const avatar = member == null ? void 0 : member.avatar;
        if (!avatar)
          return "/static/default-avatar.png";
        if (avatar.startsWith("http"))
          return avatar;
        return "http://192.168.1.92:8081" + avatar;
      };
      const formatTime = (time) => {
        if (!time)
          return "";
        const date = new Date(time);
        const now2 = /* @__PURE__ */ new Date();
        const diff = now2 - date;
        if (diff < 6e4)
          return userStore.t("common.justNow");
        if (diff < 36e5)
          return Math.floor(diff / 6e4) + userStore.t("common.minutesAgo");
        if (diff < 864e5)
          return Math.floor(diff / 36e5) + userStore.t("common.hoursAgo");
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } else {
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        }
      };
      const sendMessage = async () => {
        var _a;
        if (!inputMessage.value.trim())
          return;
        try {
          const userId = (_a = userStore.userInfo) == null ? void 0 : _a.userId;
          const res = await classApi.sendMessage(classId.value, inputMessage.value, userId);
          if (res.code === 200) {
            inputMessage.value = "";
            loadMessages();
          } else {
            uni.showToast({ title: res.message || userStore.t("common.sendFailed"), icon: "none" });
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/class-chat.vue:310", e);
          uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
        }
      };
      const handleSendExamNotice = () => {
        showActions.value = false;
        loadPapers();
        showExamForm.value = true;
      };
      const loadPapers = async () => {
        try {
          const res = await paperApi$1.page({ current: 1, size: 50 });
          if (res.code === 200) {
            papers.value = res.data.records || [];
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/class-chat.vue:328", "加载试卷失败:", e);
          uni.showToast({ title: userStore.t("common.loadPaperFailed"), icon: "none" });
        }
      };
      const onPaperChange = (e) => {
        const index = e.detail.value;
        if (papers.value[index]) {
          selectedPaperId.value = papers.value[index].id;
          selectedPaper.value = papers.value[index];
        }
      };
      const onStartDateChange = (e) => {
        examForm.startDate = e.detail.value;
      };
      const onStartTimeChange = (e) => {
        examForm.startTime = e.detail.value;
      };
      const submitExam = async () => {
        var _a;
        if (!examForm.title.trim()) {
          uni.showToast({ title: userStore.t("teacher.enterExamTitle"), icon: "none" });
          return;
        }
        if (!selectedPaperId.value) {
          uni.showToast({ title: userStore.t("teacher.selectPaper"), icon: "none" });
          return;
        }
        if (!examForm.duration) {
          uni.showToast({ title: userStore.t("teacher.enterDuration"), icon: "none" });
          return;
        }
        if (!examForm.startDate || !examForm.startTime) {
          uni.showToast({ title: userStore.t("teacher.selectStartTime"), icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: userStore.t("common.publishing") });
          const startTime = `${examForm.startDate} ${examForm.startTime}:00`;
          const examData = {
            title: examForm.title,
            paperId: selectedPaperId.value,
            classIds: classId.value,
            duration: parseInt(examForm.duration),
            startTime,
            status: "PENDING"
          };
          const res = await examApi.create(examData);
          if (res.code === 200) {
            uni.showToast({ title: userStore.t("teacher.publishSuccess"), icon: "success" });
            showExamForm.value = false;
            const examId = res.data.id !== void 0 ? res.data.id : res.data;
            const noticeContent = `EXAM_NOTICE|PUBLISH|${examForm.title}|${startTime}||${examForm.duration}|${examId}`;
            await classApi.sendMessage(classId.value, noticeContent, (_a = userStore.userInfo) == null ? void 0 : _a.userId);
            examForm.title = "";
            examForm.duration = "";
            examForm.startDate = "";
            examForm.startTime = "";
            selectedPaperId.value = null;
            selectedPaper.value = null;
            loadMessages();
          } else {
            uni.showToast({ title: res.message || userStore.t("common.publishFailed"), icon: "none" });
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/class-chat.vue:403", "发布考试失败:", e);
          uni.showToast({ title: userStore.t("common.publishFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const handleInvite = () => {
        showActions.value = false;
        uni.showModal({
          title: userStore.t("common.inviteMembers"),
          content: `${userStore.t("common.inviteCode")}：${inviteCode.value}
${userStore.t("common.shareInviteCode")}`,
          showCancel: false
        });
      };
      const handleMute = async (member) => {
        uni.showModal({
          title: userStore.t("common.muteMember"),
          content: `${userStore.t("common.confirmMute")} ${member.realName} ?`,
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await classApi.muteMember(classId.value, member.userId, 3600);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.muted"), icon: "success" });
                  loadMembers();
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.operationFailed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
              }
            }
          }
        });
      };
      const handleUnmute = async (member) => {
        uni.showModal({
          title: userStore.t("common.unmuteMember"),
          content: `${userStore.t("common.confirmUnmute")} ${member.realName} ?`,
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await classApi.unmuteMember(classId.value, member.userId);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.unmuted"), icon: "success" });
                  loadMembers();
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.operationFailed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
              }
            }
          }
        });
      };
      const loadMessages = async () => {
        try {
          const res = await classApi.getMessages(classId.value, 1, 50);
          if (res.code === 200) {
            const records = res.data.records || res.data;
            messages.value = records.reverse();
            vue.nextTick(() => {
              scrollTop.value = 999999;
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/class-chat.vue:474", e);
        }
      };
      const loadMembers = async () => {
        var _a;
        try {
          const res = await classApi.getClassMembers(classId.value);
          if (res.code === 200) {
            members.value = res.data;
            memberCount.value = res.data.length;
            const userId = (_a = userStore.userInfo) == null ? void 0 : _a.userId;
            const currentMember = res.data.find((m) => String(m.userId) === String(userId));
            if (currentMember) {
              currentRole.value = currentMember.role;
              canManageMember.value = currentMember.role === "CREATOR" || currentMember.role === "TEACHER";
            }
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/class-chat.vue:493", e);
        }
      };
      const loadClassInfo = async () => {
        try {
          const res = await classApi.getById(classId.value);
          if (res.code === 200) {
            className.value = res.data.className;
            inviteCode.value = res.data.inviteCode || "";
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/class-chat.vue:505", e);
        }
      };
      onLoad((options) => {
        classId.value = options.id;
        loadClassInfo();
        loadMessages();
        loadMembers();
      });
      return (_ctx, _cache) => {
        var _a;
        return vue.openBlock(), vue.createElementBlock("view", { class: "class-chat" }, [
          vue.createVNode(CustomNavBar, {
            title: className.value,
            showBack: true
          }, null, 8, ["title"]),
          vue.createElementVNode("view", { class: "chat-header" }, [
            vue.createElementVNode("view", { class: "header-left" }, [
              vue.createElementVNode(
                "text",
                { class: "member-count" },
                vue.toDisplayString(memberCount.value) + " " + vue.toDisplayString(vue.unref(userStore).t("common.members")),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "header-right" }, [
              vue.createElementVNode("view", {
                class: "member-btn",
                onClick: _cache[0] || (_cache[0] = ($event) => showMembers.value = true)
              }, [
                vue.createElementVNode("text", { class: "btn-icon" }, "👥")
              ]),
              vue.createElementVNode("view", {
                class: "more-btn",
                onClick: _cache[1] || (_cache[1] = ($event) => showActions.value = true)
              }, [
                vue.createElementVNode("text", { class: "btn-icon" }, "☰")
              ])
            ])
          ]),
          vue.createElementVNode("scroll-view", {
            class: "chat-body",
            "scroll-y": "",
            "scroll-top": scrollTop.value
          }, [
            vue.createElementVNode("view", { class: "message-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(messages.value, (msg) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: msg.id,
                      class: vue.normalizeClass(["message-item", { "is-self": isSelfMessage(msg.senderId) }])
                    },
                    [
                      vue.createElementVNode("view", { class: "message-avatar" }, [
                        vue.createElementVNode("image", {
                          src: getSenderAvatar(msg.senderId),
                          mode: "aspectFill"
                        }, null, 8, ["src"])
                      ]),
                      vue.createElementVNode("view", { class: "message-content-wrapper" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "message-sender" },
                          vue.toDisplayString(getSenderName(msg.senderId)),
                          1
                          /* TEXT */
                        ),
                        !isExamNotice(msg) ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "message-bubble"
                        }, [
                          vue.createElementVNode(
                            "text",
                            { class: "message-text" },
                            vue.toDisplayString(msg.content),
                            1
                            /* TEXT */
                          )
                        ])) : (vue.openBlock(), vue.createElementBlock("view", {
                          key: 1,
                          class: "exam-notice"
                        }, [
                          vue.createElementVNode("view", { class: "notice-header" }, [
                            vue.createElementVNode("text", { class: "notice-icon" }, vue.toDisplayString(iconRocket)),
                            vue.createElementVNode(
                              "text",
                              { class: "notice-title" },
                              vue.toDisplayString(getNoticeTitle(msg.content)),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode("view", { class: "notice-badge" }, [
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(vue.unref(userStore).t("common.examNotice")),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          vue.createElementVNode("view", { class: "notice-info" }, [
                            vue.createElementVNode("view", { class: "info-item" }, [
                              vue.createElementVNode("text", { class: "info-icon" }, vue.toDisplayString(iconCalendar)),
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(getNoticeStartTime(msg.content)),
                                1
                                /* TEXT */
                              )
                            ]),
                            vue.createElementVNode("view", { class: "info-item" }, [
                              vue.createElementVNode("text", { class: "info-icon" }, vue.toDisplayString(iconTimer)),
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(getNoticeDuration(msg.content)) + vue.toDisplayString(vue.unref(userStore).t("common.minutes")),
                                1
                                /* TEXT */
                              )
                            ])
                          ])
                        ])),
                        vue.createElementVNode(
                          "text",
                          { class: "message-time" },
                          vue.toDisplayString(formatTime(msg.createTime)),
                          1
                          /* TEXT */
                        )
                      ])
                    ],
                    2
                    /* CLASS */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ], 8, ["scroll-top"]),
          vue.createElementVNode("view", { class: "chat-input-wrapper" }, [
            vue.createElementVNode("view", { class: "chat-input" }, [
              vue.withDirectives(vue.createElementVNode("input", {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => inputMessage.value = $event),
                placeholder: vue.unref(userStore).t("common.enterMessage"),
                onConfirm: sendMessage
              }, null, 40, ["placeholder"]), [
                [vue.vModelText, inputMessage.value]
              ]),
              vue.createElementVNode("button", {
                class: "send-btn",
                onClick: sendMessage,
                disabled: !inputMessage.value.trim()
              }, vue.toDisplayString(vue.unref(userStore).t("common.send")), 9, ["disabled"])
            ])
          ]),
          vue.createCommentVNode(" 成员列表弹窗 "),
          showMembers.value ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "modal",
            onClick: _cache[5] || (_cache[5] = ($event) => showMembers.value = false)
          }, [
            vue.createElementVNode("view", {
              class: "modal-content",
              onClick: _cache[4] || (_cache[4] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "modal-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "modal-title" },
                  vue.toDisplayString(vue.unref(userStore).t("common.classMembers")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", {
                  class: "modal-close",
                  onClick: _cache[3] || (_cache[3] = ($event) => showMembers.value = false)
                }, [
                  vue.createElementVNode("text", { class: "close-icon" }, "✕")
                ])
              ]),
              vue.createElementVNode("scroll-view", {
                class: "members-list",
                "scroll-y": ""
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(members.value, (member) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "member-item",
                      key: member.userId
                    }, [
                      vue.createElementVNode("view", { class: "member-info" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "member-name" },
                          vue.toDisplayString(member.realName),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["member-role", "role-" + member.role.toLowerCase()])
                          },
                          [
                            vue.createElementVNode(
                              "text",
                              null,
                              vue.toDisplayString(getRoleText(member.role)),
                              1
                              /* TEXT */
                            )
                          ],
                          2
                          /* CLASS */
                        )
                      ]),
                      member.muteUntil ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "mute-status"
                      }, [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(vue.unref(userStore).t("common.muted")),
                          1
                          /* TEXT */
                        )
                      ])) : vue.createCommentVNode("v-if", true),
                      canManageMember.value ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 1,
                        class: "member-actions"
                      }, [
                        !member.muteUntil ? (vue.openBlock(), vue.createElementBlock("button", {
                          key: 0,
                          class: "mute-btn",
                          onClick: ($event) => handleMute(member)
                        }, vue.toDisplayString(vue.unref(userStore).t("common.mute")), 9, ["onClick"])) : (vue.openBlock(), vue.createElementBlock("button", {
                          key: 1,
                          class: "unmute-btn",
                          onClick: ($event) => handleUnmute(member)
                        }, vue.toDisplayString(vue.unref(userStore).t("common.unmute")), 9, ["onClick"]))
                      ])) : vue.createCommentVNode("v-if", true)
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 操作面板 "),
          showActions.value ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "modal",
            onClick: _cache[8] || (_cache[8] = ($event) => showActions.value = false)
          }, [
            vue.createElementVNode("view", {
              class: "action-panel",
              onClick: _cache[7] || (_cache[7] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", {
                class: "action-item",
                onClick: handleSendExamNotice
              }, [
                vue.createElementVNode("text", { class: "action-icon" }, "📢"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(vue.unref(userStore).t("teacher.publishExam")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", {
                class: "action-item",
                onClick: handleInvite
              }, [
                vue.createElementVNode("text", { class: "action-icon" }, "👥"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(vue.unref(userStore).t("common.inviteMembers")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", {
                class: "action-item danger",
                onClick: _cache[6] || (_cache[6] = ($event) => showActions.value = false)
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(vue.unref(userStore).t("common.cancel")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 发布考试弹窗 "),
          showExamForm.value ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "modal",
            onClick: _cache[14] || (_cache[14] = ($event) => showExamForm.value = false)
          }, [
            vue.createElementVNode("view", {
              class: "exam-form-modal",
              onClick: _cache[13] || (_cache[13] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "modal-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "modal-title" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.publishExam")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", {
                  class: "modal-close",
                  onClick: _cache[9] || (_cache[9] = ($event) => showExamForm.value = false)
                }, [
                  vue.createElementVNode("text", { class: "close-icon" }, "✕")
                ])
              ]),
              vue.createElementVNode("scroll-view", {
                class: "form-body",
                "scroll-y": ""
              }, [
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "form-label" },
                    vue.toDisplayString(vue.unref(userStore).t("teacher.examTitle")),
                    1
                    /* TEXT */
                  ),
                  vue.withDirectives(vue.createElementVNode("input", {
                    class: "form-input",
                    "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => examForm.title = $event),
                    placeholder: vue.unref(userStore).t("teacher.enterExamTitle")
                  }, null, 8, ["placeholder"]), [
                    [vue.vModelText, examForm.title]
                  ])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "form-label" },
                    vue.toDisplayString(vue.unref(userStore).t("teacher.selectPaper")),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("picker", {
                    mode: "selector",
                    range: papers.value,
                    "range-key": "title",
                    onChange: onPaperChange,
                    "cancel-text": vue.unref(userStore).t("common.cancel"),
                    "confirm-text": vue.unref(userStore).t("common.confirm")
                  }, [
                    vue.createElementVNode("view", { class: "form-picker" }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(((_a = selectedPaper.value) == null ? void 0 : _a.title) || vue.unref(userStore).t("teacher.selectPaper")),
                        1
                        /* TEXT */
                      )
                    ])
                  ], 40, ["range", "cancel-text", "confirm-text"])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "form-label" },
                    vue.toDisplayString(vue.unref(userStore).t("teacher.duration")) + "(" + vue.toDisplayString(vue.unref(userStore).t("common.minutes")) + ")",
                    1
                    /* TEXT */
                  ),
                  vue.withDirectives(vue.createElementVNode("input", {
                    class: "form-input",
                    type: "number",
                    "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => examForm.duration = $event),
                    placeholder: vue.unref(userStore).t("teacher.enterDuration")
                  }, null, 8, ["placeholder"]), [
                    [vue.vModelText, examForm.duration]
                  ])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "form-label" },
                    vue.toDisplayString(vue.unref(userStore).t("teacher.startDate")),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("picker", {
                    mode: "date",
                    value: examForm.startDate,
                    onChange: onStartDateChange
                  }, [
                    vue.createElementVNode("view", { class: "form-picker" }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(examForm.startDate || vue.unref(userStore).t("common.selectDate")),
                        1
                        /* TEXT */
                      )
                    ])
                  ], 40, ["value"])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "form-label" },
                    vue.toDisplayString(vue.unref(userStore).t("teacher.startTime")),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("picker", {
                    mode: "time",
                    value: examForm.startTime,
                    onChange: onStartTimeChange
                  }, [
                    vue.createElementVNode("view", { class: "form-picker" }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(examForm.startTime || vue.unref(userStore).t("common.selectTime")),
                        1
                        /* TEXT */
                      )
                    ])
                  ], 40, ["value"])
                ])
              ]),
              vue.createElementVNode("view", { class: "modal-footer" }, [
                vue.createElementVNode(
                  "button",
                  {
                    class: "modal-btn cancel",
                    onClick: _cache[12] || (_cache[12] = ($event) => showExamForm.value = false)
                  },
                  vue.toDisplayString(vue.unref(userStore).t("common.cancel")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "button",
                  {
                    class: "modal-btn confirm",
                    onClick: submitExam
                  },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.publishExam")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  };
  const PagesTeacherClassChat = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["__scopeId", "data-v-a4d58c53"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/class-chat.vue"]]);
  const _sfc_main$i = {
    components: {
      CustomNavBar
    },
    setup() {
      const userStore = useUserStore();
      const keyword = vue.ref("");
      const subjectList = vue.ref([]);
      const showSubjectForm = vue.ref(false);
      const editingSubject = vue.ref(null);
      const form = vue.reactive({
        name: "",
        code: ""
      });
      const loadData = async () => {
        try {
          uni.showLoading({ title: userStore.t("common.loading") });
          const res = await subjectApi.page({ current: 1, size: 20, keyword: keyword.value });
          if (res.code === 200) {
            subjectList.value = res.data.records;
          }
        } catch (e) {
          uni.showToast({ title: userStore.t("common.loadFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const addSubject = () => {
        editingSubject.value = null;
        form.name = "";
        form.code = "";
        showSubjectForm.value = true;
      };
      const editSubject = (item) => {
        editingSubject.value = item;
        form.name = item.name;
        form.code = item.code || "";
        showSubjectForm.value = true;
      };
      const submitSubject = async () => {
        var _a;
        if (!form.name.trim()) {
          uni.showToast({ title: userStore.t("common.pleaseEnter") + userStore.t("common.subject") + userStore.t("common.name"), icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: userStore.t("common.saving") });
          const subjectData = {
            id: ((_a = editingSubject.value) == null ? void 0 : _a.id) || null,
            name: form.name,
            code: form.code
          };
          let res;
          if (editingSubject.value) {
            res = await subjectApi.update(subjectData);
          } else {
            res = await subjectApi.create(subjectData);
          }
          if (res.code === 200) {
            uni.showToast({ title: editingSubject.value ? userStore.t("common.updateSuccess") : userStore.t("common.createSuccess"), icon: "success" });
            showSubjectForm.value = false;
            loadData();
            resetForm();
          } else {
            uni.showToast({ title: res.message || userStore.t("common.saveFailed"), icon: "none" });
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/subject-manage.vue:154", e);
          uni.showToast({ title: userStore.t("common.saveFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const resetForm = () => {
        editingSubject.value = null;
        form.name = "";
        form.code = "";
      };
      const deleteSubject = async (item) => {
        uni.showModal({
          title: userStore.t("common.tip"),
          content: userStore.t("common.confirmDeleteSubject").replace("{name}", item.name),
          cancelText: userStore.t("common.cancel"),
          confirmText: userStore.t("common.confirm"),
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await subjectApi.delete(item.id);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.deleteSuccess"), icon: "success" });
                  loadData();
                } else {
                  uni.showToast({ title: userStore.t("common.deleteFailed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.deleteFailed"), icon: "none" });
              }
            }
          }
        });
      };
      vue.onMounted(() => {
        loadData();
      });
      return {
        keyword,
        subjectList,
        showSubjectForm,
        form,
        loadData,
        addSubject,
        editSubject,
        submitSubject,
        deleteSubject,
        userStore
      };
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "manage-page" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.subjectManage"),
        showBack: true
      }, null, 8, ["title"]),
      vue.createCommentVNode(" 搜索栏 "),
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.withDirectives(vue.createElementVNode("input", {
          class: "search-input",
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.keyword = $event),
          placeholder: $setup.userStore.t("common.searchPlaceholder"),
          onInput: _cache[1] || (_cache[1] = (...args) => _ctx.onSearchInput && _ctx.onSearchInput(...args))
        }, null, 40, ["placeholder"]), [
          [vue.vModelText, $setup.keyword]
        ]),
        vue.createElementVNode(
          "button",
          {
            class: "search-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $setup.loadData && $setup.loadData(...args))
          },
          vue.toDisplayString($setup.userStore.t("common.search")),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 科目列表 "),
      vue.createElementVNode("view", { class: "list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.subjectList, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "list-item",
              key: item.id
            }, [
              vue.createElementVNode("view", { class: "item-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "item-title" },
                  vue.toDisplayString(item.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "item-meta" },
                  vue.toDisplayString(item.code || "-"),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "item-actions" }, [
                vue.createElementVNode("text", {
                  class: "action-btn",
                  onClick: ($event) => $setup.editSubject(item)
                }, vue.toDisplayString($setup.userStore.t("common.edit")), 9, ["onClick"]),
                vue.createElementVNode("text", {
                  class: "action-btn danger",
                  onClick: ($event) => $setup.deleteSubject(item)
                }, vue.toDisplayString($setup.userStore.t("common.delete")), 9, ["onClick"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.subjectList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, [
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            vue.toDisplayString($setup.userStore.t("common.noData")),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 新增按钮 "),
      vue.createElementVNode("view", {
        class: "add-btn",
        onClick: _cache[3] || (_cache[3] = ($event) => $setup.showSubjectForm = true)
      }, [
        vue.createElementVNode("text", { class: "add-icon" }, "➕"),
        vue.createElementVNode(
          "text",
          { class: "add-text" },
          vue.toDisplayString($setup.userStore.t("common.add")) + vue.toDisplayString($setup.userStore.t("common.subject")),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 科目编辑弹窗 "),
      $setup.showSubjectForm ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal",
        onClick: _cache[10] || (_cache[10] = ($event) => $setup.showSubjectForm = false)
      }, [
        vue.createElementVNode("view", {
          class: "subject-modal",
          onClick: _cache[9] || (_cache[9] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString(_ctx.editingSubject ? $setup.userStore.t("common.edit") + $setup.userStore.t("common.subject") : $setup.userStore.t("common.add") + $setup.userStore.t("common.subject")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "modal-close",
              onClick: _cache[4] || (_cache[4] = ($event) => $setup.showSubjectForm = false)
            }, [
              vue.createElementVNode("text", { class: "close-icon" }, "✕")
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.subject")) + vue.toDisplayString($setup.userStore.t("common.name")) + " *",
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.form.name = $event),
                placeholder: $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.subject") + $setup.userStore.t("common.name")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.name]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.subject")) + vue.toDisplayString($setup.userStore.t("common.code")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.form.code = $event),
                placeholder: $setup.userStore.t("common.pleaseEnter") + $setup.userStore.t("common.subject") + $setup.userStore.t("common.code")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.code]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode(
              "button",
              {
                class: "modal-btn cancel",
                onClick: _cache[7] || (_cache[7] = ($event) => $setup.showSubjectForm = false)
              },
              vue.toDisplayString($setup.userStore.t("common.cancel")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "button",
              {
                class: "modal-btn confirm",
                onClick: _cache[8] || (_cache[8] = (...args) => $setup.submitSubject && $setup.submitSubject(...args))
              },
              vue.toDisplayString(_ctx.editingSubject ? $setup.userStore.t("common.save") : $setup.userStore.t("common.create")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesTeacherSubjectManage = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$1], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/subject-manage.vue"]]);
  const _sfc_main$h = {
    components: { CustomNavBar },
    setup() {
      const userStore = useUserStore();
      const keyword = vue.ref("");
      const questionList = vue.ref([]);
      const subjects = vue.ref([]);
      const selectedSubjectId = vue.ref(null);
      const selectedTypeId = vue.ref("");
      const showQuestionForm = vue.ref(false);
      const editingQuestion = vue.ref(null);
      const showImportModal = vue.ref(false);
      const importText = vue.ref("");
      const importSubject = vue.ref(null);
      const questionTypes = vue.computed(() => [
        { value: "SINGLE_CHOICE", label: userStore.t("common.singleChoice") },
        { value: "MULTIPLE_CHOICE", label: userStore.t("common.multipleChoice") },
        { value: "JUDGMENT", label: userStore.t("common.trueFalse") },
        { value: "FILL_BLANK", label: userStore.t("common.fillBlank") },
        { value: "ESSAY", label: userStore.t("common.shortAnswer") }
      ]);
      const form = vue.reactive({
        type: "SINGLE_CHOICE",
        subjectId: null,
        content: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        score: ""
      });
      const selectedFormType = vue.computed(() => {
        return questionTypes.value.find((t) => t.value === form.type) || {};
      });
      const selectedFormSubject = vue.computed(() => {
        return subjects.value.find((s) => String(s.id) === String(form.subjectId));
      });
      const subjectOptions = vue.computed(() => {
        return [{ id: null, name: userStore.t("common.all") }, ...subjects.value];
      });
      const selectedSubjectName = vue.computed(() => {
        const s = subjectOptions.value.find((s2) => String(s2.id) === String(selectedSubjectId.value));
        return (s == null ? void 0 : s.name) || "";
      });
      const selectedTypeName = vue.computed(() => {
        const t = questionTypes.value.find((t2) => t2.value === selectedTypeId.value);
        return (t == null ? void 0 : t.label) || "";
      });
      const typeText = (type) => {
        const map = {
          SINGLE_CHOICE: userStore.t("common.singleChoice"),
          MULTIPLE_CHOICE: userStore.t("common.multipleChoice"),
          JUDGMENT: userStore.t("common.judgment"),
          FILL_BLANK: userStore.t("common.fillBlank"),
          ESSAY: userStore.t("common.shortAnswer"),
          PROGRAMMING: userStore.t("common.programming")
        };
        return map[type] || type;
      };
      const getTypeClass = (type) => {
        const map = {
          SINGLE_CHOICE: "type-single",
          MULTIPLE_CHOICE: "type-multi",
          JUDGMENT: "type-judge",
          FILL_BLANK: "type-fill",
          ESSAY: "type-essay"
        };
        return map[type] || "";
      };
      const getSubjectName = (subjectId) => {
        const s = subjects.value.find((s2) => String(s2.id) === String(subjectId));
        return (s == null ? void 0 : s.name) || userStore.t("common.unknownSubject");
      };
      const truncate = (text, len) => {
        if (!text)
          return "-";
        return text.length > len ? text.substring(0, len) + "..." : text;
      };
      const onSubjectChange = (e) => {
        const index = e.detail.value;
        if (subjectOptions.value[index]) {
          selectedSubjectId.value = subjectOptions.value[index].id;
        } else {
          selectedSubjectId.value = null;
        }
        loadData();
      };
      const onTypeChange = (e) => {
        const index = e.detail.value;
        if (questionTypes.value[index]) {
          selectedTypeId.value = questionTypes.value[index].value;
        } else {
          selectedTypeId.value = "";
        }
        loadData();
      };
      const onFormTypeChange = (e) => {
        const index = e.detail.value;
        form.type = questionTypes.value[index].value;
        if (form.type === "JUDGMENT") {
          form.options = [userStore.t("common.correct"), userStore.t("common.wrong")];
        } else if (form.type === "ESSAY" || form.type === "FILL_BLANK") {
          form.options = [];
        } else {
          form.options = ["", "", "", ""];
        }
      };
      const onFormSubjectChange = (e) => {
        const index = e.detail.value;
        if (subjects.value[index]) {
          form.subjectId = subjects.value[index].id;
        }
      };
      const addOption = () => {
        if (form.options.length < 6) {
          form.options.push("");
        }
      };
      const removeOption = (idx) => {
        if (form.options.length > 2) {
          form.options.splice(idx, 1);
        }
      };
      const loadData = async () => {
        try {
          uni.showLoading({ title: userStore.t("common.loading") });
          const res = await questionApi.page({
            current: 1,
            size: 20,
            keyword: keyword.value,
            subjectId: selectedSubjectId.value,
            type: selectedTypeId.value
          });
          if (res.code === 200) {
            questionList.value = res.data.records;
          }
        } catch (e) {
          uni.showToast({ title: userStore.t("common.loadFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const loadSubjects = async () => {
        try {
          const res = await subjectApi.list();
          if (res.code === 200) {
            subjects.value = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/question-manage.vue:342", e);
        }
      };
      const editQuestion = async (item) => {
        editingQuestion.value = item;
        form.type = item.type;
        form.subjectId = item.subjectId;
        form.content = item.content;
        form.correctAnswer = item.answer || item.correctAnswer || "";
        form.score = item.score ? item.score.toString() : "";
        if (item.type === "JUDGMENT") {
          form.options = [userStore.t("common.correct"), userStore.t("common.wrong")];
        } else if (item.type === "ESSAY" || item.type === "FILL_BLANK") {
          form.options = [];
        } else {
          let opts = [];
          if (Array.isArray(item.options)) {
            if (item.options.length > 0 && typeof item.options[0] === "object") {
              opts = item.options.map((opt) => opt.content || opt.text || "");
            } else {
              opts = [...item.options];
            }
          } else if (typeof item.options === "string") {
            try {
              const parsed = JSON.parse(item.options);
              if (Array.isArray(parsed)) {
                if (parsed.length > 0 && typeof parsed[0] === "object") {
                  opts = parsed.map((opt) => opt.content || opt.text || "");
                } else {
                  opts = parsed;
                }
              }
            } catch (e) {
              opts = item.options.split("|").filter((o) => o.trim());
            }
          }
          while (opts.length < 4) {
            opts.push("");
          }
          form.options = opts;
        }
        showQuestionForm.value = true;
      };
      const submitQuestion = async () => {
        var _a;
        if (!form.content.trim()) {
          uni.showToast({ title: userStore.t("common.enterQuestionContent"), icon: "none" });
          return;
        }
        if (!form.subjectId) {
          uni.showToast({ title: userStore.t("common.selectSubject"), icon: "none" });
          return;
        }
        if (!form.correctAnswer.trim()) {
          uni.showToast({ title: userStore.t("common.enterCorrectAnswer"), icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: userStore.t("common.saving") });
          const questionData = {
            id: ((_a = editingQuestion.value) == null ? void 0 : _a.id) || null,
            type: form.type,
            subjectId: form.subjectId,
            content: form.content,
            options: form.options.filter((o) => o.trim()).join("|"),
            answer: form.correctAnswer,
            score: form.score ? parseInt(form.score) : 10
          };
          let res;
          if (editingQuestion.value) {
            res = await questionApi.update(questionData);
          } else {
            res = await questionApi.create(questionData);
          }
          if (res.code === 200) {
            uni.showToast({ title: editingQuestion.value ? userStore.t("common.updateSuccess") : userStore.t("common.createSuccess"), icon: "success" });
            showQuestionForm.value = false;
            loadData();
            resetForm();
          } else {
            uni.showToast({ title: res.message || userStore.t("common.saveFailed"), icon: "none" });
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/question-manage.vue:432", e);
          uni.showToast({ title: userStore.t("common.saveFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const resetForm = () => {
        editingQuestion.value = null;
        form.type = "SINGLE_CHOICE";
        form.subjectId = null;
        form.content = "";
        form.options = ["", "", "", ""];
        form.correctAnswer = "";
        form.score = "";
      };
      const onImportSubjectChange = (e) => {
        importSubject.value = subjects.value[e.detail.value];
      };
      const submitImport = async () => {
        var _a, _b, _c, _d, _e, _f;
        if (!importSubject.value) {
          uni.showToast({ title: userStore.t("common.selectSubject"), icon: "none" });
          return;
        }
        if (!importText.value.trim()) {
          uni.showToast({ title: userStore.t("common.enterImportText"), icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: userStore.t("common.importing") });
          const lines = importText.value.trim().split("\n");
          const questions = [];
          for (const line of lines) {
            const parts = line.split("|");
            if (parts.length < 3)
              continue;
            const typeMap = {
              "单选": "SINGLE_CHOICE",
              "多选": "MULTIPLE_CHOICE",
              "判断": "JUDGMENT",
              "填空": "FILL_BLANK",
              "简答": "ESSAY",
              "Single": "SINGLE_CHOICE",
              "Multi": "MULTIPLE_CHOICE",
              "Judge": "JUDGMENT",
              "Fill": "FILL_BLANK",
              "Essay": "ESSAY"
            };
            const typeKey = parts[0].trim();
            const type = typeMap[typeKey];
            if (!type)
              continue;
            const question = {
              type,
              subjectId: importSubject.value.id,
              content: ((_a = parts[1]) == null ? void 0 : _a.trim()) || "",
              correctAnswer: "",
              score: 10
            };
            if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
              if (parts.length >= 8) {
                question.options = [parts[2], parts[3], parts[4], parts[5]].filter((p) => p == null ? void 0 : p.trim()).join("|");
                question.correctAnswer = ((_b = parts[6]) == null ? void 0 : _b.trim()) || "";
                question.score = parseInt(parts[7]) || 10;
              }
            } else if (type === "JUDGMENT") {
              if (parts.length >= 4) {
                question.options = userStore.t("common.correct") + "|" + userStore.t("common.wrong");
                question.correctAnswer = ((_c = parts[2]) == null ? void 0 : _c.trim()) === "正确" || ((_d = parts[2]) == null ? void 0 : _d.trim()) === "A" ? "A" : "B";
                question.score = parseInt(parts[3]) || 10;
              }
            } else if (type === "FILL_BLANK") {
              if (parts.length >= 4) {
                question.correctAnswer = ((_e = parts[2]) == null ? void 0 : _e.trim()) || "";
                question.score = parseInt(parts[3]) || 10;
              }
            } else if (type === "ESSAY") {
              if (parts.length >= 4) {
                question.correctAnswer = ((_f = parts[2]) == null ? void 0 : _f.trim()) || "";
                question.score = parseInt(parts[3]) || 10;
              }
            }
            if (question.content && question.correctAnswer) {
              questions.push(question);
            }
          }
          if (questions.length === 0) {
            uni.showToast({ title: userStore.t("common.noValidQuestions"), icon: "none" });
            return;
          }
          let successCount = 0;
          for (const q of questions) {
            try {
              const res = await questionApi.create(q);
              if (res.code === 200)
                successCount++;
            } catch (e) {
              formatAppLog("error", "at pages/teacher/question-manage.vue:539", "导入单题失败:", e);
            }
          }
          uni.showToast({ title: userStore.t("common.importComplete") + ` ${successCount}/${questions.length}`, icon: "success" });
          showImportModal.value = false;
          importText.value = "";
          importSubject.value = null;
          loadData();
        } catch (e) {
          formatAppLog("error", "at pages/teacher/question-manage.vue:550", e);
          uni.showToast({ title: userStore.t("common.importFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const copyExample = (text) => {
        uni.setClipboardData({
          data: text,
          success: () => {
            uni.showToast({ title: userStore.t("common.copySuccess"), icon: "success", duration: 1500 });
          },
          fail: () => {
            uni.showToast({ title: userStore.t("common.copyFailed"), icon: "none" });
          }
        });
      };
      const deleteQuestion = async (item) => {
        uni.showModal({
          title: userStore.t("common.tip"),
          content: userStore.t("common.confirmDelete"),
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await questionApi.delete(item.id);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.deleteSuccess"), icon: "success" });
                  loadData();
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.deleteFailed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.deleteFailed"), icon: "none" });
              }
            }
          }
        });
      };
      const setPageTitle = () => {
        uni.setNavigationBarTitle({
          title: userStore.t("common.questionManage")
        });
      };
      vue.onMounted(() => {
        loadSubjects();
        loadData();
        setPageTitle();
      });
      vue.watch(() => userStore.language, () => {
        setPageTitle();
      });
      return {
        keyword,
        questionList,
        subjects,
        questionTypes,
        subjectOptions,
        selectedSubjectName,
        selectedTypeName,
        showQuestionForm,
        editingQuestion,
        selectedFormType,
        selectedFormSubject,
        form,
        showImportModal,
        importText,
        importSubject,
        typeText,
        getTypeClass,
        getSubjectName,
        truncate,
        onSubjectChange,
        onTypeChange,
        onFormTypeChange,
        onFormSubjectChange,
        onImportSubjectChange,
        addOption,
        removeOption,
        loadData,
        editQuestion,
        submitQuestion,
        submitImport,
        copyExample,
        deleteQuestion,
        userStore
      };
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    var _a, _b;
    const _component_CustomNavBar = vue.resolveComponent("CustomNavBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "manage-page" }, [
      vue.createVNode(_component_CustomNavBar, {
        title: $setup.userStore.t("common.questionManage"),
        showBack: true
      }, null, 8, ["title"]),
      vue.createCommentVNode(" 搜索栏 "),
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.createElementVNode("picker", {
          mode: "selector",
          range: $setup.subjectOptions,
          "range-key": "name",
          onChange: _cache[0] || (_cache[0] = (...args) => $setup.onSubjectChange && $setup.onSubjectChange(...args))
        }, [
          vue.createElementVNode("view", { class: "picker" }, [
            vue.createElementVNode(
              "text",
              { class: "picker-text" },
              vue.toDisplayString($setup.selectedSubjectName || $setup.userStore.t("common.selectSubject")),
              1
              /* TEXT */
            )
          ])
        ], 40, ["range"]),
        vue.createElementVNode("picker", {
          mode: "selector",
          range: $setup.questionTypes,
          "range-key": "label",
          onChange: _cache[1] || (_cache[1] = (...args) => $setup.onTypeChange && $setup.onTypeChange(...args))
        }, [
          vue.createElementVNode("view", { class: "picker" }, [
            vue.createElementVNode(
              "text",
              { class: "picker-text" },
              vue.toDisplayString($setup.selectedTypeName || $setup.userStore.t("common.questionType")),
              1
              /* TEXT */
            )
          ])
        ], 40, ["range"]),
        vue.withDirectives(vue.createElementVNode("input", {
          class: "search-input",
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.keyword = $event),
          placeholder: $setup.userStore.t("common.searchPlaceholder")
        }, null, 8, ["placeholder"]), [
          [vue.vModelText, $setup.keyword]
        ]),
        vue.createElementVNode(
          "button",
          {
            class: "search-btn",
            onClick: _cache[3] || (_cache[3] = (...args) => $setup.loadData && $setup.loadData(...args))
          },
          vue.toDisplayString($setup.userStore.t("common.search")),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 题目列表 "),
      vue.createElementVNode("view", { class: "list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.questionList, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "list-item",
              key: item.id
            }, [
              vue.createElementVNode("view", { class: "item-info" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["type-tag", $setup.getTypeClass(item.type)])
                  },
                  vue.toDisplayString($setup.typeText(item.type)),
                  3
                  /* TEXT, CLASS */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "item-title" },
                  vue.toDisplayString($setup.truncate(item.content, 50)),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "item-meta" },
                  vue.toDisplayString($setup.userStore.t("common.score")) + "：" + vue.toDisplayString(item.score) + " | " + vue.toDisplayString($setup.getSubjectName(item.subjectId)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "item-actions" }, [
                vue.createElementVNode("text", {
                  class: "action-btn",
                  onClick: ($event) => $setup.editQuestion(item)
                }, vue.toDisplayString($setup.userStore.t("common.edit")), 9, ["onClick"]),
                vue.createElementVNode("text", {
                  class: "action-btn danger",
                  onClick: ($event) => $setup.deleteQuestion(item)
                }, vue.toDisplayString($setup.userStore.t("common.delete")), 9, ["onClick"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.questionList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, [
          vue.createElementVNode(
            "text",
            { class: "empty-text" },
            vue.toDisplayString($setup.userStore.t("common.noData")),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 新增按钮 "),
      vue.createElementVNode("view", {
        class: "add-btn",
        onClick: _cache[4] || (_cache[4] = ($event) => $setup.showQuestionForm = true)
      }, [
        vue.createElementVNode("text", { class: "add-icon" }, "➕"),
        vue.createElementVNode(
          "text",
          { class: "add-text" },
          vue.toDisplayString($setup.userStore.t("common.addQuestion")),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 批量导入按钮 "),
      vue.createElementVNode("view", {
        class: "import-btn",
        onClick: _cache[5] || (_cache[5] = ($event) => $setup.showImportModal = true)
      }, [
        vue.createElementVNode("text", { class: "import-icon" }, "📤"),
        vue.createElementVNode(
          "text",
          { class: "import-text" },
          vue.toDisplayString($setup.userStore.t("common.batchImport")),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 题目编辑弹窗 "),
      $setup.showQuestionForm ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal",
        onClick: _cache[16] || (_cache[16] = ($event) => $setup.showQuestionForm = false)
      }, [
        vue.createElementVNode("view", {
          class: "question-modal",
          onClick: _cache[15] || (_cache[15] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString($setup.editingQuestion ? $setup.userStore.t("common.editQuestion") : $setup.userStore.t("common.addQuestion")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "modal-close",
              onClick: _cache[6] || (_cache[6] = ($event) => $setup.showQuestionForm = false)
            }, [
              vue.createElementVNode("text", { class: "close-icon" }, "✕")
            ])
          ]),
          vue.createElementVNode("scroll-view", {
            class: "modal-body",
            "scroll-y": ""
          }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.questionType")) + " *",
                1
                /* TEXT */
              ),
              vue.createElementVNode("picker", {
                mode: "selector",
                range: $setup.questionTypes,
                "range-key": "label",
                onChange: _cache[7] || (_cache[7] = (...args) => $setup.onFormTypeChange && $setup.onFormTypeChange(...args))
              }, [
                vue.createElementVNode("view", { class: "form-picker" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($setup.selectedFormType.label || $setup.userStore.t("common.selectQuestionType")),
                    1
                    /* TEXT */
                  )
                ])
              ], 40, ["range"])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.subject")) + " *",
                1
                /* TEXT */
              ),
              vue.createElementVNode("picker", {
                mode: "selector",
                range: $setup.subjects,
                "range-key": "name",
                onChange: _cache[8] || (_cache[8] = (...args) => $setup.onFormSubjectChange && $setup.onFormSubjectChange(...args))
              }, [
                vue.createElementVNode("view", { class: "form-picker" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(((_a = $setup.selectedFormSubject) == null ? void 0 : _a.name) || $setup.userStore.t("common.selectSubject")),
                    1
                    /* TEXT */
                  )
                ])
              ], 40, ["range"])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.questionContent")) + " *",
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("textarea", {
                class: "form-textarea",
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $setup.form.content = $event),
                placeholder: $setup.userStore.t("common.enterQuestionContent")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.content]
              ])
            ]),
            $setup.form.type !== "ESSAY" && $setup.form.type !== "FILL_BLANK" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "form-item"
            }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.options")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "options-list" }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.form.options, (opt, idx) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "option-item",
                      key: idx
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "option-label" },
                        vue.toDisplayString(String.fromCharCode(65 + idx)) + ".",
                        1
                        /* TEXT */
                      ),
                      vue.withDirectives(vue.createElementVNode("input", {
                        class: "option-input",
                        "onUpdate:modelValue": ($event) => $setup.form.options[idx] = $event,
                        placeholder: $setup.userStore.t("common.option") + String.fromCharCode(65 + idx)
                      }, null, 8, ["onUpdate:modelValue", "placeholder"]), [
                        [vue.vModelText, $setup.form.options[idx]]
                      ]),
                      $setup.form.options.length > 2 ? (vue.openBlock(), vue.createElementBlock("text", {
                        key: 0,
                        class: "option-delete",
                        onClick: ($event) => $setup.removeOption(idx)
                      }, "✕", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              $setup.form.options.length < 6 ? (vue.openBlock(), vue.createElementBlock(
                "button",
                {
                  key: 0,
                  class: "add-option-btn",
                  onClick: _cache[10] || (_cache[10] = (...args) => $setup.addOption && $setup.addOption(...args))
                },
                vue.toDisplayString($setup.userStore.t("common.addOption")),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.correctAnswer")) + " *",
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $setup.form.correctAnswer = $event),
                placeholder: $setup.userStore.t("common.enterCorrectAnswer")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.correctAnswer]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.score")),
                1
                /* TEXT */
              ),
              vue.withDirectives(vue.createElementVNode("input", {
                class: "form-input",
                type: "number",
                "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => $setup.form.score = $event),
                placeholder: $setup.userStore.t("common.enterScore")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.form.score]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode(
              "button",
              {
                class: "modal-btn cancel",
                onClick: _cache[13] || (_cache[13] = ($event) => $setup.showQuestionForm = false)
              },
              vue.toDisplayString($setup.userStore.t("common.cancel")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "button",
              {
                class: "modal-btn confirm",
                onClick: _cache[14] || (_cache[14] = (...args) => $setup.submitQuestion && $setup.submitQuestion(...args))
              },
              vue.toDisplayString($setup.editingQuestion ? $setup.userStore.t("common.save") : $setup.userStore.t("common.create")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 批量导入弹窗 "),
      $setup.showImportModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "modal",
        onClick: _cache[28] || (_cache[28] = ($event) => $setup.showImportModal = false)
      }, [
        vue.createElementVNode("view", {
          class: "import-modal",
          onClick: _cache[27] || (_cache[27] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString($setup.userStore.t("common.batchImport")),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "modal-close",
              onClick: _cache[17] || (_cache[17] = ($event) => $setup.showImportModal = false)
            }, [
              vue.createElementVNode("text", { class: "close-icon" }, "✕")
            ])
          ]),
          vue.createElementVNode("scroll-view", {
            class: "modal-body",
            "scroll-y": ""
          }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.subject")) + " *",
                1
                /* TEXT */
              ),
              vue.createElementVNode("picker", {
                mode: "selector",
                range: $setup.subjects,
                "range-key": "name",
                onChange: _cache[18] || (_cache[18] = (...args) => $setup.onImportSubjectChange && $setup.onImportSubjectChange(...args))
              }, [
                vue.createElementVNode("view", { class: "form-picker" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(((_b = $setup.importSubject) == null ? void 0 : _b.name) || $setup.userStore.t("common.selectSubject")),
                    1
                    /* TEXT */
                  )
                ])
              ], 40, ["range"])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode(
                "text",
                { class: "form-label" },
                vue.toDisplayString($setup.userStore.t("common.importText")) + " *",
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "form-hint" }, [
                vue.createElementVNode(
                  "text",
                  { class: "hint-title" },
                  vue.toDisplayString($setup.userStore.t("common.formatDesc")) + "：",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "hint-example" }, [
                  vue.createElementVNode("view", {
                    class: "hint-line",
                    onClick: _cache[19] || (_cache[19] = ($event) => $setup.copyExample("单选|Question content?|Option A|Option B|Option C|Option D|A|5"))
                  }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($setup.userStore.language === "zh" ? "单选|题目内容是什么？|选项A内容|选项B内容|选项C内容|选项D内容|A|5" : "Single|Question content?|Option A|Option B|Option C|Option D|A|5"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "copy-icon" }, "📋")
                  ]),
                  vue.createElementVNode("view", {
                    class: "hint-line",
                    onClick: _cache[20] || (_cache[20] = ($event) => $setup.copyExample("多选|Which are correct?|Option A|Option B|Option C|Option D|A,C|10"))
                  }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($setup.userStore.language === "zh" ? "多选|哪些是正确的？|选项A|选项B|选项C|选项D|A,C|10" : "Multi|Which are correct?|Option A|Option B|Option C|Option D|A,C|10"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "copy-icon" }, "📋")
                  ]),
                  vue.createElementVNode("view", {
                    class: "hint-line",
                    onClick: _cache[21] || (_cache[21] = ($event) => $setup.copyExample("判断|This statement is true|A|2"))
                  }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($setup.userStore.language === "zh" ? "判断|这句话是正确的|A|2" : "Judge|This statement is true|A|2"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "copy-icon" }, "📋")
                  ]),
                  vue.createElementVNode("view", {
                    class: "hint-line",
                    onClick: _cache[22] || (_cache[22] = ($event) => $setup.copyExample("填空|Answer is ____|Answer content|5"))
                  }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($setup.userStore.language === "zh" ? "填空|答案是____|答案内容|5" : "Fill|Answer is ____|Answer content|5"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "copy-icon" }, "📋")
                  ]),
                  vue.createElementVNode("view", {
                    class: "hint-line",
                    onClick: _cache[23] || (_cache[23] = ($event) => $setup.copyExample("简答|Please describe|Reference answer|15"))
                  }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($setup.userStore.language === "zh" ? "简答|请简述原理|参考答案内容|15" : "Essay|Please describe|Reference answer|15"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "copy-icon" }, "📋")
                  ])
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "hint-note" },
                  vue.toDisplayString($setup.userStore.t("common.importNote")),
                  1
                  /* TEXT */
                )
              ]),
              vue.withDirectives(vue.createElementVNode("textarea", {
                class: "form-textarea",
                "onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => $setup.importText = $event),
                placeholder: $setup.userStore.t("common.pasteQuestionText")
              }, null, 8, ["placeholder"]), [
                [vue.vModelText, $setup.importText]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode(
              "button",
              {
                class: "modal-btn cancel",
                onClick: _cache[25] || (_cache[25] = ($event) => $setup.showImportModal = false)
              },
              vue.toDisplayString($setup.userStore.t("common.cancel")),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "button",
              {
                class: "modal-btn confirm",
                onClick: _cache[26] || (_cache[26] = (...args) => $setup.submitImport && $setup.submitImport(...args))
              },
              vue.toDisplayString($setup.userStore.t("common.import")),
              1
              /* TEXT */
            )
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesTeacherQuestionManage = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/question-manage.vue"]]);
  const _sfc_main$g = {
    __name: "paper-manage",
    setup(__props) {
      const userStore = useUserStore();
      const tableData = vue.ref([]);
      const subjects = vue.ref([]);
      const params = vue.ref({
        subjectId: "",
        status: "",
        keyword: ""
      });
      const loadStatus = vue.ref("more");
      const current = vue.ref(1);
      const size = vue.ref(10);
      const subjectOptions = vue.computed(() => {
        return [{ id: "", name: userStore.t("common.allSubjects") }, ...subjects.value];
      });
      const statusOptions = vue.computed(() => [
        { value: "", label: userStore.t("common.allStatus") },
        { value: "DRAFT", label: userStore.t("common.draft") },
        { value: "PUBLISHED", label: userStore.t("common.published") }
      ]);
      const currentSubjectText = vue.computed(() => {
        const option = subjectOptions.value.find((s) => s.id === params.value.subjectId);
        return option ? option.name : userStore.t("common.allSubjects");
      });
      const currentStatusText = vue.computed(() => {
        const option = statusOptions.value.find((s) => s.value === params.value.status);
        return option ? option.label : userStore.t("common.allStatus");
      });
      const getSubjectName = (subjectId) => {
        const subject = subjects.value.find((s) => s.id === subjectId);
        return subject ? subject.name : userStore.t("common.unknownSubject");
      };
      const onSubjectChange = (e) => {
        const index = e.detail.value;
        params.value.subjectId = subjectOptions.value[index].id;
        loadData();
      };
      const onStatusChange = (e) => {
        const index = e.detail.value;
        params.value.status = statusOptions[index].value;
        loadData();
      };
      const handleCreate = () => {
        uni.navigateTo({ url: "/pages/teacher/paper-edit" });
      };
      const handleEdit = (item) => {
        uni.navigateTo({ url: `/pages/teacher/paper-edit?id=${item.id}` });
      };
      const handlePreview = (item) => {
        uni.navigateTo({ url: `/pages/teacher/paper-preview?id=${item.id}` });
      };
      const handlePublish = async (item) => {
        uni.showModal({
          title: userStore.t("common.tip"),
          content: userStore.t("common.confirmPublish"),
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await paperApi$1.publish(item.id);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.publishedSuccess"), icon: "success" });
                  loadData();
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.operationFailed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
              }
            }
          }
        });
      };
      const handleDelete = async (item) => {
        uni.showModal({
          title: userStore.t("common.warning"),
          content: userStore.t("common.confirmDelete"),
          cancelText: userStore.t("common.cancel"),
          confirmText: userStore.t("common.confirm"),
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await paperApi$1.delete(item.id);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.deletedSuccess"), icon: "success" });
                  loadData();
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.operationFailed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
              }
            }
          }
        });
      };
      const loadSubjects = async () => {
        try {
          const res = await subjectApi.list();
          if (res.code === 200) {
            subjects.value = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/paper-manage.vue:186", e);
        }
      };
      const loadData = async () => {
        if (loadStatus.value === "loading")
          return;
        loadStatus.value = "loading";
        current.value = 1;
        tableData.value = [];
        try {
          const res = await paperApi$1.page({
            current: current.value,
            size: size.value,
            subjectId: params.value.subjectId,
            status: params.value.status,
            keyword: params.value.keyword
          });
          if (res.code === 200) {
            tableData.value = res.data.records;
            loadStatus.value = res.data.records.length >= size.value ? "more" : "noMore";
          } else {
            uni.showToast({ title: res.message || userStore.t("common.loadFailed"), icon: "none" });
            loadStatus.value = "more";
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/paper-manage.vue:212", e);
          uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
          loadStatus.value = "more";
        }
      };
      vue.onMounted(() => {
        loadSubjects();
        loadData();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "paper-manage" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.paperManage"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createCommentVNode(" 工具栏 "),
          vue.createElementVNode("view", { class: "toolbar" }, [
            vue.createElementVNode("view", { class: "toolbar-left" }, [
              vue.createElementVNode("picker", {
                mode: "selector",
                range: vue.unref(subjectOptions),
                "range-key": "name",
                onChange: onSubjectChange
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "picker" },
                  vue.toDisplayString(vue.unref(currentSubjectText)),
                  1
                  /* TEXT */
                )
              ], 40, ["range"]),
              vue.createElementVNode("picker", {
                mode: "selector",
                range: vue.unref(statusOptions),
                "range-key": "label",
                onChange: onStatusChange
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "picker" },
                  vue.toDisplayString(vue.unref(currentStatusText)),
                  1
                  /* TEXT */
                )
              ], 40, ["range"])
            ]),
            vue.createElementVNode(
              "button",
              {
                class: "create-btn",
                onClick: handleCreate
              },
              vue.toDisplayString(vue.unref(userStore).t("common.createPaper")),
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 试卷列表 "),
          vue.createElementVNode("view", { class: "paper-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(tableData.value, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "paper-item",
                  key: item.id
                }, [
                  vue.createElementVNode("view", { class: "paper-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "paper-title" },
                      vue.toDisplayString(item.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["paper-status", item.status === "PUBLISHED" ? "status-success" : "status-info"])
                      },
                      [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(item.status === "PUBLISHED" ? vue.unref(userStore).t("common.published") : vue.unref(userStore).t("common.draft")),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "paper-info" }, [
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "📚"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.subject")) + "：" + vue.toDisplayString(getSubjectName(item.subjectId)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "📝"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.questionCount")) + "：" + vue.toDisplayString(item.questionCount) + vue.toDisplayString(vue.unref(userStore).t("common.questions")),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "🏆"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.totalScore")) + "：" + vue.toDisplayString(item.totalScore) + vue.toDisplayString(vue.unref(userStore).t("common.score")),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "⏱"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.duration")) + "：" + vue.toDisplayString(item.duration) + vue.toDisplayString(vue.unref(userStore).t("common.minutes")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "paper-actions" }, [
                    vue.createElementVNode("button", {
                      class: "action-btn",
                      onClick: ($event) => handleEdit(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("common.edit")), 9, ["onClick"]),
                    vue.createElementVNode("button", {
                      class: "action-btn",
                      onClick: ($event) => handlePreview(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("common.preview")), 9, ["onClick"]),
                    item.status === "DRAFT" ? (vue.openBlock(), vue.createElementBlock("button", {
                      key: 0,
                      class: "action-btn success",
                      onClick: ($event) => handlePublish(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("common.publish")), 9, ["onClick"])) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode("button", {
                      class: "action-btn danger",
                      onClick: ($event) => handleDelete(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("common.delete")), 9, ["onClick"])
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          loadStatus.value === "loading" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "load-more"
          }, [
            vue.createElementVNode(
              "text",
              { class: "loading-text" },
              vue.toDisplayString(vue.unref(userStore).t("common.loading")) + "...",
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          loadStatus.value === "noMore" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "load-more"
          }, [
            vue.createElementVNode(
              "text",
              { class: "loading-text" },
              vue.toDisplayString(vue.unref(userStore).t("common.noMoreData")),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  };
  const PagesTeacherPaperManage = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__scopeId", "data-v-1f88a9f4"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/paper-manage.vue"]]);
  const _sfc_main$f = {
    __name: "exam-manage",
    setup(__props) {
      const userStore = useUserStore();
      const tableData = vue.ref([]);
      const subjects = vue.ref([]);
      const params = vue.ref({
        subjectId: "",
        status: "",
        keyword: ""
      });
      const loadStatus = vue.ref("more");
      const current = vue.ref(1);
      const size = vue.ref(10);
      const subjectOptions = vue.computed(() => {
        return [{ id: "", name: userStore.t("common.allSubjects") }, ...subjects.value];
      });
      const statusOptions = vue.computed(() => [
        { value: "", label: userStore.t("common.allStatus") },
        { value: "PENDING", label: userStore.t("common.pending") },
        { value: "ONGOING", label: userStore.t("common.ongoing") },
        { value: "FINISHED", label: userStore.t("common.finished") }
      ]);
      const currentSubjectText = vue.computed(() => {
        const option = subjectOptions.value.find((s) => s.id === params.value.subjectId);
        return option ? option.name : userStore.t("common.allSubjects");
      });
      const currentStatusText = vue.computed(() => {
        const option = statusOptions.value.find((s) => s.value === params.value.status);
        return option ? option.label : userStore.t("common.allStatus");
      });
      const statusText = (status) => {
        return {
          PENDING: userStore.t("common.pending"),
          ONGOING: userStore.t("common.ongoing"),
          FINISHED: userStore.t("common.finished")
        }[status] || status;
      };
      const getSubjectName = (subjectId) => {
        const subject = subjects.value.find((s) => s.id === subjectId);
        return subject ? subject.name : userStore.t("common.unknownSubject");
      };
      const formatDateTime = (time) => {
        if (!time)
          return "";
        const date = new Date(time);
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        } else {
          return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
        }
      };
      const onSubjectChange = (e) => {
        const index = e.detail.value;
        params.value.subjectId = subjectOptions.value[index].id;
        loadData();
      };
      const onStatusChange = (e) => {
        const index = e.detail.value;
        params.value.status = statusOptions[index].value;
        loadData();
      };
      const handleCreate = () => {
        uni.navigateTo({ url: "/pages/teacher/exam-edit" });
      };
      const handleMonitor = (item) => {
        uni.navigateTo({ url: `/pages/teacher/exam-monitor?id=${item.id}` });
      };
      const handleEdit = (item) => {
        uni.navigateTo({ url: `/pages/teacher/exam-edit?id=${item.id}` });
      };
      const handleStart = async (item) => {
        uni.showModal({
          title: userStore.t("common.tip"),
          content: userStore.t("common.confirmStart"),
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await examApi.start(item.id);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.examStarted"), icon: "success" });
                  loadData();
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.operationFailed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
              }
            }
          }
        });
      };
      const handleFinish = async (item) => {
        uni.showModal({
          title: userStore.t("common.tip"),
          content: userStore.t("common.confirmFinish"),
          success: async (res) => {
            if (res.confirm) {
              try {
                const result = await examApi.finish(item.id);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.examFinished"), icon: "success" });
                  loadData();
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.operationFailed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
              }
            }
          }
        });
      };
      const handleStats = (item) => {
        uni.navigateTo({
          url: `/pages/admin/statistics?examId=${item.id}`
        });
      };
      const loadSubjects = async () => {
        try {
          const res = await subjectApi.list();
          if (res.code === 200) {
            subjects.value = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-manage.vue:215", e);
        }
      };
      const loadData = async () => {
        if (loadStatus.value === "loading")
          return;
        loadStatus.value = "loading";
        current.value = 1;
        tableData.value = [];
        try {
          const res = await examApi.page({
            current: current.value,
            size: size.value,
            subjectId: params.value.subjectId,
            status: params.value.status,
            keyword: params.value.keyword
          });
          if (res.code === 200) {
            tableData.value = res.data.records;
            loadStatus.value = res.data.records.length >= size.value ? "more" : "noMore";
          } else {
            uni.showToast({ title: res.message || userStore.t("common.loadFailed"), icon: "none" });
            loadStatus.value = "more";
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-manage.vue:241", e);
          uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
          loadStatus.value = "more";
        }
      };
      vue.onMounted(() => {
        loadSubjects();
        loadData();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "exam-manage" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.examManage"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createCommentVNode(" 工具栏 "),
          vue.createElementVNode("view", { class: "toolbar" }, [
            vue.createElementVNode("view", { class: "toolbar-left" }, [
              vue.createElementVNode("picker", {
                mode: "selector",
                range: vue.unref(subjectOptions),
                "range-key": "name",
                onChange: onSubjectChange
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "picker" },
                  vue.toDisplayString(vue.unref(currentSubjectText)),
                  1
                  /* TEXT */
                )
              ], 40, ["range"]),
              vue.createElementVNode("picker", {
                mode: "selector",
                range: vue.unref(statusOptions),
                "range-key": "label",
                onChange: onStatusChange
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "picker" },
                  vue.toDisplayString(vue.unref(currentStatusText)),
                  1
                  /* TEXT */
                )
              ], 40, ["range"])
            ]),
            vue.createElementVNode(
              "button",
              {
                class: "create-btn",
                onClick: handleCreate
              },
              vue.toDisplayString(vue.unref(userStore).t("common.publishExam")),
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 考试列表 "),
          vue.createElementVNode("view", { class: "exam-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(tableData.value, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "exam-item",
                  key: item.id
                }, [
                  vue.createElementVNode("view", { class: "exam-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "exam-title" },
                      vue.toDisplayString(item.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["exam-status", "status-" + item.status.toLowerCase()])
                      },
                      [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(statusText(item.status)),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "exam-info" }, [
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "📚"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.subject")) + "：" + vue.toDisplayString(getSubjectName(item.subjectId)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "⏱"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.duration")) + "：" + vue.toDisplayString(item.duration) + vue.toDisplayString(vue.unref(userStore).t("common.minutes")),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "📅"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.startTime")) + "：" + vue.toDisplayString(formatDateTime(item.startTime)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "🏆"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.totalScore")) + "：" + vue.toDisplayString(item.totalScore) + vue.toDisplayString(vue.unref(userStore).t("common.score")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "exam-actions" }, [
                    vue.createElementVNode("button", {
                      class: "action-btn",
                      onClick: ($event) => handleMonitor(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("common.monitor")), 9, ["onClick"]),
                    vue.createElementVNode("button", {
                      class: "action-btn",
                      onClick: ($event) => handleEdit(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("common.edit")), 9, ["onClick"]),
                    item.status === "PENDING" ? (vue.openBlock(), vue.createElementBlock("button", {
                      key: 0,
                      class: "action-btn success",
                      onClick: ($event) => handleStart(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("common.start")), 9, ["onClick"])) : vue.createCommentVNode("v-if", true),
                    item.status === "ONGOING" ? (vue.openBlock(), vue.createElementBlock("button", {
                      key: 1,
                      class: "action-btn warning",
                      onClick: ($event) => handleFinish(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("common.finish")), 9, ["onClick"])) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode("button", {
                      class: "action-btn primary",
                      onClick: ($event) => handleStats(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("common.statistics")), 9, ["onClick"])
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          loadStatus.value === "loading" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "load-more"
          }, [
            vue.createElementVNode(
              "text",
              { class: "loading-text" },
              vue.toDisplayString(vue.unref(userStore).t("common.loading")) + "...",
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          loadStatus.value === "noMore" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "load-more"
          }, [
            vue.createElementVNode(
              "text",
              { class: "loading-text" },
              vue.toDisplayString(vue.unref(userStore).t("common.noMoreData")),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  };
  const PagesTeacherExamManage = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__scopeId", "data-v-41ca3adc"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/exam-manage.vue"]]);
  const _sfc_main$e = {
    __name: "exam-record-manage",
    setup(__props) {
      const userStore = useUserStore();
      const tableData = vue.ref([]);
      const exams = vue.ref([]);
      const params = vue.ref({
        examId: "",
        status: ""
      });
      const loadStatus = vue.ref("more");
      const current = vue.ref(1);
      const size = vue.ref(10);
      const examOptions = vue.computed(() => {
        return [{ id: "", title: userStore.t("common.allExams") }, ...exams.value];
      });
      const statusOptions = vue.computed(() => [
        { value: "", label: userStore.t("common.all") },
        { value: "SUBMITTED", label: userStore.t("common.submitted") },
        { value: "AUTO_SUBMITTED", label: userStore.t("common.autoSubmitted") },
        { value: "GRADED", label: userStore.t("common.scored") }
      ]);
      const currentExamText = vue.computed(() => {
        const option = examOptions.value.find((e) => e.id === params.value.examId);
        return option ? option.title : userStore.t("common.all");
      });
      const currentStatusText = vue.computed(() => {
        const option = statusOptions.value.find((s) => s.value === params.value.status);
        return option ? option.label : userStore.t("common.all");
      });
      const formatDateTime = (time) => {
        if (!time)
          return "";
        const date = new Date(time);
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        } else {
          return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
        }
      };
      const onExamChange = (e) => {
        const index = e.detail.value;
        params.value.examId = examOptions.value[index].id;
        loadData();
      };
      const onStatusChange = (e) => {
        const index = e.detail.value;
        params.value.status = statusOptions.value[index].value;
        loadData();
      };
      const handleView = (item) => {
        uni.navigateTo({
          url: `/pages/teacher/exam-record-detail?examId=${item.examId}&recordId=${item.id}`
        });
      };
      const handleGrade = (item) => {
        uni.navigateTo({
          url: `/pages/teacher/exam-grade?examId=${item.examId}&recordId=${item.id}`
        });
      };
      const loadExams = async () => {
        try {
          const res = await examApi.page({ current: 1, size: 100 });
          if (res.code === 200) {
            exams.value = res.data.records || [];
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-record-manage.vue:143", e);
        }
      };
      const loadData = async () => {
        if (loadStatus.value === "loading")
          return;
        loadStatus.value = "loading";
        current.value = 1;
        tableData.value = [];
        try {
          const res = await examRecordApi.page({
            current: current.value,
            size: size.value,
            examId: params.value.examId,
            status: params.value.status
          });
          if (res.code === 200) {
            tableData.value = res.data.records;
            loadStatus.value = res.data.records.length >= size.value ? "more" : "noMore";
          } else {
            uni.showToast({ title: res.message || userStore.t("common.loadFailed"), icon: "none" });
            loadStatus.value = "more";
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-record-manage.vue:168", e);
          uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
          loadStatus.value = "more";
        }
      };
      vue.onMounted(() => {
        loadExams();
        loadData();
      });
      return (_ctx, _cache) => {
        const _component_uni_load_more = vue.resolveComponent("uni-load-more");
        return vue.openBlock(), vue.createElementBlock("view", { class: "exam-record" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.examRecords"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createCommentVNode(" 工具栏 "),
          vue.createElementVNode("view", { class: "toolbar" }, [
            vue.createElementVNode("view", { class: "toolbar-left" }, [
              vue.createElementVNode("picker", {
                mode: "selector",
                range: vue.unref(examOptions),
                "range-key": "title",
                onChange: onExamChange
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "picker" },
                  vue.toDisplayString(vue.unref(currentExamText)),
                  1
                  /* TEXT */
                )
              ], 40, ["range"]),
              vue.createElementVNode("picker", {
                mode: "selector",
                range: vue.unref(statusOptions),
                "range-key": "label",
                onChange: onStatusChange
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "picker" },
                  vue.toDisplayString(vue.unref(currentStatusText)),
                  1
                  /* TEXT */
                )
              ], 40, ["range"])
            ]),
            vue.createElementVNode(
              "button",
              {
                class: "search-btn",
                onClick: loadData
              },
              vue.toDisplayString(vue.unref(userStore).t("common.search")),
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 记录列表 "),
          vue.createElementVNode("view", { class: "record-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(tableData.value, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "record-item",
                  key: item.id
                }, [
                  vue.createElementVNode("view", { class: "record-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "student-name" },
                      vue.toDisplayString(item.studentName),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["score-badge", item.score >= 60 ? "pass" : "fail"])
                      },
                      [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(item.score) + vue.toDisplayString(vue.unref(userStore).t("common.score")),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "record-info" }, [
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "📋"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.exam")) + "：" + vue.toDisplayString(item.examTitle),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "📅"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.submitTime")) + "：" + vue.toDisplayString(formatDateTime(item.submitTime)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "info-row" }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "⏱"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text" },
                        vue.toDisplayString(vue.unref(userStore).t("common.duration")) + "：" + vue.toDisplayString(item.duration) + vue.toDisplayString(vue.unref(userStore).t("common.minutes")),
                        1
                        /* TEXT */
                      )
                    ]),
                    item.status === "AUTO_SUBMITTED" ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "info-row"
                    }, [
                      vue.createElementVNode("text", { class: "info-icon" }, "⚠️"),
                      vue.createElementVNode(
                        "text",
                        { class: "info-text warning" },
                        vue.toDisplayString(vue.unref(userStore).t("common.autoSubmitted")),
                        1
                        /* TEXT */
                      )
                    ])) : vue.createCommentVNode("v-if", true)
                  ]),
                  vue.createElementVNode("view", { class: "record-actions" }, [
                    vue.createElementVNode("button", {
                      class: "action-btn",
                      onClick: ($event) => handleView(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("common.view")), 9, ["onClick"]),
                    !item.score ? (vue.openBlock(), vue.createElementBlock("button", {
                      key: 0,
                      class: "action-btn primary",
                      onClick: ($event) => handleGrade(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("teacher.grading")), 9, ["onClick"])) : vue.createCommentVNode("v-if", true)
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createVNode(_component_uni_load_more, { status: loadStatus.value }, null, 8, ["status"])
        ]);
      };
    }
  };
  const PagesTeacherExamRecordManage = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-7c10f726"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/exam-record-manage.vue"]]);
  const _sfc_main$d = {
    __name: "exam-monitor",
    setup(__props) {
      const userStore = useUserStore();
      const examId = vue.ref("");
      const examInfo = vue.reactive({
        title: "",
        status: "",
        subjectId: "",
        duration: 0,
        startTime: "",
        className: ""
      });
      const stats = vue.reactive({
        total: 0,
        submitted: 0,
        notStarted: 0,
        ongoing: 0
      });
      const subjects = vue.ref([]);
      const studentRecords = vue.ref([]);
      const filterStatus = vue.ref("");
      const statusOptions = vue.computed(() => [
        { value: "", label: userStore.t("common.all") },
        { value: "NOT_STARTED", label: userStore.t("common.notStarted") },
        { value: "ONGOING", label: userStore.t("common.ongoing") },
        { value: "SUBMITTED", label: userStore.t("common.submitted") },
        { value: "AUTO_SUBMITTED", label: userStore.t("common.autoSubmitted") }
      ]);
      const currentStatusText = vue.ref(userStore.t("common.all"));
      vue.watch(() => userStore.language, () => {
        var _a;
        currentStatusText.value = ((_a = statusOptions.value.find((s) => s.value === filterStatus.value)) == null ? void 0 : _a.label) || userStore.t("common.all");
      });
      const statusText = (status) => {
        const map = {
          PENDING: userStore.t("common.pending"),
          ONGOING: userStore.t("common.ongoing"),
          FINISHED: userStore.t("common.finished")
        };
        return map[status] || status;
      };
      const getStatusText = (status) => {
        const map = {
          NOT_STARTED: userStore.t("common.notStarted"),
          ONGOING: userStore.t("common.ongoing"),
          SUBMITTED: userStore.t("common.submitted"),
          AUTO_SUBMITTED: userStore.t("common.autoSubmitted")
        };
        return map[status] || status;
      };
      const getStatusClass = (status) => {
        return {
          NOT_STARTED: "status-not-started",
          ONGOING: "status-ongoing",
          SUBMITTED: "status-submitted",
          AUTO_SUBMITTED: "status-auto-submitted"
        }[status] || "";
      };
      const getSubjectName = (subjectId) => {
        const subject = subjects.value.find((s) => s.id === subjectId);
        return subject ? subject.name : userStore.t("common.unknownSubject");
      };
      const formatDateTime = (time) => {
        if (!time)
          return "";
        const date = new Date(time);
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        } else {
          return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
        }
      };
      const onStatusChange = (e) => {
        const index = e.detail.value;
        filterStatus.value = statusOptions[index].value;
        currentStatusText.value = statusOptions[index].label;
        loadStudentRecords();
      };
      const loadExamInfo = async () => {
        try {
          const res = await examApi.getById(examId.value);
          if (res.code === 200) {
            Object.assign(examInfo, res.data);
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-monitor.vue:193", "加载考试信息失败:", e);
        }
      };
      const loadStats = async () => {
        try {
          const res = await examRecordApi.getExamStats(examId.value);
          if (res.code === 200) {
            Object.assign(stats, res.data);
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-monitor.vue:204", "加载统计数据失败:", e);
        }
      };
      const loadStudentRecords = async () => {
        try {
          const params = { current: 1, size: 100, examId: examId.value };
          if (filterStatus.value) {
            params.status = filterStatus.value;
          }
          const res = await examRecordApi.page(params);
          if (res.code === 200) {
            studentRecords.value = res.data.records || [];
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-monitor.vue:219", "加载考生记录失败:", e);
        }
      };
      const loadSubjects = async () => {
        try {
          const res = await subjectApi.list();
          if (res.code === 200) {
            subjects.value = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-monitor.vue:230", "加载科目失败:", e);
        }
      };
      onLoad((options) => {
        examId.value = options.id;
        loadSubjects();
        loadExamInfo();
        loadStats();
        loadStudentRecords();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "exam-monitor" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.examMonitor"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createCommentVNode(" 考试信息 "),
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("view", { class: "exam-header" }, [
              vue.createElementVNode(
                "text",
                { class: "exam-title" },
                vue.toDisplayString(examInfo.title),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["status-tag", "status-" + examInfo.status.toLowerCase()])
                },
                [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(statusText(examInfo.status)),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "exam-info" }, [
              vue.createElementVNode("view", { class: "info-row" }, [
                vue.createElementVNode("text", { class: "info-icon" }, "📚"),
                vue.createElementVNode(
                  "text",
                  { class: "info-text" },
                  vue.toDisplayString(vue.unref(userStore).t("common.subject")) + "：" + vue.toDisplayString(getSubjectName(examInfo.subjectId)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "info-row" }, [
                vue.createElementVNode("text", { class: "info-icon" }, "⏱"),
                vue.createElementVNode(
                  "text",
                  { class: "info-text" },
                  vue.toDisplayString(vue.unref(userStore).t("common.duration")) + "：" + vue.toDisplayString(examInfo.duration) + vue.toDisplayString(vue.unref(userStore).t("common.durationMinutes")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "info-row" }, [
                vue.createElementVNode("text", { class: "info-icon" }, "📅"),
                vue.createElementVNode(
                  "text",
                  { class: "info-text" },
                  vue.toDisplayString(vue.unref(userStore).t("common.start")) + "：" + vue.toDisplayString(formatDateTime(examInfo.startTime)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "info-row" }, [
                vue.createElementVNode("text", { class: "info-icon" }, "🏫"),
                vue.createElementVNode(
                  "text",
                  { class: "info-text" },
                  vue.toDisplayString(vue.unref(userStore).t("common.class")) + "：" + vue.toDisplayString(examInfo.className),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          vue.createCommentVNode(" 统计数据 "),
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("view", { class: "card-header" }, [
              vue.createElementVNode(
                "text",
                { class: "card-title" },
                vue.toDisplayString(vue.unref(userStore).t("common.examStatistics")),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "stats-grid" }, [
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value total" },
                  vue.toDisplayString(stats.total),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString(vue.unref(userStore).t("common.totalPeople")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value submitted" },
                  vue.toDisplayString(stats.submitted),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString(vue.unref(userStore).t("common.submitted")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value not-started" },
                  vue.toDisplayString(stats.notStarted),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString(vue.unref(userStore).t("common.notStarted")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "stat-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "stat-value ongoing" },
                  vue.toDisplayString(stats.ongoing),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "stat-label" },
                  vue.toDisplayString(vue.unref(userStore).t("common.ongoing")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          vue.createCommentVNode(" 考生列表 "),
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("view", { class: "card-header" }, [
              vue.createElementVNode(
                "text",
                { class: "card-title" },
                vue.toDisplayString(vue.unref(userStore).t("common.examineeStatus")),
                1
                /* TEXT */
              ),
              vue.createElementVNode("picker", {
                mode: "selector",
                range: vue.unref(statusOptions),
                "range-key": "label",
                onChange: onStatusChange
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "status-picker" },
                  vue.toDisplayString(currentStatusText.value),
                  1
                  /* TEXT */
                )
              ], 40, ["range"])
            ]),
            vue.createElementVNode("view", { class: "student-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(studentRecords.value, (item) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "student-item",
                    key: item.id
                  }, [
                    vue.createElementVNode("view", { class: "student-info" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "student-name" },
                        vue.toDisplayString(item.studentName),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "student-id" },
                        vue.toDisplayString(vue.unref(userStore).t("common.studentId")) + "：" + vue.toDisplayString(item.studentId),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "student-status" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["status-badge", getStatusClass(item.status)])
                        },
                        [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(getStatusText(item.status)),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "student-meta" }, [
                      item.submitTime ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        { key: 0 },
                        vue.toDisplayString(vue.unref(userStore).t("common.submitTime")) + "：" + vue.toDisplayString(formatDateTime(item.submitTime)),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true),
                      item.score ? (vue.openBlock(), vue.createElementBlock(
                        "text",
                        { key: 1 },
                        vue.toDisplayString(vue.unref(userStore).t("common.score")) + "：" + vue.toDisplayString(item.score) + vue.toDisplayString(vue.unref(userStore).t("common.scoreUnit")),
                        1
                        /* TEXT */
                      )) : vue.createCommentVNode("v-if", true)
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]);
      };
    }
  };
  const PagesTeacherExamMonitor = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-f57b8412"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/exam-monitor.vue"]]);
  const _sfc_main$c = {
    __name: "exam-edit",
    setup(__props) {
      const userStore = useUserStore();
      const examId = vue.ref("");
      const isEdit = vue.ref(false);
      const papers = vue.ref([]);
      const classes = vue.ref([]);
      const selectedPaperId = vue.ref(null);
      const selectedClassId = vue.ref(null);
      const selectedPaper = vue.ref(null);
      const selectedClass = vue.ref(null);
      const form = vue.reactive({
        title: "",
        duration: "",
        startDate: "",
        startTime: "",
        passRate: "60",
        shuffleQuestions: false,
        shuffleOptions: false,
        leaveDetection: false,
        maxLeaveCount: "3",
        allowViewAfterExam: false
      });
      const onPaperChange = (e) => {
        const index = e.detail.value;
        if (papers.value[index]) {
          selectedPaperId.value = papers.value[index].id;
          selectedPaper.value = papers.value[index];
        }
      };
      const onClassChange = (e) => {
        const index = e.detail.value;
        if (classes.value[index]) {
          selectedClassId.value = classes.value[index].id;
          selectedClass.value = classes.value[index];
        }
      };
      const onStartDateChange = (e) => {
        form.startDate = e.detail.value;
      };
      const onStartTimeChange = (e) => {
        form.startTime = e.detail.value;
      };
      const onShuffleQuestionsChange = (e) => {
        form.shuffleQuestions = e.detail.value;
      };
      const onShuffleOptionsChange = (e) => {
        form.shuffleOptions = e.detail.value;
      };
      const onLeaveDetectionChange = (e) => {
        form.leaveDetection = e.detail.value;
      };
      const onAllowViewAfterExamChange = (e) => {
        form.allowViewAfterExam = e.detail.value;
      };
      const submitForm = async () => {
        if (!form.title.trim()) {
          uni.showToast({ title: userStore.t("teacher.enterExamTitle"), icon: "none" });
          return;
        }
        if (!selectedPaperId.value) {
          uni.showToast({ title: userStore.t("teacher.selectPaper"), icon: "none" });
          return;
        }
        if (!selectedClassId.value) {
          uni.showToast({ title: userStore.t("teacher.selectClass"), icon: "none" });
          return;
        }
        if (!form.duration) {
          uni.showToast({ title: userStore.t("teacher.enterDuration"), icon: "none" });
          return;
        }
        if (!form.startDate || !form.startTime) {
          uni.showToast({ title: userStore.t("teacher.selectStartTime"), icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: userStore.t("common.saving") });
          const startTime = `${form.startDate} ${form.startTime}:00`;
          const antiCheatConfig = {
            shuffleQuestions: form.shuffleQuestions,
            shuffleOptions: form.shuffleOptions,
            leaveDetection: form.leaveDetection,
            maxLeaveCount: parseInt(form.maxLeaveCount) || 3
          };
          const examData = {
            id: examId.value || null,
            title: form.title,
            paperId: selectedPaperId.value,
            classIds: selectedClassId.value,
            duration: parseInt(form.duration),
            startTime,
            passScore: parseInt(form.passRate) || 60,
            antiCheatConfig: JSON.stringify(antiCheatConfig),
            allowViewAfterExam: form.allowViewAfterExam ? 1 : 0
          };
          let res;
          if (isEdit.value) {
            res = await examApi.update(examData);
          } else {
            res = await examApi.create(examData);
          }
          if (res.code === 200) {
            uni.showToast({ title: userStore.t("common.saveSuccess"), icon: "success" });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({ title: res.message || userStore.t("common.saveFailed"), icon: "none" });
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-edit.vue:248", "保存失败:", e);
          uni.showToast({ title: userStore.t("common.saveFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const loadPapers = async () => {
        try {
          const res = await paperApi$1.page({ current: 1, size: 50 });
          if (res.code === 200) {
            papers.value = res.data.records || [];
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-edit.vue:262", "加载试卷失败:", e);
        }
      };
      const loadClasses = async () => {
        var _a;
        try {
          const userId = (_a = uni.getStorageSync("userInfo")) == null ? void 0 : _a.userId;
          const res = await classApi.getMyClasses(userId);
          if (res.code === 200) {
            classes.value = res.data.map((item) => item.class) || [];
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-edit.vue:274", "加载班级失败:", e);
        }
      };
      const loadExamInfo = async () => {
        try {
          const res = await examApi.getById(examId.value);
          if (res.code === 200) {
            const data = res.data;
            form.title = data.title;
            form.duration = data.duration.toString();
            const date = new Date(data.startTime);
            form.startDate = date.toISOString().split("T")[0];
            form.startTime = date.toTimeString().slice(0, 5);
            selectedPaperId.value = data.paperId;
            selectedClassId.value = data.classId;
            selectedPaper.value = papers.value.find((p) => p.id === data.paperId);
            selectedClass.value = classes.value.find((c) => c.id === data.classId);
            if (data.passScore) {
              form.passRate = data.passScore.toString();
            }
            if (data.allowViewAfterExam !== void 0) {
              form.allowViewAfterExam = data.allowViewAfterExam === 1;
            }
            if (data.antiCheatConfig) {
              try {
                const config = JSON.parse(data.antiCheatConfig);
                if (config.shuffleQuestions !== void 0) {
                  form.shuffleQuestions = config.shuffleQuestions;
                }
                if (config.shuffleOptions !== void 0) {
                  form.shuffleOptions = config.shuffleOptions;
                }
                if (config.leaveDetection !== void 0) {
                  form.leaveDetection = config.leaveDetection;
                }
                if (config.maxLeaveCount !== void 0) {
                  form.maxLeaveCount = config.maxLeaveCount.toString();
                }
              } catch (e) {
                formatAppLog("error", "at pages/teacher/exam-edit.vue:320", "解析防作弊配置失败:", e);
              }
            }
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-edit.vue:325", "加载考试信息失败:", e);
        }
      };
      onLoad((options) => {
        if (options.id) {
          examId.value = options.id;
          isEdit.value = true;
        }
        loadPapers();
        loadClasses();
        if (isEdit.value) {
          setTimeout(() => {
            loadExamInfo();
          }, 100);
        }
      });
      return (_ctx, _cache) => {
        var _a, _b;
        return vue.openBlock(), vue.createElementBlock("view", { class: "exam-edit" }, [
          vue.createVNode(CustomNavBar, {
            title: isEdit.value ? vue.unref(userStore).t("common.editExam") : vue.unref(userStore).t("common.createExam"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createElementVNode("scroll-view", {
            class: "form-body",
            "scroll-y": ""
          }, [
            vue.createElementVNode("view", { class: "card" }, [
              vue.createElementVNode("view", { class: "card-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "card-title" },
                  vue.toDisplayString(vue.unref(userStore).t("common.basicInfo")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.examTitle")) + " *",
                  1
                  /* TEXT */
                ),
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "form-input",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.title = $event),
                  placeholder: vue.unref(userStore).t("teacher.enterExamTitle")
                }, null, 8, ["placeholder"]), [
                  [vue.vModelText, form.title]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.selectPaper")) + " *",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: papers.value,
                  "range-key": "title",
                  onChange: onPaperChange
                }, [
                  vue.createElementVNode("view", { class: "form-picker" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(((_a = selectedPaper.value) == null ? void 0 : _a.title) || vue.unref(userStore).t("teacher.selectPaper")),
                      1
                      /* TEXT */
                    )
                  ])
                ], 40, ["range"])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.selectClass")) + " *",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: classes.value,
                  "range-key": "className",
                  onChange: onClassChange
                }, [
                  vue.createElementVNode("view", { class: "form-picker" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(((_b = selectedClass.value) == null ? void 0 : _b.className) || vue.unref(userStore).t("teacher.selectClass")),
                      1
                      /* TEXT */
                    )
                  ])
                ], 40, ["range"])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.examDuration")) + " *",
                  1
                  /* TEXT */
                ),
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "form-input",
                  type: "number",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.duration = $event),
                  placeholder: vue.unref(userStore).t("teacher.enterDuration")
                }, null, 8, ["placeholder"]), [
                  [vue.vModelText, form.duration]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.startDate")) + " *",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("picker", {
                  mode: "date",
                  value: form.startDate,
                  onChange: onStartDateChange
                }, [
                  vue.createElementVNode("view", { class: "form-picker" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(form.startDate || vue.unref(userStore).t("teacher.selectDate")),
                      1
                      /* TEXT */
                    )
                  ])
                ], 40, ["value"])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.startTime")) + " *",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("picker", {
                  mode: "time",
                  value: form.startTime,
                  onChange: onStartTimeChange
                }, [
                  vue.createElementVNode("view", { class: "form-picker" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(form.startTime || vue.unref(userStore).t("teacher.selectTime")),
                      1
                      /* TEXT */
                    )
                  ])
                ], 40, ["value"])
              ])
            ]),
            vue.createElementVNode("view", { class: "card" }, [
              vue.createElementVNode("view", { class: "card-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "card-title" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.examSettings")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.passRate")) + " (%)",
                  1
                  /* TEXT */
                ),
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "form-input",
                  type: "number",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.passRate = $event),
                  placeholder: vue.unref(userStore).t("teacher.default60")
                }, null, 8, ["placeholder"]), [
                  [vue.vModelText, form.passRate]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.shuffleQuestions")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "form-switch-wrap" }, [
                  vue.createElementVNode("switch", {
                    checked: form.shuffleQuestions,
                    onChange: onShuffleQuestionsChange,
                    color: "#dc2626"
                  }, null, 40, ["checked"]),
                  vue.createElementVNode(
                    "text",
                    { class: "switch-desc" },
                    vue.toDisplayString(vue.unref(userStore).t("teacher.shuffleQuestionsDesc")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.shuffleOptions")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "form-switch-wrap" }, [
                  vue.createElementVNode("switch", {
                    checked: form.shuffleOptions,
                    onChange: onShuffleOptionsChange,
                    color: "#dc2626"
                  }, null, 40, ["checked"]),
                  vue.createElementVNode(
                    "text",
                    { class: "switch-desc" },
                    vue.toDisplayString(vue.unref(userStore).t("teacher.shuffleOptionsDesc")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.leaveDetection")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "form-switch-wrap" }, [
                  vue.createElementVNode("switch", {
                    checked: form.leaveDetection,
                    onChange: onLeaveDetectionChange,
                    color: "#dc2626"
                  }, null, 40, ["checked"]),
                  vue.createElementVNode(
                    "text",
                    { class: "switch-desc" },
                    vue.toDisplayString(vue.unref(userStore).t("teacher.leaveDetectionDesc")),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              form.leaveDetection ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "form-item"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.maxLeaveCount")),
                  1
                  /* TEXT */
                ),
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "form-input",
                  type: "number",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.maxLeaveCount = $event),
                  placeholder: vue.unref(userStore).t("teacher.maxLeaveCountDesc")
                }, null, 8, ["placeholder"]), [
                  [vue.vModelText, form.maxLeaveCount]
                ])
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.allowViewAfterExam")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "form-switch-wrap" }, [
                  vue.createElementVNode("switch", {
                    checked: form.allowViewAfterExam,
                    onChange: onAllowViewAfterExamChange,
                    color: "#dc2626"
                  }, null, 40, ["checked"]),
                  vue.createElementVNode(
                    "text",
                    { class: "switch-desc" },
                    vue.toDisplayString(vue.unref(userStore).t("teacher.allowViewAfterExamDesc")),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-footer" }, [
            vue.createElementVNode(
              "button",
              {
                class: "submit-btn",
                onClick: submitForm
              },
              vue.toDisplayString(vue.unref(userStore).t("common.save")),
              1
              /* TEXT */
            )
          ])
        ]);
      };
    }
  };
  const PagesTeacherExamEdit = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-fda6f62f"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/exam-edit.vue"]]);
  const _sfc_main$b = {
    __name: "paper-edit",
    setup(__props) {
      const userStore = useUserStore();
      const paperId = vue.ref("");
      const isEdit = vue.ref(false);
      const subjects = vue.ref([]);
      const selectedSubjectId = vue.ref(null);
      const selectedSubject = vue.ref(null);
      const questions = vue.ref([]);
      const selectedQuestions = vue.ref([]);
      const selectedQuestionIds = vue.ref(/* @__PURE__ */ new Set());
      const questionScores = vue.reactive({});
      const showBatchScore = vue.ref(false);
      const isSearching = vue.ref(false);
      const searchKeyword = vue.ref("");
      const filterType = vue.ref("");
      const batchType = vue.ref({ value: "", label: "" });
      const batchScore = vue.ref("");
      const form = vue.reactive({
        title: "",
        duration: "120",
        passRate: "60",
        description: ""
      });
      const questionTypes = vue.computed(() => [
        { value: "SINGLE_CHOICE", label: userStore.t("common.singleChoice") },
        { value: "MULTIPLE_CHOICE", label: userStore.t("common.multipleChoice") },
        { value: "JUDGMENT", label: userStore.t("common.trueFalse") },
        { value: "FILL_BLANK", label: userStore.t("common.fillBlank") },
        { value: "ESSAY", label: userStore.t("common.shortAnswer") }
      ]);
      const filterTypeOptions = vue.computed(() => [
        { value: "", label: userStore.t("common.all") },
        ...questionTypes.value
      ]);
      const currentFilterType = vue.ref({ value: "", label: userStore.t("common.all") });
      const totalScore = vue.computed(() => {
        return selectedQuestions.value.reduce((sum, q) => {
          const score = questionScores[q.id] || q.score || 5;
          return sum + score;
        }, 0);
      });
      const passScore = vue.computed(() => {
        const rate = parseInt(form.passRate) || 60;
        return Math.round(totalScore.value * rate / 100);
      });
      const typeStatistics = vue.computed(() => {
        const stats = {};
        selectedQuestions.value.forEach((q) => {
          const type = q.type;
          if (!stats[type]) {
            stats[type] = { count: 0, score: 0 };
          }
          stats[type].count++;
          stats[type].score += questionScores[q.id] || q.score || 5;
        });
        return stats;
      });
      const onSubjectChange = (e) => {
        const index = e.detail.value;
        if (subjects.value[index]) {
          selectedSubjectId.value = subjects.value[index].id;
          selectedSubject.value = subjects.value[index];
          selectedQuestions.value = [];
          selectedQuestionIds.value.clear();
          Object.keys(questionScores).forEach((key) => delete questionScores[key]);
          searchQuestions();
        }
      };
      const onFilterTypeChange = (e) => {
        const index = e.detail.value;
        currentFilterType.value = filterTypeOptions.value[index];
        filterType.value = currentFilterType.value.value;
        searchQuestions();
      };
      const onBatchTypeChange = (e) => {
        const index = e.detail.value;
        batchType.value = questionTypes.value[index];
      };
      const searchQuestions = async () => {
        if (!selectedSubjectId.value) {
          uni.showToast({ title: userStore.t("teacher.selectSubjectFirst"), icon: "none" });
          return;
        }
        isSearching.value = true;
        try {
          const res = await questionApi.list({
            subjectId: selectedSubjectId.value,
            keyword: searchKeyword.value,
            type: filterType.value,
            count: 100
          });
          if (res.code === 200) {
            questions.value = res.data || [];
            questions.value.forEach((q) => {
              if (questionScores[q.id] === void 0) {
                const scoreValue = typeof q.score === "string" ? parseInt(q.score, 10) : q.score;
                questionScores[q.id] = scoreValue || 5;
              }
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/paper-edit.vue:305", e);
        } finally {
          isSearching.value = false;
        }
      };
      const clearSelection = () => {
        selectedQuestions.value = [];
        selectedQuestionIds.value.clear();
      };
      const isQuestionSelected = (questionId) => {
        return selectedQuestionIds.value.has(questionId);
      };
      const toggleQuestion = (question) => {
        if (selectedQuestionIds.value.has(question.id)) {
          selectedQuestionIds.value.delete(question.id);
          const index = selectedQuestions.value.findIndex((q) => q.id === question.id);
          if (index >= 0) {
            selectedQuestions.value.splice(index, 1);
          }
        } else {
          selectedQuestionIds.value.add(question.id);
          selectedQuestions.value.push({ ...question });
          if (questionScores[question.id] === void 0) {
            const scoreValue = typeof question.score === "string" ? parseInt(question.score, 10) : question.score;
            questionScores[question.id] = scoreValue || 5;
          }
        }
      };
      const editQuestionScore = (questionId) => {
        const currentScore = questionScores[questionId] || 5;
        uni.showModal({
          title: userStore.t("teacher.setScore"),
          editable: true,
          placeholderText: userStore.t("teacher.enterScore"),
          defaultValue: currentScore.toString(),
          confirmText: userStore.t("common.confirm"),
          cancelText: userStore.t("common.cancel"),
          success: (res) => {
            if (res.confirm && res.content) {
              const newScore = parseInt(res.content);
              if (newScore && newScore > 0) {
                questionScores[questionId] = newScore;
              }
            }
          }
        });
      };
      const applyBatchScore = () => {
        if (!batchType.value.value) {
          uni.showToast({ title: userStore.t("teacher.selectQuestionType"), icon: "none" });
          return;
        }
        if (!batchScore.value) {
          uni.showToast({ title: userStore.t("common.pleaseEnter") + userStore.t("common.score"), icon: "none" });
          return;
        }
        const score = parseInt(batchScore.value);
        selectedQuestions.value.forEach((q) => {
          if (q.type === batchType.value.value) {
            questionScores[q.id] = score;
          }
        });
        showBatchScore.value = false;
        uni.showToast({ title: userStore.t("teacher.batchSetSuccess"), icon: "success" });
      };
      const getTypeText = (type) => {
        const map = {
          SINGLE_CHOICE: userStore.t("common.singleChoice"),
          MULTIPLE_CHOICE: userStore.t("common.multipleChoice"),
          JUDGMENT: userStore.t("common.trueFalse"),
          FILL_BLANK: userStore.t("common.fillBlank"),
          ESSAY: userStore.t("common.shortAnswer")
        };
        return map[type] || type;
      };
      const getTypeClass = (type) => {
        const map = {
          SINGLE_CHOICE: "type-single",
          MULTIPLE_CHOICE: "type-multi",
          JUDGMENT: "type-judge",
          FILL_BLANK: "type-fill",
          ESSAY: "type-essay"
        };
        return map[type] || "";
      };
      const truncate = (text, len) => {
        if (!text)
          return "-";
        return text.length > len ? text.substring(0, len) + "..." : text;
      };
      const submitForm = async () => {
        if (!form.title.trim()) {
          uni.showToast({ title: userStore.t("common.pleaseEnter") + userStore.t("common.paperTitle"), icon: "none" });
          return;
        }
        if (!selectedSubjectId.value) {
          uni.showToast({ title: userStore.t("teacher.selectSubjectFirst"), icon: "none" });
          return;
        }
        if (selectedQuestionIds.value.size === 0) {
          uni.showToast({ title: userStore.t("teacher.selectAtLeastOneQuestion"), icon: "none" });
          return;
        }
        try {
          uni.showLoading({ title: userStore.t("common.saving") });
          const questionIds = Array.from(selectedQuestionIds.value);
          const questionScoreList = [];
          selectedQuestions.value.forEach((q) => {
            questionScoreList.push({
              questionId: q.id,
              score: questionScores[q.id] || q.score || 5
            });
          });
          const paperData = {
            id: paperId.value || null,
            title: form.title,
            subjectId: selectedSubjectId.value,
            duration: form.duration ? parseInt(form.duration) : 120,
            totalScore: totalScore.value,
            passScore: passScore.value,
            status: "DRAFT"
          };
          const requestData = {
            paper: paperData,
            questionIds,
            questionScores: questionScoreList
          };
          let res;
          if (isEdit.value) {
            res = await paperApi$1.update(requestData);
          } else {
            res = await paperApi$1.create(requestData);
          }
          if (res.code === 200) {
            uni.showToast({ title: userStore.t("common.saveSuccess"), icon: "success" });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({ title: res.message || userStore.t("common.saveFailed"), icon: "none" });
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/paper-edit.vue:471", "保存失败:", e);
          uni.showToast({ title: userStore.t("common.saveFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const loadSubjects = async () => {
        try {
          const res = await subjectApi.list();
          if (res.code === 200) {
            subjects.value = res.data;
            formatAppLog("log", "at pages/teacher/paper-edit.vue:483", "科目列表加载成功:", subjects.value.length, "个科目");
          } else {
            formatAppLog("error", "at pages/teacher/paper-edit.vue:485", "加载科目失败，code:", res.code);
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/paper-edit.vue:488", "加载科目失败:", e);
        }
      };
      const loadPaperInfo = async () => {
        var _a;
        try {
          const res = await paperApi$1.getById(paperId.value);
          if (res.code === 200) {
            const data = res.data;
            form.title = data.title;
            form.duration = data.duration ? data.duration.toString() : "120";
            form.passRate = data.passScore ? Math.round(data.passScore / data.totalScore * 100).toString() : "60";
            form.description = data.description || "";
            selectedSubjectId.value = data.subjectId || ((_a = data.subject) == null ? void 0 : _a.id);
            const subjectId = selectedSubjectId.value;
            formatAppLog("log", "at pages/teacher/paper-edit.vue:505", "试卷信息:", data);
            formatAppLog("log", "at pages/teacher/paper-edit.vue:506", "科目ID:", subjectId, typeof subjectId);
            formatAppLog("log", "at pages/teacher/paper-edit.vue:507", "科目列表:", subjects.value);
            if (subjectId && subjects.value.length > 0) {
              const subjectIdStr = String(subjectId);
              selectedSubject.value = subjects.value.find((s) => String(s.id) === subjectIdStr);
            }
            formatAppLog("log", "at pages/teacher/paper-edit.vue:514", "匹配到的科目:", selectedSubject.value);
            if (!selectedSubject.value && subjectId) {
              try {
                const subjectRes = await subjectApi.getById(subjectId);
                if (subjectRes.code === 200 && subjectRes.data) {
                  selectedSubject.value = subjectRes.data;
                  subjects.value.push(subjectRes.data);
                  formatAppLog("log", "at pages/teacher/paper-edit.vue:522", "单独获取科目成功:", subjectRes.data);
                } else {
                  formatAppLog("warn", "at pages/teacher/paper-edit.vue:524", "科目ID " + subjectId + " 不存在，需要重新选择");
                  uni.showToast({
                    title: userStore.t("teacher.subjectNotFound"),
                    icon: "none",
                    duration: 3e3
                  });
                  selectedSubjectId.value = null;
                }
              } catch (e) {
                formatAppLog("error", "at pages/teacher/paper-edit.vue:533", "单独获取科目失败:", e);
                uni.showToast({
                  title: userStore.t("teacher.subjectNotFound"),
                  icon: "none",
                  duration: 3e3
                });
                selectedSubjectId.value = null;
              }
            }
            const qRes = await paperApi$1.getQuestions(paperId.value);
            if (qRes.code === 200) {
              selectedQuestions.value = qRes.data || [];
              selectedQuestions.value.forEach((q) => {
                selectedQuestionIds.value.add(q.id);
                const scoreValue = typeof q.score === "string" ? parseInt(q.score, 10) : q.score;
                questionScores[q.id] = scoreValue || 5;
              });
            }
            setTimeout(() => {
              searchQuestions();
            }, 100);
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/paper-edit.vue:558", "加载试卷信息失败:", e);
        }
      };
      onLoad(async (options) => {
        if (options.id) {
          paperId.value = options.id;
          isEdit.value = true;
        }
        await loadSubjects();
        if (isEdit.value) {
          await loadPaperInfo();
        }
      });
      vue.onMounted(() => {
        if (isEdit.value && selectedSubjectId.value && !selectedSubject.value) {
          const subjectId = selectedSubjectId.value;
          selectedSubject.value = subjects.value.find((s) => s.id === subjectId) || subjects.value.find((s) => s.id === String(subjectId));
        }
      });
      vue.watch(() => userStore.language, () => {
        const ft = filterTypeOptions.value.find((f) => f.value === currentFilterType.value.value);
        if (ft)
          currentFilterType.value = ft;
      });
      return (_ctx, _cache) => {
        var _a, _b;
        return vue.openBlock(), vue.createElementBlock("view", { class: "paper-edit" }, [
          vue.createVNode(CustomNavBar, {
            title: isEdit.value ? vue.unref(userStore).t("common.editPaper") : vue.unref(userStore).t("common.createPaper"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createElementVNode("scroll-view", {
            class: "form-body",
            "scroll-y": ""
          }, [
            vue.createElementVNode("view", { class: "card" }, [
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("common.paperTitle")) + " *",
                  1
                  /* TEXT */
                ),
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "form-input",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.title = $event),
                  placeholder: vue.unref(userStore).t("common.pleaseEnter") + vue.unref(userStore).t("common.paperTitle")
                }, null, 8, ["placeholder"]), [
                  [vue.vModelText, form.title]
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("common.subject")) + " *",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: subjects.value,
                  "range-key": "name",
                  onChange: onSubjectChange
                }, [
                  vue.createElementVNode("view", { class: "form-picker" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(((_a = selectedSubject.value) == null ? void 0 : _a.name) || vue.unref(userStore).t("common.selectSubjectFirst")),
                      1
                      /* TEXT */
                    )
                  ])
                ], 40, ["range"])
              ]),
              vue.createElementVNode("view", { class: "form-row" }, [
                vue.createElementVNode("view", { class: "form-item-half" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "form-label" },
                    vue.toDisplayString(vue.unref(userStore).t("teacher.examDuration")),
                    1
                    /* TEXT */
                  ),
                  vue.withDirectives(vue.createElementVNode("input", {
                    class: "form-input",
                    type: "number",
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.duration = $event),
                    placeholder: vue.unref(userStore).t("common.pleaseEnter") + vue.unref(userStore).t("teacher.examDuration")
                  }, null, 8, ["placeholder"]), [
                    [vue.vModelText, form.duration]
                  ])
                ]),
                vue.createElementVNode("view", { class: "form-item-half" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "form-label" },
                    vue.toDisplayString(vue.unref(userStore).t("common.totalScore")),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "form-input readonly" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(totalScore)),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("common.passRate")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "pass-rate-row" }, [
                  vue.withDirectives(vue.createElementVNode("input", {
                    class: "form-input rate-input",
                    type: "number",
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.passRate = $event),
                    placeholder: vue.unref(userStore).t("teacher.default60")
                  }, null, 8, ["placeholder"]), [
                    [vue.vModelText, form.passRate]
                  ]),
                  vue.createElementVNode("text", { class: "rate-unit" }, "%")
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "pass-score-info" },
                  vue.toDisplayString(vue.unref(userStore).t("common.passScore")) + "：" + vue.toDisplayString(vue.unref(passScore)) + vue.toDisplayString(vue.unref(userStore).t("common.score")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "form-item" }, [
                vue.createElementVNode(
                  "text",
                  { class: "form-label" },
                  vue.toDisplayString(vue.unref(userStore).t("common.paperDesc")),
                  1
                  /* TEXT */
                ),
                vue.withDirectives(vue.createElementVNode("textarea", {
                  class: "form-textarea",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.description = $event),
                  placeholder: vue.unref(userStore).t("common.pleaseEnter") + vue.unref(userStore).t("common.paperDesc")
                }, null, 8, ["placeholder"]), [
                  [vue.vModelText, form.description]
                ])
              ])
            ]),
            selectedSubjectId.value ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "card"
            }, [
              vue.createElementVNode("view", { class: "card-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "card-title" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.questionSettings")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "selector-toolbar" }, [
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "toolbar-search-input",
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => searchKeyword.value = $event),
                  placeholder: vue.unref(userStore).t("teacher.searchQuestion"),
                  onConfirm: searchQuestions
                }, null, 40, ["placeholder"]), [
                  [vue.vModelText, searchKeyword.value]
                ]),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: vue.unref(filterTypeOptions),
                  "range-key": "label",
                  onChange: onFilterTypeChange
                }, [
                  vue.createElementVNode("view", { class: "toolbar-filter-picker" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(currentFilterType.value.label),
                      1
                      /* TEXT */
                    )
                  ])
                ], 40, ["range"]),
                vue.createElementVNode(
                  "button",
                  {
                    class: "toolbar-search-btn",
                    onClick: searchQuestions
                  },
                  vue.toDisplayString(vue.unref(userStore).t("common.search")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "button",
                  {
                    class: "toolbar-clear-btn",
                    onClick: clearSelection
                  },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.clearSelection")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "toolbar-subject-tip" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.currentSubject")) + "：" + vue.toDisplayString((_b = selectedSubject.value) == null ? void 0 : _b.name),
                  1
                  /* TEXT */
                )
              ]),
              selectedQuestions.value.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "batch-score-setting"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "batch-setting-title" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.batchSetScore")) + "：",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: vue.unref(questionTypes),
                  "range-key": "label",
                  onChange: onBatchTypeChange
                }, [
                  vue.createElementVNode("view", { class: "batch-type-picker" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(batchType.value.label || vue.unref(userStore).t("teacher.selectQuestionType")),
                      1
                      /* TEXT */
                    )
                  ])
                ], 40, ["range"]),
                vue.withDirectives(vue.createElementVNode("input", {
                  class: "batch-score-input",
                  type: "number",
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => batchScore.value = $event),
                  placeholder: vue.unref(userStore).t("teacher.scoreHint")
                }, null, 8, ["placeholder"]), [
                  [vue.vModelText, batchScore.value]
                ]),
                vue.createElementVNode(
                  "button",
                  {
                    class: "batch-apply-btn",
                    onClick: applyBatchScore
                  },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.applyToSelected")),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              questions.value.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "question-list"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(questions.value, (q) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "question-item",
                      key: q.id
                    }, [
                      vue.createElementVNode("view", {
                        class: "question-checkbox-wrapper",
                        onClick: ($event) => toggleQuestion(q)
                      }, [
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["question-checkbox", { checked: isQuestionSelected(q.id) }])
                          },
                          [
                            isQuestionSelected(q.id) ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "✓")) : vue.createCommentVNode("v-if", true)
                          ],
                          2
                          /* CLASS */
                        )
                      ], 8, ["onClick"]),
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["question-type-tag", getTypeClass(q.type)])
                        },
                        [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(getTypeText(q.type)),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      ),
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["question-content", { "selected": isQuestionSelected(q.id) }])
                        },
                        [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(truncate(q.content, 60)),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      ),
                      vue.createElementVNode("view", {
                        class: "question-score-box",
                        onClick: ($event) => editQuestionScore(q.id)
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "score-num" },
                          vue.toDisplayString(questionScores[q.id] || q.score || 5),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "score-unit" },
                          vue.toDisplayString(vue.unref(userStore).t("common.score")),
                          1
                          /* TEXT */
                        )
                      ], 8, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : !isSearching.value ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 2,
                class: "empty"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "empty-text" },
                  vue.toDisplayString(vue.unref(userStore).t("common.noQuestions")),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              isSearching.value ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 3,
                class: "loading-text"
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(vue.unref(userStore).t("common.loading")),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true),
              selectedQuestions.value.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 4,
                class: "selected-info"
              }, [
                vue.createElementVNode("view", { class: "info-row" }, [
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("teacher.selected")),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "info-num" },
                      vue.toDisplayString(selectedQuestions.value.length),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("common.questions")),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "info-divider" }),
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("common.totalScore")),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "info-num" },
                      vue.toDisplayString(vue.unref(totalScore)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("common.score")),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "info-divider" }),
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("common.passScore")),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "info-num pass" },
                      vue.toDisplayString(vue.unref(passScore)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("common.score")),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "type-stats" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(vue.unref(typeStatistics), (stat, type) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: "type-stat-item",
                        key: type
                      }, [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(getTypeText(type)) + "：",
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "stat-num" },
                          vue.toDisplayString(stat.count),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(vue.unref(userStore).t("common.questions")),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode("text", { class: "stat-sep" }, "/"),
                        vue.createElementVNode(
                          "text",
                          { class: "stat-num" },
                          vue.toDisplayString(stat.score),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(vue.unref(userStore).t("common.score")),
                          1
                          /* TEXT */
                        )
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])) : vue.createCommentVNode("v-if", true)
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "card"
            }, [
              vue.createElementVNode("view", { class: "empty-hint" }, [
                vue.createElementVNode(
                  "text",
                  { class: "empty-text" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.selectSubjectFirst")),
                  1
                  /* TEXT */
                )
              ])
            ]))
          ]),
          vue.createElementVNode("view", { class: "form-footer" }, [
            vue.createElementVNode(
              "button",
              {
                class: "submit-btn",
                onClick: submitForm
              },
              vue.toDisplayString(isEdit.value ? vue.unref(userStore).t("common.save") : vue.unref(userStore).t("common.create")),
              1
              /* TEXT */
            )
          ]),
          showBatchScore.value ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "modal",
            onClick: _cache[10] || (_cache[10] = ($event) => showBatchScore.value = false)
          }, [
            vue.createElementVNode("view", {
              class: "batch-modal",
              onClick: _cache[9] || (_cache[9] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "modal-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "modal-title" },
                  vue.toDisplayString(vue.unref(userStore).t("teacher.batchSetScore")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", {
                  class: "modal-close",
                  onClick: _cache[6] || (_cache[6] = ($event) => showBatchScore.value = false)
                }, [
                  vue.createElementVNode("text", { class: "close-icon" }, "✕")
                ])
              ]),
              vue.createElementVNode("view", { class: "modal-body" }, [
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "form-label" },
                    vue.toDisplayString(vue.unref(userStore).t("common.questionType")) + " *",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("picker", {
                    mode: "selector",
                    range: vue.unref(questionTypes),
                    "range-key": "label",
                    onChange: onBatchTypeChange
                  }, [
                    vue.createElementVNode("view", { class: "form-picker" }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(batchType.value.label || vue.unref(userStore).t("teacher.selectQuestionType")),
                        1
                        /* TEXT */
                      )
                    ])
                  ], 40, ["range"])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "form-label" },
                    vue.toDisplayString(vue.unref(userStore).t("common.score")) + " *",
                    1
                    /* TEXT */
                  ),
                  vue.withDirectives(vue.createElementVNode("input", {
                    class: "form-input",
                    type: "number",
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => batchScore.value = $event),
                    placeholder: vue.unref(userStore).t("teacher.scoreHint")
                  }, null, 8, ["placeholder"]), [
                    [vue.vModelText, batchScore.value]
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "modal-footer" }, [
                vue.createElementVNode(
                  "button",
                  {
                    class: "modal-btn cancel",
                    onClick: _cache[8] || (_cache[8] = ($event) => showBatchScore.value = false)
                  },
                  vue.toDisplayString(vue.unref(userStore).t("common.cancel")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "button",
                  {
                    class: "modal-btn confirm",
                    onClick: applyBatchScore
                  },
                  vue.toDisplayString(vue.unref(userStore).t("common.apply")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  };
  const PagesTeacherPaperEdit = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-ae5e2cd9"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/paper-edit.vue"]]);
  const _sfc_main$a = {
    __name: "paper-preview",
    setup(__props) {
      const userStore = useUserStore();
      const paperId = vue.ref("");
      const paper = vue.reactive({
        title: "",
        subjectId: "",
        duration: 0,
        totalScore: 0,
        description: ""
      });
      const subjects = vue.ref([]);
      const questions = vue.ref([]);
      const currentIndex = vue.ref(0);
      const showAnswerCard = vue.ref(false);
      const getSubjectName = (subjectId) => {
        const subject = subjects.value.find((s) => s.id === subjectId);
        return subject ? subject.name : "未知科目";
      };
      const getTypeText = (type) => {
        return {
          SINGLE_CHOICE: userStore.t("common.singleChoice"),
          MULTIPLE_CHOICE: userStore.t("common.multipleChoice"),
          JUDGMENT: userStore.t("common.judgment"),
          FILL_BLANK: userStore.t("common.fillBlank"),
          ESSAY: userStore.t("common.essay")
        }[type] || type;
      };
      const parseOptions = (options) => {
        if (!options)
          return [];
        if (Array.isArray(options)) {
          return options.map((opt) => {
            if (typeof opt === "object") {
              return opt.text || opt.content || JSON.stringify(opt);
            }
            return String(opt);
          });
        }
        if (typeof options === "string") {
          try {
            const parsed = JSON.parse(options);
            if (Array.isArray(parsed)) {
              return parsed.map((opt) => {
                if (typeof opt === "object") {
                  return opt.text || opt.content || JSON.stringify(opt);
                }
                return String(opt);
              });
            }
          } catch (e) {
            return options.split("|").filter((o) => o.trim());
          }
        }
        return [];
      };
      const formatAnswer = (q) => {
        const answer = q.answer || q.correctAnswer;
        if (!answer)
          return "";
        if (q.type === "JUDGMENT") {
          return answer === "A" || answer === "正确" ? "正确" : "错误";
        }
        return answer;
      };
      const currentQuestion = vue.computed(() => questions.value[currentIndex.value]);
      const singleQuestions = vue.computed(() => questions.value.filter((q) => q.type === "SINGLE_CHOICE"));
      const multiQuestions = vue.computed(() => questions.value.filter((q) => q.type === "MULTIPLE_CHOICE"));
      const judgeQuestions = vue.computed(() => questions.value.filter((q) => q.type === "JUDGMENT"));
      const fillQuestions = vue.computed(() => questions.value.filter((q) => q.type === "FILL_BLANK"));
      const essayQuestions = vue.computed(() => questions.value.filter((q) => q.type === "ESSAY"));
      const getQuestionIndex = (q) => {
        return questions.value.findIndex((item) => item.id === q.id);
      };
      const prevQuestion = () => {
        if (currentIndex.value > 0) {
          currentIndex.value--;
        }
      };
      const nextQuestion = () => {
        if (currentIndex.value < questions.value.length - 1) {
          currentIndex.value++;
        }
      };
      const jumpToQuestion = (index) => {
        currentIndex.value = index;
        showAnswerCard.value = false;
      };
      const loadPaperInfo = async () => {
        try {
          const res = await paperApi$1.getById(paperId.value);
          if (res.code === 200) {
            Object.assign(paper, res.data);
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/paper-preview.vue:285", "加载试卷信息失败:", e);
        }
      };
      const loadQuestions = async () => {
        try {
          const res = await paperApi$1.getQuestions(paperId.value);
          if (res.code === 200) {
            questions.value = res.data || [];
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/paper-preview.vue:296", "加载题目失败:", e);
        }
      };
      const loadSubjects = async () => {
        try {
          const res = await subjectApi.list();
          if (res.code === 200) {
            subjects.value = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/paper-preview.vue:307", "加载科目失败:", e);
        }
      };
      onLoad((options) => {
        paperId.value = options.id;
        loadSubjects();
        loadPaperInfo();
        loadQuestions();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "paper-preview" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.paperPreview"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createElementVNode("view", { class: "exam-header" }, [
            vue.createElementVNode(
              "text",
              { class: "exam-title" },
              vue.toDisplayString(paper.title),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "exam-meta" }, [
              vue.createElementVNode("view", { class: "meta-item" }, [
                vue.createElementVNode("text", { class: "meta-icon" }, "📚"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(getSubjectName(paper.subjectId)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "meta-item" }, [
                vue.createElementVNode("text", { class: "meta-icon" }, "⏱"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(paper.duration) + vue.toDisplayString(vue.unref(userStore).t("common.durationMinutes")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "meta-item" }, [
                vue.createElementVNode("text", { class: "meta-icon" }, "📝"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(questions.value.length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "meta-item" }, [
                vue.createElementVNode("text", { class: "meta-icon" }, "🏆"),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(paper.totalScore) + vue.toDisplayString(vue.unref(userStore).t("common.score")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ]),
          vue.unref(currentQuestion) ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
            key: 0,
            class: "question-area",
            "scroll-y": ""
          }, [
            vue.createElementVNode("view", { class: "question-card" }, [
              vue.createElementVNode("view", { class: "question-header" }, [
                vue.createElementVNode("view", { class: "question-type" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(getTypeText(vue.unref(currentQuestion).type)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "question-score" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(vue.unref(currentQuestion).score) + "分",
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "question-content" }, [
                vue.createElementVNode(
                  "text",
                  { class: "question-number" },
                  vue.toDisplayString(currentIndex.value + 1) + ".",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "content-text" },
                  vue.toDisplayString(vue.unref(currentQuestion).content),
                  1
                  /* TEXT */
                )
              ]),
              vue.unref(currentQuestion).type !== "FILL_BLANK" && vue.unref(currentQuestion).type !== "ESSAY" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "options-list"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(parseOptions(vue.unref(currentQuestion).options), (opt, idx) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "option-item",
                      key: idx
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "option-label" },
                        vue.toDisplayString(String.fromCharCode(65 + idx)) + ".",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "option-text" },
                        vue.toDisplayString(opt),
                        1
                        /* TEXT */
                      )
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "answer-section" }, [
                vue.createElementVNode(
                  "text",
                  { class: "answer-label" },
                  vue.toDisplayString(vue.unref(userStore).t("common.correctAnswer")) + "：",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "answer-text correct" },
                  vue.toDisplayString(formatAnswer(vue.unref(currentQuestion))),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "nav-footer" }, [
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["nav-btn", currentIndex.value === 0 ? "disabled" : ""]),
              onClick: prevQuestion,
              disabled: currentIndex.value === 0
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(vue.unref(userStore).t("common.prevQuestion")),
                1
                /* TEXT */
              )
            ], 10, ["disabled"]),
            vue.createElementVNode("view", { class: "question-indicator" }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(currentIndex.value + 1) + " / " + vue.toDisplayString(questions.value.length),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["nav-btn", currentIndex.value === questions.value.length - 1 ? "disabled" : ""]),
              onClick: nextQuestion,
              disabled: currentIndex.value === questions.value.length - 1
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(vue.unref(userStore).t("common.nextQuestion")),
                1
                /* TEXT */
              )
            ], 10, ["disabled"])
          ]),
          vue.createElementVNode("view", {
            class: "answer-card-btn",
            onClick: _cache[0] || (_cache[0] = ($event) => showAnswerCard.value = !showAnswerCard.value)
          }, [
            vue.createElementVNode("text", { class: "answer-card-icon" }, "📋"),
            vue.createElementVNode(
              "text",
              { class: "answer-card-text" },
              vue.toDisplayString(vue.unref(userStore).t("common.questionNav")),
              1
              /* TEXT */
            )
          ]),
          showAnswerCard.value ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "answer-card-modal",
            onClick: _cache[3] || (_cache[3] = ($event) => showAnswerCard.value = false)
          }, [
            vue.createElementVNode("view", {
              class: "answer-card-content",
              onClick: _cache[2] || (_cache[2] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "card-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "card-title" },
                  vue.toDisplayString(vue.unref(userStore).t("common.questionNav")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", {
                  class: "close-btn",
                  onClick: _cache[1] || (_cache[1] = ($event) => showAnswerCard.value = false)
                }, [
                  vue.createElementVNode("text", { class: "close-icon" }, "×")
                ])
              ]),
              vue.createElementVNode("scroll-view", {
                class: "card-body",
                "scroll-y": ""
              }, [
                vue.unref(singleQuestions).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "question-section"
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "section-title" },
                    vue.toDisplayString(vue.unref(userStore).t("common.singleChoice")) + " (" + vue.toDisplayString(vue.unref(singleQuestions).length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + ")",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "question-grid" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(vue.unref(singleQuestions), (q) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: vue.normalizeClass(["question-item", getQuestionIndex(q) === currentIndex.value ? "current" : ""]),
                          key: q.id,
                          onClick: ($event) => jumpToQuestion(getQuestionIndex(q))
                        }, [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(getQuestionIndex(q) + 1),
                            1
                            /* TEXT */
                          )
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : vue.createCommentVNode("v-if", true),
                vue.unref(multiQuestions).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "question-section"
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "section-title" },
                    vue.toDisplayString(vue.unref(userStore).t("common.multipleChoice")) + " (" + vue.toDisplayString(vue.unref(multiQuestions).length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + ")",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "question-grid" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(vue.unref(multiQuestions), (q) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: vue.normalizeClass(["question-item", getQuestionIndex(q) === currentIndex.value ? "current" : ""]),
                          key: q.id,
                          onClick: ($event) => jumpToQuestion(getQuestionIndex(q))
                        }, [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(getQuestionIndex(q) + 1),
                            1
                            /* TEXT */
                          )
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : vue.createCommentVNode("v-if", true),
                vue.unref(judgeQuestions).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 2,
                  class: "question-section"
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "section-title" },
                    vue.toDisplayString(vue.unref(userStore).t("common.judgment")) + " (" + vue.toDisplayString(vue.unref(judgeQuestions).length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + ")",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "question-grid" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(vue.unref(judgeQuestions), (q) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: vue.normalizeClass(["question-item", getQuestionIndex(q) === currentIndex.value ? "current" : ""]),
                          key: q.id,
                          onClick: ($event) => jumpToQuestion(getQuestionIndex(q))
                        }, [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(getQuestionIndex(q) + 1),
                            1
                            /* TEXT */
                          )
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : vue.createCommentVNode("v-if", true),
                vue.unref(fillQuestions).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 3,
                  class: "question-section"
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "section-title" },
                    vue.toDisplayString(vue.unref(userStore).t("common.fillBlank")) + " (" + vue.toDisplayString(vue.unref(fillQuestions).length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + ")",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "question-grid" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(vue.unref(fillQuestions), (q) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: vue.normalizeClass(["question-item", getQuestionIndex(q) === currentIndex.value ? "current" : ""]),
                          key: q.id,
                          onClick: ($event) => jumpToQuestion(getQuestionIndex(q))
                        }, [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(getQuestionIndex(q) + 1),
                            1
                            /* TEXT */
                          )
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : vue.createCommentVNode("v-if", true),
                vue.unref(essayQuestions).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 4,
                  class: "question-section"
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "section-title" },
                    vue.toDisplayString(vue.unref(userStore).t("common.essay")) + " (" + vue.toDisplayString(vue.unref(essayQuestions).length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + ")",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "question-grid" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(vue.unref(essayQuestions), (q) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          class: vue.normalizeClass(["question-item", getQuestionIndex(q) === currentIndex.value ? "current" : ""]),
                          key: q.id,
                          onClick: ($event) => jumpToQuestion(getQuestionIndex(q))
                        }, [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(getQuestionIndex(q) + 1),
                            1
                            /* TEXT */
                          )
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ])) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", { class: "card-legend" }, [
                vue.createElementVNode("view", { class: "legend-row" }, [
                  vue.createElementVNode("view", { class: "legend-item" }, [
                    vue.createElementVNode("view", { class: "dot current" }),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("common.current")),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "legend-item" }, [
                    vue.createElementVNode("view", { class: "dot unanswered" }),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("common.unanswered")),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  };
  const PagesTeacherPaperPreview = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-8c165299"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/paper-preview.vue"]]);
  const _sfc_main$9 = {
    __name: "exam-record-detail",
    setup(__props) {
      const userStore = useUserStore();
      const recordId = vue.ref("");
      const examId = vue.ref("");
      const examInfo = vue.reactive({
        title: "",
        subjectId: "",
        duration: 0,
        totalScore: 0
      });
      const recordInfo = vue.reactive({
        studentName: "",
        score: 0,
        submitTime: "",
        duration: 0,
        status: ""
      });
      const subjects = vue.ref([]);
      const questions = vue.ref([]);
      const studentAnswers = vue.ref({});
      const getSubjectName = (subjectId) => {
        const subject = subjects.value.find((s) => s.id === subjectId);
        return subject ? subject.name : userStore.t("common.unknownSubject");
      };
      const formatDateTime = (time) => {
        if (!time)
          return "";
        const date = new Date(time);
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        } else {
          return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
        }
      };
      const parseOptions = (options) => {
        if (!options)
          return [];
        if (Array.isArray(options)) {
          return options.map((opt) => {
            if (typeof opt === "object") {
              return opt.text || opt.content || JSON.stringify(opt);
            }
            return String(opt);
          });
        }
        if (typeof options === "string") {
          try {
            const parsed = JSON.parse(options);
            if (Array.isArray(parsed)) {
              return parsed.map((opt) => {
                if (typeof opt === "object") {
                  return opt.text || opt.content || JSON.stringify(opt);
                }
                return String(opt);
              });
            }
          } catch (e) {
            return options.split("|").filter((o) => o.trim());
          }
        }
        return [];
      };
      const getQuestionNumber = (q) => {
        return questions.value.findIndex((item) => item.id === q.id) + 1;
      };
      const getStudentAnswer = (q) => {
        return studentAnswers.value[q.id];
      };
      const isCorrectAnswer = (q) => {
        const studentAnswer = studentAnswers.value[q.id];
        if (!studentAnswer)
          return false;
        return studentAnswer === q.correctAnswer;
      };
      const isCorrectOption = (q, idx) => {
        if (!q.correctAnswer)
          return false;
        const optionLetter = String.fromCharCode(65 + idx);
        return q.correctAnswer.includes(optionLetter);
      };
      const isStudentAnswer = (q, idx) => {
        const studentAnswer = studentAnswers.value[q.id];
        if (!studentAnswer)
          return false;
        const optionLetter = String.fromCharCode(65 + idx);
        return studentAnswer.includes(optionLetter);
      };
      const getOptionClass = (q, idx) => {
        const classes = [];
        if (isCorrectOption(q, idx)) {
          classes.push("correct");
        }
        if (isStudentAnswer(q, idx)) {
          if (isCorrectOption(q, idx)) {
            classes.push("selected");
          } else {
            classes.push("selected wrong");
          }
        }
        return classes.join(" ");
      };
      const singleQuestions = computed(() => questions.value.filter((q) => q.type === "SINGLE_CHOICE"));
      const multiQuestions = computed(() => questions.value.filter((q) => q.type === "MULTIPLE_CHOICE"));
      const judgeQuestions = computed(() => questions.value.filter((q) => q.type === "JUDGMENT"));
      const fillQuestions = computed(() => questions.value.filter((q) => q.type === "FILL_BLANK"));
      const essayQuestions = computed(() => questions.value.filter((q) => q.type === "ESSAY"));
      const loadRecord = async () => {
        try {
          uni.showLoading({ title: userStore.t("common.loading") });
          const res = await examRecordApi.getById(recordId.value);
          if (res.code === 200) {
            const data = res.data;
            recordInfo.studentName = data.studentName;
            recordInfo.score = data.score || 0;
            recordInfo.submitTime = data.submitTime;
            recordInfo.duration = data.duration;
            recordInfo.status = data.status;
            if (data.answers) {
              try {
                studentAnswers.value = typeof data.answers === "string" ? JSON.parse(data.answers) : data.answers;
              } catch (e) {
                formatAppLog("error", "at pages/teacher/exam-record-detail.vue:320", "解析答案失败:", e);
              }
            }
          }
          const examRes = await examApi.getById(examId.value);
          if (examRes.code === 200) {
            Object.assign(examInfo, examRes.data);
            if (examRes.data.paperId) {
              const qRes = await paperApi.getQuestions(examRes.data.paperId);
              if (qRes.code === 200) {
                questions.value = qRes.data || [];
              }
            }
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-record-detail.vue:337", "加载失败:", e);
          uni.showToast({ title: userStore.t("common.loadFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const loadSubjects = async () => {
        try {
          const res = await subjectApi.list();
          if (res.code === 200) {
            subjects.value = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-record-detail.vue:351", "加载科目失败:", e);
        }
      };
      onLoad((options) => {
        recordId.value = options.recordId;
        examId.value = options.examId;
        loadSubjects();
        loadRecord();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "exam-detail" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.examRecordDetail"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createElementVNode("scroll-view", {
            class: "content",
            "scroll-y": ""
          }, [
            vue.createElementVNode("view", { class: "exam-info-card" }, [
              vue.createElementVNode(
                "text",
                { class: "exam-title" },
                vue.toDisplayString(examInfo.title),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "exam-meta" }, [
                vue.createElementVNode("view", { class: "meta-item" }, [
                  vue.createElementVNode("text", { class: "meta-icon" }, "📚"),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(getSubjectName(examInfo.subjectId)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "meta-item" }, [
                  vue.createElementVNode("text", { class: "meta-icon" }, "⏱"),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(examInfo.duration) + vue.toDisplayString(vue.unref(userStore).t("common.minutes")),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "meta-item" }, [
                  vue.createElementVNode("text", { class: "meta-icon" }, "🏆"),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(examInfo.totalScore) + vue.toDisplayString(vue.unref(userStore).t("common.score")),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "student-info-card" }, [
              vue.createElementVNode("view", { class: "student-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "student-name" },
                  vue.toDisplayString(recordInfo.studentName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["score-badge", recordInfo.score >= 60 ? "pass" : "fail"])
                  },
                  [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(recordInfo.score || 0) + vue.toDisplayString(vue.unref(userStore).t("common.score")),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                )
              ]),
              vue.createElementVNode("view", { class: "student-meta" }, [
                vue.createElementVNode("view", { class: "meta-item" }, [
                  vue.createElementVNode("text", { class: "meta-icon" }, "📅"),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(vue.unref(userStore).t("common.submitTime")) + "：" + vue.toDisplayString(formatDateTime(recordInfo.submitTime)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "meta-item" }, [
                  vue.createElementVNode("text", { class: "meta-icon" }, "⏱"),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(vue.unref(userStore).t("common.duration")) + "：" + vue.toDisplayString(recordInfo.duration || 0) + vue.toDisplayString(vue.unref(userStore).t("common.minutes")),
                    1
                    /* TEXT */
                  )
                ]),
                recordInfo.status === "AUTO_SUBMITTED" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "meta-item warning"
                }, [
                  vue.createElementVNode("text", { class: "meta-icon" }, "⚠️"),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(vue.unref(userStore).t("common.autoSubmitted")),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.unref(singleQuestions).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "question-section"
            }, [
              vue.createElementVNode("view", { class: "section-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "section-title" },
                  vue.toDisplayString(vue.unref(userStore).language === "zh" ? "一" : "1") + "、" + vue.toDisplayString(vue.unref(userStore).t("common.singleChoice")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "section-score" },
                  "（" + vue.toDisplayString(vue.unref(userStore).t("common.total")) + vue.toDisplayString(vue.unref(singleQuestions).length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + "）",
                  1
                  /* TEXT */
                )
              ]),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(vue.unref(singleQuestions), (q, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "question-item",
                    key: q.id
                  }, [
                    vue.createElementVNode("view", { class: "question-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "question-number" },
                        vue.toDisplayString(getQuestionNumber(q)) + ".",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "question-score" },
                        "（" + vue.toDisplayString(q.score) + vue.toDisplayString(vue.unref(userStore).t("common.score")) + "）",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "question-content" },
                      vue.toDisplayString(q.content),
                      1
                      /* TEXT */
                    ),
                    parseOptions(q.options).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "options-list"
                    }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(parseOptions(q.options), (opt, idx) => {
                          return vue.openBlock(), vue.createElementBlock(
                            "view",
                            {
                              class: vue.normalizeClass(["option-item", getOptionClass(q, idx)]),
                              key: idx
                            },
                            [
                              vue.createElementVNode(
                                "text",
                                { class: "option-label" },
                                vue.toDisplayString(String.fromCharCode(65 + idx)) + ".",
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "option-text" },
                                vue.toDisplayString(opt),
                                1
                                /* TEXT */
                              ),
                              isCorrectOption(q, idx) ? (vue.openBlock(), vue.createElementBlock("text", {
                                key: 0,
                                class: "correct-mark"
                              }, "✓")) : vue.createCommentVNode("v-if", true),
                              isStudentAnswer(q, idx) && !isCorrectOption(q, idx) ? (vue.openBlock(), vue.createElementBlock("text", {
                                key: 1,
                                class: "wrong-mark"
                              }, "✗")) : vue.createCommentVNode("v-if", true)
                            ],
                            2
                            /* CLASS */
                          );
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode("view", { class: "answer-row" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "answer-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.studentAnswer")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        {
                          class: vue.normalizeClass(["answer-text", isCorrectAnswer(q) ? "correct" : "wrong"])
                        },
                        vue.toDisplayString(getStudentAnswer(q) || vue.unref(userStore).t("common.notAnswered")),
                        3
                        /* TEXT, CLASS */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.correctAnswer")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-text correct" },
                        vue.toDisplayString(q.correctAnswer),
                        1
                        /* TEXT */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true),
            vue.unref(multiQuestions).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "question-section"
            }, [
              vue.createElementVNode("view", { class: "section-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "section-title" },
                  vue.toDisplayString(vue.unref(userStore).language === "zh" ? "二" : "2") + "、" + vue.toDisplayString(vue.unref(userStore).t("common.multipleChoice")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "section-score" },
                  "（" + vue.toDisplayString(vue.unref(userStore).t("common.total")) + vue.toDisplayString(vue.unref(multiQuestions).length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + "）",
                  1
                  /* TEXT */
                )
              ]),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(vue.unref(multiQuestions), (q, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "question-item",
                    key: q.id
                  }, [
                    vue.createElementVNode("view", { class: "question-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "question-number" },
                        vue.toDisplayString(getQuestionNumber(q)) + ".",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "question-score" },
                        "（" + vue.toDisplayString(q.score) + vue.toDisplayString(vue.unref(userStore).t("common.score")) + "）",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "question-content" },
                      vue.toDisplayString(q.content),
                      1
                      /* TEXT */
                    ),
                    parseOptions(q.options).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "options-list"
                    }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(parseOptions(q.options), (opt, idx) => {
                          return vue.openBlock(), vue.createElementBlock(
                            "view",
                            {
                              class: vue.normalizeClass(["option-item", getOptionClass(q, idx)]),
                              key: idx
                            },
                            [
                              vue.createElementVNode(
                                "text",
                                { class: "option-label" },
                                vue.toDisplayString(String.fromCharCode(65 + idx)) + ".",
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "option-text" },
                                vue.toDisplayString(opt),
                                1
                                /* TEXT */
                              ),
                              isCorrectOption(q, idx) ? (vue.openBlock(), vue.createElementBlock("text", {
                                key: 0,
                                class: "correct-mark"
                              }, "✓")) : vue.createCommentVNode("v-if", true),
                              isStudentAnswer(q, idx) && !isCorrectOption(q, idx) ? (vue.openBlock(), vue.createElementBlock("text", {
                                key: 1,
                                class: "wrong-mark"
                              }, "✗")) : vue.createCommentVNode("v-if", true)
                            ],
                            2
                            /* CLASS */
                          );
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode("view", { class: "answer-row" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "answer-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.studentAnswer")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        {
                          class: vue.normalizeClass(["answer-text", isCorrectAnswer(q) ? "correct" : "wrong"])
                        },
                        vue.toDisplayString(getStudentAnswer(q) || vue.unref(userStore).t("common.notAnswered")),
                        3
                        /* TEXT, CLASS */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.correctAnswer")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-text correct" },
                        vue.toDisplayString(q.correctAnswer),
                        1
                        /* TEXT */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true),
            vue.unref(judgeQuestions).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "question-section"
            }, [
              vue.createElementVNode("view", { class: "section-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "section-title" },
                  vue.toDisplayString(vue.unref(userStore).language === "zh" ? "三" : "3") + "、" + vue.toDisplayString(vue.unref(userStore).t("common.trueFalse")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "section-score" },
                  "（" + vue.toDisplayString(vue.unref(userStore).t("common.total")) + vue.toDisplayString(vue.unref(judgeQuestions).length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + "）",
                  1
                  /* TEXT */
                )
              ]),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(vue.unref(judgeQuestions), (q, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "question-item",
                    key: q.id
                  }, [
                    vue.createElementVNode("view", { class: "question-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "question-number" },
                        vue.toDisplayString(getQuestionNumber(q)) + ".",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "question-score" },
                        "（" + vue.toDisplayString(q.score) + vue.toDisplayString(vue.unref(userStore).t("common.score")) + "）",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "question-content" },
                      vue.toDisplayString(q.content),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "answer-row" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "answer-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.studentAnswer")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        {
                          class: vue.normalizeClass(["answer-text", isCorrectAnswer(q) ? "correct" : "wrong"])
                        },
                        vue.toDisplayString(getStudentAnswer(q) || vue.unref(userStore).t("common.notAnswered")),
                        3
                        /* TEXT, CLASS */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.correctAnswer")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-text correct" },
                        vue.toDisplayString(q.correctAnswer === "A" || q.correctAnswer === "正确" || q.correctAnswer === "True" ? vue.unref(userStore).t("common.correct") : vue.unref(userStore).t("common.wrong")),
                        1
                        /* TEXT */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true),
            vue.unref(fillQuestions).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 3,
              class: "question-section"
            }, [
              vue.createElementVNode("view", { class: "section-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "section-title" },
                  vue.toDisplayString(vue.unref(userStore).language === "zh" ? "四" : "4") + "、" + vue.toDisplayString(vue.unref(userStore).t("common.fillBlank")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "section-score" },
                  "（" + vue.toDisplayString(vue.unref(userStore).t("common.total")) + vue.toDisplayString(vue.unref(fillQuestions).length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + "）",
                  1
                  /* TEXT */
                )
              ]),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(vue.unref(fillQuestions), (q, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "question-item",
                    key: q.id
                  }, [
                    vue.createElementVNode("view", { class: "question-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "question-number" },
                        vue.toDisplayString(getQuestionNumber(q)) + ".",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "question-score" },
                        "（" + vue.toDisplayString(q.score) + vue.toDisplayString(vue.unref(userStore).t("common.score")) + "）",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "question-content" },
                      vue.toDisplayString(q.content),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "answer-row" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "answer-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.studentAnswer")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        {
                          class: vue.normalizeClass(["answer-text", isCorrectAnswer(q) ? "correct" : "wrong"])
                        },
                        vue.toDisplayString(getStudentAnswer(q) || vue.unref(userStore).t("common.notAnswered")),
                        3
                        /* TEXT, CLASS */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.correctAnswer")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-text correct" },
                        vue.toDisplayString(q.correctAnswer),
                        1
                        /* TEXT */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true),
            vue.unref(essayQuestions).length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 4,
              class: "question-section"
            }, [
              vue.createElementVNode("view", { class: "section-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "section-title" },
                  vue.toDisplayString(vue.unref(userStore).language === "zh" ? "五" : "5") + "、" + vue.toDisplayString(vue.unref(userStore).t("common.shortAnswer")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "section-score" },
                  "（" + vue.toDisplayString(vue.unref(userStore).t("common.total")) + vue.toDisplayString(vue.unref(essayQuestions).length) + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + "）",
                  1
                  /* TEXT */
                )
              ]),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(vue.unref(essayQuestions), (q, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "question-item",
                    key: q.id
                  }, [
                    vue.createElementVNode("view", { class: "question-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "question-number" },
                        vue.toDisplayString(getQuestionNumber(q)) + ".",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "question-score" },
                        "（" + vue.toDisplayString(q.score) + vue.toDisplayString(vue.unref(userStore).t("common.score")) + "）",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "question-content" },
                      vue.toDisplayString(q.content),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "answer-section" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "answer-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.studentAnswer")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-text" },
                        vue.toDisplayString(getStudentAnswer(q) || vue.unref(userStore).t("common.notAnswered")),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "answer-section" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "answer-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.referenceAnswer")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-text correct" },
                        vue.toDisplayString(q.correctAnswer),
                        1
                        /* TEXT */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ]);
      };
    }
  };
  const PagesTeacherExamRecordDetail = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-798daac6"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/exam-record-detail.vue"]]);
  const _sfc_main$8 = {
    __name: "exam-grade",
    setup(__props) {
      const userStore = useUserStore();
      const recordId = vue.ref("");
      const examId = vue.ref("");
      const examInfo = vue.reactive({
        title: "",
        subjectId: "",
        duration: 0,
        totalScore: 0
      });
      const recordInfo = vue.reactive({
        studentName: "",
        score: 0,
        submitTime: "",
        duration: 0,
        status: ""
      });
      vue.ref([]);
      const questions = vue.ref([]);
      const studentAnswers = vue.ref({});
      const grades = vue.reactive({});
      const getTypeText = (type) => {
        return {
          SINGLE_CHOICE: userStore.t("common.singleChoice"),
          MULTIPLE_CHOICE: userStore.t("common.multipleChoice"),
          JUDGMENT: userStore.t("common.trueFalse"),
          FILL_BLANK: userStore.t("common.fillBlank"),
          ESSAY: userStore.t("common.shortAnswer")
        }[type] || type;
      };
      const isSubjective = (type) => {
        return type === "FILL_BLANK" || type === "ESSAY";
      };
      const parseOptions = (options) => {
        if (!options)
          return [];
        if (Array.isArray(options)) {
          return options.map((opt) => {
            if (typeof opt === "object") {
              return opt.text || opt.content || JSON.stringify(opt);
            }
            return String(opt);
          });
        }
        if (typeof options === "string") {
          try {
            const parsed = JSON.parse(options);
            if (Array.isArray(parsed)) {
              return parsed.map((opt) => {
                if (typeof opt === "object") {
                  return opt.text || opt.content || JSON.stringify(opt);
                }
                return String(opt);
              });
            }
          } catch (e) {
            return options.split("|").filter((o) => o.trim());
          }
        }
        return [];
      };
      const formatAnswer = (q) => {
        const answer = q.answer || q.correctAnswer;
        if (!answer)
          return "";
        if (q.type === "JUDGMENT") {
          return answer === "A" || answer === "正确" ? userStore.t("common.correct") : userStore.t("common.wrong");
        }
        return answer;
      };
      const getStudentAnswer = (q) => {
        return studentAnswers.value[q.id];
      };
      const isCorrectAnswer = (q) => {
        const studentAnswer = studentAnswers.value[q.id];
        if (!studentAnswer)
          return false;
        return studentAnswer === q.correctAnswer;
      };
      const isCorrectOption = (q, idx) => {
        if (!q.correctAnswer)
          return false;
        const optionLetter = String.fromCharCode(65 + idx);
        return q.correctAnswer.includes(optionLetter);
      };
      const isStudentAnswer = (q, idx) => {
        const studentAnswer = studentAnswers.value[q.id];
        if (!studentAnswer)
          return false;
        const optionLetter = String.fromCharCode(65 + idx);
        return studentAnswer.includes(optionLetter);
      };
      const getOptionClass = (q, idx) => {
        const classes = [];
        if (isCorrectOption(q, idx)) {
          classes.push("correct");
        }
        if (isStudentAnswer(q, idx)) {
          if (isCorrectOption(q, idx)) {
            classes.push("selected");
          } else {
            classes.push("selected wrong");
          }
        }
        return classes.join(" ");
      };
      const loadRecord = async () => {
        try {
          uni.showLoading({ title: userStore.t("common.loading") });
          const res = await examRecordApi.getById(recordId.value);
          if (res.code === 200) {
            const data = res.data;
            recordInfo.studentName = data.studentName;
            recordInfo.score = data.score || 0;
            recordInfo.submitTime = data.submitTime;
            recordInfo.duration = data.duration;
            recordInfo.status = data.status;
            if (data.answers) {
              try {
                studentAnswers.value = typeof data.answers === "string" ? JSON.parse(data.answers) : data.answers;
              } catch (e) {
                formatAppLog("error", "at pages/teacher/exam-grade.vue:205", "解析答案失败:", e);
              }
            }
            if (data.exam) {
              Object.assign(examInfo, data.exam);
              if (data.questions) {
                questions.value = data.questions || [];
                questions.value.forEach((q) => {
                  if (isSubjective(q.type)) {
                    grades[q.id] = "";
                  }
                });
              }
            }
          }
          if (!examInfo.title) {
            const examRes = await examApi.getById(examId.value);
            if (examRes.code === 200) {
              Object.assign(examInfo, examRes.data);
              if (examRes.data.paperId && questions.value.length === 0) {
                const qRes = await paperApi$1.getQuestions(examRes.data.paperId);
                if (qRes.code === 200) {
                  questions.value = qRes.data || [];
                  questions.value.forEach((q) => {
                    if (isSubjective(q.type)) {
                      grades[q.id] = "";
                    }
                  });
                }
              }
            }
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-grade.vue:242", "加载失败:", e);
          uni.showToast({ title: userStore.t("common.loadFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      const submitGrade = async () => {
        try {
          uni.showLoading({ title: userStore.t("teacher.grading") });
          const gradeData = {};
          let hasGrade = false;
          questions.value.forEach((q) => {
            if (isSubjective(q.type) && grades[q.id] !== "") {
              const score = parseInt(grades[q.id]);
              if (!isNaN(score) && score >= 0 && score <= q.score) {
                gradeData[q.id] = score;
                hasGrade = true;
              }
            }
          });
          if (!hasGrade) {
            uni.showToast({ title: userStore.t("teacher.pleaseGradeAtLeastOne"), icon: "none" });
            return;
          }
          const res = await examRecordApi.grade(recordId.value, { grades: gradeData });
          if (res.code === 200) {
            uni.showToast({ title: userStore.t("teacher.gradeSuccess"), icon: "success" });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({ title: res.message || userStore.t("teacher.gradeFailed"), icon: "none" });
          }
        } catch (e) {
          formatAppLog("error", "at pages/teacher/exam-grade.vue:281", "评分失败:", e);
          uni.showToast({ title: userStore.t("teacher.gradeFailed"), icon: "none" });
        } finally {
          uni.hideLoading();
        }
      };
      onLoad((options) => {
        recordId.value = options.recordId;
        examId.value = options.examId;
        loadRecord();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "exam-grade" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.grade"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createElementVNode("scroll-view", {
            class: "grade-body",
            "scroll-y": ""
          }, [
            vue.createElementVNode("view", { class: "info-card" }, [
              vue.createElementVNode(
                "text",
                { class: "exam-title" },
                vue.toDisplayString(examInfo.title),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "student-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "student-name" },
                  vue.toDisplayString(recordInfo.studentName),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "current-score" },
                  vue.toDisplayString(vue.unref(userStore).t("common.currentScore")) + "：" + vue.toDisplayString(recordInfo.score || 0) + " / " + vue.toDisplayString(examInfo.totalScore) + vue.toDisplayString(vue.unref(userStore).t("common.score")),
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "question-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(questions.value, (q, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "question-item",
                    key: q.id
                  }, [
                    vue.createElementVNode("view", { class: "question-header" }, [
                      vue.createElementVNode("view", { class: "question-type" }, [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(getTypeText(q.type)),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "question-score" }, [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(q.score) + vue.toDisplayString(vue.unref(userStore).t("common.score")),
                          1
                          /* TEXT */
                        )
                      ]),
                      vue.createElementVNode(
                        "text",
                        { class: "question-number" },
                        vue.toDisplayString(vue.unref(userStore).t("common.question")) + " " + vue.toDisplayString(index + 1),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "question-content" },
                      vue.toDisplayString(q.content),
                      1
                      /* TEXT */
                    ),
                    q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE" ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "options-list"
                    }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(parseOptions(q.options), (opt, idx) => {
                          return vue.openBlock(), vue.createElementBlock(
                            "view",
                            {
                              class: vue.normalizeClass(["option-item", getOptionClass(q, idx)]),
                              key: idx
                            },
                            [
                              vue.createElementVNode(
                                "text",
                                { class: "option-label" },
                                vue.toDisplayString(String.fromCharCode(65 + idx)) + ".",
                                1
                                /* TEXT */
                              ),
                              vue.createElementVNode(
                                "text",
                                { class: "option-text" },
                                vue.toDisplayString(opt),
                                1
                                /* TEXT */
                              ),
                              isCorrectOption(q, idx) ? (vue.openBlock(), vue.createElementBlock("text", {
                                key: 0,
                                class: "correct-mark"
                              }, "✓")) : vue.createCommentVNode("v-if", true),
                              isStudentAnswer(q, idx) && !isCorrectOption(q, idx) ? (vue.openBlock(), vue.createElementBlock("text", {
                                key: 1,
                                class: "wrong-mark"
                              }, "✗")) : vue.createCommentVNode("v-if", true)
                            ],
                            2
                            /* CLASS */
                          );
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode("view", { class: "answer-section" }, [
                      vue.createElementVNode("view", { class: "answer-row" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "answer-label" },
                          vue.toDisplayString(vue.unref(userStore).t("student.yourAnswer")) + "：",
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          {
                            class: vue.normalizeClass(["answer-text", isCorrectAnswer(q) ? "correct" : "wrong"])
                          },
                          vue.toDisplayString(getStudentAnswer(q) || vue.unref(userStore).t("student.unanswered")),
                          3
                          /* TEXT, CLASS */
                        )
                      ]),
                      vue.createElementVNode("view", { class: "answer-row" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "answer-label" },
                          vue.toDisplayString(vue.unref(userStore).t("common.correctAnswer")) + "：",
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "answer-text correct" },
                          vue.toDisplayString(formatAnswer(q)),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    isSubjective(q.type) ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "grade-section"
                    }, [
                      vue.createElementVNode(
                        "text",
                        { class: "grade-label" },
                        vue.toDisplayString(vue.unref(userStore).t("common.grade")) + "（0-" + vue.toDisplayString(q.score) + vue.toDisplayString(vue.unref(userStore).t("common.score")) + "）",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "grade-input-row" }, [
                        vue.withDirectives(vue.createElementVNode("input", {
                          class: "grade-input",
                          type: "number",
                          "onUpdate:modelValue": ($event) => grades[q.id] = $event,
                          max: q.score,
                          placeholder: "0"
                        }, null, 8, ["onUpdate:modelValue", "max"]), [
                          [vue.vModelText, grades[q.id]]
                        ]),
                        vue.createElementVNode(
                          "text",
                          { class: "grade-unit" },
                          vue.toDisplayString(vue.unref(userStore).t("common.score")),
                          1
                          /* TEXT */
                        )
                      ])
                    ])) : vue.createCommentVNode("v-if", true)
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode("view", { class: "grade-footer" }, [
            vue.createElementVNode(
              "button",
              {
                class: "submit-btn",
                onClick: submitGrade
              },
              vue.toDisplayString(vue.unref(userStore).t("common.submitGrade")),
              1
              /* TEXT */
            )
          ])
        ]);
      };
    }
  };
  const PagesTeacherExamGrade = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-87f028a1"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/teacher/exam-grade.vue"]]);
  const _sfc_main$7 = {
    __name: "my-classes",
    setup(__props) {
      const userStore = useUserStore();
      const inviteCode = vue.ref("");
      const classList = vue.ref([]);
      const getRoleText = (role) => {
        return {
          CREATOR: userStore.t("common.owner"),
          OWNER: userStore.t("common.owner"),
          ADMIN: userStore.t("common.admin"),
          TEACHER: userStore.t("common.teacher"),
          STUDENT: userStore.t("common.student"),
          MEMBER: userStore.t("common.member")
        }[role] || role;
      };
      const handleJoin = async () => {
        var _a;
        if (!inviteCode.value.trim()) {
          uni.showToast({
            title: userStore.t("student.enterClassCode"),
            icon: "none"
          });
          return;
        }
        try {
          const userId = (_a = userStore.userInfo) == null ? void 0 : _a.userId;
          if (!userId) {
            uni.showToast({
              title: userStore.t("student.pleaseLogin"),
              icon: "none"
            });
            return;
          }
          const res = await classApi.joinByCode(inviteCode.value, userId);
          if (res.code === 200) {
            uni.showToast({
              title: userStore.t("student.joinSuccess"),
              icon: "success"
            });
            inviteCode.value = "";
            loadClasses();
          } else {
            uni.showToast({
              title: res.message || userStore.t("student.joinFailed"),
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/my-classes.vue:106", e);
          uni.showToast({
            title: userStore.t("student.networkError"),
            icon: "none"
          });
        }
      };
      const enterClass = (classId) => {
        uni.navigateTo({
          url: `/pages/student/class-chat?id=${classId}`
        });
      };
      const loadClasses = async () => {
        var _a;
        try {
          const userId = ((_a = userStore.userInfo) == null ? void 0 : _a.userId) || uni.getStorageSync("userId");
          if (!userId) {
            return;
          }
          const res = await classApi.getMyClasses(userId);
          if (res.code === 200) {
            classList.value = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/my-classes.vue:132", "加载班级失败:", e);
          uni.showToast({
            title: userStore.t("student.loadFailed"),
            icon: "none"
          });
        }
      };
      const getLastMessage = (cls) => {
        if (!cls.lastMessage)
          return userStore.t("common.noData");
        if (cls.lastMessage.startsWith("EXAM_NOTICE|")) {
          return parseExamNotice(cls.lastMessage);
        }
        return cls.lastMessage;
      };
      const parseExamNotice = (content) => {
        if (!(content == null ? void 0 : content.startsWith("EXAM_NOTICE|")))
          return "";
        const parts = content.split("|");
        const noticeType = parts[1] || "";
        const title = parts[2] || "";
        if (noticeType === "START") {
          return "🚀 " + title + " " + userStore.t("student.examStarted");
        } else if (noticeType === "PUBLISH") {
          return "📢 " + title + " " + userStore.t("student.examPublished");
        } else if (noticeType === "END") {
          return "🔚 " + title + " " + userStore.t("common.finished");
        }
        return "📝 " + title;
      };
      const formatMessageTime = (time) => {
        if (!time)
          return "";
        const date = new Date(time);
        const now2 = /* @__PURE__ */ new Date();
        const diff = now2 - date;
        if (diff < 6e4)
          return userStore.t("student.justNow");
        if (diff < 36e5)
          return Math.floor(diff / 6e4) + (userStore.language === "zh" ? userStore.t("common.minutes") + userStore.t("student.ago") : userStore.t("student.minutesAgo"));
        if (diff < 864e5)
          return Math.floor(diff / 36e5) + (userStore.language === "zh" ? userStore.t("common.hours") + userStore.t("student.ago") : userStore.t("student.hoursAgo"));
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } else {
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        }
      };
      vue.onMounted(() => {
        uni.setNavigationBarTitle({ title: userStore.t("common.myClasses") });
        loadClasses();
      });
      vue.watch(() => userStore.language, () => {
        uni.setNavigationBarTitle({ title: userStore.t("common.myClasses") });
      });
      return (_ctx, _cache) => {
        const _component_uni_icons = vue.resolveComponent("uni-icons");
        return vue.openBlock(), vue.createElementBlock("view", { class: "my-classes" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.myClass"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createElementVNode("view", { class: "page-header" }, [
            vue.createElementVNode(
              "text",
              { class: "subtitle" },
              vue.toDisplayString(vue.unref(userStore).t("student.viewLatest")),
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 加入班级 "),
          vue.createElementVNode("view", { class: "join-card" }, [
            vue.createElementVNode("view", { class: "join-form" }, [
              vue.createElementVNode("view", { class: "join-input" }, [
                vue.createVNode(_component_uni_icons, {
                  type: "personadd",
                  size: "20",
                  color: "#999"
                }),
                vue.withDirectives(vue.createElementVNode("input", {
                  type: "text",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => inviteCode.value = $event),
                  placeholder: vue.unref(userStore).t("student.enterClassCode"),
                  onConfirm: handleJoin
                }, null, 40, ["placeholder"]), [
                  [vue.vModelText, inviteCode.value]
                ])
              ]),
              vue.createElementVNode(
                "button",
                {
                  class: "join-btn",
                  onClick: handleJoin
                },
                vue.toDisplayString(vue.unref(userStore).t("student.joinClass")),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createCommentVNode(" 班级消息列表 "),
          classList.value.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "class-message-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(classList.value, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "class-message-card",
                  key: item.class.id,
                  onClick: ($event) => enterClass(item.class.id)
                }, [
                  vue.createElementVNode("view", { class: "class-message-icon" }, [
                    vue.createElementVNode("text", { class: "icon-emoji" }, "🏫")
                  ]),
                  vue.createElementVNode("view", { class: "class-message-main" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "class-message-name" },
                      vue.toDisplayString(item.class.className),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "class-message-content" },
                      vue.toDisplayString(getLastMessage(item.class)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "class-message-right" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "class-message-time" },
                      vue.toDisplayString(formatMessageTime(item.class.lastMessageTime)),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "class-message-invite" },
                      vue.toDisplayString(item.class.inviteCode),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "class-message-role" },
                      vue.toDisplayString(getRoleText(item.role)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("text", { class: "arrow-icon" }, "›")
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          classList.value.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "empty"
          }, [
            vue.createVNode(_component_uni_icons, {
              type: "info",
              size: "80",
              color: "#999"
            }),
            vue.createElementVNode(
              "text",
              { class: "empty-text" },
              vue.toDisplayString(vue.unref(userStore).t("student.noClass")),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  };
  const PagesStudentMyClasses = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-c97905fd"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/student/my-classes.vue"]]);
  const _sfc_main$6 = {
    __name: "class-chat",
    setup(__props) {
      const userStore = useUserStore();
      const classId = vue.ref("");
      const className = vue.ref("");
      const memberCount = vue.ref(0);
      const messages = vue.ref([]);
      const members = vue.ref([]);
      const inputMessage = vue.ref("");
      const showMembers = vue.ref(false);
      const isMuted = vue.ref(false);
      const scrollTop = vue.ref(0);
      const iconRocket = "🚀";
      const iconBell = "🔔";
      const iconCalendar = "📅";
      const iconEnd = "🔚";
      const iconTimer = "⏱";
      const getRoleText = (role) => {
        return {
          CREATOR: userStore.t("common.creator"),
          OWNER: userStore.t("common.creator"),
          TEACHER: userStore.t("common.teacher"),
          STUDENT: userStore.t("common.student"),
          MEMBER: userStore.t("common.student")
        }[role] || role;
      };
      const isSelfMessage = (senderId) => {
        var _a;
        const userId = (_a = userStore.userInfo) == null ? void 0 : _a.userId;
        return String(senderId) === String(userId);
      };
      const getSenderName = (senderId) => {
        const member = members.value.find((m) => String(m.userId) === String(senderId));
        return (member == null ? void 0 : member.realName) || userStore.t("common.unknownUser");
      };
      const getSenderAvatar = (senderId) => {
        const member = members.value.find((m) => String(m.userId) === String(senderId));
        const avatar = member == null ? void 0 : member.avatar;
        if (!avatar)
          return "/static/default-avatar.png";
        if (avatar.startsWith("http"))
          return avatar;
        return "http://192.168.1.92:8081" + avatar;
      };
      const isExamNotice = (msg) => {
        var _a;
        return (_a = msg.content) == null ? void 0 : _a.startsWith("EXAM_NOTICE|");
      };
      const sendMessage = async () => {
        var _a;
        if (!inputMessage.value.trim() || isMuted.value)
          return;
        try {
          const userId = (_a = userStore.userInfo) == null ? void 0 : _a.userId;
          const res = await classApi.sendMessage(classId.value, inputMessage.value, userId);
          if (res.code === 200) {
            inputMessage.value = "";
            loadMessages();
          } else {
            uni.showToast({
              title: res.message || userStore.t("common.sendFailed"),
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/class-chat.vue:179", e);
          uni.showToast({
            title: userStore.t("common.networkError"),
            icon: "none"
          });
        }
      };
      const parseExamNotice = (content) => {
        if (!(content == null ? void 0 : content.startsWith("EXAM_NOTICE|")))
          return null;
        const parts = content.split("|");
        let examId = null;
        for (let i = parts.length - 1; i >= 0; i--) {
          if (/^\d+$/.test(parts[i])) {
            examId = parts[i];
            break;
          }
        }
        return {
          noticeType: parts[1],
          title: parts[2],
          startTime: parts[3],
          endTime: parts[4],
          duration: parts[5],
          examId
        };
      };
      const getNoticeIcon = (content) => {
        const notice = parseExamNotice(content);
        return (notice == null ? void 0 : notice.noticeType) === "START" ? iconRocket : iconBell;
      };
      const getNoticeBadge = (content) => {
        const notice = parseExamNotice(content);
        return (notice == null ? void 0 : notice.noticeType) === "START" ? userStore.t("common.ongoing") : userStore.t("common.pending");
      };
      const getNoticeBtnText = (content) => {
        const notice = parseExamNotice(content);
        return (notice == null ? void 0 : notice.noticeType) === "START" ? userStore.t("student.enterExam") : userStore.t("student.viewExam");
      };
      const getNoticeTitle = (content) => {
        const notice = parseExamNotice(content);
        return notice ? notice.title : "";
      };
      const getNoticeStartTime = (content) => {
        const notice = parseExamNotice(content);
        return notice ? notice.startTime : "";
      };
      const getNoticeEndTime = (content) => {
        const notice = parseExamNotice(content);
        return notice ? notice.endTime : "";
      };
      const getNoticeDuration = (content) => {
        const notice = parseExamNotice(content);
        return notice ? notice.duration : "";
      };
      const formatTime = (time) => {
        if (!time)
          return "";
        const date = new Date(time);
        const now2 = /* @__PURE__ */ new Date();
        const diff = now2 - date;
        if (diff < 6e4)
          return userStore.t("common.justNow");
        if (diff < 36e5)
          return Math.floor(diff / 6e4) + userStore.t("common.minutesAgo");
        if (diff < 864e5)
          return Math.floor(diff / 36e5) + userStore.t("common.hoursAgo");
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } else {
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        }
      };
      const goToExamDetail = (msg) => {
        const examNotice = parseExamNotice(msg.content);
        if (!examNotice) {
          uni.showToast({
            title: userStore.t("common.invalidExamId"),
            icon: "none"
          });
          return;
        }
        const examId = examNotice.examId;
        if (!examId || !/^\d+$/.test(String(examId))) {
          uni.showToast({
            title: userStore.t("common.invalidExamId"),
            icon: "none"
          });
          return;
        }
        uni.navigateTo({
          url: `/pages/student/exam-take?id=${examId}`
        });
      };
      const loadMessages = async () => {
        try {
          const res = await classApi.getMessages(classId.value, 1, 50);
          if (res.code === 200) {
            const records = res.data.records || res.data;
            messages.value = records.reverse();
            vue.nextTick(() => {
              scrollTop.value = 999999;
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/class-chat.vue:293", e);
        }
      };
      const loadMoreMessages = () => {
      };
      const loadMembers = async () => {
        var _a;
        try {
          const res = await classApi.getClassMembers(classId.value);
          if (res.code === 200) {
            members.value = res.data;
            memberCount.value = res.data.length;
            const userId = (_a = userStore.userInfo) == null ? void 0 : _a.userId;
            const currentMember = res.data.find((m) => String(m.userId) === String(userId));
            if (currentMember && currentMember.muteUntil) {
              isMuted.value = true;
            }
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/class-chat.vue:315", e);
        }
      };
      const loadClassInfo = async () => {
        try {
          const res = await classApi.getById(classId.value);
          if (res.code === 200) {
            className.value = res.data.className;
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/class-chat.vue:326", e);
        }
      };
      onLoad((options) => {
        classId.value = options.id;
        loadClassInfo();
        loadMessages();
        loadMembers();
      });
      return (_ctx, _cache) => {
        const _component_uni_icons = vue.resolveComponent("uni-icons");
        return vue.openBlock(), vue.createElementBlock("view", { class: "class-chat" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.classChat"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createElementVNode("view", { class: "chat-header" }, [
            vue.createElementVNode("view", { class: "header-info" }, [
              vue.createElementVNode(
                "text",
                { class: "class-name" },
                vue.toDisplayString(className.value),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "member-count" },
                vue.toDisplayString(memberCount.value) + " " + vue.toDisplayString(vue.unref(userStore).t("common.members")),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "header-right" }, [
              vue.createElementVNode("view", {
                class: "member-btn",
                onClick: _cache[0] || (_cache[0] = ($event) => showMembers.value = true)
              }, [
                vue.createElementVNode("text", { class: "member-icon" }, "👥")
              ])
            ])
          ]),
          vue.createElementVNode("scroll-view", {
            class: "chat-body",
            "scroll-y": "",
            "scroll-top": scrollTop.value,
            onScrolltoupper: loadMoreMessages
          }, [
            vue.createElementVNode("view", { class: "message-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(messages.value, (msg) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: msg.id,
                      class: vue.normalizeClass(["message-item", { "is-self": isSelfMessage(msg.senderId) }])
                    },
                    [
                      vue.createElementVNode("view", { class: "message-avatar" }, [
                        vue.createElementVNode("image", {
                          src: getSenderAvatar(msg.senderId),
                          mode: "aspectFill"
                        }, null, 8, ["src"])
                      ]),
                      vue.createElementVNode("view", { class: "message-content-wrapper" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "message-sender" },
                          vue.toDisplayString(getSenderName(msg.senderId)),
                          1
                          /* TEXT */
                        ),
                        !isExamNotice(msg) ? (vue.openBlock(), vue.createElementBlock("view", {
                          key: 0,
                          class: "message-bubble"
                        }, [
                          vue.createElementVNode(
                            "text",
                            { class: "message-text" },
                            vue.toDisplayString(msg.content),
                            1
                            /* TEXT */
                          )
                        ])) : (vue.openBlock(), vue.createElementBlock("view", {
                          key: 1,
                          class: "exam-notice"
                        }, [
                          vue.createElementVNode("view", { class: "notice-header" }, [
                            vue.createElementVNode(
                              "text",
                              { class: "notice-icon" },
                              vue.toDisplayString(getNoticeIcon(msg.content)),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode(
                              "text",
                              { class: "notice-title" },
                              vue.toDisplayString(getNoticeTitle(msg.content)),
                              1
                              /* TEXT */
                            ),
                            vue.createElementVNode("view", { class: "notice-badge" }, [
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(getNoticeBadge(msg.content)),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          vue.createElementVNode("view", { class: "notice-info" }, [
                            vue.createElementVNode("view", { class: "info-item" }, [
                              vue.createElementVNode("text", { class: "info-icon" }, vue.toDisplayString(iconCalendar)),
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(getNoticeStartTime(msg.content)),
                                1
                                /* TEXT */
                              )
                            ]),
                            vue.createElementVNode("view", { class: "info-item" }, [
                              vue.createElementVNode("text", { class: "info-icon" }, vue.toDisplayString(iconEnd)),
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(getNoticeEndTime(msg.content)),
                                1
                                /* TEXT */
                              )
                            ]),
                            vue.createElementVNode("view", { class: "info-item" }, [
                              vue.createElementVNode("text", { class: "info-icon" }, vue.toDisplayString(iconTimer)),
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(getNoticeDuration(msg.content)) + vue.toDisplayString(vue.unref(userStore).t("common.minutes")),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          vue.createElementVNode("button", {
                            class: "notice-btn",
                            onClick: ($event) => goToExamDetail(msg)
                          }, vue.toDisplayString(getNoticeBtnText(msg.content)), 9, ["onClick"])
                        ])),
                        vue.createElementVNode(
                          "text",
                          { class: "message-time" },
                          vue.toDisplayString(formatTime(msg.createTime)),
                          1
                          /* TEXT */
                        )
                      ])
                    ],
                    2
                    /* CLASS */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ], 40, ["scroll-top"]),
          vue.createElementVNode("view", { class: "chat-input-wrapper" }, [
            vue.createElementVNode("view", { class: "chat-input" }, [
              vue.withDirectives(vue.createElementVNode("input", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => inputMessage.value = $event),
                placeholder: vue.unref(userStore).t("common.enterMessage"),
                disabled: isMuted.value,
                onConfirm: sendMessage
              }, null, 40, ["placeholder", "disabled"]), [
                [vue.vModelText, inputMessage.value]
              ]),
              vue.createElementVNode("button", {
                class: "send-btn",
                onClick: sendMessage,
                disabled: !inputMessage.value.trim() || isMuted.value
              }, vue.toDisplayString(vue.unref(userStore).t("common.send")), 9, ["disabled"])
            ]),
            isMuted.value ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "muted-tip"
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(vue.unref(userStore).t("common.muted")),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createCommentVNode(" 成员列表弹窗 "),
          showMembers.value ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "modal",
            onClick: _cache[4] || (_cache[4] = ($event) => showMembers.value = false)
          }, [
            vue.createElementVNode("view", {
              class: "modal-content",
              onClick: _cache[3] || (_cache[3] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "modal-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "modal-title" },
                  vue.toDisplayString(vue.unref(userStore).t("common.classMembers")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", {
                  class: "modal-close",
                  onClick: _cache[2] || (_cache[2] = ($event) => showMembers.value = false)
                }, [
                  vue.createVNode(_component_uni_icons, {
                    type: "close",
                    size: "24",
                    color: "#333"
                  })
                ])
              ]),
              vue.createElementVNode("scroll-view", {
                class: "members-list",
                "scroll-y": ""
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(members.value, (member) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "member-item",
                      key: member.userId
                    }, [
                      vue.createElementVNode("view", { class: "member-info" }, [
                        vue.createElementVNode(
                          "text",
                          { class: "member-name" },
                          vue.toDisplayString(member.realName),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "view",
                          {
                            class: vue.normalizeClass(["member-role", "role-" + member.role.toLowerCase()])
                          },
                          [
                            vue.createElementVNode(
                              "text",
                              null,
                              vue.toDisplayString(getRoleText(member.role)),
                              1
                              /* TEXT */
                            )
                          ],
                          2
                          /* CLASS */
                        )
                      ]),
                      member.muteUntil ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "mute-status"
                      }, [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(vue.unref(userStore).t("common.muted")),
                          1
                          /* TEXT */
                        )
                      ])) : vue.createCommentVNode("v-if", true)
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  };
  const PagesStudentClassChat = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-f2165426"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/student/class-chat.vue"]]);
  const _sfc_main$5 = {
    __name: "exam-list",
    setup(__props) {
      const userStore = useUserStore();
      const tableData = vue.ref([]);
      const searchForm = vue.ref({
        keyword: "",
        status: ""
      });
      const statusOptions = vue.computed(() => [
        { label: userStore.t("common.all"), value: "" },
        { label: userStore.t("common.pending"), value: "PENDING" },
        { label: userStore.t("common.ongoing"), value: "ONGOING" },
        { label: userStore.t("common.finished"), value: "FINISHED" }
      ]);
      const currentStatusText = vue.computed(() => {
        const option = statusOptions.value.find((o) => o.value === searchForm.value.status);
        return option ? option.label : userStore.t("common.all");
      });
      const loadStatus = vue.ref("more");
      const formatTime = (time) => {
        if (!time)
          return "";
        const date = new Date(time);
        if (userStore.language === "zh") {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        } else {
          return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
        }
      };
      const getStatusClass = (item) => {
        if (item.studentStatus === "AUTO_SUBMITTED")
          return "danger";
        if (item.studentStatus === "SUBMITTED")
          return "success";
        if (item.exam.status === "ONGOING")
          return "warning";
        return "info";
      };
      const getExamStatusText = (item) => {
        if (item.studentStatus === "AUTO_SUBMITTED")
          return userStore.t("student.autoSubmitted");
        if (item.studentStatus === "SUBMITTED")
          return userStore.t("common.finished");
        if (item.exam.status === "ONGOING")
          return userStore.t("common.ongoing");
        return userStore.t("common.pending");
      };
      const canJoin = (item) => {
        return item.exam.status === "ONGOING" && item.studentStatus !== "SUBMITTED" && item.studentStatus !== "AUTO_SUBMITTED";
      };
      const canView = (item) => {
        return item.studentStatus === "SUBMITTED" || item.studentStatus === "AUTO_SUBMITTED";
      };
      const getButtonText = (item) => {
        if (item.studentStatus === "SUBMITTED" || item.studentStatus === "AUTO_SUBMITTED") {
          return userStore.t("student.viewDetail");
        }
        if (item.exam.status === "ONGOING")
          return userStore.t("student.enterExam");
        return userStore.t("student.waiting");
      };
      const getButtonClass = (item) => {
        if (item.studentStatus === "SUBMITTED" || item.studentStatus === "AUTO_SUBMITTED") {
          return "btn-success";
        }
        if (item.exam.status === "ONGOING")
          return "btn-danger";
        return "btn-disabled";
      };
      const onStatusChange = (e) => {
        const index = e.detail.value;
        searchForm.value.status = statusOptions.value[index].value;
        handleSearch();
      };
      const handleJoin = (exam) => {
        uni.navigateTo({
          url: `/pages/student/exam-take?id=${exam.id}`
        });
      };
      const handleSearch = () => {
        loadStatus.value = "more";
        loadData();
      };
      const loadData = async () => {
        if (loadStatus.value === "loading")
          return;
        loadStatus.value = "loading";
        try {
          const params = {
            current: 1,
            size: 20,
            keyword: searchForm.value.keyword,
            status: searchForm.value.status
          };
          const res = await examApi.studentPage(params);
          if (res.code === 200) {
            tableData.value = res.data.records;
            loadStatus.value = res.data.records.length >= 20 ? "more" : "noMore";
          } else {
            uni.showToast({
              title: res.message || userStore.t("common.failed"),
              icon: "none"
            });
            loadStatus.value = "more";
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/exam-list.vue:199", e);
          uni.showToast({
            title: userStore.t("student.networkError"),
            icon: "none"
          });
          loadStatus.value = "more";
        }
      };
      vue.onMounted(() => {
        loadData();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "exam-list" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.examList"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createElementVNode("view", { class: "search-bar" }, [
            vue.createElementVNode("view", { class: "search-input" }, [
              vue.createElementVNode("text", { class: "icon-search" }, "🔍"),
              vue.withDirectives(vue.createElementVNode("input", {
                type: "text",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchForm.value.keyword = $event),
                placeholder: vue.unref(userStore).t("student.searchExam"),
                onConfirm: handleSearch
              }, null, 40, ["placeholder"]), [
                [vue.vModelText, searchForm.value.keyword]
              ])
            ]),
            vue.createElementVNode("view", { class: "filter-row" }, [
              vue.createElementVNode("picker", {
                mode: "selector",
                range: vue.unref(statusOptions),
                "range-key": "label",
                onChange: onStatusChange
              }, [
                vue.createElementVNode("view", { class: "picker" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(vue.unref(currentStatusText)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "icon-arrow" }, "▼")
                ])
              ], 40, ["range"]),
              vue.createElementVNode(
                "button",
                {
                  class: "search-btn",
                  onClick: handleSearch
                },
                vue.toDisplayString(vue.unref(userStore).t("common.search")),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "exam-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(tableData.value, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "exam-card",
                  key: item.exam.id
                }, [
                  vue.createElementVNode("view", { class: "exam-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "exam-title" },
                      vue.toDisplayString(item.exam.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["exam-status", "status-" + getStatusClass(item)])
                      },
                      [
                        vue.createElementVNode(
                          "text",
                          null,
                          vue.toDisplayString(getExamStatusText(item)),
                          1
                          /* TEXT */
                        )
                      ],
                      2
                      /* CLASS */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "exam-info" }, [
                    vue.createElementVNode("view", { class: "info-item" }, [
                      vue.createElementVNode("text", { class: "icon-clock" }, "⏱️"),
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(item.exam.duration) + " " + vue.toDisplayString(vue.unref(userStore).t("common.minutes")),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "info-item" }, [
                      vue.createElementVNode("text", { class: "icon-flag" }, "🏆"),
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(vue.unref(userStore).t("common.total")) + " " + vue.toDisplayString(item.exam.totalScore) + vue.toDisplayString(vue.unref(userStore).t("dashboard.scoreUnit")),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "info-item" }, [
                      vue.createElementVNode("text", { class: "icon-calendar" }, "📅"),
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(formatTime(item.exam.startTime)),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "exam-actions" }, [
                    vue.createElementVNode("button", {
                      class: vue.normalizeClass(["join-btn", getButtonClass(item)]),
                      disabled: !canJoin(item) && !canView(item),
                      onClick: ($event) => handleJoin(item.exam)
                    }, [
                      vue.createElementVNode(
                        "text",
                        null,
                        vue.toDisplayString(getButtonText(item)),
                        1
                        /* TEXT */
                      )
                    ], 10, ["disabled", "onClick"])
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          loadStatus.value === "loading" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "load-more"
          }, [
            vue.createElementVNode("text", null, "加载中...")
          ])) : loadStatus.value === "noMore" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "load-more"
          }, [
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString(vue.unref(userStore).t("common.noMore")),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  };
  const PagesStudentExamList = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-20bbf78e"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/student/exam-list.vue"]]);
  const _sfc_main$4 = {
    __name: "exam-take",
    setup(__props) {
      const userStore = useUserStore();
      const examInfo = vue.ref(null);
      const questions = vue.ref([]);
      const recordId = vue.ref(null);
      const currentQuestionId = vue.ref(null);
      const answers = vue.reactive({});
      const multiAnswers = vue.reactive({});
      const submitting = vue.ref(false);
      const saving = vue.ref(false);
      const remainingTime = vue.ref(0);
      const leaveCount = vue.ref(0);
      const maxLeaveCount = vue.ref(3);
      const isViewMode = vue.ref(false);
      const showNav = vue.ref(false);
      const studentScore = vue.ref(0);
      const timer = vue.ref(null);
      const autoSaveTimer = vue.ref(null);
      const examStartTime = vue.ref(null);
      const examDuration = vue.ref(0);
      const canViewPaper = vue.ref(true);
      const answerMap = vue.ref({});
      vue.ref(false);
      const getTypeName = (type) => {
        const map = {
          SINGLE_CHOICE: userStore.t("common.singleChoice"),
          MULTIPLE_CHOICE: userStore.t("common.multipleChoice"),
          JUDGMENT: userStore.t("common.trueFalse"),
          FILL_BLANK: userStore.t("common.fillBlank"),
          ESSAY: userStore.t("common.shortAnswer"),
          PROGRAMMING: userStore.t("common.programming")
        };
        return map[type] || type;
      };
      const getTypeStart = (type) => {
        const map = {
          SINGLE_CHOICE: userStore.language === "zh" ? "一" : "1",
          MULTIPLE_CHOICE: userStore.language === "zh" ? "二" : "2",
          JUDGMENT: userStore.language === "zh" ? "三" : "3",
          FILL_BLANK: userStore.language === "zh" ? "四" : "4",
          ESSAY: userStore.language === "zh" ? "五" : "5",
          PROGRAMMING: userStore.language === "zh" ? "六" : "6"
        };
        return map[type] || "";
      };
      const shuffledOptionsMap = vue.reactive({});
      const questionSections = vue.computed(() => {
        const sections = [];
        const typeOrder = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "JUDGMENT", "FILL_BLANK", "ESSAY", "PROGRAMMING"];
        let globalIndex = 0;
        for (const type of typeOrder) {
          const typeQuestions = questions.value.filter((q) => q.type === type);
          if (typeQuestions.length > 0) {
            sections.push({
              type,
              typeName: getTypeName(type),
              startName: getTypeStart(type),
              questions: typeQuestions,
              startIndex: globalIndex
            });
            globalIndex += typeQuestions.length;
          }
        }
        return sections;
      });
      const totalQuestions = vue.computed(() => questions.value.length);
      const currentQuestion = vue.computed(() => {
        return questions.value.find((q) => q.id === currentQuestionId.value);
      });
      const currentQuestionNumber = vue.computed(() => {
        const index = questions.value.findIndex((q) => q.id === currentQuestionId.value);
        return index + 1;
      });
      const currentTypeName = vue.computed(() => {
        if (!currentQuestion.value)
          return "";
        return getTypeName(currentQuestion.value.type);
      });
      const getExamConfig = () => {
        var _a, _b;
        try {
          const configStr = ((_a = examInfo.value) == null ? void 0 : _a.antiCheatConfig) || ((_b = examInfo.value) == null ? void 0 : _b.config) || "{}";
          return typeof configStr === "string" ? JSON.parse(configStr) : configStr;
        } catch (e) {
          return {};
        }
      };
      const currentShuffledOptions = vue.computed(() => {
        if (!currentQuestion.value || !currentQuestion.value.options)
          return [];
        const questionId = currentQuestion.value.id;
        if (!shuffledOptionsMap[questionId]) {
          const original = parseOptions(currentQuestion.value.options);
          let options = Object.entries(original).map(([key, label]) => ({ key, label }));
          const examConfig = getExamConfig();
          if (examConfig.shuffleOptions && !isViewMode.value) {
            options = shuffleArray([...options]);
          }
          shuffledOptionsMap[questionId] = options;
        }
        return shuffledOptionsMap[questionId];
      });
      const examStatusText = vue.computed(() => {
        var _a;
        return {
          PENDING: userStore.t("common.pending"),
          ONGOING: userStore.t("common.ongoing"),
          FINISHED: userStore.t("common.finished")
        }[(_a = examInfo.value) == null ? void 0 : _a.status] || "";
      });
      const examStatusLower = vue.computed(() => {
        var _a;
        return (((_a = examInfo.value) == null ? void 0 : _a.status) || "").toLowerCase();
      });
      const examStatusClass = vue.computed(() => {
        return "status-" + examStatusLower.value;
      });
      const isFirstQuestion = vue.computed(() => currentQuestionNumber.value === 1);
      const isLastQuestion = vue.computed(() => currentQuestionNumber.value === totalQuestions.value);
      const isAnswered = (questionId) => {
        const answer = answers[questionId];
        const multiAnswer = multiAnswers[questionId];
        if (Array.isArray(multiAnswer) && multiAnswer.length > 0)
          return true;
        if (answer && answer.trim() !== "")
          return true;
        return false;
      };
      const getQuestionResult = (questionId) => {
        if (!answerMap.value)
          return null;
        const key = String(questionId);
        if (!answerMap.value[key])
          return null;
        return answerMap.value[key].isCorrect === 1;
      };
      const isCorrectAnswer = (questionId, key) => {
        const question = questions.value.find((q) => q.id === questionId);
        if (!question || !question.correctAnswer)
          return false;
        const correctKeys = question.correctAnswer.split(",").map((k) => k.trim());
        return correctKeys.indexOf(key) > -1;
      };
      const isMultiSelected = (questionId, key) => {
        const answer = multiAnswers[questionId];
        if (!answer || !Array.isArray(answer))
          return false;
        return answer.indexOf(key) > -1;
      };
      const isSingleChoiceOrJudgment = (type) => {
        return type === "SINGLE_CHOICE" || type === "JUDGMENT";
      };
      const isCurrentQuestion = (questionId) => {
        return currentQuestionId.value === questionId;
      };
      const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = seconds % 60;
        if (h > 0) {
          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      };
      const parseOptions = (options) => {
        if (!options)
          return {};
        if (Array.isArray(options)) {
          const result = {};
          options.forEach((item, idx) => {
            const key = String.fromCharCode(65 + idx);
            if (typeof item === "object") {
              result[key] = item.content || item.text || "";
            } else {
              result[key] = String(item);
            }
          });
          return result;
        }
        if (typeof options === "string") {
          try {
            const parsed = JSON.parse(options);
            if (Array.isArray(parsed)) {
              const result = {};
              parsed.forEach((item, idx) => {
                const key = String.fromCharCode(65 + idx);
                if (typeof item === "object") {
                  result[key] = item.content || item.text || "";
                } else {
                  result[key] = String(item);
                }
              });
              return result;
            }
          } catch (e) {
            const parts = options.split("|").filter((o) => o.trim());
            const result = {};
            parts.forEach((part, idx) => {
              const key = String.fromCharCode(65 + idx);
              result[key] = part.trim();
            });
            return result;
          }
        }
        return {};
      };
      const seededRandom = (seed) => {
        const x = Math.sin(seed++) * 1e4;
        return x - Math.floor(x);
      };
      const shuffleArray = (array, seed = Date.now()) => {
        const shuffled = [...array];
        let random = seededRandom.bind(null, seed);
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };
      const shuffleQuestionsByType = (questions2) => {
        const typeOrder = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "JUDGMENT", "FILL_BLANK", "ESSAY", "PROGRAMMING"];
        const result = [];
        for (const type of typeOrder) {
          const typeQuestions = questions2.filter((q) => q.type === type);
          if (typeQuestions.length > 0) {
            result.push(...shuffleArray(typeQuestions));
          }
        }
        return result;
      };
      const jumpToQuestion = (questionId) => {
        currentQuestionId.value = questionId;
        showNav.value = false;
      };
      const prevQuestion = () => {
        const currentIndex = questions.value.findIndex((q) => q.id === currentQuestionId.value);
        if (currentIndex > 0) {
          currentQuestionId.value = questions.value[currentIndex - 1].id;
        }
      };
      const nextQuestion = () => {
        const currentIndex = questions.value.findIndex((q) => q.id === currentQuestionId.value);
        if (currentIndex < questions.value.length - 1) {
          currentQuestionId.value = questions.value[currentIndex + 1].id;
        }
      };
      const handleSelect = (key) => {
        if (isViewMode.value)
          return;
        answers[currentQuestion.value.id] = key;
        saveAnswer();
      };
      const handleMultiSelect = (key) => {
        if (isViewMode.value)
          return;
        if (!multiAnswers[currentQuestion.value.id]) {
          multiAnswers[currentQuestion.value.id] = [];
        }
        const index = multiAnswers[currentQuestion.value.id].indexOf(key);
        if (index > -1) {
          multiAnswers[currentQuestion.value.id].splice(index, 1);
        } else {
          multiAnswers[currentQuestion.value.id].push(key);
        }
        answers[currentQuestion.value.id] = multiAnswers[currentQuestion.value.id].join(",");
        saveAnswer();
      };
      const saveAnswer = async () => {
        if (isViewMode.value)
          return;
        if (!recordId.value) {
          formatAppLog("error", "at pages/student/exam-take.vue:471", "保存答案失败: recordId为空");
          return;
        }
        try {
          const allAnswers = {};
          for (const [qId, value] of Object.entries(answers)) {
            if (value && value.trim() !== "") {
              allAnswers[String(qId)] = String(value);
            }
          }
          for (const [qId, value] of Object.entries(multiAnswers)) {
            if (Array.isArray(value) && value.length > 0) {
              allAnswers[String(qId)] = value.join(",");
            }
          }
          if (Object.keys(allAnswers).length === 0)
            return;
          const saveResult = await examRecordApi.autoSave({
            recordId: Number(recordId.value),
            answers: allAnswers
          });
          formatAppLog("log", "at pages/student/exam-take.vue:491", "保存答案结果:", saveResult);
        } catch (e) {
          formatAppLog("error", "at pages/student/exam-take.vue:493", "保存答案失败:", e);
        }
      };
      const handleManualSave = async () => {
        if (isViewMode.value)
          return;
        saving.value = true;
        try {
          await saveAnswer();
          uni.showToast({ title: userStore.t("common.saveSuccess"), icon: "success" });
        } catch (e) {
          uni.showToast({ title: userStore.t("common.saveFailed"), icon: "none" });
        } finally {
          saving.value = false;
        }
      };
      const handleSubmit = async () => {
        if (isViewMode.value)
          return;
        uni.showModal({
          title: userStore.t("common.tip"),
          content: userStore.t("common.confirmSubmit"),
          success: async (res) => {
            if (res.confirm) {
              submitting.value = true;
              try {
                const result = await examRecordApi.submit(recordId.value);
                if (result.code === 200) {
                  uni.showToast({ title: userStore.t("common.examSubmittedSuccess"), icon: "success" });
                  isViewMode.value = true;
                  setTimeout(() => {
                    uni.redirectTo({ url: "/pages/student/history" });
                  }, 1500);
                } else {
                  uni.showToast({ title: result.message || userStore.t("common.submitFailed"), icon: "none" });
                }
              } catch (e) {
                uni.showToast({ title: e.message || userStore.t("common.submitFailed"), icon: "none" });
              } finally {
                submitting.value = false;
              }
            }
          }
        });
      };
      const handleTimeUp = async () => {
        if (isViewMode.value)
          return;
        uni.showToast({ title: userStore.t("common.examFinished") + " " + userStore.t("common.examSubmitted"), icon: "none", duration: 2e3 });
        try {
          await examRecordApi.autoSubmit(recordId.value);
        } catch (e) {
          formatAppLog("error", "at pages/student/exam-take.vue:545", e);
        }
        setTimeout(() => {
          uni.redirectTo({ url: "/pages/student/history" });
        }, 2e3);
      };
      const recalculateRemainingTime = () => {
        if (!examStartTime.value || isViewMode.value)
          return;
        const totalSeconds = examDuration.value * 60;
        const elapsedSeconds = Math.floor((Date.now() - examStartTime.value) / 1e3);
        remainingTime.value = Math.max(0, totalSeconds - elapsedSeconds);
      };
      const startTimer = () => {
        if (timer)
          clearInterval(timer);
        timer = setInterval(() => {
          recalculateRemainingTime();
          if (remainingTime.value <= 0) {
            clearInterval(timer);
            handleTimeUp();
          }
        }, 1e3);
      };
      const setupAutoSave = () => {
        if (autoSaveTimer)
          clearInterval(autoSaveTimer);
        autoSaveTimer = setInterval(() => {
          saveAnswer();
        }, 3e4);
      };
      const handleLeaveDetection = async () => {
        if (!recordId.value || isViewMode.value)
          return;
        const examConfig = getExamConfig();
        if (!examConfig.leaveDetection)
          return;
        leaveCount.value++;
        formatAppLog("log", "at pages/student/exam-take.vue:584", "检测到离开，当前离开次数:", leaveCount.value);
        if (examConfig.maxLeaveCount !== void 0) {
          maxLeaveCount.value = examConfig.maxLeaveCount;
        }
        uni.setStorageSync(`leaveWarning_${recordId.value}`, {
          needShow: true,
          leaveCount: leaveCount.value,
          maxLeaveCount: maxLeaveCount.value
        });
        if (leaveCount.value >= maxLeaveCount.value) {
          uni.showModal({
            title: userStore.t("student.warning"),
            content: userStore.t("student.reachedLimit"),
            showCancel: false,
            confirmText: userStore.t("common.confirm"),
            success: async () => {
              try {
                await examRecordApi.autoSubmit(recordId.value);
              } catch (e) {
                formatAppLog("error", "at pages/student/exam-take.vue:606", e);
              }
              uni.redirectTo({ url: "/pages/student/history" });
            }
          });
          return;
        }
        uni.showModal({
          title: userStore.t("student.warning"),
          content: `${userStore.t("student.leftExam")}${leaveCount.value}${userStore.t("student.chancesLeft")}`,
          showCancel: false,
          confirmText: userStore.t("common.ok")
        });
        try {
          await examRecordApi.reportLeave({
            recordId: recordId.value,
            leaveCount: leaveCount.value
          });
        } catch (e) {
          formatAppLog("error", "at pages/student/exam-take.vue:627", "上报离开失败:", e);
        }
      };
      const loadExamData = async (examId, reviewRecordId, isReview) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
        try {
          if (isReview && reviewRecordId) {
            isViewMode.value = true;
            const res = await examRecordApi.getById(reviewRecordId);
            if (res.code === 200) {
              examInfo.value = res.data.exam;
              questions.value = res.data.questions || [];
              recordId.value = res.data.id;
              answerMap.value = res.data.answerMap || {};
              studentScore.value = res.data.score || 0;
              try {
                const examConfig = typeof ((_a = res.data.exam) == null ? void 0 : _a.antiCheatConfig) === "string" ? JSON.parse((_b = res.data.exam) == null ? void 0 : _b.antiCheatConfig) : ((_c = res.data.exam) == null ? void 0 : _c.antiCheatConfig) || {};
                canViewPaper.value = ((_d = res.data.exam) == null ? void 0 : _d.allowViewAfterExam) !== 0 && examConfig.viewPaperAfterExam !== false;
              } catch (e) {
                canViewPaper.value = ((_e = res.data.exam) == null ? void 0 : _e.allowViewAfterExam) !== 0;
              }
              if (res.data.studentAnswers) {
                Object.assign(answers, typeof res.data.studentAnswers === "string" ? JSON.parse(res.data.studentAnswers) : res.data.studentAnswers);
              }
              if (questions.value.length > 0) {
                currentQuestionId.value = questions.value[0].id;
              }
            } else {
              uni.showToast({ title: res.message || userStore.t("common.loadFailed"), icon: "none" });
            }
          } else {
            const examRes = await examApi.getById(examId);
            if (examRes.code === 200) {
              examInfo.value = examRes.data;
              const isExamFinished = examInfo.value.status === "FINISHED";
              if (isExamFinished) {
                isViewMode.value = true;
                const recRes = await examRecordApi.page({ examId: Number(examId) });
                if (recRes.code === 200 && recRes.data.records.length > 0) {
                  const record = recRes.data.records[0];
                  recordId.value = record.id;
                  studentScore.value = record.score || 0;
                  answerMap.value = record.answerMap || {};
                  try {
                    const examConfig = typeof ((_f = examInfo.value) == null ? void 0 : _f.antiCheatConfig) === "string" ? JSON.parse((_g = examInfo.value) == null ? void 0 : _g.antiCheatConfig) : ((_h = examInfo.value) == null ? void 0 : _h.antiCheatConfig) || {};
                    canViewPaper.value = ((_i = examInfo.value) == null ? void 0 : _i.allowViewAfterExam) !== 0 && examConfig.viewPaperAfterExam !== false;
                  } catch (e) {
                    canViewPaper.value = ((_j = examInfo.value) == null ? void 0 : _j.allowViewAfterExam) !== 0;
                  }
                  if (record.studentAnswers || record.answers) {
                    Object.assign(answers, typeof (record.studentAnswers || record.answers) === "string" ? JSON.parse(record.studentAnswers || record.answers) : record.studentAnswers || record.answers);
                  }
                }
              }
              let existingRecord = null;
              if (examInfo.value.paperId) {
                const qRes = await examRecordApi.page({ examId: Number(examId) });
                if (qRes.code === 200 && qRes.data.records.length > 0) {
                  existingRecord = qRes.data.records.find((r) => r.status === "ONGOING");
                }
              }
              const startRes = await examRecordApi.start({ examId: Number(examId) });
              formatAppLog("log", "at pages/student/exam-take.vue:697", "start接口返回:", JSON.stringify(startRes));
              if (startRes.code === 200) {
                formatAppLog("log", "at pages/student/exam-take.vue:699", "questions原始数据长度:", (startRes.data.questions || []).length);
                questions.value = startRes.data.questions || [];
                formatAppLog("log", "at pages/student/exam-take.vue:701", "questions设置后长度:", questions.value.length);
                if (!recordId.value) {
                  recordId.value = startRes.data.recordId;
                }
                const recordStatus = (_k = startRes.data.record) == null ? void 0 : _k.status;
                formatAppLog("log", "at pages/student/exam-take.vue:708", "record状态:", recordStatus);
                if (recordStatus === "SUBMITTED" || recordStatus === "AUTO_SUBMITTED") {
                  isViewMode.value = true;
                  studentScore.value = ((_l = startRes.data.record) == null ? void 0 : _l.score) || 0;
                }
                try {
                  const examConfig2 = typeof ((_m = examInfo.value) == null ? void 0 : _m.antiCheatConfig) === "string" ? JSON.parse((_n = examInfo.value) == null ? void 0 : _n.antiCheatConfig) : ((_o = examInfo.value) == null ? void 0 : _o.antiCheatConfig) || {};
                  canViewPaper.value = ((_p = examInfo.value) == null ? void 0 : _p.allowViewAfterExam) !== 0 && examConfig2.viewPaperAfterExam !== false;
                } catch (e) {
                  canViewPaper.value = ((_q = examInfo.value) == null ? void 0 : _q.allowViewAfterExam) !== 0;
                }
                answerMap.value = startRes.data.answerMap || {};
                if (startRes.data.studentAnswers) {
                  formatAppLog("log", "at pages/student/exam-take.vue:724", "恢复已保存答案:", startRes.data.studentAnswers);
                  Object.assign(answers, typeof startRes.data.studentAnswers === "string" ? JSON.parse(startRes.data.studentAnswers) : startRes.data.studentAnswers);
                }
                formatAppLog("log", "at pages/student/exam-take.vue:727", "恢复后answers:", answers);
                if (startRes.data.leaveCount !== void 0) {
                  leaveCount.value = startRes.data.leaveCount;
                }
                const examConfig = getExamConfig();
                if (examConfig.shuffleQuestions && !isViewMode.value) {
                  questions.value = shuffleQuestionsByType(questions.value);
                }
                if (questions.value.length > 0) {
                  currentQuestionId.value = questions.value[0].id;
                }
                if (!isViewMode.value) {
                  examDuration.value = examInfo.value.duration || 0;
                  if (!examStartTime.value) {
                    if (startRes.data.startTime) {
                      formatAppLog("log", "at pages/student/exam-take.vue:747", "使用后端返回的startTime:", startRes.data.startTime);
                      examStartTime.value = new Date(startRes.data.startTime).getTime();
                    } else if (((_r = startRes.data.record) == null ? void 0 : _r.submitTime) && examDuration.value > 0) {
                      formatAppLog("log", "at pages/student/exam-take.vue:750", "startTime为空，使用submitTime倒推");
                      examStartTime.value = new Date(startRes.data.record.submitTime).getTime() - examDuration.value * 60 * 1e3;
                    } else {
                      formatAppLog("log", "at pages/student/exam-take.vue:753", "使用当前时间作为startTime");
                      examStartTime.value = Date.now();
                    }
                  }
                  formatAppLog("log", "at pages/student/exam-take.vue:757", "examStartTime:", examStartTime.value, ", examDuration:", examDuration.value);
                  recalculateRemainingTime();
                  formatAppLog("log", "at pages/student/exam-take.vue:760", "剩余时间:", remainingTime.value);
                  startTimer();
                  setupAutoSave();
                }
              }
            } else {
              uni.showToast({ title: examRes.message || userStore.t("common.loadFailed"), icon: "none" });
            }
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/exam-take.vue:770", "加载失败:", e);
          uni.showToast({ title: userStore.t("common.networkError"), icon: "none" });
        }
      };
      onLoad((options) => {
        const examId = options.id;
        const reviewRecordId = options.recordId;
        const isReview = options.review === "1";
        if (examId) {
          loadExamData(examId, reviewRecordId, isReview);
        }
      });
      onShow(() => {
        formatAppLog("log", "at pages/student/exam-take.vue:785", "onShow触发");
        if (!isViewMode.value && examStartTime.value) {
          recalculateRemainingTime();
        }
        const warningData = uni.getStorageSync(`leaveWarning_${recordId.value}`);
        if (warningData && warningData.needShow) {
          formatAppLog("log", "at pages/student/exam-take.vue:792", "显示离开警告弹窗");
          uni.removeStorageSync(`leaveWarning_${recordId.value}`);
          uni.showModal({
            title: userStore.t("student.warning"),
            content: `${userStore.t("student.leftExam")}
${userStore.t("student.leaveCount")}：${warningData.leaveCount} / ${warningData.maxLeaveCount}
${userStore.t("student.remainingChances")}${warningData.maxLeaveCount - warningData.leaveCount}${userStore.t("student.chancesLeft")}`,
            showCancel: false,
            confirmText: userStore.t("student.continueExam")
          });
        }
      });
      onHide(() => {
        formatAppLog("log", "at pages/student/exam-take.vue:804", "onHide触发");
        handleLeaveDetection();
      });
      vue.onMounted(() => {
        uni.onAppHide(() => {
          formatAppLog("log", "at pages/student/exam-take.vue:810", "AppHide触发");
          handleLeaveDetection();
        });
        uni.onAppShow(() => {
          if (!isViewMode.value && examStartTime.value) {
            recalculateRemainingTime();
          }
        });
      });
      onUnload(() => {
        formatAppLog("log", "at pages/student/exam-take.vue:822", "onUnload触发");
        try {
          if (!isViewMode.value) {
            handleLeaveDetection();
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/exam-take.vue:828", "onUnload error:", e);
        }
      });
      vue.onUnmounted(() => {
        try {
          if (timer.value) {
            clearInterval(timer.value);
            timer.value = null;
          }
          if (autoSaveTimer.value) {
            clearInterval(autoSaveTimer.value);
            autoSaveTimer.value = null;
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/exam-take.vue:843", "清理定时器错误:", e);
        }
      });
      return (_ctx, _cache) => {
        return examInfo.value ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "exam-container"
        }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.examTake"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createElementVNode("view", { class: "exam-header" }, [
            vue.createElementVNode("view", { class: "header-top" }, [
              vue.createElementVNode(
                "text",
                { class: "exam-title" },
                vue.toDisplayString(examInfo.value.title),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["exam-status", vue.unref(examStatusClass)])
                },
                [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(vue.unref(examStatusText)),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "header-bottom" }, [
              isViewMode.value ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "view-mode-info"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "score-text" },
                  vue.toDisplayString(vue.unref(userStore).t("common.score")) + "：" + vue.toDisplayString(studentScore.value) + " / " + vue.toDisplayString(examInfo.value.totalScore),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["tag", canViewPaper.value ? "tag-success" : "tag-warning"])
                  },
                  [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(canViewPaper.value ? vue.unref(userStore).t("common.scored") : vue.unref(userStore).t("common.pendingGrade")),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                )
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "timer-row"
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["timer", { warning: remainingTime.value < 300 }])
                  },
                  [
                    vue.createElementVNode("text", null, "⏱"),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(formatTime(remainingTime.value)),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                ),
                vue.createElementVNode("button", {
                  class: "save-btn",
                  onClick: handleManualSave,
                  loading: saving.value
                }, vue.toDisplayString(vue.unref(userStore).t("common.save")), 9, ["loading"]),
                vue.createElementVNode("button", {
                  class: "submit-btn",
                  onClick: handleSubmit,
                  loading: submitting.value
                }, vue.toDisplayString(vue.unref(userStore).t("common.submitExam")), 9, ["loading"])
              ]))
            ])
          ]),
          !(isViewMode.value && !canViewPaper.value) ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "exam-body"
          }, [
            vue.createElementVNode("view", {
              class: "nav-toggle",
              onClick: _cache[0] || (_cache[0] = ($event) => showNav.value = true)
            }, [
              vue.createElementVNode("text", null, "📋"),
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(vue.unref(userStore).t("student.questionNav")),
                1
                /* TEXT */
              )
            ]),
            vue.unref(currentQuestion) ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "question-card"
            }, [
              vue.createElementVNode("view", { class: "question-header" }, [
                vue.createElementVNode("view", { class: "question-tag" }, [
                  vue.createElementVNode("view", { class: "tag tag-info" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(currentTypeName)),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "question-score" },
                    vue.toDisplayString(vue.unref(currentQuestion).score) + vue.toDisplayString(vue.unref(userStore).t("common.score")),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "question-number" },
                  vue.toDisplayString(vue.unref(userStore).t("common.question")) + " " + vue.toDisplayString(vue.unref(currentQuestionNumber)) + " / " + vue.toDisplayString(vue.unref(totalQuestions)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode(
                "view",
                { class: "question-content-text" },
                vue.toDisplayString(vue.unref(currentQuestion).content),
                1
                /* TEXT */
              ),
              isSingleChoiceOrJudgment(vue.unref(currentQuestion).type) ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "question-options"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(vue.unref(currentShuffledOptions), (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: item.key,
                      class: vue.normalizeClass(["option-item", {
                        selected: answers[vue.unref(currentQuestion).id] === item.key,
                        correct: isViewMode.value && canViewPaper.value && isCorrectAnswer(vue.unref(currentQuestion).id, item.key),
                        wrong: isViewMode.value && canViewPaper.value && answers[vue.unref(currentQuestion).id] === item.key && !isCorrectAnswer(vue.unref(currentQuestion).id, item.key)
                      }]),
                      onClick: ($event) => handleSelect(item.key)
                    }, [
                      vue.createElementVNode(
                        "view",
                        { class: "option-key" },
                        vue.toDisplayString(item.key),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "option-text" },
                        vue.toDisplayString(item.label),
                        1
                        /* TEXT */
                      )
                    ], 10, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : vue.unref(currentQuestion).type === "MULTIPLE_CHOICE" ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "question-options"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(vue.unref(currentShuffledOptions), (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: item.key,
                      class: vue.normalizeClass(["option-item", {
                        selected: isMultiSelected(vue.unref(currentQuestion).id, item.key),
                        correct: isViewMode.value && canViewPaper.value && isCorrectAnswer(vue.unref(currentQuestion).id, item.key),
                        wrong: isViewMode.value && canViewPaper.value && isMultiSelected(vue.unref(currentQuestion).id, item.key) && !isCorrectAnswer(vue.unref(currentQuestion).id, item.key)
                      }]),
                      onClick: ($event) => handleMultiSelect(item.key)
                    }, [
                      vue.createElementVNode(
                        "view",
                        { class: "option-key" },
                        vue.toDisplayString(item.key),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "option-text" },
                        vue.toDisplayString(item.label),
                        1
                        /* TEXT */
                      )
                    ], 10, ["onClick"]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 2,
                class: "question-input"
              }, [
                vue.withDirectives(vue.createElementVNode("textarea", {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => answers[vue.unref(currentQuestion).id] = $event),
                  placeholder: vue.unref(userStore).t("student.enterAnswer"),
                  maxlength: vue.unref(currentQuestion).type === "FILL_BLANK" ? 500 : 2e3,
                  disabled: isViewMode.value,
                  onBlur: saveAnswer
                }, null, 40, ["placeholder", "maxlength", "disabled"]), [
                  [vue.vModelText, answers[vue.unref(currentQuestion).id]]
                ]),
                isViewMode.value && canViewPaper.value ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "answer-comparison"
                }, [
                  vue.createElementVNode("view", { class: "answer-row" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "label" },
                      vue.toDisplayString(vue.unref(userStore).t("student.yourAnswer")) + "：",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(answers[vue.unref(currentQuestion).id] || vue.unref(userStore).t("student.unanswered")),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.unref(currentQuestion).type === "FILL_BLANK" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "answer-row"
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "label" },
                      vue.toDisplayString(vue.unref(userStore).t("common.correctAnswer")) + "：",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "value correct" },
                      vue.toDisplayString(vue.unref(currentQuestion).correctAnswer),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true)
                ])) : vue.createCommentVNode("v-if", true)
              ])),
              vue.createElementVNode("view", { class: "question-actions" }, [
                vue.createElementVNode("button", {
                  class: "action-btn",
                  onClick: prevQuestion,
                  disabled: vue.unref(isFirstQuestion)
                }, vue.toDisplayString(vue.unref(userStore).t("student.prevQuestion")), 9, ["disabled"]),
                vue.createElementVNode("button", {
                  class: "action-btn",
                  onClick: nextQuestion,
                  disabled: vue.unref(isLastQuestion)
                }, vue.toDisplayString(vue.unref(userStore).t("student.nextQuestion")), 9, ["disabled"])
              ])
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "no-question"
            }, [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString(vue.unref(userStore).t("common.loading")),
                1
                /* TEXT */
              )
            ]))
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "paper-locked"
          }, [
            vue.createElementVNode("text", null, "🔒"),
            vue.createElementVNode(
              "text",
              { class: "locked-text" },
              vue.toDisplayString(vue.unref(userStore).t("student.paperLocked")),
              1
              /* TEXT */
            )
          ])),
          showNav.value ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "nav-drawer",
            onClick: _cache[4] || (_cache[4] = ($event) => showNav.value = false)
          }, [
            vue.createElementVNode("view", {
              class: "nav-content",
              onClick: _cache[3] || (_cache[3] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "nav-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "nav-title" },
                  vue.toDisplayString(vue.unref(userStore).t("student.questionNav")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", {
                  class: "nav-close",
                  onClick: _cache[2] || (_cache[2] = ($event) => showNav.value = false)
                }, [
                  vue.createElementVNode("text", null, "×")
                ])
              ]),
              vue.createElementVNode("scroll-view", {
                class: "nav-body",
                "scroll-y": ""
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(vue.unref(questionSections), (section) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      key: section.type,
                      class: "nav-section"
                    }, [
                      vue.createElementVNode(
                        "view",
                        { class: "section-title" },
                        vue.toDisplayString(section.typeName) + " (" + vue.toDisplayString(section.questions.length) + " " + vue.toDisplayString(vue.unref(userStore).t("common.questions")) + ")",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "question-grid" }, [
                        (vue.openBlock(true), vue.createElementBlock(
                          vue.Fragment,
                          null,
                          vue.renderList(section.questions, (q, qIndex) => {
                            return vue.openBlock(), vue.createElementBlock("view", {
                              key: q.id,
                              class: vue.normalizeClass(["question-item", {
                                current: isCurrentQuestion(q.id),
                                answered: isAnswered(q.id),
                                correct: isViewMode.value && canViewPaper.value && getQuestionResult(q.id) === true,
                                wrong: isViewMode.value && canViewPaper.value && getQuestionResult(q.id) === false
                              }]),
                              onClick: ($event) => jumpToQuestion(q.id)
                            }, [
                              vue.createElementVNode(
                                "text",
                                null,
                                vue.toDisplayString(section.startIndex + qIndex + 1),
                                1
                                /* TEXT */
                              )
                            ], 10, ["onClick"]);
                          }),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ]),
              vue.createElementVNode("view", { class: "nav-legend" }, [
                isViewMode.value ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "legend-row"
                }, [
                  vue.createElementVNode("view", { class: "legend-item" }, [
                    vue.createElementVNode("view", { class: "dot correct" }),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("common.correct")),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "legend-item" }, [
                    vue.createElementVNode("view", { class: "dot wrong" }),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("common.wrong")),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "legend-item" }, [
                    vue.createElementVNode("view", { class: "dot unanswered" }),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("student.unanswered")),
                      1
                      /* TEXT */
                    )
                  ])
                ])) : (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "legend-row"
                }, [
                  vue.createElementVNode("view", { class: "legend-item" }, [
                    vue.createElementVNode("view", { class: "dot current" }),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("student.current")),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "legend-item" }, [
                    vue.createElementVNode("view", { class: "dot answered" }),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("student.answered")),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "legend-item" }, [
                    vue.createElementVNode("view", { class: "dot unanswered" }),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(vue.unref(userStore).t("student.unanswered")),
                      1
                      /* TEXT */
                    )
                  ])
                ]))
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "loading-container"
        }, [
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString(vue.unref(userStore).t("student.loadingExam")),
            1
            /* TEXT */
          )
        ]));
      };
    }
  };
  const PagesStudentExamTake = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-35b9ed3e"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/student/exam-take.vue"]]);
  const _sfc_main$3 = {
    __name: "history",
    setup(__props) {
      const userStore = useUserStore();
      const tableData = vue.ref([]);
      const keyword = vue.ref("");
      const loading = vue.ref(false);
      const current = vue.ref(1);
      const size = vue.ref(10);
      const loadStatus = vue.ref("more");
      const handleSearch = () => {
        current.value = 1;
        tableData.value = [];
        loadStatus.value = "more";
        loadData();
      };
      const handleDetail = (item) => {
        uni.navigateTo({
          url: `/pages/student/exam-take?id=${item.examId}&recordId=${item.id}&review=1`
        });
      };
      const loadData = async () => {
        if (loadStatus.value === "loading")
          return;
        loadStatus.value = "loading";
        try {
          const params = {
            current: current.value,
            size: size.value,
            keyword: keyword.value
          };
          const res = await examRecordApi.getStudentHistory(params);
          if (res.code === 200) {
            const data = res.data.records;
            tableData.value = [...tableData.value, ...data];
            loadStatus.value = data.length >= size.value ? "more" : "noMore";
            current.value++;
          } else {
            uni.showToast({
              title: res.message || userStore.t("common.failed"),
              icon: "none"
            });
            loadStatus.value = "more";
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/history.vue:105", e);
          uni.showToast({
            title: userStore.t("student.networkError"),
            icon: "none"
          });
          loadStatus.value = "more";
        } finally {
          loading.value = false;
        }
      };
      vue.onMounted(() => {
        loadData();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "history" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.history"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createCommentVNode(" 内容区域 "),
          vue.createElementVNode("view", { class: "content-area" }, [
            vue.createCommentVNode(" 搜索栏 "),
            vue.createElementVNode("view", { class: "search-bar" }, [
              vue.createElementVNode("view", { class: "search-input" }, [
                vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
                vue.withDirectives(vue.createElementVNode("input", {
                  type: "text",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
                  placeholder: vue.unref(userStore).t("student.searchExam"),
                  onConfirm: handleSearch
                }, null, 40, ["placeholder"]), [
                  [vue.vModelText, keyword.value]
                ])
              ]),
              vue.createElementVNode(
                "button",
                {
                  class: "search-btn",
                  onClick: handleSearch
                },
                vue.toDisplayString(vue.unref(userStore).t("common.search")),
                1
                /* TEXT */
              )
            ]),
            vue.createCommentVNode(" 卡片列表 "),
            vue.createElementVNode("view", { class: "card-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(tableData.value, (item) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "card-item",
                    key: item.id
                  }, [
                    vue.createElementVNode("view", { class: "card-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "card-title" },
                        vue.toDisplayString(item.examTitle),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["score-badge", item.score >= 60 ? "pass" : "fail"])
                        },
                        [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(item.score) + vue.toDisplayString(vue.unref(userStore).t("dashboard.scoreUnit")),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "card-info" }, [
                      vue.createElementVNode("view", { class: "info-row" }, [
                        vue.createElementVNode("text", { class: "clock-icon" }, "🕐"),
                        vue.createElementVNode(
                          "text",
                          { class: "info-text" },
                          vue.toDisplayString(vue.unref(userStore).t("student.submitTime")) + "：" + vue.toDisplayString(item.submitTime),
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    vue.createElementVNode("view", { class: "card-actions" }, [
                      vue.createElementVNode("button", {
                        class: "detail-btn",
                        onClick: ($event) => handleDetail(item)
                      }, vue.toDisplayString(vue.unref(userStore).t("student.viewDetail")), 9, ["onClick"])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            loadStatus.value === "loading" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "load-more"
            }, [
              vue.createElementVNode(
                "text",
                { class: "loading-text" },
                vue.toDisplayString(vue.unref(userStore).t("common.loading")) + "...",
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            loadStatus.value === "noMore" ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "load-more"
            }, [
              vue.createElementVNode(
                "text",
                { class: "loading-text" },
                vue.toDisplayString(vue.unref(userStore).t("common.noMoreData")),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            !loading.value && tableData.value.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "empty"
            }, [
              vue.createElementVNode("text", { class: "empty-icon" }, "📋"),
              vue.createElementVNode(
                "text",
                { class: "empty-text" },
                vue.toDisplayString(vue.unref(userStore).t("student.noHistory")),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ]);
      };
    }
  };
  const PagesStudentHistory = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-cee26447"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/student/history.vue"]]);
  const _sfc_main$2 = {
    __name: "wrong-questions",
    setup(__props) {
      const userStore = useUserStore();
      const tableData = vue.ref([]);
      const subjects = vue.ref([]);
      const params = vue.ref({
        subjectId: "",
        mastered: ""
      });
      const loadStatus = vue.ref("more");
      const current = vue.ref(1);
      const size = vue.ref(10);
      const answerVisible = vue.ref(false);
      const viewingAnswer = vue.ref(null);
      const practiceVisible = vue.ref(false);
      const practicingItem = vue.ref(null);
      const userAnswer = vue.ref([]);
      const showPracticeResult = vue.ref(false);
      const typeMap = vue.computed(() => ({
        SINGLE_CHOICE: userStore.t("common.singleChoice"),
        MULTIPLE_CHOICE: userStore.t("common.multipleChoice"),
        JUDGMENT: userStore.t("common.trueFalse"),
        FILL_BLANK: userStore.t("common.fillBlank"),
        ESSAY: userStore.t("common.shortAnswer"),
        PROGRAMMING: userStore.t("common.programming")
      }));
      const subjectOptions = vue.computed(() => {
        return [{ id: "", name: userStore.t("student.allSubjects") }, ...subjects.value];
      });
      const statusOptions = vue.computed(() => [
        { value: "", label: userStore.t("common.all") },
        { value: "0", label: userStore.t("student.notMastered") },
        { value: "1", label: userStore.t("student.mastered") }
      ]);
      const currentSubjectText = vue.computed(() => {
        const option = subjectOptions.value.find((s) => s.id === params.value.subjectId);
        return option ? option.name : userStore.t("student.allSubjects");
      });
      const currentStatusText = vue.computed(() => {
        const option = statusOptions.value.find((s) => s.value === params.value.mastered);
        return option ? option.label : userStore.t("common.all");
      });
      const typeText = (type) => typeMap.value[type] || type;
      const getTagClass = (type) => {
        return {
          "tag-info": true
        };
      };
      const getPassRate = (item) => {
        if (!item.practicedCount || item.practicedCount === 0)
          return 0;
        return Math.round(item.correctCount / item.practicedCount * 100);
      };
      const onSubjectChange = (e) => {
        const index = e.detail.value;
        params.value.subjectId = subjectOptions.value[index].id;
        loadData();
      };
      const onStatusChange = (e) => {
        const index = e.detail.value;
        params.value.mastered = statusOptions.value[index].value;
        loadData();
      };
      const handleViewAnswer = (item) => {
        viewingAnswer.value = item;
        answerVisible.value = true;
      };
      const handlePractice = (item) => {
        practicingItem.value = item;
        userAnswer.value = [];
        showPracticeResult.value = false;
        practiceVisible.value = true;
      };
      const parseOptions = (options) => {
        try {
          const parsed = typeof options === "string" ? JSON.parse(options) : options;
          if (Array.isArray(parsed)) {
            return parsed.map((item) => ({
              key: item.key || "",
              value: item.content || item.value || ""
            }));
          }
          return Object.entries(parsed).map(([key, value]) => ({ key, value }));
        } catch {
          return [];
        }
      };
      const isMultiChoiceItem = (item) => {
        const type = item == null ? void 0 : item.type;
        const correctAnswer = (item == null ? void 0 : item.correctAnswer) || "";
        return type === "MULTIPLE_CHOICE" || correctAnswer.includes(",");
      };
      const isMultiChoice = () => {
        return isMultiChoiceItem(practicingItem.value);
      };
      const selectOption = (key) => {
        if (showPracticeResult.value)
          return;
        if (isMultiChoice()) {
          const index = userAnswer.value.indexOf(key);
          if (index > -1) {
            userAnswer.value.splice(index, 1);
          } else {
            userAnswer.value.push(key);
          }
        } else {
          userAnswer.value = [key];
        }
      };
      const getCorrectAnswers = () => {
        var _a;
        const correct = ((_a = practicingItem.value) == null ? void 0 : _a.correctAnswer) || "";
        return correct.split(",").map((a) => a.trim()).filter((a) => a);
      };
      const isCorrectOption = (key) => {
        return getCorrectAnswers().includes(key);
      };
      const isWrongOption = (key) => {
        return userAnswer.value.includes(key) && !isCorrectOption(key);
      };
      const isAnswerCorrect = vue.computed(() => {
        const user = [...userAnswer.value].sort();
        const correct = getCorrectAnswers().sort();
        if (user.length !== correct.length)
          return false;
        return user.every((val, idx) => val === correct[idx]);
      });
      const formatAnswer = (answer) => {
        return answer.length > 0 ? answer.join("") : userStore.t("student.unanswered");
      };
      const submitPractice = async () => {
        if (userAnswer.value.length === 0) {
          uni.showToast({
            title: userStore.t("student.pleaseSelectAnswer"),
            icon: "none"
          });
          return;
        }
        try {
          await wrongQuestionApi.practice(practicingItem.value.id);
          if (isAnswerCorrect.value) {
            await wrongQuestionApi.correct(practicingItem.value.id);
          }
          showPracticeResult.value = true;
          const idx = tableData.value.findIndex((item) => item.id === practicingItem.value.id);
          if (idx > -1) {
            tableData.value[idx].practicedCount++;
            if (isAnswerCorrect.value) {
              tableData.value[idx].correctCount++;
            }
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/wrong-questions.vue:356", e);
          uni.showToast({
            title: userStore.t("common.failed"),
            icon: "none"
          });
        }
      };
      const handleToggleMastered = async (item) => {
        try {
          const newMastered = item.mastered === 1 ? 0 : 1;
          const res = await wrongQuestionApi.updateMastered(item.id, newMastered);
          if (res.code === 200) {
            uni.showToast({
              title: userStore.t("common.success"),
              icon: "success"
            });
            item.mastered = newMastered;
          } else {
            uni.showToast({
              title: res.message || userStore.t("common.failed"),
              icon: "none"
            });
          }
        } catch (e) {
          uni.showToast({
            title: userStore.t("student.networkError"),
            icon: "none"
          });
        }
      };
      const loadSubjects = async () => {
        try {
          const res = await subjectApi.list();
          if (res.code === 200) {
            subjects.value = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/wrong-questions.vue:395", e);
        }
      };
      const loadData = async () => {
        if (loadStatus.value === "loading")
          return;
        loadStatus.value = "loading";
        current.value = 1;
        tableData.value = [];
        try {
          const res = await wrongQuestionApi.page({
            current: current.value,
            size: size.value,
            subjectId: params.value.subjectId,
            mastered: params.value.mastered
          });
          if (res.code === 200) {
            tableData.value = res.data.records;
            loadStatus.value = res.data.records.length >= size.value ? "more" : "noMore";
          } else {
            uni.showToast({
              title: res.message || userStore.t("common.failed"),
              icon: "none"
            });
            loadStatus.value = "more";
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/wrong-questions.vue:423", e);
          uni.showToast({
            title: userStore.t("student.networkError"),
            icon: "none"
          });
          loadStatus.value = "more";
        }
      };
      vue.onMounted(() => {
        loadSubjects();
        loadData();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "wrong-questions" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.wrongQuestions"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createCommentVNode(" 工具栏 "),
          vue.createElementVNode("view", { class: "toolbar" }, [
            vue.createElementVNode("view", { class: "toolbar-left" }, [
              vue.createElementVNode("picker", {
                mode: "selector",
                range: vue.unref(subjectOptions),
                "range-key": "name",
                onChange: onSubjectChange
              }, [
                vue.createElementVNode("view", { class: "picker" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(vue.unref(currentSubjectText)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "picker-icon" }, "▼")
                ])
              ], 40, ["range"]),
              vue.createElementVNode("picker", {
                mode: "selector",
                range: vue.unref(statusOptions),
                "range-key": "label",
                onChange: onStatusChange
              }, [
                vue.createElementVNode("view", { class: "picker" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(vue.unref(currentStatusText)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "picker-icon" }, "▼")
                ])
              ], 40, ["range"])
            ]),
            vue.createElementVNode(
              "button",
              {
                class: "search-btn",
                onClick: loadData
              },
              vue.toDisplayString(vue.unref(userStore).t("common.search")),
              1
              /* TEXT */
            )
          ]),
          vue.createCommentVNode(" 题目列表 "),
          vue.createElementVNode("view", { class: "question-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(tableData.value, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "question-item",
                  key: item.id
                }, [
                  vue.createElementVNode("view", { class: "question-content" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "question-text" },
                      vue.toDisplayString(item.content),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "question-meta" }, [
                    vue.createElementVNode("view", { class: "meta-row" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["tag", getTagClass(item.type)])
                        },
                        [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(isMultiChoiceItem(item) ? vue.unref(userStore).t("student.multipleChoice") : typeText(item.type)),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      ),
                      vue.createElementVNode(
                        "view",
                        {
                          class: vue.normalizeClass(["tag", item.mastered === 1 ? "tag-success" : "tag-warning"])
                        },
                        [
                          vue.createElementVNode(
                            "text",
                            null,
                            vue.toDisplayString(item.mastered === 1 ? vue.unref(userStore).t("student.mastered") : vue.unref(userStore).t("student.notMastered")),
                            1
                            /* TEXT */
                          )
                        ],
                        2
                        /* CLASS */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "progress-row" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "progress-label" },
                        vue.toDisplayString(vue.unref(userStore).t("student.passRateText")) + "：",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("view", { class: "progress-bar" }, [
                        vue.createElementVNode(
                          "view",
                          {
                            class: "progress-fill",
                            style: vue.normalizeStyle({ width: getPassRate(item) + "%" })
                          },
                          null,
                          4
                          /* STYLE */
                        )
                      ]),
                      vue.createElementVNode(
                        "text",
                        { class: "progress-text" },
                        vue.toDisplayString(getPassRate(item)) + "%",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "practice-count" },
                      vue.toDisplayString(vue.unref(userStore).t("student.practiceCount")) + "：" + vue.toDisplayString(item.practicedCount),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "question-actions" }, [
                    vue.createElementVNode("button", {
                      class: "action-btn",
                      onClick: ($event) => handleViewAnswer(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("student.viewAnswer")), 9, ["onClick"]),
                    vue.createElementVNode("button", {
                      class: "action-btn primary",
                      onClick: ($event) => handlePractice(item)
                    }, vue.toDisplayString(vue.unref(userStore).t("student.practice")), 9, ["onClick"]),
                    vue.createElementVNode("button", {
                      class: vue.normalizeClass(["action-btn", item.mastered === 1 ? "warning" : "success"]),
                      onClick: ($event) => handleToggleMastered(item)
                    }, vue.toDisplayString(item.mastered === 1 ? vue.unref(userStore).t("student.markNotMastered") : vue.unref(userStore).t("student.markMastered")), 11, ["onClick"])
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "load-more" }, [
            loadStatus.value === "loading" ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "load-more-text"
              },
              vue.toDisplayString(vue.unref(userStore).t("student.loadingMore")),
              1
              /* TEXT */
            )) : loadStatus.value === "noMore" ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 1,
                class: "load-more-text"
              },
              vue.toDisplayString(vue.unref(userStore).t("student.noMoreData")),
              1
              /* TEXT */
            )) : (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 2,
                class: "load-more-text load-more-more"
              },
              vue.toDisplayString(vue.unref(userStore).t("student.clickLoadMore")),
              1
              /* TEXT */
            ))
          ]),
          vue.createCommentVNode(" 查看答案弹窗 "),
          answerVisible.value ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "modal",
            onClick: _cache[3] || (_cache[3] = ($event) => answerVisible.value = false)
          }, [
            vue.createElementVNode("view", {
              class: "modal-content",
              onClick: _cache[2] || (_cache[2] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "modal-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "modal-title" },
                  vue.toDisplayString(vue.unref(userStore).t("student.viewAnswer")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", {
                  class: "modal-close",
                  onClick: _cache[0] || (_cache[0] = ($event) => answerVisible.value = false)
                }, [
                  vue.createElementVNode("text", { class: "close-icon" }, "✕")
                ])
              ]),
              viewingAnswer.value ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "answer-content"
              }, [
                vue.createElementVNode("view", { class: "question-type-tag" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(typeText(viewingAnswer.value.type)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "answer-question-text" },
                  vue.toDisplayString(viewingAnswer.value.content),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "answer-row" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "label" },
                    vue.toDisplayString(vue.unref(userStore).t("student.wrongAnswer")) + "：",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "value wrong" },
                    vue.toDisplayString(viewingAnswer.value.wrongAnswer || vue.unref(userStore).t("common.noData")),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "answer-row" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "label" },
                    vue.toDisplayString(vue.unref(userStore).t("student.correctAnswer")) + "：",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "value correct" },
                    vue.toDisplayString(viewingAnswer.value.correctAnswer),
                    1
                    /* TEXT */
                  )
                ]),
                viewingAnswer.value.analysis ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "analysis"
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "label" },
                    vue.toDisplayString(vue.unref(userStore).t("student.analysis")) + "：",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "value" },
                    vue.toDisplayString(viewingAnswer.value.analysis),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "modal-footer" }, [
                vue.createElementVNode(
                  "button",
                  {
                    class: "close-btn",
                    onClick: _cache[1] || (_cache[1] = ($event) => answerVisible.value = false)
                  },
                  vue.toDisplayString(vue.unref(userStore).t("common.cancel")),
                  1
                  /* TEXT */
                )
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 练习弹窗 "),
          practiceVisible.value ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "modal",
            onClick: _cache[7] || (_cache[7] = ($event) => practiceVisible.value = false)
          }, [
            vue.createElementVNode("view", {
              class: "modal-content practice-content",
              onClick: _cache[6] || (_cache[6] = vue.withModifiers(() => {
              }, ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "modal-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "modal-title" },
                  vue.toDisplayString(vue.unref(userStore).t("student.practice")),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", {
                  class: "modal-close",
                  onClick: _cache[4] || (_cache[4] = ($event) => practiceVisible.value = false)
                }, [
                  vue.createElementVNode("text", { class: "close-icon" }, "✕")
                ])
              ]),
              practicingItem.value ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "practice-body"
              }, [
                vue.createElementVNode("view", { class: "question-type-tag" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(isMultiChoice() ? vue.unref(userStore).t("student.multipleChoice") : typeText(practicingItem.value.type)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "answer-question-text" },
                  vue.toDisplayString(practicingItem.value.content),
                  1
                  /* TEXT */
                ),
                practicingItem.value.options ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "options-list"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(parseOptions(practicingItem.value.options), (option, index) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: index,
                        class: vue.normalizeClass(["option-item", { selected: userAnswer.value.includes(option.key), correct: showPracticeResult.value && isCorrectOption(option.key), wrong: showPracticeResult.value && isWrongOption(option.key) }]),
                        onClick: ($event) => selectOption(option.key)
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "option-key" },
                          vue.toDisplayString(option.key),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "option-value" },
                          vue.toDisplayString(option.value),
                          1
                          /* TEXT */
                        )
                      ], 10, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])) : vue.createCommentVNode("v-if", true),
                showPracticeResult.value ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "practice-result"
                }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["result-row", vue.unref(isAnswerCorrect) ? "correct" : "wrong"])
                    },
                    [
                      vue.createElementVNode(
                        "text",
                        { class: "result-icon" },
                        vue.toDisplayString(vue.unref(isAnswerCorrect) ? "✓" : "✗"),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "result-text" },
                        vue.toDisplayString(vue.unref(isAnswerCorrect) ? vue.unref(userStore).t("student.answerCorrect") : vue.unref(userStore).t("student.answerWrong")),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  ),
                  vue.createElementVNode("view", { class: "answer-row" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "label" },
                      vue.toDisplayString(vue.unref(userStore).t("student.yourAnswer")) + "：",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      {
                        class: vue.normalizeClass(["value", vue.unref(isAnswerCorrect) ? "correct" : "wrong"])
                      },
                      vue.toDisplayString(formatAnswer(userAnswer.value)),
                      3
                      /* TEXT, CLASS */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "answer-row" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "label" },
                      vue.toDisplayString(vue.unref(userStore).t("student.correctAnswer")) + "：",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "value correct" },
                      vue.toDisplayString(practicingItem.value.correctAnswer),
                      1
                      /* TEXT */
                    )
                  ]),
                  practicingItem.value.analysis ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "analysis"
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "label" },
                      vue.toDisplayString(vue.unref(userStore).t("student.analysis")) + "：",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(practicingItem.value.analysis),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true)
                ])) : vue.createCommentVNode("v-if", true)
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "modal-footer" }, [
                !showPracticeResult.value ? (vue.openBlock(), vue.createElementBlock(
                  "button",
                  {
                    key: 0,
                    class: "close-btn primary",
                    onClick: submitPractice
                  },
                  vue.toDisplayString(vue.unref(userStore).t("common.submit")),
                  1
                  /* TEXT */
                )) : (vue.openBlock(), vue.createElementBlock(
                  "button",
                  {
                    key: 1,
                    class: "close-btn",
                    onClick: _cache[5] || (_cache[5] = ($event) => practiceVisible.value = false)
                  },
                  vue.toDisplayString(vue.unref(userStore).t("common.cancel")),
                  1
                  /* TEXT */
                ))
              ])
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  };
  const PagesStudentWrongQuestions = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-352657ac"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/student/wrong-questions.vue"]]);
  const _sfc_main$1 = {
    __name: "statistics",
    setup(__props) {
      const userStore = useUserStore();
      const stats = vue.ref({
        totalExams: 0,
        avgScore: 0,
        correctCount: 0,
        wrongCount: 0,
        skippedCount: 0,
        passRate: 0
      });
      const subjectScores = vue.ref([]);
      const statItems = vue.computed(() => [
        {
          label: userStore.t("student.totalExams"),
          value: stats.value.totalExams,
          emoji: "📝",
          bgColor: "#667eea"
        },
        {
          label: userStore.t("student.avgScore"),
          value: stats.value.avgScore,
          emoji: "⭐",
          bgColor: "#f56c6c"
        },
        {
          label: userStore.t("student.passRate"),
          value: stats.value.passRate + "%",
          emoji: "🏅",
          bgColor: "#67c23a"
        }
      ]);
      const totalAnswered = vue.computed(() => {
        return stats.value.correctCount + stats.value.wrongCount + stats.value.skippedCount;
      });
      const correctRate = vue.computed(() => {
        if (totalAnswered.value === 0)
          return 0;
        return Math.round(stats.value.correctCount / totalAnswered.value * 100);
      });
      const wrongRate = vue.computed(() => {
        if (totalAnswered.value === 0)
          return 0;
        return Math.round(stats.value.wrongCount / totalAnswered.value * 100);
      });
      const skippedRate = vue.computed(() => {
        if (totalAnswered.value === 0)
          return 0;
        return Math.round(stats.value.skippedCount / totalAnswered.value * 100);
      });
      const loadStatistics = async () => {
        var _a;
        try {
          const userId = (_a = userStore.userInfo) == null ? void 0 : _a.userId;
          if (!userId)
            return;
          const [statsRes, subjectRes] = await Promise.all([
            examRecordApi.getStudentStats(),
            examRecordApi.getStudentSubjectScores()
          ]);
          if (statsRes.code === 200) {
            const data = statsRes.data;
            stats.value = {
              totalExams: data.completedExams || 0,
              avgScore: data.averageScore || 0,
              correctCount: 0,
              wrongCount: data.wrongCount || 0,
              skippedCount: 0,
              passRate: 0
            };
          }
          if (subjectRes.code === 200) {
            subjectScores.value = subjectRes.data.map((subject, index) => ({
              ...subject,
              color: ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399"][index % 5]
            }));
          }
        } catch (e) {
          formatAppLog("error", "at pages/student/statistics.vue:170", e);
          uni.showToast({
            title: userStore.t("common.failed"),
            icon: "none"
          });
        }
      };
      vue.onMounted(() => {
        loadStatistics();
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "statistics" }, [
          vue.createVNode(CustomNavBar, {
            title: vue.unref(userStore).t("common.statistics"),
            showBack: true
          }, null, 8, ["title"]),
          vue.createCommentVNode(" 统计卡片 "),
          vue.createElementVNode("view", { class: "stat-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(vue.unref(statItems), (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "stat-card",
                  key: index
                }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: "stat-icon",
                      style: vue.normalizeStyle({ background: item.bgColor })
                    },
                    [
                      vue.createElementVNode(
                        "text",
                        { class: "stat-emoji" },
                        vue.toDisplayString(item.emoji),
                        1
                        /* TEXT */
                      )
                    ],
                    4
                    /* STYLE */
                  ),
                  vue.createElementVNode("view", { class: "stat-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "stat-value" },
                      vue.toDisplayString(item.value),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "stat-label" },
                      vue.toDisplayString(item.label),
                      1
                      /* TEXT */
                    )
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createCommentVNode(" 科目成绩 "),
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("view", { class: "card-header" }, [
              vue.createElementVNode(
                "text",
                { class: "card-title" },
                vue.toDisplayString(vue.unref(userStore).t("student.subjectScores")),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "subject-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(subjectScores.value, (subject) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "subject-item",
                    key: subject.subjectName
                  }, [
                    vue.createElementVNode("view", { class: "subject-info" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "subject-name" },
                        vue.toDisplayString(subject.subjectName),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "subject-exams" },
                        vue.toDisplayString(subject.examCount) + vue.toDisplayString(vue.unref(userStore).t("student.exams")),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "subject-score" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "score-value" },
                        vue.toDisplayString(subject.avgScore),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "score-unit" },
                        vue.toDisplayString(vue.unref(userStore).t("dashboard.scoreUnit")),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "score-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "bar-fill",
                          style: vue.normalizeStyle({ width: subject.avgScore + "%", background: subject.color })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createCommentVNode(" 答题情况 "),
          vue.createElementVNode("view", { class: "card" }, [
            vue.createElementVNode("view", { class: "card-header" }, [
              vue.createElementVNode(
                "text",
                { class: "card-title" },
                vue.toDisplayString(vue.unref(userStore).t("student.answerStats")),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "answer-stats" }, [
              vue.createElementVNode("view", { class: "answer-item" }, [
                vue.createElementVNode("view", { class: "answer-icon correct" }, [
                  vue.createElementVNode("text", { class: "answer-emoji" }, "✓")
                ]),
                vue.createElementVNode("view", { class: "answer-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "answer-count" },
                    vue.toDisplayString(stats.value.correctCount),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "answer-label" },
                    vue.toDisplayString(vue.unref(userStore).t("student.correctCount")),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "answer-rate" },
                  vue.toDisplayString(vue.unref(correctRate)) + "%",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "answer-item" }, [
                vue.createElementVNode("view", { class: "answer-icon wrong" }, [
                  vue.createElementVNode("text", { class: "answer-emoji" }, "✗")
                ]),
                vue.createElementVNode("view", { class: "answer-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "answer-count" },
                    vue.toDisplayString(stats.value.wrongCount),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "answer-label" },
                    vue.toDisplayString(vue.unref(userStore).t("student.wrongCount")),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "answer-rate" },
                  vue.toDisplayString(vue.unref(wrongRate)) + "%",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "answer-item" }, [
                vue.createElementVNode("view", { class: "answer-icon skip" }, [
                  vue.createElementVNode("text", { class: "answer-emoji" }, "—")
                ]),
                vue.createElementVNode("view", { class: "answer-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "answer-count" },
                    vue.toDisplayString(stats.value.skippedCount),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "answer-label" },
                    vue.toDisplayString(vue.unref(userStore).t("student.skippedCount")),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "answer-rate" },
                  vue.toDisplayString(vue.unref(skippedRate)) + "%",
                  1
                  /* TEXT */
                )
              ])
            ])
          ])
        ]);
      };
    }
  };
  const PagesStudentStatistics = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-508c3e4d"], ["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/pages/student/statistics.vue"]]);
  __definePage("pages/common/login", PagesCommonLogin);
  __definePage("pages/common/register", PagesCommonRegister);
  __definePage("pages/common/dashboard", PagesCommonDashboard);
  __definePage("pages/common/message", PagesCommonMessage);
  __definePage("pages/common/account", PagesCommonAccount);
  __definePage("pages/admin/user-manage", PagesAdminUserManage);
  __definePage("pages/admin/department-manage", PagesAdminDepartmentManage);
  __definePage("pages/admin/class-manage", PagesAdminClassManage);
  __definePage("pages/admin/log-manage", PagesAdminLogManage);
  __definePage("pages/admin/statistics", PagesAdminStatistics);
  __definePage("pages/teacher/my-classes", PagesTeacherMyClasses);
  __definePage("pages/teacher/class-chat", PagesTeacherClassChat);
  __definePage("pages/teacher/subject-manage", PagesTeacherSubjectManage);
  __definePage("pages/teacher/question-manage", PagesTeacherQuestionManage);
  __definePage("pages/teacher/paper-manage", PagesTeacherPaperManage);
  __definePage("pages/teacher/exam-manage", PagesTeacherExamManage);
  __definePage("pages/teacher/exam-record-manage", PagesTeacherExamRecordManage);
  __definePage("pages/teacher/exam-monitor", PagesTeacherExamMonitor);
  __definePage("pages/teacher/exam-edit", PagesTeacherExamEdit);
  __definePage("pages/teacher/paper-edit", PagesTeacherPaperEdit);
  __definePage("pages/teacher/paper-preview", PagesTeacherPaperPreview);
  __definePage("pages/teacher/exam-record-detail", PagesTeacherExamRecordDetail);
  __definePage("pages/teacher/exam-grade", PagesTeacherExamGrade);
  __definePage("pages/student/my-classes", PagesStudentMyClasses);
  __definePage("pages/student/class-chat", PagesStudentClassChat);
  __definePage("pages/student/exam-list", PagesStudentExamList);
  __definePage("pages/student/exam-take", PagesStudentExamTake);
  __definePage("pages/student/history", PagesStudentHistory);
  __definePage("pages/student/wrong-questions", PagesStudentWrongQuestions);
  __definePage("pages/student/statistics", PagesStudentStatistics);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/周超/Documents/大三下/J2EE/exam_pro/oes-uniapp/App.vue"]]);
  var isVue2 = false;
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
    * pinia v2.0.33
    * (c) 2023 Eduardo San Martin Morote
    * @license MIT
    */
  const piniaSymbol = Symbol("pinia");
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const USE_DEVTOOLS = IS_CLIENT;
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    try {
      xhr.send();
    } catch (e) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a = document.createElement("a");
    a.download = name;
    a.rel = "noopener";
    if (typeof blob === "string") {
      a.href = blob;
      if (a.origin !== location.origin) {
        if (corsEnabled(a.href)) {
          download(blob, name, opts);
        } else {
          a.target = "_blank";
          click(a);
        }
      } else {
        click(a);
      }
    } else {
      a.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a.href);
      }, 4e4);
      setTimeout(function() {
        click(a);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a = document.createElement("a");
        a.href = blob;
        a.target = "_blank";
        setTimeout(function() {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url = reader.result;
        if (typeof url !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url;
        } else {
          location.assign(url);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url);
      else
        location.href = url;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o) {
    return "_a" in o && "install" in o;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error) {
    if (error instanceof Error && error.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      pinia.state.value = JSON.parse(await navigator.clipboard.readText());
      toastMessage("Global state pasted from clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalSaveState(pinia) {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia) {
    try {
      const open2 = await getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      pinia.state.value = JSON.parse(text);
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree(store2) {
    return isPinia(store2) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store2.$id,
      label: store2.$id
    };
  }
  function formatStoreForInspectorState(store2) {
    if (isPinia(store2)) {
      const storeNames = Array.from(store2._s.keys());
      const storeMap = store2._s;
      const state3 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store2.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store3 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store3._getters.reduce((getters, key) => {
              getters[key] = store3[key];
              return getters;
            }, {})
          };
        })
      };
      return state3;
    }
    const state2 = {
      state: Object.keys(store2.$state).map((key) => ({
        editable: true,
        key,
        value: store2.$state[key]
      }))
    };
    if (store2._getters && store2._getters.length) {
      state2.getters = store2._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store2[getterName]
      }));
    }
    if (store2._customProperties.size) {
      state2.customProperties = Array.from(store2._customProperties).map((key) => ({
        editable: true,
        key,
        value: store2[key]
      }));
    }
    return state2;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID = "pinia:mutations";
  const INSPECTOR_ID = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api2) => {
      if (typeof api2.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api2.addTimelineLayer({
        id: MUTATIONS_LAYER_ID,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api2.addInspector({
        id: INSPECTOR_ID,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia);
              api2.sendInspectorTree(INSPECTOR_ID);
              api2.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia);
              api2.sendInspectorTree(INSPECTOR_ID);
              api2.sendInspectorState(INSPECTOR_ID);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: "Reset the state (option store only)",
            action: (nodeId) => {
              const store2 = pinia._s.get(nodeId);
              if (!store2) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (!store2._isOptionsAPI) {
                toastMessage(`Cannot reset "${nodeId}" store because it's a setup store.`, "warn");
              } else {
                store2.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api2.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store2) => {
            payload.instanceData.state.push({
              type: getStoreType(store2.$id),
              key: "state",
              editable: true,
              value: store2._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store2.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store2.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store2.$state).reduce((state2, key) => {
                  state2[key] = store2.$state[key];
                  return state2;
                }, {})
              )
            });
            if (store2._getters && store2._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store2.$id),
                key: "getters",
                editable: false,
                value: store2._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store2[key];
                  } catch (error) {
                    getters[key] = error;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api2.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          let stores = [pinia];
          stores = stores.concat(Array.from(pinia._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store2) => "$id" in store2 ? store2.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree);
        }
      });
      api2.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            payload.state = formatStoreForInspectorState(inspectedStore);
          }
        }
      });
      api2.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api2.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store2 = pinia._s.get(storeId);
          if (!store2) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store2, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store2) {
    if (!componentStateTypes.includes(getStoreType(store2.$id))) {
      componentStateTypes.push(getStoreType(store2.$id));
    }
    setupDevtoolsPlugin({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api2) => {
      const now2 = typeof api2.now === "function" ? api2.now.bind(api2) : Date.now;
      store2.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api2.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store2.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api2.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store2.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error) => {
          activeAction = void 0;
          api2.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store2.$id),
                action: formatDisplay(name),
                args,
                error
              },
              groupId
            }
          });
        });
      }, true);
      store2._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store2[name]), (newValue, oldValue) => {
          api2.notifyComponentUpdate();
          api2.sendInspectorState(INSPECTOR_ID);
          if (isTimelineActive) {
            api2.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store2.$subscribe(({ events, type }, state2) => {
        api2.notifyComponentUpdate();
        api2.sendInspectorState(INSPECTOR_ID);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store2.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        activeAction = void 0;
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api2.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store2._hotUpdate;
      store2._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api2.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID,
          event: {
            time: now2(),
            title: "🔥 " + store2.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store2.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api2.notifyComponentUpdate();
        api2.sendInspectorTree(INSPECTOR_ID);
        api2.sendInspectorState(INSPECTOR_ID);
      });
      const { $dispose } = store2;
      store2.$dispose = () => {
        $dispose();
        api2.notifyComponentUpdate();
        api2.sendInspectorTree(INSPECTOR_ID);
        api2.sendInspectorState(INSPECTOR_ID);
        api2.getSettings().logStoreChanges && toastMessage(`Disposed "${store2.$id}" store 🗑`);
      };
      api2.notifyComponentUpdate();
      api2.sendInspectorTree(INSPECTOR_ID);
      api2.sendInspectorState(INSPECTOR_ID);
      api2.getSettings().logStoreChanges && toastMessage(`"${store2.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store2, actionNames) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store2)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store2[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = new Proxy(store2, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        });
        return actions[actionName].apply(trackedStore, arguments);
      };
    }
  }
  function devtoolsPlugin({ app, store: store2, options }) {
    if (store2.$id.startsWith("__hot:")) {
      return;
    }
    if (options.state) {
      store2._isOptionsAPI = true;
    }
    if (typeof options.state === "function") {
      patchActionForGrouping(
        // @ts-expect-error: can cast the store...
        store2,
        Object.keys(options.actions)
      );
      const originalHotUpdate = store2._hotUpdate;
      vue.toRaw(store2)._hotUpdate = function(newStore) {
        originalHotUpdate.apply(this, arguments);
        patchActionForGrouping(store2, Object.keys(newStore._hmrPayload.actions));
      };
    }
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store2
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state2 = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia = vue.markRaw({
      install(app) {
        {
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state: state2
    });
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
      pinia.use(devtoolsPlugin);
    }
    return pinia;
  }
  function createApp() {
    const app = vue.createVueApp(App);
    const pinia = createPinia();
    app.use(pinia);
    uni.onError((error) => {
      formatAppLog("error", "at main.js:13", "全局错误:", error);
    });
    uni.onNetworkStatusChange((res) => {
      formatAppLog("log", "at main.js:17", "网络状态变化:", res.isConnected, res.networkType);
    });
    return {
      app,
      pinia
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
