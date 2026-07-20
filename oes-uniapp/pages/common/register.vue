<template>
  <view class="register-container">
    <CustomNavBar :title="userStore.t('common.register')" :showBack="true" />
    
    <!-- 标题 -->
    <view class="register-header">
      <text class="title">{{ userStore.t('register.title') }}</text>
      <text class="subtitle">{{ userStore.t('register.subtitle') }}</text>
    </view>

    <!-- 注册表单 -->
    <view class="register-form">
      <!-- 身份选择 -->
      <view class="role-tabs">
        <view
          class="role-tab"
          :class="{ active: registerForm.role === 'STUDENT' }"
          @click="registerForm.role = 'STUDENT'"
        >
          <text class="emoji-icon">👨‍🎓</text>
          <text class="tab-text">{{ userStore.t('login.student') }}</text>
        </view>
        <view
          class="role-tab"
          :class="{ active: registerForm.role === 'TEACHER' }"
          @click="registerForm.role = 'TEACHER'"
        >
          <text class="emoji-icon">👨‍🏫</text>
          <text class="tab-text">{{ userStore.t('login.teacher') }}</text>
        </view>
      </view>

      <!-- 注册输入 -->
      <view class="form-content">
        <view class="input-group">
          <text class="emoji-icon">👤</text>
          <input
            class="input"
            type="text"
            v-model="registerForm.username"
            :placeholder="userStore.t('login.usernamePlaceholder')"
            placeholder-class="placeholder"
          />
        </view>

        <view class="input-group">
          <text class="emoji-icon">🔒</text>
          <input
            class="input"
            type="password"
            v-model="registerForm.password"
            :placeholder="userStore.t('login.passwordPlaceholder')"
            placeholder-class="placeholder"
          />
        </view>

        <view class="input-group">
          <text class="emoji-icon">🔒</text>
          <input
            class="input"
            type="password"
            v-model="registerForm.confirmPassword"
            :placeholder="userStore.t('register.confirmPasswordPlaceholder')"
            placeholder-class="placeholder"
          />
        </view>

        <!-- 学院选择 -->
        <view class="select-group">
          <text class="emoji-icon">🏫</text>
          <picker
            mode="selector"
            :range="departments"
            range-key="name"
            @change="onDepartmentChange"
          >
            <view class="picker-content">
              <text class="picker-text" :class="{ placeholder: !registerForm.departmentId }">
                {{ selectedDepartmentName || userStore.t('register.selectDepartment') }}
              </text>
              <text class="arrow-icon">▼</text>
            </view>
          </picker>
        </view>

        <button class="register-btn" :disabled="loading" @click="handleRegister">
          <text class="btn-text">{{ loading ? userStore.t('common.loading') : userStore.t('common.register') }}</text>
        </button>
      </view>

      <!-- 返回登录 -->
      <view class="action-buttons">
        <text class="action-link" @click="backToLogin">{{ userStore.t('register.haveAccount') }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { authApi, departmentApi } from '../../utils/api'
import { useUserStore } from '../../store/index.js'
import { initPageTitle } from '../../utils/title.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

export default {
  components: { CustomNavBar },
  setup() {
    const loading = ref(false)
    const departments = ref([])
    const userStore = useUserStore()

    const setPageTitle = () => {
      uni.setNavigationBarTitle({ title: userStore.t('common.register') })
    }

    onMounted(() => {
      setPageTitle()
      loadDepartments()
    })

    watch(() => userStore.language, () => {
      setPageTitle()
    })

    const registerForm = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'STUDENT',
      departmentId: null
    })

    const selectedDepartmentName = computed(() => {
      if (!registerForm.departmentId) return ''
      const dept = departments.value.find(d => d.id === registerForm.departmentId)
      return dept?.name || ''
    })

    const loadDepartments = async () => {
      try {
        const res = await departmentApi.list({ skipAuth: true })
        if (res.code === 200) {
          departments.value = res.data
        }
      } catch (e) {
        console.error('加载学院列表失败:', e)
      }
    }

    const onDepartmentChange = (e) => {
      const index = e.detail.value
      if (departments.value[index]) {
        registerForm.departmentId = departments.value[index].id
      }
    }

    const handleRegister = async () => {
      // 验证
      if (!registerForm.username) {
        uni.showToast({ title: userStore.t('login.usernamePlaceholder'), icon: 'none' })
        return
      }
      if (registerForm.username.length < 3 || registerForm.username.length > 20) {
        uni.showToast({ title: userStore.t('register.usernameLength'), icon: 'none' })
        return
      }
      if (!registerForm.password) {
        uni.showToast({ title: userStore.t('login.passwordPlaceholder'), icon: 'none' })
        return
      }
      if (registerForm.password.length < 6 || registerForm.password.length > 20) {
        uni.showToast({ title: userStore.t('register.passwordLength'), icon: 'none' })
        return
      }
      if (registerForm.password !== registerForm.confirmPassword) {
        uni.showToast({ title: userStore.t('register.passwordMismatch'), icon: 'none' })
        return
      }

      loading.value = true

      try {
        const res = await authApi.register({
          username: registerForm.username,
          password: registerForm.password,
          role: registerForm.role,
          departmentId: registerForm.departmentId ? Number(registerForm.departmentId) : null
        })

        if (res.code === 200) {
          uni.showToast({ title: userStore.t('register.registerSuccess'), icon: 'success' })
          setTimeout(() => {
            backToLogin()
          }, 1500)
        } else {
          uni.showToast({ title: res.message || userStore.t('register.registerFailed'), icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e.message || userStore.t('register.registerFailed'), icon: 'none' })
      } finally {
        loading.value = false
      }
    }

    const backToLogin = () => {
      uni.navigateBack()
    }

    return {
      loading,
      departments,
      registerForm,
      userStore,
      selectedDepartmentName,
      onDepartmentChange,
      handleRegister,
      backToLogin
    }
  }
}
</script>

<style lang="scss">
.register-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 0 40rpx;
  position: relative;
  padding-top: 140rpx;
}

.register-header {
  text-align: center;
  margin-bottom: 40rpx;

  .title {
    font-size: 40rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 16rpx;
  }

  .subtitle {
    font-size: 28rpx;
    color: #666;
  }
}

.register-form {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.role-tabs {
  display: flex;
  margin-bottom: 40rpx;
  gap: 24rpx;

  .role-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 24rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    border: 2rpx solid transparent;

    .emoji-icon {
      font-size: 36rpx;
    }

    .tab-text {
      font-size: 32rpx;
      color: #666;
    }

    &.active {
      background: rgba(220, 38, 38, 0.1);
      border-color: #dc2626;

      .tab-text {
        color: #dc2626;
        font-weight: 600;
      }
    }
  }
}

.form-content {
  .input-group {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 24rpx 20rpx;
    margin-bottom: 24rpx;

    .emoji-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }

    .input {
      flex: 1;
      font-size: 32rpx;
      color: #333;
    }
  }

  .select-group {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 24rpx 20rpx;
    margin-bottom: 24rpx;

    .emoji-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }

    .picker-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .picker-text {
        font-size: 32rpx;
        color: #333;

        &.placeholder {
          color: #999;
        }
      }

      .arrow-icon {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .placeholder {
    color: #999;
    font-size: 32rpx;
  }

  .register-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border-radius: 12rpx;
    border: none;
    margin-top: 32rpx;

    .btn-text {
      font-size: 36rpx;
      color: #ffffff;
      font-weight: 600;
    }

    &[disabled] {
      background: #cccccc;
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 32rpx;

  .action-link {
    font-size: 28rpx;
    color: #dc2626;
  }
}
</style>