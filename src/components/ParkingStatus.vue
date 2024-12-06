<template>
  <el-card class="parking-status">
    <template #header>
      <div class="card-header">
        <span>Parking Lot Status</span>
        <el-button type="primary" size="small" @click="refreshStatus">
          Refresh
        </el-button>
      </div>
    </template>
    
    <el-row :gutter="20">
      <el-col :span="8" v-for="lot in parkingLots" :key="lot.id">
        <el-card class="lot-card" shadow="hover">
          <h3>{{ lot.name }}</h3>
          <div class="status-info">
            <el-progress
              type="dashboard"
              :percentage="calculateOccupancy(lot)"
              :color="getProgressColor"
            />
            <div class="status-details">
              <div class="status-item">
                <span class="label">Total Spots:</span>
                <span class="value">{{ lot.totalSpots }}</span>
              </div>
              <div class="status-item">
                <span class="label">Occupied:</span>
                <span class="value">{{ lot.occupiedSpots }}</span>
              </div>
              <div class="status-item">
                <span class="label">Available:</span>
                <span class="value">{{ lot.availableSpots }}</span>
              </div>
              <div class="status-item">
                <span class="label">Maintenance:</span>
                <span class="value">{{ lot.maintenanceSpots }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { ParkingLotStatus } from '@/types/dispatch'

// 模拟数据
const parkingLots = ref<ParkingLotStatus[]>([
  {
    id: '1',
    name: 'West Lake Parking Lot',
    totalSpots: 200,
    occupiedSpots: 150,
    availableSpots: 40,
    maintenanceSpots: 10
  },
  {
    id: '2',
    name: 'East Lake Parking Lot',
    totalSpots: 300,
    occupiedSpots: 220,
    availableSpots: 70,
    maintenanceSpots: 10
  },
  {
    id: '3',
    name: 'South Lake Parking Lot',
    totalSpots: 150,
    occupiedSpots: 80,
    availableSpots: 65,
    maintenanceSpots: 5
  }
])

const calculateOccupancy = (lot: ParkingLotStatus) => {
  return Math.round((lot.occupiedSpots / lot.totalSpots) * 100)
}

const getProgressColor = (percentage: number) => {
  if (percentage < 60) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

const refreshStatus = async () => {
  // 模拟刷新操作
  ElMessage.success('Data updated')
}

onMounted(() => {
  refreshStatus()
})
</script>

<style scoped lang="scss">
.parking-status {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .lot-card {
    h3 {
      margin: 0 0 15px;
      color: #303133;
    }
    
    .status-info {
      display: flex;
      align-items: center;
      justify-content: space-around;
      
      .status-details {
        .status-item {
          margin: 8px 0;
          
          .label {
            color: #909399;
            margin-right: 8px;
          }
          
          .value {
            color: #303133;
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style> 