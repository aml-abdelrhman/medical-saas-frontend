'use client'

import React, { useState, useMemo } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Stethoscope,
  CheckCircle2,
  Languages,
  User,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useRegister } from '@/hooks/useAuth'
import { useClinicDetails } from '@/hooks/useQuery'

interface ClinicRegisterPageProps {
  clinicSlug?: string
}

type RegisterFormValues = {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  role: 'patient' | 'doctor' | 'admin'
}

export function RegisterPage({
  clinicSlug: propClinicSlug,
}: ClinicRegisterPageProps) {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isRtl = lang === 'ar'
  const navigate = useNavigate()

  const params = useParams({ strict: false }) as { slug?: string }
  const clinicSlug = propClinicSlug || params.slug || ''

  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: clinicData } = useClinicDetails(clinicSlug)
  const clinic = clinicData?.data || clinicData
  const clinicLogo = clinic?.logo
  const clinicId = clinic?.id
  const clinicName =
    clinic?.name ||
    (lang === 'ar' ? 'منظومة  المركز الطبي' : 'Medical System')

  const registerMutation = useRegister()

  const registerSchema = useMemo(
    () =>
      z
        .object({
          name: z
            .string()
            .min(
              2,
              lang === 'ar'
                ? 'يجب أن يكون الاسم أكثر من حرفين'
                : 'Name must be at least 2 characters',
            ),
          email: z
            .string()
            .email(
              lang === 'ar'
                ? 'البريد الإلكتروني غير صالح'
                : 'Invalid email address',
            ),
          phone: z
            .string()
            .min(
              10,
              lang === 'ar' ? 'رقم الهاتف غير صحيح' : 'Invalid phone number',
            ),
          password: z
            .string()
            .min(
              6,
              lang === 'ar'
                ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
                : 'Password must be at least 6 characters',
            ),
          password_confirmation: z.string().min(6),
          role: z.enum(['patient', 'doctor', 'admin']),
        })
        .refine((data) => data.password === data.password_confirmation, {
          message:
            lang === 'ar'
              ? 'كلمات المرور غير متطابقة'
              : "Passwords don't match",
          path: ['password_confirmation'],
        }),
    [lang],
  )

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      role: 'admin',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null)

    const payload = {
      ...values,
      ...(clinicId ? { clinic_id: clinicId } : {}),
      ...(clinicSlug ? { clinic_slug: clinicSlug } : {}),
    }

    registerMutation.mutate(payload, {
      onSuccess: () => {
        setSuccess(true)
        setTimeout(() => {
          if (clinicSlug) {
            navigate({ to: `/clinics/${clinicSlug}/login` as any })
          } else {
            navigate({ to: '/login' as any })
          }
        }, 1200)
      },
      onError: (err: any) => {
        const responseData = err.response?.data
        if (responseData?.errors) {
          const firstErrorKey = Object.keys(responseData.errors)[0]
          const firstErrorMessage = responseData.errors[firstErrorKey][0]
          setError(
            firstErrorMessage ||
              responseData.message ||
              (lang === 'ar'
                ? 'حدث خطأ أثناء التسجيل'
                : 'An error occurred during registration'),
          )
        } else {
          setError(
            responseData?.message ||
              err.message ||
              (lang === 'ar'
                ? 'حدث خطأ أثناء التسجيل'
                : 'An error occurred during registration'),
          )
        }
      },
    })
  }

  const t = {
    ar: {
      brandTitle: clinicName,
      heroHeading: 'انضم إلى منظومة إدارة العيادات الذكية',
      heroDesc:
        'أنشئ حسابك الجديد الآن لإدارة المواعيد، متابعة الملفات الطبية، وتنظيم العمل بكل سهولة.',
      formTitle: 'إنشاء حساب جديد',
      formDesc: 'أدخل بياناتك الأساسية لإنشاء حسابك والانضمام للعيادة.',
      nameLabel: 'الاسم الكامل',
      emailLabel: 'البريد الإلكتروني',
      phoneLabel: 'رقم الهاتف',
      passwordLabel: 'كلمة المرور',
      confirmPassLabel: 'تأكيد كلمة المرور',
      submitBtn: 'تسجيل الحساب',
      loadingBtn: 'جاري إنشاء الحساب...',
      successTitle: 'تم إنشاء الحساب بنجاح!',
      successDesc: 'جاري تحويلك إلى صفحة تسجيل الدخول...',
      errorDefault: 'حدث خطأ ما أثناء التسجيل',
      hasAccount: 'لديك حساب بالفعل؟',
      loginLink: 'تسجيل الدخول',
    },
    en: {
      brandTitle: clinicName,
      heroHeading: 'Join the Smart Clinic Management System',
      heroDesc:
        'Create your new account now to manage appointments, medical records, and workflow seamlessly.',
      formTitle: 'Create an Account',
      formDesc:
        'Enter your basic details to create your account and join the clinic.',
      nameLabel: 'Full Name',
      emailLabel: 'Email Address',
      phoneLabel: 'Phone Number',
      passwordLabel: 'Password',
      confirmPassLabel: 'Confirm Password',
      submitBtn: 'Create Account',
      loadingBtn: 'Creating account...',
      successTitle: 'Account Created Successfully!',
      successDesc: 'Redirecting to sign in...',
      errorDefault: 'An error occurred during registration',
      hasAccount: 'Already have an account?',
      loginLink: 'Sign In',
    },
  }[lang]

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-6xl w-full bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
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
                  <img
                    src={clinicLogo}
                    alt={clinicName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Stethoscope className="w-5 h-5 text-teal-200" />
                )}
              </div>
              <span className="font-bold text-base tracking-wide truncate max-w-[160px]">
                {t.brandTitle}
              </span>
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

        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-5 space-y-1">
            <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center mb-2 overflow-hidden shadow-inner">
              {clinicLogo ? (
                <img
                  src={clinicLogo}
                  alt={clinicName}
                  className="w-full h-full object-cover"
                />
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
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                {t.successDesc}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs text-center font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.nameLabel}
                </label>
                <div className="relative">
                  <User
                    className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400 pointer-events-none`}
                  />
                  <input
                    type="text"
                    {...formRegister('name')}
                    placeholder="Amal Abdelrahman"
                    className={`w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-xs`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400 pointer-events-none`}
                  />
                  <input
                    type="email"
                    {...formRegister('email')}
                    placeholder="name@clinic.com"
                    className={`w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-xs`}
                    dir="ltr"
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <Phone
                    className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400 pointer-events-none`}
                  />
                  <input
                    type="text"
                    {...formRegister('phone')}
                    placeholder="01012345678"
                    className={`w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-xs`}
                    dir="ltr"
                  />
                </div>
                {errors.phone && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400 pointer-events-none`}
                  />
                  <input
                    type={showPass ? 'text' : 'password'}
                    {...formRegister('password')}
                    placeholder="••••••••"
                    className={`w-full ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-xs`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-3 text-slate-400 hover:text-slate-600`}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.phoneLabel ? t.confirmPassLabel : 'تأكيد كلمة المرور'}
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-slate-400 pointer-events-none`}
                  />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    {...formRegister('password_confirmation')}
                    placeholder="••••••••"
                    className={`w-full ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all duration-200 text-xs`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-3 text-slate-400 hover:text-slate-600`}
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm mt-2"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.loadingBtn}</span>
                  </>
                ) : (
                  <>
                    <span>{t.submitBtn}</span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180' : ''}`}
                    />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-500">
                {t.hasAccount}{' '}
                <Link
                  to={
                    clinicSlug
                      ? (`/clinics/${clinicSlug}/login` as any)
                      : ('/login' as any)
                  }
                  className="text-teal-600 font-bold hover:underline"
                >
                  {t.loginLink}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}