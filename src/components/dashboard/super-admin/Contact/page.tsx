// 2. استدعها واستخدمها هكذا في صفحة عرض الرسائل الخاصة بالأدمن (AdminContactMessages)
'use client'

import React from 'react';
import { useGetContactMessages } from '@/hooks/useQuery'; // استبدل المسار حسب مكان ملف الـ Queries لديك
import { Mail, Phone, User, Calendar, MessageSquare } from 'lucide-react';

export function AdminContactMessages() {
  // استدعاء دالة الكويري بدلاً من الـ useEffect والـ useState اليدوي
  const { data, isLoading, error } = useGetContactMessages();

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm mt-2">جاري تحميل رسائل التواصل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
        <p>حدث خطأ أثناء تحميل رسائل التواصل. يرجى المحاولة مرة أخرى.</p>
      </div>
    );
  }

  // استخراج الرسائل من الـ Response القادم من الـ API
  const messages = data?.data?.data || data?.data || [];

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">رسائل التواصل</h2>
          <p className="text-slate-500 text-sm">عرض ومتابعة رسائل الزوار والأطباء القادمة من موقع المنصة.</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">لا توجد رسائل حالياً</h3>
          <p className="text-slate-500 text-sm">ستظهر هنا أي رسالة يتم إرسالها عبر نموذج اتصل بنا.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((msg: any) => (
            <div key={msg.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <User className="w-4 h-4 text-teal-600" />
                    <span>{msg.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(msg.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="truncate">{msg.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                    <span dir="ltr">{msg.phone}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-slate-700 text-sm leading-relaxed border border-slate-100">
                  <p>"{msg.message}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}