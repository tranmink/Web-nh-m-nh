/**
 * Mixin định dạng tiền tệ theo chuẩn Việt Nam Đồng.
 * Ví dụ: formatCurrency(50000) -> "50.000 ₫"
 */
const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

export default {
  methods: {
    /**
     * @param {number|string} val Số tiền cần định dạng
     * @returns {string} Chuỗi tiền tệ VND
     */
    formatCurrency(val) {
      const amount = Number(val)
      return vndFormatter.format(Number.isFinite(amount) ? amount : 0)
    }
  }
}
