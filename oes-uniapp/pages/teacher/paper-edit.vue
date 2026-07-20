<template>
  <view class="paper-edit">
    <CustomNavBar :title="isEdit ? userStore.t('common.editPaper') : userStore.t('common.createPaper')" :showBack="true" />

    <scroll-view class="form-body" scroll-y>
      <view class="card">
        <view class="form-item">
          <text class="form-label">{{ userStore.t('common.paperTitle') }} *</text>
          <input class="form-input" v-model="form.title" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.paperTitle')" />
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('common.subject') }} *</text>
          <picker mode="selector" :range="subjects" range-key="name" @change="onSubjectChange">
            <view class="form-picker">
              <text>{{ selectedSubject?.name || userStore.t('common.selectSubjectFirst') }}</text>
            </view>
          </picker>
        </view>

        <view class="form-row">
          <view class="form-item-half">
            <text class="form-label">{{ userStore.t('teacher.examDuration') }}</text>
            <input class="form-input" type="number" v-model="form.duration" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('teacher.examDuration')" />
          </view>
          <view class="form-item-half">
            <text class="form-label">{{ userStore.t('common.totalScore') }}</text>
            <view class="form-input readonly">
              <text>{{ totalScore }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('common.passRate') }}</text>
          <view class="pass-rate-row">
            <input class="form-input rate-input" type="number" v-model="form.passRate" :placeholder="userStore.t('teacher.default60')" />
            <text class="rate-unit">%</text>
          </view>
          <text class="pass-score-info">{{ userStore.t('common.passScore') }}：{{ passScore }}{{ userStore.t('common.score') }}</text>
        </view>

        <view class="form-item">
          <text class="form-label">{{ userStore.t('common.paperDesc') }}</text>
          <textarea class="form-textarea" v-model="form.description" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.paperDesc')" />
        </view>
      </view>

      <view class="card" v-if="selectedSubjectId">
        <view class="card-header">
          <text class="card-title">{{ userStore.t('teacher.questionSettings') }}</text>
        </view>

        <view class="selector-toolbar">
          <input class="toolbar-search-input" v-model="searchKeyword" :placeholder="userStore.t('teacher.searchQuestion')" @confirm="searchQuestions" />
          <picker mode="selector" :range="filterTypeOptions" range-key="label" @change="onFilterTypeChange">
            <view class="toolbar-filter-picker">
              <text>{{ currentFilterType.label }}</text>
            </view>
          </picker>
          <button class="toolbar-search-btn" @click="searchQuestions">{{ userStore.t('common.search') }}</button>
          <button class="toolbar-clear-btn" @click="clearSelection">{{ userStore.t('teacher.clearSelection') }}</button>
          <text class="toolbar-subject-tip">{{ userStore.t('teacher.currentSubject') }}：{{ selectedSubject?.name }}</text>
        </view>

        <view class="batch-score-setting" v-if="selectedQuestions.length > 0">
          <text class="batch-setting-title">{{ userStore.t('teacher.batchSetScore') }}：</text>
          <picker mode="selector" :range="questionTypes" range-key="label" @change="onBatchTypeChange">
            <view class="batch-type-picker">
              <text>{{ batchType.label || userStore.t('teacher.selectQuestionType') }}</text>
            </view>
          </picker>
          <input class="batch-score-input" type="number" v-model="batchScore" :placeholder="userStore.t('teacher.scoreHint')" />
          <button class="batch-apply-btn" @click="applyBatchScore">{{ userStore.t('teacher.applyToSelected') }}</button>
        </view>

        <view class="question-list" v-if="questions.length > 0">
          <view class="question-item" v-for="q in questions" :key="q.id">
            <view class="question-checkbox-wrapper" @click="toggleQuestion(q)">
              <view :class="['question-checkbox', { checked: isQuestionSelected(q.id) }]">
                <text v-if="isQuestionSelected(q.id)">✓</text>
              </view>
            </view>
            <view :class="['question-type-tag', getTypeClass(q.type)]">
              <text>{{ getTypeText(q.type) }}</text>
            </view>
            <view class="question-content" :class="{ 'selected': isQuestionSelected(q.id) }">
              <text>{{ truncate(q.content, 60) }}</text>
            </view>
            <view class="question-score-box" @click="editQuestionScore(q.id)">
              <text class="score-num">{{ questionScores[q.id] || q.score || 5 }}</text>
              <text class="score-unit">{{ userStore.t('common.score') }}</text>
            </view>
          </view>
        </view>

        <view class="empty" v-else-if="!isSearching">
          <text class="empty-text">{{ userStore.t('common.noQuestions') }}</text>
        </view>
        <view class="loading-text" v-if="isSearching">
          <text>{{ userStore.t('common.loading') }}</text>
        </view>

        <view class="selected-info" v-if="selectedQuestions.length > 0">
          <view class="info-row">
            <view class="info-item">
              <text>{{ userStore.t('teacher.selected') }}</text>
              <text class="info-num">{{ selectedQuestions.length }}</text>
              <text>{{ userStore.t('common.questions') }}</text>
            </view>
            <view class="info-divider"></view>
            <view class="info-item">
              <text>{{ userStore.t('common.totalScore') }}</text>
              <text class="info-num">{{ totalScore }}</text>
              <text>{{ userStore.t('common.score') }}</text>
            </view>
            <view class="info-divider"></view>
            <view class="info-item">
              <text>{{ userStore.t('common.passScore') }}</text>
              <text class="info-num pass">{{ passScore }}</text>
              <text>{{ userStore.t('common.score') }}</text>
            </view>
          </view>
          <view class="type-stats">
            <view class="type-stat-item" v-for="(stat, type) in typeStatistics" :key="type">
              <text>{{ getTypeText(type) }}：</text>
              <text class="stat-num">{{ stat.count }}</text>
              <text>{{ userStore.t('common.questions') }}</text>
              <text class="stat-sep">/</text>
              <text class="stat-num">{{ stat.score }}</text>
              <text>{{ userStore.t('common.score') }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="card" v-else>
        <view class="empty-hint">
          <text class="empty-text">{{ userStore.t('teacher.selectSubjectFirst') }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="form-footer">
      <button class="submit-btn" @click="submitForm">{{ isEdit ? userStore.t('common.save') : userStore.t('common.create') }}</button>
    </view>

    <view v-if="showBatchScore" class="modal" @click="showBatchScore = false">
      <view class="batch-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ userStore.t('teacher.batchSetScore') }}</text>
          <view class="modal-close" @click="showBatchScore = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.questionType') }} *</text>
            <picker mode="selector" :range="questionTypes" range-key="label" @change="onBatchTypeChange">
              <view class="form-picker">
                <text>{{ batchType.label || userStore.t('teacher.selectQuestionType') }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.score') }} *</text>
            <input class="form-input" type="number" v-model="batchScore" :placeholder="userStore.t('teacher.scoreHint')" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showBatchScore = false">{{ userStore.t('common.cancel') }}</button>
          <button class="modal-btn confirm" @click="applyBatchScore">{{ userStore.t('common.apply') }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/index.js'
import { paperApi, subjectApi, questionApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()

const paperId = ref('')
const isEdit = ref(false)

const subjects = ref([])
const selectedSubjectId = ref(null)
const selectedSubject = ref(null)

const questions = ref([])
const selectedQuestions = ref([])
const selectedQuestionIds = ref(new Set())

const questionScores = reactive({})

const showBatchScore = ref(false)
const isSearching = ref(false)

const searchKeyword = ref('')
const filterType = ref('')

const batchType = ref({ value: '', label: '' })
const batchScore = ref('')

const form = reactive({
  title: '',
  duration: '120',
  passRate: '60',
  description: ''
})

const questionTypes = computed(() => [
  { value: 'SINGLE_CHOICE', label: userStore.t('common.singleChoice') },
  { value: 'MULTIPLE_CHOICE', label: userStore.t('common.multipleChoice') },
  { value: 'JUDGMENT', label: userStore.t('common.trueFalse') },
  { value: 'FILL_BLANK', label: userStore.t('common.fillBlank') },
  { value: 'ESSAY', label: userStore.t('common.shortAnswer') }
])

const filterTypeOptions = computed(() => [
  { value: '', label: userStore.t('common.all') },
  ...questionTypes.value
])

const currentFilterType = ref({ value: '', label: userStore.t('common.all') })

const totalScore = computed(() => {
  return selectedQuestions.value.reduce((sum, q) => {
    const score = questionScores[q.id] || q.score || 5
    return sum + score
  }, 0)
})

const passScore = computed(() => {
  const rate = parseInt(form.passRate) || 60
  return Math.round(totalScore.value * rate / 100)
})

const typeStatistics = computed(() => {
  const stats = {}
  selectedQuestions.value.forEach(q => {
    const type = q.type
    if (!stats[type]) {
      stats[type] = { count: 0, score: 0 }
    }
    stats[type].count++
    stats[type].score += questionScores[q.id] || q.score || 5
  })
  return stats
})

const onSubjectChange = (e) => {
  const index = e.detail.value
  if (subjects.value[index]) {
    selectedSubjectId.value = subjects.value[index].id
    selectedSubject.value = subjects.value[index]
    selectedQuestions.value = []
    selectedQuestionIds.value.clear()
    Object.keys(questionScores).forEach(key => delete questionScores[key])
    searchQuestions()
  }
}

const onFilterTypeChange = (e) => {
  const index = e.detail.value
  currentFilterType.value = filterTypeOptions.value[index]
  filterType.value = currentFilterType.value.value
  searchQuestions()
}

const onBatchTypeChange = (e) => {
  const index = e.detail.value
  batchType.value = questionTypes.value[index]
}

const searchQuestions = async () => {
  if (!selectedSubjectId.value) {
    uni.showToast({ title: userStore.t('teacher.selectSubjectFirst'), icon: 'none' })
    return
  }
  
  isSearching.value = true
  try {
    const res = await questionApi.list({
      subjectId: selectedSubjectId.value,
      keyword: searchKeyword.value,
      type: filterType.value,
      count: 100
    })
    if (res.code === 200) {
      questions.value = res.data || []
      questions.value.forEach(q => {
        if (questionScores[q.id] === undefined) {
          const scoreValue = typeof q.score === 'string' ? parseInt(q.score, 10) : q.score
          questionScores[q.id] = scoreValue || 5
        }
      })
    }
  } catch (e) {
    console.error(e)
  } finally {
    isSearching.value = false
  }
}

const clearSelection = () => {
  selectedQuestions.value = []
  selectedQuestionIds.value.clear()
}

const isQuestionSelected = (questionId) => {
  return selectedQuestionIds.value.has(questionId)
}

const toggleQuestion = (question) => {
  if (selectedQuestionIds.value.has(question.id)) {
    selectedQuestionIds.value.delete(question.id)
    const index = selectedQuestions.value.findIndex(q => q.id === question.id)
    if (index >= 0) {
      selectedQuestions.value.splice(index, 1)
    }
  } else {
    selectedQuestionIds.value.add(question.id)
    selectedQuestions.value.push({ ...question })
    if (questionScores[question.id] === undefined) {
      const scoreValue = typeof question.score === 'string' ? parseInt(question.score, 10) : question.score
      questionScores[question.id] = scoreValue || 5
    }
  }
}

const updateScore = (id, score) => {
  const numScore = parseInt(score) || 5
  questionScores[id] = numScore
}

const editQuestionScore = (questionId) => {
  const currentScore = questionScores[questionId] || 5
  uni.showModal({
    title: userStore.t('teacher.setScore'),
    editable: true,
    placeholderText: userStore.t('teacher.enterScore'),
    defaultValue: currentScore.toString(),
    confirmText: userStore.t('common.confirm'),
    cancelText: userStore.t('common.cancel'),
    success: (res) => {
      if (res.confirm && res.content) {
        const newScore = parseInt(res.content)
        if (newScore && newScore > 0) {
          questionScores[questionId] = newScore
        }
      }
    }
  })
}

const applyBatchScore = () => {
  if (!batchType.value.value) {
    uni.showToast({ title: userStore.t('teacher.selectQuestionType'), icon: 'none' })
    return
  }
  if (!batchScore.value) {
    uni.showToast({ title: userStore.t('common.pleaseEnter') + userStore.t('common.score'), icon: 'none' })
    return
  }
  
  const score = parseInt(batchScore.value)
  selectedQuestions.value.forEach(q => {
    if (q.type === batchType.value.value) {
      questionScores[q.id] = score
    }
  })
  
  showBatchScore.value = false
  uni.showToast({ title: userStore.t('teacher.batchSetSuccess'), icon: 'success' })
}

const getTypeText = (type) => {
  const map = {
    SINGLE_CHOICE: userStore.t('common.singleChoice'),
    MULTIPLE_CHOICE: userStore.t('common.multipleChoice'),
    JUDGMENT: userStore.t('common.trueFalse'),
    FILL_BLANK: userStore.t('common.fillBlank'),
    ESSAY: userStore.t('common.shortAnswer')
  }
  return map[type] || type
}

const getTypeClass = (type) => {
  const map = {
    SINGLE_CHOICE: 'type-single',
    MULTIPLE_CHOICE: 'type-multi',
    JUDGMENT: 'type-judge',
    FILL_BLANK: 'type-fill',
    ESSAY: 'type-essay'
  }
  return map[type] || ''
}



const truncate = (text, len) => {
  if (!text) return '-'
  return text.length > len ? text.substring(0, len) + '...' : text
}

const submitForm = async () => {
  if (!form.title.trim()) {
    uni.showToast({ title: userStore.t('common.pleaseEnter') + userStore.t('common.paperTitle'), icon: 'none' })
    return
  }
  if (!selectedSubjectId.value) {
    uni.showToast({ title: userStore.t('teacher.selectSubjectFirst'), icon: 'none' })
    return
  }
  if (selectedQuestionIds.value.size === 0) {
    uni.showToast({ title: userStore.t('teacher.selectAtLeastOneQuestion'), icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: userStore.t('common.saving') })

    const questionIds = Array.from(selectedQuestionIds.value)
    
    const questionScoreList = []
    selectedQuestions.value.forEach(q => {
      questionScoreList.push({
        questionId: q.id,
        score: questionScores[q.id] || q.score || 5
      })
    })

    const paperData = {
      paper: {
        id: paperId.value || null,
        title: form.title,
        subjectId: selectedSubjectId.value,
        duration: form.duration ? parseInt(form.duration) : 120,
        totalScore: totalScore.value,
        passScore: passScore.value,
        status: 'DRAFT',
        description: form.description
      },
      questionIds: questionIds,
      questionScores: questionScoreList
    }

    let res
    if (isEdit.value) {
      res = await paperApi.update(paperData)
    } else {
      res = await paperApi.create(paperData)
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

const loadSubjects = async () => {
  try {
    const res = await subjectApi.list()
    if (res.code === 200) {
      subjects.value = res.data
      console.log('科目列表加载成功:', subjects.value.length, '个科目')
    } else {
      console.error('加载科目失败，code:', res.code)
    }
  } catch (e) {
    console.error('加载科目失败:', e)
  }
}

const loadPaperInfo = async () => {
  try {
    const res = await paperApi.getById(paperId.value)
    if (res.code === 200) {
      const data = res.data
      form.title = data.title
      form.duration = data.duration ? data.duration.toString() : '120'
      form.passRate = data.passScore ? Math.round(data.passScore / data.totalScore * 100).toString() : '60'
      form.description = data.description || ''
      
      const subjectId = data.subjectId || data.subject?.id || data.subject_id
      selectedSubjectId.value = subjectId
      
      if (subjectId && subjects.value.length > 0) {
        const subjectIdNum = typeof subjectId === 'string' ? parseInt(subjectId) : subjectId
        selectedSubject.value = subjects.value.find(s => s.id === subjectId || s.id === subjectIdNum)
      }
      
      if (!selectedSubject.value && subjectId) {
        try {
          const subjectRes = await subjectApi.getById(subjectId)
          if (subjectRes.code === 200 && subjectRes.data) {
            selectedSubject.value = subjectRes.data
            const exists = subjects.value.find(s => s.id === subjectRes.data.id)
            if (!exists) {
              subjects.value.push(subjectRes.data)
            }
          } else {
            uni.showToast({
              title: userStore.t('teacher.subjectNotFound'),
              icon: 'none',
              duration: 3000
            })
            selectedSubjectId.value = null
          }
        } catch (e) {
          console.error('单独获取科目失败:', e)
          uni.showToast({
            title: userStore.t('teacher.subjectNotFound'),
            icon: 'none',
            duration: 3000
          })
          selectedSubjectId.value = null
        }
      }
      
      const qRes = await paperApi.getQuestions(paperId.value)
      if (qRes.code === 200) {
        selectedQuestions.value = qRes.data || []
        selectedQuestions.value.forEach(q => {
          const qid = typeof q.id === 'string' ? parseInt(q.id, 10) : q.id
          selectedQuestionIds.value.add(qid)
          const scoreValue = typeof q.score === 'string' ? parseInt(q.score, 10) : q.score
          questionScores[qid] = scoreValue || 5
        })
      }
      
      await searchQuestions()
    }
  } catch (e) {
    console.error('加载试卷信息失败:', e)
  }
}

onLoad(async (options) => {
  if (options.id) {
    paperId.value = options.id
    isEdit.value = true
  }

  await loadSubjects()

  if (isEdit.value) {
    await loadPaperInfo()
  }
})

onMounted(() => {
  if (isEdit.value && selectedSubjectId.value && !selectedSubject.value) {
    const subjectId = selectedSubjectId.value
    selectedSubject.value = subjects.value.find(s => s.id === subjectId) || 
                            subjects.value.find(s => s.id === String(subjectId))
  }
})

watch(() => userStore.language, () => {
  const ft = filterTypeOptions.value.find(f => f.value === currentFilterType.value.value)
  if (ft) currentFilterType.value = ft
})
</script>

<style scoped>
.paper-edit {
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
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.card-header {
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #eee;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.form-item {
  margin-bottom: 28rpx;
}

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

.form-input.readonly {
  color: #dc2626;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-input.rate-input {
  flex: 1;
}

.form-textarea {
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
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

.form-row {
  display: flex;
  gap: 24rpx;
}

.form-item-half {
  flex: 1;
}

.pass-rate-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.rate-unit {
  font-size: 28rpx;
  color: #666;
}

.pass-score-info {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.selector-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 12rpx;
  align-items: center;
}

.toolbar-search-input {
  flex: 1;
  min-width: 180rpx;
  height: 56rpx;
  background: #f5f5f5;
  border-radius: 6rpx;
  padding: 0 16rpx;
  font-size: 24rpx;
}

.toolbar-filter-picker {
  height: 56rpx;
  background: #f5f5f5;
  border-radius: 6rpx;
  padding: 0 16rpx;
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
  min-width: 120rpx;
}

.toolbar-search-btn {
  padding: 0 20rpx;
  height: 56rpx;
  line-height: 56rpx;
  background: #dc2626;
  color: #fff;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.toolbar-clear-btn {
  padding: 0 16rpx;
  height: 56rpx;
  line-height: 56rpx;
  background: #dc2626;
  color: #fff;
  border-radius: 6rpx;
  font-size: 24rpx;
  opacity: 0.8;
}

.toolbar-subject-tip {
  font-size: 22rpx;
  color: #666;
  background: #f0f0f0;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
}

.batch-score-setting {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx;
  background: #fef3c7;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.batch-setting-title {
  font-size: 24rpx;
  color: #92400e;
  font-weight: 500;
}

.batch-type-picker {
  height: 48rpx;
  background: #fff;
  border-radius: 6rpx;
  padding: 0 16rpx;
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #666;
  min-width: 140rpx;
}

.batch-score-input {
  height: 48rpx;
  background: #fff;
  border-radius: 6rpx;
  padding: 0 16rpx;
  font-size: 22rpx;
  width: 100rpx;
}

.batch-apply-btn {
  padding: 0 20rpx;
  height: 48rpx;
  line-height: 48rpx;
  background: #dc2626;
  color: #fff;
  border-radius: 6rpx;
  font-size: 22rpx;
}

.question-list {
  max-height: 600rpx;
  overflow-y: auto;
}

.question-item {
  display: flex;
  align-items: center;
  padding: 16rpx 12rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
  white-space: nowrap;
}

.question-item:last-child {
  margin-bottom: 0;
}

.question-item:active {
  background: #f0f0f0;
}

.question-checkbox-wrapper {
  margin-right: 12rpx;
  flex-shrink: 0;
}

.question-checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 3rpx solid #dc2626;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
  background: #fff;
}

.question-checkbox.checked {
  background: #dc2626;
  border-color: #dc2626;
}

.question-type-tag {
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
  font-size: 22rpx;
  flex-shrink: 0;
  margin-right: 12rpx;
}

.question-content {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.question-content.selected {
  color: #dc2626;
  font-weight: 500;
}

.question-score-box {
  flex-shrink: 0;
  margin-left: 12rpx;
  display: flex;
  align-items: baseline;
}

.score-num {
  font-size: 28rpx;
  font-weight: bold;
  color: #dc2626;
}

.score-unit {
  font-size: 20rpx;
  color: #999;
  margin-left: 4rpx;
}

.type-single {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.type-multi {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.type-judge {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.type-fill {
  background: rgba(156, 136, 255, 0.1);
  color: #9c88ff;
}

.type-essay {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.empty {
  padding: 60rpx;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.empty-hint {
  padding: 80rpx;
  text-align: center;
}

.loading-text {
  padding: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}

.selected-info {
  margin-top: 16rpx;
  padding: 20rpx;
  background: #f8fafc;
  border-radius: 12rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx dashed #e2e8f0;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
}

.info-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #dc2626;
}

.info-num.pass {
  color: #67c23a;
}

.info-divider {
  width: 1rpx;
  height: 40rpx;
  background: #ddd;
}

.type-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.type-stat-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: #666;
  background: #fff;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.stat-num {
  font-size: 28rpx;
  font-weight: bold;
  color: #dc2626;
}

.stat-sep {
  color: #999;
  margin: 0 4rpx;
}

.form-footer {
  padding: 24rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #dc2626;
  color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
}

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

.batch-modal {
  width: 80%;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
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

.modal-body {
  padding: 24rpx 32rpx;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #eee;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.modal-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-btn.confirm {
  background: #dc2626;
  color: #fff;
}
</style>