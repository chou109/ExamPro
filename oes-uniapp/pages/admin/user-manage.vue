<template>
  <view class="manage-page">
    <CustomNavBar :title="userStore.t('common.userManage')" :showBack="true" />
    
    <view class="search-bar">
      <picker mode="selector" :range="roleOptions" range-key="label" @change="onRoleChange">
        <view class="picker">
          <text class="picker-text">{{ selectedRoleText || userStore.t('common.all') + userStore.t('common.role') }}</text>
        </view>
      </picker>
      <input class="search-input" v-model="keyword" :placeholder="userStore.t('common.searchPlaceholder')" @input="onSearchInput" />
      <button class="search-btn" @click="loadData">{{ userStore.t('common.search') }}</button>
    </view>
    
    <view class="user-list">
      <view class="user-item" v-for="user in userList" :key="user.id">
        <view class="user-info">
          <image class="user-avatar" :src="getAvatarUrl(user.avatar)" mode="aspectFill" />
          <view class="user-detail">
            <text class="username">{{ user.username }}</text>
            <text class="user-meta">{{ user.realName || '-' }} | {{ getRoleText(user.role) }}</text>
          </view>
        </view>
        <view class="user-actions">
          <text class="action-btn" @click="editUser(user)">{{ userStore.t('common.edit') }}</text>
          <text class="action-btn danger" @click="deleteUser(user)">{{ userStore.t('common.delete') }}</text>
        </view>
      </view>
      
      <view class="empty" v-if="userList.length === 0">
        <text class="empty-text">{{ userStore.t('common.noData') }}</text>
      </view>
    </view>
    
    <view class="pagination">
      <text class="page-info">{{ userStore.t('common.total') }} {{ total }} {{ userStore.t('common.count') }}</text>
    </view>
    
    <view class="add-btn" @click="addUser">
      <text class="add-icon">+</text>
      <text class="add-text">{{ userStore.t('common.add') }}{{ userStore.t('common.user') }}</text>
    </view>

    <view v-if="showPopup" class="modal" @click="showPopup = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingUser ? userStore.t('common.edit') + userStore.t('common.user') : userStore.t('common.add') + userStore.t('common.user') }}</text>
          <view class="modal-close" @click="showPopup = false">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="form-content">
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.username') }}</text>
            <input class="form-input" v-model="form.username" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.username')" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.realName') }}</text>
            <input class="form-input" v-model="form.realName" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.realName')" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.password') }}</text>
            <input class="form-input" v-model="form.password" type="password" :placeholder="editingUser ? userStore.t('common.notModifyLeaveEmpty') : userStore.t('common.pleaseEnter') + userStore.t('common.password')" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.role') }}</text>
            <picker mode="selector" :range="formRoleOptions" range-key="label" @change="onFormRoleChange">
              <view class="form-picker">
                <text>{{ getRoleText(form.role) || userStore.t('common.pleaseSelect') + userStore.t('common.role') }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.email') }}</text>
            <input class="form-input" v-model="form.email" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.email')" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('common.phone') }}</text>
            <input class="form-input" v-model="form.phone" :placeholder="userStore.t('common.pleaseEnter') + userStore.t('common.phone')" />
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
import { userApi } from '../../utils/api'
import { useUserStore } from '../../store/index.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

export default {
  components: { CustomNavBar },
  setup() {
    const userStore = useUserStore()
    
    const keyword = ref('')
    const userList = ref([])
    const total = ref(0)
    const selectedRole = ref('')
    const showPopup = ref(false)
    const editingUser = ref(null)
    
    const roleOptions = computed(() => [
      { value: '', label: userStore.t('common.all') + userStore.t('common.role') },
      { value: 'ADMIN', label: userStore.t('common.admin') },
      { value: 'TEACHER', label: userStore.t('common.teacher') },
      { value: 'STUDENT', label: userStore.t('common.student') }
    ])
    
    const formRoleOptions = computed(() => [
      { value: 'ADMIN', label: userStore.t('common.admin') },
      { value: 'TEACHER', label: userStore.t('common.teacher') },
      { value: 'STUDENT', label: userStore.t('common.student') }
    ])
    
    const selectedRoleText = computed(() => {
      const role = roleOptions.value.find(r => r.value === selectedRole.value)
      return role?.label || ''
    })
    
    const form = reactive({
      id: null,
      username: '',
      realName: '',
      password: '',
      role: 'STUDENT',
      email: '',
      phone: ''
    })
    
    const getRoleText = (role) => {
      const map = { ADMIN: userStore.t('common.admin'), TEACHER: userStore.t('common.teacher'), STUDENT: userStore.t('common.student') }
      return map[role] || role
    }
    
    const getAvatarUrl = (avatar) => {
      if (!avatar) return '/static/default-avatar.png'
      if (avatar.startsWith('http')) return avatar
      return 'http://192.168.1.92:8081' + avatar
    }
    
    let searchTimer = null
    const onSearchInput = () => {
      if (searchTimer) clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        loadData()
      }, 300)
    }
    
    const onRoleChange = (e) => {
      const index = e.detail.value
      selectedRole.value = roleOptions.value[index].value
      loadData()
    }
    
    const onFormRoleChange = (e) => {
      form.role = formRoleOptions.value[e.detail.value].value
    }
    
    const loadData = async () => {
      try {
        uni.showLoading({ title: userStore.t('common.loading') })
        const res = await userApi.page({
          current: 1,
          size: 20,
          keyword: keyword.value,
          role: selectedRole.value || undefined
        })
        if (res.code === 200) {
          userList.value = res.data.records || []
          total.value = res.data.total || 0
        }
      } catch (e) {
        uni.showToast({ title: userStore.t('common.loadFailed'), icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
    
    const addUser = () => {
      editingUser.value = null
      form.id = null
      form.username = ''
      form.realName = ''
      form.password = ''
      form.role = 'STUDENT'
      form.email = ''
      form.phone = ''
      showPopup.value = true
    }
    
    const editUser = (user) => {
      editingUser.value = user
      form.id = user.id
      form.username = user.username || ''
      form.realName = user.realName || ''
      form.password = ''
      form.role = user.role || 'STUDENT'
      form.email = user.email || ''
      form.phone = user.phone || ''
      showPopup.value = true
    }
    
    const deleteUser = async (user) => {
      const currentUserId = userStore.userInfo?.id || userStore.userInfo?.userId
      if (String(user.id) === String(currentUserId)) {
        uni.showToast({ title: userStore.t('common.cannotDeleteSelf'), icon: 'none' })
        return
      }
      if (user.role === 'ADMIN') {
        uni.showToast({ title: userStore.t('common.cannotDeleteAdmin'), icon: 'none' })
        return
      }
      uni.showModal({
        title: userStore.t('common.tip'),
        content: userStore.t('common.confirmDeleteUser').replace('{username}', user.username),
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await userApi.delete(user.id)
              if (result.code === 200) {
                uni.showToast({ title: userStore.t('common.deleteSuccess'), icon: 'success' })
                loadData()
              } else {
                uni.showToast({ title: result.message || userStore.t('common.deleteFailed'), icon: 'none' })
              }
            } catch (e) {
              uni.showToast({ title: userStore.t('common.deleteFailed'), icon: 'none' })
            }
          }
        }
      })
    }
    
    const submitForm = async () => {
      if (!form.username.trim()) {
        uni.showToast({ title: userStore.t('login.usernamePlaceholder'), icon: 'none' })
        return
      }
      if (!form.role) {
        uni.showToast({ title: userStore.t('common.pleaseSelectRole'), icon: 'none' })
        return
      }
      if (!editingUser.value && !form.password.trim()) {
        uni.showToast({ title: userStore.t('login.passwordPlaceholder'), icon: 'none' })
        return
      }
      
      try {
        uni.showLoading({ title: userStore.t('common.submitting') })
        const data = { ...form }
        if (!data.password) delete data.password
        
        let result
        if (editingUser.value) {
          result = await userApi.update(data)
        } else {
          result = await userApi.create(data)
        }
        
        if (result.code === 200) {
          uni.showToast({ title: editingUser.value ? userStore.t('common.updateSuccess') : userStore.t('common.createSuccess'), icon: 'success' })
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
    
    const toggleLanguage = () => {
      const newLang = userStore.language === 'zh' ? 'en' : 'zh'
      userStore.changeLanguage(newLang)
    }

    onMounted(() => {
      loadData()
    })
    
    return {
      userStore,
      keyword,
      userList,
      total,
      selectedRoleText,
      roleOptions,
      showPopup,
      editingUser,
      form,
      getRoleText,
      getAvatarUrl,
      onRoleChange,
      onFormRoleChange,
      loadData,
      addUser,
      editUser,
      deleteUser,
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

.user-list {
  padding: 24rpx;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);

  .user-info {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .user-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background: #f0f0f0;
      flex-shrink: 0;
    }

    .user-detail {
      .username {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        display: block;
        margin-bottom: 8rpx;
      }

      .user-meta {
        font-size: 26rpx;
        color: #999;
      }
    }
  }

  .user-actions {
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