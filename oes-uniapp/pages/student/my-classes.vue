<template>
  <view class="my-classes">
    <CustomNavBar :title="userStore.t('common.myClass')" :showBack="true" />
    
    <view class="page-header">
      <text class="subtitle">{{ userStore.t('student.viewLatest') }}</text>
    </view>

    <!-- 加入班级 -->
    <view class="join-card">
      <view class="join-form">
        <view class="join-input">
          <uni-icons type="personadd" size="20" color="#999" />
          <input
            type="text"
            v-model="inviteCode"
            :placeholder="userStore.t('student.enterClassCode')"
            @confirm="handleJoin"
          />
        </view>
        <button class="join-btn" @click="handleJoin">{{ userStore.t('student.joinClass') }}</button>
      </view>
    </view>

    <!-- 班级消息列表 -->
    <view class="class-message-list" v-if="classList.length > 0">
      <view class="class-message-card" v-for="item in classList" :key="item.id" @click="enterClass(item.id)">
        <view class="class-message-icon">
          <text class="icon-emoji">🏫</text>
        </view>
        <view class="class-message-main">
          <text class="class-message-name">{{ item.className }}</text>
          <text class="class-message-content">{{ getLastMessage(item) }}</text>
        </view>
        <view class="class-message-right">
          <text class="class-message-time">{{ formatMessageTime(item.lastMessageTime) }}</text>
          <text class="class-message-invite">{{ item.inviteCode }}</text>
          <text class="class-message-role">{{ getRoleText(item.member_role) }}</text>
        </view>
        <text class="arrow-icon">›</text>
      </view>
    </view>

    <view v-if="classList.length === 0" class="empty">
      <uni-icons type="info" size="80" color="#999" />
      <text class="empty-text">{{ userStore.t('student.noClass') }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '../../store/index.js'
import { classApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()
const inviteCode = ref('')
const classList = ref([])

const getRoleText = (role) => {
  return {
    CREATOR: userStore.t('common.owner'),
    OWNER: userStore.t('common.owner'),
    ADMIN: userStore.t('common.admin'),
    TEACHER: userStore.t('common.teacher'),
    STUDENT: userStore.t('common.student'),
    MEMBER: userStore.t('common.member')
  }[role] || role
}

const handleJoin = async () => {
  if (!inviteCode.value.trim()) {
    uni.showToast({
      title: userStore.t('student.enterClassCode'),
      icon: 'none'
    })
    return
  }

  try {
    const userId = userStore.userId
    if (!userId) {
      uni.showToast({
        title: userStore.t('student.pleaseLogin'),
        icon: 'none'
      })
      return
    }

    const res = await classApi.joinByCode(inviteCode.value, userId)
    if (res.code === 200) {
      uni.showToast({
        title: userStore.t('student.joinSuccess'),
        icon: 'success'
      })
      inviteCode.value = ''
      loadClasses()
    } else {
      uni.showToast({
        title: res.message || userStore.t('student.joinFailed'),
        icon: 'none'
      })
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: userStore.t('student.networkError'),
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
    const userId = userStore.userId
    if (!userId) {
      return
    }

    const res = await classApi.getMyClasses(userId)
    if (res.code === 200) {
      classList.value = res.data
    }
  } catch (e) {
    console.error('加载班级失败:', e)
    uni.showToast({
      title: userStore.t('student.loadFailed'),
      icon: 'none'
    })
  }
}

const getLastMessage = (cls) => {
  if (!cls.lastMessage) return userStore.t('common.noData')
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
    return '🚀 ' + title + ' ' + userStore.t('student.examStarted')
  } else if (noticeType === 'PUBLISH') {
    return '📢 ' + title + ' ' + userStore.t('student.examPublished')
  } else if (noticeType === 'END') {
    return '🔚 ' + title + ' ' + userStore.t('common.finished')
  }
  return '📝 ' + title
}

const formatMessageTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return userStore.t('student.justNow')
  if (diff < 3600000) return Math.floor(diff / 60000) + (userStore.language === 'zh' ? userStore.t('common.minutes') + userStore.t('student.ago') : userStore.t('student.minutesAgo'))
  if (diff < 86400000) return Math.floor(diff / 3600000) + (userStore.language === 'zh' ? userStore.t('common.hours') + userStore.t('student.ago') : userStore.t('student.hoursAgo'))
  if (userStore.language === 'zh') {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

onMounted(() => {
  uni.setNavigationBarTitle({ title: userStore.t('common.myClasses') })
  loadClasses()
})

watch(() => userStore.language, () => {
  uni.setNavigationBarTitle({ title: userStore.t('common.myClasses') })
})
</script>

<style scoped>
.my-classes {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 0;
  padding-top: 140rpx;
  position: relative;
}

.page-header {
  padding: 24rpx;
  margin-bottom: 32rpx;
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
  margin: 0 24rpx 24rpx;
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
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.class-message-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.class-message-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.class-message-icon .icon-emoji {
  font-size: 36rpx;
}

.class-message-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.class-message-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.class-message-content {
  font-size: 26rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.class-message-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 16rpx;
  flex-shrink: 0;
  min-width: 140rpx;
  gap: 8rpx;
}

.class-message-time {
  font-size: 24rpx;
  color: #999;
}

.class-message-invite {
  font-size: 22rpx;
  color: #999;
}

.class-message-role {
  font-size: 22rpx;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.arrow-icon {
  font-size: 40rpx;
  color: #999;
  margin-left: 12rpx;
  flex-shrink: 0;
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