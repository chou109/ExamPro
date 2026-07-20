<template>
  <view class="class-chat">
    <CustomNavBar :title="userStore.t('common.classChat')" :showBack="true" />
    
    <view class="chat-header">
      <view class="header-info">
        <text class="class-name">{{ className }}</text>
        <text class="member-count">{{ memberCount }} {{ userStore.t('common.members') }}</text>
      </view>
      <view class="header-right">
        <view class="member-btn" @click="showMembers = true">
          <text class="member-icon">👥</text>
        </view>
      </view>
    </view>

    <scroll-view class="chat-body" scroll-y :scroll-top="scrollTop" @scrolltoupper="loadMoreMessages">
      <view class="message-list">
        <view
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="{ 'is-self': isSelfMessage(msg.senderId) }"
        >
          <view class="message-avatar">
            <image :src="getSenderAvatar(msg.senderId)" mode="aspectFill" />
          </view>
          <view class="message-content-wrapper">
            <text class="message-sender">{{ getSenderName(msg.senderId) }}</text>
            <view class="message-bubble" v-if="!isExamNotice(msg)">
              <text class="message-text">{{ msg.content }}</text>
            </view>
            <view class="exam-notice" v-else>
              <view class="notice-header">
                <text class="notice-icon">{{ getNoticeIcon(msg.content) }}</text>
                <text class="notice-title">{{ getNoticeTitle(msg.content) }}</text>
                <view class="notice-badge">
                  <text>{{ getNoticeBadge(msg.content) }}</text>
                </view>
              </view>
              <view class="notice-info">
                <view class="info-item">
                  <text class="info-icon">{{ iconCalendar }}</text>
                  <text>{{ getNoticeStartTime(msg.content) }}</text>
                </view>
                <view class="info-item">
                  <text class="info-icon">{{ iconEnd }}</text>
                  <text>{{ getNoticeEndTime(msg.content) }}</text>
                </view>
                <view class="info-item">
                  <text class="info-icon">{{ iconTimer }}</text>
                  <text>{{ getNoticeDuration(msg.content) }}{{ userStore.t('common.minutes') }}</text>
                </view>
              </view>
              <button class="notice-btn" @click="goToExamDetail(msg)">
                {{ getNoticeBtnText(msg.content) }}
              </button>
            </view>
            <text class="message-time">{{ formatTime(msg.createTime) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="chat-input-wrapper">
      <view class="chat-input">
        <input
          v-model="inputMessage"
          :placeholder="userStore.t('common.enterMessage')"
          :disabled="isMuted"
          @confirm="sendMessage"
        />
        <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim() || isMuted">{{ userStore.t('common.send') }}</button>
      </view>
      <view v-if="isMuted" class="muted-tip">
        <text>{{ userStore.t('common.muted') }}</text>
      </view>
    </view>

    <!-- 成员列表弹窗 -->
    <view v-if="showMembers" class="modal" @click="showMembers = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ userStore.t('common.classMembers') }}</text>
          <view class="modal-close" @click="showMembers = false">
            <uni-icons type="close" size="24" color="#333" />
          </view>
        </view>
        <scroll-view class="members-list" scroll-y>
          <view class="member-item" v-for="member in members" :key="member.userId">
            <view class="member-info">
              <text class="member-name">{{ member.realName || member.username || userStore.t('common.unknownUser') }}</text>
              <view class="member-role" :class="'role-' + member.role.toLowerCase()">
                <text>{{ getRoleText(member.role) }}</text>
              </view>
            </view>
            <view v-if="member.muteUntil" class="mute-status">
              <text>{{ userStore.t('common.muted') }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/index.js'
import { classApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()
const classId = ref('')
const className = ref('')
const memberCount = ref(0)
const messages = ref([])
const members = ref([])
const inputMessage = ref('')
const showMembers = ref(false)
const isMuted = ref(false)
const scrollTop = ref(0)

const iconRocket = '🚀'
const iconBell = '🔔'
const iconCalendar = '📅'
const iconEnd = '🔚'
const iconTimer = '⏱'

const getRoleText = (role) => {
  return {
    CREATOR: userStore.t('common.creator'),
    OWNER: userStore.t('common.creator'),
    TEACHER: userStore.t('common.teacher'),
    STUDENT: userStore.t('common.student'),
    MEMBER: userStore.t('common.student')
  }[role] || role
}

const isSelfMessage = (senderId) => {
  const userId = userStore.userInfo?.userId
  return String(senderId) === String(userId)
}

const getSenderName = (senderId) => {
  const selfId = userStore.userInfo?.userId || userStore.userInfo?.id
  if (String(senderId) === String(selfId)) {
    const realName = userStore.userInfo?.realName || userStore.userInfo?.real_name
    return realName && realName.trim() !== '' ? realName : userStore.userInfo?.username || userStore.t('common.unknownUser')
  }
  const member = members.value.find(m => String(m.userId) === String(senderId))
  if (!member) {
    return userStore.t('common.unknownUser')
  }
  const name = member.realName && member.realName.trim() !== '' ? member.realName : member.username
  return name && name.trim() !== '' ? name : userStore.t('common.unknownUser')
}

const getSenderAvatar = (senderId) => {
  const member = members.value.find(m => String(m.userId) === String(senderId))
  const avatar = member?.avatar
  if (!avatar) return '/static/default-avatar.png'
  if (avatar.startsWith('http')) return avatar
  return 'http://192.168.1.92:8081' + avatar
}

const isExamNotice = (msg) => {
  return msg.content?.startsWith('EXAM_NOTICE|')
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isMuted.value) return

  try {
    const userId = userStore.userInfo?.userId
    const res = await classApi.sendMessage(classId.value, inputMessage.value, userId)
    if (res.code === 200) {
      inputMessage.value = ''
      loadMessages()
    } else {
      uni.showToast({
        title: res.message || userStore.t('common.sendFailed'),
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

const parseExamNotice = (content) => {
  if (!content?.startsWith('EXAM_NOTICE|')) return null
  const parts = content.split('|')
  let examId = null
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^\d+$/.test(parts[i])) {
      examId = parts[i]
      break
    }
  }
  return {
    noticeType: parts[1],
    title: parts[2],
    startTime: parts[3],
    endTime: parts[4],
    duration: parts[5],
    examId: examId
  }
}

const getNoticeIcon = (content) => {
  const notice = parseExamNotice(content)
  return notice?.noticeType === 'START' ? iconRocket : iconBell
}

const getNoticeBadge = (content) => {
  const notice = parseExamNotice(content)
  return notice?.noticeType === 'START' ? userStore.t('common.ongoing') : userStore.t('common.pending')
}

const getNoticeBtnText = (content) => {
  const notice = parseExamNotice(content)
  return notice?.noticeType === 'START' ? userStore.t('student.enterExam') : userStore.t('student.viewExam')
}

const getNoticeTitle = (content) => {
  const notice = parseExamNotice(content)
  return notice ? notice.title : ''
}

const getNoticeStartTime = (content) => {
  const notice = parseExamNotice(content)
  return notice ? notice.startTime : ''
}

const getNoticeEndTime = (content) => {
  const notice = parseExamNotice(content)
  return notice ? notice.endTime : ''
}

const getNoticeDuration = (content) => {
  const notice = parseExamNotice(content)
  return notice ? notice.duration : ''
}

const formatTime = (time) => {
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

const goToExamDetail = (msg) => {
  const examNotice = parseExamNotice(msg.content)
  if (!examNotice) {
    uni.showToast({
      title: userStore.t('common.invalidExamId'),
      icon: 'none'
    })
    return
  }
  const examId = examNotice.examId
  if (!examId || !/^\d+$/.test(String(examId))) {
    uni.showToast({
      title: userStore.t('common.invalidExamId'),
      icon: 'none'
    })
    return
  }
  uni.navigateTo({
    url: `/pages/student/exam-take?id=${examId}`
  })
}

const loadMessages = async () => {
  try {
    const res = await classApi.getMessages(classId.value, 1, 50)
    if (res.code === 200) {
      const records = res.data.records || res.data
      messages.value = records
      nextTick(() => {
        scrollTop.value = 999999
      })
    }
  } catch (e) {
    console.error(e)
  }
}

const loadMoreMessages = () => {
  // 加载更多历史消息的逻辑
}

const loadMembers = async () => {
  try {
    const res = await classApi.getClassMembers(classId.value)
    if (res.code === 200) {
      members.value = res.data
      memberCount.value = res.data.length

      const userId = userStore.userInfo?.userId
      const currentMember = res.data.find(m => String(m.userId) === String(userId))
      if (currentMember && currentMember.muteUntil) {
        isMuted.value = true
      }
    }
  } catch (e) {
    console.error(e)
  }
}

const loadClassInfo = async () => {
  try {
    const res = await classApi.getById(classId.value)
    if (res.code === 200) {
      className.value = res.data.className
    }
  } catch (e) {
    console.error(e)
  }
}

onLoad((options) => {
  classId.value = options.id
  loadClassInfo()
  loadMessages()
  loadMembers()
})

onShow(() => {
  loadMembers()
})
</script>

<style scoped>
.class-chat {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 140rpx;
}

.chat-header {
  background: #fff;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.class-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.member-count {
  font-size: 24rpx;
  color: #666;
}

.member-btn {
  padding: 8rpx;
}

.member-icon {
  font-size: 28rpx;
  color: #666;
}

.chat-body {
  flex: 1;
  overflow: hidden;
}

.message-list {
  padding: 24rpx;
}

.message-item {
  display: flex;
  margin-bottom: 24rpx;
  align-items: flex-start;
}

.message-item.is-self {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.message-avatar image {
  width: 100%;
  height: 100%;
}

.message-content-wrapper {
  max-width: 70%;
  margin-left: 16rpx;
}

.message-item.is-self .message-content-wrapper {
  margin-left: 0;
  margin-right: 16rpx;
}

.message-sender {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.message-item.is-self .message-sender {
  text-align: right;
}

.message-bubble {
  background: #fff;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  display: inline-block;
}

.message-item.is-self .message-bubble {
  background: #409eff;
  color: #fff;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.5;
}

.message-time {
  font-size: 20rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.message-item.is-self .message-time {
  text-align: right;
}

.exam-notice {
  background: #fff;
  padding: 24rpx;
  border-radius: 12rpx;
  border: 2rpx solid #409eff;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.notice-icon {
  font-size: 28rpx;
}

.notice-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.notice-badge {
  padding: 4rpx 12rpx;
  background: #409eff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.notice-info {
  margin-bottom: 16rpx;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.info-icon {
  margin-right: 8rpx;
}

.notice-btn {
  width: 100%;
  height: 64rpx;
  line-height: 64rpx;
  background: #409eff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.chat-input-wrapper {
  background: #fff;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #eee;
}

.chat-input {
  display: flex;
  gap: 16rpx;
}

.chat-input input {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 120rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #409eff;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.send-btn:disabled {
  background: #f5f5f5;
  color: #999;
}

.muted-tip {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #f56c6c;
}

/* 成员列表弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 90%;
  max-height: 70vh;
  background: #fff;
  border-radius: 16rpx;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  padding: 8rpx;
}

.members-list {
  padding: 24rpx;
  max-height: 60vh;
}

.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.member-name {
  font-size: 28rpx;
  color: #333;
}

.member-role {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
}

.role-creator {
  background: #f56c6c;
  color: #fff;
}

.role-teacher {
  background: #e6a23c;
  color: #fff;
}

.role-student {
  background: #409eff;
  color: #fff;
}

.mute-status {
  padding: 4rpx 12rpx;
  background: #909399;
  color: #fff;
  border-radius: 8rpx;
  font-size: 20rpx;
}
</style>