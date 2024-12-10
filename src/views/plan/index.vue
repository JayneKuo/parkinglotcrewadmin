<template>
  <div class="plan-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <div class="search-header">
        <div class="search-form">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="Search by name/code" 
            clearable
            :prefix-icon="Search"
            style="width: 300px"
          />
          <el-select v-model="searchForm.status" placeholder="Status" clearable>
            <el-option
              v-for="status in planStatus"
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
          <el-icon><Plus /></el-icon>Add Plan
        </el-button>
      </div>
    </el-card>

    <!-- 列表区域 -->
    <el-card class="list-card">
      <el-table :data="planList" border stripe>
        <el-table-column prop="name" label="Plan Name" min-width="200" />
        <el-table-column prop="code" label="Plan Code" width="150" />
        <el-table-column prop="type" label="Type" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="Price" width="150" align="right">
          <template #default="{ row }">
            ${{ row.price.toFixed(2) }}
            <span class="price-unit">/{{ row.unit }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="validPeriod" label="Valid Period" width="180" />

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
                  <el-dropdown-item command="view">
                    <el-icon><View /></el-icon>View
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="row.status === 'active'"
                    command="disable"
                    divided
                  >
                    <el-icon><CircleClose /></el-icon>Disable
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Plus, Edit, Delete, More, Search,
  View, CircleClose 
} from '@element-plus/icons-vue'

interface Plan {
  id: string
  name: string
  code: string
  type: string
  price: number
  unit: string
  status: string
  validPeriod: string
}

// 搜索表单
const searchForm = ref({
  keyword: '',
  status: ''
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 计划列表
const planList = ref<Plan[]>([
  {
    id: 'P001',
    name: 'Basic Monthly',
    code: 'BASIC-M',
    type: 'Monthly',
    price: 99.99,
    unit: 'month',
    status: 'active',
    validPeriod: '2024-01-01 ~ 2024-12-31'
  }
])

// 状态选项
const planStatus = [
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Expired', value: 'expired' }
]

// 获取状态样式
const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'disabled':
      return 'info'
    case 'expired':
      return 'danger'
    default:
      return 'info'
  }
}

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索功能
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: ''
  }
  handleSearch()
}

// 添加
const handleAdd = () => {
  // TODO: 实现添加功能
}

// 统一的命令处理函数
const handleCommand = (command: string, row: Plan) => {
  switch (command) {
    case 'edit':
      // TODO: 实现编辑功能
      break
    case 'view':
      // TODO: 实现查看功能
      break
    case 'disable':
      // TODO: 实现停用功能
      break
    case 'delete':
      // TODO: 实现删除功能
      break
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}
</script>

<style scoped lang="scss">
.plan-container {
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

.price-unit {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 4px;
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