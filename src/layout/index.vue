<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import { ElMessage } from "element-plus";
const username = ref(localStorage.getItem('username') || '')
const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  username.value = ''
  router.push('/login')
  ElMessage.success('您已退出登录！')
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <!-- Header 区域 -->
      <el-header class="header">
        <span class="title">HisoutenMall后台管理系统</span>
        <span class="right_tool">
          <a href="">
            <el-icon><EditPen /></el-icon> 修改密码 &nbsp;&nbsp;&nbsp; |  &nbsp;&nbsp;&nbsp;
          </a>
          <a href="javascript:void(0)" @click="logout">
            <el-icon><SwitchButton /></el-icon> 退出登录 【{{username}}】
          </a>
        </span>
      </el-header>

      <el-container>
        <!-- 左侧菜单 -->
        <el-aside width="200px" class="aside">
          <el-menu :router="true">
            <el-menu-item index="/index" >
              <template #title >
                <el-icon><HomeFilled /></el-icon>首页
              </template>
            </el-menu-item>
            <el-menu-item index="/category">
              <template #title>
                <el-icon><Clock /></el-icon>分类管理
              </template>
            </el-menu-item>
            <el-sub-menu index="/product">
              <template #title>
                <el-icon><Setting /></el-icon>商品管理
              </template>
              <el-menu-item index="/product"><el-icon><MessageBox /></el-icon>商品管理</el-menu-item>
              <el-menu-item index="/product/sku"><el-icon><MessageBox /></el-icon>商品SKU管理</el-menu-item>
              <el-menu-item index="/product/spu"><el-icon><Avatar /></el-icon>商品SPU管理</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>

        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>

    </el-container>
  </div>
</template>

<style scoped>
.header {
  background-image: linear-gradient(to right, #00547d, #007fa4, #00aaa0, #00d072, #a8eb12);
}

.title {
  color: white;
  font-size: 40px;
  font-family: 楷体;
  line-height: 60px;
  font-weight: bolder;
}

.right_tool{
  float: right;
  line-height: 60px;
}

a {
  color: white;
  text-decoration: none;
}

.aside {
  width: 220px;
  border-right: 1px solid #ccc;
  height: 730px;
}
</style>
