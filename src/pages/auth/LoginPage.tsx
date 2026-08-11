'use client'

import React, { useState } from 'react'
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Stethoscope,
  CheckCircle2,
  Languages,
} from 'lucide-react'
import { useParams } from '@tanstack/react-router'
import { useLogin } from '@/hooks/useAuth'
import { useClinicDetails } from '@/hooks/useQuery'

export function LoginPage() {
  const params = useParams({ strict: false }) as { slug?: string }
  const clinicSlug = params.slug || ''

  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isRtl = lang === 'ar'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: clinicData } = useClinicDetails(clinicSlug)
  const clinic = clinicData?.data || clinicData
  const clinicLogo = clinic?.logo
  const clinicName = clinic?.name || (lang === 'ar' ? 'منظومة  المركز الطبي' : 'Medical System')

  const loginMutation = useLogin()

  const t = {
    ar: {
      brandTitle: typeof clinicName === 'string' ? clinicName : clinicName?.ar || 'منظومة الشفاء',
      heroHeading: 'مرحباً بك مجدداً في لوحة تحكم العيادة',
      heroDesc: 'قم بتسجيل الدخول لإدارة المواعيد، متابعة الملفات الطبية، وتنظيم العمل بكل سهولة ويسر.',
      formTitle: 'تسجيل الدخول',
      formDesc: 'أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة التحكم.',
      emailLabel: 'البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      submitBtn: 'تسجيل الدخول',
      loadingBtn: 'جاري تسجيل الدخول...',
      successTitle: 'تم تسجيل الدخول بنجاح!',
      successDesc: 'جاري تحويلك إلى لوحة التحكم...',
      errorDefault: 'حدث خطأ ما أثناء تسجيل الدخول',
      noAccount: 'ليس لديك عيادة مسجلة؟',
      registerLink: 'سجل عيادتك الآن',
    },
    en: {
      brandTitle: typeof clinicName === 'string' ? clinicName : clinicName?.en || 'Al-Shefa System',
      heroHeading: 'Welcome back to your clinic dashboard',
      heroDesc: 'Sign in to manage appointments, track medical records, and organize your workflow seamlessly.',
      formTitle: 'Sign In',
      formDesc: 'Enter your email and password to access your dashboard.',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      submitBtn: 'Sign In',
      loadingBtn: 'Signing in...',
      successTitle: 'Logged in Successfully!',
      successDesc: 'Redirecting to your dashboard...',
      errorDefault: 'An error occurred during login',
      noAccount: "Don't have a registered clinic?",
      registerLink: 'Register your clinic',
    },
  }[lang]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    loginMutation.mutate(
      { 
        email: formData.email, 
        password: formData.password, 
        clinic_slug: clinicSlug 
      },
      {
        onSuccess: (response: any) => {
          setSuccess(true)
          setTimeout(() => {
            const user = response.user || response.data?.user;
            const role = user?.role;
            const fetchedSlug = user?.clinic?.slug || clinicSlug;

            if (role === 'super_admin') {
              window.location.href = '/dashboard/super-admin';
            } else if (role === 'admin') {
              window.location.href = fetchedSlug ? `/clinics/${fetchedSlug}/dashboard/admin` : '/dashboard/admin';
            } else if (role === 'doctor') {
              window.location.href = fetchedSlug ? `/clinics/${fetchedSlug}/dashboard/doctor` : '/dashboard/doctor';
            } else {
              window.location.href = fetchedSlug ? `/clinics/${fetchedSlug}/dashboard/patient` : '/dashboard/patient';
            }
          }, 1200)
        },
        onError: (err: any) => {
          const responseData = err.response?.data
          let message = t.errorDefault

          if (responseData?.errors) {
            const firstErrorKey = Object.keys(responseData.errors)[0]
            message = responseData.errors[firstErrorKey][0]
          } else {
            message = responseData?.message || err.message || t.errorDefault
          }

          setError(message)

          if (message.includes('غير مرتبط') || message.includes('clinic') || responseData?.needs_clinic) {
            setTimeout(() => {
              window.location.href = '/register-clinic'
            }, 2000)
          }
        },
      }
    )
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-6xl w-full bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* قسم البانر الجانبي */}
        <div className="lg:col-span-5 relative p-8 lg:p-10 text-white flex flex-col justify-between overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1000')`,
            }}
          />
          <div className="absolute inset-0 bg-teal-900/90 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-teal-950/40 to-transparent z-10" />

          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-sm overflow-hidden">
                {clinicLogo ? (
                  <img src={clinicLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Stethoscope className="w-5 h-5 text-teal-200" />
                )}
              </div>
              <span className="font-bold text-base tracking-wide truncate max-w-[160px]">{t.brandTitle}</span>
            </div>

            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl border border-white/30 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <Languages className="w-3.5 h-3.5 text-teal-200" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>

          <div className="relative z-25 my-auto py-8 space-y-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm">
              {t.heroHeading}
            </h1>
            <p className="text-slate-100 text-xs lg:text-sm leading-relaxed font-light drop-shadow-sm">
              {t.heroDesc}
            </p>
          </div>

          <div className="relative z-20 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-slate-200">
            <span>© 2026 Al-Shefa</span>
            <span className="flex items-center gap-1 text-teal-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Secure
            </span>
          </div>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6 space-y-1">
            <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center mb-3 overflow-hidden shadow-inner">
              {clinicLogo ? (
                <img src={clinicLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Stethoscope className="w-5 h-5 text-teal-600" />
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {t.formTitle}
            </h2>
            <p className="text-xs text-slate-500">{t.formDesc}</p>
          </div>

          {success ? (
            <div className="bg-teal-50 border border-teal-200 text-teal-900 p-6 rounded-2xl text-center space-y-3 animate-fadeIn">
              <div className="w-14 h-14 bg-teal-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-teal-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold">{t.successTitle}</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">{t.successDesc}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs text-center font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400 pointer-events-none`} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@clinic.com"
                    className={`w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-xs`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400 pointer-events-none`} />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-xs`}
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm mt-1"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.loadingBtn}</span>
                  </>
                ) : (
                  <>
                    <span>{t.submitBtn}</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-500">
                {t.noAccount}{' '}
                <a
                  href="/register-clinic"
                  className="text-teal-600 font-bold hover:underline"
                >
                  {t.registerLink}
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}