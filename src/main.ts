import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 检查登录状态
const token = localStorage.getItem('token')
if (!token) {
  // 如果没有 token，重定向到登录页
  router.push('/login')
}

app.use(router)
app.use(ElementPlus)
app.mount('#app')