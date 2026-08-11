'use client'

import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  useClinicDetails,
} from '@/hooks/useQuery'
import { getImageUrl } from '@/utils/imageUtils'
import {
  Star,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Briefcase,
  Stethoscope,
  Calendar,
  Clock,
} from 'lucide-react'

import { BookingModal } from '@/pages/BookingModal'

const parseData = (data: any) => {
  if (typeof data === 'string' && data.startsWith('{')) {
    try {
      return JSON.parse(data)
    } catch (e) {
      return { ar: data, en: data }
    }
  }
  return data
}

// دالة مساعدة آمنة لجلب النصوص المترجمة
const getLocalized = (data: any, lang: 'ar' | 'en'): string => {
  const parsed = parseData(data)
  if (parsed && typeof parsed === 'object') {
    return parsed[lang] ?? parsed.en ?? parsed.ar ?? ''
  }
  return parsed ?? ''
}

// دالة توليد السلاج لتطابق تماماً ما تم تنفيذه في السلايدر
const toSlug = (doctor: any) => {
  if (doctor?.slug) return doctor.slug
  const name = parseData(doctor?.name)
  const rawName = typeof name === 'object' ? name?.en || name?.ar : name
  return (rawName || 'doctor')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[.]/g, '')
}

// أسماء أيام الأسبوع
const DAY_NAMES: Record<number, { ar: string; en: string }> = {
  0: { ar: 'الأحد', en: 'Sunday' },
  1: { ar: 'الإثنين', en: 'Monday' },
  2: { ar: 'الثلاثاء', en: 'Tuesday' },
  3: { ar: 'الأربعاء', en: 'Wednesday' },
  4: { ar: 'الخميس', en: 'Thursday' },
  5: { ar: 'الجمعة', en: 'Friday' },
  6: { ar: 'السبت', en: 'Saturday' },
}

const getDayName = (dayOfWeek: number, lang: 'ar' | 'en'): string => {
  return DAY_NAMES[dayOfWeek]?.[lang] ?? String(dayOfWeek)
}

export const DoctorDetails = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  
  const { slug, doctorSlug } = useParams({ strict: false }) as {
    slug?: string
    doctorSlug?: string
  }
  
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const dir = i18n.dir()

  // جلب بيانات العيادة الكاملة بما فيها الأطباء والخدمات ومواعيد العمل
  const { data: clinic, isLoading: clinicLoading } = useClinicDetails(slug || '')
  const doctors = clinic?.doctors || []

  // البحث عن الطبيب داخل قائمة أطباء العيادة
  const doctor = (doctors as any[])?.find((d: any) => toSlug(d) === doctorSlug)

  // استخراج خدمات العيادة أو خدمات الطبيب المتاحة من بيانات العيادة
  const services = clinic?.services || []

  if (clinicLoading) {
    return (
      <div className="py-20 text-center text-[#2D6A4F] font-bold">
        {t('loading', 'جاري التحميل...')}
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg mx-auto space-y-4">
          <p className="text-red-500 font-bold text-lg">
            {t('doctor_not_found', 'لم يتم العثور على الطبيب المطلوب')} (الـ Slug: "{doctorSlug}")
          </p>
          <button
            onClick={() =>
              navigate({
                to: '/clinics/$slug',
                params: { slug: slug || '' },
              })
            }
            className="px-6 py-2.5 bg-[#2D6A4F] text-white rounded-xl font-bold hover:bg-[#1B3A3A] transition-all cursor-pointer"
          >
            {t('back_to_clinic', 'العودة للعيادة')}
          </button>
        </div>
      </div>
    )
  }

  const doctorName = getLocalized(doctor.name, currentLang)
  const specialtyName = getLocalized(doctor.specialty?.name, currentLang)
  const bio = getLocalized(doctor.bio, currentLang)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-17" dir={dir}>
      {/* زر الرجوع */}
      <div className="mb-6">
        <button
          onClick={() =>
            navigate({
              to: '/clinics/$slug',
              params: { slug: slug || '' },
            })
          }
          className="inline-flex items-center gap-2 text-[#2D6A4F] font-bold hover:text-[#1B3A3A] transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200"
        >
          {dir === 'rtl' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          {t('back_to_clinic', 'العودة للعيادة')}
        </button>
      </div>

      {/* كارت معلومات الطبيب الرئيسية */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden mb-12">
        <div className="grid md:grid-cols-3 items-stretch">
          <div className="relative w-full aspect-[4/3] md:aspect-auto bg-gray-100 overflow-hidden">
            <img
              src={getImageUrl(doctor.image)}
              alt={doctorName}
              className="w-full h-full object-cover object-top"
              onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
            />
          </div>
          
          <div className="md:col-span-2 p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-[#2D6A4F]">
                  <Stethoscope size={22} />
                  <span className="text-sm font-semibold uppercase tracking-wider">{specialtyName || t('consultant', 'استشاري أول')}</span>
                </div>
                
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-lg border border-amber-200/60 font-bold text-sm">
                  <Star size={16} fill="currentColor" />
                  <span>{Number(doctor.rating || 5).toFixed(1)}</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#0E2A2E] mb-4">
                {doctorName}
              </h1>

              <p className="text-slate-600 leading-relaxed text-base mb-6">
                {bio || t('no_bio', 'لا توجد نبذة تعريفية متاحة حالياً لهذا الطبيب.')}
              </p>
            </div>

            {/* شريط الإحصائيات السريع وزر الحجز */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-[#2D6A4F]/10 rounded-lg text-[#2D6A4F]">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">{t('experience', 'سنوات الخبرة')}</p>
                  <p className="font-bold text-[#0E2A2E] text-sm">{doctor.years_experience || 10} {t('years', 'سنوات')}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-[#2D6A4F]/10 rounded-lg text-[#2D6A4F]">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">{t('fees', 'سعر الكشف')}</p>
                  <p className="font-bold text-[#0E2A2E] text-sm">{doctor.price_from || 300} {t('currency', 'ج.م')}</p>
                </div>
              </div>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="bg-[#2D6A4F] text-white font-bold rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-[#1B3A3A] transition-all shadow-md cursor-pointer text-sm"
              >
                <Calendar size={18} />
                {t('book_now', 'احجز موعد الآن')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* قسم الخدمات الطبية */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-[#2D6A4F] mb-2">
            <Stethoscope size={20} />
            <h6 className="text-lg font-semibold">{t('services_section', 'الخدمات المتاحة')}</h6>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0E2A2E] mb-6">
            {t('choose_suitable_service', 'اختر الخدمة الطبية المناسبة')}
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {services?.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-500 font-medium bg-white rounded-2xl border border-gray-200">
                {t('no_services_found', 'لا توجد خدمات متاحة حالياً')}
              </div>
            ) : (
              services?.map((service: any) => {
                const serviceName = getLocalized(service.name, currentLang)

                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 flex flex-col transition-all duration-300 hover:shadow-xl hover:border-[#2D6A4F]"
                  >
                    <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                      <img
                        src={getImageUrl(service.image_url || service.image) || '/default-service.png'}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        alt={serviceName}
                      />
                    </div>

                    <div className="p-4 flex flex-col flex-grow justify-between gap-4">
                      <h3 className="font-bold text-lg text-[#0E2A2E]">
                        {serviceName}
                      </h3>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                          <Clock size={14} className="text-[#2D6A4F]" />
                          {service.duration_minutes || 30} {t('min', 'دقائق')}
                        </span>
                        <span className="text-[#2D6A4F] font-black text-base">
                          {service.price} {t('currency', 'ج.م')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* قسم مواعيد العمل */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#2D6A4F] mb-2">
            <Calendar size={20} />
            <h6 className="text-lg font-semibold">{t('schedule_section', 'أوقات العمل')}</h6>
          </div>
          <h2 className="text-2xl font-black text-[#0E2A2E] mb-6">
            {t('working_hours', 'مواعيد العمل الرسمية')}
          </h2>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-4">
            {clinic?.working_hours && Array.isArray(clinic.working_hours) && clinic.working_hours.length > 0 ? (
              clinic.working_hours.map((av: any, index: number) => (
                <div
                  key={av.id || index}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-100/60"
                >
                  <span className="font-bold text-[#0E2A2E]">
                    {getDayName(Number(av.day_of_week ?? av.day), currentLang)}
                  </span>
                  <span className="text-[#2D6A4F] font-mono bg-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm border border-gray-200">
                    {av.start_time?.substring(0, 5)} - {av.end_time?.substring(0, 5)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center italic py-6">
                {t('no_availabilities', 'لا توجد مواعيد متاحة حالياً')}
              </p>
            )}

            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full mt-4 bg-[#2D6A4F] text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:bg-[#1B3A3A] transition-all shadow-md cursor-pointer"
            >
              <Calendar size={18} />
              {t('book_now', 'احجز موعد الآن')}
            </button>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctorId={doctor.id}
        services={services}
        getLocalized={getLocalized}
      />
    </div>
  )
}