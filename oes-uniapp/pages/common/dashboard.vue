<template>
  <view class="dashboard">
    <CustomNavBar :title="userStore.t('common.home')" :showBack="false" />
    <view class="page-header">
      <text class="title">{{ userStore.t('dashboard.welcome') }}，{{ displayName }}</text>
      <text class="subtitle">{{ roleText }} | {{ currentDate }}</text>
    </view>

    <view class="stats-grid">
      <template v-if="userInfo.role === 'ADMIN'">
        <view class="stat-card" @click="goTo('/pages/admin/user-manage')">
          <view class="stat-icon admin-icon">
            <text class="emoji">👥</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.totalUsers }}</text>
            <text class="stat-label">{{ userStore.t('dashboard.totalUsers') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="stat-card" @click="goTo('/pages/admin/user-manage?role=STUDENT')">
          <view class="stat-icon admin-icon">
            <text class="emoji">👨‍🎓</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.studentCount }}</text>
            <text class="stat-label">{{ userStore.t('login.student') }}{{ userStore.t('dashboard.count') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="stat-card" @click="goTo('/pages/admin/user-manage?role=TEACHER')">
          <view class="stat-icon admin-icon">
            <text class="emoji">👨‍🏫</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.teacherCount }}</text>
            <text class="stat-label">{{ userStore.t('login.teacher') }}{{ userStore.t('dashboard.count') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="stat-card" @click="goTo('/pages/admin/department-manage')">
          <view class="stat-icon admin-icon">
            <text class="emoji">🏫</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.departmentCount }}</text>
            <text class="stat-label">{{ userStore.t('dashboard.departmentCount') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </template>

      <template v-else-if="userInfo.role === 'TEACHER'">
        <view class="stat-card" @click="goTo('/pages/teacher/my-classes')">
          <view class="stat-icon teacher-icon">
            <text class="emoji">📚</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.classCount }}</text>
            <text class="stat-label">{{ userStore.t('dashboard.classCount') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="stat-card" @click="goTo('/pages/teacher/paper-manage')">
          <view class="stat-icon teacher-icon">
            <text class="emoji">📄</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.paperCount }}</text>
            <text class="stat-label">{{ userStore.t('dashboard.paperCount') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="stat-card" @click="goTo('/pages/teacher/question-manage')">
          <view class="stat-icon teacher-icon">
            <text class="emoji">❓</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.questionCount }}</text>
            <text class="stat-label">{{ userStore.t('dashboard.questionCount') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="stat-card" @click="goTo('/pages/teacher/exam-manage')">
          <view class="stat-icon teacher-icon">
            <text class="emoji">📅</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.examCount }}</text>
            <text class="stat-label">{{ userStore.t('dashboard.examCount') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </template>

      <template v-else-if="userInfo.role === 'STUDENT'">
        <view class="stat-card" @click="goTo('/pages/student/exam-list')">
          <view class="stat-icon student-icon">
            <text class="emoji">⏰</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.pendingExams }}</text>
            <text class="stat-label">{{ userStore.t('dashboard.pendingExams') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="stat-card" @click="goTo('/pages/student/history')">
          <view class="stat-icon student-icon">
            <text class="emoji">✅</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.completedExams }}</text>
            <text class="stat-label">{{ userStore.t('dashboard.completedExams') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="stat-card" @click="goTo('/pages/student/wrong-questions')">
          <view class="stat-icon student-icon">
            <text class="emoji">❌</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.wrongCount }}</text>
            <text class="stat-label">{{ userStore.t('dashboard.wrongCount') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="stat-card" @click="goTo('/pages/student/statistics')">
          <view class="stat-icon student-icon">
            <text class="emoji">📊</text>
          </view>
          <view class="stat-info">
            <text class="stat-value">{{ stats.averageScore }}{{ userStore.t('dashboard.scoreUnit') }}</text>
            <text class="stat-label">{{ userStore.t('dashboard.averageScore') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </template>
    </view>

    <template v-if="userInfo.role === 'STUDENT'">
      <view class="card">
        <view class="nav-item" @click="goTo('/pages/student/my-classes')">
          <view class="nav-icon">🏫</view>
          <text class="nav-text">{{ userStore.t('dashboard.myClasses') }}</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="nav-item" @click="goTo('/pages/student/exam-list')">
          <view class="nav-icon">📋</view>
          <text class="nav-text">{{ userStore.t('dashboard.examList') }}</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="nav-item" @click="goTo('/pages/student/history')">
          <view class="nav-icon">📝</view>
          <text class="nav-text">{{ userStore.t('dashboard.examHistory') }}</text>
          <text class="nav-arrow">›</text>
        </view>
      </view>
    </template>

    <template v-if="userInfo.role === 'ADMIN'">
      <view class="card">
        <view class="card-header">
          <view class="card-title">
            <text class="card-emoji">⚙️</text>
            <text class="title-text">{{ userStore.t('dashboard.systemManagement') }}</text>
          </view>
        </view>
        <view class="nav-item" @click="goTo('/pages/admin/user-manage')">
          <view class="nav-icon">👥</view>
          <text class="nav-text">{{ userStore.t('dashboard.userManagement') }}</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="nav-item" @click="goTo('/pages/admin/department-manage')">
          <view class="nav-icon">🏫</view>
          <text class="nav-text">{{ userStore.t('dashboard.departmentManagement') }}</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="nav-item" @click="goTo('/pages/admin/class-manage')">
          <view class="nav-icon">📚</view>
          <text class="nav-text">{{ userStore.t('dashboard.classManagement') }}</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="nav-item" @click="goTo('/pages/admin/statistics')">
          <view class="nav-icon">📊</view>
          <text class="nav-text">{{ userStore.t('dashboard.dataStatistics') }}</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="nav-item" @click="goTo('/pages/admin/log-manage')">
          <view class="nav-icon">📋</view>
          <text class="nav-text">{{ userStore.t('dashboard.systemLogs') }}</text>
          <text class="nav-arrow">›</text>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-title">
            <text class="card-emoji">📝</text>
            <text class="title-text">{{ userStore.t('dashboard.recentLogs') }}</text>
          </view>
        </view>
        <view class="log-list">
          <view class="log-item" v-for="(log, index) in recentLogs" :key="index">
            <view class="log-operator">{{ log.operator }}</view>
            <view class="log-action">{{ log.action }}</view>
            <view class="log-time">{{ log.createTime }}</view>
          </view>
          <view class="empty" v-if="recentLogs.length === 0">
            <text class="empty-text">{{ userStore.t('common.noData') }}</text>
          </view>
        </view>
      </view>
    </template>

    <template v-if="userInfo.role === 'TEACHER'">
      <view class="card">
        <view class="nav-item" @click="goTo('/pages/teacher/my-classes')">
          <view class="nav-icon">🏫</view>
          <text class="nav-text">{{ userStore.t('dashboard.classManagement') }}</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="nav-item" @click="goTo('/pages/teacher/subject-manage')">
          <view class="nav-icon">📚</view>
          <text class="nav-text">{{ userStore.t('dashboard.subjectManagement') }}</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="nav-item" @click="goTo('/pages/teacher/question-manage')">
          <view class="nav-icon">❓</view>
          <text class="nav-text">{{ userStore.t('dashboard.questionManagement') }}</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="nav-item" @click="goTo('/pages/teacher/paper-manage')">
          <view class="nav-icon">📄</view>
          <text class="nav-text">{{ userStore.t('dashboard.paperManagement') }}</text>
          <text class="nav-arrow">›</text>
        </view>
        <view class="nav-item" @click="goTo('/pages/teacher/exam-manage')">
          <view class="nav-icon">📅</view>
          <text class="nav-text">{{ userStore.t('dashboard.examManagement') }}</text>
          <text class="nav-arrow">›</text>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-title">
            <text class="card-emoji">📅</text>
            <text class="title-text">{{ userStore.t('dashboard.recentExams') }}</text>
          </view>
          <text class="card-link" @click="goTo('/pages/teacher/exam-manage')">{{ userStore.t('dashboard.manageExams') }}</text>
        </view>
        <view class="exam-list">
          <view class="exam-item" v-for="exam in recentExams" :key="exam.id" @click="goToExam(exam)">
            <view class="exam-info">
              <text class="exam-title">{{ exam.title }}</text>
              <text class="exam-meta">{{ exam.className }} | {{ formatDateTime(exam.startTime) }}</text>
            </view>
            <view :class="['status-tag', statusClass(exam.status)]">
              <text class="status-text">{{ statusText(exam.status) }}</text>
            </view>
          </view>
          <view class="empty" v-if="recentExams.length === 0">
            <text class="empty-text">{{ userStore.t('common.noData') }}</text>
          </view>
        </view>
      </view>
    </template>

    <template v-if="userInfo.role === 'STUDENT'">
      <view class="card">
        <view class="card-header">
          <view class="card-title">
            <text class="card-emoji">⏰</text>
            <text class="title-text">{{ userStore.t('dashboard.upcomingExams') }}</text>
          </view>
          <text class="card-link" @click="goTo('/pages/student/exam-list')">{{ userStore.t('dashboard.allExams') }}</text>
        </view>
        <view class="exam-list">
          <view class="exam-item" v-for="exam in pendingExams" :key="exam.id">
            <view class="exam-info">
              <text class="exam-title">{{ exam.title }}</text>
              <text class="exam-meta">{{ formatDateTime(exam.startTime) }} | {{ exam.duration }}{{ userStore.t('dashboard.minutes') }}</text>
            </view>
            <button
              class="exam-btn"
              :disabled="exam.status !== 'ONGOING'"
              @click="goToExam(exam)"
            >
              <text class="btn-text">{{ exam.status === 'ONGOING' ? userStore.t('dashboard.enterExam') : userStore.t('dashboard.waiting') }}</text>
            </button>
          </view>
          <view class="empty" v-if="pendingExams.length === 0">
            <text class="empty-text">{{ userStore.t('dashboard.noUpcomingExams') }}</text>
          </view>
        </view>
      </view>

      <view class="card tips-card">
        <view class="card-header">
          <view class="card-title">
            <text class="card-emoji">ℹ️</text>
            <text class="title-text">{{ userStore.t('dashboard.examTips') }}</text>
          </view>
        </view>
        <view class="tips-list">
          <view class="tip-item">
            <text class="tip-number">1.</text>
            <text class="tip-text">{{ userStore.t('dashboard.tip1') }}</text>
          </view>
          <view class="tip-item">
            <text class="tip-number">2.</text>
            <text class="tip-text">{{ userStore.t('dashboard.tip2') }}</text>
          </view>
          <view class="tip-item">
            <text class="tip-number">3.</text>
            <text class="tip-text">{{ userStore.t('dashboard.tip3') }}</text>
          </view>
          <view class="tip-item">
            <text class="tip-number">4.</text>
            <text class="tip-text">{{ userStore.t('dashboard.tip4') }}</text>
          </view>
        </view>
      </view>
    </template>

    <CustomTabBar />
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { examApi, examRecordApi, statisticsApi, logApi, userApi, classApi } from '../../utils/api'
import { useUserStore } from '../../store/index.js'

import CustomTabBar from '../../components/CustomTabBar.vue'
import CustomNavBar from '../../components/CustomNavBar.vue'

export default {
  components: { CustomTabBar, CustomNavBar },
  setup() {
    const userInfo = ref(uni.getStorageSync('userInfo') || {})
    const userStore = useUserStore()

    const toggleLanguage = () => {
      const newLang = userStore.language === 'zh' ? 'en' : 'zh'
      userStore.changeLanguage(newLang)
    }

    const setNavBarTitle = () => {
      uni.setNavigationBarTitle({
        title: userStore.t('common.home')
      })
    }

    watch(() => userStore.language, () => {
      setNavBarTitle()
    })

    const displayName = computed(() => {
      const name = userInfo.value.realName || userInfo.value.real_name
      const username = userInfo.value.username
      return (name && name.trim()) ? name : username
    })

    const currentDate = computed(() => {
      const now = new Date()
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
      return now.toLocaleDateString(userStore.language === 'zh' ? 'zh-CN' : 'en-US', options)
    })

    const roleText = computed(() => {
      const map = { 
        ADMIN: userStore.t('login.admin'), 
        TEACHER: userStore.t('login.teacher'), 
        STUDENT: userStore.t('login.student') 
      }
      return map[userInfo.value.role] || userStore.t('common.user')
    })

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

    const recentExams = ref([])
    const pendingExams = ref([])
    const recentLogs = ref([])

    const statusClass = (status) => {
      const map = { PENDING: 'pending', ONGOING: 'ongoing', FINISHED: 'finished' }
      return map[status] || ''
    }

    const statusText = (status) => {
      const map = { 
        PENDING: userStore.t('common.statusPending'), 
        ONGOING: userStore.t('common.statusOngoing'), 
        FINISHED: userStore.t('common.statusFinished') 
      }
      return map[status] || status
    }

    const goTo = (url) => {
      uni.navigateTo({ url })
    }

    const goToExam = (exam) => {
      if (userInfo.value.role === 'STUDENT') {
        uni.navigateTo({
          url: `/pages/student/exam-take?id=${exam.id}`
        })
      } else {
        uni.navigateTo({
          url: `/pages/teacher/exam-manage?id=${exam.id}`
        })
      }
    }

    

    const loadStats = async () => {
      try {
        const token = uni.getStorageSync('token')
        console.log('当前token:', token ? '存在' : '不存在')
        console.log('当前用户角色:', userInfo.value.role)
        
        if (userInfo.value.role === 'ADMIN') {
          const res = await statisticsApi.overview()
          console.log('ADMIN统计数据:', res)
          if (res.code === 200) {
            stats.value = {
              totalUsers: res.data.total_users || res.data.totalUsers || 0,
              studentCount: res.data.student_count || res.data.studentCount || 0,
              teacherCount: res.data.teacher_count || res.data.teacherCount || 0,
              departmentCount: res.data.department_count || res.data.departmentCount || 0
            }
          }
        } else if (userInfo.value.role === 'TEACHER') {
          const res = await statisticsApi.teacherStats()
          console.log('TEACHER统计数据:', res)
          if (res.code === 200) {
            stats.value = {
              classCount: res.data.total_classes || res.data.classCount || 0,
              paperCount: res.data.total_papers || res.data.paperCount || 0,
              questionCount: res.data.total_questions || res.data.questionCount || 0,
              examCount: res.data.total_exams || res.data.examCount || 0
            }
          }
        } else if (userInfo.value.role === 'STUDENT') {
          const res = await examRecordApi.getStudentStats()
          console.log('STUDENT统计数据:', res)
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
        console.error('加载统计数据失败:', e)
      }
    }

    const loadRecentExams = async () => {
      try {
        const res = await examApi.page({ current: 1, size: 5 })
        if (res.code === 200) {
          recentExams.value = res.data.records || []
        }
      } catch (e) {
        console.error('加载最近考试失败:', e)
      }
    }

    const loadPendingExams = async () => {
      try {
        const res = await examApi.studentPage({ current: 1, size: 10 })
        if (res.code === 200) {
          const records = res.data.records || []
          pendingExams.value = records.filter(e =>
            e.exam && e.exam.status !== 'FINISHED' && e.studentStatus !== 'SUBMITTED'
          ).map(e => ({
            ...e.exam,
            studentStatus: e.studentStatus
          }))
        }
      } catch (e) {
        console.error('加载待考考试失败:', e)
      }
    }

    const loadLogs = async () => {
      try {
        const res = await logApi.page({ current: 1, size: 10 })
        if (res.code === 200) {
          recentLogs.value = (res.data.records || []).map(log => ({
            operator: log.username || '-',
            action: log.operation || '-',
            createTime: formatDateTime(log.createTime)
          }))
        }
      } catch (e) {
        console.error('加载日志失败:', e)
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
        return `${year}-${month}-${day} ${hours}:${minutes}`
      } else {
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
      }
    }

    onMounted(async () => {
      if (userInfo.value.role === 'ADMIN') {
        uni.hideTabBar()
      }
      setNavBarTitle()
      await loadStats()

      if (userInfo.value.role === 'ADMIN') {
        await loadLogs()
      } else if (userInfo.value.role === 'TEACHER') {
        await loadRecentExams()
      } else if (userInfo.value.role === 'STUDENT') {
        await loadPendingExams()
      }
    })

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
      toggleLanguage,
      goTo,
      goToExam
    }
  }
}
</script>

<style lang="scss">
.dashboard {
  padding: 0;
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
  padding-top: 140rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.page-header {
  padding: 24rpx;

  .title {
    font-size: 36rpx;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8rpx;
    display: block;
  }

  .subtitle {
    font-size: 26rpx;
    color: #64748b;
    display: block;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  .stat-icon {
    width: 56rpx;
    height: 56rpx;
    border-radius: 14rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .emoji {
      font-size: 32rpx;
    }
  }

  .admin-icon {
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  }

  .teacher-icon {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }

  .student-icon {
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  }

  .stat-info {
    flex: 1;

    .stat-value {
      font-size: 36rpx;
      font-weight: 700;
      color: #0f172a;
    }

    .stat-label {
      font-size: 24rpx;
      color: #64748b;
      margin-top: 4rpx;
    }
  }

  .arrow {
    font-size: 40rpx;
    color: #999;
  }
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;

    .card-title {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .card-emoji {
        font-size: 28rpx;
      }

      .title-text {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
    }

    .card-link {
      font-size: 26rpx;
      color: #dc2626;
    }
  }
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #e5e5e5;

  &:last-child {
    border-bottom: none;
  }

  .nav-icon {
    font-size: 36rpx;
    margin-right: 20rpx;
  }

  .nav-text {
    flex: 1;
    font-size: 32rpx;
    color: #333;
  }

  .nav-arrow {
    font-size: 40rpx;
    color: #999;
  }
}

.log-list {
  .log-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #e5e5e5;

    &:last-child {
      border-bottom: none;
    }

    .log-operator {
      width: 120rpx;
      font-size: 26rpx;
      color: #333;
    }

    .log-action {
      flex: 1;
      font-size: 26rpx;
      color: #666;
    }

    .log-time {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.exam-list {
  .exam-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #e5e5e5;

    &:last-child {
      border-bottom: none;
    }

    .exam-info {
      flex: 1;

      .exam-title {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 8rpx;
      }

      .exam-meta {
        font-size: 24rpx;
        color: #999;
      }
    }

    .exam-status {
      .status-tag {
        padding: 8rpx 16rpx;
        border-radius: 8rpx;

        &.pending {
          background: rgba(245, 158, 11, 0.1);
          .status-text { color: #f59e0b; }
        }

        &.ongoing {
          background: rgba(34, 197, 94, 0.1);
          .status-text { color: #22c55e; }
        }

        &.finished {
          background: rgba(100, 116, 139, 0.1);
          .status-text { color: #64748b; }
        }

        &.failed {
          background: rgba(239, 68, 68, 0.1);
          .status-text { color: #ef4444; }
        }

        .status-text {
          font-size: 24rpx;
        }
      }
    }

    .exam-btn {
      height: 64rpx;
      padding: 0 24rpx;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      border-radius: 8rpx;
      border: none;

      .btn-text {
        font-size: 26rpx;
        color: #fff;
      }

      &[disabled] {
        background: #ccc;
      }
    }
  }
}

.tips-card {
  .tips-list {
    .tip-item {
      display: flex;
      align-items: flex-start;
      padding: 12rpx 0;

      .tip-number {
        width: 40rpx;
        font-size: 26rpx;
        color: #dc2626;
        font-weight: 600;
      }

      .tip-text {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

.empty {
  padding: 40rpx;
  text-align: center;

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
