<template>
  <div>
    <!-- 其他订单详情信息 -->
    <div v-if="order.isPaid">
      <h3>支付信息</h3>
      <p>总金额: {{ order.paymentAmount }}</p>
      <p>支付时间: {{ order.paymentTime }}</p>
      <p>支付方式: {{ order.paymentMethod }}</p>
      <p>支付流水号: {{ order.paymentTransactionId }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      order: {
        // 假设这些数据是从API获取的
        isPaid: false, // 根据订单状态更新
        paymentAmount: 0,
        paymentTime: '',
        paymentMethod: '',
        paymentTransactionId: ''
      }
    };
  },
  methods: {
    fetchOrderDetails() {
      // 这里应该是获取订单详情的API调用
      // 并根据返回的数据更新order对象
    }
  },
  mounted() {
    this.fetchOrderDetails();
  }
};
</script>

<style scoped>
/* 添加样式以符合设计要求 */
</style> 