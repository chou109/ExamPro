<template>
  <div class="student-statistics">
    <div class="page-header">
      <h2>成绩分析</h2>
      <p>查看您的学习数据分析</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 24px;">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.totalExams }}</p>
            <p class="stat-label">总考试数</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Medal /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.averageScore }}</p>
            <p class="stat-label">平均分</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.highestScore }}</p>
            <p class="stat-label">最高分</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.wrongCount }}</p>
            <p class="stat-label">错题数</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :span="12">
        <div class="card">
          <div class="card-header">
            <h3>科目成绩</h3>
          </div>
          <div class="subject-list">
            <div class="subject-item" v-for="subject in subjectScores" :key="subject.subjectName">
              <div class="subject-info">
                <h4>{{ subject.subjectName }}</h4>
                <p>{{ subject.examCount }}次考试</p>
              </div>
              <div class="subject-score">
                <span class="score-value">{{ subject.avgScore }}</span>
                <span class="score-label">分</span>
              </div>
              <div class="score-bar">
                <div class="bar-fill" :style="{ width: subject.avgScore + '%', background: subject.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card">
          <div class="card-header">
            <h3>答题情况</h3>
          </div>
          <div class="answer-stats">
            <div class="answer-item">
              <div class="answer-icon correct">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="answer-info">
                <span class="answer-count">{{ stats.correctCount }}</span>
                <span class="answer-label">答对题数</span>
              </div>
              <span class="answer-rate">{{ correctRate }}%</span>
            </div>
            <div class="answer-item">
              <div class="answer-icon wrong">
                <el-icon><CircleCloseFilled /></el-icon>
              </div>
              <div class="answer-info">
                <span class="answer-count">{{ stats.wrongCount }}</span>
                <span class="answer-label">答错题数</span>
              </div>
              <span class="answer-rate">{{ wrongRate }}%</span>
            </div>
            <div class="answer-item">
              <div class="answer-icon skip">
                <el-icon><RemoveFilled /></el-icon>
              </div>
              <div class="answer-info">
                <span class="answer-count">{{ stats.skippedCount }}</span>
                <span class="answer-label">未答题数</span>
              </div>
              <span class="answer-rate">{{ skippedRate }}%</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { examRecordApi } from '../../utils/api'

const stats = ref({
  totalExams: 0,
  averageScore: 0,
  highestScore: 0,
  wrongCount: 0,
  correctCount: 0,
  skippedCount: 0
})

const subjectColors = ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fb923c', '#f59e0b']

const subjectScores = ref([])

const totalAnswers = computed(() => stats.value.correctCount + stats.value.wrongCount + stats.value.skippedCount)
const correctRate = computed(() => totalAnswers.value > 0 ? Math.round((stats.value.correctCount / totalAnswers.value) * 100) : 0)
const wrongRate = computed(() => totalAnswers.value > 0 ? Math.round((stats.value.wrongCount / totalAnswers.value) * 100) : 0)
const skippedRate = computed(() => totalAnswers.value > 0 ? Math.round((stats.value.skippedCount / totalAnswers.value) * 100) : 0)

const loadData = async () => {
  try {
    const res = await examRecordApi.getAnalysis()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (e) {
    console.error(e)
    stats.value = {
      totalExams: 0,
      averageScore: 0,
      highestScore: 0,
      wrongCount: 0,
      correctCount: 0,
      skippedCount: 0
    }
  }
}

const loadSubjectScores = async () => {
  try {
    const res = await examRecordApi.getStudentSubjectScores()
    if (res.code === 200 && res.data) {
      subjectScores.value = res.data.map((subject, index) => ({
        ...subject,
        color: subjectColors[index % subjectColors.length]
      }))
    }
  } catch (e) {
    console.error(e)
    subjectScores.value = []
  }
}

onMounted(() => {
  loadData()
  loadSubjectScores()
})
</script>

<style lang="scss" scoped>
.student-statistics {
  max-width: 1400px;
}

.page-header {
  margin-bottom: 24px;
  
  h2 {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  
  p {
    margin-top: 8px;
    font-size: 14px;
    color: #64748b;
  }
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  
  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    color: white;
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    color: #0f172a;
  }
  
  .stat-label {
    font-size: 13px;
    color: #64748b;
    margin: 4px 0 0 0;
  }
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.card-header {
  margin-bottom: 20px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  .subject-item {
    .subject-info {
      margin-bottom: 8px;
      
      h4 {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
      }
      
      p {
        font-size: 12px;
        color: #64748b;
        margin: 4px 0 0 0;
      }
    }
    
    .subject-score {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 8px;
      
      .score-value {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
      }
      
      .score-label {
        font-size: 12px;
        color: #64748b;
      }
    }
    
    .score-bar {
      height: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
      
      .bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.5s ease;
      }
    }
  }
}

.answer-stats {
  .answer-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
    
    &:last-child {
      border-bottom: none;
    }
    
    .answer-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      
      &.correct {
        background: #fee2e2;
        color: #b91c1c;
      }
      
      &.wrong {
        background: #fecaca;
        color: #dc2626;
      }
      
      &.skip {
        background: #fca5a5;
        color: #ef4444;
      }
    }
    
    .answer-info {
      flex: 1;
      
      .answer-count {
        display: block;
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
      }
      
      .answer-label {
        font-size: 13px;
        color: #64748b;
      }
    }
    
    .answer-rate {
      font-size: 18px;
      font-weight: 600;
      color: #dc2626;
    }
  }
}
</style>
