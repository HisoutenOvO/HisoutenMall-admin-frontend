<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

import {
  getMerchantOrderPageApi,
  getMerchantOrderDetailApi,
  shipOrderApi
} from '@/api/merchant/order'
import type {
  MerchantOrderDetailVO,
  MerchantOrderPageQueryDTO,
  MerchantOrderPageResultVO
} from '@/types/merchant/order'

const total = ref(0)
const orderList = ref<MerchantOrderPageResultVO[]>([])
const searchOrder = ref<MerchantOrderPageQueryDTO>({
  page: 1, pageSize: 10, keyword: '', status: undefined
})

const detailVisible = ref(false)
const detail = ref<MerchantOrderDetailVO>({} as MerchantOrderDetailVO)

// ==== 发货弹窗状态 ====
const shipDialogVisible = ref(false)
const shipFormRef = ref()
const shipForm = reactive({
  orderNo: '',
  company: '顺丰速运'
})
const shipRules = {
  company: [{ required: true, message: '请输入快递公司', trigger: 'blur' }]
}

const statusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '已取消',
    3: '已发货',
    4: '已完成',
    5: '已退款'
  }
  return map[status] || '未知'
}

const statusTagType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning', // 待支付
    1: 'primary', // 已支付
    2: 'info',    // 已取消
    3: 'shipped', // 已发货
    4: 'success', // 已完成
    5: 'danger'   // 已退款
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

const openShipDialog = (orderNo: string) => {
  shipForm.orderNo = orderNo
  shipForm.company = '顺丰速运'
  shipDialogVisible.value = true
}

const submitShip = async () => {
  try {
    await shipFormRef.value.validate()
  } catch { return }

  // 这里只传 company
  const result = await shipOrderApi(shipForm.orderNo, shipForm.company)

  if(result.code === 1){
    ElMessage.success("发货成功")
    shipDialogVisible.value = false
    search()
  }else{
    ElMessage.error(result.msg)
  }
}

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
    <!-- ... 搜索区和卡片列表部分保持不变 ... -->
    <el-form :inline="true" :model="searchOrder">
      <el-form-item label="订单号">
        <el-input v-model="searchOrder.keyword" placeholder="请输入订单号" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchOrder.status" placeholder="请选择状态" style="width: 160px" clearable>
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已取消" :value="2" />
          <el-option label="已发货" :value="3" />
          <el-option label="已完成" :value="4" />
          <el-option label="已退款" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>

    <div v-for="order in orderList" :key="order.id" class="order-card">
      <div class="order-header">
        <div class="header-left">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span class="order-time">{{ order.createTime }}</span>
        </div>
        <el-tag :type="statusTagType(order.status)" effect="light">
          {{ statusText(order.status) }}
        </el-tag>
      </div>

      <div class="order-body" v-if="order.items && order.items.length > 0">
        <div v-for="item in order.items" :key="item.productName + item.skuSpecs" class="order-item">
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
      <div v-else class="order-body" style="padding: 20px; text-align: center; color: #999;">
        加载明细中...
      </div>

      <div class="order-footer">
        <div class="total">
          合计：<span class="total-amount">¥ {{ order.payAmount }}</span>
        </div>
        <div class="actions">
          <el-button v-if="order.status === 1" type="primary" size="small" @click="openShipDialog(order.orderNo)">
            发货
          </el-button>
          <el-button size="small" @click="viewDetail(order.orderNo)">详情</el-button>
        </div>
      </div>
    </div>

    <el-empty v-if="orderList.length === 0" description="暂无订单" />

    <!-- 详情弹窗 ... -->

    <!-- 发货弹窗（修改：去掉快递单号） -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="400px">
      <el-form :model="shipForm" :rules="shipRules" ref="shipFormRef" label-width="80px">
        <el-form-item label="订单号">
          <span style="color: #666;">{{ shipForm.orderNo }}</span>
        </el-form-item>
        <el-form-item label="快递公司" prop="company">
          <el-input v-model="shipForm.company" placeholder="如：顺丰速运" />
        </el-form-item>
        <!-- 快递单号被后端自动生成，前端不传 -->
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShip">确认发货</el-button>
      </template>
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
/* 样式保持你原来的不变 */
.container { margin: 20px 0; }
.order-card { background: #fff; border: 1px solid #ebeef5; border-radius: 4px; margin-bottom: 16px; transition: box-shadow 0.2s; }
.order-card:hover { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }
.order-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fafafa; border-bottom: 1px solid #ebeef5; }
.header-left { display: flex; gap: 32px; font-size: 13px; }
.order-no { font-weight: 600; color: #303133; }
.order-time { color: #909399; }
.order-body { padding: 4px 16px; }
.order-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px dashed #ebeef5; }
.order-item:last-child { border-bottom: none; }
.item-image { width: 60px; height: 60px; border-radius: 4px; flex-shrink: 0; background: #f5f7fa; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #c0c4cc; background: #f5f7fa; font-size: 12px; border-radius: 4px; }
.item-info { flex: 1; margin-left: 12px; min-width: 0; }
.item-name { font-size: 14px; color: #303133; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-specs { font-size: 12px; color: #909399; }
.item-col { width: 90px; text-align: center; font-size: 13px; color: #606266; flex-shrink: 0; }
.item-subtotal { color: #e1251b; font-weight: 600; }
.order-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fafafa; border-top: 1px solid #ebeef5; }
.total { font-size: 14px; color: #606266; }
.total-amount { color: #e1251b; font-size: 20px; font-weight: bold; margin-left: 4px; }
.actions { display: flex; gap: 8px; }
</style>