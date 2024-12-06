<template>
  <div class="report-container">
    <!-- 筛选条件 -->
    <el-form :inline="true" :model="filterForm" class="filter-form">
      <el-form-item label="停车场">
        <el-select v-model="filterForm.parkingLotId" placeholder="请选择停车场">
          <el-option
            v-for="item in parkingLots"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="filterForm.timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleExport">导出报表</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :span="6" v-for="card in overviewCards" :key="card.title">
        <el-card shadow="hover">
          <div class="overview-item">
            <div class="title">{{ card.title }}</div>
            <div class="value">{{ card.value }}</div>
            <div class="trend" v-if="card.trend !== undefined">
              较上期
              <span :class="card.trend >= 0 ? 'up' : 'down'">
                {{ Math.abs(card.trend) }}%
                <el-icon>
                  <component :is="card.trend >= 0 ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <!-- 收入趋势图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>收入趋势</span>
              <el-radio-group v-model="incomeChartType" size="small">
                <el-radio-button label="day">日</el-radio-button>
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="incomeChartRef" class="chart"></div>
        </el-card>
      </el-col>

      <!-- 车流量分析 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>车流量分析</span>
              <el-radio-group v-model="trafficChartType" size="small">
                <el-radio-button label="hour">时段</el-radio-button>
                <el-radio-button label="day">日期</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trafficChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>详细数据</span>
          <el-radio-group v-model="activeTab" size="small">
            <el-radio-button label="daily">日报表</el-radio-button>
            <el-radio-button label="monthly">月报表</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="totalOrders" label="订单数" width="100" />
        <el-table-column prop="totalAmount" label="收入">
          <template #default="{ row }">
            ¥{{ row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="avgParkingTime" label="平均停车时长" />
        <el-table-column prop="peakHourFlow" label="高峰车流量" />
        <el-table-column prop="turnoverRate" label="周转率">
          <template #default="{ row }">
            {{ row.turnoverRate }}%
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import type { ECharts } from 'echarts'
import type { ReportData, OverviewCard } from '@/types/report'

// 筛选表单
const filterForm = reactive({
  parkingLotId: '',
  timeRange: []
})

// 停车场列表
const parkingLots = ref([
  { id: '1', name: '西湖停车场' },
  { id: '2', name: '东湖停车场' }
])

// 数据概览卡片
const overviewCards = ref<OverviewCard[]>([
  {
    title: '总收入',
    value: '¥12,345.00',
    trend: 12.5
  },
  {
    title: '订单数',
    value: '1,234',
    trend: -5.2
  },
  {
    title: '平均停车时长',
    value: '2.5小时',
    trend: 3.1
  },
  {
    title: '车位利用率',
    value: '85%',
    trend: 8.4
  }
])

// 图表相关
const incomeChartType = ref('day')
const trafficChartType = ref('hour')
const incomeChartRef = ref<HTMLElement>()
const trafficChartRef = ref<HTMLElement>()
let incomeChart: ECharts | null = null
let trafficChart: ECharts | null = null

// 表格相关
const activeTab = ref('daily')
const tableData = ref<ReportData[]>([
  {
    date: '2024-02-15',
    totalOrders: 156,
    totalAmount: 2345.00,
    avgParkingTime: '2.3小时',
    peakHourFlow: 45,
    turnoverRate: 75.5
  }
])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 初始化图表
onMounted(() => {
  initCharts()
})

// 销毁图表
onUnmounted(() => {
  incomeChart?.dispose()
  trafficChart?.dispose()
})

// 初始化图表方法
const initCharts = () => {
  // 收入趋势图
  if (incomeChartRef.value) {
    incomeChart = echarts.init(incomeChartRef.value)
    const incomeOption = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value',
        name: '金额 (元)'
      },
      series: [{
        name: '收入',
        type: 'line',
        smooth: true,
        data: [1200, 1350, 1400, 1500, 1800, 2000, 1900],
        areaStyle: {}
      }]
    }
    incomeChart.setOption(incomeOption)
  }

  // 车流量分析图
  if (trafficChartRef.value) {
    trafficChart = echarts.init(trafficChartRef.value)
    const trafficOption = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
      },
      yAxis: {
        type: 'value',
        name: '车辆数'
      },
      series: [{
        name: '车流量',
        type: 'bar',
        data: [30, 20, 15, 80, 70, 65, 90, 45]
      }]
    }
    trafficChart.setOption(trafficOption)
  }
}

// 查询方法
const handleSearch = () => {
  console.log('查询条件：', filterForm)
  // TODO: 调用查询API
}

// 导出报表
const handleExport = () => {
  ElMessage.success('报表导出中...')
  // TODO: 调用导出API
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
</script>

<style scoped lang="scss">
.report-container {
  padding: 20px;

  .filter-form {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .data-overview {
    margin-bottom: 20px;

    .overview-item {
      .title {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }

      .value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .trend {
        font-size: 12px;
        color: #909399;

        .up {
          color: #67C23A;
        }

        .down {
          color: #F56C6C;
        }
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;

    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart {
        height: 300px;
      }
    }
  }

  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>