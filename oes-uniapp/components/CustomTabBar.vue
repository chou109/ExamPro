<template>
  <view class="custom-tab-bar">
    <view class="tab-bar-inner">
      <view 
        v-for="(item, index) in tabList" 
        :key="index"
        class="tab-item"
        :class="{ active: currentIndex === index }"
        @click="switchTab(index)"
      >
        <image 
          :src="currentIndex === index ? item.selectedIconPath : item.iconPath" 
          class="tab-icon"
          mode="aspectFit"
        />
        <text class="tab-text">{{ item.text }}</text>
      </view>
    </view>
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../store/index.js'

const userStore = useUserStore()

const currentIndex = ref(0)

const tabs = [
  {
    pagePath: '/pages/common/dashboard',
    text: '首页',
    iconPath: '/static/tabbar/home.png',
    selectedIconPath: '/static/tabbar/home-active.png'
  },
  {
    pagePath: '/pages/common/message',
    text: '消息',
    iconPath: '/static/tabbar/message.png',
    selectedIconPath: '/static/tabbar/message-active.png'
  },
  {
    pagePath: '/pages/common/account',
    text: '我的',
    iconPath: '/static/tabbar/user.png',
    selectedIconPath: '/static/tabbar/user-active.png'
  }
]

const role = computed(() => userStore.userInfo?.role || '')

const tabList = computed(() => {
  if (role.value === 'ADMIN') {
    return tabs.filter(tab => tab.pagePath !== '/pages/common/message')
  }
  return tabs
})

const switchTab = (index) => {
  const item = tabList.value[index]
  if (item) {
    currentIndex.value = index
    uni.reLaunch({
      url: item.pagePath
    })
  }
}

const updateCurrentIndex = () => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    const currentPath = '/' + currentPage.route
    const index = tabList.value.findIndex(tab => tab.pagePath === currentPath)
    if (index !== -1) {
      currentIndex.value = index
    }
  }
}

onMounted(() => {
  updateCurrentIndex()
  
  if (role.value === 'ADMIN') {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      const currentPath = '/' + currentPage.route
      if (currentPath === '/pages/common/message') {
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/common/dashboard'
          })
        }, 500)
      }
    }
  }
})
</script>

<style scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 999;
}

.tab-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100rpx;
  padding: 0 20rpx;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 8rpx 0;
  transition: all 0.3s ease;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 22rpx;
  color: #666666;
  transition: color 0.3s ease;
}

.tab-item.active {
  .tab-text {
    color: #dc2626;
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
  background: #ffffff;
}
</style>