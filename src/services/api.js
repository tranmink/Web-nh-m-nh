import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

/* ------------------------------------------------------------------ */
/* 1. AXIOS INSTANCE RIÊNG                                             */
/* ------------------------------------------------------------------ */
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

/* ------------------------------------------------------------------ */
/* 2. INTERCEPTORS                                                     */
/* ------------------------------------------------------------------ */

/** Thông báo mặc định theo mã lỗi HTTP */
const ERROR_MESSAGES = {
  400: 'Yêu cầu không hợp lệ.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  409: 'Đơn hàng có món đã hết, vui lòng kiểm tra lại giỏ hàng.',
  500: 'Máy chủ đang gặp sự cố, vui lòng thử lại sau.'
}

/**
 * Gắn Request/Response Interceptor vào apiClient.
 * Nhận store từ bên ngoài để tránh import vòng (store <-> api).
 * @param {import('vuex').Store} store
 */
export function setupInterceptors(store) {
  // Nhiều request chạy song song: chỉ tắt spinner khi request cuối cùng hoàn tất
  let pendingRequests = 0

  const finishRequest = () => {
    pendingRequests = Math.max(0, pendingRequests - 1)
    if (pendingRequests === 0) store.commit('SET_LOADING', false)
  }

  apiClient.interceptors.request.use(
    (config) => {
      pendingRequests += 1
      store.commit('SET_LOADING', true)
      return config
    },
    (error) => {
      finishRequest()
      return Promise.reject(error)
    }
  )

  apiClient.interceptors.response.use(
    (response) => {
      finishRequest()
      return response
    },
    (error) => {
      finishRequest()

      const status = error.response?.status
      if (!error.response) {
        // Mất mạng hoặc timeout
        store.commit('SET_NOTIFICATION', {
          type: 'error',
          message: 'Không thể kết nối tới máy chủ. Kiểm tra mạng và thử lại.'
        })
      } else if (status >= 400 && status < 600) {
        // Lỗi 4xx / 5xx: ưu tiên message do server trả về
        store.commit('SET_NOTIFICATION', {
          type: 'error',
          message:
            error.response.data?.message ||
            ERROR_MESSAGES[status] ||
            `Đã xảy ra lỗi (mã ${status}).`
        })
      }
      return Promise.reject(error)
    }
  )
}

/* ------------------------------------------------------------------ */
/* 3. MOCK SERVER (độ trễ ngẫu nhiên 500 - 800ms)                      */
/* ------------------------------------------------------------------ */
const MOCK_FOODS = [
  { id: 1, name: 'Cơm tấm sườn bì chả', category: 'Món chính', price: 55000, image: '🍚', isAvailable: true, description: 'Sườn nướng than, bì, chả trứng hấp và nước mắm chua ngọt.' },
  { id: 2, name: 'Phở bò tái nạm', category: 'Món chính', price: 60000, image: '🍜', isAvailable: true, description: 'Nước dùng hầm xương 12 giờ, bánh phở mềm, thịt bò tái và nạm.' },
  { id: 3, name: 'Bún chả Hà Nội', category: 'Món chính', price: 58000, image: '🍲', isAvailable: true, description: 'Chả viên và chả miếng nướng than hoa, ăn kèm bún và rau sống.' },
  { id: 4, name: 'Bánh mì thịt nướng', category: 'Món chính', price: 30000, image: '🥖', isAvailable: false, description: 'Bánh mì giòn, thịt nướng sả, đồ chua và pate nhà làm.' },
  { id: 5, name: 'Gỏi cuốn tôm thịt', category: 'Khai vị', price: 40000, image: '🥗', isAvailable: true, description: 'Tôm, thịt luộc, bún và rau thơm cuốn bánh tráng, chấm tương đậu phộng.' },
  { id: 6, name: 'Chả giò rế', category: 'Khai vị', price: 45000, image: '🍤', isAvailable: true, description: 'Vỏ rế giòn rụm, nhân thịt heo, nấm mèo và miến.' },
  { id: 7, name: 'Nem chua rán', category: 'Khai vị', price: 35000, image: '🍢', isAvailable: true, description: 'Nem chua chiên giòn, chấm tương ớt.' },
  { id: 8, name: 'Trà tắc', category: 'Đồ uống', price: 20000, image: '🍋', isAvailable: true, description: 'Trà đen pha tắc tươi, ít đường, uống lạnh.' },
  { id: 9, name: 'Cà phê sữa đá', category: 'Đồ uống', price: 25000, image: '☕', isAvailable: true, description: 'Cà phê phin đậm vị, sữa đặc và đá viên.' },
  { id: 10, name: 'Sinh tố bơ', category: 'Đồ uống', price: 35000, image: '🥑', isAvailable: false, description: 'Bơ sáp xay mịn với sữa đặc.' },
  { id: 11, name: 'Chè ba màu', category: 'Tráng miệng', price: 28000, image: '🍧', isAvailable: true, description: 'Đậu đỏ, đậu xanh, thạch lá dứa và nước cốt dừa.' }
]

/** Trả về response giả sau khoảng trễ ngẫu nhiên 500 - 800ms */
function respondWithDelay(status, data) {
  const delay = 500 + Math.random() * 300
  return new Promise((resolve) => setTimeout(() => resolve([status, data]), delay))
}

const ORDERS_STORAGE_KEY = 'mock-orders'

/** Đọc danh sách đơn đã lưu (giữ dữ liệu khi tải lại trang) */
function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || []
  } catch (error) {
    return []
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
}

/** Trạng thái đơn hợp lệ */
const ORDER_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']

function setupMockServer() {
  const mock = new MockAdapter(apiClient)
  let orders = loadOrders()

  // GET /api/foods -> danh sách món
  mock.onGet('/foods').reply(() => respondWithDelay(200, MOCK_FOODS))

  // POST /api/orders -> tạo đơn kèm thông tin khách; từ chối nếu có món đã hết (409)
  mock.onPost('/orders').reply((config) => {
    const { items = [], customer, total } = JSON.parse(config.data)
    if (!customer?.name || !customer?.phone || !customer?.address) {
      return respondWithDelay(400, { message: 'Thiếu thông tin khách hàng.' })
    }
    const hasUnavailable = items.some((item) => {
      const food = MOCK_FOODS.find((f) => f.id === item.id)
      return !food || !food.isAvailable
    })
    if (hasUnavailable) return respondWithDelay(409, {})

    const order = {
      orderId: `DH${Date.now().toString().slice(-6)}`,
      customer,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    orders = [order, ...orders]
    saveOrders(orders)
    return respondWithDelay(201, { orderId: order.orderId })
  })

  // GET /api/orders -> toàn bộ đơn (dùng cho trang admin)
  mock.onGet('/orders').reply(() => respondWithDelay(200, orders))

  // PATCH /api/orders/:id -> cập nhật trạng thái đơn
  mock.onPatch(/\/orders\/.+/).reply((config) => {
    const orderId = config.url.split('/').pop()
    const { status } = JSON.parse(config.data)
    const order = orders.find((o) => o.orderId === orderId)
    if (!order) return respondWithDelay(404, { message: 'Không tìm thấy đơn hàng.' })
    if (!ORDER_STATUSES.includes(status)) return respondWithDelay(400, { message: 'Trạng thái không hợp lệ.' })
    order.status = status
    saveOrders(orders)
    return respondWithDelay(200, order)
  })

  // DELETE /api/orders/:id -> xóa đơn
  mock.onDelete(/\/orders\/.+/).reply((config) => {
    const orderId = config.url.split('/').pop()
    if (!orders.some((o) => o.orderId === orderId)) {
      return respondWithDelay(404, { message: 'Không tìm thấy đơn hàng.' })
    }
    orders = orders.filter((o) => o.orderId !== orderId)
    saveOrders(orders)
    return respondWithDelay(200, {})
  })

  // GET /api/health-check -> luôn lỗi 500 để kiểm tra Interceptor
  mock.onGet('/health-check').reply(() => respondWithDelay(500, {}))
}

setupMockServer()

/* ------------------------------------------------------------------ */
/* 4. HÀM GỌI API                                                      */
/* ------------------------------------------------------------------ */
export const fetchFoods = () => apiClient.get('/foods').then((res) => res.data)
export const createOrder = (payload) => apiClient.post('/orders', payload).then((res) => res.data)
export const fetchOrders = () => apiClient.get('/orders').then((res) => res.data)
export const updateOrderStatus = (orderId, status) =>
  apiClient.patch(`/orders/${orderId}`, { status }).then((res) => res.data)
export const deleteOrder = (orderId) => apiClient.delete(`/orders/${orderId}`)
export const triggerServerError = () => apiClient.get('/health-check')
