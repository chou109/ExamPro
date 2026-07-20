<template>
  <div class="my-classes">
    <div class="page-header">
      <h2>{{ userStore.t('common.messages') }}</h2>
      <p>{{ userStore.t('teacher.viewLatest') }}</p>
    </div>

    <div class="class-message-list" v-if="classList.length > 0">
      <div 
        v-for="item in classList" 
        :key="item.class.id" 
        class="class-message-card"
        @click="enterClass(item.class.id)"
      >
        <div class="class-message-icon">
          <el-icon :size="36"><OfficeBuilding /></el-icon>
        </div>
        <div class="class-message-info">
          <div class="class-message-header">
            <span class="class-message-name">{{ item.class.className }}</span>
            <span class="class-message-time">{{ getTimeText(item.class.lastMessageTime) }}</span>
          </div>
          <p class="class-message-content">{{ getMessageText(item.class) }}</p>
          <div class="class-message-meta">
            <span>{{ userStore.t('common.inviteCode') }}：{{ item.class.inviteCode }}</span>
            <span>{{ userStore.t('common.role') }}：{{ getRoleText(item.role) }}</span>
          </div>
        </div>
        <el-icon class="class-message-arrow"><ArrowRight /></el-icon>
      </div>
    </div>

    <el-empty v-if="classList.length === 0" :description="userStore.t('teacher.noClasses')" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { OfficeBuilding, ArrowRight } from '@element-plus/icons-vue'
import { useUserStore } from '../../store'
import { classApi } from '../../utils/api'

const router = useRouter()
const userStore = useUserStore()
const classList = ref([])

const loadClasses = async () => {
  try {
    const userId = userStore.userInfo?.userId || localStorage.getItem('userId')
    if (!userId) {
      ElMessage.error(userStore.t('common.loginFirst'))
      return
    }
    const res = await classApi.getMyClasses(userId)
    if (res.code === 200) {
      classList.value = res.data
    }
  } catch (e) {
    console.error(e)
    ElMessage.error(userStore.t('teacher.loadClassesFailed'))
  }
}

const enterClass = (classId) => {
  router.push(`/teacher/class/${classId}`)
}

const getRoleText = (role) => {
  const roleMap = {
    OWNER: userStore.t('teacher.classOwner'),
    ADMIN: userStore.t('teacher.admin'),
    MEMBER: userStore.t('teacher.member'),
    CREATOR: userStore.t('teacher.classOwner'),
    TEACHER: userStore.t('teacher.teacher'),
    STUDENT: userStore.t('teacher.student')
  }
  return roleMap[role] || role
}

const getMessageText = (cls) => {
  if (!cls || !cls.lastMessage) return userStore.t('common.noData')
  if (cls.lastMessage.startsWith('EXAM_NOTICE|')) {
    return parseExamNotice(cls.lastMessage)
  }
  return cls.lastMessage
}

const parseExamNotice = (content) => {
  if (!content || !content.startsWith('EXAM_NOTICE|')) return ''
  const parts = content.split('|')
  const noticeType = parts[1] || ''
  const title = parts[2] || ''
  if (noticeType === 'START') {
    return '🚀 ' + title + ' ' + userStore.t('teacher.examStarted')
  } else if (noticeType === 'PUBLISH') {
    return '📢 ' + title + ' ' + userStore.t('teacher.examPublished')
  } else if (noticeType === 'END') {
    return '🔚 ' + title + ' ' + userStore.t('common.finished')
  }
  return '📝 ' + title
}

const getTimeText = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return userStore.t('teacher.justNow')
  if (diff < 3600000) return Math.floor(diff / 60000) + (userStore.language === 'zh' ? userStore.t('common.minutes') + userStore.t('teacher.ago') : userStore.t('teacher.minutesAgo'))
  if (diff < 86400000) return Math.floor(diff / 3600000) + (userStore.language === 'zh' ? userStore.t('common.hours') + userStore.t('teacher.ago') : userStore.t('teacher.hoursAgo'))
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
  loadClasses()
})
</script>

<style scoped>
.my-classes {
  width: 100%;
  max-width: 100%;
  padding: 0 8px;
  box-sizing: border-box;
}

.page-header {
  padding: 0 8px;
  margin-bottom: 20px;
  
  h2 {
    font-size: clamp(20px, 5vw, 28px);
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.3;
  }
  
  p {
    margin-top: 6px;
    font-size: clamp(13px, 3vw, 14px);
    color: #64748b;
    line-height: 1.5;
  }
}

.class-message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.class-message-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.class-message-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-radius: 14px;
  color: #fff;
  flex-shrink: 0;
}

.class-message-info {
  flex: 1;
  margin-left: 20px;
  min-width: 0;
}

.class-message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.class-message-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.class-message-time {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
  margin-left: 12px;
}

.class-message-content {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}

.class-message-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.class-message-arrow {
  color: #cbd5e1;
  margin-left: 16px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .class-message-card {
    padding: 16px;
  }
  
  .class-message-icon {
    width: 52px;
    height: 52px;
  }
  
  .class-message-info {
    margin-left: 16px;
  }
  
  .class-message-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>