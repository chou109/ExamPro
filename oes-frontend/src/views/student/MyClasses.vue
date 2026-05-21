<template>
  <div class="my-classes">
    <div class="page-header">
      <h2>我的班级</h2>
      <p>查看和管理您加入的班级</p>
    </div>

    <el-card class="join-card">
      <div class="join-form">
        <el-input 
          v-model="inviteCode" 
          placeholder="请输入班级群号" 
          style="width: 300px"
          @keyup.enter="handleJoin"
        />
        <el-button type="danger" @click="handleJoin">加入班级</el-button>
      </div>
    </el-card>

    <div class="class-list">
      <el-card 
        v-for="item in classList" 
        :key="item.class.id" 
        class="class-card"
        @click="enterClass(item.class.id)"
      >
        <div class="class-info">
          <h3>{{ item.class.className }}</h3>
          <p class="class-code">群号：{{ item.class.inviteCode }}</p>
          <p class="class-role">角色：{{ getRoleText(item.role) }}</p>
        </div>
        <div class="class-actions">
          <el-button type="danger" size="small">进入班级</el-button>
        </div>
      </el-card>
    </div>

    <el-empty v-if="classList.length === 0" description="暂无班级，输入群号加入班级吧" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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

onMounted(() => {
  loadClasses()
})
</script>

<style scoped>
.join-card {
  margin-bottom: 24px;
}

.join-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.class-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.class-card {
  cursor: pointer;
  transition: all 0.3s;
}

.class-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.class-info {
  flex: 1;
}

.class-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.class-code {
  margin: 0 0 4px 0;
  color: #666;
  font-size: 14px;
}

.class-role {
  margin: 0;
  color: #1890ff;
  font-size: 14px;
}

.class-actions {
  display: flex;
  align-items: center;
}
</style>