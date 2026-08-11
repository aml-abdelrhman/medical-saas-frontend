'use client';
import { useTranslation } from 'react-i18next';
import { useGetAdminAppointments, useDeleteAdminAppointment } from '@/hooks/useQuery';
import { toast } from 'sonner';
import { Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function AdminAppointments() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language; 

  const { data: response, isLoading } = useGetAdminAppointments();
  
  const appointments = Array.isArray(response) 
    ? response 
    : response?.data || response?.appointments || [];

  const { mutate: deleteAppointment, isPending } = useDeleteAdminAppointment();

  const parseName = (field: any) => {
    if (!field) return "---";
    if (typeof field === 'object' && field !== null) {
      return field[currentLang] || field.ar || field.en || "---";
    }
    return field;
  };

  const formatDate = (dateString: string) => dateString?.split('T')[0] || "";

  const handleDelete = (id: number) => {
    if (window.confirm(t("confirm_delete", "هل أنت متأكد من حذف هذا الحجز؟"))) {
      deleteAppointment(id, {
        onSuccess: () => toast.success(t("delete_success", "تم حذف الحجز بنجاح")),
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message || t("delete_error", "فشل حذف الحجز");
          toast.error(errorMessage);
        }
      });
    }
  };

  return (
    <div className="pt-24 px-4 sm:px-6 pb-12 max-w-7xl mx-auto w-full" dir={t("dir", "rtl")}>
      <div className="flex items-center gap-3 mb-8 border-b pb-6">
        <ShieldCheck className="text-[#1B3A3A]" size={32} />
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B3A3A]">
          {t("appointments", "إدارة الحجوزات")}
        </h1>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-sm font-bold">
                <th className="py-4 px-6">{t("patient", "المريض")}</th>
                <th className="py-4 px-6">{t("doctor", "الطبيب")}</th>
                <th className="py-4 px-6">{t("service", "الخدمة")}</th>
                <th className="py-4 px-6">{t("date", "التاريخ")}</th>
                <th className="py-4 px-6 text-center">{t("actions", "الإجراءات")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="flex justify-center items-center">
                      <Loader2 className="animate-spin text-[#2D6A4F]" size={40} />
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400 font-medium">
                    {t("no_appointments", "لا توجد حجوزات حالياً")}
                  </td>
                </tr>
              ) : (
                appointments.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {parseName(app.patient?.name)}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {parseName(app.doctor?.name)}
                    </td>
                    <td className="py-4 px-6 text-blue-600 font-medium">
                      {parseName(app.service?.name)}
                    </td>
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                      {formatDate(app.appointment_date)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                        onClick={() => handleDelete(app.id)}
                        disabled={isPending}
                        title={t("delete", "حذف")}
                      >
                        {isPending ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}