<script setup lang="ts">
import type {
  MerchantProductPageQueryDTO,
  MerchantProductPageResultVO
} from '@/types/merchant/product'
import ImageUpload from '@/components/ImageUpload.vue'
import { nextTick, onMounted, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CategoryTreeVO } from '@/types/common/category'
import { getMerchantCategoryTreeApi } from '@/api/merchant/category'
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
import type { BrandListVO } from '@/types/common/brand'
import { getMerchantBrandListApi } from '@/api/merchant/brand'
import SkuManageDialog from '@/components/SkuManageDialog.vue'

const skuDialogVisible = ref(false)
const skuDialogProductId = ref<number | null>(null)
const loading = ref(false)


const openSkuDialog = () => {
  if (!product.value.id) return
  skuDialogProductId.value = product.value.id
  skuDialogVisible.value = true
}

// ================= SKU 规格解析与组装 =================

// 解析后端 JSON 到前端数组
const parseSpecsToArray = (specsStr?: string) => {
  if (!specsStr) return [{ name: '', value: '' }]
  try {
    const obj = JSON.parse(specsStr)
    const arr = Object.entries(obj).map(([name, value]) => ({ name, value: String(value) }))
    return arr.length ? arr : [{ name: '', value: '' }]
  } catch {
    // 兼容非 JSON 老数据
    return [{ name: '规格', value: specsStr }]
  }
}

// 将前端数组组装成 JSON
const buildSpecsJson = (specsArray: any[]) => {
  const obj: Record<string, string> = {}
  specsArray.forEach(item => {
    if (item.name && item.value) {
      obj[item.name] = item.value
    }
  })
  return Object.keys(obj).length > 0 ? JSON.stringify(obj) : ''
}

// 刷新 SKU 弹窗后的回显
const handleSkuRefresh = async () => {
  if (!product.value.id) return
  const res = await getMerchantProductDetailApi(product.value.id)
  if (res.code === 1) {
    product.value.skuList = res.data.skuList
        .filter((s: any) => s.deleted === 0)
        .map((s: any) => ({
          skuId: s.id,
          specsArray: parseSpecsToArray(s.specs),
          price: s.price,
          stock: s.stock,
          image: s.image
        }))
  }
}

// ================= 表单核心数据 =================

const activeTab = ref<'normal' | 'recycle'>('normal')
const searchProduct = ref<MerchantProductPageQueryDTO>({
  page: 1, pageSize: 10, keyword: '', categoryId: undefined, brandId: undefined, status: undefined, deleted: 0
})

const productList = ref<MerchantProductPageResultVO[]>([])
const categoryTree = ref<CategoryTreeVO[]>([])
const brandList = ref<BrandListVO[]>([])
const total = ref(0)

const dialogFormVisible = ref(false)
const dialogTitle = ref('')
const productFormRef = ref<FormInstance>()

interface ProductForm {
  id?: number
  name: string
  subtitle?: string
  categoryId?: number
  brandId?: number
  mainImage?: string
  detail?: string
  skuList: any[]
}

const product = ref<ProductForm>({
  name: '', subtitle: '', categoryId: undefined, brandId: undefined, mainImage: '', detail: '', skuList: []
})

// ================= 数据查询与操作 =================

const search = async () => {
  loading.value = true
  try {
    const result = await getMerchantProductPageApi(searchProduct.value)
    if (result.code === 1) {
      productList.value = result.data.records
      total.value = result.data.total
    } else {
      ElMessage.error(result.msg)
    }
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab: string | number) => {
  searchProduct.value.deleted = tab === 'recycle' ? 1 : 0
  searchProduct.value.page = 1
  searchProduct.value.status = undefined
  void search()
}

const clear = () => {
  searchProduct.value.keyword = ''
  searchProduct.value.categoryId = undefined
  searchProduct.value.status = undefined
  searchProduct.value.page = 1
  void search()
}

const addProduct = async () => {
  dialogTitle.value = '新增商品'
  product.value = {
    name: '', subtitle: '', categoryId: undefined, brandId: undefined, mainImage: '', detail: '',
    skuList: [{ specsArray: [{ name: '', value: '' }], price: 0, stock: 0, image: '' }]
  }
  dialogFormVisible.value = true
  await nextTick()
  productFormRef.value?.clearValidate()
}

const edit = async (productId: number) => {
  dialogTitle.value = '修改商品'
  const result = await getMerchantProductDetailApi(productId)
  if (result.code === 1) {
    const detail = result.data
    const skuList = (detail.skuList || [])
        .filter((s: any) => s.deleted === 0)
        .map((s: any) => ({
          skuId: s.id,
          specsArray: parseSpecsToArray(s.specs),
          price: s.price,
          stock: s.stock,
          image: s.image
        }))

    product.value = {
      id: detail.id, name: detail.name, subtitle: detail.subtitle, categoryId: detail.categoryId,
      brandId: detail.brandId, mainImage: detail.mainImage, detail: detail.detail, skuList: skuList
    }

    dialogFormVisible.value = true
    await nextTick()
    productFormRef.value?.clearValidate()
  } else {
    ElMessage.error(result.msg)
  }
}

const save = async () => {
  try {
    await productFormRef.value?.validate()
  } catch { return }

  if (!product.value.skuList || product.value.skuList.length === 0) {
    ElMessage.error('至少需要一个 SKU')
    return
  }

  // 组装数据
  const formattedSkuList = product.value.skuList.map((sku: any) => ({
    skuId: sku.skuId,
    price: sku.price,
    stock: sku.stock,
    image: sku.image,
    specs: buildSpecsJson(sku.specsArray)
  }))

  const formData = {
    name: product.value.name,
    subtitle: product.value.subtitle,
    categoryId: product.value.categoryId,
    brandId: product.value.brandId,
    mainImage: product.value.mainImage,
    detail: product.value.detail,
    skuList: formattedSkuList
  }

  const result = product.value.id
      ? await updateMerchantProductApi(product.value.id, formData)
      : await addMerchantProductApi(formData)

  if (result.code === 1) {
    ElMessage.success(product.value.id ? '修改成功' : '新增成功')
    dialogFormVisible.value = false
    await search()
  } else {
    ElMessage.error(result.msg)
  }
}

// ================= SKU 动态行操作 =================

const addSkuRow = () => {
  product.value.skuList.push({ specsArray: [{ name: '', value: '' }], price: 0, stock: 0, image: '' })
}

const removeSkuRow = (index: number) => {
  if (product.value.skuList.length <= 1) {
    ElMessage.warning('至少保留一个 SKU')
    return
  }
  product.value.skuList.splice(index, 1)
}

// 操作单个 SKU 内部的多属性数组
const addSpecItem = (skuRow: any) => {
  skuRow.specsArray.push({ name: '', value: '' })
}

const removeSpecItem = (skuRow: any, specIndex: number) => {
  if (skuRow.specsArray.length <= 1) {
    ElMessage.warning('至少保留一个规格属性')
    return
  }
  skuRow.specsArray.splice(specIndex, 1)
}

// ================= 分页与其他操作 =================

const handleSizeChange = (val: number) => {
  searchProduct.value.pageSize = val
  searchProduct.value.page = 1
  void search()
}
const handleCurrentChange = (val: number) => {
  searchProduct.value.page = val
  void search()
}

const loadCategoryTree = async () => {
  const result = await getMerchantCategoryTreeApi()
  if (result.code === 1) {
    categoryTree.value = result.data
  } else {
    ElMessage.error(result.msg)
  }
}

const loadBrandList = async () => {
  const result = await getMerchantBrandListApi()
  if (result.code === 1) {
    brandList.value = result.data
  } else {
    ElMessage.error(result.msg)
  }
}

const toggleStatus = async (productId: number, status: number) => {
  const newStatus = status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确认要${action}该商品吗？`, '提示', { type: 'warning' })
  } catch { return }
  const result = await updateMerchantProductStatusApi(productId, newStatus)
  if (result.code === 1) {
    ElMessage.success(`${action}成功`)
    await search()
  } else {
    ElMessage.error(result.msg)
  }
}

const delById = async (productId: number) => {
  try {
    await ElMessageBox.confirm('确认要删除该商品吗？删除后可在回收站恢复', '提示', { type: 'warning' })
  } catch { return }
  const result = await deleteMerchantProductLogicApi(productId)
  if (result.code === 1) {
    ElMessage.success('已移入回收站')
    await search()
  } else {
    ElMessage.error(result.msg)
  }
}

const restore = async (productId: number) => {
  try {
    await ElMessageBox.confirm('确认恢复该商品吗？', '提示', { type: 'warning' })
  } catch { return }
  const result = await restoreMerchantProductApi(productId)
  if (result.code === 1) {
    ElMessage.success('恢复成功')
    await search()
  } else {
    ElMessage.error(result.msg)
  }
}

const physicalDelete = async (productId: number) => {
  try {
    await ElMessageBox.confirm('彻底删除后无法恢复，确认删除吗？', '警告', { type: 'error' })
  } catch { return }
  const result = await deleteMerchantProductPhysicalApi(productId)
  if (result.code === 1) {
    ElMessage.success('已彻底删除')
    await search()
  } else {
    ElMessage.error(result.msg)
  }
}

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

onMounted(() => {
  void loadCategoryTree()
  void loadBrandList()
  void search()
})
</script>

<template>
  <div class="app-container">
    <!-- 1. 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <!-- 状态 Tab 放进卡片里，显得更紧凑 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">
        <el-tab-pane label="在售商品" name="normal" />
        <el-tab-pane label="回收站" name="recycle" />
      </el-tabs>

      <el-form :inline="true" :model="searchProduct" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchProduct.keyword" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader
              v-model="searchProduct.categoryId"
              :options="categoryTree"
              :props="{ value: 'id', label: 'name', checkStrictly: true, emitPath: false }"
              placeholder="请选择分类"
              clearable
              style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="searchProduct.brandId" placeholder="请选择品牌" style="width: 160px" clearable>
            <el-option v-for="b in brandList" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" v-if="activeTab === 'normal'">
          <el-select v-model="searchProduct.status" placeholder="请选择状态" style="width: 120px" clearable>
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="search">查询</el-button>
          <el-button icon="Refresh" @click="clear">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 2. 数据表格卡片 -->
    <el-card class="table-card" shadow="never">
      <!-- 顶部操作栏 -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button v-if="activeTab === 'normal'" type="primary" icon="Plus" @click="addProduct">新增商品</el-button>
        </div>
        <div class="toolbar-right">
          <!-- 可以放刷新按钮或导出按钮 -->
          <el-tooltip content="刷新" placement="top">
            <el-button circle icon="Refresh" @click="search" />
          </el-tooltip>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="productList" v-loading="loading" style="width: 100%">
        <el-table-column label="商品信息" min-width="280">
          <template #default="scope">
            <div class="product-info-cell">
              <el-image :src="scope.row.mainImage" class="product-img" fit="cover">
                <template #error>
                  <div class="img-placeholder">无图</div>
                </template>
              </el-image>
              <div class="product-meta">
                <span class="product-name">{{ scope.row.name }}</span>
                <span class="product-brand">{{ scope.row.brandName || '无品牌' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="categoryName" label="商品分类" width="150" align="center" />

        <el-table-column label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" effect="light" round>
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="更新时间" width="180" align="center" />

        <el-table-column label="操作" align="center" width="240" fixed="right">
          <template #default="scope">
            <template v-if="scope.row.deleted === 0">
              <!-- 使用 link 样式，看起来更高级 -->
              <el-button type="primary" link @click="edit(scope.row.id)">编辑</el-button>
              <el-button
                  :type="scope.row.status === 1 ? 'warning' : 'success'"
                  link
                  @click="toggleStatus(scope.row.id, scope.row.status)"
              >
                {{ scope.row.status === 1 ? '下架' : '上架' }}
              </el-button>
              <el-button type="danger" link @click="delById(scope.row.id)">删除</el-button>
            </template>
            <template v-else>
              <el-button type="primary" link @click="edit(scope.row.id)">编辑</el-button>
              <el-button type="success" link @click="restore(scope.row.id)">恢复</el-button>
              <el-button type="danger" link @click="physicalDelete(scope.row.id)">彻底删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="searchProduct.page"
            v-model:page-size="searchProduct.pageSize"
            :page-sizes="[5, 10, 15, 20, 30, 50]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- ================= 弹窗部分 ================= -->
    <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="1000px" top="5vh" class="custom-dialog">
      <el-form :model="product" :rules="rules" ref="productFormRef" label-width="100px">
        <div class="dialog-section">
          <h4 class="section-title">基础信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品名称" prop="name">
                <el-input v-model="product.name" placeholder="请输入商品名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="副标题" prop="subtitle">
                <el-input v-model="product.subtitle" placeholder="请填写商品副标题" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品品牌" prop="brandId">
                <el-select v-model="product.brandId" placeholder="请选择" style="width: 100%">
                  <el-option v-for="b in brandList" :key="b.id" :label="b.name" :value="b.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品分类" prop="categoryId">
                <el-cascader
                    v-model="product.categoryId"
                    :options="categoryTree"
                    :props="{ value: 'id', label: 'name', checkStrictly: false, emitPath: false }"
                    placeholder="请选择分类"
                    clearable
                    style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品主图" prop="mainImage">
                <ImageUpload v-model="product.mainImage" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="商品详情" prop="detail">
            <el-input v-model="product.detail" type="textarea" :rows="4" placeholder="请填写商品详情" />
          </el-form-item>
        </div>

        <!-- SKU区域 -->
        <div class="dialog-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 class="section-title" style="margin: 0;">规格与库存 (SKU)</h4>
            <div>
              <el-button type="primary" plain size="small" icon="Plus" @click="addSkuRow">添加 SKU</el-button>
              <el-button v-if="product.id" type="warning" plain size="small" icon="Setting" @click="openSkuDialog">SKU 独立操作</el-button>
            </div>
          </div>

          <el-table :data="product.skuList" border class="sku-table">
            <el-table-column label="规格属性组合" min-width="300">
              <template #default="{ row }">
                <div class="spec-list">
                  <div v-for="(spec, index) in row.specsArray" :key="index" class="spec-item">
                    <el-input v-model="spec.name" placeholder="属性名(如:颜色)" size="small" style="width: 42%" />
                    <el-input v-model="spec.value" placeholder="属性值(如:红)" size="small" style="width: 42%" />
                    <el-button
                        v-if="row.specsArray.length > 1"
                        type="danger"
                        size="small"
                        icon="Delete"
                        circle plain
                        @click="removeSpecItem(row, index)"
                    />
                  </div>
                  <el-button type="primary" link size="small" icon="Plus" @click="addSpecItem(row)">添加属性</el-button>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="价格(元)" width="140">
              <template #default="{ row }">
                <el-input-number v-model="row.price" :min="0" :precision="2" :controls="false" style="width: 100%" placeholder="0.00" />
              </template>
            </el-table-column>

            <el-table-column label="库存" width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.stock" :min="0" :controls="false" style="width: 100%" placeholder="0" />
              </template>
            </el-table-column>

            <el-table-column label="图片" width="120" align="center">
              <template #default="{ row }">
                <ImageUpload v-model="row.image" width="50px" height="50px" />
              </template>
            </el-table-column>

            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button type="danger" link @click="removeSkuRow($index)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="save">提交保存</el-button>
        </div>
      </template>
    </el-dialog>

    <SkuManageDialog v-model="skuDialogVisible" :product-id="skuDialogProductId" @refresh="handleSkuRefresh" />
  </div>
</template>

<style scoped>
/* 页面整体容器 */
.app-container {
  padding: 0;
}

/* ============ 搜索卡片 ============ */
.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: none;
}
.custom-tabs {
  margin-bottom: 10px;
}
.search-form {
  margin-top: 10px;
}

/* ============ 表格卡片 ============ */
.table-card {
  border-radius: 8px;
  border: none;
}
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.toolbar-right {
  display: flex;
  gap: 10px;
}

/* ============ 表格内容优化 ============ */
.product-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.product-img {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
  border-radius: 6px;
}
.product-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.product-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.product-brand {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* ============ 弹窗内部美化 ============ */
.custom-dialog :deep(.el-dialog__body) {
  padding: 10px 20px 20px;
}
.dialog-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #f0f0f0;
}
.section-title {
  margin: 0 0 15px 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  border-left: 4px solid #e1251b;
  padding-left: 10px;
  line-height: 1;
}
.sku-table {
  border-radius: 6px;
  overflow: hidden;
}
.spec-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #fff;
  border-radius: 6px;
  border: 1px dashed #dcdfe6;
}
.spec-item {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>