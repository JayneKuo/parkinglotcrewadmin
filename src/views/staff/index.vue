<template>
  <div class="staff-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="Name">
        <el-input v-model="searchForm.name" placeholder="Enter name" />
      </el-form-item>
      <el-form-item label="Phone">
        <el-input v-model="searchForm.phone" placeholder="Enter phone" />
      </el-form-item>
      <el-form-item label="Role">
        <el-select v-model="searchForm.role" placeholder="Select role" clearable>
          <el-option label="All Roles" value="" />
          <el-option 
            v-for="(label, value) in roleOptions" 
            :key="value" 
            :label="label" 
            :value="value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Status">
        <el-select v-model="searchForm.status" placeholder="Select status" clearable>
          <el-option label="All Status" value="" />
          <el-option 
            v-for="(label, value) in statusOptions" 
            :key="value" 
            :label="label" 
            :value="value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Shift">
        <el-select v-model="searchForm.workShift" placeholder="Select shift" clearable>
          <el-option label="All Shifts" value="" />
          <el-option 
            v-for="(label, value) in shiftOptions" 
            :key="value" 
            :label="label" 
            :value="value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Parking Lot">
        <el-select v-model="searchForm.parkingLotId" placeholder="Select parking lot" clearable>
          <el-option label="All Parking Lots" value="" />
          <el-option
            v-for="lot in parkingLots"
            :key="lot.id"
            :label="lot.name"
            :value="lot.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">Search</el-button>
        <el-button @click="handleReset">Reset</el-button>
        <el-button type="success" @click="handleAdd">Add Staff</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="staffList" border style="width: 100%; margin-top: 20px;">
      <el-table-column type="expand">
        <template #default="{ row }">
          <el-form label-position="left" inline class="staff-detail">
            <el-form-item label="Email">
              <span>{{ row.email || 'N/A' }}</span>
            </el-form-item>
            <el-form-item label="Emergency Contact">
              <span v-if="row.emergencyContact">
                {{ row.emergencyContact.name }} ({{ row.emergencyContact.relationship }})
                - {{ row.emergencyContact.phone }}
              </span>
              <span v-else>N/A</span>
            </el-form-item>
            <el-form-item label="Last Login">
              <span>{{ row.lastLoginTime || 'N/A' }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" width="120" />
      <el-table-column prop="phone" label="Phone" width="120" />
      <el-table-column prop="role" label="Role" width="100">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)">
            {{ formatRole(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="parkingLotName" label="Parking Lot" />
      <el-table-column prop="workShift" label="Shift" width="100">
        <template #default="{ row }">
          <el-tag :type="getShiftTagType(row.workShift)">
            {{ formatShift(row.workShift) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="joinDate" label="Join Date" width="120" />
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ formatStatus(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">Edit</el-button>
          <el-button type="success" link @click="handleResetPassword(row)">Reset Password</el-button>
          <el-dropdown>
            <el-button link type="primary">
              More<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleStatusChange(row, 'active')">Set Active</el-dropdown-item>
                <el-dropdown-item @click="handleStatusChange(row, 'leave')">Set Leave</el-dropdown-item>
                <el-dropdown-item @click="handleStatusChange(row, 'suspended')" divided>Suspend</el-dropdown-item>
                <el-dropdown-item @click="handleStatusChange(row, 'inactive')" divided>
                  <span style="color: #F56C6C;">Set Inactive</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 员工表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? 'Add Staff' : 'Edit Staff'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-select v-model="form.role">
            <el-option label="Admin" value="admin" />
            <el-option label="Manager" value="manager" />
            <el-option label="Operator" value="operator" />
            <el-option label="Valet" value="valet" />
            <el-option label="Security" value="security" />
          </el-select>
        </el-form-item>
        <el-form-item label="Parking Lot" prop="parkingLotId">
          <el-select v-model="form.parkingLotId">
            <el-option
              v-for="item in parkingLots"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Work Shift" prop="workShift">
          <el-select v-model="form.workShift">
            <el-option label="Morning" value="morning" />
            <el-option label="Afternoon" value="afternoon" />
            <el-option label="Night" value="night" />
          </el-select>
        </el-form-item>
        <el-form-item label="Join Date" prop="joinDate">
          <el-date-picker v-model="form.joinDate" type="date" />
        </el-form-item>
        <el-divider>Emergency Contact</el-divider>
        <el-form-item label="Contact Name" prop="emergencyContact.name">
          <el-input v-model="form.emergencyContact.name" />
        </el-form-item>
        <el-form-item label="Contact Phone" prop="emergencyContact.phone">
          <el-input v-model="form.emergencyContact.phone" />
        </el-form-item>
        <el-form-item label="Relationship" prop="emergencyContact.relationship">
          <el-input v-model="form.emergencyContact.relationship" />
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
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import type { Staff, StaffRole, StaffStatus } from '@/types/staff'

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  role: '',
  status: '',
  workShift: '',
  parkingLotId: ''
})

// 停车场列表
const parkingLots = ref([
  { id: '1', name: 'West Lake Parking' },
  { id: '2', name: 'East Lake Parking' }
])

// 员工列表模拟数据
const staffList = ref<Staff[]>([
  {
    id: '1',
    name: 'John Smith',
    phone: '13800138000',
    email: 'john.smith@example.com',
    role: 'manager',
    parkingLotId: '1',
    parkingLotName: 'West Lake Parking',
    joinDate: '2024-01-01',
    status: 'active',
    workShift: 'morning',
    lastLoginTime: '2024-02-15 10:00:00',
    emergencyContact: {
      name: 'Jane Smith',
      phone: '13900139000',
      relationship: 'Spouse'
    }
  },
  {
    id: '2',
    name: 'Emma Davis',
    phone: '13800138001',
    email: 'emma.davis@example.com',
    role: 'operator',
    parkingLotId: '1',
    parkingLotName: 'West Lake Parking',
    joinDate: '2024-01-15',
    status: 'active',
    workShift: 'afternoon'
  }
])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 弹窗控制
const dialogVisible = ref(false)
const formType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  name: '',
  phone: '',
  email: '',
  role: '',
  parkingLotId: '',
  workShift: '',
  joinDate: '',
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  }
})

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: 'Please enter name', trigger: 'blur' }],
  phone: [
    { required: true, message: 'Please enter phone', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: 'Invalid phone number', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' }
  ],
  role: [{ required: true, message: 'Please select role', trigger: 'change' }],
  parkingLotId: [{ required: true, message: 'Please select parking lot', trigger: 'change' }],
  workShift: [{ required: true, message: 'Please select work shift', trigger: 'change' }],
  joinDate: [{ required: true, message: 'Please select join date', trigger: 'change' }],
  'emergencyContact.name': [{ required: true, message: 'Please enter contact name', trigger: 'blur' }],
  'emergencyContact.phone': [
    { required: true, message: 'Please enter contact phone', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: 'Invalid phone number', trigger: 'blur' }
  ],
  'emergencyContact.relationship': [{ required: true, message: 'Please enter relationship', trigger: 'blur' }]
}

// 格式化方法
const formatRole = (role: StaffRole) => {
  const roles: Record<StaffRole, string> = {
    admin: 'Admin',
    manager: 'Manager',
    operator: 'Operator',
    valet: 'Valet',
    security: 'Security'
  }
  return roles[role] || role
}

const formatStatus = (status: StaffStatus) => {
  const statuses: Record<StaffStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    leave: 'On Leave',
    suspended: 'Suspended'
  }
  return statuses[status] || status
}

const formatShift = (shift: string | undefined) => {
  if (!shift) return 'N/A'
  const shifts: Record<string, string> = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    night: 'Night'
  }
  return shifts[shift] || shift
}

// 标签类型
const getRoleTagType = (role: StaffRole) => {
  const types: Record<StaffRole, string> = {
    admin: 'danger',
    manager: 'warning',
    operator: 'success',
    valet: 'info',
    security: 'info'
  }
  return types[role] || 'info'
}

const getStatusTagType = (status: StaffStatus) => {
  const types: Record<StaffStatus, string> = {
    active: 'success',
    inactive: 'info',
    leave: 'warning',
    suspended: 'danger'
  }
  return types[status] || 'info'
}

const getShiftTagType = (shift: string | undefined) => {
  if (!shift) return 'info'
  const types: Record<string, string> = {
    morning: 'success',
    afternoon: 'warning',
    night: 'info'
  }
  return types[shift] || 'info'
}

// 操作处理
const handleSearch = () => {
  console.log('Search form:', searchForm)
  // TODO: 调用搜索API
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    phone: '',
    role: '',
    status: '',
    workShift: '',
    parkingLotId: ''
  })
}

const handleAdd = () => {
  formType.value = 'add'
  Object.assign(form, {
    name: '',
    phone: '',
    email: '',
    role: '',
    parkingLotId: '',
    workShift: '',
    joinDate: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })
  dialogVisible.value = true
}

const handleEdit = (row: Staff) => {
  formType.value = 'edit'
  Object.assign(form, {
    name: row.name,
    phone: row.phone,
    email: row.email,
    role: row.role,
    parkingLotId: row.parkingLotId,
    workShift: row.workShift,
    joinDate: row.joinDate,
    emergencyContact: row.emergencyContact || {
      name: '',
      phone: '',
      relationship: ''
    }
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(formType.value === 'add' ? 'Staff added successfully' : 'Staff updated successfully')
      dialogVisible.value = false
    }
  })
}

const handleStatusChange = async (row: Staff, newStatus: StaffStatus) => {
  try {
    const confirmMessage = newStatus === 'inactive' 
      ? 'This will terminate the staff member\'s employment. Are you sure?'
      : `Are you sure to change status to ${formatStatus(newStatus)}?`

    const confirmTitle = newStatus === 'inactive' ? 'Terminate Employment' : 'Change Status'

    await ElMessageBox.confirm(
      confirmMessage,
      confirmTitle,
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: newStatus === 'inactive' ? 'error' : 'warning',
        confirmButtonClass: newStatus === 'inactive' ? 'el-button--danger' : ''
      }
    )

    // 如果是离职状态，需要记录离职时间和原因
    if (newStatus === 'inactive') {
      const { value: reason } = await ElMessageBox.prompt(
        'Please enter termination reason:',
        'Termination Reason',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          inputType: 'textarea',
          inputPlaceholder: 'Enter reason for termination'
        }
      )

      row.status = newStatus
      row.statusHistory = row.statusHistory || []
      row.statusHistory.push({
        status: newStatus,
        time: new Date().toISOString(),
        operator: 'Admin',
        reason
      })
    } else {
      row.status = newStatus
      row.statusHistory = row.statusHistory || []
      row.statusHistory.push({
        status: newStatus,
        time: new Date().toISOString(),
        operator: 'Admin'
      })
    }

    ElMessage.success(`Status updated to ${formatStatus(newStatus)} successfully`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to update status')
    }
  }
}

const handleResetPassword = async (row: Staff) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to reset password?',
      'Reset Password',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    ElMessage.success('Password reset successfully')
  } catch {
    // 用户取消操作
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  // TODO: 重新加载数据
}

// 选项数据
const roleOptions = {
  admin: 'Administrator',
  manager: 'Manager',
  operator: 'Operator',
  valet: 'Valet Staff',
  security: 'Security Staff'
}

const statusOptions = {
  active: 'Active',
  inactive: 'Inactive',
  leave: 'On Leave',
  suspended: 'Suspended'
}

const shiftOptions = {
  morning: 'Morning Shift (6:00-14:00)',
  afternoon: 'Afternoon Shift (14:00-22:00)',
  night: 'Night Shift (22:00-6:00)'
}
</script>

<style scoped lang="scss">
.staff-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;

  .search-form {
    padding: 20px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    
    .el-select {
      width: 220px;  // 统一下拉框宽度
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

// 添加危险操作的样式
:deep(.el-dropdown-menu__item) {
  &.danger {
    color: #F56C6C;
  }
}
</style>