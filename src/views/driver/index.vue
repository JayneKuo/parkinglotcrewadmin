<template>
  <div class="driver-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Keyword">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="Name/Phone/License/Plate" 
            clearable
          />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="searchForm.status" placeholder="All Status" clearable>
            <el-option
              v-for="status in driverStatus"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            >
              <el-tag :type="getStatusType(status.value)" size="small">
                {{ status.label }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Membership">
          <el-select v-model="searchForm.membershipType" placeholder="All Types" clearable>
            <el-option
              v-for="type in membershipTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>

      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>Add Driver
        </el-button>
      </div>
    </el-card>

    <!-- 司机列表 -->
    <el-card class="list-card">
      <el-table :data="driverList" border style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="driver-detail">
              <!-- 车辆信息 -->
              <div class="detail-section">
                <h4>Vehicles</h4>
                <div class="vehicle-list">
                  <el-tag 
                    v-for="vehicle in row.vehicleInfo" 
                    :key="vehicle.plateNumber"
                    class="vehicle-tag"
                  >
                    {{ vehicle.plateNumber }} - {{ vehicle.make }} {{ vehicle.model }}
                  </el-tag>
                </div>
              </div>
              
              <!-- 停车历史 -->
              <div class="detail-section">
                <h4>Parking History</h4>
                <div class="history-info">
                  <div class="info-item">
                    <span class="label">Total Visits:</span>
                    <span class="value">{{ row.parkingHistory.totalVisits }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Last Visit:</span>
                    <span class="value">{{ row.parkingHistory.lastVisit }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Favorite Location:</span>
                    <span class="value">{{ row.parkingHistory.favoriteLocation }}</span>
                  </div>
                </div>
              </div>

              <!-- 支付信息 -->
              <div class="detail-section">
                <h4>Payment Information</h4>
                <div class="payment-info">
                  <div class="info-item">
                    <span class="label">Balance:</span>
                    <span class="value">${{ row.paymentInfo.balance }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Auto Recharge:</span>
                    <el-tag :type="row.paymentInfo.autoRecharge ? 'success' : 'info'" size="small">
                      {{ row.paymentInfo.autoRecharge ? 'Enabled' : 'Disabled' }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Driver" min-width="200">
          <template #default="{ row }">
            <div class="driver-info">
              <div class="driver-name">{{ row.name }}</div>
              <div class="driver-contact">
                <el-tooltip content="Phone">
                  <span><el-icon><Phone /></el-icon>{{ row.phone }}</span>
                </el-tooltip>
                <el-tooltip v-if="row.email" content="Email">
                  <span><el-icon><Message /></el-icon>{{ row.email }}</span>
                </el-tooltip>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="licenseNumber" label="License" width="150" />

        <el-table-column label="Membership" width="150">
          <template #default="{ row }">
            <div class="membership-info">
              <el-tag :type="getMembershipType(row.membershipType)">
                {{ row.membershipType }}
              </el-tag>
              <div v-if="row.membershipExpiry" class="expiry-date">
                Expires: {{ row.membershipExpiry }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="primary" link @click="handleHistory(row)">
                <el-icon><List /></el-icon>
              </el-button>
              <el-button 
                type="primary" 
                link 
                :disabled="row.status === DriverStatus.Blocked"
                @click="handleBlock(row)"
              >
                <el-icon><CircleClose /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Plus, Edit, List, CircleClose,
  Phone, Message 
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { DriverStatus, MembershipType } from '@/types/driver'

// ... 状态和方法的实现
</script>

<style scoped lang="scss">
// ... 样式实现
</style>