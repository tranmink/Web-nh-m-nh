<template>
  <transition name="spinner">
    <div v-if="isLoading" class="fixed inset-x-0 top-0 z-[70] h-1 overflow-hidden bg-red-100 dark:bg-gray-600" role="progressbar" aria-label="Đang tải">
      <div class="spinner-bar h-full w-1/3 bg-red-600"></div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'LoadingSpinner',
  computed: { ...mapState(['isLoading']) }
}
</script>

<style scoped>
.spinner-enter-active,
.spinner-leave-active {
  transition: opacity 0.2s ease;
}
.spinner-enter-from,
.spinner-leave-to {
  opacity: 0;
}
.spinner-bar {
  animation: slide 1s ease-in-out infinite;
}
@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
</style>
