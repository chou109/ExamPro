/**
 * UniApp请求封装
 * 优先使用本地API，实现完全离线运行
 */

import localApi from './local-api'

const USE_LOCAL_API = true

const PUBLIC_PATHS = ['/auth/login', '/auth/register']

const apiRoutes = {
  'POST /auth/login': 'auth.login',
  'POST /auth/register': 'auth.register',
  'GET /auth/info': 'auth.getUserInfo',
  'POST /auth/changePassword': 'auth.changePassword',
  
  'GET /users/page': 'user.page',
  'GET /users/:id': 'user.getById',
  'POST /users': 'user.create',
  'PUT /users': 'user.update',
  'DELETE /users/:id': 'user.delete',
  'GET /users/students': 'user.getStudents',
  'GET /users/teachers': 'user.getTeachers',
  'PUT /users/:id/status': 'user.changeStatus',
  
  'GET /departments/tree': 'department.tree',
  'GET /departments': 'department.list',
  'GET /departments/:id': 'department.getById',
  'POST /departments': 'department.create',
  'PUT /departments': 'department.update',
  'DELETE /departments/:id': 'department.delete',
  
  'GET /classes/page': 'class.page',
  'GET /classes': 'class.list',
  'GET /classes/:id': 'class.getById',
  'POST /classes': 'class.create',
  'POST /class/create': 'class.create',
  'PUT /classes': 'class.update',
  'DELETE /classes/:id': 'class.delete',
  'GET /class/my-classes': 'class.getMyClasses',
  'POST /class/join-by-code': 'class.joinByCode',
  'GET /class/:id/members': 'class.getMembers',
  'GET /class/:id/messages': 'class.getMessages',
  'POST /class/:id/message': 'class.sendMessage',
  'GET /class/:id/member/:userId/check': 'class.checkMemberRole',
  
  'GET /logs/page': 'log.page',
  
  'GET /subjects/page': 'subject.page',
  'GET /subjects': 'subject.list',
  'GET /subjects/:id': 'subject.getById',
  'POST /subjects': 'subject.create',
  'PUT /subjects': 'subject.update',
  'DELETE /subjects/:id': 'subject.delete',
  
  'GET /knowledge-points': 'knowledgePoint.list',
  'GET /knowledge-points/tree': 'knowledgePoint.tree',
  'GET /knowledge-points/:id': 'knowledgePoint.getById',
  'POST /knowledge-points': 'knowledgePoint.create',
  'PUT /knowledge-points': 'knowledgePoint.update',
  'DELETE /knowledge-points/:id': 'knowledgePoint.delete',
  
  'GET /questions/page': 'question.page',
  'GET /questions/list': 'question.list',
  'GET /questions/:id': 'question.getById',
  'POST /questions': 'question.create',
  'PUT /questions': 'question.update',
  'DELETE /questions/:id': 'question.delete',
  'GET /questions/:id/correct-rate': 'question.getCorrectRate',
  'POST /questions/generate-paper': 'question.generatePaper',
  'POST /questions/import': 'question.import',
  
  'GET /papers/page': 'paper.page',
  'GET /papers/:id': 'paper.getById',
  'GET /papers/:id/questions': 'paper.getQuestions',
  'POST /papers': 'paper.create',
  'PUT /papers': 'paper.update',
  'PUT /papers/:id/publish': 'paper.publish',
  'DELETE /papers/:id': 'paper.delete',
  
  'GET /exams/page': 'exam.page',
  'GET /exams/student/page': 'exam.studentPage',
  'GET /exams/:id': 'exam.getById',
  'POST /exams': 'exam.create',
  'PUT /exams': 'exam.update',
  'PUT /exams/:id/publish': 'exam.publish',
  'PUT /exams/:id/start': 'exam.start',
  'PUT /exams/:id/finish': 'exam.finish',
  'PUT /exams/:id/extend': 'exam.extend',
  'DELETE /exams/:id': 'exam.delete',
  'GET /exams/:id/statistics': 'exam.getStatistics',
  
  'GET /exam-records/page': 'examRecord.page',
  'GET /exam-records/:id': 'examRecord.getById',
  'POST /exam-records/start': 'examRecord.start',
  'POST /exam-records/answer': 'examRecord.saveAnswer',
  'POST /exam-records/auto-save': 'examRecord.autoSave',
  'POST /exam-records/submit/:id': 'examRecord.submit',
  'POST /exam-records/auto-submit/:id': 'examRecord.autoSubmit',
  'POST /exam-records/screen-switch': 'examRecord.screenSwitch',
  'POST /exam-records/report-leave': 'examRecord.reportLeave',
  'GET /exam-records/:id/answers': 'examRecord.getAnswers',
  'GET /exam-records/student/history': 'examRecord.getStudentHistory',
  'GET /exam-records/analysis': 'examRecord.getAnalysis',
  'GET /exam-records/student/stats': 'examRecord.getStudentStats',
  'GET /exam-records/student/subject-scores': 'examRecord.getStudentSubjectScores',
  'GET /exam-records/student/score-trend': 'examRecord.getScoreTrend',
  'GET /exam-records/student/knowledge-mastery': 'examRecord.getKnowledgeMastery',
  'GET /exam-records/teacher/exam-stats/:examId': 'examRecord.getExamStats',
  'GET /exam-records/teacher/question-analysis/:examId': 'examRecord.getQuestionAnalysis',
  'GET /exam-records/teacher/export/:examId': 'examRecord.exportExamScores',
  'PUT /exam-records/:id/grade': 'examRecord.grade',
  
  'GET /wrong-questions/page': 'wrongQuestion.page',
  'GET /wrong-questions/:id': 'wrongQuestion.getById',
  'POST /wrong-questions/:id/practice': 'wrongQuestion.practice',
  'POST /wrong-questions/:id/correct': 'wrongQuestion.correct',
  'PUT /wrong-questions/:id/mastered': 'wrongQuestion.updateMastered',
  
  'GET /statistics/overview': 'statistics.overview',
  'GET /statistics/teacher/stats': 'statistics.teacherStats'
}

function getLocalApiMethod(method, url) {
  const cleanUrl = url.split('?')[0]
  const key = `${method.toUpperCase()} ${cleanUrl}`
  if (apiRoutes[key]) {
    return apiRoutes[key]
  }
  
  const patternKey = Object.keys(apiRoutes).find(k => {
    const [routeMethod, routePath] = k.split(' ')
    if (routeMethod !== method.toUpperCase()) return false
    
    const routeParts = routePath.split('/')
    const urlParts = cleanUrl.split('/')
    
    if (routeParts.length !== urlParts.length) return false
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) continue
      if (routeParts[i] !== urlParts[i]) return false
    }
    
    return true
  })
  
  return patternKey ? { method: apiRoutes[patternKey], pattern: patternKey } : null
}

function parseUrlParams(url, pattern) {
  const cleanUrl = url.split('?')[0]
  const params = {}
  const [, routePath] = pattern.split(' ')
  const routeParts = routePath.split('/')
  const urlParts = cleanUrl.split('/')
  
  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(':')) {
      const paramName = routeParts[i].substring(1)
      params[paramName] = isNaN(urlParts[i]) ? urlParts[i] : parseInt(urlParts[i])
    }
  }
  
  const queryString = url.split('?')[1]
  if (queryString) {
    queryString.split('&').forEach(pair => {
      const [key, value] = pair.split('=')
      params[key] = isNaN(value) ? value : parseInt(value)
    })
  }
  
  return params
}

const request = async (options) => {
  const { url, method = 'GET', data = {}, params = {} } = options
  
  if (USE_LOCAL_API) {
    const apiMatch = getLocalApiMethod(method, url)
    if (apiMatch) {
      const apiMethod = typeof apiMatch === 'string' ? apiMatch : apiMatch.method
      const pattern = typeof apiMatch === 'string' ? `${method.toUpperCase()} ${url}` : apiMatch.pattern
      const [module, fn] = apiMethod.split('.')
      const urlParams = typeof apiMatch === 'string' ? parseUrlParams(url, pattern) : parseUrlParams(url, pattern)
      
      const args = []
      const routePath = pattern.split(' ')[1]
      const routeParts = routePath.split('/')
      routeParts.forEach(part => {
        if (part.startsWith(':')) {
          const paramName = part.substring(1)
          if (urlParams[paramName] !== undefined) {
            args.push(urlParams[paramName])
          }
        }
      })
      
      const queryParams = { ...params, ...data }
      const cleanUrl = url.split('?')[0]
      if (url !== cleanUrl) {
        const queryString = url.split('?')[1]
        if (queryString) {
          queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=')
            queryParams[key] = isNaN(value) ? value : parseInt(value)
          })
        }
      }
      if (Object.keys(queryParams).length > 0) args.push(queryParams)
      
      const token = uni.getStorageSync('token')
      if (apiMethod === 'auth.getUserInfo') {
        args.unshift(token)
      }
      
      try {
        const result = await localApi[module][fn](...args)
        return result
      } catch (e) {
        console.error('Local API error:', e)
        return { code: 500, message: e.message }
      }
    }
  }
  
  const BASE_URL = 'http://localhost:8081/api'
  
  const skipAuth = options.skipAuth || PUBLIC_PATHS.includes(url)
  
  const header = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  }
  
  if (!skipAuth) {
    const token = uni.getStorageSync('token')
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
  }
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header,
      timeout: options.timeout || 60000,
      success: (response) => {
        if (response.statusCode === 200) {
          resolve(response.data)
        } else {
          reject(response)
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

export const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    params: data,
    ...options
  })
}

export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

export const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

export const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

export const upload = (url, filePath, formData = {}) => {
  if (USE_LOCAL_API) {
    const timestamp = Date.now()
    const fakeUrl = `/uploads/avatar/${timestamp}.png`
    return Promise.resolve({ code: 200, message: '上传成功', data: fakeUrl })
  }
  
  const BASE_URL = 'http://localhost:8081/api'
  const token = uni.getStorageSync('token')

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + url,
      filePath,
      name: 'file',
      formData,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (response) => {
        if (response.statusCode === 200) {
          try {
            const data = JSON.parse(response.data)
            resolve(data)
          } catch (e) {
            resolve(response.data)
          }
        } else {
          reject(response)
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

export default request
