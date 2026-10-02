<template>
  <article
    class="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition dark:border-gray-600 dark:bg-gray-700/50"
    :class="{ 'cursor-not-allowed opacity-60': !food.isAvailable }"
    @click="handleCardClick"
  >
    <!-- Ảnh món: nhận URL ảnh hoặc emoji -->
    <div class="relative flex h-40 items-center justify-center bg-amber-50 dark:bg-gray-600">
      <img v-if="isImageUrl" :src="food.image" :alt="food.name" class="h-full w-full object-cover" />
      <span v-else class="text-7xl" role="img" :aria-label="food.name">{{ food.image }}</span>

      <span
        v-if="!food.isAvailable"
        class="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
      >
        Hết hàng
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-2 p-4">
      <p class="text-xs font-medium text-red-600 dark:text-red-400">{{ food.category }}</p>
      <h3 class="text-lg font-bold leading-snug">{{ food.name }}</h3>
      <p class="flex-1 text-sm text-gray-600 dark:text-gray-300">{{ food.description }}</p>

      <div class="mt-2 flex items-center justify-between gap-3">
        <span class="text-lg font-extrabold">{{ formatCurrency(food.price) }}</span>
        <button
          type="button"
          class="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-500"
          :disabled="!food.isAvailable"
          @click.stop="$emit('add', food)"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  </article>
</template>

<script>
import currencyMixin from '../mixins/currencyMixin'

export default {
  name: 'FoodCard',
  mixins: [currencyMixin],
  props: {
    food: { type: Object, required: true }
  },
  emits: ['add', 'unavailable'],
  computed: {
    isImageUrl() {
      return /^(https?:)?\/\/|^\//.test(this.food.image)
    }
  },
  methods: {
    /** Click vào thẻ món đã hết: báo cho component cha hiển thị thông báo */
    handleCardClick() {
      if (!this.food.isAvailable) this.$emit('unavailable', this.food)
    }
  }
}
</script>
