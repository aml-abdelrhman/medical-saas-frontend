'use client'

import React from 'react'
import { useParams, useNavigate, notFound } from '@tanstack/react-router'
import {
  useClinicDetails,
} from '@/hooks/useQuery'
import {
  Loader2,
  Users,
  ArrowRight,
  Star,
  Calendar,
  Stethoscope,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getImageUrl } from '@/utils/imageUtils'

// مكون فرعي لعرض تقييم وهمي مع دعم الترجمة
const FakeRating = ({ t }: { t: any }) => (
  <div className="flex items-center justify-center gap-0.5 text-amber-400">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={14} className={i < 4 ? "fill-amber-400" : "fill-slate-200 text-slate-200"} />
    ))}
     <span className="text-xs text-slate-400 ml-1">{t('reviews_count_placeholder', '(128 تقييم)')}</span>
  </div>
)

export default function SpecialtyDetailsPage() {
  // استقبال البارامترات بالأسماء الصحيحة المطابقة لملف الروتر
  const { slug, specialtySlug } = useParams({ strict: false }) as {
    slug?: string
    specialtySlug?: string
  }
  
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'

  // استخدام دالة بيانات العيادة لجلب كافة البيانات (التخصصات والأطباء)
  const { data: clinic, isLoading: loadingClinic, isError } = useClinicDetails(slug || '')

  if (loadingClinic)
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4 bg-slate-100">
        <Loader2 className="animate-spin text-[#2D6A4F]" size={48} />
        <p className="text-slate-500 font-medium">{t('loading', 'جاري التحميل...')}...</p>
      </div>
    )

  // في حال حدوث خطأ أو عدم وجود عيادة، يتم توجيه المستخدم لصفحة 404
  if (isError || !clinic) throw notFound()

  // البحث عن التخصص المطلوب داخل مصفوفة تخصصات العيادة باستخدام الـ slug
  const specialty = clinic.specialties?.find((spec: any) => spec.slug === specialtySlug)

  // إذا لم يتم العثور على التخصص، يتم توجيه المستخدم لصفحة 404
  if (!specialty) throw notFound()

  // تصفية أطباء العيادة ليقتصروا على التخصص الحالي فقط
  const specialtyDoctors = clinic.doctors?.filter(
    (doc: any) => doc.specialty?.id === specialty.id || doc.specialty_id === specialty.id,
  ) || []

  const specName = typeof specialty.name === 'object'
      ? specialty.name?.[currentLang] || specialty.name?.ar
      : specialty.name;

  const specDesc = typeof specialty.description === 'object'
      ? specialty.description?.[currentLang] || specialty.description?.ar
      : specialty.description;

  return (
    // الخلفية العامة للصفحة
    <div className="min-h-screen bg-slate-50" dir={i18n.dir()}>
      
      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 md:pt-28 md:pb-20">
        
        {/* زر العودة العلوي */}
        <div className="mb-6">
          <button
            onClick={() =>
              navigate({
                to: '/clinics/$slug',
                params: { slug: slug || '' },
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-700 hover:text-[#2D6A4F] hover:border-[#2D6A4F]/30 transition-all cursor-pointer group"
          >
            <ArrowRight size={18} className={i18n.dir() === 'rtl' ? '' : 'rotate-180'} /> 
            <span className='font-semibold text-sm group-hover:underline'>{t('back_to_clinic', 'العودة للعيادة')}</span>
          </button>
        </div>

        {/* الهيكل العام متسلسل عمودياً */}
        <div className="flex flex-col gap-10">
          
          {/* قسم معلومات التخصص */}
          <section className="bg-white p-6 sm:p-10 rounded-3xl shadow-md border border-slate-200/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8F3EF]/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-100 p-4 shrink-0 border border-slate-200 shadow-inner flex items-center justify-center">
                 <img
                   src={getImageUrl(specialty.image) || '/default-specialty-bg.jpg'}
                   alt={specName}
                   className="w-full h-full object-contain"
                 />
              </div>

              <div className="flex-1 text-center md:text-start flex flex-col items-center md:items-start">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3EF] text-[#2D6A4F] text-xs font-bold mb-3">
                  <Stethoscope size={14} />
                  {t('medical_specialty', 'تخصص طبي معتمد')}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-[#0E2A2E] mb-3 leading-tight">
                  {specName}
                </h1>
                
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base max-w-3xl mb-6">
                  {specDesc || t('default_specialty_desc', 'تخصص طبي دقيق يركز على تشخيص وعلاج الحالات المرتبطة بهذا المجال بأحدث التقنيات الطبية المعتمدة.')}
                </p>

                {/* إحصائيات وزر الحجز الموجه للخدمات */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 w-full pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
                    <Users className="text-[#2D6A4F]" size={22} />
                    <div className="text-start">
                      <div className="text-xs text-slate-500 font-medium">{t('consultant_doctors_count', 'الأطباء المتاحين')}</div>
                      <div className="font-bold text-[#0E2A2E] text-base">{specialtyDoctors?.length || 0} {t('doctor', 'طبيب')}</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      navigate({
                        to: '/clinics/$slug/services',
                        params: { slug: slug || '' },
                      })
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0E2A2E] text-white rounded-2xl font-bold hover:bg-[#1B3A3A] transition-all text-base cursor-pointer shadow-md"
                  >
                    <Calendar size={18} />
                    {t('book_appointment_now', 'احجز موعد الآن')}
                  </button>
                </div>

              </div>

            </div>
          </section>

          {/* قسم الأطباء (التوجيه لصفحة الطبيب المباشرة حسب الروتر المطلوب) */}
          <section className="w-full space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0E2A2E] flex items-center gap-3">
                <Users className="text-[#2D6A4F]" size={26} /> 
                {t('specialty_doctors', 'أطباء التخصص')}
              </h2>
              <span className="text-xs sm:text-sm font-bold text-slate-500 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
                {specialtyDoctors?.length} {t('available', 'متاح')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialtyDoctors?.length === 0 ? (
                 <div className="col-span-full bg-white p-12 rounded-3xl text-center text-slate-500 shadow-sm border border-slate-200">
                    {t('no_doctors_found', 'لا يوجد أطباء متاحين لهذا التخصص حالياً')}
                  </div>
              ) : (
                specialtyDoctors?.map((doctor: any) => {
                  const doctorSlug =
                    doctor.slug ||
                    (doctor.name?.en || doctor.name?.ar || 'doctor')
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[.]/g, '')

                  return (
                    <div
                      key={doctor.id}
                      onClick={() => {
                        navigate({
                          to: '/clinics/$slug/doctors/$doctorSlug',
                          params: {
                            slug: slug || '',
                            doctorSlug: doctorSlug,
                          },
                        })
                      }}
                      className="group bg-white p-6 rounded-3xl text-center border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#2D6A4F]/30 transition-all duration-300 cursor-pointer flex flex-col items-center transform hover:-translate-y-1"
                    >
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-md mb-4 relative ring-4 ring-slate-100 group-hover:ring-[#2D6A4F]/20 transition-all">
                        <img
                          src={getImageUrl(doctor.image) || '/default-avatar.png'}
                          alt={String(doctor.name?.[currentLang] || doctor.name || '')}
                          className="w-full h-full object-cover"
                        />
                        <div className='absolute bottom-1 right-1 bg-[#2D6A4F] w-4 h-4 rounded-full border-2 border-white'></div>
                      </div>
                      
                      <h3 className="font-black text-[#0E2A2E] text-lg mb-1 group-hover:text-[#2D6A4F] transition-colors">
                        {typeof doctor.name === 'object'
                          ? doctor.name?.[currentLang] || doctor.name?.ar
                          : doctor.name}
                      </h3>
                      
                      <p className="text-xs text-[#2D6A4F] font-bold bg-[#E8F3EF] px-3.5 py-1 rounded-full inline-block mb-4">
                        {t('consultant', 'استشاري أول')}
                      </p>
                      
                      <div className="w-full text-xs text-slate-500 border-t border-slate-100 pt-4 space-y-2">
                         <p className="font-medium">{t('experience_years', 'خبرة 15 عاماً')}</p>
                         <FakeRating t={t} />
                      </div>

                      <span className='text-[#2D6A4F] mt-4 text-xs font-bold group-hover:underline'>
                        {t('view_profile', 'عرض الملف الشخصي')}
                      </span>

                    </div>
                  )
                })
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}