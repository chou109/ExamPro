<template>
  <view class="class-chat">
    <CustomNavBar :title="className" :showBack="true" />
    
    <view class="chat-header">
      <view class="header-left">
        <text class="member-count">{{ memberCount }} {{ userStore.t('common.members') }}</text>
      </view>
      <view class="header-right">
        <view class="member-btn" @click="showMembers = true">
          <text class="btn-icon">👥</text>
        </view>
        <view class="more-btn" @click="showActions = true">
          <text class="btn-icon">☰</text>
        </view>
      </view>
    </view>

    <scroll-view class="chat-body" scroll-y :scroll-top="scrollTop">
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
                <text class="notice-icon">{{ iconRocket }}</text>
                <text class="notice-title">{{ getNoticeTitle(msg.content) }}</text>
                <view class="notice-badge">
                  <text>{{ userStore.t('common.examNotice') }}</text>
                </view>
              </view>
              <view class="notice-info">
                <view class="info-item">
                  <text class="info-icon">{{ iconCalendar }}</text>
                  <text>{{ getNoticeStartTime(msg.content) }}</text>
                </view>
                <view class="info-item">
                  <text class="info-icon">{{ iconTimer }}</text>
                  <text>{{ getNoticeDuration(msg.content) }}{{ userStore.t('common.minutes') }}</text>
                </view>
              </view>
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
          @confirm="sendMessage"
        />
        <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">{{ userStore.t('common.send') }}</button>
      </view>
    </view>

    <!-- 成员列表弹窗 -->
    <view v-if="showMembers" class="modal" @click="showMembers = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ userStore.t('common.classMembers') }}</text>
          <view class="modal-close" @click="showMembers = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <scroll-view class="members-list" scroll-y>
          <view class="member-item" v-for="member in members" :key="member.userId">
            <view class="member-info">
              <text class="member-name">{{ member.realName }}</text>
              <view class="member-role" :class="'role-' + member.role.toLowerCase()">
                <text>{{ getRoleText(member.role) }}</text>
              </view>
            </view>
            <view v-if="member.muteUntil" class="mute-status">
              <text>{{ userStore.t('common.muted') }}</text>
            </view>
            <view v-if="canManageMember" class="member-actions">
              <button v-if="!member.muteUntil" class="mute-btn" @click="handleMute(member)">{{ userStore.t('common.mute') }}</button>
              <button v-else class="unmute-btn" @click="handleUnmute(member)">{{ userStore.t('common.unmute') }}</button>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 操作面板 -->
    <view v-if="showActions" class="modal" @click="showActions = false">
      <view class="action-panel" @click.stop>
        <view class="action-item" @click="handleSendExamNotice">
          <text class="action-icon">📢</text>
          <text>{{ userStore.t('teacher.publishExam') }}</text>
        </view>
        <view class="action-item" @click="handleInvite">
          <text class="action-icon">👥</text>
          <text>{{ userStore.t('common.inviteMembers') }}</text>
        </view>
        <view class="action-item danger" @click="showActions = false">
          <text>{{ userStore.t('common.cancel') }}</text>
        </view>
      </view>
    </view>

    <!-- 发布考试弹窗 -->
    <view v-if="showExamForm" class="modal" @click="showExamForm = false">
      <view class="exam-form-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ userStore.t('teacher.publishExam') }}</text>
          <view class="modal-close" @click="showExamForm = false">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <scroll-view class="form-body" scroll-y>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('teacher.examTitle') }}</text>
            <input class="form-input" v-model="examForm.title" :placeholder="userStore.t('teacher.enterExamTitle')" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('teacher.selectPaper') }}</text>
            <picker mode="selector" :range="papers" range-key="title" @change="onPaperChange" :cancel-text="userStore.t('common.cancel')" :confirm-text="userStore.t('common.confirm')">
              <view class="form-picker">
                <text>{{ selectedPaper?.title || userStore.t('teacher.selectPaper') }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('teacher.duration') }}({{ userStore.t('common.minutes') }})</text>
            <input class="form-input" type="number" v-model="examForm.duration" :placeholder="userStore.t('teacher.enterDuration')" />
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('teacher.startDate') }}</text>
            <picker mode="date" :value="examForm.startDate" @change="onStartDateChange">
              <view class="form-picker">
                <text>{{ examForm.startDate || userStore.t('common.selectDate') }}</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">{{ userStore.t('teacher.startTime') }}</text>
            <picker mode="time" :value="examForm.startTime" @change="onStartTimeChange">
              <view class="form-picker">
                <text>{{ examForm.startTime || userStore.t('common.selectTime') }}</text>
              </view>
            </picker>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showExamForm = false">{{ userStore.t('common.cancel') }}</button>
          <button class="modal-btn confirm" @click="submitExam">{{ userStore.t('teacher.publishExam') }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/index.js'
import { classApi, examApi, paperApi } from '../../utils/api.js'
import CustomNavBar from '../../components/CustomNavBar.vue'

const userStore = useUserStore()

const classId = ref('')
const className = ref('')
const memberCount = ref(0)
const messages = ref([])
const members = ref([])
const inputMessage = ref('')
const showMembers = ref(false)
const showActions = ref(false)
const showExamForm = ref(false)
const scrollTop = ref(0)
const canManageMember = ref(false)
const currentRole = ref('')
const inviteCode = ref('')

const papers = ref([])
const selectedPaperId = ref(null)

const examForm = reactive({
  title: '',
  duration: '',
  startDate: '',
  startTime: ''
})

const iconRocket = '🚀'
const iconCalendar = '📅'
const iconTimer = '⏱'

const selectedPaper = ref(null)

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

const isExamNotice = (msg) => {
  return msg.content?.startsWith('EXAM_NOTICE|')
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

const getNoticeTitle = (content) => {
  const notice = parseExamNotice(content)
  return notice ? notice.title : ''
}

const getNoticeStartTime = (content) => {
  const notice = parseExamNotice(content)
  return notice ? notice.startTime : ''
}

const getNoticeDuration = (content) => {
  const notice = parseExamNotice(content)
  return notice ? notice.duration : ''
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

const goBack = () => {
  uni.navigateBack()
}

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  try {
    const userId = userStore.userInfo?.userId
    const res = await classApi.sendMessage(classId.value, inputMessage.value, userId)
    if (res.code === 200) {
      inputMessage.value = ''
      loadMessages()
    } else {
      uni.showToast({ title: res.message || userStore.t('common.sendFailed'), icon: 'none' })
    }
  } catch (e) {
    console.error(e)
    uni.showToast({ title: userStore.t('common.networkError'), icon: 'none' })
  }
}

const handleSendExamNotice = () => {
  showActions.value = false
  loadPapers()
  showExamForm.value = true
}

const loadPapers = async () => {
  try {
    const res = await paperApi.page({ current: 1, size: 50 })
    if (res.code === 200) {
      papers.value = res.data.records || []
    }
  } catch (e) {
    console.error('加载试卷失败:', e)
    uni.showToast({ title: userStore.t('common.loadPaperFailed'), icon: 'none' })
  }
}

const onPaperChange = (e) => {
  const index = e.detail.value
  if (papers.value[index]) {
    selectedPaperId.value = papers.value[index].id
    selectedPaper.value = papers.value[index]
  }
}

const onStartDateChange = (e) => {
  examForm.startDate = e.detail.value
}

const onStartTimeChange = (e) => {
  examForm.startTime = e.detail.value
}

const submitExam = async () => {
  if (!examForm.title.trim()) {
    uni.showToast({ title: userStore.t('teacher.enterExamTitle'), icon: 'none' })
    return
  }
  if (!selectedPaperId.value) {
    uni.showToast({ title: userStore.t('teacher.selectPaper'), icon: 'none' })
    return
  }
  if (!examForm.duration) {
    uni.showToast({ title: userStore.t('teacher.enterDuration'), icon: 'none' })
    return
  }
  if (!examForm.startDate || !examForm.startTime) {
    uni.showToast({ title: userStore.t('teacher.selectStartTime'), icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: userStore.t('common.publishing') })
    
    const startTime = `${examForm.startDate} ${examForm.startTime}:00`
    
    const examData = {
      title: examForm.title,
      paperId: selectedPaperId.value,
      classIds: classId.value,
      duration: parseInt(examForm.duration),
      startTime: startTime,
      status: 'PENDING'
    }

    const res = await examApi.create(examData)
    
    if (res.code === 200) {
      uni.showToast({ title: userStore.t('teacher.publishSuccess'), icon: 'success' })
      showExamForm.value = false
      
      const examId = res.data.id !== undefined ? res.data.id : res.data
      const noticeContent = `EXAM_NOTICE|PUBLISH|${examForm.title}|${startTime}||${examForm.duration}|${examId}`
      await classApi.sendMessage(classId.value, noticeContent, userStore.userInfo?.userId)
      
      examForm.title = ''
      examForm.duration = ''
      examForm.startDate = ''
      examForm.startTime = ''
      selectedPaperId.value = null
      selectedPaper.value = null
      
      loadMessages()
    } else {
      uni.showToast({ title: res.message || userStore.t('common.publishFailed'), icon: 'none' })
    }
  } catch (e) {
    console.error('发布考试失败:', e)
    uni.showToast({ title: userStore.t('common.publishFailed'), icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const handleInvite = () => {
  showActions.value = false
  uni.showModal({
    title: userStore.t('common.inviteMembers'),
    content: `${userStore.t('common.inviteCode')}：${inviteCode.value}\n${userStore.t('common.shareInviteCode')}`,
    showCancel: false,
    success: () => {
      uni.setClipboardData({
        data: inviteCode.value,
        success: () => {
          uni.showToast({ title: userStore.t('common.copySuccess'), icon: 'success' })
        }
      })
    }
  })
}

const handleMute = async (member) => {
  uni.showModal({
    title: userStore.t('common.muteMember'),
    content: `${userStore.t('common.confirmMute')} ${member.realName} ?`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await classApi.muteMember(classId.value, member.userId, 3600)
          if (result.code === 200) {
            uni.showToast({ title: userStore.t('common.muted'), icon: 'success' })
            loadMembers()
          } else {
            uni.showToast({ title: result.message || userStore.t('common.operationFailed'), icon: 'none' })
          }
        } catch (e) {
          uni.showToast({ title: userStore.t('common.networkError'), icon: 'none' })
        }
      }
    }
  })
}

const handleUnmute = async (member) => {
  uni.showModal({
    title: userStore.t('common.unmuteMember'),
    content: `${userStore.t('common.confirmUnmute')} ${member.realName} ?`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await classApi.unmuteMember(classId.value, member.userId)
          if (result.code === 200) {
            uni.showToast({ title: userStore.t('common.unmuted'), icon: 'success' })
            loadMembers()
          } else {
            uni.showToast({ title: result.message || userStore.t('common.operationFailed'), icon: 'none' })
          }
        } catch (e) {
          uni.showToast({ title: userStore.t('common.networkError'), icon: 'none' })
        }
      }
    }
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

const loadMembers = async () => {
  try {
    const res = await classApi.getClassMembers(classId.value)
    if (res.code === 200) {
      members.value = res.data
      memberCount.value = res.data.length

      const userId = userStore.userInfo?.userId
      const currentMember = res.data.find(m => String(m.userId) === String(userId))
      if (currentMember) {
        currentRole.value = currentMember.role
        canManageMember.value = currentMember.role === 'CREATOR' || currentMember.role === 'TEACHER'
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
      inviteCode.value = res.data.inviteCode || ''
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

.header-left {
  display: flex;
  align-items: center;
}

.member-count {
  font-size: 24rpx;
  color: #666;
}

.header-right {
  display: flex;
  gap: 12rpx;
}

.member-btn, .more-btn {
  padding: 8rpx;
  
  .btn-icon {
    font-size: 36rpx;
    color: #666;
  }
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

/* 弹窗样式 */
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

.member-actions {
  display: flex;
  gap: 8rpx;
}

.mute-btn, .unmute-btn {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.mute-btn {
  background: #f56c6c;
  color: #fff;
}

.unmute-btn {
  background: #67c23a;
  color: #fff;
}

/* 操作面板 */
.action-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
  background: #f5f5f5;
  
  .action-icon {
    font-size: 32rpx;
  }
}

.action-item.danger {
  background: #f56c6c;
  color: #fff;
  justify-content: center;
}

.action-item text {
  font-size: 28rpx;
  color: #333;
}

.exam-form-modal {
  width: 90%;
  max-height: 80vh;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
}

.form-body {
  flex: 1;
  padding: 32rpx;
  max-height: 50vh;
}

.form-item {
  margin-bottom: 28rpx;
  
  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
  }
  
  .form-input {
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
  }
  
  .form-picker {
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #666;
  }
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #eee;
  
  .modal-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    
    &.cancel {
      background: #f5f5f5;
      color: #666;
    }
    
    &.confirm {
      background: #dc2626;
      color: #fff;
    }
  }
}
</style>