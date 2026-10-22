<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminReviewPageApi, getAdminReviewDetailApi, deleteAdminReviewApi } from '@/api/admin/review'
import type { AdminReviewPageQueryDTO, AdminReviewPageResultVO, AdminReviewDetailVO } from '@/types/admin/review'
import { formatSpecs } from '@/utils/format' // 引入公共方法

const searchForm = ref<AdminReviewPageQueryDTO>({
  page: 1, pageSize: 10, merchantName: '', rating: undefined
})
const list = ref<AdminReviewPageResultVO[]>([])
const total = ref(0)
const loading = ref(false)

const detailVisible = ref(false)
const currentDetail = ref<AdminReviewDetailVO | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAdminReviewPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const openDetail = async (id: number) => {
  const res = await getAdminReviewDetailApi(id)
  if (res.code === 1) {
    currentDetail.value = res.data
    detailVisible.value = true
  } else {
    ElMessage.error(res.msg)
  }
}

const handleDelete = async (row: AdminReviewPageResultVO) => {
  try {
    await ElMessageBox.confirm('确认强制删除该评价吗？删除后不可恢复。', '警告', { type: 'error' })
  } catch { return }

  const res = await deleteAdminReviewApi(row.id)
  if (res.code === 1) {
    ElMessage.success('评价已删除')
    await loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div class="container">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="商家名称">
        <el-input v-model="searchForm.merchantName" placeholder="按商家搜索" clearable />
      </el-form-item>
      <el-form-item label="评分">
        <el-select v-model="searchForm.rating" placeholder="全部" clearable style="width: 120px">
          <el-option label="5星" :value="5" />
          <el-option label="4星" :value="4" />
          <el-option label="3星" :value="3" />
          <el-option label="2星" :value="2" />
          <el-option label="1星" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchForm.page=1; loadData()">查询</el-button>
        <el-button @click="searchForm.merchantName=''; searchForm.rating=undefined; loadData()">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column label="买家" width="150" align="center">
        <template #default="{ row }">
          <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
            <el-avatar :src="row.avatar" size="small">{{ row.nickname?.charAt(0) }}</el-avatar>
            <span>{{ row.nickname }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="merchantName" label="所属商家" width="150" show-overflow-tooltip />
      <el-table-column label="评分" width="100" align="center">
        <template #default="{ row }">
          <span style="color: #ff9900; font-weight: bold;">{{ row.rating }} 星</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="评价时间" width="180" align="center" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDetail(row.id)">查看详情</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">强制删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
          v-model:current-page="searchForm.page"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
      />
    </div>

    <el-dialog v-model="detailVisible" title="评价完整详情" width="650px">
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="所属商家">{{ currentDetail.merchantName }}</el-descriptions-item>
          <el-descriptions-item label="关联订单">{{ currentDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentDetail.productName }}</el-descriptions-item>
          <el-descriptions-item label="商品规格">{{ formatSpecs(currentDetail.skuSpecs) }}</el-descriptions-item> <!-- 替换 -->
          <el-descriptions-item label="买家信息">
            <div style="display: flex; align-items: center; gap: 5px;">
              <el-avatar :src="currentDetail.avatar" size="small">{{ currentDetail.nickname?.charAt(0) }}</el-avatar>
              <span>{{ currentDetail.nickname }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="评价时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="评分" :span="2">
            <el-rate v-model="currentDetail.rating" disabled show-score text-color="#ff9900" />
          </el-descriptions-item>
          <el-descriptions-item label="评价内容" :span="2">
            <div style="line-height: 1.6; white-space: pre-wrap;">{{ currentDetail.content || '此用户未填写评价内容' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="评价图片" :span="2" v-if="currentDetail.images && currentDetail.images.length > 0">
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <el-image
                  v-for="(img, index) in currentDetail.images"
                  :key="index"
                  :src="img"
                  style="width: 80px; height: 80px; border-radius: 4px; cursor: pointer;"
                  :preview-src-list="currentDetail.images"
                  :initial-index="index"
                  fit="cover"
              />
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.container { padding: 20px; background: #fff; min-height: calc(100vh - 60px); }
.search-form { margin-bottom: 20px; padding: 15px 15px 0; background: #f8f9fa; border-radius: 6px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; padding-bottom: 20px; }
</style>