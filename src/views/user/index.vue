<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UserPageQueryDTO, UserPageResultVO } from '@/types/admin/user'
import { getUserPageApi, updateUserStatusApi } from '@/api/admin/user'

const searchForm = ref<UserPageQueryDTO>({
  page: 1,
  pageSize: 10,
  keyword: '',
  status: undefined
})

const list = ref<UserPageResultVO[]>([])
const total = ref(0)

const search = async () => {
  const res = await getUserPageApi(searchForm.value)
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

const toggleStatus = async (row: UserPageResultVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确认要${action}用户【${row.nickname || row.username}】吗？`, '提示', { type: 'warning' })
  } catch { return }
  const res = await updateUserStatusApi(row.id, newStatus)
  if (res.code === 1) {
    ElMessage.success(`${action}成功`)
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
  <h1>用户管理</h1>
  <div class="container">
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="用户名/昵称/手机号" clearable />
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
      <el-table-column label="头像" width="80" align="center">
        <template #default="{ row }">
          <el-avatar :src="row.avatar" :size="40">
            {{ (row.nickname || row.username).charAt(0) }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" min-width="120" align="center" />
      <el-table-column prop="nickname" label="昵称" min-width="120" align="center" />
      <el-table-column prop="phone" label="手机号" min-width="130" align="center" />
      <el-table-column prop="email" label="邮箱" min-width="160" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" width="180" align="center" />
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
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