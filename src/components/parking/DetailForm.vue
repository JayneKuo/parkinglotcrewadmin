<template>
  <div class="detail-form">
    <el-form :model="form" label-width="120px">
      <el-form-item label="Contact Person">
        <el-input v-model="form.contact" placeholder="Enter contact name" />
      </el-form-item>

      <!-- Phone Numbers -->
      <el-form-item 
        v-for="(phone, index) in form.phones" 
        :key="index"
        :label="index === 0 ? 'Phone Numbers' : ''"
        :class="{ 'no-label': index > 0 }"
      >
        <div class="input-with-action">
          <el-input v-model="form.phones[index]" placeholder="Enter phone number" />
          <el-button 
            type="danger" 
            link 
            @click="removePhone(index)"
            :disabled="form.phones.length === 1"
          >
            Remove
          </el-button>
        </div>
      </el-form-item>
      <el-button type="primary" link @click="addPhone">Add Phone</el-button>

      <!-- Email Addresses -->
      <el-form-item 
        v-for="(email, index) in form.emails" 
        :key="index"
        :label="index === 0 ? 'Email Addresses' : ''"
        :class="{ 'no-label': index > 0 }"
      >
        <div class="input-with-action">
          <el-input v-model="form.emails[index]" placeholder="Enter email address" />
          <el-button 
            type="danger" 
            link 
            @click="removeEmail(index)"
            :disabled="form.emails.length === 1"
          >
            Remove
          </el-button>
        </div>
      </el-form-item>
      <el-button type="primary" link @click="addEmail">Add Email</el-button>

      <!-- Images -->
      <el-form-item label="Images">
        <el-upload
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :on-change="handleImageChange"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <!-- Description -->
      <el-form-item label="Description">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="4"
          placeholder="Enter parking lot description"
        />
      </el-form-item>

      <!-- Building Info -->
      <el-form-item label="Building Info">
        <el-input 
          v-model="form.buildingInfo" 
          type="textarea" 
          :rows="4"
          placeholder="Enter building information"
        />
      </el-form-item>

      <!-- Facilities -->
      <el-form-item label="Facilities">
        <div class="facilities-list">
          <!-- Standard Facilities -->
          <div class="facility-group">
            <div class="group-title">Standard Facilities</div>
            <div class="facility-grid">
              <div v-for="facility in standardFacilities" :key="facility.value" class="facility-item">
                <el-checkbox 
                  v-model="form.selectedFacilities" 
                  :label="facility.value"
                >
                  <div class="facility-content">
                    <el-icon><component :is="facility.icon" /></el-icon>
                    <span>{{ facility.label }}</span>
                  </div>
                </el-checkbox>
              </div>
            </div>
          </div>

          <!-- Security Facilities -->
          <div class="facility-group">
            <div class="group-title">Security</div>
            <div class="facility-grid">
              <div v-for="facility in securityFacilities" :key="facility.value" class="facility-item">
                <el-checkbox 
                  v-model="form.selectedFacilities" 
                  :label="facility.value"
                >
                  <div class="facility-content">
                    <el-icon><component :is="facility.icon" /></el-icon>
                    <span>{{ facility.label }}</span>
                  </div>
                </el-checkbox>
              </div>
            </div>
          </div>

          <!-- Service Facilities -->
          <div class="facility-group">
            <div class="group-title">Services</div>
            <div class="facility-grid">
              <div v-for="facility in serviceFacilities" :key="facility.value" class="facility-item">
                <el-checkbox 
                  v-model="form.selectedFacilities" 
                  :label="facility.value"
                >
                  <div class="facility-content">
                    <el-icon><component :is="facility.icon" /></el-icon>
                    <span>{{ facility.label }}</span>
                  </div>
                </el-checkbox>
              </div>
            </div>
          </div>

          <!-- Custom Facilities -->
          <div class="facility-group">
            <div class="group-title">
              Custom Facilities
              <el-button type="primary" link @click="addCustomFacility">
                <el-icon><Plus /></el-icon>
                Add Custom
              </el-button>
            </div>
            <div class="facility-grid">
              <div 
                v-for="(facility, index) in form.customFacilities" 
                :key="'custom-' + index"
                class="facility-item custom"
              >
                <div class="facility-content">
                  <el-select 
                    v-model="facility.icon" 
                    class="icon-select"
                    filterable
                    placeholder="Select icon"
                  >
                    <el-option
                      v-for="icon in availableIcons"
                      :key="icon.name"
                      :label="icon.name"
                      :value="icon.name"
                    >
                      <div class="icon-option">
                        <el-icon><component :is="icon.name" /></el-icon>
                        <span>{{ icon.name }}</span>
                      </div>
                    </el-option>
                  </el-select>
                  <el-input 
                    v-model="facility.label" 
                    placeholder="Facility name"
                  />
                  <el-button 
                    type="danger" 
                    link 
                    @click="removeCustomFacility(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- Floor Plan -->
      <el-form-item label="Floor Plan">
        <el-upload
          action="#"
          :auto-upload="false"
          accept=".pdf,.jpg,.png"
          :on-change="handleFloorPlanChange"
        >
          <el-button type="primary">Upload Floor Plan</el-button>
          <template #tip>
            <div class="el-upload__tip">
              PDF/JPG/PNG files only
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <!-- Disclaimer -->
      <el-form-item>
        <el-checkbox v-model="form.disclaimer">
          I confirm all information provided is accurate and complete
        </el-checkbox>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus, Delete,
  VideoCamera, Warning, Camera, Lock,
  Van, Box, Truck, Timer,
  CreditCard, Money, Wallet,
  Location, Guide, Umbrella,
  Lightning, Monitor, Connection,
  Toilet, Coffee, Food,
  Shop, Discount,
  FirstAidBox
} from '@element-plus/icons-vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: {
    contact: string
    phones: string[]
    emails: string[]
    images: any[]
    description: string
    buildingInfo: string
    selectedFacilities: string[]
    floorPlan: any[]
    disclaimer: boolean
  }
}>()

const emit = defineEmits(['update:modelValue'])

const form = props.modelValue

// Phone management
const addPhone = () => {
  form.phones.push('')
}

const removePhone = (index: number) => {
  form.phones.splice(index, 1)
}

// Email management
const addEmail = () => {
  form.emails.push('')
}

const removeEmail = (index: number) => {
  form.emails.splice(index, 1)
}

// Image handling
const handleImageChange = (file: any) => {
  form.images.push(file)
}

// Floor plan handling
const handleFloorPlanChange = (file: any) => {
  form.floorPlan.push(file)
}

// Standard parking facilities
const standardFacilities = [
  { value: 'indoor', label: 'Indoor Parking', icon: 'Box' },
  { value: 'outdoor', label: 'Outdoor Parking', icon: 'Van' },
  { value: 'valet', label: 'Valet Service', icon: 'Guide' },
  { value: 'truck', label: 'Truck Parking', icon: 'Truck' },
  { value: 'timer', label: '24/7 Access', icon: 'Timer' },
  { value: 'covered', label: 'Covered Parking', icon: 'Umbrella' }
]

// Security facilities
const securityFacilities = [
  { value: 'cctv', label: 'CCTV Surveillance', icon: 'VideoCamera' },
  { value: 'security', label: 'Security Staff', icon: 'Warning' },
  { value: 'camera', label: 'License Plate Recognition', icon: 'Camera' },
  { value: 'access', label: 'Access Control', icon: 'Lock' },
  { value: 'monitoring', label: '24/7 Monitoring', icon: 'Monitor' },
  { value: 'intercom', label: 'Intercom System', icon: 'Connection' }
]

// Service facilities
const serviceFacilities = [
  { value: 'payment', label: 'Card Payment', icon: 'CreditCard' },
  { value: 'cash', label: 'Cash Payment', icon: 'Money' },
  { value: 'mobile', label: 'Mobile Payment', icon: 'Wallet' },
  { value: 'ev', label: 'EV Charging', icon: 'Lightning' },
  { value: 'disabled', label: 'Disabled Access', icon: 'Guide' },
  { value: 'restroom', label: 'Restroom', icon: 'Toilet' },
  { value: 'cafe', label: 'Café', icon: 'Coffee' },
  { value: 'restaurant', label: 'Restaurant', icon: 'Food' },
  { value: 'firstaid', label: 'First Aid', icon: 'FirstAidBox' },
  { value: 'shop', label: 'Convenience Store', icon: 'Shop' },
  { value: 'carwash', label: 'Car Wash', icon: 'Van' },
  { value: 'membership', label: 'Membership Discount', icon: 'Discount' }
]

// Available icons from Element Plus
const availableIcons = Object.entries(ElementPlusIconsVue).map(([name]) => ({
  name
}))

// Custom facility management
const addCustomFacility = () => {
  if (!form.customFacilities) {
    form.customFacilities = []
  }
  form.customFacilities.push({
    icon: '',
    label: '',
    value: `custom-${form.customFacilities.length}`
  })
}

const removeCustomFacility = (index: number) => {
  form.customFacilities.splice(index, 1)
}
</script>

<style scoped lang="scss">
.detail-form {
  .input-with-action {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .no-label {
    margin-left: 120px;
  }

  :deep(.el-upload__tip) {
    margin-top: 8px;
    color: #909399;
  }
}

.facilities-list {
  .facility-group {
    margin-bottom: 24px;

    .group-title {
      font-size: 16px;
      font-weight: 500;
      color: #606266;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .facility-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;

      .facility-item {
        .facility-content {
          display: flex;
          align-items: center;
          gap: 8px;

          .el-icon {
            font-size: 18px;
          }
        }

        &.custom {
          .facility-content {
            display: flex;
            gap: 8px;

            .icon-select {
              width: 120px;
            }

            .el-input {
              flex: 1;
            }
          }
        }
      }
    }
  }
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>