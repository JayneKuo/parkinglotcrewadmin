<template>
  <div class="dock-detail">
    <el-page-header @back="$router.back()">
      <template #content>Appointment Details</template>
    </el-page-header>

    <div class="detail-content">
      <!-- 基本信息卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>Basic Information</span>
            <div class="header-actions">
              <el-tag :type="getStatusType(appointment.status)">
                {{ appointment.status }}
              </el-tag>
            </div>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="Appointment ID">
            {{ appointment.appointmentId }}
          </el-descriptions-item>
          <el-descriptions-item label="Carrier">
            {{ appointment.carrier }}
          </el-descriptions-item>
          <el-descriptions-item label="Type">
            <el-tag :type="appointment.type === 'Inbound' ? 'success' : 'warning'">
              {{ appointment.type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Dock">
            {{ appointment.dockNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="Schedule">
            {{ appointment.date }}
          </el-descriptions-item>
          <el-descriptions-item label="Time Slot">
            {{ appointment.startTime }} - {{ appointment.endTime }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 时间线卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>Timeline</span>
          </div>
        </template>

        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in timeline"
            :key="index"
            :type="activity.type"
            :color="activity.color"
            :timestamp="activity.timestamp"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 操作记录卡片 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>Activity Log</span>
          </div>
        </template>

        <el-table :data="activityLog" border stripe>
          <el-table-column prop="timestamp" label="Time" width="180" />
          <el-table-column prop="action" label="Action" width="150" />
          <el-table-column prop="operator" label="Operator" width="150" />
          <el-table-column prop="description" label="Description" min-width="200" />
        </el-table>
      </el-card>
    </div>

    <!-- 底部操作栏 -->
    <div class="detail-footer">
      <el-button-group>
        <el-button 
          v-if="appointment.status === 'scheduled'"
          type="primary"
          @click="handleCheckIn"
        >
          <el-icon><Timer /></el-icon>Check In
        </el-button>
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>Edit
        </el-button>
        <el-button 
          v-if="appointment.status === 'scheduled'"
          type="warning" 
          @click="handleReschedule"
        >
          <el-icon><Calendar /></el-icon>Reschedule
        </el-button>
        <el-button 
          v-if="appointment.status === 'scheduled'"
          type="danger" 
          @click="handleCancel"
        >
          <el-icon><Delete /></el-icon>Cancel
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer, Edit, Calendar, Delete } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 预约详情
const appointment = ref({
  id: 'D001',
  appointmentId: 'APT-001',
  carrier: 'ABC Logistics',
  dockNumber: 'D01',
  date: '2024-03-20',
  startTime: '09:00',
  endTime: '10:00',
  type: 'Inbound',
  status: 'scheduled',
  dwellTime: 0
})

// 时间线数据
const timeline = ref([
  {
    timestamp: '2024-03-19 14:30',
    content: 'Appointment scheduled',
    type: 'primary',
    color: '#409EFF'
  },
  {
    timestamp: '2024-03-20 08:45',
    content: 'Carrier arrived',
    type: 'success',
    color: '#67C23A'
  }
])

// 操作记录
const activityLog = ref([
  {
    timestamp: '2024-03-19 14:30:00',
    action: 'Create',
    operator: 'John Doe',
    description: 'Created appointment'
  },
  {
    timestamp: '2024-03-20 08:45:00',
    action: 'Check In',
    operator: 'Jane Smith',
    description: 'Carrier checked in'
  }
])

// 获取状态样式
const getStatusType = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'info'
    case 'in_progress':
      return 'warning'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'danger'
    default:
      return 'info'
  }
}

// 加载数据
const loadData = async () => {
  const id = route.params.id
  // TODO: 调用API获取详情数据
}

// 签到
const handleCheckIn = async () => {
  try {
    // TODO: 调用API进行签到
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Check-in successful')
    loadData()
  } catch (error) {
    ElMessage.error('Check-in failed')
  }
}

// 编辑
const handleEdit = () => {
  router.push(`/dock/${appointment.value.id}/edit`)
}

// 重新预约
const handleReschedule = () => {
  router.push(`/dock/${appointment.value.id}/reschedule`)
}

// 取消预约
const handleCancel = () => {
  ElMessageBox.confirm(
    'Are you sure you want to cancel this appointment?',
    'Warning',
    {
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // TODO: 调用API取消预约
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('Appointment cancelled successfully')
      router.push('/dock')
    } catch (error) {
      ElMessage.error('Operation failed')
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.dock-detail {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 60px);
}

.detail-content {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.detail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style> 