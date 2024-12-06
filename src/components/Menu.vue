<template>
  <el-menu
    :default-active="activeMenu"
    router
    @select="handleSelect"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
  >
    <el-menu-item index="/dashboard">
      <el-icon><DataLine /></el-icon>
      <span>Dashboard</span>
    </el-menu-item>
    
    <el-menu-item index="/parking">
      <el-icon><Location /></el-icon>
      <span>Parking Lots</span>
    </el-menu-item>
    
    <el-menu-item index="/reservation">
      <el-icon><Calendar /></el-icon>
      <span>Reservations</span>
    </el-menu-item>
    
    <el-menu-item index="/valet">
      <el-icon><Van /></el-icon>
      <span>Valet Service</span>
    </el-menu-item>
    
    <el-menu-item index="/dispatch">
      <el-icon><SetUp /></el-icon>
      <span>Dispatch</span>
    </el-menu-item>
    
    <el-menu-item index="/staff">
      <el-icon><User /></el-icon>
      <span>Staff</span>
    </el-menu-item>
    
    <el-menu-item index="/driver">
      <el-icon><UserFilled /></el-icon>
      <span>Drivers</span>
    </el-menu-item>
    
    <el-menu-item index="/finance">
      <el-icon><Money /></el-icon>
      <span>Finance</span>
    </el-menu-item>
    
    <el-menu-item index="/device">
      <el-icon><Monitor /></el-icon>
      <span>Devices</span>
    </el-menu-item>

    <el-menu-item index="/merchant">
      <el-icon><Shop /></el-icon>
      <span>Merchants</span>
    </el-menu-item>

    <el-menu-item index="/plan">
      <el-icon><List /></el-icon>
      <span>Plans</span>
    </el-menu-item>

    <el-menu-item index="/user">
      <el-icon><Avatar /></el-icon>
      <span>Users</span>
    </el-menu-item>
    
    <el-menu-item index="/settings">
      <el-icon><Setting /></el-icon>
      <span>Settings</span>
    </el-menu-item>

    <el-menu-item index="/admin">
      <el-icon><Management /></el-icon>
      <span>Admin Dashboard</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DataLine,
  Location,
  Calendar,
  Van,
  SetUp,
  User,
  UserFilled,
  Money,
  Monitor,
  Setting,
  Shop,
  List,
  Avatar,
  Management
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const handleSelect = (index: string) => {
  if (route.path !== index) {
    router.push(index)
  }
}
</script>

<style scoped>
.el-menu {
  border-right: none;
}

.el-menu-item {
  display: flex;
  align-items: center;
}

.el-icon {
  margin-right: 12px;
  font-size: 18px;
}
</style> 