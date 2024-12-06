<template>
  <div class="led-config">
    <!-- 硬件参数配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="card-header">
          <span>Hardware Parameters</span>
        </div>
      </template>

      <el-form :model="config.hardware" label-width="120px">
        <!-- 分辨率设置 -->
        <el-form-item label="Resolution">
          <el-input-group>
            <el-input-number v-model="config.hardware.resolution.width" :min="64" :max="2048" />
            <span class="separator">×</span>
            <el-input-number v-model="config.hardware.resolution.height" :min="32" :max="1024" />
          </el-input-group>
        </el-form-item>

        <!-- 亮度设置 -->
        <el-form-item label="Brightness">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-slider 
                v-model="config.hardware.brightness.current"
                :min="0"
                :max="5000"
                :step="100"
              >
                <template #suffix>nits</template>
              </el-slider>
            </el-col>
            <el-col :span="12">
              <el-switch 
                v-model="config.hardware.brightness.auto"
                active-text="Auto Adjust"
              />
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 显示参数 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Refresh Rate">
              <el-select v-model="config.hardware.display.refreshRate">
                <el-option label="60Hz" :value="60" />
                <el-option label="120Hz" :value="120" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Color Depth">
              <el-select v-model="config.hardware.display.colorDepth">
                <el-option label="8-bit" :value="8" />
                <el-option label="16-bit" :value="16" />
                <el-option label="24-bit" :value="24" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Pixel Pitch">
              <el-input-number 
                v-model="config.hardware.display.pixelPitch"
                :min="1"
                :max="20"
                :step="0.1"
              >
                <template #suffix>mm</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 显示内容配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="card-header">
          <span>Display Content</span>
        </div>
      </template>

      <content-manager v-model="config.display" />
    </el-card>

    <!-- 通信配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="card-header">
          <span>Communication</span>
        </div>
      </template>

      <el-form :model="config.communication" label-width="120px">
        <el-form-item label="Interface">
          <el-checkbox-group v-model="config.communication.interface">
            <el-checkbox label="RS232">Serial Port</el-checkbox>
            <el-checkbox label="RS485">RS485</el-checkbox>
            <el-checkbox label="Ethernet">Ethernet</el-checkbox>
            <el-checkbox label="WiFi">WiFi</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="Protocol" v-if="hasNetworkInterface">
          <el-select v-model="config.communication.protocol">
            <el-option label="TCP/IP" value="tcp" />
            <el-option label="Modbus TCP" value="modbus" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LEDConfig, DisplayStyle } from '@/types/device'
import ContentManager from './led/ContentManager.vue'

const props = defineProps<{
  modelValue: LEDConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: LEDConfig): void
}>()

// 默认显示样式
const defaultStyle: DisplayStyle = {
  fontSize: 24,
  fontColor: '#ffffff',
  backgroundColor: '#000000',
  scrolling: false,
  scrollSpeed: 1
}

// 默认位置
const defaultPosition = {
  x: 0,
  y: 0,
  width: 100,
  height: 25
}

// 初始化默认配置
const defaultConfig: LEDConfig = {
  name: '',
  enabled: true,
  hardware: {
    resolution: { width: 256, height: 128 },
    brightness: { current: 3000, auto: true, sensor: true },
    display: { refreshRate: 60, colorDepth: 16, pixelPitch: 10 }
  },
  display: {
    content: {
      // 停车场信息
      parking: {
        enabled: true,
        position: { ...defaultPosition },
        style: { ...defaultStyle },
        content: {
          total: 0,
          available: 0,
          reserved: 0,
          updateInterval: 30
        }
      },
      // 欢迎语
      welcome: {
        enabled: true,
        position: { ...defaultPosition, y: 25 },
        style: { ...defaultStyle },
        content: {
          default: 'Welcome to Our Parking',
          special: []
        }
      },
      // 收费信息
      pricing: {
        enabled: true,
        position: { ...defaultPosition, y: 50 },
        style: { ...defaultStyle },
        content: {
          hourly: 0,
          daily: 0,
          monthly: 0
        }
      },
      // 日期时间
      datetime: {
        enabled: true,
        position: { ...defaultPosition, y: 75 },
        style: { ...defaultStyle },
        format: 'YYYY-MM-DD HH:mm:ss'
      },
      // 天气信息
      weather: {
        enabled: false,
        position: { ...defaultPosition, y: 75 },
        style: { ...defaultStyle },
        updateInterval: 300
      }
    }
  },
  communication: {
    interface: ['RS232'],
    protocol: 'tcp'
  }
}

const config = ref<LEDConfig>({
  ...defaultConfig,
  ...props.modelValue
})

const hasNetworkInterface = computed(() => {
  return config.value.communication.interface.some(
    i => i === 'Ethernet' || i === 'WiFi'
  )
})

watch(
  () => config.value,
  (val: LEDConfig) => {
    emit('update:modelValue', val)
  },
  { deep: true }
)
</script>

<style scoped>
.config-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.separator {
  margin: 0 8px;
  color: var(--el-text-color-secondary);
}
</style> 