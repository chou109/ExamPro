<template>
  <div class="exam-manage">
    <div class="page-header">
      <h2>{{ userStore.t('teacher.examManagement') }}</h2>
      <p>{{ userStore.t('teacher.examManagementDesc') }}</p>
    </div>

    <div class="card">
      <div class="toolbar">
        <el-select v-model="params.subjectId" :placeholder="userStore.t('teacher.selectSubject')" style="width: 180px" clearable @change="loadData">
          <el-option v-for="s in subjects" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
        <el-select v-model="params.status" :placeholder="userStore.t('common.status')" style="width: 120px" clearable @change="loadData">
          <el-option :label="userStore.t('common.pending')" value="PENDING" />
          <el-option :label="userStore.t('common.ongoing')" value="ONGOING" />
          <el-option :label="userStore.t('common.finished')" value="FINISHED" />
        </el-select>
        <el-input v-model="params.keyword" :placeholder="userStore.t('teacher.searchExamTitle')" style="width: 200px" clearable @change="loadData" />
        <el-button type="danger" @click="loadData">{{ userStore.t('common.search') }}</el-button>
        <el-button type="danger" @click="handleCreate">{{ userStore.t('teacher.publishExam') }}</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" :label="userStore.t('teacher.id')" width="80" />
        <el-table-column prop="title" :label="userStore.t('teacher.examTitle')" show-overflow-tooltip />
        <el-table-column prop="subjectId" :label="userStore.t('common.subject')" width="150">
          <template #default="{ row }">
            {{ getSubjectName(row.subjectId) }}
          </template>
        </el-table-column>
        <el-table-column :label="userStore.t('common.startTime')" width="160">
          <template #default="{ row }">{{ formatDateTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column :label="userStore.t('common.endTime')" width="160">
          <template #default="{ row }">{{ formatDateTime(row.endTime) }}</template>
        </el-table-column>
        <el-table-column prop="duration" :label="userStore.t('common.duration')" width="80" />
        <el-table-column prop="totalScore" :label="userStore.t('teacher.totalScore')" width="80" />
        <el-table-column prop="status" :label="userStore.t('common.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="userStore.t('common.operation')" width="340" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleMonitor(row)">{{ userStore.t('teacher.monitor') }}</el-button>
            <el-button type="danger" link @click="handleEdit(row)">{{ userStore.t('common.edit') }}</el-button>
            <el-button type="danger" link v-if="row.status === 'PENDING'" @click="handleStart(row)">{{ userStore.t('common.start') }}</el-button>
            <el-button type="danger" link v-if="row.status === 'ONGOING'" @click="handleExtend(row)">{{ userStore.t('teacher.extend') }}</el-button>
            <el-button type="danger" link v-if="row.status === 'ONGOING'" @click="handleFinish(row)">{{ userStore.t('common.finish') }}</el-button>
            <el-button type="danger" link @click="handleStats(row)">{{ userStore.t('teacher.stats') }}</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editMode ? userStore.t('teacher.editExam') : userStore.t('teacher.publishExam')" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="userStore.t('teacher.examTitle')" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item :label="userStore.t('teacher.selectPaper')" prop="paperId">
          <el-select v-model="form.paperId" style="width: 100%" @change="onPaperChange">
            <el-option v-for="p in papers" :key="p.id" :label="p.title" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="userStore.t('teacher.selectClass')" prop="classIds" :rules="[{ required: true, message: userStore.t('teacher.selectAtLeastOneClass'), trigger: 'change' }]">
          <el-select v-model="form.classIds" multiple :placeholder="userStore.t('teacher.selectPublishClass')" style="width: 100%">
            <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="userStore.t('common.startTime')">
              <el-date-picker v-model="form.startTime" type="datetime" :placeholder="userStore.t('teacher.selectStartTime')" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="userStore.t('common.endTime')">
              <el-date-picker v-model="form.endTime" type="datetime" :placeholder="userStore.t('teacher.selectEndTime')" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="userStore.t('teacher.examDuration')">
              <el-input-number v-model="form.duration" :min="1" :max="300" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="userStore.t('common.passRate')">
              <el-input-number v-model="form.passRate" :min="0" :max="100" style="width: 100%" />
              <span style="margin-left: 8px; color: #909399">%</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider>{{ userStore.t('teacher.antiCheatSettings') }}</el-divider>
        <el-form-item :label="userStore.t('common.shuffleQuestions')">
          <el-switch v-model="form.config.shuffleQuestions" />
        </el-form-item>
        <el-form-item :label="userStore.t('common.shuffleOptions')">
          <el-switch v-model="form.config.shuffleOptions" />
        </el-form-item>
        <el-form-item :label="userStore.t('common.leaveDetection')">
          <el-switch v-model="form.config.leaveDetection" />
        </el-form-item>
        <el-form-item :label="userStore.t('teacher.maxLeaveCount')" v-if="form.config.leaveDetection">
          <el-input-number v-model="form.config.maxLeaveCount" :min="1" :max="10" style="width: 100%" />
          <span style="margin-left: 8px; color: #909399">{{ userStore.t('teacher.exceedAutoSubmit') }}</span>
        </el-form-item>
        <el-divider>{{ userStore.t('teacher.postExamSettings') }}</el-divider>
        <el-form-item :label="userStore.t('teacher.allowViewAfterExam')">
          <el-switch v-model="form.config.allowViewAfterExam" />
          <span style="margin-left: 8px; color: #909399">{{ userStore.t('teacher.viewAfterExamDesc') }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ userStore.t('common.cancel') }}</el-button>
        <el-button type="danger" @click="handleSubmit">{{ editMode ? userStore.t('teacher.saveChanges') : userStore.t('common.publish') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="monitorVisible" :title="userStore.t('teacher.examMonitor')" width="900px">
      <div class="monitor-stats">
        <div class="stat-item">
          <span class="label">{{ userStore.t('teacher.totalStudents') }}</span>
          <span class="value">{{ monitorStats.totalStudents }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ userStore.t('teacher.submitted') }}</span>
          <span class="value">{{ monitorStats.submitted }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ userStore.t('teacher.autoSubmitted') }}</span>
          <span class="value danger">{{ monitorStats.autoSubmitted }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ userStore.t('common.ongoing') }}</span>
          <span class="value">{{ monitorStats.ongoing }}</span>
        </div>
        <div class="stat-item">
          <span class="label">{{ userStore.t('teacher.suspicious') }}</span>
          <span class="value warning">{{ monitorStats.suspicious }}</span>
        </div>
      </div>
      <el-table :data="monitorRecords" size="small">
        <el-table-column prop="studentName" :label="userStore.t('common.student')" />
        <el-table-column prop="status" :label="userStore.t('common.status')">
          <template #default="{ row }">
            <el-tag size="small" :type="getStatusType(row)">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="leaveCount" :label="userStore.t('common.leaveCount')" />
        <el-table-column prop="isSuspicious" :label="userStore.t('teacher.suspicious')">
          <template #default="{ row }">
            <el-tag size="small" type="warning" v-if="row.status !== 'AUTO_SUBMITTED' && row.leaveCount > 0">{{ userStore.t('teacher.suspicious') }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" :label="userStore.t('teacher.score')" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { examApi, subjectApi, paperApi, examRecordApi, classApi } from '../../utils/api'
import { useUserStore } from '../../store'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const tableData = ref([])
const subjects = ref([])
const papers = ref([])
const classes = ref([])
const current = ref(1)
const size = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const editMode = ref(false)
const editId = ref(null)
const monitorVisible = ref(false)
const monitorExam = ref(null)
const monitorRecords = ref([])
const monitorStats = ref({ totalStudents: 0, submitted: 0, autoSubmitted: 0, ongoing: 0, suspicious: 0 })
const formRef = ref()
let monitorTimer = null

const params = reactive({ subjectId: null, status: '', keyword: '' })

const form = reactive({
  title: '',
  paperId: null,
  subjectId: null,
  classIds: [],
  startTime: null,
  endTime: null,
  duration: 120,
  totalScore: 100,
  passRate: 60,
  config: { shuffleQuestions: true, shuffleOptions: true, leaveDetection: true, maxLeaveCount: 3, allowViewAfterExam: true }
})

const rules = {
  title: [{ required: true, message: userStore.t('teacher.enterExamTitle'), trigger: 'blur' }],
  paperId: [{ required: true, message: userStore.t('teacher.selectPaper'), trigger: 'change' }]
}

const statusType = (s) => ({ PENDING: 'warning', ONGOING: 'success', FINISHED: 'info' }[s])
const statusText = (s) => ({ PENDING: userStore.t('common.pending'), ONGOING: userStore.t('common.ongoing'), FINISHED: userStore.t('common.finished') }[s])
const getSubjectName = (id) => subjects.value.find(s => s.id === id)?.name || ''
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${d} ${h}:${min}`
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await examApi.page({ current: current.value, size: size.value, ...params })
    if (res.code === 200) { tableData.value = res.data.records; total.value = res.data.total }
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const loadSubjects = async () => {
  const res = await subjectApi.list()
  if (res.code === 200) subjects.value = res.data
}

const loadPapers = async () => {
  const res = await paperApi.page({ current: 1, size: 100, status: 'PUBLISHED' })
  if (res.code === 200) papers.value = res.data.records
}

const loadClasses = async () => {
  try {
    const rawUserId = userStore.userInfo?.userId
    const userId = rawUserId ?? localStorage.getItem('userId')
    if (!userId || String(userId) === 'null' || String(userId) === 'undefined' || String(userId) === 'NaN') {
      console.warn('userId not found, skipping loadClasses')
      return
    }
    const res = await classApi.getMyClasses(String(userId))
    if (res.code === 200) {
      classes.value = res.data.map(item => ({ id: item.class.id, name: item.class.className }))
    }
  } catch (e) { 
    console.error('loadClasses error:', e.message || e)
  }
}

const onPaperChange = (paperId) => {
  const paper = papers.value.find(p => p.id === paperId)
  if (paper) {
    form.subjectId = paper.subjectId
    form.totalScore = paper.totalScore
    form.passRate = Math.round((paper.passScore / paper.totalScore) * 100) || 60
    form.duration = paper.duration
  }
}

const handleCreate = () => {
  editMode.value = false
  editId.value = null
  const queryClassId = route.query.classId
  Object.assign(form, { title: '', paperId: null, subjectId: null, classIds: queryClassId ? [parseInt(queryClassId)] : [], startTime: null, endTime: null, duration: 120, totalScore: 100, passRate: 60, config: { shuffleQuestions: true, shuffleOptions: true, leaveDetection: true, maxLeaveCount: 3, allowViewAfterExam: true } })
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  editMode.value = true
  editId.value = row.id
  try {
    const res = await examApi.getById(row.id)
    if (res.code === 200) {
      const exam = res.data
      const config = exam.antiCheatConfig ? JSON.parse(exam.antiCheatConfig) : { shuffleQuestions: true, shuffleOptions: true, leaveDetection: true, maxLeaveCount: 3, allowViewAfterExam: true }
      Object.assign(form, {
        title: exam.title,
        paperId: exam.paperId,
        subjectId: exam.subjectId,
        classIds: exam.classIds ? exam.classIds.split(',').map(Number) : [],
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: exam.duration,
        totalScore: exam.totalScore,
        passRate: exam.passScore ? Math.round((exam.passScore / exam.totalScore) * 100) : 60,
        config: config
      })
      dialogVisible.value = true
    }
  } catch (e) {
    ElMessage.error(userStore.t('teacher.getExamInfoFailed'))
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    const passScore = Math.round(form.totalScore * form.passRate / 100)
    const submitData = {
      id: editId.value,
      title: form.title,
      paperId: form.paperId,
      subjectId: form.subjectId,
      classIds: form.classIds.join(','),
      startTime: form.startTime,
      endTime: form.endTime,
      duration: form.duration,
      totalScore: form.totalScore,
      passScore: passScore,
      antiCheatConfig: JSON.stringify(form.config),
      allowViewAfterExam: form.config.allowViewAfterExam ? 1 : 0
    }
    
    let res
    if (editMode.value) {
      res = await examApi.update(submitData)
    } else {
      res = await examApi.create(submitData)
    }
    
    if (res.code === 200) { 
      ElMessage.success(editMode.value ? userStore.t('common.success') : userStore.t('teacher.publishSuccess'))
      dialogVisible.value = false
      loadData() 
    } else {
      ElMessage.error(res.message || userStore.t('common.failed'))
    }
  } catch (e) { ElMessage.error(e.message || userStore.t('common.failed')) }
}

const handleStart = async (row) => {
  await ElMessageBox.confirm(userStore.t('teacher.confirmStartExam'))
  try {
    const res = await examApi.start(row.id)
    if (res.code === 200) { 
      ElMessage.success(userStore.t('teacher.examStarted'))
      loadData()
      
      const examInfo = await examApi.getById(row.id)
      if (examInfo.code === 200) {
        const examData = examInfo.data
        const classIds = examData.classIds?.split(',') || []
        const userId = userStore.userInfo?.userId || localStorage.getItem('userId')
        
        const startTime = new Date(examData.startTime)
        const timeStr = `${startTime.getFullYear()}/${String(startTime.getMonth() + 1).padStart(2, '0')}/${String(startTime.getDate()).padStart(2, '0')} ${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`
        const endTime = new Date(examData.endTime)
        const endTimeStr = `${endTime.getFullYear()}/${String(endTime.getMonth() + 1).padStart(2, '0')}/${String(endTime.getDate()).padStart(2, '0')} ${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`
        
        for (const cId of classIds) {
          const noticeContent = `EXAM_NOTICE|${examData.title}|${timeStr}|${endTimeStr}|${examData.duration}|${examData.id}|START`
          await classApi.sendMessage(cId, noticeContent, userId)
        }
      }
    }
  } catch (e) { ElMessage.error(e.message || userStore.t('common.failed')) }
}

const handleFinish = async (row) => {
  await ElMessageBox.confirm(userStore.t('teacher.confirmFinishExam'))
  try {
    const res = await examApi.finish(row.id)
    if (res.code === 200) { ElMessage.success(userStore.t('teacher.examFinished')); loadData() }
  } catch (e) { ElMessage.error(e.message || userStore.t('common.failed')) }
}

const handleExtend = async (row) => {
  await ElMessageBox.prompt(userStore.t('teacher.enterExtendMinutes'), userStore.t('teacher.extendExamTime'), { confirmButtonText: userStore.t('common.confirm'), cancelButtonText: userStore.t('common.cancel') })
    .then(async ({ value }) => {
      try {
        const res = await examApi.extend(row.id, parseInt(value))
        if (res.code === 200) { ElMessage.success(userStore.t('teacher.extendSuccess')); loadData() }
      } catch (e) { ElMessage.error(e.message || userStore.t('common.failed')) }
    })
}

const handleMonitor = async (row) => {
  monitorExam.value = row
  monitorVisible.value = true
  await loadMonitorData()
  monitorTimer = setInterval(loadMonitorData, 10000)
}

const loadMonitorData = async () => {
  if (!monitorExam.value) return
  try {
    const res = await examRecordApi.page({ current: 1, size: 100, examId: monitorExam.value.id })
    if (res.code === 200) {
      monitorRecords.value = res.data.records
      monitorStats.value = {
        totalStudents: res.data.total,
        submitted: res.data.records.filter(r => r.status === 'SUBMITTED').length,
        autoSubmitted: res.data.records.filter(r => r.status === 'AUTO_SUBMITTED').length,
        ongoing: res.data.records.filter(r => r.status === 'ONGOING').length,
        suspicious: res.data.records.filter(r => r.status !== 'AUTO_SUBMITTED' && r.leaveCount > 0).length
      }
    }
  } catch (e) { console.error(e) }
}

const getStatusType = (row) => {
  if (row.status === 'AUTO_SUBMITTED') {
    return 'danger'
  }
  if (row.status === 'SUBMITTED') {
    return 'success'
  }
  if (row.status === 'ONGOING') return 'warning'
  return 'info'
}

const getStatusText = (row) => {
  if (row.status === 'AUTO_SUBMITTED') {
    return userStore.t('teacher.autoSubmitted')
  }
  if (row.status === 'SUBMITTED') {
    return userStore.t('teacher.submitted')
  }
  if (row.status === 'ONGOING') return userStore.t('common.ongoing')
  return userStore.t('teacher.notStarted')
}

const handleStats = async (row) => {
  try {
    const res = await examApi.getStatistics(row.id)
    if (res.code === 200) {
      const stats = res.data
      const t = userStore.t
      ElMessageBox.alert(`${t('teacher.examStats')}：<br>${t('teacher.totalStudents')}：${stats.totalStudents}<br>${t('teacher.avgScore')}：${stats.avgScore}<br>${t('teacher.maxScore')}：${stats.maxScore}<br>${t('teacher.minScore')}：${stats.minScore}<br>${t('common.passRate')}：${stats.passRate}%`, t('teacher.examStats'), { dangerouslyUseHTMLString: true })
    }
  } catch (e) { console.error(e) }
}

onMounted(() => { loadData(); loadSubjects(); loadPapers(); loadClasses() })
onUnmounted(() => { if (monitorTimer) clearInterval(monitorTimer) })
</script>

<style lang="scss" scoped>
.exam-manage {
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
  margin-bottom: 20px;
  margin-left: 8px;
  margin-right: 8px;
  width: calc(100% - 16px);
  box-sizing: border-box;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.monitor-stats {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  background: #f8fafc;
  padding: 16px;
  border-radius: 10px;
  text-align: center;
}

.stat-item .label { display: block; font-size: 13px; color: #64748b; margin-bottom: 8px; }
.stat-item .value { font-size: 24px; font-weight: 700; color: #1e293b; }
.stat-item .value.warning { color: #f59e0b; }
.stat-item .value.danger { color: #ef4444; }

@media screen and (max-width: 1200px) {
  .monitor-stats {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .card {
    padding: 16px;
    overflow-x: auto;
  }
}

@media screen and (max-width: 768px) {
  .exam-manage {
    padding: 0 4px;
  }
  
  .page-header {
    padding: 0 4px;
  }
  
  .page-header h2 {
    font-size: clamp(18px, 4vw, 24px);
  }
  
  .card {
    padding: 14px;
    margin-left: 4px;
    margin-right: 4px;
    width: calc(100% - 8px);
    overflow-x: auto;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .toolbar .el-input,
  .toolbar .el-select,
  .toolbar .el-button {
    width: 100%;
  }
  
  .monitor-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .stat-item .value {
    font-size: 20px;
  }
}

@media screen and (max-width: 576px) {
  .card {
    padding: 12px;
  }
  
  .toolbar {
    gap: 10px;
  }
  
  .monitor-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .stat-item {
    padding: 10px;
  }
  
  .stat-item .label {
    font-size: 12px;
  }
  
  .stat-item .value {
    font-size: 18px;
  }
}

@media screen and (max-width: 360px) {
  .card {
    padding: 10px;
  }
  
  .monitor-stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stat-item {
    padding: 8px;
  }
  
  .stat-item .label {
    font-size: 11px;
  }
  
  .stat-item .value {
    font-size: 16px;
  }
}
</style>
