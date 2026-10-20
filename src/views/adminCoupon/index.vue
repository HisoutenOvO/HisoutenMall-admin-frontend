<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAdminCouponPageApi, getAdminCouponDetailApi } from '@/api/admin/coupon'
import type {
  AdminCouponPageQueryDTO,
  AdminCouponPageResultVO,
  AdminCouponDetailVO
} from '@/types/admin/coupon'

const searchForm = ref<AdminCouponPageQueryDTO>({
  page: 1, pageSize: 10, keyword: '', merchantName: '', status: undefined, type: undefined
})
const list = ref<AdminCouponPageResultVO[]>([])
const total = ref(0)
const loading = ref(false)

// 详情弹窗
const dialogVisible = ref(false)
const currentDetail = ref<AdminCouponDetailVO | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAdminCouponPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const openDetail = async (id: number) => {
  const res = await getAdminCouponDetailApi(id)
  if (res.code === 1) {
    currentDetail.value = res.data
    dialogVisible.value = true
  }
}

const formatType = (type: number) => type === 1 ? '满减' : '折扣'
const formatValue = (row: any) => {
  return row.type === 1 ? `减 ￥${row.value}` : `${row.value * 10} 折`
}
const formatStatus = (status: number) => {
  const map = { 0: '未开始', 1: '进行中', 2: '已结束' }
  return map[status as keyof typeof map] || '未知'
}
const getStatusType = (status: number) => {
  const map = { 0: 'warning', 1: 'success', 2: 'info' }
  return map[status as keyof typeof map] || 'info'
}

onMounted(loadData)
</script>

<template>
  <div class="container">
    <!-- 搜索区 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="券名称">
        <el-input v-model="searchForm.keyword" placeholder="按名称搜索" clearable />
      </el-form-item>
      <el-form-item label="商家名称">
        <el-input v-model="searchForm.merchantName" placeholder="按商家搜索" clearable />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 120px">
          <el-option label="满减券" :value="1" />
          <el-option label="折扣券" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchForm.page=1; loadData()">查询</el-button>
        <el-button @click="searchForm.keyword=''; searchForm.merchantName=''; searchForm.type=undefined; loadData()">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区：精简字段 -->
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="name" label="优惠券名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="merchantName" label="所属商家" min-width="180" show-overflow-tooltip />

      <el-table-column label="面额" width="160" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.type === 1 ? 'danger' : 'warning'" style="margin-right: 5px">
            {{ formatType(row.type) }}
          </el-tag>
          <span style="font-weight: bold; color: #e1251b;">{{ formatValue(row) }}</span>
        </template>
      </el-table-column>

      <!-- 库存和领取合并 -->
      <el-table-column label="库存(剩余量/总量)" width="180" align="center">
        <template #default="{ row }">
          <span :style="{ color: row.remain === 0 ? '#f56c6c' : '' }">{{ row.remain }}</span> / {{ row.total }}
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ formatStatus(row.status) }}</el-tag>
        </template>
      </el-table-column>

      <!-- 只保留详情按钮，详情里看有效期和创建时间 -->
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDetail(row.id)">查看详情</el-button>
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

    <!-- 详情弹窗：展示所有隐藏的字段 -->
    <el-dialog v-model="dialogVisible" title="优惠券详情" width="550px">
      <el-descriptions v-if="currentDetail" :column="1" border>
        <el-descriptions-item label="券名称">{{ currentDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="所属商家">{{ currentDetail.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="面额/门槛">
          {{ formatValue(currentDetail) }}，满 {{ currentDetail.minAmount }} 元可用
        </el-descriptions-item>
        <el-descriptions-item label="发放情况">
          总量 {{ currentDetail.total }} 张，剩余 {{ currentDetail.remain }} 张
        </el-descriptions-item>
        <el-descriptions-item label="有效期">
          {{ currentDetail.startTime }} 至 <br/> {{ currentDetail.endTime }}
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(currentDetail.status)" size="small">
            {{ formatStatus(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.container { padding: 20px; background: #fff; min-height: calc(100vh - 60px); }
.search-form { margin-bottom: 20px; padding: 15px 15px 0; background: #f8f9fa; border-radius: 6px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; padding-bottom: 20px; }
</style>