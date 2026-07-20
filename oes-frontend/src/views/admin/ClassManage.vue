<template>
  <div class="class-manage">
    <div class="page-header">
      <h2>{{ userStore.t('admin.classManagement') }}</h2>
      <p>{{ userStore.t('admin.classManagementDesc') }}</p>
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="search-row">
          <el-select v-model="params.departmentId" :placeholder="userStore.t('admin.selectDepartment')" style="width: 180px" clearable @change="loadData">
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
          <el-input v-model="params.keyword" :placeholder="userStore.t('admin.searchClass')" style="width: 200px" clearable @change="loadData" />
          <el-button type="danger" @click="loadData">{{ userStore.t('common.search') }}</el-button>
        </div>
        <div class="action-row">
          <el-button type="danger" @click="handleCreate">{{ userStore.t('admin.createClass') }}</el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" :label="userStore.t('common.id')" width="80" />
        <el-table-column prop="className" :label="userStore.t('admin.className')" />
        <el-table-column prop="code" :label="userStore.t('admin.classCode')" width="150" />
        <el-table-column prop="inviteCode" :label="userStore.t('admin.inviteCode')" width="120">
          <template #default="{ row }">
            <span v-if="row.inviteCode">{{ row.inviteCode }}</span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="departmentId" :label="userStore.t('admin.department')" width="180">
          <template #default="{ row }">
            {{ getDepartmentName(row.departmentId) }}
          </template>
        </el-table-column>
        <el-table-column prop="grade" :label="userStore.t('admin.grade')" width="120" />
        <el-table-column :label="userStore.t('common.operation')" width="200">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleEdit(row)">{{ userStore.t('common.edit') }}</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? userStore.t('admin.editClass') : userStore.t('admin.createClass')" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="userStore.t('admin.className')" prop="className">
          <el-input v-model="form.className" :placeholder="userStore.t('admin.enterClassName')" />
        </el-form-item>
        <el-form-item :label="userStore.t('admin.classCode')" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item :label="userStore.t('admin.department')" prop="departmentId">
          <el-select v-model="form.departmentId" style="width: 100%">
            <el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="userStore.t('admin.grade')" prop="grade">
          <el-input v-model="form.grade" :placeholder="userStore.t('admin.enterGrade')" />
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
import { classApi, departmentApi } from '../../utils/api'
import { useUserStore } from '../../store'

const userStore = useUserStore()

const loading = ref(false)
const tableData = ref([])
const departments = ref([])
const current = ref(1)
const size = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const params = reactive({ departmentId: null, keyword: '' })
const form = reactive({ id: null, className: '', code: '', departmentId: null, grade: '' })
const rules = { className: [{ required: true, message: userStore.t('admin.enterClassName'), trigger: 'blur' }] }

const getDepartmentName = (id) => departments.value.find(d => d.id === id)?.name || ''

const loadData = async () => {
  loading.value = true
  try {
    const res = await classApi.page({ current: current.value, size: size.value, ...params })
    if (res.code === 200) { tableData.value = res.data.records; total.value = res.data.total }
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const loadDepartments = async () => {
  const res = await departmentApi.list()
  if (res.code === 200) departments.value = res.data
}

const handleCreate = () => {
  isEdit.value = false
  const code = 'CLS' + Math.floor(Math.random() * 90000000 + 10000000)
  Object.assign(form, { id: null, className: '', code: code, departmentId: null, grade: '' })
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
    const res = isEdit.value ? await classApi.update(form) : await classApi.create(form)
    if (res.code === 200) { ElMessage.success(userStore.t('common.success')); dialogVisible.value = false; loadData() }
    else ElMessage.error(res.message || userStore.t('common.failed'))
  } catch (e) { ElMessage.error(e.message || userStore.t('common.failed')) }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(userStore.t('admin.confirmDeleteClass'))
  try {
    const res = await classApi.delete(row.id)
    if (res.code === 200) { ElMessage.success(userStore.t('common.success')); loadData() }
  } catch (e) { ElMessage.error(e.message || userStore.t('common.failed')) }
}

onMounted(() => { loadData(); loadDepartments() })
</script>

<style lang="scss" scoped>
.class-manage {
  width: 100%;
  max-width: 100%;
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

.search-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  position: sticky;
  top: 24px;
  z-index: 100;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: -20px -20px 20px;
}

.action-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

@media screen and (max-width: 768px) {
  .card {
    padding: 14px;
    overflow-x: auto;
  }

  .search-row {
    margin: -14px -14px 16px;
    padding: 14px;
    flex-wrap: nowrap;

    .el-select {
      flex: 0 0 auto;
      width: auto !important;
      min-width: 100px;
    }

    .el-input {
      flex: 1;
      min-width: 0;
      width: auto !important;
    }

    .el-button {
      flex: 0 0 auto;
      white-space: nowrap;
    }
  }

  .action-row {
    flex-wrap: nowrap;
  }
}

@media screen and (max-width: 576px) {
  .card {
    padding: 12px;
  }

  .search-row {
    margin: -12px -12px 14px;
    padding: 12px;
  }
}

@media screen and (max-width: 360px) {
  .card {
    padding: 10px;
  }

  .search-row {
    margin: -10px -10px 12px;
    padding: 10px;
  }
}
</style>
