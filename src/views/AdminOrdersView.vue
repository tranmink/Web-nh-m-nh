<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-2xl font-extrabold">Quản lý đơn hàng</h2>
      <button type="button" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700" @click="loadOrders">
        Tải lại
      </button>
    </div>

    <!-- THỐNG KÊ -->
    <section class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5" aria-live="polite">
      <div v-for="stat in statCards" :key="stat.label" class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700/50">
        <p class="text-2xl font-extrabold">{{ stat.value }}</p>
        <p class="text-xs text-gray-600 dark:text-gray-300">{{ stat.label }}</p>
      </div>
    </section>

    <!-- TÌM KIẾM + LỌC TRẠNG THÁI -->
    <section class="mb-6 flex flex-col gap-4">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Tìm theo mã đơn, tên hoặc số điện thoại..."
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/30 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400"
      />
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in statusFilters"
          :key="option.value"
          type="button"
          class="rounded-full border px-4 py-1.5 text-sm font-semibold transition"
          :class="selectedStatus === option.value ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300 bg-white hover:border-red-600 dark:border-gray-600 dark:bg-gray-700'"
          @click="selectedStatus = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <!-- DANH SÁCH ĐƠN -->
    <transition-group name="order-list" tag="ul" class="relative flex flex-col gap-4">
      <li v-for="order in filteredOrders" :key="order.orderId" class="order-item rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700/50">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="font-bold">{{ order.orderId }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(order.createdAt) }}</p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusMap[order.status].badge">
            {{ statusMap[order.status].label }}
          </span>
        </div>

        <div class="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          <p><span class="text-gray-500 dark:text-gray-400">Khách hàng:</span> {{ order.customer.name }}</p>
          <p><span class="text-gray-500 dark:text-gray-400">Điện thoại:</span> {{ order.customer.phone }}</p>
          <p class="sm:col-span-2"><span class="text-gray-500 dark:text-gray-400">Địa chỉ:</span> {{ order.customer.address }}</p>
          <p><span class="text-gray-500 dark:text-gray-400">Thanh toán:</span> {{ paymentLabel(order.customer.paymentMethod) }}</p>
          <p v-if="order.customer.note" class="sm:col-span-2"><span class="text-gray-500 dark:text-gray-400">Ghi chú:</span> {{ order.customer.note }}</p>
        </div>

        <ul class="mt-3 divide-y divide-gray-100 border-t border-gray-100 text-sm dark:divide-gray-600 dark:border-gray-600">
          <li v-for="item in order.items" :key="item.id" class="flex justify-between py-1.5">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span>{{ formatCurrency(item.price * item.quantity) }}</span>
          </li>
        </ul>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p class="text-lg font-extrabold">{{ formatCurrency(order.total) }}</p>
          <div class="flex items-center gap-2">
            <label :for="`status-${order.orderId}`" class="sr-only">Trạng thái đơn {{ order.orderId }}</label>
            <select
              :id="`status-${order.orderId}`"
              :value="order.status"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              @change="changeStatus(order, $event.target.value)"
            >
              <option v-for="(info, value) in statusMap" :key="value" :value="value">{{ info.label }}</option>
            </select>
            <button type="button" class="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700" @click="removeOrder(order)">
              Xóa
            </button>
          </div>
        </div>
      </li>
    </transition-group>

    <p v-if="!filteredOrders.length && !isFetching" class="py-16 text-center text-gray-500 dark:text-gray-400">
      {{ orders.length ? 'Không có đơn nào khớp bộ lọc.' : 'Chưa có đơn hàng. Đơn đặt từ trang thực đơn sẽ xuất hiện ở đây.' }}
    </p>
  </div>
</template>

<script>
import currencyMixin from '../mixins/currencyMixin'
import { fetchOrders, updateOrderStatus, deleteOrder } from '../services/api'

const ALL_STATUS = 'all'

export default {
  name: 'AdminOrdersView',
  mixins: [currencyMixin],

  data() {
    return {
      orders: [],
      isFetching: true,
      searchQuery: '',
      selectedStatus: ALL_STATUS,
      statusMap: {
        pending: { label: 'Chờ xác nhận', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200' },
        confirmed: { label: 'Đã xác nhận', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200' },
        completed: { label: 'Hoàn thành', badge: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200' },
        cancelled: { label: 'Đã hủy', badge: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200' }
      }
    }
  },

  computed: {
    statusFilters() {
      return [
        { value: ALL_STATUS, label: 'Tất cả' },
        ...Object.entries(this.statusMap).map(([value, info]) => ({ value, label: info.label }))
      ]
    },

    /** Lọc theo trạng thái + từ khóa (mã đơn, tên, số điện thoại) */
    filteredOrders() {
      const keyword = this.searchQuery.trim().toLowerCase()
      return this.orders.filter((order) => {
        const matchStatus = this.selectedStatus === ALL_STATUS || order.status === this.selectedStatus
        const matchKeyword =
          !keyword ||
          [order.orderId, order.customer.name, order.customer.phone].some((text) => text.toLowerCase().includes(keyword))
        return matchStatus && matchKeyword
      })
    },

    countByStatus() {
      return this.orders.reduce((counts, order) => {
        counts[order.status] = (counts[order.status] || 0) + 1
        return counts
      }, {})
    },

    /** Doanh thu tính trên các đơn chưa hủy */
    revenue() {
      return this.orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0)
    },

    statCards() {
      return [
        { label: 'Tổng đơn', value: this.orders.length },
        { label: 'Chờ xác nhận', value: this.countByStatus.pending || 0 },
        { label: 'Đã xác nhận', value: this.countByStatus.confirmed || 0 },
        { label: 'Hoàn thành', value: this.countByStatus.completed || 0 },
        { label: 'Doanh thu (không tính đơn hủy)', value: this.formatCurrency(this.revenue) }
      ]
    }
  },

  created() {
    this.loadOrders()
  },

  methods: {
    async loadOrders() {
      this.isFetching = true
      try {
        this.orders = await fetchOrders()
      } catch (error) {
        // Toast lỗi đã do Response Interceptor xử lý
      } finally {
        this.isFetching = false
      }
    },

    async changeStatus(order, status) {
      try {
        const updated = await updateOrderStatus(order.orderId, status)
        order.status = updated.status
        this.$store.commit('SET_NOTIFICATION', {
          type: 'success',
          message: `Đơn ${order.orderId}: ${this.statusMap[status].label}.`
        })
      } catch (error) {
        // Tải lại để select quay về trạng thái thật trên server
        this.loadOrders()
      }
    },

    async removeOrder(order) {
      if (!window.confirm(`Xóa đơn ${order.orderId} của ${order.customer.name}?`)) return
      try {
        await deleteOrder(order.orderId)
        this.orders = this.orders.filter((o) => o.orderId !== order.orderId)
        this.$store.commit('SET_NOTIFICATION', { type: 'success', message: `Đã xóa đơn ${order.orderId}.` })
      } catch (error) {
        // Toast lỗi đã do Response Interceptor xử lý
      }
    },

    paymentLabel(method) {
      return method === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt khi nhận hàng'
    },

    formatDate(iso) {
      return new Date(iso).toLocaleString('vi-VN')
    }
  }
}
</script>

<style scoped>
.order-list-enter-active,
.order-list-leave-active,
.order-list-move {
  transition: all 0.35s ease;
}
.order-list-enter-from,
.order-list-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.order-list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
