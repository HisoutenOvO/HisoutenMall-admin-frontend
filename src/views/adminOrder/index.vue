<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getAdminOrderPageApi,
} from '@/api/admin/order'

import type {AdminOrderPageQueryDTO, AdminOrderPageResultVO} from '@/types/admin/order'

const searchForm = ref<AdminOrderPageQueryDTO>({
  page: 1,
  pageSize: 10,
  orderNo: '',
  merchantName: '',
  buyerName: '',
  status: undefined
})

const list = ref<AdminOrderPageResultVO[]>([])
const total = ref(0)
const loading = ref(false)

// 详情弹窗
const dialogVisible = ref(false)
const currentOrder = ref<AdminOrderPageResultVO | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAdminOrderPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally { loading.value = false }
}

const openDetail = (row: AdminOrderPageResultVO) => {
  currentOrder.value = row
  dialogVisible.value = true
}

const formatStatus = (status: number) => {
  const map: Record<number, string> = { 0: '待支付', 1: '已支付', 2: '已取消', 3: '已完成', 4: '已退款' }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map: Record<number, string> = { 0: 'warning', 1: 'primary', 2: 'info', 3: 'success', 4: 'danger' }
  return map[status] || 'info'
}

// 解析 SKU 规格 JSON 字符串，比如 {"颜色":"黑色"} 变成 "颜色: 黑色"
const formatSpecs = (specs: string) => {
  if (!specs) return '默认'
  try {
    const obj = JSON.parse(specs)
    return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(' / ')
  } catch {
    return specs
  }
}

onMounted(loadData)
</script>

<template>
  <div class="container">
    <!-- 搜索区 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="订单号">
        <el-input v-model="searchForm.orderNo" placeholder="精确查询订单号" clearable />
      </el-form-item>
      <el-form-item label="商家">
        <el-input v-model="searchForm.merchantName" placeholder="按商家搜索" clearable />
      </el-form-item>
      <el-form-item label="买家">
        <el-input v-model="searchForm.buyerName" placeholder="按买家搜索" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已取消" :value="2" />
          <el-option label="已完成" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchForm.page=1; loadData()">查询</el-button>
        <el-button @click="searchForm.orderNo=''; searchForm.merchantName=''; searchForm.buyerName=''; searchForm.status=undefined; loadData()">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="orderNo" label="订单号" width="200" />
      <el-table-column prop="merchantName" label="商家名称" min-width="150" />
      <el-table-column prop="buyerName" label="买家" width="120" />
      <el-table-column prop="payAmount" label="实付金额" width="120">
        <template #default="{ row }">
          <span style="color: #e1251b; font-weight: bold;">￥{{ row.payAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.source === 1" type="danger" effect="dark">秒杀</el-tag>
          <el-tag v-else type="info">普通</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ formatStatus(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" />
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDetail(row)">详情</el-button>
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

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="订单详情" width="800px">
      <div v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{ formatStatus(currentOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="买家">{{ currentOrder.buyerName }}</el-descriptions-item>
          <el-descriptions-item label="商家">{{ currentOrder.merchantName }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '未支付' }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ currentOrder.receiverName }} ({{ currentOrder.receiverPhone }})</el-descriptions-item>
          <el-descriptions-item label="实付金额">
            <span style="color: #e1251b; font-weight: bold;">￥{{ currentOrder.payAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.receiverAddress }}</el-descriptions-item>
        </el-descriptions>

        <h3 style="margin-top: 20px;">商品明细</h3>
        <el-table :data="currentOrder.items" border size="small">
          <el-table-column label="商品名" min-width="150">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 10px;">
                <el-image v-if="row.image" :src="row.image" style="width: 40px; height: 40px" fit="cover" />
                <span>{{ row.productName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="规格" width="200">
            <template #default="{ row }">
              {{ formatSpecs(row.skuSpecs) }}
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">￥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="totalPrice" label="小计" width="100">
            <template #default="{ row }">￥{{ row.totalPrice }}</template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
  background-color: #fff;
  min-height: calc(100vh - 60px);
}
.search-form {
  margin-bottom: 20px;
  padding: 15px 15px 0;
  background-color: #f8f9fa;
  border-radius: 6px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 20px;
}
</style>