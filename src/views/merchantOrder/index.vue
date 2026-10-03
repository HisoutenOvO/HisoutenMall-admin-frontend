<script setup lang="ts">

import {onMounted, ref} from "vue";
import type {
  MerchantOrderDetailVO,
  MerchantOrderPageQueryDTO,
  MerchantOrderPageResultVO
} from "@/types/merchant/order.ts";
import {getMerchantOrderPageApi,getMerchantOrderDetailApi,shipOrderApi} from "@/api/merchant/order.ts";
import {ElMessage} from "element-plus";

const total = ref(0)

const searchOrder = ref<MerchantOrderPageQueryDTO>({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined,
})

const detailVisible = ref(false)

const detail = ref<MerchantOrderDetailVO>({} as MerchantOrderDetailVO)

const orderList = ref<MerchantOrderPageResultVO[]>([])

const statusText = (status: number) => {
  if (status === 0) {
    return '待支付'
  }else if (status === 1) {
    return '已支付'
  }else if (status === 2) {
    return '已取消'
  }else if (status === 3) {
    return '已完成'
  }else if (status === 4) {
    return '已退款'
  }
}
const statusTagType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning',  // 待支付
    1: 'primary',  // 已支付
    2: 'info',     // 已取消
    3: 'success',  // 已完成
    4: 'danger'    // 已退款
  }
  return map[status] || 'info'
}

const formatSpecs = (specs: string) => {
  if (!specs) return '默认规格'
  try {
    const obj = JSON.parse(specs)
    return Object.values(obj).join(' / ')
  } catch {
    return specs
  }
}

const search = async () => {
  const result = await getMerchantOrderPageApi(searchOrder.value)
  if(result.code === 1){
    orderList.value = result.data.records
    total.value = result.data.total
  }else{
    ElMessage.error(result.msg)
  }
}

const clear = () => {
  searchOrder.value.keyword = ''
  searchOrder.value.status = undefined
  search()
}

const viewDetail = async (orderNo: string) => {
  const result = await getMerchantOrderDetailApi(orderNo)
  if(result.code === 1){
    detailVisible.value = true
    detail.value = result.data
  }else{
    ElMessage.error(result.msg)
  }
}

const ship = async (orderNo: string) => {
  const result = await shipOrderApi(orderNo)
  if(result.code === 1){
    ElMessage.success("发货成功")
    search()
  }else{
    ElMessage.error(result.msg)
  }
}

// 换页
const handleSizeChange = (val: number) => {
  searchOrder.value.pageSize = val
  searchOrder.value.page = 1
  search()
}
const handleCurrentChange = (val: number) => {
  searchOrder.value.page = val
  search()
}

onMounted(() => {
  search()
})

</script>

<template>
  <h1>订单管理</h1>
  <div class="container">
    <el-form :inline="true" :model="searchOrder">
      <el-form-item label="订单号">
        <el-input v-model="searchOrder.keyword" placeholder="请输入订单号" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchOrder.status" placeholder="请选择状态" style="width: 160px" clearable>
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已取消" :value="2" />
          <el-option label="已完成" :value="3" />
          <el-option label="已退款" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>

    <!-- 订单卡片 -->
    <div v-for="order in orderList" :key="order.id" class="order-card">
      <!-- 头部 -->
      <div class="order-header">
        <div class="header-left">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span class="order-time">{{ order.createTime }}</span>
        </div>
        <el-tag :type="statusTagType(order.status)" effect="light">
          {{ statusText(order.status) }}
        </el-tag>
      </div>

      <!-- 商品项 -->
      <div class="order-body">
        <div v-for="item in order.items" :key="item.orderId" class="order-item">
          <el-image :src="item.image || ''" class="item-image" fit="cover">
            <template #error>
              <div class="img-placeholder">暂无</div>
            </template>
          </el-image>
          <div class="item-info">
            <div class="item-name">{{ item.productName }}</div>
            <div class="item-specs">{{ formatSpecs(item.skuSpecs) }}</div>
          </div>
          <div class="item-col item-price">¥{{ item.price }}</div>
          <div class="item-col item-quantity">× {{ item.quantity }}</div>
          <div class="item-col item-subtotal">¥{{ item.totalPrice }}</div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="order-footer">
        <div class="total">
          合计：<span class="total-amount">¥ {{ order.payAmount }}</span>
        </div>
        <div class="actions">
          <el-button v-if="order.status === 1" type="primary" size="small" @click="ship(order.orderNo)">
            发货
          </el-button>
          <el-button size="small" @click="viewDetail(order.orderNo)">详情</el-button>
        </div>
      </div>
    </div>

    <el-empty v-if="orderList.length === 0" description="暂无订单" />

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="720">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText(detail.status) }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ detail.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ detail.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ detail.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detail.payTime || '未支付' }}</el-descriptions-item>
      </el-descriptions>

      <el-table :data="detail.items || []" border style="margin-top: 20px">
        <el-table-column label="商品" min-width="220">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 10px;">
              <el-image :src="row.image || ''" style="width: 50px; height: 50px; border-radius: 4px;" fit="cover">
                <template #error>
                  <div class="img-placeholder" style="width: 50px; height: 50px;">暂无</div>
                </template>
              </el-image>
              <span>{{ row.productName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="规格" width="160">
          <template #default="{ row }">{{ formatSpecs(row.skuSpecs) }}</template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="80" />
        <el-table-column prop="quantity" label="数量" width="60" />
        <el-table-column prop="totalPrice" label="小计" width="80" />
      </el-table>

      <div style="text-align: right; margin-top: 16px;">
        合计：<span style="color: #e1251b; font-size: 20px; font-weight: bold;">¥ {{ detail.payAmount }}</span>
      </div>
    </el-dialog>

    <el-pagination
        v-model:current-page="searchOrder.page"
        v-model:page-size="searchOrder.pageSize"
        :page-sizes="[5, 10, 15, 20, 30, 50]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px;"
    />
  </div>
</template>

<style scoped>
.container {
  margin: 20px 0;
}

/* 卡片 */
.order-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
}
.order-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}
.header-left {
  display: flex;
  gap: 32px;
  font-size: 13px;
}
.order-no {
  font-weight: 600;
  color: #303133;
}
.order-time {
  color: #909399;
}

/* 商品列表 */
.order-body {
  padding: 4px 16px;
}
.order-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #ebeef5;
}
.order-item:last-child {
  border-bottom: none;
}
.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  flex-shrink: 0;
  background: #f5f7fa;
}
.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  background: #f5f7fa;
  font-size: 12px;
  border-radius: 4px;
}
.item-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}
.item-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-specs {
  font-size: 12px;
  color: #909399;
}
.item-col {
  width: 90px;
  text-align: center;
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}
.item-subtotal {
  color: #e1251b;
  font-weight: 600;
}

/* 底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
}
.total {
  font-size: 14px;
  color: #606266;
}
.total-amount {
  color: #e1251b;
  font-size: 20px;
  font-weight: bold;
  margin-left: 4px;
}
.actions {
  display: flex;
  gap: 8px;
}
</style>
