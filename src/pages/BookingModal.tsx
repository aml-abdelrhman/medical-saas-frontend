'use client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCreateAppointment } from '@/hooks/useQuery'
import { X, Languages, Check, AlertCircle, Calendar, Clock, Stethoscope } from 'lucide-react'

type BookingStatus = 'idle' | 'success' | 'booked_error' | 'error'

export const BookingModal = ({
  isOpen,
  onClose,
  doctorId,
  services,
  getLocalized,
  clinicSlug,
}: any) => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const { mutate: bookAppointment, isPending } = useCreateAppointment(clinicSlug)

  const [status, setStatus] = useState<BookingStatus>('idle')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedService, setSelectedService] = useState('')

  const toggleLanguage = () => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(newLang)
  }

  const todayString = new Date().toISOString().split('T')[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('idle')

    // التأكد من أن صيغة الوقت مطابقة تماماً لطلب الـ Backend (H:i) مثل 14:30
    let formattedTime = selectedTime
    if (formattedTime && formattedTime.length > 5) {
      formattedTime = formattedTime.substring(0, 5)
    }

    bookAppointment(
      {
        doctor_id: doctorId,
        service_id: selectedService || services?.[0]?.id,
        appointment_date: selectedDate,
        start_time: formattedTime,
      },
      {
        onSuccess: () => {
          setStatus('success')
          toast.success(t('appointment_booked_successfully'))

          setTimeout(() => {
            onClose()
            setStatus('idle')
          }, 1500)
        },
        onError: (error: any) => {
          console.log('ERROR CAUGHT:', error)
          const httpStatus = error?.response?.status

          if (httpStatus === 401) {
            window.location.href = '/login'
            return
          }

          if (httpStatus === 409 || httpStatus === 422) {
            setStatus('booked_error')
            toast.error(t('appointment_not_available'))
          } else {
            setStatus('error')
          }

          setTimeout(() => setStatus('idle'), 2500)
        },
      },
    )
  }

  if (!isOpen) return null

  const getButtonConfig = () => {
    if (isPending) {
      return {
        text: `${t('loading')}...`,
        className: 'bg-emerald-600',
        disabled: true,
      }
    }
    if (status === 'success') {
      return {
        text: t('appointment_booked_successfully'),
        className: 'bg-emerald-700',
        disabled: true,
      }
    }
    if (status === 'booked_error' || status === 'error') {
      return {
        text: t('appointment_not_available'),
        className: 'bg-rose-600 hover:bg-rose-700',
        disabled: false,
      }
    }
    return {
      text: t('confirm') || 'تأكيد الحجز',
      className: 'bg-emerald-600 hover:bg-emerald-700',
      disabled: false,
    }
  }

  const buttonConfig = getButtonConfig()

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        dir={i18n.dir()}
      >
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X size={18} />
          </button>

          <button
            type="button"
            onClick={toggleLanguage}
            className="absolute top-5 left-5 flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl transition-all"
          >
            <Languages size={15} />
            {currentLang === 'ar' ? 'English' : 'العربية'}
          </button>

          <div className="mt-6 text-center">
            <span className="bg-emerald-700/60 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {t('clinic_booking') || 'حجز موعد طبي'}
            </span>
            <h2 className="text-2xl font-black mt-2 tracking-tight">
              {t('book_now') || 'احجز موعدك الآن'}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-5">
          {status === 'booked_error' && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl p-3.5 text-center flex items-center justify-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{t('appointment_not_available') || 'هذا الموعد غير متاح أو محجوز مسبقاً'}</span>
            </div>
          )}
          {status === 'error' && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl p-3.5 text-center flex items-center justify-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{t('something_went_wrong') || 'حدث خطأ ما، يرجى المحاولة مرة أخرى'}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Stethoscope size={16} className="text-emerald-600" />
              {t('service') || 'الخدمة الطبية'}
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none text-slate-800 font-medium transition-all"
              required
            >
              <option value="" disabled>
                {t('select_service') || 'اختر الخدمة المطلوبة'}
              </option>
              {services?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {getLocalized(s.name, currentLang)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" />
                {t('date') || 'تاريخ الموعد'}
              </label>
              <input
                type="date"
                min={todayString}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none text-slate-800 font-mono transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                {t('time') || 'وقت البداية'}
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none text-slate-800 font-mono transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={buttonConfig.disabled}
            className={`mt-4 text-white w-full py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2 ${buttonConfig.className}`}
          >
            {status === 'success' ? <Check size={20} /> : null}
            {buttonConfig.text}
          </button>
        </form>
      </div>
    </div>
  )
}