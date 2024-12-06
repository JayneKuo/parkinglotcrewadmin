<template>
  <el-dialog
    :model-value="modelValue"
    title="Reservation Details"
    width="700px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="reservation" class="reservation-detail">
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
          <el-descriptions-item label="Space No." v-if="reservation.spaceNo">
            {{ reservation.spaceNo }}
          </el-descriptions-item>
          <el-descriptions-item label="Duration">{{ formatDuration(reservation.duration) }}</el-descriptions-item>
          <el-descriptions-item label="Start Time">{{ formatDateTime(reservation.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="End Time">{{ formatDateTime(reservation.endTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Payment Info -->
      <div class="detail-section">
        <h3>Payment Information</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Amount">
            <span class="amount">${{ reservation.amount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Payment Method" v-if="reservation.paymentMethod">
            {{ reservation.paymentMethod }}
          </el-descriptions-item>
          <el-descriptions-item label="Payment Time" v-if="reservation.paymentTime">
            {{ formatDateTime(reservation.paymentTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="Refund Amount" v-if="reservation.refundAmount">
            <span class="refund">${{ reservation.refundAmount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Refund Time" v-if="reservation.refundTime">
            {{ formatDateTime(reservation.refundTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="Refund Reason" v-if="reservation.refundReason">
            {{ reservation.refundReason }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Notes -->
      <div class="detail-section" v-if="reservation.notes">
        <h3>Notes</h3>
        <div class="notes">{{ reservation.notes }}</div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">Close</el-button>
        <el-button 
          v-if="canRefund(reservation?.status)"
          type="warning" 
          @click="$emit('refund')"
        >
          Request Refund
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ReservationStatus } from '@/types/reservation'
import type { Reservation } from '@/types/reservation'
import { formatDateTime, formatDuration } from '@/utils/format'

defineProps<{
  modelValue: boolean
  reservation: Reservation | null
}>()

defineEmits(['update:modelValue', 'refund'])

// Status map
const statusMap: Record<number, string> = {
  [ReservationStatus.Pending]: 'Pending Payment',
  [ReservationStatus.AwaitingUse]: 'Ready to Use',
  [ReservationStatus.Cancelled]: 'Cancelled',
  [ReservationStatus.Used]: 'Completed',
  [ReservationStatus.Refunded]: 'Refunded',
  [ReservationStatus.Expired]: 'Expired',
  [ReservationStatus.PaymentFailed]: 'Payment Failed',
  [ReservationStatus.RefundFailed]: 'Refund Failed',
  [ReservationStatus.RefundRequested]: 'Refund Requested',
  [ReservationStatus.RefundInProcess]: 'Processing Refund'
}

const getStatusType = (status: ReservationStatus): string => {
  const types: Record<number, string> = {
    [ReservationStatus.Pending]: 'warning',
    [ReservationStatus.AwaitingUse]: 'success',
    [ReservationStatus.Cancelled]: 'info',
    [ReservationStatus.Used]: 'success',
    [ReservationStatus.Refunded]: 'info',
    [ReservationStatus.Expired]: 'danger',
    [ReservationStatus.PaymentFailed]: 'danger',
    [ReservationStatus.RefundFailed]: 'danger',
    [ReservationStatus.RefundRequested]: 'warning',
    [ReservationStatus.RefundInProcess]: 'warning'
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

const canRefund = (status?: ReservationStatus): boolean => {
  if (!status) return false
  return [
    ReservationStatus.AwaitingUse,
    ReservationStatus.Used
  ].includes(status)
}
</script>

<style scoped lang="scss">
.reservation-detail {
  .detail-section {
    margin-bottom: 24px;

    h3 {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .amount {
      font-weight: bold;
      color: #67c23a;
    }

    .refund {
      font-weight: bold;
      color: #f56c6c;
    }

    .notes {
      padding: 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      color: #606266;
      line-height: 1.6;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 