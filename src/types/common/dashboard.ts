export interface DailySalesVO {
    date: string
    amount: number
}

export interface AdminDashboardVO {
    todayPlatformSales: number
    todayPlatformOrders: number
    totalUserCount: number
    totalMerchantCount: number
    pendingMerchantAudit: number
    salesTrend: DailySalesVO[]
}

export interface MerchantDashboardVO {
    todaySales: number
    todayOrderCount: number
    totalSales: number
    totalOrderCount: number
    pendingShipCount: number
    onSaleProductCount: number
    totalReviewCount: number
    salesTrend: DailySalesVO[]
}