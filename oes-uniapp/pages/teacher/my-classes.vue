<template>
  <view class="my-classes">
    <CustomNavBar :title="userStore.t('common.myClasses')" :showBack="true" />

    <!-- 创建班级 -->
    <view class="create-card">
      <view class="create-form">
        <view class="create-input">
          <text class="create-icon">➕</text>
          <input
            type="text"
            v-model="className"
            :placeholder="userStore.t('teacher.enterClassName')"
            @confirm="handleCreate"
          />
        </view>
        <button class="create-btn" @click="handleCreate">{{ userStore.t('teacher.createClass') }}</button>
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
      <text class="empty-icon">📋</text>
      <text class="empty-text">{{ userStore.t('teacher.noClasses') }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '../../store/index.js'
import { classApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()

const className = ref('')
const classList = ref([])

const getRoleText = (role) => {
  const map = {
    CREATOR: userStore.t('common.creator'),
    OWNER: userStore.t('common.owner'),
    ADMIN: userStore.t('common.admin'),
    TEACHER: userStore.t('common.teacher'),
    STUDENT: userStore.t('common.student'),
    MEMBER: userStore.t('common.member')
  }
  return map[role] || role
}

const handleCreate = async () => {
  if (!className.value.trim()) {
    uni.showToast({
      title: userStore.t('teacher.enterClassName'),
      icon: 'none'
    })
    return
  }

  try {
    const userId = userStore.userId
    if (!userId) {
      uni.showToast({
        title: userStore.t('common.pleaseLogin'),
        icon: 'none'
      })
      return
    }

    const res = await classApi.create({
      name: className.value,
      ownerId: userId
    })
    if (res.code === 200) {
      uni.showToast({
        title: userStore.t('teacher.createClassSuccess'),
        icon: 'success'
      })
      className.value = ''
      loadClasses()
    } else {
      uni.showToast({
        title: res.message || userStore.t('teacher.createClassFailed'),
        icon: 'none'
      })
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: userStore.t('common.networkError'),
      icon: 'none'
    })
  }
}

const enterClass = (classId) => {
  uni.navigateTo({
    url: `/pages/teacher/class-chat?id=${classId}`
  })
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
  if (diff < 60000) return userStore.t('common.justNow')
  if (diff < 3600000) return Math.floor(diff / 60000) + userStore.t('common.minutesAgo')
  if (diff < 86400000) return Math.floor(diff / 3600000) + userStore.t('common.hoursAgo')
  if (userStore.language === 'zh') {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

const loadClasses = async () => {
  try {
    const userId = userStore.userId
    if (!userId) return

    const res = await classApi.getMyClasses(userId)
    if (res.code === 200) {
      classList.value = res.data
    }
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: userStore.t('teacher.loadClassesFailed'),
      icon: 'none'
    })
  }
}

onMounted(() => {
  loadClasses()
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

.create-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.create-form {
  display: flex;
  gap: 20rpx;
}

.create-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
}

.create-input input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 28rpx;
}

.create-icon {
  font-size: 28rpx;
}

.create-btn {
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

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999;
}
</style>