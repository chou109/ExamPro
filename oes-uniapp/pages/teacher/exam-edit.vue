<template>
  <view class="exam-edit">
    <CustomNavBar :title="isEdit ? userStore.t('common.editExam') : userStore.t('common.createExam')" :showBack="true" />

    <scroll-view class="form-body" scroll-y>
      <view class="card">
        <view class="card-header">
          <text class="card-title">{{ userStore.t('common.basicInfo') }}</text>
        </view>
        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.examTitle') }} *</text>
          <input class="form-input" v-model="form.title" :placeholder="userStore.t('teacher.enterExamTitle')" />
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.selectPaper') }} *</text>
          <picker mode="selector" :range="papers" range-key="title" @change="onPaperChange">
            <view class="form-picker">
              <text>{{ selectedPaper?.title || userStore.t('teacher.selectPaper') }}</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.selectClass') }} *</text>
          <picker mode="selector" :range="classes" range-key="className" @change="onClassChange">
            <view class="form-picker">
              <text>{{ selectedClass?.className || userStore.t('teacher.selectClass') }}</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.examDuration') }} *</text>
          <input class="form-input" type="number" v-model="form.duration" :placeholder="userStore.t('teacher.enterDuration')" />
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.startDate') }} *</text>
          <picker mode="date" :value="form.startDate" @change="onStartDateChange">
            <view class="form-picker">
              <text>{{ form.startDate || userStore.t('teacher.selectDate') }}</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.startTime') }} *</text>
          <picker mode="time" :value="form.startTime" @change="onStartTimeChange">
            <view class="form-picker">
              <text>{{ form.startTime || userStore.t('teacher.selectTime') }}</text>
            </view>
          </picker>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <text class="card-title">{{ userStore.t('teacher.examSettings') }}</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.passRate') }} (%)</text>
          <input class="form-input" type="number" v-model="form.passRate" :placeholder="userStore.t('teacher.default60')" />
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.shuffleQuestions') }}</text>
          <view class="form-switch-wrap">
            <switch :checked="form.shuffleQuestions" @change="onShuffleQuestionsChange" color="#dc2626" />
            <text class="switch-desc">{{ userStore.t('teacher.shuffleQuestionsDesc') }}</text>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.shuffleOptions') }}</text>
          <view class="form-switch-wrap">
            <switch :checked="form.shuffleOptions" @change="onShuffleOptionsChange" color="#dc2626" />
            <text class="switch-desc">{{ userStore.t('teacher.shuffleOptionsDesc') }}</text>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.leaveDetection') }}</text>
          <view class="form-switch-wrap">
            <switch :checked="form.leaveDetection" @change="onLeaveDetectionChange" color="#dc2626" />
            <text class="switch-desc">{{ userStore.t('teacher.leaveDetectionDesc') }}</text>
          </view>
        </view>

        <view class="form-item" v-if="form.leaveDetection">
          <text class="form-label">{{ userStore.t('teacher.maxLeaveCount') }}</text>
          <input class="form-input" type="number" v-model="form.maxLeaveCount" :placeholder="userStore.t('teacher.maxLeaveCountDesc')" />
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('teacher.allowViewAfterExam') }}</text>
          <view class="form-switch-wrap">
            <switch :checked="form.allowViewAfterExam" @change="onAllowViewAfterExamChange" color="#dc2626" />
            <text class="switch-desc">{{ userStore.t('teacher.allowViewAfterExamDesc') }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="form-footer">
      <button class="submit-btn" @click="submitForm">{{ userStore.t('common.save') }}</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/index.js'
import { examApi, paperApi, classApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()

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
  startTime: '',
  passRate: '60',
  shuffleQuestions: false,
  shuffleOptions: false,
  leaveDetection: false,
  maxLeaveCount: '3',
  allowViewAfterExam: false
})

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

const onShuffleQuestionsChange = (e) => {
  form.shuffleQuestions = e.detail.value
}

const onShuffleOptionsChange = (e) => {
  form.shuffleOptions = e.detail.value
}

const onLeaveDetectionChange = (e) => {
  form.leaveDetection = e.detail.value
}

const onAllowViewAfterExamChange = (e) => {
  form.allowViewAfterExam = e.detail.value
}

const submitForm = async () => {
  if (!form.title.trim()) {
    uni.showToast({ title: userStore.t('teacher.enterExamTitle'), icon: 'none' })
    return
  }
  if (!selectedPaperId.value) {
    uni.showToast({ title: userStore.t('teacher.selectPaper'), icon: 'none' })
    return
  }
  if (!selectedClassId.value) {
    uni.showToast({ title: userStore.t('teacher.selectClass'), icon: 'none' })
    return
  }
  if (!form.duration) {
    uni.showToast({ title: userStore.t('teacher.enterDuration'), icon: 'none' })
    return
  }
  if (!form.startDate || !form.startTime) {
    uni.showToast({ title: userStore.t('teacher.selectStartTime'), icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: userStore.t('common.saving') })

    const startTime = `${form.startDate} ${form.startTime}:00`

    const examData = {
      id: examId.value || null,
      title: form.title,
      paperId: selectedPaperId.value,
      classId: selectedClassId.value,
      duration: parseInt(form.duration),
      startTime: startTime,
      passScore: parseInt(form.passRate) || 60,
      shuffleQuestions: form.shuffleQuestions ? 1 : 0,
      shuffleOptions: form.shuffleOptions ? 1 : 0,
      leaveDetection: form.leaveDetection ? 1 : 0,
      maxLeaveCount: parseInt(form.maxLeaveCount) || 3,
      allowViewAfterExam: form.allowViewAfterExam ? 1 : 0
    }

    let res
    if (isEdit.value) {
      res = await examApi.update(examData)
    } else {
      res = await examApi.create(examData)
    }

    if (res.code === 200) {
      uni.showToast({ title: userStore.t('common.saveSuccess'), icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || userStore.t('common.saveFailed'), icon: 'none' })
    }
  } catch (e) {
    console.error('保存失败:', e)
    uni.showToast({ title: userStore.t('common.saveFailed'), icon: 'none' })
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
    const userInfo = uni.getStorageSync('userInfo')
    const userId = userInfo?.id || userInfo?.userId
    const res = await classApi.getMyClasses(userId)
    if (res.code === 200) {
      classes.value = res.data || []
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
      
      if (data.passScore) {
        form.passRate = data.passScore.toString()
      }
      
      if (data.allowViewAfterExam !== undefined) {
        form.allowViewAfterExam = data.allowViewAfterExam === 1
      }
      
      if (data.shuffleQuestions !== undefined) {
        form.shuffleQuestions = data.shuffleQuestions === 1
      }
      if (data.shuffleOptions !== undefined) {
        form.shuffleOptions = data.shuffleOptions === 1
      }
      if (data.leaveDetection !== undefined) {
        form.leaveDetection = data.leaveDetection === 1
      }
      if (data.maxLeaveCount !== undefined) {
        form.maxLeaveCount = data.maxLeaveCount.toString()
      }
    }
  } catch (e) {
    console.error('加载考试信息失败:', e)
  }
}

onLoad(async (options) => {
  if (options.id) {
    examId.value = options.id
    isEdit.value = true
  }
  
  await loadPapers()
  await loadClasses()
  
  if (isEdit.value) {
    loadExamInfo()
  }
})
</script>

<style scoped>
.exam-edit {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  padding-top: 140rpx;
}

.form-body {
  flex: 1;
  padding: 24rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.card-header {
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
  
  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    position: relative;
    padding-left: 16rpx;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 32rpx;
      background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
      border-radius: 3rpx;
    }
  }
}

.form-item {
  padding: 24rpx 0;
  
  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
    font-weight: 500;
  }
  
  .form-input {
    height: 80rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    border: 1rpx solid #e9ecef;
    
    &:focus {
      border-color: #dc2626;
      background: #fff;
    }
  }
  
  .form-picker {
    height: 80rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #666;
    border: 1rpx solid #e9ecef;
  }
  
  .form-switch-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .switch-desc {
      font-size: 24rpx;
      color: #999;
      flex: 1;
      margin-left: 16rpx;
    }
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
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: #fff;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: bold;
    box-shadow: 0 4rpx 16rpx rgba(220, 38, 38, 0.3);
  }
}
</style>