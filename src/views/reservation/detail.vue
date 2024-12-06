<template>
  <div class="reservation-detail">
    <!-- Header -->
    <div class="detail-header">
      <div class="left">
        <el-button @click="router.push('/reservation')">
          <el-icon><ArrowLeft /></el-icon>
          Back
        </el-button>
        <span class="order-no">Order: {{ reservation?.orderNo }}</span>
      </div>
      <div class="right">
        <!-- Action Buttons -->
        <template v-if="reservation">
          <!-- Pending Payment -->
          <template v-if="reservation.status === ReservationStatus.Pending">
            <el-button type="primary" @click="handleConfirmPayment">
              <el-icon><Check /></el-icon>Confirm Payment
            </el-button>
            <el-button type="danger" @click="handleCancel">
              <el-icon><Close /></el-icon>Cancel
            </el-button>
          </template>

          <!-- Payment Failed -->
          <template v-if="reservation.status === ReservationStatus.PaymentFailed">
            <el-button type="primary" @click="handleRetryPayment">
              <el-icon><RefreshRight /></el-icon>Retry Payment
            </el-button>
            <el-button type="danger" @click="handleCancel">
              <el-icon><Close /></el-icon>Cancel
            </el-button>
          </template>

          <!-- AwaitingUse -->
          <template v-if="reservation.status === ReservationStatus.AwaitingUse">
            <el-button type="success" @click="handleCheckIn">
              <el-icon><Van /></el-icon>Check In
            </el-button>
            <el-button type="danger" @click="handleCancel">
              <el-icon><Close /></el-icon>Cancel
            </el-button>
            <el-button type="warning" @click="handleRefund">
              <el-icon><Money /></el-icon>Request Refund
            </el-button>
          </template>

          <!-- InUse -->
          <template v-if="reservation.status === ReservationStatus.InUse">
            <el-button type="warning" @click="handleCheckOut">
              <el-icon><Van /></el-icon>Check Out
            </el-button>
          </template>

          <!-- Overdue -->
          <template v-if="reservation.status === ReservationStatus.Overdue">
            <el-button type="danger" @click="handleCheckOut">
              <el-icon><Timer /></el-icon>Check Out (Overdue)
            </el-button>
          </template>

          <!-- Used -->
          <template v-if="reservation.status === ReservationStatus.Used">
            <el-button type="warning" @click="handleRefund">
              <el-icon><Money /></el-icon>Request Refund
            </el-button>
          </template>

          <!-- RefundFailed -->
          <template v-if="reservation.status === ReservationStatus.RefundFailed">
            <el-button type="warning" @click="handleRetryRefund">
              <el-icon><RefreshRight /></el-icon>Retry Refund
            </el-button>
          </template>
        </template>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- Error State -->
    <el-empty v-else-if="!reservation" description="Reservation not found">
      <template #extra>
        <el-button type="primary" @click="router.push('/reservation')">
          Back to List
        </el-button>
      </template>
    </el-empty>

    <!-- Content -->
    <template v-else>
      <div class="detail-content">
        <!-- Left Content -->
        <div class="left-content">
          <!-- Basic Info -->
          <div class="detail-section">
            <h3>Basic Information</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Order No.">{{ reservation.orderNo }}</el-descriptions-item>
              <el-descriptions-item label="Status">
                <el-tag :type="getStatusType(reservation.status)">
                  {{ statusMap[reservation.status] }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Customer">{{ reservation.customerName }}</el-descriptions-item>
              <el-descriptions-item label="Phone">{{ reservation.phone }}</el-descriptions-item>
              <el-descriptions-item label="Email">{{ reservation.email }}</el-descriptions-item>
              <el-descriptions-item label="Created At">{{ formatDateTime(reservation.createdAt) }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- Parking Info -->
          <div class="detail-section">
            <h3>Parking Information</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Parking Lot">{{ reservation.parkingLot }}</el-descriptions-item>
              <el-descriptions-item label="Space Type">
                <el-tag :type="getSpaceTypeTag(reservation.spaceType)">
                  {{ formatSpaceType(reservation.spaceType) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Space Location">
                <el-tag type="info">Zone {{ reservation.zoneName }}</el-tag>
                <el-tag class="ml-2">Space {{ reservation.spaceNo }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Duration">
                {{ formatDuration(reservation.duration) }}
                <template v-if="reservation.overdueMinutes">
                  <el-tag type="danger" class="ml-2">
                    Overdue: {{ formatDuration(reservation.overdueMinutes) }}
                  </el-tag>
                </template>
              </el-descriptions-item>
              <el-descriptions-item label="Start Time">{{ formatDateTime(reservation.startTime) }}</el-descriptions-item>
              <el-descriptions-item label="End Time">{{ formatDateTime(reservation.endTime) }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- Status Timeline -->
          <div class="detail-section">
            <h3>Status Timeline</h3>
            <el-timeline>
              <!-- 创建订单 -->
              <el-timeline-item
                type="primary"
                :timestamp="formatDateTime(reservation.createdAt)"
              >
                Reservation created
              </el-timeline-item>

              <!-- 支付相关 -->
              <template v-if="reservation.paymentTime">
                <el-timeline-item
                  type="success"
                  :timestamp="formatDateTime(reservation.paymentTime)"
                >
                  Payment confirmed ({{ reservation.paymentMethod }})
                </el-timeline-item>
              </template>

              <template v-if="reservation.status === ReservationStatus.PaymentFailed">
                <el-timeline-item
                  type="danger"
                  :timestamp="formatDateTime(reservation.paymentFailedTime)"
                >
                  Payment failed
                </el-timeline-item>
              </template>

              <!-- 进场记录 -->
              <template v-if="reservation.checkInTime">
                <el-timeline-item
                  type="success"
                  :timestamp="formatDateTime(reservation.checkInTime)"
                >
                  Checked in (Zone {{ reservation.zoneName }} - Space {{ reservation.spaceNo }})
                </el-timeline-item>
              </template>

              <!-- 离场记录 -->
              <template v-if="reservation.checkOutTime">
                <el-timeline-item
                  :type="reservation.overdueMinutes ? 'warning' : 'success'"
                  :timestamp="formatDateTime(reservation.checkOutTime)"
                >
                  Checked out 
                  <template v-if="reservation.overdueMinutes">
                    (Overdue: {{ formatDuration(reservation.overdueMinutes) }})
                  </template>
                </el-timeline-item>
              </template>

              <!-- 退款相关 -->
              <template v-if="reservation.refundRequestTime">
                <el-timeline-item
                  type="warning"
                  :timestamp="formatDateTime(reservation.refundRequestTime)"
                >
                  Refund requested
                </el-timeline-item>
              </template>

              <template v-if="reservation.refundTime">
                <el-timeline-item
                  type="success"
                  :timestamp="formatDateTime(reservation.refundTime)"
                >
                  Refund completed
                </el-timeline-item>
              </template>

              <template v-if="reservation.status === ReservationStatus.RefundFailed">
                <el-timeline-item
                  type="danger"
                  :timestamp="formatDateTime(reservation.refundFailedTime)"
                >
                  Refund failed
                </el-timeline-item>
              </template>

              <!-- 取消记录 -->
              <template v-if="reservation.status === ReservationStatus.Cancelled">
                <el-timeline-item
                  type="info"
                  :timestamp="formatDateTime(reservation.cancelledTime)"
                >
                  Reservation cancelled
                </el-timeline-item>
              </template>

              <!-- 过期记录 -->
              <template v-if="reservation.status === ReservationStatus.Expired">
                <el-timeline-item
                  type="danger"
                  :timestamp="formatDateTime(reservation.expiredTime)"
                >
                  Reservation expired
                </el-timeline-item>
              </template>
            </el-timeline>
          </div>
        </div>

        <!-- Right Content - Payment Info -->
        <div class="right-content">
          <div class="payment-card">
            <h3>Payment Information</h3>
            <el-descriptions direction="vertical" :column="1" border>
              <!-- 基础费用 -->
              <el-descriptions-item label="Parking Fee">
                <span class="amount">${{ reservation.parkingFee?.toFixed(2) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="Service Fee">
                <span class="amount">${{ reservation.serviceFee?.toFixed(2) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="Tax">
                <span class="amount">${{ reservation.tax?.toFixed(2) }}</span>
              </el-descriptions-item>
              
              <!-- 小计 -->
              <el-descriptions-item label="Subtotal">
                <span class="subtotal">${{ reservation.subtotal?.toFixed(2) }}</span>
              </el-descriptions-item>
              
              <!-- 优惠信息 -->
              <el-descriptions-item label="Discount" v-if="reservation.discount">
                <span class="discount">-${{ reservation.discount?.toFixed(2) }}</span>
              </el-descriptions-item>
              
              <!-- 超时费用 -->
              <el-descriptions-item label="Overdue Fee" v-if="reservation.overdueFee">
                <span class="overdue">+${{ reservation.overdueFee?.toFixed(2) }}</span>
                <el-tooltip effect="dark" placement="right">
                  <template #content>
                    Overdue: {{ formatDuration(reservation.overdueMinutes || 0) }}
                  </template>
                  <el-icon class="ml-2"><InfoFilled /></el-icon>
                </el-tooltip>
              </el-descriptions-item>
              
              <!-- 最终金额 -->
              <el-descriptions-item label="Final Amount">
                <span class="total-amount">${{ reservation.finalAmount?.toFixed(2) }}</span>
              </el-descriptions-item>

              <!-- 支付详情 -->
              <template v-if="reservation.paymentMethod">
                <div class="divider">Payment Details</div>
                <el-descriptions-item label="Payment Method">
                  {{ reservation.paymentMethod }}
                </el-descriptions-item>
                <el-descriptions-item label="Transaction ID">
                  {{ reservation.transactionId }}
                </el-descriptions-item>
                <el-descriptions-item label="Payment Time">
                  {{ formatDateTime(reservation.paymentTime) }}
                </el-descriptions-item>
              </template>

              <!-- 退款详情 -->
              <template v-if="reservation.refundAmount">
                <div class="divider">Refund Details</div>
                <el-descriptions-item label="Refund Amount">
                  <span class="refund">${{ reservation.refundAmount?.toFixed(2) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="Refund Method" v-if="reservation.refundMethod">
                  {{ reservation.refundMethod }}
                </el-descriptions-item>
                <el-descriptions-item label="Refund Transaction ID" v-if="reservation.refundTransactionId">
                  {{ reservation.refundTransactionId }}
                </el-descriptions-item>
                <el-descriptions-item label="Refund Time" v-if="reservation.refundTime">
                  {{ formatDateTime(reservation.refundTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="Refund Reason" v-if="reservation.refundReason">
                  {{ reservation.refundReason }}
                </el-descriptions-item>
              </template>
            </el-descriptions>
          </div>
        </div>
      </div>
    </template>

    <!-- Refund Dialog -->
    <RefundDialog
      v-model="refundVisible"
      :reservation="reservation"
      @confirm="handleRefundConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, Close, Money, Van, Timer, RefreshRight, InfoFilled } from '@element-plus/icons-vue'
import type { Reservation } from '@/types/reservation'
import { ReservationStatus, statusMap } from '@/types/reservation'
import { formatDateTime, formatDuration } from '@/utils/format'
import RefundDialog from '@/components/reservation/RefundDialog.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const reservation = ref<Reservation | null>(null)
const statusTimeline = ref<any[]>([])
const refundVisible = ref(false)

// Mock data for all status
const mockReservations = [
  {
    // Pending Payment
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
    createdAt: '2024-02-14T15:30:00',
    billingType: 'time',
    hourlyRate: 5.00,
    parkingFee: 20.00,
    serviceFee: 2.50,
    tax: 2.50,
    subtotal: 25.00,
    finalAmount: 25.00
  },
  {
    // Payment Failed
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
    createdAt: '2024-02-14T14:30:00',
    billingType: 'time',
    hourlyRate: 7.00,
    parkingFee: 28.00,
    serviceFee: 3.50,
    tax: 3.50,
    subtotal: 35.00,
    finalAmount: 35.00,
    paymentFailedTime: '2024-02-14T14:35:00'
  },
  {
    // Awaiting Use
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
    createdAt: '2024-02-14T16:30:00',
    billingType: 'time',
    hourlyRate: 5.00,
    parkingFee: 20.00,
    serviceFee: 2.50,
    tax: 2.50,
    subtotal: 25.00,
    finalAmount: 25.00,
    paymentMethod: 'Credit Card',
    paymentTime: '2024-02-14T16:35:00',
    transactionId: 'TXN123456'
  },
  {
    // In Use
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
    createdAt: '2024-02-14T13:30:00',
    billingType: 'time',
    hourlyRate: 9.00,
    parkingFee: 36.00,
    serviceFee: 4.50,
    tax: 4.50,
    subtotal: 45.00,
    finalAmount: 45.00,
    paymentMethod: 'Credit Card',
    paymentTime: '2024-02-14T13:35:00',
    transactionId: 'TXN234567',
    checkInTime: '2024-02-15T08:00:00'
  },
  {
    // Overdue
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
    amount: 45.00,
    status: ReservationStatus.Overdue,
    createdAt: '2024-02-14T12:30:00',
    billingType: 'time',
    hourlyRate: 5.00,
    parkingFee: 20.00,
    serviceFee: 2.50,
    tax: 2.50,
    subtotal: 25.00,
    overdueFee: 20.00,
    finalAmount: 45.00,
    paymentMethod: 'Credit Card',
    paymentTime: '2024-02-14T12:35:00',
    transactionId: 'TXN345678',
    checkInTime: '2024-02-15T07:00:00',
    overdueMinutes: 120
  },
  {
    // Used
    id: '6',
    orderNo: 'R20240215006',
    customerName: 'David Lee',
    phone: '(678) 901-2345',
    email: 'david@example.com',
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
    createdAt: '2024-02-14T11:30:00',
    billingType: 'time',
    hourlyRate: 7.00,
    parkingFee: 28.00,
    serviceFee: 3.50,
    tax: 3.50,
    subtotal: 35.00,
    finalAmount: 35.00,
    paymentMethod: 'Credit Card',
    paymentTime: '2024-02-14T11:35:00',
    transactionId: 'TXN456789',
    checkInTime: '2024-02-15T06:00:00',
    checkOutTime: '2024-02-15T14:00:00'
  },
  {
    // Refund Requested
    id: '7',
    orderNo: 'R20240215007',
    customerName: 'Lisa Chen',
    phone: '(789) 012-3456',
    email: 'lisa@example.com',
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
    createdAt: '2024-02-14T10:30:00',
    billingType: 'time',
    hourlyRate: 5.00,
    parkingFee: 20.00,
    serviceFee: 2.50,
    tax: 2.50,
    subtotal: 25.00,
    finalAmount: 25.00,
    paymentMethod: 'Credit Card',
    paymentTime: '2024-02-14T10:35:00',
    transactionId: 'TXN567890',
    refundRequestTime: '2024-02-14T11:00:00',
    refundReason: 'Customer Request'
  },
  {
    // Refund In Process
    id: '8',
    orderNo: 'R20240215008',
    customerName: 'Emma Davis',
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
    createdAt: '2024-02-14T09:30:00',
    billingType: 'time',
    hourlyRate: 9.00,
    parkingFee: 36.00,
    serviceFee: 4.50,
    tax: 4.50,
    subtotal: 45.00,
    finalAmount: 45.00,
    paymentMethod: 'Credit Card',
    paymentTime: '2024-02-14T09:35:00',
    transactionId: 'TXN678901',
    refundRequestTime: '2024-02-14T10:00:00',
    refundReason: 'Service Issue'
  },
  {
    // Refund Failed
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
    createdAt: '2024-02-14T08:30:00',
    billingType: 'time',
    hourlyRate: 5.00,
    parkingFee: 20.00,
    serviceFee: 2.50,
    tax: 2.50,
    subtotal: 25.00,
    finalAmount: 25.00,
    paymentMethod: 'Credit Card',
    paymentTime: '2024-02-14T08:35:00',
    transactionId: 'TXN789012',
    refundRequestTime: '2024-02-14T09:00:00',
    refundFailedTime: '2024-02-14T09:05:00',
    refundReason: 'Customer Request'
  },
  {
    // Refunded
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
    createdAt: '2024-02-14T07:30:00',
    billingType: 'time',
    hourlyRate: 7.00,
    parkingFee: 28.00,
    serviceFee: 3.50,
    tax: 3.50,
    subtotal: 35.00,
    finalAmount: 35.00,
    paymentMethod: 'Credit Card',
    paymentTime: '2024-02-14T07:35:00',
    transactionId: 'TXN890123',
    refundAmount: 35.00,
    refundTime: '2024-02-14T08:00:00',
    refundTransactionId: 'REF123456',
    refundReason: 'Customer Request'
  },
  {
    // Cancelled
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
    createdAt: '2024-02-14T06:30:00',
    billingType: 'time',
    hourlyRate: 5.00,
    parkingFee: 20.00,
    serviceFee: 2.50,
    tax: 2.50,
    subtotal: 25.00,
    finalAmount: 25.00,
    cancelledTime: '2024-02-14T07:00:00'
  },
  {
    // Expired
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
    createdAt: '2024-02-14T05:30:00',
    billingType: 'time',
    hourlyRate: 9.00,
    parkingFee: 36.00,
    serviceFee: 4.50,
    tax: 4.50,
    subtotal: 45.00,
    finalAmount: 45.00,
    expiredTime: '2024-02-15T00:30:00'
  }
]

// 生成时间轴数据
const generateTimeline = (reservation: Reservation) => {
  const timeline = []
  
  // 创建订单
  timeline.push({
    content: 'Reservation created',
    timestamp: formatDateTime(reservation.createdAt),
    type: 'primary'
  })

  // 支付相关
  if (reservation.status === ReservationStatus.PaymentFailed) {
    timeline.push({
      content: 'Payment failed',
      timestamp: formatDateTime(reservation.paymentFailedTime || ''),
      type: 'danger'
    })
  } else if (reservation.paymentTime) {
    timeline.push({
      content: `Payment confirmed (${reservation.paymentMethod})`,
      timestamp: formatDateTime(reservation.paymentTime),
      type: 'success'
    })
  }

  // 进场记录
  if (reservation.checkInTime) {
    timeline.push({
      content: `Checked in (Zone ${reservation.zoneName} - Space ${reservation.spaceNo})`,
      timestamp: formatDateTime(reservation.checkInTime),
      type: 'success'
    })
  }

  // 离场记录
  if (reservation.checkOutTime) {
    timeline.push({
      content: `Checked out${reservation.overdueMinutes ? ` (Overdue: ${formatDuration(reservation.overdueMinutes)})` : ''}`,
      timestamp: formatDateTime(reservation.checkOutTime),
      type: reservation.overdueMinutes ? 'warning' : 'success'
    })
  }

  // 退款相关
  if (reservation.status === ReservationStatus.RefundRequested) {
    timeline.push({
      content: 'Refund requested',
      timestamp: formatDateTime(reservation.refundRequestTime || ''),
      type: 'warning'
    })
  }

  if (reservation.status === ReservationStatus.RefundFailed) {
    timeline.push({
      content: 'Refund failed',
      timestamp: formatDateTime(reservation.refundFailedTime || ''),
      type: 'danger'
    })
  }

  if (reservation.status === ReservationStatus.Refunded) {
    timeline.push({
      content: 'Refund completed',
      timestamp: formatDateTime(reservation.refundTime || ''),
      type: 'success'
    })
  }

  // 取消/过期
  if (reservation.status === ReservationStatus.Cancelled) {
    timeline.push({
      content: 'Reservation cancelled',
      timestamp: formatDateTime(reservation.cancelledTime || ''),
      type: 'info'
    })
  }

  if (reservation.status === ReservationStatus.Expired) {
    timeline.push({
      content: 'Reservation expired',
      timestamp: formatDateTime(reservation.expiredTime || ''),
      type: 'danger'
    })
  }

  return timeline
}

// 获取状态标签类型
const getStatusType = (status: ReservationStatus): string => {
  const types: Record<ReservationStatus, string> = {
    [ReservationStatus.Pending]: 'warning',
    [ReservationStatus.AwaitingUse]: 'success',
    [ReservationStatus.InUse]: 'primary',
    [ReservationStatus.Used]: 'success',
    [ReservationStatus.Cancelled]: 'info',
    [ReservationStatus.Refunded]: 'info',
    [ReservationStatus.Expired]: 'danger',
    [ReservationStatus.PaymentFailed]: 'danger',
    [ReservationStatus.RefundFailed]: 'danger',
    [ReservationStatus.RefundRequested]: 'warning',
    [ReservationStatus.RefundInProcess]: 'warning',
    [ReservationStatus.Overdue]: 'danger'
  }
  return types[status] || 'info'
}

// 获取车位类型标签
const getSpaceTypeTag = (type: string): string => {
  const types: Record<string, string> = {
    standard: '',
    large: 'warning',
    valet: 'success'
  }
  return types[type] || ''
}

// 格式化车位类型
const formatSpaceType = (type: string): string => {
  const types: Record<string, string> = {
    standard: 'Standard',
    large: 'Large Vehicle',
    valet: 'Valet'
  }
  return types[type] || type
}

// Load reservation data
onMounted(async () => {
  const id = route.params.id
  console.log('Loading reservation:', id)
  
  try {
    loading.value = true
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 从模拟数据中查找对应订单
    const foundReservation = mockReservations.find(r => r.id === id)
    if (!foundReservation) {
      ElMessage.error('Reservation not found')
      return
    }

    // 设置订单数据
    reservation.value = foundReservation

    // 生成时间轴数据
    statusTimeline.value = generateTimeline(foundReservation)

  } catch (error) {
    console.error('Failed to load reservation:', error)
    ElMessage.error('Failed to load reservation details')
  } finally {
    loading.value = false
  }
})

// 处理操作按钮事件
const handleConfirmPayment = () => {
  ElMessage.success('Payment confirmed')
}

const handleRetryPayment = () => {
  ElMessage.success('Payment retried')
}

const handleCheckIn = () => {
  ElMessage.success('Check-in successful')
}

const handleCheckOut = () => {
  ElMessage.success('Check-out successful')
}

const handleCancel = () => {
  ElMessage.success('Reservation cancelled')
}

const handleRefund = () => {
  refundVisible.value = true
}

const handleRetryRefund = () => {
  ElMessage.success('Refund retried')
}

const handleRefundConfirm = (data: any) => {
  console.log('Refund data:', data)
  ElMessage.success('Refund request submitted')
  refundVisible.value = false
}
</script>

<style scoped lang="scss">
.reservation-detail {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #dcdfe6;

    .left {
      display: flex;
      align-items: center;
      gap: 20px;

      .order-no {
        font-size: 20px;
        font-weight: bold;
      }
    }

    .right {
      display: flex;
      gap: 12px;
    }
  }

  .detail-content {
    display: flex;
    gap: 20px;

    .left-content {
      flex: 1;
      min-width: 0; // 防止内容溢出

      .detail-section {
        margin-bottom: 20px;

        h3 {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }
    }

    .right-content {
      width: 380px;
      flex-shrink: 0;

      .payment-card {
        position: sticky;
        top: 20px;
        padding: 20px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        background-color: #fff;

        h3 {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }

        .divider {
          margin: 20px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #DCDFE6;
          font-weight: bold;
          color: #606266;
        }

        .amount {
          color: #606266;
        }

        .subtotal {
          color: #606266;
          font-weight: 500;
        }

        .discount {
          color: #F56C6C;
          font-weight: 500;
        }

        .overdue {
          color: #E6A23C;
          font-weight: 500;
        }

        .total-amount {
          font-size: 18px;
          font-weight: bold;
          color: #67C23A;
        }

        .refund {
          color: #F56C6C;
          font-weight: bold;
        }
      }
    }
  }
}
</style> 