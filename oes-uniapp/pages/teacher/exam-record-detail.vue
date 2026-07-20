<template>
  <view class="exam-detail">
    <CustomNavBar :title="userStore.t('common.examRecordDetail')" :showBack="true" />

    <scroll-view class="content" scroll-y>
      <view class="exam-info-card">
        <text class="exam-title">{{ examInfo.title }}</text>
        <view class="exam-meta">
          <view class="meta-item">
            <text class="meta-icon">📚</text>
            <text>{{ getSubjectName(examInfo.subjectId) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">⏱</text>
            <text>{{ examInfo.duration }}{{ userStore.t('common.minutes') }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">🏆</text>
            <text>{{ examInfo.totalScore }}{{ userStore.t('common.score') }}</text>
          </view>
        </view>
      </view>

      <view class="student-info-card">
        <view class="student-header">
          <text class="student-name">{{ recordInfo.studentName }}</text>
          <view :class="['score-badge', recordInfo.score >= 60 ? 'pass' : 'fail']">
            <text>{{ recordInfo.score || 0 }}{{ userStore.t('common.score') }}</text>
          </view>
        </view>
        <view class="student-meta">
          <view class="meta-item">
            <text class="meta-icon">📅</text>
            <text>{{ userStore.t('common.submitTime') }}：{{ formatDateTime(recordInfo.submitTime) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">⏱</text>
            <text>{{ userStore.t('common.duration') }}：{{ recordInfo.duration || 0 }}{{ userStore.t('common.minutes') }}</text>
          </view>
          <view v-if="recordInfo.status === 'AUTO_SUBMITTED'" class="meta-item warning">
            <text class="meta-icon">⚠️</text>
            <text>{{ userStore.t('common.autoSubmitted') }}</text>
          </view>
        </view>
      </view>

      <view class="question-section" v-if="singleQuestions.length > 0">
        <view class="section-header">
          <text class="section-title">{{ userStore.language === 'zh' ? '一' : '1' }}、{{ userStore.t('common.singleChoice') }}</text>
          <text class="section-score">（{{ userStore.t('common.total') }}{{ singleQuestions.length }}{{ userStore.t('common.questions') }}）</text>
        </view>
        <view class="question-item" v-for="(q, index) in singleQuestions" :key="q.id">
          <view class="question-header">
            <text class="question-number">{{ getQuestionNumber(q) }}.</text>
            <text class="question-score">（{{ q.score }}{{ userStore.t('common.score') }}）</text>
          </view>
          <text class="question-content">{{ q.content }}</text>
          <view class="options-list" v-if="parseOptions(q.options).length > 0">
            <view :class="['option-item', getOptionClass(q, idx)]" v-for="(opt, idx) in parseOptions(q.options)" :key="idx">
              <text class="option-label">{{ String.fromCharCode(65 + idx) }}.</text>
              <text class="option-text">{{ opt }}</text>
              <text v-if="isCorrectOption(q, idx)" class="correct-mark">✓</text>
              <text v-if="isStudentAnswer(q, idx) && !isCorrectOption(q, idx)" class="wrong-mark">✗</text>
            </view>
          </view>
          <view class="answer-row">
            <text class="answer-label">{{ userStore.t('common.studentAnswer') }}：</text>
            <text :class="['answer-text', isCorrectAnswer(q) ? 'correct' : 'wrong']">
              {{ getStudentAnswer(q) || userStore.t('common.notAnswered') }}
            </text>
            <text class="answer-label">{{ userStore.t('common.correctAnswer') }}：</text>
            <text class="answer-text correct">{{ q.correctAnswer }}</text>
          </view>
        </view>
      </view>

      <view class="question-section" v-if="multiQuestions.length > 0">
        <view class="section-header">
          <text class="section-title">{{ userStore.language === 'zh' ? '二' : '2' }}、{{ userStore.t('common.multipleChoice') }}</text>
          <text class="section-score">（{{ userStore.t('common.total') }}{{ multiQuestions.length }}{{ userStore.t('common.questions') }}）</text>
        </view>
        <view class="question-item" v-for="(q, index) in multiQuestions" :key="q.id">
          <view class="question-header">
            <text class="question-number">{{ getQuestionNumber(q) }}.</text>
            <text class="question-score">（{{ q.score }}{{ userStore.t('common.score') }}）</text>
          </view>
          <text class="question-content">{{ q.content }}</text>
          <view class="options-list" v-if="parseOptions(q.options).length > 0">
            <view :class="['option-item', getOptionClass(q, idx)]" v-for="(opt, idx) in parseOptions(q.options)" :key="idx">
              <text class="option-label">{{ String.fromCharCode(65 + idx) }}.</text>
              <text class="option-text">{{ opt }}</text>
              <text v-if="isCorrectOption(q, idx)" class="correct-mark">✓</text>
              <text v-if="isStudentAnswer(q, idx) && !isCorrectOption(q, idx)" class="wrong-mark">✗</text>
            </view>
          </view>
          <view class="answer-row">
            <text class="answer-label">{{ userStore.t('common.studentAnswer') }}：</text>
            <text :class="['answer-text', isCorrectAnswer(q) ? 'correct' : 'wrong']">
              {{ getStudentAnswer(q) || userStore.t('common.notAnswered') }}
            </text>
            <text class="answer-label">{{ userStore.t('common.correctAnswer') }}：</text>
            <text class="answer-text correct">{{ q.correctAnswer }}</text>
          </view>
        </view>
      </view>

      <view class="question-section" v-if="judgeQuestions.length > 0">
        <view class="section-header">
          <text class="section-title">{{ userStore.language === 'zh' ? '三' : '3' }}、{{ userStore.t('common.trueFalse') }}</text>
          <text class="section-score">（{{ userStore.t('common.total') }}{{ judgeQuestions.length }}{{ userStore.t('common.questions') }}）</text>
        </view>
        <view class="question-item" v-for="(q, index) in judgeQuestions" :key="q.id">
          <view class="question-header">
            <text class="question-number">{{ getQuestionNumber(q) }}.</text>
            <text class="question-score">（{{ q.score }}{{ userStore.t('common.score') }}）</text>
          </view>
          <text class="question-content">{{ q.content }}</text>
          <view class="answer-row">
            <text class="answer-label">{{ userStore.t('common.studentAnswer') }}：</text>
            <text :class="['answer-text', isCorrectAnswer(q) ? 'correct' : 'wrong']">
              {{ getStudentAnswer(q) || userStore.t('common.notAnswered') }}
            </text>
            <text class="answer-label">{{ userStore.t('common.correctAnswer') }}：</text>
            <text class="answer-text correct">{{ q.correctAnswer === 'A' || q.correctAnswer === '正确' || q.correctAnswer === 'True' ? userStore.t('common.correct') : userStore.t('common.wrong') }}</text>
          </view>
        </view>
      </view>

      <view class="question-section" v-if="fillQuestions.length > 0">
        <view class="section-header">
          <text class="section-title">{{ userStore.language === 'zh' ? '四' : '4' }}、{{ userStore.t('common.fillBlank') }}</text>
          <text class="section-score">（{{ userStore.t('common.total') }}{{ fillQuestions.length }}{{ userStore.t('common.questions') }}）</text>
        </view>
        <view class="question-item" v-for="(q, index) in fillQuestions" :key="q.id">
          <view class="question-header">
            <text class="question-number">{{ getQuestionNumber(q) }}.</text>
            <text class="question-score">（{{ q.score }}{{ userStore.t('common.score') }}）</text>
          </view>
          <text class="question-content">{{ q.content }}</text>
          <view class="answer-row">
            <text class="answer-label">{{ userStore.t('common.studentAnswer') }}：</text>
            <text :class="['answer-text', isCorrectAnswer(q) ? 'correct' : 'wrong']">
              {{ getStudentAnswer(q) || userStore.t('common.notAnswered') }}
            </text>
            <text class="answer-label">{{ userStore.t('common.correctAnswer') }}：</text>
            <text class="answer-text correct">{{ q.correctAnswer }}</text>
          </view>
        </view>
      </view>

      <view class="question-section" v-if="essayQuestions.length > 0">
        <view class="section-header">
          <text class="section-title">{{ userStore.language === 'zh' ? '五' : '5' }}、{{ userStore.t('common.shortAnswer') }}</text>
          <text class="section-score">（{{ userStore.t('common.total') }}{{ essayQuestions.length }}{{ userStore.t('common.questions') }}）</text>
        </view>
        <view class="question-item" v-for="(q, index) in essayQuestions" :key="q.id">
          <view class="question-header">
            <text class="question-number">{{ getQuestionNumber(q) }}.</text>
            <text class="question-score">（{{ q.score }}{{ userStore.t('common.score') }}）</text>
          </view>
          <text class="question-content">{{ q.content }}</text>
          <view class="answer-section">
            <text class="answer-label">{{ userStore.t('common.studentAnswer') }}：</text>
            <text class="answer-text">{{ getStudentAnswer(q) || userStore.t('common.notAnswered') }}</text>
          </view>
          <view class="answer-section">
            <text class="answer-label">{{ userStore.t('common.referenceAnswer') }}：</text>
            <text class="answer-text correct">{{ q.correctAnswer }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/index.js'
import { examRecordApi, examApi, subjectApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()

const recordId = ref('')
const examId = ref('')

const examInfo = reactive({
  title: '',
  subjectId: '',
  duration: 0,
  totalScore: 0
})

const recordInfo = reactive({
  studentName: '',
  score: 0,
  submitTime: '',
  duration: 0,
  status: ''
})

const subjects = ref([])
const questions = ref([])
const studentAnswers = ref({})

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

const parseOptions = (options) => {
  if (!options) return []
  if (Array.isArray(options)) {
    return options.map(opt => {
      if (typeof opt === 'object') {
        return opt.text || opt.content || JSON.stringify(opt)
      }
      return String(opt)
    })
  }
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options)
      if (Array.isArray(parsed)) {
        return parsed.map(opt => {
          if (typeof opt === 'object') {
            return opt.text || opt.content || JSON.stringify(opt)
          }
          return String(opt)
        })
      }
    } catch (e) {
      return options.split('|').filter(o => o.trim())
    }
  }
  return []
}

const getQuestionNumber = (q) => {
  return questions.value.findIndex(item => item.id === q.id) + 1
}

const getStudentAnswer = (q) => {
  return studentAnswers.value[q.id]
}

const isCorrectAnswer = (q) => {
  const studentAnswer = studentAnswers.value[q.id]
  if (!studentAnswer) return false
  return studentAnswer === q.correctAnswer
}

const isCorrectOption = (q, idx) => {
  if (!q.correctAnswer) return false
  const optionLetter = String.fromCharCode(65 + idx)
  return q.correctAnswer.includes(optionLetter)
}

const isStudentAnswer = (q, idx) => {
  const studentAnswer = studentAnswers.value[q.id]
  if (!studentAnswer) return false
  const optionLetter = String.fromCharCode(65 + idx)
  return studentAnswer.includes(optionLetter)
}

const getOptionClass = (q, idx) => {
  const classes = []
  if (isCorrectOption(q, idx)) {
    classes.push('correct')
  }
  if (isStudentAnswer(q, idx)) {
    if (isCorrectOption(q, idx)) {
      classes.push('selected')
    } else {
      classes.push('selected wrong')
    }
  }
  return classes.join(' ')
}

const singleQuestions = computed(() => questions.value.filter(q => q.type === 'SINGLE_CHOICE'))
const multiQuestions = computed(() => questions.value.filter(q => q.type === 'MULTIPLE_CHOICE'))
const judgeQuestions = computed(() => questions.value.filter(q => q.type === 'JUDGMENT'))
const fillQuestions = computed(() => questions.value.filter(q => q.type === 'FILL_BLANK'))
const essayQuestions = computed(() => questions.value.filter(q => q.type === 'ESSAY'))

const loadRecord = async () => {
  try {
    uni.showLoading({ title: userStore.t('common.loading') })
    
    const res = await examRecordApi.getById(recordId.value)
    if (res.code === 200) {
      const data = res.data
      recordInfo.studentName = data.studentName || data.student?.username || data.student?.realName || '未知学生'
      recordInfo.score = data.score || 0
      recordInfo.submitTime = data.submitTime
      recordInfo.duration = data.duration
      recordInfo.status = data.status
      
      if (data.studentAnswers) {
        studentAnswers.value = data.studentAnswers
      } else if (data.answers) {
        const ansMap = {}
        (Array.isArray(data.answers) ? data.answers : []).forEach(a => {
          ansMap[a.question_id] = a.answer
        })
        studentAnswers.value = ansMap
      }
      
      if (data.questions && Array.isArray(data.questions)) {
        questions.value = data.questions
      }
    }
    
    const examRes = await examApi.getById(examId.value)
    if (examRes.code === 200) {
      Object.assign(examInfo, examRes.data)
      
      if (examRes.data.paperId && questions.value.length === 0) {
        const qRes = await paperApi.getQuestions(examRes.data.paperId)
        if (qRes.code === 200) {
          questions.value = qRes.data || []
        }
      }
    }
  } catch (e) {
    console.error('加载失败:', e)
    uni.showToast({ title: userStore.t('common.loadFailed'), icon: 'none' })
  } finally {
    uni.hideLoading()
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
  recordId.value = options.recordId
  examId.value = options.examId
  loadSubjects()
  loadRecord()
})
</script>

<style scoped>
.exam-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 140rpx;
}

.detail-body {
  padding: 24rpx;
}

.exam-info-card, .student-info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.exam-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
  margin-bottom: 24rpx;
}

.student-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.student-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.score-badge {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: bold;
  
  &.pass {
    background: #f0f9ff;
    color: #67c23a;
  }
  
  &.fail {
    background: #fef0f0;
    color: #f56c6c;
  }
}

.exam-meta, .student-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 26rpx;
    color: #666;
    
    &.warning {
      color: #f56c6c;
    }
    
    .meta-icon {
      font-size: 28rpx;
    }
  }
}

.question-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #dc2626;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .section-score {
      font-size: 26rpx;
      color: #666;
      margin-left: 12rpx;
    }
  }
  
  .question-item {
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .question-header {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      
      .question-number {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }
      
      .question-score {
        font-size: 26rpx;
        color: #dc2626;
        margin-left: 8rpx;
      }
    }
    
    .question-content {
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
      display: block;
      margin-bottom: 16rpx;
    }
    
    .options-list {
      padding-left: 40rpx;
      margin-bottom: 16rpx;
      
      .option-item {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;
        padding: 12rpx 16rpx;
        border-radius: 8rpx;
        
        &.correct {
          background: rgba(103, 194, 58, 0.1);
        }
        
        &.selected {
          background: rgba(64, 158, 255, 0.1);
        }
        
        &.wrong {
          background: rgba(245, 108, 108, 0.1);
        }
        
        .option-label {
          font-size: 28rpx;
          color: #666;
          width: 40rpx;
        }
        
        .option-text {
          font-size: 28rpx;
          color: #333;
          flex: 1;
        }
        
        .correct-mark {
          font-size: 28rpx;
          color: #67c23a;
          font-weight: bold;
        }
        
        .wrong-mark {
          font-size: 28rpx;
          color: #f56c6c;
          font-weight: bold;
        }
      }
    }
    
    .answer-row {
      padding-left: 40rpx;
      display: flex;
      flex-wrap: wrap;
      gap: 24rpx;
      
      .answer-label {
        font-size: 26rpx;
        color: #999;
      }
      
      .answer-text {
        font-size: 26rpx;
        font-weight: bold;
        
        &.correct {
          color: #67c23a;
        }
        
        &.wrong {
          color: #f56c6c;
        }
      }
    }
    
    .answer-section {
      padding-left: 40rpx;
      margin-top: 12rpx;
      
      .answer-label {
        font-size: 26rpx;
        color: #999;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .answer-text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
        display: block;
        padding: 12rpx 16rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
        
        &.correct {
          color: #67c23a;
        }
      }
    }
  }
}
</style>