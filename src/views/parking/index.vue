<template>
  <div class="parking-container">
    <!-- Search Form and Add Button -->
    <div class="header">
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="Keyword">
            <el-input 
              v-model="searchForm.keyword" 
              placeholder="Name/Address/ZIP" 
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="State">
            <el-select 
              v-model="searchForm.state" 
              placeholder="All States"
              clearable
              filterable
              style="width: 180px"
            >
              <el-option
                v-for="state in states"
                :key="state.value"
                :label="state.label"
                :value="state.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="City">
            <el-select 
              v-model="searchForm.city" 
              placeholder="All Cities"
              clearable
              filterable
              :disabled="!searchForm.state"
              style="width: 180px"
            >
              <el-option
                v-for="city in cities"
                :key="city.value"
                :label="city.label"
                :value="city.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Status">
            <el-select 
              v-model="searchForm.status" 
              placeholder="All Status"
              clearable
              style="width: 150px"
            >
              <el-option label="All" value="" />
              <el-option label="Active" value="active" />
              <el-option label="Draft" value="draft" />
              <el-option label="Maintenance" value="maintenance" />
              <el-option label="Full" value="full" />
              <el-option label="Closed" value="closed" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">Search</el-button>
            <el-button @click="handleReset">Reset</el-button>
          </el-form-item>
        </el-form>

        <el-button 
          type="primary" 
          class="add-button"
          @click="handleAdd"
        >
          <el-icon><Plus /></el-icon>
          Add Parking Lot
        </el-button>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
        <el-radio-group v-model="viewMode" size="large">
          <el-radio-button label="list">
            <el-icon><List /></el-icon>
            List View
          </el-radio-button>
          <el-radio-button label="map">
            <el-icon><Location /></el-icon>
            Map View
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- List View -->
    <div v-show="viewMode === 'list'" class="list-view">
      <el-table :data="parkingList" border style="width: 100%">
        <el-table-column prop="name" label="Name" min-width="150" />
        <el-table-column prop="address" label="Address" min-width="200" show-overflow-tooltip />
        <el-table-column label="Location" width="200">
          <template #default="{ row }">
            {{ row.city }}, {{ row.state }} {{ row.zipCode }}
          </template>
        </el-table-column>
        <el-table-column label="Available Spaces" width="200">
          <template #default="{ row }">
            <div class="space-info">
              <div class="space-numbers">
                <span class="available">{{ row.availableSpaces }}</span>
                <span class="separator">/</span>
                <span class="total">{{ row.totalSpaces }}</span>
              </div>
              <el-progress 
                :percentage="Math.round((row.availableSpaces / row.totalSpaces) * 100)"
                :status="getSpaceStatus(row)"
                :show-text="false"
                :stroke-width="8"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Pricing" min-width="250">
          <template #default="{ row }">
            <div class="price-list">
              <el-tag 
                v-for="(rule, index) in row.priceRules" 
                :key="index"
                :type="getPriceTagType(index)"
                class="price-tag"
              >
                {{ formatPriceRule(rule) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120" fixed="right">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column width="100" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <el-button type="primary" link>
                Actions<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>Edit
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleShowQRCode(row)">
                    <el-icon><Aim /></el-icon>QR Code
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- Map View -->
    <div v-show="viewMode === 'map'" class="map-view">
      <ParkingMap 
        :parking-lots="parkingList"
        @marker-click="handleMarkerClick"
      />
    </div>

    <!-- QRCode Dialog -->
    <QRCodeDialog
      v-model="qrcodeDialogVisible"
      :parking-lot="currentParkingLot"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, List, Location, ArrowDown, Edit, Aim } from '@element-plus/icons-vue'
import { states, searchCities } from '@/utils/us-address'
import ParkingMap from './components/ParkingMap.vue'
import type { ParkingLot, ParkingSearchForm, PriceRule } from '@/types/parking'
import QRCodeDialog from '@/components/parking/QRCodeDialog.vue'

const router = useRouter()

// View mode
const viewMode = ref<'list' | 'map'>('list')

// Search form
const searchForm = ref<ParkingSearchForm>({
  keyword: '',
  state: '',
  city: '',
  status: ''
})

// Cities options based on selected state
const cities = computed(() => {
  if (!searchForm.value.state) return []
  return searchCities(searchForm.value.state, '')
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// Mock data
const parkingList = ref<ParkingLot[]>([
  {
    id: '1',
    name: 'Downtown Parking',
    address: '123 Main St',
    state: 'NY',
    city: 'New York',
    zipCode: '10001',
    location: { lat: 40.7128, lng: -74.0060 },
    totalSpaces: 100,
    availableSpaces: 80,
    occupiedSpaces: 20,
    images: [],
    priceRules: [
      { type: 'hour', duration: 1, amount: 10 },
      { type: 'day', duration: 1, amount: 50 }
    ],
    status: 'active',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z'
  }
])

// Utility functions
const getSpaceStatus = (parking: ParkingLot): '' | 'success' | 'warning' | 'exception' => {
  const ratio = parking.availableSpaces / parking.totalSpaces
  if (ratio > 0.5) return 'success'
  if (ratio > 0.2) return 'warning'
  return 'exception'
}

const getPriceTagType = (index: number): '' | 'success' | 'warning' | 'danger' => {
  const types: ('' | 'success' | 'warning' | 'danger')[] = ['', 'success', 'warning', 'danger']
  return types[index % types.length]
}

const formatPriceRule = (rule: PriceRule): string => {
  return `$${rule.amount}/${rule.duration}${rule.type}`
}

const getStatusType = (status: string): string => {
  const types: Record<string, string> = {
    active: 'success',
    maintenance: 'warning',
    full: 'danger',
    closed: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Event handlers
const handleSearch = () => {
  console.log('Search form:', searchForm.value)
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    state: '',
    city: '',
    status: ''
  }
}

const handleAdd = () => {
  router.push('/parking/add')
}

const handleEdit = (row: ParkingLot) => {
  router.push(`/parking/add?id=${row.id}`)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: Reload data
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: Reload data
}

const handleMarkerClick = (parking: ParkingLot) => {
  console.log('Clicked parking:', parking)
}

// QRCode Dialog
const qrcodeDialogVisible = ref(false)
const currentParkingLot = ref<ParkingLot>(parkingList.value[0])

const handleShowQRCode = (parking: ParkingLot) => {
  currentParkingLot.value = { ...parking }
  qrcodeDialogVisible.value = true
}
</script>

<style scoped lang="scss">
.parking-container {
  padding: 20px;
  position: relative;

  .header {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;

    .search-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      .search-form {
        flex: 1;
        margin-right: 20px;
      }

      .add-button {
        min-width: 140px;
        height: 40px;
        margin-top: 4px;

        .el-icon {
          margin-right: 4px;
        }
      }
    }

    .view-toggle {
      display: flex;
      justify-content: center;
      border-top: 1px solid #ebeef5;
      padding-top: 20px;
    }
  }

  .list-view {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;

    .space-info {
      .space-numbers {
        margin-bottom: 8px;
        font-size: 16px;
        
        .available {
          font-weight: bold;
          color: #67c23a;
        }
        
        .separator {
          margin: 0 4px;
          color: #909399;
        }
        
        .total {
          color: #606266;
        }
      }
    }

    .price-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .price-tag {
        border-radius: 12px;
      }
    }
  }

  .map-view {
    height: calc(100vh - 200px);
    background-color: #fff;
    border-radius: 4px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  :deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    min-width: 120px;
    
    .el-icon {
      margin-right: 4px;
    }
  }
}
</style>