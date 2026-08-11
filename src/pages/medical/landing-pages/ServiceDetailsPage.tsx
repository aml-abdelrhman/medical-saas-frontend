'use client'

import { useState, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  User,
  Sparkles,
  CheckCircle2,
  XCircle,
  Hash,
  ShieldCheck,
  Tag,
} from 'lucide-react'
import { useClinicDetails } from '@/hooks/useQuery'
import { BookingModal } from '@/pages/BookingModal'
import { getImageUrl } from '@/utils/imageUtils'

export const ServiceDetailsPage = () => {
  const params = useParams({ strict: false }) as { id?: string; slug?: string }
  const serviceId = params.id || ''
  const clinicSlug = params.slug || ''

  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const isRtl = i18n.dir() === 'rtl'

  const [isBookingOpen, setIsBookingOpen] = useState(false)

  // جلب بيانات العيادة/الخدمة
  const { data: rawClinicData, isLoading } = useClinicDetails(clinicSlug || serviceId)

  const clinicData = useMemo(() => {
    return (rawClinicData as any)?.data || rawClinicData || {}
  }, [rawClinicData])

  // استخراج تفاصيل الخدمة المطابقة للـ id مع قائمة الأطباء لربط اسم الطبيب
  const { service, clinicDoctors } = useMemo(() => {
    const servicesList = Array.isArray(clinicData.services)
      ? clinicData.services
      : Array.isArray(clinicData)
      ? clinicData
      : []

    const doctorsList = Array.isArray(clinicData.doctors) ? clinicData.doctors : []

    const found = servicesList.find((s: any) => s.id?.toString() === serviceId)
    if (found) return { service: found, clinicDoctors: doctorsList }

    if (clinicData.id?.toString() === serviceId) return { service: clinicData, clinicDoctors: doctorsList }

    return { service: null, clinicDoctors: doctorsList }
  }, [clinicData, serviceId])

  const getLocalized = (data: any, lang: 'ar' | 'en') => {
    if (!data) return ''
    let parsed = data
    if (typeof data === 'string' && data.trim().startsWith('{')) {
      try {
        parsed = JSON.parse(data)
      } catch {
        return data
      }
    }
    return parsed[lang] || parsed.en || parsed.ar || data
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen text-[#2D6A4F] font-bold bg-[#F0F4F4]">
        {t('loading', 'جاري التحميل...')}
      </div>
    )

  if (!service)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-gray-500 bg-[#F0F4F4]">
        <p className="text-lg font-bold">{t('service_not_found', 'الخدمة غير موجودة')}</p>
        <button
          onClick={() => navigate({ to: '..' })}
          className="px-6 py-2.5 bg-[#1B3A3A] text-white rounded-xl font-semibold shadow-md cursor-pointer hover:bg-[#2D6A4F] transition-all"
        >
          {t('back_to_services', 'العودة للخلف')}
        </button>
      </div>
    )

  // تحويل معرف الطبيب (doctor_id) إلى اسم الطبيب الفعلي من قائمة أطباء العيادة
  const associatedDoctor = service.doctor || clinicDoctors.find((d: any) => d.id === service.doctor_id)
  const doctorName = associatedDoctor
    ? getLocalized(associatedDoctor.name, currentLang)
    : service.doctor_name
    ? getLocalized(service.doctor_name, currentLang)
    : t('general_practitioner', 'طبيب معتمد')

  const resolvedDoctorId = service.doctor?.id || service.doctor_id

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F0F4F4] via-white to-[#E6F0EC] py-16 px-4 md:px-8"
      dir={i18n.dir()}
    >
      <div className="max-w-4xl mx-auto">
        {/* زر العودة */}
        <button
          onClick={() => navigate({ to: '..' })}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-[#2D6A4F] font-semibold transition-all group cursor-pointer bg-white/80 backdrop-blur-md px-4 py-2 rounded-full w-fit shadow-sm border border-slate-200"
        >
          {isRtl ? (
            <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" />
          ) : (
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          )}
          {t('back_to_services', 'العودة للخدمات')}
        </button>

        {/* الكارد الرئيسي المدمج */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
          
          {/* قسم الصورة البانر في الأعلى */}
          <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-900 overflow-hidden">
            <img
              src={getImageUrl(service.image, 'service')}
              alt={getLocalized(service.name, currentLang)}
              className="w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2A2E] via-transparent to-black/30"></div>

            {/* شارات الحالة والأعلى */}
            <div className="absolute top-6 right-6 left-6 flex justify-between items-center">
              <span className="bg-white/90 backdrop-blur-md text-[#0E2A2E] px-4 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5">
                <Hash size={14} className="text-[#2D6A4F]" /> ID: {service.id}
              </span>

              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                  service.is_active !== false
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-rose-500/90 text-white'
                }`}
              >
                {service.is_active !== false ? (
                  <>
                    <CheckCircle2 size={14} /> {t('active', 'متاحة للحجز')}
                  </>
                ) : (
                  <>
                    <XCircle size={14} /> {t('inactive', 'غير متاحة')}
                  </>
                )}
              </span>
            </div>

            {/* اسم الخدمة فوق الصورة أو في البوتم العائم */}
            <div className="absolute bottom-6 right-6 left-6">
              <div className="flex items-center gap-2 text-[#52B788] mb-1 font-bold text-xs uppercase tracking-wider">
                <Sparkles size={16} />
                <span>{getLocalized(service.specialty_name || service.specialty?.name, currentLang) || t('medical_service', 'خدمة طبية')}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {getLocalized(service.name, currentLang)}
              </h1>
            </div>
          </div>

          {/* محتوى التفاصيل بالأسفل */}
          <div className="p-6 sm:p-10 space-y-8">
            
            {/* وصف الخدمة */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                {t('service_description', 'وصف الخدمة')}
              </h3>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                {getLocalized(service.description, currentLang) ||
                  t('professional_service_description', 'استمتع برعاية طبية متميزة مصممة خصيصاً لتلبية احتياجاتك الصحية.')}
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* شبكة المعلومات (الطبيب المترجم + التوقيت والمدة + السعر) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* الطبيب */}
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100/70 rounded-xl flex items-center justify-center text-[#2D6A4F] shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    {t('doctor', 'الطبيب المعالج')}
                  </p>
                  <p className="font-bold text-slate-800 text-sm sm:text-base">
                    {doctorName}
                  </p>
                  {resolvedDoctorId && (
                    <span className="text-[10px] text-slate-400">ID: {resolvedDoctorId}</span>
                  )}
                </div>
              </div>

              {/* المدة الزمنية / التوقيت */}
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100/70 rounded-xl flex items-center justify-center text-[#2D6A4F] shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    {t('duration', 'مدة الجلسة')}
                  </p>
                  <p className="font-bold text-slate-800 text-sm sm:text-base">
                    {service.duration_minutes || 30} {t('min', 'دقيقة')}
                  </p>
                </div>
              </div>

            </div>

            {/* شريط السعر وزر الحجز النهائي */}
            <div className="bg-[#0E2A2E] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                  <Tag size={24} />
                </div>
                <div>
                  <p className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-0.5">
                    {t('price_label', 'سعر الخدمة')}
                  </p>
                  <div className="text-3xl sm:text-4xl font-black">
                    {service.price}{' '}
                    <span className="text-sm font-medium text-slate-300">
                      {t('currency', 'ج.م')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full sm:w-auto bg-[#52B788] hover:bg-[#40916c] text-white px-10 py-4 rounded-2xl font-bold text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/30 cursor-pointer"
              >
                {t('book_now', 'احجز الآن')}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* مودال الحجز */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctorId={resolvedDoctorId}
        services={[service]}
        clinicSlug={clinicSlug || service.clinic_slug}
        getLocalized={(data: any, lang: any) => getLocalized(data, lang)}
      />
    </div>
  )
}