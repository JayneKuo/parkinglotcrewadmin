<template>
  <div class="rfid-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <div class="search-header">
        <div class="search-form">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="Search by tag ID/plate/driver" 
            clearable
            :prefix-icon="Search"
            style="width: 300px"
          />
          <el-select v-model="searchForm.status" placeholder="Status" clearable>
            <el-option
              v-for="status in rfidStatus"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            >
              <el-tag :type="getStatusType(status.value)" size="small">
                {{ status.label }}
              </el-tag>
            </el-option>
          </el-select>
          <div class="search-buttons">
            <el-button type="primary" @click="handleSearch">Search</el-button>
            <el-button @click="handleReset">Reset</el-button>
          </div>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>Add RFID
        </el-button>
      </div>
    </el-card>

    <!-- 列表区域 -->
    <el-card class="list-card">
      <el-table :data="rfidList" border stripe>
        <el-table-column prop="tagId" label="Tag ID" width="150" />
        <el-table-column prop="vehiclePlate" label="Vehicle Plate" width="120" />
        <el-table-column prop="driverName" label="Driver" width="150" />
        
        <el-table-column label="Status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Validity Period" min-width="200">
          <template #default="{ row }">
            <div>{{ row.bindTime }} ~ {{ row.expireTime }}</div>
            <div v-if="row.lastUsed" class="last-used">
              Last used: {{ row.lastUsed }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="notes" label="Notes" min-width="150" />

        <el-table-column label="Actions" width="70" fixed="right" align="center">
          <template #default="{ row }">
            <el-dropdown trigger="hover" @command="(command: string) => handleCommand(command, row)">
              <el-button type="primary" link>
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>Edit
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="row.status === 'active'"
                    command="deactivate"
                    divided
                  >
                    <el-icon><CircleClose /></el-icon>Deactivate
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="delete"
                    class="danger"
                  >
                    <el-icon><Delete /></el-icon>Delete
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- RFID表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? 'Add RFID' : 'Edit RFID'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="rfidForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="Tag ID" prop="tagId">
          <el-input v-model="rfidForm.tagId" placeholder="Enter RFID tag ID" />
        </el-form-item>
        <el-form-item label="Vehicle" prop="vehiclePlate">
          <el-input v-model="rfidForm.vehiclePlate" placeholder="Enter vehicle plate" />
        </el-form-item>
        <el-form-item label="Driver" prop="driverName">
          <el-input v-model="rfidForm.driverName" placeholder="Enter driver name" />
        </el-form-item>
        <el-form-item label="Expire Date" prop="expireTime">
          <el-date-picker
            v-model="rfidForm.expireTime"
            type="date"
            placeholder="Select expire date"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <el-form-item label="Notes">
          <el-input
            v-model="rfidForm.notes"
            type="textarea"
            placeholder="Enter notes"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Plus, Edit, Delete, More, Search,
  CircleClose 
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { RFID, RFIDStatus } from '@/types/rfid'
import { 
  mockRFIDResponse, mockCreateRFID,
  mockUpdateRFID, mockDeleteRFID 
} from '@/mock/rfid'

// 搜索表单
const searchForm = ref({
  keyword: '',
  status: ''
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// RFID列表
const rfidList = ref<RFID[]>([])

// 状态选项
const rfidStatus = [
  { label: 'Active', value: 'active' as const },
  { label: 'Inactive', value: 'inactive' as const },
  { label: 'Lost', value: 'lost' as const }
]

// 对话框控制
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 表单数据
const rfidForm = ref<Partial<RFID>>({
  tagId: '',
  vehiclePlate: '',
  driverName: '',
  expireTime: '',
  notes: ''
})

// 表单验证规则
const rules = {
  tagId: [
    { required: true, message: 'Please enter tag ID', trigger: 'blur' }
  ],
  vehiclePlate: [
    { required: true, message: 'Please enter vehicle plate', trigger: 'blur' }
  ],
  driverName: [
    { required: true, message: 'Please enter driver name', trigger: 'blur' }
  ],
  expireTime: [
    { required: true, message: 'Please select expire date', trigger: 'change' }
  ]
}

// 获取状态样式
const getStatusType = (status: RFIDStatus) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'info'
    case 'lost':
      return 'danger'
    default:
      return 'info'
  }
}

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 加载RFID列表
const loadRFIDs = async () => {
  try {
    const data = mockRFIDResponse({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    
    rfidList.value = data.items
    total.value = data.total
  } catch (error) {
    ElMessage.error('Failed to load RFIDs')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadRFIDs()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: ''
  }
  handleSearch()
}

// 添加RFID
const handleAdd = () => {
  dialogType.value = 'add'
  rfidForm.value = {
    tagId: '',
    vehiclePlate: '',
    driverName: '',
    expireTime: '',
    notes: ''
  }
  dialogVisible.value = true
}

// 编辑RFID
const handleEdit = (row: RFID) => {
  dialogType.value = 'edit'
  rfidForm.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await mockCreateRFID(rfidForm.value)
          ElMessage.success('RFID added successfully')
        } else {
          await mockUpdateRFID(rfidForm.value.id!, rfidForm.value)
          ElMessage.success('RFID updated successfully')
        }
        dialogVisible.value = false
        loadRFIDs()
      } catch (error) {
        ElMessage.error('Operation failed')
      }
    }
  })
}

// 停用RFID
const handleDeactivate = async (row: RFID) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to deactivate this RFID?',
      'Warning',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    await mockUpdateRFID(row.id, { status: 'inactive' })
    ElMessage.success('RFID deactivated successfully')
    loadRFIDs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to deactivate RFID')
    }
  }
}

// 删除RFID
const handleDelete = async (row: RFID) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to delete this RFID?',
      'Warning',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    await mockDeleteRFID(row.id)
    ElMessage.success('RFID deleted successfully')
    loadRFIDs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete RFID')
    }
  }
}

// 统一的命令处理函数
const handleCommand = (command: string, row: RFID) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'deactivate':
      handleDeactivate(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadRFIDs()
}

// 页码改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadRFIDs()
}

// 初始加载
loadRFIDs()
</script>

<style scoped lang="scss">
.rfid-container {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
}

.search-card {
  margin-bottom: 20px;
  
  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .search-form {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .search-buttons {
      margin-left: 12px;
    }
  }
}

.list-card {
  .el-table {
    margin: -20px;
    margin-bottom: 0;
  }
}

.last-used {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-width: 120px;
  
  .el-icon {
    margin-right: 4px;
  }

  &.danger {
    color: var(--el-color-danger);
  }
}
</style>
