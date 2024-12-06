<template>
  <div class="users-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="用户名">
        <el-input v-model="searchForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="searchForm.role" placeholder="请选择角色">
          <el-option label="全部" value="" />
          <el-option label="系统管理员" value="admin" />
          <el-option label="商户管理员" value="merchant-admin" />
          <el-option label="商户员工" value="merchant-staff" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="全部" value="" />
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleAdd">新增用户</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="userList" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)">
            {{ getRoleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="merchant" label="所属商户" />
      <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" />
      <el-table-column prop="lastLoginIp" label="最后登录IP" width="140" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" link @click="handleResetPassword(row)">重置密码</el-button>
          <el-button 
            :type="row.status === 'active' ? 'danger' : 'success'" 
            link 
            @click="handleStatusChange(row)"
          >
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
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

    <!-- 用户表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item 
          label="密码" 
          prop="password"
          v-if="formType === 'add'"
        >
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="系统管理员" value="admin" />
            <el-option label="商户管理员" value="merchant-admin" />
            <el-option label="商户员工" value="merchant-staff" />
          </el-select>
        </el-form-item>
        <el-form-item 
          label="所属商户" 
          prop="merchantId"
          v-if="form.role !== 'admin'"
        >
          <el-select v-model="form.merchantId" placeholder="请选择商户">
            <el-option
              v-for="item in merchantList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            active-value="active"
            inactive-value="inactive"
            :active-text="'启用'"
            :inactive-text="'禁用'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

interface UserForm {
  username: string
  password?: string
  role: string
  merchantId?: string
  status: 'active' | 'inactive'
}

// 搜索表单
const searchForm = reactive({
  username: '',
  role: '',
  status: ''
})

// 商户列表
const merchantList = ref([
  { id: '1', name: '示例商户1' },
  { id: '2', name: '示例商户2' }
])

// 用户列表
const userList = ref([
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    merchant: '-',
    lastLoginTime: '2024-02-15 10:00:00',
    lastLoginIp: '192.168.1.1',
    status: 'active'
  },
  {
    id: '2',
    username: 'merchant1',
    role: 'merchant-admin',
    merchant: '示例商户1',
    lastLoginTime: '2024-02-15 09:00:00',
    lastLoginIp: '192.168.1.2',
    status: 'active'
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
const form = reactive<UserForm>({
  username: '',
  password: '',
  role: '',
  merchantId: '',
  status: 'active'
})

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  merchantId: [{ required: true, message: '请选择商户', trigger: 'change' }]
}

// 监听角色变化，重置商户选择
watch(() => form.role, (newRole) => {
  if (newRole === 'admin') {
    form.merchantId = ''
  }
})

// 获取角色样式
const getRoleTagType = (role: string) => {
  const map: Record<string, string> = {
    admin: 'danger',
    'merchant-admin': 'warning',
    'merchant-staff': 'info'
  }
  return map[role] || 'info'
}

// 获取角色文本
const getRoleText = (role: string) => {
  const map: Record<string, string> = {
    admin: '系统管理员',
    'merchant-admin': '商户管理员',
    'merchant-staff': '商户员工'
  }
  return map[role] || role
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  // TODO: 调用搜索API
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    role: '',
    status: ''
  })
}

// 新增用户
const handleAdd = () => {
  formType.value = 'add'
  Object.assign(form, {
    username: '',
    password: '',
    role: '',
    merchantId: '',
    status: 'active'
  })
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: any) => {
  formType.value = 'edit'
  Object.assign(form, {
    username: row.username,
    role: row.role,
    merchantId: row.merchantId,
    status: row.status
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(formType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
    }
  })
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

// 重置密码
const handleResetPassword = (row: any) => {
  ElMessageBox.confirm('确认重置该用户的密码？', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码重置成功')
  })
}

// 更改状态
const handleStatusChange = (row: any) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(`确认${action}该用户？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${action}成功`)
  })
}
</script>

<style scoped lang="scss">
.users-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;

  .search-form {
    padding: 20px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>