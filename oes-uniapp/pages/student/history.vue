<template>
  <view class="history">
    <CustomNavBar :title="userStore.t('common.history')" :showBack="true" />

    <!-- 内容区域 -->
    <view class="content-area">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input type="text" v-model="keyword" :placeholder="userStore.t('student.searchExam')" @confirm="handleSearch" />
      </view>
      <button class="search-btn" @click="handleSearch">{{ userStore.t('common.search') }}</button>
    </view>

    <!-- 卡片列表 -->
    <view class="card-list">
      <view class="card-item" v-for="item in tableData" :key="item.id">
        <view class="card-header">
          <text class="card-title">{{ item.exam?.title || item.examTitle || '未知考试' }}</text>
          <view class="score-badge" :class="(item.score || 0) >= 60 ? 'pass' : 'fail'">
            <text>{{ item.score || 0 }}{{ userStore.t('dashboard.scoreUnit') }}</text>
          </view>
        </view>

        <view class="card-info">
          <view class="info-row">
            <text class="clock-icon">🕐</text>
            <text class="info-text">{{ userStore.t('student.submitTime') }}：{{ formatTime(item.submitTime) }}</text>
          </view>
        </view>

        <view class="card-actions">
          <button class="detail-btn" @click="handleDetail(item)">{{ userStore.t('student.viewDetail') }}</button>
        </view>
      </view>
    </view>

    <view v-if="loadStatus === 'loading'" class="load-more">
      <text class="loading-text">{{ userStore.t('common.loading') }}...</text>
    </view>
    <view v-if="loadStatus === 'noMore'" class="load-more">
      <text class="loading-text">{{ userStore.t('common.noMoreData') }}</text>
    </view>

    <view v-if="!loading && tableData.length === 0" class="empty">
      <text class="empty-icon">📋</text>
      <text class="empty-text">{{ userStore.t('student.noHistory') }}</text>
    </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '../../store/index.js'
import { examRecordApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()
const tableData = ref([])
const keyword = ref('')
const loading = ref(false)
const current = ref(1)
const size = ref(10)
const loadStatus = ref('more')

const handleSearch = () => {
  current.value = 1
  tableData.value = []
  loadStatus.value = 'more'
  loadData()
}

const handleDetail = (item) => {
  uni.navigateTo({
    url: `/pages/student/exam-take?id=${item.examId || item.exam?.id}&recordId=${item.id}&review=1`
  })
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const loadData = async () => {
  if (loadStatus.value === 'loading') return
  loadStatus.value = 'loading'

  try {
    const params = {
      current: current.value,
      size: size.value,
      keyword: keyword.value
    }
    const res = await examRecordApi.getStudentHistory(params)
    if (res.code === 200) {
      const data = res.data.records
      tableData.value = [...tableData.value, ...data]
      loadStatus.value = data.length >= size.value ? 'more' : 'noMore'
      current.value++
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
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.history {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 0;
  padding-top: 140rpx;
}

.content-area {
  padding: 24rpx;
}

.search-bar {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  gap: 20rpx;
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #999;
}

.search-input input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 28rpx;
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

.card-list {
  margin-top: 24rpx;
}

.card-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.card-title {
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

.card-info {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.clock-icon {
  font-size: 28rpx;
  color: #666;
}

.info-text {
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.detail-btn {
  width: 200rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #409eff;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.load-more {
  text-align: center;
  padding: 24rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999;
}
</style>