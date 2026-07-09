<template>
  <view class="exam-edit">
    <view class="page-header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="title">{{ isEdit ? '编辑考试' : '创建考试' }}</text>
      <view class="header-right"></view>
    </view>

    <scroll-view class="form-body" scroll-y>
      <view class="card">
        <view class="form-item">
          <text class="form-label">考试标题 *</text>
          <input class="form-input" v-model="form.title" placeholder="请输入考试标题" />
        </view>

        <view class="form-item">
          <text class="form-label">选择试卷 *</text>
          <picker mode="selector" :range="papers" range-key="title" @change="onPaperChange">
            <view class="form-picker">
              <text>{{ selectedPaper?.title || '请选择试卷' }}</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">选择班级 *</text>
          <picker mode="selector" :range="classes" range-key="className" @change="onClassChange">
            <view class="form-picker">
              <text>{{ selectedClass?.className || '请选择班级' }}</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">考试时长（分钟）*</text>
          <input class="form-input" type="number" v-model="form.duration" placeholder="请输入考试时长" />
        </view>

        <view class="form-item">
          <text class="form-label">开始日期 *</text>
          <picker mode="date" :value="form.startDate" @change="onStartDateChange">
            <view class="form-picker">
              <text>{{ form.startDate || '请选择日期' }}</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">开始时间 *</text>
          <picker mode="time" :value="form.startTime" @change="onStartTimeChange">
            <view class="form-picker">
              <text>{{ form.startTime || '请选择时间' }}</text>
            </view>
          </picker>
        </view>
      </view>
    </scroll-view>

    <view class="form-footer">
      <button class="submit-btn" @click="submitForm">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { examApi, paperApi, classApi } from '../../utils/api.js'

const examId = ref('')
const isEdit = ref(false)

const papers = ref([])
const classes = ref([])

const selectedPaperId = ref(null)
const selectedClassId = ref(null)

const selectedPaper = ref(null)
const selectedClass = ref(null)

const form = reactive({
  title: '',
  duration: '',
  startDate: '',
  startTime: ''
})

const goBack = () => {
  uni.navigateBack()
}

const onPaperChange = (e) => {
  const index = e.detail.value
  if (papers.value[index]) {
    selectedPaperId.value = papers.value[index].id
    selectedPaper.value = papers.value[index]
  }
}

const onClassChange = (e) => {
  const index = e.detail.value
  if (classes.value[index]) {
    selectedClassId.value = classes.value[index].id
    selectedClass.value = classes.value[index]
  }
}

const onStartDateChange = (e) => {
  form.startDate = e.detail.value
}

const onStartTimeChange = (e) => {
  form.startTime = e.detail.value
}

const submitForm = async () => {
  if (!form.title.trim()) {
    uni.showToast({ title: '请输入考试标题', icon: 'none' })
    return
  }
  if (!selectedPaperId.value) {
    uni.showToast({ title: '请选择试卷', icon: 'none' })
    return
  }
  if (!selectedClassId.value) {
    uni.showToast({ title: '请选择班级', icon: 'none' })
    return
  }
  if (!form.duration) {
    uni.showToast({ title: '请输入考试时长', icon: 'none' })
    return
  }
  if (!form.startDate || !form.startTime) {
    uni.showToast({ title: '请选择开始时间', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '保存中...' })

    const startTime = `${form.startDate} ${form.startTime}:00`

    const examData = {
      id: examId.value || null,
      title: form.title,
      paperId: selectedPaperId.value,
      classIds: selectedClassId.value,
      duration: parseInt(form.duration),
      startTime: startTime
    }

    let res
    if (isEdit.value) {
      res = await examApi.update(examData)
    } else {
      res = await examApi.create(examData)
    }

    if (res.code === 200) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '保存失败', icon: 'none' })
    }
  } catch (e) {
    console.error('保存失败:', e)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const loadPapers = async () => {
  try {
    const res = await paperApi.page({ current: 1, size: 50 })
    if (res.code === 200) {
      papers.value = res.data.records || []
    }
  } catch (e) {
    console.error('加载试卷失败:', e)
  }
}

const loadClasses = async () => {
  try {
    const userId = uni.getStorageSync('userInfo')?.userId
    const res = await classApi.getMyClasses(userId)
    if (res.code === 200) {
      classes.value = res.data.map(item => item.class) || []
    }
  } catch (e) {
    console.error('加载班级失败:', e)
  }
}

const loadExamInfo = async () => {
  try {
    const res = await examApi.getById(examId.value)
    if (res.code === 200) {
      const data = res.data
      form.title = data.title
      form.duration = data.duration.toString()
      
      const date = new Date(data.startTime)
      form.startDate = date.toISOString().split('T')[0]
      form.startTime = date.toTimeString().slice(0, 5)
      
      selectedPaperId.value = data.paperId
      selectedClassId.value = data.classId
      
      selectedPaper.value = papers.value.find(p => p.id === data.paperId)
      selectedClass.value = classes.value.find(c => c.id === data.classId)
    }
  } catch (e) {
    console.error('加载考试信息失败:', e)
  }
}

onLoad((options) => {
  if (options.id) {
    examId.value = options.id
    isEdit.value = true
  }
  
  loadPapers()
  loadClasses()
  
  if (isEdit.value) {
    setTimeout(() => {
      loadExamInfo()
    }, 100)
  }
})
</script>

<style scoped>
.exam-edit {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
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

.form-body {
  flex: 1;
  padding: 24rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.form-item {
  margin-bottom: 28rpx;
  
  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
  }
  
  .form-input {
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
  }
  
  .form-picker {
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #666;
  }
}

.form-footer {
  padding: 24rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #dc2626;
    color: #fff;
    border-radius: 12rpx;
    font-size: 32rpx;
  }
}
</style>