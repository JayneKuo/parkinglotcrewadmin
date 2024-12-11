<template>
  <div class="dock-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <div class="search-header">
        <div class="search-form">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="Search by dock number/carrier/appointment" 
            clearable
            :prefix-icon="Search"
            style="width: 300px"
          />
          <el-select v-model="searchForm.status" placeholder="Status" clearable>
            <el-option
              v-for="status in dockStatus"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            >
              <el-tag :type="getStatusType(status.value)" size="small">
                {{ status.label }}
              </el-tag>
            </el-option>
          </el-select>
          <el-date-picker
            v-model="searchForm.date"
            type="date"
            placeholder="Select Date"
          />
          <div class="search-buttons">
            <el-button type="primary" @click="handleSearch">Search</el-button>
            <el-button @click="handleReset">Reset</el-button>
          </div>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>Schedule Appointment
        </el-button>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <template #header>Today's Appointments</template>
        <div class="stat-value">{{ stats.todayAppointments }}</div>
      </el-card>
      <el-card class="stat-card">
        <template #header>Average Dwell Time</template>
        <div class="stat-value">{{ stats.avgDwellTime }} mins</div>
      </el-card>
      <el-card class="stat-card">
        <template #header>On-Time Arrivals</template>
        <div class="stat-value">{{ stats.onTimePercentage }}%</div>
      </el-card>
      <el-card class="stat-card">
        <template #header>Available Docks</template>
        <div class="stat-value">{{ stats.availableDocks }}/{{ stats.totalDocks }}</div>
      </el-card>
    </div>

    <!-- 列表区域 -->
    <el-card class="list-card">
      <el-table :data="appointmentList" border stripe>
        <!-- 基本信息 -->
        <el-table-column label="Appointment" min-width="200">
          <template #default="{ row }">
            <div class="appointment-info">
              <div class="appointment-id">{{ row.appointmentId }}</div>
              <div class="appointment-time">
                <el-tag size="small" :type="row.type === 'Inbound' ? 'success' : 'warning'">
                  {{ row.type }}
                </el-tag>
                <span>{{ row.startDate }} {{ row.startTime }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 停车场和码头信息 -->
        <el-table-column label="Location" min-width="200">
          <template #default="{ row }">
            <div class="location-info">
              <div>{{ row.parkingLotName }}</div>
              <div class="dock-tags">
                <el-tag 
                  v-for="dock in row.dockNumbers" 
                  :key="dock"
                  size="small"
                  effect="plain"
                >
                  {{ dock }}
                </el-tag>
                <el-tag size="small" type="info">{{ row.parkingSpots }} spots</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 司机信息 -->
        <el-table-column label="Driver" min-width="200">
          <template #default="{ row }">
            <div class="driver-info">
              <div class="carrier-name">{{ row.carrier }}</div>
              <div class="driver-details">
                <span>{{ row.driverName }}</span>
                <el-divider direction="vertical" />
                <span>{{ row.vehiclePlate }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 货物信息 -->
        <el-table-column label="Cargo" min-width="180">
          <template #default="{ row }">
            <div class="cargo-info">
              <template v-if="row.containerNumber || row.poNumber">
                <div>{{ row.containerNumber || 'N/A' }}</div>
                <div>{{ row.poNumber || 'N/A' }}</div>
              </template>
              <div v-if="row.cargoType" class="cargo-details">
                <el-tag size="small">{{ row.cargoType }}</el-tag>
                <span v-if="row.palletCount">{{ row.palletCount }} pallets</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 状态信息 -->
        <el-table-column label="Status" width="120" align="center">
          <template #default="{ row }">
            <div class="status-info">
              <el-tag :type="getStatusType(row.status as DockAppointmentStatus)">
                {{ STATUS_CONFIG[row.status as DockAppointmentStatus].label }}
              </el-tag>
              <div v-if="row.dwellTime > 0" class="dwell-time">
                {{ row.dwellTime }}min
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 操作按钮 -->
        <el-table-column width="80" fixed="right" align="center">
          <template #default="{ row }">
            <el-dropdown 
              trigger="hover" 
              @command="(command) => handleCommand(command, row)"
            >
              <el-button type="primary" link>
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="action in getStatusActions(row.status)"
                    :key="action.action"
                    :command="action.action"
                  >
                    <el-icon><component :is="action.icon" /></el-icon>
                    {{ action.label }}
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

    <!-- 预约表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? 'Schedule Appointment' : 'Edit Appointment'"
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="appointmentForm"
        :rules="rules"
        label-width="140px"
        class="appointment-form"
      >
        <!-- 司机信息 -->
        <el-divider>Driver Information</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Carrier" prop="carrier" required>
              <el-input v-model="appointmentForm.carrier" placeholder="Enter carrier name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Driver Name" prop="driverName" required>
              <el-input v-model="appointmentForm.driverName" placeholder="Enter driver name" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Driver Phone" prop="driverPhone" required>
              <el-input v-model="appointmentForm.driverPhone" placeholder="Enter driver phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Vehicle Plate" prop="vehiclePlate" required>
              <el-input v-model="appointmentForm.vehiclePlate" placeholder="Enter vehicle plate" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 预约信息 -->
        <el-divider>Appointment Details</el-divider>

        <!-- 第一行：车场选择 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Parking Lot" prop="parkingLotId" required>
              <el-select 
                v-model="appointmentForm.parkingLotId" 
                placeholder="Select parking lot"
                @change="handleParkingLotChange"
              >
                <el-option
                  v-for="lot in parkingLots"
                  :key="lot.id"
                  :label="lot.name"
                  :value="lot.id"
                  :disabled="!lot.hasDockService"
                >
                  <span>{{ lot.name }}</span>
                  <el-tag v-if="lot.hasDockService" size="small" type="success">Dock Available</el-tag>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="Type" prop="type" required>
              <el-radio-group v-model="appointmentForm.type">
                <el-radio label="Inbound">Inbound</el-radio>
                <el-radio label="Outbound">Outbound</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：计费和时间选择 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Billing Type" prop="billingType" required>
              <el-select v-model="appointmentForm.billingType" placeholder="Select billing type">
                <el-option label="Hourly Rate" value="hourly">
                  <span>Hourly Rate</span>
                  <span class="rate-info">($10/hour)</span>
                </el-option>
                <el-option label="Fixed Rate" value="fixed">
                  <span>Fixed Rate</span>
                  <span class="rate-info">($50/visit)</span>
                </el-option>
                <el-option label="Day Rate" value="daily">
                  <span>Day Rate</span>
                  <span class="rate-info">($80/day)</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Start Date" prop="startDate" required>
              <el-date-picker
                v-model="appointmentForm.startDate"
                type="date"
                placeholder="Select start date"
                :disabled-date="disabledDate"
                class="w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Start Time" prop="startTime" required>
              <el-time-select
                v-model="appointmentForm.startTime"
                start="08:00"
                step="00:30"
                end="17:30"
                placeholder="Select start time"
                class="w-full"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="Estimated Duration" prop="estimatedDuration" required>
              <el-input-number
                v-model="appointmentForm.estimatedDuration"
                :min="30"
                :max="480"
                :step="30"
                controls-position="right"
                class="w-full"
              >
                <template #suffix>minutes</template>
              </el-input-number>
              <div class="form-tip">Minimum 30 minutes, maximum 8 hours</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="End Time" class="readonly-field">
              <el-input :model-value="calculateEndTime" readonly>
                <template #prefix>Estimated End:</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：时间段和车位数量 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Parking Spots" prop="parkingSpots" required>
              <el-input-number 
                v-model="appointmentForm.parkingSpots"
                :min="1"
                :max="5"
                controls-position="right"
                placeholder="Number of spots needed"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：码头选择 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Docks" prop="dockNumbers" required>
              <el-select 
                v-model="appointmentForm.dockNumbers" 
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="Select docks"
                :disabled="!appointmentForm.parkingLotId"
              >
                <el-option
                  v-for="dock in availableDocks"
                  :key="dock.id"
                  :label="dock.name"
                  :value="dock.id"
                  :disabled="dock.status !== 'active'"
                >
                  <div class="dock-option">
                    <span>{{ dock.name }}</span>
                    <div class="dock-info">
                      <el-tag size="small">{{ dock.features.join(', ') }}</el-tag>
                      <span>Max: {{ dock.capacity }}t</span>
                    </div>
                  </div>
                </el-option>
              </el-select>
              <div class="form-tip">You can select multiple docks based on your needs</div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 货物信息 -->
        <el-divider>Cargo Information</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Container Number" prop="containerNumber">
              <el-input 
                v-model="appointmentForm.containerNumber" 
                placeholder="Enter container number (optional)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="PO Number" prop="poNumber">
              <el-input 
                v-model="appointmentForm.poNumber" 
                placeholder="Enter PO number (optional)"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Cargo Type" prop="cargoType">
              <el-select 
                v-model="appointmentForm.cargoType" 
                placeholder="Select cargo type (optional)"
              >
                <el-option label="General Cargo" value="general" />
                <el-option label="Refrigerated" value="refrigerated" />
                <el-option label="Hazardous" value="hazardous" />
                <el-option label="Fragile" value="fragile" />
                <el-option label="Heavy Equipment" value="heavy" />
                <el-option label="Bulk Materials" value="bulk" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Total Weight" prop="totalWeight">
              <el-input-number 
                v-model="appointmentForm.totalWeight"
                :min="0"
                :max="maxWeight"
                :step="0.1"
                controls-position="right"
                placeholder="Enter weight (optional)"
              >
                <template #suffix>tons</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Pallet Count" prop="palletCount">
              <el-input-number 
                v-model="appointmentForm.palletCount"
                :min="0"
                :step="1"
                controls-position="right"
                placeholder="Enter pallet count (optional)"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 备注信息 -->
        <el-form-item label="Notes" prop="notes">
          <el-input
            v-model="appointmentForm.notes"
            type="textarea"
            rows="3"
            placeholder="Enter any special instructions or notes"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ dialogType === 'add' ? 'Schedule' : 'Update' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 预约详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="Appointment Details"
      width="600px"
    >
      <el-descriptions v-if="currentAppointment" :column="1" border>
        <el-descriptions-item label="Appointment ID">
          {{ currentAppointment.appointmentId }}
        </el-descriptions-item>
        <el-descriptions-item label="Carrier">
          {{ currentAppointment.carrier }}
        </el-descriptions-item>
        <el-descriptions-item label="Type">
          <el-tag :type="currentAppointment.type === 'Inbound' ? 'success' : 'warning'">
            {{ currentAppointment.type }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Dock">
          {{ currentAppointment.dockNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="Schedule">
          {{ currentAppointment.date }} {{ currentAppointment.startTime }} - {{ currentAppointment.endTime }}
        </el-descriptions-item>
        <el-descriptions-item label="Status">
          <el-tag :type="getStatusType(currentAppointment.status as DockAppointmentStatus)">
            {{ STATUS_CONFIG[currentAppointment.status as DockAppointmentStatus].label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Dwell Time" v-if="currentAppointment.dwellTime">
          {{ currentAppointment.dwellTime }} mins
        </el-descriptions-item>
        <el-descriptions-item label="Notes" v-if="currentAppointment.notes">
          {{ currentAppointment.notes }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { 
  Plus, Edit, Delete, More, Search,
  View, Timer, Calendar, CreditCard, Briefcase
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { 
  DockAppointmentStatus, 
  DockAppointment,
  STATUS_ACTIONS,
  STATUS_CONFIG 
} from '@/types/dock'

// 搜索表单
const searchForm = ref({
  keyword: '',
  status: '',
  date: null as Date | null,
  type: '',
  paymentStatus: ''
})

// 统计数据
const stats = ref({
  todayAppointments: 24,
  avgDwellTime: 45,
  onTimePercentage: 92,
  availableDocks: 8,
  totalDocks: 12
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 预约列表
const appointmentList = ref<DockAppointment[]>([
  {
    id: 'D001',
    appointmentId: 'APT-20240320-001',
    carrier: 'ABC Logistics',
    driverName: 'John Smith',
    driverPhone: '1234567890',
    vehiclePlate: 'ABC123',
    parkingLotName: 'Main Parking',
    dockNumbers: [],
    parkingSpots: 0,
    type: 'Inbound',
    startDate: '2024-03-20',
    startTime: '09:00',
    endTime: '10:00',
    estimatedDuration: 60,
    containerNumber: 'CONT123456',
    poNumber: 'PO-2024-001',
    cargoType: 'general',
    totalWeight: 15.5,
    palletCount: 12,
    status: DockAppointmentStatus.REQUESTED,
    dwellTime: 0,
    billingType: 'hourly'
  },
  {
    id: 'D002',
    appointmentId: 'APT-20240320-002',
    carrier: 'XYZ Transport',
    driverName: 'Mike Johnson',
    driverPhone: '9876543210',
    vehiclePlate: 'XYZ789',
    parkingLotName: 'East Wing Parking',
    dockNumbers: [],
    parkingSpots: 0,
    type: 'Outbound',
    startDate: '2024-03-20',
    startTime: '10:00',
    endTime: '11:30',
    estimatedDuration: 90,
    containerNumber: 'CONT789012',
    cargoType: 'refrigerated',
    totalWeight: 8.2,
    palletCount: 6,
    status: DockAppointmentStatus.SCHEDULED,
    dwellTime: 0,
    billingType: 'fixed'
  },
  {
    id: 'D003',
    appointmentId: 'APT-20240320-003',
    carrier: 'Fast Delivery',
    driverName: 'Sarah Wilson',
    driverPhone: '5556667777',
    vehiclePlate: 'FD456',
    parkingLotName: 'Main Parking',
    dockNumbers: ['D01'],
    parkingSpots: 1,
    type: 'Inbound',
    startDate: '2024-03-20',
    startTime: '08:00',
    endTime: '09:00',
    estimatedDuration: 60,
    poNumber: 'PO-2024-003',
    cargoType: 'hazardous',
    totalWeight: 12.0,
    palletCount: 8,
    status: DockAppointmentStatus.ARRIVED,
    dwellTime: 15,
    billingType: 'hourly'
  },
  {
    id: 'D004',
    appointmentId: 'APT-20240320-004',
    carrier: 'Global Shipping',
    driverName: 'Tom Brown',
    driverPhone: '4445556666',
    vehiclePlate: 'GS789',
    parkingLotName: 'South Parking',
    dockNumbers: ['D05'],
    parkingSpots: 2,
    type: 'Outbound',
    startDate: '2024-03-20',
    startTime: '14:00',
    endTime: '16:00',
    estimatedDuration: 120,
    containerNumber: 'CONT345678',
    cargoType: 'bulk',
    totalWeight: 25.0,
    palletCount: 20,
    status: DockAppointmentStatus.IN_PROGRESS,
    dwellTime: 45,
    billingType: 'daily'
  },
  {
    id: 'D005',
    appointmentId: 'APT-20240320-005',
    carrier: 'Quick Logistics',
    driverName: 'Emma Davis',
    driverPhone: '3334445555',
    vehiclePlate: 'QL123',
    parkingLotName: 'Main Parking',
    dockNumbers: ['D02'],
    parkingSpots: 1,
    type: 'Inbound',
    startDate: '2024-03-20',
    startTime: '11:00',
    endTime: '12:00',
    estimatedDuration: 60,
    containerNumber: 'CONT567890',
    cargoType: 'general',
    totalWeight: 18.0,
    palletCount: 15,
    status: DockAppointmentStatus.LOADING_COMPLETED,
    dwellTime: 65,
    billingType: 'hourly'
  },
  {
    id: 'D006',
    appointmentId: 'APT-20240320-006',
    carrier: 'Express Cargo',
    driverName: 'David Lee',
    driverPhone: '2223334444',
    vehiclePlate: 'EC456',
    parkingLotName: 'East Wing Parking',
    dockNumbers: ['D04'],
    parkingSpots: 1,
    type: 'Outbound',
    startDate: '2024-03-20',
    startTime: '13:00',
    endTime: '14:00',
    estimatedDuration: 60,
    poNumber: 'PO-2024-006',
    cargoType: 'refrigerated',
    totalWeight: 10.0,
    palletCount: 10,
    status: DockAppointmentStatus.PAYMENT_PENDING,
    dwellTime: 75,
    billingType: 'fixed',
    paymentAmount: 150
  },
  {
    id: 'D007',
    appointmentId: 'APT-20240320-007',
    carrier: 'Safe Transport',
    driverName: 'Linda White',
    driverPhone: '1112223333',
    vehiclePlate: 'ST789',
    parkingLotName: 'South Parking',
    dockNumbers: ['D05'],
    parkingSpots: 1,
    type: 'Inbound',
    startDate: '2024-03-20',
    startTime: '15:00',
    endTime: '16:00',
    estimatedDuration: 60,
    containerNumber: 'CONT901234',
    cargoType: 'hazardous',
    totalWeight: 20.0,
    palletCount: 16,
    status: DockAppointmentStatus.COMPLETED,
    dwellTime: 62,
    billingType: 'hourly',
    paymentStatus: 'paid',
    paymentAmount: 200
  },
  {
    id: 'D008',
    appointmentId: 'APT-20240320-008',
    carrier: 'City Logistics',
    driverName: 'Peter Chen',
    driverPhone: '9998887777',
    vehiclePlate: 'CL321',
    parkingLotName: 'Main Parking',
    dockNumbers: ['D01'],
    parkingSpots: 2,
    type: 'Outbound',
    startDate: '2024-03-20',
    startTime: '16:00',
    endTime: '17:00',
    estimatedDuration: 60,
    poNumber: 'PO-2024-008',
    cargoType: 'general',
    totalWeight: 15.0,
    palletCount: 12,
    status: DockAppointmentStatus.CANCELLED,
    dwellTime: 0,
    billingType: 'daily',
    cancellationReason: '司机临时有事',
    cancelledBy: 'user123',
    cancelledAt: '2024-03-19T18:00:00Z'
  }
])

// 状态选项
const dockStatus = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label
}))

// 获取状态样式
const getStatusType = (status: DockAppointmentStatus) => {
  return STATUS_CONFIG[status].type
}

// 对话框控制
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const detailVisible = ref(false)
const submitting = ref(false)
const currentAppointment = ref<DockAppointment | null>(null)

// 在 appointmentForm 之前添加
const maxWeight = ref(0)

// 修改表单接口定义
interface AppointmentForm {
  // 基本信息
  parkingLotId: string
  dockNumber: string
  type: 'Inbound' | 'Outbound'
  
  // 预约信息
  startDate: string
  startTime: string
  endTime: string
  estimatedDuration: number
  
  // 司机信息
  carrier: string
  driverName: string
  driverPhone: string
  driverEmail: string
  vehiclePlate: string
  
  // 货物信息
  containerNumber?: string
  poNumber?: string
  cargoType?: string
  totalWeight?: number
  palletCount: number
  dockNumbers: string[]
  parkingSpots: number
  
  // 计费信息
  billingType: 'hourly' | 'fixed' | 'daily'
  
  // 其他信息
  specialInstructions: string
  specialRequirements: string[]
}

// 修改表单默认值
const appointmentForm = ref<AppointmentForm>({
  parkingLotId: '',
  dockNumber: '',
  type: 'Inbound',
  startDate: '',
  startTime: '',
  endTime: '',
  estimatedDuration: 60,
  carrier: '',
  driverName: '',
  driverPhone: '',
  driverEmail: '',
  vehiclePlate: '',
  containerNumber: '',
  poNumber: '',
  cargoType: '',
  totalWeight: 0,
  palletCount: 0,
  dockNumbers: [],
  parkingSpots: 1,
  billingType: 'hourly',
  specialInstructions: '',
  specialRequirements: []
})

// 停车场列表
const parkingLots = ref([
  { 
    id: 'P001', 
    name: 'Main Parking', 
    hasDockService: true,
    location: 'North Area',
    totalSpots: 50,      // 总车位数
    availableSpots: 30,  // 可用车位数
    docks: [
      { 
        id: 'D01', 
        name: 'Dock 01', 
        capacity: 10,
        status: 'active',
        features: ['refrigerated', 'hazardous'],
        height: 4.5, // 米
        width: 3.2  // 米
      },
      { 
        id: 'D02', 
        name: 'Dock 02', 
        capacity: 15,
        status: 'active',
        features: ['general', 'bulk'],
        height: 4.2,
        width: 3.5
      }
    ]
  },
  { 
    id: 'P002', 
    name: 'East Wing Parking', 
    hasDockService: true,
    location: 'East Area',
    docks: [
      { 
        id: 'D03', 
        name: 'Dock 03', 
        capacity: 20,
        status: 'maintenance',
        features: ['general', 'refrigerated'],
        height: 4.8,
        width: 3.8
      },
      { 
        id: 'D04', 
        name: 'Dock 04', 
        capacity: 12,
        status: 'active',
        features: ['general'],
        height: 4.0,
        width: 3.0
      }
    ]
  },
  { 
    id: 'P003', 
    name: 'West Wing Parking', 
    hasDockService: false,
    location: 'West Area'
  },
  { 
    id: 'P004', 
    name: 'South Parking', 
    hasDockService: true,
    location: 'South Area',
    docks: [
      { 
        id: 'D05', 
        name: 'Dock 05', 
        capacity: 18,
        status: 'active',
        features: ['general', 'hazardous', 'bulk'],
        height: 5.0,
        width: 4.0
      }
    ]
  },
  { 
    id: 'P005', 
    name: 'Underground Parking', 
    hasDockService: false,
    location: 'Basement'
  }
])

// 可用码头列表
const availableDocks = ref<{
  id: string
  name: string
  capacity: number
  status: string
  features: string[]
  height: number
  width: number
}[]>([])

// 表单验证规则
const rules = {
  // 基本信息验证
  parkingLotId: [
    { required: true, message: 'Please select parking lot', trigger: 'change' }
  ],
  dockNumber: [
    { required: true, message: 'Please select dock', trigger: 'change' }
  ],
  type: [
    { required: true, message: 'Please select type', trigger: 'change' }
  ],
  
  // 集装箱/PO信息验证
  containerNumbers: [
    { required: true, message: 'Please enter container numbers', trigger: 'blur' }
  ],
  poNumbers: [
    { required: true, message: 'Please enter PO numbers', trigger: 'blur' }
  ],
  scac: [
    { required: true, message: 'Please enter SCAC', trigger: 'blur' }
  ],
  vendorId: [
    { required: true, message: 'Please enter vendor ID', trigger: 'blur' }
  ],
  
  // 货物信息验证
  cartonCount: [
    { required: true, message: 'Please enter carton count', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Count must be greater than 0', trigger: 'blur' }
  ],
  palletCount: [
    { type: 'number', min: 0, message: 'Count must be greater than or equal to 0', trigger: 'blur' }
  ],
  
  // 时间信息验证
  startDate: [
    { required: true, message: 'Please select start date', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: 'Please select start time', trigger: 'change' }
  ],
  estimatedDuration: [
    { required: true, message: 'Please enter estimated duration', trigger: 'change' },
    { type: 'number', min: 30, message: 'Duration must be at least 30 minutes', trigger: 'change' },
    { type: 'number', max: 480, message: 'Duration cannot exceed 8 hours', trigger: 'change' }
  ],
  
  // 司机信息验证
  carrier: [
    { required: true, message: 'Please enter carrier', trigger: 'blur' }
  ],
  driverName: [
    { required: true, message: 'Please enter driver name', trigger: 'blur' }
  ],
  driverPhone: [
    { required: true, message: 'Please enter driver phone', trigger: 'blur' },
    { pattern: /^\d{10}$/, message: 'Please enter valid phone number', trigger: 'blur' }
  ]
}

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 计算结束时间
const calculateEndTime = computed(() => {
  const { startTime, estimatedDuration } = appointmentForm.value
  if (!startTime || !estimatedDuration) return ''

  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + estimatedDuration
  
  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
})

// 修改添加预约方法
const handleAdd = () => {
  dialogType.value = 'add'
  appointmentForm.value = {
    parkingLotId: '',
    dockNumber: '',
    type: 'Inbound',
    startDate: '',
    startTime: '',
    endTime: '',
    estimatedDuration: 60,
    carrier: '',
    driverName: '',
    driverPhone: '',
    driverEmail: '',
    vehiclePlate: '',
    containerNumber: '',
    poNumber: '',
    cargoType: '',
    totalWeight: 0,
    palletCount: 0,
    dockNumbers: [],
    parkingSpots: 1,
    billingType: 'hourly',
    specialInstructions: '',
    specialRequirements: []
  }
  dialogVisible.value = true
}

// 修改编辑方法
const handleEdit = (row: DockAppointment) => {
  dialogType.value = 'edit'
  appointmentForm.value = {
    ...row,
    date: row.date
  }
  dialogVisible.value = true
}

// 查看详情
const handleView = (row: DockAppointment) => {
  currentAppointment.value = row
  detailVisible.value = true
}

// 签到处理
const handleCheckIn = async (row: DockAppointment) => {
  try {
    // TODO: 调用API进行签到
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Check-in successful')
    handleSearch()
  } catch (error) {
    ElMessage.error('Check-in failed')
  }
}

// 添加表单引用
const formRef = ref<FormInstance>()

// 修改提交表单方法
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // TODO: 调用API保存数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(
      dialogType.value === 'add' 
        ? 'Appointment scheduled successfully' 
        : 'Appointment updated successfully'
    )
    dialogVisible.value = false
    handleSearch()
  } catch (error) {
    console.error('Validation failed:', error)
    ElMessage.error('Please check the form')
  } finally {
    submitting.value = false
  }
}

// 修改命令处理函数
const handleCommand = async (command: string, row: DockAppointment) => {
  try {
    switch (command) {
      // 请求状态的操作
      case 'approve':
        await handleApproveRequest(row)
        break
      case 'reject':
        await handleRejectRequest(row)
        break
      
      // 预约确认状态的操作
      case 'modify':
        await handleModifyAppointment(row)
        break
      case 'cancel':
        await handleCancelAppointment(row)
        break
      
      // 到达状态的操作
      case 'assign-dock':
        await handleAssignDock(row)
        break
      case 'start-loading':
        await handleStartLoading(row)
        break
      
      // 进行中状态的操作
      case 'monitor-progress':
        await handleMonitorProgress(row)
        break
      case 'complete-loading':
        await handleCompleteLoading(row)
        break
      
      // 装卸完成态的操作
      case 'verify-bill':
        await handleVerifyBill(row)
        break
      case 'mark-unpaid':
        await handleMarkUnpaid(row)
        break
      
      // 待支付状态的操作
      case 'send-reminder':
        await handleSendReminder(row)
        break
      case 'mark-paid':
        await handleMarkPaid(row)
        break
      
      // 完成状态的操作
      case 'confirm-departure':
        await handleConfirmDeparture(row)
        break
      case 'close-order':
        await handleCloseOrder(row)
        break
      
      // 取消状态的操作
      case 'record-reason':
        await handleRecordReason(row)
        break
      case 'release-resources':
        await handleReleaseResources(row)
        break
    }
    await loadData() // 刷新数据
  } catch (error) {
    ElMessage.error('Operation failed')
  }
}

// 添加操作按钮下拉菜单
const getStatusActions = (status: DockAppointmentStatus) => {
  return STATUS_ACTIONS[status] || []
}

// 修改搜索功能实现
const handleSearch = async () => {
  try {
    // TODO: 调用API获取数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 不要重新赋值，而是根据搜索条件过滤现有数据
    const filteredList = appointmentList.value.filter(item => {
      // 关键字搜索
      if (searchForm.value.keyword) {
        const keyword = searchForm.value.keyword.toLowerCase()
        return (
          item.appointmentId.toLowerCase().includes(keyword) ||
          item.carrier.toLowerCase().includes(keyword) ||
          item.driverName.toLowerCase().includes(keyword) ||
          item.vehiclePlate.toLowerCase().includes(keyword)
        )
      }
      
      // 状态筛选
      if (searchForm.value.status && item.status !== searchForm.value.status) {
        return false
      }
      
      // 日期筛选
      if (searchForm.value.date) {
        const searchDate = searchForm.value.date.toISOString().split('T')[0]
        return item.startDate === searchDate
      }
      
      return true
    })
    
    // 更新总数
    total.value = filteredList.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    appointmentList.value = filteredList.slice(start, end)
    
  } catch (error) {
    ElMessage.error('Failed to load data')
  }
}

// 添加重置方法
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: '',
    date: null
  }
  currentPage.value = 1
  handleSearch()
}

// 初始加载
onMounted(() => {
  handleSearch()
})

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}

// 修改停车场选择处理函数
const handleParkingLotChange = (parkingLotId: string) => {
  const parkingLot = parkingLots.value.find(p => p.id === parkingLotId)
  if (parkingLot) {
    if (parkingLot.docks) {
      // 更新可用码头
      availableDocks.value = parkingLot.docks.filter(dock => dock.status === 'active')
    } else {
      availableDocks.value = []
    }
    // 更新可用车位数
    availableSpots.value = parkingLot.availableSpots
    // 重置选择
    appointmentForm.value.dockNumbers = []
    appointmentForm.value.parkingSpots = 1
  } else {
    availableDocks.value = []
    availableSpots.value = 0
  }
}

// 监听车位数量变化
watch(() => appointmentForm.value.parkingSpots, (newValue) => {
  if (newValue > availableSpots.value) {
    ElMessage.warning(`Only ${availableSpots.value} spots available`)
    appointmentForm.value.parkingSpots = availableSpots.value
  }
})

// 添加可用车位数的 ref
const availableSpots = ref(0)

// 添加状态处理函数
const handleApproveRequest = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Request approved')
  } catch (error) {
    throw new Error('Failed to approve request')
  }
}

const handleRejectRequest = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Request rejected')
  } catch (error) {
    throw new Error('Failed to reject request')
  }
}

// 添加其他状态处理函数
const handleModifyAppointment = async (row: DockAppointment) => {
  dialogType.value = 'edit'
  appointmentForm.value = {
    ...row,
    parkingLotId: row.parkingLotName, // 临时映射
    dockNumber: row.dockNumbers[0], // 临时使用第一个码头
    driverEmail: '', // 补充缺失字段
    specialRequirements: [], // 补充缺失字段
    specialInstructions: '' // 补充缺失字段
  }
  dialogVisible.value = true
}

const handleCancelAppointment = async (row: DockAppointment) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to cancel this appointment?',
      'Warning',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }
    )
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Appointment cancelled successfully')
  } catch (error) {
    if (error !== 'cancel') {
      throw new Error('Failed to cancel appointment')
    }
  }
}

const handleAssignDock = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Dock assigned successfully')
  } catch (error) {
    throw new Error('Failed to assign dock')
  }
}

const handleStartLoading = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Loading started')
  } catch (error) {
    throw new Error('Failed to start loading')
  }
}

const handleMonitorProgress = async (row: DockAppointment) => {
  // 打开监控对话框或跳转到监控页面
  router.push(`/dock/monitor/${row.id}`)
}

const handleCompleteLoading = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Loading completed')
  } catch (error) {
    throw new Error('Failed to complete loading')
  }
}

const handleVerifyBill = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Bill verified')
  } catch (error) {
    throw new Error('Failed to verify bill')
  }
}

const handleMarkUnpaid = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Marked as payment pending')
  } catch (error) {
    throw new Error('Failed to mark as unpaid')
  }
}

const handleSendReminder = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Payment reminder sent')
  } catch (error) {
    throw new Error('Failed to send reminder')
  }
}

const handleMarkPaid = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Marked as paid')
  } catch (error) {
    throw new Error('Failed to mark as paid')
  }
}

const handleConfirmDeparture = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Departure confirmed')
  } catch (error) {
    throw new Error('Failed to confirm departure')
  }
}

const handleCloseOrder = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Order closed')
  } catch (error) {
    throw new Error('Failed to close order')
  }
}

const handleRecordReason = async (row: DockAppointment) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      'Please enter cancellation reason',
      'Record Reason',
      {
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => !!value,
        inputErrorMessage: 'Reason is required'
      }
    )
    if (reason) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      ElMessage.success('Reason recorded')
    }
  } catch (error) {
    if (error !== 'cancel') {
      throw new Error('Failed to record reason')
    }
  }
}

const handleReleaseResources = async (row: DockAppointment) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Resources released')
  } catch (error) {
    throw new Error('Failed to release resources')
  }
}
</script>

<style scoped lang="scss">
.dock-container {
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  .stat-card {
    text-align: center;

    :deep(.el-card__header) {
      padding: 12px;
      font-weight: 500;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: var(--el-color-primary);
      padding: 12px 0;
    }
  }
}

.list-card {
  .el-table {
    margin: -20px;
    margin-bottom: 0;
  }
}

.schedule-info {
  .time-slot {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
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

.readonly-field {
  :deep(.el-input) {
    .el-input__wrapper {
      background-color: var(--el-fill-color-light);
    }
    
    .el-input__prefix {
      color: var(--el-text-color-secondary);
    }
  }
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style> 