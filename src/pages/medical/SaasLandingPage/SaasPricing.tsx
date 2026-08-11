'use client'

import React, { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useCheckoutSubscription, usePublicPlans } from '@/hooks/useQuery'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/useAuthStore'

export function SaasPricing() {
  const [isAnnual, setIsAnnual] = useState(false)
  const router = useNavigate()

  const { data: plansData, isLoading, error } = usePublicPlans()
  const plans = Array.isArray(plansData) ? plansData : plansData?.data || []

  const checkoutMutation = useCheckoutSubscription()

  // سحب البيانات مباشرة من الـ Zustand Store
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  const handleSubscribe = (planId: number) => {
    console.log('=== [SaasPricing] Zustand Auth State ===')
    console.log('User from Store:', user)
    console.log('Token from Store:', token ? 'Found' : 'Missing')

    // استخراج الـ clinic_id من الـ user المخزن في الستور أو الـ localStorage العادي إن وجد
    const storedUser = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {})
    const currentClinicId = storedUser?.clinic_id || storedUser?.clinic?.id || storedUser?.id || null

    console.log('Extracted currentClinicId:', currentClinicId)

    if (!token) {
      alert('يرجى تسجيل الدخول أولاً...')
      router({ to: '/register-clinic' })
      return
    }

    if (!currentClinicId) {
      alert('لم يتم العثور على معرف العيادة، يرجى تسجيل العيادة أولاً...')
      router({ to: '/register-clinic' })
      return
    }

    checkoutMutation.mutate(
      {
        clinic_id: Number(currentClinicId),
        plan_id: planId,
        is_annual: isAnnual,
      },
      {
        onSuccess: (res: any) => {
          console.log('✅ Checkout Success:', res)
          const responseData = res?.data || res
          const paymentUrl = responseData?.payment_url;
          
          // استخراج الـ slug الخاص بالعيادة بشكل صحيح وآمن
          const clinicSlug = storedUser?.slug || storedUser?.clinic?.slug || responseData?.subscription?.clinic?.slug || 'default-clinic';

          if (paymentUrl) {
            window.location.href = paymentUrl;
          } else {
            alert('تم تفعيل باقتك بنجاح!');
            router({ to: `/clinics/${clinicSlug}/dashboard/admin` });
          }
        },
        onError: (err: any) => {
          console.error('❌ Checkout Error Details:', err?.response?.data)
          alert(err?.response?.data?.message || 'حدث خطأ أثناء طلب الباقة')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 text-rose-600 font-bold">
        حدث خطأ أثناء تحميل الباقات. يرجى المحاولة لاحقاً.
      </div>
    )
  }

  return (
    <section dir="rtl" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            اختر الباقة المثالية لعيادتك
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            بعد تسجيل العيادة، يرجى اختيار خطة الاشتراك المناسبة لتفعيل لوحة التحكم وكافة صلاحيات الإدارة.
          </p>

          <div className="mt-8 inline-flex bg-slate-200/70 p-1.5 rounded-full">
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                isAnnual ? 'bg-teal-600 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              خطة سنوية (خصم)
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                !isAnnual ? 'bg-teal-600 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              خطة شهرية
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan: any) => {
            const basePrice = Number(plan.price) || 0
            const finalPrice = isAnnual ? Math.round(basePrice * 12 * 0.8) : basePrice

            return (
              <div
                key={plan.id}
                className="group rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 bg-white text-slate-800 border border-slate-100 shadow-lg hover:shadow-2xl hover:bg-teal-600 hover:text-white hover:-translate-y-3 hover:ring-4 hover:ring-teal-600/30"
              >
                <div>
                  <h3 className="text-xl font-bold mb-2 text-center text-slate-900 group-hover:text-white transition-colors">
                    {plan.name}
                  </h3>

                  <div className="text-center my-6">
                    <span className="text-4xl sm:text-5xl font-extrabold text-teal-600 group-hover:text-white transition-colors">
                      {finalPrice}
                    </span>
                    <span className="text-sm mr-2 font-medium text-slate-500 group-hover:text-teal-100 transition-colors">
                      ج.م / {isAnnual ? 'سنوياً' : 'شهرياً'}
                    </span>
                  </div>

                  <p className="text-sm text-center mb-8 leading-relaxed text-slate-600 group-hover:text-teal-50 transition-colors min-h-[70px]">
                    {plan.description || 'باقة متكاملة لإدارة العيادة بكل كفاءة وسهولة.'}
                  </p>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-sm">
                      <span className="p-1 rounded-full shrink-0 mt-0.5 bg-teal-50 text-teal-600 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                        <Check className="w-4 h-4" />
                      </span>
                      <span className="text-slate-700 group-hover:text-teal-50 transition-colors">
                        الحد الأقصى للأطباء: <strong className="font-black">{plan.max_doctors ?? 'غير محدد'} طبيب</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="p-1 rounded-full shrink-0 mt-0.5 bg-teal-50 text-teal-600 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                        <Check className="w-4 h-4" />
                      </span>
                      <span className="text-slate-700 group-hover:text-teal-50 transition-colors">
                        الحد الأقصى للمرضى: <strong className="font-black">{plan.max_patients ?? 'غير محدد'} مريض</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="p-1 rounded-full shrink-0 mt-0.5 bg-teal-50 text-teal-700 group-hover:text-white transition-colors">
                        <Check className="w-4 h-4" />
                      </span>
                      <span className="text-slate-700 group-hover:text-teal-50 transition-colors">
                        مدار الباقة: {plan.duration_in_days} يوماً
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-md cursor-pointer bg-slate-900 text-white hover:bg-white hover:text-teal-900 hover:shadow-lg group-hover:bg-white group-hover:text-teal-700 group-hover:hover:bg-slate-100 group-hover:hover:text-slate-950 flex items-center justify-center gap-2"
                >
                  {checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري معالجة الاشتراك والدفع...
                    </>
                  ) : (
                    'اطلب الباقة والدفع'
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {plans.length === 0 && !isLoading && (
          <div className="text-center py-12 text-slate-500 font-bold">
            لا توجد باقات متاحة حالياً. يرجى إضافتها من لوحة تحكم السوبر أدمن.
          </div>
        )}
      </div>
    </section>
  )
}