<template>
  <el-dialog
    :model-value="modelValue"
    title="Request Refund"
    width="500px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form 
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="Order No.">
        <span>{{ reservation?.orderNo }}</span>
      </el-form-item>
      
      <el-form-item label="Amount">
        <span class="amount">${{ reservation?.amount.toFixed(2) }}</span>
      </el-form-item>

      <el-form-item label="Refund Type" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio label="full">Full Refund</el-radio>
          <el-radio label="partial">Partial Refund</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item 
        v-if="form.type === 'partial'"
        label="Refund Amount" 
        prop="amount"
      >
        <el-input-number 
          v-model="form.amount"
          :min="0"
          :max="reservation?.amount || 0"
          :precision="2"
        />
      </el-form-item>

      <el-form-item label="Reason" prop="reason">
        <el-select v-model="form.reason" placeholder="Select reason">
          <el-option
            v-for="reason in refundReasons"
            :key="reason.value"
            :label="reason.label"
            :value="reason.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Notes" prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="Additional notes"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm">Confirm</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Reservation } from '@/types/reservation'

const props = defineProps<{
  modelValue: boolean
  reservation: Reservation | null
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const formRef = ref<FormInstance>()
const form = reactive({
  type: 'full',
  amount: 0,
  reason: '',
  notes: ''
})

const refundReasons = [
  { label: 'Customer Request', value: 'customer_request' },
  { label: 'Service Issue', value: 'service_issue' },
  { label: 'Booking Error', value: 'booking_error' },
  { label: 'Weather Conditions', value: 'weather' },
  { label: 'Other', value: 'other' }
]

const rules: FormRules = {
  type: [
    { required: true, message: 'Please select refund type', trigger: 'change' }
  ],
  amount: [
    { 
      required: true, 
      message: 'Please enter refund amount', 
      trigger: 'blur',
      type: 'number'
    }
  ],
  reason: [
    { required: true, message: 'Please select reason', trigger: 'change' }
  ]
}

const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('confirm', {
      ...form,
      amount: form.type === 'full' ? props.reservation?.amount : form.amount
    })
  } catch (error) {
    console.error('Validation failed:', error)
  }
}
</script>

<style scoped lang="scss">
.amount {
  font-weight: bold;
  color: #67c23a;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 