<template>
  <div class="device-monitor">
    <!-- 左侧设备列表 -->
    <el-card class="device-list-card">
      <template #header>
        <div class="list-header">
          <h3>Device List</h3>
          <el-radio-group v-model="deviceFilter" size="small">
            <el-radio-button label="all">All</el-radio-button>
            <el-radio-button label="gate">Gates</el-radio-button>
            <el-radio-button label="camera">Cameras</el-radio-button>
            <el-radio-button label="rfidReader">RFID Readers</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <div class="device-list">
        <div 
          v-for="device in filteredDevices" 
          :key="device.id"
          class="device-item"
          :class="{ active: selectedDevice?.id === device.id }"
          @click="selectDevice(device)"
        >
          <div class="device-icon">
            <el-icon><component :is="getDeviceIcon(device.type)" /></el-icon>
            <div 
              class="status-dot"
              :class="{ online: device.connected }"
              :title="device.connected ? 'Online' : 'Offline'"
            />
          </div>
          
          <div class="device-info">
            <div class="device-name">{{ device.name }}</div>
            <div class="device-meta">
              <span class="location">{{ device.location }}</span>
              <el-tag 
                size="small" 
                :type="getStatusType(device.status)"
              >
                {{ getStatusText(device.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 右侧监控内容 -->
    <div class="monitor-content">
      <!-- 设备未选择时的提示 -->
      <el-empty 
        v-if="!selectedDevice"
        description="Please select a device to monitor"
      />
      
      <!-- 闸机监控 -->
      <el-card v-else-if="selectedDevice.type === 'gate'" class="gate-monitor">
        <template #header>
          <div class="monitor-header">
            <div class="device-title">
              <h3>{{ selectedDevice.name }}</h3>
              <el-tag 
                :type="selectedDevice.connected ? 'success' : 'danger'"
                size="small"
              >
                {{ selectedDevice.connected ? 'Online' : 'Offline' }}
              </el-tag>
            </div>
            
            <div class="device-controls">
              <el-button 
                type="primary" 
                :disabled="!selectedDevice.connected"
                @click="handleGateControl"
              >
                {{ gateStatus === 'open' ? 'Close Gate' : 'Open Gate' }}
              </el-button>
            </div>
          </div>
        </template>

        <div class="gate-status">
          <!-- 闸机状态 -->
          <div class="status-panel">
            <div class="status-icon">
              <el-icon :size="48" :color="gateStatus === 'open' ? '#67c23a' : '#909399'">
                <Switch />
              </el-icon>
            </div>
            <div class="status-text">
              Current Status:
              <span :class="gateStatus">
                {{ gateStatus === 'open' ? 'OPEN' : 'CLOSED' }}
              </span>
            </div>
          </div>

          <!-- 操作记录 -->
          <div class="operation-records">
            <h4>Recent Operations</h4>
            <el-timeline>
              <el-timeline-item
                v-for="log in gateOperationLogs"
                :key="log.time"
                :type="log.type"
                :timestamp="log.time"
                size="large"
              >
                <div class="log-content">
                  <span class="action">{{ log.action }}</span>
                  <span class="detail">{{ log.detail }}</span>
                  <span class="operator">{{ log.operator }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-card>

      <!-- 摄像头监控 -->
      <el-card v-else-if="selectedDevice.type === 'camera'" class="camera-monitor">
        <template #header>
          <div class="monitor-header">
            <div class="device-title">
              <h3>{{ selectedDevice.name }}</h3>
              <el-tag 
                :type="selectedDevice.connected ? 'success' : 'danger'"
                size="small"
              >
                {{ selectedDevice.connected ? 'Online' : 'Offline' }}
              </el-tag>
            </div>
            
            <div class="camera-controls">
              <el-button-group>
                <el-button 
                  :icon="ZoomIn" 
                  circle 
                  title="Zoom In"
                  :disabled="!selectedDevice.connected"
                />
                <el-button 
                  :icon="ZoomOut" 
                  circle 
                  title="Zoom Out"
                  :disabled="!selectedDevice.connected"
                />
                <el-button 
                  :icon="Camera" 
                  circle 
                  title="Capture"
                  :disabled="!selectedDevice.connected"
                />
              </el-button-group>
            </div>
          </div>
        </template>

        <div class="camera-view">
          <div v-if="!selectedDevice.connected" class="offline-tip">
            <el-icon><VideoPlay /></el-icon>
            <span>Device Offline</span>
          </div>
          <div v-else class="video-container">
            <img :src="`/mock/camera/${selectedDevice.id}.jpg`" alt="Camera Feed" />
            <div class="video-info">
              <span class="time">{{ currentTime }}</span>
              <span class="location">{{ selectedDevice.location }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- RFID读卡器监控 -->
      <el-card v-else-if="selectedDevice.type === 'rfidReader'" class="rfid-monitor">
        <template #header>
          <div class="monitor-header">
            <div class="device-title">
              <h3>{{ selectedDevice.name }}</h3>
              <el-tag 
                :type="selectedDevice.connected ? 'success' : 'danger'"
                size="small"
              >
                {{ selectedDevice.connected ? 'Online' : 'Offline' }}
              </el-tag>
            </div>
            
            <div class="rfid-controls">
              <el-switch
                v-model="rfidReaderActive"
                active-text="Active"
                inactive-text="Standby"
                :disabled="!selectedDevice.connected"
              />
            </div>
          </div>
        </template>

        <div class="rfid-content">
          <!-- 实时读取记录 -->
          <div class="realtime-readings">
            <h4>Real-time Readings</h4>
            <el-table 
              :data="rfidReadings" 
              height="400" 
              :loading="!selectedDevice.connected"
            >
              <el-table-column prop="time" label="Time" width="160" />
              <el-table-column prop="tagId" label="Tag ID" width="180" />
              <el-table-column prop="type" label="Type" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.type === 'vehicle' ? 'primary' : 'success'">
                    {{ row.type === 'vehicle' ? 'Vehicle' : 'Card' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="Status" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'valid' ? 'success' : 'danger'">
                    {{ row.status === 'valid' ? 'Valid' : 'Invalid' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="detail" label="Details" />
            </el-table>
          </div>

          <!-- 统计信息 -->
          <div class="statistics">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-card">
                  <div class="stat-title">Today's Readings</div>
                  <div class="stat-value">{{ todayReadings }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-card">
                  <div class="stat-title">Valid Rate</div>
                  <div class="stat-value">{{ validRate }}%</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-card">
                  <div class="stat-title">Avg Response</div>
                  <div class="stat-value">{{ avgResponse }}ms</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ZoomIn, ZoomOut, Camera, Switch, VideoPlay,
  Aim, Microphone
} from '@element-plus/icons-vue'
import type { Device } from '@/types/device'
import { mockDevices } from '@/types/device'

// 设备过滤和选择
const deviceFilter = ref('all')
const selectedDevice = ref<Device | null>(null)

// 当前时间
const currentTime = computed(() => {
  return new Date().toLocaleTimeString()
})

// 过滤设备列表
const filteredDevices = computed(() => {
  if (deviceFilter.value === 'all') return mockDevices
  return mockDevices.filter(d => d.type === deviceFilter.value)
})

// 选择设备
const selectDevice = (device: Device) => {
  selectedDevice.value = device
  // 重置相关状态
  if (device.type === 'gate') {
    gateStatus.value = 'closed'
  }
}

// 闸机控制
const gateStatus = ref<'open' | 'closed'>('closed')
const gateOperationLogs = ref([
  {
    time: '2024-02-15 14:30:22',
    type: 'success',
    action: 'Gate Opened',
    detail: 'Vehicle: ABC123',
    operator: 'System'
  },
  {
    time: '2024-02-15 14:28:15',
    type: 'warning',
    action: 'Gate Closed',
    detail: 'Auto close timeout',
    operator: 'System'
  }
])

// 处理闸机控制
const handleGateControl = () => {
  gateStatus.value = gateStatus.value === 'open' ? 'closed' : 'open'
  gateOperationLogs.value.unshift({
    time: new Date().toLocaleString(),
    type: gateStatus.value === 'open' ? 'success' : 'warning',
    action: `Gate ${gateStatus.value === 'open' ? 'Opened' : 'Closed'}`,
    detail: 'Manual operation',
    operator: 'Admin'
  })
}

// RFID读卡器
const rfidReaderActive = ref(true)
const rfidReadings = ref([
  {
    time: '2024-02-15 14:30:22',
    tagId: 'E200-3411-DK89',
    type: 'vehicle',
    status: 'valid',
    detail: 'Vehicle: ABC123'
  },
  {
    time: '2024-02-15 14:28:15',
    tagId: 'E200-3412-DK90',
    type: 'card',
    status: 'invalid',
    detail: 'Card expired'
  }
])

// 统计数据
const todayReadings = ref(156)
const validRate = ref(95.8)
const avgResponse = ref(125)

// 工具函数
const getDeviceIcon = (type: string) => {
  const icons = {
    gate: 'Switch',
    camera: 'VideoPlay',
    rfidReader: 'Connection',
    display: 'Monitor',
    lidar: 'Aim',
    intercom: 'Microphone'
  }
  return icons[type as keyof typeof icons] || 'Connection'
}

const getStatusType = (status: string): string => {
  const types: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    maintenance: 'warning',
    error: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
    maintenance: 'Maintenance',
    error: 'Error'
  }
  return texts[status] || status
}
</script>

<style scoped lang="scss">
.device-monitor {
  padding: 20px;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  height: calc(100vh - 100px);

  .device-list-card {
    .list-header {
      display: flex;
      flex-direction: column;
      gap: 12px;

      h3 {
        margin: 0;
      }
    }

    .device-list {
      height: calc(100vh - 200px);
      overflow-y: auto;

      .device-item {
        display: flex;
        align-items: center;
        padding: 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: var(--el-fill-color-light);
        }

        &.active {
          background-color: var(--el-color-primary-light-9);
        }

        .device-icon {
          position: relative;
          font-size: 24px;
          color: var(--el-color-primary);
          margin-right: 12px;

          .status-dot {
            position: absolute;
            right: -2px;
            bottom: -2px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--el-color-danger);

            &.online {
              background-color: var(--el-color-success);
            }
          }
        }

        .device-info {
          flex: 1;
          
          .device-name {
            font-weight: 500;
            margin-bottom: 4px;
          }

          .device-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;

            .location {
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }
  }

  .monitor-content {
    .monitor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .device-title {
        display: flex;
        align-items: center;
        gap: 12px;

        h3 {
          margin: 0;
        }
      }
    }

    // 闸机监控样式
    .gate-monitor {
      .gate-status {
        .status-panel {
          text-align: center;
          padding: 40px 0;

          .status-icon {
            margin-bottom: 16px;
          }

          .status-text {
            font-size: 16px;

            .open {
              color: var(--el-color-success);
              font-weight: bold;
            }

            .closed {
              color: var(--el-text-color-regular);
            }
          }
        }

        .operation-records {
          border-top: 1px solid var(--el-border-color-lighter);
          padding-top: 20px;

          h4 {
            margin: 0 0 20px;
          }

          .log-content {
            .action {
              font-weight: 500;
            }

            .detail {
              color: var(--el-text-color-secondary);
              margin-left: 8px;
            }

            .operator {
              float: right;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }

    // 摄像头监控样式
    .camera-monitor {
      height: 100%;

      .camera-view {
        height: calc(100% - 60px);
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;

        .offline-tip {
          color: #fff;
          text-align: center;
          font-size: 16px;

          .el-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
        }

        .video-container {
          position: relative;
          width: 100%;
          height: 100%;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .video-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 8px 16px;
            background: rgba(0, 0, 0, 0.5);
            color: #fff;
            display: flex;
            justify-content: space-between;
          }
        }
      }
    }

    // RFID监控样式
    .rfid-monitor {
      .rfid-content {
        .realtime-readings {
          margin-bottom: 24px;

          h4 {
            margin: 0 0 16px;
          }
        }

        .statistics {
          .stat-card {
            background: var(--el-fill-color-light);
            padding: 16px;
            border-radius: 4px;
            text-align: center;

            .stat-title {
              color: var(--el-text-color-secondary);
              margin-bottom: 8px;
            }

            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: var(--el-color-primary);
            }
          }
        }
      }
    }
  }
}
</style>