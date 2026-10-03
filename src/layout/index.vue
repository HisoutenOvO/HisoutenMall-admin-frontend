<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import { ElMessage } from "element-plus";
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const userStore = useAuthStore()

const menuList = computed(() => {
  const role = userStore.userInfo?.role
  if (role === 3) {
    return [
      { path: '/index', title: '首页', icon: 'HomeFilled' },
      { path: '/category', title: '分类管理', icon: 'Clock' },
      { path: '/brand', title: '品牌管理', icon: 'Star' },
      { path: '/user', title: '用户管理', icon: 'User' },
      { path: '/merchant', title: '商家管理', icon: 'Shop' },
      { path: '/order', title: '订单管理', icon: 'Document' }
    ]
  }
  if (role === 2) {
    return [
      { path: '/index', title: '首页', icon: 'HomeFilled' },
      { path: '/product', title: '商品管理', icon: 'Setting' },
      { path: '/merchant-order', title: '订单管理', icon: 'Document' },
      { path: '/merchant', title: '店铺信息', icon: 'Shop' }
    ]
  }
  return []
})

const displayName = computed(() => {
  const info = authStore.userInfo
  if (!info) return ''
  if (info.role === 2) return info.shopName || info.username
  if (info.role === 3) return info.realName || info.username
  return info.username
})

const username = ref(localStorage.getItem('username') || '')
const router = useRouter()

const authStore = useAuthStore()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
  ElMessage.success('您已退出登录！')
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <!-- Header 区域 -->
      <el-header class="header">
        <span class="title">HisoutenMall后台管理系统</span>
        <span class="right_tool">
          <a href="">
            <el-icon><EditPen /></el-icon> 修改密码 &nbsp;&nbsp;&nbsp; |  &nbsp;&nbsp;&nbsp;
          </a>
          <a href="javascript:void(0)" @click="logout">
            <el-icon><SwitchButton /></el-icon> 退出登录 【{{displayName}}】
          </a>
        </span>
      </el-header>

      <el-container>
        <!-- 左侧菜单 -->
        <el-aside width="200px" class="aside">
          <el-menu :router="true">
            <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
              <el-icon><component :is="item.icon" /></el-icon>
              {{ item.title }}
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>

    </el-container>
  </div>
</template>

<style scoped>
.header {
  background-image: linear-gradient(to right, #00547d, #007fa4, #00aaa0, #00d072, #a8eb12);
}

.title {
  color: white;
  font-size: 40px;
  font-family: 楷体;
  line-height: 60px;
  font-weight: bolder;
}

.right_tool{
  float: right;
  line-height: 60px;
}

a {
  color: white;
  text-decoration: none;
}

.aside {
  width: 220px;
  border-right: 1px solid #ccc;
  height: 730px;
}
</style>
