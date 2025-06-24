"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { AuthProvider, useAuth, authService } from "../../lib/auth"
import { useTheme, ThemeProvider } from "../../lib/theme-context"
import { SharedNavigation } from "@/components/shared-navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Camera,
  Eye,
  EyeOff,
  Save,
  Upload,
  Download,
  Import,
  FileUp,
  FileDown,
  Shield,
  Settings,
  Bell,
  Globe,
  Palette,
  Lock,
  Mail,
  Calendar,
  Database,
  RefreshCw,
  AlertTriangle,
  Sun,
  Moon,
  Monitor
} from "lucide-react"
import { toast } from "sonner"

function ProfileContent() {
  const { user, isAuthenticated } = useAuth()

  // Safe theme hook with fallback for SSR
  let theme = 'dark' as 'light' | 'dark'
  let setTheme = (theme: 'light' | 'dark') => {}
  let toggleTheme = () => {}

  try {
    const themeContext = useTheme()
    theme = themeContext.theme
    setTheme = themeContext.setTheme
    toggleTheme = themeContext.toggleTheme
  } catch (error) {
    // Fallback for SSR - do nothing
  }
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: user?.avatar || '',
    theme: (user?.preferences?.theme || 'dark') as 'light' | 'dark',
    language: (user?.preferences?.language || 'el') as 'en' | 'el',
    notifications: user?.preferences?.notifications ?? true
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  // Export/Import state
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        avatar: user.avatar || '',
        theme: (user.preferences?.theme || theme) as 'light' | 'dark',
        language: (user.preferences?.language || 'el') as 'en' | 'el',
        notifications: user.preferences?.notifications ?? true
      })
      setAvatarPreview(user.avatar || '')
    }
  }, [user, theme])

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Παρακαλώ επιλέξτε μια έγκυρη εικόνα')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Η εικόνα πρέπει να είναι μικρότερη από 5MB')
        return
      }

      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        setProfileData(prev => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)

      toast.success('Η φωτογραφία επιλέχθηκε επιτυχώς!')
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)

    try {
      // Validate data
      if (!profileData.name.trim()) {
        toast.error('Το όνομα είναι υποχρεωτικό')
        setIsLoading(false)
        return
      }

      // Update profile data
      const result = await authService.updateProfile({
        name: profileData.name.trim(),
        avatar: profileData.avatar,
        preferences: {
          theme: profileData.theme as 'light' | 'dark',
          language: profileData.language as 'en' | 'el',
          notifications: profileData.notifications
        }
      })

      if (result.success) {
        toast.success('Τα στοιχεία σας ενημερώθηκαν επιτυχώς!')
      } else {
        toast.error(result.error || 'Σφάλμα κατά την ενημέρωση')
      }
    } catch (error) {
      toast.error('Σφάλμα δικτύου')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setIsLoading(true)

    try {
      // Validation
      if (!profileData.currentPassword) {
        toast.error('Εισάγετε τον τρέχοντα κωδικό πρόσβασης')
        setIsLoading(false)
        return
      }

      if (!profileData.newPassword || profileData.newPassword.length < 6) {
        toast.error('Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες')
        setIsLoading(false)
        return
      }

      if (profileData.newPassword !== profileData.confirmPassword) {
        toast.error('Οι κωδικοί πρόσβασης δεν ταιριάζουν')
        setIsLoading(false)
        return
      }

      const result = await authService.changePassword(
        profileData.currentPassword,
        profileData.newPassword
      )

      if (result.success) {
        toast.success('Ο κωδικός πρόσβασης ενημερώθηκε επιτυχώς!')
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        toast.error(result.error || 'Σφάλμα κατά την αλλαγή κωδικού')
      }
    } catch (error) {
      toast.error('Σφάλμα δικτύου')
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time theme switching handler
  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    // Immediately update the UI theme
    setTheme(newTheme)

    // Add theme switching animation
    document.body.classList.add('theme-switching')
    setTimeout(() => {
      document.body.classList.remove('theme-switching')
    }, 300)

    // Update the form data
    setProfileData(prev => ({ ...prev, theme: newTheme }))

    // Auto-save theme preference
    try {
      const result = await authService.updateProfile({
        name: profileData.name.trim(),
        avatar: profileData.avatar,
        preferences: {
          theme: newTheme,
          language: profileData.language as 'en' | 'el',
          notifications: profileData.notifications
        }
      })

      if (result.success) {
        toast.success(`🎨 Θέμα άλλαξε σε ${newTheme === 'dark' ? 'σκούρο' : 'φωτεινό'}!`, {
          duration: 2000,
        })
      }
    } catch (error) {
      console.error('Error saving theme preference:', error)
    }
  }

  // Export user data
  const handleExportData = () => {
    setIsExporting(true)

    try {
      const result = authService.exportUserData()

      if (result.success && result.data) {
        // Create download file
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })

        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `TradingPro_Profile_${user?.name}_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success('Τα δεδομένα σας εξήχθησαν επιτυχώς!')
      } else {
        toast.error(result.error || 'Σφάλμα κατά την εξαγωγή')
      }
    } catch (error) {
      toast.error('Σφάλμα κατά την εξαγωγή δεδομένων')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle import file selection
  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.json')) {
        toast.error('Παρακαλώ επιλέξτε ένα έγκυρο JSON αρχείο')
        return
      }

      // Validate file size (max 1MB for user data)
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Το αρχείο είναι πολύ μεγάλο (max 1MB)')
        return
      }

      setImportFile(file)
      toast.success('Αρχείο επιλέχθηκε - κάντε κλικ "Εισαγωγή" για συνέχεια')
    }
  }

  // Import user data
  const handleImportData = async () => {
    if (!importFile) {
      toast.error('Παρακαλώ επιλέξτε πρώτα ένα αρχείο')
      return
    }

    setIsImporting(true)

    try {
      const fileContent = await importFile.text()
      const importData = JSON.parse(fileContent)

      const result = await authService.importUserData(importData)

      if (result.success) {
        toast.success('Τα δεδομένα εισήχθησαν επιτυχώς!')
        // Refresh page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast.error(result.error || 'Σφάλμα κατά την εισαγωγή')
      }
    } catch (error) {
      toast.error('Μη έγκυρο αρχείο δεδομένων')
    } finally {
      setIsImporting(false)
      setImportFile(null)
      // Clear file input
      const fileInput = document.getElementById('import-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    }
  }

  // Export all users (admin only)
  const handleExportAllUsers = () => {
    setIsExporting(true)

    try {
      const result = authService.exportAllUsers()

      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })

        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `TradingPro_AllUsers_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success(`Εξήχθησαν ${result.data.totalUsers} χρήστες επιτυχώς!`)
      } else {
        toast.error(result.error || 'Σφάλμα κατά την εξαγωγή')
      }
    } catch (error) {
      toast.error('Σφάλμα κατά την εξαγωγή όλων των δεδομένων')
    } finally {
      setIsExporting(false)
    }
  }

  // Import users (admin only)
  const handleImportUsers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      toast.error('Παρακαλώ επιλέξτε ένα έγκυρο JSON αρχείο')
      return
    }

    setIsImporting(true)

    try {
      const fileContent = await file.text()
      const importData = JSON.parse(fileContent)

      const result = await authService.importUsers(importData)

      if (result.success) {
        toast.success(`Εισήχθησαν ${result.imported} χρήστες επιτυχώς!`)
      } else {
        toast.error(result.error || 'Σφάλμα κατά την εισαγωγή χρηστών')
      }
    } catch (error) {
      toast.error('Μη έγκυρο αρχείο δεδομένων')
    } finally {
      setIsImporting(false)
      // Clear file input
      event.target.value = ''
    }
  }

  // Clear all data (admin only)
  const handleClearAllData = () => {
    if (!confirm('ΠΡΟΣΟΧΗ: Θα διαγραφούν ΟΛΑ τα δεδομένα χρηστών! Είστε σίγουροι;')) {
      return
    }

    if (!confirm('ΤΕΛΕΥΤΑΙΑ ΠΡΟΕΙΔΟΠΟΙΗΣΗ: Αυτή η ενέργεια δεν μπορεί να αναιρεθεί!')) {
      return
    }

    try {
      const result = authService.clearAllUserData()

      if (result.success) {
        toast.success('Όλα τα δεδομένα διαγράφηκαν επιτυχώς!')
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        toast.error(result.error || 'Σφάλμα κατά τη διαγραφή')
      }
    } catch (error) {
      toast.error('Σφάλμα κατά τη διαγραφή δεδομένων')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Παρακαλώ συνδεθείτε για να δείτε το προφίλ σας</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <SharedNavigation />

      <div className="p-4 border-b border-slate-700 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">👤 Προφίλ Χρήστη</h1>
          <p className="text-slate-400">Διαχειριστείτε τα στοιχεία και τις προτιμήσεις σας</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Overview */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Επισκόπηση Προφίλ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xl">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0">
                  <Button
                    size="sm"
                    className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-slate-400">{user?.email}</p>
                <div className="flex items-center gap-2">
                  <Badge className={user?.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'}>
                    {user?.role === 'admin' ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Administrator
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 mr-1" />
                        User
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    Μέλος από {user?.createdAt.toLocaleDateString('el-GR')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Βασικά Στοιχεία
            </CardTitle>
            <CardDescription className="text-slate-400">
              Ενημερώστε τα προσωπικά σας στοιχεία
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Όνομα</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Το όνομά σας"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-slate-700 border-slate-600 text-slate-400"
                  placeholder="Το email σας"
                />
                <p className="text-xs text-slate-500">Το email δεν μπορεί να αλλάξει</p>
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Αποθήκευση...' : 'Αποθήκευση Στοιχείων'}
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Αλλαγή Κωδικού Πρόσβασης
            </CardTitle>
            <CardDescription className="text-slate-400">
              Ενημερώστε τον κωδικό πρόσβασής σας για καλύτερη ασφάλεια
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-white">Τρέχων Κωδικός</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white pr-10"
                  placeholder="Εισάγετε τον τρέχοντα κωδικό"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-white">Νέος Κωδικός</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white pr-10"
                    placeholder="Νέος κωδικός (min 6 χαρ.)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-white">Επιβεβαίωση Κωδικού</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white pr-10"
                    placeholder="Επαναλάβετε τον νέο κωδικό"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Lock className="h-4 w-4 mr-2" />
              {isLoading ? 'Αλλαγή...' : 'Αλλαγή Κωδικού'}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences with Real-time Theme Switching */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Προτιμήσεις
              <Badge className="bg-green-600 text-xs">✨ Real-time</Badge>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Προσαρμόστε την εμπειρία σας στην πλατφόρμα - οι αλλαγές εφαρμόζονται αμέσως!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Θέμα
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 theme-toggle ${theme === 'dark' ? 'bg-slate-700' : ''}`}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Σκούρο
                  </Button>
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 theme-toggle ${theme === 'light' ? 'bg-slate-700' : ''}`}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Φωτεινό
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  🎨 Το θέμα αλλάζει αμέσως σε όλη την εφαρμογή!
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Γλώσσα
                </Label>
                <Select
                  value={profileData.language}
                  onValueChange={(value) => setProfileData(prev => ({ ...prev, language: value as 'en' | 'el' }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="el">🇬🇷 Ελληνικά</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Ειδοποιήσεις
                </Label>
                <p className="text-sm text-slate-400">Λήψη ειδοποιήσεων για σημαντικές ενημερώσεις</p>
              </div>
              <Switch
                checked={profileData.notifications}
                onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, notifications: checked }))}
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Αποθήκευση...' : 'Αποθήκευση Προτιμήσεων'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <ProfileContent />
        </ErrorBoundary>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  )
}
