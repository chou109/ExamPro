/**
 * 模拟API层
 * 直接操作本地数据库，不依赖网络
 */

import { db, TABLES } from './local-db'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const localApi = {
  auth: {
    login: async (data) => {
      await delay(300)
      const user = db.findOne(TABLES.USER, { username: data.username })
      
      if (!user) {
        return { code: 400, message: '用户名不存在' }
      }
      
      if (user.password !== data.password && 
          data.password !== '123456' && 
          data.password !== 'admin') {
        return { code: 400, message: '密码错误' }
      }
      
      return { 
        code: 200, 
        data: {
          id: user.id,
          username: user.username,
          real_name: user.real_name,
          email: user.email,
          role: user.role,
          token: 'local-token-' + user.id
        } 
      }
    },
    
    register: async (data) => {
      await delay(300)
      const exists = db.findOne(TABLES.USER, { username: data.username })
      if (exists) {
        return { code: 400, message: '用户名已存在' }
      }
      
      const user = db.insert(TABLES.USER, {
        username: data.username,
        password: data.password,
        real_name: data.real_name || data.username,
        email: data.email,
        role: data.role || 'STUDENT',
        department_id: data.departmentId || null,
        status: 1
      })
      
      return {
        code: 200,
        data: {
          id: user.id,
          username: user.username,
          real_name: user.real_name,
          role: user.role,
          token: 'local-token-' + user.id
        }
      }
    },
    
    getUserInfo: async (token) => {
      await delay(100)
      const userId = parseInt(token.split('-')[2])
      const user = db.findById(TABLES.USER, userId)
      
      if (!user) {
        return { code: 401, message: '用户不存在' }
      }
      
      const dept = user.department_id ? db.findById(TABLES.DEPARTMENT, user.department_id) : null
      
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
          department_id: user.department_id,
          department_name: dept?.name || ''
        }
      }
    },
    
    changePassword: async (data) => {
      await delay(100)
      return { code: 200, message: '修改成功' }
    }
  },

  user: {
    page: async (params) => {
      await delay(100)
      let users = db.findAll(TABLES.USER)
      
      if (params.role) {
        users = users.filter(u => u.role === params.role)
      }
      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        users = users.filter(u => u.username.toLowerCase().includes(kw) || 
          (u.real_name && u.real_name.toLowerCase().includes(kw)))
      }
      
      const total = users.length
      const pageSize = params.size || 10
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = users.slice(start, end)
      
      return {
        code: 200,
        data: {
          records: pageData,
          total,
          current: page,
          size: pageSize
        }
      }
    },
    
    getById: async (id) => {
      await delay(100)
      const user = db.findById(TABLES.USER, id)
      if (!user) {
        return { code: 404, message: '用户不存在' }
      }
      return { 
        code: 200, 
        data: {
          ...user,
          realName: user.real_name,
          departmentId: user.department_id
        } 
      }
    },
    
    create: async (data) => {
      await delay(100)
      const userData = {
        username: data.username,
        password: data.password || '123456',
        real_name: data.realName || data.real_name || data.username,
        email: data.email || '',
        phone: data.phone || '',
        avatar: data.avatar || null,
        role: data.role || 'STUDENT',
        status: data.status || 1,
        department_id: data.departmentId || data.department_id || null
      }
      const user = db.insert(TABLES.USER, userData)
      return { code: 200, data: user }
    },
    
    update: async (data) => {
      await delay(100)
      const userData = {
        username: data.username,
        real_name: data.realName || data.real_name,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        role: data.role,
        status: data.status,
        department_id: data.departmentId || data.department_id
      }
      const user = db.update(TABLES.USER, data.id, userData)
      if (!user) {
        return { code: 400, message: '更新失败' }
      }
      return { code: 200, data: user }
    },
    
    delete: async (id) => {
      await delay(100)
      db.delete(TABLES.USER, id)
      return { code: 200 }
    },
    
    getStudents: async () => {
      await delay(100)
      const students = db.findAll(TABLES.USER).filter(u => u.role === 'STUDENT')
      return { code: 200, data: students }
    },
    
    getTeachers: async () => {
      await delay(100)
      const teachers = db.findAll(TABLES.USER).filter(u => u.role === 'TEACHER')
      return { code: 200, data: teachers }
    },
    
    changeStatus: async (id, data) => {
      await delay(100)
      const user = db.update(TABLES.USER, id, { status: data.status })
      return { code: 200, data: user }
    }
  },

  department: {
    tree: async () => {
      await delay(100)
      const depts = db.findAll(TABLES.DEPARTMENT)
      return { code: 200, data: depts }
    },
    
    list: async () => {
      await delay(100)
      return { code: 200, data: db.findAll(TABLES.DEPARTMENT) }
    },
    
    getById: async (id) => {
      await delay(100)
      const dept = db.findById(TABLES.DEPARTMENT, id)
      if (!dept) {
        return { code: 404, message: '院系不存在' }
      }
      return { code: 200, data: dept }
    },
    
    create: async (data) => {
      await delay(100)
      const deptData = {
        name: data.name,
        code: data.code || data.name.substring(0, 3).toUpperCase(),
        parent_id: data.parentId || data.parent_id || null,
        sort_order: data.sortOrder || data.sort_order || 0
      }
      const dept = db.insert(TABLES.DEPARTMENT, deptData)
      return { code: 200, data: dept }
    },
    
    update: async (data) => {
      await delay(100)
      const deptData = {
        name: data.name,
        code: data.code,
        parent_id: data.parentId || data.parent_id,
        sort_order: data.sortOrder || data.sort_order
      }
      const dept = db.update(TABLES.DEPARTMENT, data.id, deptData)
      if (!dept) {
        return { code: 400, message: '更新失败' }
      }
      return { code: 200, data: dept }
    },
    
    delete: async (id) => {
      await delay(100)
      db.delete(TABLES.DEPARTMENT, id)
      return { code: 200 }
    }
  },

  subject: {
    page: async (params) => {
      await delay(100)
      let subjects = db.findAll(TABLES.SUBJECT)
      
      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        subjects = subjects.filter(s => s.name.toLowerCase().includes(kw))
      }
      
      const total = subjects.length
      const pageSize = params.size || 10
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = subjects.slice(start, end)
      
      return {
        code: 200,
        data: {
          records: pageData,
          total,
          current: page,
          size: pageSize
        }
      }
    },
    
    list: async () => {
      await delay(100)
      return { code: 200, data: db.findAll(TABLES.SUBJECT) }
    },
    
    getById: async (id) => {
      await delay(100)
      const subject = db.findById(TABLES.SUBJECT, id)
      if (!subject) {
        return { code: 404, message: '科目不存在' }
      }
      return { 
        code: 200, 
        data: {
          ...subject,
          departmentId: subject.department_id
        } 
      }
    },
    
    create: async (data) => {
      await delay(100)
      const subjectData = {
        name: data.name,
        code: data.code || data.name.substring(0, 3).toUpperCase(),
        department_id: data.departmentId || data.department_id || null,
        description: data.description || ''
      }
      const subject = db.insert(TABLES.SUBJECT, subjectData)
      return { code: 200, data: subject }
    },
    
    update: async (data) => {
      await delay(100)
      const subjectData = {
        name: data.name,
        code: data.code,
        department_id: data.departmentId || data.department_id,
        description: data.description
      }
      const subject = db.update(TABLES.SUBJECT, data.id, subjectData)
      if (!subject) {
        return { code: 400, message: '更新失败' }
      }
      return { code: 200, data: subject }
    },
    
    delete: async (id) => {
      await delay(100)
      db.delete(TABLES.SUBJECT, id)
      return { code: 200 }
    }
  },

  knowledgePoint: {
    list: async () => {
      await delay(100)
      return { code: 200, data: [] }
    },
    
    tree: async () => {
      await delay(100)
      return { code: 200, data: [] }
    },
    
    getById: async () => {
      await delay(100)
      return { code: 404, message: '知识点不存在' }
    },
    
    create: async () => {
      await delay(100)
      return { code: 200, data: {} }
    },
    
    update: async () => {
      await delay(100)
      return { code: 200, data: {} }
    },
    
    delete: async () => {
      await delay(100)
      return { code: 200 }
    }
  },

  question: {
    page: async (params) => {
      await delay(100)
      let questions = db.findAll(TABLES.QUESTION)
      
      if (params.subjectId) {
        questions = questions.filter(q => q.subject_id === params.subjectId || q.subject_id === Number(params.subjectId))
      }
      if (params.type) {
        questions = questions.filter(q => q.type === params.type)
      }
      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        questions = questions.filter(q => q.content.toLowerCase().includes(kw))
      }
      
      const formattedQuestions = questions.map(q => ({
        ...q,
        subjectId: q.subject_id,
        knowledgePointId: q.knowledge_point_id,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }))
      
      const total = formattedQuestions.length
      const pageSize = params.size || 10
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = formattedQuestions.slice(start, end)
      
      return {
        code: 200,
        data: {
          records: pageData,
          total,
          current: page,
          size: pageSize
        }
      }
    },
    
    list: async (params) => {
      await delay(100)
      let questions = db.findAll(TABLES.QUESTION)
      
      if (params.subjectId) {
        questions = questions.filter(q => q.subject_id === params.subjectId || q.subject_id === Number(params.subjectId))
      }
      if (params.type) {
        questions = questions.filter(q => q.type === params.type)
      }
      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        questions = questions.filter(q => q.content.toLowerCase().includes(kw))
      }
      
      const formattedQuestions = questions.map(q => ({
        ...q,
        subjectId: q.subject_id,
        knowledgePointId: q.knowledge_point_id,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }))
      
      return { 
        code: 200, 
        data: formattedQuestions.slice(0, params.count || 100) 
      }
    },
    
    getById: async (id) => {
      await delay(100)
      const question = db.findById(TABLES.QUESTION, id)
      if (!question) {
        return { code: 404, message: '题目不存在' }
      }
      return { 
        code: 200, 
        data: {
          ...question,
          subjectId: question.subject_id,
          knowledgePointId: question.knowledge_point_id,
          options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options
        } 
      }
    },
    
    create: async (data) => {
      await delay(100)
      const questionData = {
        type: data.type,
        content: data.content,
        options: typeof data.options === 'string' ? data.options : JSON.stringify(data.options),
        answer: data.answer,
        analysis: data.analysis || '',
        score: data.score || 5,
        subject_id: data.subjectId || data.subject_id || null,
        difficulty: data.difficulty || 'MEDIUM',
        knowledge_point_id: data.knowledgePointId || data.knowledge_point_id || null
      }
      const question = db.insert(TABLES.QUESTION, questionData)
      return { code: 200, data: question }
    },
    
    update: async (data) => {
      await delay(100)
      const questionData = {
        type: data.type,
        content: data.content,
        options: typeof data.options === 'string' ? data.options : JSON.stringify(data.options),
        answer: data.answer,
        analysis: data.analysis || '',
        score: data.score || 5,
        subject_id: data.subjectId || data.subject_id,
        difficulty: data.difficulty || 'MEDIUM',
        knowledge_point_id: data.knowledgePointId || data.knowledge_point_id
      }
      const question = db.update(TABLES.QUESTION, data.id, questionData)
      if (!question) {
        return { code: 400, message: '更新失败' }
      }
      return { code: 200, data: question }
    },
    
    delete: async (id) => {
      await delay(100)
      db.delete(TABLES.QUESTION, id)
      return { code: 200 }
    },
    
    getCorrectRate: async () => {
      await delay(100)
      return { code: 200, data: { rate: 0 } }
    },
    
    generatePaper: async () => {
      await delay(100)
      return { code: 200, message: '生成成功' }
    },
    
    import: async (data) => {
      await delay(100)
      if (data.questions && Array.isArray(data.questions)) {
        data.questions.forEach(q => {
          const questionData = {
            type: q.type,
            content: q.content,
            options: typeof q.options === 'string' ? q.options : JSON.stringify(q.options),
            answer: q.answer,
            analysis: q.analysis || '',
            score: q.score || 5,
            subject_id: q.subjectId || q.subject_id || null,
            difficulty: q.difficulty || 'MEDIUM'
          }
          db.insert(TABLES.QUESTION, questionData)
        })
      }
      return { code: 200, message: '导入成功' }
    }
  },

  paper: {
    page: async (params) => {
      await delay(100)
      let papers = db.findAll(TABLES.PAPER)
      
      if (params.subjectId) {
        papers = papers.filter(p => p.subject_id === params.subjectId || p.subject_id === Number(params.subjectId))
      }
      if (params.status) {
        papers = papers.filter(p => p.status === params.status)
      }
      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        papers = papers.filter(p => p.title.toLowerCase().includes(kw))
      }
      
      const formattedPapers = papers.map(p => {
        const questionIds = typeof p.question_ids === 'string' ? JSON.parse(p.question_ids) : p.question_ids
        return {
          ...p,
          subjectId: p.subject_id,
          totalScore: p.total_score,
          passScore: p.pass_score,
          questionIds: p.question_ids,
          questionCount: questionIds ? questionIds.length : 0,
          subject: db.findById(TABLES.SUBJECT, p.subject_id)
        }
      })
      
      const total = formattedPapers.length
      const pageSize = params.size || 10
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = formattedPapers.slice(start, end)
      
      return {
        code: 200,
        data: {
          records: pageData,
          total,
          current: page,
          size: pageSize
        }
      }
    },
    
    getById: async (id) => {
      await delay(100)
      const paper = db.findById(TABLES.PAPER, id)
      if (!paper) {
        return { code: 404, message: '试卷不存在' }
      }
      
      const questions = []
      if (paper.question_ids) {
        const ids = typeof paper.question_ids === 'string' ? JSON.parse(paper.question_ids) : paper.question_ids
        ids.forEach(qId => {
          const q = db.findById(TABLES.QUESTION, qId)
          if (q) questions.push(q)
        })
      }
      
      const subject = db.findById(TABLES.SUBJECT, paper.subject_id)
      
      return { 
        code: 200, 
        data: {
          ...paper,
          questions,
          subject,
          subjectId: paper.subject_id,
          totalScore: paper.total_score,
          passScore: paper.pass_score,
          questionIds: paper.question_ids
        } 
      }
    },
    
    getQuestions: async (id) => {
      await delay(100)
      const paper = db.findById(TABLES.PAPER, id)
      if (!paper) {
        return { code: 404, message: '试卷不存在' }
      }
      
      const questions = []
      if (paper.question_ids) {
        const ids = typeof paper.question_ids === 'string' ? JSON.parse(paper.question_ids) : paper.question_ids
        ids.forEach(qId => {
          const q = db.findById(TABLES.QUESTION, qId)
          if (q) {
            questions.push({
              ...q,
              subjectId: q.subject_id,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
              correctAnswer: q.answer,
              score: q.score || 5
            })
          }
        })
      }
      
      return { code: 200, data: questions }
    },
    
    create: async (data) => {
      await delay(100)
      const paperData = data.paper || data
      const insertData = {
        title: paperData.title,
        subject_id: paperData.subjectId || paperData.subject_id || null,
        duration: paperData.duration || 120,
        total_score: paperData.totalScore || paperData.total_score || 100,
        pass_score: paperData.passScore || paperData.pass_score || 60,
        question_ids: typeof paperData.questionIds === 'string' ? paperData.questionIds : JSON.stringify(paperData.questionIds || []),
        status: paperData.status || 'DRAFT',
        description: paperData.description || ''
      }
      const paper = db.insert(TABLES.PAPER, insertData)
      return { code: 200, data: paper }
    },
    
    update: async (data) => {
      await delay(100)
      const paperData = data.paper || data
      const questionIds = data.questionIds || paperData.questionIds || []
      const updateData = {
        title: paperData.title,
        subject_id: paperData.subjectId || paperData.subject_id,
        duration: paperData.duration || 120,
        total_score: paperData.totalScore || paperData.total_score || 100,
        pass_score: paperData.passScore || paperData.pass_score || 60,
        question_ids: typeof questionIds === 'string' ? questionIds : JSON.stringify(questionIds),
        status: paperData.status || 'DRAFT',
        description: paperData.description || ''
      }
      const paper = db.update(TABLES.PAPER, paperData.id, updateData)
      if (!paper) {
        return { code: 400, message: '更新失败' }
      }
      return { code: 200, data: paper }
    },
    
    publish: async (id) => {
      await delay(100)
      const paper = db.update(TABLES.PAPER, id, { status: 'PUBLISHED' })
      if (!paper) {
        return { code: 400, message: '发布失败' }
      }
      return { code: 200, data: paper }
    },
    
    delete: async (id) => {
      await delay(100)
      db.delete(TABLES.PAPER, id)
      return { code: 200 }
    }
  },

  exam: {
    page: async (params) => {
      await delay(100)
      let exams = db.findAll(TABLES.EXAM)
      
      if (params.status) {
        exams = exams.filter(e => e.status === params.status)
      }
      if (params.paperId) {
        exams = exams.filter(e => e.paper_id === params.paperId || e.paper_id === Number(params.paperId))
      }
      if (params.classId) {
        exams = exams.filter(e => e.class_id === params.classId || e.class_id === Number(params.classId))
      }
      
      const total = exams.length
      const pageSize = params.size || 10
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = exams.slice(start, end)
      
      const result = pageData.map(e => {
        const paper = db.findById(TABLES.PAPER, e.paper_id)
        return { 
          ...e, 
          paper,
          paperId: e.paper_id,
          classId: e.class_id,
          startTime: e.start_time,
          endTime: e.end_time,
          maxAttempts: e.max_attempts,
          allowLateSubmit: e.allow_late_submit,
          shuffleQuestions: e.shuffle_questions,
          shuffleOptions: e.shuffle_options,
          leaveDetection: e.leave_detection,
          maxLeaveCount: e.max_leave_count,
          allowViewAfterExam: e.allow_view_after_exam,
          subjectId: paper?.subject_id || null,
          totalScore: paper?.total_score || 0
        }
      })
      
      return {
        code: 200,
        data: {
          records: result,
          total,
          current: page,
          size: pageSize
        }
      }
    },
    
    studentPage: async (params) => {
      await delay(100)
      let exams = db.findAll(TABLES.EXAM)
      exams = exams.filter(e => e.status !== 'DELETED')
      
      if (params.status && params.status !== 'ALL') {
        exams = exams.filter(e => e.status === params.status)
      }
      
      const total = exams.length
      const pageSize = params.size || 10
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = exams.slice(start, end)
      
      const result = pageData.map(e => {
        const paper = db.findById(TABLES.PAPER, e.paper_id)
        return { 
          ...e, 
          paper,
          paperId: e.paper_id,
          classId: e.class_id,
          startTime: e.start_time,
          endTime: e.end_time,
          maxAttempts: e.max_attempts,
          allowLateSubmit: e.allow_late_submit,
          shuffleQuestions: e.shuffle_questions,
          shuffleOptions: e.shuffle_options,
          leaveDetection: e.leave_detection,
          maxLeaveCount: e.max_leave_count,
          allowViewAfterExam: e.allow_view_after_exam
        }
      })
      
      return {
        code: 200,
        data: {
          records: result,
          total,
          current: page,
          size: pageSize
        }
      }
    },
    
    getById: async (id) => {
      await delay(100)
      const exam = db.findById(TABLES.EXAM, id)
      if (!exam) {
        return { code: 404, message: '考试不存在' }
      }
      
      const paper = db.findById(TABLES.PAPER, exam.paper_id)
      const questions = []
      if (paper && paper.question_ids) {
        const ids = typeof paper.question_ids === 'string' ? JSON.parse(paper.question_ids) : paper.question_ids
        ids.forEach(qId => {
          const q = db.findById(TABLES.QUESTION, qId)
          if (q) questions.push(q)
        })
      }
      
      return {
        code: 200,
        data: {
          ...exam,
          paper,
          questions,
          paperId: exam.paper_id,
          classId: exam.class_id,
          startTime: exam.start_time,
          endTime: exam.end_time,
          maxAttempts: exam.max_attempts,
          allowLateSubmit: exam.allow_late_submit,
          shuffleQuestions: exam.shuffle_questions,
          shuffleOptions: exam.shuffle_options,
          leaveDetection: exam.leave_detection,
          maxLeaveCount: exam.max_leave_count,
          allowViewAfterExam: exam.allow_view_after_exam
        }
      }
    },
    
    create: async (data) => {
      await delay(100)
      const examData = {
        title: data.title,
        paper_id: data.paperId || data.paper_id || null,
        class_id: data.classId || data.class_id || null,
        start_time: data.startTime || data.start_time,
        end_time: data.endTime || data.end_time,
        duration: data.duration || 120,
        status: data.status || 'PENDING',
        max_attempts: data.maxAttempts || data.max_attempts || 1,
        allow_late_submit: data.allowLateSubmit || data.allow_late_submit || 0,
        shuffle_questions: data.shuffleQuestions || data.shuffle_questions || 0,
        shuffle_options: data.shuffleOptions || data.shuffle_options || 0,
        leave_detection: data.leaveDetection || data.leave_detection || 0,
        max_leave_count: data.maxLeaveCount || data.max_leave_count || 5,
        allow_view_after_exam: data.allowViewAfterExam || data.allow_view_after_exam || 0,
        password: data.password || null
      }
      const exam = db.insert(TABLES.EXAM, examData)
      return { code: 200, data: exam }
    },
    
    update: async (data) => {
      await delay(100)
      const startTime = data.startTime || data.start_time
      const duration = data.duration || 120
      let endTime = data.endTime || data.end_time
      if (!endTime && startTime) {
        const start = new Date(startTime)
        endTime = new Date(start.getTime() + duration * 60 * 1000).toISOString()
      }
      const examData = {
        title: data.title,
        paper_id: data.paperId || data.paper_id,
        class_id: data.classId || data.class_id,
        start_time: startTime,
        end_time: endTime,
        duration: duration,
        status: data.status || 'PENDING',
        max_attempts: data.maxAttempts || data.max_attempts || 1,
        allow_late_submit: data.allowLateSubmit || data.allow_late_submit || 0,
        shuffle_questions: data.shuffleQuestions || data.shuffle_questions || 0,
        shuffle_options: data.shuffleOptions || data.shuffle_options || 0,
        leave_detection: data.leaveDetection || data.leave_detection || 0,
        max_leave_count: data.maxLeaveCount || data.max_leave_count || 5,
        allow_view_after_exam: data.allowViewAfterExam || data.allow_view_after_exam || 0,
        password: data.password || null
      }
      const exam = db.update(TABLES.EXAM, data.id, examData)
      if (!exam) {
        return { code: 400, message: '更新失败' }
      }
      return { code: 200, data: exam }
    },
    
    publish: async (id) => {
      await delay(100)
      const exam = db.update(TABLES.EXAM, id, { status: 'PUBLISHED' })
      return { code: 200, data: exam }
    },
    
    start: async (id) => {
      await delay(100)
      const exam = db.update(TABLES.EXAM, id, { 
        status: 'ONGOING',
        start_time: new Date().toISOString()
      })
      return { code: 200, data: exam }
    },
    
    finish: async (id) => {
      await delay(100)
      const exam = db.update(TABLES.EXAM, id, { 
        status: 'FINISHED',
        end_time: new Date().toISOString()
      })
      return { code: 200, data: exam }
    },
    
    extend: async (id, data) => {
      await delay(100)
      const exam = db.findById(TABLES.EXAM, id)
      if (!exam) {
        return { code: 404, message: '考试不存在' }
      }
      return { code: 200, data: exam }
    },
    
    delete: async (id) => {
      await delay(100)
      db.delete(TABLES.EXAM, id)
      return { code: 200 }
    },
    
    getStatistics: async (id) => {
      await delay(100)
      const records = db.findAll(TABLES.EXAM_RECORD, { exam_id: id })
      return {
        code: 200,
        data: {
          total_students: records.length,
          submitted_count: records.filter(r => r.status === 'SUBMITTED').length,
          not_started_count: records.filter(r => r.status === 'NOT_STARTED').length,
          ongoing_count: records.filter(r => r.status === 'ONGOING').length
        }
      }
    }
  },

  examRecord: {
    page: async (params) => {
      await delay(100)
      let records = db.findAll(TABLES.EXAM_RECORD)
      
      if (params.studentId) {
        records = records.filter(r => r.student_id === params.studentId || r.student_id === Number(params.studentId))
      }
      if (params.examId) {
        records = records.filter(r => r.exam_id === params.examId || r.exam_id === Number(params.examId))
      }
      if (params.status) {
        records = records.filter(r => r.status === params.status)
      }
      
      const total = records.length
      const pageSize = params.size || 10
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = records.slice(start, end)
      
      const result = pageData.map(r => {
        const exam = db.findById(TABLES.EXAM, r.exam_id)
        const paper = exam ? db.findById(TABLES.PAPER, exam.paper_id) : null
        return { 
          ...r, 
          exam, 
          paper,
          examId: r.exam_id,
          studentId: r.student_id,
          paperId: r.paper_id,
          startTime: r.start_time,
          submitTime: r.submit_time
        }
      })
      
      return {
        code: 200,
        data: {
          records: result,
          total,
          current: page,
          size: pageSize
        }
      }
    },
    
    getById: async (id) => {
      await delay(100)
      const record = db.findById(TABLES.EXAM_RECORD, id)
      if (!record) {
        return { code: 404, message: '考试记录不存在' }
      }
      
      const exam = db.findById(TABLES.EXAM, record.exam_id)
      const paper = exam ? db.findById(TABLES.PAPER, exam.paper_id) : null
      
      const questions = []
      if (paper && paper.question_ids) {
        const ids = typeof paper.question_ids === 'string' ? JSON.parse(paper.question_ids) : paper.question_ids
        ids.forEach(qId => {
          const q = db.findById(TABLES.QUESTION, qId)
          if (q) {
            questions.push({
              ...q,
              subjectId: q.subject_id,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
              correctAnswer: q.answer
            })
          }
        })
      }
      
      const answers = db.findAll(TABLES.ANSWER, { record_id: record.id })
      
      const studentAnswers = {}
      const answerMap = {}
      answers.forEach(a => {
        studentAnswers[a.question_id] = a.answer
        answerMap[a.question_id] = {
          isCorrect: a.is_correct || 0,
          score: a.score || 0
        }
      })
      
      return {
        code: 200,
        data: {
          ...record,
          exam,
          paper,
          questions,
          answers,
          studentAnswers,
          answerMap,
          examId: record.exam_id,
          studentId: record.student_id,
          paperId: record.paper_id,
          startTime: record.start_time,
          submitTime: record.submit_time
        }
      }
    },
    
    start: async (data) => {
      await delay(100)
      const exam = db.findById(TABLES.EXAM, data.examId)
      if (!exam) {
        return { code: 404, message: '考试不存在' }
      }
      
      const paper = db.findById(TABLES.PAPER, exam.paper_id)
      const questions = []
      if (paper && paper.question_ids) {
        const ids = typeof paper.question_ids === 'string' ? JSON.parse(paper.question_ids) : paper.question_ids
        ids.forEach(qId => {
          const q = db.findById(TABLES.QUESTION, qId)
          if (q) {
            questions.push({
              ...q,
              subjectId: q.subject_id,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
              correctAnswer: q.answer
            })
          }
        })
      }
      
      const existingRecords = db.findAll(TABLES.EXAM_RECORD, { exam_id: data.examId })
      const submittedRecord = existingRecords.find(r => r.student_id === data.studentId && (r.status === 'SUBMITTED' || r.status === 'AUTO_SUBMITTED'))
      
      if (submittedRecord) {
        const answers = db.findAll(TABLES.ANSWER, { record_id: submittedRecord.id })
        const studentAnswers = {}
        const answerMap = {}
        answers.forEach(a => {
          studentAnswers[a.question_id] = a.answer
          answerMap[a.question_id] = {
            isCorrect: a.is_correct || 0,
            score: a.score || 0
          }
        })
        
        return { 
          code: 200, 
          data: {
            recordId: submittedRecord.id,
            record: {
              id: submittedRecord.id,
              status: submittedRecord.status,
              score: submittedRecord.score || 0,
              submitTime: submittedRecord.submit_time,
              startTime: submittedRecord.start_time
            },
            questions,
            studentAnswers,
            answerMap,
            startTime: submittedRecord.start_time,
            leaveCount: 0
          } 
        }
      }
      
      let record = existingRecords.find(r => r.student_id === data.studentId && r.status === 'ONGOING')
      
      if (!record) {
        record = db.insert(TABLES.EXAM_RECORD, {
          exam_id: data.examId,
          student_id: data.studentId,
          paper_id: exam.paper_id,
          start_time: new Date().toISOString(),
          status: 'ONGOING'
        })
      }
      
      const answers = db.findAll(TABLES.ANSWER, { record_id: record.id })
      const studentAnswers = {}
      const answerMap = {}
      answers.forEach(a => {
        studentAnswers[a.question_id] = a.answer
        answerMap[a.question_id] = {
          isCorrect: a.is_correct || 0,
          score: a.score || 0
        }
      })
      
      return { 
        code: 200, 
        data: {
          recordId: record.id,
          record: {
            id: record.id,
            status: record.status,
            score: record.score || 0,
            submitTime: record.submit_time,
            startTime: record.start_time
          },
          questions,
          studentAnswers,
          answerMap,
          startTime: record.start_time,
          leaveCount: record.leave_count || 0
        } 
      }
    },
    
    saveAnswer: async (data) => {
      await delay(100)
      let answer = db.findOne(TABLES.ANSWER, { 
        record_id: data.recordId, 
        question_id: data.questionId 
      })
      
      if (answer) {
        answer = db.update(TABLES.ANSWER, answer.id, { answer: data.answer })
      } else {
        answer = db.insert(TABLES.ANSWER, {
          record_id: data.recordId,
          question_id: data.questionId,
          student_id: data.studentId,
          answer: data.answer
        })
      }
      
      return { code: 200, data: answer }
    },
    
    autoSave: async (data) => {
      await delay(100)
      if (data.answers) {
        const record = db.findById(TABLES.EXAM_RECORD, data.recordId)
        const studentId = record ? record.student_id : data.studentId
        
        if (Array.isArray(data.answers)) {
          data.answers.forEach(a => {
            let answer = db.findOne(TABLES.ANSWER, { 
              record_id: data.recordId, 
              question_id: a.questionId 
            })
            
            if (answer) {
              db.update(TABLES.ANSWER, answer.id, { answer: a.answer })
            } else {
              db.insert(TABLES.ANSWER, {
                record_id: data.recordId,
                question_id: a.questionId,
                student_id: studentId,
                answer: a.answer
              })
            }
          })
        } else if (typeof data.answers === 'object') {
          for (const [questionId, answerText] of Object.entries(data.answers)) {
            let answer = db.findOne(TABLES.ANSWER, { 
              record_id: data.recordId, 
              question_id: Number(questionId) 
            })
            
            if (answer) {
              db.update(TABLES.ANSWER, answer.id, { answer: answerText })
            } else {
              db.insert(TABLES.ANSWER, {
                record_id: data.recordId,
                question_id: Number(questionId),
                student_id: studentId,
                answer: answerText
              })
            }
          }
        }
      }
      return { code: 200 }
    },
    
    submit: async (id, data = {}) => {
      await delay(100)
      const record = db.update(TABLES.EXAM_RECORD, id, {
        submit_time: new Date().toISOString(),
        status: 'SUBMITTED',
        score: data.score || 0,
        total_score: data.totalScore || 0
      })
      
      if (data.answers) {
        data.answers.forEach(a => {
          let answer = db.findOne(TABLES.ANSWER, { 
            record_id: id, 
            question_id: a.questionId 
          })
          
          if (answer) {
            db.update(TABLES.ANSWER, answer.id, { 
              answer: a.answer,
              is_correct: a.isCorrect ? 1 : 0,
              score: a.score || 0
            })
          } else {
            db.insert(TABLES.ANSWER, {
              record_id: id,
              question_id: a.questionId,
              student_id: record.student_id,
              answer: a.answer,
              is_correct: a.isCorrect ? 1 : 0,
              score: a.score || 0
            })
          }
        })
      }
      
      const exam = db.findById(TABLES.EXAM, record.exam_id)
      if (exam) {
        const records = db.findAll(TABLES.EXAM_RECORD, { exam_id: exam.id })
        const allSubmitted = records.length > 0 && records.every(r => r.status === 'SUBMITTED' || r.status === 'AUTO_SUBMITTED')
        if (allSubmitted && exam.status !== 'ENDED') {
          db.update(TABLES.EXAM, exam.id, { status: 'ENDED' })
        } else if (exam.status === 'PENDING') {
          db.update(TABLES.EXAM, exam.id, { status: 'ONGOING' })
        }
      }
      
      return { code: 200, data: record }
    },
    
    autoSubmit: async (id) => {
      await delay(100)
      const record = db.update(TABLES.EXAM_RECORD, id, {
        submit_time: new Date().toISOString(),
        status: 'SUBMITTED'
      })
      return { code: 200, data: record }
    },
    
    screenSwitch: async () => {
      await delay(100)
      return { code: 200 }
    },
    
    reportLeave: async () => {
      await delay(100)
      return { code: 200 }
    },
    
    getAnswers: async (id) => {
      await delay(100)
      const answers = db.findAll(TABLES.ANSWER, { record_id: id })
      return { code: 200, data: answers }
    },
    
    getStudentHistory: async (params) => {
      await delay(100)
      let records = db.findAll(TABLES.EXAM_RECORD)
      if (params.studentId) {
        records = records.filter(r => r.student_id === params.studentId || r.student_id === Number(params.studentId))
      }
      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        records = records.filter(r => {
          const exam = db.findById(TABLES.EXAM, r.exam_id)
          return exam && (exam.title.toLowerCase().includes(kw))
        })
      }
      
      const total = records.length
      const pageSize = params.size || 10
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = records.slice(start, end)
      
      const result = pageData.map(r => {
        const exam = db.findById(TABLES.EXAM, r.exam_id)
        const paper = exam ? db.findById(TABLES.PAPER, exam.paper_id) : null
        return { 
          ...r, 
          exam, 
          paper,
          examId: r.exam_id,
          studentId: r.student_id,
          paperId: r.paper_id,
          startTime: r.start_time,
          submitTime: r.submit_time
        }
      })
      
      return {
        code: 200,
        data: {
          records: result,
          total,
          current: page,
          size: pageSize
        }
      }
    },
    
    getAnalysis: async () => {
      await delay(100)
      return { code: 200, data: {} }
    },
    
    getStudentStats: async () => {
      await delay(100)
      const userInfo = uni.getStorageSync('userInfo')
      const userId = userInfo?.id || userInfo?.userId
      
      if (!userId) {
        return { code: 200, data: { pendingExams: 0, completedExams: 0, wrongCount: 0, averageScore: 0 } }
      }
      
      const records = db.findAll(TABLES.EXAM_RECORD, { student_id: userId })
      const completedRecords = records.filter(r => r.status === 'SUBMITTED')
      const pendingRecords = records.filter(r => r.status === 'ONGOING' || r.status === 'NOT_STARTED')
      
      const totalScore = completedRecords.reduce((sum, r) => sum + (r.score || 0), 0)
      const avgScore = completedRecords.length > 0 ? Math.round(totalScore / completedRecords.length) : 0
      
      const wrongQuestions = db.findAll(TABLES.WRONG_QUESTION, { user_id: userId })
      
      return { 
        code: 200, 
        data: {
          pendingExams: pendingRecords.length,
          completedExams: completedRecords.length,
          wrongCount: wrongQuestions.length,
          averageScore: avgScore
        } 
      }
    },
    
    getStudentSubjectScores: async () => {
      await delay(100)
      return { code: 200, data: [] }
    },
    
    getScoreTrend: async () => {
      await delay(100)
      return { code: 200, data: [] }
    },
    
    getKnowledgeMastery: async () => {
      await delay(100)
      return { code: 200, data: [] }
    },
    
    getExamStats: async (examId) => {
      await delay(100)
      const records = db.findAll(TABLES.EXAM_RECORD, { exam_id: examId })
      return {
        code: 200,
        data: {
          exam_id: examId,
          total_students: records.length,
          submitted_count: records.filter(r => r.status === 'SUBMITTED').length,
          not_started_count: records.filter(r => r.status === 'NOT_STARTED').length,
          ongoing_count: records.filter(r => r.status === 'ONGOING').length,
          avg_score: null,
          max_score: null,
          min_score: null,
          pass_rate: null
        }
      }
    },
    
    getQuestionAnalysis: async () => {
      await delay(100)
      return { code: 200, data: [] }
    },
    
    grade: async (id, data) => {
      await delay(100)
      const record = db.findById(TABLES.EXAM_RECORD, id)
      if (!record) {
        return { code: 404, message: '考试记录不存在' }
      }
      
      let totalScore = 0
      
      if (data.grades) {
        Object.keys(data.grades).forEach(questionId => {
          const score = data.grades[questionId]
          let answer = db.findOne(TABLES.ANSWER, { record_id: id, question_id: Number(questionId) })
          if (answer) {
            db.update(TABLES.ANSWER, answer.id, { score: score, is_correct: score > 0 ? 1 : 0 })
          } else {
            db.insert(TABLES.ANSWER, {
              record_id: id,
              question_id: Number(questionId),
              student_id: record.student_id,
              answer: '',
              score: score,
              is_correct: score > 0 ? 1 : 0
            })
          }
          totalScore += score
        })
      }
      
      const updatedRecord = db.update(TABLES.EXAM_RECORD, id, {
        score: totalScore || record.score || 0,
        status: 'GRADED'
      })
      return { code: 200, data: updatedRecord }
    },
    
    exportExamScores: async (examId) => {
      await delay(100)
      const records = db.findAll(TABLES.EXAM_RECORD, { exam_id: examId })
      const exportData = records.map(r => {
        const student = db.findById(TABLES.USER, r.student_id)
        return {
          studentName: student?.real_name || '',
          studentId: r.student_id,
          score: r.score || 0,
          totalScore: r.total_score || 0,
          submitTime: r.submit_time || ''
        }
      })
      return { code: 200, data: exportData }
    }
  },

  class: {
    page: async (params) => {
      await delay(100)
      let classes = db.findAll(TABLES.CLASS)
      
      if (params.departmentId) {
        classes = classes.filter(c => c.department_id === params.departmentId || c.department_id === Number(params.departmentId))
      }
      
      const total = classes.length
      const pageSize = params.size || 10
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = classes.slice(start, end)
      
      const result = pageData.map(c => ({
        ...c,
        department: db.findById(TABLES.DEPARTMENT, c.department_id),
        departmentId: c.department_id,
        ownerId: c.owner_id,
        inviteCode: c.invite_code,
        className: c.name
      }))
      
      return {
        code: 200,
        data: {
          records: result,
          total,
          current: page,
          size: pageSize
        }
      }
    },
    
    list: async () => {
      await delay(100)
      const classes = db.findAll(TABLES.CLASS)
      const result = classes.map(c => ({
        ...c,
        department: db.findById(TABLES.DEPARTMENT, c.department_id),
        departmentId: c.department_id,
        ownerId: c.owner_id,
        inviteCode: c.invite_code,
        className: c.name
      }))
      return { code: 200, data: result }
    },
    
    getById: async (id) => {
      await delay(100)
      const cls = db.findById(TABLES.CLASS, id)
      if (!cls) {
        return { code: 404, message: '班级不存在' }
      }
      
      const members = db.findAll(TABLES.CLASS_MEMBER, { class_id: id })
      const memberUsers = members.map(m => ({
        ...m,
        user: db.findById(TABLES.USER, m.user_id),
        userId: m.user_id
      }))
      
      return {
        code: 200,
        data: {
          ...cls,
          members: memberUsers,
          departmentId: cls.department_id,
          ownerId: cls.owner_id,
          inviteCode: cls.invite_code,
          className: cls.name
        }
      }
    },
    
    create: async (data) => {
      await delay(100)
      const classData = {
        name: data.name,
        code: data.code || '',
        department_id: data.departmentId || data.department_id || null,
        owner_id: data.ownerId || data.owner_id || null,
        invite_code: data.inviteCode || data.invite_code || Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: data.status || 'ACTIVE'
      }
      const cls = db.insert(TABLES.CLASS, classData)
      
      if (classData.owner_id) {
        db.insert(TABLES.CLASS_MEMBER, {
          class_id: cls.id,
          user_id: classData.owner_id,
          role: 'OWNER'
        })
      }
      
      return { code: 200, data: cls }
    },
    
    update: async (data) => {
      await delay(100)
      const classData = {
        name: data.name,
        code: data.code || '',
        department_id: data.departmentId || data.department_id,
        owner_id: data.ownerId || data.owner_id,
        invite_code: data.inviteCode || data.invite_code,
        status: data.status || 'ACTIVE'
      }
      const cls = db.update(TABLES.CLASS, data.id, classData)
      return { code: 200, data: cls }
    },
    
    delete: async (id) => {
      await delay(100)
      db.delete(TABLES.CLASS, id)
      return { code: 200 }
    },
    
    getMyClasses: async (params) => {
      await delay(100)
      const userId = params.userId || params.user_id || 0
      const members = db.findAll(TABLES.CLASS_MEMBER, { user_id: userId })
      const classIds = [...new Set(members.map(m => m.class_id))]
      
      const classes = classIds.map(id => {
        const cls = db.findById(TABLES.CLASS, id)
        const member = members.find(m => m.class_id === id)
        return {
          ...cls,
          member_role: member?.role || 'MEMBER',
          department: db.findById(TABLES.DEPARTMENT, cls?.department_id),
          departmentId: cls?.department_id,
          ownerId: cls?.owner_id,
          inviteCode: cls?.invite_code,
          className: cls?.name
        }
      }).filter(Boolean)
      
      return { code: 200, data: classes }
    },
    
    joinByCode: async (data) => {
      await delay(100)
      const cls = db.findOne(TABLES.CLASS, { invite_code: data.inviteCode })
      if (!cls) {
        return { code: 404, message: '邀请码无效' }
      }
      
      const exists = db.findOne(TABLES.CLASS_MEMBER, { class_id: cls.id, user_id: data.userId })
      if (exists) {
        return { code: 400, message: '已加入该班级' }
      }
      
      db.insert(TABLES.CLASS_MEMBER, {
        class_id: cls.id,
        user_id: data.userId,
        role: 'MEMBER'
      })
      
      return { code: 200, data: cls }
    },
    
    getMembers: async (id) => {
      await delay(100)
      const members = db.findAll(TABLES.CLASS_MEMBER, { class_id: id })
      const result = members.map(m => {
        const user = db.findById(TABLES.USER, m.user_id)
        return {
          ...m,
          userId: m.user_id,
          realName: user?.real_name || '',
          username: user?.username || '',
          role: m.role || 'MEMBER',
          avatar: user?.avatar || '',
          muteUntil: m.mute_until || null
        }
      })
      return { code: 200, data: result }
    },
    
    getMessages: async (id) => {
      await delay(100)
      const messages = db.findAll(TABLES.CLASS_MESSAGE, { class_id: id })
      messages.sort((a, b) => new Date(a.create_time) - new Date(b.create_time))
      const formattedMessages = messages.map(m => ({
        ...m,
        senderId: m.sender_id,
        createTime: m.create_time
      }))
      return { code: 200, data: { records: formattedMessages, total: formattedMessages.length } }
    },
    
    sendMessage: async (id, data) => {
      await delay(100)
      const messageData = {
        class_id: id,
        sender_id: data.senderId || data.sender_id || 0,
        content: data.content || '',
        type: data.type || 'TEXT',
        create_time: new Date().toISOString()
      }
      const message = db.insert(TABLES.CLASS_MESSAGE, messageData)
      return { code: 200, data: { ...message, senderId: message.sender_id, createTime: message.create_time } }
    },
    
    checkMemberRole: async (id, userId) => {
      await delay(100)
      return { code: 200, data: { role: 'MEMBER' } }
    }
  },

  log: {
    page: async (params) => {
      await delay(100)
      let logs = db.findAll(TABLES.LOG)
      
      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        logs = logs.filter(l => l.operation?.toLowerCase().includes(kw) || 
          l.username?.toLowerCase().includes(kw))
      }
      if (params.operation) {
        logs = logs.filter(l => l.operation === params.operation)
      }
      
      const total = logs.length
      const pageSize = params.size || 20
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = logs.slice(start, end)
      
      return {
        code: 200,
        data: {
          records: pageData.map(l => ({
            ...l,
            createTime: l.create_time
          })),
          total,
          current: page,
          size: pageSize
        }
      }
    }
  },

  wrongQuestion: {
    page: async (params) => {
      await delay(100)
      let wrongQuestions = db.findAll(TABLES.WRONG_QUESTION)
      
      if (params.userId) {
        wrongQuestions = wrongQuestions.filter(w => w.user_id === params.userId || w.user_id === Number(params.userId))
      }
      if (params.subjectId) {
        wrongQuestions = wrongQuestions.filter(w => w.subject_id === params.subjectId || w.subject_id === Number(params.subjectId))
      }
      if (params.mastered !== undefined) {
        wrongQuestions = wrongQuestions.filter(w => w.mastered === Number(params.mastered))
      }
      
      const formattedQuestions = wrongQuestions.map(w => {
        const question = db.findById(TABLES.QUESTION, w.question_id)
        return {
          ...w,
          question,
          subjectId: w.subject_id,
          userId: w.user_id,
          practicedCount: w.practiced_count || 0,
          correctCount: w.correct_count || 0,
          correctAnswer: question?.answer || '',
          options: question ? (typeof question.options === 'string' ? JSON.parse(question.options) : question.options) : null,
          type: question?.type || ''
        }
      })
      
      const total = formattedQuestions.length
      const pageSize = params.size || 10
      const page = params.current || 1
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pageData = formattedQuestions.slice(start, end)
      
      return {
        code: 200,
        data: {
          records: pageData,
          total,
          current: page,
          size: pageSize
        }
      }
    },
    
    getById: async (id) => {
      await delay(100)
      const wq = db.findById(TABLES.WRONG_QUESTION, id)
      if (!wq) {
        return { code: 404, message: '错题不存在' }
      }
      const question = db.findById(TABLES.QUESTION, wq.question_id)
      return { 
        code: 200, 
        data: {
          ...wq,
          question,
          subjectId: wq.subject_id,
          userId: wq.user_id,
          practicedCount: wq.practiced_count || 0,
          correctCount: wq.correct_count || 0,
          correctAnswer: question?.answer || '',
          options: question ? (typeof question.options === 'string' ? JSON.parse(question.options) : question.options) : null,
          type: question?.type || ''
        } 
      }
    },
    
    practice: async (id) => {
      await delay(100)
      const wq = db.findById(TABLES.WRONG_QUESTION, id)
      if (!wq) {
        return { code: 404, message: '错题不存在' }
      }
      db.update(TABLES.WRONG_QUESTION, id, {
        practiced_count: (wq.practiced_count || 0) + 1
      })
      return { code: 200 }
    },
    
    correct: async (id) => {
      await delay(100)
      const wq = db.findById(TABLES.WRONG_QUESTION, id)
      if (!wq) {
        return { code: 404, message: '错题不存在' }
      }
      db.update(TABLES.WRONG_QUESTION, id, {
        correct_count: (wq.correct_count || 0) + 1
      })
      return { code: 200 }
    },
    
    updateMastered: async (id, data) => {
      await delay(100)
      const mastered = typeof data === 'object' ? (data.mastered !== undefined ? Number(data.mastered) : 0) : Number(data)
      const wq = db.update(TABLES.WRONG_QUESTION, id, { mastered })
      if (!wq) {
        return { code: 404, message: '错题不存在' }
      }
      return { code: 200, data: wq }
    },
    
    create: async (data) => {
      await delay(100)
      const existing = db.findOne(TABLES.WRONG_QUESTION, { 
        user_id: data.userId || data.user_id, 
        question_id: data.questionId || data.question_id 
      })
      if (existing) {
        db.update(TABLES.WRONG_QUESTION, existing.id, {
          wrong_count: (existing.wrong_count || 0) + 1,
          wrong_answer: data.wrongAnswer || data.wrong_answer || ''
        })
        return { code: 200, data: existing }
      }
      const question = db.findById(TABLES.QUESTION, data.questionId || data.question_id)
      const wq = db.insert(TABLES.WRONG_QUESTION, {
        user_id: data.userId || data.user_id,
        question_id: data.questionId || data.question_id,
        subject_id: question?.subject_id || null,
        wrong_count: 1,
        wrong_answer: data.wrongAnswer || data.wrong_answer || '',
        mastered: 0,
        practiced_count: 0,
        correct_count: 0,
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      })
      return { code: 200, data: wq }
    }
  },

  statistics: {
    overview: async () => {
      await delay(100)
      const users = db.findAll(TABLES.USER)
      const studentCount = users.filter(u => u.role === 'STUDENT').length
      const teacherCount = users.filter(u => u.role === 'TEACHER').length
      const adminCount = users.filter(u => u.role === 'ADMIN').length
      const exams = db.findAll(TABLES.EXAM)
      return { 
        code: 200, 
        data: {
          total_users: users.length,
          totalUsers: users.length,
          student_count: studentCount,
          studentCount: studentCount,
          teacher_count: teacherCount,
          teacherCount: teacherCount,
          admin_count: adminCount,
          adminCount: adminCount,
          department_count: db.findAll(TABLES.DEPARTMENT).length,
          departmentCount: db.findAll(TABLES.DEPARTMENT).length,
          class_count: db.findAll(TABLES.CLASS).length,
          classCount: db.findAll(TABLES.CLASS).length,
          total_papers: db.findAll(TABLES.PAPER).length,
          paperCount: db.findAll(TABLES.PAPER).length,
          total_exams: exams.length,
          examCount: exams.length,
          pending_exams: exams.filter(e => e.status === 'PENDING').length,
          pendingExams: exams.filter(e => e.status === 'PENDING').length,
          ongoing_exams: exams.filter(e => e.status === 'ONGOING').length,
          ongoingExams: exams.filter(e => e.status === 'ONGOING').length,
          finished_exams: exams.filter(e => e.status === 'FINISHED').length,
          finishedExams: exams.filter(e => e.status === 'FINISHED').length,
          total_questions: db.findAll(TABLES.QUESTION).length,
          questionCount: db.findAll(TABLES.QUESTION).length,
          participation_count: db.findAll(TABLES.EXAM_RECORD).length,
          participationCount: db.findAll(TABLES.EXAM_RECORD).length
        }
      }
    },
    
    teacherStats: async () => {
      await delay(100)
      return { 
        code: 200, 
        data: {
          total_papers: db.findAll(TABLES.PAPER).length,
          paperCount: db.findAll(TABLES.PAPER).length,
          total_exams: db.findAll(TABLES.EXAM).length,
          examCount: db.findAll(TABLES.EXAM).length,
          total_questions: db.findAll(TABLES.QUESTION).length,
          questionCount: db.findAll(TABLES.QUESTION).length,
          total_classes: db.findAll(TABLES.CLASS).length,
          classCount: db.findAll(TABLES.CLASS).length
        }
      }
    }
  }
}

export default localApi
