import App from './App'

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  
  uni.onError((error) => {
    console.error('全局错误:', error)
  })
  
  uni.onNetworkStatusChange((res) => {
    console.log('网络状态变化:', res.isConnected, res.networkType)
  })
  
  return {
    app,
    pinia
  }
}
// #endif