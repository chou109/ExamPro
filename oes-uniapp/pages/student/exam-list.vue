<template>
  <view class="exam-list">
    <CustomNavBar :title="userStore.t('common.examList')" :showBack="true" />

    <view class="search-bar">
      <view class="search-input">
        <text class="icon-search">🔍</text>
        <input
          type="text"
          v-model="searchForm.keyword"
          :placeholder="userStore.t('student.searchExam')"
          @confirm="handleSearch"
        />
      </view>
      <view class="filter-row">
        <picker
          mode="selector"
          :range="statusOptions"
          range-key="label"
          @change="onStatusChange"
        >
          <view class="picker">
            <text>{{ currentStatusText }}</text>
            <text class="icon-arrow">▼</text>
          </view>
        </picker>
        <button class="search-btn" @click="handleSearch">{{ userStore.t('common.search') }}</button>
      </view>
    </view>

    <view class="exam-grid">
      <view class="exam-card" v-for="item in tableData" :key="item.id">
      <view class="exam-header">
        <text class="exam-title">{{ item.title }}</text>
        <view class="exam-status" :class="'status-' + getStatusClass(item)">
          <text>{{ getExamStatusText(item) }}</text>
        </view>
      </view>

      <view class="exam-info">
        <view class="info-item">
          <text class="icon-clock">⏱️</text>
          <text>{{ item.duration }} {{ userStore.t('common.minutes') }}</text>
        </view>
        <view class="info-item">
          <text class="icon-flag">🏆</text>
          <text>{{ userStore.t('common.total') }} {{ item.totalScore || item.paper?.totalScore || 0 }}{{ userStore.t('dashboard.scoreUnit') }}</text>
        </view>
        <view class="info-item">
          <text class="icon-calendar">📅</text>
          <text>{{ formatTime(item.startTime) }}</text>
        </view>
      </view>

      <view class="exam-actions">
        <button
          class="join-btn"
          :class="getButtonClass(item)"
          :disabled="!canJoin(item) && !canView(item)"
          @click="handleJoin(item)"
        >
          <text>{{ getButtonText(item) }}</text>
        </button>
      </view>
    </view>
    </view>

    <view class="load-more" v-if="loadStatus === 'loading'">
      <text>加载中...</text>
    </view>
    <view class="load-more" v-else-if="loadStatus === 'noMore'">
      <text>{{ userStore.t('common.noMore') }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/index.js'
import { examApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()
const tableData = ref([])
const searchForm = ref({
  keyword: '',
  status: ''
})

const statusOptions = computed(() => [
  { label: userStore.t('common.all'), value: '' },
  { label: userStore.t('common.pending'), value: 'PENDING' },
  { label: userStore.t('common.ongoing'), value: 'ONGOING' },
  { label: userStore.t('common.finished'), value: 'FINISHED' }
])

const currentStatusText = computed(() => {
  const option = statusOptions.value.find(o => o.value === searchForm.value.status)
  return option ? option.label : userStore.t('common.all')
})

const loadStatus = ref('more')

const formatTime = (time) => {
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

const getStatusClass = (item) => {
  if (item.studentStatus === 'AUTO_SUBMITTED') return 'danger'
  if (item.studentStatus === 'SUBMITTED') return 'success'
  if (item.status === 'ONGOING') return 'warning'
  return 'info'
}

const getExamStatusText = (item) => {
  if (item.studentStatus === 'AUTO_SUBMITTED') return userStore.t('student.autoSubmitted')
  if (item.studentStatus === 'SUBMITTED') return userStore.t('common.finished')
  if (item.status === 'ONGOING') return userStore.t('common.ongoing')
  return userStore.t('common.pending')
}

const canJoin = (item) => {
  return item.status === 'ONGOING' &&
    item.studentStatus !== 'SUBMITTED' &&
    item.studentStatus !== 'AUTO_SUBMITTED'
}

const canView = (item) => {
  return item.studentStatus === 'SUBMITTED' || item.studentStatus === 'AUTO_SUBMITTED'
}

const getButtonText = (item) => {
  if (item.studentStatus === 'SUBMITTED' || item.studentStatus === 'AUTO_SUBMITTED') {
    return userStore.t('student.viewDetail')
  }
  if (item.status === 'ONGOING') return userStore.t('student.enterExam')
  return userStore.t('student.waiting')
}

const getButtonClass = (item) => {
  if (item.studentStatus === 'SUBMITTED' || item.studentStatus === 'AUTO_SUBMITTED') {
    return 'btn-success'
  }
  if (item.status === 'ONGOING') return 'btn-danger'
  return 'btn-disabled'
}

const onStatusChange = (e) => {
  const index = e.detail.value
  searchForm.value.status = statusOptions.value[index].value
  handleSearch()
}

const handleJoin = (exam) => {
  uni.navigateTo({
    url: `/pages/student/exam-take?id=${exam.id}`
  })
}

const handleSearch = () => {
  loadStatus.value = 'more'
  loadData()
}

const loadData = async () => {
  if (loadStatus.value === 'loading') return
  loadStatus.value = 'loading'

  try {
    const params = {
      current: 1,
      size: 20,
      keyword: searchForm.value.keyword,
      status: searchForm.value.status
    }
    const res = await examApi.studentPage(params)
    if (res.code === 200) {
      tableData.value = res.data.records
      loadStatus.value = res.data.records.length >= 20 ? 'more' : 'noMore'
    } else {
      uni.showToast({
        title: res.message || userStore.t('common.failed'),
        icon: 'none'
      })
      loadStatus.value = 'more'
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: userStore.t('student.networkError'),
      icon: 'none'
    })
    loadStatus.value = 'more'
  }
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<style scoped>
.exam-list {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 0;
  padding-top: 140rpx;
  position: relative;
}

.search-bar {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 24rpx;
}

.search-input {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  margin-bottom: 20rpx;
}

.search-input input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 28rpx;
}

.icon-search, .icon-clock, .icon-flag, .icon-calendar {
  font-size: 28rpx;
}

.icon-arrow {
  font-size: 20rpx;
  color: #666;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.picker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.search-btn {
  flex-shrink: 0;
  width: 160rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #f56c6c;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.exam-grid {
  padding: 0 24rpx;
}

.exam-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.exam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.exam-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 16rpx;
}

.exam-status {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  flex-shrink: 0;
}

.status-success {
  background: #f0f9ff;
  color: #67c23a;
}

.status-warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-danger {
  background: #fef0f0;
  color: #f56c6c;
}

.status-info {
  background: #f4f4f5;
  color: #909399;
}

.exam-info {
  margin-bottom: 24rpx;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.info-item uni-icons {
  margin-right: 12rpx;
}

.exam-actions {
  display: flex;
  justify-content: flex-end;
}

.join-btn {
  width: 200rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  text-align: center;
}

.btn-danger {
  background: #f56c6c;
  color: #fff;
}

.btn-success {
  background: #67c23a;
  color: #fff;
}

.btn-disabled {
  background: #f5f5f5;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 32rpx;
  font-size: 26rpx;
  color: #999;
}
</style>