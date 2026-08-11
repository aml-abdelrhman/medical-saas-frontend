import React, { useCallback, useEffect } from 'react';
import { Play, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const heroImages = [
  { src: '/hero525.png', alt: 'Dashboard Preview 1' },
  { src: '/hero526.png', alt: 'Dashboard Preview 2' },
  { src: '/hero527.png', alt: 'Dashboard Preview 3' },
  { src: '/heroo.png', alt: 'Dashboard Preview 4' },
];

export function SaasHero() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: 'rtl' },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div dir="rtl" className="relative bg-gradient-to-b from-[#06302d] via-[#14b8a6] to-[#4dc8b5] text-white overflow-hidden pt-16 pb-0 px-4 sm:px-6 lg:px-8">
      
      {/* خلفية طبية شبكية مع علامات الصليب الطبي */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100M20 0v100M40 0v100M60 0v100M80 0v100' fill='none' stroke='%23ffffff' stroke-width='0.5' stroke-opacity='0.4'/%3E%3Cpath d='M25 10h10v10h10v10H35v10H25V30H15V20h10z' fill='%23ffffff' fill-opacity='0.3'/%3E%3Cpath d='M65 50h15v15h15v15H80v15H65V80H50V65h15z' fill='%23ffffff' fill-opacity='0.25'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      ></div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        
        <div className="pt-6 sm:pt-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-snug">
            نظام طبي شامل بالذكاء الاصطناعي لإدارة العيادة بسهولة 
          </h1>
          <p className="text-lg sm:text-xl text-teal-50 max-w-2xl mx-auto mb-10 font-medium">
            الحل الأمثل لإدارة عيادتك، متابعة المرضى، وتنظيم المواعيد بكفاءة عالية.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a 
            href="#pricing"
            className="w-full sm:w-auto bg-teal-800 hover:bg-teal-900 text-white font-medium px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 border border-white/20"
          >
            <span>اكتشف الباقات</span>
            <ArrowLeft className="w-5 h-5" />
          </a>
          
          <a 
            href="#features"
            className="w-full sm:w-auto bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-medium px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 border border-white/35"
          >
            <div className="w-7 h-7 rounded-full bg-white text-teal-900 flex items-center justify-center shadow-md">
              <Play className="w-3.5 h-3.5 fill-teal-900 ml-0.5" />
            </div>
            <span>اكتشف مميزات المنصة</span>
          </a>
        </div>

        {/* حاوية الكاروسل (Carousel Container) */}
        <div className="relative w-full max-w-6xl mx-auto rounded-t-2xl overflow-hidden shadow-2xl">
          
          {/* Embla Viewport بارتفاع موحد وثابت */}
          <div className="w-full h-[320px] sm:h-[480px] lg:h-[560px]" ref={emblaRef}>
            <div className="flex h-full">
              {heroImages.map((img, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    className="w-full h-full object-cover object-top block select-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* شريط التحكم السفلي (الأزرار والتحكم بالنقاط) */}
          <div className="flex items-center justify-between px-4 py-3 bg-transparent">
            
            {/* زر السهم السابق */}
            <button
              onClick={scrollPrev}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Previous slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* نقاط التنقل (Dots) */}
            <div className="flex justify-center items-center gap-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    selectedIndex === index
                      ? 'w-8 h-2.5 bg-white shadow-md'
                      : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* زر السهم التالي */}
            <button
              onClick={scrollNext}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Next slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}