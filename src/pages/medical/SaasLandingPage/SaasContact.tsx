import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useSendContactMessage } from '@/hooks/useQuery';

export function SaasContact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [successMessage, setSuccessMessage] = useState(false);

  // استخدام الـ mutation المربوط بالباك إند
  const { mutate, isPending, error } = useSendContactMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    mutate(formData, {
      onSuccess: () => {
        setSuccessMessage(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        
        // إخفاء رسالة النجاح بعد 5 ثوانٍ
        setTimeout(() => {
          setSuccessMessage(false);
        }, 5000);
      },
    });
  };

  return (
    <section dir="rtl" className="py-20 sm:py-24 relative overflow-hidden bg-slate-900 text-slate-900">
      
      {/* صورة الخلفية المحلية مع طبقة التعتيم */}
      <div 
        className="absolute inset-0 z-0 bg-cover sm:bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/contact.jpg")`,
        }}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* عنوان القسم */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-teal-800 bg-white/90 backdrop-blur-md text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-full inline-block mb-4 shadow-sm border border-white/40">
            تواصل معنا
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md leading-tight">
            نحن هنا للإجابة على استفساراتك ومساعدتك في تطوير عيادتك
          </h2>
          <p className="text-slate-200 text-xs sm:text-base leading-relaxed font-medium drop-shadow">
            فريق الدعم والمبيعات مستعد دائماً للرد على أسئلتك وتقديم العون المناسب لاحتياجات مركزك الطبي.
          </p>
        </div>

        {/* محتوى النموذج ومعلومات الاتصال */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-stretch">
          
          {/* معلومات الاتصال */}
          <div className="lg:col-span-1 flex flex-col justify-between space-y-6">
            <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/40 shadow-2xl space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">معلومات الاتصال</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 shadow-inner">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">اتصل بنا مباشرة</h4>
                      <p className="text-slate-600 text-sm mt-1 font-semibold" dir="ltr">+20 100 000 0000</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 shadow-inner">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">البريد الإلكتروني</h4>
                      <p className="text-slate-600 text-sm mt-1 font-semibold break-all">support@alshefaa.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 shadow-inner">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">العنوان</h4>
                      <p className="text-slate-600 text-sm mt-1 font-semibold">القاهرة، مصر</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-teal-800 text-white p-5 sm:p-6 rounded-2xl shadow-md mt-6 border border-teal-700/50">
                <h4 className="text-sm sm:text-base font-bold mb-1">ساعات العمل</h4>
                <p className="text-teal-100 text-xs leading-relaxed font-medium">
                  فريق الدعم الفني متواجد لمساعدتك طوال أيام الأسبوع على مدار 24 ساعة.
                </p>
              </div>
            </div>
          </div>

          {/* نموذج الإرسال */}
          <div className="lg:col-span-2 bg-white/95 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-white/40 shadow-2xl flex flex-col justify-between">
            {successMessage ? (
              <div className="py-16 text-center space-y-4 my-auto">
                <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">تم إرسال رسالتك بنجاح!</h3>
                <p className="text-slate-600 max-w-md mx-auto text-sm font-medium">
                  شكراً لتواصلك معنا. سيقوم أحد ممثلي خدمة العملاء بالرد عليك في أقرب وقت ممكن.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">أرسل لنا رسالة</h3>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>حدث خطأ أثناء إرسال الرسالة. يرجى التأكد من صحة المدخلات والمحاولة مرة أخرى.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="أدخل اسمك هنا"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+20 100 000 0000"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm text-slate-800 font-medium"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">الرسالة أو الاستفسار</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="اكتب تفاصيل استفسارك أو طلبك هنا..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm text-slate-800 font-medium resize-none"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 bg-teal-700 text-white font-bold rounded-2xl shadow-lg hover:bg-teal-800 transition-all flex items-center justify-center gap-2 text-sm mt-2 border border-teal-600/50 cursor-pointer disabled:opacity-70"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}