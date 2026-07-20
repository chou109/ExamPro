<template>
  <view class="custom-nav-bar">
    <view class="nav-left" v-if="showBack" @click="handleBack">
      <text class="nav-back-icon">‹</text>
    </view>
    <view class="nav-left" v-else></view>
    <text class="nav-title">{{ title }}</text>
    <view class="nav-right">
      <view class="nav-lang-switch" @click="toggleLanguage">
        <text class="nav-lang-text">{{ userStore.language === 'zh' ? 'EN' : '中文' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../store/index.js'

const userStore = useUserStore()

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  }
})

const handleBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.reLaunch({ url: '/pages/common/dashboard' })
    }
  })
}

const toggleLanguage = () => {
  const newLang = userStore.language === 'zh' ? 'en' : 'zh'
  userStore.changeLanguage(newLang)
}
</script>

<style lang="scss" scoped>
.custom-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  box-sizing: border-box;
  
  .nav-left {
    width: 80rpx;
    display: flex;
    align-items: center;
    
    .nav-back-icon {
      font-size: 48rpx;
      color: #ffffff;
    }
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #ffffff;
    flex: 1;
    text-align: center;
  }
  
  .nav-right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    
    .nav-lang-switch {
      padding: 8rpx 20rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20rpx;
      white-space: nowrap;
      
      .nav-lang-text {
        font-size: 24rpx;
        color: #ffffff;
        font-weight: 600;
        white-space: nowrap;
      }
    }
  }
}
</style>
