'use5 client'

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, MessageSquareOff } from 'lucide-react';
import { usePlatformReviews } from '@/hooks/useQuery'; 

export function SaasTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // جلب البيانات حصرياً من الباك إند عبر الـ API
  const { data: rawTestimonials = [], isLoading, error } = usePlatformReviews();

  // فلترة التقييمات لضمان عدم حدوث أي تكرار
  const testimonials = React.useMemo(() => {
    const seen = new Set();
    return rawTestimonials.filter((item: any) => {
      const identifier = item.id || `${item.doctor_name}-${item.comment}`;
      if (seen.has(identifier)) {
        return false;
      }
      seen.add(identifier);
      return true;
    });
  }, [rawTestimonials]);

  // تحديد عدد الكاردات المعروضة حسب الشاشة (1 في الموبايل، 3 في التابلت والديسك توب)
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(1); // كارد واحد فقط في الموبايل
      } else {
        setSlidesToShow(3); // 3 كاردات في التابلت والديسك توب
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxSlides = Math.max(1, testimonials.length - slidesToShow + 1);

  useEffect(() => {
    if (currentIndex >= maxSlides) {
      setCurrentIndex(0);
    }
  }, [maxSlides, currentIndex]);

  useEffect(() => {
    if (testimonials.length <= slidesToShow) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % maxSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length, maxSlides, slidesToShow]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center bg-white">
        <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-sm">جاري تحميل آراء الأطباء من الخادم...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-500 text-sm">
        حدث خطأ أثناء جلب التقييمات من الخادم.
      </div>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <section dir="rtl" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-md mx-auto bg-slate-50 border border-slate-100 rounded-3xl p-10 shadow-sm">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquareOff className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد تقييمات حالياً</h3>
            <p className="text-slate-500 text-sm">كن أول طبيب يشاركنا رأيه في المنصة بعد مراجعتها من الإدارة.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section dir="rtl" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-teal-700 bg-teal-50 text-sm font-bold px-4 py-1.5 rounded-full inline-block">
            آراء الأطباء
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ماذا يقول الأطباء عن منصتنا
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            انضم إلى آلاف الأطباء الذين يستخدمون منصتنا لتحسين إدارة عياداتهم
          </p>
        </div>

        <div className="relative max-w-xl md:max-w-6xl mx-auto px-2 sm:px-6">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(${currentIndex * (100 / slidesToShow)}%)` 
              }}
            >
              {testimonials.map((item: any, index: number) => (
                <div 
                  key={item.id || index}
                  style={{
                    flex: `0 0 ${100 / slidesToShow}%`,
                    width: `${100 / slidesToShow}%`
                  }}
                  className="box-border px-2 md:px-3"
                >
                  <div className="bg-slate-50/70 border border-slate-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow h-full">
                    <div>
                      <div className="flex gap-1 mb-6 justify-center">
                        {[...Array(item.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-slate-700 text-center text-sm sm:text-base leading-relaxed mb-8">
                        "{item.comment}"
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-200/60">
                      <img 
                        src={item.doctor_avatar || item.image || item.avatar} 
                        alt={item.doctor_name} 
                        className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-teal-600 shrink-0"
                      />
                      <div className="text-right">
                        <h4 className="font-bold text-slate-900 text-sm truncate max-w-[180px] sm:max-w-xs">{item.doctor_name}</h4>
                        <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[180px] sm:max-w-xs">{item.clinic_name || "طبيب ممارس"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {testimonials.length > slidesToShow && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all z-10 cursor-pointer"
                aria-label="Previous review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all z-10 cursor-pointer"
                aria-label="Next review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex justify-center items-center gap-2 mt-10">
                {[...Array(maxSlides)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx ? 'w-8 bg-teal-600' : 'w-2.5 bg-slate-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

        </div>

      </div>
    </section>
  );
}

export { SaasTestimonials as Testimonials };