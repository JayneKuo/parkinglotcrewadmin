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

      <!-- 设备配置 -->
      <div v-if="currentConfigComponent" class="form-section">
        <h3>Device Configuration</h3>
        <component
          :is="currentConfigComponent"
          v-model="form.config"
          ref="configRef"
        />
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
import { ref, onMounted, shallowRef, markRaw, watch } from 'vue'
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
import CameraConfig from '@/components/device/config/CameraConfig.vue'
import GateConfig from '@/components/device/config/GateConfig.vue'
import RFIDConfig from '@/components/device/config/RFIDConfig.vue'
import LiDARConfig from '@/components/device/config/LiDARConfig.vue'
import LEDConfig from '@/components/device/config/LEDConfig.vue'

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

// 表单数据类型
interface DeviceFormData {
  // 位置信息
  parkingLotId: string
  location: string
  installationDate: string

  // 设备信息
  name: string
  type: string
  brand: string
  model: string
  serialNumber: string
  status: string

  // API配置
  apiEndpoint: string
  apiKey: string
  protocols: string[]

  // 备注
  notes: string

  // 设备特定配置
  config: Record<string, any>
}

// 表单数据
const form = ref<DeviceFormData>({
  parkingLotId: '',
  location: '',
  installationDate: '',
  name: '',
  type: '',
  brand: '',
  model: '',
  serialNumber: '',
  status: '',
  apiEndpoint: '',
  apiKey: '',
  protocols: [],
  notes: '',
  config: {}
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

// 设备配置组件映射
const configComponents: Record<string, any> = {
  camera: markRaw(CameraConfig),
  gate: markRaw(GateConfig),
  rfid: markRaw(RFIDConfig),
  lidar: markRaw(LiDARConfig),
  led: markRaw(LEDConfig)
}

// 当前配置组件
const currentConfigComponent = shallowRef<any>(null)
const configRef = ref<InstanceType<typeof CameraConfig> | null>(null)

// 监听设备类型变化
watch(() => form.value.type, (newType: string) => {
  if (newType && configComponents[newType]) {
    currentConfigComponent.value = configComponents[newType]
    // 初始化默认配置
    form.value.config = getDefaultConfig(newType)
  } else {
    currentConfigComponent.value = null
  }
})

// 获取设备类型默认配置
const getDefaultConfig = (type: string): Record<string, any> => {
  const defaults: Record<string, any> = {
    camera: {
      name: '',
      enabled: true,
      resolution: '1080p',
      fps: 30,
      nightVision: true,
      motionDetection: true,
      storageRetentionDays: 30
    },
    gate: {
      name: '',
      enabled: true,
      operationMode: 'automatic',
      openDuration: 5,
      obstacleDetection: true,
      emergencyMode: 'maintain',
      autoClose: true
    },
    rfid: {
      name: '',
      enabled: true,
      frequency: '13.56MHz',
      readRange: 100,
      antiCollision: true,
      cardTypes: [],
      readTimeout: 1000
    },
    lidar: {
      name: '',
      enabled: true,
      scanFrequency: 50,
      rangeResolution: 1,
      angularResolution: 0.1,
      detectionRange: 30,
      pointDensity: 100
    },
    led: {
      name: '',
      enabled: true,
      brightness: 80,
      autoBrightness: true,
      refreshRate: 60,
      colorDepth: 24,
      displayMode: 'text'
    }
  }
  return defaults[type] || { name: '', enabled: true }
}

// 保存设备
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    // 验证基本表单
    await formRef.value.validate()
    
    // 验证设备配置
    if (configRef.value) {
      await configRef.value.validate()
    }
    
    saving.value = true

    const deviceData = {
      ...form.value,
      config: configRef.value?.getConfig() || form.value.config
    }

    // TODO: 调用API保存数据
    console.log('Device data:', deviceData)

    ElMessage.success('设备保存成功')
    router.push('/device')
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
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