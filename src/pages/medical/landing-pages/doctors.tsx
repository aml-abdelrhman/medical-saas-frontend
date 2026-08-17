"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Stethoscope, ChevronLeft, ChevronRight } from "lucide-react";
import { useClinicDetails } from "@/hooks/useQuery";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { getImageUrl } from "@/utils/imageUtils";

const MIN_SLIDES_FOR_LOOP = 6;

// دالة مساعدة آمنة لضمان عدم طباعة الكائنات بشكل مباشر في الـ JSX
// دالة مساعدة آمنة لضمان عدم طباعة الكائنات أو نصوص الـ JSON بشكل مباشر
const renderSafeText = (field: any, lang: string) => {
  if (!field) return "";

  let parsedField = field;

  // إذا كانت البيانات مخزنة كنص JSON، نقوم بتحويلها إلى كائن أولاً
  if (typeof field === "string") {
    try {
      parsedField = JSON.parse(field);
    } catch (e) {
      // لو النص ليس JSON عادي (مثل اسم عادي)، نتركه كما هو
      parsedField = field;
    }
  }

  // التعامل مع الكائن بعد التحويل
  if (typeof parsedField === "object" && parsedField !== null) {
    return parsedField[lang] || parsedField.ar || parsedField.en || "";
  }

  return String(parsedField);
};

export const DoctorsList = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as "ar" | "en";
  const dir = i18n.dir();

  const params = useParams({ strict: false }) as { slug?: string };
  const slug = params.slug || "";
  const navigate = useNavigate();

  const { data: clinic, isLoading } = useClinicDetails(slug);
  const doctors = clinic?.doctors || [];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
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
      const shouldLoop = doctors.length >= MIN_SLIDES_FOR_LOOP;
      emblaApi.reInit({ loop: shouldLoop });
    }, 50);
  }, [emblaApi, doctors.length]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scheduleReInit();
      });
    });

    return () => {
      if (reInitTimeoutRef.current) clearTimeout(reInitTimeoutRef.current);
    };
  }, [emblaApi, doctors, onSelect, scheduleReInit]);

  const handleImageLoad = useCallback(() => {
    scheduleReInit();
  }, [scheduleReInit]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#2D6A4F] font-bold">
        {t("loading_doctors", { defaultValue: "جاري تحميل الأطباء..." })}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-17" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#2D6A4F] mb-1">
            <Stethoscope size={20} />
            <h6 className="text-lg font-semibold">{t("elite_doctors", "نخبة الأطباء")}</h6>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0E2A2E]">
            {t("meet_our_distinguished_doctors", "تعرف على أطبائنا المتميزين")}
          </h2>
        </div>

        {doctors.length > 0 && (
          <div className="flex gap-2 self-end sm:self-auto">
            <button
              onClick={scrollPrev}
              className="p-2 rounded-full border-0 hover:bg-[#2D6A4F] hover:text-white transition-all shadow-sm bg-white cursor-pointer"
              aria-label="Previous"
            >
              {dir === "rtl" ? <ChevronRight /> : <ChevronLeft />}
            </button>
            <button
              onClick={scrollNext}
              className="p-2 rounded-full border-0 hover:bg-[#2D6A4F] hover:text-white transition-all shadow-sm bg-white cursor-pointer"
              aria-label="Next"
            >
              {dir === "rtl" ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>
        )}
      </div>

      {doctors.length === 0 ? (
        <div className="col-span-full text-center py-10 text-red-500 font-bold bg-red-50 rounded-xl">
          لا توجد بيانات أطباء متاحة حالياً للعيادة (الـ Slug المستخرج: "{slug}")
        </div>
      ) : (
        <div className="overflow-hidden py-6" ref={emblaRef}>
          <div
            className="flex items-stretch [touch-action:pan-y]"
            style={{ marginInlineStart: "-16px" }}
          >
            {doctors.map((doc: any, index: number) => {
              const docName = renderSafeText(doc.name, currentLang) || "Doctor";
              const docBio = renderSafeText(doc.bio, currentLang);

              const rawNameForSlug =
                typeof doc.name === "object"
                  ? doc.name?.en || doc.name?.ar
                  : doc.name;
              
              const doctorSlug =
                doc.slug ||
                String(rawNameForSlug || "doctor")
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[.]/g, "");

              const isActive = index === selectedIndex;

              return (
                <div
                  key={`${doc.id || index}-${index}`}
                  className="flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_32%] min-w-0 h-auto"
                  style={{ paddingInlineStart: "16px" }}
                >
                  <div
                    onClick={() => {
                      navigate({
                        to: "/clinics/$slug/doctors/$doctorSlug",
                        params: {
                          slug: slug || "",
                          doctorSlug: doctorSlug,
                        },
                      });
                    }}
                    className={`cursor-pointer group relative bg-white rounded-2xl overflow-hidden shadow-md flex flex-col h-full transition-all duration-500 ${
                      isActive
                        ? "scale-[1.02] shadow-xl z-10"
                        : "opacity-80 scale-95"
                    }`}
                  >
                    <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                      {doc.image ? (
                        <img
                          src={getImageUrl(doc.image)}
                          alt={docName}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          onLoad={handleImageLoad}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            handleImageLoad();
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Stethoscope size={36} className="text-[#2D6A4F]" />
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 flex flex-col flex-grow justify-center">
                      <h3 className="font-bold text-base truncate w-full text-center text-[#0E2A2E] mb-1">
                        {docName}
                      </h3>
                      {docBio ? (
                        <p className="text-[#2D6A4F] text-xs font-medium text-center line-clamp-2 w-full leading-relaxed">
                          {docBio}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-xs italic text-center w-full">
                          لا توجد نبذة تعريفية متاحة
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