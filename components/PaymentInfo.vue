<template>
  <div class="payment-info">
    <div class="payment-header" style="background: #4285f4; color: white; padding: 10px 15px;">
      Payment Information
    </div>
    <div class="payment-content">
      <div class="fee-item">
        <span class="fee-label">Parking Fee</span>
        <span class="fee-amount">${{ parkingFee }}</span>
      </div>
      <div class="fee-item">
        <span class="fee-label">Service Fee</span>
        <span class="fee-amount">${{ serviceFee }}</span>
      </div>
      <div class="fee-item">
        <span class="fee-label">Tax</span>
        <span class="fee-amount">${{ tax }}</span>
      </div>
      <div class="fee-item total">
        <span class="fee-label">Subtotal</span>
        <span class="fee-amount">${{ subtotal }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentInfo',
  props: {
    parkingFee: {
      type: [Number, String],
      default: 0
    },
    serviceFee: {
      type: [Number, String],
      default: 0
    },
    tax: {
      type: [Number, String],
      default: 0
    },
    subtotal: {
      type: [Number, String],
      default: 0
    }
  }
}
</script>

<style scoped>
.payment-info {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.payment-header {
  font-size: 16px;
  font-weight: 500;
}

.payment-content {
  padding: 15px;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.fee-item:last-child {
  border-bottom: none;
}

.fee-label {
  color: #666;
}

.fee-amount {
  font-weight: 500;
  color: #333;
}

.fee-item.total {
  margin-top: 10px;
  border-top: 1px solid #e0e0e0;
  border-bottom: none;
}

.fee-item.total .fee-amount {
  color: #4285f4;
  font-size: 18px;
  font-weight: 600;
}
</style>