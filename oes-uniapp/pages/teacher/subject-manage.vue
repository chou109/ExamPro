<template>
  <view class="manage-page">
    <CustomNavBar :title="userStore.t('common.subjectManage')" :showBack="true" />
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input class="search-input" v-model="keyword" :placeholder="userStore.t('common.searchPlaceholder')" @input="onSearchInput" />
      <button class="search-btn" @click="loadData">{{ userStore.t('common.search') }}</button>
    </view>
    
    <!-- 科目列表 -->
    <view class="list">
      <view class="list-item" v-for="item in subjectList" :key="item.id">
        <view class="item-info">
          <text class="item-title">{{ item.name }}</text>
          <text class="item-meta">{{ item.code || '-' }}</text>
        </view>
        <view class="item-actions">
          <text class="action-btn" @click="editSubject(item)">{{ userStore.t('common.edit') }}</text>
          <text class="action-btn danger" @click="deleteSubject(item)">{{ userStore.t('common.delete') }}</text>
        </view>
      </view>
      
      <view class="empty" v-if="subjectList.length === 0">
        <text class="empty-text">{{ userStore.t('common.noData') }}</text>
      </view>
    </view>
    
    <!-- 新增按钮 -->
    <view class="add-btn" @click="showSubjectForm = true">
      <text class="add-icon">➕</text>
      <text class="add-text">{{ userStore.t('common.add') }}{{ userStore.t('common.subject') }}</text>
    </view>

    <!-- 科目编辑弹窗 -->
    <view v-if="showSubjectForm" class="modal" @click="showSubjectForm = false">
      <view class="subject-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingSubject ? userStore.t('common.edit') + userStore.t('common.subject') : userStore.t('common.add') + userStore.t('common.subject') }}</text>
          <view class="modal-close" @click="showSubjectForm = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.subject') }}{{ userStore.t('common.name') }} *</text>
            <input class="form-input" v-model="form.name" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.subject') + userStore.t('common.name')" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.subject') }}{{ userStore.t('common.code') }}</text>
            <input class="form-input" v-model="form.code" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.subject') + userStore.t('common.code')" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showSubjectForm = false">{{ userStore.t('common.cancel') }}</button>
          <button class="modal-btn confirm" @click="submitSubject">{{ editingSubject ? userStore.t('common.save') : userStore.t('common.create') }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { subjectApi } from '../../utils/api'
import { useUserStore } from '../../store/index.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

export default {
  components: {
    CustomNavBar
  },
  setup() {
    const userStore = useUserStore()
    
    const keyword = ref('')
    const subjectList = ref([])
    
    const showSubjectForm = ref(false)
    const editingSubject = ref(null)
    
    const form = reactive({
      name: '',
      code: ''
    })
    
    let searchTimer = null
    const onSearchInput = () => {
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        loadData()
      }, 300)
    }
    
    const loadData = async () => {
      try {
        uni.showLoading({ title: userStore.t('common.loading') })
        const res = await subjectApi.page({ current: 1, size: 20, keyword: keyword.value })
        if (res.code === 200) {
          subjectList.value = res.data.records
        }
      } catch (e) {
        uni.showToast({ title: userStore.t('common.loadFailed'), icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
    
    const addSubject = () => {
      editingSubject.value = null
      form.name = ''
      form.code = ''
      showSubjectForm.value = true
    }
    
    const editSubject = (item) => {
      editingSubject.value = item
      form.name = item.name
      form.code = item.code || ''
      showSubjectForm.value = true
    }
    
    const submitSubject = async () => {
      if (!form.name.trim()) {
        uni.showToast({ title: userStore.t('common.pleaseEnter') + userStore.t('common.subject') + userStore.t('common.name'), icon: 'none' })
        return
      }
      
      try {
        uni.showLoading({ title: userStore.t('common.saving') })
        
        const subjectData = {
          id: editingSubject.value?.id || null,
          name: form.name,
          code: form.code
        }
        
        let res
        if (editingSubject.value) {
          res = await subjectApi.update(subjectData)
        } else {
          res = await subjectApi.create(subjectData)
        }
        
        if (res.code === 200) {
          uni.showToast({ title: editingSubject.value ? userStore.t('common.updateSuccess') : userStore.t('common.createSuccess'), icon: 'success' })
          showSubjectForm.value = false
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
      editingSubject.value = null
      form.name = ''
      form.code = ''
    }
    
    const deleteSubject = async (item) => {
      uni.showModal({
        title: userStore.t('common.tip'),
        content: userStore.t('common.confirmDeleteSubject').replace('{name}', item.name),
        cancelText: userStore.t('common.cancel'),
        confirmText: userStore.t('common.confirm'),
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await subjectApi.delete(item.id)
              if (result.code === 200) {
                uni.showToast({ title: userStore.t('common.deleteSuccess'), icon: 'success' })
                loadData()
              } else {
                uni.showToast({ title: userStore.t('common.deleteFailed'), icon: 'none' })
              }
            } catch (e) {
              uni.showToast({ title: userStore.t('common.deleteFailed'), icon: 'none' })
            }
          }
        }
      })
    }
    
    onMounted(() => {
      loadData()
    })
    
    return {
      keyword,
      subjectList,
      showSubjectForm,
      form,
      loadData,
      addSubject,
      editSubject,
      submitSubject,
      deleteSubject,
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
  padding: 0;
  padding-top: 140rpx;
  padding-bottom: 120rpx;
  position: relative;
}

.search-bar {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  background: #fff;
  margin-bottom: 24rpx;
  
  .search-input {
    flex: 1;
    height: 72rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
  }
  
  .search-btn {
    padding: 0 32rpx;
    background: #dc2626;
    color: #fff;
    border-radius: 12rpx;
    font-size: 28rpx;
    height: 72rpx;
    line-height: 72rpx;
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
      
      .item-title {
        font-size: 30rpx;
        color: #333;
        display: block;
      }
      
      .item-meta {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .item-actions {
      display: flex;
      gap: 16rpx;
      
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

.subject-modal {
  width: 80%;
  background: #fff;
  border-radius: 16rpx;
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
  padding: 32rpx;
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