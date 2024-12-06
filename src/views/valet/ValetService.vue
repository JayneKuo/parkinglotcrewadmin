<template>
  <div class="valet-service">
    <ValetOrderDetail 
      :order="currentOrder"
      @process-payment="handleProcessPayment"
    />
    
    <PaymentDialog
      v-model="showPaymentDialog"
      :order="currentOrder"
      @confirm="handlePaymentConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ValetOrderDetail from './ValetOrderDetail.vue'
import PaymentDialog from '@/components/valet/PaymentDialog.vue'
import type { ValetOrder } from '@/types/valet'

const showPaymentDialog = ref(false)
const currentOrder = ref<ValetOrder | null>(null)

const handleProcessPayment = (order: ValetOrder) => {
  currentOrder.value = order
  showPaymentDialog.value = true
}

const handlePaymentConfirm = async () => {
  // 处理支付逻辑
  showPaymentDialog.value = false
}
</script> 