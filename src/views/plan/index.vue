<template>
  <div class="plan-container">
    <div class="header-actions">
      <el-button type="primary" @click="handleAdd">新增套餐</el-button>
    </div>

    <el-table :data="planList" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="name" label="套餐名称">
        <template #default="{ row }">
          {{ row.name }}
          <el-tag v-if="row.isTrial" type="success" size="small" class="ml-2">
            体验版
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="价格">
        <template #default="{ row }">
          <template v-if="row.isTrial">
            <span class="free-tag">免费</span>
            <span class="trial-days">({{ row.trialDays }}天)</span>
          </template>
          <template v-else>
            <div>¥{{ row.price }}/{{ getBillingCycleText(row.billingCycle) }}</div>
            <div v-if="row.yearlyDiscount" class="discount-text">
              年付优惠: {{ row.yearlyDiscount }}%
            </div>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="功能配置">
        <template #default="{ row }">
          <el-tooltip 
            effect="dark" 
            :content="`车场数量限制: ${row.parkingLotLimit}个`" 
            placement="top"
          >
            <el-tag class="ml-2">车场: {{ row.parkingLotLimit }}</el-tag>
          </el-tooltip>
          <el-tooltip 
            effect="dark" 
            :content="`员工数量限制: ${row.staffLimit}人`" 
            placement="top"
          >
            <el-tag type="success" class="ml-2">员工: {{ row.staffLimit }}</el-tag>
          </el-tooltip>
          <el-tooltip 
            effect="dark" 
            :content="`APP功能: ${row.appFeatures.join(', ')}`" 
            placement="top"
          >
            <el-tag type="warning" class="ml-2">
              APP: {{ row.appFeatures.length }}项
            </el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column label="订阅设置" width="120">
        <template #default="{ row }">
          <el-tag :type="row.autoRenew ? 'success' : 'info'">
            {{ row.autoRenew ? '自动续订' : '手动续订' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 套餐表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '新增套餐' : '编辑套餐'"
      width="700px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入套餐名称" />
        </el-form-item>
        
        <el-form-item label="套餐类型" prop="isTrial">
          <el-radio-group v-model="form.isTrial">
            <el-radio :label="false">付费套餐</el-radio>
            <el-radio :label="true">免费体验</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.isTrial">
          <el-form-item label="体验天数" prop="trialDays">
            <el-input-number v-model="form.trialDays" :min="1" :max="90" />
            <span class="ml-2">天</span>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="计费周期" prop="billingCycle">
            <el-radio-group v-model="form.billingCycle">
              <el-radio label="monthly">月付</el-radio>
              <el-radio label="quarterly">季付</el-radio>
              <el-radio label="yearly">年付</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="套餐价格" prop="price">
            <el-input-number 
              v-model="form.price" 
              :min="0" 
              :precision="2" 
              :step="100"
            />
            <span class="ml-2">元/{{ getBillingCycleText(form.billingCycle) }}</span>
          </el-form-item>

          <el-form-item label="年付优惠" v-if="form.billingCycle === 'yearly'">
            <el-input-number 
              v-model="form.yearlyDiscount" 
              :min="0" 
              :max="100" 
              :step="5"
            />
            <span class="ml-2">%</span>
          </el-form-item>

          <el-form-item label="自动续订">
            <el-switch v-model="form.autoRenew" />
            <span class="ml-2 tip-text">开启后，到期自动续费</span>
          </el-form-item>
        </template>

        <el-form-item label="车场数量" prop="parkingLotLimit">
          <el-input-number v-model="form.parkingLotLimit" :min="1" />
        </el-form-item>

        <el-form-item label="员工数量" prop="staffLimit">
          <el-input-number v-model="form.staffLimit" :min="1" />
        </el-form-item>

        <el-form-item label="APP功能">
          <el-checkbox-group v-model="form.appFeatures">
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

        <el-form-item label="套餐描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            rows="3"
            placeholder="请输入套餐描述"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import type { Plan } from '@/types/plan'
import { APP_FEATURES } from '@/types/plan'

// 套餐列表数据
const planList = ref<Plan[]>([
  {
    id: '1',
    name: '基础版',
    price: 999,
    billingCycle: 'monthly',
    yearlyDiscount: 20,
    parkingLotLimit: 2,
    staffLimit: 5,
    appFeatures: ['qrCode', 'payment'],
    description: '适合小型停车场使用的基础套餐',
    status: 1,
    autoRenew: true,
    isTrial: false
  },
  {
    id: '2',
    name: '专业版',
    price: 1999,
    billingCycle: 'monthly',
    yearlyDiscount: 20,
    parkingLotLimit: 5,
    staffLimit: 10,
    appFeatures: ['qrCode', 'payment', 'monthlyCard', 'report'],
    description: '适合中型停车场使用的专业套餐',
    status: 1,
    autoRenew: true,
    isTrial: false
  },
  {
    id: '3',
    name: '免费体验版',
    isTrial: true,
    trialDays: 14,
    parkingLotLimit: 1,
    staffLimit: 2,
    appFeatures: ['qrCode', 'payment'],
    description: '14天免费体验，体验核心功能',
    status: 1,
    autoRenew: false
  }
])

// 弹窗控制
const dialogVisible = ref(false)
const formType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  name: '',
  isTrial: false,
  trialDays: 14,
  price: 0,
  billingCycle: 'monthly',
  yearlyDiscount: 0,
  parkingLotLimit: 1,
  staffLimit: 1,
  appFeatures: [] as string[],
  description: '',
  status: 1,
  autoRenew: true
})

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入套餐价格', trigger: 'blur' }],
  trialDays: [{ required: true, message: '请输入体验天数', trigger: 'blur' }],
  parkingLotLimit: [{ required: true, message: '请输入车场数量限制', trigger: 'blur' }],
  staffLimit: [{ required: true, message: '请输入员工数量限制', trigger: 'blur' }],
  description: [{ required: true, message: '请输入套餐描述', trigger: 'blur' }]
}

// 获取计费周期文本
const getBillingCycleText = (cycle: string) => {
  const map: Record<string, string> = {
    monthly: '月',
    quarterly: '季',
    yearly: '年'
  }
  return map[cycle] || cycle
}

// 新增套餐
const handleAdd = () => {
  formType.value = 'add'
  Object.assign(form, {
    name: '',
    isTrial: false,
    trialDays: 14,
    price: 0,
    billingCycle: 'monthly',
    yearlyDiscount: 0,
    parkingLotLimit: 1,
    staffLimit: 1,
    appFeatures: [],
    description: '',
    status: 1,
    autoRenew: true
  })
  dialogVisible.value = true
}

// 编辑套餐
const handleEdit = (row: Plan) => {
  formType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除套餐
const handleDelete = (row: Plan) => {
  ElMessageBox.confirm('确认删除该套餐？删除后已使用该套餐的商户将受到影响。', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

// 状态变更
const handleStatusChange = (row: Plan) => {
  const status = row.status === 1 ? '启用' : '停用'
  ElMessage.success(`${status}成功`)
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
</script>

<style scoped lang="scss">
.plan-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  
  .header-actions {
    margin-bottom: 20px;
  }
  
  .ml-2 {
    margin-left: 8px;
  }

  .free-tag {
    color: #67c23a;
    font-weight: bold;
  }

  .trial-days {
    color: #909399;
    font-size: 12px;
    margin-left: 4px;
  }

  .discount-text {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 4px;
  }

  .tip-text {
    color: #909399;
    font-size: 12px;
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