<template>
  <div class="min-h-screen">
    <LoadingSpinner />
    <NotificationToast />

    <!-- HEADER -->
    <header class="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-800/90">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-5">
          <router-link to="/" class="text-xl font-extrabold text-red-600 dark:text-red-400">Quán Nhà Mình</router-link>
          <nav class="flex gap-4 text-sm font-semibold">
            <router-link to="/" class="nav-link">Thực đơn</router-link>
            <router-link to="/admin" class="nav-link">Quản lý đơn hàng</router-link>
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <!-- Nút bật/tắt Dark Mode -->
          <button
            type="button"
            class="rounded-lg p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            :aria-label="isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'"
            @click="toggleDarkMode"
          >
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>

          <!-- Nút giỏ hàng kèm badge số lượng (chỉ hiện ở trang thực đơn) -->
          <button
            v-if="$route.name === 'menu'"
            type="button"
            class="relative rounded-lg p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Mở giỏ hàng"
            @click="isCartOpen = true"
          >
            🛒
            <span
              v-if="cartTotalItems > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white"
            >
              {{ cartTotalItems }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <router-view />

    <CartDrawer :open="isCartOpen" @close="isCartOpen = false" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CartDrawer from './components/CartDrawer.vue'
import NotificationToast from './components/NotificationToast.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

export default {
  name: 'App',
  components: { CartDrawer, NotificationToast, LoadingSpinner },

  data() {
    return {
      isCartOpen: false,
      isDarkMode: this.readInitialDarkMode()
    }
  },

  computed: {
    ...mapGetters(['cartTotalItems'])
  },

  watch: {
    // Đồng bộ class `dark` trên <html> và lưu lựa chọn vào localStorage
    isDarkMode: {
      immediate: true,
      handler(value) {
        document.documentElement.classList.toggle('dark', value)
        localStorage.setItem('isDarkMode', String(value))
      }
    }
  },

  methods: {
    readInitialDarkMode() {
      const saved = localStorage.getItem('isDarkMode')
      if (saved !== null) return saved === 'true'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    },

    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
    }
  }
}
</script>

<style scoped>
.nav-link {
  padding-bottom: 2px;
  border-bottom: 2px solid transparent;
}
/* Đánh dấu trang đang mở */
.nav-link.router-link-exact-active {
  border-bottom-color: #dc2626;
}
</style>
