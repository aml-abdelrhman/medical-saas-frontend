'use client'

import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import {
  useGetSpecialtiesforadmin,
  useAddSpecialty,
  useDeleteSpecialty,
  useUpdateSpecialty,
} from '@/hooks/useQuery'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Trash2,
  Edit2,
  Loader2,
  Stethoscope,
  Image as ImageIcon,
} from 'lucide-react'
import type { Specialty } from '@/hooks/useQuery'
import { toast } from 'sonner'

export default function AdminSpecialtiesDashboard() {
  const { t } = useTranslation()
  const formRef = useRef<HTMLDivElement>(null)

  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [slug, setSlug] = useState('')
  const [descAr, setDescAr] = useState('')
  const [descEn, setDescEn] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: specialties } = useGetSpecialtiesforadmin()
  const { mutate: addSpecialty, isPending: isAdding } = useAddSpecialty()
  const { mutate: deleteSpecialty } = useDeleteSpecialty()
  const { mutate: updateSpecialty, isPending: isUpdating } =
    useUpdateSpecialty()

  const clearForm = () => {
    setNameAr('')
    setNameEn('')
    setSlug('')
    setDescAr('')
    setDescEn('')
    setImage(null)
  }


  const handleSave = () => {
    if (!nameAr || !nameEn || !slug || !descAr || !descEn) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (!clinicId) {
      toast.error('رقم العيادة غير متوفر للمستخدم الحالي')
      return
    }

    const formData = new FormData()
    formData.append('name[ar]', nameAr)
    formData.append('name[en]', nameEn)
    formData.append('slug', slug)
    formData.append('description[ar]', descAr)
    formData.append('description[en]', descEn)
    formData.append('clinic_id', String(clinicId))

    // إذا كنتِ ترين إرسالها كـ POST صريحة حتى في حال التعديل:
    // يمكنك إزالة _method أو جعلها POST للرابط الخاص بالتحديث
    if (editingId) {
      formData.append('_method', 'POST') // أو إزالتها بحسب ما يستقبله الـ Route في لارافل
    }

    if (image instanceof File) {
      formData.append('image', image)
    }

    if (editingId) {
      // إذا كان الـ Route في الباك إند مسجلاً كـ POST للتعديل
      updateSpecialty(
        { id: editingId, formData },
        {
          onSuccess: () => {
            setEditingId(null)
            clearForm()
            toast.success('تم تحديث التخصص بنجاح')
          },
        },
      )
    } else {
      addSpecialty(formData, {
        onSuccess: () => {
          clearForm()
          toast.success('تمت إضافة التخصص بنجاح')
        },
      })
    }
  }

  const startEdit = (s: Specialty) => {
    setEditingId(s.id)
    setNameAr(s.name?.ar || '')
    setNameEn(s.name?.en || '')
    setSlug(s.slug || '')
    setDescAr(s.description?.ar || '')
    setDescEn(s.description?.en || '')
    setImage(null)
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const confirmDelete = async (id: number) => {
    const isConfirmed = window.confirm(t('confirm_delete') || 'هل أنت متأكد من الحذف؟')
    if (!isConfirmed) return

    try {
      await new Promise((resolve, reject) => {
        deleteSpecialty(
          { id },
          {
            onSuccess: resolve,
            onError: reject,
          },
        )
      })
      toast.success('تم الحذف بنجاح')
    } catch (error: any) {
      if (error.response?.status === 409) {
        const forceDelete = window.confirm(
          'تنبيه: هذا التخصص مرتبط بأطباء! هل تريد الحذف الإجباري؟',
        )

        if (forceDelete) {
          deleteSpecialty(
            { id, force: true },
            {
              onSuccess: () => toast.success('تم حذف التخصص والأطباء بنجاح'),
              onError: () => toast.error('فشل الحذف الإجباري'),
            },
          )
        }
      } else {
        toast.error('حدث خطأ أثناء الحذف')
      }
    }
  }

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <div className="pt-24 px-4 sm:px-6 pb-8 w-full max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
        <h1 className="text-2xl sm:text-4xl font-black text-[#0E2A2E] flex items-center gap-3">
          <Stethoscope className="text-[#2D6A4F]" size={32} />{' '}
          {t('admin.manage_specialties')}
        </h1>

        <div ref={formRef}>
          <Card className="rounded-2xl border-t-4 border-t-[#2D6A4F] shadow-lg">
            <CardHeader>
              <CardTitle>
                {editingId ? t('admin.edit') : t('admin.add')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Section */}
              <div className="space-y-2">
                <label className="font-bold text-sm text-[#2D6A4F]">
                  {t('admin.name_label')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder={t('admin.name_ar')}
                  />
                  <Input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder={t('admin.name_en')}
                  />
                </div>
              </div>

              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t('admin.slug')}
              />

              {/* Description Section */}
              <div className="space-y-2">
                <label className="font-bold text-sm text-[#2D6A4F]">
                  {t('admin.desc_label')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Textarea
                    className="border-2 border-slate-300 focus:border-[#2D6A4F] focus:ring-[#2D6A4F] rounded-lg min-h-[120px]"
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    placeholder={t('admin.desc_ar')}
                  />
                  <Textarea
                    className="border-2 border-slate-300 focus:border-[#2D6A4F] focus:ring-[#2D6A4F] rounded-lg min-h-[120px]"
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    placeholder={t('admin.desc_en')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm text-[#2D6A4F] flex items-center gap-2">
                  <ImageIcon size={16} />
                  {t('admin.image_label')}
                </label>

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                  >
                    {t('admin.choose_file')}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {image
                      ? t('admin.file_selected')
                      : t('admin.no_file_chosen')}
                  </span>
                </div>

                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isAdding || isUpdating}
                  className="w-full bg-[#2D6A4F] hover:bg-[#23533d] py-6 text-lg rounded-xl"
                >
                  {isAdding || isUpdating ? (
                    <Loader2 className="animate-spin" />
                  ) : editingId ? (
                    t('admin.update')
                  ) : (
                    t('admin.save')
                  )}
                </Button>

                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      clearForm()
                    }}
                    className="py-6 text-lg rounded-xl"
                  >
                    إلغاء
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-right hidden md:table">
            <thead className="bg-slate-100 text-[#2D6A4F]">
              <tr>
                <th className="px-6 py-4">{t('admin.image')}</th>
                <th className="px-6 py-4">{t('admin.specialty')}</th>
                <th className="px-6 py-4 text-center">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {specialties?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <img
                      src={
                        s.image?.startsWith('http')
                          ? s.image
                          : `http://localhost:8000/storage/${s.image}`
                      }
                      className="w-12 h-12 rounded-lg object-cover"
                      alt={s.name?.ar}
                    />
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {s.name?.ar} / {s.name?.en}
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(s)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-500 hover:text-rose-700"
                      onClick={() => confirmDelete(s.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="md:hidden p-4 space-y-3">
            {specialties?.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      s.image?.startsWith('http')
                        ? s.image
                        : `http://localhost:8000/storage/${s.image}`
                    }
                    className="w-12 h-12 rounded-lg object-cover"
                    alt={s.name?.ar}
                  />
                  <div>
                    <div className="font-bold">{s.name?.ar}</div>
                    <div className="text-xs text-gray-500">{s.name?.en}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(s)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-500"
                    onClick={() => confirmDelete(s.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}