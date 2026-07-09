<template>
  <view class="my-classes">
    <view class="page-header">
      <text class="title">班级消息</text>
      <text class="subtitle">查看班级最新动态</text>
    </view>

    <!-- 加入班级 -->
    <view class="join-card">
      <view class="join-form">
        <view class="join-input">
          <uni-icons type="personadd" size="20" color="#999" />
          <input
            type="text"
            v-model="inviteCode"
            placeholder="请输入班级群号"
            @confirm="handleJoin"
          />
        </view>
        <button class="join-btn" @click="handleJoin">加入班级</button>
      </view>
    </view>

    <!-- 班级消息列表 -->
    <view class="class-message-list" v-if="classList.length > 0">
      <view class="class-message-card" v-for="item in classList" :key="item.class.id" @click="enterClass(item.class.id)">
        <view class="class-message-icon">
          <text class="icon-emoji">🏫</text>
        </view>
        <view class="class-message-info">
          <view class="class-message-header">
            <text class="class-message-name">{{ item.class.className }}</text>
            <text class="class-message-time">{{ formatMessageTime(item.class.lastMessageTime) }}</text>
          </view>
          <text class="class-message-content">{{ getLastMessage(item.class) }}</text>
          <view class="class-message-meta">
            <text>群号：{{ item.class.inviteCode }}</text>
            <text>角色：{{ getRoleText(item.role) }}</text>
          </view>
        </view>
        <view class="class-message-arrow">
          <text class="arrow-icon">›</text>
        </view>
      </view>
    </view>

    <view v-if="classList.length === 0" class="empty">
      <uni-icons type="info" size="80" color="#999" />
      <text class="empty-text">暂无班级，输入群号加入班级吧</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/index.js'
import { classApi } from '../../utils/api.js'

const userStore = useUserStore()
const inviteCode = ref('')
const classList = ref([])

const getRoleText = (role) => {
  return {
    CREATOR: '创建者',
    TEACHER: '教师',
    STUDENT: '学生'
  }[role] || role
}

const handleJoin = async () => {
  if (!inviteCode.value.trim()) {
    uni.showToast({
      title: '请输入班级群号',
      icon: 'none'
    })
    return
  }

  try {
    const userId = userStore.userInfo?.userId
    if (!userId) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    const res = await classApi.joinByCode(inviteCode.value, userId)
    if (res.code === 200) {
      uni.showToast({
        title: '加入班级成功',
        icon: 'success'
      })
      inviteCode.value = ''
      loadClasses()
    } else {
      uni.showToast({
        title: res.message || '加入班级失败',
        icon: 'none'
      })
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
  }
}

const enterClass = (classId) => {
  uni.navigateTo({
    url: `/pages/student/class-chat?id=${classId}`
  })
}

const loadClasses = async () => {
  try {
    const userId = userStore.userInfo?.userId || uni.getStorageSync('userId')
    console.log('loadClasses userId:', userId)
    if (!userId) {
      console.log('userId为空')
      return
    }

    console.log('调用classApi.getMyClasses:', userId)
    const res = await classApi.getMyClasses(userId)
    console.log('getMyClasses返回:', JSON.stringify(res))
    if (res.code === 200) {
      classList.value = res.data
      console.log('classList:', JSON.stringify(classList.value))
    } else {
      console.log('接口返回错误:', res.message)
    }
  } catch (e) {
    console.error('加载班级失败:', e)
    uni.showToast({
      title: '加载班级列表失败',
      icon: 'none'
    })
  }
}

const getLastMessage = (cls) => {
  if (!cls.lastMessage) return '暂无消息'
  if (cls.lastMessage.startsWith('EXAM_NOTICE|')) {
    return parseExamNotice(cls.lastMessage)
  }
  return cls.lastMessage
}

const parseExamNotice = (content) => {
  if (!content?.startsWith('EXAM_NOTICE|')) return ''
  const parts = content.split('|')
  const noticeType = parts[1] || ''
  const title = parts[2] || ''
  if (noticeType === 'START') {
    return '🚀 ' + title + ' 开始考试'
  } else if (noticeType === 'PUBLISH') {
    return '📢 ' + title + ' 发布通知'
  } else if (noticeType === 'END') {
    return '🔚 ' + title + ' 考试结束'
  }
  return '📝 ' + title
}

const formatMessageTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadClasses()
})
</script>

<style scoped>
.my-classes {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
}

.page-header {
  margin-bottom: 32rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.join-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.join-form {
  display: flex;
  gap: 20rpx;
}

.join-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
}

.join-input input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 28rpx;
}

.join-btn {
  width: 200rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #f56c6c;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.class-message-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.class-message-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  
  .class-message-icon {
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    flex-shrink: 0;
    
    .icon-emoji {
      font-size: 36rpx;
    }
  }
  
  .class-message-info {
    flex: 1;
    min-width: 0;
    
    .class-message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12rpx;
      
      .class-message-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
      }
      
      .class-message-time {
        font-size: 24rpx;
        color: #999;
        flex-shrink: 0;
      }
    }
    
    .class-message-content {
      font-size: 26rpx;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
      margin-bottom: 12rpx;
    }
    
    .class-message-meta {
      display: flex;
      gap: 20rpx;
      
      text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .class-message-arrow {
    margin-left: 16rpx;
    flex-shrink: 0;
    
    .arrow-icon {
      font-size: 40rpx;
      color: #999;
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
}

.empty-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999;
}
</style>