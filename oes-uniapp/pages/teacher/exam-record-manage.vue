<template>
  <view class="exam-record">
    <CustomNavBar :title="userStore.t('common.examRecords')" :showBack="true" />

    <!-- 工具栏 -->
    <view class="toolbar">
      <view class="toolbar-left">
        <picker mode="selector" :range="examOptions" range-key="title" @change="onExamChange">
          <view class="picker">{{ currentExamText }}</view>
        </picker>
        <picker mode="selector" :range="statusOptions" range-key="label" @change="onStatusChange">
          <view class="picker">{{ currentStatusText }}</view>
        </picker>
      </view>
      <button class="search-btn" @click="loadData">{{ userStore.t('common.search') }}</button>
    </view>

    <!-- 记录列表 -->
    <view class="record-list">
      <view class="record-item" v-for="item in tableData" :key="item.id">
        <view class="record-header">
          <text class="student-name">{{ item.studentName }}</text>
          <view class="score-badge" :class="item.score >= 60 ? 'pass' : 'fail'">
            <text>{{ item.score }}{{ userStore.t('common.score') }}</text>
          </view>
        </view>

        <view class="record-info">
          <view class="info-row">
            <text class="info-icon">📋</text>
            <text class="info-text">{{ userStore.t('common.exam') }}：{{ item.examTitle }}</text>
          </view>
          <view class="info-row">
            <text class="info-icon">📅</text>
            <text class="info-text">{{ userStore.t('common.submitTime') }}：{{ formatDateTime(item.submitTime) }}</text>
          </view>
          <view class="info-row">
            <text class="info-icon">⏱</text>
            <text class="info-text">{{ userStore.t('common.duration') }}：{{ item.duration }}{{ userStore.t('common.minutes') }}</text>
          </view>
          <view v-if="item.status === 'AUTO_SUBMITTED'" class="info-row">
            <text class="info-icon">⚠️</text>
            <text class="info-text warning">{{ userStore.t('common.autoSubmitted') }}</text>
          </view>
        </view>

        <view class="record-actions">
          <button class="action-btn" @click="handleView(item)">{{ userStore.t('common.view') }}</button>
          <button v-if="!item.score" class="action-btn primary" @click="handleGrade(item)">{{ userStore.t('teacher.grading') }}</button>
        </view>
      </view>
    </view>

    <uni-load-more :status="loadStatus" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../../store/index.js'
import { examRecordApi, examApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()

const tableData = ref([])
const exams = ref([])
const params = ref({
  examId: '',
  status: ''
})
const loadStatus = ref('more')
const current = ref(1)
const size = ref(10)

const examOptions = computed(() => {
  return [{ id: '', title: userStore.t('common.allExams') }, ...exams.value]
})

const statusOptions = computed(() => [
  { value: '', label: userStore.t('common.all') },
  { value: 'SUBMITTED', label: userStore.t('common.submitted') },
  { value: 'AUTO_SUBMITTED', label: userStore.t('common.autoSubmitted') },
  { value: 'GRADED', label: userStore.t('common.scored') }
])

const currentExamText = computed(() => {
  const option = examOptions.value.find(e => e.id === params.value.examId)
  return option ? option.title : userStore.t('common.all')
})

const currentStatusText = computed(() => {
  const option = statusOptions.value.find(s => s.value === params.value.status)
  return option ? option.label : userStore.t('common.all')
})

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

const onExamChange = (e) => {
  const index = e.detail.value
  params.value.examId = examOptions.value[index].id
  loadData()
}

const onStatusChange = (e) => {
  const index = e.detail.value
  params.value.status = statusOptions.value[index].value
  loadData()
}

const handleView = (item) => {
  uni.navigateTo({
    url: `/pages/teacher/exam-record-detail?examId=${item.examId}&recordId=${item.id}`
  })
}

const handleGrade = (item) => {
  uni.navigateTo({
    url: `/pages/teacher/exam-grade?examId=${item.examId}&recordId=${item.id}`
  })
}

const loadExams = async () => {
  try {
    const res = await examApi.page({ current: 1, size: 100 })
    if (res.code === 200) {
      exams.value = res.data.records || []
    }
  } catch (e) {
    console.error(e)
  }
}

const loadData = async () => {
  if (loadStatus.value === 'loading') return
  loadStatus.value = 'loading'
  current.value = 1
  tableData.value = []

  try {
    const res = await examRecordApi.page({
      current: current.value,
      size: size.value,
      examId: params.value.examId,
      status: params.value.status
    })
    if (res.code === 200) {
      tableData.value = res.data.records
      loadStatus.value = res.data.records.length >= size.value ? 'more' : 'noMore'
    } else {
      uni.showToast({ title: res.message || userStore.t('common.loadFailed'), icon: 'none' })
      loadStatus.value = 'more'
    }
  } catch (e) {
    console.error(e)
    uni.showToast({ title: userStore.t('common.networkError'), icon: 'none' })
    loadStatus.value = 'more'
  }
}

onMounted(() => {
  loadExams()
  loadData()
})
</script>

<style scoped>
.exam-record {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 140rpx 24rpx 24rpx;
  position: relative;
}

.toolbar {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 20rpx;
  flex: 1;
}

.picker {
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.search-btn {
  width: 160rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #f56c6c;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.record-list {
  margin-top: 24rpx;
}

.record-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.student-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.score-badge {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.score-badge.pass {
  background: #f0f9ff;
  color: #67c23a;
}

.score-badge.fail {
  background: #fef0f0;
  color: #f56c6c;
}

.record-info {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.info-text {
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.info-text.warning {
  color: #f56c6c;
}

.record-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 20rpx;
}

.action-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #f5f5f5;
  color: #666;
}

.action-btn.primary {
  background: #409eff;
  color: #fff;
}
</style>