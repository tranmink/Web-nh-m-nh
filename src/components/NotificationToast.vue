<template>
  <transition name="toast">
    <div
      v-if="notification"
      :key="notification.message"
      class="fixed left-1/2 top-5 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-start gap-3 rounded-xl px-4 py-3 text-white shadow-lg"
      :class="colorClass"
      role="alert"
    >
      <span class="flex-1 text-sm font-medium">{{ notification.message }}</span>
      <button type="button" class="text-white/80 hover:text-white" aria-label="Đóng thông báo" @click="dismiss">✕</button>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'

/** Thời gian tự đóng toast (ms) */
const AUTO_DISMISS_MS = 3500

export default {
  name: 'NotificationToast',
  data() {
    return { timerId: null }
  },
  computed: {
    ...mapState(['notification']),
    colorClass() {
      const colors = { success: 'bg-green-600', error: 'bg-red-600', warning: 'bg-amber-600' }
      return colors[this.notification?.type] || 'bg-gray-700'
    }
  },
  watch: {
    // Mỗi lần có thông báo mới: đặt lại bộ đếm tự đóng
    notification(value) {
      clearTimeout(this.timerId)
      if (value) this.timerId = setTimeout(this.dismiss, AUTO_DISMISS_MS)
    }
  },
  beforeUnmount() {
    clearTimeout(this.timerId)
  },
  methods: {
    dismiss() {
      this.$store.commit('SET_NOTIFICATION', null)
    }
  }
}
</script>

<style scoped>
/* Fade-in kèm hiệu ứng nảy */
.toast-enter-active {
  animation: toast-bounce 0.5s ease;
}
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

@keyframes toast-bounce {
  0% { opacity: 0; transform: translate(-50%, -30px); }
  60% { opacity: 1; transform: translate(-50%, 8px); }
  80% { transform: translate(-50%, -3px); }
  100% { transform: translate(-50%, 0); }
}
</style>
