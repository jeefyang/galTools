export type BuildConfigType = {
    entryPath?: string
    libName?: string
    fileName?: string
    /** 用于识别文件是否创建且启用 */
    isDone?: boolean
}