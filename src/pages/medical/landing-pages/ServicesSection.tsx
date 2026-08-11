'use client'

import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link } from '@tanstack/react-router'
import {
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  UserCheck,
} from 'lucide-react'
import { useClinicDetails } from '@/hooks/useQuery'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { BookingModal } from '@/pages/BookingModal'
import { getImageUrl } from '@/utils/imageUtils'

type SortOption = 'default' | 'price-desc' | 'rating-desc'
const MIN_SLIDES_FOR_LOOP = 6

// دالة مساعدة آمنة لضمان عدم طباعة الكائنات بشكل مباشر في الـ JSX
const renderSafeText = (field: any, lang: string) => {
  if (!field) return ''
  if (typeof field === 'object') {
    return field[lang] || field.ar || field.en || ''
  }
  return String(field)
}

export const ServicesSection = () => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const dir = i18n.dir()

  const params = useParams({ strict: false }) as { slug?: string }
  const slug = params.slug || ''

  // استخدام دالة تفاصيل العيادة لجلب العيادة وكل خدماتها وأطبيائها المرتبطين ببعض من الباك اند
  const { data: rawClinicData, isLoading } = useClinicDetails(slug)

  const clinic = useMemo(
    () => (rawClinicData as any)?.data || rawClinicData || {},
    [rawClinicData],
  )

  const originalServices = useMemo(() => {
    const rawServices = Array.isArray(clinic.services) ? clinic.services : []
    return Array.from(new Map(rawServices.map((s: any) => [s.id, s])).values())
  }, [clinic])

  const specialties = useMemo(
    () => (Array.isArray(clinic.specialties) ? clinic.specialties : []),
    [clinic],
  )

  // استخراج قائمة أطباء العيادة للربط مع الخدمات عبر doctor_id
  const clinicDoctors = useMemo(() => {
    return Array.isArray(clinic.doctors) ? clinic.doctors : []
  }, [clinic])

  const [selectedSpecId, setSelectedSpecId] = useState<string>('all')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('default')

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)

  const openBookingModal = (service: any) => {
    setSelectedService(service)
    setIsBookingOpen(true)
  }

  const uniqueDoctors = useMemo(() => {
    const docs = originalServices
      .map(
        (s: any) =>
          s.doctor ||
          clinicDoctors.find((d: any) => d.id === s.doctor_id) ||
          (s.doctor_id ? { id: s.doctor_id, name: s.doctor_name } : null),
      )
      .filter(Boolean)
    return Array.from(new Map(docs.map((d: any) => [d.id, d])).values())
  }, [originalServices, clinicDoctors])

  const filteredAndSortedServices = useMemo(() => {
    let result = originalServices.filter((s: any) => {
      const docId = s.doctor?.id || s.doctor_id
      const specId = s.doctor?.specialty_id || s.specialty_id

      const matchesSpec =
        selectedSpecId === 'all' || specId?.toString() === selectedSpecId

      const matchesDoctor =
        selectedDoctorId === 'all' || docId?.toString() === selectedDoctorId

      return matchesSpec && matchesDoctor
    })

    if (sortBy === 'price-desc') {
      result.sort((a: any, b: any) => b.price - a.price)
    } else if (sortBy === 'rating-desc') {
      result.sort(
        (a: any, b: any) => (b.doctor?.rating || 0) - (a.doctor?.rating || 0),
      )
    }

    return result
  }, [originalServices, selectedSpecId, selectedDoctorId, sortBy])

  const services =
    filteredAndSortedServices.length > 0 &&
    filteredAndSortedServices.length < MIN_SLIDES_FOR_LOOP
      ? [
          ...filteredAndSortedServices,
          ...filteredAndSortedServices,
          ...filteredAndSortedServices,
        ]
      : filteredAndSortedServices

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      direction: dir,
      skipSnaps: false,
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  )

  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  const reInitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scheduleReInit = useCallback(() => {
    if (!emblaApi) return
    if (reInitTimeoutRef.current) clearTimeout(reInitTimeoutRef.current)
    reInitTimeoutRef.current = setTimeout(() => {
      const shouldLoop = services.length >= MIN_SLIDES_FOR_LOOP
      emblaApi.reInit({ loop: shouldLoop })
    }, 50)
  }, [emblaApi, services.length])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scheduleReInit()
      })
    })

    return () => {
      if (reInitTimeoutRef.current) clearTimeout(reInitTimeoutRef.current)
    }
  }, [emblaApi, services, onSelect, scheduleReInit])

  const handleImageLoad = useCallback(() => {
    scheduleReInit()
  }, [scheduleReInit])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (isLoading) {
    return (
      <div className="py-20 text-center text-white font-bold bg-[#1B3A3A]">
        {t('loading_services', 'جاري تحميل الخدمات الطبية...')}
      </div>
    )
  }

  return (
    <div
      className="relative bg-[#3e5d5d] py-12 md:py-17 overflow-hidden"
      dir={dir}
    >
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100M20 0v100M40 0v100M60 0v100M80 0v100' fill='none' stroke='%23ffffff' stroke-width='0.5' stroke-opacity='0.4'/%3E%3Cpath d='M25 10h10v10h10v10H35v10H25V30H15V20h10z' fill='%23ffffff' fill-opacity='0.3'/%3E%3Cpath d='M65 50h15v15h15v15H80v15H65V80H50V65h15z' fill='%23ffffff' fill-opacity='0.25'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }}
      ></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#52B788] mb-1">
              <Stethoscope size={20} />
              <h6 className="text-lg font-semibold">
                {t('medical_services', 'الخدمات الطبية')}
              </h6>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {t('choose_suitable_service', 'اختر الخدمة المناسبة لحالتك')}
            </h2>
          </div>

          {filteredAndSortedServices.length > 0 && (
            <div className="flex gap-2 self-end sm:self-auto">
              <button
                onClick={scrollPrev}
                className="p-2 rounded-full border-0 hover:bg-[#52B788] hover:text-white transition-all shadow-sm bg-white/10 text-white cursor-pointer"
                aria-label="Previous"
              >
                {dir === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
              </button>
              <button
                onClick={scrollNext}
                className="p-2 rounded-full border-0 hover:bg-[#52B788] hover:text-white transition-all shadow-sm bg-white/10 text-white cursor-pointer"
                aria-label="Next"
              >
                {dir === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3 mb-8 bg-white/10 p-2.5 rounded-full border border-white/15 backdrop-blur-md mx-auto max-w-fit shadow-xl">
          <div className="flex items-center gap-2 pl-2 pr-4 text-white">
            <Filter size={16} className="text-[#52B788]" />
            <span className="text-xs font-bold hidden sm:block">
              {t('filter_by', 'تصفية حسب')}:
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <div className="relative">
              <select
                value={selectedSpecId}
                onChange={(e) => setSelectedSpecId(e.target.value)}
                className="appearance-none bg-white text-[#1B3A3A] px-4 py-2 rounded-full font-bold text-xs cursor-pointer pr-8 hover:bg-gray-50 transition-colors shadow-sm outline-none"
              >
                <option value="all">{t('specialty', 'التخصص')}</option>
                {specialties.map((item: any) => {
                  const itemName =
                    renderSafeText(item.name, currentLang) || 'Specialty'
                  return (
                    <option key={item.id} value={item.id}>
                      {itemName}
                    </option>
                  )
                })}
              </select>
              <ChevronDown
                size={12}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#1B3A3A] pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="appearance-none bg-white text-[#1B3A3A] px-4 py-2 rounded-full font-bold text-xs cursor-pointer pr-8 hover:bg-gray-50 transition-colors shadow-sm outline-none"
              >
                <option value="all">{t('doctor', 'الطبيب')}</option>
                {uniqueDoctors.map((item: any) => {
                  const docName =
                    renderSafeText(item.name, currentLang) || 'Doctor'
                  return (
                    <option key={item.id} value={item.id}>
                      {docName}
                    </option>
                  )
                })}
              </select>
              <ChevronDown
                size={12}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#1B3A3A] pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white text-[#1B3A3A] px-4 py-2 rounded-full font-bold text-xs cursor-pointer pr-8 hover:bg-gray-50 transition-colors shadow-sm outline-none"
              >
                <option value="default">{t('sort_by', 'ترتيب حسب')}</option>
                <option value="price-desc">
                  {t('price_high_to_low', 'السعر: من الأعلى للأقل')}
                </option>
              </select>
              <ChevronDown
                size={12}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#1B3A3A] pointer-events-none"
              />
            </div>
          </div>
        </div>

        {filteredAndSortedServices.length === 0 ? (
          <div className="text-center py-12 text-white/90 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm max-w-xl mx-auto shadow-lg">
            لا توجد خدمات متاحة مطابقة لخياراتك حالياً
          </div>
        ) : (
          <div className="overflow-hidden py-6" ref={emblaRef}>
            <div
              className="flex [touch-action:pan-y]"
              style={{ marginInlineStart: '-24px' }}
            >
              {services.map((service: any, index: number) => {
                const serviceName =
                  renderSafeText(service.name, currentLang) || 'Service'
                const serviceDesc = renderSafeText(
                  service.description,
                  currentLang,
                )

                // الربط مع الطبيب باستخدام الكائن المباشر أو من خلال الـ ID مع أطباء العيادة
                const associatedDoctor =
                  service.doctor ||
                  clinicDoctors.find((d: any) => d.id === service.doctor_id)
                const doctorName = associatedDoctor
                  ? renderSafeText(associatedDoctor.name, currentLang)
                  : service.doctor_name
                    ? renderSafeText(service.doctor_name, currentLang)
                    : null

                const rawImage = service.image
                const serviceImage = rawImage ? getImageUrl(rawImage) : null

                const isActive = index === selectedIndex

                return (
                  <div
                    key={`${service.id || index}-${index}`}
                    className="flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_31%] min-w-0"
                    style={{ paddingInlineStart: '24px' }}
                  >
                    <div
                      className={`cursor-pointer group relative bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 flex flex-col transition-all duration-500 ${
                        isActive
                          ? 'scale-[1.02] shadow-xl border-[#2D6A4F] z-10'
                          : 'opacity-80 scale-95'
                      }`}
                    >
                      <Link
                        to="/clinics/$slug/services/$id"
                        params={{ slug: slug, id: service.id.toString() }}
                        className="block flex-1 flex flex-col"
                      >
                        <div className="relative mb-3 w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                          {serviceImage ? (
                            <img
                              src={serviceImage}
                              alt={serviceName}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onLoad={handleImageLoad}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                handleImageLoad()
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Stethoscope
                                size={40}
                                className="text-[#2D6A4F]"
                              />
                            </div>
                          )}
                        </div>

                        <div className="p-4 pt-0 flex flex-col flex-grow">
                          <h3 className="font-bold text-base truncate w-full text-center text-[#0E2A2E] mb-1">
                            {serviceName}
                          </h3>

                          {/* وصف الخدمة */}
                          {serviceDesc && (
                            <p className="text-gray-600 text-xs font-medium text-center line-clamp-2 w-full leading-relaxed mb-2">
                              {serviceDesc}
                            </p>
                          )}

                          {/* اسم الطبيب تحت الوصف مباشرة */}
                          {doctorName && (
                            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#52B788] bg-emerald-50 py-1 px-2 rounded-lg mx-auto w-fit mt-auto">
                              <UserCheck size={14} />
                              <span>{doctorName}</span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-4 pt-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            openBookingModal(service)
                          }}
                          className="w-full py-2.5 bg-[#2D6A4F] text-white rounded-xl font-bold hover:bg-[#1B3A3A] active:scale-[0.98] transition-all shadow-md hover:shadow-lg cursor-pointer text-xs"
                        >
                          {t('book_now', 'احجز الآن')}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctorId={selectedService?.doctor?.id || selectedService?.doctor_id}
        services={[selectedService]}
        clinicSlug={slug}
        getLocalized={(data: any, lang: any) =>
          typeof data === 'object' ? data?.[lang] || data?.ar : data
        }
      />
    </div>
  )
}
