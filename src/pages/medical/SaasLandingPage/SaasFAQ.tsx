import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function SaasFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // أول سؤال مفتوح افتراضياً

  const faqs = [
    {
      question: "ما هي مدة التجربة المجانية؟",
      answer: "تستطيع تجربة المنصة بالكامل مجاناً لمدة 30 يوماً دون الحاجة لإدخال بيانات بطاقة ائتمانية، لتتمكن من استكشاف كافة المميزات."
    },
    {
      question: "هل يمكنني ترقية أو تخفيض باقتي في أي وقت؟",
      answer: "نعم، يمكنك ترقية باقتك أو الانتقال لخطة أخرى في أي وقت بسهولة من خلال لوحة التحكم، وسيتم احتساب الفرق بشكل مرن."
    },
    {
      question: "هل البيانات الطبية آمنة على منصتكم؟",
      answer: "نعم، نطبق أعلى معايير الأمان وحماية السجلات الطبية مع تشفير كامل للبيانات وفقاً للمعايير العالمية لضمان السرية التامة."
    },
    {
      question: "هل يمكنني ربط النظام بأنظمة دفع إلكترونية أخرى؟",
      answer: "نعم، يدعم النظام التكامل مع العديد من بوابات الدفع الشهيرة لتسهيل تحصيل الكشوفات وأجور الخدمات الطبية من المرضى."
    },
    {
      question: "هل يمكن استخدام النظام على الأجهزة المحمولة؟",
      answer: "التأكيد، المنصة مصممة بتصميم متجاوب بالكامل (Responsive) يعمل بكفاءة عالية على الهواتف الذكية والأجهزة اللوحية وأجهزة الكمبيوتر."
    },
    {
      question: "كيف يمكنني الحصول على الدعم الفني؟",
      answer: "يوفر فريق الدعم الفني لدينا مساعدة متكاملة على مدار الساعة عبر الدردشة المباشرة داخل النظام أو عبر البريد الإلكتروني."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section dir="rtl" className="py-24 bg-slate-100 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* العنوان والوصف */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-teal-700 bg-teal-100 text-sm font-bold px-4 py-1.5 rounded-full inline-block mb-4">
            الأسئلة الشائعة
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            قسم مخصص للإجابة على الاستفسارات الشائعة حول خدماتنا
          </h2>
        </div>

        {/* قائمة الأسئلة */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200/80 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full py-6 px-6 text-right flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-bold text-slate-800 text-base sm:text-lg">
                    {faq.question}
                  </span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 mt-2 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}