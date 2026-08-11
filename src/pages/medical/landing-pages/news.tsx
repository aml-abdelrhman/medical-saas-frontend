"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "@tanstack/react-router";
import { Send, Phone, ShieldAlert, MessageSquare, CheckCircle2 } from "lucide-react";
import { useSendClinicContact } from "@/hooks/useQuery";

export const ClinicContactSection = () => {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const params = useParams({ strict: false }) as { slug?: string };
  const slug = params.slug || "";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [successMessage, setSuccessMessage] = useState(false);

  const { mutate: sendContact, isPending, error } = useSendClinicContact(slug);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(false);

    sendContact(formData, {
      onSuccess: () => {
        setSuccessMessage(true);
        setFormData({ name: "", phone: "", email: "", message: "" });
      },
    });
  };

  const errorMessage =
    (error as any)?.response?.data?.message ||
    t("error_sending", "حدث خطأ أثناء إرسال الرسالة، حاول مرة أخرى.");

  return (
    <section className="w-full bg-white py-12 md:py-16" dir={dir}>
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* عنوان ترويجي علوي */}
        <div className={`mb-10 ${dir === "rtl" ? "text-right" : "text-left"}`}>
          <div className="inline-flex items-center gap-2 text-[#2D6A4F] bg-[#2D6A4F]/10 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            <MessageSquare size={16} />
            <span>{t("contact_us_tag", "تواصل معنا")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0E2A2E] mb-2">
            {t("book_consultation_now", "احجز استشارتك الآن")}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            {t(
              "contact_subtitle",
              "يسعدنا تواصلك معنا والإجابة على كافة استفساراتك الطبية في أسرع وقت."
            )}
          </p>
        </div>

        {/* الحاوية الرئيسية بعرض الشاشة */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* الجانب الأول: معلومات الطوارئ والتواصل */}
          <div className="lg:col-span-5 bg-[#1B3A3A] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100M20 0v100M40 0v100M60 0v100M80 0v100' fill='none' stroke='%23ffffff' stroke-width='0.5' stroke-opacity='0.4'/%3E%3Cpath d='M25 10h10v10h10v10H35v10H25V30H15V20h10z' fill='%23ffffff' fill-opacity='0.3'/%3E%3Cpath d='M65 50h15v15h15v15H80v15H65V80H50V65h15z' fill='%23ffffff' fill-opacity='0.25'/%3E%3C/svg%3E")`,
                backgroundSize: "120px 120px",
              }}
            ></div>

            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-black mb-4 text-white">
                {t("have_special_inquiry", "هل لديك استفسار خاص لهذه العيادة؟")}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-8">
                {t(
                  "inquiry_desc",
                  "قم بإرسال رسالتك وسيتواصل معك فريق الدعم الخاص بالعيادة في أسرع وقت ممكن للرد على كافة استفساراتك."
                )}
              </p>
            </div>

            <div className="relative z-10 space-y-6 text-sm">
              <div className="flex items-start gap-4 text-gray-200">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#52B788] shrink-0 border border-white/10">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <span className="block font-bold text-white text-base mb-0.5">
                    {t("emergency_call", "الاتصال في حالات الطوارئ")}
                  </span>
                  <span className="text-[#52B788] font-semibold">
                    {t("emergency_number", "اتصال 24/7: 19343")}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4 text-gray-200">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#52B788] shrink-0 border border-white/10">
                  <Phone size={22} />
                </div>
                <div>
                  <span className="block font-bold text-white text-base mb-0.5">
                    {t("primary_phone", "رقم الهاتف الأساسي")}
                  </span>
                  <span className="text-gray-300" dir="ltr">
                    {t("working_hours_phone", "خلال ساعات العمل: +201024439000")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* الجانب الثاني: نموذج الإرسال */}
          <div className="lg:col-span-7 p-8 md:p-12 bg-white">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                <span className="text-sm font-bold">
                  {t(
                    "success_message_sent",
                    "تم إرسال رسالتك إلى العيادة بنجاح! سنتواصل معك قريباً."
                  )}
                </span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* حقل الاسم */}
              <div>
                <label className="block text-xs font-bold text-[#0E2A2E] mb-2">
                  {t("form_name_label", "الاسم (مطلوب)")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t("form_name_placeholder", "ادخل اسمك الكامل")}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none text-sm text-gray-800 transition-all"
                />
              </div>

              {/* حقل البريد الإلكتروني */}
              <div>
                <label className="block text-xs font-bold text-[#0E2A2E] mb-2">
                  {t("form_email_label", "البريد الإلكتروني (مطلوب)")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none text-sm text-gray-800 transition-all"
                  dir="ltr"
                />
              </div>

              {/* حقل رقم الهاتف */}
              <div>
                <label className="block text-xs font-bold text-[#0E2A2E] mb-2">
                  {t("form_phone_label", "رقم هاتفك")}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="01xxxxxxxx"
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none text-sm text-gray-800 transition-all"
                  dir="ltr"
                />
              </div>

              {/* حقل رسالتك */}
              <div>
                <label className="block text-xs font-bold text-[#0E2A2E] mb-2">
                  {t("form_message_label", "رسالتك")}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder={t(
                    "form_message_placeholder",
                    "اكتب استفسارك أو رسالتك هنا..."
                  )}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none text-sm text-gray-800 transition-all resize-none"
                ></textarea>
              </div>

              {/* زر الإرسال */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-[#2D6A4F] text-white rounded-xl font-bold hover:bg-[#1B3A3A] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-base"
              >
                {isPending ? (
                  <span>{t("sending_in_progress", "جاري الإرسال...")}</span>
                ) : (
                  <>
                    <Send size={18} className={dir === "rtl" ? "rotate-180" : ""} />
                    <span>{t("send_message_btn", "إرسال الرسالة للعيادة")}</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};