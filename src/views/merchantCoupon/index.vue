<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {ElMessage, ElMessageBox, type FormInstance} from 'element-plus'
import {
  getMerchantCouponPageApi,
  getMerchantCouponDetailApi,
  addMerchantCouponApi,
  updateMerchantCouponApi, deleteMerchantCouponApi
} from '@/api/merchant/coupon'
import type {
  MerchantCouponPageQueryDTO,
  MerchantCouponPageResultVO,
  MerchantCouponDetailVO,
  MerchantCouponAddDTO,
  MerchantCouponUpdateDTO
} from '@/types/merchant/coupon'

const searchForm = ref<MerchantCouponPageQueryDTO>({
  page: 1, pageSize: 10, keyword: '', status: undefined, type: undefined
})
const list = ref<MerchantCouponPageResultVO[]>([])
const total = ref(0)
const loading = ref(false)

// ====== 弹窗状态 ======
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const couponId = ref(0)
const couponDetail = ref<MerchantCouponDetailVO | null>(null)
const formRef = ref<FormInstance>()

// 表单数据
const formData = ref<MerchantCouponAddDTO>({
  name: '',
  type: 1, // 默认满减
  value: 0,
  minAmount: 0,
  startTime: '',
  endTime: '',
  total: 100
})

const rules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入面额或折扣', trigger: 'blur' }],
  total: [{ required: true, message: '请输入发放总量', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMerchantCouponPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

// 打开新增
const openAdd = () => {
  isEdit.value = false
  formData.value = {
    name: '', type: 1, value: 0, minAmount: 0,
    startTime: '', endTime: '', total: 100
  }
  formDialogVisible.value = true
}

// 打开编辑（只能改名称和结束时间）
const openEdit = async (id: number) => {
  isEdit.value = true
  couponId.value = id
  const res = await getMerchantCouponDetailApi(id)
  if (res.code === 1) {
    const d = res.data
    formData.value = {
      name: d.name, type: d.type, value: d.value, minAmount: d.minAmount,
      startTime: d.startTime, endTime: d.endTime, total: d.total
    }
    formDialogVisible.value = true
  }
}

// 保存
const save = async () => {
  try {
    await formRef.value?.validate()
  } catch { return }

  if (formData.value.type === 1 && formData.value.value >= formData.value.minAmount) {
    ElMessage.warning('满减金额必须小于使用门槛')
    return
  }

  let res
  if (isEdit.value) {
    // 调用修改接口，只传 name 和 endTime
    const updateData: MerchantCouponUpdateDTO = {
      name: formData.value.name,
      endTime: formData.value.endTime
    }
    res = await updateMerchantCouponApi(couponId.value, updateData)
  } else {
    // 调用新增接口
    res = await addMerchantCouponApi(formData.value)
  }

  if (res.code === 1) {
    ElMessage.success(isEdit.value ? '修改成功' : '发布成功')
    formDialogVisible.value = false
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认要删除该优惠券吗？如果已被用户领取或活动进行中，将无法删除。', '警告', {
      type: 'warning'
    })
  } catch {
    return
  }

  const res = await deleteMerchantCouponApi(id)
  if (res.code === 1) {
    ElMessage.success('删除成功')
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

// 查看详情
const openDetail = async (id: number) => {
  const res = await getMerchantCouponDetailApi(id)
  if (res.code === 1) {
    couponDetail.value = res.data
    detailDialogVisible.value = true
  }
}

const formatType = (type: number) => type === 1 ? '满减' : '折扣'
const formatValue = (row: any) => {
  return row.type === 1 ? `减 ￥${row.value}` : `${row.value * 10} 折`
}
const formatStatus = (status: number) => {
  const map = { 0: '未开始', 1: '进行中', 2: '已结束' }
  return map[status as keyof typeof map] || '未知'
}
const getStatusType = (status: number) => {
  const map = { 0: 'warning', 1: 'success', 2: 'info' }
  return map[status as keyof typeof map] || 'info'
}

onMounted(loadData)
</script>

<template>
  <div class="container">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="券名称">
        <el-input v-model="searchForm.keyword" placeholder="按名称搜索" clearable />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 120px">
          <el-option label="满减券" :value="1" />
          <el-option label="折扣券" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchForm.page=1; loadData()">查询</el-button>
        <el-button @click="searchForm.keyword=''; searchForm.type=undefined; loadData()">重置</el-button>
        <el-button type="success" @click="openAdd">发布优惠券</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="name" label="优惠券名称" width="280" align="center" />
      <el-table-column label="面额/门槛" width="250" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.type === 1 ? 'danger' : 'warning'" style="margin-right: 5px">
            {{ formatType(row.type) }}
          </el-tag>
          <span style="font-weight: bold; color: #e1251b;">{{ formatValue(row) }}</span>
          <span v-if="row.minAmount > 0" style="color: #999; font-size: 12px; margin-left: 5px;">
            (满{{ row.minAmount }}用)
          </span>
        </template>
      </el-table-column>
      <el-table-column label="库存(剩余/总量)" width="160" align="center">
        <template #default="{ row }">
          <span :style="{ color: row.remain === 0 ? '#f56c6c' : '' }">{{ row.remain }}</span> / {{ row.total }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ formatStatus(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openEdit(row.id)">编辑</el-button>
          <el-button type="info" size="small" @click="openDetail(row.id)">详情</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
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

    <!-- 新增/修改弹窗 -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '修改优惠券' : '发布优惠券'" width="550px">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="券名称" prop="name">
          <el-input v-model="formData.name" placeholder="如：双十一大促满减券" />
        </el-form-item>

        <el-form-item label="券类型" prop="type">
          <el-radio-group v-model="formData.type" :disabled="isEdit">
            <el-radio :label="1">满减券</el-radio>
            <el-radio :label="2">折扣券</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="formData.type === 1 ? '抵扣金额' : '折扣率(如0.85)'" prop="value">
          <el-input-number v-model="formData.value" :precision="2" :step="formData.type === 1 ? 10 : 0.05" :min="0" :disabled="isEdit" style="width: 100%" />
        </el-form-item>

        <el-form-item label="最低门槛" prop="minAmount">
          <el-input-number v-model="formData.minAmount" :precision="2" :step="10" :min="0" :disabled="isEdit" style="width: 100%" />
        </el-form-item>

        <el-form-item label="发放总量" prop="total">
          <el-input-number v-model="formData.total" :min="1" :disabled="isEdit" style="width: 100%" />
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
              v-model="formData.startTime" type="datetime" placeholder="开始时间"
              value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
              v-model="formData.endTime" type="datetime" placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="优惠券详情" width="500px">
      <el-descriptions v-if="couponDetail" :column="1" border>
        <el-descriptions-item label="券名称">{{ couponDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="面额/门槛">
          {{ formatValue(couponDetail) }}，满 {{ couponDetail.minAmount }} 元可用
        </el-descriptions-item>
        <el-descriptions-item label="发放情况">
          总量 {{ couponDetail.total }} 张，剩余 {{ couponDetail.remain }} 张
        </el-descriptions-item>
        <el-descriptions-item label="有效期">
          {{ couponDetail.startTime }} <br/> 至 <br/> {{ couponDetail.endTime }}
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(couponDetail.status)" size="small">
            {{ formatStatus(couponDetail.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.container { padding: 20px; background: #fff; min-height: calc(100vh - 60px); }
.search-form { margin-bottom: 20px; padding: 15px 15px 0; background: #f8f9fa; border-radius: 6px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; padding-bottom: 20px; }
</style>