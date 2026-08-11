import { Outlet } from '@tanstack/react-router';
// استيردي هنا الـ Navbar والـ Footer الخاصين بالساس فقط
 import { SaasNavbar } from "@/components/layout/SaasNavbar";
 import { SaasFooter } from "@/components/layout/SaasFooter";

export default function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <SaasNavbar />
      
      <main className="flex-1">
        <Outlet />
      </main>

      <SaasFooter />
    </div>
  );
}