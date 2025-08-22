"use client"

import React, { useState, useEffect, useCallback, useMemo, memo } from "react"
import {
  Search,
  Plus,
  Grid3X3,
  List,
  Settings,
  Moon,
  Sun,
  Copy,
  Star,
  FileText,
  Clock,
  Menu,
  X,
  Link,
  ImageIcon,
  File,
  MoreHorizontal,
  Heart,
  Trash2,
  Monitor,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface ClipboardItem {
  id: string
  content: string
  type: "text" | "link" | "image" | "file"
  timestamp: Date
  tags: string[]
  favorite: boolean
  title?: string
  domain?: string
  preview?: string
  color?: string
}

export default function Clippy() {
  const [items, setItems] = useState<ClipboardItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFolder, setSelectedFolder] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<ClipboardItem | null>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchLinkMetadata = async (url: string) => {
    try {
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const metadata = await response.json()
        return metadata
      }
    } catch (error) {
      console.error('Failed to fetch link metadata:', error)
    }
    return null
  }

  useEffect(() => {
    const mockItems: ClipboardItem[] = [
      {
        id: "1",
        content: "https://nextjs.org/docs",
        type: "link",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        tags: ["framework", "react", "development"],
        favorite: true,
        title: "Next.js Documentation",
        domain: "nextjs.org",
        preview: "Next.js - The React Framework for Production",
        color: "from-black to-gray-800",
      },
      {
        id: "2",
        content: "https://pytorch.org",
        type: "link",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        tags: ["ai", "machine-learning", "python"],
        favorite: false,
        title: "PyTorch",
        domain: "pytorch.org",
        preview: "PyTorch - An open source machine learning framework",
        color: "from-orange-500 to-red-600",
      },
      {
        id: "3",
        content:
          "This is a sample text that was copied to the clipboard. It contains multiple lines and demonstrates how text content is displayed in the clipboard manager.",
        type: "text",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        tags: ["sample", "text"],
        favorite: false,
        title: "Sample Text",
      },
      {
        id: "4",
        content: "https://tensorflow.org",
        type: "link",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        tags: ["ai", "google", "framework"],
        favorite: true,
        title: "TensorFlow",
        domain: "tensorflow.org",
        preview: "TensorFlow - An end-to-end open source machine learning platform",
        color: "from-orange-400 to-yellow-500",
      },
    ]
    setItems(mockItems)
  }, [])

  const handlePaste = useCallback(
    async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        try {
          const text = await navigator.clipboard.readText()
          if (text && text.trim()) {
            const isLink = text.startsWith("http://") || text.startsWith("https://")
            
            let newItem: ClipboardItem = {
              id: Date.now().toString(),
              content: text,
              type: isLink ? "link" : "text",
              timestamp: new Date(),
              tags: [],
              favorite: false,
              title: isLink ? "Loading..." : "New Text",
            }

            // Add item immediately with loading state
            setItems((prev) => [newItem, ...prev])

            // Fetch link metadata if it's a link
            if (isLink) {
              console.log('🔍 Fetching metadata for:', text)
              const metadata = await fetchLinkMetadata(text)
              console.log('📄 Metadata received:', metadata)
              if (metadata) {
                // Generate a color gradient based on domain
                const colors = [
                  "from-blue-500 to-purple-600",
                  "from-green-500 to-blue-600", 
                  "from-purple-500 to-pink-600",
                  "from-orange-500 to-red-600",
                  "from-teal-500 to-cyan-600",
                  "from-indigo-500 to-blue-600"
                ]
                const colorIndex = metadata.domain.length % colors.length
                
                // Update the item with metadata
                setItems((prev) => prev.map((item) => {
                  if (item.id === newItem.id) {
                    const updatedItem = {
                      ...item,
                      title: metadata.title,
                      domain: metadata.domain,
                      preview: metadata.description,
                      color: colors[colorIndex]
                    }
                    
                    console.log('✅ Updated item with metadata:', updatedItem)
                    
                    // Also update previewItem if it's the same item currently being previewed
                    setPreviewItem(current => {
                      if (current && current.id === newItem.id) {
                        console.log('🔄 Also updating previewItem with:', updatedItem)
                        return updatedItem
                      }
                      return current
                    })
                    
                    return updatedItem
                  }
                  return item
                }))
                
                // Show success toast after metadata is loaded (with small delay to prevent conflicts)
                setTimeout(() => {
                  toast({
                    title: "Link captured",
                    description: `${metadata.title} saved successfully`,
                  })
                }, 100)
              } else {
                // Show generic toast if metadata failed to load
                toast({
                  title: "Link captured",
                  description: "New link saved successfully",
                })
              }
            } else {
              // Show toast immediately for non-links
              toast({
                title: "Content captured", 
                description: "New clipboard item saved successfully",
              })
            }
          }
        } catch (err) {
          console.log("Clipboard access not available")
        }
      }
    },
    [toast, fetchLinkMetadata],
  )

  useEffect(() => {
    document.addEventListener("keydown", handlePaste)
    return () => document.removeEventListener("keydown", handlePaste)
  }, [handlePaste])

  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.type === selectedCategory
      const matchesFolder = selectedFolder === "all" || item.tags.includes(selectedFolder)
      return matchesSearch && matchesCategory && matchesFolder
    })

    switch (sortBy) {
      case "oldest":
        filtered = filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        break
      case "most-used":
        filtered = filtered.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))
        break
      default:
        filtered = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }

    return filtered
  }, [items, searchQuery, selectedCategory, selectedFolder, sortBy])

  const copyToClipboard = useCallback(
    async (content: string) => {
      try {
        await navigator.clipboard.writeText(content)
        toast({
          title: "Copied to clipboard",
          description: "Content has been copied successfully",
        })
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Unable to copy content to clipboard",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const toggleFavorite = useCallback((id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item)))
  }, [])

  const deleteItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast({
        title: "Item deleted",
        description: "Clipboard item has been removed",
      })
    },
    [toast],
  )

  const formatTimestamp = useCallback((date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }, [])

  const folders = useMemo(() => ["ai", "development", "framework", "research", "data-science"], [])
  const allTags = useMemo(() => Array.from(new Set(items.flatMap((item) => item.tags))), [items])

  const openPreview = useCallback((item: ClipboardItem) => {
    // Batch state updates to prevent multiple re-renders
    React.startTransition(() => {
      console.log('👆 User clicked item, setting previewItem:', item.id, item.title)
      setPreviewItem(item)
      setPreviewOpen(true)
    })
  }, [])

  const ClipboardCard = memo(({ item }: { item: ClipboardItem }) => {
    const getTypeIcon = () => {
      switch (item.type) {
        case "link":
          return <Link className="h-4 w-4" />
        case "image":
          return <ImageIcon className="h-4 w-4" />
        case "file":
          return <File className="h-4 w-4" />
        default:
          return <FileText className="h-4 w-4" />
      }
    }

    return (
      <Card
        className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col"
        onClick={() => openPreview(item)}
      >
        {item.type === "link" && item.color && (
          <div
            className={`h-32 bg-gradient-to-br ${item.color} rounded-t-lg flex items-center justify-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 text-center text-white p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
                <Link className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
            </div>
          </div>
        )}

        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {item.type !== "link" && (
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {getTypeIcon()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm line-clamp-1">{item.title || "Untitled"}</h3>
                {item.domain && <p className="text-xs text-muted-foreground">{item.domain}</p>}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyToClipboard(item.content)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleFavorite(item.id)}>
                  <Heart className={`h-4 w-4 mr-2 ${item.favorite ? "fill-current" : ""}`} />
                  {item.favorite ? "Unfavorite" : "Favorite"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {item.type === "text" && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">{item.content}</p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.tags.length - 2}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</span>
          </div>
        </CardContent>
      </Card>
    )
  })

  const PreviewModalContent = memo(({ item }: { item: ClipboardItem }) => {
    const [iframeLoading, setIframeLoading] = useState(true)
    const [iframeError, setIframeError] = useState(false)
    
    console.log('🎭 Modal opened with item:', {
      id: item.id,
      title: item.title,
      domain: item.domain,
      preview: item.preview,
      content: item.content.substring(0, 50) + '...'
    })
    
    useEffect(() => {
      setIframeLoading(true)
      setIframeError(false)
      
      // For links, set a general timeout for iframe loading
      if (item.type === 'link') {
        console.log('🔄 Setting 8-second timeout for link:', item.title || item.content.substring(0, 50))
        
        const timer = setTimeout(() => {
          console.log('⏰ Timeout reached - showing fallback for:', item.title || item.content.substring(0, 50))
          setIframeLoading(false)
          setIframeError(true)
        }, 8000) // 8 second timeout for all sites
        
        return () => clearTimeout(timer)
      }
    }, [item.id, item.type, item.domain, item.content])

    const renderPreviewContent = () => {
      switch (item.type) {
        case "link":
          // Always attempt iframe loading for ALL links - let them fail gracefully
          const shouldShowIframe = true
          
          
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Link className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{item.domain}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(item.content, "_blank")
                  }}
                >
                  Open Link
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden bg-background">
                <div className="p-3 border-b bg-muted/50 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-sm text-muted-foreground">{item.content}</span>
                  </div>
                </div>
                <div className="aspect-video relative">
                  {shouldShowIframe && !iframeError ? (
                    <>
                      {iframeLoading && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm text-muted-foreground">Loading preview...</p>
                          </div>
                        </div>
                      )}
                      <iframe
                        key={item.id}
                        src={item.content}
                        className="w-full h-full border-0"
                        title={item.title}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        loading="lazy"
                        onLoad={(e) => {
                          console.log('📱 Iframe load event fired for:', item.title)
                          
                          // Check if iframe actually has accessible content
                          try {
                            const iframe = e.currentTarget as HTMLIFrameElement
                            // Try to access iframe content - this will throw if CSP blocked it
                            const doc = iframe.contentDocument || iframe.contentWindow?.document
                            if (doc && doc.readyState) {
                              console.log('✅ Iframe content accessible - real success for:', item.title)
                              setIframeLoading(false)
                            } else {
                              throw new Error('Content not accessible')
                            }
                          } catch (err) {
                            console.log('❌ Iframe blocked by CSP/security - showing fallback for:', item.title)
                            setIframeLoading(false)
                            setIframeError(true)
                          }
                        }}
                        onError={() => {
                          console.log('❌ Iframe failed to load for:', item.title, '- showing fallback')
                          setIframeLoading(false)
                          setIframeError(true)
                        }}
                      />
                      {!iframeLoading && (
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(item.content, "_blank")}
                            className="opacity-75 hover:opacity-100"
                          >
                            <Link className="h-4 w-4 mr-1" />
                            Open
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-muted/20 flex flex-col items-center justify-center p-8">
                      {(() => {
                        console.log('🎨 Rendering fallback view for:', {
                          title: item.title,
                          domain: item.domain, 
                          preview: item.preview,
                          hasPreview: !!item.preview
                        })
                        return null
                      })()}
                      <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                          <Link className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {item.preview || 'This website cannot be displayed in a preview frame.'}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => window.open(item.content, "_blank")}
                          className="inline-flex items-center space-x-2"
                        >
                          <Link className="h-4 w-4" />
                          <span>Visit {item.domain}</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )

        case "text":
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.content.length} characters</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/20 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{item.content}</pre>
              </div>
            </div>
          )

        case "image":
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">Image file</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center min-h-64">
                <img
                  src={item.content || "/placeholder.svg"}
                  alt={item.title || "Preview"}
                  className="max-w-full max-h-96 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    target.parentElement!.innerHTML = `
                      <div class="flex flex-col items-center justify-center p-8 text-muted-foreground">
                        <ImageIcon class="h-12 w-12 mb-2" />
                        <p>Unable to load image</p>
                      </div>
                    `
                  }}
                />
              </div>
            </div>
          )

        case "file":
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">File</p>
                </div>
              </div>

              <div className="border rounded-lg p-8 bg-muted/20 text-center">
                <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">File preview not available</p>
                <div className="bg-muted rounded p-3 text-sm font-mono break-all">{item.content}</div>
              </div>
            </div>
          )

        default:
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Preview not available for this content type</p>
            </div>
          )
      }
    }

    return (
      <>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <span>Content Preview</span>
            <Badge variant="secondary" className="ml-2">
              {item.type.toUpperCase()}
            </Badge>
          </DialogTitle>
          <p id="preview-description" className="sr-only">
            Preview of {item.type} content: {item.title || 'Untitled'}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">{renderPreviewContent()}</div>

        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(item.content)
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
      </>
    )
  })

  const handleThemeChange = useCallback(
    (newTheme: string) => {
      setTheme(newTheme)
    },
    [setTheme],
  )

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <Sidebar>
        <SidebarHeader>
          <h1 className="text-xl font-semibold px-2">Clippy</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>QUICK ACCESS</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Clock className="h-4 w-4" />
                    <span>Recently Copied</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {items.length}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Star className="h-4 w-4" />
                    <span>Favorites</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {items.filter((item) => item.favorite).length}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>SORT BY</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest to Oldest</SelectItem>
                    <SelectItem value="oldest">Oldest to Newest</SelectItem>
                    <SelectItem value="most-used">Most Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>CATEGORIES</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {["all", "text", "link", "image", "file"].map((category) => (
                  <SidebarMenuItem key={category}>
                    <SidebarMenuButton
                      onClick={() => setSelectedCategory(category)}
                      isActive={selectedCategory === category}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          selectedCategory === category ? "bg-primary" : "bg-muted-foreground"
                        )}
                      />
                      <span className="capitalize">{category === "all" ? "All Items" : category}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {category === "all" ? items.length : items.filter((item) => item.type === category).length}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search titles, content, notes, tags, folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 lg:w-80"
                  />
                </div>

                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                  {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      {!mounted ? (
                        <Monitor className="h-4 w-4" />
                      ) : theme === "light" ? (
                        <Sun className="h-4 w-4" />
                      ) : theme === "dark" ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Monitor className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-3 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No items found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery
                  ? "Try adjusting your search terms or browse different categories"
                  : "Start by copying something to your clipboard. Press Ctrl+V when this app is focused to capture content automatically."}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                  : "space-y-4"
              }
            >
              {filteredItems.map((item) => (
                <ClipboardCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </SidebarInset>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-capture">Auto-capture clipboard</Label>
                <Switch id="auto-capture" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Show notifications</Label>
                <Switch id="notifications" defaultChecked />
              </div>
            </TabsContent>
            <TabsContent value="appearance" className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={mounted ? theme : "system"} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={previewOpen} 
        onOpenChange={(open) => {
          if (!open) {
            React.startTransition(() => {
              setPreviewOpen(false)
              setPreviewItem(null)
            })
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl h-[80vh] overflow-hidden flex flex-col" aria-describedby="preview-description">
          {previewItem && <PreviewModalContent item={previewItem} />}
        </DialogContent>
      </Dialog>

      <Toaster />
    </SidebarProvider>
  )
}
