<template>
  <div class="exam-list">
    <div class="page-header">
      <h2>考试列表</h2>
      <p>查看并参加待进行的考试</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索考试名称"
        class="search-input"
        @keyup.enter.native="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #suffix>
          <el-button type="danger" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
      <el-select
        v-model="searchForm.status"
        placeholder="筛选状态"
        class="status-select"
        @change="handleSearch"
      >
        <el-option label="全部" value="" />
        <el-option label="待开始" value="PENDING" />
        <el-option label="进行中" value="ONGOING" />
        <el-option label="已结束" value="FINISHED" />
      </el-select>
    </div>

    <el-row :gutter="24">
      <el-col :span="8" v-for="item in tableData" :key="item.exam.id">
        <div class="exam-card">
          <div class="exam-header">
            <h3>{{ item.exam.title }}</h3>
            <el-tag :type="getExamStatusType(item)">
              {{ getExamStatusText(item) }}
            </el-tag>
          </div>
          <div class="exam-info">
            <div class="info-item">
              <el-icon><Clock /></el-icon>
              <span>考试时长：{{ item.exam.duration }} 分钟</span>
            </div>
            <div class="info-item">
              <el-icon><Timer /></el-icon>
              <span>总分：{{ item.exam.totalScore }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatTime(item.exam.startTime) }}</span>
            </div>
          </div>
          <div class="exam-actions">
            <el-button 
              :type="item.studentStatus === 'SUBMITTED' ? 'success' : 'danger'" 
              @click="handleJoin(item.exam)" 
              :disabled="!canJoin(item) && !canView(item)"
            >
              {{ getButtonText(item) }}
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-empty v-if="tableData.length === 0" description="暂无考试" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { examApi } from '../../utils/api'

const router = useRouter()
const tableData = ref([])
const searchForm = ref({
  keyword: '',
  status: ''
})

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const getExamStatusType = (item) => {
  if (item.studentStatus === 'AUTO_SUBMITTED') {
    return 'danger'
  }
  if (item.studentStatus === 'SUBMITTED') {
    return 'success'
  }
  if (item.exam.status === 'ONGOING') return 'warning'
  return 'info'
}

const getExamStatusText = (item) => {
  if (item.studentStatus === 'AUTO_SUBMITTED') {
    return '强制收卷'
  }
  if (item.studentStatus === 'SUBMITTED') {
    return '已完成'
  }
  if (item.exam.status === 'ONGOING') return '进行中'
  return '即将开始'
}

const canJoin = (item) => {
  return item.exam.status === 'ONGOING' && item.studentStatus !== 'SUBMITTED' && item.studentStatus !== 'AUTO_SUBMITTED'
}

const canView = (item) => {
  return item.studentStatus === 'SUBMITTED' || item.studentStatus === 'AUTO_SUBMITTED'
}

const getButtonText = (item) => {
  if (item.studentStatus === 'SUBMITTED' || item.studentStatus === 'AUTO_SUBMITTED') return '查看详情'
  if (item.exam.status === 'ONGOING') return '进入考试'
  return '等待开始'
}

const handleJoin = (exam) => {
  router.push(`/student/examing/${exam.id}`)
}

const handleSearch = () => {
  loadData()
}

const loadData = async () => {
  try {
    const params = { 
      current: 1, 
      size: 20,
      keyword: searchForm.value.keyword,
      status: searchForm.value.status
    }
    const res = await examApi.studentPage(params)
    if (res.code === 200) {
      tableData.value = res.data.records
    }
  } catch (e) { console.error(e) }
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.exam-list { max-width: 1200px; }

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .search-input {
    width: 260px;
  }
  
  .status-select {
    width: 150px;
  }
}

.exam-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  margin-bottom: 24px;
  transition: all 0.2s;
}

.exam-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15);
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.exam-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.exam-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
}

.info-item .el-icon {
  color: #94a3b8;
}

.exam-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
