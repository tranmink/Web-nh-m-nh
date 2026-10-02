<template>
  <!-- Lớp phủ mờ -->
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-40 bg-black/50" @click="$emit('close')"></div>
  </transition>

  <!-- Drawer trượt từ phải sang trái -->
  <transition name="drawer">
    <aside
      v-if="open"
      class="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-800"
      role="dialog"
      aria-label="Giỏ hàng"
    >
      <header class="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-600">
        <h2 class="text-xl font-bold">Giỏ hàng ({{ cartTotalItems }} món)</h2>
        <button
          type="button"
          class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Đóng giỏ hàng"
          @click="$emit('close')"
        >
          ✕
        </button>
      </header>

      <p v-if="cartItems.length === 0" class="flex-1 px-5 py-10 text-center text-gray-500 dark:text-gray-400">
        Giỏ hàng đang trống. Chọn món từ thực đơn để bắt đầu.
      </p>

      <transition-group v-else name="cart-item" tag="ul" class="relative flex-1 divide-y divide-gray-200 overflow-y-auto px-5 dark:divide-gray-600">
        <li v-for="item in cartItems" :key="item.id" class="flex items-center gap-3 bg-white py-4 dark:bg-gray-800">
          <span class="text-3xl" aria-hidden="true">{{ item.image }}</span>

          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold">{{ item.name }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatCurrency(item.price) }}</p>
            <div class="mt-2 flex items-center gap-2">
              <button type="button" class="h-8 w-8 rounded-md border border-gray-300 font-bold hover:bg-gray-100 dark:border-gray-500 dark:hover:bg-gray-700" aria-label="Giảm số lượng" @click="updateQuantity({ id: item.id, delta: -1 })">−</button>
              <span class="w-6 text-center font-semibold">{{ item.quantity }}</span>
              <button type="button" class="h-8 w-8 rounded-md border border-gray-300 font-bold hover:bg-gray-100 dark:border-gray-500 dark:hover:bg-gray-700" aria-label="Tăng số lượng" @click="updateQuantity({ id: item.id, delta: 1 })">+</button>
            </div>
          </div>

          <div class="flex flex-col items-end gap-2">
            <span class="font-bold">{{ formatCurrency(item.price * item.quantity) }}</span>
            <button type="button" class="rounded-md p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700" :aria-label="`Xóa ${item.name}`" @click="removeFromCart(item.id)">
              <!-- Icon thùng rác -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
              </svg>
            </button>
          </div>
        </li>
      </transition-group>

      <footer class="border-t border-gray-200 px-5 py-4 dark:border-gray-600">
        <div class="mb-4 flex items-center justify-between text-lg">
          <span>Tổng tiền</span>
          <strong class="text-2xl">{{ formatCurrency(cartTotalPrice) }}</strong>
        </div>
        <button
          type="button"
          class="w-full rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-500"
          :disabled="cartItems.length === 0 || isLoading"
          @click="isCheckoutOpen = true"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Thanh toán' }}
        </button>
      </footer>
    </aside>
  </transition>

  <!-- Form thông tin khách hàng -->
  <CheckoutForm :open="isCheckoutOpen" @close="isCheckoutOpen = false" @submit="handleCheckout" />
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import currencyMixin from '../mixins/currencyMixin'
import CheckoutForm from './CheckoutForm.vue'

export default {
  name: 'CartDrawer',
  components: { CheckoutForm },
  mixins: [currencyMixin],
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ['close'],
  data() {
    return { isCheckoutOpen: false }
  },
  computed: {
    ...mapState(['isLoading']),
    ...mapGetters(['cartItems', 'cartTotalItems', 'cartTotalPrice'])
  },
  methods: {
    ...mapActions(['updateQuantity', 'removeFromCart', 'checkout']),
    /** Gửi đơn kèm thông tin khách; thành công thì đóng form và drawer */
    async handleCheckout(customer) {
      const isSuccess = await this.checkout(customer)
      if (isSuccess) {
        this.isCheckoutOpen = false
        this.$emit('close')
      }
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.cart-item-enter-active,
.cart-item-leave-active,
.cart-item-move {
  transition: all 0.3s ease;
}
.cart-item-enter-from,
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.cart-item-leave-active {
  position: absolute;
  width: calc(100% - 2.5rem);
}
</style>
