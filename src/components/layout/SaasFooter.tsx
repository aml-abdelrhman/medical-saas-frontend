import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Heart } from 'lucide-react';

export function SaasFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer dir="rtl" className="bg-slate-950 text-white pt-20 pb-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
        
        {/* العمود الأول: الشعار والوصف */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-teal-400 tracking-tight">الشفاء</span>
            <span className="text-sm font-medium text-slate-300 mt-1.5">نظام إدارة العيادات الذكي</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            الحل الأمثل والشامل لإدارة مركزك الطبي بكفاءة عالية، بدءاً من حجز المواعيد وصولاً إلى الفواتير الإلكترونية المدعومة بالذكاء الاصطناعي. انضم لنجاح عيادتك معنا.
          </p>
          {/* أيقونات التواصل الاجتماعي */}
          <div className="flex items-center gap-4 pt-3 text-slate-500">
            <a href="#" aria-label="فيسبوك" className="hover:text-white transition-colors"><Facebook className="w-6 h-6" /></a>
            <a href="#" aria-label="تويتر" className="hover:text-white transition-colors"><Twitter className="w-6 h-6" /></a>
            <a href="#" aria-label="لينكيد إن" className="hover:text-white transition-colors"><Linkedin className="w-6 h-6" /></a>
          </div>
        </div>

        {/* العمود الثاني: روابط سريعة */}
        <div className="space-y-5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">روابط سريعة</h4>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><a href="#" className="hover:text-teal-400 transition-colors">الرئيسية</a></li>
            <li><a href="#features" className="hover:text-teal-400 transition-colors">المميزات</a></li>
            <li><a href="#pricing" className="hover:text-teal-400 transition-colors">الأسعار</a></li>
            <li><a href="#" className="hover:text-teal-400 transition-colors">تسجيل الدخول</a></li>
            <li><a href="#" className="hover:text-teal-400 transition-colors">طلب عرض توضيحي</a></li>
          </ul>
        </div>

        {/* العمود الثالث: تواصل معنا */}
        <div className="space-y-5 md:col-span-2">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">تواصل معنا</h4>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <span>الدقي، شارع التحرير، برج الأطباء، القاهرة، مصر</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <span dir="ltr">قسم المبيعات: +20 100 000 1111</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <span>sales@alshefaa.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* شريط الحقوق السفلي */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; {currentYear} جميع الحقوق محفوظة لمنصة "الشفاء".</p>
       
      </div>
    </footer>
  );
}