<template>
  <div class="reservation-container">
    <!-- Search Form -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Order No.">
          <el-input v-model="searchForm.orderNo" placeholder="Enter order number" clearable />
        </el-form-item>
        <el-form-item label="Customer">
          <el-input v-model="searchForm.customerName" placeholder="Name/Phone" clearable />
        </el-form-item>
        <el-form-item label="Parking Lot">
          <el-select 
            v-model="searchForm.parkingLot" 
            clearable 
            placeholder="Select parking lot"
            style="width: 220px"
          >
            <el-option
              v-for="lot in parkingLots"
              :key="lot.value"
              :label="lot.label"
              :value="lot.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Space Type">
          <el-select 
            v-model="searchForm.spaceType" 
            clearable 
            placeholder="Select type"
            style="width: 180px"
          >
            <el-option label="Standard" value="standard" />
            <el-option label="Large Vehicle" value="large" />
            <el-option label="Valet" value="valet" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select 
            v-model="searchForm.status" 
            clearable 
            placeholder="Select status"
            style="width: 200px"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Date Range">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="to"
            start-placeholder="Start date"
            end-placeholder="End date"
            value-format="YYYY-MM-DD"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Reservation List -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>Reservation List</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              New Reservation
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              Export
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="reservationList" 
        border 
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="orderNo" label="Order No." width="160" fixed />
        <el-table-column prop="customerName" label="Customer" width="120" />
        <el-table-column prop="phone" label="Phone" width="120" />
        <el-table-column prop="plateNo" label="Car Info" min-width="120">
          <template #default="{ row }">
            <el-tooltip
              v-if="row.plateNos?.length > 1"
              :content="row.plateNos.join(', ')"
              placement="top"
            >
              <span class="multiple-plates">
                {{ row.plateNos[0] }}
                <el-tag size="small" type="info" class="plate-count">
                  +{{ row.plateNos.length - 1 }}
                </el-tag>
              </span>
            </el-tooltip>
            <span v-else>{{ row.plateNos?.[0] || row.plateNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="parkingLot" label="Parking Lot" min-width="150" show-overflow-tooltip />
        <el-table-column prop="spaceType" label="Space Location" width="180">
          <template #default="{ row }">
            <div class="space-location">
              <!-- 区域信息 -->
              <el-tag type="info" v-if="row.zoneName">
                Zone {{ row.zoneName }}
              </el-tag>
              <!-- 车位信息 -->
              <el-tag v-if="row.spaceNo" :type="getSpaceTypeTag(row.spaceType)" class="ml-2">
                Space {{ row.spaceNo }}
              </el-tag>
              <!-- 未分配车位时显示车位类型 -->
              <template v-if="!row.spaceNo">
                <el-tag :type="getSpaceTypeTag(row.spaceType)">
                  {{ formatSpaceType(row.spaceType) }}
                </el-tag>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Reservation Time" width="300">
          <template #default="{ row }">
            <div class="time-info">
              <div>
                <el-icon><Calendar /></el-icon>
                Start: {{ formatDateTime(row.startTime) }}
              </div>
              <div>
                <el-icon><Calendar /></el-icon>
                End: {{ formatDateTime(row.endTime) }}
              </div>
              <div>
                <el-icon><Timer /></el-icon>
                Duration: {{ formatDuration(row.duration) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="Amount" width="120">
          <template #default="{ row }">
            <span class="amount">${{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ statusMap[row.status] }}
              <template v-if="row.status === ReservationStatus.Overdue">
                <br>
                <small>({{ formatDuration(row.overdueMinutes || 0) }})</small>
              </template>
            </el-tag>
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
                  <!-- Pending Payment -->
                  <template v-if="row.status === ReservationStatus.Pending">
                    <el-dropdown-item @click="handleConfirmPayment(row)">
                      <el-icon><Check /></el-icon>Confirm Payment
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleCancel(row)">
                      <el-icon><Close /></el-icon>Cancel
                    </el-dropdown-item>
                  </template>

                  <!-- Payment Failed -->
                  <template v-if="row.status === ReservationStatus.PaymentFailed">
                    <el-dropdown-item @click="handleRetryPayment(row)">
                      <el-icon><RefreshRight /></el-icon>Retry Payment
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleCancel(row)">
                      <el-icon><Close /></el-icon>Cancel
                    </el-dropdown-item>
                  </template>

                  <!-- AwaitingUse -->
                  <template v-if="row.status === ReservationStatus.AwaitingUse">
                    <el-dropdown-item @click="handleCheckIn(row)">
                      <el-icon><Van /></el-icon>Check In
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleRefund(row)">
                      <el-icon><Money /></el-icon>Request Refund
                    </el-dropdown-item>
                  </template>

                  <!-- InUse -->
                  <template v-if="row.status === ReservationStatus.InUse">
                    <el-dropdown-item @click="handleCheckOut(row)">
                      <el-icon><Van /></el-icon>Check Out
                    </el-dropdown-item>
                  </template>

                  <!-- Overdue -->
                  <template v-if="row.status === ReservationStatus.Overdue">
                    <el-dropdown-item @click="handleCheckOut(row)">
                      <el-icon><Timer /></el-icon>
                      Check Out (Overdue: {{ formatDuration(row.overdueMinutes || 0) }})
                    </el-dropdown-item>
                  </template>

                  <!-- Used -->
                  <template v-if="row.status === ReservationStatus.Used">
                    <el-dropdown-item @click="handleRefund(row)">
                      <el-icon><Money /></el-icon>Request Refund
                    </el-dropdown-item>
                  </template>

                  <!-- RefundFailed -->
                  <template v-if="row.status === ReservationStatus.RefundFailed">
                    <el-dropdown-item @click="handleRetryRefund(row)">
                      <el-icon><RefreshRight /></el-icon>Retry Refund
                    </el-dropdown-item>
                  </template>

                  <!-- View Detail - Always Show -->
                  <el-dropdown-item @click="handleView(row)">
                    <el-icon><View /></el-icon>View Details
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
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

    <!-- Refund Dialog -->
    <RefundDialog
      v-model="refundVisible"
      :reservation="currentReservation"
      @confirm="handleRefundConfirm"
    />

    <!-- Payment Method Dialog -->
    <el-dialog
      v-model="paymentDialogVisible"
      title="Process Payment"
      width="600px"
      align-center
      class="payment-dialog"
    >
      <!-- 订单信息 -->
      <div class="order-summary" v-if="currentReservation">
        <h3 class="section-title">Order Summary</h3>
        <div class="order-info">
          <div class="info-row">
            <div class="info-item">
              <span class="label">Order No.</span>
              <span class="value">{{ currentReservation.orderNo }}</span>
            </div>
            <div class="info-item">
              <span class="label">Customer</span>
              <span class="value">{{ currentReservation.customerName }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">Car Info</span>
              <span class="value">{{ currentReservation.plateNo }}</span>
            </div>
            <div class="info-item">
              <span class="label">Duration</span>
              <span class="value">{{ formatDuration(currentReservation.duration) }}</span>
            </div>
          </div>
        </div>

        <div class="payment-details">
          <div class="summary-item">
            <span class="label">Service Fee</span>
            <span class="value">${{ currentReservation.serviceFee.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Tax</span>
            <span class="value">${{ currentReservation.tax.toFixed(2) }}</span>
          </div>
          <div class="summary-item total">
            <span class="label">Total Amount</span>
            <span class="value amount">${{ currentReservation.amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="payment-section">
        <h3 class="section-title">Select Payment Method</h3>
        <div class="payment-methods">
          <div 
            v-for="method in paymentMethods" 
            :key="method.value"
            class="payment-method-item"
            :class="{ active: paymentState.selectedMethod === method.value }"
            @click="paymentState.selectedMethod = method.value"
          >
            <div class="method-icon">
              <el-icon><component :is="method.icon" /></el-icon>
            </div>
            <div class="method-info">
              <div class="method-name">{{ method.label }}</div>
              <div class="method-desc">{{ method.description }}</div>
            </div>
            <div class="method-check">
              <el-icon v-show="paymentState.selectedMethod === method.value">
                <Check />
              </el-icon>
            </div>
          </div>
        </div>

        <!-- 支付方式相关内容 -->
        <div class="payment-content" v-if="paymentState.selectedMethod">
          <!-- 二维码支付 -->
          <div v-if="paymentState.selectedMethod === 'qr'" class="qr-payment">
            <div class="qr-code" v-if="paymentState.qrCodeUrl">
              <img :src="paymentState.qrCodeUrl" alt="Payment QR Code">
            </div>
            <div class="qr-hint">Please scan the QR code to complete payment</div>
          </div>

          <!-- 现金支付 -->
          <div v-if="paymentState.selectedMethod === 'cash'" class="cash-payment">
            <el-form label-width="120px">
              <el-form-item label="Amount Due">
                <span class="amount">${{ currentReservation?.amount.toFixed(2) }}</span>
              </el-form-item>
              <el-form-item label="Received">
                <el-input-number 
                  v-model="paymentState.cashReceived"
                  :min="currentReservation?.amount || 0"
                  :precision="2"
                  :step="1"
                />
              </el-form-item>
              <el-form-item label="Change">
                <span class="amount">${{ changeAmount.toFixed(2) }}</span>
              </el-form-item>
            </el-form>
          </div>

          <!-- 短信支付 -->
          <div v-if="paymentState.selectedMethod === 'sms'" class="sms-payment">
            <el-form label-width="120px">
              <el-form-item label="Phone Number">
                <el-input 
                  v-model="paymentState.phoneNumber"
                  placeholder="Enter phone number"
                />
              </el-form-item>
            </el-form>
            <div class="sms-hint">Payment link will be sent to this phone number, please confirm</div>
          </div>

          <!-- 无需支付 -->
          <div v-if="paymentState.selectedMethod === 'none'" class="no-payment">
            <el-alert
              title="Confirm to mark as no payment required?"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="paymentDialogVisible = false">Cancel</el-button>
          <el-button 
            type="primary" 
            :loading="paymentState.loading"
            :disabled="!paymentState.canConfirm"
            @click="handlePaymentMethodSelect"
          >
            Confirm Payment
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Create Dialog -->
    <CreateReservationDialog
      v-model="createDialogVisible"
      @created="handleReservationCreated"
    />

    <!-- Check-in Dialog -->
    <el-dialog
      v-model="checkInDialogVisible"
      title="Check-in Confirmation"
      width="500px"
      align-center
      class="check-in-dialog"
    >
      <div class="order-info" v-if="currentReservation">
        <div class="info-row">
          <span class="label">Order No.</span>
          <span class="value">{{ currentReservation.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="label">Customer</span>
          <span class="value">{{ currentReservation.customerName }}</span>
        </div>
        <div class="info-row">
          <span class="label">Space</span>
          <span class="value">
            <el-tag type="info" v-if="currentReservation.zoneName">
              Zone {{ currentReservation.zoneName }}
            </el-tag>
            <el-tag 
              v-if="currentReservation.spaceNo" 
              :type="getSpaceTypeTag(currentReservation.spaceType)"
              class="ml-2"
            >
              Space {{ currentReservation.spaceNo }}
            </el-tag>
          </span>
        </div>
        <div class="info-row">
          <span class="label">Time</span>
          <span class="value time-info">
            <div>
              <el-icon><Calendar /></el-icon>
              Start: {{ formatDateTime(currentReservation.startTime) }}
            </div>
            <div>
              <el-icon><Calendar /></el-icon>
              End: {{ formatDateTime(currentReservation.endTime) }}
            </div>
          </span>
        </div>
      </div>

      <div class="vehicle-info">
        <h3 class="section-title">Vehicle Information</h3>
        <el-tag 
          size="large"
          :type="getSpaceTypeTag(currentReservation?.spaceType)"
          class="plate-tag"
        >
          {{ currentReservation?.plateNo }}
        </el-tag>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="checkInDialogVisible = false">Cancel</el-button>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleCheckInConfirm"
          >
            Confirm Check-in
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Check-out Dialog -->
    <el-dialog
      v-model="checkOutDialogVisible"
      :title="isOverdue ? 'Overdue Check-out' : 'Check-out Confirmation'"
      width="500px"
      align-center
      class="check-out-dialog"
    >
      <div class="order-info" v-if="currentReservation">
        <!-- 基本信息 -->
        <div class="info-row">
          <span class="label">Order No.</span>
          <span class="value">{{ currentReservation.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="label">Customer</span>
          <span class="value">{{ currentReservation.customerName }}</span>
        </div>
        
        <!-- 车辆信息 -->
        <div class="vehicle-info">
          <h3 class="section-title">Vehicle Information</h3>
          <div class="plate-selection" v-if="currentReservation.plateNos?.length > 1">
            <div class="plate-list">
              <div
                v-for="plateNo in currentReservation.plateNos"
                :key="plateNo"
                class="plate-item"
                :class="{ active: checkOutState.selectedPlateNo === plateNo }"
                @click="checkOutState.selectedPlateNo = plateNo"
              >
                <el-icon v-if="checkOutState.selectedPlateNo === plateNo"><Check /></el-icon>
                <span class="plate-no">{{ plateNo }}</span>
              </div>
            </div>
          </div>
          <div v-else class="single-plate">
            <el-tag size="large" :type="getSpaceTypeTag(currentReservation.spaceType)">
              {{ currentReservation.plateNo }}
            </el-tag>
          </div>
        </div>

        <!-- 车位信息 -->
        <div class="info-row">
          <span class="label">Space</span>
          <span class="value">
            <el-tag type="info" v-if="currentReservation.zoneName">
              Zone {{ currentReservation.zoneName }}
            </el-tag>
            <el-tag 
              v-if="currentReservation.spaceNo" 
              :type="getSpaceTypeTag(currentReservation.spaceType)"
              class="ml-2"
            >
              Space {{ currentReservation.spaceNo }}
            </el-tag>
          </span>
        </div>

        <!-- 时间信息 -->
        <div class="info-row">
          <span class="label">Time</span>
          <span class="value time-info">
            <div>
              <el-icon><Calendar /></el-icon>
              Start: {{ formatDateTime(currentReservation.startTime) }}
            </div>
            <div>
              <el-icon><Calendar /></el-icon>
              End: {{ formatDateTime(currentReservation.endTime) }}
            </div>
          </span>
        </div>
      </div>

      <!-- 超时费用信息 -->
      <div v-if="isOverdue" class="overdue-info">
        <h3 class="section-title">Overdue Information</h3>
        <div class="fee-details">
          <div class="fee-item">
            <span class="label">Overdue Duration</span>
            <span class="value">{{ formatDuration(currentReservation.overdueMinutes || 0) }}</span>
          </div>
          <div class="fee-item">
            <span class="label">Rate</span>
            <span class="value">${{ overdueRate }}/hour</span>
          </div>
          <div class="fee-item total">
            <span class="label">Overdue Fee</span>
            <span class="value amount">${{ calculateOverdueFee().toFixed(2) }}</span>
          </div>
        </div>

        <!-- 支付方式选择 -->
        <div class="payment-section">
          <h3 class="section-title">Select Payment Method</h3>
          <div class="payment-methods">
            <div 
              v-for="method in paymentMethods" 
              :key="method.value"
              class="payment-method-item"
              :class="{ active: checkOutState.selectedMethod === method.value }"
              @click="checkOutState.selectedMethod = method.value"
            >
              <div class="method-icon">
                <el-icon><component :is="method.icon" /></el-icon>
              </div>
              <div class="method-info">
                <div class="method-name">{{ method.label }}</div>
                <div class="method-desc">{{ method.description }}</div>
              </div>
              <div class="method-check">
                <el-icon v-show="checkOutState.selectedMethod === method.value">
                  <Check />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="checkOutDialogVisible = false">Cancel</el-button>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="(currentReservation?.plateNos?.length > 1 && !checkOutState.selectedPlateNo) || 
              (isOverdue && !checkOutState.selectedMethod)"
            @click="handleCheckOutConfirm"
          >
            {{ isOverdue ? 'Pay & Check-out' : 'Confirm Check-out' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Calendar, Timer, Check, Close, RefreshRight, Van, Money, View, ArrowDown, More } from '@element-plus/icons-vue'
import type { Reservation, ReservationSearchForm } from '@/types/reservation'
import { ReservationStatus } from '@/types/reservation'
import RefundDialog from '@/components/reservation/RefundDialog.vue'
import { formatDateTime, formatDuration } from '@/utils/format'
import CreateReservationDialog from '@/components/reservation/CreateReservationDialog.vue'
import type { ReservationType } from '@/types/reservation'

interface ReservationDetail extends ReservationType {
  serviceFee: number
  tax: number
  amount: number
  duration: number
}

const router = useRouter()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentReservation = ref<ReservationDetail | null>(null)

// Status map
const statusMap: Record<ReservationStatus, string> = {
  [ReservationStatus.Pending]: 'Pending Payment',
  [ReservationStatus.AwaitingUse]: 'AwaitingUse',
  [ReservationStatus.InUse]: 'In Use',
  [ReservationStatus.Used]: 'Used',
  [ReservationStatus.Cancelled]: 'Cancelled',
  [ReservationStatus.Refunded]: 'Refunded',
  [ReservationStatus.Expired]: 'Expired',
  [ReservationStatus.PaymentFailed]: 'Payment Failed',
  [ReservationStatus.RefundFailed]: 'Refund Failed',
  [ReservationStatus.RefundRequested]: 'Refund Requested',
  [ReservationStatus.RefundInProcess]: 'Processing Refund',
  [ReservationStatus.Overdue]: 'Overdue'
}

// Search form
const searchForm = reactive<ReservationSearchForm>({
  orderNo: '',
  customerName: '',
  parkingLot: '',
  status: '',
  dateRange: null,
  spaceType: ''
})

// Mock parking lots
const parkingLots = [
  { label: 'Downtown Parking', value: 'downtown' },
  { label: 'Airport Parking', value: 'airport' },
  { label: 'Mall Parking', value: 'mall' }
]

// Mock data
const reservationList = ref([
  {
    id: '1',
    orderNo: 'R20240215001',
    customerName: 'John Doe',
    phone: '(123) 456-7890',
    email: 'john@example.com',
    plateNo: 'CA123ABC',
    parkingLot: 'Downtown Parking',
    zoneName: 'A',
    spaceNo: '123',
    spaceType: 'standard',
    startTime: '2024-02-15T10:00:00',
    endTime: '2024-02-15T18:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.Pending,
    createdAt: '2024-02-14T15:30:00'
  },
  {
    id: '2',
    orderNo: 'R20240215002',
    customerName: 'Jane Smith',
    phone: '(234) 567-8901',
    email: 'jane@example.com',
    plateNo: 'NY456DEF',
    parkingLot: 'Downtown Parking',
    zoneName: 'B',
    spaceNo: '234',
    spaceType: 'large',
    startTime: '2024-02-15T09:00:00',
    endTime: '2024-02-15T17:00:00',
    duration: 480,
    amount: 35.00,
    status: ReservationStatus.PaymentFailed,
    createdAt: '2024-02-14T14:30:00'
  },
  {
    id: '3',
    orderNo: 'R20240215003',
    customerName: 'Mike Johnson',
    phone: '(345) 678-9012',
    email: 'mike@example.com',
    plateNo: 'TX789GHI',
    parkingLot: 'Downtown Parking',
    zoneName: 'C',
    spaceNo: '345',
    spaceType: 'standard',
    startTime: '2024-02-15T11:00:00',
    endTime: '2024-02-15T19:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.AwaitingUse,
    createdAt: '2024-02-14T16:30:00'
  },
  {
    id: '4',
    orderNo: 'R20240215004',
    customerName: 'Sarah Wilson',
    phone: '(456) 789-0123',
    email: 'sarah@example.com',
    plateNo: 'FL012JKL',
    parkingLot: 'Downtown Parking',
    zoneName: 'A',
    spaceNo: '456',
    spaceType: 'valet',
    startTime: '2024-02-15T08:00:00',
    endTime: '2024-02-15T16:00:00',
    duration: 480,
    amount: 45.00,
    status: ReservationStatus.InUse,
    createdAt: '2024-02-14T13:30:00'
  },
  {
    id: '5',
    orderNo: 'R20240215005',
    customerName: 'Tom Brown',
    phone: '(567) 890-1234',
    email: 'tom@example.com',
    plateNo: 'CA345MNO',
    parkingLot: 'Downtown Parking',
    zoneName: 'B',
    spaceNo: '567',
    spaceType: 'standard',
    startTime: '2024-02-15T07:00:00',
    endTime: '2024-02-15T15:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.Overdue,
    createdAt: '2024-02-14T12:30:00'
  },
  {
    id: '6',
    orderNo: 'R20240215006',
    customerName: 'Lisa Davis',
    phone: '(678) 901-2345',
    email: 'lisa@example.com',
    plateNo: 'NY678PQR',
    parkingLot: 'Downtown Parking',
    zoneName: 'C',
    spaceNo: '678',
    spaceType: 'large',
    startTime: '2024-02-15T06:00:00',
    endTime: '2024-02-15T14:00:00',
    duration: 480,
    amount: 35.00,
    status: ReservationStatus.Used,
    createdAt: '2024-02-14T11:30:00'
  },
  {
    id: '7',
    orderNo: 'R20240215007',
    customerName: 'David Miller',
    phone: '(789) 012-3456',
    email: 'david@example.com',
    plateNo: 'TX901STU',
    parkingLot: 'Downtown Parking',
    zoneName: 'A',
    spaceNo: '789',
    spaceType: 'standard',
    startTime: '2024-02-15T05:00:00',
    endTime: '2024-02-15T13:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.RefundRequested,
    createdAt: '2024-02-14T10:30:00'
  },
  {
    id: '8',
    orderNo: 'R20240215008',
    customerName: 'Emma Wilson',
    phone: '(890) 123-4567',
    email: 'emma@example.com',
    plateNo: 'FL234VWX',
    parkingLot: 'Downtown Parking',
    zoneName: 'B',
    spaceNo: '890',
    spaceType: 'valet',
    startTime: '2024-02-15T04:00:00',
    endTime: '2024-02-15T12:00:00',
    duration: 480,
    amount: 45.00,
    status: ReservationStatus.RefundInProcess,
    createdAt: '2024-02-14T09:30:00'
  },
  {
    id: '9',
    orderNo: 'R20240215009',
    customerName: 'James Taylor',
    phone: '(901) 234-5678',
    email: 'james@example.com',
    plateNo: 'CA567YZA',
    parkingLot: 'Downtown Parking',
    zoneName: 'C',
    spaceNo: '901',
    spaceType: 'standard',
    startTime: '2024-02-15T03:00:00',
    endTime: '2024-02-15T11:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.RefundFailed,
    createdAt: '2024-02-14T08:30:00'
  },
  {
    id: '10',
    orderNo: 'R20240215010',
    customerName: 'Olivia Martin',
    phone: '(012) 345-6789',
    email: 'olivia@example.com',
    plateNo: 'NY890BCD',
    parkingLot: 'Downtown Parking',
    zoneName: 'A',
    spaceNo: '012',
    spaceType: 'large',
    startTime: '2024-02-15T02:00:00',
    endTime: '2024-02-15T10:00:00',
    duration: 480,
    amount: 35.00,
    status: ReservationStatus.Refunded,
    createdAt: '2024-02-14T07:30:00'
  },
  {
    id: '11',
    orderNo: 'R20240215011',
    customerName: 'William Anderson',
    phone: '(123) 456-7890',
    email: 'william@example.com',
    plateNo: 'TX123EFG',
    parkingLot: 'Downtown Parking',
    zoneName: 'B',
    spaceNo: '123',
    spaceType: 'standard',
    startTime: '2024-02-15T01:00:00',
    endTime: '2024-02-15T09:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.Cancelled,
    createdAt: '2024-02-14T06:30:00'
  },
  {
    id: '12',
    orderNo: 'R20240215012',
    customerName: 'Sophia Clark',
    phone: '(234) 567-8901',
    email: 'sophia@example.com',
    plateNo: 'FL456HIJ',
    parkingLot: 'Downtown Parking',
    zoneName: 'C',
    spaceNo: '456',
    spaceType: 'valet',
    startTime: '2024-02-15T00:00:00',
    endTime: '2024-02-15T08:00:00',
    duration: 480,
    amount: 45.00,
    status: ReservationStatus.Expired,
    createdAt: '2024-02-14T05:30:00'
  }
])

// Dialog control
const refundVisible = ref(false)

// Status options for filter
const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending Payment', value: ReservationStatus.Pending },
  { label: 'AwaitingUse', value: ReservationStatus.AwaitingUse },
  { label: 'In Use', value: ReservationStatus.InUse },
  { label: 'Used', value: ReservationStatus.Used },
  { label: 'Cancelled', value: ReservationStatus.Cancelled },
  { label: 'Refunded', value: ReservationStatus.Refunded },
  { label: 'Expired', value: ReservationStatus.Expired },
  { label: 'Payment Failed', value: ReservationStatus.PaymentFailed },
  { label: 'Refund Failed', value: ReservationStatus.RefundFailed },
  { label: 'Refund Requested', value: ReservationStatus.RefundRequested },
  { label: 'Processing Refund', value: ReservationStatus.RefundInProcess },
  { label: 'Overdue', value: ReservationStatus.Overdue }
]

// Utility functions
const getStatusType = (status: ReservationStatus): string => {
  const types: Record<ReservationStatus, string> = {
    [ReservationStatus.Pending]: 'warning', // 黄色警
    [ReservationStatus.AwaitingUse]: 'success', // 绿色正常
    [ReservationStatus.InUse]: 'primary', // 蓝色进行中
    [ReservationStatus.Used]: 'success', // 绿色完成
    [ReservationStatus.Cancelled]: 'info', // 灰色取消
    [ReservationStatus.Refunded]: 'info', // 灰色退款
    [ReservationStatus.Expired]: 'danger', // 红色过期
    [ReservationStatus.PaymentFailed]: 'danger', // 红色支付失败
    [ReservationStatus.RefundFailed]: 'danger', // 红色退款失败
    [ReservationStatus.RefundRequested]: 'warning', // 黄色申请退款
    [ReservationStatus.RefundInProcess]: 'warning', // 黄色退款处理中
    [ReservationStatus.Overdue]: 'danger' // 红色超时
  }
  return types[status] || 'info'
}

const getSpaceTypeTag = (type: string): string => {
  const types: Record<string, string> = {
    standard: '',
    large: 'warning',
    valet: 'success'
  }
  return types[type] || ''
}

const formatSpaceType = (type: string): string => {
  const types: Record<string, string> = {
    standard: 'Standard',
    large: 'Large Vehicle',
    valet: 'Valet'
  }
  return types[type] || type
}

const canCancel = (status: ReservationStatus): boolean => {
  return [
    ReservationStatus.Pending,
    ReservationStatus.AwaitingUse
  ].includes(status)
}

const canRefund = (status: ReservationStatus): boolean => {
  return [
    ReservationStatus.AwaitingUse,
    ReservationStatus.Used
  ].includes(status)
}

// Event handlers
const handleSearch = () => {
  // TODO: Implement search logic
  console.log('Search form:', searchForm)
}

const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    customerName: '',
    parkingLot: '',
    status: '',
    dateRange: null,
    spaceType: ''
  })
}

const handleAdd = () => {
  createDialogVisible.value = true
}

const handleExport = () => {
  // TODO: Implement export logic
  ElMessage.success('Export started')
}

const handleView = (row: Reservation) => {
  router.push(`/reservation/detail/${row.id}`)
}

// 添加支付方式选择弹窗
const paymentDialogVisible = ref(false)
const selectedPaymentMethod = ref('')

// 支付方式选项
const paymentMethods = [
  {
    value: 'qr',
    label: 'QR Code Payment',
    icon: 'QrCode',
    description: 'Scan QR code to pay with mobile phone'
  },
  {
    value: 'cash',
    label: 'Cash Payment',
    icon: 'Money',
    description: 'Pay with cash'
  },
  {
    value: 'sms',
    label: 'SMS Link Payment',
    icon: 'Message',
    description: 'Receive payment link via SMS'
  },
  {
    value: 'none',
    label: 'No Payment Required',
    icon: 'CircleCheck',
    description: 'Mark as no payment required'
  }
]

// 支付相关状态
const paymentState = reactive({
  selectedMethod: '',
  cashReceived: 0,
  phoneNumber: '',
  qrCodeUrl: '',
  loading: false,
  canConfirm: false
})

// 监听支付方式变化
watch(() => paymentState.selectedMethod, (method) => {
  paymentState.canConfirm = false
  if (method === 'cash') {
    paymentState.canConfirm = paymentState.cashReceived >= currentReservation.value?.amount
  } else if (method === 'sms') {
    paymentState.canConfirm = !!paymentState.phoneNumber
  } else if (method === 'none') {
    paymentState.canConfirm = true
  }
})

// 计算找零金额
const changeAmount = computed(() => {
  if (!currentReservation.value || !paymentState.cashReceived) return 0
  return paymentState.cashReceived - currentReservation.value.amount
})

// 处理支付方式选择
const handlePaymentMethodSelect = async () => {
  try {
    paymentState.loading = true
    
    switch (paymentState.selectedMethod) {
      case 'qr':
        // 获取支付二维码
        const { qrCodeUrl } = await generateQrCode(currentReservation.value)
        paymentState.qrCodeUrl = qrCodeUrl
        // 开始轮询支付状态
        startPollingPaymentStatus()
        break
        
      case 'cash':
        await processCashPayment({
          reservationId: currentReservation.value?.id,
          received: paymentState.cashReceived,
          change: changeAmount.value
        })
        completePayment()
        break
        
      case 'sms':
        await sendPaymentLink({
          reservationId: currentReservation.value?.id,
          phone: paymentState.phoneNumber
        })
        ElMessage.success('Payment link has been sent')
        paymentDialogVisible.value = false
        break
        
      case 'none':
        await markAsNoPayment(currentReservation.value?.id)
        completePayment()
        break
    }
  } catch (error) {
    ElMessage.error('Payment failed, please try again')
  } finally {
    paymentState.loading = false
  }
}

// 处理确认支付
const handleConfirmPayment = async (row: Reservation) => {
  // 计算费用明细
  const serviceFee = row.amount * 0.9 // 假设服务费占90%
  const tax = row.amount * 0.1 // 假设税费占10%
  
  currentReservation.value = {
    ...row,
    serviceFee,
    tax,
    amount: row.amount,
    duration: calculateDuration(row.startTime, row.endTime)
  }
  paymentDialogVisible.value = true
}

// 计算时长
const calculateDuration = (start: string, end: string): number => {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  return Math.floor((endTime - startTime) / (1000 * 60)) // 返回分钟数
}

// 处理取消订单
const handleCancel = async (row: Reservation) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to cancel this reservation? This action cannot be undone.',
      'Cancel Reservation',
      {
        confirmButtonText: 'Yes, Cancel',
        cancelButtonText: 'No',
        type: 'warning'
      }
    )

    // TODO: 调用取消订单API
    // 模拟取消处理
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新订单状态为已取消
    row.status = ReservationStatus.Cancelled
    // TODO: 更新列表中的订单状态

    ElMessage.success('Reservation cancelled successfully')
  } catch {
    // 用户取消操作
  } finally {
    loading.value = false
  }
}

const handleRefund = (row: Reservation) => {
  currentReservation.value = row
  refundVisible.value = true
}

const handleRefundConfirm = async (data: any) => {
  // TODO: Implement refund logic
  console.log('Refund data:', data)
  ElMessage.success('Refund request submitted')
  refundVisible.value = false
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: Reload data
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: Reload data
}

// 操作按钮判断
const getActions = (status: ReservationStatus): string[] => {
  switch (status) {
    case ReservationStatus.Pending:
      return ['confirm_payment', 'cancel', 'view']
    case ReservationStatus.PaymentFailed:
      return ['retry_payment', 'cancel', 'view']
    case ReservationStatus.AwaitingUse:
      return ['check_in', 'refund', 'view']
    case ReservationStatus.InUse:
      return ['check_out', 'view']
    case ReservationStatus.Overdue:
      return ['check_out', 'add_penalty', 'view']
    case ReservationStatus.Used:
      return ['refund', 'view']
    case ReservationStatus.RefundRequested:
    case ReservationStatus.RefundInProcess:
      return ['view']
    case ReservationStatus.RefundFailed:
      return ['retry_refund', 'view']
    case ReservationStatus.Cancelled:
    case ReservationStatus.Refunded:
    case ReservationStatus.Expired:
      return ['view']
    default:
      return ['view']
  }
}

// Check In 处理
const checkInDialogVisible = ref(false)
const checkInState = reactive({
  selectedPlateNo: '',
  loading: false
})

const handleCheckIn = async (row: Reservation) => {
  // 检查是否可以进场
  const now = new Date()
  const startTime = new Date(row.startTime)
  const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60) // 转换为分钟

  if (timeDiff > 30) { // 提前30分钟以上
    ElMessageBox.alert(
      `This reservation starts at ${formatDateTime(row.startTime)}. Early check-in is not allowed.`,
      'Early Check-in',
      { type: 'warning' }
    )
    return
  }

  // 设置当前预约
  currentReservation.value = row
  checkInDialogVisible.value = true
}

// 处理Check-in确认
const handleCheckInConfirm = async () => {
  if (!currentReservation.value) return
  
  try {
    loading.value = true
    // TODO: 调用check-in API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新订单状态
    currentReservation.value.status = ReservationStatus.InUse
    currentReservation.value.checkInTime = new Date().toISOString()
    ElMessage.success('Check-in successful')
    checkInDialogVisible.value = false

  } catch {
    // 用户取消操作
  } finally {
    loading.value = false
  }
}

// Check Out 处理
const checkOutDialogVisible = ref(false)
const checkOutState = reactive({
  selectedPlateNo: '',
  selectedMethod: '',
  loading: false
})

// 超时费率（每小时）
const overdueRate = 10

// 是否超时
const isOverdue = computed(() => {
  return currentReservation.value?.status === ReservationStatus.Overdue
})

// 计算超时费用
const calculateOverdueFee = () => {
  if (!currentReservation.value?.overdueMinutes) return 0
  return Math.ceil(currentReservation.value.overdueMinutes / 60) * overdueRate
}

const handleCheckOut = async (row: Reservation) => {
  currentReservation.value = row
  checkOutState.selectedPlateNo = row.plateNos?.length > 1 ? '' : row.plateNo
  checkOutState.selectedMethod = ''
  checkOutDialogVisible.value = true
}

// 处理Check-out确认
const handleCheckOutConfirm = async () => {
  if (!currentReservation.value) return
  
  try {
    loading.value = true

    // TODO: 调用check-out API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新订单状态 
    currentReservation.value.status = ReservationStatus.Used
    currentReservation.value.checkOutTime = new Date().toISOString()
    ElMessage.success('Check-out successful')
    checkOutDialogVisible.value = false

  } catch {
    // 用户取消操作
  } finally {
    loading.value = false
  }
}

// 添加控制变量
const createDialogVisible = ref(false)

// 添加创建成功的处理函数
const handleReservationCreated = () => {
  // 重新加载列表数据
  loadReservationList()
}
</script>

<style scoped lang="scss">
.reservation-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .time-info {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .el-icon {
      margin-right: 4px;
      color: #909399;
    }
  }

  .amount {
    font-weight: bold;
    color: #67c23a;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .primary-action {
      flex: 1;
      min-width: 0; // 防止按钮溢出
      
      .el-button {
        width: 100%;
        justify-content: center;
        
        .el-icon {
          margin-right: 4px;
        }
      }
    }

    .secondary-action {
      flex-shrink: 0;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

.payment-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.order-summary {
  margin-bottom: 24px;
}

.order-info {
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-item {
    flex: 1;

    .label {
      color: var(--el-text-color-secondary);
      font-size: 14px;
      margin-right: 8px;
    }

    .value {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }
}

.payment-details {
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    
    &.total {
      border-top: 1px solid var(--el-border-color-lighter);
      margin-top: 8px;
      padding-top: 16px;
    }

    .label {
      color: var(--el-text-color-secondary);
    }
  
    .value {
      font-weight: 500;
      color: var(--el-text-color-primary);
  
      &.amount {
        font-size: 18px;
        color: var(--el-color-success);
      }
    }
  }
}

.payment-section {
  .payment-methods {
    margin-bottom: 20px;
  }

  .payment-content {
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
    margin-bottom: 20px;
  }
}

.payment-method-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .method-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background-color: var(--el-color-primary-light-8);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .el-icon {
      font-size: 24px;
      color: var(--el-color-primary);
    }
  }

  .method-info {
    flex: 1;
    min-width: 0;

    .method-name {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--el-text-color-primary);
    }

    .method-desc {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      line-height: 1.4;
    }
  }

  .method-check {
    position: absolute;
    top: 12px;
    right: 12px;
    color: var(--el-color-primary);
    font-size: 18px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.action-buttons {
  display: flex;
  gap: 16px;
  
  &.single-action {
    justify-content: center;
  }
  
  .el-button {
    padding: 4px 0;
    height: auto;
    font-size: 14px;
  }
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .el-icon {
    margin-right: 4px;
    color: #909399;
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-width: 160px;
  
  .el-icon {
    margin-right: 4px;
  }
}

.space-location {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-tag {
    margin: 0;
  }
}

.check-in-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }

  .order-info {
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;

    .info-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 80px;
        color: var(--el-text-color-secondary);
        font-size: 14px;
        padding-top: 4px;
      }

      .value {
        flex: 1;
        color: var(--el-text-color-primary);
        font-weight: 500;

        &.time-info {
          .el-icon {
            margin-right: 4px;
            color: #909399;
          }
        }
        
        .el-tag + .el-tag {
          margin-left: 8px;
        }
      }
    }
  }

  .vehicle-info {
    text-align: center;
    padding: 20px 0;
    
    .section-title {
      font-size: 16px;
      color: var(--el-text-color-secondary);
      margin-bottom: 16px;
    }
    
    .plate-tag {
      font-size: 24px;
      padding: 12px 24px;
      height: auto;
      border-radius: 8px;
    }
  }
}

.multiple-plates {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  .plate-count {
    font-size: 12px;
    padding: 0 4px;
    height: 18px;
    line-height: 16px;
  }
}

.check-out-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }

  .vehicle-info {
    margin: 20px 0;
    
    .section-title {
      font-size: 16px;
      color: var(--el-text-color-secondary);
      margin-bottom: 16px;
    }
    
    .plate-selection {
      .plate-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .plate-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border: 1px solid var(--el-border-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }

        &.active {
          border-color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }
      }
    }

    .single-plate {
      text-align: center;
      
      .el-tag {
        font-size: 20px;
        padding: 12px 24px;
        height: auto;
      }
    }
  }

  .payment-methods {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;

    .payment-method-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      &.active {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      .method-icon {
        font-size: 24px;
        color: var(--el-color-primary);
      }

      .method-info {
        flex: 1;

        .method-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .method-desc {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>