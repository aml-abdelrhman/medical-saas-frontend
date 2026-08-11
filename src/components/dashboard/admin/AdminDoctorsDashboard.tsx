'use client'
import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import {
  useGetAdminDoctors,
  useAddDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
  useGetSpecialtiesforadmin,
  useGetDoctorAvailabilityAdmin,
  useAdminDeleteAvailability,
} from '@/hooks/useQuery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Trash2,
  Edit2,
  Loader2,
  Stethoscope,
  CalendarClock,
} from 'lucide-react'
import type { Doctor } from '@/hooks/useQuery'

export default function AdminDoctorsDashboard() {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language as 'ar' | 'en'
  const formRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const [filterSpecialty, setFilterSpecialty] = useState<string>('all')

  const parseSafe = (data: any) => {
    try {
      if (typeof data === 'string') return JSON.parse(data)
      return data || {}
    } catch {
      return {}
    }
  }

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    email: '',
    password: '',
    specialty_id: '',
    bio_ar: '',
    bio_en: '',
    years_experience: '',
    price_from: '',
    languages: '',
    rating: '5',
  })

  const [image, setImage] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: doctors, isLoading: isDoctorsLoading } = useGetAdminDoctors()
  const { data: specialties } = useGetSpecialtiesforadmin()

  const { mutate: addDoctor, isPending: isAdding } = useAddDoctor()
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor()
  const { mutate: deleteDoctor } = useDeleteDoctor()

  const [expandedDoctorId, setExpandedDoctorId] = useState<number | null>(null)
  const { data: schedule } = useGetDoctorAvailabilityAdmin(expandedDoctorId as any)
  const { mutate: deleteAvailability } = useAdminDeleteAvailability()

  const toggleExpand = (id: number) => {
    setExpandedDoctorId(expandedDoctorId === id ? null : id)
  }

  const refreshData = () =>
    queryClient.invalidateQueries({ queryKey: ['doctors'] })

  const resetForm = () => {
    setEditingId(null)
    setImage(null)
    setFormData({
      name_ar: '',
      name_en: '',
      email: '',
      password: '',
      specialty_id: '',
      bio_ar: '',
      bio_en: '',
      years_experience: '',
      price_from: '',
      languages: '',
      rating: '5',
    })
  }

  const startEdit = (doc: Doctor) => {
    const name = parseSafe(doc.name)
    const bio = parseSafe(doc.bio)
    setEditingId(doc.id)
    setFormData({
      name_ar: name.ar || '',
      name_en: name.en || '',
      email: '',
      password: '',
      specialty_id: doc.specialty_id?.toString() || '',
      bio_ar: bio.ar || '',
      bio_en: bio.en || '',
      years_experience: doc.years_experience?.toString() || '',
      price_from: doc.price_from?.toString() || '',
      languages: Array.isArray(doc.languages) ? doc.languages.join(',') : '',
      rating: doc.rating?.toString() || '5',
    })
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSave = () => {
    if (!formData.specialty_id || !formData.price_from) {
      alert(t('admin.fields_required') || 'التخصص والسعر مطلوبان')
      return
    }

    if (!editingId && (!formData.email || !formData.password)) {
      alert('الإيميل وكلمة السر مطلوبين لإنشاء حساب الطبيب')
      return
    }

    const data = new FormData()

    if (editingId) {
      data.append('_method', 'PUT')
    }

    data.append('name_ar', formData.name_ar)
    data.append('name_en', formData.name_en)
    data.append(
      'bio',
      JSON.stringify({ ar: formData.bio_ar, en: formData.bio_en }),
    )
    data.append('specialty_id', formData.specialty_id.toString())
    data.append('price_from', formData.price_from.toString())
    data.append('years_experience', formData.years_experience || '0')
    data.append('rating', formData.rating || '5')

    if (!editingId) {
      data.append('email', formData.email)
      data.append('password', formData.password)
    }

    const langs = formData.languages
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l !== '')
    data.append('languages', JSON.stringify(langs))
    
    if (image) {
      data.append('image', image)
    }

    const config = {
      onSuccess: () => {
        refreshData()
        resetForm()
        alert(editingId ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح')
      },
      onError: (error: any) => {
        console.error('❌ [Backend Error]:', error?.response || error)
        alert('حدث خطأ أثناء الحفظ! راجع الـ Console (F12) للتفاصيل.')
      },
    }

    if (editingId) {
      updateDoctor({ id: editingId, formData: data }, config)
    } else {
      addDoctor(data, config)
    }
  }

  const confirmDelete = (id: number) => {
    if (window.confirm(t('admin.confirm_delete') || 'هل أنت متأكد من الحذف؟')) {
      deleteDoctor(id, {
        onSuccess: () => {
          refreshData()
        },
        onError: (err: any) => {
          console.error(`❌ [DELETE Error]`, err?.response || err)
          alert('فشل الحذف، راجع الـ Console')
        },
      })
    }
  }

  const filteredDoctors = doctors?.filter((doc) =>
    filterSpecialty === 'all'
      ? true
      : doc.specialty_id?.toString() === filterSpecialty,
  )

  const getImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return '/default-doctor.png'
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || ''
    return `${baseUrl}/storage/${imagePath.replace(/^\/+/, '')}`
  }

  const getSpecialtyName = (doc: Doctor) => {
    if (doc.specialty) {
      const parsedSpecialtyName = parseSafe(doc.specialty.name)
      if (parsedSpecialtyName[currentLang]) return parsedSpecialtyName[currentLang]
      if (parsedSpecialtyName.ar) return parsedSpecialtyName.ar
      if (parsedSpecialtyName.en) return parsedSpecialtyName.en
      if (typeof doc.specialty.name === 'string') return doc.specialty.name
    }

    if (doc.specialty_id && specialties) {
      const foundSpecialty = specialties.find((s) => s.id.toString() === doc.specialty_id?.toString())
      if (foundSpecialty) {
        const parsedSpecialtyName = parseSafe(foundSpecialty.name)
        if (parsedSpecialtyName[currentLang]) return parsedSpecialtyName[currentLang]
        if (parsedSpecialtyName.ar) return parsedSpecialtyName.ar
        if (parsedSpecialtyName.en) return parsedSpecialtyName.en
        if (typeof foundSpecialty.name === 'string') return foundSpecialty.name
      }
    }

    return t('admin.not_specified') || 'غير محدد'
  }

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <div className="pt-20 px-3 sm:px-6 pb-12 w-full max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0E2A2E] flex items-center gap-3">
            <Stethoscope className="text-[#2D6A4F] shrink-0" size={32} />
            <span className="truncate">{t('admin.manage_doctors')}</span>
          </h1>
        </div>

        {/* Form Card */}
        <div ref={formRef}>
          <Card className="border-t-4 border-t-[#2D6A4F] rounded-2xl shadow-lg w-full">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl">
                {editingId ? t('admin.edit_doctor') : t('admin.add_doctor')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder={t('admin.name_ar') || 'الاسم بالعربية'}
                  value={formData.name_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                />
                <Input
                  placeholder={t('admin.name_en') || 'الاسم بالإنجليزية'}
                  value={formData.name_en}
                  onChange={(e) =>
                    setFormData({ ...formData, name_en: e.target.value })
                  }
                />
              </div>

              {!editingId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <Input
                    type="email"
                    placeholder="البريد الإلكتروني / Doctor Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <Input
                    type="password"
                    placeholder="كلمة السر / Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              )}

              <select
                className="w-full p-2.5 border rounded-lg bg-white text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                value={formData.specialty_id}
                onChange={(e) =>
                  setFormData({ ...formData, specialty_id: e.target.value })
                }
              >
                <option value="">{t('admin.select_specialty') || 'اختر التخصص'}</option>
                {specialties?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {parseSafe(s.name)[currentLang]}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-bold text-[#2D6A4F]">
                    {t('admin.bio_ar_label') || 'النبذة بالعربية'}
                  </label>
                  <Textarea
                    className="border-2 border-slate-300 focus:border-[#2D6A4F] rounded-lg min-h-[100px] w-full"
                    placeholder={t('admin.bio_ar') || 'نبذة تعريفية...'}
                    value={formData.bio_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, bio_ar: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-bold text-[#2D6A4F]">
                    {t('admin.bio_en_label') || 'النبذة بالإنجليزية'}
                  </label>
                  <Textarea
                    className="border-2 border-slate-300 focus:border-[#2D6A4F] rounded-lg min-h-[100px] w-full"
                    placeholder={t('admin.bio_en') || 'Bio...'}
                    value={formData.bio_en}
                    onChange={(e) =>
                      setFormData({ ...formData, bio_en: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder={t('admin.experience') || 'سنوات الخبرة'}
                  value={formData.years_experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      years_experience: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder={t('admin.price') || 'سعر الكشف'}
                  value={formData.price_from}
                  onChange={(e) =>
                    setFormData({ ...formData, price_from: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('admin.upload_image') || 'صورة الطبيب'}
                </label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() =>
                    document.getElementById('doctor-image-input')?.click()
                  }
                >
                  {image ? image.name : (t('admin.choose_file') || 'اختر ملفاً للصورة')}
                </Button>
                <input
                  id="doctor-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-[#2D6A4F] hover:bg-[#235840] py-5 text-base rounded-xl text-white"
                >
                  {isAdding || isUpdating ? (
                    <Loader2 className="animate-spin" />
                  ) : editingId ? (
                    t('admin.update') || 'تعديل البيانات'
                  ) : (
                    t('admin.save') || 'حفظ الطبيب'
                  )}
                </Button>

                {editingId && (
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="sm:w-auto py-5"
                  >
                    {t('admin.cancel') || 'إلغاء التعديل'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm p-4 w-full flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-bold text-[#2D6A4F] whitespace-nowrap">
            {t('filter_by_specialty') || 'فلترة حسب التخصص'}
          </label>
          <select
            className="p-2.5 border rounded-lg bg-white w-full sm:min-w-[250px] outline-none"
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
          >
            <option value="all">{t('all_specialties') || 'كل التخصصات'}</option>
            {specialties?.map((s) => (
              <option key={s.id} value={s.id.toString()}>
                {parseSafe(s.name)[currentLang]}
              </option>
            ))}
          </select>
        </div>

        {/* Doctors Listing */}
        <div className="w-full">
          {isDoctorsLoading ? (
            <div className="p-12 text-center flex justify-center items-center gap-2 bg-white rounded-2xl shadow-sm">
              <Loader2 className="animate-spin text-[#2D6A4F]" /> <span>جاري تحميل الأطباء...</span>
            </div>
          ) : filteredDoctors?.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl shadow-sm text-gray-500">
              {t('admin.no_doctors') || 'لا يوجد أطباء مضافين حالياً'}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden hidden md:block">
              <table className="w-full text-right">
                <thead className="bg-slate-100 text-[#2D6A4F]">
                  <tr>
                    <th className="px-4 py-3">{t('admin.image') || 'الصورة'}</th>
                    <th className="px-4 py-3">{t('admin.doctor') || 'الطبيب'}</th>
                    <th className="px-4 py-3">{t('admin.specialty') || 'التخصص'}</th>
                    <th className="px-4 py-3">{t('admin.bio') || 'النبذة'}</th>
                    <th className="px-4 py-3 text-center">{t('admin.actions') || 'الإجراءات'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors?.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <img
                          src={getImageUrl(doc.image)}
                          alt={parseSafe(doc.name)[currentLang]}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                      </td>
                      <td className="px-4 py-3 font-bold text-[#0E2A2E]">
                        {parseSafe(doc.name)[currentLang]}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getSpecialtyName(doc)}
                      </td>
                      <td className="px-4 py-3 max-w-[250px] truncate text-sm text-gray-500">
                        {parseSafe(doc.bio)[currentLang]}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(doc)}
                            title="تعديل"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => confirmDelete(doc.id)}
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </ProtectedLayout>
  )
}