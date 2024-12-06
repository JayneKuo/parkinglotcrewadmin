<template>
  <div class="parking-add">
    <!-- Top Actions -->
    <div class="top-actions">
      <div class="left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          Back
        </el-button>
        <span class="title">{{ id ? 'Edit Parking Lot' : 'Add Parking Lot' }}</span>
      </div>
      <div class="right">
        <el-select 
          v-model="parkingStatus" 
          placeholder="Select Status"
          style="width: 120px"
        >
          <el-option 
            v-for="item in statusOptions" 
            :key="item.value" 
            :label="item.label"
            :value="item.value"
          >
            <el-tag :type="getStatusType(item.value)" size="small">
              {{ item.label }}
            </el-tag>
          </el-option>
        </el-select>
        <el-button @click="handleSaveDraft">Save Draft</el-button>
        <el-button type="primary" @click="handleSubmit">Submit</el-button>
      </div>
    </div>

    <!-- Form Content -->
    <div class="form-content">
      <el-tabs v-model="activeTab" class="form-tabs">
        <el-tab-pane label="Basic Info" name="basic">
          <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="120px">
            <el-form-item label="Name" prop="name">
              <el-input v-model="basicForm.name" maxlength="50" show-word-limit placeholder="Max 50 characters" />
            </el-form-item>
            <el-form-item label="State" prop="state">
              <el-select 
                v-model="basicForm.state"
                filterable
                remote
                :remote-method="handleStateSearch"
                placeholder="Select or enter state name"
              >
                <el-option
                  v-for="item in stateOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="City" prop="city">
              <el-select 
                v-model="basicForm.city"
                filterable
                remote
                :remote-method="handleCitySearch"
                placeholder="Select or enter city name"
                :disabled="!basicForm.state"
              >
                <el-option
                  v-for="item in cityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Zip Code" prop="zipCode">
              <el-input v-model="basicForm.zipCode" disabled />
            </el-form-item>
            <el-form-item label="Address" prop="address">
              <el-input 
                v-model="basicForm.address" 
                type="textarea" 
                maxlength="200" 
                show-word-limit 
                :rows="3"
                placeholder="Max 200 characters"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Zone & Space Info" name="zone">
          <ZoneSpaceForm v-model="zoneForm" />
        </el-tab-pane>

        <el-tab-pane label="Pricing Info" name="price">
          <PriceForm v-model="priceForm" />
        </el-tab-pane>

        <el-tab-pane label="Details" name="detail">
          <DetailForm v-model="detailForm" />
        </el-tab-pane>

        <el-tab-pane label="Fee Settings" name="fee">
          <FeeForm v-model="feeForm" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { states, searchStates, searchCities, getZipCodes } from '@/utils/us-address'
import ZoneSpaceForm from '@/components/parking/ZoneSpaceForm.vue'
import PriceForm from '@/components/parking/PriceForm.vue'
import DetailForm from '@/components/parking/DetailForm.vue'
import FeeForm from '@/components/parking/FeeForm.vue'
import type { State, City } from '@/types/parking'

const route = useRoute()
const router = useRouter()
const id = ref(route.query.id)

// Current active tab
const activeTab = ref('basic')

// Parking status options
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'full', label: 'Full' },
  { value: 'closed', label: 'Closed' }
]

// Parking status
const parkingStatus = ref<'draft' | 'active' | 'maintenance' | 'full' | 'closed'>('active')

// Get status tag type
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    draft: 'info',
    active: 'success',
    maintenance: 'warning',
    full: 'danger',
    closed: 'info'
  }
  return types[status] || 'info'
}

// Basic info form
const basicFormRef = ref<FormInstance>()
const basicForm = reactive({
  name: '',
  state: '',
  city: '',
  zipCode: '',
  address: ''
})

// Zone & space info form
const zoneForm = reactive({
  zones: [{
    name: '',
    capacity: 1,
    spaceType: 'car',
    business: ['parking'],
    spaces: []
  }]
})

// Pricing info form
const priceForm = reactive({
  prices: [{
    type: 'hour',
    amount: 0,
    duration: 1
  }]
})

// Details form
const detailForm = reactive({
  contact: '',
  phones: [''],
  emails: [''],
  images: [],
  description: '',
  buildingInfo: '',
  selectedFacilities: [],
  floorPlan: [],
  disclaimer: false
})

// Fee settings form
const feeForm = reactive({
  allowCancel: false,
  cancelHours: 24,
  cancelFee: 0,
  reserveHours: 24,
  serviceFee: 0,
  taxRate: 0,
  penaltyUnit: 'hour',
  penaltyAmount: 0
})

// State and city options
const stateOptions = ref<State[]>(states)
const cityOptions = ref<City[]>([])

// Basic info validation rules
const basicRules = {
  name: [{ required: true, message: 'Please enter the parking lot name', trigger: 'blur' }],
  state: [{ required: true, message: 'Please select state', trigger: 'change' }],
  city: [{ required: true, message: 'Please select city', trigger: 'change' }],
  address: [{ required: true, message: 'Please enter the address', trigger: 'blur' }]
}

// Watch state and city changes, auto fill zip code
watch([
  () => basicForm.state,
  () => basicForm.city
], ([newState, newCity]) => {
  if (newState && newCity) {
    const zipCodes = getZipCodes(newState, newCity)
    basicForm.zipCode = zipCodes[0] || ''
  } else {
    basicForm.zipCode = ''
  }
})

// State search
const handleStateSearch = (query: string) => {
  stateOptions.value = searchStates(query)
}

// City search
const handleCitySearch = (query: string) => {
  if (!basicForm.state) return
  cityOptions.value = searchCities(basicForm.state, query)
}

// Back to list
const handleBack = () => {
  ElMessageBox.confirm('Confirm return? Unsaved content will be lost', 'Prompt', {
    type: 'warning'
  }).then(() => {
    router.push('/parking')
  })
}

// Save draft
const handleSaveDraft = () => {
  parkingStatus.value = 'draft'
  ElMessage.success('Draft saved successfully')
}

// Submit form
const handleSubmit = async () => {
  if (parkingStatus.value === 'draft') {
    ElMessage.warning('Please select the official status before submitting')
    return
  }

  try {
    if (basicFormRef.value) {
      await basicFormRef.value.validate()
    }
    
    ElMessage.success('Saved successfully')
    router.push('/parking')
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}
</script>

<style scoped lang="scss">
.parking-add {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;

  .top-actions {
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

      .title {
        font-size: 20px;
        font-weight: bold;
      }
    }

    .right {
      display: flex;
      gap: 10px;
    }
  }

  .form-content {
    .form-tabs {
      margin-top: 20px;
    }
  }
}
</style>