<template>
  <el-dialog
    :model-value="modelValue"
    title="Batch Add Spaces"
    width="500px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form :model="form" label-width="120px">
      <el-form-item label="Space Prefix">
        <el-input v-model="form.prefix" placeholder="e.g., A" />
      </el-form-item>

      <el-form-item label="Number Range">
        <el-row :gutter="20">
          <el-col :span="11">
            <el-input-number
              v-model="form.start"
              :min="1"
              placeholder="Start"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="2" class="text-center">
            <span>to</span>
          </el-col>
          <el-col :span="11">
            <el-input-number
              v-model="form.end"
              :min="form.start"
              placeholder="End"
              style="width: 100%"
            />
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="Space Type">
        <el-radio-group v-model="form.type">
          <el-radio label="car">Car</el-radio>
          <el-radio label="truck">Truck</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Services">
        <el-checkbox-group v-model="form.business">
          <el-checkbox label="parking">Parking</el-checkbox>
          <el-checkbox label="valet">Valet</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Cancel</el-button>
      <el-button type="primary" @click="handleConfirm">Confirm</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

defineProps<{
  modelValue: boolean
  zoneName?: string
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const form = reactive({
  prefix: '',
  start: 1,
  end: 1,
  type: 'car',
  business: ['parking']
})

const handleConfirm = () => {
  emit('confirm', form)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.text-center {
  text-align: center;
  line-height: 32px;
}
</style>