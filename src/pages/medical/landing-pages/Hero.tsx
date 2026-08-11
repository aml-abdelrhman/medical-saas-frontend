'use client'

import { useTranslation } from 'react-i18next'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { isRtl } from '@/i18n/config'
import { cn } from '@/lib/utils'

export function Hero() {
  const { t, i18n } = useTranslation()
  const rtl = isRtl(i18n.language)

  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="bg-[#F7F3E8] font-body">
      <section className="relative w-full h-[700px] md:h-[800px] overflow-hidden flex items-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/hero8.png")',
            backgroundPosition: 'center center',
            transform: rtl ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        />

        <div
          className={cn(
            "absolute inset-0 z-10 pointer-events-none",
            rtl
              ? "bg-gradient-to-l from-[#1B3A3A]/90 via-[#1B3A3A]/40 to-transparent max-w-3xl"
              : "bg-gradient-to-r from-[#1B3A3A]/90 via-[#1B3A3A]/40 to-transparent max-w-3xl"
          )}
        />

        <div className="relative z-25 container mx-auto px-6 sm:px-12 w-full flex items-center pt-16 md:pt-20">
          <div className={cn('max-w-2xl px-2 sm:px-4', rtl ? 'text-right' : 'text-left')}>
            <h1 className="text-4xl md:text-7xl font-black text-white leading-tight mb-6 drop-shadow-md">
              {t('hero.title')} <br />
              <span className="text-[#C4A77D]">{t('hero.subtitle')}</span>
            </h1>

            <p className="text-base md:text-xl text-white/90 mb-10 leading-relaxed max-w-xl drop-shadow-md font-medium">
              {t('hero.description')}
            </p>

            <a
              href="#services"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-[#C4A77D] text-[#1B3A3A] text-lg font-bold shadow-lg hover:bg-[#b3966d] transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
            >
              <span>{t('hero.common.bookNow', 'استكشف الخدمات')}</span>
              {rtl ? <ArrowLeft size={22} className="text-[#1B3A3A]" /> : <ArrowRight size={22} className="text-[#1B3A3A]" />}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}