import { createRouter, createWebHistory } from "vue-router";

import LayoutView from '@/layout/index.vue'
import CategoryView from '@/views/category/index.vue'
import ProductView from '@/views/product/index.vue'
import LoginView from '@/views/login/index.vue'
import MerchantOrderView from '@/views/merchantOrder/index.vue'
import MerchantView from '@/views/merchant/index.vue'
import IndexView from '@/views/index/index.vue'
import BrandView from '@/views/brand/index.vue'
import UserView from '@/views/user/index.vue'
import AdminOrderView from '@/views/adminOrder/index.vue'
import ShopView from '@/views/shop/index.vue'

const router = createRouter({
    history:createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path:"/",
            name:'',
            component:LayoutView,
            redirect: '/index',
            children:[
                {path: 'index', name: 'index', component: IndexView},
                {path: 'product', name: 'product', component: ProductView},
                {path: 'category', name: 'category', component: CategoryView},
                {path: 'merchant-order',name: 'merchantOrder', component: MerchantOrderView},
                {path: 'merchant', name: 'merchant', component: MerchantView},
                {path: 'shop', name: 'shop', component: ShopView},
                {path: 'brand', name: 'brand', component: BrandView},
                {path: 'user', name: 'user', component: UserView},
                {path: 'admin-order', name: 'adminOrder', component: AdminOrderView},
            ]
        },
        {
            path:"/login",
            name:'login',
            component:LoginView
        }
    ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    if (to.path === '/login') {
        next()
    } else if (!authStore.token) {
        next('/login')
    } else {
        if (!authStore.userInfo) {
            try {
                await authStore.fetchUserInfo()
            } catch {
                await authStore.logout()
                next('/login')
                return
            }
        }
        next()
    }
})
export default router