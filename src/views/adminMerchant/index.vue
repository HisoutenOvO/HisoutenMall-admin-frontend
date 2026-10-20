<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMerchantPageApi,
  getMerchantDetailApi,
  auditMerchantApi,
  updateMerchantStatusApi
} from '@/api/admin/merchant'
import type {
  AdminMerchantPageQueryDTO,
  AdminMerchantPageResultVO,
  AdminMerchantDetailVO
} from '@/types/admin/merchant'

const searchForm = ref<AdminMerchantPageQueryDTO>({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined,
  auditStatus: undefined
})

const list = ref<AdminMerchantPageResultVO[]>([])
const total = ref(0)
const loading = ref(false)

// === 详情抽屉状态 ===
const drawerVisible = ref(false)
const currentDetail = ref<AdminMerchantDetailVO | null>(null)

// === 审核弹窗状态 ===
const auditDialogVisible = ref(false)
const auditForm = reactive({
  merchantId: 0,
  shopName: '',
  auditStatus: 1,
  auditReason: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMerchantPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

// 打开详情抽屉
const openDetail = async (row: AdminMerchantPageResultVO) => {
  const res = await getMerchantDetailApi(row.id)
  if (res.code === 1) {
    currentDetail.value = res.data
    drawerVisible.value = true
  } else {
    ElMessage.error(res.msg)
  }
}

// 打开审核弹窗
const openAuditDialog = (row: AdminMerchantPageResultVO) => {
  auditForm.merchantId = row.id
  auditForm.shopName = row.shopName
  auditForm.auditStatus = 1
  auditForm.auditReason = ''
  auditDialogVisible.value = true
}

// 提交审核
const submitAudit = async () => {
  if (auditForm.auditStatus === 2 && !auditForm.auditReason) {
    ElMessage.warning('请填写驳回原因')
    return
  }

  const res = await auditMerchantApi(auditForm.merchantId, {
    auditStatus: auditForm.auditStatus,
    auditReason: auditForm.auditStatus === 2 ? auditForm.auditReason : undefined
  })

  if (res.code === 1) {
    ElMessage.success('审核成功')
    auditDialogVisible.value = false
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

// 封禁/解禁
const toggleStatus = async (row: AdminMerchantPageResultVO) => {
  const action = row.status === 1 ? '封禁' : '解禁'
  try {
    await ElMessageBox.confirm(`确认${action}商家【${row.shopName}】吗？`, '警告', { type: 'warning' })
  } catch { return }

  const newStatus = row.status === 1 ? 0 : 1
  const res = await updateMerchantStatusApi(row.id, newStatus)
  if (res.code === 1) {
    ElMessage.success(`${action}成功`)
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

onMounted(loadData)
</script>
<template>
  <div class="container">
    <!-- 搜索区 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="店铺名称">
        <el-input v-model="searchForm.keyword" placeholder="按店名/账号搜索" clearable />
      </el-form-item>

      <el-form-item label="审核状态">
        <el-select v-model="searchForm.auditStatus" placeholder="全部" clearable style="width: 120px">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>
      </el-form-item>

      <!-- 补充的账号状态查询 -->
      <el-form-item label="账号状态">
        <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="正常" :value="1" />
          <el-option label="已封禁" :value="0" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="searchForm.page=1; loadData()">查询</el-button>
        <!-- 重置按钮补全 status 的清空 -->
        <el-button @click="searchForm.keyword=''; searchForm.auditStatus=undefined; searchForm.status=undefined; loadData()">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区（直接铺满） -->
    <el-table :data="list" v-loading="loading" border stripe class="main-table">
      <el-table-column prop="shopLogo" label="Logo" width="80" align="center">
        <template #default="{ row }">
          <el-avatar shape="square" :src="row.shopLogo" />
        </template>
      </el-table-column>
      <el-table-column prop="shopName" label="店铺名称" min-width="150" />
      <el-table-column prop="username" label="登录账号" width="120" />
      <el-table-column prop="contactPhone" label="联系电话" width="130" />

      <el-table-column label="审核状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.auditStatus == 0" type="warning">待审核</el-tag>
          <el-tag v-else-if="row.auditStatus == 1" type="success">已通过</el-tag>
          <el-tag v-else-if="row.auditStatus == 2" type="danger">已驳回</el-tag>
          <el-tag v-else type="info">未知({{ row.auditStatus }})</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="账号状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'primary' : 'info'">
            {{ row.status === 1 ? '正常' : '已封禁' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="入驻时间" width="180" />

      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="info" size="small" @click="openDetail(row)">详情</el-button>
          <el-button
              v-if="row.auditStatus === 0"
              type="primary"
              size="small"
              @click="openAuditDialog(row)"
          >去审核</el-button>
          <el-button
              :type="row.status === 1 ? 'danger' : 'success'"
              size="small"
              :disabled="row.auditStatus !== 1"
              @click="toggleStatus(row)"
          >{{ row.status === 1 ? '封禁' : '解禁' }}</el-button>
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

    <!-- 商家详情弹窗（顺手把抽屉改成弹窗了） -->
    <el-dialog v-model="drawerVisible" title="商家详情" width="650px">
      <div v-if="currentDetail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="登录账号">{{ currentDetail.username }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="店铺名称">{{ currentDetail.shopName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDetail.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="店铺简介">{{ currentDetail.shopDescription || '无' }}</el-descriptions-item>

          <el-descriptions-item label="店铺Logo">
            <el-image
                v-if="currentDetail.shopLogo"
                :src="currentDetail.shopLogo"
                style="max-width: 100px; border-radius: 4px;"
                :preview-src-list="[currentDetail.shopLogo]"
            />
            <span v-else>未上传</span>
          </el-descriptions-item>

          <el-descriptions-item label="营业执照">
            <el-image
                v-if="currentDetail.businessLicense"
                :src="currentDetail.businessLicense"
                style="max-width: 200px; border-radius: 4px;"
                :preview-src-list="[currentDetail.businessLicense]"
            />
            <span v-else>未上传</span>
          </el-descriptions-item>

          <el-descriptions-item label="审核状态">
            <el-tag v-if="currentDetail.auditStatus === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="currentDetail.auditStatus === 1" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已驳回</el-tag>
          </el-descriptions-item>

          <el-descriptions-item v-if="currentDetail.auditStatus === 2" label="驳回原因">
            {{ currentDetail.auditReason }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="drawerVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="商家入驻审核" width="500px">
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="店铺名称">
          <span style="font-weight: bold;">{{ auditForm.shopName }}</span>
        </el-form-item>
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.auditStatus">
            <el-radio :label="1">审核通过</el-radio>
            <el-radio :label="2">审核驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="auditForm.auditStatus === 2" label="驳回原因">
          <el-input v-model="auditForm.auditReason" type="textarea" :rows="3" placeholder="请填写驳回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 去除原来多余的边距，让它和分类管理页一样铺满 */
.container {
  padding: 20px;
  background-color: #fff; /* 直接给白底 */
  min-height: calc(100vh - 60px); /* 减去 Header 的高度 */
}
.search-form {
  margin-bottom: 20px;
  padding: 15px 15px 0;
  background-color: #f8f9fa; /* 给搜索区一个极浅的灰色背景区分开 */
  border-radius: 6px;
}
.main-table {
  width: 100%;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 20px;
}
</style>