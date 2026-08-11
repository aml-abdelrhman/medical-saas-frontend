'use client';

import React from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useGetAdminStats } from "@/hooks/useQuery";
import { CheckCircle2, TrendingUp, Activity, AlertCircle } from "lucide-react";

type StatKey = "doctors" | "services" | "appointments" | "reviews";

const STAT_META: Record<
  StatKey,
  { accent: string; accentSoft: string; gradient: string }
> = {
  doctors:      { accent: "#2D6A4F", accentSoft: "rgba(45,106,79,0.08)", gradient: "from-[#2D6A4F] to-[#52B788]" },
  services:     { accent: "#1B4332", accentSoft: "rgba(27,67,50,0.08)", gradient: "from-[#1B4332] to-[#2D6A4F]" },
  appointments: { accent: "#C98A2C", accentSoft: "rgba(201,138,44,0.10)", gradient: "from-[#C98A2C] to-[#E9C46A]" },
  reviews:      { accent: "#7C6A46", accentSoft: "rgba(124,106,70,0.08)", gradient: "from-[#7C6A46] to-[#A39171]" },
};

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const { data: statsData, isLoading, isError } = useGetAdminStats();

  const stats: { key: StatKey; label: string; value: number }[] = [
    {
      key: "doctors",
      label: t("admin.dashboard.totalDoctors", { defaultValue: "إجمالي الأطباء" }),
      value: statsData?.total_doctors || 0,
    },
    {
      key: "services",
      label: t("admin.dashboard.totalServices", { defaultValue: "الخدمات المتاحة" }),
      value: statsData?.total_services || 0,
    },
    {
      key: "appointments",
      label: t("admin.dashboard.newAppointments", { defaultValue: "المواعيد الجديدة" }),
      value: statsData?.new_orders || 0,
    },
    {
      key: "reviews",
      label: t("admin.dashboard.totalReviews", { defaultValue: "التقييمات" }),
      value: statsData?.total_reviews || 0,
    },
  ];

  const rawChartData = statsData?.chart_data || [];
  const chartData = rawChartData.length === 1 
    ? [{ date: "", count: 0 }, ...rawChartData] 
    : rawChartData;

  const newOrdersCount = statsData?.new_orders || 0;
  const dailyTarget = 20;
  const progressPercentage = Math.min(Math.round((newOrdersCount / dailyTarget) * 100), 100);
  
  const radius = 70;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div
      dir="rtl"
      className="min-h-screen p-4 sm:p-6 md:p-10 lg:p-12 transition-colors duration-300 text-right"
      style={{ backgroundColor: "#F4F7F5" }}
    >
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        
        {/* ===== رأس الصفحة ===== */}
        <header className="space-y-4 bg-white p-6 md:p-8 rounded-3xl border border-[#E4EBE7] shadow-[0_2px_12px_rgba(15,30,27,0.02)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
                <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#2D6A4F]">
                  {t("admin.dashboard.eyebrow", { defaultValue: "العمليات التشغيلية للعيادة" })}
                </p>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-[2.25rem] font-black tracking-tight text-[#0F1E1B]">
                {t("admin.dashboard.title", { defaultValue: "لوحة تحكم العيادة" })}
              </h1>
            </div>
            
            <div className="flex items-center gap-3 bg-[#F7FAF8] px-4 py-2.5 rounded-2xl border border-[#EAEFEC] self-start md:self-auto">
              <Activity size={18} className="text-[#2D6A4F]" />
              <span className="text-xs font-semibold text-[#6B7A73]">
                {t("admin.dashboard.subtitle", { defaultValue: "بيانات حية مباشرة" })}
              </span>
            </div>
          </div>

          <PulseDivider />
        </header>

        {isError ? (
          <div className="rounded-3xl border p-8 text-right flex flex-col md:flex-row items-center gap-4 shadow-sm bg-white" style={{ borderColor: "#E8C4BE" }}>
            <div className="p-3 rounded-2xl bg-[#FBF2F0] text-[#9A3B2E]">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-[#9A3B2E] text-base">
                {t("admin.dashboard.errorTitle", { defaultValue: "خطأ في الاتصال" })}
              </h2>
              <p className="text-sm text-[#6B7A73]">
                {t("admin.dashboard.error", { defaultValue: "تعذّر تحميل البيانات الآن. جرّب تحديث الصفحة." })}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ===== بطاقات الإحصائيات السريعة ===== */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat) => {
                const meta = STAT_META[stat.key];
                return (
                  <div
                    key={stat.key}
                    className="relative bg-white rounded-3xl overflow-hidden border border-[#E4EBE7] shadow-[0_2px_8px_rgba(15,30,27,0.02)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(15,30,27,0.06)] hover:-translate-y-1 group"
                  >
                    <span
                      className="absolute inset-y-0 right-0 w-2 transition-all duration-300 group-hover:w-2.5"
                      style={{ backgroundColor: meta.accent }}
                    />
                    <div className="p-6 pr-7 flex flex-col justify-between h-full space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8A968F]">
                          {stat.label}
                        </p>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: meta.accentSoft, color: meta.accent }}>
                          <TrendingUp size={16} />
                        </div>
                      </div>

                      {isLoading ? (
                        <div className="h-9 w-20 rounded-xl animate-pulse" style={{ backgroundColor: meta.accentSoft }} />
                      ) : (
                        <p className="font-mono tabular-nums text-3xl font-black tracking-tight text-[#0F1E1B]">
                          {String(stat.value).padStart(2, "0")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* ===== قسم الرسم البياني ومؤشر الهدف ===== */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              
              {/* الرسم البياني */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E4EBE7] p-6 md:p-8 flex flex-col justify-between shadow-[0_2px_12px_rgba(15,30,27,0.02)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#8A968F] mb-1">
                      {t("admin.dashboard.chartEyebrow", { defaultValue: "معدل الحجوزات · آخر 7 أيام" })}
                    </p>
                    <h2 className="text-lg md:text-xl font-bold text-[#0F1E1B]">
                      {t("admin.dashboard.chartTitle", { defaultValue: "معدل الحجوزات في الأيام الأخيرة" })}
                    </h2>
                  </div>
                  <span className="hidden sm:flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/15">
                    <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                    {t("admin.dashboard.live", { defaultValue: "مباشر" })}
                  </span>
                </div>

                <div className="w-full h-[280px] md:h-[310px]" dir="ltr">
                  {rawChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="clinicTrendPro" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.4} />
                            <stop offset="60%" stopColor="#52B788" stopOpacity={0.1} />
                            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F0" />
                        <XAxis
                          dataKey="date"
                          stroke="#9AA6A0"
                          fontSize={12}
                          tickMargin={10}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#9AA6A0"
                          fontSize={12}
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          width={40}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 16,
                            border: "1px solid #E4EBE7",
                            boxShadow: "0 12px 32px rgba(15,30,27,0.08)",
                            fontSize: 13,
                            backgroundColor: "#FFFFFF",
                            padding: "12px 16px",
                            textAlign: "right",
                          }}
                          labelStyle={{ color: "#6B7A73", marginBottom: 6, fontWeight: 700 }}
                          formatter={(value: any) => [
                            <span key="val" className="font-mono font-bold text-[#2D6A4F] text-base">{value}</span>,
                            <span key="lbl" className="text-gray-500 ms-1">{t("admin.dashboard.bookingsLabel", { defaultValue: "حجوزات" })}</span>,
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#2D6A4F"
                          strokeWidth={3}
                          fill="url(#clinicTrendPro)"
                          dot={{ r: 4, fill: "#2D6A4F", strokeWidth: 2, stroke: "#FFFFFF" }}
                          activeDot={{ r: 7, fill: "#1B4332", strokeWidth: 2, stroke: "#FFFFFF" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-sm font-medium rounded-2xl border-2 border-dashed bg-[#FAFCFB]" style={{ borderColor: "#E3E9E5", color: "#9AA6A0" }}>
                      <Activity size={32} className="mb-2 opacity-40" />
                      {t("admin.dashboard.noChartData", { defaultValue: "لا توجد بيانات حجوزات كافية بعد" })}
                    </div>
                  )}
                </div>
              </div>

              {/* معدل الإنجاز اليومي (Gauge) */}
              <div className="bg-white rounded-3xl border border-[#E4EBE7] p-6 md:p-8 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-[0_2px_12px_rgba(15,30,27,0.02)]">
                <div className="w-full text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8A968F] mb-1">
                    {t("daily_target_title", { defaultValue: "تقدم الأهداف · الأهداف اليومية" })}
                  </p>
                  <h3 className="text-lg md:text-xl font-bold text-[#0F1E1B]">
                    {t("daily_completion_rate", "معدل الإنجاز اليومي")}
                  </h3>
                </div>

                <div className="relative flex flex-col items-center justify-center my-auto py-6">
                  <div className="absolute -inset-6 bg-gradient-to-b from-[#2D6A4F]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <svg className="w-48 h-26 overflow-visible" viewBox="0 0 160 90">
                    <path
                      d="M 10 80 A 70 70 0 0 1 150 80"
                      fill="none"
                      stroke="#EAEFEC"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 80 A 70 70 0 0 1 150 80"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#52B788" />
                        <stop offset="100%" stopColor="#2D6A4F" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute top-14 flex flex-col items-center">
                    <span className="font-mono text-3xl md:text-4xl font-black text-[#0F1E1B] tracking-tight">{progressPercentage}%</span>
                  </div>
                </div>

                <div className="w-full pt-4 border-t border-[#EEF2F0] flex items-center justify-between text-xs md:text-sm font-semibold">
                  <span className="flex items-center gap-1.5 text-[#2D6A4F] bg-[#2D6A4F]/8 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 size={16} />
                    {newOrdersCount} {t("completed_orders", "مكتمل")}
                  </span>
                  <span className="text-[#6B7A73] font-mono">
                    {t("target_label", "الهدف:")} <strong className="text-[#0F1E1B]">{dailyTarget}</strong>
                  </span>
                </div>
              </div>

            </section>
          </>
        )}
      </div>
    </div>
  );
}

function PulseDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden bg-[#E3E9E5]">
      <span
        className="absolute inset-y-0 w-32 animate-[pulseMove_3s_ease-in-out_infinite]"
        style={{
          background: "linear-gradient(90deg, transparent, #2D6A4F, transparent)",
        }}
      />
      <style>{`
        @keyframes pulseMove {
          0%   { transform: translateX(-150%); }
          60%  { transform: translateX(450%); }
          100% { transform: translateX(450%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[pulseMove_3s_ease-in-out_infinite\\] { animation: none; }
        }
      `}</style>
    </div>
  );
}