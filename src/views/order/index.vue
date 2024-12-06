<template>
  <div class="order-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="订单号">
        <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" />
      </el-form-item>
      <el-form-item label="车牌号">
        <el-input v-model="searchForm.plateNumber" placeholder="请输入车牌号" />
      </el-form-item>
      <el-form-item label="停车场">
        <el-select v-model="searchForm.parkingLotId" placeholder="请选择停车场">
          <el-option
            v-for="item in parkingLots"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="全部" value="" />
          <el-option label="未支付" value="unpaid" />
          <el-option label="已支付" value="paid" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="searchForm.timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="orderList" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="plateNumber" label="车牌号" width="120" />
      <el-table-column prop="parkingLot" label="停车场" />
      <el-table-column label="入场时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.entryTime) }}
        </template>
      </el-table-column>
      <el-table-column label="出场时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.exitTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="停车时长" width="120" />
      <el-table-column prop="amount" label="金额" width="120">
        <template #default="{ row }">
          ¥{{ row.amount.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button 
            v-if="row.status === 'unpaid'"
            type="primary" 
            link 
            @click="handlePay(row)"
          >
            收款
          </el-button>
          <el-button type="primary" link @click="handleDetail(row)">
            详情
          </el-button>
          <el-button 
            v-if="row.status === 'unpaid'"
            type="danger" 
            link 
            @click="handleCancel(row)"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">
          {{ currentOrder.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="车牌号">
          {{ currentOrder.plateNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="停车场">
          {{ currentOrder.parkingLot }}
        </el-descriptions-item>
        <el-descriptions-item label="入场时间">
          {{ formatDateTime(currentOrder.entryTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="出场时间">
          {{ formatDateTime(currentOrder.exitTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="停车时长">
          {{ currentOrder.duration }}
        </el-descriptions-item>
        <el-descriptions-item label="计费方案">
          {{ currentOrder.billingScheme }}
        </el-descriptions-item>
        <el-descriptions-item label="应收金额">
          ¥{{ currentOrder.amount?.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付时间" v-if="currentOrder.payTime">
          {{ formatDateTime(currentOrder.payTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 收款弹窗 -->
    <el-dialog
      v-model="payDialogVisible"
      title="收款"
      width="400px"
    >
      <el-form :model="payForm" label-width="100px">
        <el-form-item label="应收金额">
          <span class="amount">¥{{ currentOrder.amount?.toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-radio-group v-model="payForm.method">
            <el-radio label="cash">现金</el-radio>
            <el-radio label="wechat">微信</el-radio>
            <el-radio label="alipay">支付宝</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePaySubmit">确认收款</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Order, ParkingLot } from '@/types/order'

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  plateNumber: '',
  parkingLotId: '',
  status: '',
  timeRange: []
})

// 停车场列表
const parkingLots = ref<ParkingLot[]>([
  { id: '1', name: '西湖停车场' },
  { id: '2', name: '东湖停车场' }
])

// 订单列表数据
const orderList = ref<Order[]>([
  {
    id: '1',
    orderNo: 'SO20240215001',
    plateNumber: '京A12345',
    parkingLot: '西湖停车场',
    entryTime: '2024-02-15 10:00:00',
    exitTime: '2024-02-15 12:30:00',
    duration: '2小时30分',
    amount: 15.00,
    status: 'paid',
    billingScheme: '基础时段计费',
    payTime: '2024-02-15 12:35:00'
  },
  {
    id: '2',
    orderNo: 'SO20240215002',
    plateNumber: '京B67890',
    parkingLot: '东湖停车场',
    entryTime: '2024-02-15 11:00:00',
    exitTime: null,
    duration: '1小时45分',
    amount: 10.00,
    status: 'unpaid',
    billingScheme: '临时计费'
  }
])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 弹窗控制
const detailDialogVisible = ref(false)
const payDialogVisible = ref(false)
const currentOrder = ref<Partial<Order>>({})
const payForm = reactive({
  method: 'cash'
})

// 格式化日期时间
const formatDateTime = (datetime: string | null) => {
  if (!datetime) return '-'
  return datetime
}

// 获取状态样式
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    unpaid: 'warning',
    paid: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    unpaid: '未支付',
    paid: '已支付',
    cancelled: '已取消'
  }
  return map[status] || status
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  // TODO: 调用搜索API
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    plateNumber: '',
    parkingLotId: '',
    status: '',
    timeRange: []
  })
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  // TODO: 重新加载数据
}

// 查看详情
const handleDetail = (row: Order) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

// 收款操作
const handlePay = (row: Order) => {
  currentOrder.value = row
  payDialogVisible.value = true
}

// 确认收款
const handlePaySubmit = () => {
  ElMessage.success('收款成功')
  payDialogVisible.value = false
  // TODO: 调用收款API
}

// 取消订单
const handleCancel = (row: Order) => {
  ElMessageBox.confirm('确认取消该订单？', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('订单已取消')
    // TODO: 调用取消订单API
  })
}
</script>

<style scoped lang="scss">
.order-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;

  .search-form {
    padding: 20px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .amount {
    font-size: 24px;
    color: #f56c6c;
    font-weight: bold;
  }
}
</style>