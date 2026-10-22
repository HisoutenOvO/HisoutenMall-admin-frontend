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
  const result = await getMerchantProductPageApi(searchProduct.value)
  if (result.code === 1) {
    productList.value = result.data.records
    total.value = result.data.total
  } else {
    ElMessage.error(result.msg)
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
  <h1>商品管理</h1>
  <div class="container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="在售商品" name="normal" />
      <el-tab-pane label="回收站" name="recycle" />
    </el-tabs>

    <el-form :inline="true" :model="searchProduct">
      <el-form-item label="商品名称">
        <el-input v-model="searchProduct.keyword" placeholder="请输入商品名称" clearable />
      </el-form-item>
      <el-form-item label="按分类查询">
        <el-cascader
            v-model="searchProduct.categoryId"
            :options="categoryTree"
            :props="{ value: 'id', label: 'name', checkStrictly: true, emitPath: false }"
            placeholder="请选择分类"
            clearable
            style="width: 180px"
        />
      </el-form-item>
      <el-form-item label="按品牌查询">
        <el-select v-model="searchProduct.brandId" placeholder="请选择品牌" style="width: 180px" clearable>
          <el-option v-for="b in brandList" :key="b.id" :label="b.name" :value="b.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" v-if="activeTab === 'normal'">
        <el-select v-model="searchProduct.status" placeholder="请选择状态" style="width: 180px" clearable>
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
        <el-button v-if="activeTab === 'normal'" type="primary" @click="addProduct">+ 新增商品</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="productList" border style="width: 100%" class="container">
      <el-table-column prop="name" label="商品名称" width="200" align="center" />
      <el-table-column prop="brandName" label="品牌名称" width="160" align="center" />
      <el-table-column prop="categoryName" label="商品分类" width="140" align="center" />
      <el-table-column prop="mainImage" label="商品图片" width="140" align="center">
        <template #default="scope">
          <el-image :src="scope.row.mainImage" style="width: 60px; height: 60px" fit="cover">
            <template #error>
              <div style="color: #999; font-size: 12px;">暂无</div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="最后操作时间" align="center"/>
      <el-table-column label="操作" align="center" width="240">
        <template #default="scope">
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
          <template v-else>
            <el-button type="primary" size="small" @click="edit(scope.row.id)">编辑</el-button>
            <el-button type="success" size="small" @click="restore(scope.row.id)">恢复</el-button>
            <el-button type="danger" size="small" @click="physicalDelete(scope.row.id)">彻底删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗部分：宽度加大到 950px，以便容纳多属性动态输入框 -->
    <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="950px">
      <el-form :model="product" :rules="rules" ref="productFormRef">
        <el-form-item label="商品名称" label-width="80px" prop="name">
          <el-input v-model="product.name" autocomplete="off" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="副标题" label-width="80px" prop="subtitle">
          <el-input v-model="product.subtitle" autocomplete="off" placeholder="请填写商品副标题" />
        </el-form-item>
        <el-form-item label="商品主图" label-width="80px" prop="mainImage">
          <ImageUpload v-model="product.mainImage" />
        </el-form-item>
        <el-form-item label="商品品牌" label-width="80px" prop="brandId">
          <el-select v-model="product.brandId" placeholder="请选择">
            <el-option v-for="b in brandList" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品分类" label-width="80px" prop="categoryId">
          <el-cascader
              v-model="product.categoryId"
              :options="categoryTree"
              :props="{ value: 'id', label: 'name', checkStrictly: false, emitPath: false }"
              placeholder="请选择分类"
              clearable
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="商品详情" label-width="80px" prop="detail">
          <el-input v-model="product.detail" type="textarea" :rows="4" placeholder="请填写商品详情" />
        </el-form-item>

        <!-- 核心改造：多规格动态录入 -->
        <el-form-item label="SKU列表" label-width="80px">
          <div style="margin-bottom: 10px">
            <el-button type="primary" size="small" @click="addSkuRow">+ 新增 SKU</el-button>
            <el-button
                v-if="product.id"
                type="warning"
                size="small"
                @click="openSkuDialog"
            >SKU 单独操作</el-button>
          </div>
          <el-table :data="product.skuList" border style="margin-top: 10px">
            <!-- 属性组合列 -->
            <el-table-column label="规格属性组合" min-width="280">
              <template #default="{ row }">
                <div v-for="(spec, index) in row.specsArray" :key="index" style="display: flex; gap: 5px; margin-bottom: 5px;">
                  <el-input v-model="spec.name" placeholder="如: 颜色" size="small" style="width: 45%" />
                  <el-input v-model="spec.value" placeholder="如: 红色" size="small" style="width: 45%" />
                  <el-button
                      v-if="row.specsArray.length > 1"
                      type="danger"
                      size="small"
                      icon="Delete"
                      circle
                      @click="removeSpecItem(row, index)"
                  />
                </div>
                <el-button type="primary" link size="small" @click="addSpecItem(row)">+ 添加属性</el-button>
              </template>
            </el-table-column>
            <el-table-column label="价格" width="120">
              <template #default="{ row }">
                <el-input v-model.number="row.price" type="number" />
              </template>
            </el-table-column>
            <el-table-column label="库存" width="100">
              <template #default="{ row }">
                <el-input v-model.number="row.stock" type="number" />
              </template>
            </el-table-column>
            <el-table-column label="图片" width="100" align="center">
              <template #default="{ row }">
                <ImageUpload v-model="row.image" width="60px" height="60px" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button type="danger" size="small" @click="removeSkuRow($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <SkuManageDialog v-model="skuDialogVisible" :product-id="skuDialogProductId" @refresh="handleSkuRefresh" />

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
.container { margin: 20px 0; }
</style>