<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 严格分开导入 API
import {
  getAdminSeckillPageApi,
  getAdminSeckillDetailApi
} from '@/api/admin/seckill'

// 严格分开导入 Types
import type {
  AdminSeckillPageQueryDTO,
  AdminSeckillPageResultVO,
  AdminSeckillDetailVO
} from '@/types/admin/seckill'

const searchForm = ref<AdminSeckillPageQueryDTO>({
  page: 1, pageSize: 10, keyword: '', merchantName: '', status: undefined
})
const list = ref<AdminSeckillPageResultVO[]>([])
const total = ref(0)
const loading = ref(false)

// 详情弹窗状态
const detailVisible = ref(false)
const currentDetail = ref<AdminSeckillDetailVO | null>(null)
const detailLoading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAdminSeckillPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const openDetail = async (id: number) => {
  detailLoading.value = true
  detailVisible.value = true
  try {
    const res = await getAdminSeckillDetailApi(id)
    if (res.code === 1) {
      currentDetail.value = res.data
    }
  } finally {
    detailLoading.value = false
  }
}

const formatStatus = (status: number) => {
  const map = { 0: '未开始', 1: '进行中', 2: '已结束' }
  return map[status as keyof typeof map] || '未知'
}

onMounted(loadData)
</script>

<template>
  <div class="container">
    <!-- 搜索区 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="活动名称">
        <el-input v-model="searchForm.keyword" placeholder="按活动名搜索" clearable />
      </el-form-item>
      <el-form-item label="商家名称">
        <el-input v-model="searchForm.merchantName" placeholder="按商家搜索" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="未开始" :value="0" />
          <el-option label="进行中" :value="1" />
          <el-option label="已结束" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchForm.page=1; loadData()">查询</el-button>
        <el-button @click="searchForm.keyword=''; searchForm.merchantName=''; searchForm.status=undefined; loadData()">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表区（绝对极简） -->
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="name" label="活动名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="merchantName" label="所属商家" width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'danger' : (row.status === 0 ? 'warning' : 'info')">
            {{ formatStatus(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="活动时间" width="300" align="center">
        <template #default="{ row }">
          {{ row.startTime }} 至 {{ row.endTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDetail(row.id)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 详情弹窗（严格对应你截图的 JSON 数据） -->
    <el-dialog v-model="detailVisible" title="秒杀活动详情" width="850px">
      <div v-loading="detailLoading">
        <template v-if="currentDetail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="活动名称">{{ currentDetail.name }}</el-descriptions-item>
            <el-descriptions-item label="所属商家">{{ currentDetail.merchantName }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ currentDetail.startTime }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ currentDetail.endTime }}</el-descriptions-item>
            <el-descriptions-item label="活动状态" :span="2">
              <el-tag :type="currentDetail.status === 1 ? 'danger' : 'info'">
                {{ formatStatus(currentDetail.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <h3 style="margin: 20px 0 10px 0; font-size: 16px;">包含的秒杀商品</h3>
          <el-table :data="currentDetail.products" border size="small">
            <el-table-column label="商品名称" prop="productName" min-width="150" show-overflow-tooltip />
            <el-table-column label="规格" prop="skuSpecs" width="150" show-overflow-tooltip />
            <el-table-column label="价格" width="160">
              <template #default="{ row }">
                <div style="color: #e1251b; font-weight: bold;">秒杀: ￥{{ row.seckillPrice }}</div>
                <div style="text-decoration: line-through; color: #999; font-size: 12px;">原价: ￥{{ row.originalPrice }}</div>
              </template>
            </el-table-column>
            <el-table-column label="库存" width="130" align="center">
              <template #default="{ row }">
                <div>秒杀: {{ row.seckillStock }}</div>
                <div style="color: #999; font-size: 12px;">总库存: {{ row.skuStock }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="limitPerUser" label="限购" width="80" align="center" />
          </el-table>
        </template>
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