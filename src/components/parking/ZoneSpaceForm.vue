<template>
  <div class="zone-list">
    <div v-for="(zone, index) in modelValue.zones" :key="index" class="zone-item">
      <div class="zone-header">
        <span class="zone-title">Zone {{ index + 1 }}</span>
        <el-button 
          type="danger" 
          link 
          :disabled="modelValue.zones.length === 1"
          @click="removeZone(index)"
        >
          Remove Zone
        </el-button>
      </div>
      
      <el-form 
        :ref="el => formRefs[index] = el"
        :model="zone" 
        :rules="zoneRules"
        label-width="120px"
      >
        <el-form-item label="Zone Name" prop="name">
          <el-input 
            v-model="zone.name" 
            maxlength="50" 
            show-word-limit 
            placeholder="e.g., Zone A"
          />
        </el-form-item>
        <el-form-item label="Capacity" prop="capacity">
          <el-input-number 
            v-model="zone.capacity" 
            :min="1" 
            :precision="0"
            :controls="false"
            placeholder="Enter capacity"
          />
        </el-form-item>
        <el-form-item label="Space Type" prop="spaceType">
          <el-radio-group v-model="zone.spaceType">
            <el-radio label="car">Car</el-radio>
            <el-radio label="truck">Truck</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Services" prop="business">
          <el-checkbox-group v-model="zone.business">
            <el-checkbox label="parking">Parking</el-checkbox>
            <el-checkbox label="valet">Valet</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <div class="space-actions">
          <el-button 
            type="primary" 
            @click="handleAddSpace(index)"
            :disabled="!zone.name || !zone.capacity"
          >
            Add Single Space
          </el-button>
          <el-button 
            type="success" 
            @click="handleBatchAddSpace(index)"
            :disabled="!zone.name || !zone.capacity"
          >
            Batch Add Spaces
          </el-button>
        </div>

        <!-- Space List -->
        <el-table 
          v-if="zone.spaces && zone.spaces.length > 0"
          :data="zone.spaces" 
          border 
          style="margin-top: 20px;"
          height="300"
        >
          <el-table-column prop="number" label="Space No." width="120" />
          <el-table-column prop="type" label="Type" width="120">
            <template #default="{ row }">
              <el-select v-model="row.type" size="small">
                <el-option label="Car" value="car" />
                <el-option label="Truck" value="truck" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="business" label="Services" width="200">
            <template #default="{ row }">
              <el-checkbox-group v-model="row.business" size="small">
                <el-checkbox label="parking">Parking</el-checkbox>
                <el-checkbox label="valet">Valet</el-checkbox>
              </el-checkbox-group>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="100" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link @click="removeSpace(index, $index)">
                Remove
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="zone.spaces && zone.spaces.length > 0" class="space-summary">
          Added {{ zone.spaces.length }} spaces, {{ zone.capacity - zone.spaces.length }} remaining
        </div>
      </el-form>
    </div>

    <el-button type="primary" plain @click="addZone">Add Zone</el-button>

    <!-- Batch Space Dialog -->
    <BatchSpaceDialog
      v-model="batchDialogVisible"
      :zone-name="currentZoneName"
      @confirm="handleBatchSpaceConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import BatchSpaceDialog from './BatchSpaceDialog.vue'
import type { BatchSpaceForm, ParkingZone } from '@/types/parking'
import { 
  generateSpaceNumber, 
  incrementSpaceNumber, 
  checkSpaceCapacity,
  generateDefaultZoneName,
  generateDefaultSpaceNumber
} from '@/utils/parking'

const props = defineProps<{
  modelValue: {
    zones: ParkingZone[]
  }
}>()

const emit = defineEmits(['update:modelValue'])

// Form refs
const formRefs = reactive<Record<number, FormInstance | null>>({})

// Form validation rules
const zoneRules = {
  name: [
    { required: true, message: 'Please enter zone name', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]+$/, message: 'Only letters and numbers allowed', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: 'Please enter capacity', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Capacity must be greater than 0', trigger: 'blur' }
  ],
  spaceType: [
    { required: true, message: 'Please select space type', trigger: 'change' }
  ],
  business: [
    { required: true, message: 'Please select services', trigger: 'change' }
  ]
}

// Batch dialog control
const batchDialogVisible = ref(false)
const currentZoneIndex = ref(0)
const currentZoneName = ref('')

// Zone methods
const addZone = () => {
  const zones = [...props.modelValue.zones]
  const newIndex = zones.length
  zones.push({
    name: generateDefaultZoneName(newIndex),
    capacity: 1,
    spaceType: 'car',
    business: ['parking'],
    spaces: []
  })
  emit('update:modelValue', { zones })
}

const removeZone = (index: number) => {
  if (props.modelValue.zones.length === 1) {
    return
  }
  const zones = [...props.modelValue.zones]
  zones.splice(index, 1)
  emit('update:modelValue', { zones })
}

// Space methods
const handleAddSpace = async (zoneIndex: number) => {
  const formRef = formRefs[zoneIndex]
  if (!formRef) return

  try {
    await formRef.validate()
  } catch (error) {
    return
  }

  const zones = [...props.modelValue.zones]
  const zone = zones[zoneIndex]
  
  if (!zone.spaces) {
    zone.spaces = []
  }
  
  // Check capacity limit
  if (!checkSpaceCapacity(zone.spaces.length, 1, zone.capacity)) {
    ElMessage.warning(`Reached zone capacity limit (${zone.capacity})`)
    return
  }
  
  // Generate new space number
  const lastSpace = zone.spaces[zone.spaces.length - 1]
  const newNumber = lastSpace 
    ? incrementSpaceNumber(lastSpace.number)
    : generateDefaultSpaceNumber(zone.name, 1)

  zone.spaces.push({
    number: newNumber,
    type: zone.spaceType,
    business: [...zone.business],
    status: 'available'
  })
  
  emit('update:modelValue', { zones })
  ElMessage.success('Space added successfully')
}

const handleBatchAddSpace = async (zoneIndex: number) => {
  const formRef = formRefs[zoneIndex]
  if (!formRef) return

  try {
    await formRef.validate()
  } catch (error) {
    return
  }

  const zone = props.modelValue.zones[zoneIndex]
  currentZoneIndex.value = zoneIndex
  currentZoneName.value = zone.name
  batchDialogVisible.value = true
}

const removeSpace = (zoneIndex: number, spaceIndex: number) => {
  const zones = [...props.modelValue.zones]
  zones[zoneIndex].spaces.splice(spaceIndex, 1)
  emit('update:modelValue', { zones })
  ElMessage.success('Space removed successfully')
}

// Batch add confirmation
const handleBatchSpaceConfirm = (form: BatchSpaceForm) => {
  const zones = [...props.modelValue.zones]
  const zone = zones[currentZoneIndex.value]
  
  if (!zone.spaces) {
    zone.spaces = []
  }
  
  const addCount = form.end - form.start + 1
  
  // Check capacity limit
  if (!checkSpaceCapacity(zone.spaces.length, addCount, zone.capacity)) {
    ElMessage.warning(`Adding spaces would exceed zone capacity (${zone.capacity})`)
    return
  }
  
  for (let i = form.start; i <= form.end; i++) {
    zone.spaces.push({
      number: generateSpaceNumber(form.prefix || zone.name, i),
      type: form.type,
      business: [...form.business],
      status: 'available'
    })
  }
  
  emit('update:modelValue', { zones })
  ElMessage.success(`Successfully added ${addCount} spaces`)
}

// Initialize default zone
onMounted(() => {
  if (!props.modelValue.zones || props.modelValue.zones.length === 0) {
    addZone()
  }
})
</script>

<style scoped lang="scss">
.zone-list {
  .zone-item {
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    .zone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ebeef5;

      .zone-title {
        font-size: 16px;
        font-weight: bold;
      }
    }
  }

  .space-actions {
    margin: 20px 0;
    display: flex;
    gap: 10px;
  }

  .space-summary {
    margin-top: 10px;
    color: #909399;
    font-size: 12px;
  }
}
</style>