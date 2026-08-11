import React from 'react';
import { ShieldCheck, Cpu, BarChart3, Users, Headphones } from 'lucide-react';

export function SaasFeatures() {
  const features = [
    {
      id: 'ai-analysis',
      icon: <Cpu className="w-6 h-6 text-teal-600" />,
      title: "ذكاء اصطناعي متطور",
      description: "تحليل دقيق لحالات المرضى ومساعدة الأطباء في اتخاذ القرارات العلاجية بسرعة وسهولة.",
    },
    {
      id: 'smart-booking',
      icon: <CalendarCheckIcon className="w-6 h-6 text-teal-600" />,
      title: "إدارة المواعيد بذكاء",
      description: "نظام حجز آلي يقلل من نسبة التخلف عن المواعيد ويرسل تذكيرات ذكية للمرضى عبر الرسائل.",
    },
    {
      id: 'reports',
      icon: <BarChart3 className="w-6 h-6 text-teal-600" />,
      title: "تقارير وإحصائيات شاملة",
      description: "لوحة تحكم تعرض لك الإيرادات، الأداء، وحركة المرضى اليومية والشهرية بدقة متناهية.",
    },
    {
      id: 'security',
      icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
      title: "أمان عالي وسرية تامة",
      description: "حماية كاملة لبيانات السجلات الطبية للمرضى وفقاً لأعلى معايير الأمان العالمية.",
    },
    {
      id: 'staff-management',
      icon: <Users className="w-6 h-6 text-teal-600" />,
      title: "إدارة فريق العمل والأطباء",
      description: "تنظيم صلاحيات الدخول، جداول المناوبات، وحساب نسب الأطباء والخدمات بكل سهولة.",
    },
    {
      id: 'support',
      icon: <Headphones className="w-6 h-6 text-teal-600" />,
      title: "دعم فني على مدار الساعة",
      description: "فريق دعم متخصص جاهز لمساعدتك في أي وقت لضمان سير عمل عيادتك دون توقف.",
    }
  ];

  return (
    <section id="features" dir="rtl" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:32px_32px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="bg-teal-100 text-teal-800 text-sm font-bold px-4 py-1.5 rounded-full inline-block mb-4">
            لماذا تختار منصتنا؟
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            مميزات احترافية ترفع كفاءة عيادتك الطبية
          </h2>
          <p className="text-lg text-slate-600">
            صُممت منصتنا خصيصاً لتلبية احتياجات الأطباء والمراكز الطبية الحديثة لتقديم تجربة استثنائية للمرضى.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col justify-start group hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                  {React.cloneElement(feature.icon, { className: "w-6 h-6 text-teal-600 group-hover:text-white transition-colors" })}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CalendarCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path fill="none" d="m9 16 2 2 4-4" />
    </svg>
  );
}