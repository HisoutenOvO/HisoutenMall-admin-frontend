<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
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
    username.value = res.data.username
    form.shopName = res.data.shopName
    form.shopLogo = res.data.shopLogo
    form.shopDescription = res.data.shopDescription
    form.contactPhone = res.data.contactPhone
    auditStatus.value = res.data.auditStatus
    auditReason.value = res.data.auditReason
    businessLicense.value = res.data.businessLicense
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
  <div class="page">
    <el-card shadow="never" class="profile-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">店铺信息</span>
          <el-tag v-if="auditStatus === 1" type="success" effect="light">已认证</el-tag>
          <el-tag v-else-if="auditStatus === 0" type="warning" effect="light">审核中</el-tag>
          <el-tag v-else type="danger" effect="light">已驳回</el-tag>
        </div>
      </template>

      <!-- 审核状态提示 -->
      <el-alert
          v-if="auditStatus === 0"
          title="店铺审核中，请耐心等待"
          type="warning"
          :closable="false"
          show-icon
          class="audit-alert"
      />
      <el-alert
          v-else-if="auditStatus === 2"
          :title="'审核驳回：' + auditReason"
          type="error"
          :closable="false"
          show-icon
          class="audit-alert"
      />

      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <!-- 第一行：登录账号 + 联系电话 -->
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="登录账号">
              <span class="readonly-text">  {{ username || '-' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：店铺名称 -->
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="店铺名称" prop="shopName">
              <el-input v-model="form.shopName" placeholder="请输入店铺名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照">
              <div class="license-wrap">
                <el-image
                    v-if="businessLicense"
                    :src="businessLicense"
                    style="width: 60px; height: 60px; border-radius: 4px"
                    fit="cover"
                >
                  <template #error>
                    <div class="img-error">暂无图片</div>
                  </template>
                </el-image>
                <span v-else class="img-empty">未上传</span>
                <span class="license-tip">由平台审核，不可修改</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 店铺 Logo -->
        <el-form-item label="店铺Logo">
          <div class="logo-wrap">
            <el-upload
                class="logo-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
            >
              <el-image
                  v-if="form.shopLogo"
                  :src="form.shopLogo"
                  class="logo-img"
                  fit="cover"
              >
                <template #error>
                  <div class="logo-placeholder"><el-icon><Plus /></el-icon></div>
                </template>
              </el-image>
              <div v-else class="logo-placeholder">
                <el-icon><Plus /></el-icon>
              </div>
            </el-upload>
            <div class="logo-tip">
              <div>建议尺寸 200×200</div>
              <div>阶段三接入 MinIO 后支持上传</div>
            </div>
          </div>
        </el-form-item>

        <!-- 店铺简介 -->
        <el-form-item label="店铺简介">
          <el-input
              v-model="form.shopDescription"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="介绍一下你的店铺吧"
          />
        </el-form-item>

        <!-- 操作 -->
        <el-form-item>
          <div class="form-actions">
            <el-button type="primary" :loading="loading" @click="save">保存</el-button>
            <el-button @click="load">重置</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.page {
  padding: 20px;
}

.profile-card {
  max-width: 960px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.audit-alert {
  margin-bottom: 20px;
}

/* 营业执照 */
.license-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.license-tip {
  color: #909399;
  font-size: 12px;
}

.img-error,
.img-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  width: 60px;
  height: 60px;
}

/* Logo 上传框 */
.logo-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}

.logo-uploader:hover {
  border-color: #409eff;
}

.logo-img {
  width: 100px;
  height: 100px;
  display: block;
}

.logo-placeholder {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  font-size: 24px;
}

.logo-tip {
  color: #909399;
  font-size: 12px;
  line-height: 20px;
}

.form-actions {
  display: flex;
  gap: 12px;
}
</style>