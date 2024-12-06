<template>
  <el-dialog
    :model-value="modelValue"
    :title="`订单详情 - ${order?.orderNo || ''}`"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- 订单信息 -->
    <div class="order-info">
      <div class="info-item">
        <span class="label">Order No:</span>
        <span class="value">{{ order?.orderNo }}</span>
      </div>
      <div class="info-item">
        <span class="label">Customer:</span>
        <span class="value">{{ order?.customerName }}</span>
      </div>
    </div>

    <!-- 停车位信息 -->
    <div class="space-section">
      <h3>Parking Location</h3>
      <div class="space-form">
        <el-form :model="form" label-position="top">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="Zone">
                <el-select
                  v-model="form.zoneName"
                  filterable
                  allow-create
                  placeholder="Select or enter zone"
                  class="zone-select"
                >
                  <el-option
                    v-for="zone in availableZones"
                    :key="zone"
                    :label="`Zone ${zone}`"
                    :value="zone"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Space No.">
                <el-select
                  v-model="form.spaceNo"
                  filterable
                  allow-create
                  placeholder="Select or enter space"
                  class="space-select"
                >
                  <el-option
                    v-for="space in availableSpaces"
                    :key="space"
                    :label="`Space ${space}`"
                    :value="space"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- 停车照片 -->
    <div class="photo-section">
      <h3>Parking Photos (Optional)</h3>
      <div class="photo-grid">
        <!-- 车位号照片 -->
        <div class="photo-item">
          <div class="photo-header">
            <span>Space Number Photo</span>
          </div>
          <el-upload
            class="upload-box"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
            :on-change="(file) => handlePhotoChange(file, 'space')"
          >
            <template #default>
              <div class="upload-content">
                <el-icon class="upload-icon"><Camera /></el-icon>
                <div class="upload-text">
                  <span>Add Photo</span>
                  <span class="upload-hint">Space number photo</span>
                </div>
              </div>
            </template>
          </el-upload>
        </div>

        <!-- 整车照片 -->
        <div class="photo-item">
          <div class="photo-header">
            <span>Full Vehicle Photo</span>
          </div>
          <el-upload
            class="upload-box"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
            :on-change="(file) => handlePhotoChange(file, 'full')"
          >
            <template #default>
              <div class="upload-content">
                <el-icon class="upload-icon"><Camera /></el-icon>
                <div class="upload-text">
                  <span>Add Photo</span>
                  <span class="upload-hint">Full vehicle photo</span>
                </div>
              </div>
            </template>
          </el-upload>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取消</el-button>
        <template v-if="order?.status === 'ready'">
          <el-button 
            type="primary"
            @click="$emit('process-payment', order)"
          >
            Process Payment
          </el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Camera } from '@element-plus/icons-vue'
import type { ValetOrder } from '@/types/valet'

const props = defineProps<{
  modelValue: boolean
  order: ValetOrder | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'process-payment', order: ValetOrder): void
}>()

// 表单数据
const form = ref({
  zoneName: props.order?.zoneName || '',
  spaceNo: props.order?.spaceNo || '',
  photos: {} as Record<string, string>
})

// 模拟可用区域和车位
const availableZones = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const availableSpaces = computed(() => {
  if (!form.value.zoneName) return []
  // 为选中的区域生成车位号
  return Array.from({ length: 20 }, (_, i) => 
    `${form.value.zoneName}${String(i + 1).padStart(3, '0')}`
  )
})

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 验证表单是否有效
const isValid = computed(() => {
  return (
    !!form.value.zoneName &&
    !!form.value.spaceNo
  )
})

// 处理照片变更
const handlePhotoChange = (file: any, type: string) => {
  form.value.photos[type] = URL.createObjectURL(file.raw)
}

// 处理取消
const handleCancel = () => {
  visible.value = false
}

// 处理确认
const handleConfirm = () => {
  if (isValid.value) {
    emit('confirm', {
      zoneName: form.value.zoneName,
      spaceNo: form.value.spaceNo,
      photos: form.value.photos
    })
  }
}

// 监听弹窗关闭，重置表单
watch(visible, (value) => {
  if (!value) {
    form.value = {
      zoneName: '',
      spaceNo: '',
      photos: {}
    }
  }
})
</script>

<style scoped lang="scss">
.order-info {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;

  .info-item {
    display: flex;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }

    .label {
      width: 100px;
      color: var(--el-text-color-secondary);
    }

    .value {
      font-weight: 500;
    }
  }
}

.space-section,
.photo-section {
  margin-bottom: 24px;

  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 500;
  }
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .photo-item {
    .photo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      color: var(--el-text-color-regular);
      font-size: 14px;
    }

    .upload-box {
      :deep(.el-upload--picture-card) {
        width: 100%;
        height: 160px;
        border: 2px dashed var(--el-border-color-lighter);
        border-radius: 8px;
        transition: all 0.3s;
        
        &:hover {
          border-color: var(--el-color-primary);
          
          .upload-icon {
            color: var(--el-color-primary);
          }
          
          .upload-text {
            color: var(--el-color-primary);
          }
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--el-text-color-secondary);
          
          .upload-icon {
            font-size: 28px;
            margin-bottom: 8px;
            transition: color 0.3s;
          }
          
          .upload-text {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            transition: color 0.3s;
            
            span {
              &:first-child {
                font-size: 14px;
                margin-bottom: 4px;
              }
              
              &.upload-hint {
                font-size: 12px;
                color: var(--el-text-color-placeholder);
              }
            }
          }
        }
      }

      :deep(.el-upload-list__item) {
        width: 100%;
        height: 160px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.space-form {
  .zone-select,
  .space-select {
    width: 100%;
  }
}
</style> 