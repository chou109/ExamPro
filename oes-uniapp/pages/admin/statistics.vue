<template>
  <view class="manage-page">
    <CustomNavBar :title="userStore.t('common.statistics')" :showBack="true" />
    
    <view class="stats-grid">
      <view class="stat-card">
        <text class="stat-value">{{ stats.totalUsers }}</text>
        <text class="stat-label">{{ userStore.t('dashboard.totalUsers') }}</text>
        <view class="stat-sub">
          <text class="sub-item">👨‍🎓 {{ stats.studentCount }} {{ userStore.t('common.student') }}</text>
          <text class="sub-item">👨‍🏫 {{ stats.teacherCount }} {{ userStore.t('common.teacher') }}</text>
        </view>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.departmentCount }}</text>
        <text class="stat-label">{{ userStore.t('dashboard.departmentCount') }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.classCount }}</text>
        <text class="stat-label">{{ userStore.t('dashboard.classCount') }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.paperCount }}</text>
        <text class="stat-label">{{ userStore.t('dashboard.paperCount') }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.questionCount }}</text>
        <text class="stat-label">{{ userStore.t('dashboard.questionCount') }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.totalExams }}</text>
        <text class="stat-label">{{ userStore.t('dashboard.examCount') }}</text>
        <view class="stat-sub">
          <text class="sub-item">⏳ {{ stats.pendingExams }} {{ userStore.t('common.pending') }}</text>
          <text class="sub-item">🔄 {{ stats.ongoingExams }} {{ userStore.t('common.ongoing') }}</text>
          <text class="sub-item">✅ {{ stats.finishedExams }} {{ userStore.t('common.finished') }}</text>
        </view>
      </view>
    </view>

    <view class="chart-card">
      <view class="chart-header">
        <text class="chart-title">📊 {{ userStore.t('common.exam') }}{{ userStore.t('common.status') }}{{ userStore.t('common.distribution') }}</text>
      </view>
      <view class="chart-content">
        <view class="progress-bar">
          <view class="progress-item pending" :style="{ width: pendingPercent + '%' }"></view>
          <view class="progress-item ongoing" :style="{ width: ongoingPercent + '%' }"></view>
          <view class="progress-item finished" :style="{ width: finishedPercent + '%' }"></view>
        </view>
        <view class="progress-legend">
          <view class="legend-item">
            <view class="legend-dot pending"></view>
            <text class="legend-text">{{ userStore.t('common.pending') }} {{ stats.pendingExams }}</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot ongoing"></view>
            <text class="legend-text">{{ userStore.t('common.ongoing') }} {{ stats.ongoingExams }}</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot finished"></view>
            <text class="legend-text">{{ userStore.t('common.finished') }} {{ stats.finishedExams }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="chart-card">
      <view class="chart-header">
        <text class="chart-title">👥 {{ userStore.t('common.user') }}{{ userStore.t('common.role') }}{{ userStore.t('common.distribution') }}</text>
      </view>
      <view class="chart-content">
        <view class="pie-container">
          <view class="pie-chart">
            <view class="pie-ring" :style="{ '--student-pct': studentPercent + '%', '--teacher-pct': teacherPercent + '%' }"></view>
            <view class="pie-center">
              <text class="pie-total">{{ stats.totalUsers }}</text>
              <text class="pie-label">{{ userStore.t('dashboard.totalUsers') }}</text>
            </view>
          </view>
        </view>
        <view class="pie-legend">
          <view class="legend-item">
            <view class="legend-dot student"></view>
            <text class="legend-text">{{ userStore.t('common.student') }}</text>
            <text class="legend-count">{{ stats.studentCount }}</text>
            <text class="legend-percent">{{ studentPercent }}%</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot teacher"></view>
            <text class="legend-text">{{ userStore.t('common.teacher') }}</text>
            <text class="legend-count">{{ stats.teacherCount }}</text>
            <text class="legend-percent">{{ teacherPercent }}%</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot admin"></view>
            <text class="legend-text">{{ userStore.t('common.admin') }}</text>
            <text class="legend-count">{{ stats.adminCount }}</text>
            <text class="legend-percent">{{ adminPercent }}%</text>
          </view>
        </view>
      </view>
    </view>

    <view class="info-card">
      <view class="info-header">
        <text class="info-title">📈 {{ userStore.t('common.overview') }}</text>
      </view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-icon">👥</text>
          <view class="info-content">
            <text class="info-label">{{ userStore.t('common.total') }} {{ userStore.t('common.participation') }}</text>
            <text class="info-value">{{ stats.participationCount }}</text>
          </view>
        </view>
        <view class="info-item">
          <text class="info-icon">📄</text>
          <view class="info-content">
            <text class="info-label">{{ userStore.t('common.paper') }}{{ userStore.t('common.average') }}{{ userStore.t('common.question') }}{{ userStore.t('common.count') }}</text>
            <text class="info-value">{{ avgQuestionsPerPaper }}</text>
          </view>
        </view>
        <view class="info-item">
          <text class="info-icon">📝</text>
          <view class="info-content">
            <text class="info-label">{{ userStore.t('common.average') }}{{ userStore.t('common.score') }}{{ userStore.t('common.per') }}{{ userStore.t('common.question') }}</text>
            <text class="info-value">{{ avgScorePerQuestion }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { statisticsApi } from '../../utils/api'
import { useUserStore } from '../../store/index.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

export default {
  components: { CustomNavBar },
  setup() {
    const userStore = useUserStore()
    
    const stats = ref({
      totalUsers: 0,
      studentCount: 0,
      teacherCount: 0,
      adminCount: 0,
      departmentCount: 0,
      classCount: 0,
      paperCount: 0,
      questionCount: 0,
      totalExams: 0,
      pendingExams: 0,
      ongoingExams: 0,
      finishedExams: 0,
      participationCount: 0
    })

    const totalExamStatus = computed(() => {
      return stats.value.pendingExams + stats.value.ongoingExams + stats.value.finishedExams
    })

    const pendingPercent = computed(() => {
      if (totalExamStatus.value === 0) return 0
      return ((stats.value.pendingExams / totalExamStatus.value) * 100).toFixed(0)
    })

    const ongoingPercent = computed(() => {
      if (totalExamStatus.value === 0) return 0
      return ((stats.value.ongoingExams / totalExamStatus.value) * 100).toFixed(0)
    })

    const finishedPercent = computed(() => {
      if (totalExamStatus.value === 0) return 0
      return ((stats.value.finishedExams / totalExamStatus.value) * 100).toFixed(0)
    })

    const studentPercent = computed(() => {
      if (stats.value.totalUsers === 0) return 0
      return ((stats.value.studentCount / stats.value.totalUsers) * 100).toFixed(1)
    })

    const teacherPercent = computed(() => {
      if (stats.value.totalUsers === 0) return 0
      return ((stats.value.teacherCount / stats.value.totalUsers) * 100).toFixed(1)
    })

    const adminPercent = computed(() => {
      if (stats.value.totalUsers === 0) return 0
      return ((stats.value.adminCount / stats.value.totalUsers) * 100).toFixed(1)
    })

    

    const avgQuestionsPerPaper = computed(() => {
      if (stats.value.paperCount === 0) return '0'
      return (stats.value.questionCount / stats.value.paperCount).toFixed(1)
    })

    const avgScorePerQuestion = computed(() => {
      if (stats.value.questionCount === 0) return '0.0'
      return '2.5'
    })

    const loadData = async () => {
      try {
        uni.showLoading({ title: userStore.t('common.loading') })
        const res = await statisticsApi.overview()
        if (res.code === 200) {
          stats.value = {
            ...stats.value,
            ...res.data
          }
        }
      } catch (e) {
        uni.showToast({ title: userStore.t('common.loadFailed'), icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }

    const setPageTitle = () => {
      uni.setNavigationBarTitle({
        title: userStore.t('common.dataStatistics')
      })
    }

    onMounted(() => {
      loadData()
      setPageTitle()
    })

    watch(() => userStore.language, () => {
      setPageTitle()
    })

    return {
      userStore,
      stats,
      pendingPercent,
      ongoingPercent,
      finishedPercent,
      studentPercent,
      teacherPercent,
      adminPercent,
      avgQuestionsPerPaper,
      avgScorePerQuestion
    }
  }
}
</script>

<style lang="scss">
.manage-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
  padding-top: 140rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;

  .stat-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 28rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

    .stat-value {
      font-size: 48rpx;
      font-weight: 700;
      color: #dc2626;
      display: block;
      margin-bottom: 8rpx;
    }

    .stat-label {
      font-size: 26rpx;
      color: #666;
      display: block;
      margin-bottom: 16rpx;
    }

    .stat-sub {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .sub-item {
        font-size: 22rpx;
        color: #999;
        background: #f5f5f5;
        padding: 6rpx 12rpx;
        border-radius: 8rpx;
      }
    }
  }
}

.chart-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  .chart-header {
    margin-bottom: 20rpx;

    .chart-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .chart-content {
    .progress-bar {
      height: 24rpx;
      background: #f0f0f0;
      border-radius: 12rpx;
      display: flex;
      overflow: hidden;
      margin-bottom: 20rpx;

      .progress-item {
        height: 100%;
        transition: width 0.5s ease;

        &.pending {
          background: linear-gradient(90deg, #f59e0b, #d97706);
        }

        &.ongoing {
          background: linear-gradient(90deg, #22c55e, #16a34a);
        }

        &.finished {
          background: linear-gradient(90deg, #64748b, #475569);
        }
      }
    }

    .progress-legend {
      display: flex;
      justify-content: space-around;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .legend-dot {
          width: 16rpx;
          height: 16rpx;
          border-radius: 50%;

          &.pending { background: #f59e0b; }
          &.ongoing { background: #22c55e; }
          &.finished { background: #64748b; }
        }

        .legend-text {
          font-size: 24rpx;
          color: #666;
        }
      }
    }

    .pie-container {
        display: flex;
        justify-content: center;
        margin-bottom: 20rpx;
      }

      .pie-chart {
        width: 200rpx;
        height: 200rpx;
        border-radius: 50%;
        position: relative;

        .pie-ring {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: conic-gradient(
            #dc2626 0% var(--student-pct),
            #22c55e var(--student-pct) calc(var(--student-pct) + var(--teacher-pct)),
            #3b82f6 calc(var(--student-pct) + var(--teacher-pct)) 100%
          );
        }

        .pie-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120rpx;
          height: 120rpx;
          background: #fff;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .pie-total {
            font-size: 36rpx;
            font-weight: 700;
            color: #333;
          }

          .pie-label {
            font-size: 22rpx;
            color: #999;
          }
        }
      }

      .pie-legend {
        display: flex;
        flex-direction: column;
        gap: 16rpx;

        .legend-item {
          display: flex;
          align-items: center;

          .legend-dot {
            width: 16rpx;
            height: 16rpx;
            border-radius: 50%;
            margin-right: 16rpx;

            &.student { background: #dc2626; }
            &.teacher { background: #22c55e; }
            &.admin { background: #3b82f6; }
          }

          .legend-text {
            font-size: 28rpx;
            color: #333;
            width: 120rpx;
          }

          .legend-count {
            font-size: 28rpx;
            color: #666;
            margin-right: 16rpx;
          }

          .legend-percent {
            font-size: 28rpx;
            color: #dc2626;
            font-weight: 600;
            margin-left: auto;
          }
        }
      }
  }
}

.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  .info-header {
    margin-bottom: 20rpx;

    .info-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .info-list {
    .info-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .info-icon {
        font-size: 36rpx;
        margin-right: 20rpx;
      }

      .info-content {
        flex: 1;

        .info-label {
          font-size: 26rpx;
          color: #666;
          display: block;
          margin-bottom: 4rpx;
        }

        .info-value {
          font-size: 32rpx;
          color: #333;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
