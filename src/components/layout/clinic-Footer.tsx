import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from '@tanstack/react-router'
import { MapPin, Phone, Mail, Instagram, Clock } from 'lucide-react'

interface FooterProps {
  clinic?: any;
}

export function Footer({ clinic }: FooterProps) {
  const { t } = useTranslation()
  const params = useParams({ strict: false }) as { slug?: string }
  const clinicSlug = params.slug || ''

  return (
    <footer className="bg-[#1B3A3A] text-white py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* العمود الأول: الشعار واسم العيادة */}
        <div className="space-y-4">
          <img
            src={clinic?.logo || "/logo1.png"}
            alt={clinic?.name || "Clinic logo"}
            className="h-12 w-auto object-contain bg-white/10 p-2 rounded-lg"
          />
          <p className="text-base font-bold text-[#5FBF8E]">{clinic?.name}</p>
          <p className="text-xs text-gray-300 leading-relaxed opacity-80">
            {t('footer.acknowledgement', { defaultValue: 'نلتزم بتقديم أفضل الخدمات الرعاية الصحية والعلاجية المتاحة.' })}
          </p>
        </div>

        {/* العمود الثاني: خريطة الموقع للعيادة */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg mb-2 text-[#5FBF8E]">
            {t('footer.siteMap', { defaultValue: 'خريطة الموقع' })}
          </h4>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>
              <Link to="/clinics/$slug" params={{ slug: clinicSlug }} className="hover:text-[#5FBF8E] transition">
                {t('footer.links.home', { defaultValue: 'الرئيسية' })}
              </Link>
            </li>
            <li>
              <Link to="/clinics/$slug/about" params={{ slug: clinicSlug }} className="hover:text-[#5FBF8E] transition">
                {t('footer.links.about', { defaultValue: 'من نحن' })}
              </Link>
            </li>
            <li>
              <Link to="/clinics/$slug/services" params={{ slug: clinicSlug }} className="hover:text-[#5FBF8E] transition">
                {t('footer.links.services', { defaultValue: 'الخدمات' })}
              </Link>
            </li>
            <li>
              <Link to="/clinics/$slug/doctors" params={{ slug: clinicSlug }} className="hover:text-[#5FBF8E] transition">
                {t('footer.links.doctors', { defaultValue: 'الأطباء' })}
              </Link>
            </li>
          </ul>
        </div>

        {/* العمود الثالث: اتصل بنا (يعرض بيانات العيادة الحقيقية) */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg mb-2 text-[#5FBF8E]">
            {t('footer.contactUs', { defaultValue: 'اتصل بنا' })}
          </h4>
          <div className="space-y-2 text-sm text-gray-300">
            {clinic?.address && (
              <div className="flex items-start gap-2">
                <MapPin size={16} className="shrink-0 mt-0.5" /> 
                <span>{clinic.address}</span>
              </div>
            )}
            {clinic?.phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" /> 
                <span dir="ltr">{clinic.phone}</span>
              </div>
            )}
            {clinic?.email && (
              <div className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" /> 
                <span className="truncate">{clinic.email}</span>
              </div>
            )}
            {clinic?.instagram && (
              <div className="flex items-center gap-2">
                <Instagram size={16} className="shrink-0" /> 
                <span>{clinic.instagram}</span>
              </div>
            )}
          </div>
        </div>

        {/* العمود الرابع: مواعيد العمل */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg mb-2 text-[#5FBF8E] flex items-center gap-2">
            <Clock size={18} /> {t('footer.openingHours', { defaultValue: 'مواعيد العمل' })}
          </h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>
              <span className="text-[#5FBF8E] font-medium">
                {t('footer.days.monFri', { defaultValue: 'السبت - الخميس' })}:
              </span>{' '}
              {clinic?.working_hours || t('footer.hours', { defaultValue: '9:00 صباحاً - 9:00 مساءً' })}
            </p>
            <p>
              <span className="text-red-400 font-medium">
                {t('footer.days.sun', { defaultValue: 'الجمعة' })}:
              </span>{' '}
              {t('footer.closed', { defaultValue: 'مغلق' })}
            </p>
          </div>
        </div>
      </div>

      {/* حقوق النشر */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} {clinic?.name || 'All Rights Reserved'}.</p>
      </div>
    </footer>
  )
}