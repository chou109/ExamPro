<template>
  <div class="history">
    <div class="page-header">
      <h2>考试历史</h2>
      <p>查看已完成考试的成绩和答卷详情</p>
    </div>

    <div class="card">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="examTitle" label="考试名称" />
        <el-table-column prop="score" label="得分" width="100">
          <template #default="{ row }">
            <span :class="{ pass: row.score >= 60, fail: row.score < 60 }">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="交卷时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="current"
        v-model:page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { examRecordApi } from '../../utils/api'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const current = ref(1)
const size = ref(10)
const total = ref(0)

const typeText = (type) => ({ SINGLE_CHOICE: '单选题', MULTIPLE_CHOICE: '多选题', JUDGMENT: '判断题', FILL_BLANK: '填空题', ESSAY: '简答题', PROGRAMMING: '编程题' }[type] || type)

const loadData = async () => {
  loading.value = true
  try {
    const res = await examRecordApi.getStudentHistory({ current: current.value, size: size.value })
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const handleDetail = (row) => {
  router.push(`/student/examing/${row.examId}`)
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.history { max-width: 1200px; }

.pass { color: #22c55e; font-weight: 600; }
.fail { color: #ef4444; font-weight: 600; }

.score-summary {
  display: flex;
  gap: 32px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 20px;
}

.score-item {
  text-align: center;
}

.score-item .label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.score-item .value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.answer-list {
  max-height: 400px;
  overflow-y: auto;
}

.answer-item {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 12px;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.question-num {
  width: 24px;
  height: 24px;
  background: var(--brand-100);
  color: var(--brand-600);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.question-type {
  font-size: 13px;
  color: #64748b;
}

.question-content {
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 12px;
}

.answer-info {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #64748b;
}

.answer-info .wrong { color: #ef4444; }
.answer-info .correct { color: #22c55e; font-weight: 500; }
</style>
