<script setup lang="ts">
import type {
  MerchantProductPageQueryDTO,
  MerchantProductPageResultVO
} from '@/types/merchant/product.ts'
import {onMounted, ref} from 'vue'
import type {CategoryListVO} from "@/types/common/category.ts";
import {
  addMerchantProductApi,
  deleteMerchantProductLogicApi,
  getMerchantProductDetailApi,
  getMerchantProductPageApi, updateMerchantProductApi, updateMerchantProductStatusApi
} from "@/api/merchant/product.ts";
import {ElMessage, ElMessageBox} from "element-plus";
import {getMerchantCategoryListApi} from "@/api/merchant/category.ts";

// 搜索表单
  const searchProduct = ref<MerchantProductPageQueryDTO>({
    page: 1,
    pageSize: 10,
    keyword: '',
    categoryId: undefined,
    status: undefined
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
  const productFormRef = ref()

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
//定义函数

//分页查询函数
const search = async () => {
    const result = await getMerchantProductPageApi(searchProduct.value);
    if(result.code === 1){
      productList.value = result.data.records
      total.value = result.data.total
    }else{
      ElMessage.error(result.msg);
    }
}
//清空搜索框
const clear = () => {
  searchProduct.value.keyword = ''
  searchProduct.value.categoryId = undefined
  searchProduct.value.status = undefined
  searchProduct.value.page = 1
  search()
}
// 打开新增对话框
const addProduct = () => {
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
    productFormRef.value?.clearValidate()
  } else {
    ElMessage.error(result.msg)
  }
}

// 保存（新增或修改）
const save = async () => {
  await productFormRef.value.validate()

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
    result = await addMerchantProductApi({ ...formData, merchantId: 1 })
  }

  if (result.code === 1) {
    ElMessage.success(product.value.id ? '修改成功' : '新增成功')
    dialogFormVisible.value = false
    search()
  } else {
    ElMessage.error(result.msg)
  }
}


//换页函数
const handleSizeChange = (val: number) => {
  searchProduct.value.pageSize = val
  searchProduct.value.page = 1   // 改变每页条数时回到第一页
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

onMounted(() => {
  loadCategoryList()
  search()
})

// 上下架
const toggleStatus = async (productId: number, status: number) => {
  const newStatus = status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'

  await ElMessageBox.confirm(`确认要${action}该商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  const result = await updateMerchantProductStatusApi(productId, newStatus)
  if (result.code === 1) {
    ElMessage.success(`${action}成功`)
    search()
  } else {
    ElMessage.error(result.msg)
  }
}


//删除商品
const delById = async (productId: number) => {
  try {
    await ElMessageBox.confirm('确认要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return  // 用户点了取消
  }

  const result = await deleteMerchantProductLogicApi(productId)
  if (result.code === 1) {
    ElMessage.success('删除成功')
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
const currentPage = ref(1)
const pageSize = ref(10)
const background = ref(true)


</script>

<template>
  <h1>商品管理</h1>
  <div class="container">
    <el-form :inline="true" :model="searchProduct">
    <!--搜索栏-->
  <el-form-item label="商品名称">
    <el-input
        v-model="searchProduct.keyword"
        placeholder="请输入商品名称"
        clearable
    />
  </el-form-item>
    <el-form-item label="按分类查询">
      <el-select
          v-model="searchProduct.categoryId"
          placeholder="请选择分类"
          style="width: 180px"
          clearable
      >
        <el-option
            v-for="c in categoryList"
            :key="c.id"
            :label="c.name"
            :value="c.id"
        />
      </el-select>
    </el-form-item>
      <el-form-item label="状态">
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
  <!--    新增商品按钮-->
  <el-button type="primary" @click="addProduct">+ 新增商品</el-button>

  <!--    商品信息-->
  <el-table :data="productList" border style="width: 100%" class="container">
    <el-table-column
        prop="name"
        label="商品名称"
        width="180"
        align="center"
    />
    <el-table-column
        prop="brandName"
        label="品牌名称"
        width="100"
        align="center"
    />
    <el-table-column
        prop="categoryName"
        label="商品分类"
        width="100"
        align="center"
    />
    <el-table-column prop="mainImage" label="商品图片" width="120" align="center">
      <template #default="scope">
        <el-image
            :src="scope.row.mainImage"
            style="width: 60px; height: 60px"
            fit="cover"
        />
      </template>
    </el-table-column>
    <el-table-column
        prop="merchantName"
        label="商家名称"
        width="140"
        align="center"
    />
    <el-table-column prop="status" label="状态" width="100" align="center">
      <template #default="scope">
        <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
          {{ scope.row.status === 1 ? '上架' : '下架' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="updateTime" label="最后操作时间" align="center" />
    <el-table-column label="操作" align="center" width="240">
      <template #default="scope">
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
    </el-table-column>
  </el-table>

    <!--    新增/修改商品对话框-->
    <el-dialog
        v-model="dialogFormVisible"
        :title="dialogTitle"
        width="500"
        class="container"
    >
      <el-form :model="product" :rules="rules" ref="productFormRef">
        <el-form-item label="商品名称" label-width="80px" prop="name">
          <el-input
              v-model="product.name"
              autocomplete="off"
              placeholder="请输入商品名称"
          />
        </el-form-item>
        <el-form-item label="副标题" label-width="80px" prop="subtitle">
          <el-input
              v-model="product.subtitle"
              autocomplete="off"
              placeholder="请填写商品副标题"
          />
        </el-form-item>
        <el-form-item label="商品图片" label-width="80px" prop="mainImage">
          <el-input
              v-model="product.mainImage"
              autocomplete="off"
              placeholder="请输入商品图片"
          />
        </el-form-item>
        <el-form-item label="商品品牌" label-width="80px" prop="brandId">
          <el-select v-model="product.brandId" placeholder="请选择">

          </el-select>
        </el-form-item>
        <el-form-item label="商品分类" label-width="80px" prop="categoryId">
          <el-select v-model="product.categoryId" placeholder="请选择" >
            <el-option
                v-for="c in categoryList"
                :key="c.id"
                :label="c.name"
                :value="c.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品详情" label-width="80px" prop="detail">
          <el-input
              v-model="product.detail"
              type="textarea"
              :rows="4"
              placeholder="请填写商品详情"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="save"> 保存 </el-button>
        </div>
      </template>
    </el-dialog>

    <!--分页条-->
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