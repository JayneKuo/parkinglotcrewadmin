<template>
  <div class="space-management">
    <!-- 区域筛选 -->
    <div class="filter-bar">
      <el-select v-model="currentZone" placeholder="选择区域" clearable>
        <el-option
          v-for="zone in zones"
          :key="zone.id"
          :label="zone.name"
          :value="zone.id"
        />
      </el-select>
      
      <el-select v-model="spaceStatus" placeholder="车位状态" clearable>
        <el-option label="空闲" value="available" />
        <el-option label="已占用" value="occupied" />
        <el-option label="已预约" value="reserved" />
        <el-option label="维护中" value="maintenance" />
      </el-select>

      <el-button type="primary" @click="handleBatchOperation">批量操作</el-button>
    </div>

    <!-- 车位网格 -->
    <div class="space-grid">
      <div 
        v-for="space in filteredSpaces" 
        :key="space.id"
        class="space-item"
        :class="[
          `status-${space.status}`,
          { selected: selectedSpaces.includes(space.id) }
        ]"
        @click="handleSpaceClick(space)"
      >
        <div class="space-number">{{ space.number }}</div>
        <div class="space-info">
          <template v-if="space.status === 'occupied'">
            <div class="plate-number">{{ space.currentVehicle?.plateNumber }}</div>
            <div class="entry-time">{{ formatTime(space.currentVehicle?.entryTime) }}</div>
          </template>
          <template v-else>
            <div class="status-text">{{ getStatusText(space.status) }}</div>
          </template>
        </div>
      </div>
    </div>

    <!-- 批量操作弹窗 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量操作"
      width="400px"
    >
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-select v-model="batchForm.action">
            <el-option label="修改状态" value="status" />
            <el-option label="调整区域" value="zone" />
          </el-select>
        </el-form-item>

        <template v-if="batchForm.action === 'status'">
          <el-form-item label="目标状态">
            <el-select v-model="batchForm.targetStatus">
              <el-option label="空闲" value="available" />
              <el-option label="维护中" value="maintenance" />
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="目标区域">
            <el-select v-model="batchForm.targetZone">
              <el-option
                v-for="zone in zones"
                :key="zone.id"
                :label="zone.name"
                :value="zone.id"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 车位详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`车位详情 - ${currentSpace?.number}`"
      width="500px"
    >
      <template v-if="currentSpace">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="车位编号">
            {{ currentSpace.number }}
          </el-descriptions-item>
          <el-descriptions-item label="所属区域">
            {{ getZoneName(currentSpace.zoneId) }}
          </el-descriptions-item>
          <el-descriptions-item label="车位类型">
            {{ getSpaceTypeText(currentSpace.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusType(currentSpace.status)">
              {{ getStatusText(currentSpace.status) }}
            </el-tag>
          </el-descriptions-item>
          <template v-if="currentSpace.status === 'occupied'">
            <el-descriptions-item label="车牌号">
              {{ currentSpace.currentVehicle?.plateNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="入场时间">
              {{ formatTime(currentSpace.currentVehicle?.entryTime) }}
            </el-descriptions-item>
          </template>
        </el-descriptions>

        <div class="space-actions">
          <el-button 
            v-if="currentSpace.status === 'occupied'"
            type="primary"
            @click="handleCheckout(currentSpace)"
          >
            结算离场
          </el-button>
          <el-button 
            v-if="currentSpace.status === 'available'"
            type="success"
            @click="handlePark(currentSpace)"
          >
            停车入场
          </el-button>
          <el-button 
            v-if="['available', 'maintenance'].includes(currentSpace.status)"
            :type="currentSpace.status === 'maintenance' ? 'success' : 'warning'"
            @click="handleMaintenanceToggle(currentSpace)"
          >
            {{ currentSpace.status === 'maintenance' ? '恢复使用' : '设为维护' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { ParkingSpace } from '@/types/parking'

// 模拟数据
const zones = ref([
  { id: 'A', name: 'A区' },
  { id: 'B', name: 'B区' }
])

const spaces = ref<ParkingSpace[]>([
  {
    id: '1',
    number: 'A001',
    zoneId: 'A',
    type: 'standard',
    status: 'available'
  },
  {
    id: '2',
    number: 'A002',
    zoneId: 'A',
    type: 'standard',
    status: 'occupied',
    currentVehicle: {
      plateNumber: '京A12345',
      entryTime: '2024-02-15 10:00:00'
    }
  }
])

// 状态管理
const currentZone = ref('')
const spaceStatus = ref('')
const selectedSpaces = ref<string[]>([])
const batchDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentSpace = ref<ParkingSpace | null>(null)

// 批量操作表单
const batchForm = ref({
  action: 'status',
  targetStatus: 'available',
  targetZone: ''
})

// 过滤车位列表
const filteredSpaces = computed(() => {
  let result = [...spaces.value]
  
  if (currentZone.value) {
    result = result.filter(space => space.zoneId === currentZone.value)
  }
  
  if (spaceStatus.value) {
    result = result.filter(space => space.status === spaceStatus.value)
  }
  
  return result
})

// 获取区域名称
const getZoneName = (zoneId: string) => {
  return zones.value.find(zone => zone.id === zoneId)?.name || zoneId
}

// 获取车位类型文本
const getSpaceTypeText = (type: string) => {
  const map: Record<string, string> = {
    standard: '标准车位',
    large: '大型车位',
    valet: '代客泊车'
  }
  return map[type] || type
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    available: '空闲',
    occupied: '已占用',
    reserved: '已预约',
    maintenance: '维护中'
  }
  return map[status] || status
}

// 获取状态样式类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    available: 'success',
    occupied: 'warning',
    reserved: 'info',
    maintenance: 'danger'
  }
  return map[status] || ''
}

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return '-'
  return time
}

// 处理车位点击
const handleSpaceClick = (space: ParkingSpace) => {
  currentSpace.value = space
  detailDialogVisible.value = true
}

// 处理批量操作
const handleBatchOperation = () => {
  if (selectedSpaces.value.length === 0) {
    ElMessage.warning('请先选择车位')
    return
  }
  batchDialogVisible.value = true
}

// 提交批量操作
const handleBatchSubmit = () => {
  ElMessage.success('操作成功')
  batchDialogVisible.value = false
  selectedSpaces.value = []
}

// 结算离场
const handleCheckout = (space: ParkingSpace) => {
  ElMessage.success('结算成功')
  detailDialogVisible.value = false
}

// 停车入场
const handlePark = (space: ParkingSpace) => {
  ElMessage.success('入场成功')
  detailDialogVisible.value = false
}

// 切换维护状态
const handleMaintenanceToggle = (space: ParkingSpace) => {
  const newStatus = space.status === 'maintenance' ? 'available' : 'maintenance'
  ElMessage.success(`车位已${newStatus === 'maintenance' ? '设为维护' : '恢复使用'}`)
  detailDialogVisible.value = false
}
</script>

<style scoped lang="scss">
.space-management {
  .filter-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 16px;
  }

  .space-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .space-item {
      background-color: #fff;
      border-radius: 4px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      &.selected {
        border-color: #409eff;
      }

      &.status-available {
        background-color: #f0f9eb;
      }

      &.status-occupied {
        background-color: #fdf6ec;
      }

      &.status-reserved {
        background-color: #f4f4f5;
      }

      &.status-maintenance {
        background-color: #fef0f0;
      }

      .space-number {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .space-info {
        font-size: 12px;
        color: #606266;

        .plate-number {
          margin-bottom: 4px;
        }

        .entry-time {
          color: #909399;
        }

        .status-text {
          color: #909399;
        }
      }
    }
  }

  .space-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}
</style>