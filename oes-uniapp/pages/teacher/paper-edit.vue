<template>
  <view class="paper-edit">
    <view class="page-header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="title">{{ isEdit ? '编辑试卷' : '创建试卷' }}</text>
      <view class="header-right"></view>
    </view>

    <scroll-view class="form-body" scroll-y>
      <view class="card">
        <view class="form-item">
          <text class="form-label">试卷标题 *</text>
          <input class="form-input" v-model="form.title" placeholder="请输入试卷标题" />
        </view>

        <view class="form-item">
          <text class="form-label">选择科目 *</text>
          <picker mode="selector" :range="subjects" range-key="name" @change="onSubjectChange">
            <view class="form-picker">
              <text>{{ selectedSubject?.name || '请选择科目' }}</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">考试时长（分钟）</text>
          <input class="form-input" type="number" v-model="form.duration" placeholder="请输入考试时长" />
        </view>

        <view class="form-item">
          <text class="form-label">总分</text>
          <input class="form-input" type="number" v-model="form.totalScore" placeholder="请输入总分" />
        </view>

        <view class="form-item">
          <text class="form-label">试卷描述</text>
          <textarea class="form-textarea" v-model="form.description" placeholder="请输入试卷描述" />
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <text class="card-title">题目列表</text>
          <button class="add-question-btn" @click="showAddQuestion = true">添加题目</button>
        </view>
        
        <view class="question-list" v-if="questions.length > 0">
          <view class="question-item" v-for="(q, index) in questions" :key="index">
            <view class="question-header">
              <view :class="['type-tag', getTypeClass(q.type)]">
                <text>{{ getTypeText(q.type) }}</text>
              </view>
              <text class="question-score">{{ q.score }}分</text>
            </view>
            <text class="question-content">{{ truncate(q.content, 100) }}</text>
            <view class="question-actions">
              <text class="action-text" @click="editQuestion(index)">编辑</text>
              <text class="action-text danger" @click="removeQuestion(index)">删除</text>
            </view>
          </view>
        </view>
        
        <view class="empty" v-else>
          <text class="empty-text">暂无题目，请添加题目</text>
        </view>
      </view>
    </scroll-view>

    <view class="form-footer">
      <button class="submit-btn" @click="submitForm">{{ isEdit ? '保存' : '创建' }}</button>
    </view>

    <!-- 添加题目弹窗 -->
    <view v-if="showAddQuestion" class="modal" @click="showAddQuestion = false">
      <view class="question-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加题目</text>
          <view class="modal-close" @click="showAddQuestion = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view class="form-item">
            <text class="form-label">题目类型 *</text>
            <picker mode="selector" :range="questionTypes" range-key="label" @change="onQuestionTypeChange">
              <view class="form-picker">
                <text>{{ currentQuestionType.label || '请选择题目类型' }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">题目内容 *</text>
            <textarea class="form-textarea" v-model="newQuestion.content" placeholder="请输入题目内容" />
          </view>
          <view class="form-item" v-if="currentQuestionType.value !== 'ESSAY'">
            <text class="form-label">选项</text>
            <view class="options-list">
              <view class="option-item" v-for="(opt, idx) in newQuestion.options" :key="idx">
                <text class="option-label">{{ String.fromCharCode(65 + idx) }}.</text>
                <input class="option-input" v-model="newQuestion.options[idx]" :placeholder="'选项' + String.fromCharCode(65 + idx)" />
                <text class="option-delete" v-if="newQuestion.options.length > 2" @click="removeOption(idx)">✕</text>
              </view>
            </view>
            <button class="add-option-btn" @click="addOption" v-if="newQuestion.options.length < 6">添加选项</button>
          </view>
          <view class="form-item">
            <text class="form-label">正确答案 *</text>
            <input class="form-input" v-model="newQuestion.correctAnswer" placeholder="请输入正确答案" />
          </view>
          <view class="form-item">
            <text class="form-label">分值</text>
            <input class="form-input" type="number" v-model="newQuestion.score" placeholder="请输入分值" />
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showAddQuestion = false">取消</button>
          <button class="modal-btn confirm" @click="addQuestion">确认添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { paperApi, subjectApi, questionApi } from '../../utils/api.js'

const paperId = ref('')
const isEdit = ref(false)

const subjects = ref([])
const selectedSubjectId = ref(null)
const selectedSubject = ref(null)

const questions = ref([])

const showAddQuestion = ref(false)

const form = reactive({
  title: '',
  duration: '',
  totalScore: '',
  description: ''
})

const questionTypes = [
  { value: 'SINGLE_CHOICE', label: '单选题' },
  { value: 'MULTIPLE_CHOICE', label: '多选题' },
  { value: 'JUDGMENT', label: '判断题' },
  { value: 'FILL_BLANK', label: '填空题' },
  { value: 'ESSAY', label: '简答题' }
]

const currentQuestionType = ref({ value: 'SINGLE_CHOICE', label: '单选题' })

const newQuestion = reactive({
  type: 'SINGLE_CHOICE',
  content: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  score: ''
})

const goBack = () => {
  uni.navigateBack()
}

const onSubjectChange = (e) => {
  const index = e.detail.value
  if (subjects.value[index]) {
    selectedSubjectId.value = subjects.value[index].id
    selectedSubject.value = subjects.value[index]
  }
}

const onQuestionTypeChange = (e) => {
  const index = e.detail.value
  currentQuestionType.value = questionTypes[index]
  newQuestion.type = currentQuestionType.value.value
  
  if (currentQuestionType.value.value === 'JUDGMENT') {
    newQuestion.options = ['正确', '错误']
    newQuestion.correctAnswer = ''
  } else if (currentQuestionType.value.value === 'ESSAY') {
    newQuestion.options = []
  } else {
    newQuestion.options = ['', '', '', '']
  }
}

const addOption = () => {
  if (newQuestion.options.length < 6) {
    newQuestion.options.push('')
  }
}

const removeOption = (idx) => {
  if (newQuestion.options.length > 2) {
    newQuestion.options.splice(idx, 1)
  }
}

const addQuestion = () => {
  if (!newQuestion.content.trim()) {
    uni.showToast({ title: '请输入题目内容', icon: 'none' })
    return
  }
  if (!newQuestion.correctAnswer.trim()) {
    uni.showToast({ title: '请输入正确答案', icon: 'none' })
    return
  }
  
  questions.value.push({
    type: newQuestion.type,
    content: newQuestion.content,
    options: [...newQuestion.options.filter(o => o.trim())],
    correctAnswer: newQuestion.correctAnswer,
    score: parseInt(newQuestion.score) || 10
  })
  
  newQuestion.content = ''
  newQuestion.options = ['', '', '', '']
  newQuestion.correctAnswer = ''
  newQuestion.score = ''
  
  showAddQuestion.value = false
}

const editQuestion = (index) => {
  uni.showToast({ title: '编辑功能开发中', icon: 'none' })
}

const removeQuestion = (index) => {
  questions.value.splice(index, 1)
}

const getTypeText = (type) => {
  const map = {
    SINGLE_CHOICE: '单选',
    MULTIPLE_CHOICE: '多选',
    JUDGMENT: '判断',
    FILL_BLANK: '填空',
    ESSAY: '简答'
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
    uni.showToast({ title: '请输入试卷标题', icon: 'none' })
    return
  }
  if (!selectedSubjectId.value) {
    uni.showToast({ title: '请选择科目', icon: 'none' })
    return
  }
  if (questions.value.length === 0) {
    uni.showToast({ title: '请至少添加一道题目', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '保存中...' })

    const paperData = {
      id: paperId.value || null,
      title: form.title,
      subjectId: selectedSubjectId.value,
      duration: form.duration ? parseInt(form.duration) : 60,
      totalScore: form.totalScore ? parseInt(form.totalScore) : questions.value.reduce((sum, q) => sum + (q.score || 0), 0),
      description: form.description,
      status: 'DRAFT',
      questions: questions.value
    }

    let res
    if (isEdit.value) {
      res = await paperApi.update(paperData)
    } else {
      res = await paperApi.create(paperData)
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

const loadPaperInfo = async () => {
  try {
    const res = await paperApi.getById(paperId.value)
    if (res.code === 200) {
      const data = res.data
      form.title = data.title
      form.duration = data.duration ? data.duration.toString() : ''
      form.totalScore = data.totalScore ? data.totalScore.toString() : ''
      form.description = data.description || ''
      
      selectedSubjectId.value = data.subjectId
      selectedSubject.value = subjects.value.find(s => s.id === data.subjectId)
      
      const qRes = await paperApi.getQuestions(paperId.value)
      if (qRes.code === 200) {
        questions.value = qRes.data || []
      }
    }
  } catch (e) {
    console.error('加载试卷信息失败:', e)
  }
}

onLoad((options) => {
  if (options.id) {
    paperId.value = options.id
    isEdit.value = true
  }
  
  loadSubjects()
  
  if (isEdit.value) {
    setTimeout(() => {
      loadPaperInfo()
    }, 100)
  }
})
</script>

<style scoped>
.paper-edit {
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
  margin-bottom: 24rpx;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #eee;
  
  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .add-question-btn {
    padding: 12rpx 24rpx;
    background: #dc2626;
    color: #fff;
    border-radius: 8rpx;
    font-size: 26rpx;
  }
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
}

.question-list {
  .question-item {
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .question-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12rpx;
      
      .type-tag {
        padding: 4rpx 12rpx;
        border-radius: 6rpx;
        font-size: 24rpx;
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
      
      .question-score {
        font-size: 26rpx;
        color: #dc2626;
        font-weight: bold;
      }
    }
    
    .question-content {
      font-size: 28rpx;
      color: #333;
      display: block;
      margin-bottom: 12rpx;
      line-height: 1.5;
    }
    
    .question-actions {
      display: flex;
      gap: 24rpx;
      
      .action-text {
        font-size: 26rpx;
        color: #409eff;
        
        &.danger {
          color: #f56c6c;
        }
      }
    }
  }
}

.empty {
  padding: 60rpx;
  text-align: center;
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
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

.question-modal {
  width: 90%;
  max-height: 85vh;
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
  
  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .modal-close {
    padding: 8rpx;
    
    .close-icon {
      font-size: 32rpx;
      color: #999;
    }
  }
}

.modal-body {
  flex: 1;
  padding: 24rpx 32rpx;
  max-height: 55vh;
}

.options-list {
  margin-bottom: 16rpx;
  
  .option-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 12rpx;
    
    .option-label {
      font-size: 28rpx;
      color: #666;
      width: 40rpx;
    }
    
    .option-input {
      flex: 1;
      height: 72rpx;
      background: #f5f5f5;
      border-radius: 8rpx;
      padding: 0 16rpx;
      font-size: 28rpx;
    }
    
    .option-delete {
      font-size: 28rpx;
      color: #f56c6c;
      padding: 8rpx;
    }
  }
}

.add-option-btn {
  width: 100%;
  height: 72rpx;
  line-height: 72rpx;
  background: #f5f5f5;
  color: #666;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #eee;
  
  .modal-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    
    &.cancel {
      background: #f5f5f5;
      color: #666;
    }
    
    &.confirm {
      background: #dc2626;
      color: #fff;
    }
  }
}
</style>