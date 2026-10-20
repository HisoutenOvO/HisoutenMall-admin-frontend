<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps, UploadUserFile } from 'element-plus'
import request from '@/utils/request'
import type { Result } from '@/types/common'

// 这里的类型声明必须有 width 和 height
const props = defineProps<{
  modelValue?: string
  disabled?: boolean
  width?: string
  height?: string
}>()

const emit = defineEmits(['update:modelValue'])

const fileList = ref<UploadUserFile[]>(
    props.modelValue ? [{ name: 'image', url: props.modelValue }] : []
)

const imageUrl = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 动态尺寸
const uploadStyle = computed(() => ({
  width: props.width || '120px',
  height: props.height || '120px'
}))

const customUpload: UploadProps['httpRequest'] = async (options) => {
  const formData = new FormData()
  formData.append('file', options.file)

  try {
    const res = await request.post<Result<string>>('/file/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (res.code === 1) {
      imageUrl.value = res.data
      ElMessage.success('图片上传成功')
      options.onSuccess(res.data)
    } else {
      ElMessage.error(res.msg || '图片上传失败')
      options.onError(new Error('上传失败') as any)
    }
  } catch (error) {
    ElMessage.error('网络异常，上传失败')
    options.onError(error as any)
  }
}

const handleRemove: UploadProps['onRemove'] = () => {
  imageUrl.value = ''
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) ElMessage.error('只能上传图片文件!')
  if (!isLt5M) ElMessage.error('图片大小不能超过 5MB!')
  return isImage && isLt5M
}
watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        fileList.value = [{ name: 'image', url: newVal }]
      } else {
        fileList.value = []
      }
    },
    { immediate: true }
)
</script>

<template>
  <el-upload
      v-model:file-list="fileList"
      class="image-uploader"
      :show-file-list="false"
      :http-request="customUpload"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :disabled="disabled"
  >
    <img
        v-if="imageUrl"
        :src="imageUrl"
        class="uploaded-image"
        :style="uploadStyle"
    />
    <div
        v-else
        class="upload-placeholder"
        :style="uploadStyle"
    >
      <el-icon class="upload-icon"><Plus /></el-icon>
      <div class="upload-text">点击上传</div>
    </div>
  </el-upload>
</template>

<style scoped>
.image-uploader {
  display: inline-block;
}
.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}
.upload-placeholder {
  width: 100%;
  height: 100%;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
  background-color: #fafafa;
  transition: border-color 0.3s;
  cursor: pointer;
}
.upload-placeholder:hover {
  border-color: #409eff;
  color: #409eff;
}
.upload-icon {
  font-size: 20px; /* 稍微调小一点 */
  margin-bottom: 4px;
}
.upload-text {
  font-size: 12px;
  line-height: 1; /* 防止换行太高 */
}
</style>