<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { BrandPageQueryDTO, BrandPageResultVO } from '@/types/admin/brand'
import {
  getBrandPageApi,
  addBrandApi,
  updateBrandApi,
  updateBrandStatusApi,
  deleteBrandApi
} from '@/api/admin/brand'
import ImageUpload from "@/components/ImageUpload.vue"

const searchForm = ref<BrandPageQueryDTO>({
  page: 1, pageSize: 10, keyword: '', status: undefined
})
const list = ref<BrandPageResultVO[]>([])
const total = ref(0)
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()

interface BrandForm {
  id?: number
  name: string
  logo: string
  sort: number
  status: number
}

const form = ref<BrandForm>({ name: '', logo: '', sort: 0, status: 1 })
const rules = { name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }] }

const search = async () => {
  loading.value = true
  try {
    const res = await getBrandPageApi(searchForm.value)
    if (res.code === 1) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } finally { loading.value = false }
}

const clear = () => {
  searchForm.value.keyword = ''
  searchForm.value.status = undefined
  searchForm.value.page = 1
  void search()
}

const openAdd = async () => {
  dialogTitle.value = '新增品牌'
  form.value = { name: '', logo: '', sort: 0, status: 1 }
  dialogVisible.value = true
  await nextTick()
  formRef.value?.clearValidate()
}

const openEdit = async (row: BrandPageResultVO) => {
  dialogTitle.value = '编辑品牌'
  form.value = { id: row.id, name: row.name, logo: row.logo, sort: row.sort, status: row.status }
  dialogVisible.value = true
  await nextTick()
  formRef.value?.clearValidate()
}

const save = async () => {
  try { await formRef.value?.validate() } catch { return }

  const res = form.value.id
      ? await updateBrandApi(form.value.id, { name: form.value.name, logo: form.value.logo, sort: form.value.sort })
      : await addBrandApi({ name: form.value.name, logo: form.value.logo, sort: form.value.sort, status: form.value.status })

  if (res.code === 1) {
    ElMessage.success(form.value.id ? '修改成功' : '新增成功')
    dialogVisible.value = false
    await search()
  } else { ElMessage.error(res.msg) }
}

const toggleStatus = async (row: BrandPageResultVO) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try { await ElMessageBox.confirm(`确认要${action}品牌【${row.name}】吗？`, '提示', { type: 'warning' }) } catch { return }
  const res = await updateBrandStatusApi(row.id, row.status === 1 ? 0 : 1)
  if (res.code === 1) { ElMessage.success(`${action}成功`); await search() } else { ElMessage.error(res.msg) }
}

const del = async (row: BrandPageResultVO) => {
  try { await ElMessageBox.confirm(`确认删除品牌【${row.name}】吗？`, '警告', { type: 'error' }) } catch { return }
  const res = await deleteBrandApi(row.id)
  if (res.code === 1) { ElMessage.success('删除成功'); await search() } else { ElMessage.error(res.msg) }
}

const handleSizeChange = (val: number) => { searchForm.value.pageSize = val; searchForm.value.page = 1; void search() }
const handleCurrentChange = (val: number) => { searchForm.value.page = val; void search() }

onMounted(() => void search())
</script>

<template>
  <div class="app-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="品牌名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入品牌名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="search">查询</el-button>
          <el-button icon="Refresh" @click="clear">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <div class="table-toolbar">
        <el-button type="primary" icon="Plus" @click="openAdd">新增品牌</el-button>
        <el-tooltip content="刷新" placement="top">
          <el-button circle icon="Refresh" @click="search" />
        </el-tooltip>
      </div>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column label="品牌信息" min-width="200">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 10px;">
              <el-image :src="row.logo" style="width: 40px; height: 40px; border-radius: 4px; border: 1px solid #ebeef5" fit="cover">
                <template #error><div class="img-placeholder">无图</div></template>
              </el-image>
              <span style="font-weight: 500;">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="light" round>
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" link @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="searchForm.page"
            v-model:page-size="searchForm.pageSize"
            :page-sizes="[10, 20, 50]"
            background layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌Logo" prop="logo">
          <ImageUpload v-model="form.logo" width="100px" height="100px" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="!form.id">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-container { padding: 0; }
.search-card { margin-bottom: 16px; border-radius: 8px; border: none; }
.table-card { border-radius: 8px; border: none; }
.table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f7fa; color: #909399; font-size: 12px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>