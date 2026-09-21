import { createRouter, createWebHistory } from "vue-router";

import LayoutView from '@/layout/index.vue'
import CategoryView from '@/views/category/index.vue'
import ProductView from '@/views/product/index.vue'

const router = createRouter({
    history:createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path:"/",
            name:'',
            component:LayoutView,
            children:[
                {path: 'product', name: 'product', component: ProductView},
                {path: 'category', name: 'category', component: CategoryView},
            ]
        }
    ]
})
export default router