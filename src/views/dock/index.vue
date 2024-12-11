<template>
  <div class="dock-container">
    <!-- Search Area -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input
            v-model="searchForm.keyword"
            placeholder="Order No./Driver/Carrier"
            clearable
            style="width: 200px"
          >
            <template #prefix>
              <span class="search-label">Search</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-select 
            v-model="searchForm.status" 
            placeholder="All Status"
            clearable
            style="width: 180px"
            popper-class="status-select-dropdown"
          >
            <template #prefix>
              <span class="search-label">Status</span>
            </template>
            <el-option
              v-for="(config, status) in STATUS_CONFIG"
              :key="status"
              :label="config.label"
              :value="status"
            >
              <el-tag :type="config.type" size="small" class="status-tag">{{ config.label }}</el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="searchForm.date"
            type="date"
            placeholder="Select Date"
            style="width: 160px"
          >
            <template #prefix>
              <span class="search-label">Date</span>
            </template>
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleSearch"
            class="search-button"
          >
            <el-icon><Search /></el-icon>
            Search
          </el-button>
          <el-button 
            @click="handleReset"
            class="reset-button"
          >
            Reset
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- List Area -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>Dock Appointments</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            New Appointment
          </el-button>
        </div>
      </template>

      <el-table :data="appointmentList" border stripe>
        <!-- Order No -->
        <el-table-column label="Order No." width="150">
          <template #default="{ row }">
            <div class="info-cell">
              <div class="main-info">{{ row.appointmentId }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- Type -->
        <el-table-column label="Type" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === 'Inbound' ? 'success' : 'warning'">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Date & Time -->
        <el-table-column label="Date & Time" width="150">
          <template #default="{ row }">
            <div class="info-cell">
              <div class="main-info">{{ row.startDate }}</div>
              <div class="sub-info">{{ row.startTime }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- Duration -->
        <el-table-column label="Est. Duration" width="120" align="center">
          <template #default="{ row }">
            <div class="info-cell">
              <div class="main-info">{{ row.estimatedDuration }} mins</div>
              <div class="sub-info" v-if="row.billingType">
                {{ row.billingType === 'hourly' ? 'Hourly Rate' : row.billingType === 'daily' ? 'Daily Rate' : 'Fixed Rate' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- Dwell Time -->
        <el-table-column label="Dwell Time" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.dwellTime > 0">{{ row.dwellTime }} mins</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- Driver -->
        <el-table-column label="Driver" width="120">
          <template #default="{ row }">
            <div class="info-cell">
              <div class="main-info">{{ row.driverName }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- Phone -->
        <el-table-column label="Phone" width="120">
          <template #default="{ row }">
            <span>{{ row.driverPhone }}</span>
          </template>
        </el-table-column>

        <!-- Vehicle -->
        <el-table-column label="Vehicle" width="120">
          <template #default="{ row }">
            <div class="info-cell">
              <div class="main-info">{{ row.vehiclePlate }}</div>
              <div class="sub-info">{{ row.carrier }}</div>
            </div>
          </template>
        </el-table-column>

        <!-- Location -->
        <el-table-column label="Location" min-width="150">
          <template #default="{ row }">
            <div class="info-cell">
              <div class="main-info">{{ row.parkingLotName }}</div>
              <div class="sub-info">
                <template v-if="row.dockNumbers && row.dockNumbers.length">
                  <span>{{ row.dockNumbers.map((dock: string) => `${getAreaByDock(dock)}-${dock}`).join(', ') }}</span>
                </template>
                <template v-else>
                  <span class="text-muted">No dock assigned</span>
                </template>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- Status -->
        <el-table-column label="Status" width="130" align="center">
          <template #default="{ row }">
            <div class="info-cell">
              <el-tag :type="getStatusType(row.status)">
                {{ STATUS_CONFIG[row.status].label }}
              </el-tag>
              <div class="sub-info" v-if="row.dwellTime > 0">
                {{ row.dwellTime }} mins
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="{ row }">
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button type="primary" size="small" class="action-button">
                <span class="button-content">
                  Actions
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-for="action in STATUS_ACTIONS[row.status]" 
                    :key="action.action"
                    :command="action.action"
                    class="action-item"
                  >
                    <el-icon><component :is="action.icon" /></el-icon>
                    <span>{{ action.label }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
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

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? 'New Appointment' : 'Edit Appointment'"
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="appointmentForm"
        label-width="120px"
        :rules="formRules"
      >
        <!-- Parking Information -->
        <div class="form-section">
          <div class="section-title">Parking Information</div>
          <el-form-item label="Parking Lot" prop="parkingLotId">
            <el-select 
              v-model="appointmentForm.parkingLotId"
              placeholder="Select Parking Lot"
              @change="handleParkingLotChange"
            >
              <el-option
                v-for="lot in parkingLots"
                :key="lot.id"
                :label="lot.name"
                :value="lot.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="Type" prop="type">
            <el-radio-group v-model="appointmentForm.type">
              <el-radio label="Inbound">Inbound</el-radio>
              <el-radio label="Outbound">Outbound</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="Billing Type" prop="billingType">
            <el-radio-group v-model="appointmentForm.billingType">
              <el-radio label="hourly">Hourly</el-radio>
              <el-radio label="daily">Daily</el-radio>
              <el-radio label="fixed">Fixed</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="Date" prop="startDate">
            <el-date-picker
              v-model="appointmentForm.startDate"
              type="date"
              placeholder="Select Date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Start Time" prop="startTime">
                <el-time-picker
                  v-model="appointmentForm.startTime"
                  format="HH:mm"
                  placeholder="Select Time"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Parking Spots" prop="parkingSpots">
                <el-input-number
                  v-model="appointmentForm.parkingSpots"
                  :min="1"
                  :precision="0"
                  placeholder="Number of spots"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item :label="estimatedDurationLabel" prop="estimatedDuration">
            <el-input-number
              v-model="appointmentForm.estimatedDuration"
              :min="1"
              :precision="0"
              :placeholder="estimatedDurationPlaceholder"
            />
          </el-form-item>

          <el-form-item label="Docks" prop="dockNumbers">
            <el-select
              v-model="appointmentForm.dockNumbers"
              multiple
              placeholder="Select Docks"
              :disabled="!appointmentForm.parkingLotId"
            >
              <el-option
                v-for="dock in availableDocks"
                :key="dock.id"
                :label="dock.name"
                :value="dock.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- Driver Information -->
        <div class="form-section">
          <div class="section-title">Driver Information</div>
          <el-form-item label="Carrier" prop="carrier">
            <el-input v-model="appointmentForm.carrier" />
          </el-form-item>

          <el-form-item label="Driver Name" prop="driverName">
            <el-input v-model="appointmentForm.driverName" />
          </el-form-item>

          <el-form-item label="Phone" prop="driverPhone">
            <el-input v-model="appointmentForm.driverPhone" />
          </el-form-item>

          <el-form-item label="Plate No." prop="vehiclePlate">
            <el-input v-model="appointmentForm.vehiclePlate" />
          </el-form-item>
        </div>

        <!-- Cargo Information -->
        <div class="form-section">
          <div class="section-title">Cargo Information</div>
          <el-form-item label="Cargo Type" prop="cargoType">
            <el-input v-model="appointmentForm.cargoType" />
          </el-form-item>

          <el-form-item label="PO Number" prop="poNumber">
            <el-input v-model="appointmentForm.poNumber" />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Weight(kg)" prop="totalWeight">
                <el-input-number
                  v-model="appointmentForm.totalWeight"
                  :min="0"
                  :precision="2"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Pallets" prop="palletCount">
                <el-input-number
                  v-model="appointmentForm.palletCount"
                  :min="1"
                  :precision="0"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Notes" prop="notes">
            <el-input
              v-model="appointmentForm.notes"
              type="textarea"
              rows="3"
              placeholder="Enter notes"
            />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Assign Dock Dialog -->
    <el-dialog
      v-model="assignDockDialogVisible"
      title="Assign Dock"
      width="500px"
      class="assign-dock-dialog"
    >
      <el-form :model="assignDockForm" label-position="top">
        <el-form-item label="Parking Lot">
          <el-input v-model="assignDockForm.parkingLot" disabled />
        </el-form-item>
        
        <!-- Current Dock Info -->
        <el-form-item label="Current Dock" v-if="assignDockForm.currentDocks.length">
          <div class="current-dock-info">
            <div v-for="dock in assignDockForm.currentDocks" :key="dock" class="dock-item">
              <el-tag class="current-dock-tag" type="info">
                {{ getAreaByDock(dock) }}-{{ dock }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="Area">
          <el-select 
            v-model="assignDockForm.selectedArea"
            placeholder="Select area"
            @change="assignDockForm.selectedDocks = []"
          >
            <el-option
              v-for="area in areas"
              :key="area.id"
              :label="area.name"
              :value="area.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Available Docks">
          <el-select
            v-model="assignDockForm.selectedDocks"
            multiple
            placeholder="Select docks"
            :min="1"
            :max="assignDockForm.parkingSpots"
            :disabled="!assignDockForm.selectedArea"
          >
            <el-option
              v-for="dock in availableDocks"
              :key="dock.id"
              :label="dock.name"
              :value="dock.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Notes">
          <el-input
            v-model="assignDockForm.notes"
            type="textarea"
            :rows="3"
            placeholder="Add any special instructions or notes"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDockDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmAssignDock">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Monitor Progress Dialog -->
    <el-dialog
      v-model="monitorProgressDialogVisible"
      title="Loading Progress"
      width="600px"
      class="monitor-progress-dialog"
    >
      <div class="progress-info">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <div class="label">Order No.</div>
              <div class="value">{{ monitorForm.appointmentId }}</div>
            </div>
            <div class="info-item">
              <div class="label">Location</div>
              <div class="value">{{ monitorForm.parkingLot }} ({{ monitorForm.dockNumber }})</div>
            </div>
            <div class="info-item">
              <div class="label">Start Time</div>
              <div class="value">{{ monitorForm.startTime }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <div class="label">Elapsed Time</div>
              <div class="value highlight">{{ formatElapsedTime(monitorForm.elapsedTime) }}</div>
            </div>
            <div class="info-item">
              <div class="label">Estimated Time</div>
              <div class="value">{{ monitorForm.estimatedDuration }} mins</div>
            </div>
            <div class="info-item">
              <div class="label">Status</div>
              <div class="value">
                <el-tag :type="getStatusType(monitorForm.status)">
                  {{ STATUS_CONFIG[monitorForm.status].label }}
                </el-tag>
              </div>
            </div>
          </el-col>
        </el-row>

        <div class="progress-section">
          <div class="progress-header">
            <span>Loading Progress</span>
            <span class="percentage">{{ monitorForm.progress }}%</span>
          </div>
          <el-progress 
            :percentage="monitorForm.progress"
            :status="monitorForm.progress >= 100 ? 'success' : ''"
            :stroke-width="20"
          />
        </div>

        <div class="notes-section">
          <div class="section-title">Progress Notes</div>
          <el-input
            v-model="monitorForm.notes"
            type="textarea"
            :rows="3"
            placeholder="Add progress notes or remarks"
          />
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="monitorProgressDialogVisible = false">Close</el-button>
          <el-button type="success" @click="handleUpdateProgress" :disabled="!monitorForm.notes">
            Update Progress
          </el-button>
          <el-button 
            type="primary" 
            @click="handleCompleteLoadingFromMonitor"
            :disabled="monitorForm.progress < 100"
          >
            Complete Loading
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Plus, Edit, Delete, More, Search,
  View, Timer, Calendar, CreditCard, Briefcase,
  Location, Van, CircleCheck, Money, Message
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { 
  DockAppointmentStatus, 
  DockAppointment,
  STATUS_ACTIONS,
  STATUS_CONFIG 
} from '@/types/dock'

const router = useRouter()

// Search Form
const searchForm = ref({
  keyword: '',
  status: '',
  date: null as string | null
})

// Add interfaces
interface Area {
  id: string
  name: string
  docks: Dock[]
}

interface Dock {
  id: string
  name: string
  status: 'available' | 'occupied' | 'maintenance'
  areaId: string
}

// Mock data for areas and docks
const areas = ref<Area[]>([
  {
    id: 'A1',
    name: 'Area A',
    docks: [
      { id: 'D001', name: 'Dock A1', status: 'available', areaId: 'A1' },
      { id: 'D002', name: 'Dock A2', status: 'available', areaId: 'A1' },
      { id: 'D003', name: 'Dock A3', status: 'available', areaId: 'A1' }
    ]
  },
  {
    id: 'B1',
    name: 'Area B',
    docks: [
      { id: 'D004', name: 'Dock B1', status: 'available', areaId: 'B1' },
      { id: 'D005', name: 'Dock B2', status: 'available', areaId: 'B1' }
    ]
  },
  {
    id: 'C1',
    name: 'Area C',
    docks: [
      { id: 'D006', name: 'Dock C1', status: 'available', areaId: 'C1' },
      { id: 'D007', name: 'Dock C2', status: 'available', areaId: 'C1' },
      { id: 'D008', name: 'Dock C3', status: 'available', areaId: 'C1' }
    ]
  }
])

// Available docks computed based on selected area
const availableDocks = computed(() => {
  if (!assignDockForm.value.selectedArea) {
    return []
  }
  const area = areas.value.find(a => a.id === assignDockForm.value.selectedArea)
  return area ? area.docks.filter(d => d.status === 'available') : []
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// Appointment List with Mock Data
const appointmentList = ref([
  {
    id: 'D001',
    appointmentId: 'APT-20240320-001',
    carrier: 'Express Logistics',
    driverName: 'John Smith',
    driverPhone: '1234567890',
    vehiclePlate: 'EL123',
    parkingLotName: 'Main Parking',
    dockNumbers: ['D01'],
    parkingSpots: 1,
    type: 'Inbound',
    startDate: '2024-03-20',
    startTime: '09:00',
    endTime: '10:00',
    estimatedDuration: 60,
    status: DockAppointmentStatus.REQUEST,
    dwellTime: 0,
    billingType: 'hourly'
  },
  {
    id: 'D002',
    appointmentId: 'APT-20240320-002',
    carrier: 'Speed Delivery',
    driverName: 'Mike Johnson',
    driverPhone: '1234567891',
    vehiclePlate: 'SD789',
    parkingLotName: 'East Parking',
    dockNumbers: ['D02'],
    parkingSpots: 1,
    type: 'Outbound',
    startDate: '2024-03-20',
    startTime: '10:00',
    endTime: '11:00',
    estimatedDuration: 60,
    status: DockAppointmentStatus.SCHEDULED,
    dwellTime: 0,
    billingType: 'hourly'
  },
  {
    id: 'D003',
    appointmentId: 'APT-20240320-003',
    carrier: 'Fast Delivery',
    driverName: 'Tom Wilson',
    driverPhone: '1234567892',
    vehiclePlate: 'FD456',
    parkingLotName: 'Main Parking',
    dockNumbers: ['D03'],
    parkingSpots: 1,
    type: 'Inbound',
    startDate: '2024-03-20',
    startTime: '11:00',
    endTime: '12:00',
    estimatedDuration: 60,
    status: DockAppointmentStatus.ARRIVED,
    dwellTime: 0,
    billingType: 'hourly'
  },
  {
    id: 'D004',
    appointmentId: 'APT-20240320-004',
    carrier: 'Global Logistics',
    driverName: 'David Brown',
    driverPhone: '1234567893',
    vehiclePlate: 'GL789',
    parkingLotName: 'East Parking',
    dockNumbers: ['D04'],
    parkingSpots: 1,
    type: 'Outbound',
    startDate: '2024-03-20',
    startTime: '13:00',
    endTime: '14:00',
    estimatedDuration: 60,
    status: DockAppointmentStatus.LOADING,
    dwellTime: 30,
    billingType: 'hourly'
  },
  {
    id: 'D005',
    appointmentId: 'APT-20240320-005',
    carrier: 'City Express',
    driverName: 'James Lee',
    driverPhone: '1234567894',
    vehiclePlate: 'CE123',
    parkingLotName: 'Main Parking',
    dockNumbers: ['D05'],
    parkingSpots: 1,
    type: 'Inbound',
    startDate: '2024-03-20',
    startTime: '14:00',
    endTime: '15:00',
    estimatedDuration: 60,
    status: DockAppointmentStatus.LOADED,
    dwellTime: 65,
    billingType: 'hourly'
  },
  {
    id: 'D006',
    appointmentId: 'APT-20240320-006',
    carrier: 'Quick Transport',
    driverName: 'Robert Taylor',
    driverPhone: '1234567895',
    vehiclePlate: 'QT456',
    parkingLotName: 'East Parking',
    dockNumbers: ['D06'],
    parkingSpots: 1,
    type: 'Outbound',
    startDate: '2024-03-20',
    startTime: '15:00',
    endTime: '16:00',
    estimatedDuration: 60,
    status: DockAppointmentStatus.COMPLETED,
    dwellTime: 58,
    billingType: 'hourly'
  },
  {
    id: 'D007',
    appointmentId: 'APT-20240320-007',
    carrier: 'Safe Cargo',
    driverName: 'William Davis',
    driverPhone: '1234567896',
    vehiclePlate: 'SC789',
    parkingLotName: 'Main Parking',
    dockNumbers: ['D07'],
    parkingSpots: 1,
    type: 'Inbound',
    startDate: '2024-03-20',
    startTime: '16:00',
    endTime: '17:00',
    estimatedDuration: 60,
    status: DockAppointmentStatus.CANCELLED,
    dwellTime: 0,
    billingType: 'hourly',
    cancellationReason: 'Driver unavailable',
    cancelledBy: 'Carrier',
    cancelledAt: '2024-03-19 15:00:00'
  }
])

// Status Options
const dockStatus = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label
}))

// Get Status Style
const getStatusType = (status: DockAppointmentStatus) => {
  return STATUS_CONFIG[status].type
}

// Dialog Control
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// Form Data
const appointmentForm = ref({
  parkingLotId: '',
  dockNumbers: [] as string[],
  type: 'Inbound' as 'Inbound' | 'Outbound',
  billingType: 'hourly' as 'hourly' | 'daily' | 'fixed',
  startDate: '',
  startTime: '',
  parkingSpots: 1,
  estimatedDuration: 1,
  carrier: '',
  driverName: '',
  driverPhone: '',
  vehiclePlate: '',
  cargoType: '',
  poNumber: '',
  totalWeight: 0,
  palletCount: 1,
  notes: ''
})

// Form Rules
const formRules = {
  parkingLotId: [{ required: true, message: 'Please select parking lot', trigger: 'change' }],
  type: [{ required: true, message: 'Please select type', trigger: 'change' }],
  billingType: [{ required: true, message: 'Please select billing type', trigger: 'change' }],
  startDate: [{ required: true, message: 'Please select date', trigger: 'change' }],
  startTime: [{ required: true, message: 'Please select start time', trigger: 'change' }],
  parkingSpots: [{ required: true, message: 'Please enter parking spots', trigger: 'blur' }],
  estimatedDuration: [{ required: true, message: 'Please enter estimated duration', trigger: 'blur' }],
  dockNumbers: [{ required: true, message: 'Please select docks', trigger: 'change' }],
  carrier: [{ required: true, message: 'Please enter carrier', trigger: 'blur' }],
  driverName: [{ required: true, message: 'Please enter driver name', trigger: 'blur' }],
  driverPhone: [{ required: true, message: 'Please enter phone number', trigger: 'blur' }],
  vehiclePlate: [{ required: true, message: 'Please enter plate number', trigger: 'blur' }]
}

// Computed properties for duration label and placeholder
const estimatedDurationLabel = computed(() => {
  switch (appointmentForm.value.billingType) {
    case 'hourly':
      return 'Est. Duration (Hours)'
    case 'daily':
      return 'Est. Duration (Days)'
    case 'fixed':
      return 'Est. Duration (Minutes)'
    default:
      return 'Est. Duration'
  }
})

const estimatedDurationPlaceholder = computed(() => {
  switch (appointmentForm.value.billingType) {
    case 'hourly':
      return 'Enter hours'
    case 'daily':
      return 'Enter days'
    case 'fixed':
      return 'Enter minutes'
    default:
      return 'Enter duration'
  }
})

// Parking Lots
const parkingLots = ref([
  { id: 'P001', name: 'Main Parking' },
  { id: 'P002', name: 'East Parking' }
])

// Update DockAppointment interface
interface DockAppointmentForm extends Partial<DockAppointment> {
  notes?: string
}

// Assign Dock Dialog
const assignDockDialogVisible = ref(false)
const assignDockForm = ref<{
  appointmentId: string
  parkingLot: string
  parkingSpots: number
  currentDocks: string[]
  selectedArea: string
  selectedDocks: string[]
  notes: string
}>({
  appointmentId: '',
  parkingLot: '',
  parkingSpots: 1,
  currentDocks: [],
  selectedArea: '',
  selectedDocks: [],
  notes: ''
})

// Monitor Progress Dialog
interface MonitorFormData {
  appointmentId: string
  parkingLot: string
  dockNumber: string
  startTime: string
  elapsedTime: number
  estimatedDuration: number
  status: DockAppointmentStatus
  progress: number
  notes: string
  appointmentData: DockAppointment | null
}

const monitorProgressDialogVisible = ref(false)
const monitorForm = ref<MonitorFormData>({
  appointmentId: '',
  parkingLot: '',
  dockNumber: '',
  startTime: '',
  elapsedTime: 0,
  estimatedDuration: 0,
  status: DockAppointmentStatus.REQUEST,
  progress: 0,
  notes: '',
  appointmentData: null
})

// Format elapsed time
const formatElapsedTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Handle monitor progress
const handleMonitorProgress = (row: DockAppointment) => {
  monitorForm.value = {
    appointmentId: row.appointmentId,
    parkingLot: row.parkingLotName,
    dockNumber: row.dockNumbers.join(', '),
    startTime: row.startTime,
    elapsedTime: row.dwellTime || 0,
    estimatedDuration: row.estimatedDuration,
    status: row.status,
    progress: calculateProgress(row.dwellTime || 0, row.estimatedDuration),
    notes: '',
    appointmentData: row
  }
  monitorProgressDialogVisible.value = true
}

// Calculate progress percentage
const calculateProgress = (elapsed: number, estimated: number) => {
  const progress = Math.floor((elapsed / estimated) * 100)
  return Math.min(progress, 100)
}

// Handle update progress
const handleUpdateProgress = async () => {
  try {
    // TODO: Call API to update progress
    // await updateProgress({
    //   appointmentId: monitorForm.value.appointmentId,
    //   notes: monitorForm.value.notes,
    //   progress: monitorForm.value.progress
    // })
    
    ElMessage.success('Progress updated successfully')
    monitorProgressDialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error('Failed to update progress')
  }
}

// Search
const handleSearch = () => {
  console.log('Search form:', searchForm.value)
  loadData()
}

// Reset Search
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: '',
    date: null
  }
  handleSearch()
}

// Add Appointment
const handleAdd = () => {
  dialogType.value = 'add'
  appointmentForm.value = {
    parkingLotId: '',
    dockNumbers: [],
    type: 'Inbound',
    billingType: 'hourly',
    startDate: '',
    startTime: '',
    parkingSpots: 1,
    estimatedDuration: 1,
    carrier: '',
    driverName: '',
    driverPhone: '',
    vehiclePlate: '',
    cargoType: '',
    poNumber: '',
    totalWeight: 0,
    palletCount: 1,
    notes: ''
  }
  dialogVisible.value = true
}

// Edit Appointment
const handleEdit = (row: DockAppointment) => {
  dialogType.value = 'edit'
  appointmentForm.value = {
    parkingLotId: row.parkingLotName,
    dockNumbers: row.dockNumbers,
    type: row.type,
    billingType: row.billingType,
    startDate: row.startDate,
    startTime: row.startTime,
    parkingSpots: row.parkingSpots,
    estimatedDuration: row.estimatedDuration,
    carrier: row.carrier,
    driverName: row.driverName,
    driverPhone: row.driverPhone,
    vehiclePlate: row.vehiclePlate,
    cargoType: row.cargoType || '',
    poNumber: row.poNumber || '',
    totalWeight: row.totalWeight || 0,
    palletCount: row.palletCount || 1,
    notes: row.notes || ''
  }
  dialogVisible.value = true
}

// View Details
const handleView = (row: DockAppointment) => {
  router.push(`/dock/${row.id}`)
}

// Handle Command
const handleCommand = async (command: keyof typeof STATUS_ACTIONS[DockAppointmentStatus], row: DockAppointment) => {
  try {
    if (row.status === DockAppointmentStatus.CANCELLED && command !== 'view') {
      ElMessage.warning('Cancelled appointments can only be viewed')
      return
    }

    switch (command) {
      case 'view':
        router.push(`/dock/${row.id}`)
        break
      case 'monitor-progress':
        handleMonitorProgress(row)
        break
      // ... other cases ...
      default:
        console.log('Command not implemented:', command)
    }
    await loadData()
  } catch (error) {
    ElMessage.error('Operation failed')
  }
}

// Action Handlers
const handleApprove = async (row: DockAppointment) => {
  await ElMessageBox.confirm('Are you sure to approve this appointment?', 'Confirm', {
    confirmButtonText: 'Approve',
    cancelButtonText: 'Cancel',
    type: 'success'
  })
  // TODO: Call API to approve
}

const handleReject = async (row: DockAppointment) => {
  await ElMessageBox.confirm('Are you sure to reject this appointment?', 'Confirm', {
    confirmButtonText: 'Reject',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
  // TODO: Call API to reject
}

const handleCancel = async (row: DockAppointment) => {
  await ElMessageBox.confirm('Are you sure to cancel this appointment?', 'Confirm', {
    confirmButtonText: 'Cancel',
    cancelButtonText: 'Keep',
    type: 'warning'
  })
  // TODO: Call API to cancel
}

const handleAssignDock = async (row: DockAppointment) => {
  assignDockForm.value = {
    appointmentId: row.appointmentId,
    parkingLot: row.parkingLotName,
    parkingSpots: row.parkingSpots || 1,
    currentDocks: row.dockNumbers || [],
    selectedArea: '',
    selectedDocks: [],
    notes: ''
  }
  assignDockDialogVisible.value = true
}

const confirmAssignDock = async () => {
  try {
    if (!assignDockForm.value.selectedDocks.length) {
      ElMessage.warning('Please select at least one dock')
      return
    }

    await ElMessageBox.confirm(
      `Are you sure to assign ${assignDockForm.value.selectedDocks.join(', ')} to this appointment?`,
      'Confirm Assignment',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )

    // TODO: Call API to assign docks
    // await assignDocks({
    //   appointmentId: assignDockForm.value.appointmentId,
    //   docks: assignDockForm.value.selectedDocks,
    //   notes: assignDockForm.value.notes
    // })

    ElMessage.success('Docks assigned successfully')
    assignDockDialogVisible.value = false
    await loadData() // Refresh the list
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to assign docks')
      console.error(error)
    }
  }
}

const handleStartLoading = async (row: DockAppointment) => {
  await ElMessageBox.confirm('Are you sure to start loading?', 'Confirm', {
    confirmButtonText: 'Start',
    cancelButtonText: 'Cancel',
    type: 'info'
  })
  // TODO: Call API to start loading
}

const handleCompleteLoading = async (row: DockAppointment) => {
  await ElMessageBox.confirm('Are you sure loading is completed?', 'Confirm', {
    confirmButtonText: 'Complete',
    cancelButtonText: 'Cancel',
    type: 'success'
  })
  // TODO: Call API to complete loading
}

const handleMarkPaid = async (row: DockAppointment) => {
  await ElMessageBox.confirm('Are you sure to mark as paid?', 'Confirm', {
    confirmButtonText: 'Mark Paid',
    cancelButtonText: 'Cancel',
    type: 'success'
  })
  // TODO: Call API to mark as paid
}

const handleMarkUnpaid = async (row: DockAppointment) => {
  await ElMessageBox.confirm('Are you sure to mark as unpaid?', 'Confirm', {
    confirmButtonText: 'Mark Unpaid',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
  // TODO: Call API to mark as unpaid
}

// Handle Parking Lot Change
const handleParkingLotChange = (parkingLotId: string) => {
  // TODO: Load available docks based on selected parking lot
  console.log('Selected parking lot:', parkingLotId)
}

// Submit Form
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // TODO: Call API to save data
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(dialogType.value === 'add' ? 'Added successfully' : 'Updated successfully')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

// Load Data
const loadData = async () => {
  try {
    // TODO: Call API to get data
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Using mock data
    total.value = appointmentList.value.length
  } catch (error) {
    ElMessage.error('Failed to load data')
  }
}

// Pagination Handlers
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadData()
}

// Initialize
onMounted(() => {
  loadData()
})

// 修改获取区域信息的方法
const getAreaByDock = (dockId: string) => {
  for (const area of areas.value) {
    const dock = area.docks.find(d => d.id === dockId)
    if (dock) {
      return area.name.split(' ')[1] // 返回 'Area A' 中的 'A'
    }
  }
  // 如果找不到区域，返回A-E中的随机一个
  const randomAreas = ['A', 'B', 'C', 'D', 'E']
  return randomAreas[Math.floor(Math.random() * randomAreas.length)]
}

// Complete loading button handler
const handleCompleteLoadingFromMonitor = async () => {
  if (monitorForm.value.appointmentData) {
    await handleCompleteLoading(monitorForm.value.appointmentData)
    monitorProgressDialogVisible.value = false
  }
}
</script>

<style scoped lang="scss">
.dock-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .search-form {
    .search-label {
      color: #606266;
      margin-right: 8px;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select .el-input__wrapper),
    :deep(.el-date-editor.el-input__wrapper) {
      box-shadow: none;
      border: 1px solid #DCDFE6;
      border-radius: 4px;
      
      &:hover {
        border-color: #C0C4CC;
      }
      
      &.is-focus {
        border-color: #409EFF;
      }
    }

    .search-button {
      background-color: #409EFF;
      border-color: #409EFF;
      padding: 8px 20px;
      
      &:hover {
        background-color: #66b1ff;
        border-color: #66b1ff;
      }
    }

    .reset-button {
      padding: 8px 20px;
      margin-left: 8px;
      border: 1px solid #DCDFE6;
      color: #606266;
      
      &:hover {
        color: #409EFF;
        border-color: #c6e2ff;
        background-color: #ecf5ff;
      }
    }

    .el-button {
      .el-icon {
        margin-right: 4px;
      }
    }
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .appointment-info {
    .appointment-id {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .appointment-time {
      font-size: 12px;
      color: #666;

      .el-tag {
        margin-right: 8px;
      }
    }
  }

  .driver-info, .parking-info {
    .text-gray {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .form-section {
    margin-bottom: 24px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .el-button {
    .el-icon {
      margin-right: 4px;
    }
  }

  .el-dropdown {
    .el-button {
      display: flex;
      align-items: center;
      .el-icon {
        margin-right: 4px;
      }
    }
  }

  .el-dropdown-menu {
    .el-dropdown-item {
      display: flex;
      align-items: center;
      .el-icon {
        margin-right: 8px;
      }
    }
  }
}

.info-cell {
  .main-info {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .sub-info {
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 4px;

    .label {
      color: #999;
    }

    .el-tag {
      margin-right: 4px;
    }
  }
}

.el-dropdown {
  // ... existing dropdown styles ...
}

.el-select {
  width: 100%;
}

.assign-dock-dialog {
  :deep(.el-form-item__label) {
    padding-bottom: 8px;
  }
  
  :deep(.el-select) {
    width: 100%;
  }
  
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    box-shadow: none;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    
    &:hover, &:focus {
      border-color: var(--el-color-primary);
    }
  }

  .current-dock-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }
}

.current-dock-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .dock-item {
    .current-dock-tag {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      font-size: 13px;
    }
  }
}

.area-tag {
  margin: 0 4px;
  padding: 0 6px;
  height: 20px;
  line-height: 18px;
}

.el-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  
  .el-icon {
    margin: 0;
  }
}

.monitor-progress-dialog {
  .progress-info {
    .info-item {
      margin-bottom: 16px;
      
      .label {
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
      }
      
      .value {
        font-size: 15px;
        font-weight: 500;
        
        &.highlight {
          color: #409EFF;
          font-size: 18px;
        }
      }
    }

    .progress-section {
      margin: 24px 0;
      
      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 500;
        
        .percentage {
          color: #409EFF;
          font-size: 16px;
        }
      }
    }

    .notes-section {
      margin-top: 24px;
      
      .section-title {
        font-weight: 500;
        margin-bottom: 12px;
      }
    }
  }
}

.search-form {
  :deep(.el-select-dropdown__item) {
    padding: 8px 12px;
    
    .status-tag {
      width: 100%;
      text-align: center;
    }
  }

  :deep(.el-select .el-input__wrapper) {
    padding-right: 30px;
  }
}

:global(.status-select-dropdown) {
  min-width: 180px !important;
  
  .el-select-dropdown__item {
    padding: 8px 12px;
  }
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  
  .button-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .el-icon {
    margin: 0;
  }
}

:deep(.action-item) {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  
  .el-icon {
    margin-right: 8px;
    font-size: 16px;
  }

  span {
    flex: 1;
  }
}
</style> 