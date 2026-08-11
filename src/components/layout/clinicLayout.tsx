import React from 'react';
import { Outlet, useParams } from '@tanstack/react-router';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'sonner';
import { queryClient } from "@/lib/queryClient"; 
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { Topbar } from "@/components/layout/clinic-Topbar";
import { Footer } from "@/components/layout/clinic-Footer";
import { useClinicDetails, useClinicDoctors, useClinicSpecialties } from '@/hooks/useQuery'; // استخدمي المسار الصحيح لدوالك

export default function ClinicLayout() {
  // التقاط الـ slug الخاص بالعيادة من المسار (مثلا: /clinics/$slug/...)
  const params = useParams({ strict: false }) as { slug?: string };
  const clinicSlug = params.slug || '';

  // جلب بيانات العيادة الحالية باستخدام الـ slug
  const { data: clinic, isLoading: clinicLoading } = useClinicDetails(clinicSlug);
  
  // جلب أطباء وتخصصات هذه العيادة حصراً لتكون متاحة في البحث الفوري داخل الـ Topbar
  const { data: clinicDoctors = [] } = useClinicDoctors(clinicSlug);
  const { data: clinicSpecialties = [] } = useClinicSpecialties(clinicSlug);

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900" dir="rtl">
          
          {/* 1. شريط التنقل العلوي للعيادة مع تمرير داتا العيادة وأطبائها وتخصصاتها */}
          <Topbar 
            sidebarCollapsed={false} 
            clinic={clinic}
            doctors={clinicDoctors}
            specialties={clinicSpecialties}
            onMobileMenuToggle={() => console.log("Toggle menu")} 
          />
          
          {/* 2. نظام التنبيهات السريع */}
          <Toaster 
            richColors 
            position="top-center" 
            expand={false} 
            closeButton 
          />
          
          {/* 3. محتوى صفحات العيادة الديناميكية */}
          <main className="flex-1">
            <Outlet /> 
          </main>
          
          {/* 4. الفوتر الداخلي للعيادة مع تمرير داتا العيادة للتواصل والعنوان */}
          <Footer clinic={clinic} />

        </div>
      </LocaleProvider>
    </QueryClientProvider>
  );
}