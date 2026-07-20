<template>
  <div class="question-manage">
    <div class="page-header">
      <h2>{{ userStore.t('teacher.questionManagement') }}</h2>
      <p>{{ userStore.t('teacher.questionManagementDesc') }}</p>
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select v-model="params.subjectId" :placeholder="userStore.t('teacher.selectSubject')" class="subject-select" clearable @change="loadData">
            <el-option v-for="s in subjects" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
          <el-select v-model="params.type" :placeholder="userStore.t('teacher.questionType')" class="type-select" clearable @change="loadData">
            <el-option :label="userStore.t('teacher.singleChoice')" value="SINGLE_CHOICE" />
            <el-option :label="userStore.t('teacher.multipleChoice')" value="MULTIPLE_CHOICE" />
            <el-option :label="userStore.t('teacher.judgment')" value="JUDGMENT" />
            <el-option :label="userStore.t('teacher.fillBlank')" value="FILL_BLANK" />
            <el-option :label="userStore.t('teacher.essay')" value="ESSAY" />
            <el-option :label="userStore.t('teacher.programming')" value="PROGRAMMING" />
          </el-select>
        </div>
        <div class="toolbar-center">
          <el-input v-model="params.keyword" :placeholder="userStore.t('teacher.searchQuestion')" class="search-input" clearable @change="loadData" />
          <el-button type="danger" @click="loadData">{{ userStore.t('common.search') }}</el-button>
        </div>
        <div class="toolbar-right">
          <el-button type="danger" @click="handleCreate">{{ userStore.t('teacher.addQuestion') }}</el-button>
          <el-button type="primary" @click="showImportDialog = true">{{ userStore.t('teacher.batchImport') }}</el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" :label="userStore.t('teacher.id')" width="80" />
        <el-table-column prop="type" :label="userStore.t('teacher.questionType')" width="100">
          <template #default="{ row }">
            <el-tag>{{ typeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" :label="userStore.t('teacher.questionContent')" show-overflow-tooltip />
        <el-table-column prop="usedCount" :label="userStore.t('teacher.frequency')" width="100" />
        <el-table-column :label="userStore.t('teacher.correctRate')" width="100">
          <template #default="{ row }">
            <span>{{ row.usedCount > 0 ? ((row.correctCount / row.usedCount) * 100).toFixed(1) + '%' : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="userStore.t('common.operation')" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleEdit(row)">{{ userStore.t('common.edit') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ userStore.t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="current"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? userStore.t('teacher.editQuestion') : userStore.t('teacher.addQuestion')" width="800px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="userStore.t('common.subject')" prop="subjectId">
          <el-select v-model="form.subjectId" style="width: 100%">
            <el-option v-for="s in subjects" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="userStore.t('teacher.questionType')" prop="type">
          <el-select v-model="form.type" style="width: 100%" @change="handleTypeChange">
            <el-option :label="userStore.t('teacher.singleChoice')" value="SINGLE_CHOICE" />
            <el-option :label="userStore.t('teacher.multipleChoice')" value="MULTIPLE_CHOICE" />
            <el-option :label="userStore.t('teacher.judgment')" value="JUDGMENT" />
            <el-option :label="userStore.t('teacher.fillBlank')" value="FILL_BLANK" />
            <el-option :label="userStore.t('teacher.essay')" value="ESSAY" />
            <el-option :label="userStore.t('teacher.programming')" value="PROGRAMMING" />
          </el-select>
        </el-form-item>

        <template v-if="['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(form.type)">
          <el-form-item :label="userStore.t('teacher.optionCount')" prop="optionCount">
            <el-select v-model="form.optionCount" style="width: 150px">
              <el-option :label="'2' + userStore.t('teacher.optionUnit')" :value="2" />
              <el-option :label="'3' + userStore.t('teacher.optionUnit')" :value="3" />
              <el-option :label="'4' + userStore.t('teacher.optionUnit')" :value="4" />
              <el-option :label="'5' + userStore.t('teacher.optionUnit')" :value="5" />
              <el-option :label="'6' + userStore.t('teacher.optionUnit')" :value="6" />
            </el-select>
          </el-form-item>
        </template>

        <template v-if="['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'JUDGMENT'].includes(form.type)">
          <el-form-item :label="userStore.t('teacher.questionContent')" prop="content">
            <el-input v-model="form.content" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item v-for="(option, index) in form.options" :key="index" :label="getOptionLabel(index)">
            <el-input v-model="option.content" :placeholder="userStore.t('teacher.enterOption') + getOptionLabel(index)" />
          </el-form-item>
          <el-form-item :label="userStore.t('teacher.correctAnswer')" prop="answer">
            <el-select v-model="form.answer" :multiple="form.type === 'MULTIPLE_CHOICE'" style="width: 100%">
              <el-option v-for="(option, index) in form.options" :key="index" :label="getOptionLabel(index)" :value="getOptionLabel(index)" />
            </el-select>
          </el-form-item>
        </template>

        <template v-if="form.type === 'FILL_BLANK'">
          <el-form-item :label="userStore.t('teacher.questionContent')" prop="content">
            <el-input v-model="form.content" type="textarea" :rows="3" :placeholder="userStore.t('teacher.fillBlankPlaceholder')" />
          </el-form-item>
          <div class="blank-toolbar">
            <el-button type="default" size="small" @click="insertBlank">{{ userStore.t('teacher.insertBlank') }}</el-button>
            <span class="hint">{{ userStore.t('teacher.blankHint') }}</span>
          </div>
          <el-form-item :label="userStore.t('teacher.correctAnswer')" prop="answer">
            <el-input v-model="form.answer" :placeholder="userStore.t('teacher.fillBlankAnswerPlaceholder')" />
          </el-form-item>
        </template>

        <template v-if="form.type === 'ESSAY'">
          <el-form-item :label="userStore.t('teacher.questionContent')" prop="content">
            <el-input v-model="form.content" type="textarea" :rows="5" />
          </el-form-item>
          <el-form-item :label="userStore.t('teacher.referenceAnswer')" prop="answer">
            <el-input v-model="form.answer" type="textarea" :rows="3" />
          </el-form-item>
        </template>

        <template v-if="form.type === 'PROGRAMMING'">
          <el-form-item :label="userStore.t('teacher.questionContent')" prop="content">
            <el-input v-model="form.content" type="textarea" :rows="5" />
          </el-form-item>
          <el-form-item :label="userStore.t('teacher.referenceAnswer')" prop="answer">
            <el-input v-model="form.answer" type="textarea" :rows="5" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ userStore.t('common.cancel') }}</el-button>
        <el-button type="danger" @click="handleSubmit">{{ userStore.t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="showImportDialog" :title="userStore.t('teacher.batchImport')" width="800px">
      <el-form ref="importFormRef" :model="importForm" label-width="120px">
        <el-form-item :label="userStore.t('teacher.selectSubject')" prop="subjectId">
          <el-select v-model="importForm.subjectId" style="width: 100%">
            <el-option v-for="s in subjects" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="userStore.t('teacher.questionText')">
          <el-input 
            v-model="importForm.text" 
            type="textarea" 
            :rows="12" 
            :placeholder="userStore.t('teacher.importPlaceholder')" />
        </el-form-item>
        <el-form-item>
          <el-alert :title="userStore.t('teacher.formatInstructions')" type="info" :closable="false">
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>{{ userStore.t('teacher.questionNumbering') }}：</strong>{{ userStore.t('teacher.numberingFormat') }}</li>
              <li><strong>{{ userStore.t('teacher.optionFormat') }}：</strong>{{ userStore.t('teacher.optionFormatDesc') }}</li>
              <li><strong>{{ userStore.t('teacher.answerMark') }}：</strong>{{ userStore.t('teacher.answerMarkDesc') }}</li>
              <li><strong>{{ userStore.t('teacher.judgmentFormat') }}：</strong>{{ userStore.t('teacher.judgmentFormatDesc') }}</li>
              <li><strong>{{ userStore.t('teacher.fillBlankFormat') }}：</strong>{{ userStore.t('teacher.fillBlankFormatDesc') }}</li>
              <li><strong>{{ userStore.t('teacher.essayFormat') }}：</strong>{{ userStore.t('teacher.essayFormatDesc') }}</li>
            </ul>
          </el-alert>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showImportDialog = false">{{ userStore.t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleImport">{{ userStore.t('teacher.startImport') }}</el-button>
      </template>
    </el-dialog>

    <!-- 导入结果对话框 -->
    <el-dialog v-model="showImportResult" :title="userStore.t('teacher.importResult')" width="600px">
      <div v-if="importResult">
        <div class="result-summary">
          <div :class="['result-icon', importResult.success ? 'success' : 'error']">
              <span>{{ importResult.success ? '✓' : '✗' }}</span>
            </div>
          <div class="result-info">
            <p class="result-message">{{ importResult.message }}</p>
            <div class="result-stats">
              <span class="stat-item">{{ userStore.t('teacher.success') }}：<strong>{{ importResult.imported }}</strong></span>
              <span class="stat-item">{{ userStore.t('teacher.failed') }}：<strong>{{ importResult.failed }}</strong></span>
            </div>
          </div>
        </div>
        <div v-if="importResult.errors && importResult.errors.length > 0" class="result-errors">
          <p class="errors-title">{{ userStore.t('teacher.failedDetails') }}：</p>
          <el-scrollbar style="max-height: 200px;">
            <ul class="errors-list">
              <li v-for="(error, index) in importResult.errors" :key="index">{{ error }}</li>
            </ul>
          </el-scrollbar>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showImportResult = false; showImportDialog = false">{{ userStore.t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { questionApi, subjectApi } from '../../utils/api'
import { useUserStore } from '../../store'

const userStore = useUserStore()
const loading = ref(false)
const tableData = ref([])
const subjects = ref([])
const current = ref(1)
const size = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const params = reactive({
  subjectId: null,
  type: '',
  keyword: ''
})

const form = reactive({
  id: null,
  subjectId: null,
  type: 'SINGLE_CHOICE',
  optionCount: 4,
  content: '',
  options: [],
  answer: ''
})

// 批量导入相关
const showImportDialog = ref(false)
const showImportResult = ref(false)
const importFormRef = ref()
const importForm = reactive({
  subjectId: null,
  text: ''
})
const importResult = ref(null)

const rules = {
  subjectId: [{ required: true, message: userStore.t('teacher.selectSubject'), trigger: 'change' }],
  type: [{ required: true, message: userStore.t('teacher.selectQuestionType'), trigger: 'change' }],
  content: [{ required: true, message: userStore.t('teacher.enterContent'), trigger: 'blur' }],
  answer: [{ required: true, message: userStore.t('teacher.enterAnswer'), trigger: 'blur' }]
}

const typeText = (type) => {
  const map = { 
    SINGLE_CHOICE: userStore.t('teacher.singleChoice'), 
    MULTIPLE_CHOICE: userStore.t('teacher.multipleChoice'), 
    JUDGMENT: userStore.t('teacher.judgment'), 
    FILL_BLANK: userStore.t('teacher.fillBlank'), 
    ESSAY: userStore.t('teacher.essay'), 
    PROGRAMMING: userStore.t('teacher.programming') 
  }
  return map[type] || type
}

const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index)
}

const initOptions = (count) => {
  form.options = []
  for (let i = 0; i < count; i++) {
    form.options.push({ key: getOptionLabel(i), content: '' })
  }
}

const handleTypeChange = () => {
  form.options = []
  form.answer = ''
  
  if (form.type === 'JUDGMENT') {
    form.options = [
      { key: 'A', content: userStore.t('teacher.correct') },
      { key: 'B', content: userStore.t('teacher.incorrect') }
    ]
    form.optionCount = 2
  } else if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(form.type)) {
    initOptions(form.optionCount)
  }
}

const insertBlank = () => {
  const textarea = document.querySelector('textarea.el-textarea__inner')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = form.content
    form.content = value.substring(0, start) + '$blank$' + value.substring(end)
  } else {
    form.content += ' $blank$'
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await questionApi.page({ current: current.value, size: size.value, ...params })
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadSubjects = async () => {
  const res = await subjectApi.list()
  if (res.code === 200) subjects.value = res.data
}

const handleCreate = () => {
  isEdit.value = false
  Object.assign(form, { id: null, subjectId: null, type: 'SINGLE_CHOICE', optionCount: 4, content: '', options: [], answer: '' })
  initOptions(4)
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { id: row.id, subjectId: row.subjectId, type: row.type, content: row.content })
  
  if (row.type === 'MULTIPLE_CHOICE' && row.answer && row.answer.includes(',')) {
    form.answer = row.answer.split(',')
  } else {
    form.answer = row.answer
  }
  
  if (row.options) {
    try {
      const options = typeof row.options === 'string' ? JSON.parse(row.options) : row.options
      if (Array.isArray(options)) {
        form.options = options
      } else {
        form.options = Object.keys(options).map(key => ({ key, content: options[key] }))
      }
      form.optionCount = form.options.length
    } catch {
      form.options = []
    }
  } else if (row.type === 'JUDGMENT') {
    form.options = [
      { key: 'A', content: userStore.t('teacher.correct') },
      { key: 'B', content: userStore.t('teacher.incorrect') }
    ]
    form.optionCount = 2
  } else {
    form.options = []
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    let answer = form.answer
    if (Array.isArray(answer)) {
      answer = answer.join(',')
    }
    
    const submitForm = {
      id: form.id,
      subjectId: form.subjectId,
      type: form.type,
      content: form.content,
      options: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'JUDGMENT'].includes(form.type) 
        ? JSON.stringify(Object.fromEntries(form.options.map(o => [o.key, o.content])))
        : null,
      answer: answer
    }
    
    const res = isEdit.value ? await questionApi.update(submitForm) : await questionApi.create(submitForm)
    if (res.code === 200) {
      ElMessage.success(userStore.t('common.success'))
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res.message || userStore.t('common.failed'))
    }
  } catch (e) {
    ElMessage.error(e.message || userStore.t('common.failed'))
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(userStore.t('teacher.confirmDeleteQuestion'))
  try {
    const res = await questionApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success(userStore.t('common.success'))
      loadData()
    }
  } catch (e) {
    ElMessage.error(e.message || userStore.t('common.failed'))
  }
}

// 批量导入题目
const handleImport = async () => {
  if (!importForm.subjectId) {
    ElMessage.warning(userStore.t('teacher.selectSubject'))
    return
  }
  if (!importForm.text.trim()) {
    ElMessage.warning(userStore.t('teacher.enterQuestionText'))
    return
  }
  
  try {
    const res = await questionApi.import({
      subjectId: importForm.subjectId,
      text: importForm.text
    })
    if (res.code === 200) {
      importResult.value = res.data
      showImportResult.value = true
      if (res.data.success) {
        loadData()
      }
    } else {
      ElMessage.error(res.message || userStore.t('teacher.importFailed'))
    }
  } catch (e) {
    console.error('导入错误:', e)
    ElMessage.error(e.response?.data?.message || e.message || userStore.t('teacher.importFailedRetry'))
  }
}

watch(() => form.optionCount, (newVal) => {
  if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(form.type)) {
    initOptions(newVal)
  }
})

onMounted(() => {
  loadData()
  loadSubjects()
  initOptions(4)
})
</script>

<style lang="scss" scoped>
.question-manage {
  width: 100%;
  max-width: 100%;
  padding: 0 8px;
  box-sizing: border-box;
}

.page-header {
  padding: 0 8px;
  margin-bottom: 20px;
  
  h2 {
    font-size: clamp(20px, 5vw, 28px);
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.3;
  }
  
  p {
    margin-top: 6px;
    font-size: clamp(13px, 3vw, 14px);
    color: #64748b;
    line-height: 1.5;
  }
}

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  position: sticky;
  top: 24px;
  z-index: 100;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: -20px -20px 20px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-center {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.subject-select {
  width: 180px;
}

.type-select {
  width: 160px;
}

.search-input {
  width: 200px;
}

.blank-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  
  .hint {
    font-size: clamp(11px, 2.5vw, 12px);
    color: #999;
  }
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #f25858 0%, #f85151 100%);
  border: none;
  color: #fff;
  
  &:hover, &:focus {
    background: linear-gradient(135deg, #f25858 0%, #dc2626 100%);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  }
}

:deep(.el-button--danger.el-button--link) {
  background: transparent;
  color: #dc2626;
  
  &:hover {
    color: #ef4444;
    text-decoration: underline;
  }
}

:deep(.el-select__wrapper) {
  border-radius: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-table) {
  --el-table-header-text-color: #0f172a;
  --el-table-row-hover-bg-color: rgba(220, 38, 38, 0.08);
}

:deep(.el-tag) {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  border: none;
  color: #fff;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #ec6767 0%, #c05151 100%);
  padding: 16px 20px;
  
  .el-dialog__title {
    color: #fff;
    font-weight: 600;
  }
  
  .el-dialog__close {
    color: #fff;
    
    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

:deep(.el-form-item__label) {
  color: #333;
  font-weight: 500;
}

:deep(.el-radio__inner) {
  border-color: #dc2626;
  
  &:checked {
    background: linear-gradient(135deg, #dc2626 0%, #ed4a4a 100%);
    border-color: transparent;
  }
}

:deep(.el-select-dropdown__item.selected) {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) {
  background: linear-gradient(135deg, #dc2626 0%, #ec4f4f 100%);
  border-color: transparent;
}

/* 导入结果和组卷结果样式 */
.result-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  
  .result-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    
    &.success {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: #fff;
    }
    
    &.error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #fff;
    }
  }
  
  .result-info {
    flex: 1;
    
    .result-message {
      font-size: clamp(14px, 3vw, 16px);
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 12px 0;
    }
    
    .result-stats {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      
      .stat-item {
        font-size: clamp(13px, 2.8vw, 14px);
        color: #666;
        
        strong {
          color: #dc2626;
          margin-left: 4px;
        }
      }
    }
  }
}

.result-errors {
  padding: 0 20px 20px;
  
  .errors-title {
    font-size: clamp(13px, 2.8vw, 14px);
    font-weight: 600;
    color: #dc2626;
    margin: 0 0 12px 0;
  }
  
  .errors-list {
    margin: 0;
    padding-left: 20px;
    
    li {
      font-size: clamp(12px, 2.5vw, 13px);
      color: #666;
      margin-bottom: 8px;
      word-break: break-all;
    }
  }
}

/* 题目数量网格 */
.question-count-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  
  .count-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    label {
      font-size: clamp(13px, 2.8vw, 14px);
      color: #333;
      font-weight: 500;
    }
    
    :deep(.el-input__wrapper) {
      width: 120px;
    }
  }
}

/* 响应式布局 */
@media screen and (max-width: 992px) {
  .card {
    padding: 16px;
    overflow-x: auto;
  }
  
  .toolbar {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    flex: 1;
    justify-content: flex-start;
  }
  
  .question-count-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .question-manage {
    padding: 0 4px;
  }
  
  .page-header {
    padding: 0 4px;
  }
  
  .card {
    padding: 14px;
  }
  
  .toolbar {
    flex-wrap: wrap;
    margin: -14px -14px 14px;
    padding: 12px;
    gap: 10px;
  }
  
  .toolbar-left {
    width: 100%;
    
    .el-select {
      flex: 1;
      min-width: 0;
      width: auto !important;
    }
  }
  
  .toolbar-center {
    width: 100%;
    justify-content: flex-start;
    
    .el-input {
      flex: 1;
      min-width: 0;
      width: auto !important;
    }
    
    .el-button {
      flex: 0 0 auto;
      white-space: nowrap;
    }
  }
  
  .toolbar-right {
    width: 100%;
    justify-content: flex-start;
  }
  
  .blank-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .question-count-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .result-summary {
    flex-direction: column;
    text-align: center;
    
    .result-icon {
      width: 50px;
      height: 50px;
      font-size: 24px;
    }
    
    .result-info {
      .result-stats {
        justify-content: center;
      }
    }
  }
}

@media screen and (max-width: 576px) {
  .card {
    padding: 12px;
  }
  
  .search-row {
    margin: -12px -12px 12px;
    padding: 10px;
  }
  
  .result-summary {
    padding: 16px;
    
    .result-icon {
      width: 44px;
      height: 44px;
      font-size: 20px;
    }
  }
}

@media screen and (max-width: 360px) {
  .card {
    padding: 10px;
  }
  
  .search-row {
    margin: -10px -10px 10px;
    padding: 8px;
  }
  
  .result-summary {
    padding: 12px;
    
    .result-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }
  }
}
</style>