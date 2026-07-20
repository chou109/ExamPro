<template>
  <div class="user-manage">
    <div class="page-header">
      <h2>{{ userStore.t('admin.userManagement') }}</h2>
      <p>{{ userStore.t('admin.userManagementDesc') }}</p>
    </div>

    <div class="card">
      <div class="toolbar">
        <el-input v-model="keyword" :placeholder="userStore.t('admin.searchUsernameOrName')" style="width: 240px" clearable />
        <el-select v-model="role" :placeholder="userStore.t('common.selectRole')" style="width: 140px" clearable>
          <el-option :label="userStore.t('common.student')" value="STUDENT" />
          <el-option :label="userStore.t('common.teacher')" value="TEACHER" />
          <el-option :label="userStore.t('common.admin')" value="ADMIN" />
        </el-select>
        <el-button type="danger" @click="loadData">{{ userStore.t('common.search') }}</el-button>
        <el-button type="danger" @click="handleCreate">{{ userStore.t('admin.createUser') }}</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" :label="userStore.t('common.id')" width="80" />
        <el-table-column prop="username" :label="userStore.t('admin.username')" />
        <el-table-column prop="realName" :label="userStore.t('admin.realName')" />
        <el-table-column prop="role" :label="userStore.t('common.role')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : row.role === 'TEACHER' ? 'warning' : 'success'">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" :label="userStore.t('admin.email')" />
        <el-table-column prop="phone" :label="userStore.t('admin.phone')" />
        <el-table-column prop="status" :label="userStore.t('common.status')" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? userStore.t('admin.normal') : userStore.t('admin.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="userStore.t('admin.createTime')" width="180" />
        <el-table-column :label="userStore.t('common.operation')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleEdit(row)">{{ userStore.t('common.edit') }}</el-button>
            <el-button type="danger" link @click="handleStatus(row)">
              {{ row.status === 1 ? userStore.t('admin.disable') : userStore.t('admin.enable') }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ userStore.t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="current"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? userStore.t('admin.editUser') : userStore.t('admin.createUser')" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="userStore.t('admin.username')" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item :label="userStore.t('admin.realName')" prop="realName">
          <el-input v-model="form.realName" />
        </el-form-item>
        <el-form-item :label="userStore.t('common.role')" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option :label="userStore.t('common.student')" value="STUDENT" />
            <el-option :label="userStore.t('common.teacher')" value="TEACHER" />
            <el-option :label="userStore.t('common.admin')" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item :label="userStore.t('admin.password')" :prop="isEdit ? '' : 'password'">
          <el-input v-model="form.password" type="password" show-password :placeholder="isEdit ? userStore.t('admin.leaveBlankNoChange') : ''" />
        </el-form-item>
        <el-form-item :label="userStore.t('admin.email')" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item :label="userStore.t('admin.phone')" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ userStore.t('common.cancel') }}</el-button>
        <el-button type="danger" @click="handleSubmit">{{ userStore.t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '../../utils/api'
import { useUserStore } from '../../store'

const userStore = useUserStore()

const keyword = ref('')
const role = ref('')
const current = ref(1)
const size = ref(10)
const total = ref(0)
const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const router = useRouter()
const route = useRoute()

const form = reactive({
  id: null,
  username: '',
  realName: '',
  role: 'STUDENT',
  password: '',
  email: '',
  phone: ''
})

const handleRouteChange = () => {
  const routeRole = route.query.role
  if (routeRole && (routeRole === 'STUDENT' || routeRole === 'TEACHER')) {
    role.value = routeRole
    current.value = 1
    loadData()
  }
}

const getRoleText = (role) => {
  const roleMap = {
    ADMIN: userStore.t('common.admin'),
    TEACHER: userStore.t('common.teacher'),
    STUDENT: userStore.t('common.student')
  }
  return roleMap[role] || role
}

const rules = {
  username: [{ required: true, message: userStore.t('admin.enterUsername'), trigger: 'blur' }],
  realName: [{ required: true, message: userStore.t('admin.enterRealName'), trigger: 'blur' }],
  role: [{ required: true, message: userStore.t('common.selectRole'), trigger: 'change' }],
  password: [{ required: true, message: userStore.t('admin.enterPassword'), trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await userApi.page({ current: current.value, size: size.value, keyword: keyword.value, role: role.value })
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  isEdit.value = false
  Object.assign(form, { id: null, username: '', realName: '', role: 'STUDENT', password: '', email: '', phone: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  form.password = ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    const res = isEdit.value ? await userApi.update(form) : await userApi.create(form)
    if (res.code === 200) {
      ElMessage.success(userStore.t('common.success'))
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res.message || userStore.t('common.failed'))
    }
  } catch (e) {
    ElMessage.error(e.message || userStore.t('common.failed'))
  }
}

const handleStatus = async (row) => {
  await ElMessageBox.confirm(row.status === 1 ? userStore.t('admin.confirmDisable') : userStore.t('admin.confirmEnable'))
  try {
    const res = await userApi.changeStatus(row.id, row.status === 1 ? 0 : 1)
    if (res.code === 200) {
      ElMessage.success(userStore.t('common.success'))
      loadData()
    }
  } catch (e) {
    ElMessage.error(e.message || userStore.t('common.failed'))
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(userStore.t('admin.confirmDeleteUser'))
  try {
    const res = await userApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success(userStore.t('common.success'))
      loadData()
    }
  } catch (e) {
    ElMessage.error(e.message || userStore.t('common.failed'))
  }
}

onMounted(() => {
  handleRouteChange()
  loadData()
  router.afterEach(handleRouteChange)
})

onUnmounted(() => {
  router.afterEach(() => {})
})
</script>

<style lang="scss" scoped>
.user-manage {
  width: 100%;
  max-width: 100%;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar .el-input,
  .toolbar .el-select {
    width: 100%;
  }
  
  .toolbar .el-button {
    width: 100%;
  }
}

@media screen and (max-width: 576px) {
  .toolbar {
    gap: 10px;
  }
}
</style>
