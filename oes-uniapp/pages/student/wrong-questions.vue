<template>
  <view class="wrong-questions">
    <CustomNavBar :title="userStore.t('common.wrongQuestions')" :showBack="true" />

    <!-- 工具栏 -->
    <view class="toolbar">
      <view class="toolbar-left">
        <picker
          mode="selector"
          :range="subjectOptions"
          range-key="name"
          @change="onSubjectChange"
        >
          <view class="picker">
            <text>{{ currentSubjectText }}</text>
            <text class="picker-icon">▼</text>
          </view>
        </picker>
        <picker
          mode="selector"
          :range="statusOptions"
          range-key="label"
          @change="onStatusChange"
        >
          <view class="picker">
            <text>{{ currentStatusText }}</text>
            <text class="picker-icon">▼</text>
          </view>
        </picker>
      </view>
      <button class="search-btn" @click="loadData">{{ userStore.t('common.search') }}</button>
    </view>

    <!-- 题目列表 -->
    <view class="question-list">
      <view class="question-item" v-for="item in tableData" :key="item.id">
        <view class="question-content">
          <text class="question-text">{{ item.content }}</text>
        </view>

        <view class="question-meta">
          <view class="meta-row">
            <view class="tag" :class="getTagClass(item.type)">
              <text>{{ isMultiChoiceItem(item) ? userStore.t('student.multipleChoice') : typeText(item.type) }}</text>
            </view>
            <view class="tag" :class="item.mastered === 1 ? 'tag-success' : 'tag-warning'">
              <text>{{ item.mastered === 1 ? userStore.t('student.mastered') : userStore.t('student.notMastered') }}</text>
            </view>
          </view>

          <view class="progress-row">
            <text class="progress-label">{{ userStore.t('student.passRateText') }}：</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: getPassRate(item) + '%' }"></view>
            </view>
            <text class="progress-text">{{ getPassRate(item) }}%</text>
          </view>

          <text class="practice-count">{{ userStore.t('student.practiceCount') }}：{{ item.practicedCount }}</text>
        </view>

        <view class="question-actions">
          <button class="action-btn" @click="handleViewAnswer(item)">{{ userStore.t('student.viewAnswer') }}</button>
          <button class="action-btn primary" @click="handlePractice(item)">{{ userStore.t('student.practice') }}</button>
          <button
            class="action-btn"
            :class="item.mastered === 1 ? 'warning' : 'success'"
            @click="handleToggleMastered(item)"
          >
            {{ item.mastered === 1 ? userStore.t('student.markNotMastered') : userStore.t('student.markMastered') }}
          </button>
        </view>
      </view>
    </view>

    <view class="load-more">
    <text v-if="loadStatus === 'loading'" class="load-more-text">{{ userStore.t('student.loadingMore') }}</text>
    <text v-else-if="loadStatus === 'noMore'" class="load-more-text">{{ userStore.t('student.noMoreData') }}</text>
    <text v-else class="load-more-text load-more-more">{{ userStore.t('student.clickLoadMore') }}</text>
  </view>

    <!-- 查看答案弹窗 -->
    <view v-if="answerVisible" class="modal" @click="answerVisible = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ userStore.t('student.viewAnswer') }}</text>
          <view class="modal-close" @click="answerVisible = false">
            <text class="close-icon">✕</text>
          </view>
        </view>

        <view v-if="viewingAnswer" class="answer-content">
          <view class="question-type-tag">
            <text>{{ typeText(viewingAnswer.type) }}</text>
          </view>
          <text class="answer-question-text">{{ viewingAnswer.content }}</text>

          <view class="answer-row">
            <text class="label">{{ userStore.t('student.wrongAnswer') }}：</text>
            <text class="value wrong">{{ viewingAnswer.wrongAnswer || userStore.t('common.noData') }}</text>
          </view>

          <view class="answer-row">
            <text class="label">{{ userStore.t('student.correctAnswer') }}：</text>
            <text class="value correct">{{ viewingAnswer.correctAnswer }}</text>
          </view>

          <view v-if="viewingAnswer.analysis" class="analysis">
            <text class="label">{{ userStore.t('student.analysis') }}：</text>
            <text class="value">{{ viewingAnswer.analysis }}</text>
          </view>
        </view>

        <view class="modal-footer">
          <button class="close-btn" @click="answerVisible = false">{{ userStore.t('common.cancel') }}</button>
        </view>
      </view>
    </view>

    <!-- 练习弹窗 -->
    <view v-if="practiceVisible" class="modal" @click="practiceVisible = false">
      <view class="modal-content practice-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ userStore.t('student.practice') }}</text>
          <view class="modal-close" @click="practiceVisible = false">
            <text class="close-icon">✕</text>
          </view>
        </view>

        <view v-if="practicingItem" class="practice-body">
          <view class="question-type-tag">
            <text>{{ isMultiChoice() ? userStore.t('student.multipleChoice') : typeText(practicingItem.type) }}</text>
          </view>
          <text class="answer-question-text">{{ practicingItem.content }}</text>

          <view v-if="practicingItem.options" class="options-list">
            <view
              v-for="(option, index) in parseOptions(practicingItem.options)"
              :key="index"
              class="option-item"
              :class="{ selected: userAnswer.includes(option.key), correct: showPracticeResult && isCorrectOption(option.key), wrong: showPracticeResult && isWrongOption(option.key) }"
              @click="selectOption(option.key)"
            >
              <text class="option-key">{{ option.key }}</text>
              <text class="option-value">{{ option.value }}</text>
            </view>
          </view>

          <view v-if="showPracticeResult" class="practice-result">
            <view class="result-row" :class="isAnswerCorrect ? 'correct' : 'wrong'">
              <text class="result-icon">{{ isAnswerCorrect ? '✓' : '✗' }}</text>
              <text class="result-text">{{ isAnswerCorrect ? userStore.t('student.answerCorrect') : userStore.t('student.answerWrong') }}</text>
            </view>
            <view class="answer-row">
              <text class="label">{{ userStore.t('student.yourAnswer') }}：</text>
              <text class="value" :class="isAnswerCorrect ? 'correct' : 'wrong'">{{ formatAnswer(userAnswer) }}</text>
            </view>
            <view class="answer-row">
              <text class="label">{{ userStore.t('student.correctAnswer') }}：</text>
              <text class="value correct">{{ practicingItem.correctAnswer }}</text>
            </view>
            <view v-if="practicingItem.analysis" class="analysis">
              <text class="label">{{ userStore.t('student.analysis') }}：</text>
              <text class="value">{{ practicingItem.analysis }}</text>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <button v-if="!showPracticeResult" class="close-btn primary" @click="submitPractice">{{ userStore.t('common.submit') }}</button>
          <button v-else class="close-btn" @click="practiceVisible = false">{{ userStore.t('common.cancel') }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../../store/index.js'
import { wrongQuestionApi, subjectApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()
const tableData = ref([])
const subjects = ref([])
const params = ref({
  subjectId: '',
  mastered: ''
})
const loadStatus = ref('more')
const current = ref(1)
const size = ref(10)
const answerVisible = ref(false)
const viewingAnswer = ref(null)
const practiceVisible = ref(false)
const practicingItem = ref(null)
const userAnswer = ref([])
const showPracticeResult = ref(false)

const typeMap = computed(() => ({
  SINGLE_CHOICE: userStore.t('common.singleChoice'),
  MULTIPLE_CHOICE: userStore.t('common.multipleChoice'),
  JUDGMENT: userStore.t('common.trueFalse'),
  FILL_BLANK: userStore.t('common.fillBlank'),
  ESSAY: userStore.t('common.shortAnswer'),
  PROGRAMMING: userStore.t('common.programming')
}))

const subjectOptions = computed(() => {
  return [{ id: '', name: userStore.t('student.allSubjects') }, ...subjects.value]
})

const statusOptions = computed(() => [
  { value: '', label: userStore.t('common.all') },
  { value: '0', label: userStore.t('student.notMastered') },
  { value: '1', label: userStore.t('student.mastered') }
])

const currentSubjectText = computed(() => {
  const option = subjectOptions.value.find(s => s.id === params.value.subjectId)
  return option ? option.name : userStore.t('student.allSubjects')
})

const currentStatusText = computed(() => {
  const option = statusOptions.value.find(s => s.value === params.value.mastered)
  return option ? option.label : userStore.t('common.all')
})

const typeText = (type) => typeMap.value[type] || type

const getTagClass = (type) => {
  return {
    'tag-info': true
  }
}

const getPassRate = (item) => {
  if (!item.practicedCount || item.practicedCount === 0) return 0
  return Math.round((item.correctCount / item.practicedCount) * 100)
}

const onSubjectChange = (e) => {
  const index = e.detail.value
  params.value.subjectId = subjectOptions.value[index].id
  loadData()
}

const onStatusChange = (e) => {
  const index = e.detail.value
  params.value.mastered = statusOptions.value[index].value
  loadData()
}

const handleViewAnswer = (item) => {
  viewingAnswer.value = item
  answerVisible.value = true
}

const handlePractice = (item) => {
  practicingItem.value = item
  userAnswer.value = []
  showPracticeResult.value = false
  practiceVisible.value = true
}

const parseOptions = (options) => {
  try {
    const parsed = typeof options === 'string' ? JSON.parse(options) : options
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        key: item.key || '',
        value: item.content || item.value || ''
      }))
    }
    return Object.entries(parsed).map(([key, value]) => ({ key, value }))
  } catch {
    return []
  }
}

const isMultiChoiceItem = (item) => {
  const type = item?.type
  const correctAnswer = item?.correctAnswer || ''
  return type === 'MULTIPLE_CHOICE' || correctAnswer.includes(',')
}

const isMultiChoice = () => {
  return isMultiChoiceItem(practicingItem.value)
}

const selectOption = (key) => {
  if (showPracticeResult.value) return
  if (isMultiChoice()) {
    const index = userAnswer.value.indexOf(key)
    if (index > -1) {
      userAnswer.value.splice(index, 1)
    } else {
      userAnswer.value.push(key)
    }
  } else {
    userAnswer.value = [key]
  }
}

const getCorrectAnswers = () => {
  const correct = practicingItem.value?.correctAnswer || ''
  return correct.split(',').map(a => a.trim()).filter(a => a)
}

const isCorrectOption = (key) => {
  return getCorrectAnswers().includes(key)
}

const isWrongOption = (key) => {
  return userAnswer.value.includes(key) && !isCorrectOption(key)
}

const isAnswerCorrect = computed(() => {
  const user = [...userAnswer.value].sort()
  const correct = getCorrectAnswers().sort()
  if (user.length !== correct.length) return false
  return user.every((val, idx) => val === correct[idx])
})

const formatAnswer = (answer) => {
  return answer.length > 0 ? answer.join('') : userStore.t('student.unanswered')
}

const submitPractice = async () => {
  if (userAnswer.value.length === 0) {
    uni.showToast({
      title: userStore.t('student.pleaseSelectAnswer'),
      icon: 'none'
    })
    return
  }

  try {
    await wrongQuestionApi.practice(practicingItem.value.id)

    if (isAnswerCorrect.value) {
      await wrongQuestionApi.correct(practicingItem.value.id)
    }

    showPracticeResult.value = true

    const idx = tableData.value.findIndex(item => item.id === practicingItem.value.id)
    if (idx > -1) {
      tableData.value[idx].practicedCount++
      if (isAnswerCorrect.value) {
        tableData.value[idx].correctCount++
      }
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: userStore.t('common.failed'),
      icon: 'none'
    })
  }
}

const handleToggleMastered = async (item) => {
  try {
    const newMastered = item.mastered === 1 ? 0 : 1
    const res = await wrongQuestionApi.updateMastered(item.id, newMastered)
    if (res.code === 200) {
      uni.showToast({
        title: userStore.t('common.success'),
        icon: 'success'
      })
      item.mastered = newMastered
    } else {
      uni.showToast({
        title: res.message || userStore.t('common.failed'),
        icon: 'none'
      })
    }
  } catch (e) {
    uni.showToast({
      title: userStore.t('student.networkError'),
      icon: 'none'
    })
  }
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
    const res = await wrongQuestionApi.page({
      current: current.value,
      size: size.value,
      subjectId: params.value.subjectId,
      mastered: params.value.mastered,
      userId: userStore.userId
    })
    if (res.code === 200) {
      tableData.value = res.data.records
      loadStatus.value = res.data.records.length >= size.value ? 'more' : 'noMore'
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
  loadSubjects()
  loadData()
})
</script>

<style scoped>
.wrong-questions {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 0;
  padding-top: 140rpx;
  position: relative;
}

.toolbar {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 24rpx;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.picker-icon {
  font-size: 20rpx;
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

.question-list {
  margin-top: 24rpx;
  padding: 0 24rpx;
}

.question-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.question-content {
  margin-bottom: 16rpx;
}

.question-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.question-meta {
  margin-bottom: 20rpx;
}

.meta-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.tag {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.tag-info {
  background: #f4f4f5;
  color: #909399;
}

.tag-success {
  background: #f0f9ff;
  color: #67c23a;
}

.tag-warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.progress-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.progress-label {
  font-size: 28rpx;
  color: #666;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background: #f5f5f5;
  border-radius: 6rpx;
  margin: 0 12rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #409eff;
  transition: width 0.3s;
}

.progress-text {
  font-size: 28rpx;
  color: #409eff;
  font-weight: bold;
}

.practice-count {
  font-size: 28rpx;
  color: #666;
}

.question-actions {
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

.action-btn.success {
  background: #67c23a;
  color: #fff;
}

.action-btn.warning {
  background: #e6a23c;
  color: #fff;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 90%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  padding: 8rpx;
}

.close-icon {
  font-size: 32rpx;
  color: #999;
}

.answer-content {
  padding: 32rpx;
}

.question-type-tag {
  display: inline-block;
  padding: 8rpx 16rpx;
  background: #f4f4f5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #909399;
  margin-bottom: 16rpx;
}

.answer-question-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 24rpx;
  display: block;
}

.answer-row {
  margin-bottom: 16rpx;
}

.answer-row .label {
  font-size: 28rpx;
  color: #666;
  margin-right: 16rpx;
}

.answer-row .value {
  font-size: 28rpx;
  color: #333;
}

.answer-row .value.wrong {
  color: #f56c6c;
}

.answer-row .value.correct {
  color: #67c23a;
}

.analysis {
  margin-top: 24rpx;
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.analysis .label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.analysis .value {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.modal-footer {
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #eee;
}

.close-btn {
  width: 100%;
  height: 72rpx;
  line-height: 72rpx;
  background: #409eff;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.load-more {
  padding: 32rpx;
  text-align: center;
}

.load-more-text {
  font-size: 28rpx;
  color: #999;
}

.load-more-more {
  color: #409eff;
}

.practice-content {
  max-width: 700rpx;
}

.practice-body {
  padding: 32rpx;
}

.options-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.option-item.selected {
  background: #ecf5ff;
  border-color: #409eff;
}

.option-item.correct {
  background: #f0f9ff;
  border-color: #67c23a;
}

.option-item.wrong {
  background: #fef0f0;
  border-color: #f56c6c;
}

.option-key {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  background: #fff;
  border-radius: 50%;
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  margin-right: 16rpx;
}

.option-item.selected .option-key {
  background: #409eff;
  color: #fff;
}

.option-item.correct .option-key {
  background: #67c23a;
  color: #fff;
}

.option-item.wrong .option-key {
  background: #f56c6c;
  color: #fff;
}

.option-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.practice-result {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #eee;
}

.result-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.result-row.correct {
  color: #67c23a;
}

.result-row.wrong {
  color: #f56c6c;
}

.result-icon {
  font-size: 36rpx;
  font-weight: bold;
  margin-right: 12rpx;
}

.result-text {
  font-size: 32rpx;
  font-weight: bold;
}

.close-btn.primary {
  background: #67c23a;
}
</style>