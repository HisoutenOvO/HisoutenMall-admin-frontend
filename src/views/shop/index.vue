<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type {
  MerchantPageQueryDTO,
  MerchantPageResultVO,
  MerchantDetailVO
} from '@/types/admin/merchant'
import {
  getMerchantPageApi,
  getMerchantDetailApi,
  updateMerchantStatusApi
} from '@/api/admin/merchant'

const searchForm = ref<MerchantPageQueryDTO>({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined
})

const list = ref<MerchantPageResultVO[]>([])
const total = ref(0)

const detailVisible = ref(false)
const detail = ref<MerchantDetailVO | null>(null)

const search = async () => {
  const res = await getMerchantPageApi(searchForm.value)
  if (res.code === 1) {
    list.value = res.data.records
    total.value = res.data.total
  } else {
    ElMessage.error(res.msg)
  }
}

const clear = () => {
  searchForm.value.keyword = ''
  searchForm.value.status = undefined
  searchForm.value.page = 1
  search()
}

const openDetail = async (id: number) => {
  const res = await getMerchantDetailApi(id)
  if (res.code === 1) {
    detail.value = res.data
    detailVisible.value = true
  } else {
    ElMessage.error(res.msg)
  }
}

const toggleStatus = async (row: MerchantPageResultVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  const tip = newStatus === 0
      ? `确认禁用商家【${row.shopName}】吗？禁用后该商家的所有在售商品将被下架。`
      : `确认启用商家【${row.shopName}】吗？`

  try {
    await ElMessageBox.confirm(tip, '提示', { type: 'warning' })
  } catch { return }

  const res = await updateMerchantStatusApi(row.id, newStatus)
  if (res.code === 1) {
    ElMessage.success(`${action}成功`)
    search()
  } else {
    ElMessage.error(res.msg)
  }
}

const auditTagType = (auditStatus: number) => {
  if (auditStatus === 1) return 'success'
  if (auditStatus === 2) return 'danger'
  return 'warning'
}
const auditText = (auditStatus: number) => {
  if (auditStatus === 1) return '通过'
  if (auditStatus === 2) return '驳回'
  return '待审核'
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
  <h1>商家管理</h1>
  <div class="container">
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="店铺名/用户名/联系电话" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 180px" clearable>
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" border style="width: 100%; margin-top: 15px">
      <el-table-column label="Logo" width="80" align="center">
        <template #default="{ row }">
          <el-image :src="row.shopLogo" style="width: 45px; height: 45px" fit="cover">
            <template #error>
              <div style="color: #999; font-size: 12px">无</div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="shopName" label="店铺名称" min-width="150" align="center" />
      <el-table-column prop="username" label="登录名" min-width="120" align="center" />
      <el-table-column prop="contactPhone" label="联系电话" min-width="130" align="center" />
      <el-table-column label="审核状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="auditTagType(row.auditStatus)">
            {{ auditText(row.auditStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="账号状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="入驻时间" width="180" align="center" />
      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openDetail(row.id)">详情</el-button>
          <el-button
              :type="row.status === 1 ? 'danger' : 'success'"
              size="small"
              @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="商家详情" width="600">
      <el-descriptions :column="1" border v-if="detail">
        <el-descriptions-item label="店铺名称">{{ detail.shopName }}</el-descriptions-item>
        <el-descriptions-item label="登录名">{{ detail.username }}</el-descriptions-item>
        <el-descriptions-item label="店铺 Logo">
          <el-image :src="detail.shopLogo" style="width: 80px; height: 80px" fit="cover" />
        </el-descriptions-item>
        <el-descriptions-item label="店铺简介">{{ detail.shopDescription || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="营业执照">
          <el-image :src="detail.businessLicense" style="width: 120px; height: 80px" fit="cover">
            <template #error>
              <span style="color: #999">未上传</span>
            </template>
          </el-image>
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="auditTagType(detail.auditStatus)">
            {{ auditText(detail.auditStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="驳回原因" v-if="detail.auditStatus === 2">
          {{ detail.auditReason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="detail.status === 1 ? 'success' : 'danger'">
            {{ detail.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="入驻时间">{{ detail.createTime }}</el-descriptions-item>
      </el-descriptions>
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