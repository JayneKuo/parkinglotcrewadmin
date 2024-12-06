<template>
  <div class="fee-form">
    <el-form :model="form" label-width="160px">
      <!-- Cancellation Settings -->
      <el-form-item label="Allow Cancellation">
        <el-switch v-model="form.allowCancel" />
      </el-form-item>

      <template v-if="form.allowCancel">
        <el-form-item label="Cancel Before">
          <el-input-number 
            v-model="form.cancelHours" 
            :min="0" 
            :max="72"
          />
          <span class="unit">hours</span>
        </el-form-item>

        <el-form-item label="Cancellation Fee">
          <el-input-number 
            v-model="form.cancelFee" 
            :min="0" 
            :precision="2"
          />
          <span class="unit">$</span>
        </el-form-item>
      </template>

      <!-- Reservation Settings -->
      <el-form-item label="Advance Reservation">
        <el-input-number 
          v-model="form.reserveHours" 
          :min="0" 
          :max="720"
        />
        <span class="unit">hours</span>
      </el-form-item>

      <!-- Service Fee -->
      <el-form-item label="Service Fee">
        <el-input-number 
          v-model="form.serviceFee" 
          :min="0" 
          :precision="2"
        />
        <span class="unit">$</span>
      </el-form-item>

      <!-- Tax Rate -->
      <el-form-item label="Tax Rate">
        <el-input-number 
          v-model="form.taxRate" 
          :min="0" 
          :max="100" 
          :precision="2"
        />
        <span class="unit">%</span>
      </el-form-item>

      <!-- Penalty Settings -->
      <el-form-item label="Penalty Unit">
        <el-select v-model="form.penaltyUnit">
          <el-option label="Per Hour" value="hour" />
          <el-option label="Per Day" value="day" />
          <el-option label="Fixed" value="fixed" />
        </el-select>
      </el-form-item>

      <el-form-item label="Penalty Amount">
        <el-input-number 
          v-model="form.penaltyAmount" 
          :min="0" 
          :precision="2"
        />
        <span class="unit">$</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    allowCancel: boolean
    cancelHours: number
    cancelFee: number
    reserveHours: number
    serviceFee: number
    taxRate: number
    penaltyUnit: string
    penaltyAmount: number
  }
}>()

const emit = defineEmits(['update:modelValue'])

const form = props.modelValue
</script>

<style scoped lang="scss">
.fee-form {
  .unit {
    margin-left: 8px;
    color: #606266;
  }
}
</style>