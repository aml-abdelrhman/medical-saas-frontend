'use client'

import React, { useState } from 'react'
import { Outlet, Link, useLocation } from '@tanstack/react-router'
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  DollarSign,
  MessageSquare
} from 'lucide-react'
import { api } from '@/services/axiosInstance'
import { useAuthStore } from '@/stores/useAuthStore'

export function SuperAdminLayout() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const logoutStore = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      logoutStore()
      localStorage.clear()
      sessionStorage.clear()
      api.post('/logout').catch(() => {})
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
      window.location.replace('/login')
    }
  }

  const menuItems = [
    { name: 'لوحة التحكم', icon: LayoutDashboard, path: '/dashboard/super-admin' },
    { name: 'إدارة العيادات', icon: Building2, path: '/dashboard/super-admin/clinics' },
    { name: 'إدارة الباقات', icon: CreditCard, path: '/dashboard/super-admin/plans' },
    { name: 'اشتراكات العيادات', icon: FileText, path: '/dashboard/super-admin/subscriptions' },
    { name: 'رسائل التواصل', icon: MessageSquare, path: '/dashboard/super-admin/contact-messages' },
   
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row text-slate-800 font-sans overflow-x-hidden" dir="rtl">
      
      {/* 1. السايدبار الجانبي (Sidebar) لسطح المكتب */}
      <aside className="hidden lg:flex w-64 bg-[#0d3b45] text-white flex-col shadow-xl z-25 shrink-0">
        <Link 
          to="/dashboard/super-admin"
          className="p-6 border-b border-teal-800/50 flex items-center gap-3 hover:bg-teal-900/30 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-md shrink-0">
            ك
          </div>
          <div className="text-right">
            <h2 className="font-bold text-lg">المركز الطبي</h2>
            <p className="text-xs text-teal-300">إدارة المنصة العامة</p>
          </div>
        </Link>

        {/* القائمة الجانبية وتحتها زر تسجيل الخروج مباشرة بدون مسافات فارغة بالأسفل */}
        <nav className="flex-1 p-4 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-900/30'
                      : 'text-teal-100 hover:bg-teal-900/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* زر تسجيل الخروج تحت اللينكات مباشرة */}
            <div className="pt-4 mt-4 border-t border-teal-800/50">
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-300 hover:bg-rose-500/10 transition-all font-medium text-sm disabled:opacity-50 cursor-pointer"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>{isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* 2. سايدبار الموبايل (Mobile Drawer Sidebar) مع خلفية معتمة */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-72 bg-[#0d3b45] text-white flex flex-col shadow-2xl z-10 h-full">
            <div className="p-5 border-b border-teal-800/50 flex items-center justify-between">
              <Link 
                to="/dashboard/super-admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md shrink-0">
                  ك
                </div>
                <div className="text-right">
                  <h2 className="font-bold text-base">المركز الطبي</h2>
                  <p className="text-[11px] text-teal-300">إدارة المنصة العامة</p>
                </div>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-teal-200 hover:text-white hover:bg-teal-900/50 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto flex flex-col justify-between">
              <div className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        isActive
                          ? 'bg-teal-500 text-white shadow-lg shadow-teal-900/30'
                          : 'text-teal-100 hover:bg-teal-900/40 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}

                {/* زر تسجيل الخروج للموبايل تحت اللينكات مباشرة */}
                <div className="pt-4 mt-4 border-t border-teal-800/50">
                  <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-300 hover:bg-rose-500/10 transition-all font-medium text-sm disabled:opacity-50 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span>{isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* 3. المحتوى الرئيسي والهيدر (Main Content Area) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-xl transition-all"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base sm:text-xl font-black text-slate-800 truncate">نظرة عامة على المنصة</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700">مدير النظام العام</p>
              <p className="text-xs text-teal-600 font-medium">Super Admin</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center border-2 border-teal-500 shadow-inner shrink-0 text-xs sm:text-sm">
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>

    </div>
  )
}