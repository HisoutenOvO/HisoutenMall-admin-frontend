<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  updateSkuApi,
  deleteSkuApi,
  recoverySkuApi,
  physicalDeleteSkuApi,
  updateSkuStatusApi, listSkuApi
} from '@/api/merchant/productSku'
import type { MerchantProductSkuVO } from '@/types/merchant/product'

const props = defineProps<{
  modelValue: boolean
  productId: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'refresh': []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const skuList = ref<MerchantProductSkuVO[]>([])
const activeTab = ref<'normal' | 'deleted'>('normal')

const normalList = computed(() => skuList.value.filter(s => s.deleted === 0))
const deletedList = computed(() => skuList.value.filter(s => s.deleted === 1))
const loadSkuList = async () => {
  if (!props.productId) return
  const res = await listSkuApi(props.productId)
  if (res.code === 1) {
    skuList.value = res.data || []
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    activeTab.value = 'normal'
    loadSkuList()
  }
})

const handleUpdate = async (row: MerchantProductSkuVO) => {
  const res = await updateSkuApi(row.id, {
    specs: row.specs,
    price: row.price,
    stock: row.stock,
    image: row.image,
  })
  if (res.code === 1) {
    ElMessage.success('保存成功')
    emit('refresh')
  } else {
    ElMessage.error(res.msg)
    loadSkuList()
  }
}

const handleDelete = async (row: MerchantProductSkuVO) => {
  try {
    await ElMessageBox.confirm('确认删除该 SKU？', '提示', { type: 'warning' })
  } catch { return }
  const res = await deleteSkuApi(row.id)
  if (res.code === 1) {
    ElMessage.success('已删除')
    loadSkuList(); emit('refresh')
  } else ElMessage.error(res.msg)
}

const handleRecovery = async (row: MerchantProductSkuVO) => {
  try {
    await ElMessageBox.confirm('确认恢复该 SKU？', '提示', { type: 'warning' })
  } catch { return }
  const res = await recoverySkuApi(row.id)
  if (res.code === 1) {
    ElMessage.success('已恢复')
    loadSkuList(); emit('refresh')
  } else ElMessage.error(res.msg)
}

const handlePhysicalDelete = async (row: MerchantProductSkuVO) => {
  try {
    await ElMessageBox.confirm('彻底删除后无法恢复，确认删除？', '警告', { type: 'error' })
  } catch { return }
  const res = await physicalDeleteSkuApi(row.id)
  if (res.code === 1) {
    ElMessage.success('已彻底删除')
    loadSkuList(); emit('refresh')
  } else ElMessage.error(res.msg)
}
// 状态切换：单独方法
const handleStatusChange = async (row: { id: number; status: number }) => {
  const res = await updateSkuStatusApi(row.id, row.status)
  if(res.code === 1) {
    ElMessage.success("修改成功！")
  }
  if (res.code !== 1) {
    ElMessage.error(res.msg)
    loadSkuList()   // 失败要回滚 UI
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="SKU 管理" width="900" append-to-body>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="正常 SKU" name="normal">
        <el-table :data="normalList" border>
          <el-table-column label="规格" min-width="140">
            <template #default="{ row }">
              <el-input v-model="row.specs" @blur="handleUpdate(row)" />
            </template>
          </el-table-column>
          <el-table-column label="价格" width="130">
            <template #default="{ row }">
              <el-input v-model.number="row.price" type="number" @blur="handleUpdate(row)" />
            </template>
          </el-table-column>
          <el-table-column label="库存" width="110">
            <template #default="{ row }">
              <el-input v-model.number="row.stock" type="number" @blur="handleUpdate(row)" />
            </template>
          </el-table-column>
          <el-table-column label="图片" min-width="160">
            <template #default="{ row }">
              <el-input v-model="row.image" @blur="handleUpdate(row)" />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="已删除 SKU" name="deleted">
        <el-table :data="deletedList" border>
          <el-table-column prop="specs" label="规格" min-width="140" />
          <el-table-column prop="price" label="价格" width="130" />
          <el-table-column prop="stock" label="库存" width="110" />
          <el-table-column prop="image" label="图片" min-width="160" />
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button type="success" size="small" @click="handleRecovery(row)">恢复</el-button>
              <el-button type="danger" size="small" @click="handlePhysicalDelete(row)">彻底删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>