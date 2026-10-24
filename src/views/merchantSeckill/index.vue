<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMerchantSeckillPageApi,
  addMerchantSeckillApi,
  updateMerchantSeckillApi, // 补上修改 API
  getMerchantSeckillDetailApi,
  addSeckillProductApi,
  deleteMerchantSeckillApi,
  removeSeckillProductApi
} from '@/api/merchant/seckill'
import { getMerchantProductPageApi, getMerchantProductDetailApi } from '@/api/merchant/product'
import type { MerchantSeckillPageQueryDTO, MerchantSeckillPageResultVO, MerchantSeckillDetailVO } from '@/types/merchant/seckill'
import type { MerchantProductPageResultVO, MerchantProductDetailVO } from '@/types/merchant/product'
import { formatSpecs } from '@/utils/format'

const searchForm = ref<MerchantSeckillPageQueryDTO>({
  page: 1, pageSize: 10, keyword: '', status: undefined
})
const list = ref<MerchantSeckillPageResultVO[]>([])
const total = ref(0)
const loading = ref(false)

// === 弹窗与状态 ===
const dialogVisible = ref(false)
const isEditActivity = ref(false) // 补充定义：区分新建还是修改
const activityForm = reactive({ name: '', timeRange: [] as string[] })

const drawerVisible = ref(false)
const currentDetail = ref<MerchantSeckillDetailVO | null>(null)

const productDialogVisible = ref(false)
const currentActivityId = ref(0)

const myProducts = ref<MerchantProductPageResultVO[]>([])
const selectedProductDetail = ref<MerchantProductDetailVO | null>(null)
const productLoading = ref(false)
const selectedSkus = ref<any[]>([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMerchantSeckillPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

// 打开新增弹窗
const openAddDialog = () => {
  isEditActivity.value = false
  currentActivityId.value = 0
  activityForm.name = ''
  activityForm.timeRange = []
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditActivityDialog = (row: MerchantSeckillPageResultVO) => {
  isEditActivity.value = true
  currentActivityId.value = row.id
  activityForm.name = row.name
  activityForm.timeRange = [row.startTime, row.endTime]
  dialogVisible.value = true
}

// 提交活动（新增或修改）
const submitActivity = async () => {
  if (!activityForm.timeRange || activityForm.timeRange.length !== 2) {
    ElMessage.warning('请选择活动时间')
    return
  }

  const payload = {
    name: activityForm.name,
    startTime: activityForm.timeRange[0] as string,
    endTime: activityForm.timeRange[1] as string
  }

  let res
  if (isEditActivity.value) {
    // 调修改接口
    res = await updateMerchantSeckillApi(currentActivityId.value, payload)
  } else {
    // 调新增接口
    res = await addMerchantSeckillApi(payload)
  }

  if (res.code === 1) {
    ElMessage.success(isEditActivity.value ? '修改成功' : '创建成功')
    dialogVisible.value = false
    await loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const openDetail = async (id: number) => {
  const res = await getMerchantSeckillDetailApi(id)
  if (res.code === 1) {
    currentDetail.value = res.data
    drawerVisible.value = true
  }
}

const handleDeleteActivity = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该秒杀活动吗？', '警告', { type: 'error' })
  } catch { return }
  const res = await deleteMerchantSeckillApi(id)
  if (res.code === 1) {
    ElMessage.success('删除成功')
    await loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const handleRemoveProduct = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认移除该秒杀商品吗？', '提示', { type: 'warning' })
  } catch { return }
  const res = await removeSeckillProductApi(id)
  if (res.code === 1) {
    ElMessage.success('移除成功')
    if (currentDetail.value) await openDetail(currentDetail.value.id)
    await loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const openAddProduct = async (activityId: number) => {
  currentActivityId.value = activityId
  productDialogVisible.value = true
  selectedProductDetail.value = null
  selectedSkus.value = []
  const res = await getMerchantProductPageApi({ page: 1, pageSize: 50, status: 1, deleted: 0 })
  if (res.code === 1) {
    myProducts.value = res.data.records
  }
}

const handleProductSelect = async (product: MerchantProductPageResultVO) => {
  productLoading.value = true
  selectedSkus.value = []
  try {
    const res = await getMerchantProductDetailApi(product.id)
    if (res.code === 1) {
      selectedProductDetail.value = res.data
      selectedSkus.value = res.data.skuList.map((sku: any) => ({
        skuId: sku.id,
        specs: sku.specs,
        originalPrice: sku.price,
        maxStock: sku.stock,
        seckillPrice: 0,
        seckillStock: 0,
        limitPerUser: 1,
        checked: false
      }))
    }
  } finally {
    productLoading.value = false
  }
}

const submitAddProduct = async () => {
  const finalItems = selectedSkus.value.filter(s => s.checked)
  if (finalItems.length === 0) {
    ElMessage.warning('请至少勾选一个 SKU')
    return
  }

  for (let item of finalItems) {
    if (item.seckillPrice <= 0 || item.seckillPrice >= item.originalPrice) {
      ElMessage.warning(`规格【${formatSpecs(item.specs)}】的秒杀价必须大于0且小于原价`)
      return
    }
    if (item.seckillStock <= 0 || item.seckillStock > item.maxStock) {
      ElMessage.warning(`规格【${formatSpecs(item.specs)}】的秒杀库存必须在 1 到 ${item.maxStock} 之间`)
      return
    }
  }

  const payload = {
    activityId: currentActivityId.value,
    items: finalItems.map(item => ({
      skuId: item.skuId,
      seckillPrice: item.seckillPrice,
      seckillStock: item.seckillStock,
      limitPerUser: item.limitPerUser
    }))
  }

  const res = await addSeckillProductApi(payload)
  if (res.code === 1) {
    ElMessage.success('添加商品成功')
    productDialogVisible.value = false
    await openDetail(currentActivityId.value)
    await loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const formatStatus = (status: number) => {
  const map = { 0: '未开始', 1: '进行中', 2: '已结束' }
  return map[status as keyof typeof map] || '未知'
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div class="app-container">
    <!-- 1. 搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="活动名称">
          <el-input v-model="searchForm.keyword" placeholder="按名称搜索" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="searchForm.page=1; loadData()">查询</el-button>
          <el-button icon="Refresh" @click="searchForm.keyword = ''; loadData()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 2. 数据表格卡片 -->
    <el-card class="table-card" shadow="never">
      <div class="table-toolbar">
        <el-button type="primary" icon="Plus" @click="openAddDialog">创建秒杀活动</el-button>
      </div>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="活动名称" min-width="200">
          <template #default="{ row }">
            <span style="font-weight: 500; color: #303133;">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="productCount" label="包含商品数" width="120" align="center" />

        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag
                :type="row.status === 1 ? 'danger' : (row.status === 0 ? 'warning' : 'info')"
                effect="light" round
            >
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="活动时间" width="280" align="center">
          <template #default="{ row }">
            <div style="font-size: 13px; color: #606266;">
              {{ row.startTime }} <br>
              <span style="color: #909399; font-size: 12px;">至</span> <br>
              {{ row.endTime }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row.id)">管理商品</el-button>
            <el-button
                v-if="row.status === 0"
                type="warning" link
                @click="openEditActivityDialog(row)"
            >修改</el-button>
            <el-button
                v-if="row.status === 0 || row.status === 2"
                type="danger" link
                @click="handleDeleteActivity(row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="searchForm.page"
            v-model:page-size="searchForm.pageSize"
            :total="total"
            background
            layout="total, prev, pager, next"
            @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 弹窗：创建/修改活动 -->
    <el-dialog v-model="dialogVisible" :title="isEditActivity ? '修改秒杀活动' : '创建秒杀活动'" width="500px" class="custom-dialog">
      <el-form :model="activityForm" label-width="90px">
        <el-form-item label="活动名称">
          <el-input v-model="activityForm.name" placeholder="如：双十一限时秒杀" />
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
              v-model="activityForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitActivity">{{ isEditActivity ? '确认修改' : '确认创建' }}</el-button>
      </template>
    </el-dialog>

    <!-- 抽屉：活动详情 -->
    <el-drawer v-model="drawerVisible" title="秒杀活动详情" size="60%">
      <div v-if="currentDetail">
        <div class="drawer-header">
          <h3 class="drawer-title">活动：{{ currentDetail.name }}</h3>
          <el-button
              v-if="currentDetail.status === 0"
              type="primary"
              icon="Plus"
              @click="openAddProduct(currentDetail.id)"
          >添加秒杀商品</el-button>
        </div>

        <el-table :data="currentDetail.products" border style="margin-top: 15px; border-radius: 8px;">
          <el-table-column label="商品信息" min-width="220">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 10px;">
                <el-image :src="row.image" style="width: 40px; height: 40px; border-radius: 4px;" fit="cover" />
                <span style="font-weight: 500;">{{ row.productName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="规格" width="120">
            <template #default="{ row }">
              <span style="font-size: 12px; color: #909399;">{{ formatSpecs(row.skuSpecs) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="价格设定" width="160">
            <template #default="{ row }">
              <div style="color: #e1251b; font-weight: bold;">秒杀: ￥{{ row.seckillPrice }}</div>
              <div style="color: #999; font-size: 12px; text-decoration: line-through;">原价: ￥{{ row.originalPrice }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="seckillStock" label="秒杀库存" width="100" align="center" />
          <el-table-column label="操作" width="100" align="center" v-if="currentDetail.status === 0">
            <template #default="{ row }">
              <el-button type="danger" link @click="handleRemoveProduct(row.id)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>

    <!-- 弹窗：添加秒杀商品（左右分栏） -->
    <el-dialog v-model="productDialogVisible" title="添加秒杀商品" width="1000px" top="5vh" class="custom-dialog">
      <div class="add-product-layout">
        <div class="left-list">
          <h4 class="section-title">选择商品</h4>
          <el-table
              :data="myProducts"
              border
              height="420px"
              highlight-current-row
              @current-change="handleProductSelect"
          >
            <el-table-column prop="name" label="商品名称" show-overflow-tooltip />
            <el-table-column prop="minPrice" label="最低价" width="80" align="center" />
          </el-table>
        </div>

        <div class="right-skus">
          <h4 class="section-title">配置 SKU 秒杀信息</h4>
          <div v-if="!selectedProductDetail" class="empty-tip">
            请在左侧列表点击选择一个商品
          </div>
          <el-table
              v-else
              :data="selectedSkus"
              border
              height="420px"
              v-loading="productLoading"
          >
            <el-table-column label="选择" width="55" align="center">
              <template #default="{ row }">
                <el-checkbox v-model="row.checked" />
              </template>
            </el-table-column>
            <el-table-column label="规格" width="120" show-overflow-tooltip>
              <template #default="{ row }">{{ formatSpecs(row.specs) }}</template>
            </el-table-column>
            <el-table-column label="原价/库存" width="100">
              <template #default="{ row }">
                ￥{{ row.originalPrice }} <br>
                <span style="font-size: 12px; color: #999;">库存: {{ row.maxStock }}</span>
              </template>
            </el-table-column>
            <el-table-column label="秒杀价" width="130">
              <template #default="{ row }">
                <el-input-number
                    v-model="row.seckillPrice"
                    :precision="2" :step="1" :min="0.01" :max="row.originalPrice - 0.01"
                    size="small" style="width: 100%;" :disabled="!row.checked"
                />
              </template>
            </el-table-column>
            <el-table-column label="秒杀库存" width="120">
              <template #default="{ row }">
                <el-input-number
                    v-model="row.seckillStock"
                    :min="1" :max="row.maxStock"
                    size="small" style="width: 100%;" :disabled="!row.checked"
                />
              </template>
            </el-table-column>
            <el-table-column label="限购" width="100">
              <template #default="{ row }">
                <el-input-number
                    v-model="row.limitPerUser"
                    :min="1" size="small" style="width: 100%;" :disabled="!row.checked"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddProduct">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container { padding: 0; }
.search-card { margin-bottom: 16px; border-radius: 8px; border: none; }
.table-card { border-radius: 8px; border: none; }
.table-toolbar { margin-bottom: 16px; display: flex; justify-content: flex-start; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }

/* 弹窗与抽屉美化 */
.drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #ebeef5; padding-bottom: 15px; }
.drawer-title { font-size: 16px; font-weight: 600; color: #303133; margin: 0; }
.section-title { margin: 0 0 15px 0; font-size: 15px; font-weight: 600; color: #303133; border-left: 4px solid #e1251b; padding-left: 10px; line-height: 1; }

.add-product-layout { display: flex; gap: 20px; }
.left-list { flex: 0 0 35%; border-right: 1px solid #ebeef5; padding-right: 20px; }
.right-skus { flex: 1; }
.empty-tip { height: 420px; display: flex; justify-content: center; align-items: center; color: #909399; border: 1px dashed #dcdfe6; border-radius: 8px; background: #fafafa; }
</style>