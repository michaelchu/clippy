"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
import type { ClipboardItem } from "@/types/clipboard"

interface VirtualGridProps {
  items: ClipboardItem[]
  itemHeight: number
  containerHeight: number
  itemsPerRow: number
  renderItem: (item: ClipboardItem, index: number) => React.ReactNode
  gap?: number
}

export function VirtualGrid({
  items,
  itemHeight,
  containerHeight,
  itemsPerRow,
  renderItem,
  gap = 16,
}: VirtualGridProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const rowHeight = itemHeight + gap
    const totalRows = Math.ceil(items.length / itemsPerRow)
    const totalHeight = totalRows * rowHeight

    const startRow = Math.floor(scrollTop / rowHeight)
    const endRow = Math.min(startRow + Math.ceil(containerHeight / rowHeight) + 1, totalRows)

    const startIndex = startRow * itemsPerRow
    const endIndex = Math.min(endRow * itemsPerRow, items.length)

    const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }))

    const offsetY = startRow * rowHeight

    return { visibleItems, totalHeight, offsetY }
  }, [items, itemHeight, gap, itemsPerRow, scrollTop, containerHeight])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div ref={scrollElementRef} className="overflow-auto" style={{ height: containerHeight }} onScroll={handleScroll}>
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            display: "grid",
            gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
            gap: `${gap}px`,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div key={item.id} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
