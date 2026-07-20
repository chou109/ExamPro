<template>
  <div class="dashboard">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>{{ userStore.t('dashboard.welcome') }}, {{ displayName }}</h2>
      <p>{{ roleText }} - {{ currentDate }}</p>
    </div>

    <!-- 统计卡片 - 三端共用 -->
    <div class="stats-container">
      <!-- 管理员统计 -->
      <template v-if="userInfo.role === 'ADMIN'">
        <div class="stat-card admin-stat cursor-pointer" @click="goToUsers()">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.totalUsers }}</p>
            <p class="stat-label">{{ userStore.t('dashboard.totalUsers') }}</p>
          </div>
        </div>
        <div class="stat-card admin-stat cursor-pointer" @click="goToUsers('STUDENT')">
          <div class="stat-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.studentCount }}</p>
            <p class="stat-label">{{ userStore.t('common.student') }} {{ userStore.t('dashboard.count') }}</p>
          </div>
        </div>
        <div class="stat-card admin-stat cursor-pointer" @click="goToUsers('TEACHER')">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.teacherCount }}</p>
            <p class="stat-label">{{ userStore.t('common.teacher') }} {{ userStore.t('dashboard.count') }}</p>
          </div>
        </div>
        <div class="stat-card admin-stat cursor-pointer" @click="goToDepartments()">
          <div class="stat-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.departmentCount }}</p>
            <p class="stat-label">{{ userStore.t('dashboard.departmentCount') }}</p>
          </div>
        </div>
      </template>

      <!-- 教师统计 -->
      <template v-else-if="userInfo.role === 'TEACHER'">
        <div class="stat-card teacher-stat" @click="goToClasses">
          <div class="stat-icon">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.classCount }}</p>
            <p class="stat-label">{{ userStore.t('dashboard.classCount') }}</p>
          </div>
          <div class="stat-arrow"><el-icon><ArrowRight /></el-icon></div>
        </div>
        <div class="stat-card teacher-stat" @click="goToPapers">
          <div class="stat-icon">
            <el-icon><Ticket /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.paperCount }}</p>
            <p class="stat-label">{{ userStore.t('dashboard.paperCount') }}</p>
          </div>
          <div class="stat-arrow"><el-icon><ArrowRight /></el-icon></div>
        </div>
        <div class="stat-card teacher-stat" @click="goToQuestions">
          <div class="stat-icon">
            <el-icon><Edit /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.questionCount }}</p>
            <p class="stat-label">{{ userStore.t('dashboard.questionCount') }}</p>
          </div>
          <div class="stat-arrow"><el-icon><ArrowRight /></el-icon></div>
        </div>
        <div class="stat-card teacher-stat" @click="goToExams">
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.examCount }}</p>
            <p class="stat-label">{{ userStore.t('dashboard.examCount') }}</p>
          </div>
          <div class="stat-arrow"><el-icon><ArrowRight /></el-icon></div>
        </div>
      </template>

      <!-- 学生统计 -->
      <template v-else-if="userInfo.role === 'STUDENT'">
        <div class="stat-card student-stat cursor-pointer" @click="goToExamList">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.pendingExams }}</p>
            <p class="stat-label">{{ userStore.t('dashboard.pendingExams') }}</p>
          </div>
          <div class="stat-arrow"><el-icon><ArrowRight /></el-icon></div>
        </div>
        <div class="stat-card student-stat cursor-pointer" @click="goToHistory">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.completedExams }}</p>
            <p class="stat-label">{{ userStore.t('dashboard.completedExams') }}</p>
          </div>
          <div class="stat-arrow"><el-icon><ArrowRight /></el-icon></div>
        </div>
        <div class="stat-card student-stat cursor-pointer" @click="goToWrongQuestions">
          <div class="stat-icon">
            <el-icon><CircleClose /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.wrongCount }}</p>
            <p class="stat-label">{{ userStore.t('dashboard.wrongCount') }}</p>
          </div>
          <div class="stat-arrow"><el-icon><ArrowRight /></el-icon></div>
        </div>
        <div class="stat-card student-stat cursor-pointer" @click="goToStatistics">
          <div class="stat-icon">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.averageScore }}{{ userStore.t('dashboard.scoreUnit') }}</p>
            <p class="stat-label">{{ userStore.t('dashboard.averageScore') }}</p>
          </div>
          <div class="stat-arrow"><el-icon><ArrowRight /></el-icon></div>
        </div>
      </template>
    </div>

    <!-- 班级消息列表 - 教师和学生都显示 -->
    <el-row :gutter="24" v-if="myClasses.length > 0">
      <el-col :span="24">
        <div class="card">
          <div class="card-header">
            <div class="card-header-icon">
              <el-icon><Message /></el-icon>
            </div>
            <h3>{{ userStore.t('common.messages') }}</h3>
            <el-button type="danger" link v-if="userInfo.role === 'TEACHER'" @click="$router.push('/classes')">
              {{ userStore.t('common.classManage') }}
            </el-button>
            <el-button type="danger" link v-else @click="$router.push('/student/classes')">
              {{ userStore.t('common.myClasses') }}
            </el-button>
          </div>
          <div class="class-message-list">
            <div class="class-message-item" v-for="item in myClasses" :key="item.class.id" @click="goToClassChat(item.class.id)">
              <div class="class-message-icon">
                <el-icon :size="36"><OfficeBuilding /></el-icon>
              </div>
              <div class="class-message-info">
                <div class="class-message-header">
                  <span class="class-message-name">{{ item.class.className }}</span>
                  <span class="class-message-time">{{ formatMessageTime(item.class.lastMessageTime) }}</span>
                </div>
                <p class="class-message-content">{{ getLastMessage(item.class) }}</p>
              </div>
              <el-icon class="class-message-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" style="margin-top: 24px;">
      <!-- 管理员：系统日志 - 全屏显示 -->
      <template v-if="userInfo.role === 'ADMIN'">
        <el-col :span="24">
          <div class="card">
            <div class="card-header">
              <div class="card-header-icon">
                <el-icon><Document /></el-icon>
              </div>
              <h3>{{ userStore.t('dashboard.recentLogs') }}</h3>
            </div>
            <el-table :data="recentLogs" stripe>
              <el-table-column prop="operator" :label="userStore.t('common.user')" width="120" />
              <el-table-column prop="action" :label="userStore.t('common.operation')" />
              <el-table-column prop="target" :label="userStore.t('common.target')" width="150" />
              <el-table-column prop="createTime" :label="userStore.t('common.time')" width="180" />
            </el-table>
          </div>
        </el-col>
      </template>

      <!-- 教师和学生：保持原有布局 -->
      <template v-else>
        <el-col :span="24">
          <!-- 教师：最近考试 -->
          <div class="card" v-if="userInfo.role === 'TEACHER'">
            <div class="card-header">
              <div class="card-header-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <h3>{{ userStore.t('dashboard.recentExams') }}</h3>
              <el-button type="danger" link @click="$router.push('/exams')">
                {{ userStore.t('dashboard.manageExams') }}
              </el-button>
            </div>
            <el-table :data="recentExams" stripe>
              <el-table-column prop="title" :label="userStore.t('common.title')" />
              <el-table-column prop="className" :label="userStore.t('common.class')" width="120" />
              <el-table-column prop="status" :label="userStore.t('common.status')" width="100">
                <template #default="{ row }">
                  <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="startTime" :label="userStore.t('common.startTime')" width="180" />
              <el-table-column :label="userStore.t('common.operation')" width="100">
                <template #default="{ row }">
                  <el-button type="danger" link @click="goToExam(row)">{{ userStore.t('common.viewDetail') }}</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </template>
    </el-row>

    <!-- 学生：待考考试和考试须知 -->
    <div class="student-content-container" v-if="userInfo.role === 'STUDENT'">
      <!-- 待考考试 -->
      <div class="card exam-section">
        <div class="card-header">
          <div class="card-header-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <h3>{{ userStore.t('dashboard.upcomingExams') }}</h3>
          <el-button type="danger" link @click="$router.push('/student/exams')">
            {{ userStore.t('dashboard.allExams') }}
          </el-button>
        </div>
        <div v-if="pendingExams.length > 0">
          <div class="exam-list">
            <div class="exam-card" v-for="exam in pendingExams" :key="exam.id">
              <div class="exam-info">
                <h4>{{ exam.title }}</h4>
                <div class="exam-meta">
                  <span class="meta-item"><el-icon><Clock /></el-icon>{{ exam.startTime }}</span>
                  <span class="meta-item"><el-icon><Timer /></el-icon>{{ exam.duration }}{{ userStore.t('dashboard.minutes') }}</span>
                </div>
                <p class="exam-desc">{{ userStore.t('common.total') }}：{{ exam.totalScore }}{{ userStore.t('dashboard.scoreUnit') }} | {{ userStore.t('common.passRate') }}：{{ exam.passScore }}{{ userStore.t('dashboard.scoreUnit') }}</p>
              </div>
              <div class="exam-action">
                <el-button 
                  v-if="exam.studentStatus === 'SUBMITTED'"
                  type="success" 
                  @click="handleJoinExam(exam.id)"
                >
                  {{ userStore.t('common.viewDetail') }}
                </el-button>
                <el-button 
                  v-else
                  type="danger" 
                  :disabled="exam.status !== 'ONGOING'"
                  @click="handleJoinExam(exam.id)"
                >
                  {{ exam.status === 'ONGOING' ? userStore.t('dashboard.enterExam') : userStore.t('dashboard.waiting') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <el-icon><Calendar /></el-icon>
          <p>{{ userStore.t('dashboard.noUpcomingExams') }}</p>
        </div>
      </div>

      <!-- 考试须知 -->
      <div class="card tips-section">
        <div class="card-header">
          <div class="card-header-icon">
            <el-icon><InfoIcon /></el-icon>
          </div>
          <h3>{{ userStore.t('dashboard.examTips') }}</h3>
        </div>
        <ul class="tips-list">
          <li><span class="tip-icon">1.</span>{{ userStore.t('dashboard.tip1') }}</li>
          <li><span class="tip-icon">2.</span>{{ userStore.t('dashboard.tip2') }}</li>
          <li><span class="tip-icon">3.</span>{{ userStore.t('dashboard.tip3') }}</li>
          <li><span class="tip-icon">4.</span>{{ userStore.t('dashboard.tip4') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { examApi, classApi, userApi, examRecordApi, statisticsApi, logApi, departmentApi } from '../utils/api'
import { useUserStore } from '../store'
import { 
  User, OfficeBuilding, Folder, Check, Edit, Calendar, 
  Clock, CircleCheck, CircleClose, Plus, Document, CircleCheck as BarChart3, Check as InfoIcon,
  ArrowRight, Ticket, Message
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo || {})

const displayName = computed(() => {
  const name = userInfo.value.realName
  const username = userInfo.value.username
  return name && name.trim() ? name : username
})

const currentDate = computed(() => {
  const now = new Date()
  const lang = userStore.language === 'zh' ? 'zh-CN' : 'en-US'
  return now.toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
})

const roleText = computed(() => {
  const map = { ADMIN: userStore.t('common.admin'), TEACHER: userStore.t('common.teacher'), STUDENT: userStore.t('common.student') }
  return map[userInfo.value.role] || userStore.t('common.user')
})

const recentExams = ref([])
const pendingExams = ref([])
const classes = ref([])
const myClasses = ref([])
const recentLogs = ref([])
const departments = ref([])
const stats = ref({
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
})

const statusType = (status) => {
  const map = { PENDING: 'warning', ONGOING: 'success', FINISHED: 'info' }
  return map[status] || ''
}

const statusText = (status) => {
  const map = { PENDING: userStore.t('common.pending'), ONGOING: userStore.t('common.ongoing'), FINISHED: userStore.t('common.finished') }
  return map[status] || status
}

const goToExam = (exam) => {
  router.push(`/exams?id=${exam.id}`)
}

const goToClass = (classId) => {
  router.push(`/classes?id=${classId}`)
}

const goToUsers = (role) => {
  if (role) {
    router.push(`/users?role=${role}`)
  } else {
    router.push('/users')
  }
}

const goToDepartments = () => {
  router.push('/departments')
}

const goToClasses = () => {
  router.push('/classes')
}

const goToPapers = () => {
  router.push('/papers')
}

const goToQuestions = () => {
  router.push('/questions')
}

const goToExams = () => {
  router.push('/exams')
}

// 学生端跳转函数
const goToExamList = () => {
  router.push('/student/exams')
}

const goToHistory = () => {
  router.push('/student/history')
}

const goToWrongQuestions = () => {
  router.push('/student/wrong')
}

const goToStatistics = () => {
  router.push('/student/statistics')
}

const handleJoinExam = (examId) => {
  router.push(`/student/examing/${examId}`)
}

const getDepartmentName = (id) => departments.value.find(d => d.id === id)?.name || '-'

const loadDepartments = async () => {
  try {
    const res = await departmentApi.list()
    if (res.code === 200) {
      departments.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const loadRecentExams = async () => {
  try {
    const res = await examApi.page({ current: 1, size: 5 })
    if (res.code === 200) {
      recentExams.value = res.data.records
    }
  } catch (e) {
    console.error(e)
  }
}

const loadPendingExams = async () => {
  try {
    const res = await examApi.studentPage({ current: 1, size: 10 })
    if (res.code === 200) {
      // 过滤出未结束且未交卷的考试
      pendingExams.value = res.data.records.filter(e => 
        e.exam && e.exam.status !== 'FINISHED' && e.studentStatus !== 'SUBMITTED'
      ).map(e => ({
        ...e.exam,
        studentStatus: e.studentStatus
      }))
    }
  } catch (e) {
    console.error(e)
  }
}

const loadClasses = async () => {
  try {
    const res = await classApi.list()
    if (res.code === 200) {
      classes.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const loadMyClasses = async () => {
  try {
    const userId = userStore.userInfo?.userId || userStore.userInfo?.id
    if (!userId) return
    const res = await classApi.getMyClasses(userId)
    if (res.code === 200) {
      myClasses.value = res.data || []
    }
  } catch (e) {
    console.error('加载我的班级失败:', e)
  }
}

const goToClassChat = (classId) => {
  if (userInfo.value.role === 'STUDENT') {
    router.push(`/student/class/${classId}`)
    } else {
      router.push(`/teacher/class/${classId}`)
  }
}

const getLastMessage = (cls) => {
  if (!cls.lastMessage) return userStore.t('common.noMessage')
  if (cls.lastMessage.startsWith('EXAM_NOTICE|')) {
    return parseExamNotice(cls.lastMessage)
  }
  return cls.lastMessage
}

const parseExamNotice = (content) => {
  if (!content?.startsWith('EXAM_NOTICE|')) return ''
  const parts = content.split('|')
  const noticeType = parts[1] || ''
  const title = parts[2] || ''
  if (noticeType === 'START') {
    return '🚀 ' + title + ' ' + userStore.t('common.examStarted')
  } else if (noticeType === 'PUBLISH') {
    return '📢 ' + title + ' ' + userStore.t('common.examPublished')
  } else if (noticeType === 'END') {
    return '🔚 ' + title + ' ' + userStore.t('common.examEnded')
  }
  return '📝 ' + title
}

const formatMessageTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return userStore.t('common.justNow')
  if (diff < 3600000) return Math.floor(diff / 60000) + userStore.t('common.minutesAgo')
  if (diff < 86400000) return Math.floor(diff / 3600000) + userStore.t('common.hoursAgo')
  if (userStore.language === 'zh') {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

const loadStats = async () => {
  try {
    if (userInfo.value.role === 'ADMIN') {
      const res = await statisticsApi.overview()
      if (res.code === 200) {
        stats.value = {
          totalUsers: res.data.totalUsers || 0,
          studentCount: res.data.studentCount || 0,
          teacherCount: res.data.teacherCount || 0,
          departmentCount: res.data.departmentCount || 0
        }
      }
    } else if (userInfo.value.role === 'TEACHER') {
      const res = await statisticsApi.teacherStats()
      if (res.code === 200) {
        stats.value = {
          classCount: res.data.classCount || 0,
          paperCount: res.data.paperCount || 0,
          questionCount: res.data.questionCount || 0,
          examCount: res.data.examCount || 0
        }
      }
    } else if (userInfo.value.role === 'STUDENT') {
      const res = await examRecordApi.getStudentStats()
      if (res.code === 200) {
        stats.value = {
          pendingExams: res.data.pendingExams || 0,
          completedExams: res.data.completedExams || 0,
          wrongCount: res.data.wrongCount || 0,
          averageScore: res.data.averageScore || 0
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

const loadLogs = async () => {
  try {
    const res = await logApi.page({ current: 1, size: 10 })
    if (res.code === 200) {
      recentLogs.value = res.data.records.map(log => ({
        operator: log.username || '-',
        action: log.operation || (log.method ? log.method + ' ' + (log.uri || '') : '-'),
        target: log.params ? (log.params.length > 50 ? log.params.substring(0, 50) + '...' : log.params) : '-',
        createTime: formatDateTime(log.createTime)
      }))
    }
  } catch (e) {
    console.error('加载日志失败:', e)
    recentLogs.value = []
  }
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  if (userStore.language === 'zh') {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } else {
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }
}

onMounted(() => {
  if (userInfo.value.role === 'TEACHER') {
    loadClasses()
    loadRecentExams()
    loadDepartments()
    loadMyClasses()
  } else if (userInfo.value.role === 'STUDENT') {
    loadPendingExams()
    loadMyClasses()
  } else if (userInfo.value.role === 'ADMIN') {
    loadLogs()
    loadDepartments()
  }
  loadStats()
})
</script>

<style lang="scss" scoped>
.dashboard {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 8px;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 0;
  padding: 0 8px;
  
  h2 {
    font-size: clamp(20px, 5vw, 28px);
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.3;
  }
  
  p {
    margin-top: 6px;
    font-size: clamp(13px, 3vw, 14px);
    color: #64748b;
    line-height: 1.5;
  }
}

/* 统计卡片容器 */
.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 0 8px;
}

/* 统计卡片 */
.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
  
  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }
  
  .stat-info {
    flex: 1;
    min-width: 0;
  }
  
  .stat-value {
    font-size: clamp(20px, 4vw, 28px);
    font-weight: 700;
    margin: 0;
    color: #0f172a;
    word-break: break-all;
    line-height: 1.2;
  }
  
  .stat-label {
    font-size: clamp(12px, 2.5vw, 13px);
    color: #64748b;
    margin: 4px 0 0 0;
    line-height: 1.4;
  }
}

.admin-stat .stat-icon {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
}

.teacher-stat {
  cursor: pointer;
  
  .stat-icon {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
  }
  
  .stat-arrow {
    color: #94a3b8;
    font-size: 18px;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  
  &:hover .stat-arrow {
    color: #dc2626;
    transform: translateX(4px);
  }
}

.student-stat {
  cursor: pointer;
  
  .stat-icon {
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    color: white;
  }
  
  .stat-arrow {
    color: #94a3b8;
    font-size: 18px;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  
  &:hover .stat-arrow {
    color: #dc2626;
    transform: translateX(4px);
  }
}

/* 班级列表 */
.class-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.class-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

.class-info h4 {
  font-size: clamp(14px, 3vw, 16px);
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.3;
}

.class-department {
  font-size: clamp(12px, 2.5vw, 14px);
  color: #64748b;
  margin-bottom: 4px;
}

.class-students {
  font-size: clamp(12px, 2.5vw, 14px);
  color: #94a3b8;
}

.class-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

/* 考试列表 */
.exam-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.exam-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.exam-info {
  flex: 1;
  min-width: 200px;
}

.exam-info h4 {
  font-size: clamp(14px, 3vw, 16px);
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
  line-height: 1.3;
}

.exam-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: clamp(12px, 2.5vw, 13px);
    color: #64748b;
  }
}

.exam-desc {
  font-size: clamp(12px, 2.5vw, 13px);
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.exam-action {
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  
  .el-icon {
    font-size: clamp(40px, 10vw, 48px);
    margin-bottom: 16px;
  }
  
  p {
    margin: 0;
    font-size: clamp(13px, 3vw, 14px);
  }
}

/* 提示列表 */
.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: clamp(13px, 2.8vw, 14px);
    color: #475569;
    line-height: 1.5;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .tip-icon {
    color: #dc2626;
    font-weight: 600;
    flex-shrink: 0;
  }
}

/* 学生内容容器 */
.student-content-container {
  display: flex;
  gap: 24px;
  padding: 0 8px;
  
  .exam-section {
    flex: 1;
    min-width: 0;
  }
  
  .tips-section {
    width: 320px;
    flex-shrink: 0;
  }
}

/* 卡片样式 */
.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  .card-header-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #fef3c7;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f59e0b;
    font-size: 18px;
    flex-shrink: 0;
  }
  
  h3 {
    flex: 1;
    font-size: clamp(14px, 3vw, 16px);
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    line-height: 1.3;
  }
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  
  .class-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .dashboard {
    gap: 16px;
    padding: 0 4px;
  }
  
  .page-header {
    padding: 0 4px;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 0 4px;
  }
  
  .stat-card {
    padding: 16px;
    gap: 10px;
    flex-direction: row;
    align-items: center;
    
    .stat-icon {
      width: 44px;
      height: 44px;
      font-size: 20px;
    }
    
    .stat-value {
      font-size: 20px;
    }
    
    .stat-label {
      font-size: 12px;
    }
    
    .stat-info {
      text-align: left;
    }
  }
  
  .class-list {
    grid-template-columns: 1fr;
    padding: 0 4px;
  }
  
  .class-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }
  
  .class-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .exam-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }
  
  .exam-action {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  
  .exam-meta {
    flex-direction: column;
    gap: 6px;
  }
  
  .student-content-container {
    flex-direction: column;
    gap: 16px;
    padding: 0 4px;
    
    .tips-section {
      width: 100%;
    }
  }
  
  .card {
    padding: 16px;
  }
  
  .card-header {
    flex-wrap: wrap;
  }
}

@media screen and (max-width: 576px) {
  .stats-container {
    gap: 10px;
  }
  
  .stat-card {
    padding: 14px;
    gap: 10px;
    
    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }
    
    .stat-value {
      font-size: 18px;
    }
  }
  
  .card {
    padding: 14px;
  }
  
  .tips-list li {
    font-size: 13px;
    line-height: 1.6;
  }
}

@media screen and (max-width: 360px) {
  .stats-container {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stat-card {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    
    .stat-icon {
      width: 44px;
      height: 44px;
      font-size: 20px;
    }
    
    .stat-value {
      font-size: 20px;
    }
  }
  
  .class-card {
    padding: 14px;
  }
  
  .exam-card {
    padding: 14px;
  }
}

.class-message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.class-message-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
    transform: translateX(4px);
  }
  
  .class-message-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 16px;
    flex-shrink: 0;
  }
  
  .class-message-info {
    flex: 1;
    min-width: 0;
    
    .class-message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      
      .class-message-name {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
      }
      
      .class-message-time {
        font-size: 12px;
        color: #94a3b8;
        flex-shrink: 0;
      }
    }
    
    .class-message-content {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.4;
    }
  }
  
  .class-message-arrow {
    color: #94a3b8;
    margin-left: 12px;
    flex-shrink: 0;
  }
}

@media screen and (max-width: 576px) {
  .class-message-item {
    padding: 14px;
    
    .class-message-icon {
      width: 40px;
      height: 40px;
    }
    
    .class-message-name {
      font-size: 13px;
    }
    
    .class-message-content {
      font-size: 12px;
    }
  }
}
</style>
