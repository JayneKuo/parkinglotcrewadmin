<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { debug } from 'console';

const route = useRoute()
const router = useRouter()

interface RouteWithMeta extends RouteRecordRaw {
  meta?: {
    title?: string
    icon?: string
    order?: number
    hidden?: boolean
  }
}

const routes = computed(() => {
  const rootRoute = router.options.routes.find(route => route.path === '/') as RouteWithMeta
  
  debugger;
  if (!rootRoute?.children) return []
  
  return (rootRoute.children as RouteWithMeta[])
    .filter(route => !route.meta?.hidden)
    .sort((a, b) => {
      const orderA = Number(a.meta?.order) || 100
      const orderB = Number(b.meta?.order) || 100
      return orderA - orderB
    })
})

const activeMenu = computed(() => route.path)

const getIcon = (name: string) => {
  return (ElementPlusIcons as Record<string, any>)[name]
}

const handleSelect = (index: string) => {
  router.push(index)
}

onMounted(() => {
  console.log('router.options.routes', router.options.routes);
  debugger;
})
</script>

<template>
  <el-menu
    :default-active="activeMenu"
    class="menu"
    @select="handleSelect"
  >
    <el-menu-item 
      v-for="item in routes" 
      :key="item.path"
      :index="item.path"
    >
      <el-icon v-if="item.meta?.icon">
        <component :is="getIcon(item.meta.icon)" />
      </el-icon>
      <template #title>{{ item.meta?.title }}</template>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
.menu {
  height: 100%;
  border-right: none;
}

:deep(.el-menu-item) {
  &.is-active {
    background-color: var(--el-menu-hover-bg-color);
  }
}
</style> 