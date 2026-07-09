<template>
  <view class="manage-page">
    <view class="page-header">
      <text class="title">科目管理</text>
    </view>
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input class="search-input" v-model="keyword" placeholder="搜索科目名称" />
      <button class="search-btn" @click="loadData">搜索</button>
    </view>
    
    <!-- 科目列表 -->
    <view class="list">
      <view class="list-item" v-for="item in subjectList" :key="item.id">
        <view class="item-info">
          <text class="item-title">{{ item.name }}</text>
          <text class="item-meta">{{ item.code || '-' }}</text>
        </view>
        <view class="item-actions">
          <text class="action-btn" @click="editSubject(item)">编辑</text>
          <text class="action-btn danger" @click="deleteSubject(item)">删除</text>
        </view>
      </view>
      
      <view class="empty" v-if="subjectList.length === 0">
        <text class="empty-text">暂无科目数据</text>
      </view>
    </view>
    
    <!-- 新增按钮 -->
    <view class="add-btn" @click="showSubjectForm = true">
      <text class="add-icon">➕</text>
      <text class="add-text">新增科目</text>
    </view>

    <!-- 科目编辑弹窗 -->
    <view v-if="showSubjectForm" class="modal" @click="showSubjectForm = false">
      <view class="subject-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingSubject ? '编辑科目' : '新增科目' }}</text>
          <view class="modal-close" @click="showSubjectForm = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">科目名称 *</text>
            <input class="form-input" v-model="form.name" placeholder="请输入科目名称" />
          </view>
          <view class="form-item">
            <text class="form-label">科目代码</text>
            <input class="form-input" v-model="form.code" placeholder="请输入科目代码" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showSubjectForm = false">取消</button>
          <button class="modal-btn confirm" @click="submitSubject">{{ editingSubject ? '保存' : '创建' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { subjectApi } from '../../utils/api'

export default {
  setup() {
    const keyword = ref('')
    const subjectList = ref([])
    
    const showSubjectForm = ref(false)
    const editingSubject = ref(null)
    
    const form = reactive({
      name: '',
      code: ''
    })
    
    const loadData = async () => {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await subjectApi.page({ current: 1, size: 20, keyword: keyword.value })
        if (res.code === 200) {
          subjectList.value = res.data.records
        }
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
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
        uni.showToast({ title: '请输入科目名称', icon: 'none' })
        return
      }
      
      try {
        uni.showLoading({ title: '保存中...' })
        
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
          uni.showToast({ title: editingSubject.value ? '修改成功' : '创建成功', icon: 'success' })
          showSubjectForm.value = false
          loadData()
          resetForm()
        } else {
          uni.showToast({ title: res.message || '保存失败', icon: 'none' })
        }
      } catch (e) {
        console.error(e)
        uni.showToast({ title: '保存失败', icon: 'none' })
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
        title: '提示',
        content: `确定要删除科目 ${item.name} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await subjectApi.delete(item.id)
              if (result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' })
                loadData()
              } else {
                uni.showToast({ title: result.message || '删除失败', icon: 'none' })
              }
            } catch (e) {
              uni.showToast({ title: '删除失败', icon: 'none' })
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
      deleteSubject
    }
  }
}
</script>

<style lang="scss">
@import "../../styles/manage.scss";

.manage-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.page-header {
  padding: 32rpx;
  background: #fff;
  margin-bottom: 24rpx;
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    display: block;
  }
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