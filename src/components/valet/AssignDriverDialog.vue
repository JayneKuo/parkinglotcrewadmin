<template>
  <el-dialog
    v-model="visible"
    title="Assign Driver"
    width="600px"
    :close-on-click-modal="false"
  >
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="Search by name or phone"
        clearable
        :prefix-icon="Search"
      >
        <template #append>
          <el-select 
            v-model="statusFilter" 
            placeholder="Status"
            clearable
            style="width: 120px"
          >
            <el-option label="Available" value="available" />
            <el-option label="Busy" value="busy" />
            <el-option label="Offline" value="offline" />
          </el-select>
        </template>
      </el-input>
    </div>

    <!-- 泊车员列表 -->
    <div class="driver-list">
      <template v-if="filteredDrivers.length > 0">
        <div
          v-for="driver in filteredDrivers"
          :key="driver.id"
          :class="['driver-item', { active: selectedDriver === driver.id }]"
          @click="selectedDriver = driver.id"
        >
          <div class="driver-avatar">
            <el-avatar :size="48">{{ driver.name.charAt(0) }}</el-avatar>
          </div>
          <div class="driver-info">
            <div class="driver-name">
              <span>{{ driver.name }}</span>
              <el-tag 
                :type="driver.status === 'available' ? 'success' : 'warning'"
                size="small"
              >
                {{ driver.status }}
              </el-tag>
            </div>
            <div class="driver-contact">{{ driver.phone }}</div>
            <div class="driver-stats">
              <el-rate
                v-model="driver.rating"
                disabled
                size="small"
              />
              <span class="orders">{{ driver.totalOrders }} orders</span>
            </div>
          </div>
        </div>
      </template>
      <el-empty v-else description="No drivers found" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :disabled="!selectedDriver"
        >
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { ValetOrder, ValetDriver } from '@/types/valet'

const props = defineProps<{
  modelValue: boolean
  order: ValetOrder | null
  availableDrivers: ValetDriver[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', driverId: string): void
}>()

// 搜索和筛选状态
const searchKeyword = ref('')
const statusFilter = ref('')
const selectedDriver = ref('')

// 计算过滤后的泊车员列表
const filteredDrivers = computed(() => {
  let result = props.availableDrivers

  // 状态筛选
  if (statusFilter.value) {
    result = result.filter(driver => driver.status === statusFilter.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(driver => 
      driver.name.toLowerCase().includes(keyword) || 
      driver.phone.includes(keyword)
    )
  }

  return result
})

// 监听弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 监听弹窗关闭，重置状态
watch(visible, (value) => {
  if (!value) {
    searchKeyword.value = ''
    statusFilter.value = ''
    selectedDriver.value = ''
  }
})

// 处理取消
const handleCancel = () => {
  visible.value = false
}

// 处理确认
const handleConfirm = () => {
  if (selectedDriver.value) {
    emit('confirm', selectedDriver.value)
    visible.value = false
  }
}
</script>

<style scoped lang="scss">
.search-bar {
  margin-bottom: 16px;
}

.driver-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color-darker);
    border-radius: 3px;
  }

  .driver-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
    
    &.active {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .driver-info {
      flex: 1;
      min-width: 0;

      .driver-name {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        
        span {
          font-size: 16px;
          font-weight: 500;
        }
      }

      .driver-contact {
        color: var(--el-text-color-secondary);
        font-size: 14px;
        margin-bottom: 8px;
      }

      .driver-stats {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .orders {
          color: var(--el-text-color-secondary);
          font-size: 13px;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
</style>