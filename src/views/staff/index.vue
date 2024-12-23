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
    <el-table :data="sortedStaffList" border style="width: 100%; margin-top: 20px;">
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
        <el-form-item label="Initial Password" prop="password" v-if="dialogType === 'add'">
          <el-input 
            v-model="form.password" 
            type="password" 
            show-password
            placeholder="Set initial password"
          >
            <template #append>
              <el-button @click="generateInitialPassword">
                Generate
              </el-button>
            </template>
          </el-input>
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
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Select status">
            <el-option label="Active" value="active" />
            <el-option label="Inactive" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="Join Date" prop="joinDate">
          <el-date-picker
            v-model="form.joinDate"
            type="date"
            placeholder="Select date"
            value-format="YYYY-MM-DD"
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
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import type { Staff, StaffRole, StaffStatus } from '@/types/staff'
import { getStaffList, addStaff, updateStaff, resetPassword, sendPasswordEmail } from '@/api/staff'

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

// 员工列表数据
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
    lastLoginTime: '2024-02-15 10:00:00',
    createTime: '2024-01-01',
    emergencyContact: {
      name: 'Jane Smith',
      phone: '13900139000',
      relationship: 'spouse'
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
    status: 'leave',
    createTime: '2024-01-15',
    lastLoginTime: '2024-02-14 15:30:00',
    emergencyContact: {
      name: 'William Davis',
      phone: '13900139001',
      relationship: 'parent'
    }
  },
  {
    id: '3',
    name: 'Michael Chen',
    phone: '13800138002',
    email: 'michael.chen@example.com',
    role: 'valet',
    parkingLotId: '2',
    parkingLotName: 'East Lake Parking',
    joinDate: '2024-02-01',
    status: 'inactive',
    createTime: '2024-02-01',
    lastLoginTime: '2024-02-13 22:15:00',
    emergencyContact: {
      name: 'Linda Chen',
      phone: '13900139002',
      relationship: 'sibling'
    }
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    phone: '13800138003',
    email: 'sarah.wilson@example.com',
    role: 'security',
    parkingLotId: '2',
    parkingLotName: 'East Lake Parking',
    joinDate: '2023-12-01',
    status: 'inactive',
    createTime: '2023-12-01',
    lastLoginTime: '2024-02-10 08:45:00',
    emergencyContact: {
      name: 'Robert Wilson',
      phone: '13900139003',
      relationship: 'spouse'
    },
    statusHistory: [
      {
        status: 'inactive',
        time: '2024-02-10T08:45:00',
        operator: 'Admin',
        reason: 'Resigned for personal reasons'
      }
    ]
  }
])

// 加载员工列表
const loadStaffList = () => {
  // 模拟搜索过滤
  const filteredList = staffList.value.filter(staff => {
    return (!searchForm.name || staff.name.toLowerCase().includes(searchForm.name.toLowerCase())) &&
      (!searchForm.phone || staff.phone.includes(searchForm.phone)) &&
      (!searchForm.role || staff.role === searchForm.role) &&
      (!searchForm.status || staff.status === searchForm.status) &&
      (!searchForm.workShift || staff.workShift === searchForm.workShift) &&
      (!searchForm.parkingLotId || staff.parkingLotId === searchForm.parkingLotId)
  })
  
  staffList.value = filteredList
}

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
  id: '',
  name: '',
  phone: '',
  email: '',
  role: '',
  parkingLotId: '',
  status: 'active',
  joinDate: '',
  password: ''
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话', trigger: 'blur' },
    { pattern: /^[0-9]{10}$/, message: '请输入有效的电话号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  parkingLotId: [
    { required: true, message: '请选择停车场', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  joinDate: [
    { required: true, message: '请选择入职日期', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
      message: '密码必须包含字母和数字',
      trigger: 'blur'
    }
  ],
  emergencyContact: {
    name: [
      { required: true, message: '请输入紧急联系人姓名', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入紧急联系人电话', trigger: 'blur' },
      { pattern: /^[0-9]{10}$/, message: '请输入有效的电话号码', trigger: 'blur' }
    ],
    relationship: [
      { required: true, message: '请选择与紧急联系人关系', trigger: 'change' }
    ]
  }
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
  loadStaffList()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.role = ''
  searchForm.status = ''
  searchForm.workShift = ''
  searchForm.parkingLotId = ''
  loadStaffList()
}

const handleAdd = () => {
  formType.value = 'add'
  Object.assign(form, {
    id: '',
    name: '',
    phone: '',
    email: '',
    role: '',
    parkingLotId: '',
    status: 'active',
    joinDate: '',
    password: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: Staff) => {
  formType.value = 'edit'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    role: row.role,
    parkingLotId: row.parkingLotId,
    status: row.status,
    joinDate: row.joinDate,
    emergencyContact: row.emergencyContact || {
      name: '',
      phone: '',
      relationship: ''
    },
    password: ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (dialogType.value === 'add') {
      await addStaff(form)
      await sendPasswordEmail({
        to: form.email,
        password: form.password,
        type: 'initial'
      })
      ElMessage.success('Staff added successfully')
    } else {
      await updateStaff(form.id, form)
      ElMessage.success('Staff updated successfully')
    }
    
    dialogVisible.value = false
    loadStaffList() // 重新加载列表
  } catch (error) {
    ElMessage.error('Operation failed')
  }
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
    
    // 生成新密码
    const newPassword = generateRandomPassword()
    
    // 调用API重置密码
    await resetPassword({
      staffId: row.id,
      newPassword: newPassword
    })
    
    // 发送邮件通知
    await sendPasswordEmail({
      to: row.email,
      password: newPassword,
      type: 'reset'
    })
    
    ElMessage.success('Password has been reset and sent to employee\'s email')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to reset password. Please try again')
    }
  }
}

// 生成初始密码
const generateInitialPassword = () => {
  form.password = generateRandomPassword()
}

// 生成随机密码
const generateRandomPassword = () => {
  // 确保包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  
  let password = ''
  // 确保每种字符都有
  password += upper.charAt(Math.floor(Math.random() * upper.length))
  password += lower.charAt(Math.floor(Math.random() * lower.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  password += special.charAt(Math.floor(Math.random() * special.length))
  
  // 补充剩余长度
  const chars = upper + lower + numbers + special
  for (let i = password.length; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // 打乱密码字符顺序
  return password.split('').sort(() => Math.random() - 0.5).join('')
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

// 状态优先级排序
const statusPriority = {
  active: 1,
  leave: 2,
  suspended: 3,
  inactive: 4
}

// 排序后的员工列表
const sortedStaffList = computed(() => {
  return [...staffList.value].sort((a, b) => {
    // 首先按状态优先级排序
    const statusDiff = statusPriority[a.status] - statusPriority[b.status]
    if (statusDiff !== 0) return statusDiff
    
    // 其次按添加时间倒序
    return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  })
})

// 初始加载
loadStaffList()
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

.emergency-contact-card {
  margin-bottom: 20px;
  
  :deep(.el-card__body) {
    padding: 20px;
  }
}
</style>