import { defineStore } from 'pinia'
import { authApi } from '../utils/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem('token') || '',
    isLoginVerified: false
  }),
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.userInfo
  },
  actions: {
    async login(userInfo) {
      const res = await authApi.login(userInfo)
      if (res.code === 200) {
        this.token = res.data.token
        this.userInfo = res.data
        this.isLoginVerified = true
        localStorage.setItem('token', res.data.token)
        return res.data
      }
      throw new Error(res.message)
    },
    async getUserInfo() {
      if (!this.token) return null
      try {
        const res = await authApi.getUserInfo()
        if (res.code === 200) {
          this.userInfo = res.data
          this.isLoginVerified = true
          return res.data
        } else {
          this.clearLoginState()
          return null
        }
      } catch (e) {
        console.error('获取用户信息失败:', e)
        this.clearLoginState()
        return null
      }
    },
    async verifyLoginState() {
      if (!this.token) {
        this.clearLoginState()
        return false
      }
      try {
        const res = await authApi.getUserInfo()
        if (res.code === 200) {
          this.userInfo = res.data
          this.isLoginVerified = true
          return true
        } else {
          this.clearLoginState()
          return false
        }
      } catch (e) {
        console.error('登录状态验证失败:', e)
        this.clearLoginState()
        return false
      }
    },
    clearLoginState() {
      this.token = ''
      this.userInfo = null
      this.isLoginVerified = false
      localStorage.removeItem('token')
    },
    logout() {
      this.clearLoginState()
    },
    initLoginState() {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        this.token = savedToken
      }
    }
  }
})

export default useUserStore
