<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`Spot Details - ${spot?.id}`"
    width="600px"
  >
    <div class="details-content">
      <!-- 基本信息 -->
      <div class="section">
        <div class="section-title">Basic Information</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Status</span>
            <el-tag :type="getSpotStatusType(spot?.status)">
              {{ spot?.status }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">Area</span>
            <span class="value">{{ spot?.area }}</span>
          </div>
        </div>
      </div>

      <!-- 占用状态信息 -->
      <template v-if="spot?.status === 'Occupied'">
        <!-- 车辆信息 -->
        <div class="section">
          <div class="section-title">Vehicle Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Vehicle Plate</span>
              <span class="value">{{ spot?.vehiclePlate }}</span>
            </div>
            <div class="info-item">
              <span class="label">Entry Time</span>
              <span class="value">{{ spot?.entryTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">Duration</span>
              <span class="value">{{ formatDuration(spot?.duration || 0) }}</span>
            </div>
            <div class="info-item" v-if="spot?.isOvertime">
              <span class="label">Overtime</span>
              <span class="value overtime">{{ formatDuration(spot?.overtime || 0) }}</span>
            </div>
          </div>
        </div>

        <!-- 司机信息 -->
        <div class="section">
          <div class="section-title">Driver Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Name</span>
              <span class="value">{{ spot?.driver?.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Phone</span>
              <span class="value">{{ spot?.driver?.phone }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 预订状态信息 -->
      <template v-if="spot?.status === 'Reserved'">
        <div class="section">
          <div class="section-title">Reservation Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Time Slot</span>
              <span class="value">{{ spot?.reservationTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">Reserved For</span>
              <span class="value">{{ spot?.reservedFor }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 锁定状态信息 -->
      <template v-if="spot?.status === 'Locked'">
        <div class="section">
          <div class="section-title">Lock Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Lock Time</span>
              <span class="value">{{ spot?.lockTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">Lock Reason</span>
              <span class="value">{{ spot?.lockReason || 'No reason provided' }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 备注信息 -->
      <div class="section" v-if="spot?.notes">
        <div class="section-title">Notes</div>
        <div class="notes">{{ spot?.notes }}</div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Close</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  spot: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const getSpotStatusType = (status: string) => {
  const types = {
    Available: 'success',
    Occupied: 'danger',
    Reserved: 'warning',
    Locked: 'info'
  }
  return types[status] || 'info'
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.details-content {
  .section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          font-size: 13px;
          color: #6b7280;
        }

        .value {
          font-size: 14px;
          color: #1f2937;
          font-weight: 500;

          &.overtime {
            color: #dc2626;
          }
        }
      }
    }

    .notes {
      padding: 12px;
      background-color: #f9fafb;
      border-radius: 6px;
      font-size: 14px;
      color: #4b5563;
      line-height: 1.5;
    }
  }
}
</style> 