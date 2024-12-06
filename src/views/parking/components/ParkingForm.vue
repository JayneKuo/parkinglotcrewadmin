<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
    <el-form-item label="Parking Lot Name" prop="name">
      <el-input v-model="form.name" placeholder="Enter parking lot name" />
    </el-form-item>
    <el-form-item label="Address" prop="address">
      <el-input v-model="form.address" placeholder="Enter detailed address" />
    </el-form-item>
    
    <!-- Space Configuration -->
    <el-divider content-position="left">Space Configuration</el-divider>
    <el-form-item label="Space Management" prop="parkingSpaceMode">
      <el-radio-group v-model="form.parkingSpaceMode">
        <el-radio label="quantity">By Quantity</el-radio>
        <el-radio label="specific">By Specific Space</el-radio>
      </el-radio-group>
    </el-form-item>

    <template v-if="form.parkingSpaceMode === 'quantity'">
      <el-form-item label="Total Spaces" prop="totalSpaces">
        <el-input-number v-model="form.totalSpaces" :min="1" />
      </el-form-item>
    </template>

    <template v-else>
      <!-- Zone Management -->
      <div v-for="(zone, zIndex) in form.zones" :key="zIndex" class="zone-item">
        <div class="zone-header">
          <span>Zone {{ zIndex + 1 }}</span>
          <el-button type="danger" link @click="removeZone(zIndex)">Remove</el-button>
        </div>
        
        <el-form-item :label="'Zone Name'" :prop="`zones.${zIndex}.name`">
          <el-input v-model="zone.name" placeholder="e.g., Zone A" />
        </el-form-item>
        
        <el-form-item :label="'Space Type'" :prop="`zones.${zIndex}.spaceType`">
          <el-select v-model="zone.spaceType">
            <el-option label="Standard" value="standard" />
            <el-option label="Large Vehicle" value="large" />
            <el-option label="Valet" value="valet" />
          </el-select>
        </el-form-item>

        <el-form-item :label="'Space Number Range'">
          <el-input-number v-model="zone.startNumber" :min="1" placeholder="Start" />
          <span class="mx-2">to</span>
          <el-input-number v-model="zone.endNumber" :min="1" placeholder="End" />
        </el-form-item>
      </div>
      
      <el-button type="primary" plain @click="addZone">Add Zone</el-button>
    </template>

    <!-- Pricing Plan -->
    <el-divider content-position="left">Pricing Plan</el-divider>
    <el-form-item label="Billing Type" prop="billingType">
      <el-select v-model="form.billingType">
        <el-option label="By Time" value="time" />
        <el-option label="By Entry" value="count" />
      </el-select>
    </el-form-item>

    <template v-if="form.billingType === 'time'">
      <el-form-item label="Time Unit" prop="timeUnit">
        <el-select v-model="form.timeUnit">
          <el-option label="Minute" value="minute" />
          <el-option label="Hour" value="hour" />
          <el-option label="Day" value="day" />
          <el-option label="Month" value="month" />
          <el-option label="Year" value="year" />
        </el-select>
      </el-form-item>

      <el-form-item label="First Period">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input-number v-model="form.firstPeriod" :min="1" placeholder="Duration" />
            <span class="ml-2">{{ getTimeUnitText }}</span>
          </el-col>
          <el-col :span="8">
            <el-input-number 
              v-model="form.firstPeriodPrice" 
              :min="0" 
              :precision="2" 
              placeholder="Price" 
            />
            <span class="ml-2">$</span>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="Additional Period">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input-number v-model="form.additionalPeriod" :min="1" placeholder="Duration" />
            <span class="ml-2">{{ getTimeUnitText }}</span>
          </el-col>
          <el-col :span="8">
            <el-input-number 
              v-model="form.additionalPeriodPrice" 
              :min="0" 
              :precision="2" 
              placeholder="Price" 
            />
            <span class="ml-2">$</span>
          </el-col>
        </el-row>
      </el-form-item>
    </template>

    <template v-else>
      <el-form-item label="Single Entry">
        <el-input-number 
          v-model="form.perPrice" 
          :min="0" 
          :precision="2" 
          placeholder="Price" 
        />
        <span class="ml-2">$ per entry</span>
      </el-form-item>
    </template>

    <!-- Advanced Settings -->
    <el-divider content-position="left">Advanced Settings</el-divider>
    <el-form-item label="Grace Period">
      <el-input-number v-model="form.freeMinutes" :min="0" />
      <span class="ml-2">minutes</span>
    </el-form-item>

    <el-form-item label="Daily Cap">
      <el-input-number 
        v-model="form.maxAmount" 
        :min="0" 
        :precision="2" 
      />
      <span class="ml-2">$ per day</span>
    </el-form-item>

    <el-form-item label="Night Discount">
      <el-switch v-model="form.nightDiscount.enabled" />
      <template v-if="form.nightDiscount.enabled">
        <div class="night-discount-settings">
          <el-time-picker
            v-model="form.nightDiscount.startTime"
            format="HH:mm"
            placeholder="Start Time"
          />
          <span class="mx-2">to</span>
          <el-time-picker
            v-model="form.nightDiscount.endTime"
            format="HH:mm"
            placeholder="End Time"
          />
          <span class="mx-2">Discount</span>
          <el-input-number 
            v-model="form.nightDiscount.rate" 
            :min="0" 
            :max="100" 
            :step="10"
          />
          <span class="ml-2">%</span>
        </div>
      </template>
    </el-form-item>

    <el-form-item label="Status">
      <el-switch
        v-model="form.status"
        active-value="active"
        inactive-value="inactive"
        :active-text="'Active'"
        :inactive-text="'Inactive'"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

const form = reactive({ ...props.modelValue })

// 计算时间单位文本
const getTimeUnitText = computed(() => {
  const map: Record<string, string> = {
    minute: '分钟',
    hour: '小时',
    day: '天',
    month: '月',
    year: '年'
  }
  return map[form.timeUnit] || ''
})

// 添加区域
const addZone = () => {
  form.zones.push({
    name: '',
    spaceType: 'standard',
    startNumber: 1,
    endNumber: 1
  })
}

// 删除区域
const removeZone = (index: number) => {
  form.zones.splice(index, 1)
}

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入停车场名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  parkingSpaceMode: [{ required: true, message: '请选择车位管理方式', trigger: 'change' }],
  totalSpaces: [{ required: true, message: '请输入车位总数', trigger: 'blur' }],
  billingType: [{ required: true, message: '请选择计费方式', trigger: 'change' }],
  timeUnit: [{ required: true, message: '请选择时间单位', trigger: 'change' }]
}

// 暴露表单实例
const formRef = ref<FormInstance>()
defineExpose({ formRef })
</script>

<style scoped lang="scss">
.zone-item {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;

  .zone-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;

    span {
      font-weight: bold;
      color: #606266;
    }
  }
}

.night-discount-settings {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.mx-2 {
  margin: 0 8px;
}

.ml-2 {
  margin-left: 8px;
}
</style>