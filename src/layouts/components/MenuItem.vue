<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import * as ElementPlusIcons from '@element-plus/icons-vue'

defineProps<{
  item: RouteRecordRaw
}>()

// 获取图标组件
const getIcon = (name?: string) => {
  if (!name) return null
  return (ElementPlusIcons as any)[name]
}
</script>

<template>
  <template v-if="!item.meta?.hidden">
    <el-menu-item :index="item.path">
      <el-icon v-if="item.meta?.icon">
        <component :is="getIcon(item.meta.icon)" />
      </el-icon>
      <template #title>{{ item.meta?.title }}</template>
    </el-menu-item>
  </template>
</template> 