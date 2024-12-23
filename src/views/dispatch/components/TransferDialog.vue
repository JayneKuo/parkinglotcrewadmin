<template>
  <el-dialog
    v-model="dialogVisible"
    title="Transfer Vehicle"
    width="500px"
  >
    <div class="current-info">
      <div class="info-row">
        <span class="label">Current Spot:</span>
        <span class="value">{{ spot?.id }}</span>
      </div>
      <div class="info-row">
        <span class="label">Vehicle:</span>
        <span class="value">{{ spot?.vehiclePlate }}</span>
      </div>
    </div>

    <el-form :model="form" label-position="top" :rules="rules" ref="formRef">
      <el-form-item label="Select Area" prop="areaId">
        <el-select 
          v-model="form.areaId"
          placeholder="Select area"
          style="width: 100%"
          @change="handleAreaChange"
        >
          <el-option
            v-for="area in areas"
            :key="area.id"
            :label="area.name"
            :value="area.id"
          >
            <div class="area-option">
              <span>{{ area.name }}</span>
              <el-tag size="small" type="info">{{ area.availableCount }} spots</el-tag>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Select Target Spot" prop="targetSpotId">
        <el-select 
          v-model="form.targetSpotId"
          placeholder="Select available spot"
          style="width: 100%"
          :disabled="!form.areaId"
        >
          <el-option
            v-for="spot in availableSpots"
            :key="spot.id"
            :label="spot.id"
            :value="spot.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="Add transfer notes"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          Confirm Transfer
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import { SpotStatus, ParkingSpot, ParkingArea } from '@/types/dispatch'

const props = defineProps<{
  modelValue: boolean
  spot: ParkingSpot | null
  availableSpots: ParkingSpot[]
  areas: ParkingArea[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: any): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  areaId: '',
  targetSpotId: '',
  notes: ''
})

const rules = {
  areaId: [{ required: true, message: 'Please select area', trigger: 'change' }],
  targetSpotId: [{ required: true, message: 'Please select target spot', trigger: 'change' }]
}

const availableSpots = computed(() => {
  if (!form.value.areaId) return []
  const area = props.areas.find(a => a.id === form.value.areaId)
  return area?.spots.filter(spot => spot.status === SpotStatus.Available) || []
})

const handleAreaChange = () => {
  form.value.targetSpotId = ''
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    emit('confirm', {
      sourceSpotId: props.spot?.id,
      ...form.value
    })
    
    dialogVisible.value = false
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.current-info {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #606266;
}

.value {
  font-weight: 500;
}

.area-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style> 