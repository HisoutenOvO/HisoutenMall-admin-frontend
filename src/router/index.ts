import { createRouter, createWebHistory } from "vue-router";
import LayoutView from '@/layout/index.vue'
import LoginView from '@/views/login/index.vue'
import IndexView from '@/views/index/index.vue'

// ===== 管理端 =====
import AdminProductView from '@/views/adminProduct/index.vue'
import AdminOrderView from '@/views/adminOrder/index.vue'
import AdminMerchantView from '@/views/adminMerchant/index.vue'
import CategoryView from '@/views/category/index.vue'
import BrandView from '@/views/brand/index.vue'
import CouponView from '@/views/adminCoupon/index.vue'
import UserView from '@/views/user/index.vue'
import ReviewView from '@/views/adminReview/index.vue'
import SeckillView from '@/views/adminSeckill/index.vue'

// ===== 商家端 =====
import MerchantProductView from '@/views/merchantProduct/index.vue'
import MerchantOrderView from '@/views/merchantOrder/index.vue'
import MerchantShopView from '@/views/merchant/index.vue'
import MerchantCouponView from '@/views/merchantCoupon/index.vue'
import MerchantSeckillView from '@/views/merchantSeckill/index.vue'
import MerchantReviewView from '@/views/merchantReview/index.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: 'Layout',
            component: LayoutView,
            redirect: '/index',
            children: [
                { path: 'index', name: 'index', component: IndexView },

                // ===== 管理端路由 =====
                { path: 'admin-product', name: 'adminProduct', component: AdminProductView },
                { path: 'admin-order', name: 'adminOrder', component: AdminOrderView },
                { path: 'admin-merchant', name: 'adminMerchant', component: AdminMerchantView },
                { path: 'category', name: 'category', component: CategoryView },
                { path: 'brand', name: 'brand', component: BrandView },
                { path: 'user', name: 'user', component: UserView },
                { path: 'admin-coupon', name: 'adminCoupon', component: CouponView },
                { path: 'admin-review', name: 'adminReview', component: ReviewView },
                { path: 'admin-seckill', name: 'adminSeckill', component: SeckillView },

                // ===== 商家端路由 =====
                { path: 'merchant-product', name: 'merchantProduct', component: MerchantProductView },
                { path: 'merchant-order', name: 'merchantOrder', component: MerchantOrderView },
                { path: 'merchant', name: 'merchantShop', component: MerchantShopView },
                { path: 'merchant-coupon', name: 'merchantCoupon', component: MerchantCouponView},
                { path: 'merchant-seckill', name: 'merchantSeckill', component: MerchantSeckillView},
                { path: 'merchant-review', name: 'merchantReview', component: MerchantReviewView}
            ]
        },
        {
            path: "/login",
            name: 'login',
            component: LoginView
        }
    ]
})

// 路由守卫 (保持你原来的逻辑)
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