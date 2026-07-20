<template>
  <div class="classes">
    <div class="page-header">
      <h2>{{ userStore.t('common.classManage') }}</h2>
      <el-button type="danger" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        {{ userStore.t('common.createClass') }}
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="userStore.t('common.className')">
          <el-input v-model="searchForm.className" :placeholder="userStore.t('common.enterClassName')" style="width: 200px" />
        </el-form-item>
        <el-form-item :label="userStore.t('common.department')">
          <el-select v-model="searchForm.departmentId" :placeholder="userStore.t('common.selectDepartment')" style="width: 200px">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="loadClasses">{{ userStore.t('common.search') }}</el-button>
          <el-button @click="resetSearch">{{ userStore.t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="classes" stripe style="width: 100%">
        <el-table-column prop="id" :label="userStore.t('common.classId')" width="80" />
        <el-table-column prop="className" :label="userStore.t('common.className')" />
        <el-table-column prop="departmentId" :label="userStore.t('common.department')">
          <template #default="{ row }">
            <span v-if="row.departmentId">
              {{ getDepartmentName(row.departmentId) }}
            </span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="inviteCode" :label="userStore.t('common.inviteCode')" width="120">
          <template #default="{ row }">
            <span v-if="row.inviteCode">{{ row.inviteCode }}</span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="studentCount" :label="userStore.t('common.studentCount')" width="100" />
        <el-table-column prop="createTime" :label="userStore.t('common.createTime')" width="180" />
        <el-table-column :label="userStore.t('common.operation')" width="200">
          <template #default="{ row }">
            <el-button type="danger" link @click="openEditDialog(row)">{{ userStore.t('common.edit') }}</el-button>
            <el-button type="danger" link @click="deleteClass(row.id)">{{ userStore.t('common.delete') }}</el-button>
            <el-button type="danger" link @click="manageStudents(row.id)">{{ userStore.t('common.manageStudents') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建/编辑班级对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? userStore.t('common.createClass') : userStore.t('common.editClass')"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item :label="userStore.t('common.className')" prop="className">
          <el-input v-model="form.className" :placeholder="userStore.t('common.enterClassName')" />
        </el-form-item>
        <el-form-item :label="userStore.t('common.department')" prop="departmentId">
          <el-select v-model="form.departmentId" :placeholder="userStore.t('common.selectDepartment')">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ userStore.t('common.cancel') }}</el-button>
          <el-button type="danger" @click="saveClass">{{ userStore.t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 管理学生对话框 -->
    <el-dialog
      v-model="studentDialogVisible"
      :title="userStore.t('common.manageStudents')"
      width="800px"
    >
      <div class="student-management">
        <div class="left-panel">
          <h3>{{ userStore.t('common.notInClass') }}</h3>
          <el-input v-model="studentSearch" :placeholder="userStore.t('common.searchStudent')" class="mb-4" />
          <el-table :data="filteredStudents" stripe style="width: 100%">
            <el-table-column prop="id" :label="userStore.t('common.studentId')" width="120" />
            <el-table-column prop="username" :label="userStore.t('common.username')" />
            <el-table-column prop="realName" :label="userStore.t('common.realName')" />
            <el-table-column :label="userStore.t('common.operation')" width="80">
              <template #default="{ row }">
                <el-button type="danger" link @click="addStudent(row.id)">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="right-panel">
          <h3>{{ userStore.t('common.inClass') }} ({{ classStudents.length }})</h3>
          <el-table :data="classStudents" stripe style="width: 100%">
            <el-table-column prop="id" :label="userStore.t('common.studentId')" width="120" />
            <el-table-column prop="username" :label="userStore.t('common.username')" />
            <el-table-column prop="realName" :label="userStore.t('common.realName')" />
            <el-table-column :label="userStore.t('common.operation')" width="80">
              <template #default="{ row }">
                <el-button type="danger" link @click="removeStudent(row.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="studentDialogVisible = false">{{ userStore.t('common.close') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '../store'
import { classApi, userApi, departmentApi } from '../utils/api'

const userStore = useUserStore()

const classes = ref([])
const departments = ref([])
const total = ref(0)
const page = ref({ current: 1, size: 10 })
const searchForm = ref({ className: '', departmentId: '' })
const dialogVisible = ref(false)
const dialogType = ref('create')
const form = ref({})
const studentDialogVisible = ref(false)
const currentClassId = ref(null)
const students = ref([])
const classStudents = ref([])
const studentSearch = ref('')

const filteredStudents = computed(() => {
  if (!studentSearch.value) return students.value
  return students.value.filter(student => 
    student.realName.toLowerCase().includes(studentSearch.value.toLowerCase()) ||
    student.username.toLowerCase().includes(studentSearch.value.toLowerCase())
  )
})

const loadClasses = async () => {
  try {
    const res = await classApi.page({
      ...page.value,
      ...searchForm.value
    })
    if (res.code === 200) {
      classes.value = res.data.records
      total.value = res.data.total
    }
  } catch (e) {
    console.error(e)
    ElMessage.error(userStore.t('common.loadClassFailed'))
  }
}

const loadDepartments = async () => {
  try {
    const res = await departmentApi.list()
    if (res.code === 200) {
      departments.value = res.data || []
    }
  } catch (e) {
    console.error(e)
  }
}

const getDepartmentName = (id) => {
  if (!id || !departments.value || departments.value.length === 0) {
    return '-'
  }
  const dept = departments.value.find(d => d.id === id)
  return dept?.name || '-'
}

const loadStudents = async () => {
  try {
    const res = await userApi.getStudents()
    if (res.code === 200) {
      students.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const loadClassStudents = async (classId) => {
  try {
    const res = await classApi.getById(classId)
    if (res.code === 200) {
      classStudents.value = res.data.students || []
    }
  } catch (e) {
    console.error(e)
  }
}

const openCreateDialog = () => {
  dialogType.value = 'create'
  form.value = {}
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

const saveClass = async () => {
  try {
    let res
    if (dialogType.value === 'create') {
      const userId = userStore.userInfo?.userId || localStorage.getItem('userId')
      res = await classApi.create(form.value, userId)
    } else {
      res = await classApi.update(form.value)
    }
    if (res.code === 200) {
      ElMessage.success(dialogType.value === 'create' ? userStore.t('common.createClassSuccess') : userStore.t('common.updateClassSuccess'))
      dialogVisible.value = false
      loadClasses()
    }
  } catch (e) {
    console.error(e)
    ElMessage.error(userStore.t('common.operationFailed'))
  }
}

const deleteClass = async (id) => {
  try {
    await ElMessageBox.confirm(userStore.t('common.confirmDeleteClass'), userStore.t('common.tip'))
    const res = await classApi.delete(id)
    if (res.code === 200) {
      ElMessage.success(userStore.t('common.deleteClassSuccess'))
      loadClasses()
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
      ElMessage.error(userStore.t('common.deleteFailed'))
    }
  }
}

const manageStudents = (classId) => {
  currentClassId.value = classId
  studentDialogVisible.value = true
  loadStudents()
  loadClassStudents(classId)
}

const addStudent = async (studentId) => {
  try {
    ElMessage.success(userStore.t('common.addStudentSuccess'))
    loadClassStudents(currentClassId.value)
  } catch (e) {
    console.error(e)
    ElMessage.error(userStore.t('common.addFailed'))
  }
}

const removeStudent = async (studentId) => {
  try {
    ElMessage.success(userStore.t('common.removeStudentSuccess'))
    loadClassStudents(currentClassId.value)
  } catch (e) {
    console.error(e)
    ElMessage.error(userStore.t('common.removeFailed'))
  }
}

const handleSizeChange = (size) => {
  page.value.size = size
  loadClasses()
}

const handleCurrentChange = (current) => {
  page.value.current = current
  loadClasses()
}

const resetSearch = () => {
  searchForm.value = { className: '', departmentId: '' }
  loadClasses()
}

onMounted(() => {
  loadDepartments()
  loadClasses()
})
</script>

<style lang="scss" scoped>
.classes {
  width: 100%;
  max-width: 100%;
  padding: 0 8px;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0 8px;
  
  h2 {
    font-size: clamp(20px, 5vw, 28px);
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.3;
  }
}

.search-form {
  margin-bottom: 0;
}

.filter-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.table-card {
  margin-top: 24px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.student-management {
  display: flex;
  gap: 24px;
  height: 400px;
}

.left-panel,
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.left-panel h3,
.right-panel h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.left-panel .el-table,
.right-panel .el-table {
  flex: 1;
}

.mb-4 {
  margin-bottom: 16px;
}

/* 响应式布局 */
@media screen and (max-width: 992px) {
  .filter-card,
  .table-card {
    padding: 16px;
    overflow-x: auto;
  }
  
  .page-header {
    padding: 0 4px;
  }
}

@media screen and (max-width: 768px) {
  .classes {
    padding: 0 4px;
  }
  
  .page-header {
    padding: 0 4px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .page-header h2 {
    font-size: clamp(18px, 4vw, 24px);
  }
  
  .filter-card {
    padding: 14px;
  }
  
  .table-card {
    padding: 14px;
    margin-top: 16px;
  }
  
  .search-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    :deep(.el-form-item) {
      margin-bottom: 0;
      
      .el-input,
      .el-select {
        width: 100%;
      }
    }
  }
  
  .student-management {
    flex-direction: column;
    height: auto;
    max-height: 500px;
    
    .left-panel,
    .right-panel {
      height: 200px;
    }
  }
}

@media screen and (max-width: 576px) {
  .filter-card {
    padding: 12px;
  }
  
  .table-card {
    padding: 12px;
  }
  
  .student-management {
    gap: 16px;
    
    .left-panel,
    .right-panel {
      height: 180px;
    }
  }
}

@media screen and (max-width: 360px) {
  .filter-card {
    padding: 10px;
  }
  
  .table-card {
    padding: 10px;
  }
  
  .student-management {
    gap: 12px;
    
    .left-panel h3,
    .right-panel h3 {
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .left-panel,
    .right-panel {
      height: 160px;
    }
  }
}
</style>