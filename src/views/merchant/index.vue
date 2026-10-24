<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import ImageUpload from '@/components/ImageUpload.vue'
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
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 左侧：店铺形象预览卡片 -->
      <el-col :span="8">
        <el-card shadow="never" class="preview-card">
          <div class="shop-preview">
            <el-avatar :size="100" :src="form.shopLogo" shape="square" class="shop-logo-preview">
              <el-icon :size="40"><Shop /></el-icon>
            </el-avatar>
            <h3 class="shop-name-preview">{{ form.shopName || '未命名店铺' }}</h3>
            <div class="shop-status">
              <el-tag v-if="auditStatus === 1" type="success" effect="light" round>已认证</el-tag>
              <el-tag v-else-if="auditStatus === 0" type="warning" effect="light" round>审核中</el-tag>
              <el-tag v-else type="danger" effect="light" round>已驳回</el-tag>
            </div>
            <p class="shop-desc-preview">{{ form.shopDescription || '这个老板很懒，还没有写简介~' }}</p>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：表单配置卡片 -->
      <el-col :span="16">
        <el-card shadow="never" class="form-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">店铺信息配置</span>
            </div>
          </template>

          <!-- 顶部全局提示 -->
          <el-alert
              v-if="auditStatus === 0"
              title="店铺正在审核中，部分功能可能受限，请耐心等待。"
              type="warning" :closable="false" show-icon class="audit-alert"
          />
          <el-alert
              v-else-if="auditStatus === 2"
              :title="'审核驳回原因：' + auditReason"
              type="error" :closable="false" show-icon class="audit-alert"
          />

          <el-form :model="form" :rules="rules" ref="formRef" label-position="top">

            <!-- 区块一：基础信息 -->
            <div class="form-section">
              <div class="section-title">基础信息</div>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="登录账号">
                    <el-input v-model="username" disabled placeholder="系统分配账号" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="店铺名称" prop="shopName">
                    <el-input v-model="form.shopName" placeholder="请输入店铺名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系电话" prop="contactPhone">
                    <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="营业执照">
                    <div class="license-wrap">
                      <el-image
                          v-if="businessLicense" :src="businessLicense"
                          style="width: 40px; height: 40px; border-radius: 4px" fit="cover"
                          :preview-src-list="[businessLicense]"
                      >
                        <template #error><div class="img-error">图</div></template>
                      </el-image>
                      <span v-else class="img-empty">未上传</span>
                      <span class="license-tip">由平台审核，不可修改</span>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 区块二：店铺形象 -->
            <div class="form-section">
              <div class="section-title">店铺形象</div>
              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="店铺 Logo">
                    <div class="logo-upload-wrap">
                      <ImageUpload v-model="form.shopLogo" width="120px" height="120px" />
                      <div class="logo-tip">
                        <p>建议尺寸：200x200px</p>
                        <p>支持 jpg、png 格式，大小不超过 2MB</p>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="店铺简介">
                    <el-input
                        v-model="form.shopDescription"
                        type="textarea"
                        :rows="4"
                        maxlength="200"
                        show-word-limit
                        placeholder="介绍一下你的店铺特色、主营业务等..."
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 操作按钮区 -->
            <div class="form-actions-bar">
              <el-button type="primary" size="large" :loading="loading" @click="save">保存修改</el-button>
              <el-button size="large" @click="load">重置表单</el-button>
            </div>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.app-container {
  padding: 0;
}

/* ============ 左侧预览区 ============ */
.preview-card {
  border-radius: 8px;
  border: none;
  height: 100%;
  min-height: 400px;
}
.shop-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  text-align: center;
}
.shop-logo-preview {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #f5f7fa;
  border: 1px solid #ebeef5;
  margin-bottom: 20px;
}
.shop-name-preview {
  font-size: 20px;
  color: #303133;
  font-weight: 600;
  margin: 0 0 10px 0;
}
.shop-status {
  margin-bottom: 20px;
}
.shop-desc-preview {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
  border: 1px dashed #e4e7ed;
}

/* ============ 右侧表单区 ============ */
.form-card {
  border-radius: 8px;
  border: none;
}
.card-header {
  display: flex;
  align-items: center;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.audit-alert {
  margin-bottom: 24px;
  border-radius: 6px;
}

/* 表单分块 */
.form-section {
  margin-bottom: 30px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #e1251b;
  line-height: 1;
}

/* 营业执照展示 */
.license-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.license-tip {
  color: #909399;
  font-size: 12px;
}
.img-error, .img-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  width: 40px;
  height: 40px;
}

/* Logo 上传区 */
.logo-upload-wrap {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.logo-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.8;
  margin-top: 5px;
}
.logo-tip p {
  margin: 0;
}

/* 底部按钮 */
.form-actions-bar {
  display: flex;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 10px;
}
</style>