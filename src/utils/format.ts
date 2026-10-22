/**
 * 格式化 specs 规格 JSON
 * @param specs 可能是 JSON 字符串，也可能是普通字符串
 * @returns 拼接好的字符串，如 "颜色: 红色 / 内存: 64G"
 */
export function formatSpecs(specs?: string): string {
    if (!specs) return '默认规格'

    try {
        // 尝试按 JSON 解析
        const obj = JSON.parse(specs)
        if (typeof obj === 'object' && obj !== null) {
            return Object.entries(obj)
                .map(([key, value]) => `${key}: ${value}`)
                .join(' / ')
        }
        return specs
    } catch {
        // 如果解析失败，说明原本就是普通字符串（如 "红色 64G"）
        return specs
    }
}