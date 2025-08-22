"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Monitor,
  Moon,
  Sun,
  Download,
  Upload,
  Trash2,
  Shield,
  Keyboard,
  Bell,
  Database,
  AlertTriangle,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Settings state
  const [settings, setSettings] = useState({
    autoCapture: true,
    notifications: true,
    soundEffects: false,
    autoDelete: false,
    deleteAfterDays: 30,
    maxItems: 1000,
    encryptSensitive: false,
    backupEnabled: true,
    keyboardShortcuts: {
      paste: "Ctrl+V",
      search: "Ctrl+F",
      newItem: "Ctrl+N",
      settings: "Ctrl+,",
    },
  })

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const exportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clipboard-settings-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Settings exported",
      description: "Your settings have been downloaded successfully",
    })
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all clipboard data? This action cannot be undone.")) {
      localStorage.clear()
      toast({
        title: "Data cleared",
        description: "All clipboard data has been removed",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings & Preferences</DialogTitle>
          <DialogDescription>Customize your clipboard manager experience and manage your data</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Clipboard Capture</span>
                </CardTitle>
                <CardDescription>Configure how clipboard content is automatically captured</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-capture clipboard content</Label>
                    <p className="text-sm text-muted-foreground">Automatically save content when you paste (Ctrl+V)</p>
                  </div>
                  <Switch
                    checked={settings.autoCapture}
                    onCheckedChange={(checked) => updateSetting("autoCapture", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Maximum items to store</Label>
                  <Select
                    value={settings.maxItems.toString()}
                    onValueChange={(value) => updateSetting("maxItems", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 items</SelectItem>
                      <SelectItem value="500">500 items</SelectItem>
                      <SelectItem value="1000">1,000 items</SelectItem>
                      <SelectItem value="5000">5,000 items</SelectItem>
                      <SelectItem value="10000">10,000 items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show notifications</Label>
                    <p className="text-sm text-muted-foreground">Display toast notifications for clipboard actions</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => updateSetting("notifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sound effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for clipboard actions</p>
                  </div>
                  <Switch
                    checked={settings.soundEffects}
                    onCheckedChange={(checked) => updateSetting("soundEffects", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Preferences</CardTitle>
                <CardDescription>Choose how the application looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Color theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex items-center space-x-2"
                    >
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex items-center space-x-2"
                    >
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="flex items-center space-x-2"
                    >
                      <Monitor className="h-4 w-4" />
                      <span>System</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy & Security</span>
                </CardTitle>
                <CardDescription>Control how your data is stored and protected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Encrypt sensitive content</Label>
                    <p className="text-sm text-muted-foreground">Automatically encrypt passwords and sensitive data</p>
                  </div>
                  <Switch
                    checked={settings.encryptSensitive}
                    onCheckedChange={(checked) => updateSetting("encryptSensitive", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-delete old items</Label>
                    <p className="text-sm text-muted-foreground">Automatically remove items after a specified time</p>
                  </div>
                  <Switch
                    checked={settings.autoDelete}
                    onCheckedChange={(checked) => updateSetting("autoDelete", checked)}
                  />
                </div>

                {settings.autoDelete && (
                  <div className="space-y-2">
                    <Label>Delete items after</Label>
                    <Select
                      value={settings.deleteAfterDays.toString()}
                      onValueChange={(value) => updateSetting("deleteAfterDays", Number.parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Clear all data</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Permanently delete all clipboard items and settings. This action cannot be undone.
                    </p>
                    <Button variant="destructive" onClick={clearAllData}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Keyboard className="h-5 w-5" />
                  <span>Keyboard Shortcuts</span>
                </CardTitle>
                <CardDescription>Customize keyboard shortcuts for quick actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.keyboardShortcuts).map(([action, shortcut]) => (
                  <div key={action} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="capitalize">{action.replace(/([A-Z])/g, " $1").trim()}</Label>
                      <p className="text-sm text-muted-foreground">
                        {action === "paste" && "Capture clipboard content"}
                        {action === "search" && "Focus search bar"}
                        {action === "newItem" && "Add new item manually"}
                        {action === "settings" && "Open settings dialog"}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {shortcut}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Import, export, and manage your clipboard data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Export Data</h4>
                    <p className="text-sm text-muted-foreground">Download your settings and preferences</p>
                    <Button onClick={exportData} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Import Data</h4>
                    <p className="text-sm text-muted-foreground">Restore settings from a backup file</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Settings
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Storage Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Storage used</p>
                      <p className="font-medium">2.3 MB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Items stored</p>
                      <p className="font-medium">156 items</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              toast({
                title: "Settings saved",
                description: "Your preferences have been updated successfully",
              })
              onOpenChange(false)
            }}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
