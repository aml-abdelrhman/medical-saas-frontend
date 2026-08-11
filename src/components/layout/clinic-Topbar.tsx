'use client'

import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { User, Calendar, Menu, X, LayoutDashboard, ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useAuthStore } from '@/stores/useAuthStore'

interface TopbarProps {
  sidebarCollapsed?: boolean
  clinic?: any
  doctors?: any[]
  specialties?: any[]
  onMobileMenuToggle?: () => void
}

export function Topbar({ clinic }: TopbarProps) {
  const { t, i18n } = useTranslation()
  const params = useParams({ strict: false }) as { slug?: string }
  
  const currentUser = useAuthStore((state) => state.user)
  const clinicSlug = params.slug || clinic?.slug || currentUser?.clinic?.slug || ''

  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getClinicName = () => {
    if (!clinic?.name) return 'Clinic'
    if (typeof clinic.name === 'string') {
      try {
        const parsed = JSON.parse(clinic.name)
        return (
          parsed[i18n.language] || parsed['ar'] || parsed['en'] || clinic.name
        )
      } catch (e) {
        return clinic.name
      }
    }
    if (typeof clinic.name === 'object') {
      return (
        clinic.name[i18n.language] ||
        clinic.name['ar'] ||
        clinic.name['en'] ||
        'Clinic'
      )
    }
    return clinic.name
  }

  const getDashboardLink = () => {
    const role = currentUser?.role
    if (role === 'super_admin') return '/dashboard/super-admin'
    if (role === 'admin')
      return clinicSlug
        ? `/clinics/${clinicSlug}/dashboard/admin`
        : '/dashboard/admin'
    if (role === 'doctor')
      return clinicSlug
        ? `/clinics/${clinicSlug}/dashboard/doctor`
        : '/dashboard/doctor'
    return clinicSlug
      ? `/clinics/${clinicSlug}/dashboard/patient`
      : '/dashboard/patient'
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#1B3A3A]/90 backdrop-blur-md shadow-lg py-3 border-b border-white/10'
          : 'bg-transparent py-4'
      }`}
      dir="rtl"
    >
      <div className="w-full px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center group cursor-pointer"
          >
            {clinic?.logo ? (
              <img
                src={clinic.logo}
                alt={getClinicName()}
                className="h-14 w-auto object-contain"
              />
            ) : (
              <div className="h-14 px-6 rounded-2xl bg-[#1B3A3A] flex items-center justify-center text-white font-bold text-lg shadow-sm border border-white/10">
                {getClinicName()}
              </div>
            )}
          </a>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-2">
          <a
            href="#services"
            className="text-md font-bold text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all border-b-2 border-transparent hover:border-[#C4A77D]"
          >
            {t('nav.services', 'الخدمات')}
          </a>
          <a
            href="#doctors"
            className="text-md font-bold text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all border-b-2 border-transparent hover:border-[#C4A77D]"
          >
            {t('nav.doctors', 'الأطباء')}
          </a>
          <a
            href="#features"
            className="text-md font-bold text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all border-b-2 border-transparent hover:border-[#C4A77D]"
          >
            {t('nav.features', 'المميزات')}
          </a>
          <a
            href="#contact"
            className="text-md font-bold text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl transition-all border-b-2 border-transparent hover:border-[#C4A77D]"
          >
            {t('nav.contact', 'اتصل بنا')}
          </a>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher />

          {currentUser ? (
            <a
              href={getDashboardLink()}
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-white/20 bg-emerald-600/80 backdrop-blur-md text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
            >
              <LayoutDashboard size={16} className="text-white shrink-0" />
              <span className="truncate max-w-[120px]">
                {currentUser.name || t('nav.dashboard', 'لوحة التحكم')}
              </span>
              <ChevronLeft size={14} className="text-white/70 transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0 rtl:rotate-180" />
            </a>
          ) : (
            <a
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 bg-black/20 backdrop-blur-md text-white text-sm font-bold hover:bg-white/30 hover:border-white/40 transition-all shadow-sm cursor-pointer"
            >
              <User size={16} className="text-[#C4A77D]" />
              <span>{t('nav.login', 'تسجيل الدخول')}</span>
            </a>
          )}

          <a
            href="/consultation"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C4A77D] text-[#1B3A3A] text-sm font-bold shadow-lg hover:bg-[#b3966d] transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Calendar size={16} className="text-[#1B3A3A]" />
            <span>{t('nav.consultation', 'احجز استشارتك الآن')}</span>
          </a>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#1B3A3A]/95 backdrop-blur-xl border-b border-white/10 shadow-xl py-6 px-6 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4 mb-6">
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-white hover:text-[#C4A77D] py-1 border-b border-white/10"
            >
              {t('nav.services', 'الخدمات')}
            </a>
            <a
              href="#doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-white hover:text-[#C4A77D] py-1 border-b border-white/10"
            >
              {t('nav.doctors', 'الأطباء')}
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-white hover:text-[#C4A77D] py-1 border-b border-white/10"
            >
              {t('nav.features', 'المميزات')}
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-white hover:text-[#C4A77D] py-1"
            >
              {t('nav.contact', 'اتصل بنا')}
            </a>
          </nav>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/10">
            {currentUser ? (
              <a
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  <span>{currentUser.name || t('nav.dashboard', 'لوحة التحكم')}</span>
                </div>
                <ChevronLeft size={16} className="text-white/80 rtl:rotate-180" />
              </a>
            ) : (
              <a
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-all cursor-pointer"
              >
                <User size={16} className="text-[#C4A77D]" />
                <span>{t('nav.login', 'تسجيل الدخول')}</span>
              </a>
            )}

            <a
              href="/consultation"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C4A77D] text-[#1B3A3A] text-sm font-bold shadow-md hover:bg-[#b3966d] transition-all cursor-pointer"
            >
              <Calendar size={16} className="text-[#1B3A3A]" />
              <span>{t('nav.consultation', 'احجز استشارتك الآن')}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}