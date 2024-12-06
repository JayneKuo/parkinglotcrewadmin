<template>
  <div class="parking-layout">
    <el-card class="overview-card">
      <template #header>
        <div class="header">
          <h3>Parking Overview</h3>
          <el-button type="primary" size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon> Refresh
          </el-button>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in parkingStats" :key="stat.label">
          <div class="stat-box" :class="stat.type">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <div class="parking-zones">
      <div v-for="zone in parkingData.zones" :key="zone.id" class="zone-section">
        <div class="zone-header">
          <h4>{{ zone.name }} ({{ zone.floor }})</h4>
          <div class="zone-info">
            <el-tag size="small">{{ zone.type }}</el-tag>
            <el-tag size="small" type="warning">${{ zone.hourlyRate }}/h</el-tag>
          </div>
        </div>

        <div class="spots-grid">
          <div 
            v-for="spot in zone.spots" 
            :key="spot.id"
            class="parking-spot"
            :class="[spot.status, getTimeClass(spot)]"
            @click="handleSpotClick(zone, spot)"
            @mouseenter="handleMouseEnter(spot)"
            @mouseleave="handleMouseLeave(spot)"
          >
            <div class="spot-content">
              <div class="spot-header">
                <span class="spot-no">{{ spot.spotNo }}</span>
                <el-tag size="small" :type="getStatusType(spot.status)">
                  {{ spot.status.toUpperCase() }}
                </el-tag>
              </div>
              
              <template v-if="spot.status === 'occupied'">
                <div class="vehicle-info">
                  <div class="plate-no">{{ spot.vehicleInfo?.plateNo }}</div>
                  <div class="time-info">
                    <span class="duration" :class="getTimeClass(spot)">
                      {{ getDuration(spot) }}
                    </span>
                    <span v-if="getRemainingTime(spot)" class="remaining-time" :class="getTimeClass(spot)">
                      {{ getRemainingTime(spot) }}
                    </span>
                  </div>
                </div>
              </template>

              <div class="spot-actions" v-show="spot.isHovered" @click.stop>
                <el-button-group>
                  <el-button 
                    type="info" 
                    size="small" 
                    @click="handleSpotClick(zone, spot)"
                  >
                    <el-icon><View /></el-icon> View
                  </el-button>
                </el-button-group>

                <template v-if="spot.status === 'available'">
                  <el-button-group>
                    <el-button type="success" size="small" @click="handleEntry(zone, spot)">
                      <el-icon><Plus /></el-icon> Entry
                    </el-button>
                    <el-button type="warning" size="small" @click="handleLock(zone, spot)">
                      <el-icon><Lock /></el-icon> Lock
                    </el-button>
                  </el-button-group>
                </template>
                
                <template v-if="spot.status === 'occupied'">
                  <el-button-group>
                    <el-button type="primary" size="small" @click="handleExit(zone, spot)">
                      <el-icon><Close /></el-icon> Exit
                    </el-button>
                    <el-button type="warning" size="small" @click="handleTransfer(zone, spot)">
                      <el-icon><Position /></el-icon> Transfer
                    </el-button>
                    <el-button 
                      v-if="isOvertime(spot)"
                      type="danger" 
                      size="small" 
                      @click="handleNotify(spot)"
                    >
                      <el-icon><Warning /></el-icon> Notify
                    </el-button>
                  </el-button-group>
                </template>
                
                <template v-if="spot.status === 'locked'">
                  <el-button type="primary" size="small" @click="handleUnlock(zone, spot)">
                    <el-icon><Unlock /></el-icon> Unlock
                  </el-button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="getDialogTitle"
      width="500px"
    >
      <template v-if="selectedSpot">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Spot No">{{ selectedSpot.spotNo }}</el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag :type="getStatusType(selectedSpot.status)">
              {{ selectedSpot.status.toUpperCase() }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Zone">{{ selectedZone?.name }}</el-descriptions-item>
          <el-descriptions-item label="Type">{{ selectedZone?.type }}</el-descriptions-item>
          <el-descriptions-item label="Rate">
            ${{ selectedZone?.hourlyRate }}/hour
          </el-descriptions-item>
        </el-descriptions>
        
        <template v-if="selectedSpot.status === 'occupied'">
          <el-divider>Vehicle Information</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Plate No">{{ selectedSpot.vehicleInfo?.plateNo }}</el-descriptions-item>
            <el-descriptions-item label="Entry Time">
              {{ formatDateTime(selectedSpot.vehicleInfo?.enterTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="Duration">{{ getDuration(selectedSpot) }}</el-descriptions-item>
            <el-descriptions-item label="Fee">
              ${{ calculateFee(selectedSpot) }}
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus, Close, Warning, Lock, Position, Unlock, View } from '@element-plus/icons-vue'
import type { ParkingZone, ParkingSpot } from '@/types/parking'

// 模拟数据
const parkingData = ref({
  zones: [
    {
      id: 'A',
      name: 'Zone A',
      floor: '1F',
      type: 'standard',
      hourlyRate: 5,
      spots: Array.from({ length: 20 }, (_, i) => ({
        id: `A-${i + 1}`,
        spotNo: `A-${i + 1}`,
        status: i < 10 ? 'occupied' : 'available',
        vehicleInfo: i < 10 ? {
          plateNo: `ABC${1000 + i}`,
          enterTime: new Date(Date.now() - Math.random() * 5 * 60 * 60 * 1000).toISOString()
        } : undefined
      }))
    },
    {
      id: 'B',
      name: 'Zone B',
      floor: '1F',
      type: 'compact',
      hourlyRate: 3,
      spots: Array.from({ length: 15 }, (_, i) => ({
        id: `B-${i + 1}`,
        spotNo: `B-${i + 1}`,
        status: i < 8 ? 'occupied' : 'available',
        vehicleInfo: i < 8 ? {
          plateNo: `XYZ${2000 + i}`,
          enterTime: new Date(Date.now() - Math.random() * 3 * 60 * 60 * 1000).toISOString()
        } : undefined
      }))
    }
  ]
})

// 统计数据
const parkingStats = computed(() => [
  {
    label: 'Total Spots',
    value: getTotalSpots(),
    type: 'total'
  },
  {
    label: 'Available',
    value: getAvailableSpots(),
    type: 'available'
  },
  {
    label: 'Occupied',
    value: getOccupiedSpots(),
    type: 'occupied'
  }
])

// 计算方法
const getTotalSpots = () => {
  return parkingData.value.zones.reduce((total, zone) => total + zone.spots.length, 0)
}

const getAvailableSpots = () => {
  return parkingData.value.zones.reduce((total, zone) => 
    total + zone.spots.filter(spot => spot.status === 'available').length, 0)
}

const getOccupiedSpots = () => {
  return parkingData.value.zones.reduce((total, zone) => 
    total + zone.spots.filter(spot => spot.status === 'occupied').length, 0)
}

// 状态样式
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    available: 'success',
    occupied: 'danger',
    maintenance: 'warning'
  }
  return types[status] || 'info'
}

// 获取停车时长
const getDuration = (spot: ParkingSpot) => {
  if (!spot.vehicleInfo?.enterTime) return ''
  const enterTime = new Date(spot.vehicleInfo.enterTime).getTime()
  const now = new Date().getTime()
  const hours = Math.floor((now - enterTime) / (1000 * 60 * 60))
  const minutes = Math.floor(((now - enterTime) % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

// 鼠标悬停处理
const handleMouseEnter = (spot: ParkingSpot) => {
  spot.isHovered = true
}

const handleMouseLeave = (spot: ParkingSpot) => {
  spot.isHovered = false
}

// 操作处理
const handleEntry = async (zone: ParkingZone, spot: ParkingSpot) => {
  try {
    const { value: plateNo } = await ElMessageBox.prompt('Enter plate number:', 'Vehicle Entry')
    spot.status = 'occupied'
    spot.vehicleInfo = {
      plateNo,
      enterTime: new Date().toISOString()
    }
    ElMessage.success('Vehicle entry recorded')
  } catch (error) {
    // 用户取消操作
  }
}

const handleExit = async (zone: ParkingZone, spot: ParkingSpot) => {
  try {
    await ElMessageBox.confirm(
      `Exit vehicle ${spot.vehicleInfo?.plateNo}?\nDuration: ${getDuration(spot)}`,
      'Vehicle Exit'
    )
    spot.status = 'available'
    spot.vehicleInfo = undefined
    ElMessage.success('Vehicle exit processed')
  } catch (error) {
    // 用户取消操作
  }
}

const refreshData = () => {
  ElMessage.success('Data refreshed')
}

// 添加时间相关的常量
const TIME_LIMITS = {
  OVERTIME: 3 * 60 * 60 * 1000,      // 3小时为超时
  WARNING: 2.5 * 60 * 60 * 1000      // 2.5小时开始预警
}

// 获取时间状态
const getTimeClass = (spot: ParkingSpot) => {
  if (!spot.vehicleInfo?.enterTime) return ''
  const enterTime = new Date(spot.vehicleInfo.enterTime).getTime()
  const now = new Date().getTime()
  const duration = now - enterTime
  
  if (duration > TIME_LIMITS.OVERTIME) return 'overtime'
  if (duration > TIME_LIMITS.WARNING) return 'warning'
  return ''
}

// 检查是否超时
const isOvertime = (spot: ParkingSpot) => {
  return getTimeClass(spot) === 'overtime'
}

// 获取剩余时间或超时时长
const getRemainingTime = (spot: ParkingSpot) => {
  if (!spot.vehicleInfo?.enterTime) return ''
  const enterTime = new Date(spot.vehicleInfo.enterTime).getTime()
  const now = new Date().getTime()
  const duration = now - enterTime
  
  if (duration > TIME_LIMITS.OVERTIME) {
    const overtime = duration - TIME_LIMITS.OVERTIME
    const hours = Math.floor(overtime / (1000 * 60 * 60))
    const minutes = Math.floor((overtime % (1000 * 60 * 60)) / (1000 * 60))
    return `Overtime ${hours}h ${minutes}m`
  }
  
  if (duration > TIME_LIMITS.WARNING) {
    const remaining = TIME_LIMITS.OVERTIME - duration
    const minutes = Math.floor(remaining / (1000 * 60))
    return `${minutes}m left`
  }
  
  return ''
}

// 添加车位转移功能
const handleTransfer = async (fromZone: ParkingZone, fromSpot: ParkingSpot) => {
  try {
    // 获取所有可用车位
    const availableSpots = parkingData.value.zones
      .flatMap(zone => zone.spots
        .filter(spot => spot.status === 'available')
        .map(spot => ({
          zone,
          spot,
          label: `${zone.name} - ${spot.spotNo}`
        }))
      )

    // 让用户选择目标车位
    const { value: targetSpotId } = await ElMessageBox.prompt(
      'Select target spot:',
      'Transfer Vehicle',
      {
        inputType: 'select',
        inputValue: '',
        inputPlaceholder: 'Select target spot',
        inputValidator: (value) => !!value,
        inputErrorMessage: 'Please select a target spot',
        inputOptions: availableSpots.map(item => ({
          label: item.label,
          value: item.spot.id
        }))
      }
    )

    // 找到目标车位
    const targetSpotInfo = availableSpots.find(item => item.spot.id === targetSpotId)
    if (!targetSpotInfo) return

    // 执行转移
    const { spot: toSpot } = targetSpotInfo
    toSpot.status = 'occupied'
    toSpot.vehicleInfo = fromSpot.vehicleInfo
    fromSpot.status = 'available'
    fromSpot.vehicleInfo = undefined

    ElMessage.success('Vehicle transferred successfully')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to transfer vehicle')
    }
  }
}

// 添加通知功能
const handleNotify = async (spot: ParkingSpot) => {
  try {
    await ElMessageBox.confirm(
      `Send overtime notification for vehicle ${spot.vehicleInfo?.plateNo}?`,
      'Overtime Notification'
    )
    ElMessage.success('Notification sent')
  } catch (error) {
    // 用户取消操作
  }
}

// 处理锁定车位
const handleLock = async (zone: ParkingZone, spot: ParkingSpot) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to lock this parking spot?',
      'Lock Spot',
      {
        confirmButtonText: 'Lock',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    spot.status = 'locked'
    spot.statusHistory = spot.statusHistory || []
    spot.statusHistory.push({
      status: 'locked',
      time: new Date().toISOString(),
      operator: 'Admin'
    })
    
    ElMessage.success('Spot locked successfully')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to lock spot')
    }
  }
}

// 处理解锁车位
const handleUnlock = async (zone: ParkingZone, spot: ParkingSpot) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to unlock this parking spot?',
      'Unlock Spot',
      {
        confirmButtonText: 'Unlock',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    spot.status = 'available'
    spot.statusHistory?.push({
      status: 'available',
      time: new Date().toISOString(),
      operator: 'Admin'
    })
    
    ElMessage.success('Spot unlocked successfully')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to unlock spot')
    }
  }
}

// 详情弹窗控制
const dialogVisible = ref(false)
const selectedZone = ref<ParkingZone | null>(null)
const selectedSpot = ref<ParkingSpot | null>(null)

// 点击车位显示详情
const handleSpotClick = (zone: ParkingZone, spot: ParkingSpot) => {
  selectedZone.value = zone
  selectedSpot.value = spot
  dialogVisible.value = true
}

// 计算弹窗标题
const getDialogTitle = computed(() => {
  if (!selectedSpot.value) return 'Spot Details'
  return `Spot Details - ${selectedSpot.value.spotNo}`
})

// 格式化时间
const formatDateTime = (time?: string) => {
  if (!time) return 'N/A'
  return new Date(time).toLocaleString()
}

// 计算费用
const calculateFee = (spot: ParkingSpot) => {
  if (!spot.vehicleInfo?.enterTime || !selectedZone.value?.hourlyRate) return '0.00'
  const enterTime = new Date(spot.vehicleInfo.enterTime).getTime()
  const now = new Date().getTime()
  const hours = Math.ceil((now - enterTime) / (1000 * 60 * 60))
  return (hours * selectedZone.value.hourlyRate).toFixed(2)
}
</script>

<style scoped lang="scss">
.parking-layout {
  .overview-card {
    margin-bottom: 20px;
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .stat-box {
      text-align: center;
      padding: 20px;
      border-radius: 4px;
      
      &.total { background-color: #ecf5ff; }
      &.available { background-color: #f0f9eb; }
      &.occupied { background-color: #fef0f0; }
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5px;
      }
    }
  }
  
  .parking-zones {
    .zone-section {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      
      .zone-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        h4 {
          margin: 0;
        }
        
        .zone-info {
          display: flex;
          gap: 10px;
        }
      }
      
      .spots-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        
        .parking-spot {
          padding: 15px;
          border-radius: 8px;
          border: 2px solid;
          position: relative;
          min-height: 100px;
          background-color: #fff;
          
          &.available {
            background-color: #fff;
            border-color: #67C23A;
            
            .spot-no {
              color: #303133;
            }
          }
          
          &.occupied {
            background-color: #fff;
            border-color: #F56C6C;
            
            .spot-no {
              color: #303133;
            }
            
            .plate-no {
              color: #303133;
              font-weight: 600;
            }
          }
          
          .spot-content {
            height: 100%;
          }
          
          .spot-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            
            .spot-no {
              font-weight: bold;
              font-size: 16px;
              font-family: 'Monaco', monospace;
              color: #303133;
              background-color: #f5f7fa;
              padding: 2px 6px;
              border-radius: 4px;
            }
          }
          
          .vehicle-info {
            .plate-no {
              font-size: 16px;
              margin-bottom: 5px;
              color: #303133;
              font-weight: 600;
              font-family: 'Monaco', monospace;
              background-color: #f5f7fa;
              padding: 2px 6px;
              border-radius: 4px;
              display: inline-block;
            }
            
            .time-info {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
              margin-top: 8px;

              .duration {
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 2px 6px;
                border-radius: 4px;
                transition: all 0.3s;

                &::before {
                  content: '';
                  display: inline-block;
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  animation: blink 1s infinite;
                }

                &.warning {
                  color: #E6A23C;
                  font-weight: bold;
                  font-size: 14px;
                  background-color: #fdf6ec;
                }

                &.overtime {
                  color: #F56C6C;
                  font-weight: bold;
                  font-size: 14px;
                  background-color: #fef0f0;
                }
              }

              .remaining-time {
                margin-left: 8px;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: bold;
                display: inline-block;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);

                &.warning {
                  background-color: #E6A23C;
                  color: #fff;
                  animation: blink 2s infinite;
                }

                &.overtime {
                  background-color: #F56C6C;
                  color: #fff;
                  animation: blink 1s infinite;
                }
              }
            }
          }
          
          .spot-actions {
            position: absolute;
            bottom: 10px;
            left: 0;
            right: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 8px;
            padding: 5px 10px;
            background-color: rgba(255, 255, 255, 0.95);
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 1;

            .el-button-group {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 4px;
              
              .el-button {
                margin: 0;
              }
            }
          }
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
            
            .spot-actions {
              opacity: 1;
            }
          }
          
          &.locked {
            background-color: #fff;
            border-color: #909399;
            
            .spot-no {
              color: #303133;
            }
          }
        }
      }
    }
  }
}

.spot {
  .time-info {
    .duration {
      &.warning {
        color: #E6A23C;
        font-weight: bold;
        font-size: 14px;
      }
      
      &.overtime {
        color: #F56C6C;
        font-weight: bold;
        font-size: 14px;
      }
    }
    
    .remaining-time {
      margin-left: 8px;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: bold;
      display: inline-block;
      margin-top: 4px;
      
      &.warning {
        background-color: #E6A23C;
        color: #fff;
        animation: pulse 2s infinite;
      }
      
      &.overtime {
        background-color: #F56C6C;
        color: #fff;
        animation: pulse 1s infinite;
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
</style> 