<template>
  <el-dialog
    :model-value="modelValue"
    title="Process Payment"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="order" class="payment-dialog">
      <!-- Order Summary -->
      <div class="order-summary">
        <h4>Order Summary</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Order No.">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="Customer">{{ order.customerName }}</el-descriptions-item>
          <el-descriptions-item label="Car Info">
            {{ order.plateNo }} - {{ order.carModel }} ({{ order.carColor }})
          </el-descriptions-item>
          <el-descriptions-item label="Duration">
            {{ formatDuration(getDuration()) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Payment Details -->
      <div class="payment-details">
        <h4>Payment Details</h4>
        <div class="fee-list">
          <div class="fee-item">
            <span class="label">Service Fee</span>
            <span class="amount">${{ serviceFee.toFixed(2) }}</span>
          </div>
          <div class="fee-item">
            <span class="label">Tax</span>
            <span class="amount">${{ tax.toFixed(2) }}</span>
          </div>
          <div class="fee-item total">
            <span class="label">Total Amount</span>
            <span class="amount">${{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="payment-methods">
        <h4>Payment Method</h4>
        <div class="method-grid">
          <div
            v-for="method in paymentMethods"
            :key="method.value"
            class="method-item"
            :class="{ active: selectedMethod === method.value }"
            @click="selectedMethod = method.value"
          >
            <div class="method-icon">
              <el-icon><component :is="method.icon" /></el-icon>
            </div>
            <div class="method-info">
              <div class="method-name">{{ method.label }}</div>
              <div class="method-desc">{{ method.description }}</div>
            </div>
            <div v-show="selectedMethod === method.value" class="method-check">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">Cancel</el-button>
        <el-button 
          type="primary" 
          :disabled="!selectedMethod"
          @click="handleConfirm"
        >
          Confirm Payment
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check } from '@element-plus/icons-vue'
import type { ValetOrder } from '@/types/valet'
import { formatDuration } from '@/utils/format'

const props = defineProps<{
  modelValue: boolean
  order: ValetOrder | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

// Selected payment method
const selectedMethod = ref('')

// Payment methods
const paymentMethods = [
  {
    label: 'Credit Card',
    value: 'credit_card',
    icon: 'CreditCard',
    description: 'Pay with credit or debit card'
  },
  {
    label: 'Cash',
    value: 'cash',
    icon: 'Money',
    description: 'Pay with cash'
  },
  {
    label: 'Mobile Payment',
    value: 'mobile',
    icon: 'Cellphone',
    description: 'Pay with mobile wallet'
  },
  {
    label: 'Bank Transfer',
    value: 'bank',
    icon: 'Bank',
    description: 'Pay via bank transfer'
  }
]

// Calculate duration in minutes
const getDuration = () => {
  if (!props.order) return 0
  const start = new Date(props.order.createdAt)
  const end = new Date()
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}

// Calculate fees
const serviceFee = computed(() => props.order?.amount || 0)
const tax = computed(() => serviceFee.value * 0.1) // 10% tax
const totalAmount = computed(() => serviceFee.value + tax.value)

// Handle payment confirmation
const handleConfirm = () => {
  if (!selectedMethod.value) return
  
  emit('confirm', {
    method: selectedMethod.value,
    amount: totalAmount.value,
    serviceFee: serviceFee.value,
    tax: tax.value
  })
}
</script>

<style scoped lang="scss">
.payment-dialog {
  h4 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  .order-summary {
    margin-bottom: 24px;
  }

  .payment-details {
    margin-bottom: 24px;

    .fee-list {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      padding: 16px;

      .fee-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;

        &:not(:last-child) {
          border-bottom: 1px dashed #ebeef5;
        }

        .label {
          color: #606266;
        }

        .amount {
          font-weight: 500;
          color: #303133;
        }

        &.total {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 1px solid #dcdfe6;

          .label {
            font-weight: bold;
          }

          .amount {
            font-size: 18px;
            color: #67c23a;
          }
        }
      }
    }
  }

  .payment-methods {
    .method-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .method-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border: 1px solid #dcdfe6;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;

        &:hover {
          border-color: var(--el-color-primary-light-5);
          background-color: var(--el-color-primary-light-9);
        }

        &.active {
          border-color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }

        .method-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background-color: var(--el-color-primary-light-8);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          .el-icon {
            font-size: 24px;
            color: var(--el-color-primary);
          }
        }

        .method-info {
          flex: 1;
          min-width: 0;

          .method-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 4px;
            color: var(--el-text-color-primary);
          }

          .method-desc {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            line-height: 1.4;
          }
        }

        .method-check {
          position: absolute;
          top: 12px;
          right: 12px;
          color: var(--el-color-primary);
          font-size: 18px;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style> 