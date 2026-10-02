<template>
  <transition name="modal">
    <div v-if="open" class="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 p-4" @click.self="$emit('close')">
      <form
        class="modal-panel max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
        novalidate
        role="dialog"
        aria-label="Thông tin khách hàng"
        @submit.prevent="handleSubmit"
      >
        <h2 class="text-xl font-bold">Thông tin đặt hàng</h2>
        <p class="mb-5 mt-1 text-sm text-gray-600 dark:text-gray-300">
          Tổng thanh toán: <strong>{{ formatCurrency(cartTotalPrice) }}</strong> ({{ cartTotalItems }} món)
        </p>

        <div class="flex flex-col gap-4">
          <div>
            <label for="customer-name" class="mb-1 block text-sm font-semibold">Họ và tên</label>
            <input id="customer-name" v-model.trim="form.name" type="text" autocomplete="name" :class="inputClass('name')" />
            <p v-if="errors.name" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.name }}</p>
          </div>

          <div>
            <label for="customer-phone" class="mb-1 block text-sm font-semibold">Số điện thoại</label>
            <input id="customer-phone" v-model.trim="form.phone" type="tel" autocomplete="tel" placeholder="0912 345 678" :class="inputClass('phone')" />
            <p v-if="errors.phone" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.phone }}</p>
          </div>

          <div>
            <label for="customer-address" class="mb-1 block text-sm font-semibold">Địa chỉ nhận hàng</label>
            <input id="customer-address" v-model.trim="form.address" type="text" autocomplete="street-address" :class="inputClass('address')" />
            <p v-if="errors.address" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.address }}</p>
          </div>

          <div>
            <label for="customer-note" class="mb-1 block text-sm font-semibold">Ghi chú (không bắt buộc)</label>
            <textarea id="customer-note" v-model.trim="form.note" rows="2" maxlength="200" :class="inputClass('note')"></textarea>
          </div>

          <fieldset>
            <legend class="mb-2 text-sm font-semibold">Phương thức thanh toán</legend>
            <div class="flex flex-col gap-2 sm:flex-row">
              <label
                v-for="method in paymentMethods"
                :key="method.value"
                class="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                :class="form.paymentMethod === method.value ? 'border-red-600 bg-red-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600'"
              >
                <input v-model="form.paymentMethod" type="radio" name="payment-method" :value="method.value" class="accent-red-600" />
                {{ method.label }}
              </label>
            </div>
          </fieldset>
        </div>

        <div class="mt-6 flex gap-3">
          <button type="button" class="flex-1 rounded-xl border border-gray-300 py-3 font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700" @click="$emit('close')">
            Quay lại
          </button>
          <button type="submit" class="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400" :disabled="isLoading">
            {{ isLoading ? 'Đang gửi đơn...' : 'Xác nhận đặt hàng' }}
          </button>
        </div>
      </form>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import currencyMixin from '../mixins/currencyMixin'

/** Số điện thoại Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx (10 số) */
const VN_PHONE_REGEX = /^(0|\+84)\d{9}$/

export default {
  name: 'CheckoutForm',
  mixins: [currencyMixin],
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      form: { name: '', phone: '', address: '', note: '', paymentMethod: 'cod' },
      errors: {},
      paymentMethods: [
        { value: 'cod', label: 'Tiền mặt khi nhận hàng' },
        { value: 'transfer', label: 'Chuyển khoản' }
      ]
    }
  },
  computed: {
    ...mapState(['isLoading']),
    ...mapGetters(['cartTotalPrice', 'cartTotalItems'])
  },
  methods: {
    inputClass(field) {
      const base = 'w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-red-600/30 dark:bg-gray-700'
      return `${base} ${this.errors[field] ? 'border-red-600' : 'border-gray-300 focus:border-red-600 dark:border-gray-600'}`
    },

    /** Kiểm tra dữ liệu; trả về true nếu hợp lệ */
    validate() {
      const errors = {}
      if (this.form.name.length < 2) errors.name = 'Vui lòng nhập họ và tên (ít nhất 2 ký tự).'
      if (!VN_PHONE_REGEX.test(this.form.phone.replace(/\s/g, ''))) {
        errors.phone = 'Số điện thoại chưa đúng. Ví dụ: 0912345678.'
      }
      if (this.form.address.length < 5) errors.address = 'Vui lòng nhập địa chỉ nhận hàng đầy đủ.'
      this.errors = errors
      return Object.keys(errors).length === 0
    },

    handleSubmit() {
      if (!this.validate()) return
      this.$emit('submit', { ...this.form, phone: this.form.phone.replace(/\s/g, '') })
    }
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: translateY(20px) scale(0.97);
}
</style>
