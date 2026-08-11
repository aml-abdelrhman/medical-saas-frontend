'use client'

import React, { useState } from 'react'
import { Menu, X, LayoutDashboard, User, ChevronLeft, LogOut } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/useAuthStore'

const navItems = [
  { name: 'الرئيسية', href: '#home' },
  { name: 'المميزات', href: '#features' },
  { name: 'الأسعار', href: '#pricing' },
  { name: 'اتصل بنا', href: '#contact' },
]

export function SaasNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const currentUser = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const isSuperAdmin = currentUser && currentUser.role === 'super_admin'

  const handleLogout = () => {
    const token = useAuthStore.getState().token || localStorage.getItem('token')

    // 1. تصفير الـ Store وإلغاء المصادقة فوراً من الذاكرة
    logout()

    // 2. مسح شامل للتخزين المحلي لجعل النافبار يحدث حالته تلقائياً
    localStorage.clear()
    sessionStorage.clear()

    // 3. طلب السيرفر في الخلفية
    const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    if (token) {
      fetch(`${apiBaseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }).catch((error) => console.error('Logout failed:', error))
    }

    // 4. إعادة التوجيه الفوري
    window.location.replace('/login')
  }

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-sm"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-400 tracking-tight group-hover:text-teal-300 transition-colors">
              المركز الطبي
            </span>
            <span className="hidden sm:inline-block text-sm font-medium text-slate-300 mt-1.5 border-r border-slate-800 pr-3">
              نظام إدارة العيادات الذكي
            </span>
          </Link>
        </div>

        <ul className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-100">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="hover:text-teal-400 transition-colors py-2"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          {isSuperAdmin ? (
            <>
              <Link
                to="/dashboard/super-admin"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-teal-600/95 text-white text-sm font-bold hover:bg-teal-700 transition-all shadow-sm"
              >
                <LayoutDashboard size={16} className="text-white shrink-0" />
                <span className="truncate max-w-[120px]">
                  {currentUser.name || 'لوحة السوبر أدمن'}
                </span>
                <ChevronLeft size={14} className="text-white/70 transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0 rtl:rotate-180" />
              </Link>
              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="flex items-center justify-center p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-teal-400 transition-colors px-3 py-2"
              >
                <User size={16} className="text-teal-400" />
                <span>تسجيل الدخول</span>
              </Link>
              <Link
                to="/register-clinic"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full transition-all shadow-lg shadow-teal-900/20"
              >
                احجز عرض توضيحي
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="فتح القائمة"
            className="text-slate-300 hover:text-white focus:outline-none p-1"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 shadow-xl animate-fadeIn">
          <ul className="px-4 py-6 space-y-4 text-center font-semibold text-slate-100">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="block py-3 hover:bg-teal-950/30 hover:text-teal-300 rounded-lg transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              </li>
            ))}
            <li className="pt-4 border-t border-slate-800 space-y-3">
              {isSuperAdmin ? (
                <>
                  <Link
                    to="/dashboard/super-admin"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold shadow-md hover:bg-teal-700 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard size={16} />
                      <span>{currentUser.name || 'لوحة السوبر أدمن'}</span>
                    </div>
                    <ChevronLeft size={16} className="text-white/80 rtl:rotate-180" />
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-md cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>تسجيل الخروج</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 py-3 text-teal-300 font-bold hover:bg-teal-950/30 rounded-lg transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={16} className="text-teal-400" />
                    <span>تسجيل الدخول</span>
                  </Link>
                  <Link
                    to="/register-clinic"
                    className="block w-full text-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full transition-all shadow-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    احجز عرض توضيحي
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

if (typeof document !== 'undefined') {
  const styleId = 'saas-navbar-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }
      section[id], div[id] {
        scroll-margin-top: 100px;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
      }
    `
    document.head.appendChild(style)
  }
}