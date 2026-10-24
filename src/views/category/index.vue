<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CategoryTreeVO } from '@/types/admin/category'
import { getCategoryTreeApi, addCategoryApi, updateCategoryApi, updateCategoryStatusApi, deleteCategoryApi } from '@/api/admin/category'

const tree = ref<CategoryTreeVO[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()

interface CategoryForm {
  id?: number
  parentId: number
  name: string
  sort: number
}

const form = ref<CategoryForm>({ parentId: 0, name: '', sort: 0 })
const rules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }

const parentOptions = computed(() => {
  const result: { id: number; name: string; level: number }[] = [{ id: 0, name: '顶级分类', level: 0 }]
  const walk = (list: CategoryTreeVO[]) => {
    for (const c of list) {
      if (c.level <= 2) {
        result.push({ id: c.id, name: c.name, level: c.level })
        if (c.children && c.children.length) walk(c.children)
      }
    }
  }
  walk(tree.value)
  return result
})

const loadTree = async () => {
  loading.value = true
  try {
    const res = await getCategoryTreeApi()
    if (res.code === 1) tree.value = res.data
  } finally { loading.value = false }
}

const openAdd = async (parentId: number = 0) => {
  dialogTitle.value = '新增分类'
  form.value = { parentId, name: '', sort: 0 }
  dialogVisible.value = true
  await nextTick()
  formRef.value?.clearValidate()
}

const openEdit = async (row: CategoryTreeVO) => {
  dialogTitle.value = '编辑分类'
  form.value = { id: row.id, parentId: row.parentId, name: row.name, sort: row.sort }
  dialogVisible.value = true
  await nextTick()
  formRef.value?.clearValidate()
}

const save = async () => {
  try { await formRef.value?.validate() } catch { return }

  const res = form.value.id
      ? await updateCategoryApi(form.value.id, { name: form.value.name, sort: form.value.sort })
      : await addCategoryApi({ parentId: form.value.parentId, name: form.value.name, sort: form.value.sort })

  if (res.code === 1) {
    ElMessage.success(form.value.id ? '修改成功' : '新增成功')
    dialogVisible.value = false
    await loadTree()
  } else { ElMessage.error(res.msg) }
}

const toggleStatus = async (row: CategoryTreeVO) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try { await ElMessageBox.confirm(`确认要${action}分类【${row.name}】吗？`, '提示', { type: 'warning' }) } catch { return }
  const res = await updateCategoryStatusApi(row.id, row.status === 1 ? 0 : 1)
  if (res.code === 1) { ElMessage.success(`${action}成功`); await loadTree() } else { ElMessage.error(res.msg) }
}

const del = async (row: CategoryTreeVO) => {
  try { await ElMessageBox.confirm(`确认删除分类【${row.name}】吗？`, '警告', { type: 'error' }) } catch { return }
  const res = await deleteCategoryApi(row.id)
  if (res.code === 1) { ElMessage.success('删除成功'); await loadTree() } else { ElMessage.error(res.msg) }
}

onMounted(() => void loadTree())
</script>

<template>
  <div class="app-container">
    <el-card class="table-card" shadow="never">
      <div class="table-toolbar">
        <el-button type="primary" icon="Plus" @click="openAdd(0)">新增一级分类</el-button>
        <el-tooltip content="刷新" placement="top">
          <el-button circle icon="Refresh" @click="loadTree" />
        </el-tooltip>
      </div>

      <el-table
          :data="tree" v-loading="loading"
          row-key="id" :tree-props="{ children: 'children' }" default-expand-all
          style="width: 100%"
      >
        <el-table-column prop="name" label="分类名称" min-width="200">
          <template #default="{ row }">
            <span style="font-weight: 500;">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="层级" width="100" align="center" />
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="light" round>
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.level < 3" type="primary" link @click="openAdd(row.id)">新增子分类</el-button>
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" link @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="父分类" prop="parentId">
          <el-select v-model="form.parentId" :disabled="!!form.id" placeholder="请选择" style="width: 100%">
            <el-option
                v-for="opt in parentOptions" :key="opt.id"
                :label="opt.level === 0 ? opt.name : '　'.repeat(opt.level) + opt.name"
                :value="opt.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
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
.table-card { border-radius: 8px; border: none; }
.table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
</style>