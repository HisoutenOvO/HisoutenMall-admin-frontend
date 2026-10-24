<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import {useRouter} from 'vue-router'
import { ElMessage } from "element-plus";
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { updatePasswordApi } from '@/api/auth'

const pwdDialogVisible = ref(false)
const pwdFormRef = ref<FormInstance>()
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== pwdForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const openPwdDialog = () => {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdDialogVisible.value = true
}

const submitPwd = async () => {
  try {
    await pwdFormRef.value?.validate()
  } catch { return }
  const res = await updatePasswordApi({
    oldPwd: pwdForm.oldPassword,
    newPwd: pwdForm.newPassword
  })
  if (res.code === 1) {
    ElMessage.success('密码修改成功，请重新登录')
    pwdDialogVisible.value = false
    await authStore.logout()
    router.push('/login')
  } else {
    ElMessage.error(res.msg)
  }
}

const menuList = computed(() => {
  const role = authStore.userInfo?.role
  if (role === 3) {
    // 管理员端菜单
    return [
      { path: '/index', title: '首页', icon: 'HomeFilled' },
      { path: '/category', title: '分类管理', icon: 'Clock' },
      { path: '/brand', title: '品牌管理', icon: 'Star' },
      { path: '/admin-product', title: '商品管理', icon: 'Setting' },
      { path: '/admin-order', title: '订单管理', icon: 'Document' },
      { path: '/admin-merchant', title: '商家管理', icon: 'Shop' },
      { path: '/user', title: '用户管理', icon: 'User' },
      { path: '/admin-coupon', title: '优惠券管理', icon: 'Ticket' },
      { path: '/admin-review', title: '评论管理', icon: 'ChatDotSquare' },
      { path: '/admin-seckill', title: '秒杀管理', icon: 'Timer' }
    ]
  }
  if (role === 2) {
    // 商家端菜单
    return [
      { path: '/index', title: '首页', icon: 'HomeFilled' },
      { path: '/merchant', title: '店铺信息', icon: 'Shop' },
      { path: '/merchant-product', title: '商品管理', icon: 'Setting' },
      { path: '/merchant-order', title: '订单管理', icon: 'Document' },
      { path: '/merchant-coupon', title: '优惠券管理', icon: 'Ticket' },
      { path: '/merchant-seckill', title: '秒杀活动管理', icon: 'Timer'},
      { path: '/merchant-review',title: '评论管理', icon: 'ChatDotSquare' },
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
    <el-container class="app-wrapper">
      <!-- 侧边栏：改为深邃的暗色系 -->
      <el-aside width="220px" class="sidebar-container">
        <div class="logo">
          <span class="logo-icon">H</span>
          <span class="logo-text">Hisouten Mall</span>
        </div>
        <el-menu
            :router="true"
            :default-active="$route.path"
            background-color="#001529"
            text-color="rgba(255,255,255,0.65)"
            active-text-color="#ffffff"
        >
          <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶栏：纯白极简，带一点点呼吸感阴影 -->
        <el-header class="header">
          <div class="header-left">
            <!-- 可以放面包屑或折叠按钮 -->
          </div>
          <div class="header-right">
            <a class="action-item" href="javascript:void(0)" @click="openPwdDialog">
              <el-icon><EditPen /></el-icon> 修改密码
            </a>
            <el-divider direction="vertical" />
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="30" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                <span class="username">{{ displayName }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区：浅灰底色，让纯白卡片凸显出来 -->
        <el-main class="main-container">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
    <!-- 修改密码弹窗 -->
    <el-dialog v-model="pwdDialogVisible" title="修改密码" width="400px">
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="80px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPwd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 整体撑满屏幕 */
.app-wrapper {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar-container {
  background-color: #001529;
  transition: width 0.28s;
  display: flex;
  flex-direction: column;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  background: #002140;
}
.logo-icon {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: #e1251b;
  border-radius: 6px;
  margin-right: 10px;
  font-size: 18px;
}
/* 覆盖 el-menu 的默认右边框 */
.el-menu {
  border-right: none;
  flex: 1;
}
.el-menu-item {
  margin: 4px 8px;
  border-radius: 6px;
}
.el-menu-item.is-active {
  background-color: #e1251b !important; /* 京东红高亮 */
}
.el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

/* 顶栏 */
.header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 9;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
.action-item {
  color: #606266;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s;
}
.action-item:hover {
  color: #e1251b;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.username {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* 内容区 */
.main-container {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

/* 页面切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>