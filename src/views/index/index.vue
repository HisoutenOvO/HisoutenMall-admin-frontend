<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useAuthStore } from '@/stores/auth'
import { getAdminDashboardApi, getMerchantDashboardApi } from '@/api/dashboard'
import type { AdminDashboardVO, MerchantDashboardVO } from '@/types/common/dashboard'

const authStore = useAuthStore()
const role = computed(() => authStore.userInfo?.role)

const adminData = ref<AdminDashboardVO | null>(null)
const merchantData = ref<MerchantDashboardVO | null>(null)

const chartRef = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

const initChart = (trendData: { date: string; amount: number }[]) => {
  nextTick(() => {
    if (!chartRef.value) return
    if (myChart) myChart.dispose()
    myChart = echarts.init(chartRef.value)

    const dates = trendData.map(item => item.date)
    const amounts = trendData.map(item => item.amount)

    const option = {
      // 用暗色背景的高级渐变，或者去掉背景
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#eee',
        borderWidth: 1,
        padding: [10, 15],
        textStyle: { color: '#333' },
        formatter: '{b}<br/>销售额: <span style="color:#c23531;font-weight:bold;">￥{c}</span>',
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;'
      },
      grid: { left: '2%', right: '3%', bottom: '5%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates.length ? dates : ['暂无数据'],
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisTick: { show: false }, // 去掉小刻度，显得干净
        axisLabel: { color: '#888', margin: 15 }
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '￥{value}', color: '#888' },
        splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
        axisLine: { show: false }, // 去掉 Y 轴实线
        axisTick: { show: false }
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#c23531', borderWidth: 2, borderColor: '#fff' },
          lineStyle: { width: 3, color: '#c23531' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(194, 53, 49, 0.2)' },
              { offset: 1, color: 'rgba(194, 53, 49, 0)' }
            ])
          },
          data: amounts.length ? amounts : [0]
        }
      ]
    }
    myChart.setOption(option)
  })
}

const loadData = async () => {
  if (role.value === 3) {
    const res = await getAdminDashboardApi()
    if (res.code === 1) {
      adminData.value = res.data
      initChart(res.data.salesTrend || [])
    }
  } else if (role.value === 2) {
    const res = await getMerchantDashboardApi()
    if (res.code === 1) {
      merchantData.value = res.data
      initChart(res.data.salesTrend || [])
    }
  }
}

const handleResize = () => { myChart?.resize() }

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  myChart?.dispose()
})
</script>

<template>
  <div class="dashboard-container">
    <div class="header-title">数据概览</div>

    <!-- 管理员大屏 -->
    <template v-if="role === 3 && adminData">
      <el-row :gutter="20" class="top-row">
        <el-col :span="6">
          <div class="data-card card-red">
            <div class="card-title">今日平台销售额</div>
            <div class="card-value">￥{{ adminData.todayPlatformSales }}</div>
            <div class="card-bg-icon">💰</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-card card-blue">
            <div class="card-title">今日平台订单数</div>
            <div class="card-value">{{ adminData.todayPlatformOrders }}</div>
            <div class="card-bg-icon">📦</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-card card-green">
            <div class="card-title">平台总用户数</div>
            <div class="card-value">{{ adminData.totalUserCount }}</div>
            <div class="card-bg-icon">👥</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-card card-orange">
            <div class="card-title">平台总商家数</div>
            <div class="card-value">{{ adminData.totalMerchantCount }}</div>
            <div class="card-bg-icon">🏪</div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="bottom-row">
        <el-col :span="16">
          <div class="panel-card chart-panel">
            <div ref="chartRef" class="chart-container"></div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="panel-card todo-panel">
            <div class="panel-header">待办事项</div>
            <div class="panel-list">
              <div class="todo-item">
                <div class="todo-info">
                  <span class="todo-dot red"></span>
                  <span>待审核商家</span>
                </div>
                <div class="todo-action">
                  <span class="todo-count">{{ adminData.pendingMerchantAudit }}</span>
                  <el-button type="primary" size="small" @click="$router.push('/shop')">去处理</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </template>

    <!-- 商家大屏 -->
    <template v-if="role === 2 && merchantData">
      <el-row :gutter="20" class="top-row">
        <el-col :span="6">
          <div class="data-card card-red">
            <div class="card-title">今日销售额</div>
            <div class="card-value">￥{{ merchantData.todaySales }}</div>
            <div class="card-bg-icon">💰</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-card card-blue">
            <div class="card-title">今日订单数</div>
            <div class="card-value">{{ merchantData.todayOrderCount }}</div>
            <div class="card-bg-icon">📦</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-card card-green">
            <div class="card-title">累计销售额</div>
            <div class="card-value">￥{{ merchantData.totalSales }}</div>
            <div class="card-bg-icon">📈</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-card card-orange">
            <div class="card-title">在售商品数</div>
            <div class="card-value">{{ merchantData.onSaleProductCount }}</div>
            <div class="card-bg-icon">🏷️</div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="bottom-row">
        <el-col :span="16">
          <div class="panel-card chart-panel">
            <div ref="chartRef" class="chart-container"></div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="panel-card todo-panel">
            <div class="panel-header">待办事项</div>
            <div class="panel-list">
              <div class="todo-item">
                <div class="todo-info">
                  <span class="todo-dot orange"></span>
                  <span>待发货订单</span>
                </div>
                <div class="todo-action">
                  <span class="todo-count">{{ merchantData.pendingShipCount }}</span>
                  <el-button type="warning" size="small" @click="$router.push('/merchant-order')">去发货</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<style scoped>
/* 核心布局：使用 Flex 撑满整个屏幕 */
.dashboard-container {
  padding: 20px;
  background-color: #f4f6f8;
  height: calc(100vh - 60px); /* 减去顶部 Header 的高度 */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  flex-shrink: 0;
}

/* ============ 顶部数据卡片 ============ */
.top-row {
  flex-shrink: 0; /* 高度固定 */
  margin-bottom: 20px;
}

.data-card {
  border-radius: 12px;
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  /* 加上细细的白边，提升质感 */
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.data-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 降低饱和度的暗黑系渐变色，更显高级 */
.card-red { background: linear-gradient(135deg, #ff4b2b, #c23531); }
.card-blue { background: linear-gradient(135deg, #4facfe, #2a5298); }
.card-green { background: linear-gradient(135deg, #43e97b, #38a169); }
.card-orange { background: linear-gradient(135deg, #fa709a, #d97706); } /* 用橙粉色代替纯黄 */

.card-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.card-bg-icon {
  position: absolute;
  right: 15px;
  bottom: -15px;
  font-size: 90px;
  opacity: 0.15;
  z-index: 0;
  transform: rotate(-10deg);
}

/* ============ 底部图表与待办 (自动撑满剩余高度) ============ */
.bottom-row {
  flex: 1; /* 占据剩余的所有高度 */
  min-height: 0; /* 防止溢出 */
}

.panel-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  height: 100%; /* 撑满行高 */
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
}

.chart-panel {
  padding: 20px;
}

.chart-container {
  flex: 1;
  width: 100%;
  height: 100%;
}

.todo-panel {
  padding: 24px;
}

.panel-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.panel-list {
  flex: 1;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.todo-item:hover {
  background: #fff;
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.todo-info {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #334155;
  font-weight: 500;
}

.todo-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 12px;
}

.todo-dot.red { background-color: #ef4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.4); }
.todo-dot.orange { background-color: #f59e0b; box-shadow: 0 0 6px rgba(245, 158, 11, 0.4); }

.todo-action {
  display: flex;
  align-items: center;
  gap: 16px;
}

.todo-count {
  font-size: 20px;
  font-weight: 700;
  color: #c23531;
}
</style>