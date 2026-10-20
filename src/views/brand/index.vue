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
import ImageUpload from "@/components/ImageUpload.vue";

const searchForm = ref<BrandPageQueryDTO>({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined
})

const list = ref<BrandPageResultVO[]>([])
const total = ref(0)

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

const form = ref<BrandForm>({
  name: '',
  logo: '',
  sort: 0,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }]
}

const search = async () => {
  const res = await getBrandPageApi(searchForm.value)
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

const openAdd = async () => {
  dialogTitle.value = '新增品牌'
  form.value = { name: '', logo: '', sort: 0, status: 1 }
  dialogVisible.value = true
  await nextTick()
  formRef.value?.clearValidate()
}

const openEdit = async (row: BrandPageResultVO) => {
  dialogTitle.value = '编辑品牌'
  form.value = {
    id: row.id,
    name: row.name,
    logo: row.logo,
    sort: row.sort,
    status: row.status
  }
  dialogVisible.value = true
  await nextTick()
  formRef.value?.clearValidate()
}

const save = async () => {
  try {
    await formRef.value?.validate()
  } catch { return }

  let res
  if (form.value.id) {
    res = await updateBrandApi(form.value.id, {
      name: form.value.name,
      logo: form.value.logo,
      sort: form.value.sort
    })
  } else {
    res = await addBrandApi({
      name: form.value.name,
      logo: form.value.logo,
      sort: form.value.sort,
      status: form.value.status
    })
  }
  if (res.code === 1) {
    ElMessage.success(form.value.id ? '修改成功' : '新增成功')
    dialogVisible.value = false
    search()
  } else {
    ElMessage.error(res.msg)
  }
}

const toggleStatus = async (row: BrandPageResultVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确认要${action}品牌【${row.name}】吗？`, '提示', { type: 'warning' })
  } catch { return }
  const res = await updateBrandStatusApi(row.id, newStatus)
  if (res.code === 1) {
    ElMessage.success(`${action}成功`)
    search()
  } else {
    ElMessage.error(res.msg)
  }
}

const del = async (row: BrandPageResultVO) => {
  try {
    await ElMessageBox.confirm(`确认删除品牌【${row.name}】吗？`, '提示', { type: 'warning' })
  } catch { return }
  const res = await deleteBrandApi(row.id)
  if (res.code === 1) {
    ElMessage.success('删除成功')
    search()
  } else {
    ElMessage.error(res.msg)
  }
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
  <h1>品牌管理</h1>
  <div class="container">
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="品牌名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入品牌名称" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 180px" clearable>
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" @click="openAdd">+ 新增品牌</el-button>

    <el-table :data="list" border style="width: 100%; margin-top: 15px">
      <el-table-column prop="name" label="品牌名称" min-width="150" align="center" />
      <el-table-column label="Logo" width="120" align="center">
        <template #default="{ row }">
          <el-image :src="row.logo" style="width: 60px; height: 60px" fit="cover">
            <template #error>
              <div style="color: #999; font-size: 12px">暂无</div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="最后操作时间" align="center" />
      <el-table-column label="操作" width="240" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" size="small" @click="del(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌Logo" prop="logo">
          <ImageUpload v-model="form.logo" width="100px" height="100px" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model.number="form.sort" type="number" />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="!form.id">
          <el-select v-model="form.status">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
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