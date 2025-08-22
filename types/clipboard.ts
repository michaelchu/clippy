export interface ClipboardItem {
  id: string
  content: string
  type: "text" | "image" | "link" | "file"
  timestamp: Date
  tags: string[]
  favorite: boolean
  preview?: string
  title?: string
  domain?: string
  color?: string
}
