'use client';
import { useTranslation } from 'react-i18next';
import { useGetAdminContactMessages, useDeleteContactMessage } from '@/hooks/useQuery';
import { toast } from 'sonner';
import { Trash2, Loader2, Mail, Phone, User, MessageSquare, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";


export default function Messages() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language; 

  const { data: response, isLoading } = useGetAdminContactMessages();
  
  // استخراج المصفوفة بأمان سواء كانت البيانات مباشرة أو داخل response.data أو response.messages
  const messages = Array.isArray(response) 
    ? response 
    : response?.data || response?.messages || [];

  const { mutate: deleteMessage, isPending } = useDeleteContactMessage();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t("confirm_delete_message", "هل أنت متأكد من حذف هذه الرسالة؟"))) {
      deleteMessage(id);
    }
  };

  return (
    <div className="pt-24 px-4 sm:px-6 pb-12 max-w-7xl mx-auto w-full" dir={t("dir", "rtl")}>
      {/* عنوان الصفحة */}
      <div className="flex items-center gap-3 mb-8 border-b pb-6">
        <MessageSquare className="text-[#1B3A3A]" size={32} />
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B3A3A]">
          {t("contact_messages", "رسائل اتصل بنا")}
        </h1>
      </div>
      
      {/* حالة التحميل */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="animate-spin text-[#2D6A4F]" size={40} />
        </div>
      ) : messages.length === 0 ? (
        /* حالة عدم وجود رسائل */
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-400 font-medium">
          {t("no_contact_messages", "لا توجد رسائل تواصل حالياً")}
        </div>
      ) : (
        <>
          {/* العرض للشاشات الكبيرة (Desktop Table) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse" style={{ direction: currentLang === 'ar' ? 'rtl' : 'ltr' }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-sm font-bold">
                    <th className="py-4 px-6">{t("sender", "المرسل")}</th>
                    <th className="py-4 px-6">{t("phone", "رقم الهاتف")}</th>
                    <th className="py-4 px-6">{t("email", "البريد الإلكتروني")}</th>
                    <th className="py-4 px-6">{t("message_content", "محتوى الرسالة")}</th>
                    <th className="py-4 px-6">{t("date_time", "التاريخ والوقت")}</th>
                    <th className="py-4 px-6 text-center">{t("actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {messages.map((msg: any) => (
                    <tr key={msg.id} className="hover:bg-slate-50/80 transition-colors align-top">
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-slate-400 shrink-0" />
                          <span>{msg.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800 whitespace-nowrap" style={{ direction: 'ltr', textAlign: currentLang === 'ar' ? 'right' : 'left' }}>
                        <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                          <Phone size={14} className="text-[#2D6A4F] shrink-0" />
                          <span>{msg.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail size={14} className="text-blue-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{msg.email || '---'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700 max-w-xs" title={msg.message}>
                        <p className="line-clamp-2">{msg.message}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap text-xs">
                        {formatDate(msg.created_at)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          onClick={() => handleDelete(msg.id)}
                          disabled={isPending}
                          title={t("delete", "حذف")}
                        >
                          {isPending ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* العرض للشاشات الصغيرة والمتوسطة (Mobile Cards Stack) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {messages.map((msg: any) => (
              <div key={msg.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#1B3A3A] font-bold shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{msg.name}</h3>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 shrink-0"
                    onClick={() => handleDelete(msg.id)}
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-3 border-t border-slate-100 text-sm">
                  <div className="flex items-center gap-2 text-slate-700" style={{ direction: 'ltr', justifyContent: currentLang === 'ar' ? 'flex-end' : 'flex-start' }}>
                    <span className="text-slate-500 text-xs font-medium">{t("phone", "الهاتف")}:</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      <Phone size={14} className="text-[#2D6A4F]" />
                      {msg.phone}
                    </span>
                  </div>
                  {msg.email && (
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 text-xs font-medium">{t("email", "البريد")}:</span>
                      <span className="font-medium text-blue-600 flex items-center gap-1 truncate max-w-[200px]">
                        <Mail size={14} />
                        {msg.email}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-slate-700 text-sm border border-slate-100">
                  <span className="block text-xs font-bold text-slate-400 mb-1">{t("message", "الرسالة")}:</span>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}