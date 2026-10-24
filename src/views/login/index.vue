<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { merchantLoginApi, adminLoginApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const loginRole = ref<'merchant' | 'admin'>('merchant')

const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try { await formRef.value?.validate() } catch { return }

  loading.value = true
  try {
    const api = loginRole.value === 'merchant' ? merchantLoginApi : adminLoginApi
    const res = await api(form)
    if (res.code === 1) {
      authStore.setToken(res.data.token)
      authStore.setRole(res.data.role)
      await authStore.fetchUserInfo()
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(res.msg)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo-icon">H</div>
        <h2>HisoutenMall 管理端</h2>
      </div>

      <el-radio-group v-model="loginRole" class="role-switch">
        <el-radio-button value="merchant" class="role-btn">商家登录</el-radio-button>
        <el-radio-button value="admin" class="role-btn">管理员登录</el-radio-button>
      </el-radio-group>

      <el-form :model="form" :rules="rules" ref="formRef" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
/* 还原你原本的绿黄渐变背景 */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, #00547d, #00aaa0, #a8eb12);
}

/* 优化卡片：纯白底色 + 悬浮阴影 */
.login-box {
  width: 420px;
  background: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: #e1251b; /* 京东红 Logo */
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  line-height: 48px;
  text-align: center;
  border-radius: 12px;
  margin: 0 auto 15px;
}

.login-header h2 {
  margin: 0;
  font-size: 22px;
  color: #333;
  font-weight: 600;
}

/* 切换按钮美化 */
.role-switch {
  width: 100%;
  display: flex;
  margin-bottom: 25px;
  background: #f4f6f8;
  padding: 4px;
  border-radius: 8px;
}

.role-switch :deep(.el-radio-button__inner) {
  border: none;
  background: transparent;
  box-shadow: none !important;
  border-radius: 6px !important;
  color: #606266;
  width: 100%;
}

.role-switch :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #fff;
  color: #e1251b;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
  font-weight: bold;
}

/* 按钮美化 */
.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  background: #e1251b;
  border: none;
  transition: all 0.3s;
}

.login-btn:hover {
  background: #c91e15;
}
</style>