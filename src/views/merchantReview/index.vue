<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getMerchantReviewPageApi, getMerchantReviewDetailApi, getMerchantReviewStatisticsApi } from '@/api/merchant/review'
import { getMerchantProductPageApi } from '@/api/merchant/product'
import type { MerchantReviewPageQueryDTO, MerchantReviewPageResultVO, ReviewDetailVO, MerchantReviewStatisticsVO } from '@/types/merchant/review'
import type { MerchantProductPageResultVO } from '@/types/merchant/product'
import { formatSpecs } from '@/utils/format'

const loading = ref(false)
const searchForm = ref<MerchantReviewPageQueryDTO>({
  page: 1, pageSize: 10, productId: undefined, rating: undefined, keyword: ''
})

const list = ref<MerchantReviewPageResultVO[]>([])
const total = ref(0)

// 详情
const detailVisible = ref(false)
const currentDetail = ref<ReviewDetailVO | null>(null)

// 商品下拉列表（解决让商家手填 ID 的脑瘫设计）
const productList = ref<MerchantProductPageResultVO[]>([])
const statProductId = ref<number>()
const statisticsData = ref<MerchantReviewStatisticsVO | null>(null)
const statLoading = ref(false)

// 1. 加载商家的商品列表作为下拉选项
const loadProducts = async () => {
  try {
    // 拉取商家自己的所有商品（包含在售和已下架）
    const res = await getMerchantProductPageApi({ page: 1, pageSize: 100 })
    if (res.code === 1) {
      productList.value = res.data.records
    }
  } catch (e) {
    console.error(e)
  }
}

// 2. 加载评价列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await getMerchantReviewPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

// 3. 打开详情（直接赋值，杜绝点不动）
const openDetail = async (id: number) => {
  try {
    const res = await getMerchantReviewDetailApi(id)
    if (res.code === 1) {
      currentDetail.value = res.data
      detailVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取详情失败')
    }
  } catch (e) {
    ElMessage.error('网络异常，获取详情失败')
  }
}

// 4. 查询统计（选中下拉框自动触发）
const queryStatistics = async () => {
  if (!statProductId.value) {
    statisticsData.value = null
    return
  }

  statLoading.value = true
  try {
    const res = await getMerchantReviewStatisticsApi(statProductId.value)
    if (res.code === 1) {
      statisticsData.value = res.data
    } else {
      statisticsData.value = null
      ElMessage.error(res.msg || '商品不存在')
    }
  } catch (e) {
    statisticsData.value = null
    ElMessage.error('查询统计失败')
  } finally {
    statLoading.value = false
  }
}

// 当在搜索区选了商品，同时更新统计区和列表区
const handleProductChange = () => {
  searchForm.value.productId = statProductId.value
  searchForm.value.page = 1
  loadData()
  queryStatistics()
}

const handleSizeChange = (val: number) => {
  searchForm.value.pageSize = val
  searchForm.value.page = 1
  loadData()
}
const handleCurrentChange = (val: number) => {
  searchForm.value.page = val
  loadData()
}

onMounted(() => {
  loadProducts()
  loadData()
})
</script>

<template>
  <div class="app-container">
    <!-- 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" class="search-form">
        <el-form-item label="选择商品">
          <!-- 用下拉框选择商品，显示商品名，后台传 ID -->
          <el-select
              v-model="statProductId"
              placeholder="请选择商品查看评价"
              clearable
              filterable
              style="width: 250px"
              @change="handleProductChange"
          >
            <el-option
                v-for="p in productList"
                :key="p.id"
                :label="p.name"
                :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="searchForm.keyword" placeholder="搜索评价关键词" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="星级">
          <el-select v-model="searchForm.rating" placeholder="全部" clearable style="width: 120px" @change="handleProductChange">
            <el-option label="5星" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleProductChange">查询</el-button>
          <el-button icon="Refresh" @click="statProductId = undefined; searchForm = { page: 1, pageSize: 10 }; loadData(); statisticsData = null">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20">
      <!-- 左侧数据列表 -->
      <el-col :span="18">
        <el-card class="table-card" shadow="never">
          <el-table :data="list" v-loading="loading" style="width: 100%">
            <el-table-column label="用户" width="160">
              <template #default="{ row }">
                <div class="user-info">
                  <el-avatar :src="row.avatar" size="small" />
                  <span class="nickname">{{ row.nickname || '匿名用户' }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="评分" width="160">
              <template #default="{ row }">
                <el-rate :model-value="row.rating" disabled show-score text-color="#ff9900" />
              </template>
            </el-table-column>

            <el-table-column label="评价内容" min-width="250">
              <template #default="{ row }">
                <div class="review-content">{{ row.content || '默认好评' }}</div>
                <div class="review-images" v-if="row.images && row.images.length > 0">
                  <el-image
                      v-for="(img, i) in row.images" :key="i" :src="img"
                      style="width: 30px; height: 30px; border-radius: 4px; margin-right: 5px;"
                      :preview-src-list="row.images" :initial-index="i"
                  />
                </div>
              </template>
            </el-table-column>

            <el-table-column label="规格" width="150">
              <template #default="{ row }">
                <span class="specs-text">{{ formatSpecs(row.skuSpecs) }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="createTime" label="评价时间" width="170" align="center" />

            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <!-- 彻底解决点不动，增加 type 限制和 native-type -->
                <el-button type="primary" link @click.stop="openDetail(row.id)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
                v-model:current-page="searchForm.page"
                v-model:page-size="searchForm.pageSize"
                :total="total"
                :page-sizes="[10, 20, 50]"
                background
                layout="total, sizes, prev, pager, next"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧统计面板 -->
      <el-col :span="6">
        <el-card class="stat-card" shadow="never" v-loading="statLoading">
          <template #header>
            <span class="card-title">商品评价统计</span>
          </template>

          <div v-if="statisticsData" class="stat-content">
            <div class="score-box">
              <div class="score-num">{{ statisticsData.avgRating || 0 }}</div>
              <div class="score-label">平均分</div>
            </div>

            <div class="rate-progress">
              <div class="rate-row" v-for="star in [5, 4, 3, 2, 1]" :key="star">
                <span class="star-text">{{ star }}星</span>
                <el-progress
                    :percentage="statisticsData.totalCount ? Math.round(((statisticsData.ratingCountMap?.[star] || 0) / statisticsData.totalCount) * 100) : 0"
                    :stroke-width="6"
                    :show-text="false"
                    color="#ff9900"
                />
                <span class="count-text">{{ statisticsData.ratingCountMap?.[star] || 0 }}</span>
              </div>
            </div>

            <div class="stat-footer">
              共计 {{ statisticsData.totalCount || 0 }} 条评价
            </div>
          </div>
          <el-empty v-else :description="statProductId ? '该商品暂无评价数据' : '请在上方选择商品查看统计'" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 详情弹窗 append-to-body 防止被遮挡点不动 -->
    <el-dialog v-model="detailVisible" title="评价完整详情" width="600px" append-to-body>
      <el-descriptions v-if="currentDetail" :column="1" border>
        <el-descriptions-item label="用户">
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-avatar :src="currentDetail.avatar" size="small" />
            <span>{{ currentDetail.nickname || '匿名' }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="商品">{{ currentDetail.productName }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ formatSpecs(currentDetail.skuSpecs) }}</el-descriptions-item>
        <el-descriptions-item label="评分">
          <el-rate :model-value="currentDetail.rating" disabled />
        </el-descriptions-item>
        <el-descriptions-item label="评价内容">
          <div style="line-height: 1.6;">{{ currentDetail.content || '默认好评' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="评价图片" v-if="currentDetail.images && currentDetail.images.length > 0">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <el-image
                v-for="(img, i) in currentDetail.images" :key="i" :src="img"
                style="width: 80px; height: 80px; border-radius: 6px;"
                :preview-src-list="currentDetail.images" :initial-index="i"
            />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="关联订单号">{{ currentDetail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="评价时间">{{ currentDetail.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container { padding: 0; }
.search-card { margin-bottom: 16px; border-radius: 8px; border: none; }
.table-card, .stat-card { border-radius: 8px; border: none; }

/* 列表区样式 */
.user-info { display: flex; align-items: center; gap: 8px; }
.nickname { font-size: 13px; color: #333; }
.review-content { font-size: 13px; color: #606266; margin-bottom: 6px; }
.review-images { display: flex; gap: 4px; }
.specs-text { font-size: 12px; color: #909399; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }

/* 统计面板样式 */
.stat-card { height: 100%; min-height: 400px; }
.card-title { font-weight: 600; font-size: 15px; }
.stat-content { text-align: center; }
.score-box { margin-bottom: 20px; }
.score-num { font-size: 32px; font-weight: bold; color: #ff9900; line-height: 1; }
.score-label { font-size: 12px; color: #999; margin-top: 4px; }
.rate-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.star-text { font-size: 12px; color: #666; width: 25px; text-align: left; }
.count-text { font-size: 12px; color: #999; width: 20px; text-align: right; }
.stat-footer { margin-top: 20px; font-size: 12px; color: #999; padding-top: 15px; border-top: 1px dashed #ebeef5; }
</style>