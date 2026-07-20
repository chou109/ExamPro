<template>
  <div class="class-chat">
    <div class="chat-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h2>{{ className }}</h2>
        <span class="member-count">{{ memberCount }} {{ userStore.t('teacher.members') }}</span>
      </div>
      <div class="header-right">
        <el-button link @click="showMembers = !showMembers">
          <el-icon><User /></el-icon>
          {{ userStore.t('teacher.members') }}
        </el-button>
      </div>
    </div>

    <div class="chat-body">
      <div class="message-list" ref="messageList">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="message-item"
          :class="{ 'is-self': isSelfMessage(msg.senderId) }"
        >
          <div class="message-avatar">
            <el-avatar :size="40" :src="getSenderAvatar(msg.senderId)">
              {{ getSenderName(msg.senderId).charAt(0) }}
            </el-avatar>
          </div>
          <div class="message-content-wrapper">
            <p class="message-sender">{{ getSenderName(msg.senderId) }}</p>
            <div class="message-bubble" v-if="!isExamNotice(msg)">
              <p class="message-text">{{ msg.content }}</p>
            </div>
            <div class="exam-notice" v-else>
              <div class="notice-header">
                <span class="notice-icon">{{ parseExamNotice(msg.content)?.noticeType === 'START' ? '🚀' : '📢' }}</span>
                <span class="notice-title">{{ parseExamNotice(msg.content)?.title }}</span>
                <span class="notice-badge">{{ parseExamNotice(msg.content)?.noticeType === 'START' ? userStore.t('common.ongoing') : userStore.t('common.pending') }}</span>
              </div>
              <div class="notice-info">
                <div class="info-item">
                  <span class="info-icon">📅</span>
                  <span>{{ userStore.t('teacher.classChat.startTime') }}：{{ parseExamNotice(msg.content)?.startTime }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🔚</span>
                  <span>{{ userStore.t('teacher.classChat.endTime') }}：{{ parseExamNotice(msg.content)?.endTime }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">⏱️</span>
                  <span>{{ userStore.t('teacher.classChat.duration') }}：{{ parseExamNotice(msg.content)?.duration }}{{ userStore.t('teacher.classChat.minutes') }}</span>
                </div>
              </div>
              <div class="notice-action">
                <el-button type="primary" size="small" @click="goToExamList(msg)">{{ parseExamNotice(msg.content)?.noticeType === 'START' ? userStore.t('teacher.enterExam') : userStore.t('teacher.viewExam') }}</el-button>
              </div>
            </div>
            <p class="message-time">{{ formatTime(msg.createTime) }}</p>
          </div>
        </div>
      </div>

      <div class="chat-input-wrapper">
        <div class="chat-input">
          <el-input 
            v-model="inputMessage" 
            :placeholder="userStore.t('teacher.enterMessage')" 
            style="flex: 1"
            @keyup.enter="sendMessage"
          />
          <el-dropdown v-if="isTeacher" trigger="click" @command="handleDropdownCommand" style="margin-right: 8px">
            <el-button type="primary">
              <el-icon><Plus /></el-icon>
              {{ userStore.t('teacher.publish') }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="exam">
                  <el-icon><Document /></el-icon>
                  {{ userStore.t('teacher.publishExam') }}
                </el-dropdown-item>
                <el-dropdown-item command="homework" disabled>
                  <el-icon><Notebook /></el-icon>
                  {{ userStore.t('teacher.publishHomework') }}
                </el-dropdown-item>
                <el-dropdown-item command="notice" disabled>
                  <el-icon><Bell /></el-icon>
                  {{ userStore.t('teacher.publishNotice') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button 
            type="danger" 
            @click="sendMessage"
            :disabled="!inputMessage.trim()"
          >
            {{ userStore.t('teacher.send') }}
          </el-button>
        </div>
      </div>
    </div>

    <div class="members-panel" v-if="showMembers">
      <div class="panel-header">
        <h3>{{ userStore.t('teacher.classMembers') }}</h3>
        <el-button link @click="showMembers = false">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      <div class="members-list">
        <div 
          v-for="member in members" 
          :key="member.userId" 
          class="member-item"
        >
          <div class="member-info">
            <span class="member-name">{{ member.realName }}</span>
            <span :class="'member-role ' + member.role.toLowerCase()">{{ getRoleText(member.role) }}</span>
          </div>
          <span v-if="member.muteUntil" class="mute-status">{{ userStore.t('teacher.muted') }}</span>
        </div>
      </div>
    </div>

    <el-dialog v-model="examDialogVisible" :title="userStore.t('teacher.publishExam')" width="600px">
      <el-form ref="examFormRef" :model="examForm" :rules="examRules" label-width="100px">
        <el-form-item :label="userStore.t('teacher.examTitle')" prop="title">
          <el-input v-model="examForm.title" :placeholder="userStore.t('teacher.enterExamTitle')" />
        </el-form-item>
        <el-form-item :label="userStore.t('teacher.selectPaper')" prop="paperId">
          <el-select v-model="examForm.paperId" style="width: 100%" @change="onPaperChange">
            <el-option v-for="p in papers" :key="p.id" :label="p.title" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="userStore.t('teacher.currentClass')">
          <el-tag type="primary">{{ className }}</el-tag>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="userStore.t('teacher.classChat.startTime')">
              <el-date-picker v-model="examForm.startTime" type="datetime" :placeholder="userStore.t('teacher.classChat.startTime')" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="userStore.t('teacher.classChat.endTime')">
              <el-date-picker v-model="examForm.endTime" type="datetime" :placeholder="userStore.t('teacher.classChat.endTime')" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="userStore.t('teacher.classChat.duration')">
              <el-input-number v-model="examForm.duration" :min="1" :max="300" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="userStore.t('teacher.passRate')">
              <el-input-number v-model="examForm.passRate" :min="0" :max="100" style="width: 100%" />
              <span style="margin-left: 8px; color: #909399">%</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider>{{ userStore.t('teacher.antiCheatSettings') }}</el-divider>
        <el-form-item :label="userStore.t('common.shuffleQuestions')">
          <el-switch v-model="examForm.config.shuffleQuestions" />
        </el-form-item>
        <el-form-item :label="userStore.t('common.shuffleOptions')">
          <el-switch v-model="examForm.config.shuffleOptions" />
        </el-form-item>
        <el-form-item :label="userStore.t('common.leaveDetection')">
          <el-switch v-model="examForm.config.leaveDetection" />
        </el-form-item>
        <el-form-item :label="userStore.t('common.maxLeaveCount')" v-if="examForm.config.leaveDetection">
          <el-input-number v-model="examForm.config.maxLeaveCount" :min="1" :max="10" style="width: 100%" />
          <span style="margin-left: 8px; color: #909399">{{ userStore.t('teacher.exceedAutoSubmit') }}</span>
        </el-form-item>
        <el-divider>{{ userStore.t('teacher.postExamSettings') }}</el-divider>
        <el-form-item :label="userStore.t('teacher.allowViewAfterExam')">
          <el-switch v-model="examForm.config.allowViewAfterExam" />
          <span style="margin-left: 8px; color: #909399">{{ userStore.t('teacher.viewAfterExamDesc') }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="examDialogVisible = false">{{ userStore.t('common.cancel') }}</el-button>
        <el-button type="danger" @click="handleExamSubmit">{{ userStore.t('teacher.publish') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Close, Plus, Document, Notebook, Bell } from '@element-plus/icons-vue'
import { useUserStore } from '../../store'
import { classApi, examApi, paperApi } from '../../utils/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const classId = ref(route.params.id)
const className = ref('')
const memberCount = ref(0)
const messages = ref([])
const members = ref([])
const inputMessage = ref('')
const showMembers = ref(false)
const messageList = ref(null)

const papers = ref([])
const examDialogVisible = ref(false)
const examFormRef = ref()
const isTeacher = ref(false)

const examForm = reactive({
  title: '',
  paperId: null,
  subjectId: null,
  startTime: null,
  endTime: null,
  duration: 120,
  totalScore: 100,
  passRate: 60,
  config: {
    shuffleQuestions: true,
    shuffleOptions: true,
    leaveDetection: true,
    maxLeaveCount: 3,
    allowViewAfterExam: true
  }
})

const examRules = {
  title: [{ required: true, message: userStore.t('teacher.enterExamTitle'), trigger: 'blur' }],
  paperId: [{ required: true, message: userStore.t('teacher.selectPaper'), trigger: 'change' }]
}

const handleDropdownCommand = (command) => {
  if (command === 'exam') {
    examDialogVisible.value = true
  } else if (command === 'homework') {
    ElMessage.info(userStore.t('teacher.homeworkNotAvailable'))
  } else if (command === 'notice') {
    ElMessage.info(userStore.t('teacher.noticeNotAvailable'))
  }
}

const onPaperChange = async (paperId) => {
  if (paperId) {
    const paper = papers.value.find(p => p.id === paperId)
    if (paper) {
      examForm.totalScore = paper.totalScore || 100
    }
  }
}

const handleExamSubmit = async () => {
  console.log('开始提交考试表单...')
  const valid = await examFormRef.value.validate().catch(() => false)
  console.log('表单验证结果:', valid)
  if (!valid) {
    console.log('表单验证失败')
    return
  }
  
  try {
    const passScore = Math.round(examForm.totalScore * examForm.passRate / 100)
    const submitData = {
      title: examForm.title,
      paperId: examForm.paperId,
      subjectId: examForm.subjectId,
      classIds: classId.value.toString(),
      startTime: examForm.startTime,
      endTime: examForm.endTime,
      duration: examForm.duration,
      totalScore: examForm.totalScore,
      passScore: passScore,
      antiCheatConfig: JSON.stringify(examForm.config),
      allowViewAfterExam: examForm.config.allowViewAfterExam ? 1 : 0
    }
    const res = await examApi.create(submitData)
    if (res.code === 200) {
      // 获取创建的考试ID（后端直接返回ID）
      const examId = res.data
      console.log('创建考试成功，考试ID:', examId)
      if (examId) {
        // 调用发布接口，为学生创建考试记录
        try {
          const publishRes = await examApi.publish(examId)
          console.log('发布考试结果:', publishRes)
          if (publishRes.code !== 200) {
            throw new Error(publishRes.message || userStore.t('common.failed'))
          }
        } catch (e) {
          console.error('发布考试失败:', e)
          ElMessage.error(userStore.t('common.failed') + ': ' + (e.message || e))
          return
        }
      }
      
      ElMessage.success(userStore.t('teacher.publishSuccess'))
      examDialogVisible.value = false
      
      const startTime = new Date(examForm.startTime)
      const timeStr = `${startTime.getFullYear()}/${String(startTime.getMonth() + 1).padStart(2, '0')}/${String(startTime.getDate()).padStart(2, '0')} ${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`
      
      const userId = userStore.userInfo?.userId || localStorage.getItem('userId')
      const endTime = new Date(examForm.endTime)
      const endTimeStr = `${endTime.getFullYear()}/${String(endTime.getMonth() + 1).padStart(2, '0')}/${String(endTime.getDate()).padStart(2, '0')} ${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`
      const noticeContent = `EXAM_NOTICE|${examForm.title}|${timeStr}|${endTimeStr}|${examForm.duration}|${examId || ''}|PUBLISH`
      await classApi.sendMessage(classId.value, noticeContent, userId)
      await loadMessages()
      
      examForm.title = ''
      examForm.paperId = null
      examForm.subjectId = null
      examForm.startTime = null
      examForm.endTime = null
      examForm.duration = 120
      examForm.totalScore = 100
      examForm.passRate = 60
      examForm.config = {
        shuffleQuestions: true,
        shuffleOptions: true,
        leaveDetection: true,
        maxLeaveCount: 3,
        allowViewAfterExam: true
      }
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    ElMessage.error(e.message)
  }
}

const loadPapers = async () => {
  try {
    const res = await paperApi.page({})
    if (res.code === 200) {
      papers.value = res.data.records || res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const isSelfMessage = (senderId) => {
  const userId = userStore.userInfo?.userId || localStorage.getItem('userId')
  return String(senderId) === String(userId)
}

const isExamNotice = (msg) => {
  return msg.content?.startsWith('EXAM_NOTICE|')
}

const parseExamNotice = (content) => {
  if (!content?.startsWith('EXAM_NOTICE|')) return null
  const parts = content.split('|')
  return {
    title: parts[1] || '',
    startTime: parts[2] || '',
    endTime: parts[3] || '',
    duration: parts[4] || '',
    examId: parts[5] || '',
    noticeType: parts[6] || 'PUBLISH'
  }
}

const goToExamList = (msg) => {
  const examInfo = parseExamNotice(msg.content)
  const role = userStore.userInfo?.role || localStorage.getItem('role')
  if (role === 'STUDENT') {
    if (examInfo && examInfo.noticeType === 'START' && examInfo.examId) {
      router.push(`/student/examing/${examInfo.examId}`)
    } else {
      router.push('/student/exams')
    }
  } else {
    router.push('/exams')
  }
}

const loadClassInfo = async () => {
  try {
    const res = await classApi.getClassInfo(classId.value)
    if (res.code === 200) {
      className.value = res.data.className
    }
  } catch (e) {
    console.error(e)
  }
  const role = userStore.userInfo?.role || localStorage.getItem('role')
  isTeacher.value = role === 'TEACHER' || role === 'ADMIN'
}

const loadMembers = async () => {
  try {
    const res = await classApi.getClassMembers(classId.value)
    if (res.code === 200 || res.success) {
      const data = res.data || res.result || []
      members.value = Array.isArray(data) ? data : (data.records || data.list || [])
      memberCount.value = members.value.length
    } else {
      console.error('加载成员失败:', res)
      ElMessage.error(res.message || '加载成员失败')
    }
  } catch (e) {
    console.error('加载成员失败:', e)
    ElMessage.error('加载成员失败')
  }
}

const loadMessages = async () => {
  try {
    const res = await classApi.getMessages(classId.value, 1, 50)
    if (res.code === 200) {
      messages.value = (res.data.records || res.data).reverse()
      scrollToBottom()
    }
  } catch (e) {
    console.error(e)
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  try {
    const userId = userStore.userInfo?.userId || localStorage.getItem('userId')
    if (!userId) {
      ElMessage.error(userStore.t('common.loginFirst'))
      return
    }
    const res = await classApi.sendMessage(classId.value, inputMessage.value, userId)
    if (res.code === 200) {
      messages.value.push(res.data)
      inputMessage.value = ''
      scrollToBottom()
    } else {
      ElMessage.error(res.message || userStore.t('teacher.sendFailed'))
    }
  } catch (e) {
    console.error(e)
    ElMessage.error(userStore.t('teacher.sendFailed'))
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageList.value) {
      messageList.value.scrollTop = messageList.value.scrollHeight
    }
  })
}

const getSenderName = (senderId) => {
  const member = members.value.find(m => m.userId == senderId)
  if (!member) return userStore.t('common.unknownUser')
  return member.realName || member.username || userStore.t('common.unknownUser')
}

const getSenderAvatar = (senderId) => {
  const member = members.value.find(m => m.userId == senderId)
  return member?.avatar || ''
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const getRoleText = (role) => {
  const roleMap = {
    OWNER: userStore.t('teacher.classChat.owner'),
    ADMIN: userStore.t('teacher.classChat.admin'),
    MEMBER: userStore.t('teacher.classChat.member')
  }
  return roleMap[role] || role
}

const goBack = () => {
  router.push('/teacher/my-classes')
}

onMounted(() => {
  loadClassInfo()
  loadMembers()
  loadMessages()
  loadPapers()
})
</script>

<style scoped>
.class-chat {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
}

.member-count {
  color: #999;
  font-size: 14px;
}

.chat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 100px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 12px;
}

.message-item .message-avatar {
  flex-shrink: 0;
}

.message-item .message-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 70%;
}

.message-sender {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #999;
}

.message-bubble {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  word-break: break-word;
}

.message-time {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #ccc;
}

.exam-notice {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  border-radius: 12px;
  padding: 16px;
  color: #fff;
  min-width: 280px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.exam-notice .notice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.exam-notice .notice-icon {
  font-size: 20px;
}

.exam-notice .notice-title {
  font-size: 16px;
  font-weight: bold;
  flex: 1;
}

.exam-notice .notice-badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.exam-notice .notice-info {
  margin-bottom: 12px;
}

.exam-notice .info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 14px;
}

.exam-notice .info-icon {
  font-size: 14px;
}

.exam-notice .notice-action {
  display: flex;
  justify-content: flex-end;
}

.exam-notice .notice-action .el-button {
  background: #fff;
  color: #ff6b6b;
  border: none;
}

.exam-notice .notice-action .el-button:hover {
  background: #f8f9fa;
}

.message-item.is-self {
  flex-direction: row-reverse;
}

.message-item.is-self .message-content-wrapper {
  align-items: flex-end;
}

.message-item.is-self .message-bubble {
  background: #f5222d;
}

.message-item.is-self .message-text {
  color: #fff;
}

.chat-input-wrapper {
  position: fixed;
  bottom: 0;
  left: 200px;
  right: 0;
  background: #fff;
  border-top: 1px solid #eee;
  padding: 16px 24px;
  z-index: 10;
}

.chat-input {
  display: flex;
  gap: 12px;
  width: 100%;
  margin: 0 auto;
}

.members-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  max-width: 80%;
  background: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.panel-header h3 {
  margin: 0;
}

.members-list {
  padding: 16px;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-name {
  font-size: 14px;
}

.member-role {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.member-role.owner {
  background: #f5222d;
  color: #fff;
}

.member-role.admin {
  background: #1890ff;
  color: #fff;
}

.member-role.member {
  background: #f5f5f5;
  color: #666;
}

.mute-status {
  font-size: 12px;
  color: #f5222d;
}
</style>
