<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getMerchantProfileApi, updateMerchantProfileApi } from '@/api/merchant/merchant'
import type { MerchantProfileUpdateDTO } from '@/types/merchant/merchant'

const formRef = ref<FormInstance>()
const loading = ref(false)
const auditStatus = ref(0)
const auditReason = ref('')
const businessLicense = ref('')
const username = ref('')

const form = reactive<MerchantProfileUpdateDTO>({
  shopName: '',
  shopLogo: '',
  shopDescription: '',
  contactPhone: ''
})

const rules = {
  shopName: [{ required: true, message: '请输入店铺名', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const load = async () => {
  const res = await getMerchantProfileApi()
  if (res.code === 1) {
    form.shopName = res.data.shopName
    form.shopLogo = res.data.shopLogo
    form.shopDescription = res.data.shopDescription
    form.contactPhone = res.data.contactPhone
    auditStatus.value = res.data.auditStatus
    auditReason.value = res.data.auditReason
    businessLicense.value = res.data.businessLicense
    username.value = res.data.username
  }
}

const save = async () => {
  try {
    await formRef.value?.validate()
  } catch { return }
  loading.value = true
  try {
    const res = await updateMerchantProfileApi(form)
    if (res.code === 1) {
      ElMessage.success('保存成功')
      load()
    } else {
      ElMessage.error(res.msg)
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <h1>店铺信息</h1>
  <div class="container">
    <el-card style="max-width: 700px">
      <!-- 审核状态 -->
      <el-alert
          v-if="auditStatus === 0"
          title="店铺审核中，请耐心等待"
          type="warning"
          :closable="false"
          style="margin-bottom: 20px"
      />
      <el-alert
          v-else-if="auditStatus === 2"
          :title="'审核驳回：' + auditReason"
          type="error"
          :closable="false"
          style="margin-bottom: 20px"
      />

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="登录账号">
          <el-input :value="username" disabled />
        </el-form-item>
        <el-form-item label="营业执照">
          <el-image
              v-if="businessLicense"
              :src="businessLicense"
              style="width: 150px"
              fit="cover"
          />
          <span v-else style="color: #999">未上传</span>
        </el-form-item>
        <el-form-item label="店铺名称" prop="shopName">
          <el-input v-model="form.shopName" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="店铺Logo">
          <el-input v-model="form.shopLogo" placeholder="请输入 Logo URL" />
          <el-image
              v-if="form.shopLogo"
              :src="form.shopLogo"
              style="width: 80px; height: 80px; margin-top: 8px"
              fit="cover"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="店铺简介">
          <el-input
              v-model="form.shopDescription"
              type="textarea"
              :rows="4"
              placeholder="请输入店铺简介"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="save">保存</el-button>
          <el-button @click="load">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.container {
  margin: 20px 0;
}
</style>