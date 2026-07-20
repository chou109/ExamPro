import { reactive } from 'vue'
import { zh, en } from '../utils/lang'

const getLanguage = () => {
  let lang = 'zh'
  try {
    lang = uni.getStorageSync('language') || lang
  } catch (e) {
    try {
      lang = localStorage.getItem('language') || lang
    } catch (e2) {
      lang = lang
    }
  }
  return lang
}

const state = reactive({
  userInfo: null,
  token: uni.getStorageSync('token') || '',
  isLoginVerified: false,
  language: getLanguage()
})

const store = {
  get userInfo() {
    return state.userInfo
  },
  set userInfo(value) {
    state.userInfo = value
  },
  
  get token() {
    return state.token
  },
  set token(value) {
    state.token = value
  },
  
  get isLoginVerified() {
    return state.isLoginVerified
  },
  set isLoginVerified(value) {
    state.isLoginVerified = value
  },
  
  get language() {
    return state.language
  },
  
  get isLoggedIn() {
    return !!state.token && !!state.userInfo
  },
  
  get role() {
    return state.userInfo?.role || ''
  },
  
  get userId() {
    return state.userInfo?.id || ''
  },
  
  get currentLang() {
    return state.language
  },
  
  get messages() {
    return state.language === 'zh' ? zh : en
  },
  
  async login(loginData) {
    const { authApi } = await import('../utils/api')
    try {
      const res = await authApi.login(loginData)
      if (res.code === 200) {
        state.token = res.data.token
        state.userInfo = res.data
        state.isLoginVerified = true
        uni.setStorageSync('token', res.data.token)
        return res.data
      }
      throw new Error(res.message)
    } catch (error) {
      uni.showToast({
        title: error.message || this.t('common.loginFailed'),
        icon: 'none'
      })
      throw error
    }
  },
  
  async getUserInfo() {
    if (!state.token) return null
    const { authApi } = await import('../utils/api')
    try {
      const res = await authApi.getUserInfo()
      if (res.code === 200) {
        state.userInfo = res.data
        state.isLoginVerified = true
        return res.data
      } else {
        this.clearLoginState()
        return null
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.clearLoginState()
      return null
    }
  },
  
  async verifyLoginState() {
    if (!state.token) {
      this.clearLoginState()
      return false
    }
    const { authApi } = await import('../utils/api')
    try {
      const res = await authApi.getUserInfo()
      if (res.code === 200) {
        state.userInfo = res.data
        state.isLoginVerified = true
        return true
      } else {
        this.clearLoginState()
        return false
      }
    } catch (error) {
      console.error('登录状态验证失败:', error)
      this.clearLoginState()
      return false
    }
  },
  
  clearLoginState() {
    state.token = ''
    state.userInfo = null
    state.isLoginVerified = false
    uni.removeStorageSync('token')
  },
  
  logout() {
    this.clearLoginState()
    uni.reLaunch({
      url: '/pages/common/login'
    })
  },
  
  initLoginState() {
    const savedToken = uni.getStorageSync('token')
    if (savedToken) {
      state.token = savedToken
    }
  },
  
  changeLanguage(lang) {
    state.language = lang
    try {
      uni.setStorageSync('language', lang)
    } catch (e) {
      try {
        localStorage.setItem('language', lang)
      } catch (e2) {
        console.error('Failed to save language')
      }
    }
  },
  
  t(key) {
    const keys = key.split('.')
    let result = this.messages
    for (const k of keys) {
      if (result && typeof result === 'object') {
        result = result[k]
      } else {
        return key
      }
    }
    return result || key
  }
}

export const useUserStore = () => store

export default useUserStore
