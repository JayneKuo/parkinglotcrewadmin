<template>
  <div class="device-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Keyword">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="Device ID/Name/Location" 
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="Type">
          <el-select v-model="searchForm.type" placeholder="All Types" clearable style="width: 180px">
            <el-option
              v-for="type in deviceTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            >
              <el-icon class="device-icon">
                <component :is="type.icon" />
              </el-icon>
              {{ type.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="All Status" clearable style="width: 180px">
            <el-option
              v-for="status in deviceStatus"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            >
              <el-tag :type="getStatusType(status.value)" size="small">
                {{ status.label }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>

      <div class="header-actions">
        <el-button type="primary" @click="handleMonitor">
          <el-icon><VideoCamera /></el-icon>Monitor
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>Add Device
        </el-button>
      </div>
    </el-card>

    <!-- 设备列表 -->
    <el-card class="list-card">
      <el-table :data="deviceList" border style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="device-detail">
              <div class="detail-section">
                <h4>Device Information</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">Model:</span>
                    <span class="value">{{ row.model }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Serial No:</span>
                    <span class="value">{{ row.serialNo }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Firmware:</span>
                    <span class="value">{{ row.firmware }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">IP Address:</span>
                    <span class="value">{{ row.ipAddress }}</span>
                  </div>
                </div>
              </div>
              
              <div class="detail-section">
                <h4>Maintenance</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">Last Check:</span>
                    <span class="value">{{ row.lastCheck }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Next Check:</span>
                    <span class="value">{{ row.nextCheck }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Health Score:</span>
                    <span class="value">
                      <el-progress 
                        :percentage="row.healthScore"
                        :status="getHealthStatus(row.healthScore)"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="Device" min-width="200">
          <template #default="{ row }">
            <div class="device-info">
              <el-icon class="device-type-icon">
                <component :is="getDeviceIcon(row.type)" />
              </el-icon>
              <div class="device-meta">
                <div class="device-name">{{ row.name }}</div>
                <div class="device-id">ID: {{ row.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="Type" width="150">
          <template #default="{ row }">
            {{ getDeviceTypeName(row.type) }}
          </template>
        </el-table-column>

        <el-table-column prop="location" label="Location" min-width="200" show-overflow-tooltip />

        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Connection" width="120">
          <template #default="{ row }">
            <div class="connection-status">
              <div 
                class="status-dot"
                :class="{ online: row.connected }"
              />
              {{ row.connected ? 'Online' : 'Offline' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="100" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <el-button type="primary" link>
                Actions<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>Edit
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleConfig(row)">
                    <el-icon><Setting /></el-icon>Configure
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleRestart(row)">
                    <el-icon><RefreshRight /></el-icon>Restart
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleDelete(row)">
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

    <!-- 配置对话框 -->
    <ConfigDialog
      v-if="currentDevice"
      v-model="configDialogVisible"
      :device="currentDevice"
      @saved="handleConfigSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Plus, ArrowDown, Edit, Setting, RefreshRight, Delete,
  VideoCamera, Switch, Connection, Monitor, Aim
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import ConfigDialog from '@/components/device/ConfigDialog.vue'
import type { Device } from '@/types/device'
import { deviceTypeConfig } from '@/types/device'

const router = useRouter()

// 设备类型
const deviceTypes = [
  { label: 'Gate', value: 'gate', icon: 'Switch' },
  { label: 'LPR Camera', value: 'camera', icon: 'VideoCamera' },
  { label: 'RFID Reader', value: 'rfidReader', icon: 'Connection' },
  { label: 'LiDAR Scanner', value: 'lidar', icon: 'Aim' },
  { label: 'LED Display', value: 'display', icon: 'Monitor' }
]

// 设备状态
const deviceStatus = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Error', value: 'error' }
]

// 搜索表单
const searchForm = ref({
  keyword: '',
  type: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 修改模拟设备列表数据
const deviceList = ref([
  {
    id: 'GATE001',
    name: 'Entry Gate 1',
    type: 'gate',
    location: 'Main Entrance',
    status: 'active',
    connected: true,
    model: 'BG-2000',
    serialNo: 'SN20240001',
    firmware: 'v2.1.0',
    ipAddress: '192.168.1.100',
    lastCheck: '2024-02-15 10:00:00',
    nextCheck: '2024-03-15 10:00:00',
    healthScore: 95
  },
  {
    id: 'CAM001',
    name: 'LPR Camera 1',
    type: 'camera',
    location: 'Entry Gate 1',
    status: 'active',
    connected: true,
    model: 'CAM-4K',
    serialNo: 'SN20240002',
    firmware: 'v3.0.2',
    ipAddress: '192.168.1.101',
    lastCheck: '2024-02-14 15:00:00',
    nextCheck: '2024-03-14 15:00:00',
    healthScore: 88
  },
  {
    id: 'RFID001',
    name: 'RFID Reader 1',
    type: 'rfidReader',
    location: 'Entry Gate 1',
    status: 'active',
    connected: true,
    model: 'RR-100',
    serialNo: 'SN20240003',
    firmware: 'v1.5.0',
    ipAddress: '192.168.1.102',
    lastCheck: '2024-02-13 10:00:00',
    nextCheck: '2024-03-13 10:00:00',
    healthScore: 92
  },
  {
    id: 'LIDAR001',
    name: 'LiDAR Scanner 1',
    type: 'lidar',
    location: 'Parking Area A',
    status: 'active',
    connected: true,
    model: 'LS-200',
    serialNo: 'SN20240004',
    firmware: 'v2.0.1',
    ipAddress: '192.168.1.103',
    lastCheck: '2024-02-12 10:00:00',
    nextCheck: '2024-03-12 10:00:00',
    healthScore: 90
  },
  {
    id: 'DISP001',
    name: 'LED Display 1',
    type: 'display',
    location: 'Main Entrance',
    status: 'active',
    connected: true,
    model: 'LED-P10',
    serialNo: 'SN20240005',
    firmware: 'v1.2.0',
    ipAddress: '192.168.1.104',
    lastCheck: '2024-02-11 10:00:00',
    nextCheck: '2024-03-11 10:00:00',
    healthScore: 96
  }
])

// 添加状态变量
const configDialogVisible = ref(false)
const currentDevice = ref<Device | null>(null)

// 工具函数
const getStatusType = (status: string): string => {
  const types: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    maintenance: 'warning',
    error: 'danger'
  }
  return types[status] || 'info'
}

// 修改图标映射
const getDeviceIcon = (type: string) => {
  const icons = {
    gate: 'Switch',
    camera: 'VideoCamera',
    rfidReader: 'Connection',
    lidar: 'Aim',
    display: 'Monitor'
  }
  return icons[type as keyof typeof icons] || 'Connection'
}

const getDeviceTypeName = (type: string): string => {
  const device = deviceTypes.find(d => d.value === type)
  return device?.label || type
}

const getHealthStatus = (score: number): '' | 'success' | 'warning' | 'exception' => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'exception'
}

// 事件处理
const handleSearch = () => {
  console.log('Search:', searchForm.value)
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    type: '',
    status: ''
  }
}

const handleAdd = () => {
  router.push('/device/add')
}

const handleEdit = (row: any) => {
  console.log('Edit device:', row)
}

const handleConfig = (row: Device) => {
  currentDevice.value = row
  configDialogVisible.value = true
}

const handleRestart = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to restart this device?',
      'Restart Device',
      {
        confirmButtonText: 'Restart',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    ElMessage.success('Device restarting...')
  } catch {
    // User cancelled
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to delete this device?',
      'Delete Device',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      }
    )
    ElMessage.success('Device deleted')
  } catch {
    // User cancelled
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: 重新加载数据
}

// 添加监控页面跳转
const handleMonitor = () => {
  router.push('/device/monitor')
}

// 配置保存回调
const handleConfigSaved = () => {
  ElMessage.success('Device configuration updated')
  // TODO: 刷新设备列表
}
</script>

<style scoped lang="scss">
.device-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
    padding: 20px;
    background: var(--el-bg-color);
    border-radius: 4px;
    box-shadow: var(--el-box-shadow-light);

    .search-form {
      margin-bottom: 16px;
    }

    .header-actions {
      display: flex;
      justify-content: flex-end;
    }

    :deep(.el-form--inline) {
      .el-form-item {
        margin-bottom: 0;
        margin-right: 24px;
      }

      .el-input,
      .el-select {
        width: 100%;
      }
    }
  }

  .device-icon {
    margin-right: 8px;
  }

  .device-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .device-type-icon {
      font-size: 24px;
      color: var(--el-color-primary);
    }

    .device-meta {
      .device-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .device-id {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--el-color-danger);

      &.online {
        background-color: var(--el-color-success);
      }
    }
  }

  .device-detail {
    padding: 20px;

    .detail-section {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 16px;
        color: var(--el-text-color-primary);
        font-size: 16px;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;

        .detail-item {
          display: flex;
          align-items: center;

          .label {
            width: 100px;
            color: var(--el-text-color-secondary);
          }

          .value {
            flex: 1;
            color: var(--el-text-color-primary);
          }
        }
      }
    }
  }

  :deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    
    .el-icon {
      margin-right: 4px;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>