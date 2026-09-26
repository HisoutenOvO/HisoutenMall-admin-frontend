<script setup lang="ts">
import type {
  MerchantProductPageQueryDTO,
  MerchantProductPageResultVO
} from '@/types/merchant/product'
import { nextTick, onMounted, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CategoryListVO } from '@/types/merchant/category'
import {
  addMerchantProductApi,
  deleteMerchantProductLogicApi,
  deleteMerchantProductPhysicalApi,
  getMerchantProductDetailApi,
  getMerchantProductPageApi,
  restoreMerchantProductApi,
  updateMerchantProductApi,
  updateMerchantProductStatusApi
} from '@/api/merchant/product'
import { getMerchantCategoryListApi } from '@/api/merchant/category'

// 当前 tab：normal-在售，recycle-回收站
const activeTab = ref<'normal' | 'recycle'>('normal')

// 搜索表单
const searchProduct = ref<MerchantProductPageQueryDTO>({
  page: 1,
  pageSize: 10,
  keyword: '',
  categoryId: undefined,
  status: undefined,
  deleted: 0
})

// 商品列表
const productList = ref<MerchantProductPageResultVO[]>([])

// 分类列表
const categoryList = ref<CategoryListVO[]>([])

// 分页
const total = ref(0)

// 对话框
const dialogFormVisible = ref(false)
const dialogTitle = ref('')
const productFormRef = ref<FormInstance>()

// 新增/编辑表单
interface ProductForm {
  id?: number
  name: string
  subtitle?: string
  categoryId?: number
  brandId?: number
  mainImage?: string
  detail?: string
}

const product = ref<ProductForm>({
  name: '',
  subtitle: '',
  categoryId: undefined,
  brandId: undefined,
  mainImage: '',
  detail: ''
})

// 分页查询
const search = async () => {
  const result = await getMerchantProductPageApi(searchProduct.value)
  if (result.code === 1) {
    productList.value = result.data.records
    total.value = result.data.total
  } else {
    ElMessage.error(result.msg)
  }
}

// 切换 tab
const handleTabChange = (tab: string | number) => {
  searchProduct.value.deleted = tab === 'recycle' ? 1 : 0
  searchProduct.value.page = 1
  searchProduct.value.status = undefined
  search()
}

// 清空搜索框
const clear = () => {
  searchProduct.value.keyword = ''
  searchProduct.value.categoryId = undefined
  searchProduct.value.status = undefined
  searchProduct.value.page = 1
  search()
}

// 打开新增对话框
const addProduct = async () => {
  dialogTitle.value = '新增商品'
  product.value = {
    name: '',
    subtitle: '',
    categoryId: undefined,
    brandId: undefined,
    mainImage: '',
    detail: ''
  }
  dialogFormVisible.value = true
  await nextTick()
  productFormRef.value?.clearValidate()
}

// 打开编辑对话框
const edit = async (productId: number) => {
  dialogTitle.value = '修改商品'
  const result = await getMerchantProductDetailApi(productId)
  if (result.code === 1) {
    const detail = result.data
    product.value = {
      id: detail.id,
      name: detail.name,
      subtitle: detail.subtitle,
      categoryId: detail.categoryId,
      brandId: detail.brandId,
      mainImage: detail.mainImage,
      detail: detail.detail
    }
    dialogFormVisible.value = true
    await nextTick()
    productFormRef.value?.clearValidate()
  } else {
    ElMessage.error(result.msg)
  }
}

// 保存（新增或修改）
const save = async () => {
  try {
    await productFormRef.value?.validate()
  } catch {
    return
  }
  const formData = {
    name: product.value.name,
    subtitle: product.value.subtitle,
    categoryId: product.value.categoryId,
    brandId: product.value.brandId,
    mainImage: product.value.mainImage,
    detail: product.value.detail
  }

  let result
  if (product.value.id) {
    result = await updateMerchantProductApi(product.value.id, formData)
  } else {
    result = await addMerchantProductApi(formData)
  }

  if (result.code === 1) {
    ElMessage.success(product.value.id ? '修改成功' : '新增成功')
    dialogFormVisible.value = false
    search()
  } else {
    ElMessage.error(result.msg)
  }
}

// 换页
const handleSizeChange = (val: number) => {
  searchProduct.value.pageSize = val
  searchProduct.value.page = 1
  search()
}
const handleCurrentChange = (val: number) => {
  searchProduct.value.page = val
  search()
}

// 加载分类列表
const loadCategoryList = async () => {
  const result = await getMerchantCategoryListApi()
  if (result.code === 1) {
    categoryList.value = result.data
  } else {
    ElMessage.error(result.msg)
  }
}

// 上下架
const toggleStatus = async (productId: number, status: number) => {
  const newStatus = status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确认要${action}该商品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  const result = await updateMerchantProductStatusApi(productId, newStatus)
  if (result.code === 1) {
    ElMessage.success(`${action}成功`)
    search()
  } else {
    ElMessage.error(result.msg)
  }
}

// 逻辑删除（进回收站）
const delById = async (productId: number) => {
  try {
    await ElMessageBox.confirm('确认要删除该商品吗？删除后可在回收站恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  const result = await deleteMerchantProductLogicApi(productId)
  if (result.code === 1) {
    ElMessage.success('已移入回收站')
    search()
  } else {
    ElMessage.error(result.msg)
  }
}

// 恢复
const restore = async (productId: number) => {
  try {
    await ElMessageBox.confirm('确认恢复该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  const result = await restoreMerchantProductApi(productId)
  if (result.code === 1) {
    ElMessage.success('恢复成功')
    search()
  } else {
    ElMessage.error(result.msg)
  }
}

// 彻底删除
const physicalDelete = async (productId: number) => {
  try {
    await ElMessageBox.confirm('彻底删除后无法恢复，确认删除吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
  } catch {
    return
  }
  const result = await deleteMerchantProductPhysicalApi(productId)
  if (result.code === 1) {
    ElMessage.success('已彻底删除')
    search()
  } else {
    ElMessage.error(result.msg)
  }
}

// 校验规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

onMounted(() => {
  loadCategoryList()
  search()
})
</script>

<template>
  <h1>商品管理</h1>
  <div class="container">
    <!-- tab 切换 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="在售商品" name="normal" />
      <el-tab-pane label="回收站" name="recycle" />
    </el-tabs>

    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchProduct">
      <el-form-item label="商品名称">
        <el-input v-model="searchProduct.keyword" placeholder="请输入商品名称" clearable />
      </el-form-item>
      <el-form-item label="按分类查询">
        <el-select v-model="searchProduct.categoryId" placeholder="请选择分类" style="width: 180px" clearable>
          <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <!-- 状态筛选只在"在售"tab显示 -->
      <el-form-item label="状态" v-if="activeTab === 'normal'">
        <el-select v-model="searchProduct.status" placeholder="请选择状态" style="width: 180px" clearable>
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>

    <!-- 新增按钮只在"在售"tab显示 -->
    <el-button v-if="activeTab === 'normal'" type="primary" @click="addProduct">+ 新增商品</el-button>

    <!-- 商品表格 -->
    <el-table :data="productList" border style="width: 100%" class="container">
      <el-table-column prop="name" label="商品名称" width="180" align="center" />
      <el-table-column prop="brandName" label="品牌名称" width="100" align="center" />
      <el-table-column prop="categoryName" label="商品分类" width="100" align="center" />
      <el-table-column prop="mainImage" label="商品图片" width="120" align="center">
        <template #default="scope">
          <el-image :src="scope.row.mainImage" style="width: 60px; height: 60px" fit="cover">
            <template #error>
              <div style="color: #999; font-size: 12px;">暂无</div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="merchantName" label="商家名称" width="140" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="最后操作时间" align="center" />
      <el-table-column label="操作" align="center" width="280">
        <template #default="scope">
          <!-- 正常商品 -->
          <template v-if="scope.row.deleted === 0">
            <el-button type="primary" size="small" @click="edit(scope.row.id)">编辑</el-button>
            <el-button
                :type="scope.row.status === 1 ? 'warning' : 'success'"
                size="small"
                @click="toggleStatus(scope.row.id, scope.row.status)"
            >
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" size="small" @click="delById(scope.row.id)">删除</el-button>
          </template>

          <!-- 回收站 -->
          <template v-else>
            <el-button type="success" size="small" @click="restore(scope.row.id)">恢复</el-button>
            <el-button type="danger" size="small" @click="physicalDelete(scope.row.id)">彻底删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/修改对话框 -->
    <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="500">
      <el-form :model="product" :rules="rules" ref="productFormRef">
        <el-form-item label="商品名称" label-width="80px" prop="name">
          <el-input v-model="product.name" autocomplete="off" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="副标题" label-width="80px" prop="subtitle">
          <el-input v-model="product.subtitle" autocomplete="off" placeholder="请填写商品副标题" />
        </el-form-item>
        <el-form-item label="商品图片" label-width="80px" prop="mainImage">
          <el-input v-model="product.mainImage" autocomplete="off" placeholder="请输入商品图片" />
        </el-form-item>
        <el-form-item label="商品品牌" label-width="80px" prop="brandId">
          <el-select v-model="product.brandId" placeholder="请选择">
            <!-- TODO: 品牌列表 -->
          </el-select>
        </el-form-item>
        <el-form-item label="商品分类" label-width="80px" prop="categoryId">
          <el-select v-model="product.categoryId" placeholder="请选择">
            <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品详情" label-width="80px" prop="detail">
          <el-input v-model="product.detail" type="textarea" :rows="4" placeholder="请填写商品详情" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分页条 -->
    <el-pagination
        v-model:current-page="searchProduct.page"
        v-model:page-size="searchProduct.pageSize"
        :page-sizes="[5, 10, 15, 20, 30, 50]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    />
  </div>
</template>

<style scoped>
.container {
  margin: 20px 0;
}
</style>