import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import { setupInterceptors } from './services/api'
import './style.css'

// Gắn Interceptor sau khi store đã sẵn sàng (tránh phụ thuộc vòng giữa api.js và store)
setupInterceptors(store)

createApp(App).use(store).use(router).mount('#app')
