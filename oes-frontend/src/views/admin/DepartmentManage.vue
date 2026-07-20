<template>
  <div class="department-manage">
    <div class="page-header">
      <h2>{{ userStore.t('admin.departmentManagement') }}</h2>
      <p>{{ userStore.t('admin.departmentManagementDesc') }}</p>
    </div>

    <div class="card">
      <div class="toolbar">
        <el-button type="danger" @click="handleCreate">{{ userStore.t('admin.createDepartment') }}</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe row-key="id" default-expand-all>
        <el-table-column prop="name" :label="userStore.t('admin.departmentName')" />
        <el-table-column prop="code" :label="userStore.t('admin.departmentCode')" width="150" />
        <el-table-column prop="sortOrder" :label="userStore.t('admin.sortOrder')" width="100" />
        <el-table-column :label="userStore.t('common.operation')" width="200">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleEdit(row)">{{ userStore.t('common.edit') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ userStore.t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? userStore.t('admin.editDepartment') : userStore.t('admin.createDepartment')" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="userStore.t('admin.departmentName')" prop="name">
          <el-input v-model="form.name" :placeholder="userStore.t('admin.enterDepartmentName')" />
        </el-form-item>
        <el-form-item :label="userStore.t('admin.departmentCode')" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item v-if="isEdit" :label="userStore.t('admin.sortOrder')">
          <el-input-number v-model="form.sortOrder" :min="0" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { departmentApi } from '../../utils/api'
import { useUserStore } from '../../store'

const userStore = useUserStore()

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({ id: null, name: '', code: '', sortOrder: 0 })
const rules = { name: [{ required: true, message: userStore.t('admin.enterDepartmentName'), trigger: 'blur' }] }

const loadData = async () => {
  loading.value = true
  try {
    const res = await departmentApi.tree()
    if (res.code === 200) tableData.value = res.data
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const handleCreate = () => {
  isEdit.value = false
  Object.assign(form, { id: null, name: '', code: '', sortOrder: 0 })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    const res = isEdit.value ? await departmentApi.update(form) : await departmentApi.create(form)
    if (res.code === 200) { ElMessage.success(userStore.t('common.success')); dialogVisible.value = false; loadData() }
    else ElMessage.error(res.message || userStore.t('common.failed'))
  } catch (e) { ElMessage.error(e.message || userStore.t('common.failed')) }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(userStore.t('admin.confirmDeleteDepartment'))
  try {
    const res = await departmentApi.delete(row.id)
    if (res.code === 200) { ElMessage.success(userStore.t('common.success')); loadData() }
  } catch (e) { ElMessage.error(e.message || userStore.t('common.failed')) }
}

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.department-manage {
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

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.toolbar {
  margin-bottom: 20px;
}

/* 响应式布局 */
@media screen and (max-width: 992px) {
  .card {
    padding: 16px;
    overflow-x: auto;
  }
}

@media screen and (max-width: 768px) {
  .department-manage {
    padding: 0 4px;
  }
  
  .page-header {
    padding: 0 4px;
  }
  
  .card {
    padding: 14px;
  }
}

@media screen and (max-width: 576px) {
  .card {
    padding: 12px;
  }
}

@media screen and (max-width: 360px) {
  .card {
    padding: 10px;
  }
}
</style>
