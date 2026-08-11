'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
// import axios from 'axios'


export function MockCheckoutPage() {
  const router = useNavigate()
  const searchParams = useSearch({ strict: false }) as { subscription_id?: string }
  const subscriptionId = searchParams?.subscription_id

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        // إذا أردت تفعيل الاشتراك عبر الـ API:
        // await axios.post('/api/v1/payment/mock-success', { subscription_id: subscriptionId });

        setStatus('success')
        
        setTimeout(() => {
          router({ to: '/dashboard/admin' })
        }, 2500)
        
      } catch (err: any) {
        setStatus('error')
        setErrorMessage('فشلت محاكاة عملية الدفع، يرجى المحاولة مرة أخرى.')
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [subscriptionId, router])

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center">
        
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-teal-100">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">
          بوابة الدفع الآمنة (محاكاة)
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          جاري معالجة عملية الدفع الخاصة بالاشتراك رقم: <span className="font-mono font-bold text-teal-600">#{subscriptionId || '---'}</span>
        </p>

        {status === 'processing' && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto" />
            <p className="text-sm font-bold text-slate-700 animate-pulse">
              برجاء الانتظار، يتم التواصل مع بوابة الدفع وتأكيد العملية...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-bold">
              تمت عملية الدفع بنجاح! تم تفعيل عيادتك وبدء اشتراكك.
            </div>
            <p className="text-xs text-slate-400">
              سيتم تحويلك تلقائياً إلى لوحة التحكم الآن...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4">
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-bold">
              {errorMessage}
            </div>
            <button
              onClick={() => router({ to: '/pricing' })}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>العودة لصفحة الباقات</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}