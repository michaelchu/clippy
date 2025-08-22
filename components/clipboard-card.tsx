"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Link, Star, Trash2, MoreHorizontal, Clock } from "lucide-react"
import type { ClipboardItem } from "@/types/clipboard"

interface ClipboardCardProps {
  item: ClipboardItem
  onCopy: (content: string) => void
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
  formatTimestamp: (date: Date) => string
}

export const ClipboardCard = memo(function ClipboardCard({
  item,
  onCopy,
  onToggleFavorite,
  onDelete,
  formatTimestamp,
}: ClipboardCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col">
      <CardHeader className="p-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onCopy(item.content)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Link className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onToggleFavorite(item.id)}
            >
              <Star className={`h-3 w-3 ${item.favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Rich preview */}
        <div
          className={`aspect-video rounded-lg bg-gradient-to-br ${item.color || "from-slate-100 to-slate-200"} flex items-center justify-center overflow-hidden`}
        >
          {item.type === "link" && item.domain && (
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center">
                <Link className="h-6 w-6 text-white" />
              </div>
              <div className="text-white font-semibold text-sm">{item.title}</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 pb-4 flex-grow flex flex-col justify-between">
        <div className="space-y-2 flex-grow">
          <div className="flex flex-col justify-start">
            <h4 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight mb-1">
              {item.title || item.content.substring(0, 50)}
            </h4>
            {item.domain && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.domain}</p>}
          </div>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 py-1">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 mt-auto">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimestamp(item.timestamp)}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {item.type.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
})
