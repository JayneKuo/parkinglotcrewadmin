<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo">
        <h1>ParkingLotCrew</h1>
      </div>
      
      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="Username"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Password"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <div class="form-footer">
          <el-checkbox v-model="rememberMe">Remember me</el-checkbox>
          <el-link type="primary">Forgot password?</el-link>
        </div>
        
        <el-button 
          type="primary" 
          class="login-button"
          :loading="loading"
          @click="handleLogin"
        >
          Sign In
        </el-button>

        <div class="test-accounts">
          <p>Test Accounts:</p>
          <div class="account-buttons">
            <el-button 
              link 
              type="primary" 
              @click="fillTestAccount('admin')"
            >
              Admin: admin / admin123
            </el-button>
            <el-button 
              link 
              type="primary" 
              @click="fillTestAccount('merchant')"
            >
              Merchant: merchant / merchant123
            </el-button>
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules: FormRules = {
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' }
  ]
}

// Test account data
const testAccounts = {
  admin: {
    username: 'admin',
    password: 'admin123'
  },
  merchant: {
    username: 'merchant',
    password: 'merchant123'
  }
}

// Fill test account
const fillTestAccount = (type: 'admin' | 'merchant') => {
  const account = testAccounts[type]
  loginForm.username = account.username
  loginForm.password = account.password
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 模拟 API 调用
    setTimeout(() => {
      // 存储 token
      localStorage.setItem('token', 'dummy-token')
      
      loading.value = false
      ElMessage.success('Login successful')

      // 获取重定向地址，如果没有则跳转到 dashboard
      const redirect = route.query.redirect as string
      router.push(redirect || '/dashboard')
    }, 1500)
  } catch (error) {
    console.error('Login validation failed:', error)
  }
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  
  .login-box {
    width: 400px;
    padding: 40px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .login-header {
      text-align: center;
      margin-bottom: 40px;
      
      .logo {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }
      
      h1 {
        font-size: 24px;
        color: #303133;
        margin: 0;
      }
    }
    
    .login-form {
      .form-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      
      .login-button {
        width: 100%;
        height: 40px;
      }

      .test-accounts {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #ebeef5;
        font-size: 14px;
        color: #909399;
        
        p {
          margin: 8px 0;
          line-height: 1.4;
          text-align: center;
        }

        .account-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;

          .el-button {
            justify-content: flex-start;
          }
        }
      }
    }
  }
}
</style>