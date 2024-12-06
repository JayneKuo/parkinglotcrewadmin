<template>
  <div class="device-form-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>{{ isEdit ? 'Edit Device' : 'Add Device' }}</h2>
          <el-button @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>Back
          </el-button>
        </div>
      </template>

      <!-- 位置信息 -->
      <div class="form-section">
        <h3>Location Information</h3>
        <el-form 
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="140px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Parking Lot" prop="parkingLotId">
                <el-select 
                  v-model="form.parkingLotId" 
                  placeholder="Select parking lot"
                >
                  <el-option
                    v-for="lot in parkingLots"
                    :key="lot.id"
                    :label="lot.name"
                    :value="lot.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Location" prop="location">
                <el-input v-model="form.location" placeholder="e.g. Entrance A, Exit B" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Installation Date" prop="installationDate">
                <el-date-picker
                  v-model="form.installationDate"
                  type="date"
                  placeholder="Select date"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 设备信息 -->
      <div class="form-section">
        <h3>Device Information</h3>
        <el-form 
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="140px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Device Name" prop="name">
                <el-input v-model="form.name" placeholder="Enter device name" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Device Type" prop="type">
                <el-select v-model="form.type" placeholder="Select device type">
                  <el-option label="Camera" value="camera" />
                  <el-option label="RFID Reader" value="rfid" />
                  <el-option label="Gate" value="gate" />
                  <el-option label="LiDAR" value="lidar" />
                  <el-option label="LED Display" value="led" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Brand" prop="brand">
                <el-input v-model="form.brand" placeholder="Enter device brand" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Model" prop="model">
                <el-input v-model="form.model" placeholder="Enter device model" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Serial Number" prop="serialNumber">
                <el-input v-model="form.serialNumber" placeholder="Enter serial number" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Status" prop="status">
                <el-select v-model="form.status" placeholder="Select status">
                  <el-option label="Online" value="online" />
                  <el-option label="Offline" value="offline" />
                  <el-option label="Maintenance" value="maintenance" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- API配置 -->
      <div class="form-section">
        <h3>API Configuration</h3>
        <el-form 
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="140px"
        >
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="API Endpoint" prop="apiEndpoint">
                <el-input v-model="form.apiEndpoint" placeholder="Enter API endpoint URL" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="API Key" prop="apiKey">
                <el-input 
                  v-model="form.apiKey" 
                  type="password" 
                  show-password
                  placeholder="Enter API key or token" 
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="Protocols" prop="protocols">
                <el-select 
                  v-model="form.protocols"
                  multiple
                  placeholder="Select supported protocols"
                >
                  <el-option label="ONVIF" value="onvif" />
                  <el-option label="MQTT" value="mqtt" />
                  <el-option label="REST" value="rest" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 备注 -->
      <div class="form-section">
        <h3>Notes</h3>
        <el-form 
          ref="formRef"
          :model="form"
          label-width="140px"
        >
          <el-form-item label="Notes" prop="notes">
            <el-input
              v-model="form.notes"
              type="textarea"
              :rows="3"
              placeholder="Enter additional notes..."
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 表单操作 -->
      <div class="form-actions">
        <el-button @click="$router.back()">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          Save
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ElMessage,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElRow,
  ElCol,
  ElCard,
} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getParkingLots } from '@/api/parking'
import type { ParkingLot } from '@/types/parking'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const saving = ref(false)
const parkingLots = ref<ParkingLot[]>([])

const isEdit = route.name === 'EditDevice'

// 加载停车场列表
onMounted(async () => {
  try {
    parkingLots.value = await getParkingLots()
  } catch (error) {
    ElMessage.error('Failed to load parking lots')
  }
})

// 表单数据
const form = ref({
  // 位置信息
  parkingLotId: '',
  location: '',
  installationDate: '',

  // 设备信息
  name: '',
  type: '',
  brand: '',
  model: '',
  serialNumber: '',
  status: '',

  // API配置
  apiEndpoint: '',
  apiKey: '',
  protocols: [],

  // 备注
  notes: ''
})

// 验证规则
const rules: FormRules = {
  parkingLotId: [
    { required: true, message: 'Please select parking lot', trigger: 'change' }
  ],
  location: [
    { required: true, message: 'Please enter location', trigger: 'blur' }
  ],
  installationDate: [
    { required: true, message: 'Please select installation date', trigger: 'change' }
  ],
  name: [
    { required: true, message: 'Please enter device name', trigger: 'blur' }
  ],
  type: [
    { required: true, message: 'Please select device type', trigger: 'change' }
  ],
  brand: [
    { required: true, message: 'Please enter brand', trigger: 'blur' }
  ],
  model: [
    { required: true, message: 'Please enter model', trigger: 'blur' }
  ],
  serialNumber: [
    { required: true, message: 'Please enter serial number', trigger: 'blur' }
  ],
  status: [
    { required: true, message: 'Please select status', trigger: 'change' }
  ],
  apiEndpoint: [
    { required: true, message: 'Please enter API endpoint', trigger: 'blur' },
    { type: 'url', message: 'Please enter valid URL', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: 'Please enter API key', trigger: 'blur' }
  ],
  protocols: [
    { required: true, message: 'Please select at least one protocol', trigger: 'change' }
  ]
}

// 保存设备
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true

    // TODO: 调用API保存数据
    console.log('Form data:', form.value)

    ElMessage.success('Device saved successfully')
    router.push('/device')
  } catch (error) {
    ElMessage.error('Please check the form')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.device-form-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-section {
    margin-bottom: 24px;

    h3 {
      margin: 0 0 20px;
      padding-left: 12px;
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      border-left: 3px solid var(--el-color-primary);
    }
  }

  .form-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style> 