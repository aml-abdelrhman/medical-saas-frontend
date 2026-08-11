import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function ClinicProfileView() {
  const { slug } = useParams<{ slug: string }>();
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/clinics/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'فشل في جلب بيانات العيادة');
        }

        setClinic(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchClinicData();
    }
  }, [slug]);

  // دالة لتحويل أي حقل مترجم {ar, en} إلى نص آمن
  const formatText = (val: any) => {
    if (!val) return '';
    if (typeof val === 'object') {
      return val.ar || val.en || '';
    }
    return String(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400 text-lg">
        جاري تحميل بيانات العيادة...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-white p-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-extrabold text-teal-400">
            {formatText(clinic?.name)}
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1" dir="ltr">
            slug: {formatText(clinic?.slug)}
          </p>
        </div>

        <div className="space-y-4 text-slate-300">
          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-sm">اسم المسؤول أو الطبيب:</span>
            <span className="font-semibold text-white">{formatText(clinic?.owner_name)}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-sm">البريد الإلكتروني:</span>
            <span className="font-mono text-teal-300 text-sm" dir="ltr">{formatText(clinic?.email)}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-sm">رقم الجوال:</span>
            <span className="font-mono text-teal-300 text-sm" dir="ltr">{formatText(clinic?.phone)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}