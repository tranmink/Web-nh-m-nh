import { createStore } from 'vuex'
import { createOrder } from '../services/api'

export default createStore({
  state: () => ({
    /** Mảng các { ...foodItem, quantity } */
    cart: [],
    /** Trạng thái spinner toàn cục (do Axios Interceptor điều khiển) */
    isLoading: false,
    /** { type: 'success' | 'error' | 'warning', message: string } hoặc null */
    notification: null
  }),

  getters: {
    cartItems: (state) => state.cart,
    cartTotalItems: (state) => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    cartTotalPrice: (state) => state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  mutations: {
    ADD_TO_CART(state, item) {
      const existing = state.cart.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.cart.push({ ...item, quantity: 1 })
      }
    },
    UPDATE_QUANTITY(state, { id, delta }) {
      const target = state.cart.find((cartItem) => cartItem.id === id)
      if (target) target.quantity += delta
    },
    REMOVE_FROM_CART(state, id) {
      state.cart = state.cart.filter((cartItem) => cartItem.id !== id)
    },
    CLEAR_CART(state) {
      state.cart = []
    },
    SET_LOADING(state, value) {
      state.isLoading = value
    },
    SET_NOTIFICATION(state, notification) {
      state.notification = notification
    }
  },

  actions: {
    /** Thêm món vào giỏ nếu còn hàng */
    addToCart({ commit }, item) {
      if (!item.isAvailable) {
        commit('SET_NOTIFICATION', {
          type: 'warning',
          message: `"${item.name}" tạm ngưng phục vụ.`
        })
        return
      }
      commit('ADD_TO_CART', item)
      commit('SET_NOTIFICATION', { type: 'success', message: `Đã thêm "${item.name}" vào giỏ.` })
    },

    /** Tăng/giảm số lượng; số lượng <= 0 thì tự động xóa món khỏi giỏ */
    updateQuantity({ commit, state }, { id, delta }) {
      const target = state.cart.find((cartItem) => cartItem.id === id)
      if (!target) return
      if (target.quantity + delta <= 0) {
        commit('REMOVE_FROM_CART', id)
      } else {
        commit('UPDATE_QUANTITY', { id, delta })
      }
    },

    removeFromCart({ commit }, id) {
      commit('REMOVE_FROM_CART', id)
    },

    /**
     * Gửi đơn hàng kèm thông tin khách; lỗi 4xx/5xx đã được Response Interceptor hiển thị toast
     * @param {{ name: string, phone: string, address: string, note: string, paymentMethod: string }} customer
     */
    async checkout({ commit, state, getters }, customer) {
      if (state.cart.length === 0) return false
      try {
        const order = await createOrder({
          customer,
          items: state.cart.map(({ id, name, quantity, price }) => ({ id, name, quantity, price })),
          total: getters.cartTotalPrice
        })
        commit('CLEAR_CART')
        commit('SET_NOTIFICATION', {
          type: 'success',
          message: `Đặt hàng thành công! Mã đơn: ${order.orderId}`
        })
        return true
      } catch (error) {
        return false
      }
    }
  }
})
