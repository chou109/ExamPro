<template>
  <view class="exam-detail">
    <view class="page-header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="title">答卷详情</text>
      <view class="header-right"></view>
    </view>

    <scroll-view class="detail-body" scroll-y>
      <view class="exam-info-card">
        <text class="exam-title">{{ examInfo.title }}</text>
        <view class="exam-meta">
          <view class="meta-item">
            <text class="meta-icon">📚</text>
            <text>{{ getSubjectName(examInfo.subjectId) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">⏱</text>
            <text>{{ examInfo.duration }}分钟</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">🏆</text>
            <text>{{ examInfo.totalScore }}分</text>
          </view>
        </view>
      </view>

      <view class="student-info-card">
        <view class="student-header">
          <text class="student-name">{{ recordInfo.studentName }}</text>
          <view :class="['score-badge', recordInfo.score >= 60 ? 'pass' : 'fail']">
            <text>{{ recordInfo.score || 0 }}分</text>
          </view>
        </view>
        <view class="student-meta">
          <view class="meta-item">
            <text class="meta-icon">📅</text>
            <text>提交时间：{{ formatDateTime(recordInfo.submitTime) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-icon">⏱</text>
            <text>用时：{{ recordInfo.duration || 0 }}分钟</text>
          </view>
          <view v-if="recordInfo.status === 'AUTO_SUBMITTED'" class="meta-item warning">
            <text class="meta-icon">⚠️</text>
            <text>强制收卷</text>
          </view>
        </view>
      </view>

      <view class="question-section" v-if="singleQuestions.length > 0">
        <view class="section-header">
          <text class="section-title">一、单选题</text>
          <text class="section-score">（共{{ singleQuestions.length }}题）</text>
        </view>
        <view class="question-item" v-for="(q, index) in singleQuestions" :key="q.id">
          <view class="question-header">
            <text class="question-number">{{ getQuestionNumber(q) }}.</text>
            <text class="question-score">（{{ q.score }}分）</text>
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
            <text class="answer-label">学生答案：</text>
            <text :class="['answer-text', isCorrectAnswer(q) ? 'correct' : 'wrong']">
              {{ getStudentAnswer(q) || '未作答' }}
            </text>
            <text class="answer-label">正确答案：</text>
            <text class="answer-text correct">{{ q.correctAnswer }}</text>
          </view>
        </view>
      </view>

      <view class="question-section" v-if="multiQuestions.length > 0">
        <view class="section-header">
          <text class="section-title">二、多选题</text>
          <text class="section-score">（共{{ multiQuestions.length }}题）</text>
        </view>
        <view class="question-item" v-for="(q, index) in multiQuestions" :key="q.id">
          <view class="question-header">
            <text class="question-number">{{ getQuestionNumber(q) }}.</text>
            <text class="question-score">（{{ q.score }}分）</text>
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
            <text class="answer-label">学生答案：</text>
            <text :class="['answer-text', isCorrectAnswer(q) ? 'correct' : 'wrong']">
              {{ getStudentAnswer(q) || '未作答' }}
            </text>
            <text class="answer-label">正确答案：</text>
            <text class="answer-text correct">{{ q.correctAnswer }}</text>
          </view>
        </view>
      </view>

      <view class="question-section" v-if="judgeQuestions.length > 0">
        <view class="section-header">
          <text class="section-title">三、判断题</text>
          <text class="section-score">（共{{ judgeQuestions.length }}题）</text>
        </view>
        <view class="question-item" v-for="(q, index) in judgeQuestions" :key="q.id">
          <view class="question-header">
            <text class="question-number">{{ getQuestionNumber(q) }}.</text>
            <text class="question-score">（{{ q.score }}分）</text>
          </view>
          <text class="question-content">{{ q.content }}</text>
          <view class="answer-row">
            <text class="answer-label">学生答案：</text>
            <text :class="['answer-text', isCorrectAnswer(q) ? 'correct' : 'wrong']">
              {{ getStudentAnswer(q) || '未作答' }}
            </text>
            <text class="answer-label">正确答案：</text>
            <text class="answer-text correct">{{ q.correctAnswer === 'A' || q.correctAnswer === '正确' ? '正确' : '错误' }}</text>
          </view>
        </view>
      </view>

      <view class="question-section" v-if="fillQuestions.length > 0">
        <view class="section-header">
          <text class="section-title">四、填空题</text>
          <text class="section-score">（共{{ fillQuestions.length }}题）</text>
        </view>
        <view class="question-item" v-for="(q, index) in fillQuestions" :key="q.id">
          <view class="question-header">
            <text class="question-number">{{ getQuestionNumber(q) }}.</text>
            <text class="question-score">（{{ q.score }}分）</text>
          </view>
          <text class="question-content">{{ q.content }}</text>
          <view class="answer-row">
            <text class="answer-label">学生答案：</text>
            <text :class="['answer-text', isCorrectAnswer(q) ? 'correct' : 'wrong']">
              {{ getStudentAnswer(q) || '未作答' }}
            </text>
            <text class="answer-label">正确答案：</text>
            <text class="answer-text correct">{{ q.correctAnswer }}</text>
          </view>
        </view>
      </view>

      <view class="question-section" v-if="essayQuestions.length > 0">
        <view class="section-header">
          <text class="section-title">五、简答题</text>
          <text class="section-score">（共{{ essayQuestions.length }}题）</text>
        </view>
        <view class="question-item" v-for="(q, index) in essayQuestions" :key="q.id">
          <view class="question-header">
            <text class="question-number">{{ getQuestionNumber(q) }}.</text>
            <text class="question-score">（{{ q.score }}分）</text>
          </view>
          <text class="question-content">{{ q.content }}</text>
          <view class="answer-section">
            <text class="answer-label">学生答案：</text>
            <text class="answer-text">{{ getStudentAnswer(q) || '未作答' }}</text>
          </view>
          <view class="answer-section">
            <text class="answer-label">参考答案：</text>
            <text class="answer-text correct">{{ q.correctAnswer }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { examRecordApi, examApi, subjectApi, paperApi } from '../../utils/api.js'

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

const goBack = () => {
  uni.navigateBack()
}

const getSubjectName = (subjectId) => {
  const subject = subjects.value.find(s => s.id === subjectId)
  return subject ? subject.name : '未知科目'
}

const formatDateTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
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
    uni.showLoading({ title: '加载中...' })
    
    const res = await examRecordApi.getById(recordId.value)
    if (res.code === 200) {
      const data = res.data
      recordInfo.studentName = data.studentName
      recordInfo.score = data.score || 0
      recordInfo.submitTime = data.submitTime
      recordInfo.duration = data.duration
      recordInfo.status = data.status
      
      if (data.answers) {
        try {
          studentAnswers.value = typeof data.answers === 'string' ? JSON.parse(data.answers) : data.answers
        } catch (e) {
          console.error('解析答案失败:', e)
        }
      }
    }
    
    const examRes = await examApi.getById(examId.value)
    if (examRes.code === 200) {
      Object.assign(examInfo, examRes.data)
      
      if (examRes.data.paperId) {
        const qRes = await paperApi.getQuestions(examRes.data.paperId)
        if (qRes.code === 200) {
          questions.value = qRes.data || []
        }
      }
    }
  } catch (e) {
    console.error('加载失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
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
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
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