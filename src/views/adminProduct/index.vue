<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminProductPageApi, getAdminProductDetailApi, offlineProductApi } from '@/api/admin/product'
import type { AdminProductPageQueryDTO, AdminProductPageResultVO, AdminProductDetailVO } from '@/types/admin/product'
import { formatSpecs } from '@/utils/format' // 引入公共方法

const searchForm = ref<AdminProductPageQueryDTO>({
  page: 1, pageSize: 10, keyword: '', merchantName: '', status: undefined, deleted: 0
})
const list = ref<AdminProductPageResultVO[]>([])
const total = ref(0)
const loading = ref(false)

const drawerVisible = ref(false)
const currentDetail = ref<AdminProductDetailVO | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAdminProductPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const openDetail = async (id: number) => {
  const res = await getAdminProductDetailApi(id)
  if (res.code === 1) {
    currentDetail.value = res.data
    drawerVisible.value = true
  } else {
    ElMessage.error(res.msg)
  }
}

const handleOffline = async (row: AdminProductPageResultVO) => {
  try {
    await ElMessageBox.confirm('强制下架该商品？违规商品请直接下架。', '警告', { type: 'error' })
  } catch {
    return
  }

  const res = await offlineProductApi(row.id)
  if (res.code === 1) {
    ElMessage.success('已强制下架')
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
      <el-form-item label="商品名称">
        <el-input v-model="searchForm.keyword" placeholder="搜索商品" clearable />
      </el-form-item>
      <el-form-item label="商家名称">
        <el-input v-model="searchForm.merchantName" placeholder="按商家搜索" clearable />
      </el-form-item>
      <el-form-item label="商品状态">
        <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchForm.page=1; loadData()">查询</el-button>
        <el-button @click="searchForm.keyword=''; searchForm.merchantName=''; searchForm.status=undefined; loadData()">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column label="主图" width="80" align="center">
        <template #default="{ row }">
          <el-image :src="row.mainImage" style="width: 50px; height: 50px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" width="250" align="center" />
      <el-table-column prop="merchantName" label="所属商家" width="200" />
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDetail(row.id)">详情</el-button>
          <el-button
              v-if="row.status === 1"
              type="danger" size="small"
              @click="handleOffline(row)"
          >强制下架</el-button>
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

    <el-drawer v-model="drawerVisible" title="商品详情" size="50%">
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品名称">{{ currentDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="所属商家">{{ currentDetail.merchantName }}</el-descriptions-item>
          <el-descriptions-item label="商品分类">{{ currentDetail.categoryName }}</el-descriptions-item>
          <el-descriptions-item label="品牌">{{ currentDetail.brandName || '无' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetail.status === 1 ? 'success' : 'info'">
              {{ currentDetail.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="是否删除">
            <el-tag :type="currentDetail.deleted === 1 ? 'danger' : 'info'">
              {{ currentDetail.deleted === 1 ? '已删除' : '正常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="主图" :span="2">
            <el-image :src="currentDetail.mainImage" style="max-height: 150px" :preview-src-list="[currentDetail.mainImage]" />
          </el-descriptions-item>
          <el-descriptions-item label="详情" :span="2">
            <div v-html="currentDetail.detail"></div>
          </el-descriptions-item>
        </el-descriptions>

        <h3 style="margin-top: 20px">SKU 列表</h3>
        <el-table :data="currentDetail.skuList" border size="small">
          <el-table-column label="图片" width="60" align="center">
            <template #default="{ row }">
              <el-image :src="row.image" style="width: 40px; height: 40px" />
            </template>
          </el-table-column>
          <el-table-column label="规格"> <!-- 替换 -->
            <template #default="{ row }">{{ formatSpecs(row.specs) }}</template>
          </el-table-column>
          <el-table-column prop="price" label="价格">
            <template #default="{ row }">￥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" />
          <el-table-column label="状态" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.container { padding: 20px; background-color: #fff; min-height: calc(100vh - 60px); }
.search-form { margin-bottom: 20px; padding: 15px 15px 0; background-color: #f8f9fa; border-radius: 6px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; padding-bottom: 20px; }
</style>