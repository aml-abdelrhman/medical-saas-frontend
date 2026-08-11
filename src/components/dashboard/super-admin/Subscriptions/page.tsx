'use client'

import React, { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAdminSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  useAdminClinics,
  useAdminPlans,
} from '@/hooks/useQuery'
import { Toaster, toast } from 'react-hot-toast'
import {
  CreditCard, Calendar, Plus, Edit, Trash2,
  CheckCircle2, XCircle, Loader2, Search, Clock, X, TrendingUp,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function buildGrowthData(subscriptions: any[]) {
  const byMonth = new Map<string, { key: string; name: string }>()
  subscriptions.forEach((s: any) => {
    const raw = s.starts_at || s.created_at
    if (!raw) return
    const d = new Date(raw)
    if (isNaN(d.getTime())) return
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!byMonth.has(key)) byMonth.set(key, { key, name: ARABIC_MONTHS[d.getMonth()] })
  })

  const sorted = Array.from(byMonth.values()).sort((a, b) => (a.key > b.key ? 1 : -1))
  let running = 0
  return sorted.map(({ key, name }) => {
    running += subscriptions.filter((s: any) => {
      const raw = s.starts_at || s.created_at
      if (!raw) return false
      const d = new Date(raw)
      return `${d.getFullYear()}-${d.getMonth()}` === key
    }).length
    return { name, اشتراكات: running }
  })
}

export default function SuperAdminSubscriptionsPage() {
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [clinicId, setClinicId] = useState<number | ''>('')
  const [planId, setPlanId] = useState<number | ''>('')
  const [status, setStatus] = useState<string>('active')
  const [startsAt, setStartsAt] = useState<string>('')
  const [endsAt, setEndsAt] = useState<string>('')

  const { data: subsData, isLoading: isLoadingSubs } = useAdminSubscriptions()
  const { data: clinicsData } = useAdminClinics?.() || { data: [] }
  const { data: plansData } = useAdminPlans?.() || { data: [] }

  const createMutation = useCreateSubscription()
  const updateMutation = useUpdateSubscription()
  const deleteMutation = useDeleteSubscription()

  const subscriptions = Array.isArray(subsData) ? subsData : subsData?.data || subsData?.subscriptions || []
  const clinics = Array.isArray(clinicsData) ? clinicsData : clinicsData?.data || clinicsData?.clinics || []
  const plans = Array.isArray(plansData) ? plansData : plansData?.data || plansData?.plans || []

  const totalCount = subscriptions.length
  const activeCount = subscriptions.filter((s: any) => s.status === 'active').length
  const trialCount = subscriptions.filter((s: any) => s.status === 'trial').length
  const expiredOrCancelledCount = subscriptions.filter((s: any) => s.status === 'expired' || s.status === 'cancelled').length

  const growthData = useMemo(() => buildGrowthData(subscriptions), [subscriptions])

  const renderText = (value: any, fallback = '') => {
    if (!value) return fallback
    if (typeof value === 'object') return value.ar || value.en || Object.values(value)[0] || fallback
    return String(value)
  }

  const filteredSubscriptions = subscriptions.filter((sub: any) => {
    const q = searchQuery.toLowerCase()
    return renderText(sub.clinic?.name).toLowerCase().includes(q) || renderText(sub.plan?.name).toLowerCase().includes(q)
  })

  const handleOpenAddModal = () => {
    setEditingId(null)
    setClinicId('')
    setPlanId('')
    setStatus('active')
    setStartsAt('')
    setEndsAt('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (sub: any) => {
    setEditingId(sub.id)
    setClinicId(sub.clinic_id || sub.clinic?.id || '')
    setPlanId(sub.plan_id || sub.plan?.id || '')
    setStatus(sub.status || 'active')
    setStartsAt(sub.starts_at ? sub.starts_at.split('T')[0] : '')
    setEndsAt(sub.ends_at ? sub.ends_at.split('T')[0] : '')
    setIsModalOpen(true)
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicId || !planId || !startsAt || !endsAt) {
      toast.error('الرجاء تعبئة جميع الحقول المطلوبة', { position: 'top-left' })
      return
    }
    const payload = { clinic_id: Number(clinicId), plan_id: Number(planId), status, starts_at: startsAt, ends_at: endsAt }
    const onSettled = () => queryClient.invalidateQueries({ queryKey: ['super-admin-subscriptions'] })

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { toast.success('تم تحديث الاشتراك بنجاح', { position: 'top-left' }); onSettled(); setIsModalOpen(false) },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'فشل تحديث الاشتراك', { position: 'top-left' }),
      })
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { toast.success('تم إنشاء الاشتراك بنجاح', { position: 'top-left' }); onSettled(); setIsModalOpen(false) },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'فشل إنشاء الاشتراك', { position: 'top-left' }),
      })
    }
  }

  const handleDelete = (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الاشتراك؟')) return
    deleteMutation.mutate(id, {
      onSuccess: () => { toast.success('تم حذف الاشتراك بنجاح', { position: 'top-left' }); queryClient.invalidateQueries({ queryKey: ['super-admin-subscriptions'] }) },
      onError: (err: any) => toast.error(err?.response?.data?.message || 'فشل حذف الاشتراك', { position: 'top-left' }),
    })
  }

  if (isLoadingSubs) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#0D9488]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 sm:px-6 font-sans bg-white min-h-screen text-slate-800" dir="rtl">
      <Toaster />

      {/* الهيدر الرئيسي */}
      <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#0D9488] bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">إدارة المنصة الطبية</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">اشتراكات العيادات</h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">متابعة خطط الاشتراكات، تواريخ الصلاحية، وتعديل أو حذف الاشتراكات بكل سهولة</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto bg-[#0D9488] hover:bg-[#0B7C72] text-white font-bold px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-5 h-5" /> تعيين اشتراك لعيادة
        </button>
      </div>

      {/* قسم الإحصائيات والرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* بطاقة توزيع الحالات */}
        <div className="bg-white p-8 rounded-[24px] border border-emerald-100 shadow-sm flex flex-col items-center justify-between relative">
          <span className="self-start text-xs font-bold text-[#0D9488] bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full mb-4">توزيع الحالات</span>
          <div className="relative w-64 h-32 overflow-hidden my-4">
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full border-[32px] border-emerald-50 box-border" />
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full border-[32px] border-transparent border-t-[#0D9488] border-r-emerald-600 border-l-emerald-400 box-border" />
            <div className="absolute inset-x-0 bottom-1 text-center">
              <span className="text-xs font-bold text-slate-500 block mb-0.5">إجمالي الاشتراكات</span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalCount}</h3>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 w-full pt-4 border-t border-emerald-50 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#0D9488]" /><span>نشط ({activeCount})</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span>تجريبي ({trialCount})</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-300" /><span>منتهي ({expiredOrCancelledCount})</span></div>
          </div>
        </div>

        {/* منحنى النمو */}
        <div className="bg-white p-8 rounded-[24px] border border-emerald-100 shadow-sm flex flex-col justify-between relative">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#0D9488] bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full">معدل نمو الاشتراكات</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0D9488] flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">تصاعد انضمام العيادات</h3>
            <p className="text-xs font-semibold text-slate-500">إجمالي تراكمي للاشتراكات حسب شهر البداية</p>
          </div>

          <div className="w-full h-44 mt-4">
            {growthData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} stroke="#e2e8f0" tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} stroke="#e2e8f0" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D9488', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="اشتراكات" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-emerald-50/30 rounded-xl">
                البيانات غير كافية لرسم المنحنى بعد
              </div>
            )}
          </div>

          {growthData.length > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-emerald-50 text-xs font-bold text-slate-500">
              <span>{growthData[0]?.name}</span>
              <span>{growthData[growthData.length - 1]?.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* شريط البحث */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0D9488]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم العيادة أو الباقة..."
            className="w-full pr-12 pl-4 py-3 bg-emerald-50/20 border border-emerald-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* جدول البيانات بتصميم محسن ونظيف */}
      <div className="bg-white rounded-[24px] border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-emerald-50/60 border-b border-emerald-100 text-xs font-black text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-6">#</th>
                <th className="py-4 px-6">العيادة</th>
                <th className="py-4 px-6">الباقة المشترك بها</th>
                <th className="py-4 px-6">فترة الاشتراك</th>
                <th className="py-4 px-6">الحالة</th>
                <th className="py-4 px-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 text-sm font-bold text-slate-700">
              {filteredSubscriptions?.map((sub: any, index: number) => {
                const clinicLogo = sub.clinic?.logo || sub.clinic?.image || sub.clinic_logo
                const clinicName = renderText(sub.clinic?.name, 'عيادة غير محددة')
                const planName = renderText(sub.plan?.name, 'باقة محذوفة أو غير متوفرة')

                return (
                  <tr key={sub.id || index} className="hover:bg-emerald-50/20 transition-all group">
                    {/* الرقم التعريفي */}
                    <td className="py-4 px-6 font-black text-slate-900 text-sm">
                      <span className="bg-emerald-50 text-[#0D9488] px-2.5 py-1 rounded-lg border border-emerald-100">
                        #{sub.id}
                      </span>
                    </td>

                    {/* العيادة مع اللوجو بجانبها */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-2xl bg-emerald-100/60 border border-emerald-200/60 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                          {clinicLogo ? (
                            <img src={clinicLogo} alt={clinicName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-base font-black text-[#0D9488]">
                              {clinicName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{clinicName}</p>
                          <p className="text-xs text-slate-400 font-medium">{sub.clinic?.email || 'لا يوجد بريد إلكتروني'}</p>
                        </div>
                      </div>
                    </td>

                    {/* الباقة */}
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3.5 py-2 rounded-xl font-extrabold text-slate-800 shadow-2xs">
                        <CreditCard className="w-4 h-4 text-[#0D9488]" />
                        <span>{planName}</span>
                      </div>
                    </td>

                    {/* تواريخ البداية والنهاية */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                          <Calendar className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span>البداية: <strong className="text-slate-900">{sub.starts_at ? sub.starts_at.split('T')[0] : '---'}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>الانتهاء: <strong className="text-slate-700">{sub.ends_at ? sub.ends_at.split('T')[0] : '---'}</strong></span>
                        </div>
                      </div>
                    </td>

                    {/* الحالة */}
                    <td className="py-4 px-6">
                      {sub.status === 'active' ? (
                        <span className="bg-emerald-50 text-[#0D9488] border border-emerald-200/60 px-3.5 py-1.5 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4" /> نشط
                        </span>
                      ) : sub.status === 'trial' ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-3.5 py-1.5 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-2xs">
                          <Clock className="w-4 h-4" /> تجريبي
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-2xs">
                          <XCircle className="w-4 h-4" /> {sub.status || 'معطل'}
                        </span>
                      )}
                    </td>

                    {/* أزرار الإجراءات */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          className="p-2.5 bg-emerald-50 hover:bg-[#0D9488] hover:text-white text-[#0D9488] rounded-xl transition-all shadow-2xs border border-emerald-100 group/btn"
                          title="تعديل الاشتراك"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl transition-all shadow-2xs border border-rose-100 group/btn"
                          title="حذف الاشتراك"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {(!filteredSubscriptions || filteredSubscriptions.length === 0) && (
          <div className="p-12 text-center text-slate-400 font-bold text-base">لا توجد اشتراكات مطابقة للبحث أو مسجلة حالياً.</div>
        )}
      </div>

      {/* نافذة الإضافة أو التعديل */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-lg overflow-hidden border border-emerald-100">
            <div className="p-6 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/40">
              <h3 className="font-black text-slate-900 text-lg">{editingId ? 'تعديل بيانات الاشتراك' : 'تعيين اشتراك جديد لعيادة'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">اختر العيادة</label>
                <select value={clinicId} onChange={(e) => setClinicId(e.target.value ? Number(e.target.value) : '')} className="w-full px-4 py-3 bg-emerald-50/20 border border-emerald-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all text-slate-900" required>
                  <option value="">-- اختر العيادة --</option>
                  {clinics.map((clinic: any) => <option key={clinic.id} value={clinic.id}>{renderText(clinic.name)} ({clinic.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">اختر الباقة</label>
                <select value={planId} onChange={(e) => setPlanId(e.target.value ? Number(e.target.value) : '')} className="w-full px-4 py-3 bg-emerald-50/20 border border-emerald-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all text-slate-900" required>
                  <option value="">-- اختر الباقة --</option>
                  {plans.map((plan: any) => <option key={plan.id} value={plan.id}>{renderText(plan.name)} - {plan.price} ج.م</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">حالة الاشتراك</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-3 bg-emerald-50/20 border border-emerald-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all text-slate-900" required>
                  <option value="active">نشط (Active)</option>
                  <option value="trial">تجريبي (Trial)</option>
                  <option value="expired">منتهي (Expired)</option>
                  <option value="cancelled">ملغي (Cancelled)</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">تاريخ البداية</label>
                  <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="w-full px-4 py-3 bg-emerald-50/20 border border-emerald-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all text-slate-900" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">تاريخ النهاية</label>
                  <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="w-full px-4 py-3 bg-emerald-50/20 border border-emerald-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all text-slate-900" required />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-emerald-50 hover:bg-emerald-100 transition-all">إلغاء</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-7 py-3 rounded-xl text-sm font-bold text-white bg-[#0D9488] hover:bg-[#0B7C72] transition-all shadow-md shadow-emerald-900/10 flex items-center gap-2">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'حفظ التعديلات' : 'إضافة الاشتراك'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}