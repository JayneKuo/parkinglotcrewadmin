<template>
  <el-form 
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="140px"
  >
    <!-- 基本信息 -->
    <div class="form-section">
      <h3>Basic Information</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Name" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Type" prop="type">
            <el-select v-model="form.type">
              <el-option
                v-for="type in deviceTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Location" prop="location">
            <el-input v-model="form.location" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Status" prop="status">
            <el-select v-model="form.status">
              <el-option
                v-for="status in deviceStatus"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Brand" prop="brand">
            <el-input v-model="form.brand" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Model" prop="model">
            <el-input v-model="form.model" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Installation Date" prop="installationDate">
            <el-date-picker
              v-model="form.installationDate"
              type="date"
              placeholder="Select date"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Maintenance Cycle" prop="maintenanceCycle">
            <el-input-number 
              v-model="form.maintenanceCycle"
              :min="1"
              :max="24"
            />
            <span class="unit">months</span>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 网络配置 -->
    <div class="form-section">
      <h3>Network Configuration</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="IP Address" prop="network.ipAddress">
            <el-input v-model="form.network.ipAddress" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="MAC Address" prop="network.macAddress">
            <el-input v-model="form.network.macAddress" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Port" prop="network.port">
            <el-input-number 
              v-model="form.network.port"
              :min="1"
              :max="65535"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 其他设置 -->
    <div class="form-section">
      <h3>Other Settings</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Power Supply" prop="powerSupply">
            <el-select v-model="form.powerSupply">
              <el-option label="AC Power" value="AC" />
              <el-option label="Solar Power" value="Solar" />
              <el-option label="Battery" value="Battery" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Error Logging">
            <el-switch v-model="form.errorLogging" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 设备特定配置 -->
    <div v-if="form.type" class="form-section">
      <h3>Device Specific Configuration</h3>
      <component
        :is="getConfigComponent(form.type)"
        v-model="form.config"
      />
    </div>

    <!-- 备注 -->
    <div class="form-section">
      <h3>Notes</h3>
      <el-form-item prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="Enter notes..."
        />
      </el-form-item>
    </div>
  </el-form>
</template>

<script setup lang="ts">
// ... 实现相关逻辑
</script>

<style scoped lang="scss">
// ... 样式实现
</style> 