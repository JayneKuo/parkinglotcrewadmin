<template>
  <div class="header-actions">
    <!-- 开门按钮 -->
    <el-button
      class="action-btn"
      type="text"
      @click="handleDoorClick"
    >
      <el-icon :size="20">
        <Open />
      </el-icon>
      <span class="btn-text">Open</span>
    </el-button>

    <!-- 日历按钮 -->
    <el-button
      class="action-btn"
      type="text"
      @click="handleCalendarClick"
    >
      <el-icon :size="20">
        <Calendar />
      </el-icon>
      <span class="btn-text">Calendar</span>
    </el-button>

    <!-- 开门对话框 -->
    <OpenDoorDialog ref="openDoorDialogRef" />

    <!-- 添加日历对话框组件 -->
    <CalendarDialog ref="calendarDialogRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Calendar, Open } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import OpenDoorDialog from './OpenDoorDialog.vue'
import CalendarDialog from './CalendarDialog.vue'

const openDoorDialogRef = ref(null)
const calendarDialogRef = ref(null)

const handleCalendarClick = () => {
  calendarDialogRef.value?.show()
}

const handleDoorClick = () => {
  openDoorDialogRef.value?.show()
}
</script>

<style scoped>
.header-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
  color: var(--el-text-color-regular);
  height: 32px;
  line-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-text {
  margin-left: 4px;
  font-size: 14px;
}

.action-btn:hover {
  color: var(--el-color-primary);
}
</style> 