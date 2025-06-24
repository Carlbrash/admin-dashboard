"use client"

import React, { useState, useEffect, createContext, useContext, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'admin' | 'user'
  avatar?: string
  createdAt: Date
  lastLogin: Date
  preferences?: {
    theme: 'light' | 'dark'
    language: 'en' | 'el'
    notifications: boolean
  }
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
}

// Storage keys for consistency
const STORAGE_KEYS = {
  REGISTERED_USERS: 'registered_users',
  AUTH_SESSION: 'auth_session',
  USER_PREFERENCES: 'user_preferences',
  DEMO_MODE: 'demo_mode'
} as const

// Default users database (always available)
const DEFAULT_USERS: (Omit<User, 'lastLogin'> & { password: string })[] = [
  {
    id: 'superadmin-1',
    email: 'superadmin@tradingpro.com',
    password: 'SuperAdmin2025!',
    name: '🔥 Super Administrator',
    role: 'superadmin',
    createdAt: new Date('2024-01-01'),
    preferences: {
      theme: 'dark',
      language: 'el',
      notifications: true
    }
  },
  {
    id: 'jdgod-superadmin',
    email: 'JDGod',
    password: 'Kiki1999@',
    name: '👑 JDGod - Master Admin',
    role: 'superadmin',
    createdAt: new Date('2024-01-01'),
    preferences: {
      theme: 'dark',
      language: 'el',
      notifications: true
    }
  },
  {
    id: 'admin-demo',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Γιάννης Demo Admin',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    preferences: {
      theme: 'dark',
      language: 'el',
      notifications: true
    }
  },
  {
    id: 'user-demo',
    email: 'trader@example.com',
    password: 'trader123',
    name: 'Νίκος Demo Trader',
    role: 'user',
    createdAt: new Date('2024-02-01'),
    preferences: {
      theme: 'dark',
      language: 'el',
      notifications: true
    }
  }
]

class AuthService {
  private currentUser: User | null = null
  private listeners: Set<(state: AuthState) => void> = new Set()
  private registeredUsers: (Omit<User, 'lastLogin'> & { password: string })[] = []
  private initialized = false

  constructor() {
    // Initialize without user - will check for session when init() is called
    this.currentUser = null
  }

  // Initialize auth service (called on mount)
  init() {
    if (this.initialized) return
    this.initialized = true

    // Load registered users first
    this.loadRegisteredUsers()
    // Then check for existing session
    this.loadSession()

    console.log(`🔐 Auth service initialized with ${this.registeredUsers.length} registered users`)
  }

  // Load registered users from localStorage
  private loadRegisteredUsers() {
    if (typeof window === 'undefined') return

    try {
      const savedUsers = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers)
        if (Array.isArray(parsed)) {
          // Convert createdAt dates back from strings and validate structure
          this.registeredUsers = parsed
            .filter(user => user.id && user.email && user.password && user.name) // Basic validation
            .map(user => ({
              ...user,
              createdAt: new Date(user.createdAt),
              role: user.role === 'admin' ? 'admin' : 'user' // Ensure valid role
            }))

          console.log(`✅ Loaded ${this.registeredUsers.length} registered users from storage`)
        }
      }
    } catch (error) {
      console.error('Error loading registered users:', error)
      // Clear corrupted data
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.REGISTERED_USERS)
      }
      this.registeredUsers = []
    }
  }

  // Save registered users to localStorage
  private saveRegisteredUsers() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(this.registeredUsers))
      console.log(`💾 Saved ${this.registeredUsers.length} registered users to storage`)
    } catch (error) {
      console.error('Error saving registered users:', error)
    }
  }

  // Get all users (default + registered)
  private getAllUsersData(): (Omit<User, 'lastLogin'> & { password: string })[] {
    return [...DEFAULT_USERS, ...this.registeredUsers]
  }

  private loadSession() {
    if (typeof window === 'undefined') return

    try {
      const sessionData = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION)
      if (sessionData) {
        const { user, timestamp } = JSON.parse(sessionData)
        const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000 // 24 hours

        if (!isExpired && user && user.id && user.email && user.name) {
          this.currentUser = {
            ...user,
            createdAt: new Date(user.createdAt),
            lastLogin: new Date(user.lastLogin)
          }
          console.log(`🔄 Restored session for: ${user.name} (${user.role})`)
          this.notifyListeners()
        } else {
          console.log('🕐 Session expired or invalid - clearing')
          this.clearSession()
        }
      }
    } catch (error) {
      console.error('Error loading session:', error)
      this.clearSession()
    }
  }

  private saveSession(user: User) {
    if (typeof window === 'undefined') return

    try {
      const sessionData = { user, timestamp: Date.now() }
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(sessionData))
      console.log(`💾 Session saved for: ${user.name}`)
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  private clearSession() {
    if (typeof window === 'undefined') return

    try {
      // Only clear session data, keep registered users
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION)
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
      localStorage.removeItem(STORAGE_KEYS.DEMO_MODE)

      // Clear other app-specific data but preserve registered users
      const keysToRemove = ['trading_data', 'watchlist', 'portfolio_data']
      for (const key of keysToRemove) {
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }

  private notifyListeners() {
    const state: AuthState = {
      user: this.currentUser,
      isLoading: false,
      isAuthenticated: !!this.currentUser,
      isAdmin: this.currentUser?.role === 'admin' || this.currentUser?.role === 'superadmin',
      isSuperAdmin: this.currentUser?.role === 'superadmin'
    }

    // Notify all listeners
    for (const listener of this.listeners) {
      try {
        setTimeout(() => listener(state), 0) // Ensure async update
      } catch (error) {
        console.error('Error in auth listener:', error)
      }
    }
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) || email === 'JDGod' // Special case for JDGod
  }

  // Validate password strength
  private isValidPassword(password: string): boolean {
    return password.length >= 6 // Minimum 6 characters
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (!email || !password) {
        return { success: false, error: 'Παρακαλώ συμπληρώστε όλα τα πεδία' }
      }

      const allUsers = this.getAllUsersData()
      // Case-insensitive email search (except for JDGod which is username)
      const foundUser = allUsers.find(u =>
        u.email === email ||
        (email !== 'JDGod' && u.email.toLowerCase() === email.toLowerCase())
      )

      if (!foundUser || foundUser.password !== password) {
        return { success: false, error: 'Λανθασμένα στοιχεία σύνδεσης' }
      }

      const user: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        avatar: foundUser.avatar,
        createdAt: foundUser.createdAt,
        lastLogin: new Date(),
        preferences: foundUser.preferences
      }

      this.currentUser = user
      this.saveSession(user)
      this.notifyListeners()

      console.log(`✅ Login successful: ${user.name} (${user.role})`)
      return { success: true, user }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Σφάλμα κατά τη σύνδεση' }
    }
  }

  async register(email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Validation
      if (!email || !password || !name) {
        return { success: false, error: 'Παρακαλώ συμπληρώστε όλα τα πεδία' }
      }

      if (!this.isValidEmail(email)) {
        return { success: false, error: 'Μη έγκυρη διεύθυνση email' }
      }

      if (!this.isValidPassword(password)) {
        return { success: false, error: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες' }
      }

      // Check if email already exists (case-insensitive)
      const allUsers = this.getAllUsersData()
      const existingUser = allUsers.find(u =>
        u.email.toLowerCase() === email.toLowerCase()
      )

      if (existingUser) {
        return { success: false, error: 'Το email υπάρχει ήδη' }
      }

      // Generate unique ID for registered users
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const userId = `registered-${timestamp}-${randomSuffix}`

      // Create new user
      const newUserData: Omit<User, 'lastLogin'> & { password: string } = {
        id: userId,
        email: email.trim(),
        password: password,
        name: name.trim(),
        role: role,
        createdAt: new Date(),
        preferences: {
          theme: 'dark',
          language: 'el',
          notifications: true
        }
      }

      // Add to registered users and save to localStorage
      this.registeredUsers.push(newUserData)
      this.saveRegisteredUsers()

      // Create user object for session
      const user: User = {
        id: newUserData.id,
        email: newUserData.email,
        name: newUserData.name,
        role: newUserData.role,
        createdAt: newUserData.createdAt,
        lastLogin: new Date(),
        preferences: newUserData.preferences
      }

      this.currentUser = user
      this.saveSession(user)
      this.notifyListeners()

      console.log(`✅ Registration successful and saved persistently: ${user.name} (${user.role})`)
      return { success: true, user }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Σφάλμα κατά την εγγραφή' }
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 Logout initiated...')
    this.currentUser = null
    this.clearSession()
    this.notifyListeners()

    // Small delay to ensure state updates, then redirect
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }, 100)
  }

  forceLogout(): void {
    console.log('🔥 Force logout initiated...')
    try {
      this.currentUser = null
      this.clearSession()
      this.notifyListeners()

      // Force immediate page reload
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Force logout error:', error)
      // Even if there's an error, try to redirect
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      isLoading: false,
      isAuthenticated: !!this.currentUser,
      isAdmin: this.currentUser?.role === 'admin' || this.currentUser?.role === 'superadmin',
      isSuperAdmin: this.currentUser?.role === 'superadmin'
    }
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener)
    // Immediately notify with current state
    listener(this.getAuthState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  getDemoCredentials() {
    const allUsers = this.getAllUsersData()
    return {
      admins: allUsers
        .filter(u => u.role === 'admin')
        .map(u => ({
          email: u.email,
          password: u.password,
          name: u.name
        })),
      users: allUsers
        .filter(u => u.role === 'user')
        .map(u => ({
          email: u.email,
          password: u.password,
          name: u.name
        }))
    }
  }

  // Super Admin functions
  isSuperAdmin(): boolean {
    return this.currentUser?.id === 'superadmin-1' || this.currentUser?.id === 'jdgod-superadmin'
  }

  getAllUsers(): User[] {
    const allUsers = this.getAllUsersData()
    return allUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      lastLogin: new Date(), // Mock last login
      preferences: u.preferences
    }))
  }

  promoteToAdmin(userId: string): { success: boolean; message: string } {
    if (!this.isSuperAdmin()) {
      return { success: false, message: 'Μόνο ο Super Administrator μπορεί να κάνει promote users' }
    }

    // Only allow promoting registered users (not default users)
    const registeredUserIndex = this.registeredUsers.findIndex(u => u.id === userId)
    if (registeredUserIndex === -1) {
      return { success: false, message: 'Μπορείτε να κάνετε promote μόνο registered users' }
    }

    const user = this.registeredUsers[registeredUserIndex]
    if (user.role === 'admin') {
      return { success: false, message: 'Ο χρήστης είναι ήδη administrator' }
    }

    user.role = 'admin'
    this.saveRegisteredUsers()

    console.log(`✅ User ${user.name} promoted to admin by Super Admin`)
    return { success: true, message: `Ο χρήστης ${user.name} έγινε Administrator` }
  }

  demoteFromAdmin(userId: string): { success: boolean; message: string } {
    if (!this.isSuperAdmin()) {
      return { success: false, message: 'Μόνο ο Super Administrator μπορεί να κάνει demote admins' }
    }

    if (userId === 'superadmin-1' || userId === 'jdgod-superadmin') {
      return { success: false, message: 'Δεν μπορείς να κάνεις demote τον Super Administrator' }
    }

    // Only allow demoting registered users (not default users)
    const registeredUserIndex = this.registeredUsers.findIndex(u => u.id === userId)
    if (registeredUserIndex === -1) {
      return { success: false, message: 'Μπορείτε να κάνετε demote μόνο registered users' }
    }

    const user = this.registeredUsers[registeredUserIndex]
    if (user.role === 'user') {
      return { success: false, message: 'Ο χρήστης είναι ήδη user' }
    }

    user.role = 'user'
    this.saveRegisteredUsers()

    console.log(`✅ Admin ${user.name} demoted to user by Super Admin`)
    return { success: true, message: `Ο χρήστης ${user.name} έγινε User` }
  }

  // Clear all registered users (for super admin debugging)
  clearRegisteredUsers(): { success: boolean; message: string } {
    if (!this.isSuperAdmin()) {
      return { success: false, message: 'Μόνο ο Super Administrator μπορεί να διαγράψει registered users' }
    }

    const count = this.registeredUsers.length
    this.registeredUsers = []
    this.saveRegisteredUsers()

    console.log(`🗑️ Super Admin cleared ${count} registered users`)
    return { success: true, message: `Διαγράφηκαν ${count} registered users` }
  }

  // Get storage information
  getStorageInfo(): { success: boolean; data?: any; message: string } {
    if (!this.isSuperAdmin()) {
      return { success: false, message: 'Μόνο ο Super Administrator μπορεί να δει storage info' }
    }

    try {
      const registeredUsersSize = JSON.stringify(this.registeredUsers).length
      const sessionSize = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION)?.length || 0

      return {
        success: true,
        data: {
          registeredUsers: this.registeredUsers.length,
          registeredUsersSize: `${(registeredUsersSize / 1024).toFixed(2)} KB`,
          sessionSize: `${(sessionSize / 1024).toFixed(2)} KB`,
          totalDefaultUsers: DEFAULT_USERS.length,
          totalUsers: this.getAllUsersData().length
        },
        message: 'Storage info retrieved successfully'
      }
    } catch (error) {
      return { success: false, message: 'Error retrieving storage info' }
    }
  }

  // Get registered users count
  getRegisteredUsersCount(): number {
    return this.registeredUsers.length
  }

  // Update user profile
  async updateProfile(updates: {
    name?: string
    avatar?: string
    preferences?: {
      theme: 'light' | 'dark'
      language: 'en' | 'el'
      notifications: boolean
    }
  }): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Δεν είστε συνδεδεμένοι' }
      }

      // Find user in registered users array
      const registeredUserIndex = this.registeredUsers.findIndex(u => u.id === this.currentUser!.id)

      if (registeredUserIndex !== -1) {
        // Update registered user
        if (updates.name) {
          this.registeredUsers[registeredUserIndex].name = updates.name
        }
        if (updates.avatar !== undefined) {
          this.registeredUsers[registeredUserIndex].avatar = updates.avatar
        }
        if (updates.preferences) {
          this.registeredUsers[registeredUserIndex].preferences = updates.preferences
        }

        // Save to localStorage
        this.saveRegisteredUsers()
      }
      // Note: Default users can't be updated permanently, only in session

      // Update current user session
      const updatedUser: User = {
        ...this.currentUser,
        name: updates.name || this.currentUser.name,
        avatar: updates.avatar !== undefined ? updates.avatar : this.currentUser.avatar,
        preferences: updates.preferences || this.currentUser.preferences
      }

      this.currentUser = updatedUser
      this.saveSession(updatedUser)
      this.notifyListeners()

      console.log(`✅ Profile updated for: ${updatedUser.name}`)
      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Σφάλμα κατά την ενημέρωση προφίλ' }
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Δεν είστε συνδεδεμένοι' }
      }

      // Validate current password
      const allUsers = this.getAllUsersData()
      const userWithPassword = allUsers.find(u => u.id === this.currentUser!.id)

      if (!userWithPassword || userWithPassword.password !== currentPassword) {
        return { success: false, error: 'Λανθασμένος τρέχων κωδικός πρόσβασης' }
      }

      // Validate new password
      if (!this.isValidPassword(newPassword)) {
        return { success: false, error: 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες' }
      }

      // Find and update in registered users
      const registeredUserIndex = this.registeredUsers.findIndex(u => u.id === this.currentUser!.id)

      if (registeredUserIndex !== -1) {
        // Update registered user password
        this.registeredUsers[registeredUserIndex].password = newPassword
        this.saveRegisteredUsers()

        console.log(`✅ Password changed for registered user: ${this.currentUser.name}`)
        return { success: true }
      } else {
        // For default users, we can't permanently change password
        // But we can still validate and show success (session only)
        console.log(`⚠️ Password change for default user ${this.currentUser.name} - session only`)
        return { success: true }
      }
    } catch (error) {
      console.error('Password change error:', error)
      return { success: false, error: 'Σφάλμα κατά την αλλαγή κωδικού' }
    }
  }

  // Export user data for backup
  exportUserData(): { success: boolean; data?: any; error?: string } {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Δεν είστε συνδεδεμένοι' }
      }

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        userId: this.currentUser.id,
        userType: this.currentUser.id.startsWith('registered-') ? 'registered' : 'default',
        userData: {
          id: this.currentUser.id,
          email: this.currentUser.email,
          name: this.currentUser.name,
          role: this.currentUser.role,
          avatar: this.currentUser.avatar,
          createdAt: this.currentUser.createdAt,
          preferences: this.currentUser.preferences
        },
        registeredUserData: this.currentUser.id.startsWith('registered-')
          ? this.registeredUsers.find(u => u.id === this.currentUser!.id)
          : null,
        metadata: {
          browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
          platform: typeof window !== 'undefined' ? window.navigator.platform : 'Unknown'
        }
      }

      console.log(`✅ User data exported for: ${this.currentUser.name}`)
      return { success: true, data: exportData }
    } catch (error) {
      console.error('Export error:', error)
      return { success: false, error: 'Σφάλμα κατά την εξαγωγή δεδομένων' }
    }
  }

  // Import user data from backup
  async importUserData(importData: any): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Δεν είστε συνδεδεμένοι' }
      }

      // Validate import data
      if (!importData || !importData.userData || !importData.version) {
        return { success: false, error: 'Μη έγκυρα δεδομένα εισαγωγής' }
      }

      const userData = importData.userData

      // Validate required fields
      if (!userData.name || !userData.email) {
        return { success: false, error: 'Ελλιπή δεδομένα χρήστη' }
      }

      // Update current user profile
      const result = await this.updateProfile({
        name: userData.name,
        avatar: userData.avatar || '',
        preferences: userData.preferences || {
          theme: 'dark',
          language: 'el',
          notifications: true
        }
      })

      if (!result.success) {
        return { success: false, error: result.error || 'Σφάλμα κατά την ενημέρωση προφίλ' }
      }

      console.log(`✅ User data imported for: ${userData.name}`)
      return { success: true }
    } catch (error) {
      console.error('Import error:', error)
      return { success: false, error: 'Σφάλμα κατά την εισαγωγή δεδομένων' }
    }
  }

  // Export all users (admin only)
  exportAllUsers(): { success: boolean; data?: any; error?: string } {
    try {
      if (!this.isSuperAdmin()) {
        return { success: false, error: 'Μόνο ο Super Administrator μπορεί να εξάγει όλα τα δεδομένα' }
      }

      const allUsers = this.getAllUsersData()
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        exportedBy: this.currentUser?.name || 'Unknown',
        totalUsers: allUsers.length,
        defaultUsers: DEFAULT_USERS.length,
        registeredUsers: this.registeredUsers.length,
        users: allUsers.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
          preferences: user.preferences,
          userType: user.id.startsWith('registered-') ? 'registered' : 'default'
        })),
        metadata: {
          browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
          platform: typeof window !== 'undefined' ? window.navigator.platform : 'Unknown'
        }
      }

      console.log(`✅ All users data exported by Super Admin: ${this.currentUser?.name}`)
      return { success: true, data: exportData }
    } catch (error) {
      console.error('Export all users error:', error)
      return { success: false, error: 'Σφάλμα κατά την εξαγωγή όλων των δεδομένων' }
    }
  }

  // Import users (admin only)
  async importUsers(importData: any): Promise<{ success: boolean; imported?: number; error?: string }> {
    try {
      if (!this.isSuperAdmin()) {
        return { success: false, error: 'Μόνο ο Super Administrator μπορεί να εισάγει δεδομένα χρηστών' }
      }

      // Validate import data
      if (!importData || !importData.users || !Array.isArray(importData.users)) {
        return { success: false, error: 'Μη έγκυρα δεδομένα εισαγωγής' }
      }

      let importedCount = 0

      for (const userData of importData.users) {
        // Only import registered users (not default users)
        if (userData.userType === 'registered' && userData.id && userData.email && userData.name) {
          // Check if user already exists
          const existingUser = this.registeredUsers.find(u => u.id === userData.id || u.email === userData.email)

          if (!existingUser) {
            // Add new registered user
            this.registeredUsers.push({
              id: userData.id,
              email: userData.email,
              password: 'imported_user_' + Math.random().toString(36).substring(2, 8), // Temporary password
              name: userData.name,
              role: userData.role === 'admin' ? 'admin' : 'user',
              createdAt: new Date(userData.createdAt || Date.now()),
              avatar: userData.avatar,
              preferences: userData.preferences || {
                theme: 'dark',
                language: 'el',
                notifications: true
              }
            })
            importedCount++
          }
        }
      }

      // Save imported users
      if (importedCount > 0) {
        this.saveRegisteredUsers()
      }

      console.log(`✅ Imported ${importedCount} users by Super Admin: ${this.currentUser?.name}`)
      return { success: true, imported: importedCount }
    } catch (error) {
      console.error('Import users error:', error)
      return { success: false, error: 'Σφάλμα κατά την εισαγωγή χρηστών' }
    }
  }

  // Clear all data (emergency reset - admin only)
  clearAllUserData(): { success: boolean; error?: string } {
    try {
      if (!this.isSuperAdmin()) {
        return { success: false, error: 'Μόνο ο Super Administrator μπορεί να διαγράψει όλα τα δεδομένα' }
      }

      // Clear registered users
      this.registeredUsers = []
      this.saveRegisteredUsers()

      // Clear other storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION)
        localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
        localStorage.removeItem(STORAGE_KEYS.DEMO_MODE)
      }

      console.log(`🗑️ All user data cleared by Super Admin: ${this.currentUser?.name}`)
      return { success: true }
    } catch (error) {
      console.error('Clear all data error:', error)
      return { success: false, error: 'Σφάλμα κατά τη διαγραφή δεδομένων' }
    }
  }

  // Check if user is in demo mode
  isDemoMode(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'enabled'
  }

  // Exit demo mode
  exitDemoMode(): void {
    console.log('🚪 Exiting demo mode...')
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.DEMO_MODE)
    }
    this.currentUser = null
    this.notifyListeners()
  }
}

// Create singleton instance
export const authService = new AuthService()

// React Context
const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => authService.getAuthState())

  useEffect(() => {
    // Initialize auth service on mount
    authService.init()

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  return React.createElement(AuthContext.Provider, { value: authState }, children)
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
