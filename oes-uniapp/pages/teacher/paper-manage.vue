<template>
  <view class="paper-manage">
    <CustomNavBar :title="userStore.t('common.paperManage')" :showBack="true" />

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
      <button class="create-btn" @click="handleCreate">{{ userStore.t('common.createPaper') }}</button>
    </view>

    <!-- 试卷列表 -->
    <view class="paper-list">
      <view class="paper-item" v-for="item in tableData" :key="item.id">
        <view class="paper-header">
          <text class="paper-title">{{ item.title }}</text>
          <view class="paper-status" :class="item.status === 'PUBLISHED' ? 'status-success' : 'status-info'">
            <text>{{ item.status === 'PUBLISHED' ? userStore.t('common.published') : userStore.t('common.draft') }}</text>
          </view>
        </view>

        <view class="paper-info">
          <view class="info-row">
            <text class="info-icon">📚</text>
            <text class="info-text">{{ userStore.t('common.subject') }}：{{ getSubjectName(item.subjectId) }}</text>
          </view>
          <view class="info-row">
            <text class="info-icon">📝</text>
            <text class="info-text">{{ userStore.t('common.questionCount') }}：{{ item.questionCount }}{{ userStore.t('common.questions') }}</text>
          </view>
          <view class="info-row">
            <text class="info-icon">🏆</text>
            <text class="info-text">{{ userStore.t('common.totalScore') }}：{{ item.totalScore }}{{ userStore.t('common.score') }}</text>
          </view>
          <view class="info-row">
            <text class="info-icon">⏱</text>
            <text class="info-text">{{ userStore.t('common.duration') }}：{{ item.duration }}{{ userStore.t('common.minutes') }}</text>
          </view>
        </view>

        <view class="paper-actions">
          <button class="action-btn" @click="handleEdit(item)">{{ userStore.t('common.edit') }}</button>
          <button class="action-btn" @click="handlePreview(item)">{{ userStore.t('common.preview') }}</button>
          <button v-if="item.status === 'DRAFT'" class="action-btn success" @click="handlePublish(item)">{{ userStore.t('common.publish') }}</button>
          <button class="action-btn danger" @click="handleDelete(item)">{{ userStore.t('common.delete') }}</button>
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
import { paperApi, subjectApi } from '../../utils/api.js'
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
  { value: 'DRAFT', label: userStore.t('common.draft') },
  { value: 'PUBLISHED', label: userStore.t('common.published') }
])

const currentSubjectText = computed(() => {
  const option = subjectOptions.value.find(s => s.id === params.value.subjectId)
  return option ? option.name : userStore.t('common.allSubjects')
})

const currentStatusText = computed(() => {
  const option = statusOptions.value.find(s => s.value === params.value.status)
  return option ? option.label : userStore.t('common.allStatus')
})

const getSubjectName = (subjectId) => {
  const subject = subjects.value.find(s => s.id === subjectId)
  return subject ? subject.name : userStore.t('common.unknownSubject')
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
  uni.navigateTo({ url: '/pages/teacher/paper-edit' })
}

const handleEdit = (item) => {
  uni.navigateTo({ url: `/pages/teacher/paper-edit?id=${item.id}` })
}

const handlePreview = (item) => {
  uni.navigateTo({ url: `/pages/teacher/paper-preview?id=${item.id}` })
}

const handlePublish = async (item) => {
  uni.showModal({
    title: userStore.t('common.tip'),
    content: userStore.t('teacher.confirmPublish'),
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await paperApi.publish(item.id)
          if (result.code === 200) {
            uni.showToast({ title: userStore.t('common.publishedSuccess'), icon: 'success' })
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

const handleDelete = async (item) => {
  uni.showModal({
    title: userStore.t('common.warning'),
    content: userStore.t('common.confirmDelete'),
    cancelText: userStore.t('common.cancel'),
    confirmText: userStore.t('common.confirm'),
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await paperApi.delete(item.id)
          if (result.code === 200) {
            uni.showToast({ title: userStore.t('common.deletedSuccess'), icon: 'success' })
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
    const res = await paperApi.page({
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
.paper-manage {
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

.paper-list {
  margin-top: 24rpx;
}

.paper-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.paper-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.paper-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.paper-status {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.status-success {
  background: #f0f9ff;
  color: #67c23a;
}

.status-info {
  background: #f4f4f5;
  color: #909399;
}

.paper-info {
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

.paper-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.action-btn {
  flex: 0 0 calc(25% - 9rpx);
  min-width: 120rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  background: #f5f5f5;
  color: #666;
  padding: 0 12rpx;
  box-sizing: border-box;
}

.action-btn.success {
  background: #67c23a;
  color: #fff;
}

.action-btn.danger {
  background: #f56c6c;
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