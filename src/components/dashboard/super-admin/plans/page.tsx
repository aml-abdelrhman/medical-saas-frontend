'use client'

import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminPlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '@/hooks/useQuery'
import { Toaster, toast } from 'react-hot-toast'
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit3, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Users,
  ShieldCheck,
  X
} from 'lucide-react'

const getLocalizedText = (field: any) => {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.ar || field.en || Object.values(field)[0] || ''
}

export default function SuperAdminPlans() {
  const queryClient = useQueryClient()
  
  const { data: plansData, isLoading } = useAdminPlans()
  const plans = Array.isArray(plansData) ? plansData : (plansData?.data || plansData?.plans || [])

  const createPlanMutation = useCreatePlan()
  const updatePlanMutation = useUpdatePlan()
  const deletePlanMutation = useDeletePlan()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_in_days: '30',
    description: '',
    max_doctors: '',
    max_patients: '',
    is_active: true,
  })

  const handleOpenAdd = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      price: '',
      duration_in_days: '30',
      description: '',
      max_doctors: '',
      max_patients: '',
      is_active: true,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan)
    setFormData({
      name: getLocalizedText(plan.name),
      price: plan.price || '',
      duration_in_days: plan.duration_in_days || '30',
      description: getLocalizedText(plan.description),
      max_doctors: plan.max_doctors !== null && plan.max_doctors !== undefined ? String(plan.max_doctors) : '',
      max_patients: plan.max_patients !== null && plan.max_patients !== undefined ? String(plan.max_patients) : '',
      is_active: plan.is_active ?? true,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      price: Number(formData.price),
      duration_in_days: Number(formData.duration_in_days),
      max_doctors: formData.max_doctors !== '' && !isNaN(Number(formData.max_doctors)) ? Number(formData.max_doctors) : null,
      max_patients: formData.max_patients !== '' && !isNaN(Number(formData.max_patients)) ? Number(formData.max_patients) : null,
    }

    if (editingPlan) {
      updatePlanMutation.mutate(
        { id: editingPlan.id, data: payload },
        {
          onSuccess: () => {
            toast.success('تم تحديث الباقة بنجاح', { position: 'top-left' })
            setIsModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['super-admin-plans'] })
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'فشل تحديث الباقة', { position: 'top-left' })
          },
        }
      )
    } else {
      createPlanMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('تم إنشاء الباقة بنجاح', { position: 'top-left' })
          setIsModalOpen(false)
          queryClient.invalidateQueries({ queryKey: ['super-admin-plans'] })
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'فشل إنشاء الباقة', { position: 'top-left' })
        },
      })
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الباقة نهائياً؟')) {
      setDeletingId(id)
      deletePlanMutation.mutate(id, {
        onSuccess: () => {
          toast.success('تم حذف الباقة بنجاح', { position: 'top-left' })
          setDeletingId(null)
          queryClient.invalidateQueries({ queryKey: ['super-admin-plans'] })
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'فشل حذف الباقة', { position: 'top-left' })
          setDeletingId(null)
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D9488]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 sm:px-0 font-sans" dir="rtl">
      <Toaster />

      {/* Header Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#0D9488] bg-teal-50 px-3 py-1 rounded-full">إدارة النظام</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">إدارة باقات الاشتراكات</h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">تحكم في خطط الأسعار، المدة، والصلاحيات المتاحة لكل باقة بكل مرونة</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#0D9488] hover:bg-teal-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          إضافة باقة جديدة
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan: any) => (
          <div 
            key={plan.id} 
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden group"
          >
            {/* Status Badge */}
            <div className="absolute top-6 left-6">
              {plan.is_active ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> مفعلة
                </span>
              ) : (
                <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> معطلة
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D9488] border border-teal-100/80 flex items-center justify-center font-bold text-xl shadow-sm">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{getLocalizedText(plan.name)}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">معرف الباقة: #{plan.id}</p>
                </div>
              </div>

              <div className="my-5 py-3.5 px-5 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#0D9488]">{plan.price}</span>
                <span className="text-xs font-bold text-slate-500">ج.م / {plan.duration_in_days} يوم</span>
              </div>

              <p className="text-xs text-slate-600 font-medium min-h-[48px] mb-5 leading-relaxed">
                {getLocalizedText(plan.description) || 'لا يوجد وصف مضاف لهذه الباقة.'}
              </p>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2"><Users className="w-4 h-4 text-[#0D9488]" /> أقصى عدد أطباء:</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {plan.max_doctors !== null && plan.max_doctors !== undefined ? plan.max_doctors : 'غير محدود'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#0D9488]" /> أقصى عدد مرضى:</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {plan.max_patients !== null && plan.max_patients !== undefined ? plan.max_patients : 'غير محدود'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={() => handleOpenEdit(plan)}
                className="flex-1 py-3 bg-teal-50 hover:bg-[#0D9488] hover:text-white text-[#0D9488] rounded-2xl font-bold transition-all border border-teal-100 shadow-sm flex items-center justify-center gap-2 text-xs"
              >
                <Edit3 className="w-4 h-4" />
                تعديل الباقة
              </button>

              <button
                onClick={() => handleDelete(plan.id)}
                disabled={deletingId === plan.id}
                className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold transition-all border border-rose-100 shadow-sm disabled:opacity-50 flex items-center justify-center text-xs"
              >
                {deletingId === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!plans || plans.length === 0) && (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-bold text-sm border border-slate-100 shadow-sm">
          لا توجد باقات مضافة حالياً. قم بإضافة باقة جديدة للبدء.
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">
                {editingPlan ? 'تعديل بيانات الباقة' : 'إضافة باقة جديدة'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم الباقة</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: الباقة الاحترافية"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">السعر (ج.م)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">المدة بالأيام</label>
                  <input
                    type="number"
                    required
                    value={formData.duration_in_days}
                    onChange={(e) => setFormData({ ...formData, duration_in_days: e.target.value })}
                    placeholder="30"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">أقصى عدد أطباء (اختياري)</label>
                  <input
                    type="number"
                    value={formData.max_doctors}
                    onChange={(e) => setFormData({ ...formData, max_doctors: e.target.value })}
                    placeholder="اتركه فارغاً لغير محدود"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">أقصى عدد مرضى (اختياري)</label>
                  <input
                    type="number"
                    value={formData.max_patients}
                    onChange={(e) => setFormData({ ...formData, max_patients: e.target.value })}
                    placeholder="اتركه فارغاً لغير محدود"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">وصف الباقة</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اكتب تفاصيل مميزات الباقة..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#0D9488] rounded border-slate-300 focus:ring-[#0D9488]"
                />
                <label htmlFor="is_active" className="text-xs font-bold text-slate-700 cursor-pointer">
                  الباقة مفعلة ومتاحة للاشتراك
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                  className="px-6 py-3 bg-[#0D9488] hover:bg-teal-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-teal-900/10 flex items-center gap-2 disabled:opacity-50"
                >
                  {(createPlanMutation.isPending || updatePlanMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {editingPlan ? 'حفظ التعديلات' : 'إضافة الباقة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}