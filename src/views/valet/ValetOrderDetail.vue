<template>
  <div class="valet-order-detail">
    <div class="page-header">
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        Back
      </el-button>
      
      <el-button 
        v-if="orderData?.status === 'ready'"
        type="primary"
        @click="openPaymentDialog"
      >
        <el-icon><Money /></el-icon>
        Process Payment
      </el-button>
    </div>

    <div class="order-content">
      <!-- 订单内容 -->
    </div>

    <!-- 支付对话框 -->
    <PaymentDialog
      v-model="showPaymentDialog"
      :order="orderData"
      @confirm="handlePaymentConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Money } from '@element-plus/icons-vue'
import PaymentDialog from '@/components/valet/PaymentDialog.vue'
import type { ValetOrder } from '@/types/valet'

const orderData = ref<ValetOrder | null>(null)
const showPaymentDialog = ref(false)

// 打开支付对话框
const openPaymentDialog = () => {
  showPaymentDialog.value = true
}

// 处理支付确认
const handlePaymentConfirm = async () => {
  try {
    // 处理支付逻辑
    showPaymentDialog.value = false
  } catch (error) {
    console.error('Payment failed:', error)
  }
}
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style> 