import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Stethoscope, Calendar, Clock, Star, LogOut } from 'lucide-react';

export const DoctorSidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const doctorId = localStorage.getItem('doctorId');

  const handleLogout = () => {
    // إزالة بيانات الاعتماد من التخزين المحلي
    localStorage.removeItem('doctorId');
    // يمكنك هنا مسح أي توكنات أخرى مثل: localStorage.removeItem('token');
    
    // التوجيه الحقيقي لصفحة تسجيل الدخول
    navigate({ to: '/login' });
  };

  return (
    <aside className="sticky top-0 start-0 h-screen w-20 md:w-64 bg-white border-e border-gray-100 shadow-sm z-50 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* الشعار */}
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-50">
          <div className="bg-[#2D6A4F] p-2 rounded-xl text-white flex-shrink-0">
            <Stethoscope size={20} />
          </div>
          <h2 className="hidden md:block ms-3 text-xl font-bold text-[#2D6A4F] truncate">
            {t('sidebar_title')}
          </h2>
        </div>

        {/* الروابط */}
        <nav className="p-3 md:p-4 space-y-2">
          <SidebarLink to="/dashboard/doctor" icon={<LayoutDashboard size={22} />} label={t('home')} />
          <SidebarLink to="/dashboard/doctor/my-services" icon={<Stethoscope size={22} />} label={t('my_services')} />
          <SidebarLink to="/dashboard/doctor/appointments" icon={<Calendar size={22} />} label={t('appointments')} />
          <SidebarLink to="/dashboard/doctor/availability" icon={<Clock size={22} />} label={t('availability')} />
          <SidebarLink to="/dashboard/doctor/reviews" icon={<Star size={22} />} label={t('my_reviews')} />
        </nav>
      </div>

      {/* زر تسجيل الخروج في الأسفل */}
      <div className="p-3 md:p-4 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-medium group/btn"
        >
          <span className="flex-shrink-0">
            <LogOut size={22} />
          </span>
          <span className="hidden md:block ms-3">{t('logout', 'تسجيل الخروج')}</span>
        </button>
      </div>
    </aside>
  );
};

function SidebarLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center p-3 rounded-xl transition-all duration-200 text-gray-500 hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F] [&.active]:bg-[#2D6A4F] [&.active]:text-white [&.active]:font-semibold"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="hidden md:block ms-3 font-medium">{label}</span>
    </Link>
  );
}