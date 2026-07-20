<template>
  <view class="exam-manage">
    <CustomNavBar :title="userStore.t('common.examManage')" :showBack="true" />

    <!-- 工具栏 -->
    <view class="toolbar">
      <view class="toolbar-left">
        <picker mode="selector" :range="subjectOptions" range-key="name" @change="onSubjectChange">
          <view class="picker">{{ currentSubjectText }}</view>
        </picker>
        <picker mode="selector" :range="statusOptions" range-key="label" @change="onStatusChange">
          <view class="picker">{{ currentStatusText }}</view>
        </picker>
      </view>
      <button class="create-btn" @click="handleCreate">{{ userStore.t('common.publishExam') }}</button>
    </view>

    <!-- 考试列表 -->
    <view class="exam-list">
      <view class="exam-item" v-for="item in tableData" :key="item.id">
        <view class="exam-header">
          <text class="exam-title">{{ item.title }}</text>
          <view class="exam-status" :class="'status-' + item.status.toLowerCase()">
            <text>{{ statusText(item.status) }}</text>
          </view>
        </view>

        <view class="exam-info">
          <view class="info-row">
            <text class="info-icon">📚</text>
            <text class="info-text">{{ userStore.t('common.subject') }}：{{ getSubjectName(item.subjectId) }}</text>
          </view>
          <view class="info-row">
            <text class="info-icon">⏱</text>
            <text class="info-text">{{ userStore.t('common.duration') }}：{{ item.duration }}{{ userStore.t('common.minutes') }}</text>
          </view>
          <view class="info-row">
            <text class="info-icon">📅</text>
            <text class="info-text">{{ userStore.t('common.startTime') }}：{{ formatDateTime(item.startTime) }}</text>
          </view>
          <view class="info-row">
            <text class="info-icon">🏆</text>
            <text class="info-text">{{ userStore.t('common.totalScore') }}：{{ item.totalScore }}{{ userStore.t('common.score') }}</text>
          </view>
        </view>

        <view class="exam-actions">
          <button class="action-btn" @click="handleMonitor(item)">{{ userStore.t('common.monitor') }}</button>
          <button class="action-btn" @click="handleEdit(item)">{{ userStore.t('common.edit') }}</button>
          <button v-if="item.status === 'PENDING'" class="action-btn success" @click="handleStart(item)">{{ userStore.t('common.start') }}</button>
          <button v-if="item.status === 'ONGOING'" class="action-btn warning" @click="handleFinish(item)">{{ userStore.t('common.finish') }}</button>
          <button class="action-btn primary" @click="handleStats(item)">{{ userStore.t('common.statistics') }}</button>
        </view>
      </view>
    </view>

    <view v-if="loadStatus === 'loading'" class="load-more">
    <text class="loading-text">{{ userStore.t('common.loading') }}...</text>
  </view>
  <view v-if="loadStatus === 'noMore'" class="load-more">
    <text class="loading-text">{{ userStore.t('common.noMoreData') }}</text>
  </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { examApi, subjectApi } from '../../utils/api.js'
import { useUserStore } from '../../store/index.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()

const tableData = ref([])
const subjects = ref([])
const params = ref({
  subjectId: '',
  status: '',
  keyword: ''
})
const loadStatus = ref('more')
const current = ref(1)
const size = ref(10)

const subjectOptions = computed(() => {
  return [{ id: '', name: userStore.t('common.allSubjects') }, ...subjects.value]
})

const statusOptions = computed(() => [
  { value: '', label: userStore.t('common.allStatus') },
  { value: 'PENDING', label: userStore.t('common.pending') },
  { value: 'ONGOING', label: userStore.t('common.ongoing') },
  { value: 'FINISHED', label: userStore.t('common.finished') }
])

const currentSubjectText = computed(() => {
  const option = subjectOptions.value.find(s => s.id === params.value.subjectId)
  return option ? option.name : userStore.t('common.allSubjects')
})

const currentStatusText = computed(() => {
  const option = statusOptions.value.find(s => s.value === params.value.status)
  return option ? option.label : userStore.t('common.allStatus')
})

const statusText = (status) => {
  return {
    PENDING: userStore.t('common.pending'),
    ONGOING: userStore.t('common.ongoing'),
    FINISHED: userStore.t('common.finished')
  }[status] || status
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

const onSubjectChange = (e) => {
  const index = e.detail.value
  params.value.subjectId = subjectOptions.value[index].id
  loadData()
}

const onStatusChange = (e) => {
  const index = e.detail.value
  params.value.status = statusOptions[index].value
  loadData()
}

const handleCreate = () => {
  uni.navigateTo({ url: '/pages/teacher/exam-edit' })
}

const handleMonitor = (item) => {
  uni.navigateTo({ url: `/pages/teacher/exam-monitor?id=${item.id}` })
}

const handleEdit = (item) => {
  uni.navigateTo({ url: `/pages/teacher/exam-edit?id=${item.id}` })
}

const handleStart = async (item) => {
  uni.showModal({
    title: userStore.t('common.tip'),
    content: userStore.t('common.confirmStart'),
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await examApi.start(item.id)
          if (result.code === 200) {
            uni.showToast({ title: userStore.t('common.examStarted'), icon: 'success' })
            loadData()
          } else {
            uni.showToast({ title: result.message || userStore.t('common.operationFailed'), icon: 'none' })
          }
        } catch (e) {
          uni.showToast({ title: userStore.t('common.networkError'), icon: 'none' })
        }
      }
    }
  })
}

const handleFinish = async (item) => {
  uni.showModal({
    title: userStore.t('common.tip'),
    content: userStore.t('common.confirmFinish'),
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await examApi.finish(item.id)
          if (result.code === 200) {
            uni.showToast({ title: userStore.t('common.examFinished'), icon: 'success' })
            loadData()
          } else {
            uni.showToast({ title: result.message || userStore.t('common.operationFailed'), icon: 'none' })
          }
        } catch (e) {
          uni.showToast({ title: userStore.t('common.networkError'), icon: 'none' })
        }
      }
    }
  })
}

const handleStats = (item) => {
  uni.navigateTo({
    url: `/pages/admin/statistics?examId=${item.id}`
  })
}

const loadSubjects = async () => {
  try {
    const res = await subjectApi.list()
    if (res.code === 200) {
      subjects.value = res.data
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
    const res = await examApi.page({
      current: current.value,
      size: size.value,
      subjectId: params.value.subjectId,
      status: params.value.status,
      keyword: params.value.keyword
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
  loadSubjects()
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<style scoped>
.exam-manage {
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

.create-btn {
  width: 200rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #f56c6c;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.exam-list {
  margin-top: 24rpx;
}

.exam-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.exam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.exam-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.exam-status {
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

.exam-info {
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

.exam-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.action-btn {
  flex: 0 0 calc(33.33% - 8rpx);
  min-width: 140rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  background: #f5f5f5;
  color: #666;
  padding: 0 16rpx;
  box-sizing: border-box;
}

.action-btn.primary {
  background: #409eff;
  color: #fff;
}

.action-btn.success {
  background: #67c23a;
  color: #fff;
}

.action-btn.warning {
  background: #e6a23c;
  color: #fff;
}

.load-more {
  text-align: center;
  padding: 24rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}
</style>