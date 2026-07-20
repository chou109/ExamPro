<template>
  <view class="manage-page">
    <CustomNavBar :title="userStore.t('common.departmentManage')" :showBack="true" />
    
    <view class="search-bar">
      <input class="search-input" v-model="keyword" :placeholder="userStore.t('common.searchPlaceholder')" @input="onSearchInput" />
      <button class="search-btn" @click="loadData">{{ userStore.t('common.search') }}</button>
    </view>
    
    <view class="dept-list">
      <view class="dept-item" v-for="dept in deptList" :key="dept.id">
        <view class="dept-info">
          <text class="dept-name">{{ dept.name }}</text>
          <text class="dept-code">{{ dept.code || '-' }}</text>
        </view>
        <view class="dept-actions">
          <text class="action-btn" @click="editDept(dept)">{{ userStore.t('common.edit') }}</text>
          <text class="action-btn danger" @click="deleteDept(dept)">{{ userStore.t('common.delete') }}</text>
        </view>
      </view>
      
      <view class="empty" v-if="deptList.length === 0">
        <text class="empty-text">{{ userStore.t('common.noData') }}</text>
      </view>
    </view>
    
    <view class="add-btn" @click="addDept">
      <text class="add-icon">+</text>
      <text class="add-text">{{ userStore.t('common.add') }}{{ userStore.t('common.department') }}</text>
    </view>

    <view v-if="showPopup" class="modal" @click="showPopup = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingDept ? userStore.t('common.edit') + userStore.t('common.department') : userStore.t('common.add') + userStore.t('common.department') }}</text>
          <view class="modal-close" @click="showPopup = false">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.name') }}</text>
            <input class="form-input" v-model="form.name" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.name')" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.code') }}</text>
            <input class="form-input" v-model="form.code" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.code')" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="showPopup = false">{{ userStore.t('common.cancel') }}</button>
          <button class="btn-confirm" @click="submitForm">{{ userStore.t('common.confirm') }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { departmentApi } from '../../utils/api'
import { useUserStore } from '../../store/index.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

export default {
  components: { CustomNavBar },
  setup() {
    const userStore = useUserStore()
    
    const keyword = ref('')
    const deptList = ref([])
    const showPopup = ref(false)
    const editingDept = ref(null)
    
    const form = reactive({
      id: null,
      name: '',
      code: ''
    })
    
    const loadData = async () => {
      try {
        uni.showLoading({ title: userStore.t('common.loading') })
        let res
        if (keyword.value.trim()) {
          res = await departmentApi.list({ skipRedirect: true })
          if (res.code === 200) {
            deptList.value = res.data.filter(d => 
              d.name.includes(keyword.value) || d.code.includes(keyword.value)
            )
          } else {
            deptList.value = []
            uni.showToast({ title: res.message || userStore.t('common.loadFailed'), icon: 'none' })
          }
        } else {
          res = await departmentApi.list({ skipRedirect: true })
          if (res.code === 200) {
            deptList.value = res.data
          } else {
            deptList.value = []
            uni.showToast({ title: res.message || userStore.t('common.loadFailed'), icon: 'none' })
          }
        }
      } catch (e) {
        deptList.value = []
        uni.showToast({ title: userStore.t('common.loadFailed'), icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
    
    let searchTimer = null
    const onSearchInput = () => {
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        loadData()
      }, 300)
    }
    
    const addDept = () => {
      editingDept.value = null
      form.id = null
      form.name = ''
      form.code = ''
      showPopup.value = true
    }
    
    const editDept = (dept) => {
      editingDept.value = dept
      form.id = dept.id
      form.name = dept.name || ''
      form.code = dept.code || ''
      showPopup.value = true
    }
    
    const deleteDept = async (dept) => {
      uni.showModal({
        title: userStore.t('common.tip'),
        content: userStore.t('common.confirmDelete') + ` ${dept.name}?`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await departmentApi.delete(dept.id)
              if (result.code === 200) {
                uni.showToast({ title: userStore.t('common.success'), icon: 'success' })
                loadData()
              } else {
                uni.showToast({ title: result.message || userStore.t('common.failed'), icon: 'none' })
              }
            } catch (e) {
              uni.showToast({ title: userStore.t('common.failed'), icon: 'none' })
            }
          }
        }
      })
    }
    
    const submitForm = async () => {
      if (!form.name.trim()) {
        uni.showToast({ title: userStore.t('common.pleaseEnter') + userStore.t('common.name'), icon: 'none' })
        return
      }
      
      try {
        uni.showLoading({ title: userStore.t('common.processing') })
        const data = { ...form }
        
        let result
        if (editingDept.value) {
          result = await departmentApi.update(data)
        } else {
          result = await departmentApi.create(data)
        }
        
        if (result.code === 200) {
          uni.showToast({ title: userStore.t('common.success'), icon: 'success' })
          showPopup.value = false
          loadData()
        } else {
          uni.showToast({ title: result.message || userStore.t('common.failed'), icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: userStore.t('common.failed'), icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
    
    const setPageTitle = () => {
      uni.setNavigationBarTitle({
        title: userStore.t('common.departmentManage')
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

    watch(() => userStore.language, () => {
      setPageTitle()
    })
    
    return {
      userStore,
      keyword,
      deptList,
      showPopup,
      editingDept,
      form,
      loadData,
      addDept,
      editDept,
      deleteDept,
      submitForm,
      toggleLanguage
    }
  }
}
</script>

<style lang="scss">
@import "../../styles/manage.scss";

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

.dept-list {
  padding: 24rpx;
}

.dept-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  .dept-info {
    .dept-name {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 8rpx;
    }

    .dept-code {
      font-size: 26rpx;
      color: #999;
    }
  }

  .dept-actions {
    display: flex;
    gap: 16rpx;

    .action-btn {
      padding: 12rpx 24rpx;
      border-radius: 8rpx;
      font-size: 26rpx;
      border: 1rpx solid #d9d9d9;
      background: #fff;
      color: #666;

      &.danger {
        background: #f56c6c;
        color: #fff;
        border-color: #f56c6c;
      }
    }
  }
}

.form-content {
  padding: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;

  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
  }

  .form-input {
    width: 100%;
    height: 80rpx;
    padding: 0 20rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    font-size: 28rpx;
  }

  .form-textarea {
    width: 100%;
    height: 160rpx;
    padding: 20rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    font-size: 28rpx;
  }
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
  border-top: 1rpx solid #e5e5e5;

  .btn-cancel, .btn-confirm {
    flex: 1;
    height: 80rpx;
    border-radius: 12rpx;
    font-size: 30rpx;
  }

  .btn-cancel {
    background: #f5f5f5;
    color: #666;
    border: none;
  }

  .btn-confirm {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: #fff;
    border: none;
  }
}
</style>