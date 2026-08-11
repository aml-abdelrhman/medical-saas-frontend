'use client'

import React, { useState } from 'react'
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  Globe,
  Image as ImageIcon,
  ArrowRight,
  Loader2,
  Stethoscope,
  CheckCircle2,
  Languages,
} from 'lucide-react'
import { useRegisterClinic } from '@/hooks/useQuery'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/useAuthStore' // حدد المسار الصحيح عندك

export function ClinicRegisterForm() {
  const router = useNavigate()
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isRtl = lang === 'ar'

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    owner_name: '',
    email: '',
    password: '',
    phone: '',
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const registerMutation = useRegisterClinic()
  const setAuth = useAuthStore((state) => state.setAuth)

  const t = {
    ar: {
      brandTitle: 'منظومة الشفاء الذكية',
      heroHeading: 'انضم إلينا وابدأ إدارة عيادتك باحترافية كاملة',
      heroDesc:
        'منصة متكاملة لإدارة المواعيد، الأطباء، والملفات الطبية برابط مخصص لعيادتك مع واجهة مستخدم سريعة وآمنة.',
      formTitle: 'سجل عيادتك الآن',
      formDesc: 'أدخل بيانات العيادة والمسؤول لإنشاء لوحة التحكم الخاصة بك.',
      clinicName: 'اسم العيادة',
      clinicNamePlaceholder: 'مثال: مجمع عيادات الأمل الطبي',
      clinicSlug: 'رابط العيادة المخصص (Slug)',
      logoLabel: 'شعار العيادة (Logo)',
      ownerName: 'اسم المسؤول أو الطبيب',
      ownerPlaceholder: 'د. أحمد محمد',
      emailLabel: 'البريد الإلكتروني',
      phoneLabel: 'رقم الجوال',
      passwordLabel: 'كلمة المرور',
      submitBtn: 'التالي: اختيار الباقة والدفع',
      loadingBtn: 'جاري إنشاء العيادة...',
      errorDefault: 'حدث خطأ ما أثناء التسجيل',
    },
    en: {
      brandTitle: 'Al-Shefa Smart System',
      heroHeading: 'Join us and manage your clinic with complete professionalism',
      heroDesc:
        'An integrated platform to manage appointments, doctors, and medical records with a dedicated link for your clinic and a fast, secure user interface.',
      formTitle: 'Register Your Clinic Now',
      formDesc: 'Enter the clinic and owner details to create your custom dashboard.',
      clinicName: 'Clinic Name',
      clinicNamePlaceholder: 'e.g., Al Amal Medical Complex',
      clinicSlug: 'Custom Clinic Link (Slug)',
      logoLabel: 'Clinic Logo',
      ownerName: 'Manager or Doctor Name',
      ownerPlaceholder: 'Dr. Ahmed Mohamed',
      emailLabel: 'Email Address',
      phoneLabel: 'Phone Number',
      passwordLabel: 'Password',
      submitBtn: 'Next: Select Plan & Payment',
      loadingBtn: 'Creating Clinic...',
      errorDefault: 'An error occurred during registration',
    },
  }[lang]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' &&
        !prev.slug && {
          slug: value
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, ''),
        }),
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const dataToSend = new FormData()
    dataToSend.append('name', formData.name)
    dataToSend.append('slug', formData.slug)
    dataToSend.append('owner_name', formData.owner_name)
    dataToSend.append('email', formData.email)
    dataToSend.append('password', formData.password)
    dataToSend.append('phone', formData.phone)

    if (logoFile) {
      dataToSend.append('logo', logoFile)
    }

    registerMutation.mutate(dataToSend, {
      onSuccess: (response: any) => {
  const token = response?.token   // ✅ top-level
  const user = response?.user     // ✅ top-level

  if (token && user) {
    setAuth(user, token)
  }

  alert('تم تسجيل العيادة وحساب المدير بنجاح! سيتم توجيهك الآن لاختيار الباقة والدفع.')
  router({ to: '/pricing' })
},      onError: (err: any) => {
        const responseData = err.response?.data
        if (responseData?.errors) {
          const firstErrorKey = Object.keys(responseData.errors)[0]
          const firstErrorMessage = responseData.errors[firstErrorKey][0]
          setError(firstErrorMessage || responseData.message || t.errorDefault)
        } else {
          setError(responseData?.message || err.message || t.errorDefault)
        }
      },
    })
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300"
    >
      <div className="max-w-6xl w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* قسم البانر الجانبي */}
        <div className="lg:col-span-6 relative p-8 lg:p-12 text-white flex flex-col justify-between overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center z-0 will-change-transform transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1000')`,
            }}
          />
          <div className="absolute inset-0 bg-teal-900/85 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-teal-950/40 to-transparent z-10" />

          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-sm transition-transform hover:scale-105">
                <Stethoscope className="w-5 h-5 text-teal-200" />
              </div>
              <span className="font-bold text-lg tracking-wide">{t.brandTitle}</span>
            </div>

            <button
              type="button"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl border border-white/30 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <Languages className="w-4 h-4 text-teal-200" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>

          <div className="relative z-25 my-auto py-12 space-y-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm">
              {t.heroHeading}
            </h1>
            <p className="text-slate-100 text-sm lg:text-base leading-relaxed font-light drop-shadow-sm">
              {t.heroDesc}
            </p>
          </div>

          <div className="relative z-20 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-slate-200">
            <span>© 2026 Al-Shefa Platform</span>
            <span className="flex items-center gap-1 text-teal-200 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Secure SaaS Solution
            </span>
          </div>
        </div>

        {/* نموذج التسجيل */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8 space-y-1">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              {t.formTitle}
            </h2>
            <p className="text-sm text-slate-500">{t.formDesc}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}

            {/* حقل اسم العيادة */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block">
                {t.clinicName}
              </label>
              <div className="relative">
                <Building2 className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3.5 w-5 h-5 text-slate-400 pointer-events-none`} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.clinicNamePlaceholder}
                  className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-sm`}
                />
              </div>
            </div>

            {/* حقل الرابط المخصص */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block">
                {t.clinicSlug}
              </label>
              <div className="relative flex items-center">
                <Globe className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} w-5 h-5 text-slate-400 pointer-events-none`} />
                <input
                  type="text"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="amal-clinic"
                  className={`w-full ${isRtl ? 'pr-12 pl-32' : 'pl-12 pr-32'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-teal-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-sm font-mono`}
                  dir="ltr"
                />
                <span className={`absolute ${isRtl ? 'left-3' : 'right-3'} text-xs text-slate-400 select-none font-mono pointer-events-none`}>
                  .alshefa.com
                </span>
              </div>
            </div>

            {/* حقل شعار العيادة */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block">
                {t.logoLabel}
              </label>
              <div className="relative">
                <ImageIcon className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3.5 w-5 h-5 text-slate-400 pointer-events-none`} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 file:${isRtl ? 'ml-4' : 'mr-4'} file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 transition-all duration-200 text-sm cursor-pointer`}
                />
              </div>
            </div>

            {/* حقل اسم المسؤول (المالك) */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block">
                {t.ownerName}
              </label>
              <div className="relative">
                <User className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3.5 w-5 h-5 text-slate-400 pointer-events-none`} />
                <input
                  type="text"
                  name="owner_name"
                  required
                  value={formData.owner_name}
                  onChange={handleChange}
                  placeholder={t.ownerPlaceholder}
                  className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-sm`}
                />
              </div>
            </div>

            {/* حقول البريد ورقم الجوال */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 block">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3.5 w-5 h-5 text-slate-400 pointer-events-none`} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@clinic.com"
                    className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-sm`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 block">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <Phone className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3.5 w-5 h-5 text-slate-400 pointer-events-none`} />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+20 100 000 0000"
                    className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-sm`}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 block">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3.5 w-5 h-5 text-slate-400 pointer-events-none`} />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-sm`}
                  dir="ltr"
                />
              </div>
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-base mt-2"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t.loadingBtn}</span>
                </>
              ) : (
                <>
                  <span>{t.submitBtn}</span>
                  <ArrowRight className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}