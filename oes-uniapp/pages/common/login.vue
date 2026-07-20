<template>
  <view class="login-container">
    <CustomNavBar :title="userStore.t('common.login')" :showBack="false" />
    
    <!-- Logo和标题 -->
    <view class="login-header">
      <text class="title">ExamPro</text>
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="subtitle">{{ userStore.t('common.systemDescription') }}</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 登录类型选择 -->
      <view class="login-tabs">
        <view
          class="login-tab"
          :class="{ active: loginType === 'student' && !showAdminLogin }"
          @click="switchLoginType('student')"
        >
          <text class="tab-text">{{ userStore.t('login.student') }}</text>
        </view>
        <view
          class="login-tab"
          :class="{ active: loginType === 'teacher' && !showAdminLogin }"
          @click="switchLoginType('teacher')"
        >
          <text class="tab-text">{{ userStore.t('login.teacher') }}</text>
        </view>
        <view
          class="login-tab"
          :class="{ active: showAdminLogin }"
          @click="switchLoginType('admin')"
        >
          <text class="tab-text">{{ userStore.t('login.admin') }}</text>
        </view>
      </view>

      <!-- 登录输入 -->
      <view class="form-content">
        <view class="input-group">
          <text class="icon">👤</text>
          <input
            class="input"
            type="text"
            v-model="form.username"
            :placeholder="userStore.t('login.usernamePlaceholder')"
            placeholder-class="placeholder"
          />
        </view>

        <view class="input-group">
          <text class="icon">🔒</text>
          <input
            class="input"
            type="password"
            v-model="form.password"
            :placeholder="userStore.t('login.passwordPlaceholder')"
            placeholder-class="placeholder"
          />
        </view>

        <button class="login-btn" :disabled="loading" @click="handleLogin">
          <text class="btn-text">{{ loading ? userStore.t('common.loading') : userStore.t('common.login') }}</text>
        </button>
      </view>

      <!-- 其他操作 -->
      <view class="action-buttons">
        <text class="action-link" @click="goToRegister">{{ userStore.t('common.register') }}</text>
      </view>

    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { authApi } from '../../utils/api'
import { useUserStore } from '../../store/index.js'
import { initPageTitle } from '../../utils/title.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

export default {
  components: { CustomNavBar },
  setup() {
    const loginType = ref('student')
    const showAdminLogin = ref(false)
    const loading = ref(false)
    const userStore = useUserStore()
    const showServerConfig = ref(false)
    const serverUrl = ref(uni.getStorageSync('serverUrl') || 'http://localhost:8081/api')

    const setPageTitle = () => {
      uni.setNavigationBarTitle({ title: userStore.t('common.login') })
    }

    onMounted(() => {
      setPageTitle()
    })

    watch(() => userStore.language, () => {
      setPageTitle()
    })

    const form = reactive({
      username: '',
      password: ''
    })

    const switchLoginType = (type) => {
      if (type === 'admin') {
        showAdminLogin.value = true
      } else {
        showAdminLogin.value = false
        loginType.value = type
      }
    }

    const handleLogin = async () => {
      if (!form.username || !form.password) {
        uni.showToast({
          title: userStore.t('login.enterUsernamePassword'),
          icon: 'none'
        })
        return
      }

      loading.value = true

      try {
        console.log('开始登录，用户名:', form.username)

        const result = await userStore.login(form)
        console.log('用户信息:', result)

        if (showAdminLogin.value && result.role !== 'ADMIN') {
          uni.showToast({
            title: userStore.t('login.adminNotFound'),
            icon: 'none'
          })
          return
        }

        if (!showAdminLogin.value) {
          const expectedRole = loginType.value === 'student' ? 'STUDENT' : 'TEACHER'
          if (result.role !== expectedRole) {
            uni.showToast({
              title: loginType.value === 'student' ? userStore.t('login.studentNotFound') : userStore.t('login.teacherNotFound'),
              icon: 'none'
            })
            return
          }
        }

        uni.setStorageSync('userInfo', result)

        uni.showToast({
          title: userStore.t('common.loginSuccess'),
          icon: 'success'
        })

        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/common/dashboard'
          })
        }, 1500)

      } catch (error) {
        console.error('登录失败详情:', error)
        let errorMsg = userStore.t('common.loginFailed')

        if (error.errMsg && error.errMsg.includes('fail')) {
          errorMsg = userStore.t('common.networkError')
        } else if (error.message) {
          errorMsg = error.message
        } else if (error.data && error.data.message) {
          errorMsg = error.data.message
        }

        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        })
      } finally {
        loading.value = false
      }
    }

    const goToRegister = () => {
      uni.navigateTo({
        url: '/pages/common/register'
      })
    }

    return {
      loginType,
      showAdminLogin,
      loading,
      form,
      userStore,
      switchLoginType,
      handleLogin,
      goToRegister
    }
  }
}
</script>

<style lang="scss">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF6A6A 0%, #CD5C5C 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 40rpx;
  position: relative;
  padding-top: 140rpx;
}

.login-header {
  text-align: center;
  margin-bottom: 60rpx;

  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 24rpx;
  }

  .title {
    font-size: 48rpx;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 4rpx;
    margin-bottom: 16rpx;
  }

  .subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}

.login-form {
  width: 100%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.login-tabs {
  display: flex;
  margin-bottom: 40rpx;
  border-bottom: 2rpx solid #e5e5e5;

  .login-tab {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    position: relative;

    .tab-text {
      font-size: 32rpx;
      color: #666;
    }

    &.active {
      .tab-text {
        color: #dc2626;
        font-weight: 600;
      }

      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: #dc2626;
        border-radius: 2rpx;
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

    .icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }

    .input {
      flex: 1;
      font-size: 32rpx;
      color: #333;
    }
  }

  .placeholder {
    color: #999;
    font-size: 32rpx;
  }

  .login-btn {
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