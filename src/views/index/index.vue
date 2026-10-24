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
      grid: { left: '1%', right: '2%', bottom: '3%', top: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates.length ? dates : ['暂无数据'],
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', margin: 15 }
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '￥{value}', color: '#64748b' },
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
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
          <div class="data-card card-purple">
            <div class="card-title">平台总商家数</div>
            <div class="card-value">{{ adminData.totalMerchantCount }}</div>
            <div class="card-bg-icon">🏪</div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="bottom-row">
        <el-col :span="16">
          <div class="panel-card">
            <div class="panel-header">近 7 天销售趋势</div>
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
                  <el-button type="danger" plain size="small" @click="$router.push('/admin-merchant')">去处理</el-button>
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
          <div class="data-card card-purple">
            <div class="card-title">在售商品数</div>
            <div class="card-value">{{ merchantData.onSaleProductCount }}</div>
            <div class="card-bg-icon">🏷️</div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="bottom-row">
        <el-col :span="16">
          <div class="panel-card">
            <div class="panel-header">近 7 天销售趋势</div>
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
                  <el-button type="warning" plain size="small" @click="$router.push('/merchant-order')">去发货</el-button>
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
.dashboard-container {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.top-row {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.data-card {
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 新版渐变色，更高级 */
.card-red { background: linear-gradient(135deg, #ff6b6b, #c0392b); }
.card-blue { background: linear-gradient(135deg, #48c6ef, #1e3c72); }
.card-green { background: linear-gradient(135deg, #56ab2f, #1d976c); }
.card-purple { background: linear-gradient(135deg, #a18cd1, #fbc2eb); }

.card-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
  font-weight: 500;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
}

.card-bg-icon {
  position: absolute;
  right: 10px;
  bottom: -10px;
  font-size: 80px;
  opacity: 0.2;
}

.bottom-row {
  flex: 1;
  min-height: 0;
}

.panel-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
}

.panel-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding: 20px 20px 10px;
}

.chart-container {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.todo-panel {
  padding: 0 20px 20px;
}
.todo-panel .panel-header {
  padding: 20px 0 15px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 15px;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #f1f5f9;
}

.todo-info {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.todo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 12px;
}
.todo-dot.red { background-color: #ef4444; }
.todo-dot.orange { background-color: #f59e0b; }

.todo-action {
  display: flex;
  align-items: center;
  gap: 16px;
}

.todo-count {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
}
</style>