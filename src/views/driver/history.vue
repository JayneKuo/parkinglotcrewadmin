<template>
  <div class="driver-history">
    <el-page-header @back="$router.back()">
      <template #content>Parking History - {{ driver?.name }}</template>
    </el-page-header>

    <el-card class="history-list">
      <template #header>
        <div class="card-header">
          <span>Parking Records</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            @change="handleDateChange"
          />
        </div>
      </template>

      <el-table :data="parkingRecords" border>
        <el-table-column prop="plateNumber" label="Plate Number" width="150" />
        <el-table-column prop="location" label="Location" width="200" />
        <el-table-column prop="entryTime" label="Entry Time" width="180" />
        <el-table-column prop="exitTime" label="Exit Time" width="180" />
        <el-table-column prop="duration" label="Duration" width="120">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="Fee" width="120">
          <template #default="{ row }">
            ${{ row.fee.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Driver } from '@/types/driver'
import { mockDrivers } from '@/mock/driver'

const route = useRoute()
const router = useRouter()

// 司机数据
const driver = ref<Driver>()
const dateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 模拟停车记录
const parkingRecords = ref([
  {
    plateNumber: 'ABC123',
    location: 'Main Entrance',
    entryTime: '2024-03-15 09:00:00',
    exitTime: '2024-03-15 17:30:00',
    duration: 510, // 分钟
    fee: 25.50,
    status: 'completed'
  },
  // ... 更多记录
])

// 加载司机数据
const loadDriver = () => {
  const id = route.params.id as string
  const found = mockDrivers.find(d => d.id === id)
  if (found) {
    driver.value = { ...found }
  } else {
    ElMessage.error('Driver not found')
    router.push('/driver')
  }
}

// 格式化时长
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// 日期范围改变
const handleDateChange = (dates: [Date, Date] | null) => {
  if (dates) {
    // TODO: 根据日期筛选记录
  }
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

// 页码改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: 重新加载数据
}

onMounted(() => {
  loadDriver()
})
</script>

<style scoped>
.driver-history {
  padding: 20px;
}

.history-list {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 