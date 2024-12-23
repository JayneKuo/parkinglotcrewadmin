<template>
  <el-dialog
    v-model="dialogVisible"
    title="Vehicle Exit"
    width="500px"
  >
    <div class="exit-info">
      <div class="info-row">
        <span class="label">Vehicle Plate:</span>
        <span class="value">{{ spot?.vehiclePlate }}</span>
      </div>
      <div class="info-row">
        <span class="label">Duration:</span>
        <span class="value">{{ formatDuration(spot?.duration || 0) }}</span>
      </div>
      <div class="info-row" v-if="spot?.isOvertime">
        <span class="label">Overtime:</span>
        <span class="value overtime">{{ formatDuration(spot?.overtime || 0) }}</span>
      </div>
      <div class="info-row">
        <span class="label">Payment Status:</span>
        <el-tag :type="spot?.isPaid ? 'success' : 'danger'">
          {{ spot?.isPaid ? 'Paid' : 'Unpaid' }}
        </el-tag>
      </div>
    </div>

    <el-form :model="form" label-position="top">
      <el-form-item label="Exit Notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="Add exit notes"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :loading="loading"
          :disabled="!spot?.isPaid"
        >
          {{ spot?.isPaid ? 'Confirm Exit' : 'Payment Required' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  spot: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: any): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const form = ref({
  notes: ''
})

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleConfirm = async () => {
  try {
    loading.value = true
    emit('confirm', {
      spotId: props.spot?.id,
      ...form.value
    })
    dialogVisible.value = false
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.exit-info {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #606266;
  font-size: 14px;
}

.value {
  font-weight: 500;
  font-size: 14px;
}

.overtime {
  color: #F56C6C;
}
</style> 