<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
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
  try {
    await formRef.value?.validate()
  } catch { return }

  loading.value = true
  try {
    const api = loginRole.value === 'merchant' ? merchantLoginApi : adminLoginApi
    const res = await api(form)
    if (res.code === 1) {
      authStore.setToken(res.data.token)
      authStore.setRole(res.data.role)
      await authStore.fetchUserInfo()
      ElMessage.success('登录成功')
      router.push('/product')
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
    <el-card class="login-card">
      <h2>HisoutenMall 管理端</h2>

      <el-radio-group v-model="loginRole" style="width: 100%; margin-bottom: 20px;">
        <el-radio-button value="merchant" style="width: 50%;">商家登录</el-radio-button>
        <el-radio-button value="admin" style="width: 50%;">管理员登录</el-radio-button>
      </el-radio-group>

      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" show-password />
        </el-form-item>
        <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, #00547d, #00aaa0, #a8eb12);
}
.login-card {
  width: 400px;
}
.login-card h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>