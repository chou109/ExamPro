<template>
  <view class="exam-monitor">
    <view class="page-header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="title">考试监控</text>
      <view class="header-right"></view>
    </view>

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
          <text class="info-text">科目：{{ getSubjectName(examInfo.subjectId) }}</text>
        </view>
        <view class="info-row">
          <text class="info-icon">⏱</text>
          <text class="info-text">时长：{{ examInfo.duration }}分钟</text>
        </view>
        <view class="info-row">
          <text class="info-icon">📅</text>
          <text class="info-text">开始：{{ formatDateTime(examInfo.startTime) }}</text>
        </view>
        <view class="info-row">
          <text class="info-icon">🏫</text>
          <text class="info-text">班级：{{ examInfo.className }}</text>
        </view>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">考试统计</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.total }}</text>
          <text class="stat-label">总人数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.submitted }}</text>
          <text class="stat-label">已提交</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.notStarted }}</text>
          <text class="stat-label">未开始</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.ongoing }}</text>
          <text class="stat-label">进行中</text>
        </view>
      </view>
    </view>

    <!-- 考生列表 -->
    <view class="card">
      <view class="card-header">
        <text class="card-title">考生状态</text>
        <picker mode="selector" :range="statusOptions" range-key="label" @change="onStatusChange">
          <view class="status-picker">{{ currentStatusText }}</view>
        </picker>
      </view>
      <view class="student-list">
        <view class="student-item" v-for="item in studentRecords" :key="item.id">
          <view class="student-info">
            <text class="student-name">{{ item.studentName }}</text>
            <text class="student-id">学号：{{ item.studentId }}</text>
          </view>
          <view class="student-status">
            <view :class="['status-badge', getStatusClass(item.status)]">
              <text>{{ getStatusText(item.status) }}</text>
            </view>
          </view>
          <view class="student-meta">
            <text v-if="item.submitTime">提交时间：{{ formatDateTime(item.submitTime) }}</text>
            <text v-if="item.score">得分：{{ item.score }}分</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { examApi, examRecordApi, subjectApi } from '../../utils/api.js'

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

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'NOT_STARTED', label: '未开始' },
  { value: 'ONGOING', label: '进行中' },
  { value: 'SUBMITTED', label: '已提交' },
  { value: 'AUTO_SUBMITTED', label: '强制收卷' }
]

const currentStatusText = ref('全部')

const statusText = (status) => {
  return {
    PENDING: '待开始',
    ONGOING: '进行中',
    FINISHED: '已结束'
  }[status] || status
}

const getStatusText = (status) => {
  return {
    NOT_STARTED: '未开始',
    ONGOING: '进行中',
    SUBMITTED: '已提交',
    AUTO_SUBMITTED: '强制收卷'
  }[status] || status
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
  return subject ? subject.name : '未知科目'
}

const formatDateTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const goBack = () => {
  uni.navigateBack()
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
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.back-btn {
  padding: 8rpx;
  
  .back-icon {
    font-size: 48rpx;
    color: #333;
    font-weight: bold;
  }
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
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
  
  .stat-item {
    text-align: center;
    padding: 20rpx 0;
    background: #f5f5f5;
    border-radius: 12rpx;
    
    .stat-value {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #dc2626;
    }
    
    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #666;
      margin-top: 8rpx;
    }
  }
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