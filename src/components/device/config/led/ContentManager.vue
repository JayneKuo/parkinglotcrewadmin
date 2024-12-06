<template>
  <div class="content-manager">
    <!-- 内容类型列表 -->
    <el-collapse>
      <!-- 停车位信息 -->
      <el-collapse-item>
        <template #title>
          <div class="content-header">
            <el-icon><Van /></el-icon>
            <span>Parking Space</span>
            <el-switch v-model="config.content.parking.enabled" />
          </div>
        </template>
        
        <div v-if="config.content.parking.enabled" class="content-config">
          <!-- 位置设置 -->
          <el-form label-width="100px">
            <el-form-item label="Position">
              <el-row :gutter="12">
                <el-col :span="6">
                  <el-input-number v-model="config.content.parking.position.x" :min="0" :max="100">
                    <template #prefix>X:</template>
                    <template #suffix>%</template>
                  </el-input-number>
                </el-col>
                <el-col :span="6">
                  <el-input-number v-model="config.content.parking.position.y" :min="0" :max="100">
                    <template #prefix>Y:</template>
                    <template #suffix>%</template>
                  </el-input-number>
                </el-col>
              </el-row>
            </el-form-item>

            <!-- 内容设置 -->
            <el-form-item label="Display">
              <el-checkbox-group v-model="parkingDisplay">
                <el-checkbox label="total">Total Spaces</el-checkbox>
                <el-checkbox label="available">Available</el-checkbox>
                <el-checkbox label="reserved">Reserved</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="Update">
              <el-input-number 
                v-model="config.content.parking.content.updateInterval"
                :min="5"
                :max="60"
              >
                <template #suffix>seconds</template>
              </el-input-number>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>

      <!-- 欢迎语 -->
      <el-collapse-item>
        <template #title>
          <div class="content-header">
            <el-icon><Message /></el-icon>
            <span>Welcome Text</span>
            <el-switch v-model="config.content.welcome.enabled" />
          </div>
        </template>

        <div v-if="config.content.welcome.enabled" class="content-config">
          <el-form label-width="100px">
            <el-form-item label="Position">
              <el-row :gutter="12">
                <el-col :span="6">
                  <el-input-number v-model="config.content.welcome.position.x" :min="0" :max="100">
                    <template #prefix>X:</template>
                    <template #suffix>%</template>
                  </el-input-number>
                </el-col>
                <el-col :span="6">
                  <el-input-number v-model="config.content.welcome.position.y" :min="0" :max="100">
                    <template #prefix>Y:</template>
                    <template #suffix>%</template>
                  </el-input-number>
                </el-col>
              </el-row>
            </el-form-item>

            <el-form-item label="Default Text">
              <el-input 
                v-model="config.content.welcome.content.default"
                type="textarea"
                :rows="2"
                placeholder="Enter welcome message"
              />
            </el-form-item>

            <!-- 特殊时段欢迎语 -->
            <el-form-item label="Special">
              <div v-for="(msg, index) in config.content.welcome.content.special" :key="index">
                <el-row :gutter="12" class="mb-2">
                  <el-col :span="8">
                    <el-time-picker v-model="msg.time.start" format="HH:mm" />
                    <span class="mx-2">-</span>
                    <el-time-picker v-model="msg.time.end" format="HH:mm" />
                  </el-col>
                  <el-col :span="14">
                    <el-input v-model="msg.text" placeholder="Special welcome message" />
                  </el-col>
                  <el-col :span="2">
                    <el-button type="danger" link @click="removeSpecialMessage(index)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              <el-button link type="primary" @click="addSpecialMessage">
                <el-icon><Plus /></el-icon>Add Special Message
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>

      <!-- 其他内容类型类似... -->
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Van, Money, Message, Calendar, Sunny, Delete, Plus } from '@element-plus/icons-vue'
import type { LEDConfig } from '@/types/device'

const props = defineProps<{
  modelValue: LEDConfig['display']
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: LEDConfig['display']): void
}>()

const config = ref(props.modelValue)

// 停车场显示项
const parkingDisplay = ref(['total', 'available'])

// 添加特殊时段欢迎语
const addSpecialMessage = () => {
  config.value.content.welcome.content.special.push({
    time: { start: '', end: '' },
    text: ''
  })
}

// 删除特殊时段欢迎语
const removeSpecialMessage = (index: number) => {
  config.value.content.welcome.content.special.splice(index, 1)
}

watch(
  () => config.value,
  (val) => {
    emit('update:modelValue', val)
  },
  { deep: true }
)
</script>

<style scoped>
.content-manager {
  padding: 20px;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-config {
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 4px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mx-2 {
  margin: 0 8px;
}

:deep(.el-collapse-item__header) {
  font-size: 16px;
}

:deep(.el-switch) {
  margin-left: auto;
}
</style> 