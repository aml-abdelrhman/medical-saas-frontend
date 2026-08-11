'use client'

import React, { useState } from 'react'
import { useGetUsers, useUpdateUserRole, useDeleteUser, useAddUser } from '@/hooks/useQuery'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Trash2, Loader2, UserCog, Mail, UserPlus, Shield, Stethoscope, Users as UsersIcon } from 'lucide-react'

const text = {
  name: "الاسم",
  email: "البريد الإلكتروني",
  role: "الصلاحية",
  patient: "مريض",
  doctor: "طبيب",
  admin: "مدير النظام",
  manage_users: "إدارة المستخدمين",
  actions: "الإجراءات",
  confirm_delete_user: "هل أنت متأكد من حذف هذا المستخدم؟",
  add_user: "إضافة مستخدم جديد",
  password: "كلمة المرور",
  save: "حفظ",
  cancel: "إلغاء",
  doctors_section: "الأطباء",
  admins_section: "مديرو النظام",
  patients_section: "المرضى",
  no_users: "لا توجد مستخدمين في هذا القسم",
  name_placeholder: "أدخل الاسم الكامل"
};

const RoleSelect = ({ user, handleRoleChange }: { user: any, handleRoleChange: any }) => (
  <Select value={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
    <SelectTrigger className="w-full sm:w-[150px] border-[#2D6A4F]/20 focus:ring-[#2D6A4F] text-right">
      <SelectValue placeholder={text[user.role as keyof typeof text]} />
    </SelectTrigger>
    <SelectContent className="bg-white border-slate-200 shadow-xl text-right">
      <SelectItem value="patient">{text.patient}</SelectItem>
      <SelectItem value="doctor">{text.doctor}</SelectItem>
      <SelectItem value="admin">{text.admin}</SelectItem>
    </SelectContent>
  </Select>
)

export default function AdminUsersDashboard() {
  const { data: users, isLoading, refetch } = useGetUsers()
  const { mutate: updateRole } = useUpdateUserRole()
  const { mutate: deleteUser } = useDeleteUser()
  const { mutate: addUser, isPending: isAdding } = useAddUser()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'doctor' })

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRole({ id: userId, role: newRole }, { onSuccess: () => refetch() })
  }

  const handleDelete = (userId: number) => {
    if (window.confirm(text.confirm_delete_user)) {
      deleteUser(userId, { onSuccess: () => refetch() })
    }
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    addUser(formData, {
      onSuccess: () => {
        setIsAddOpen(false)
        setFormData({ name: '', email: '', password: '', role: 'doctor' })
        refetch()
      }
    })
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen" dir="rtl">
      <Loader2 className="animate-spin h-10 w-10 text-[#2D6A4F]" />
    </div>
  )

  // تصفية المستخدمين حسب الصلاحية
  const doctors = users?.filter((u: any) => u.role === 'doctor') || []
  const admins = users?.filter((u: any) => u.role === 'admin') || []
  const patients = users?.filter((u: any) => u.role === 'patient') || []

  return (
    <div dir="rtl" className="p-4 sm:p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen text-right">
      
      {/* رأس الصفحة وزر الإضافة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <UserCog className="text-[#2D6A4F]" size={32} />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0E2A2E]">{text.manage_users}</h1>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white gap-2 rounded-xl shadow-md">
              <UserPlus size={18} />
              {text.add_user}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-3xl p-6 max-w-md text-right" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle className="text-xl font-bold text-[#0E2A2E]">{text.add_user}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">{text.name}</label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder={text.name_placeholder}
                  className="text-right"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">{text.email}</label>
                <Input 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="name@example.com"
                  className="text-right"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">{text.password}</label>
                <Input 
                  type="password" 
                  required 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  placeholder="******"
                  className="text-right"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">{text.role}</label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                  <SelectTrigger className="w-full text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-right">
                    <SelectItem value="doctor">{text.doctor}</SelectItem>
                    <SelectItem value="admin">{text.admin}</SelectItem>
                    <SelectItem value="patient">{text.patient}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="mt-6 flex gap-2 sm:justify-start">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                  {text.cancel}
                </Button>
                <Button type="submit" disabled={isAdding} className="bg-[#2D6A4F] text-white rounded-xl">
                  {isAdding && <Loader2 className="animate-spin h-4 w-4 ms-2" />}
                  {text.save}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* أقسام المستخدمين */}
      <div className="space-y-10">
        
        {/* قسم المرضى */}
        <UserSection 
          title={text.patients_section} 
          icon={<UsersIcon className="text-[#2D6A4F]" size={22} />} 
          users={patients} 
          handleRoleChange={handleRoleChange} 
          handleDelete={handleDelete} 
        />

        {/* قسم المديرين */}
        <UserSection 
          title={text.admins_section} 
          icon={<Shield className="text-[#2D6A4F]" size={22} />} 
          users={admins} 
          handleRoleChange={handleRoleChange} 
          handleDelete={handleDelete} 
        />

        {/* قسم الأطباء */}
        <UserSection 
          title={text.doctors_section} 
          icon={<Stethoscope className="text-[#2D6A4F]" size={22} />} 
          users={doctors} 
          handleRoleChange={handleRoleChange} 
          handleDelete={handleDelete} 
        />

      </div>
    </div>
  )
}

function UserSection({ title, icon, users, handleRoleChange, handleDelete }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {icon}
        <h2 className="text-xl font-bold text-[#0E2A2E]">{title}</h2>
        <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{users.length}</span>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-gray-400 italic bg-white p-4 rounded-xl border border-slate-100">{text.no_users}</p>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {users.map((user: any) => (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#0E2A2E] text-base">{user.name}</p>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1" dir="ltr">
                      <Mail size={12} />
                      <span className="break-all">{user.email}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-rose-500 hover:bg-rose-50 rounded-full h-8 w-8 p-0">
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-400 mb-1 block">{text.role}</label>
                  <RoleSelect user={user} handleRoleChange={handleRoleChange} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#2D6A4F] text-white text-sm">
                    <th className="p-4 font-semibold">{text.name}</th>
                    <th className="p-4 font-semibold">{text.email}</th>
                    <th className="p-4 font-semibold">{text.role}</th>
                    <th className="p-4 font-semibold text-center">{text.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all text-sm">
                      <td className="p-4 font-medium text-[#0E2A2E]">{user.name}</td>
                      <td className="p-4 text-gray-600" dir="ltr">{user.email}</td>
                      <td className="p-4"><RoleSelect user={user} handleRoleChange={handleRoleChange} /></td>
                      <td className="p-4 text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-rose-500 hover:bg-rose-50 rounded-full">
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}