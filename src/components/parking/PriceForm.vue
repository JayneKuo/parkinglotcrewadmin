<template>
  <div class="price-list">
    <div v-for="(price, index) in modelValue.prices" :key="index" class="price-item">
      <div class="price-header">
        <span class="price-title">Price Rule {{ index + 1 }}</span>
        <el-button 
          type="danger" 
          link 
          :disabled="modelValue.prices.length === 1"
          @click="removePrice(index)"
        >
          Remove
        </el-button>
      </div>

      <el-form :model="price" label-width="120px">
        <div class="price-row">
          <el-form-item label="Time Unit">
            <el-select v-model="price.type" style="width: 120px">
              <el-option label="Minute" value="minute" />
              <el-option label="Hour" value="hour" />
              <el-option label="Day" value="day" />
              <el-option label="Week" value="week" />
              <el-option label="Month" value="month" />
              <el-option label="Year" value="year" />
            </el-select>
          </el-form-item>
          <el-form-item label="Duration">
            <el-input-number 
              v-model="price.duration" 
              :min="1" 
              :precision="0" 
              style="width: 120px"
            />
            <span class="unit">{{ price.type }}(s)</span>
          </el-form-item>
          <el-form-item label="Price">
            <el-input-number 
              v-model="price.amount" 
              :min="0" 
              :precision="2" 
              :step="0.01" 
              style="width: 120px"
            />
            <span class="unit">$</span>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <el-button type="primary" plain @click="addPrice">Add Price Rule</el-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  modelValue: {
    prices: any[]
  }
}>()

const emit = defineEmits(['update:modelValue'])

const addPrice = () => {
  const prices = [...props.modelValue.prices]
  prices.push({
    type: 'hour',
    amount: 0,
    duration: 1
  })
  emit('update:modelValue', { prices })
}

const removePrice = (index: number) => {
  if (props.modelValue.prices.length === 1) {
    return
  }
  const prices = [...props.modelValue.prices]
  prices.splice(index, 1)
  emit('update:modelValue', { prices })
}

// Initialize default price rule
onMounted(() => {
  if (props.modelValue.prices.length === 0) {
    addPrice()
  }
})
</script>

<style scoped lang="scss">
.price-list {
  .price-item {
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    .price-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ebeef5;

      .price-title {
        font-size: 16px;
        font-weight: bold;
      }
    }

    .price-row {
      display: flex;
      gap: 20px;
      align-items: flex-start;

      .el-form-item {
        margin-bottom: 0;
        flex: 1;
      }
    }
  }

  .unit {
    margin-left: 8px;
    color: #606266;
  }
}
</style>