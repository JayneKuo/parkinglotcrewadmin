<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加设施"
    width="600px"
  >
    <div class="facility-form">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="设施名称" prop="name">
          <el-input v-model="form.name" maxlength="50" show-word-limit />
        </el-form-item>
        
        <el-form-item label="设施图标" prop="icon">
          <div class="icon-grid">
            <div 
              v-for="icon in availableIcons" 
              :key="icon"
              class="icon-item"
              :class="{ active: form.icon === icon }"
              @click="form.icon = icon"
            >
              <el-icon>
                <component :is="icon" />
              </el-icon>
              <span class="icon-name">{{ icon }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="设施描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { ParkingFacility } from '@/types/parking'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const form = reactive<Omit<ParkingFacility, 'id'>>({
  name: '',
  icon: '',
  description: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入设施名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择设施图标', trigger: 'change' }],
  description: [{ required: true, message: '请输入设施描述', trigger: 'blur' }]
}

// 获取所有可用图标
const availableIcons = computed(() => {
  return Object.keys(ElementPlusIconsVue)
})

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('confirm', {
        id: Date.now().toString(),
        ...form
      })
      dialogVisible.value = false
      formRef.value?.resetFields()
    }
  })
}
</script>

<style scoped lang="scss">
.facility-form {
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      &.active {
        border-color: #409eff;
        background-color: #ecf5ff;
      }

      .el-icon {
        font-size: 24px;
        margin-bottom: 5px;
      }

      .icon-name {
        font-size: 12px;
        color: #606266;
        text-align: center;
        word-break: break-all;
      }
    }
  }
}
</style>