<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { AdminOrderPageQueryDTO, AdminOrderPageResultVO } from '@/types/admin/order'
import { getAdminOrderPageApi } from '@/api/admin/order'

const searchForm = ref<AdminOrderPageQueryDTO>({
  page: 1,
  pageSize: 10,
  orderNo: '',
  status: undefined
})

const list = ref<AdminOrderPageResultVO[]>([])
const total = ref(0)

const detailVisible = ref(false)
const currentOrder = ref<AdminOrderPageResultVO | null>(null)

const statusMap: Record<number, { text: string; type: string }> = {
  0: { text: '待支付', type: 'warning' },
  1: { text: '已支付', type: 'primary' },
  2: { text: '已取消', type: 'info' },
  3: { text: '已完成', type: 'success' },
  4: { text: '已退款', type: 'danger' }
}

const search = async () => {
  const res = await getAdminOrderPageApi(searchForm.value)
  if (res.code === 1) {
    list.value = res.data.records
    total.value = res.data.total
  } else {
    ElMessage.error(res.msg)
  }
}

const clear = () => {
  searchForm.value.orderNo = ''
  searchForm.value.status = undefined
  searchForm.value.page = 1
  search()
}

const openDetail = (row: AdminOrderPageResultVO) => {
  currentOrder.value = row
  detailVisible.value = true
}

const handleSizeChange = (val: number) => {
  searchForm.value.pageSize = val
  searchForm.value.page = 1
  search()
}
const handleCurrentChange = (val: number) => {
  searchForm.value.page = val
  search()
}

onMounted(() => search())
</script>

<template>
  <h1>订单管理</h1>
  <div class="container">
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="订单号">
        <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 180px" clearable>
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已取消" :value="2" />
          <el-option label="已完成" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" border style="width: 100%; margin-top: 15px">
      <el-table-column prop="orderNo" label="订单号" min-width="200" align="center" />
      <el-table-column prop="merchantName" label="商家" min-width="150" align="center" />
      <el-table-column prop="payAmount" label="实付金额" width="120" align="center">
        <template #default="{ row }">￥{{ row.payAmount }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status]?.type as any">
            {{ statusMap[row.status]?.text || '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="receiverName" label="收货人" width="100" align="center" />
      <el-table-column prop="createTime" label="下单时间" width="180" align="center" />
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="800">
      <div v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusMap[currentOrder.status]?.type as any">
              {{ statusMap[currentOrder.status]?.text }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商家">{{ currentOrder.merchantName }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">￥{{ currentOrder.payAmount }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ currentOrder.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ currentOrder.receiverAddress }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '-' }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin-top: 20px">商品明细</h4>
        <el-table :data="currentOrder.items" border>
          <el-table-column label="图片" width="80" align="center">
            <template #default="{ row }">
              <el-image :src="row.image" style="width: 50px; height: 50px" fit="cover">
                <template #error>
                  <div style="color: #999; font-size: 12px">无</div>
                </template>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品名称" min-width="160" />
          <el-table-column prop="skuSpecs" label="规格" min-width="120" />
          <el-table-column prop="price" label="单价" width="100" align="center">
            <template #default="{ row }">￥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="totalPrice" label="小计" width="110" align="center">
            <template #default="{ row }">￥{{ row.totalPrice }}</template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 15px"
    />
  </div>
</template>

<style scoped>
.container {
  margin: 20px 0;
}
</style>