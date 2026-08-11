"use client";

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import { useClinicDetails } from '@/hooks/useQuery';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { getImageUrl } from '@/utils/imageUtils';

const MIN_SLIDES_FOR_LOOP = 6;

// دالة مساعدة آمنة لضمان عدم طباعة الكائنات بشكل مباشر في الـ JSX
const renderSafeText = (field: any, lang: string) => {
  if (!field) return '';
  if (typeof field === 'object') {
    return field[lang] || field.ar || field.en || '';
  }
  return String(field);
};

export const ContentSection = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const dir = i18n.dir();

  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { slug?: string };
  const slug = params.slug || '';

  const { data: clinic, isLoading } = useClinicDetails(slug);
  const specialties = clinic?.specialties || [];

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
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const reInitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleReInit = useCallback(() => {
    if (!emblaApi) return;
    if (reInitTimeoutRef.current) clearTimeout(reInitTimeoutRef.current);
    reInitTimeoutRef.current = setTimeout(() => {
      const shouldLoop = specialties.length >= MIN_SLIDES_FOR_LOOP;
      emblaApi.reInit({ loop: shouldLoop });
    }, 50);
  }, [emblaApi, specialties.length]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scheduleReInit();
      });
    });

    return () => {
      if (reInitTimeoutRef.current) clearTimeout(reInitTimeoutRef.current);
    };
  }, [emblaApi, specialties, onSelect, scheduleReInit]);

  const handleImageLoad = useCallback(() => {
    scheduleReInit();
  }, [scheduleReInit]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#2D6A4F] font-bold">
        {t('loading_specialties', 'جاري تحميل التخصصات...')}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-17" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#2D6A4F] mb-1">
            <Stethoscope size={20} />
            <h6 className="text-lg font-semibold">
              {t('medical_specialties', 'التخصصات الطبية')}
            </h6>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0E2A2E]">
            {t('choose_suitable_specialty', 'اختر التخصص المناسب لحالتك')}
          </h2>
        </div>

        {specialties.length > 0 && (
          <div className="flex gap-2 self-end sm:self-auto">
            <button
              onClick={scrollPrev}
              className="p-2 rounded-full border hover:bg-[#2D6A4F] hover:text-white transition-all shadow-sm bg-white cursor-pointer"
              aria-label="Previous"
            >
              {dir === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
            </button>
            <button
              onClick={scrollNext}
              className="p-2 rounded-full border hover:bg-[#2D6A4F] hover:text-white transition-all shadow-sm bg-white cursor-pointer"
              aria-label="Next"
            >
              {dir === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>
        )}
      </div>

      {specialties.length === 0 ? (
        <div className="col-span-full text-center py-10 text-red-500 font-bold bg-red-50 rounded-xl border border-red-200">
          لا توجد تخصصات متاحة حالياً للعيادة
        </div>
      ) : (
        <div className="overflow-hidden py-6" ref={emblaRef}>
          <div
            className="flex [touch-action:pan-y]"
            style={{ marginInlineStart: '-24px' }}
          >
            {specialties.map((spec: any, index: number) => {
              const specName = renderSafeText(spec.name, currentLang) || 'Specialty';
              const specDesc = renderSafeText(spec.description, currentLang);

              // تأمين الصورة باستخدام دالة معالجة الصور القياسية
              const rawImage = spec.image || spec.icon;
              const specImage = rawImage ? getImageUrl(rawImage) : null;

              const isActive = index === selectedIndex;
              const specialtySlug = spec.slug || spec.id?.toString();

              return (
                <div
                  key={spec.id || index}
                  className="flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_31%] min-w-0"
                  style={{ paddingInlineStart: '24px' }}
                >
                  <div
                    onClick={() => {
                      if (!specialtySlug) return;
                      navigate({
                        to: '/clinics/$slug/specialties/$specialtySlug',
                        params: {
                          slug: slug,
                          specialtySlug: specialtySlug,
                        },
                      });
                    }}
                    className={`cursor-pointer group relative bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 flex flex-col transition-all duration-500 ${
                      isActive
                        ? 'scale-[1.02] shadow-xl border-[#2D6A4F] z-10'
                        : 'opacity-80 scale-95'
                    }`}
                  >
                    <div className="relative mb-3 w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                      {specImage ? (
                        <img
                          src={specImage}
                          alt={specName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onLoad={handleImageLoad}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            handleImageLoad();
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Stethoscope size={40} className="text-[#2D6A4F]" />
                        </div>
                      )}
                    </div>

                    <div className="p-4 pt-0 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg truncate w-full text-center text-[#0E2A2E] mb-2">
                        {specName}
                      </h3>
                      {specDesc && (
                        <p className="text-[#2D6A4F] text-sm font-medium text-center line-clamp-2 w-full leading-relaxed">
                          {specDesc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};