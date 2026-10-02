import { createRouter, createWebHashHistory } from 'vue-router'
import MenuView from '../views/MenuView.vue'
import AdminOrdersView from '../views/AdminOrdersView.vue'

/** Hash history (/#/admin) để chạy được mà không cần cấu hình server */
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'menu', component: MenuView },
    { path: '/admin', name: 'admin', component: AdminOrdersView }
  ],
  scrollBehavior: () => ({ top: 0 })
})
