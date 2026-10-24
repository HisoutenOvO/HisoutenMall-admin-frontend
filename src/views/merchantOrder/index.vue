<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getMerchantOrderPageApi, getMerchantOrderDetailApi, shipOrderApi } from '@/api/merchant/order'
import type { MerchantOrderDetailVO, MerchantOrderPageQueryDTO, MerchantOrderPageResultVO } from '@/types/merchant/order'
import { formatSpecs } from '@/utils/format' // 引入公共方法

const total = ref(0)
const orderList = ref<MerchantOrderPageResultVO[]>([])
const searchOrder = ref<MerchantOrderPageQueryDTO>({
  page: 1, pageSize: 10, keyword: '', status: undefined
})

const detailVisible = ref(false)
const detail = ref<MerchantOrderDetailVO>({} as MerchantOrderDetailVO)

const shipDialogVisible = ref(false)
const shipFormRef = ref()
const shipForm = reactive({ orderNo: '', company: '顺丰速运' })
const shipRules = { company: [{ required: true, message: '请输入快递公司', trigger: 'blur' }] }

const statusText = (status: number) => {
  const map: Record<number, string> = { 0: '待支付', 1: '已支付', 2: '已取消', 3: '已发货', 4: '已完成', 5: '已退款' }
  return map[status] || '未知'
}
const statusTagType = (status: number) => {
  const map: Record<number, string> = { 0: 'warning', 1: 'primary', 2: 'info', 3: 'shipped', 4: 'success', 5: 'danger' }
  return map[status] || 'info'
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
  void search()
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
  const result = await shipOrderApi(shipForm.orderNo, shipForm.company)
  if(result.code === 1){
    ElMessage.success("发货成功")
    shipDialogVisible.value = false
    await search()
  }else{
    ElMessage.error(result.msg)
  }
}

const handleSizeChange = (val: number) => {
  searchOrder.value.pageSize = val
  searchOrder.value.page = 1
  void search()
}
const handleCurrentChange = (val: number) => {
  searchOrder.value.page = val
  void search()
}

onMounted(() => {
  void search()
})
</script>

<template>
  <div class="app-container">
    <!-- 1. 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchOrder" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="searchOrder.keyword" placeholder="请输入订单号" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchOrder.status" placeholder="全部状态" style="width: 160px" clearable>
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已取消" :value="2" />
            <el-option label="已发货" :value="3" />
            <el-option label="已完成" :value="4" />
            <el-option label="已退款" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="search">查询</el-button>
          <el-button icon="Refresh" @click="clear">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 2. 订单列表区 -->
    <div class="order-list" v-loading="!orderList.length && total > 0">
      <el-empty v-if="orderList.length === 0" description="暂无订单数据" />

      <div v-for="order in orderList" :key="order.id" class="order-card">
        <!-- 卡片头部：订单基础信息 -->
        <div class="order-header">
          <div class="header-left">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span class="order-time">下单时间：{{ order.createTime }}</span>
          </div>
          <div class="header-right">
            <el-tag :type="statusTagType(order.status)" effect="light" round>
              {{ statusText(order.status) }}
            </el-tag>
          </div>
        </div>

        <!-- 卡片主体：商品明细 -->
        <div class="order-body">
          <div v-if="order.items && order.items.length > 0">
            <div v-for="item in order.items" :key="item.productName + item.skuSpecs" class="order-item">
              <el-image :src="item.image || ''" class="item-image" fit="cover">
                <template #error>
                  <div class="img-placeholder">无图</div>
                </template>
              </el-image>

              <div class="item-info">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-specs">{{ formatSpecs(item.skuSpecs) }}</div>
              </div>

              <div class="item-col item-price">¥{{ item.price }}</div>
              <div class="item-col item-quantity">x {{ item.quantity }}</div>
              <div class="item-col item-subtotal">¥ {{ item.totalPrice }}</div>
            </div>
          </div>
          <div v-else class="loading-text">加载明细中...</div>
        </div>

        <!-- 卡片底部：操作与合计 -->
        <div class="order-footer">
          <div class="footer-total">
            共 {{ order.items?.length || 0 }} 件商品，合计：
            <span class="total-amount">¥ {{ order.payAmount }}</span>
          </div>
          <div class="footer-actions">
            <el-button
                v-if="order.status === 1"
                type="primary"
                plain
                @click="openShipDialog(order.orderNo)"
            >
              立即发货
            </el-button>
            <el-button @click="viewDetail(order.orderNo)">查看详情</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 分页 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="searchOrder.page"
          v-model:page-size="searchOrder.pageSize"
          :page-sizes="[5, 10, 15, 20, 30, 50]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="800px" class="custom-dialog">
      <div class="detail-header">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            <span style="font-weight: bold;">{{ detail.orderNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(detail.status)" effect="light">{{ statusText(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="收货人">{{ detail.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detail.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ detail.receiverAddress }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ detail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ detail.payTime || '未支付' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-products">
        <h4 class="section-title">商品信息</h4>
        <el-table :data="detail.items || []" border style="width: 100%">
          <el-table-column label="商品" width="250">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 12px;">
                <el-image :src="row.image || ''" style="width: 50px; height: 50px; border-radius: 4px; border: 1px solid #ebeef5" fit="cover">
                  <template #error><div class="img-placeholder">无</div></template>
                </el-image>
                <span class="product-name">{{ row.productName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="规格" width="250">
            <template #default="{ row }">
              <span style="color: #909399; font-size: 13px;">{{ formatSpecs(row.skuSpecs) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="80" align="center">
            <template #default="{ row }">¥ {{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量"  align="center" />
          <el-table-column prop="totalPrice" label="小计" width="100" align="center">
            <template #default="{ row }"><span style="color: #e1251b; font-weight: 600;">¥ {{ row.totalPrice }}</span></template>
          </el-table-column>
        </el-table>
      </div>

      <div class="detail-footer">
        <span>总计：</span>
        <span class="total-amount">¥ {{ detail.payAmount }}</span>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 发货弹窗 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="450px">
      <el-form :model="shipForm" :rules="shipRules" ref="shipFormRef" label-width="90px">
        <el-form-item label="当前订单号">
          <span style="color: #606266; font-weight: 500;">{{ shipForm.orderNo }}</span>
        </el-form-item>
        <el-form-item label="快递公司" prop="company">
          <el-input v-model="shipForm.company" placeholder="如：顺丰速运、中通快递" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShip">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 页面整体布局 */
.app-container {
  padding: 0;
}

/* ============ 搜索卡片 ============ */
.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: none;
}
.search-form {
  margin-top: 5px;
}

/* ============ 订单卡片列表 ============ */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  transition: box-shadow 0.3s;
}
.order-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

/* 头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #f8f9fa;
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

/* 主体 */
.order-body {
  padding: 10px 20px;
}
.order-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px dashed #ebeef5;
}
.order-item:last-child {
  border-bottom: none;
}
.item-image {
  width: 70px;
  height: 70px;
  border-radius: 6px;
  flex-shrink: 0;
  border: 1px solid #ebeef5;
}
.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 12px;
  border-radius: 6px;
}
.item-info {
  flex: 1;
  margin-left: 16px;
  min-width: 0;
}
.item-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-specs {
  font-size: 13px;
  color: #909399;
}
.item-col {
  width: 100px;
  text-align: center;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}
.item-subtotal {
  color: #303133;
  font-weight: 600;
}
.loading-text {
  padding: 30px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fcfcfc;
  border-top: 1px solid #ebeef5;
}
.footer-total {
  font-size: 14px;
  color: #606266;
}
.total-amount {
  color: #e1251b;
  font-size: 22px;
  font-weight: bold;
  margin-left: 8px;
}
.footer-actions {
  display: flex;
  gap: 12px;
}

/* ============ 分页 ============ */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* ============ 弹窗优化 ============ */
.custom-dialog :deep(.el-dialog__body) {
  padding: 10px 20px 20px;
}
.section-title {
  margin: 20px 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  border-left: 4px solid #e1251b;
  padding-left: 10px;
  line-height: 1;
}
.product-name {
  font-size: 14px;
  color: #303133;
}
.detail-footer {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  margin-top: 20px;
  padding-right: 10px;
  font-size: 15px;
  color: #606266;
}
.detail-footer .total-amount {
  font-size: 24px;
  margin-left: 10px;
}
</style>