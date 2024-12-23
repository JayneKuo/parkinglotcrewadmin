<template>
  <el-container class="layout-container">
    <!-- Left Sidebar -->
    <el-aside width="240px" class="sidebar">
      <div class="logo">
        <img src="@/assets/logo.svg" alt="Logo">
        <span>ParkingLotCrew</span>
      </div>
      <Menu />
    </el-aside>
    
    <!-- Right Content Area -->
    <el-container class="main-container">
      <el-header height="60px" class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <HeaderActions />
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" src="https://placeholder.com/32x32" />
              <span class="username">Admin</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>Profile</el-dropdown-item>
                <el-dropdown-item>Settings</el-dropdown-item>
                <el-dropdown-item divided>Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Menu from '@/components/Menu.vue'
import HeaderActions from '@/components/HeaderActions.vue'

const route = useRoute()
const currentRoute = computed(() => route.meta.title || '')
</script>

<style scoped lang="scss">
.layout-container {
  width: 100%;
  height: 100vh;
  
  .sidebar {
    background-color: #304156;
    height: 100vh;
    overflow-y: auto;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      color: #fff;
      font-size: 18px;
      border-bottom: 1px solid #1f2d3d;

      img {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }
    }
  }
  
  .main-container {
    height: 100vh;
    
    .header {
      background-color: #fff;
      border-bottom: 1px solid #e6e6e6;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .user-info {
          display: flex;
          align-items: center;
          cursor: pointer;

          .username {
            margin-left: 8px;
            font-size: 14px;
          }
        }
      }
    }
    
    .main-content {
      background-color: #f0f2f5;
      padding: 20px;
      height: calc(100vh - 60px);
      overflow-y: auto;
    }
  }
}
</style> 