<template>
  <view class="manage-page">
    <CustomNavBar :title="userStore.t('common.classManage')" :showBack="true" />
    
    <view class="search-bar">
      <picker mode="selector" :range="deptOptions" range-key="name" @change="onDeptChange">
        <view class="picker">
          <text class="picker-text">{{ selectedDeptName || userStore.t('common.all') + userStore.t('common.department') }}</text>
        </view>
      </picker>
      <input class="search-input" v-model="keyword" :placeholder="userStore.t('common.searchPlaceholder')" @input="onSearchInput" />
      <button class="search-btn" @click="loadData">{{ userStore.t('common.search') }}</button>
    </view>
    
    <view class="class-list">
      <view class="class-item" v-for="item in classList" :key="item.id">
        <view class="class-info">
          <text class="class-name">{{ item.className }}</text>
          <text class="class-meta">{{ userStore.t('common.inviteCode') }}: {{ item.inviteCode || '-' }} | {{ getDeptName(item.departmentId) }}</text>
        </view>
        <view class="class-actions">
          <text class="action-btn" @click="editClass(item)">{{ userStore.t('common.edit') }}</text>
          <text class="action-btn danger" @click="deleteClass(item)">{{ userStore.t('common.delete') }}</text>
        </view>
      </view>
      
      <view class="empty" v-if="classList.length === 0">
        <text class="empty-text">{{ userStore.t('common.noData') }}</text>
      </view>
    </view>
    
    <view class="add-btn" @click="addClass">
      <text class="add-icon">+</text>
      <text class="add-text">{{ userStore.t('common.add') }}{{ userStore.t('common.class') }}</text>
    </view>

    <view v-if="showPopup" class="modal" @click="showPopup = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingClass ? userStore.t('common.edit') + userStore.t('common.class') : userStore.t('common.add') + userStore.t('common.class') }}</text>
          <view class="modal-close" @click="showPopup = false">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.name') }}</text>
            <input class="form-input" v-model="form.className" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.name')" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.department') }}</text>
            <picker mode="selector" :range="departments" range-key="name" @change="onFormDeptChange">
              <view class="form-picker">
                <text>{{ form.departmentName || userStore.t('common.pleaseSelect') + userStore.t('common.department') }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.remark') }}</text>
            <textarea class="form-textarea" v-model="form.remark" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.remark')"></textarea>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { adminClassApi, departmentApi } from '../../utils/api'
import { useUserStore } from '../../store/index.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

export default {
  components: { CustomNavBar },
  setup() {
    const userStore = useUserStore()
    
    const keyword = ref('')
    const classList = ref([])
    const departments = ref([])
    const selectedDeptId = ref(null)
    const showPopup = ref(false)
    const editingClass = ref(null)
    
    const deptOptions = computed(() => {
      return [{ id: null, name: userStore.t('common.allDepartments') }, ...departments.value]
    })
    
    const selectedDeptName = computed(() => {
      if (!selectedDeptId.value) return userStore.t('common.allDepartments')
      const dept = departments.value.find(d => d.id === selectedDeptId.value)
      return dept?.name || ''
    })
    
    const form = reactive({
      id: null,
      className: '',
      departmentId: null,
      departmentName: '',
      remark: ''
    })
    
    const getDeptName = (id) => {
      const dept = departments.value.find(d => d.id === id)
      return dept?.name || '-'
    }
    
    const onDeptChange = (e) => {
      const index = e.detail.value
      const option = deptOptions.value[index]
      selectedDeptId.value = option?.id || null
      loadData()
    }
    
    const onFormDeptChange = (e) => {
      const index = e.detail.value
      if (departments.value[index]) {
        form.departmentId = departments.value[index].id
        form.departmentName = departments.value[index].name
      }
    }
    
    const loadData = async () => {
      try {
        uni.showLoading({ title: userStore.t('common.loading') })
        const res = await adminClassApi.page({
          current: 1,
          size: 20,
          keyword: keyword.value,
          departmentId: selectedDeptId.value
        }, { skipRedirect: true })
        if (res.code === 200) {
          classList.value = res.data.records || []
        }
      } catch (e) {
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
    
    const addClass = () => {
      editingClass.value = null
      form.id = null
      form.className = ''
      form.departmentId = null
      form.departmentName = ''
      form.remark = ''
      showPopup.value = true
    }
    
    const editClass = (item) => {
      editingClass.value = item
      form.id = item.id
      form.className = item.className || ''
      form.departmentId = item.departmentId
      form.departmentName = getDeptName(item.departmentId)
      form.remark = item.remark || ''
      showPopup.value = true
    }
    
    const deleteClass = async (item) => {
      uni.showModal({
        title: userStore.t('common.confirm'),
        content: userStore.t('common.confirmDelete'),
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await adminClassApi.delete(item.id)
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
      if (!form.className.trim()) {
        uni.showToast({ title: userStore.t('common.pleaseEnter') + userStore.t('common.name'), icon: 'none' })
        return
      }
      if (!form.departmentId) {
        uni.showToast({ title: userStore.t('common.pleaseSelect') + userStore.t('common.department'), icon: 'none' })
        return
      }
      
      try {
        uni.showLoading({ title: userStore.t('common.processing') })
        const data = {
          id: form.id,
          name: form.className,
          departmentId: form.departmentId,
          remark: form.remark
        }
        
        let result
        if (editingClass.value) {
          result = await adminClassApi.update(data)
        } else {
          result = await adminClassApi.create(data)
        }
        
        if (result.code === 200) {
          uni.showToast({ title: editingClass.value ? userStore.t('common.updateSuccess') : userStore.t('common.createSuccess'), icon: 'success' })
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
    
    const loadDepartments = async () => {
      try {
        const res = await departmentApi.list({ skipRedirect: true })
        if (res.code === 200) {
          departments.value = res.data || []
        } else {
          departments.value = []
          uni.showToast({ title: res.message || userStore.t('common.loadFailed'), icon: 'none' })
        }
      } catch (e) {
        departments.value = []
        console.error('加载院系失败:', e)
        uni.showToast({ title: userStore.t('common.loadFailed'), icon: 'none' })
      }
    }
    
    const setPageTitle = () => {
      uni.setNavigationBarTitle({
        title: userStore.t('common.classManage')
      })
    }

    const toggleLanguage = () => {
      const newLang = userStore.language === 'zh' ? 'en' : 'zh'
      userStore.changeLanguage(newLang)
    }

    onMounted(() => {
      loadDepartments()
      loadData()
      setPageTitle()
    })

    watch(() => userStore.language, () => {
      setPageTitle()
    })
    
    return {
      userStore,
      keyword,
      classList,
      departments,
      deptOptions,
      selectedDeptName,
      showPopup,
      editingClass,
      form,
      getDeptName,
      onDeptChange,
      onFormDeptChange,
      loadData,
      addClass,
      editClass,
      deleteClass,
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

  .picker {
    padding: 16rpx 24rpx;
    background: #f5f5f5;
    border-radius: 12rpx;

    .picker-text {
      font-size: 28rpx;
      color: #333;
    }
  }

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

.class-list {
  padding: 24rpx;
}

.class-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  .class-info {
    .class-name {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 8rpx;
    }

    .class-meta {
      font-size: 26rpx;
      color: #999;
    }
  }

  .class-actions {
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

  .form-picker {
    height: 80rpx;
    padding: 0 20rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #666;
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