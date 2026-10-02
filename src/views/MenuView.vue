<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
      <!-- TÌM KIẾM + LỌC DANH MỤC -->
      <section class="mb-6 flex flex-col gap-4">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Tìm món ăn theo tên..."
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/30 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400"
        />

        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            class="rounded-full border px-4 py-1.5 text-sm font-semibold transition"
            :class="
              selectedCategory === category
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-gray-300 bg-white hover:border-red-600 dark:border-gray-600 dark:bg-gray-700'
            "
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </section>

      <!-- THỐNG KÊ TỨC THÌ (computed) -->
      <section class="mb-6 grid grid-cols-3 gap-3 text-center" aria-live="polite">
        <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700/50">
          <p class="text-2xl font-extrabold">{{ stats.total }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300">Món tìm thấy</p>
        </div>
        <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700/50">
          <p class="text-2xl font-extrabold text-green-600 dark:text-green-400">{{ stats.available }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300">Sẵn sàng phục vụ</p>
        </div>
        <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700/50">
          <p class="text-2xl font-extrabold text-red-600 dark:text-red-400">{{ stats.unavailable }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300">Tạm hết</p>
        </div>
      </section>

      <!-- DANH SÁCH MÓN: transition-group cho hiệu ứng lọc + v-move -->
      <transition-group name="food-list" tag="ul" class="relative flex flex-wrap gap-6">
        <li v-for="food in filteredFoods" :key="food.id" class="food-item w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
          <FoodCard :food="food" @add="addToCart" @unavailable="notifyUnavailable" />
        </li>
      </transition-group>

      <p v-if="!filteredFoods.length && !isFetching" class="py-16 text-center text-gray-500 dark:text-gray-400">
        Không có món nào khớp. Thử từ khóa khác hoặc chọn "Tất cả".
      </p>

      <!-- Nút thử Interceptor bắt lỗi 5xx -->
      <div class="mt-12 text-center">
        <button type="button" class="text-sm text-gray-500 underline hover:text-red-600 dark:text-gray-400" @click="simulateServerError">
          Thử gọi API lỗi 500
        </button>
      </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import FoodCard from '../components/FoodCard.vue'
import { fetchFoods, triggerServerError } from '../services/api'

const ALL_CATEGORIES = 'Tất cả'

/** Bỏ dấu tiếng Việt để tìm "pho" vẫn ra "Phở" */
const normalizeText = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()

export default {
  name: 'MenuView',
  components: { FoodCard },

  data() {
    return {
      foods: [],
      isFetching: true,
      searchQuery: '',
      selectedCategory: ALL_CATEGORIES
    }
  },

  computed: {
    /** Danh mục lấy động từ dữ liệu món */
    categories() {
      return [ALL_CATEGORIES, ...new Set(this.foods.map((food) => food.category))]
    },

    /** Lọc theo danh mục + từ khóa, cập nhật tức thì khi gõ */
    filteredFoods() {
      const keyword = normalizeText(this.searchQuery)
      return this.foods.filter((food) => {
        const matchCategory = this.selectedCategory === ALL_CATEGORIES || food.category === this.selectedCategory
        const matchName = normalizeText(food.name).includes(keyword)
        return matchCategory && matchName
      })
    },

    stats() {
      const available = this.filteredFoods.filter((food) => food.isAvailable).length
      return {
        total: this.filteredFoods.length,
        available,
        unavailable: this.filteredFoods.length - available
      }
    }
  },

  async created() {
    try {
      this.foods = await fetchFoods()
    } catch (error) {
      // Toast lỗi đã do Response Interceptor xử lý
    } finally {
      this.isFetching = false
    }
  },

  methods: {
    ...mapActions(['addToCart']),

    notifyUnavailable(food) {
      this.$store.commit('SET_NOTIFICATION', {
        type: 'warning',
        message: `"${food.name}" tạm ngưng phục vụ.`
      })
    },

    async simulateServerError() {
      try {
        await triggerServerError()
      } catch (error) {
        // Toast lỗi đã do Response Interceptor xử lý
      }
    }
  }
}
</script>

<style scoped>
.food-list-enter-active,
.food-list-leave-active,
.food-list-move {
  transition: all 0.4s ease;
}
.food-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.food-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
/* Phần tử rời đi thoát khỏi luồng để các thẻ còn lại trượt mượt (v-move) */
.food-list-leave-active {
  position: absolute;
}
</style>
