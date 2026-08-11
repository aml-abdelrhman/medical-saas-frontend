import { AdminSidebar } from "./AdminSidebar";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen" dir="rtl">
      {/* الـ Sidebar مثبت في اليمين */}
      <AdminSidebar />
      
      {/* مساحة للمحتوى من جهة اليمين لتتناسب مع وجود السايدبار في اليمين */}
      <main className="flex-1 p-4 md:p-8 bg-gray-50 min-h-screen transition-all duration-300 pr-20 md:pr-64">
        {children}
      </main>
    </div>
  );
};