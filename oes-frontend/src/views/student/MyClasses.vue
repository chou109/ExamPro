<template>
  <div class="my-classes">
    <div class="page-header">
      <h2>班级消息</h2>
      <p>查看班级最新动态</p>
    </div>

    <el-card class="join-card">
      <div class="join-form">
        <el-input 
          v-model="inviteCode" 
          placeholder="请输入班级群号" 
          class="join-input"
          @keyup.enter="handleJoin"
        />
        <el-button type="danger" @click="handleJoin">加入班级</el-button>
      </div>
    </el-card>

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
            <span>群号：{{ item.class.inviteCode }}</span>
            <span>角色：{{ getRoleText(item.role) }}</span>
          </div>
        </div>
        <el-icon class="class-message-arrow"><ArrowRight /></el-icon>
      </div>
    </div>

    <el-empty v-if="classList.length === 0" description="暂无班级，输入群号加入班级吧" />
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
const inviteCode = ref('')
const classList = ref([])

const loadClasses = async () => {
  try {
    const userId = userStore.userInfo?.userId || localStorage.getItem('userId')
    if (!userId) {
      ElMessage.error('请先登录')
      return
    }
    const res = await classApi.getMyClasses(userId)
    if (res.code === 200) {
      classList.value = res.data
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('加载班级列表失败')
  }
}

const handleJoin = async () => {
  if (!inviteCode.value.trim()) {
    ElMessage.warning('请输入班级群号')
    return
  }
  
  try {
    const userId = userStore.userInfo?.userId || localStorage.getItem('userId')
    if (!userId) {
      ElMessage.error('请先登录')
      return
    }
    const res = await classApi.joinByCode(inviteCode.value, userId)
    if (res.code === 200) {
      ElMessage.success('加入班级成功')
      inviteCode.value = ''
      loadClasses()
    } else {
      ElMessage.error(res.message || '加入班级失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('加入班级失败')
  }
}

const enterClass = (classId) => {
  router.push(`/student/class/${classId}`)
}

const getRoleText = (role) => {
  const roleMap = {
    OWNER: '所有者',
    ADMIN: '管理员',
    MEMBER: '普通成员'
  }
  return roleMap[role] || role
}

const getMessageText = (cls) => {
  if (!cls || !cls.lastMessage) return '暂无消息'
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
    return '🚀 ' + title + ' 开始考试'
  } else if (noticeType === 'PUBLISH') {
    return '📢 ' + title + ' 发布通知'
  } else if (noticeType === 'END') {
    return '🔚 ' + title + ' 考试结束'
  }
  return '📝 ' + title
}

const getTimeText = (time) => {
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
  width: 100%;
  max-width: 100%;
  padding: 0 8px;
  box-sizing: border-box;
}

.page-header {
  padding: 0 8px;
  margin-bottom: 20px;
  
  h2 {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  p {
    font-size: 14px;
    color: #666;
  }
}

.join-card {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  
  :deep(.el-card__body) {
    padding: 0;
  }
}

.join-form {
  display: flex;
  gap: 12px;
}

.join-input {
  flex: 1;
}

.class-message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.class-message-card {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f8fafc;
    transform: translateX(4px);
  }
  
  .class-message-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 20px;
    flex-shrink: 0;
  }
  
  .class-message-info {
    flex: 1;
    min-width: 0;
    
    .class-message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .class-message-name {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }
      
      .class-message-time {
        font-size: 13px;
        color: #94a3b8;
        flex-shrink: 0;
        margin-left: 16px;
      }
    }
    
    .class-message-content {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.4;
    }
    
    .class-message-meta {
      display: flex;
      gap: 16px;
      
      span {
        font-size: 13px;
        color: #94a3b8;
      }
    }
  }
  
  .class-message-arrow {
    color: #94a3b8;
    margin-left: 12px;
    flex-shrink: 0;
  }
}

@media screen and (max-width: 768px) {
  .my-classes {
    padding: 0 4px;
  }
  
  .page-header {
    padding: 0 4px;
  }
  
  .join-card {
    padding: 14px;
  }
  
  .class-message-card {
    padding: 16px;
    
    .class-message-icon {
      width: 48px;
      height: 48px;
      margin-right: 16px;
    }
    
    .class-message-name {
      font-size: 15px;
    }
    
    .class-message-content {
      font-size: 13px;
    }
    
    .class-message-meta {
      gap: 12px;
      
      span {
        font-size: 12px;
      }
    }
  }
}

@media screen and (max-width: 576px) {
  .join-card {
    padding: 12px;
  }
  
  .class-message-card {
    padding: 14px;
    
    .class-message-icon {
      width: 44px;
      height: 44px;
      margin-right: 14px;
    }
    
    .class-message-name {
      font-size: 14px;
    }
    
    .class-message-time {
      font-size: 12px;
    }
  }
}

@media screen and (max-width: 360px) {
  .join-card {
    padding: 10px;
  }
  
  .class-message-card {
    padding: 12px;
    
    .class-message-icon {
      width: 40px;
      height: 40px;
      margin-right: 12px;
    }
    
    .class-message-name {
      font-size: 13px;
    }
    
    .class-message-content {
      font-size: 12px;
    }
    
    .class-message-meta span {
      font-size: 11px;
    }
  }
}
</style>