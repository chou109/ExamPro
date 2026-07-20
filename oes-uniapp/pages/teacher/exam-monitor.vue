<template>
  <view class="exam-monitor">
    <CustomNavBar :title="userStore.t('common.examMonitor')" :showBack="true" />

    <!-- 考试信息 -->
    <view class="card">
      <view class="exam-header">
        <text class="exam-title">{{ examInfo.title }}</text>
        <view :class="['status-tag', 'status-' + examInfo.status.toLowerCase()]">
          <text>{{ statusText(examInfo.status) }}</text>
        </view>
      </view>
      <view class="exam-info">
        <view class="info-row">
          <text class="info-icon">📚</text>
          <text class="info-text">{{ userStore.t('common.subject') }}：{{ getSubjectName(examInfo.subjectId) }}</text>
        </view>
        <view class="info-row">
          <text class="info-icon">⏱</text>
          <text class="info-text">{{ userStore.t('common.duration') }}：{{ examInfo.duration }}{{ userStore.t('common.durationMinutes') }}</text>
        </view>
        <view class="info-row">
          <text class="info-icon">📅</text>
          <text class="info-text">{{ userStore.t('common.start') }}：{{ formatDateTime(examInfo.startTime) }}</text>
        </view>
        <view class="info-row">
          <text class="info-icon">🏫</text>
          <text class="info-text">{{ userStore.t('common.class') }}：{{ examInfo.className }}</text>
        </view>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">{{ userStore.t('common.examStatistics') }}</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value total">{{ stats.total }}</text>
          <text class="stat-label">{{ userStore.t('common.totalPeople') }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-value submitted">{{ stats.submitted }}</text>
          <text class="stat-label">{{ userStore.t('common.submitted') }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-value not-started">{{ stats.notStarted }}</text>
          <text class="stat-label">{{ userStore.t('common.notStarted') }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-value ongoing">{{ stats.ongoing }}</text>
          <text class="stat-label">{{ userStore.t('common.ongoing') }}</text>
        </view>
      </view>
    </view>

    <!-- 考生列表 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">{{ userStore.t('common.examineeStatus') }}</text>
        <picker mode="selector" :range="statusOptions" range-key="label" @change="onStatusChange">
          <view class="status-picker">{{ currentStatusText }}</view>
        </picker>
      </view>
      <view class="student-list">
        <view class="student-item" v-for="item in studentRecords" :key="item.id">
          <view class="student-info">
            <text class="student-name">{{ item.studentName }}</text>
            <text class="student-id">{{ userStore.t('common.studentId') }}：{{ item.studentId }}</text>
          </view>
          <view class="student-status">
            <view :class="['status-badge', getStatusClass(item.status)]">
              <text>{{ getStatusText(item.status) }}</text>
            </view>
          </view>
          <view class="student-meta">
            <text v-if="item.submitTime">{{ userStore.t('common.submitTime') }}：{{ formatDateTime(item.submitTime) }}</text>
            <text v-if="item.score">{{ userStore.t('common.score') }}：{{ item.score }}{{ userStore.t('common.scoreUnit') }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/index.js'
import { examApi, examRecordApi, subjectApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()

const examId = ref('')
const examInfo = reactive({
  title: '',
  status: '',
  subjectId: '',
  duration: 0,
  startTime: '',
  className: ''
})

const stats = reactive({
  total: 0,
  submitted: 0,
  notStarted: 0,
  ongoing: 0
})

const subjects = ref([])
const studentRecords = ref([])
const filterStatus = ref('')

const statusOptions = computed(() => [
  { value: '', label: userStore.t('common.all') },
  { value: 'NOT_STARTED', label: userStore.t('common.notStarted') },
  { value: 'ONGOING', label: userStore.t('common.ongoing') },
  { value: 'SUBMITTED', label: userStore.t('common.submitted') },
  { value: 'AUTO_SUBMITTED', label: userStore.t('common.autoSubmitted') }
])

const currentStatusText = ref(userStore.t('common.all'))

watch(() => userStore.language, () => {
  currentStatusText.value = statusOptions.value.find(s => s.value === filterStatus.value)?.label || userStore.t('common.all')
})

const statusText = (status) => {
  const map = {
    PENDING: userStore.t('common.pending'),
    ONGOING: userStore.t('common.ongoing'),
    FINISHED: userStore.t('common.finished')
  }
  return map[status] || status
}

const getStatusText = (status) => {
  const map = {
    NOT_STARTED: userStore.t('common.notStarted'),
    ONGOING: userStore.t('common.ongoing'),
    SUBMITTED: userStore.t('common.submitted'),
    AUTO_SUBMITTED: userStore.t('common.autoSubmitted')
  }
  return map[status] || status
}

const getStatusClass = (status) => {
  return {
    NOT_STARTED: 'status-not-started',
    ONGOING: 'status-ongoing',
    SUBMITTED: 'status-submitted',
    AUTO_SUBMITTED: 'status-auto-submitted'
  }[status] || ''
}

const getSubjectName = (subjectId) => {
  const subject = subjects.value.find(s => s.id === subjectId)
  return subject ? subject.name : userStore.t('common.unknownSubject')
}

const formatDateTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
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

const onStatusChange = (e) => {
  const index = e.detail.value
  filterStatus.value = statusOptions[index].value
  currentStatusText.value = statusOptions[index].label
  loadStudentRecords()
}

const loadExamInfo = async () => {
  try {
    const res = await examApi.getById(examId.value)
    if (res.code === 200) {
      Object.assign(examInfo, res.data)
    }
  } catch (e) {
    console.error('加载考试信息失败:', e)
  }
}

const loadStats = async () => {
  try {
    const res = await examRecordApi.getExamStats(examId.value)
    if (res.code === 200) {
      Object.assign(stats, res.data)
    }
  } catch (e) {
    console.error('加载统计数据失败:', e)
  }
}

const loadStudentRecords = async () => {
  try {
    const params = { current: 1, size: 100, examId: examId.value }
    if (filterStatus.value) {
      params.status = filterStatus.value
    }
    const res = await examRecordApi.page(params)
    if (res.code === 200) {
      studentRecords.value = res.data.records || []
    }
  } catch (e) {
    console.error('加载考生记录失败:', e)
  }
}

const loadSubjects = async () => {
  try {
    const res = await subjectApi.list()
    if (res.code === 200) {
      subjects.value = res.data
    }
  } catch (e) {
    console.error('加载科目失败:', e)
  }
}

onLoad((options) => {
  examId.value = options.id
  loadSubjects()
  loadExamInfo()
  loadStats()
  loadStudentRecords()
})
</script>

<style scoped>
.exam-monitor {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 140rpx;
  padding-bottom: 40rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 24rpx;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #eee;
  
  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .status-picker {
    padding: 8rpx 16rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #666;
  }
}

.exam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  
  .exam-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    flex: 1;
  }
  
  .status-tag {
    padding: 8rpx 20rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
  }
  
  .status-pending {
    background: #fdf6ec;
    color: #e6a23c;
  }
  
  .status-ongoing {
    background: #f0f9ff;
    color: #67c23a;
  }
  
  .status-finished {
    background: #f4f4f5;
    color: #909399;
  }
}

.exam-info {
  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
    
    .info-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
    }
    
    .info-text {
      font-size: 28rpx;
      color: #666;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.stats-grid .stat-item {
  text-align: center;
  padding: 20rpx 0;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.stats-grid .stat-item .stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
}

.stats-grid .stat-item .stat-value.total {
  color: #dc2626;
}

.stats-grid .stat-item .stat-value.submitted {
  color: #67c23a;
}

.stats-grid .stat-item .stat-value.not-started {
  color: #e6a23c;
}

.stats-grid .stat-item .stat-value.ongoing {
  color: #409eff;
}

.stats-grid .stat-item .stat-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

.student-list {
  .student-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .student-info {
      flex: 1;
      
      .student-name {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 4rpx;
      }
      
      .student-id {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .student-status {
      margin: 0 20rpx;
      
      .status-badge {
        padding: 6rpx 16rpx;
        border-radius: 6rpx;
        font-size: 22rpx;
      }
      
      .status-not-started {
        background: #f4f4f5;
        color: #909399;
      }
      
      .status-ongoing {
        background: #f0f9ff;
        color: #67c23a;
      }
      
      .status-submitted {
        background: #f0f9ff;
        color: #409eff;
      }
      
      .status-auto-submitted {
        background: #fef0f0;
        color: #f56c6c;
      }
    }
    
    .student-meta {
      text-align: right;
      
      text {
        display: block;
        font-size: 22rpx;
        color: #999;
      }
    }
  }
}
</style>