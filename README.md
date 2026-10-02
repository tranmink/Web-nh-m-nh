# Quán Nhà Mình - Thực đơn Vue 3

## Cấu trúc thư mục

```
menu-quan-an/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js        # darkMode: 'class'
├── postcss.config.js
└── src/
    ├── main.js               # Khởi tạo app, gắn interceptor
    ├── style.css             # Tailwind + màu nền sáng/tối
    ├── App.vue               # Khung trang: header, dark mode, giỏ hàng, toast, router-view
    ├── router/index.js       # / (thực đơn) và /admin (quản lý đơn)
    ├── views/
    │   ├── MenuView.vue      # Tìm kiếm, lọc, thống kê, transition-group
    │   └── AdminOrdersView.vue  # Trang admin kiểm soát đơn hàng
    ├── mixins/
    │   └── currencyMixin.js  # formatCurrency(val) -> "50.000 ₫"
    ├── services/
    │   └── api.js            # Axios instance, Interceptors, Mock Server (500-800ms)
    ├── store/
    │   └── index.js          # Vuex: cart, isLoading, notification
    └── components/
        ├── FoodCard.vue
        ├── CartDrawer.vue
        ├── CheckoutForm.vue      # Form thông tin khách hàng khi thanh toán
        ├── NotificationToast.vue
        └── LoadingSpinner.vue
```

## Cài đặt và chạy

Yêu cầu: Node.js 18 trở lên.

```bash
npm install
npm run dev       # mở http://localhost:5173
npm run build     # build production
```

## Cách kiểm tra từng yêu cầu

- **Interceptor + Spinner**: tải trang, thanh tiến trình đỏ hiện ở đầu trang trong 500-800ms.
- **Toast lỗi 4xx/5xx**: bấm "Thử gọi API lỗi 500" cuối trang.
- **Mixin tiền tệ**: giá trên thẻ món (FoodCard) và các dòng + tổng tiền trong giỏ (CartDrawer).
- **Món hết hàng**: Bánh mì thịt nướng, Sinh tố bơ có badge, bị mờ, nút bị khóa; click thẻ sẽ hiện toast cảnh báo.
- **Dark mode**: bấm biểu tượng mặt trời/mặt trăng, tải lại trang vẫn giữ lựa chọn.
- **Thanh toán**: bấm "Thanh toán" mở form họ tên, số điện thoại (kiểm tra số VN), địa chỉ, ghi chú, phương thức thanh toán. Gửi thành công thì giỏ được xóa và hiện toast.
- **Trang admin**: mở `http://localhost:5173/#/admin` để xem đơn, tìm theo mã/tên/số điện thoại, lọc theo trạng thái, đổi trạng thái hoặc xóa đơn. Đơn mock được lưu trong `localStorage` nên không mất khi tải lại trang.

## Ghi chú

- `setupInterceptors(store)` nhận store từ `main.js` để tránh import vòng giữa `api.js` và `store`.
- Ảnh món dùng emoji; đổi trường `image` thành URL ảnh thật, `FoodCard` sẽ tự hiển thị thẻ `<img>`.
- Trang admin hiện chưa có đăng nhập; khi dùng server thật cần thêm xác thực và route guard.
- Muốn dùng server thật: xóa `setupMockServer()` trong `api.js` và đổi `baseURL`.
