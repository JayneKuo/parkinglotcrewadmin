<template>
  <div class="layout-container">
    <!-- 套餐过期提醒 -->
    <div v-if="showPlanExpireAlert" class="plan-expire-alert">
      <el-alert
        title="套餐已过期"
        type="error"
        :closable="false"
        show-icon
      >
        <template #default>
          您的套餐已过期，请及时续费以继续使用系统功能。
          <el-button type="primary" link @click="handleRenewPlan">立即续费</el-button>
        </template>
      </el-alert>
    </div>

    <el-container class="main-layout">
      <el-aside width="200px" class="aside">
        <div class="logo">
          <h1>停车场管理系统</h1>
        </div>
        <el-scrollbar>
          <el-menu
            :default-active="route.path"
            class="el-menu-vertical"
            :router="true"
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#409EFF"
          >
            <template v-for="item in menuItems" :key="item.path">
              <el-menu-item 
                v-if="hasMenuPermission(item)"
                :index="item.path"
              >
                <el-icon><component :is="item.meta?.icon" /></el-icon>
                <span>{{ item.meta?.title }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      
      <el-container class="main-container">
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
              <Fold v-if="!isCollapse"/>
              <Expand v-else/>
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <!-- 商户套餐信息 -->
            <template v-if="userStore.userInfo.plan">
              <div class="plan-info">
                <el-tag :type="getPlanTagType(userStore.userInfo.plan.status)">
                  {{ userStore.userInfo.plan.name }}
                </el-tag>
                <span class="expire-time">
                  到期时间: {{ formatDate(userStore.userInfo.plan.expireTime) }}
                </span>
              </div>
            </template>

            <el-dropdown>
              <span class="el-dropdown-link">
                {{ userStore.userInfo.username }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main class="main">
          <el-scrollbar>
            <router-view v-if="!userStore.isPlanExpired() || isFreePage"></router-view>
            <div v-else class="expired-notice">
              <el-empty description="套餐已过期，请续费后继续使用">
                <template #extra>
                  <el-button type="primary" @click="handleRenewPlan">立即续费</el-button>
                </template>
              </el-empty>
            </div>
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>

    <!-- 续费弹窗 -->
    <el-dialog
      v-model="renewDialogVisible"
      title="套餐续费"
      width="600px"
    >
      <el-form ref="renewFormRef" :model="renewForm" label-width="100px">
        <el-form-item label="当前套餐">
          <span>{{ userStore.userInfo.plan?.name }}</span>
        </el-form-item>
        <el-form-item label="选择套餐">
          <el-radio-group v-model="renewForm.planId">
            <div v-for="plan in availablePlans" :key="plan.id" class="plan-option">
              <el-radio :label="plan.id">
                <div class="plan-option-content">
                  <span class="plan-name">{{ plan.name }}</span>
                  <span class="plan-price">¥{{ plan.price }}/月</span>
                </div>
              </el-radio>
            </div>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="续费时长">
          <el-radio-group v-model="renewForm.duration">
            <el-radio label="monthly">1个月</el-radio>
            <el-radio label="quarterly">3个月</el-radio>
            <el-radio label="yearly">12个月</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRenewSubmit">确认续费</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import {
  Monitor,
  Shop,
  Money,
  Location,
  Tickets,
  PieChart,
  ArrowDown,
  Fold,
  Expand,
  List,
  Calendar,
  Van,
  SetUp,
  User,
  UserFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)
const renewDialogVisible = ref(false)

// 续费表单
const renewForm = ref({
  planId: '',
  duration: 'monthly'
})

// 可用套餐列表
const availablePlans = ref([
  {
    id: '1',
    name: '基础版',
    price: 999
  },
  {
    id: '2',
    name: '专业版',
    price: 1999
  }
])

// 计算是否显示套餐过期提醒
const showPlanExpireAlert = computed(() => {
  if (userStore.userInfo.role === 'admin') return false
  if (!userStore.userInfo.plan) return false
  
  const expireTime = new Date(userStore.userInfo.plan.expireTime).getTime()
  const now = new Date().getTime()
  const threeDays = 3 * 24 * 60 * 60 * 1000
  
  return (expireTime - now) <= threeDays || now > expireTime
})

// 计算当前页面是否为免费页面（过期后仍可访问的页面）
const isFreePage = computed(() => {
  return ['/dashboard'].includes(route.path)
})

// 获取菜单项
const menuItems = computed(() => {
  return router.options.routes.find(r => r.path === '/')?.children || []
})

// 检查菜单权限
const hasMenuPermission = (item: any) => {
  if (item.meta?.roles) {
    return item.meta.roles.includes(userStore.userInfo.role)
  }
  if (item.meta?.permission) {
    return userStore.hasPermission(item.meta.permission)
  }
  return true
}

// 获取套餐状态标签类型
const getPlanTagType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    trial: 'warning',
    expired: 'danger'
  }
  return types[status] || 'info'
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

// 处理续费
const handleRenewPlan = () => {
  renewForm.value.planId = userStore.userInfo.plan?.id || ''
  renewDialogVisible.value = true
}

// 提交续费
const handleRenewSubmit = () => {
  ElMessage.success('续费成功')
  renewDialogVisible.value = false
  // TODO: 调用续费API
}

const handleLogout = () => {
  userStore.clearUserInfo()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100%;

  .plan-expire-alert {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2000;
  }
  
  .main-layout {
    height: 100%;
    padding-top: var(--el-alert-padding);
  }
  
  .aside {
    background-color: #304156;
    transition: width 0.3s;
    display: flex;
    flex-direction: column;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2b3648;
      
      h1 {
        color: #fff;
        font-size: 16px;
        margin: 0;
        white-space: nowrap;
      }
    }
    
    .el-menu {
      border-right: none;
      flex: 1;
    }
  }
  
  .main-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .header {
      background-color: #fff;
      border-bottom: 1px solid #dcdfe6;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      height: 60px;
      
      .header-left {
        display: flex;
        align-items: center;
        
        .collapse-btn {
          font-size: 20px;
          cursor: pointer;
          margin-right: 20px;
          
          &:hover {
            color: #409EFF;
          }
        }
      }
      
      .header-right {
        display: flex;
        align-items: center;
        gap: 20px;

        .plan-info {
          display: flex;
          align-items: center;
          gap: 10px;

          .expire-time {
            font-size: 12px;
            color: #909399;
          }
        }
        
        .el-dropdown-link {
          cursor: pointer;
          display: flex;
          align-items: center;
          color: #303133;
          
          &:hover {
            color: #409EFF;
          }
        }
      }
    }
    
    .main {
      padding: 20px;
      background-color: #f0f2f5;
      height: calc(100% - 60px);
      box-sizing: border-box;
      
      .el-scrollbar {
        height: 100%;
      }

      .expired-notice {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

.plan-option {
  margin-bottom: 10px;
  
  .plan-option-content {
    display: inline-flex;
    align-items: center;
    gap: 20px;
    margin-left: 8px;

    .plan-name {
      font-weight: bold;
    }

    .plan-price {
      color: #f56c6c;
    }
  }
}
</style>