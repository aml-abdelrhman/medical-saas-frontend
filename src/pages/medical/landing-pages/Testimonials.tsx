'use client'

import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from '@tanstack/react-router'
import {
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  User,
  Quote,
  Trash2,
  Loader2,
} from 'lucide-react'
import { useClinicDoctorsReviews, useDeleteReview } from '@/hooks/useQuery'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { toast } from 'sonner'

export const TestimonialsSection = () => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const dir = i18n.dir()

  const params = useParams({ strict: false }) as { slug?: string }
  const slug = params.slug || ''

  const { data: response, isLoading } = useClinicDoctorsReviews(slug)
  const { mutate: deleteMutation } = useDeleteReview()

  const rawReviews = useMemo(() => {
    const list = Array.isArray(response) 
      ? response 
      : response?.data || response?.reviews || []
    return Array.isArray(list) ? list : []
  }, [response])

  // التقييمات الفريدة بدون أي تكرار
  const reviews = useMemo(() => {
    return Array.from(new Map(rawReviews.map((r: any) => [r.id, r])).values())
  }, [rawReviews])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: reviews.length > 1, // تفعيل اللوب فقط إذا كان هناك أكثر من عنصر واحد
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
      emblaApi.reInit({ loop: reviews.length > 1 })
    }, 50)
  }, [emblaApi, reviews.length])

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
  }, [emblaApi, reviews, onSelect, scheduleReInit])

  const handleImageLoad = useCallback(() => {
    scheduleReInit()
  }, [scheduleReInit])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const getLocalized = (field: any) => {
    if (!field) return ''
    if (typeof field === 'string') return field
    return field[currentLang] || field['ar'] || Object.values(field)[0] || ''
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#52B788] font-bold bg-[#1B3A3A] flex justify-center items-center gap-2">
        <Loader2 className="animate-spin" size={24} />
        {t('loading_reviews', 'جاري تحميل التقييمات...')}
      </div>
    )
  }

  return (
    <section
      className="w-full bg-[#1B3A3A] py-20 md:py-28 relative overflow-hidden"
      dir={dir}
    >
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100M20 0v100M40 0v100M60 0v100M80 0v100' fill='none' stroke='%23ffffff' stroke-width='0.5' stroke-opacity='0.4'/%3E%3Cpath d='M25 10h10v10h10v10H35v10H25V30H15V20h10z' fill='%23ffffff' fill-opacity='0.3'/%3E%3Cpath d='M65 50h15v15h15v15H80v15H65V80H50V65h15z' fill='%23ffffff' fill-opacity='0.25'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }}
      ></div>

      <div className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-[#52B788] bg-white/10 px-4 py-1.5 rounded-full text-sm font-semibold mb-3 border border-white/10 backdrop-blur-sm">
              <MessageSquare size={16} />
              <span>{t('doctors_reviews_tag', 'آراء وتجارب مرضى أطباء العيادة')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {t('doctors_reviews_title', 'ماذا يقول مرضى أطبائنا عن تجربتهم')}
            </h2>
          </div>

          {reviews.length > 0 && (
            <div className="flex gap-3 self-end sm:self-auto">
              <button
                onClick={scrollPrev}
                className="w-12 h-12 rounded-full border border-white/15 bg-white/10 text-white hover:bg-white hover:text-[#1B3A3A] transition-all shadow-sm flex items-center justify-center cursor-pointer backdrop-blur-sm"
                aria-label="Previous"
              >
                {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              <button
                onClick={scrollNext}
                className="w-12 h-12 rounded-full border border-white/15 bg-white/10 text-white hover:bg-white hover:text-[#1B3A3A] transition-all shadow-sm flex items-center justify-center cursor-pointer backdrop-blur-sm"
                aria-label="Next"
              >
                {dir === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-300 font-bold bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
            {t('no_reviews_found', 'لا توجد تقييمات متاحة لأطباء هذه العيادة حتى الآن')}
          </div>
        ) : (
          <div className="overflow-hidden py-6 -mx-4 px-4" ref={emblaRef}>
            <div
              className="flex [touch-action:pan-y]"
              style={{ marginInlineStart: '-24px' }}
            >
              {reviews.map((review: any, index: number) => {
                const patientName = getLocalized(review.patient?.name) || 'مريض مجهول'
                const patientAvatar = review.patient?.avatar || review.patient?.image
                const doctorName = getLocalized(review.doctor?.name)
                const rating = review.rating || 5

                const reviewComment =
                  typeof review.comment === 'object'
                    ? review.comment?.[currentLang] || review.comment?.ar || ''
                    : review.comment || ''

                const isActive = index === selectedIndex

                return (
                  <div
                    key={review.id || index}
                    className="flex-[0_0_90%] sm:flex-[0_0_48%] lg:flex-[0_0_32%] min-w-0"
                    style={{ paddingInlineStart: '24px' }}
                  >
                    <div
                      className={`relative bg-[#0E2A2E]/80 backdrop-blur-md rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 h-full min-h-[300px] border ${
                        isActive
                          ? 'shadow-2xl border-[#52B788]/60 ring-4 ring-[#52B788]/15 translate-y-[-4px]'
                          : 'shadow-lg border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="absolute top-6 left-6 text-white/5 pointer-events-none select-none">
                        <Quote size={52} className="rotate-180" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <div className="flex items-center gap-1.5 bg-[#FFC107]/15 px-3.5 py-1.5 rounded-full border border-[#FFC107]/30">
                            <Star
                              size={15}
                              className="fill-[#FFC107] text-[#FFC107]"
                            />
                            <span className="text-xs font-black text-white">
                              {rating}.0
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-400">
                              {review.created_at
                                ? new Date(review.created_at).toLocaleDateString(
                                    currentLang === 'ar' ? 'ar-EG' : 'en-US',
                                    {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    },
                                  )
                                : ''}
                            </span>
                            
                            <button
                              onClick={() =>
                                deleteMutation(review.id, {
                                  onSuccess: () =>
                                    toast.success(
                                      t('delete_success') || 'تم الحذف بنجاح'
                                    ),
                                })
                              }
                              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
                              title={t('delete') || 'حذف'}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {doctorName && (
                          <div className="mb-3 relative z-10">
                            <span className="text-xs text-[#52B788] font-semibold bg-[#52B788]/10 px-3 py-1 rounded-full border border-[#52B788]/20 inline-block">
                              {t('doctor_label', 'الطبيب:')} {doctorName}
                            </span>
                          </div>
                        )}

                        {reviewComment && (
                          <p className="text-gray-200 text-sm md:text-base font-normal leading-relaxed mb-6 relative z-10 break-words">
                            "{reviewComment}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3.5 pt-4 border-t border-white/10 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 overflow-hidden flex items-center justify-center border border-white/15 shrink-0">
                          {patientAvatar ? (
                            <img
                              src={patientAvatar}
                              alt={patientName}
                              className="w-full h-full object-cover"
                              onLoad={handleImageLoad}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                handleImageLoad()
                              }}
                            />
                          ) : (
                            <User size={22} className="text-[#52B788]" />
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <h3 className="font-bold text-base text-white truncate">
                            {patientName}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}