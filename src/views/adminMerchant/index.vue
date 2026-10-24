<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMerchantPageApi, getMerchantDetailApi, auditMerchantApi, updateMerchantStatusApi } from '@/api/admin/merchant'
import type { AdminMerchantPageQueryDTO, AdminMerchantPageResultVO, AdminMerchantDetailVO } from '@/types/admin/merchant'

const searchForm = ref<AdminMerchantPageQueryDTO>({
  page: 1, pageSize: 10, keyword: '', status: undefined, auditStatus: undefined
})
const list = ref<AdminMerchantPageResultVO[]>([])
const total = ref(0)
const loading = ref(false)

const drawerVisible = ref(false)
const currentDetail = ref<AdminMerchantDetailVO | null>(null)

const auditDialogVisible = ref(false)
const auditForm = reactive({ merchantId: 0, shopName: '', auditStatus: 1, auditReason: '' })

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMerchantPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally { loading.value = false }
}

const openDetail = async (row: AdminMerchantPageResultVO) => {
  const res = await getMerchantDetailApi(row.id)
  if (res.code === 1) {
    currentDetail.value = res.data
    drawerVisible.value = true
  } else { ElMessage.error(res.msg) }
}

const openAuditDialog = (row: AdminMerchantPageResultVO) => {
  auditForm.merchantId = row.id
  auditForm.shopName = row.shopName
  auditForm.auditStatus = 1
  auditForm.auditReason = ''
  auditDialogVisible.value = true
}

const submitAudit = async () => {
  if (auditForm.auditStatus === 2 && !auditForm.auditReason) return ElMessage.warning('请填写驳回原因')
  const res = await auditMerchantApi(auditForm.merchantId, {
    auditStatus: auditForm.auditStatus,
    auditReason: auditForm.auditStatus === 2 ? auditForm.auditReason : undefined
  })
  if (res.code === 1) { ElMessage.success('审核成功'); auditDialogVisible.value = false; await loadData() } else { ElMessage.error(res.msg) }
}

const toggleStatus = async (row: AdminMerchantPageResultVO) => {
  const action = row.status === 1 ? '封禁' : '解禁'
  try { await ElMessageBox.confirm(`确认${action}商家【${row.shopName}】吗？`, '警告', { type: 'warning' }) } catch { return }
  const res = await updateMerchantStatusApi(row.id, row.status === 1 ? 0 : 1)
  if (res.code === 1) { ElMessage.success(`${action}成功`); await loadData() } else { ElMessage.error(res.msg) }
}

onMounted(() => void loadData())
</script>

<template>
  <div class="app-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="店铺名称">
          <el-input v-model="searchForm.keyword" placeholder="按店名/账号搜索" clearable />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.auditStatus" placeholder="全部" clearable style="width: 120px">
            <el-option label="待审核" :value="0" /><el-option label="已通过" :value="1" /><el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" :value="1" /><el-option label="已封禁" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="searchForm.page=1; loadData()">查询</el-button>
          <el-button icon="Refresh" @click="searchForm.keyword=''; searchForm.auditStatus=undefined; searchForm.status=undefined; loadData()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <div class="table-toolbar">
        <el-tooltip content="刷新" placement="top">
          <el-button circle icon="Refresh" @click="loadData" />
        </el-tooltip>
      </div>
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column label="商家信息" min-width="200">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 10px;">
              <el-avatar shape="square" :src="row.shopLogo" />
              <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 500;">{{ row.shopName }}</span>
                <span style="font-size: 12px; color: #909399;">账号: {{ row.username }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.auditStatus == 0" type="warning" effect="light" round>待审核</el-tag>
            <el-tag v-else-if="row.auditStatus == 1" type="success" effect="light" round>已通过</el-tag>
            <el-tag v-else type="danger" effect="light" round>已驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'primary' : 'info'" effect="light" round>{{ row.status === 1 ? '正常' : '已封禁' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="入驻时间" width="180" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">详情</el-button>
            <el-button v-if="row.auditStatus === 0" type="warning" link @click="openAuditDialog(row)">去审核</el-button>
            <el-button :type="row.status === 1 ? 'danger' : 'success'" link :disabled="row.auditStatus !== 1" @click="toggleStatus(row)">
              {{ row.status === 1 ? '封禁' : '解禁' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination v-model:current-page="searchForm.page" v-model:page-size="searchForm.pageSize"
                       :total="total" :page-sizes="[10, 20, 50]" background layout="total, sizes, prev, pager, next, jumper"
                       @size-change="loadData" @current-change="loadData" />
      </div>
    </el-card>

    <el-dialog v-model="drawerVisible" title="商家详情" width="650px">
      <div v-if="currentDetail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="登录账号">{{ currentDetail.username }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="店铺名称">{{ currentDetail.shopName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDetail.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="店铺简介">{{ currentDetail.shopDescription || '无' }}</el-descriptions-item>
          <el-descriptions-item label="店铺Logo">
            <el-image v-if="currentDetail.shopLogo" :src="currentDetail.shopLogo" style="max-width: 100px; border-radius: 4px;" :preview-src-list="[currentDetail.shopLogo]" />
            <span v-else>未上传</span>
          </el-descriptions-item>
          <el-descriptions-item label="营业执照">
            <el-image v-if="currentDetail.businessLicense" :src="currentDetail.businessLicense" style="max-width: 200px; border-radius: 4px;" :preview-src-list="[currentDetail.businessLicense]" />
            <span v-else>未上传</span>
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag v-if="currentDetail.auditStatus === 0" type="warning" round>待审核</el-tag>
            <el-tag v-else-if="currentDetail.auditStatus === 1" type="success" round>已通过</el-tag>
            <el-tag v-else type="danger" round>已驳回</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentDetail.auditStatus === 2" label="驳回原因">{{ currentDetail.auditReason }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer><el-button @click="drawerVisible = false">关闭</el-button></template>
    </el-dialog>

    <el-dialog v-model="auditDialogVisible" title="商家入驻审核" width="500px">
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="店铺名称"><span style="font-weight: bold;">{{ auditForm.shopName }}</span></el-form-item>
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
.app-container { padding: 0; }
.search-card { margin-bottom: 16px; border-radius: 8px; border: none; }
.table-card { border-radius: 8px; border: none; }
.table-toolbar { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 16px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>