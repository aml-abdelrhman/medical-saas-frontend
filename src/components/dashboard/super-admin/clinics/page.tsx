'use client'

import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminClinics, useDeleteClinic } from '@/hooks/useQuery'
import { Toaster, toast } from 'react-hot-toast'
import { 
  Trash2, 
  Loader2, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Power,
  Edit3,
  Plus
} from 'lucide-react'

const renderText = (field: any) => {
  if (!field) return null
  if (typeof field === 'object') {
    return field.ar || field.en || Object.values(field)[0] || JSON.stringify(field)
  }
  return field
}

const getClinicLogo = (clinic: any) => {
  const logo = clinic?.logo || clinic?.image || clinic?.logo_url || clinic?.avatar || clinic?.settings?.logo || clinic?.icon
  if (!logo) return null

  if (typeof logo === 'string') {
    if (logo.startsWith('http') || logo.startsWith('data:')) return logo
    // استخدام مسار نسبى نظيف أو بناء الرابط ديناميكياً بدون تثبيت localhost
    const cleanPath = logo.replace(/^\/+/, '')
    return `/storage/${cleanPath}`
  }

  return null
}

function ClinicTableRow({ clinic, handleOpenEdit, handleDelete, deletingId, renderStatusBadge }: any) {
  const logoUrl = getClinicLogo(clinic)
  const clinicName = renderText(clinic.name) || 'عيادة بدون اسم'
  const planName = renderText(clinic.subscription?.plan?.name) || 'خطة مجانية'
  const status = clinic.subscription?.status || 'trial'
  const expiresAt = clinic.subscription?.expires_at

  return (
    <>
      {/* سطح المكتب (Table Row) */}
      <tr className="hidden md:table-row hover:bg-slate-50/80 transition-all">
        <td className="py-5 px-6 font-bold text-slate-800">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={clinicName} 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200/85 shadow-md shrink-0 bg-white p-0.5" 
                onError={(e: any) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : null}
            
            {!logoUrl && (
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border-2 border-teal-100 flex items-center justify-center shrink-0 shadow-inner font-black text-2xl">
                {clinicName.charAt(0)}
              </div>
            )}

            <div>
              <span className="block font-black text-slate-900 text-base">{clinicName}</span>
              <span className="text-xs text-teal-600 font-mono font-bold mt-1 inline-block">/{clinic.slug || 'no-slug'}</span>
            </div>
          </div>
        </td>

        <td className="py-5 px-6 text-slate-600">
          <div className="font-bold text-slate-900 text-sm">
            {clinic.owner?.name || clinic.owner_name || 'غير محدد'}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{clinic.owner?.email || clinic.email || 'لا يوجد بريد'}</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span>{clinic.phone || clinic.owner?.phone || 'غير متوفر'}</span>
          </div>
        </td>

        <td className="py-5 px-6">
          <span className="bg-slate-100 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 border border-slate-200 shadow-sm">
            <CreditCard className="w-4 h-4 text-teal-600 shrink-0" />
            {planName}
          </span>
        </td>

        <td className="py-5 px-6">
          {renderStatusBadge(status)}
        </td>

        <td className="py-5 px-6 text-xs text-slate-600 font-bold">
          {expiresAt ? (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{new Date(expiresAt).toLocaleDateString('ar-EG')}</span>
            </div>
          ) : (
            <span className="text-slate-400">غير محدد</span>
          )}
        </td>

        <td className="py-5 px-6 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <button
              onClick={() => handleOpenEdit(clinic.id)}
              className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl transition-all border border-teal-200/60 shadow-sm"
              title="تعديل بيانات العيادة"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDelete(clinic.id)}
              disabled={deletingId === clinic.id}
              className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-200/60 shadow-sm disabled:opacity-50"
              title="حذف العيادة بالكامل"
            >
              {deletingId === clinic.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </td>
      </tr>

      {/* الموبايل (Card Layout) */}
      <div className="md:hidden bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={clinicName} 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200/85 shadow-md shrink-0 bg-white p-0.5" 
                onError={(e: any) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : null}
            
            {!logoUrl && (
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 border-2 border-teal-100 flex items-center justify-center shrink-0 shadow-inner font-black text-xl">
                {clinicName.charAt(0)}
              </div>
            )}

            <div>
              <span className="block font-black text-slate-900 text-base">{clinicName}</span>
              <span className="text-xs text-teal-600 font-mono font-bold mt-0.5 inline-block">/{clinic.slug || 'no-slug'}</span>
            </div>
          </div>

          <div>
            {renderStatusBadge(status)}
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 text-xs text-slate-600 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">المالك:</span>
            <span className="font-bold text-slate-800">{clinic.owner?.name || clinic.owner_name || 'غير محدد'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">البريد:</span>
            <span className="font-semibold text-slate-700 truncate max-w-[180px]">{clinic.owner?.email || clinic.email || 'لا يوجد بريد'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">الهاتف:</span>
            <span className="font-semibold text-slate-700">{clinic.phone || clinic.owner?.phone || 'غير متوفر'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1.5 border border-slate-200 shadow-sm">
              <CreditCard className="w-3.5 h-3.5 text-teal-600" />
              {planName}
            </span>
          </div>

          <div className="text-slate-500 font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{expiresAt ? new Date(expiresAt).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => handleOpenEdit(clinic.id)}
            className="flex-1 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl font-bold transition-all border border-teal-200/60 shadow-sm flex items-center justify-center gap-2 text-xs"
          >
            <Edit3 className="w-4 h-4" />
            تعديل البيانات
          </button>

          <button
            onClick={() => handleDelete(clinic.id)}
            disabled={deletingId === clinic.id}
            className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition-all border border-rose-200/60 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
          >
            {deletingId === clinic.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                حذف
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

export default function SuperAdminClinics() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data: clinics, isLoading } = useAdminClinics()
  const deleteClinicMutation = useDeleteClinic()

  const handleOpenAdd = () => navigate({ to: '/dashboard/super-admin/clinics/new' })
  const handleOpenEdit = (clinicId: number) => {
    navigate({ to: '/dashboard/super-admin/clinics/$clinicId/edit', params: { clinicId: String(clinicId) } })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه العيادة نهائياً من المنصة مع كافة بياناتها؟')) {
      setDeletingId(id)
      deleteClinicMutation.mutate(id, {
        onSuccess: () => {
          toast.success('تم حذف العيادة بنجاح', { position: 'top-left', style: { background: '#0d3b45', color: '#fff', borderRadius: '12px' } })
          queryClient.invalidateQueries({ queryKey: ['admin-clinics'] })
          queryClient.invalidateQueries({ queryKey: ['platform-stats'] })
          setDeletingId(null)
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'فشل حذف العيادة، حاول مرة أخرى', { position: 'top-left' })
          setDeletingId(null)
        },
      })
    }
  }

  const filteredClinics = clinics?.filter((clinic: any) => {
    const name = renderText(clinic.name) || ''
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          clinic.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          clinic.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const currentStatus = clinic.subscription?.status || 'trial'
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const renderStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: any }> = {
      active: { label: 'نشط', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
      expired: { label: 'منتهي', className: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
      suspended: { label: 'موقوف', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: Power },
      trial: { label: 'تجريبي', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock }
    }

    const badge = badges[status] || badges.trial
    const Icon = badge.icon

    return (
      <span className={`border px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-sm ${badge.className}`}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {badge.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 sm:px-0" dir="rtl">
      <Toaster />

      <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">إدارة عيادات المنصة</h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">عرض حالة الاشتراكات، الشعارات، وإضافة أو تعديل العيادات بكل سهولة</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleOpenAdd}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-teal-900/10 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة عيادة جديدة
          </button>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">النشطة</option>
              <option value="expired">المنتهية</option>
              <option value="suspended">الموقوفة</option>
              <option value="trial">التجريبية</option>
            </select>

            <span className="text-sm bg-teal-50 text-teal-700 border border-teal-100 px-4 py-3 rounded-xl font-bold whitespace-nowrap shadow-sm text-center">
              الإجمالي: {filteredClinics?.length || 0}
            </span>
          </div>

          <div className="relative flex-1 sm:w-60 lg:w-72">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، المالك، أو الـ Slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-transparent md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-slate-100 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 text-xs font-black uppercase tracking-wider border-b border-slate-100">
                <th className="py-5 px-6">العيادة والشعار</th>
                <th className="py-5 px-6">المالك والاتصال</th>
                <th className="py-5 px-6">الباقة الحالية</th>
                <th className="py-5 px-6">حالة الاشتراك</th>
                <th className="py-5 px-6">تاريخ الانتهاء</th>
                <th className="py-5 px-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold">
              {filteredClinics?.map((clinic: any) => (
                <ClinicTableRow 
                  key={clinic.id} 
                  clinic={clinic} 
                  handleOpenEdit={handleOpenEdit} 
                  handleDelete={handleDelete} 
                  deletingId={deletingId} 
                  renderStatusBadge={renderStatusBadge} 
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {filteredClinics?.map((clinic: any) => (
            <ClinicTableRow 
              key={clinic.id} 
              clinic={clinic} 
              handleOpenEdit={handleOpenEdit} 
              handleDelete={handleDelete} 
              deletingId={deletingId} 
              renderStatusBadge={renderStatusBadge} 
            />
          ))}
        </div>

        {(!filteredClinics || filteredClinics.length === 0) && (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 font-bold text-base border border-slate-100 shadow-sm">
            لا توجد عيادات مطابقة للبحث أو الفلتر المحدد.
          </div>
        )}
      </div>
    </div>
  )
}