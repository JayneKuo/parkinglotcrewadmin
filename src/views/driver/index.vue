<template>
  <div class="driver-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <div class="search-header">
        <div class="search-form">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="Search by name/phone/license/plate" 
            clearable
            :prefix-icon="Search"
            style="width: 300px"
          />
          <el-select v-model="searchForm.status" placeholder="Status" clearable>
            <el-option
              v-for="status in driverStatus"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            >
              <el-tag :type="getStatusType(status.value)" size="small">
                {{ status.label }}
              </el-tag>
            </el-option>
          </el-select>
          <el-select v-model="searchForm.membershipType" placeholder="Membership" clearable>
            <el-option
              v-for="type in membershipTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
          <div class="search-buttons">
            <el-button type="primary" @click="handleSearch">Search</el-button>
            <el-button @click="handleReset">Reset</el-button>
          </div>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>Add Driver
        </el-button>
      </div>
    </el-card>

    <!-- 列表区域 -->
    <el-card class="list-card">
      <el-table :data="driverList" border stripe>
        <el-table-column label="Driver" min-width="200">
          <template #default="{ row }">
            <div class="driver-info">
              <div class="driver-name">{{ row.name }}</div>
              <div class="driver-contact">
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

        <el-table-column prop="licenseNumber" label="License" width="150" />

        <el-table-column label="Membership" width="150">
          <template #default="{ row }">
            <div class="membership-info">
              <el-tag :type="getMembershipType(row.membershipType)" size="small">
                {{ row.membershipType }}
              </el-tag>
              <div v-if="row.membershipExpiry" class="expiry-date">
                Expires: {{ row.membershipExpiry }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

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
                  <el-dropdown-item command="vehicles">
                    <el-icon><Van /></el-icon>Vehicles
                  </el-dropdown-item>
                  <el-dropdown-item command="history">
                    <el-icon><List /></el-icon>History
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status !== DriverStatus.Blocked"
                    command="block"
                    divided
                  >
                    <el-icon><CircleClose /></el-icon>Block
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
import { h } from 'vue'
import { 
  Plus, Edit, List, CircleClose, Delete,
  Phone, Message, Van, More, Search 
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage, ElButton } from 'element-plus'
import type { Driver, DriverSearchForm } from '@/types/driver'
import { DriverStatus, MembershipType } from '@/types/driver'
import { mockDriversResponse, mockDrivers } from '@/mock/driver'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索表单
const searchForm = ref<DriverSearchForm>({
  keyword: '',
  status: '',
  membershipType: ''
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 司机列表
const driverList = ref<Driver[]>([])

// 状态选项
const driverStatus = [
  { label: 'Active', value: DriverStatus.Active },
  { label: 'Inactive', value: DriverStatus.Inactive },
  { label: 'Blocked', value: DriverStatus.Blocked }
]

// 会员类型选项
const membershipTypes = [
  { label: 'None', value: MembershipType.None },
  { label: 'Regular', value: MembershipType.Regular },
  { label: 'Premium', value: MembershipType.Premium },
  { label: 'VIP', value: MembershipType.VIP }
]

// 获取状态类型
const getStatusType = (status: DriverStatus) => {
  switch (status) {
    case DriverStatus.Active:
      return 'success'
    case DriverStatus.Inactive:
      return 'info'
    case DriverStatus.Blocked:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取会员类型样式
const getMembershipType = (type: MembershipType) => {
  switch (type) {
    case MembershipType.VIP:
      return 'danger'
    case MembershipType.Premium:
      return 'warning'
    case MembershipType.Regular:
      return 'success'
    default:
      return 'info'
  }
}

// 修改加载司机列表方法
const loadDrivers = async () => {
  try {
    // 使用模拟数据
    const data = mockDriversResponse({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    
    driverList.value = data.items
    total.value = data.total
  } catch (error) {
    ElMessage.error('Failed to load drivers')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadDrivers()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: '',
    membershipType: ''
  }
  handleSearch()
}

// 添加司机
const handleAdd = () => {
  router.push('/driver/add')
}

// 编辑司机
const handleEdit = (row: Driver) => {
  router.push(`/driver/${row.id}/edit`)
}

// 查看历史
const handleHistory = (row: Driver) => {
  router.push(`/driver/${row.id}/history`)
}

// 删除司机
const handleDelete = async (row: Driver) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to delete this driver?',
      'Warning',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    // 从模拟数据中删除
    const index = mockDrivers.findIndex(d => d.id === row.id)
    if (index > -1) {
      mockDrivers.splice(index, 1)
      ElMessage.success('Driver deleted successfully')
      loadDrivers()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete driver')
    }
  }
}

// 封禁司机
const handleBlock = async (row: Driver) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to block this driver?',
      'Warning',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    // TODO: 调用API封禁司机
    await fetch(`/api/drivers/${row.id}/block`, {
      method: 'POST'
    })
    
    ElMessage.success('Driver blocked successfully')
    loadDrivers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to block driver')
    }
  }
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadDrivers()
}

// 页码改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadDrivers()
}

// 管理车辆
const handleVehicles = (row: Driver) => {
  router.push(`/driver/${row.id}/vehicles`)
}

// 统一的命令处理函数
const handleCommand = (command: string, row: Driver) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'vehicles':
      handleVehicles(row)
      break
    case 'history':
      handleHistory(row)
      break
    case 'block':
      handleBlock(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 初始加载
loadDrivers()
</script>

<style scoped lang="scss">
.driver-container {
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

.driver-info {
  .driver-name {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .driver-contact {
    display: flex;
    gap: 16px;
    color: var(--el-text-color-secondary);
    font-size: 13px;

    .el-icon {
      margin-right: 4px;
    }
  }
}

.membership-info {
  .expiry-date {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
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