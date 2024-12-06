<template>
  <div class="billing-container">
    <div class="header-actions">
      <el-button type="primary" @click="handleAdd">新增计费方案</el-button>
    </div>

    <el-table :data="billingList" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="name" label="方案名称" />
      <el-table-column prop="type" label="计费类型">
        <template #default="{ row }">
          <el-tag>{{ row.type === 'time' ? '按时计费' : '按次计费' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="收费规则">
        <template #default="{ row }">
          <template v-if="row.type === 'time'">
            <div>首{{ row.firstHours }}小时: {{ row.firstPrice }}元</div>
            <div>后续每小时: {{ row.additionalPrice }}元</div>
          </template>
          <template v-else>
            <div>每次: {{ row.perPrice }}元</div>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
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

    <!-- 计费方案表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '新增计费方案' : '编辑计费方案'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="方案名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入方案名称" />
        </el-form-item>
        <el-form-item label="计费类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="time">按时计费</el-radio>
            <el-radio label="count">按次计费</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.type === 'time'">
          <el-form-item label="首小时收费" prop="firstPrice">
            <el-input-number
              v-model="form.firstPrice"
              :min="0"
              :precision="2"
              :step="0.5"
            />
            <span class="ml-2">元</span>
          </el-form-item>
          <el-form-item label="首小时时长" prop="firstHours">
            <el-input-number
              v-model="form.firstHours"
              :min="0.5"
              :precision="1"
              :step="0.5"
            />
            <span class="ml-2">小时</span>
          </el-form-item>
          <el-form-item label="后续每小时" prop="additionalPrice">
            <el-input-number
              v-model="form.additionalPrice"
              :min="0"
              :precision="2"
              :step="0.5"
            />
            <span class="ml-2">元</span>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="每次收费" prop="perPrice">
            <el-input-number
              v-model="form.perPrice"
              :min="0"
              :precision="2"
              :step="0.5"
            />
            <span class="ml-2">元</span>
          </el-form-item>
        </template>

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

interface BillingScheme {
  id: string
  name: string
  type: 'time' | 'count'
  firstPrice?: number
  firstHours?: number
  additionalPrice?: number
  perPrice?: number
  status: number
}

// 模拟数据
const billingList = ref<BillingScheme[]>([
  {
    id: '1',
    name: '基础时段计费',
    type: 'time',
    firstPrice: 5,
    firstHours: 2,
    additionalPrice: 2,
    status: 1
  },
  {
    id: '2',
    name: '临时停车',
    type: 'count',
    perPrice: 10,
    status: 1
  }
])

const dialogVisible = ref(false)
const formType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  type: 'time',
  firstPrice: 0,
  firstHours: 1,
  additionalPrice: 0,
  perPrice: 0,
  status: 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择计费类型', trigger: 'change' }],
  firstPrice: [{ required: true, message: '请输入首小时收费', trigger: 'blur' }],
  firstHours: [{ required: true, message: '请输入首小时时长', trigger: 'blur' }],
  additionalPrice: [{ required: true, message: '请输入后续每小时收费', trigger: 'blur' }],
  perPrice: [{ required: true, message: '请输入每次收费', trigger: 'blur' }]
}

const handleAdd = () => {
  formType.value = 'add'
  Object.assign(form, {
    name: '',
    type: 'time',
    firstPrice: 0,
    firstHours: 1,
    additionalPrice: 0,
    perPrice: 0,
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row: BillingScheme) => {
  formType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row: BillingScheme) => {
  ElMessageBox.confirm('确认删除该计费方案？', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  })
}

const handleStatusChange = (row: BillingScheme) => {
  const status = row.status === 1 ? '启用' : '停用'
  ElMessage.success(`${status}成功`)
}

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
.billing-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;

  .header-actions {
    margin-bottom: 20px;
  }

  .ml-2 {
    margin-left: 8px;
  }
}
</style>