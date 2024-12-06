<template>
  <el-dialog
    title="Parking Lot QR Code"
    :model-value="modelValue"
    width="400px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="qrcode-content">
      <!-- 停车场信息 -->
      <div class="parking-info">
        <h3>{{ parkingLot.name }}</h3>
        <p class="address">{{ parkingLot.address }}</p>
        <p class="location">{{ parkingLot.city }}, {{ parkingLot.state }} {{ parkingLot.zipCode }}</p>
      </div>

      <!-- 二维码区域 -->
      <div class="qrcode-box">
        <div class="qrcode-wrapper">
          <img 
            :src="`/mock/qrcode/${parkingLot.id}.png`" 
            :alt="`${parkingLot.name} QR Code`" 
            class="qrcode-image"
          />
        </div>
        <div class="qrcode-tip">
          <el-icon><Aim /></el-icon>
          <span>Scan to view parking lot information</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button type="primary" @click="handleDownload">
          <el-icon><Download /></el-icon>Download
        </el-button>
        <el-button type="primary" @click="handlePrint">
          <el-icon><Printer /></el-icon>Print
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { Download, Printer, Aim } from '@element-plus/icons-vue'
import type { ParkingLot } from '@/types/parking'

const props = defineProps<{
  modelValue: boolean
  parkingLot: ParkingLot
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 下载二维码
const handleDownload = () => {
  const link = document.createElement('a')
  link.href = `/mock/qrcode/${props.parkingLot.id}.png`
  link.download = `${props.parkingLot.name}-QRCode.png`
  link.click()
}

// 打印二维码
const handlePrint = () => {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${props.parkingLot.name} - QR Code</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              font-family: Arial, sans-serif;
            }
            .parking-info {
              text-align: center;
              margin-bottom: 24px;
            }
            .parking-info h2 {
              margin: 0 0 8px;
              color: #303133;
              font-size: 20px;
            }
            .parking-info p {
              margin: 4px 0;
              color: #606266;
              font-size: 14px;
            }
            .qrcode {
              width: 300px;
              height: 300px;
              padding: 20px;
              border: 1px solid #dcdfe6;
              border-radius: 4px;
              margin-bottom: 16px;
            }
            .tip {
              color: #909399;
              font-size: 14px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="parking-info">
            <h2>${props.parkingLot.name}</h2>
            <p>${props.parkingLot.address}</p>
            <p>${props.parkingLot.city}, ${props.parkingLot.state} ${props.parkingLot.zipCode}</p>
          </div>
          <img src="/mock/qrcode/${props.parkingLot.id}.png" class="qrcode" />
          <div class="tip">Scan to view parking lot information</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}
</script>

<style scoped lang="scss">
.qrcode-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;

  .parking-info {
    margin-bottom: 24px;
    
    h3 {
      margin: 0 0 8px;
      font-size: 18px;
      color: #303133;
    }
    
    .address {
      margin: 4px 0;
      color: #606266;
      font-size: 14px;
    }

    .location {
      margin: 4px 0;
      color: #909399;
      font-size: 14px;
    }
  }

  .qrcode-box {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;

    .qrcode-wrapper {
      padding: 16px;
      background: #fff;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .qrcode-image {
      width: 200px;
      height: 200px;
      display: block;
    }

    .qrcode-tip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #909399;
      font-size: 14px;

      .el-icon {
        font-size: 16px;
      }
    }
  }

  .actions {
    display: flex;
    gap: 16px;

    .el-button {
      min-width: 120px;
      
      .el-icon {
        margin-right: 6px;
      }
    }
  }
}
</style> 