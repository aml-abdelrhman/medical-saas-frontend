import React from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Stethoscope, Star, Users, Home, UserCog, Microscope, ClipboardList, LogOut, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'

export const AdminSidebar = () => {
  const { i18n } = useTranslation()

  const handleLogout = async () => {
    try {
      const apiBaseUrl = process.env.VITE_API_BASE_URL || "http://localhost:8000/api";
      
      await fetch(`${apiBaseUrl}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("telehealth-auth");
      
      window.location.href = "/login";
    }
  };

  const navLinks = [
    { to: "/dashboard/admin", label: 'الرئيسية', icon: <Home size={20} /> },
    { to: "/dashboard/admin/users", label: 'إدارة المستخدمين', icon: <Users size={20} /> },
    { to: "/dashboard/admin/doctors", label: 'إدارة الأطباء', icon: <UserCog size={20} /> },
    { to: "/dashboard/admin/specialties", label: 'التخصصات', icon: <Microscope size={20} /> },
    { to: "/dashboard/admin/services", label: 'الخدمات', icon: <Stethoscope size={20} /> },
    { to: "/dashboard/admin/appointments", label: 'الحجوزات', icon: <ClipboardList size={20} /> },
    { to: "/dashboard/admin/reviews", label: 'التقييمات', icon: <Star size={20} /> },
    { to: "/dashboard/admin/contact-messages", label: 'رسائل التواصل', icon: <MessageSquare size={20} /> },
  ]

  return (
    <aside className="fixed right-0 h-screen bg-[#0E2A2E] text-white p-2 md:p-4 w-20 md:w-64 transition-all duration-300 z-40 border-slate-700 border-l flex flex-col shadow-lg justify-between pt-20 md:pt-24" dir="rtl">
      <div className="overflow-y-auto flex-1 flex flex-col justify-between">
        <div>
          <h2 className="hidden md:block text-lg font-bold mb-6 text-center text-[#A7C957] tracking-wide">
            لوحة تحكم المدير
          </h2>

          {/* روابط التنقل */}
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/dashboard/admin" }}
                className="flex items-center gap-3 p-3 hover:bg-[#2D6A4F] rounded-xl transition-all duration-200 [&.active]:bg-[#2D6A4F] [&.active]:font-semibold"
              >
                <div className="mx-auto md:mx-0 shrink-0">{link.icon}</div>
                <span className="hidden md:block font-medium truncate">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* زر تسجيل الخروج مباشرة بعد الـ Links في أسفل القائمة */}
        <div className="pt-4 pb-4 border-t border-slate-700/60 mt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 cursor-pointer shadow-md font-semibold"
          >
            <div className="mx-auto md:mx-0 shrink-0">
              <LogOut size={20} />
            </div>
            <span className="hidden md:block truncate">
              تسجيل الخروج
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}