'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminClinics, useUpdateClinic } from '@/hooks/useQuery'
import toast, { Toaster } from 'react-hot-toast'
import {
  ArrowRight,
  Loader2,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  Upload,
} from 'lucide-react'

export default function EditClinicPage() {
  const navigate = useNavigate()
  
  const { clinicId: clinicIdParam } = useParams({ 
    from: '/dashboard/super-admin/clinics/$clinicId/edit' 
  })
  const clinicId = Number(clinicIdParam)

  const queryClient = useQueryClient()
  const { data: clinics, isLoading: isFetching } = useAdminClinics()
  const updateClinicMutation = useUpdateClinic()

  const [initialEmail, setInitialEmail] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    status: 'active',
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (clinics && clinicId) {
      const currentClinic = clinics.find((c: any) => c.id === clinicId)
      if (currentClinic) {
        const clinicEmail = currentClinic.owner?.email || currentClinic.email || ''
        setInitialEmail(clinicEmail)
        setFormData({
          name:
            typeof currentClinic.name === 'object'
              ? currentClinic.name.ar || ''
              : currentClinic.name || '',
          slug: currentClinic.slug || '',
          email: clinicEmail,
          phone: currentClinic.phone || currentClinic.owner?.phone || '',
          password: '',
          address:
            typeof currentClinic.address === 'object'
              ? currentClinic.address.ar || ''
              : currentClinic.address || '',
          status: currentClinic.subscription?.status || 'active',
        })

        const existingLogo = currentClinic.logo || currentClinic.image || currentClinic.logo_url || currentClinic.settings?.logo
        if (existingLogo) {
          if (typeof existingLogo === 'string') {
            const logoUrl = existingLogo.startsWith('http') 
              ? existingLogo 
              : `http://localhost:8000/storage/${existingLogo.replace(/^\/+/, '')}`
            setLogoPreview(logoUrl)
          }
        }
      }
    }
  }, [clinics, clinicId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const dataToSend = new FormData()
    
    dataToSend.append('_method', 'PUT') 

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'email' && value === initialEmail) {
        return
      }
      if (value !== undefined && value !== null && value !== '') {
        dataToSend.append(key, value)
      }
    })
    
    if (logoFile) {
      dataToSend.append('logo', logoFile)
    }

    updateClinicMutation.mutate(
      { id: clinicId, data: dataToSend },
      {
        onSuccess: () => {
          toast.success('تم تحديث الشعار وبيانات العيادة بنجاح', {
            position: 'top-left',
          })
          queryClient.invalidateQueries({ queryKey: ['admin-clinics'] })
          queryClient.invalidateQueries({ queryKey: ['platform-stats'] })
          navigate({ to: '/dashboard/super-admin/clinics' })
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || 'حدث خطأ أثناء تعديل العيادة',
            { position: 'top-left' },
          )
        },
      },
    )
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      <Toaster />

      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/dashboard/super-admin/clinics' })}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              تعديل بيانات العيادة والشعار
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تحديث معلومات العيادة، شعارها، بيانات المالك، أو الرابط التعريفي
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6"
      >
        <div>
          <label className="block font-bold text-slate-700 text-xs mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-teal-600" /> شعار العيادة (Logo):
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner relative group">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-300" />
              )}
            </div>

            <div className="flex-1">
              <label className="cursor-pointer bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-200 px-4 py-3 rounded-xl font-bold text-xs transition-all inline-flex items-center gap-2 shadow-sm">
                <Upload className="w-4 h-4 text-teal-600" />
                <span>تغيير صورة الشعار...</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-1.5">PNG, JPG, or GIF (الحد الأقصى 2MB)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-600" /> اسم العيادة:
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-teal-600" /> الرابط التعريفي
              (Slug):
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 font-mono text-left"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-2 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-teal-600" /> البريد الإلكتروني
              (للمالك):
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-teal-600" /> رقم الهاتف:
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 text-xs mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-600" /> العنوان التفصيلي:
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          <button
            type="submit"
            disabled={updateClinicMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {updateClinicMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            حفظ التعديلات
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/dashboard/super-admin/clinics' })}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-xs transition-all"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}