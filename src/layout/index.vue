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
      { path: '/merchant-seckill', title: '秒杀活动管理', icon: 'Timer'}
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
    <el-container class="layout-container">
      <!-- Header 区域 -->
      <el-header class="header">
        <span class="title">HisoutenMall后台管理系统</span>
        <span class="right_tool">
          <a href="">
            <a href="javascript:void(0)" @click="openPwdDialog">
              <el-icon><EditPen /></el-icon> 修改密码 &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
            </a>
          </a>
          <a href="javascript:void(0)" @click="logout">
            <el-icon><SwitchButton /></el-icon> 退出登录 【{{displayName}}】
          </a>
        </span>
      </el-header>
      <el-dialog v-model="pwdDialogVisible" title="修改密码" width="400">
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

      <el-container class="inner-container">
        <!-- 左侧菜单 -->
        <el-aside width="200px" class="aside" >
          <el-menu :router="true">
            <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
              <el-icon><component :is="item.icon" /></el-icon>
              {{ item.title }}
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-main class="main-container">
          <router-view></router-view>
        </el-main>
      </el-container>

    </el-container>
  </div>
</template>

<style scoped>
/* 最外层：占满全屏，纵向排列 */
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.header {
  background-image: linear-gradient(to right, #00547d, #007fa4, #00aaa0, #00d072, #a8eb12);
  flex-shrink: 0; /* 保证 header 高度不被压缩 */
}

.title {
  color: white;
  font-size: 40px;
  font-family: 楷体;
  line-height: 60px;
  font-weight: bolder;
}

.right_tool {
  float: right;
  line-height: 60px;
}

a {
  color: white;
  text-decoration: none;
}

/* 内层容器：占满剩下的高度，横向排列 */
.inner-container {
  height: calc(100vh - 60px); /* 减去 Header 的高度 */
  overflow: hidden;
}

/* 左侧菜单 */
.aside {
  width: 220px;
  border-right: 1px solid #ccc;
  height: 100%;
  background-color: #fff;
  overflow-y: auto;
}

/* 右侧主内容区：独立滚动 */
.main-content {
  background-color: #f4f4f4;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}
</style>
