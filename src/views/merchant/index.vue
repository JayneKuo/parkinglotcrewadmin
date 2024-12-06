<template>
  <div class="merchant-container">
    <div class="header-actions">
      <el-button type="primary" @click="handleAdd">新增商户</el-button>
    </div>

    <el-table :data="merchantList" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="name" label="商户名称" />
      <el-table-column prop="contact" label="联系人" />
      <el-table-column prop="phone" label="联系电话" />
      <el-table-column prop="plan" label="套餐">
        <template #default="{ row }">
          <el-tag :type="getPlanTagType(row.plan.status)">
            {{ row.plan.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="套餐权限">
        <template #default="{ row }">
          <el-tooltip 
            effect="dark" 
            :content="`车场数量限制: ${row.plan.parkingLotLimit}个`" 
            placement="top"
          >
            <el-tag class="ml-2">车场: {{ row.plan.parkingLotLimit }}</el-tag>
          </el-tooltip>
          <el-tooltip 
            effect="dark" 
            :content="`员工数量限制: ${row.plan.staffLimit}人`" 
            placement="top"
          >
            <el-tag type="success" class="ml-2">员工: {{ row.plan.staffLimit }}</el-tag>
          </el-tooltip>
          <el-tooltip 
            effect="dark" 
            :content="`APP功能: ${row.plan.appFeatures.join(', ')}`" 
            placement="top"
          >
            <el-tag type="warning" class="ml-2">
              APP: {{ row.plan.appFeatures.length }}项
            </el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" link @click="handleConfig(row)">配置权限</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 商户表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '新增商户' : '编辑商户'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商户名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="选择套餐" prop="planId">
          <el-select v-model="form.planId" placeholder="请选择套餐">
            <el-option
              v-for="plan in planList"
              :key="plan.id"
              :label="plan.name"
              :value="plan.id"
            >
              <span>{{ plan.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ plan.isTrial ? '免费体验' : `¥${plan.price}/月` }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置弹窗 -->
    <el-dialog
      v-model="configDialogVisible"
      title="权限配置"
      width="600px"
    >
      <el-form ref="configFormRef" :model="configForm" label-width="120px">
        <el-form-item label="车场数量限制">
          <el-input-number v-model="configForm.parkingLotLimit" :min="1" />
        </el-form-item>
        <el-form-item label="员工数量限制">
          <el-input-number v-model="configForm.staffLimit" :min="1" />
        </el-form-item>
        <el-form-item label="APP功能">
          <el-checkbox-group v-model="configForm.appFeatures">
            <div class="features-grid">
              <div v-for="feature in APP_FEATURES" :key="feature.key" class="feature-item">
                <el-checkbox :label="feature.key">
                  {{ feature.name }}
                  <el-tooltip 
                    :content="feature.description" 
                    placement="top"
                  >
                    <el-icon class="info-icon"><InfoFilled /></el-icon>
                  </el-tooltip>
                </el-checkbox>
              </div>
            </div>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfigSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import type { Merchant } from '@/types/merchant'
import { APP_FEATURES } from '@/types/plan'

// 商户列表数据
const merchantList = ref<Merchant[]>([
  {
    id: '1',
    name: '示例商户1',
    contact: '张三',
    phone: '13800138000',
    plan: {
      id: '1',
      name: '基础版',
      status: 'active',
      parkingLotLimit: 2,
      staffLimit: 5,
      appFeatures: ['qrCode', 'payment']
    }
  }
])

// 套餐列表数据
const planList = ref([
  {
    id: '1',
    name: '基础版',
    price: 999,
    isTrial: false
  },
  {
    id: '2',
    name: '专业版',
    price: 1999,
    isTrial: false
  },
  {
    id: '3',
    name: '免费体验版',
    isTrial: true
  }
])

// 弹窗控制
const dialogVisible = ref(false)
const configDialogVisible = ref(false)
const formType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const configFormRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  name: '',
  contact: '',
  phone: '',
  planId: ''
})

// 权限配置表单
const configForm = reactive({
  parkingLotLimit: 1,
  staffLimit: 1,
  appFeatures: [] as string[]
})

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  planId: [{ required: true, message: '请选择套餐', trigger: 'change' }]
}

// 获取套餐标签类型
const getPlanTagType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    trial: 'warning',
    expired: 'danger'
  }
  return types[status] || 'info'
}

// 新增商户
const handleAdd = () => {
  formType.value = 'add'
  Object.assign(form, {
    name: '',
    contact: '',
    phone: '',
    planId: ''
  })
  dialogVisible.value = true
}

// 编辑商户
const handleEdit = (row: Merchant) => {
  formType.value = 'edit'
  Object.assign(form, {
    name: row.name,
    contact: row.contact,
    phone: row.phone,
    planId: row.plan.id
  })
  dialogVisible.value = true
}

// 配置权限
const handleConfig = (row: Merchant) => {
  Object.assign(configForm, {
    parkingLotLimit: row.plan.parkingLotLimit,
    staffLimit: row.plan.staffLimit,
    appFeatures: row.plan.appFeatures
  })
  configDialogVisible.value = true
}

// 删除商户
const handleDelete = (row: Merchant) => {
  ElMessageBox.confirm('确认删除该商户？', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(formType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
    }
  })
}

// 提交权限配置
const handleConfigSubmit = () => {
  ElMessage.success('配置已保存')
  configDialogVisible.value = false
}
</script>

<style scoped lang="scss">
.merchant-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  
  .header-actions {
    margin-bottom: 20px;
  }
  
  .ml-2 {
    margin-left: 8px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .feature-item {
      display: flex;
      align-items: center;

      .info-icon {
        margin-left: 4px;
        font-size: 14px;
        color: #909399;
        cursor: help;
      }
    }
  }
}
</style>