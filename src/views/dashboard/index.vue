<template>
  <div class="dashboard-container">
    <!-- Summary Cards -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in summaryCards" :key="card.title">
        <el-card class="data-card">
          <div class="card-header">
            <span class="title">{{ card.title }}</span>
            <el-icon class="icon"><component :is="card.icon" /></el-icon>
          </div>
          <div class="value">{{ card.value }}</div>
          <div class="trend">
            vs Last Day
            <span :class="card.trend >= 0 ? 'up' : 'down'">
              {{ Math.abs(card.trend) }}%
              <el-icon>
                <component :is="card.trend >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Parking Status Cards -->
    <el-row :gutter="20" class="status-cards">
      <el-col :span="6" v-for="status in parkingStatus" :key="status.title">
        <el-card class="status-card" :class="status.type">
          <div class="status-header">
            <span class="title">{{ status.title }}</span>
            <el-tag :type="status.type" effect="dark">{{ status.count }}</el-tag>
          </div>
          <div class="status-content">
            <div class="vehicles">
              <div v-for="vehicle in status.vehicles.slice(0, 2)" :key="vehicle.plate" class="vehicle-item">
                <span class="plate">{{ vehicle.plate }}</span>
                <span class="time">{{ vehicle.time }}</span>
              </div>
            </div>
            <el-button link type="primary" size="small" class="view-all">
              View All
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Business Charts -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>Business Trend</span>
              <el-radio-group v-model="trendTimeRange" size="small">
                <el-radio-button label="week">Week</el-radio-button>
                <el-radio-button label="month">Month</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="businessTrendRef" class="chart"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>Hourly Analysis</span>
              <el-select v-model="analysisDay" size="small" style="width: 120px">
                <el-option label="Today" value="today" />
                <el-option label="Yesterday" value="yesterday" />
                <el-option label="Last Week" value="lastWeek" />
              </el-select>
            </div>
          </template>
          <div ref="hourlyAnalysisRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Recent Orders -->
    <el-card class="recent-orders">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>Recent Orders</span>
            <el-radio-group v-model="orderType" size="small">
              <el-radio-button label="all">All</el-radio-button>
              <el-radio-button label="parking">Parking</el-radio-button>
              <el-radio-button label="valet">Valet</el-radio-button>
            </el-radio-group>
          </div>
          <el-button type="primary" link>View All</el-button>
        </div>
      </template>
      <el-table :data="filteredOrders" style="width: 100%">
        <el-table-column prop="orderNo" label="Order No." width="150" />
        <el-table-column prop="type" label="Type" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'parking' ? 'primary' : 'success'">
              {{ row.type === 'parking' ? 'Parking' : 'Valet' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="plateNo" label="Plate No." width="120" />
        <el-table-column prop="spaceNo" label="Space No." width="120" />
        <el-table-column prop="startTime" label="Start Time" width="180" />
        <el-table-column prop="duration" label="Duration" width="120">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="Amount" width="120">
          <template #default="{ row }">
            ${{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Valet Service Status -->
    <el-row :gutter="20" class="status-row">
      <el-col :span="12">
        <el-card class="status-card">
          <template #header>
            <div class="card-header">
              <span>Active Valet Orders</span>
              <el-tag type="success">Real-time</el-tag>
            </div>
          </template>
          <div class="valet-orders">
            <div v-for="order in activeValetOrders" :key="order.id" class="order-item">
              <div class="order-info">
                <div class="car-info">
                  <el-tag size="small" :type="order.status === 'parking' ? 'warning' : 'success'">
                    {{ order.status === 'parking' ? 'Parking' : 'Ready' }}
                  </el-tag>
                  <span class="plate">{{ order.plateNo }}</span>
                  <span class="car">{{ order.carInfo }}</span>
                </div>
                <div class="time-info">
                  <el-icon><Timer /></el-icon>
                  <span>{{ order.duration }}</span>
                </div>
              </div>
              <div class="progress-info">
                <el-steps :active="getStepActive(order.status)" simple>
                  <el-step title="Received" />
                  <el-step title="Parking" />
                  <el-step title="Parked" />
                </el-steps>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="status-card">
          <template #header>
            <div class="card-header">
              <span>Pickup Requests</span>
              <div class="header-actions">
                <el-tag type="warning" v-if="pendingPickups.length">
                  {{ pendingPickups.length }} Pending
                </el-tag>
                <el-button type="primary" link>View All</el-button>
              </div>
            </div>
          </template>
          <div class="pickup-requests">
            <div v-for="request in pendingPickups" :key="request.id" class="request-item">
              <div class="request-header">
                <div class="left">
                  <span class="order-no">{{ request.orderNo }}</span>
                  <el-tag 
                    size="small" 
                    :type="request.urgent ? 'danger' : 'warning'"
                  >
                    {{ request.urgent ? 'Urgent' : 'Normal' }}
                  </el-tag>
                </div>
                <div class="time">{{ request.requestTime }}</div>
              </div>
              <div class="request-content">
                <div class="car-info">
                  <span class="plate">{{ request.plateNo }}</span>
                  <span class="car">{{ request.carInfo }}</span>
                </div>
                <div class="location">
                  <el-icon><Location /></el-icon>
                  <span>Zone {{ request.zone }} - {{ request.spaceNo }}</span>
                </div>
                <div class="pickup-time">
                  <el-icon><Timer /></el-icon>
                  <span>Pickup in {{ request.expectedTime }}</span>
                </div>
              </div>
              <div class="request-actions">
                <el-button type="primary" size="small">Accept</el-button>
                <el-button size="small">Reschedule</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import {
  Money,
  Van,
  Timer,
  TrendCharts,
  ArrowUp,
  ArrowDown,
  Location,
  ArrowRight
} from '@element-plus/icons-vue'

// Summary Cards Data
const summaryCards = ref([
  {
    title: "Today's Revenue",
    value: '$3,586.00',
    trend: 12.5,
    icon: Money
  },
  {
    title: 'Total Vehicles',
    value: '186',
    trend: 8.4,
    icon: Van
  },
  {
    title: 'Avg. Duration',
    value: '2.5h',
    trend: -5.2,
    icon: Timer
  },
  {
    title: 'Occupancy Rate',
    value: '78%',
    trend: 3.1,
    icon: TrendCharts
  }
])

// Space Status
const spaceStatus = ref({
  available: 45,
  occupied: 38,
  reserved: 17
})

// Time range selectors
const trendTimeRange = ref('week')
const analysisDay = ref('today')

// Chart references
const businessTrendRef = ref<HTMLElement>()
const hourlyAnalysisRef = ref<HTMLElement>()
let businessTrendChart: echarts.ECharts | null = null
let hourlyAnalysisChart: echarts.ECharts | null = null

// Order type filter
const orderType = ref('all')

// Recent Orders with type
const recentOrders = ref([
  { 
    orderNo: 'P20240215001',
    type: 'parking',
    plateNo: 'CA123ABC',
    spaceNo: 'A-123',
    startTime: '2024-02-15 09:30',
    duration: 120,
    amount: 25.00,
    status: 'In Progress'
  },
  { 
    orderNo: 'V20240215001',
    type: 'valet',
    plateNo: 'CA456DEF',
    spaceNo: 'V-045',
    startTime: '2024-02-15 10:15',
    duration: 60,
    amount: 35.00,
    status: 'Completed'
  },
  { 
    orderNo: 'P20240215002',
    type: 'parking',
    plateNo: 'CA789GHI',
    spaceNo: 'B-078',
    startTime: '2024-02-15 11:00',
    duration: 180,
    amount: 35.00,
    status: 'Reserved'
  },
  { 
    orderNo: 'V20240215002',
    type: 'valet',
    plateNo: 'CA321XYZ',
    spaceNo: 'V-012',
    startTime: '2024-02-15 11:30',
    duration: 90,
    amount: 45.00,
    status: 'In Progress'
  }
])

// Filter orders based on selected type
const filteredOrders = computed(() => {
  if (orderType.value === 'all') return recentOrders.value
  return recentOrders.value.filter(order => order.type === orderType.value)
})

// Format duration (minutes to hours and minutes)
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Get order status type
const getOrderStatusType = (status: string): string => {
  const types: Record<string, string> = {
    'Completed': 'success',
    'In Progress': 'warning',
    'Reserved': 'info',
    'Cancelled': 'danger'
  }
  return types[status] || ''
}

// Mock active valet orders
const activeValetOrders = ref([
  {
    id: 'V001',
    plateNo: 'CA123ABC',
    carInfo: '2023 Tesla Model Y - White',
    status: 'parking',
    duration: '5m ago',
  },
  {
    id: 'V002',
    plateNo: 'CA456DEF',
    carInfo: '2022 BMW X5 - Black',
    status: 'parked',
    duration: '15m ago',
  },
  {
    id: 'V003',
    plateNo: 'CA789GHI',
    carInfo: '2024 Mercedes GLC - Silver',
    status: 'ready',
    duration: '2m ago',
  }
])

// Mock pickup requests
const pendingPickups = ref([
  {
    id: 'P001',
    orderNo: 'VO20240215001',
    plateNo: 'CA123XYZ',
    carInfo: '2023 Porsche Cayenne - Black',
    zone: 'A',
    spaceNo: 'A123',
    requestTime: '2 minutes ago',
    expectedTime: '15 minutes',
    urgent: true
  },
  {
    id: 'P002',
    orderNo: 'VO20240215002',
    plateNo: 'CA456UVW',
    carInfo: '2022 Audi Q7 - White',
    zone: 'B',
    spaceNo: 'B045',
    requestTime: '5 minutes ago',
    expectedTime: '30 minutes',
    urgent: false
  }
])

// Get step active number
const getStepActive = (status: string): number => {
  const steps: Record<string, number> = {
    'received': 1,
    'parking': 2,
    'parked': 3,
    'ready': 3
  }
  return steps[status] || 1
}

// Initialize Charts
onMounted(() => {
  // Business Trend Chart
  if (businessTrendRef.value) {
    businessTrendChart = echarts.init(businessTrendRef.value)
    const trendOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      legend: {
        data: ['Revenue', 'Orders', 'Avg. Stay Time']
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisPointer: {
          type: 'shadow'
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Revenue',
          min: 0,
          max: 5000,
          interval: 1000,
          axisLabel: {
            formatter: '${value}'
          }
        },
        {
          type: 'value',
          name: 'Orders & Time',
          min: 0,
          max: 100,
          interval: 20
        }
      ],
      series: [
        {
          name: 'Revenue',
          type: 'bar',
          data: [2100, 1800, 2300, 2600, 2900, 3500, 3200],
          itemStyle: {
            color: '#409EFF'
          }
        },
        {
          name: 'Orders',
          type: 'line',
          yAxisIndex: 1,
          data: [35, 30, 40, 45, 50, 65, 55],
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#67C23A'
          }
        },
        {
          name: 'Avg. Stay Time',
          type: 'line',
          yAxisIndex: 1,
          data: [45, 42, 48, 50, 52, 58, 53],
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#E6A23C'
          }
        }
      ]
    }
    businessTrendChart.setOption(trendOption)
  }

  // Hourly Analysis Chart
  if (hourlyAnalysisRef.value) {
    hourlyAnalysisChart = echarts.init(hourlyAnalysisRef.value)
    const hourlyOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: function (params: any) {
          const time = params[0].name
          let result = `${time}<br/>`
          params.forEach((param: any) => {
            if (param.seriesName === 'Revenue') {
              result += `${param.seriesName}: $${param.value}<br/>`
            } else if (param.seriesName === 'Occupancy Rate') {
              result += `${param.seriesName}: ${param.value}%<br/>`
            } else {
              result += `${param.seriesName}: ${param.value}<br/>`
            }
          })
          return result
        }
      },
      legend: {
        data: ['Revenue', 'Occupancy Rate', 'New Orders']
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
      },
      yAxis: [
        {
          type: 'value',
          name: 'Revenue',
          position: 'left',
          axisLabel: {
            formatter: '${value}'
          }
        },
        {
          type: 'value',
          name: 'Rate',
          min: 0,
          max: 100,
          position: 'right',
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: 'Revenue',
          type: 'line',
          smooth: true,
          emphasis: {
            focus: 'series'
          },
          data: [150, 100, 80, 300, 450, 500, 400, 300],
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            opacity: 0.1
          }
        },
        {
          name: 'Occupancy Rate',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          emphasis: {
            focus: 'series'
          },
          data: [30, 20, 15, 65, 85, 90, 75, 60],
          itemStyle: {
            color: '#67C23A'
          }
        },
        {
          name: 'New Orders',
          type: 'bar',
          emphasis: {
            focus: 'series'
          },
          data: [5, 3, 2, 15, 20, 25, 18, 12],
          itemStyle: {
            color: '#E6A23C'
          }
        }
      ]
    }
    hourlyAnalysisChart.setOption(hourlyOption)
  }
})

// Watch time range changes
watch(trendTimeRange, (newValue) => {
  // TODO: Update business trend chart data based on selected time range
  console.log('Time range changed:', newValue)
})

watch(analysisDay, (newValue) => {
  // TODO: Update hourly analysis chart data based on selected day
  console.log('Analysis day changed:', newValue)
})

// Clean up
onUnmounted(() => {
  businessTrendChart?.dispose()
  hourlyAnalysisChart?.dispose()
})

// 添加停车状态数据
const parkingStatus = ref([
  {
    title: 'Arriving Soon',
    type: 'info',
    count: 8,
    vehicles: [
      { plate: 'CA 1234', time: 'ETA 5 min' },
      { plate: 'CA 5678', time: 'ETA 10 min' },
      { plate: 'CA 9012', time: 'ETA 15 min' }
    ]
  },
  {
    title: 'Currently Parked',
    type: 'success',
    count: 45,
    vehicles: [
      { plate: 'NY 4321', time: '2h 30m' },
      { plate: 'NY 8765', time: '1h 45m' },
      { plate: 'NY 2109', time: '1h 15m' }
    ]
  },
  {
    title: 'Leaving Soon',
    type: 'warning',
    count: 12,
    vehicles: [
      { plate: 'TX 2468', time: '15m left' },
      { plate: 'TX 1357', time: '30m left' },
      { plate: 'TX 9876', time: '45m left' }
    ]
  },
  {
    title: 'Overtime',
    type: 'danger',
    count: 5,
    vehicles: [
      { plate: 'FL 3691', time: '+30m' },
      { plate: 'FL 2580', time: '+1h' },
      { plate: 'FL 1470', time: '+2h' }
    ]
  }
])
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;

  .data-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .title {
        font-size: 16px;
        color: #606266;
      }

      .icon {
        font-size: 24px;
        color: #409EFF;
      }
    }

    .value {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .trend {
      font-size: 14px;
      color: #909399;

      .up {
        color: #67C23A;
      }

      .down {
        color: #F56C6C;
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .legend {
        display: flex;
        gap: 20px;

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 14px;

          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;

            &.available { background-color: #67C23A; }
            &.occupied { background-color: #F56C6C; }
            &.reserved { background-color: #E6A23C; }
          }
        }
      }
    }
  }

  .chart {
    height: 350px;
  }

  .recent-orders {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 20px;

        .el-radio-group {
          margin-left: 16px;
        }
      }
    }
  }

  .status-row {
    margin-bottom: 20px;

    .status-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      .valet-orders {
        .order-item {
          padding: 12px;
          border-bottom: 1px solid #ebeef5;

          &:last-child {
            border-bottom: none;
          }

          .order-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .car-info {
              display: flex;
              align-items: center;
              gap: 12px;

              .plate {
                font-weight: bold;
              }
            }

            .time-info {
              color: #909399;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }

      .pickup-requests {
        .request-item {
          padding: 16px;
          border-bottom: 1px solid #ebeef5;

          &:last-child {
            border-bottom: none;
          }

          .request-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .left {
              display: flex;
              align-items: center;
              gap: 12px;

              .order-no {
                font-weight: bold;
              }
            }

            .time {
              color: #909399;
              font-size: 14px;
            }
          }

          .request-content {
            margin-bottom: 12px;

            .car-info {
              margin-bottom: 8px;
              
              .plate {
                font-weight: bold;
                margin-right: 12px;
              }
            }

            .location, .pickup-time {
              color: #606266;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 8px;
              margin-top: 8px;
            }
          }

          .request-actions {
            display: flex;
            gap: 12px;
          }
        }
      }
    }
  }

  .status-cards {
    margin-bottom: 20px;

    .status-card {
      .status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .title {
          font-size: 16px;
          font-weight: 500;
          color: #606266;
        }
      }

      .status-content {
        .vehicles {
          margin-bottom: 12px;

          .vehicle-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px dashed #ebeef5;

            &:last-child {
              border-bottom: none;
            }

            .plate {
              font-weight: 500;
              color: #303133;
            }

            .time {
              font-size: 13px;
              color: #909399;
            }
          }
        }

        .view-all {
          width: 100%;
          justify-content: center;
          border-top: 1px solid #ebeef5;
          margin-top: 8px;
          padding-top: 8px;
        }
      }

      &.info {
        border-top: 3px solid var(--el-color-info);
      }

      &.success {
        border-top: 3px solid var(--el-color-success);
      }

      &.warning {
        border-top: 3px solid var(--el-color-warning);
      }

      &.danger {
        border-top: 3px solid var(--el-color-danger);
      }
    }
  }
}
</style>