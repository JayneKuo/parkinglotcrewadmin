<template>
  <div class="merchant-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <div class="search-header">
        <div class="search-form">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="Search by name/phone/email" 
            clearable
            :prefix-icon="Search"
            style="width: 300px"
          />
          <el-select v-model="searchForm.status" placeholder="Status" clearable>
            <el-option
              v-for="status in merchantStatus"
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
          <el-icon><Plus /></el-icon>Add Merchant
        </el-button>
      </div>
    </el-card>

    <!-- 列表区域 -->
    <el-card class="list-card">
      <el-table :data="merchantList" border stripe>
        <el-table-column label="Merchant" min-width="200">
          <template #default="{ row }">
            <div class="merchant-info">
              <div class="merchant-name">{{ row.name }}</div>
              <div class="merchant-contact">
                <el-tooltip content="Phone">
                  <span><el-icon><Phone /></el-icon>{{ row.phone }}</span>
                </el-tooltip>
                <el-tooltip v-if="row.email" content="Email">
                  <span><el-icon><Message /></el-icon>{{ row.email }}</span>
                </el-tooltip>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="businessType" label="Business Type" width="150" />
        <el-table-column prop="address" label="Address" min-width="200" />

        <el-table-column label="Status" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="joinDate" label="Join Date" width="180" />

        <el-table-column label="Actions" width="70" fixed="right" align="center">
          <template #default="{ row }">
            <el-dropdown trigger="hover" @command="(command) => handleCommand(command, row)">
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
                    command="suspend"
                    divided
                  >
                    <el-icon><CircleClose /></el-icon>Suspend
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
  View, CircleClose, Phone, Message 
} from '@element-plus/icons-vue'

// 搜索表单
const searchForm = ref({
  keyword: '',
  status: ''
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 商户列表
const merchantList = ref([
  {
    id: 'M001',
    name: 'ABC Store',
    phone: '(555) 123-4567',
    email: 'contact@abcstore.com',
    businessType: 'Retail',
    address: '123 Main St, City',
    status: 'active',
    joinDate: '2024-01-01'
  }
])

// 状态选项
const merchantStatus = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Inactive', value: 'inactive' }
]

// 获取状态样式
const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'suspended':
      return 'warning'
    case 'inactive':
      return 'info'
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
const handleCommand = (command: string, row: any) => {
  switch (command) {
    case 'edit':
      // TODO: 实现编辑功能
      break
    case 'view':
      // TODO: 实现查看功能
      break
    case 'suspend':
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
.merchant-container {
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

.merchant-info {
  .merchant-name {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .merchant-contact {
    display: flex;
    gap: 16px;
    color: var(--el-text-color-secondary);
    font-size: 13px;

    .el-icon {
      margin-right: 4px;
    }
  }
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