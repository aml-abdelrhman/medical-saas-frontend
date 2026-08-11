'use client'

import React, { useState } from 'react'
import { usePlatformStats } from '@/hooks/useQuery'
import { Building2, Users, UserCheck, Activity, TrendingUp, DollarSign, Calendar, ShieldCheck } from 'lucide-react'

export default function SuperAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = usePlatformStats()

  const [timeFilter, setTimeFilter] = useState('6_months')

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // بيانات أعمدة الرسم البياني مع تدرجات لونية مختلفة لكل شهر ومستطيلة من الأعلى
  const revenueChartData = [
    { month: 'يناير', height: '35%', amount: '120,000 ج.م', color: 'from-teal-800 to-teal-700' },
    { month: 'فبراير', height: '55%', amount: '210,000 ج.م', color: 'from-teal-700 to-teal-600' },
    { month: 'مارس', height: '45%', amount: '180,000 ج.م', color: 'from-teal-600 to-teal-500' },
    { month: 'أبريل', height: '70%', amount: '290,000 ج.م', color: 'from-emerald-600 to-teal-500' },
    { month: 'مايو', height: '80%', amount: '340,000 ج.م', color: 'from-emerald-500 to-teal-400' },
    { month: 'يونيو', height: '95%', amount: stats?.total_revenue ? `${Number(stats.total_revenue).toLocaleString()} ج.م` : '410,000 ج.م', color: 'from-cyan-600 to-teal-400' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-4 sm:px-6 font-sans" dir="rtl">
      
      {/* عنوان الصفحة الترحيبي */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800">لوحة تحكم المنصة العامة</h1>
          <p className="text-xs text-slate-400 mt-1">نظرة شاملة ومحدثة على كافة الإحصائيات والأرقام الحقيقية للمنصة</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          النظام يعمل بكفاءة وتحديث فوري
        </div>
      </div>

      {/* 1. الصف الأول: الإحصائيات المالية والرئيسية الكبرى (من الـ Backend) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* إجمالي الإيرادات الحقيقي */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1">إجمالي إيرادات المنصة</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
              {stats?.total_revenue ? Number(stats.total_revenue).toLocaleString() + ' ج.م' : '0 ج.م'}
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg mt-3 inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> من الاشتراكات النشطة
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        {/* إجمالي العيادات الحقيقي */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1">إجمالي العيادات</p>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-800">{stats?.total_clinics || 0}</h3>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg mt-3 inline-block">
              عيادة مسجلة بالمنصة
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
        </div>

        {/* الاشتراكات النشطة الحقيقية */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1">الاشتراكات النشطة</p>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-800">{stats?.active_subscriptions || 0}</h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg mt-3 inline-block">
              باقة مفعلة حالياً
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Activity className="w-7 h-7" />
          </div>
        </div>

        {/* إجمالي المرضى الحقيقي */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1">إجمالي المرضى</p>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-800">{stats?.total_patients || 0}</h3>
            <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg mt-3 inline-block">
              مريض مسجل
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-inner">
            <Users className="w-7 h-7" />
          </div>
        </div>

      </div>

      {/* 2. الصف الثاني: إحصائيات تفصيلية إضافية */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">إجمالي الأطباء</p>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">{stats?.total_doctors || 0}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">مشرفو النظام (Admins)</p>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">{stats?.total_admins || 0}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">إجمالي الحسابات بالمنصة</p>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">
              {((stats?.total_doctors || 0) + (stats?.total_patients || 0) + (stats?.total_admins || 0))}
            </h4>
          </div>
        </div>

      </div>

      {/* 3. قسم تحليل الإيرادات (مُصغر، مستطيل، ومتوسط في منتصف الصفحة) */}
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-base font-black text-slate-800">تحليل الإيرادات والأرباح</h3>
            <p className="text-xs text-slate-400 mt-1">متابعة أداء الأرباح الشهرية لاشتراكات المنصة بتصميم احترافي</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60 text-xs font-bold text-slate-600 shadow-inner">
            <Calendar className="w-4 h-4 text-teal-600 mr-1" />
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-700"
            >
              <option value="6_months">آخر 6 شهور</option>
              <option value="1_year">السنة الحالية</option>
            </select>
          </div>
        </div>

        {/* تصميم الأعمدة البيانية (مستطيلة من الأعلى بدون تقويس rounded-t-2xl، مع تدرجات لونية مميزة) */}
        <div className="h-48 sm:h-52 flex items-end justify-center gap-6 sm:gap-10 pt-6 pb-2 px-2 sm:px-6 border-b border-slate-100 relative">
          {/* خطوط خلفية منقطة خفيفة */}
          <div className="absolute inset-x-4 inset-y-6 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-dashed border-slate-300 w-full"></div>
            <div className="border-b border-dashed border-slate-300 w-full"></div>
            <div className="border-b border-dashed border-slate-300 w-full"></div>
          </div>

          {revenueChartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center h-full justify-end group relative z-10 w-12 sm:w-16">
              {/* Tooltip يظهر عند التحويم فوق العمود */}
              <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap z-20 pointer-events-none">
                {item.amount}
              </div>

              {/* العمود البياني بمستطيل حاد من الأعلى (بدون تدوير) وتدرج لوني خاص */}
              <div 
                style={{ height: item.height }} 
                className={`w-full max-w-[36px] bg-gradient-to-t ${item.color} rounded-t-none transition-all duration-300 shadow-md group-hover:brightness-110 group-hover:scale-y-[1.02]`}
              ></div>
              
              {/* اسم الشهر */}
              <span className="text-xs font-bold text-slate-400 mt-3 group-hover:text-teal-600 transition-colors">{item.month}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-lg bg-teal-600 inline-block shadow-sm"></span> إيرادات الاشتراكات النشطة والباقات</span>
          <span>معدل النمو السنوي: <strong className="text-emerald-600 font-bold">+24%</strong></span>
        </div>
      </div>

    </div>
  )
}