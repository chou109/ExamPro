<template>
  <view class="manage-page">
    <CustomNavBar :title="userStore.t('common.logManage')" :showBack="true" />
    
    <view class="search-bar">
      <input class="search-input" v-model="keyword" :placeholder="userStore.t('common.searchPlaceholder')" @input="onSearchInput" />
      <button class="search-btn" @click="loadData">{{ userStore.t('common.search') }}</button>
    </view>
    
    <view class="filter-row">
      <picker mode="selector" :range="operationOptions" range-key="label" @change="onOperationChange">
        <view class="picker">
          <text class="picker-text">{{ selectedOperationLabel || userStore.t('common.all') + userStore.t('common.operation') }}</text>
        </view>
      </picker>
    </view>
    
    <view class="log-list">
      <view class="log-item" v-for="log in logList" :key="log.id">
        <view class="log-header">
          <text class="log-operator">{{ log.username || '-' }}</text>
          <text class="log-time">{{ formatTime(log.createTime) }}</text>
        </view>
        <view class="log-body">
          <text class="log-action">{{ log.operation || '-' }}</text>
          <view class="log-meta">
            <text class="log-ip">{{ log.ip || '-' }}</text>
            <text class="log-method" :class="getMethodClass(log.method)">{{ log.method || '-' }}</text>
          </view>
          <text class="log-target" v-if="log.params">{{ log.params }}</text>
        </view>
      </view>
      
      <view class="empty" v-if="logList.length === 0">
        <text class="empty-text">{{ userStore.t('common.noLogData') }}</text>
      </view>
    </view>
    
    <view class="pagination" v-if="total > 0">
      <view class="page-info">{{ userStore.t('common.totalRecords', { total }) }}</view>
      <view class="page-control">
        <text class="page-btn" :class="{ disabled: currentPage <= 1 }" @click="prevPage">{{ userStore.t('common.prevPage') }}</text>
        <text class="page-num">{{ currentPage }} / {{ totalPages }}</text>
        <text class="page-btn" :class="{ disabled: currentPage >= totalPages }" @click="nextPage">{{ userStore.t('common.nextPage') }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { logApi } from '../../utils/api'
import { useUserStore } from '../../store/index.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

export default {
  components: { CustomNavBar },
  setup() {
    const userStore = useUserStore()
    const logList = ref([])
    const keyword = ref('')
    const currentPage = ref(1)
    const total = ref(0)
    const pageSize = ref(20)
    const selectedOperation = ref('')
    
    const operationOptions = computed(() => [
      { value: '', label: userStore.t('common.all') + userStore.t('common.operation') },
      { value: userStore.t('common.login'), label: userStore.t('common.login') },
      { value: userStore.t('common.logout'), label: userStore.t('common.logout') },
      { value: userStore.t('common.createUser'), label: userStore.t('common.createUser') },
      { value: userStore.t('common.updateUser'), label: userStore.t('common.updateUser') },
      { value: userStore.t('common.deleteUser'), label: userStore.t('common.deleteUser') },
      { value: userStore.t('common.createDepartment'), label: userStore.t('common.createDepartment') },
      { value: userStore.t('common.updateDepartment'), label: userStore.t('common.updateDepartment') },
      { value: userStore.t('common.deleteDepartment'), label: userStore.t('common.deleteDepartment') },
      { value: userStore.t('common.createClass'), label: userStore.t('common.createClass') },
      { value: userStore.t('common.updateClass'), label: userStore.t('common.updateClass') },
      { value: userStore.t('common.deleteClass'), label: userStore.t('common.deleteClass') },
      { value: userStore.t('common.createExam'), label: userStore.t('common.createExam') },
      { value: userStore.t('common.updateExam'), label: userStore.t('common.updateExam') },
      { value: userStore.t('common.deleteExam'), label: userStore.t('common.deleteExam') }
    ])
    
    const selectedOperationLabel = computed(() => {
      const opt = operationOptions.find(o => o.value === selectedOperation.value)
      return opt?.label || ''
    })
    
    const totalPages = computed(() => {
      return Math.ceil(total.value / pageSize.value)
    })
    
    const formatTime = (time) => {
      if (!time) return '-'
      const date = new Date(time)
      if (userStore.language === 'zh') {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } else {
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      }
    }
    
    const getMethodClass = (method) => {
      const map = {
        'POST': 'post',
        'GET': 'get',
        'PUT': 'put',
        'DELETE': 'delete'
      }
      return map[method] || ''
    }
    
    let searchTimer = null
    const onSearchInput = () => {
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        currentPage.value = 1
        loadData()
      }, 300)
    }
    
    const onOperationChange = (e) => {
      const index = e.detail.value
      selectedOperation.value = operationOptions.value[index].value
      currentPage.value = 1
      loadData()
    }
    
    const loadData = async () => {
      try {
        uni.showLoading({ title: userStore.t('common.loading') })
        const params = {
          current: currentPage.value,
          size: pageSize.value
        }
        if (keyword.value.trim()) {
          params.keyword = keyword.value.trim()
        }
        if (selectedOperation.value) {
          params.operation = selectedOperation.value
        }
        const res = await logApi.page(params)
        if (res.code === 200) {
          logList.value = res.data.records || []
          total.value = res.data.total || 0
        }
      } catch (e) {
        uni.showToast({ title: userStore.t('common.loadFailed'), icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
    
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
        loadData()
      }
    }
    
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
        loadData()
      }
    }
    
    const setPageTitle = () => {
      uni.setNavigationBarTitle({
        title: userStore.t('common.systemLog')
      })
    }

    const toggleLanguage = () => {
      const newLang = userStore.language === 'zh' ? 'en' : 'zh'
      userStore.changeLanguage(newLang)
    }

    onMounted(() => {
      loadData()
      setPageTitle()
    })

    uni.$on('pageShow', () => {
      loadData()
    })

    onShow(() => {
      loadData()
    })

    watch(() => userStore.language, () => {
      setPageTitle()
    })
    
    return {
      userStore,
      logList,
      keyword,
      currentPage,
      total,
      totalPages,
      selectedOperationLabel,
      operationOptions,
      formatTime,
      getMethodClass,
      onOperationChange,
      loadData,
      toggleLanguage,
      prevPage,
      nextPage
    }
  }
}
</script>

<style lang="scss">
.manage-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
  padding-top: 140rpx;
}

.search-bar {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .search-input {
    flex: 1;
    height: 80rpx;
    padding: 0 20rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    font-size: 28rpx;
  }

  .search-btn {
    width: 120rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border-radius: 12rpx;
    border: none;
    color: #fff;
    font-size: 28rpx;
  }
}

.filter-row {
  padding: 16rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .picker {
    padding: 16rpx 24rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    display: inline-block;

    .picker-text {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.log-list {
  padding: 24rpx;
}

.log-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  .log-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;

    .log-operator {
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
    }

    .log-time {
      font-size: 24rpx;
      color: #999;
    }
  }

  .log-body {
    .log-action {
      font-size: 28rpx;
      color: #333;
      display: block;
      margin-bottom: 12rpx;
    }

    .log-meta {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 12rpx;

      .log-ip {
        font-size: 24rpx;
        color: #999;
      }

      .log-method {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;

        &.post {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        &.get {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        &.put {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        &.delete {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
      }
    }

    .log-target {
      font-size: 24rpx;
      color: #666;
      background: #f5f5f5;
      padding: 12rpx 16rpx;
      border-radius: 8rpx;
      word-break: break-all;
      display: block;
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

.pagination {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .page-info {
    font-size: 26rpx;
    color: #666;
  }

  .page-control {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .page-btn {
      font-size: 28rpx;
      color: #dc2626;
      padding: 8rpx 20rpx;

      &.disabled {
        color: #999;
      }
    }

    .page-num {
      font-size: 28rpx;
      color: #333;
    }
  }
}
</style>
