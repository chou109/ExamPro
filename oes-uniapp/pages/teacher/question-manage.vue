<template>
  <view class="manage-page">
    <CustomNavBar :title="userStore.t('common.questionManage')" :showBack="true" />
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <picker mode="selector" :range="subjectOptions" range-key="name" @change="onSubjectChange">
        <view class="picker">
          <text class="picker-text">{{ selectedSubjectName || userStore.t('common.selectSubject') }}</text>
        </view>
      </picker>
      <picker mode="selector" :range="questionTypes" range-key="label" @change="onTypeChange">
        <view class="picker">
          <text class="picker-text">{{ selectedTypeName || userStore.t('common.questionType') }}</text>
        </view>
      </picker>
      <input class="search-input" v-model="keyword" :placeholder="userStore.t('common.searchPlaceholder')" />
      <button class="search-btn" @click="loadData">{{ userStore.t('common.search') }}</button>
    </view>
    
    <!-- 题目列表 -->
    <view class="list">
      <view class="list-item" v-for="item in questionList" :key="item.id">
        <view class="item-info">
          <view :class="['type-tag', getTypeClass(item.type)]">{{ typeText(item.type) }}</view>
          <text class="item-title">{{ truncate(item.content, 50) }}</text>
          <text class="item-meta">{{ userStore.t('common.score') }}：{{ item.score }} | {{ getSubjectName(item.subjectId) }}</text>
        </view>
        <view class="item-actions">
          <text class="action-btn" @click="editQuestion(item)">{{ userStore.t('common.edit') }}</text>
          <text class="action-btn danger" @click="deleteQuestion(item)">{{ userStore.t('common.delete') }}</text>
        </view>
      </view>
      
      <view class="empty" v-if="questionList.length === 0">
        <text class="empty-text">{{ userStore.t('common.noData') }}</text>
      </view>
    </view>
    
    <!-- 新增按钮 -->
    <view class="add-btn" @click="showQuestionForm = true">
      <text class="add-icon">➕</text>
      <text class="add-text">{{ userStore.t('common.addQuestion') }}</text>
    </view>
    
    <!-- 批量导入按钮 -->
    <view class="import-btn" @click="showImportModal = true">
      <text class="import-icon">📤</text>
      <text class="import-text">{{ userStore.t('common.batchImport') }}</text>
    </view>

    <!-- 题目编辑弹窗 -->
    <view v-if="showQuestionForm" class="modal" @click="showQuestionForm = false">
      <view class="question-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingQuestion ? userStore.t('common.editQuestion') : userStore.t('common.addQuestion') }}</text>
          <view class="modal-close" @click="showQuestionForm = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.questionType') }} *</text>
            <picker mode="selector" :range="questionTypes" range-key="label" @change="onFormTypeChange">
              <view class="form-picker">
                <text>{{ selectedFormType.label || userStore.t('common.selectQuestionType') }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.subject') }} *</text>
            <picker mode="selector" :range="subjects" range-key="name" @change="onFormSubjectChange">
              <view class="form-picker">
                <text>{{ selectedFormSubject?.name || userStore.t('common.selectSubject') }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.questionContent') }} *</text>
            <textarea class="form-textarea" v-model="form.content" :placeholder="userStore.t('common.enterQuestionContent')" />
          </view>
          <view class="form-item" v-if="form.type !== 'ESSAY' && form.type !== 'FILL_BLANK'">
            <text class="form-label">{{ userStore.t('common.options') }}</text>
            <view class="options-list">
              <view class="option-item" v-for="(opt, idx) in form.options" :key="idx">
                <text class="option-label">{{ String.fromCharCode(65 + idx) }}.</text>
                <input class="option-input" v-model="form.options[idx]" :placeholder="userStore.t('common.option') + String.fromCharCode(65 + idx)" />
                <text class="option-delete" v-if="form.options.length > 2" @click="removeOption(idx)">✕</text>
              </view>
            </view>
            <button class="add-option-btn" @click="addOption" v-if="form.options.length < 6">{{ userStore.t('common.addOption') }}</button>
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.correctAnswer') }} *</text>
            <input class="form-input" v-model="form.correctAnswer" :placeholder="userStore.t('common.enterCorrectAnswer')" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.score') }}</text>
            <input class="form-input" type="number" v-model="form.score" :placeholder="userStore.t('common.enterScore')" />
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showQuestionForm = false">{{ userStore.t('common.cancel') }}</button>
          <button class="modal-btn confirm" @click="submitQuestion">{{ editingQuestion ? userStore.t('common.save') : userStore.t('common.create') }}</button>
        </view>
      </view>
    </view>

    <!-- 批量导入弹窗 -->
    <view v-if="showImportModal" class="modal" @click="showImportModal = false">
      <view class="import-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ userStore.t('common.batchImport') }}</text>
          <view class="modal-close" @click="showImportModal = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.subject') }} *</text>
            <picker mode="selector" :range="subjects" range-key="name" @change="onImportSubjectChange">
              <view class="form-picker">
                <text>{{ importSubject?.name || userStore.t('common.selectSubject') }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.importText') }} *</text>
            <view class="form-hint">
              <text class="hint-title">{{ userStore.t('common.formatDesc') }}：</text>
              <view class="hint-example">
                <view class="hint-line" @click="copyExample('单选|Question content?|Option A|Option B|Option C|Option D|A|5')">
                  <text>{{ userStore.language === 'zh' ? '单选|题目内容是什么？|选项A内容|选项B内容|选项C内容|选项D内容|A|5' : 'Single|Question content?|Option A|Option B|Option C|Option D|A|5' }}</text>
                  <text class="copy-icon">📋</text>
                </view>
                <view class="hint-line" @click="copyExample('多选|Which are correct?|Option A|Option B|Option C|Option D|A,C|10')">
                  <text>{{ userStore.language === 'zh' ? '多选|哪些是正确的？|选项A|选项B|选项C|选项D|A,C|10' : 'Multi|Which are correct?|Option A|Option B|Option C|Option D|A,C|10' }}</text>
                  <text class="copy-icon">📋</text>
                </view>
                <view class="hint-line" @click="copyExample('判断|This statement is true|A|2')">
                  <text>{{ userStore.language === 'zh' ? '判断|这句话是正确的|A|2' : 'Judge|This statement is true|A|2' }}</text>
                  <text class="copy-icon">📋</text>
                </view>
                <view class="hint-line" @click="copyExample('填空|Answer is ____|Answer content|5')">
                  <text>{{ userStore.language === 'zh' ? '填空|答案是____|答案内容|5' : 'Fill|Answer is ____|Answer content|5' }}</text>
                  <text class="copy-icon">📋</text>
                </view>
                <view class="hint-line" @click="copyExample('简答|Please describe|Reference answer|15')">
                  <text>{{ userStore.language === 'zh' ? '简答|请简述原理|参考答案内容|15' : 'Essay|Please describe|Reference answer|15' }}</text>
                  <text class="copy-icon">📋</text>
                </view>
              </view>
              <text class="hint-note">{{ userStore.t('common.importNote') }}</text>
            </view>
            <textarea class="form-textarea" v-model="importText" :placeholder="userStore.t('common.pasteQuestionText')" />
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showImportModal = false">{{ userStore.t('common.cancel') }}</button>
          <button class="modal-btn confirm" @click="submitImport">{{ userStore.t('common.import') }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { questionApi, subjectApi } from '../../utils/api'
import { useUserStore } from '../../store/index.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

export default {
  components: { CustomNavBar },
  setup() {
    const userStore = useUserStore()
    
    const keyword = ref('')
    const questionList = ref([])
    const subjects = ref([])
    const selectedSubjectId = ref(null)
    const selectedTypeId = ref('')
    
    const showQuestionForm = ref(false)
    const editingQuestion = ref(null)
    
    const showImportModal = ref(false)
    const importText = ref('')
    const importSubject = ref(null)
    
    const questionTypes = computed(() => [
      { value: 'SINGLE_CHOICE', label: userStore.t('common.singleChoice') },
      { value: 'MULTIPLE_CHOICE', label: userStore.t('common.multipleChoice') },
      { value: 'JUDGMENT', label: userStore.t('common.trueFalse') },
      { value: 'FILL_BLANK', label: userStore.t('common.fillBlank') },
      { value: 'ESSAY', label: userStore.t('common.shortAnswer') }
    ])
    
    const form = reactive({
      type: 'SINGLE_CHOICE',
      subjectId: null,
      content: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      score: ''
    })
    
    const selectedFormType = computed(() => {
      return questionTypes.value.find(t => t.value === form.type) || {}
    })
    
    const selectedFormSubject = computed(() => {
      return subjects.value.find(s => String(s.id) === String(form.subjectId))
    })
    
    const subjectOptions = computed(() => {
      return [{ id: null, name: userStore.t('common.all') }, ...subjects.value]
    })
    
    const selectedSubjectName = computed(() => {
      const s = subjectOptions.value.find(s => String(s.id) === String(selectedSubjectId.value))
      return s?.name || ''
    })
    
    const selectedTypeName = computed(() => {
      const t = questionTypes.value.find(t => t.value === selectedTypeId.value)
      return t?.label || ''
    })
    
    const typeText = (type) => {
      const map = {
        SINGLE_CHOICE: userStore.t('common.singleChoice'),
        MULTIPLE_CHOICE: userStore.t('common.multipleChoice'),
        JUDGMENT: userStore.t('common.judgment'),
        FILL_BLANK: userStore.t('common.fillBlank'),
        ESSAY: userStore.t('common.shortAnswer'),
        PROGRAMMING: userStore.t('common.programming')
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
    
    const getSubjectName = (subjectId) => {
    const s = subjects.value.find(s => String(s.id) === String(subjectId))
    return s?.name || userStore.t('common.unknownSubject')
  }
    
    const truncate = (text, len) => {
      if (!text) return '-'
      return text.length > len ? text.substring(0, len) + '...' : text
    }
    
    const onSubjectChange = (e) => {
      const index = e.detail.value
      if (subjectOptions.value[index]) {
        selectedSubjectId.value = subjectOptions.value[index].id
      } else {
        selectedSubjectId.value = null
      }
      loadData()
    }
    
    const onTypeChange = (e) => {
      const index = e.detail.value
      if (questionTypes.value[index]) {
        selectedTypeId.value = questionTypes.value[index].value
      } else {
        selectedTypeId.value = ''
      }
      loadData()
    }
    
    const onFormTypeChange = (e) => {
      const index = e.detail.value
      form.type = questionTypes.value[index].value
      
      if (form.type === 'JUDGMENT') {
        form.options = [userStore.t('common.correct'), userStore.t('common.wrong')]
      } else if (form.type === 'ESSAY' || form.type === 'FILL_BLANK') {
        form.options = []
      } else {
        form.options = ['', '', '', '']
      }
    }
    
    const onFormSubjectChange = (e) => {
      const index = e.detail.value
      if (subjects.value[index]) {
        form.subjectId = subjects.value[index].id
      }
    }
    
    const addOption = () => {
      if (form.options.length < 6) {
        form.options.push('')
      }
    }
    
    const removeOption = (idx) => {
      if (form.options.length > 2) {
        form.options.splice(idx, 1)
      }
    }
    
    const loadData = async () => {
      try {
        uni.showLoading({ title: userStore.t('common.loading') })
        const res = await questionApi.page({
          current: 1,
          size: 20,
          keyword: keyword.value,
          subjectId: selectedSubjectId.value,
          type: selectedTypeId.value
        })
        if (res.code === 200) {
          questionList.value = res.data.records
        }
      } catch (e) {
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
        console.error(e)
      }
    }
    
    const editQuestion = async (item) => {
      editingQuestion.value = item
      form.type = item.type
      form.subjectId = item.subjectId
      form.content = item.content
      form.correctAnswer = item.answer || item.correctAnswer || ''
      form.score = item.score ? item.score.toString() : ''
      
      if (item.type === 'JUDGMENT') {
        form.options = [userStore.t('common.correct'), userStore.t('common.wrong')]
      } else if (item.type === 'ESSAY' || item.type === 'FILL_BLANK') {
        form.options = []
      } else {
        let opts = []
        if (Array.isArray(item.options)) {
          if (item.options.length > 0 && typeof item.options[0] === 'object') {
            opts = item.options.map(opt => opt.content || opt.text || '')
          } else {
            opts = [...item.options]
          }
        } else if (typeof item.options === 'string') {
          try {
            const parsed = JSON.parse(item.options)
            if (Array.isArray(parsed)) {
              if (parsed.length > 0 && typeof parsed[0] === 'object') {
                opts = parsed.map(opt => opt.content || opt.text || '')
              } else {
                opts = parsed
              }
            }
          } catch (e) {
            opts = item.options.split('|').filter(o => o.trim())
          }
        }
        while (opts.length < 4) {
          opts.push('')
        }
        form.options = opts
      }
      
      showQuestionForm.value = true
    }
    
    const submitQuestion = async () => {
      if (!form.content.trim()) {
        uni.showToast({ title: userStore.t('common.enterQuestionContent'), icon: 'none' })
        return
      }
      if (!form.subjectId) {
        uni.showToast({ title: userStore.t('common.selectSubject'), icon: 'none' })
        return
      }
      if (!form.correctAnswer.trim()) {
        uni.showToast({ title: userStore.t('common.enterCorrectAnswer'), icon: 'none' })
        return
      }
      
      try {
        uni.showLoading({ title: userStore.t('common.saving') })
        
        const filteredOptions = form.options.filter(o => o.trim())
        const questionData = {
          id: editingQuestion.value?.id || null,
          type: form.type,
          subjectId: Number(form.subjectId),
          content: form.content,
          options: JSON.stringify(filteredOptions),
          answer: form.correctAnswer,
          score: form.score ? parseInt(form.score) : 10
        }
        
        let res
        if (editingQuestion.value) {
          res = await questionApi.update(questionData)
        } else {
          res = await questionApi.create(questionData)
        }
        
        if (res.code === 200) {
          uni.showToast({ title: editingQuestion.value ? userStore.t('common.updateSuccess') : userStore.t('common.createSuccess'), icon: 'success' })
          showQuestionForm.value = false
          loadData()
          resetForm()
        } else {
          uni.showToast({ title: res.message || userStore.t('common.saveFailed'), icon: 'none' })
        }
      } catch (e) {
        console.error(e)
        uni.showToast({ title: userStore.t('common.saveFailed'), icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
    
    const resetForm = () => {
      editingQuestion.value = null
      form.type = 'SINGLE_CHOICE'
      form.subjectId = null
      form.content = ''
      form.options = ['', '', '', '']
      form.correctAnswer = ''
      form.score = ''
    }
    
    const onImportSubjectChange = (e) => {
      importSubject.value = subjects.value[e.detail.value]
    }
    
    const submitImport = async () => {
      if (!importSubject.value) {
        uni.showToast({ title: userStore.t('common.selectSubject'), icon: 'none' })
        return
      }
      if (!importText.value.trim()) {
        uni.showToast({ title: userStore.t('common.enterImportText'), icon: 'none' })
        return
      }
      
      try {
        uni.showLoading({ title: userStore.t('common.importing') })
        
        const lines = importText.value.trim().split('\n')
        const questions = []
        
        for (const line of lines) {
          const parts = line.split('|')
          if (parts.length < 3) continue
          
          const typeMap = {
            '单选': 'SINGLE_CHOICE',
            '多选': 'MULTIPLE_CHOICE',
            '判断': 'JUDGMENT',
            '填空': 'FILL_BLANK',
            '简答': 'ESSAY',
            'Single': 'SINGLE_CHOICE',
            'Multi': 'MULTIPLE_CHOICE',
            'Judge': 'JUDGMENT',
            'Fill': 'FILL_BLANK',
            'Essay': 'ESSAY'
          }
          
          const typeKey = parts[0].trim()
          const type = typeMap[typeKey]
          
          if (!type) continue
          
          const question = {
            type: type,
            subjectId: importSubject.value.id,
            content: parts[1]?.trim() || '',
            correctAnswer: '',
            score: 10
          }
          
          if (type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') {
            if (parts.length >= 8) {
              question.options = [parts[2], parts[3], parts[4], parts[5]].filter(p => p?.trim()).join('|')
              question.correctAnswer = parts[6]?.trim() || ''
              question.score = parseInt(parts[7]) || 10
            }
          } else if (type === 'JUDGMENT') {
            if (parts.length >= 4) {
              question.options = userStore.t('common.correct') + '|' + userStore.t('common.wrong')
              question.correctAnswer = parts[2]?.trim() === '正确' || parts[2]?.trim() === 'A' ? 'A' : 'B'
              question.score = parseInt(parts[3]) || 10
            }
          } else if (type === 'FILL_BLANK') {
            if (parts.length >= 4) {
              question.correctAnswer = parts[2]?.trim() || ''
              question.score = parseInt(parts[3]) || 10
            }
          } else if (type === 'ESSAY') {
            if (parts.length >= 4) {
              question.correctAnswer = parts[2]?.trim() || ''
              question.score = parseInt(parts[3]) || 10
            }
          }
          
          if (question.content && question.correctAnswer) {
            questions.push(question)
          }
        }
        
        if (questions.length === 0) {
          uni.showToast({ title: userStore.t('common.noValidQuestions'), icon: 'none' })
          return
        }
        
        let successCount = 0
        for (const q of questions) {
          try {
            const res = await questionApi.create(q)
            if (res.code === 200) successCount++
          } catch (e) {
            console.error('导入单题失败:', e)
          }
        }
        
        uni.showToast({ title: userStore.t('common.importComplete') + ` ${successCount}/${questions.length}`, icon: 'success' })
        showImportModal.value = false
        importText.value = ''
        importSubject.value = null
        loadData()
        
      } catch (e) {
        console.error(e)
        uni.showToast({ title: userStore.t('common.importFailed'), icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
    
    const copyExample = (text) => {
      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({ title: userStore.t('common.copySuccess'), icon: 'success', duration: 1500 })
        },
        fail: () => {
          uni.showToast({ title: userStore.t('common.copyFailed'), icon: 'none' })
        }
      })
    }
    
    const deleteQuestion = async (item) => {
      uni.showModal({
        title: userStore.t('common.tip'),
        content: userStore.t('common.confirmDelete'),
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await questionApi.delete(item.id)
              if (result.code === 200) {
                uni.showToast({ title: userStore.t('common.deleteSuccess'), icon: 'success' })
                loadData()
              } else {
                uni.showToast({ title: result.message || userStore.t('common.deleteFailed'), icon: 'none' })
              }
            } catch (e) {
              uni.showToast({ title: userStore.t('common.deleteFailed'), icon: 'none' })
            }
          }
        }
      })
    }
    
    const setPageTitle = () => {
      uni.setNavigationBarTitle({
        title: userStore.t('common.questionManage')
      })
    }

    onMounted(() => {
      loadSubjects()
      loadData()
      setPageTitle()
    })

    watch(() => userStore.language, () => {
      setPageTitle()
    })
    
    return {
      keyword,
      questionList,
      subjects,
      questionTypes,
      subjectOptions,
      selectedSubjectName,
      selectedTypeName,
      showQuestionForm,
      editingQuestion,
      selectedFormType,
      selectedFormSubject,
      form,
      showImportModal,
      importText,
      importSubject,
      typeText,
      getTypeClass,
      getSubjectName,
      truncate,
      onSubjectChange,
      onTypeChange,
      onFormTypeChange,
      onFormSubjectChange,
      onImportSubjectChange,
      addOption,
      removeOption,
      loadData,
      editQuestion,
      submitQuestion,
      submitImport,
      copyExample,
      deleteQuestion,
      userStore
    }
  }
}
</script>

<style lang="scss">
@import "../../styles/manage.scss";

.manage-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 140rpx;
  padding-bottom: 160rpx;
  position: relative;
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 24rpx;
  background: #fff;
  margin-bottom: 24rpx;
  
  .picker {
    padding: 16rpx 20rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #666;
    
    .picker-text {
      font-size: 26rpx;
    }
  }
  
  .search-input {
    flex: 1;
    min-width: 200rpx;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
  }
  
  .search-btn {
    padding: 16rpx 32rpx;
    background: #dc2626;
    color: #fff;
    border-radius: 12rpx;
    font-size: 28rpx;
    height: 72rpx;
    line-height: 72rpx;
    padding: 0 32rpx;
  }
}

.list {
  padding: 0 24rpx;
  
  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    
    .item-info {
      flex: 1;
      min-width: 0;
      
      .item-title {
        font-size: 28rpx;
        color: #333;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 8rpx;
      }
      
      .item-meta {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .item-actions {
      display: flex;
      gap: 16rpx;
      margin-left: 24rpx;
      
      .action-btn {
        padding: 12rpx 24rpx;
        border-radius: 8rpx;
        font-size: 26rpx;
        background: #f5f5f5;
        color: #666;
        
        &.danger {
          background: #f56c6c;
          color: #fff;
        }
      }
    }
  }
  
  .empty {
    padding: 80rpx 24rpx;
    text-align: center;
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.type-tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
  margin-right: 12rpx;
  
  &.type-single {
    background: rgba(64, 158, 255, 0.1);
    color: #409eff;
  }
  &.type-multi {
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }
  &.type-judge {
    background: rgba(230, 162, 60, 0.1);
    color: #e6a23c;
  }
  &.type-fill {
    background: rgba(156, 136, 255, 0.1);
    color: #9c88ff;
  }
  &.type-essay {
    background: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
}

.add-btn {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-radius: 40rpx;
  
  .add-icon {
    font-size: 28rpx;
  }
  
  .add-text {
    font-size: 28rpx;
    color: #fff;
  }
}

.import-btn {
  position: fixed;
  bottom: 40rpx;
  right: 220rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 40rpx;
  
  .import-icon {
    font-size: 28rpx;
  }
  
  .import-text {
    font-size: 28rpx;
    color: #fff;
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

.question-modal, .import-modal {
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
  
  .form-hint {
    margin-bottom: 12rpx;
    padding: 16rpx;
    background: #f9fafb;
    border-radius: 8rpx;
    
    .hint-title {
      font-size: 26rpx;
      color: #666;
      display: block;
      margin-bottom: 12rpx;
      font-weight: bold;
    }
    
    .hint-example {
      margin-bottom: 12rpx;
    }
    
    .hint-line {
      font-size: 22rpx;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8rpx;
      font-family: monospace;
      line-height: 1.4;
      padding: 8rpx 12rpx;
      border-radius: 4rpx;
      background: #fff;
      border: 1rpx solid #e5e7eb;
      
      &:active {
        background: #f3f4f6;
      }
      
      .copy-icon {
        font-size: 24rpx;
        opacity: 0.6;
      }
    }
    
    .hint-note {
      font-size: 22rpx;
      color: #999;
      display: block;
      padding-top: 8rpx;
      border-top: 1rpx dashed #eee;
    }
  }
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