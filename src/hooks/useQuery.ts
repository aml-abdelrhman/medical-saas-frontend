import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/axiosInstance'
import { toast } from 'sonner'
import { selectUser, useAuthStore } from '@/stores/useAuthStore'
import type { AxiosError } from 'axios'
import { useNavigate } from '@tanstack/react-router'
import axios from 'axios';

const AVAILABILITY_KEY = ['doctorAvailability']

// ==========================================================================
// Types
// ==========================================================================

export interface Specialty {
  id: number
  name: { ar: string; en: string }
  slug: string
  image: string | null
  description: { ar: string; en: string }
}

export interface Doctor {
  id: number
  user_id?: number
  specialty_id: number
  name: { ar: string; en: string }
  bio: { ar: string; en: string } | null
  years_experience: number
  rating: number
  image: string | null
  languages: string[]
  price_from: number
  specialty?: Specialty
  services?: Service[]
  availabilities?: {
    day_of_week: number
    start_time: string
    end_time: string
  }[]
}

export interface Service {
  id: number
  doctor_id: number
  name: { ar: string; en: string }
  description: { ar: string; en: string }
  price: number
  duration_minutes: number
  image_url: string | null
  is_active: boolean
}

export interface ClinicContactPayload {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}
// ==========================================================================
// Shared / Public (تخصصات وأطباء وعيادات - بيانات عامة تستخدمها كل الأدوار)
// ملحوظة: الدوال في القسم ده متغيرتش زي ما طلبت
// ==========================================================================

// تسجيل عيادة جديدة (فورم داتا فيها ملفات زي اللوجو)
export const useRegisterClinic = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // تمرير الـ Header صراحة لضمان إرسال الملفات بشكل صحيح دون تحويلها لـ JSON
      const res = await api.post('/v1/clinics/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onError: (error: AxiosError<any>) => {
      console.error('❌ Status Code:', error.response?.status);
      console.error('🔍 Validation Errors:', error.response?.data?.errors);
    },
  });
};

// دالة مساعدة بتظبط رابط الصورة/الملف القادم من السيرفر (تضيف الـ base url وتشيل storage/)
const getFixedUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
  const cleanPath = path.replace(/^storage\//, '').replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

// جلب تفاصيل العيادة الأساسية (الاسم، اللوجو، البريد، الهاتف) عن طريق الـ slug
export const useClinicDetails = (slug: string) => {
  return useQuery({
    queryKey: ['clinic-details', slug],
    queryFn: async () => {
      const res = await api.get(`/v1/clinics/${slug}`);
      
      // طباعة استجابة السيرفر بالكامل لفحص حقل اللوجو ومساره بدقة
      console.log('🔍 Full Clinic Response Data:', res.data.data);
      console.log('🖼️ Logo Value:', res.data.data?.logo);
      
      return res.data.data; 
    },
    enabled: !!slug && slug !== 'undefined' && slug !== 'null',
  });
};

// جلب أطباء العيادة مع تقييماتهم (لصفحة العيادة العامة)
export const useClinicDoctorsReviews = (clinicSlug: string) => {
  return useQuery({
    queryKey: ['clinic-doctors-reviews', clinicSlug],
    queryFn: async () => {
      const endpoint = `/clinics/${clinicSlug}/doctors-reviews`;
      const { data } = await api.get(endpoint);
      return data;
    },
    enabled: !!clinicSlug,
  });
};

// جلب الباقات المتاحة للعرض العام (بدون تسجيل دخول)
// جلب الباقات المتاحة للعرض العام مع التشخيص الدقيق وتحديد مكان المشكلة (CORS أو الإعدادات)
export function usePublicPlans() {
  return useQuery({
    queryKey: ['public-plans'],
    queryFn: async () => {
      try {
        const response = await api.get('/plans')
        
        if (!response || !response.data) {
          throw new Error('استجابة الخادم فارغة أو غير صالحة.')
        }
        
        return response.data
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          // بما أن status مفقود (undefined) وخطأ شبكة، فالمشكلة في الـ CORS أو بروتوكول الاتصال
          console.error('❌ [تشخيص أخطاء الاتصال]:', {
            message: err.message,
            status: err.response?.status,
            configUrl: err.config?.url,
            baseURL: err.config?.baseURL,
          })

          if (err.response) {
            const status = err.response.status
            const serverMessage = (err.response.data as { message?: string })?.message || err.response.statusText
            
            if (status === 404) {
              throw new Error('مسار الـ API غير موجود (404). تأكد من صحة الرابط الأساسي VITE_API_BASE_URL.')
            } else if (status === 500) {
              throw new Error('خطأ داخلي في خادم الباك إند (500). راجع ملفات السيرفر أو السجلات.')
            } else {
              throw new Error(`خطأ من الخادم (${status}): ${serverMessage}`)
            }
          } else if (err.request) {
            // التحقق الذكي من سبب انقطاع الطلب قبل خروجه أو رفضه أمنياً
            const currentProtocol = window.location.protocol; // https أو http
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

            if (currentProtocol === 'https:' && apiBaseUrl.startsWith('http:')) {
              throw new Error(
                '🔴 خطأ Mixed Content (أمان المتصفح): موقعك يعمل بـ HTTPS ويحاول استدعاء رابط باك إند يعمل بـ HTTP. ' +
                'يجب تعديل رابط VITE_API_BASE_URL في لوحة تحكم Vercel ليكون بـ HTTPS.'
              );
            }

            throw new Error(
              '🔴 خطأ Network Error بسبب سياسة الـ CORS أو حظر الاستضافة (InfinityFree). ' +
              'السبب المؤكد: متصفحك يمنع الرد لأن الباك إند لا يرسل ترويسات الـ CORS المسموحة لموقعك على Vercel. ' +
              'الحل: راجع ملف الإعدادات (config/cors.php) في الباك إند وتأكد أن allowed_origins مضبوطة بقبول جميع الروابط (*) أو رابط موقعك.'
            )
          }
        }

        const standardError = err as Error
        throw new Error(`حدث خطأ غير متوقع: ${standardError.message || 'خطأ مجهول'}`)
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

// جلب أطباء عيادة معينة (عرض عام)
export const useClinicDoctors = (slug: string) => {
  return useQuery({
    queryKey: ['clinic-doctors', slug],
    queryFn: async () => {
      const res = await api.get(`/v1/clinics/${slug}/doctors`)
      return res.data as Doctor[]
    },
    enabled: !!slug,
  })
}

// جلب كل التخصصات المتاحة على مستوى المنصة (عام)
export const useAllSpecialties = () => {
  return useQuery({
    queryKey: ['all-specialties'],
    queryFn: async () => {
      const res = await api.get('/v1/specialties') // المسار العام للتخصصات
      return res.data.data ?? res.data
    },
  })
}

// جلب تخصصات عيادة معينة (عرض عام)
export const useClinicSpecialties = (slug: string) => {
  return useQuery({
    queryKey: ['clinic-specialties', slug],
    queryFn: async () => {
      const res = await api.get(`/v1/clinics/${slug}/specialties`)
      return res.data
    },
    enabled: !!slug,
  })
}

// جلب خدمات عيادة معينة مع تظبيط روابط الصور/الأيقونات (عرض عام)
export const useClinicServices = (slug: string) => {
  return useQuery({
    queryKey: ['clinic-services', slug],
    queryFn: async () => {
      const res = await api.get(`/v1/clinics/${slug}/services`);
      const services = res.data.data;

      if (Array.isArray(services)) {
        return services.map((service: any) => ({
          ...service,
          image: getFixedUrl(service.image || service.icon),
          icon: getFixedUrl(service.icon || service.image),
        }));
      }

      return services;
    },
    enabled: !!slug,
  });
};


export function useSendContactMessage() {
  return useMutation({
    mutationFn: async (formData: ContactFormData) => {
      const response = await api.post('/contact-messages', formData);
      return response.data;
    },
  });
}

// إرسال رسالة تواصل (فورم اتصل بنا) لعيادة معينة
export const useSendClinicContact = (slug: string) => {
  return useMutation({
    mutationFn: async (data: ClinicContactPayload) => {
      const response = await api.post(`/v1/clinics/${slug}/contact`, data);
      return response.data;
    },
  });
};

// جلب كل التخصصات (عام - نسخة قديمة من مسار /specialties)
export const useGetSpecialties = () => {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const res = await api.get('/specialties')
      // الباك إند بيرجع الرد ملفوف جوه { data: [...] } مش array مباشرة
      return (res.data?.data ?? res.data) as Specialty[]
    },
  })
}

// جلب تخصص واحد عن طريق الـ slug
export const useGetSpecialty = (slug: string) => {
  return useQuery({
    queryKey: ['specialty', slug],
    queryFn: async () => {
      const res = await api.get(`/specialties/${slug}`)
      return res.data as Specialty
    },
    enabled: !!slug,
  })
}

// جلب كل الأطباء مع دعم فلترة اختيارية (تخصص / تقييم)
export const useGetDoctors = (filters?: {
  specialty_id?: number
  rating?: number
}) => {
  return useQuery({
    queryKey: ['doctors', filters],
    queryFn: async () => {
      const res = await api.get('/doctors', { params: filters })
      return res.data as Doctor[]
    },
  })
}

// جلب تفاصيل طبيب واحد بالـ id
export const useGetDoctor = (id: number) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const res = await api.get(`/doctors/${id}`)
      return res.data as Doctor
    },
    enabled: !!id,
  })
}

// جلب كل الخدمات، أو خدمات طبيب معين لو اتبعت doctorId
export const useGetServices = (doctorId?: number) => {
  return useQuery({
    queryKey: ['services', doctorId],
    queryFn: async () => {
      const url = doctorId ? `/services?doctor_id=${doctorId}` : '/services'
      const res = await api.get(url)
      return res.data.data as Service[]
    },
  })
}

// جلب الخدمات مع تخصصاتها المرتبطة (لصفحات الفلترة/البحث)
export const useGetServicesWithSpecialties = () => {
  return useQuery({
    queryKey: ['servicesWithSpecs'],
    queryFn: async () => {
      const { data } = await api.get('/services-with-specialties')
      return data.data
    },
  })
}

// جلب المواعيد المتاحة حسب الدور (patient / doctor / admin) - دالة مشتركة بين الأدوار
export const useGetAvailability = (
  role: 'patient' | 'doctor' | 'admin',
  doctorId?: number,
) => {
  return useQuery({
    queryKey: ['availability', role, doctorId],
    queryFn: async () => {
      let url = '/availabilities'
      if (role === 'doctor') url = '/doctor/my-availability'
      if (role === 'admin') url = '/admin/availability'
      const res = await api.get(url, {
        params: doctorId ? { doctor_id: doctorId } : {},
      })
      return res.data
    },
    enabled:
      role === 'doctor' ||
      (role === 'patient' && !!doctorId) ||
      role === 'admin',
  })
}

// حذف ميعاد معين (تعمل للطبيب أو للأدمن حسب الـ role الممرر) - دالة مشتركة
export const useDeleteAvailability = (role: 'doctor' | 'admin') => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number | string) => {
      const url =
        role === 'admin'
          ? `/admin/availability/${id}`
          : `/doctor/availability/${id}`
      const response = await api.delete(url)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      toast.success('تم حذف الموعد بنجاح')
    },
    onError: (error: any) => {
      toast.error('فشل حذف الموعد')
    },
  })
}

// طلب باقة اشتراك جديدة لصاحب عيادة جديد (أونبوردنج/تشيك أوت)
export const useCheckoutSubscription = () => {
  return useMutation({
    mutationFn: async (data: { clinic_id: number; plan_id: number; is_annual: boolean }) => {
      const response = await api.post('/v1/subscriptions/checkout', data);
      return response.data;
    },
  });
};

// ==========================================================================
// Super Admin (إدارة كل المنصة: عيادات، باقات، اشتراكات، مستخدمين)
// ==========================================================================
// جلب تقييمات المنصة العامة للـ Landing Page
export const usePlatformReviews = () => {
  return useQuery({
    queryKey: ['platform-reviews'],
    queryFn: async () => {
      const res = await api.get('/platform-reviews');
      return res.data.data; // استخراج الـ data مباشرة مثل بقية الدوال
    },
  });
};

// جلب إحصائيات المنصة العامة
export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      const res = await api.get('/super-admin/stats')
      return res.data.data
    },
  })
}

// جلب جميع عيادات المنصة
export const useAdminClinics = () => {
  return useQuery({
    queryKey: ['super-admin-clinics'],
    queryFn: async () => {
      const res = await api.get('/super-admin/clinics')
      // الباك إند يرسل البيانات مغلفة هكذا: { status: 'success', data: [...] }
      return res.data.data
    },
  })
}

// إنشاء عيادة جديدة (سوبر أدمن)
export const useCreateClinic = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newClinicData: FormData) => {
      const res = await api.post('/super-admin/clinics', newClinicData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-clinics'] })
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] })
    },
  })
}

// تعديل بيانات عيادة موجودة (سوبر أدمن)
export const useUpdateClinic = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: FormData }) => {
      // التأكد من إرسال _method على شكل PUT لكي يتعامل معه لارافيل بشكل صحيح
      if (data instanceof FormData) {
        if (!data.has('_method')) {
          data.append('_method', 'PUT')
        }
      }

      // تغيير api.put إلى api.post لأن PHP لا يدعم الملفات في طلبات الـ PUT المباشرة
      const res = await api.post(`/super-admin/clinics/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-clinics'] })
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] })
    },
  })
}

// حذف عيادة (سوبر أدمن)
export const useDeleteClinic = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (clinicId: number) => {
      const res = await api.delete(`/super-admin/clinics/${clinicId}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-clinics'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
    },
  })
}

// تحديث/إضافة اشتراك لعيادة معينة (سوبر أدمن)
export const useUpdateClinicSubscription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ clinicId, data }: { clinicId: number; data: { plan_id: number; status: string; expires_at?: string } }) => {
      const res = await api.post(`/super-admin/clinics/${clinicId}/subscription`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-clinics'] })
    },
  })
}

// جلب جميع الباقات (Plans) الخاصة بالمنصة (سوبر أدمن)
export const useAdminPlans = () => {
  return useQuery({
    queryKey: ['super-admin-plans'],
    queryFn: async () => {
      const res = await api.get('/super-admin/plans')
      return res.data.data
    },
  })
}

// إضافة باقة جديدة (سوبر أدمن)
export const useCreatePlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (planData: { name: string; price: number; duration_in_days: number; description?: string }) => {
      const res = await api.post('/super-admin/plans', planData)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-plans'] })
    },
  })
}

// تعديل باقة موجودة (سوبر أدمن)
export const useUpdatePlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await api.put(`/super-admin/plans/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-plans'] })
    },
  })
}

// حذف باقة (سوبر أدمن)
export const useDeletePlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/super-admin/plans/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-plans'] })
    },
  })
}

// جلب كافة الاشتراكات على مستوى المنصة (سوبر أدمن)
export const useAdminSubscriptions = () => {
  return useQuery({
    queryKey: ['super-admin-subscriptions'],
    queryFn: async () => {
      const response = await api.get('/super-admin/subscriptions')
      return response.data.data
    },
  })
}

// إضافة اشتراك جديد يدويًا (سوبر أدمن)
export const useCreateSubscription = () => {
  return useMutation({
    mutationFn: async (data: { clinic_id: number; plan_id: number; status: string; starts_at: string; ends_at: string }) => {
      const response = await api.post('/super-admin/subscriptions', data)
      return response.data
    },
  })
}

// تعديل اشتراك موجود (سوبر أدمن)
export const useUpdateSubscription = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/super-admin/subscriptions/${id}`, data)
      return response.data
    },
  })
}

// حذف اشتراك (سوبر أدمن)
export const useDeleteSubscription = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/super-admin/subscriptions/${id}`)
      return response.data
    },
  })
}

// جلب جميع مستخدمين المنصة (سوبر أدمن)
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      const res = await api.get('/super-admin/users')
      return res.data.data
    },
  })
}

// حذف مستخدم من المنصة بالكامل (سوبر أدمن)
export const useDeleteUserbysuperadmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await api.delete(`/super-admin/users/${userId}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
    },
  })
}

export function useGetContactMessages() {
  return useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const response = await api.get('/super-admin/contact-messages');
      return response.data;
    },
  });
}
// ==========================================================================
// User / Patient (حجوزات، تقييمات، مفضلة)
// ملحوظة: الدوال دي أصلاً بتتفلتر بالـ user/token بتاع المريض نفسه (my-appointments,
// favorites) مش محتاجة clinic_id لأن المريض حسابه واحد ممكن يحجز في أكتر من عيادة،
// فسبتها زي ما هي لأنها شغالة صح بالساس بنفس منطق useGetFavorites (موديل صحيح أصلاً)
// ==========================================================================

// جلب مواعيد المريض للعيادة الحالية
export const useGetMyAppointments = (clinicSlug?: string, options?: any) => {
  return useQuery({
    queryKey: ['my-appointments', clinicSlug],
    queryFn: async () => {
      const targetSlug = clinicSlug || 'aayadat-alshfaaa-altkhssy'
      const { data } = await api.get(`/clinics/${targetSlug}/my-appointments`)
      return data?.data || data
    },
    enabled: true,
    ...options,
  })
}

// إنشاء حجز جديد داخل العيادة (مع نفس منطق الـ get)
export const useCreateAppointment = (clinicSlug?: string) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)

  return useMutation({
    mutationFn: async (data: any) => {
      if (!token) {
        navigate({ to: '/login' })
        throw new Error('Unauthorized')
      }

      const formattedData = {
        ...data,
        doctor_id: Number(data.doctor_id),
        service_id: Number(data.service_id),
        start_time: data.start_time?.length === 5 ? `${data.start_time}:00` : data.start_time,
      }

      console.log('📦 Payload Sent to Server:', formattedData)

      const targetSlug = clinicSlug || 'aayadat-alshfaaa-altkhssy'
      const response = await api.post(`/clinics/${targetSlug}/appointments`, formattedData)
      return response.data
    },
    onSuccess: () => {
      const targetSlug = clinicSlug || 'aayadat-alshfaaa-altkhssy'
      queryClient.invalidateQueries({ queryKey: ['my-appointments', targetSlug] })
    },
    onError: (error: any) => {
      console.log('❌ VALIDATION ERRORS / API ERROR:', error?.response?.data || error)
    },
  })
}

// إلغاء موعد (يتم بالـ ID الخاص بالموعد مع تحديث الكاش للعيادة المعنية)
export const useCancelAppointment = (clinicSlug?: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      // لاحظ: الإلغاء غالباً لا يحتاج slug في الرابط إذا كان الـ ID فريداً للموعد على مستوى النظام، 
      // ولكننا نستخدم الـ slug هنا فقط لتحديث الكاش الصحيح
      const response = await api.put(`/appointments/${id}/cancel`)
      return response.data
    },
    onSuccess: () => {
      // توحيد منطق السلج الافتراضي لتحديث الكاش
      const targetSlug = clinicSlug 
      queryClient.invalidateQueries({ queryKey: ['my-appointments', targetSlug] })
    },
  })
}

// إضافة تقييم لطبيب بعد الحجز
export const useAddReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/reviews', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] })
    },
  })
}

// إضافة/حذف طبيب من المفضلة
export const useToggleFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (doctorId: number) => api.post(`/favorites/${doctorId}`),
    onMutate: async (doctorId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

// جلب قائمة المفضلة الخاصة بالمستخدم
export const useGetFavorites = () => {
  const user = useAuthStore(selectUser)
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const res = await api.get('/favorites')
      return res.data
    },
    enabled: !!user?.id && !!token,
    staleTime: 1000 * 60 * 5,
  })
}

// ==========================================================================
// Doctor Self-Profile Hooks (داشبورد الطبيب لنفسه)
// ملحوظة: كل الدوال هنا شغالة بالـ Bearer Token بتاع الطبيب نفسه، والباك إند بيحدد
// الطبيب (وبالتالي العيادة بتاعته) من التوكن، فمفيش داعي لإرسال clinic_id يدويًا
// (نفس فكرة useGetAdminStats بس بالتوكن بدل ما يكون clinic_id فـ params). سبتها
// زي ما هي لأنها شغالة صح بالساس.
// ==========================================================================

// جلب بروفايل الطبيب الحالي (نسخة قديمة بدون clinic_id)
export const useGetMyDoctorProfile = () => {
  return useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      const res = await api.get('/doctor/profile')
      if (!res?.data?.data) {
        throw new Error('Doctor profile not found in response')
      }
      return res.data.data
    },
  })
}

// تحديث بيانات الطبيب الحالي
export const useUpdateDoctordata = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> | FormData }) => {
      let formData: FormData;

      // التأكد من تحويل البيانات إلى FormData
      if (data instanceof FormData) {
        formData = data;
      } else {
        formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }

      // إضافة الـ clinic_id إذا لم يكن موجوداً
      if (clinicId && !formData.has('clinic_id')) {
        formData.append('clinic_id', String(clinicId));
      }

      // إرسال الطلب كـ POST صريح دون محاكاة طرق أخرى لأن الروت أساساً POST
      return api.post(`/doctor/profile/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
    },
    onError: (error: any) => {
      console.error('Update doctor data error:', error.response?.data || error.message)
    },
  })
}

// جلب بروفايل الطبيب الحالي (النسخة الحديثة اللي بتبعت clinic_id)
export const useGetDoctorProfile = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useQuery({
    queryKey: ['doctor-profile', clinicId],
    queryFn: async () => {
      const res = await api.get('/doctor/profile', {
        params: { clinic_id: clinicId },
      })
      if (!res?.data?.data) {
        throw new Error('Doctor profile not found in response')
      }
      return res.data.data
    },
    enabled: !!token,
  })
}
 
/**
 * تحديث صورة الطبيب فقط
 */
export const useUpdateDoctorImage = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => {
      if (clinicId && !data.has('clinic_id')) {
        data.append('clinic_id', String(clinicId))
      }
      return api.post(`/doctor/profile/${id}/image`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
    },
    onError: (error: any) => {
      console.error('Update doctor image error:', error.response?.data || error.message)
    },
  })
}

// جلب خدمات الطبيب الحالي (من التوكن)
export const useGetDoctorServices = () => {
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useQuery({
    queryKey: ['doctorServices', clinicId],
    queryFn: async () => {
      const token = useAuthStore.getState().token
 
      const response = await api.get('/doctor/services', {
        params: { clinic_id: clinicId },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      return response.data
    },
    enabled: !!useAuthStore.getState().token && !!clinicId,
  })
}
 
// حذف خدمة تابعة للطبيب الحالي
export const useRemovedoctorService = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: async (serviceId: number | string) => {
      const response = await api.delete(`/doctor/services/${serviceId}`, {
        params: { clinic_id: clinicId },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorServices', clinicId] })
    },
    onError: (error) => {
      console.error('Error deleting service:', error)
    },
  })
}
 
// تحديث خدمة تابعة للطبيب الحالي
export const useUpdatedoctorService = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: number | string
      formData: FormData
    }) => {
      if (!formData.has('_method')) {
        formData.append('_method', 'PUT')
      }
      if (clinicId && !formData.has('clinic_id')) {
        formData.append('clinic_id', String(clinicId))
      }
 
      const response = await api.post(`/doctor/services/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['doctorServices', clinicId] })
    },
  })
}
 
// جلب خدمة واحدة تابعة للطبيب الحالي
export const useGetSingleService = (id: string | number) => {
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useQuery({
    queryKey: ['doctorService', id, clinicId],
    queryFn: async () => {
      const response = await api.get(`/doctor/services/${id}`, {
        params: { clinic_id: clinicId },
      })
      return response.data
    },
    enabled: !!id,
  })
}
 
// إضافة خدمة جديدة للطبيب الحالي
export const useAddDoctorService = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (clinicId && !formData.has('clinic_id')) {
        formData.append('clinic_id', String(clinicId))
      }
      const response = await api.post('/doctor/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['doctorServices', clinicId] })
    },
  })
}
 
// تحديث جدول المواعيد الأسبوعي للطبيب
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: async (schedule: any[]) => {
      const response = await api.post('/doctor/update-schedule', { schedule, clinic_id: clinicId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'doctor'] })
      toast.success('تم تحديث الجدول بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل تحديث الجدول')
    },
  })
}
 
// جلب مواعيد الطبيب الحالي (من التوكن مباشرة)
export const useGetMyAvailability = () => {
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useQuery({
    queryKey: ['my-availability', clinicId],
    queryFn: async () => {
      const token = useAuthStore.getState().token
 
      try {
        const response = await api.get('/doctor/my-availability', {
          params: { clinic_id: clinicId },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
 
        return response.data
      } catch (error: any) {
        console.error('❌ فشل الطلب! تفاصيل الخطأ:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        })
        throw error
      }
    },
    enabled: !!useAuthStore.getState().token && !!clinicId,
  })
}
 
// تحديث جدول مواعيد الطبيب الحالي بالكامل
export const useUpdateMySchedule = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: async (schedule: any[]) => {
      return await api.post('/doctor/update-schedule', { schedule, clinic_id: clinicId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-availability', clinicId] })
      toast.success('تم تحديث الجدول بنجاح')
    },
    onError: (error: any) => {
      console.error('خطأ تحديث الجدول:', error.response?.data || error.message)
      toast.error('فشل تحديث الجدول')
    },
  })
}
 
// تحديث ميعاد فردي للطبيب الحالي
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: async ({
      id,
      start_time,
      end_time,
    }: {
      id: number
      start_time: string
      end_time: string
    }) => {
      const response = await api.put(`/doctor/availability/${id}`, {
        start_time,
        end_time,
        clinic_id: clinicId,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] })
      queryClient.refetchQueries({ queryKey: ['doctorAvailability'] })
    },
  })
}
 
// إضافة ميعاد جديد للطبيب الحالي
export const useAddAvailability = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: async (data: {
      day_of_week: number
      start_time: string
      end_time: string
    }) => {
      const response = await api.post('/doctor/availability', { ...data, clinic_id: clinicId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] })
      queryClient.refetchQueries({ queryKey: ['doctorAvailability'] })
    },
  })
}
 
// حذف ميعاد للطبيب الحالي
export const useDeleteMyAvailability = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/doctor/availability/${id}`, {
        params: { clinic_id: clinicId },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] })
      queryClient.refetchQueries({ queryKey: ['doctorAvailability'] })
    },
  })
}
 
// إنهاء موعد من طرف الطبيب
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: (id: number) =>
      api.post(`/doctor/appointments/${id}/complete`, { clinic_id: clinicId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments', clinicId] })
    },
  })
}
 
// جلب مواعيد/حجوزات الطبيب الحالي
export const useGetDoctorAppointments = () => {
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useQuery({
    queryKey: ['doctor-appointments', clinicId],
    queryFn: () =>
      api
        .get('/doctor/appointments', { params: { clinic_id: clinicId } })
        .then((res) => res.data),
    enabled: !!clinicId,
  })
}
 
// تحديث حالة حجز (تأكيد أو إلغاء) من طرف الطبيب
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(
        `/doctor/appointments/${id}/${status === 'cancelled' ? 'cancel' : 'confirm'}`,
        { status, clinic_id: clinicId },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments', clinicId] })
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] })
    },
  })
}
 
// جلب تقييمات الطبيب الحالي
export const useGetDoctorReviews = () => {
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id
 
  return useQuery({
    queryKey: ['doctor-reviews', clinicId],
    queryFn: async () => {
      try {
        const response = await api.get('/doctor/reviews', {
          params: { clinic_id: clinicId },
        })
        return response.data
      } catch (error: any) {
        console.group('❌ Error Diagnoses')
        console.error('Message:', error.message)
        console.error('Status:', error.response?.status)
        console.error('Full URL Attempted:', error.config?.url)
        console.error('Response Data:', error.response?.data)
        console.groupEnd()
 
        throw error
      }
    },
    enabled: !!clinicId,
  })
}

// ==========================================================================
// Admin (إدارة الأطباء، الخدمات، المواعيد، الحجوزات، التقييمات، المستخدمين، الإحصائيات)
// كل دالة بترجع/تعدّل قايمة عامة بتاخد دلوقتي clinic_id من useAuthStore وتبعته
// زي useGetAdminStats بالظبط عشان كل أدمن يشوف بيانات عيادته بس.
// (دوال التخصصات useAddSpecialty / useUpdateSpecialty / useDeleteSpecialty
// سيبتها زي ما هي زي ما طلبت)
// ==========================================================================

// جلب قائمة كل المستخدمين (للأدمن) — ده كان أصلاً شغال صح، وهو الموديل اللي اتبنى عليه الباقي
export const useGetUsers = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useQuery({
    queryKey: ['users', clinicId],
    queryFn: async () => {
      const response = await api.get('/admin/users', {
        params: { clinic_id: clinicId },
      })
      return response.data
    },
    enabled: !!token && !!clinicId,
    retry: false,
  })
}

// إضافة مستخدم جديد (للأدمن)
export const useAddUser = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clinicId = user?.clinic_id || user?.clinic?.id;

  return useMutation({
    mutationFn: async (newUser: { name: string; email: string; password?: string; role: string }) => {
      const token = useAuthStore.getState().token;
      return await api.post('/admin/users', 
        { ...newUser, clinic_id: clinicId }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      // تحديث القائمة فور الإضافة
      queryClient.invalidateQueries({ queryKey: ['users', clinicId] });
    },
  });
};

// تحديث دور المستخدم (للأدمن)
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const token = useAuthStore.getState().token
      return await api.put(
        `/admin/users/${id}/role`,
        { role, clinic_id: clinicId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      )
    },
    onSuccess: () => {
      // تحديث قائمة المستخدمين بعد تغيير الرول
      queryClient.invalidateQueries({ queryKey: ['users', clinicId] })
    },
  })
}

// حذف مستخدم (للأدمن)
export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: async (id: number) => {
      const token = useAuthStore.getState().token
      // تأكدي أن الرابط يبدأ بـ /api/admin/users/ وليس admin/admin/users/
      return await api.delete(`/admin/users/${id}`, {
        params: { clinic_id: clinicId },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', clinicId] })
    },
    onError: (err) => {
      console.error("خطأ في الحذف:", err);
    }
  })
}

// جلب تخصصات عيادة الأدمن الحالي (لصفحة إدارة التخصصات بالداشبورد)
export const useGetSpecialtiesforadmin = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  
  // استخراج الـ clinic_id مع طباعته لمعرفة قيمته
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useQuery({
    queryKey: ['specialties', clinicId],
    queryFn: async () => {
      
      const response = await api.get('/admin/specialties', {
        params: { clinic_id: clinicId },
      })

      const result = (response.data?.data ?? response.data) as Specialty[]
   
      return result
    },
    enabled: !!token, // جعلناه يعتمد فقط على الرمز مؤقتاً لنرى ماذا سيحدث لو الـ clinicId غير موجود
    retry: false,
  })
}

// إضافة تخصص جديد
export const useAddSpecialty = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/admin/specialties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      toast.success('تمت إضافة التخصص بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء الإضافة')
    },
  })
}

// تحديث تخصص موجود
export const useUpdateSpecialty = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
api.post(`/admin/specialties/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      toast.success('تم تحديث التخصص بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل التحديث')
    },
  })
}

// حذف تخصص
export const useDeleteSpecialty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, force = false }: { id: number; force?: boolean }) => 
      api.delete(`/admin/specialties/${id}${force ? '?force=1' : ''}`),
      
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
    },
    onError: (error: any) => {
      // نتركها فارغة لنلتقط الخطأ في الـ Component
    },
  });
};

// جلب كل أطباء عيادة الأدمن الحالي (لصفحة إدارة الأطباء بالداشبورد)
export const useGetAdminDoctors = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useQuery({
    queryKey: ['doctors', clinicId],
    queryFn: async () => {
      const res = await api.get('/admin/doctors', {
        params: { clinic_id: clinicId },
      })
      // بعض الـ endpoints عندك بترجع { data: [...] } وبعضها بيرجع array مباشرة
      return (res.data?.data ?? res.data) as Doctor[]
    },
    enabled: !!token && !!clinicId,
    retry: false,
  })
}

// إضافة طبيب جديد (لازم يترتبط بعيادة الأدمن اللي مسجل دلوقتي)
export const useAddDoctor = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: (formData: FormData) => {
      if (clinicId && !formData.has('clinic_id')) {
        formData.append('clinic_id', String(clinicId))
      }
      return api.post('/admin/doctors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      toast.success('تم إضافة الطبيب بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل إضافة الطبيب')
    },
  })
}

// تحديث بيانات طبيب
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => {
      if (!formData.has('_method')) {
        formData.append('_method', 'PUT')
      }
      if (clinicId && !formData.has('clinic_id')) {
        formData.append('clinic_id', String(clinicId))
      }

      return api.post(`/admin/doctors/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors', clinicId] })
      toast.success('تم تحديث بيانات الطبيب بنجاح')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'فشل التحديث'
      toast.error(message)

      if (error.response?.data?.errors) {
        console.error('Validation Errors:', error.response.data.errors)
      }
    },
  })
}

// حذف طبيب
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/admin/doctors/${id}`, {
        params: { clinic_id: clinicId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors', clinicId] })
      toast.success('تم حذف الطبيب من النظام')
    },
    onError: (error: any) => {
      toast.error('فشل عملية الحذف')
    },
  })
}

// جلب خدمة واحدة بمعرفها (للأدمن)
export const useGetServiceById = (id: string | number) => {
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useQuery({
    queryKey: ['doctor-services', id, clinicId],
    queryFn: async () => {
      const res = await api.get(`/admin/doctor-services/${id}`, {
        params: { clinic_id: clinicId },
      })
      return res.data.data
    },
    enabled: !!id && !!clinicId,
  })
}

// إضافة خدمة جديدة (للأدمن)
export const useCreateService = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: (formData: FormData) => {
      if (clinicId && !formData.has('clinic_id')) {
        formData.append('clinic_id', String(clinicId))
      }
      return api.post('/admin/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-services', clinicId] })
      toast.success('تمت إضافة الخدمة بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل إضافة الخدمة')
    },
  })
}

// تحديث خدمة موجودة (للأدمن)
export const useUpdateService = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => {
      if (!data.has('_method')) {
        data.append('_method', 'PUT')
      }
      if (clinicId && !data.has('clinic_id')) {
        data.append('clinic_id', String(clinicId))
      }
      return api.post(`/admin/services/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-services', clinicId] })
      toast.success('تم التحديث بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل التحديث')
    },
  })
}

// حذف خدمة (للأدمن)
export const useDeleteService = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/admin/services/${id}`, {
        params: { clinic_id: clinicId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['doctor-services', clinicId] })
      toast.success('تم حذف الخدمة')
    },
    onError: (error: any) => {
      // استخراج رسالة الخطأ القادمة من السيرفر أو استخدام رسالة افتراضية
      const errorMessage =
        error?.response?.data?.message || 'فشل حذف الخدمة، يرجى المحاولة لاحقاً'
      
      toast.error(errorMessage)
    },
  })
}

// جلب كل خدمات الأطباء (للأدمن) — كانت بتجيب خدمات كل الأطباء على المنصة كلها،
// دلوقتي بتتفلتر بعيادة الأدمن الحالي زي useGetAdminStats
export const useGetDoctorServicestoadmin = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useQuery({
    queryKey: ['doctor-services', clinicId],
    queryFn: async () => {
      const res = await api.get('/admin/doctor-services', {
        params: { clinic_id: clinicId },
      })
      
      // طباعة البيانات في الكونسول لفحص شكل رابط الصورة مباشرة
      console.log('=== SERVICES API RESPONSE ===', res.data.data)
      
      return res.data.data
    },
    enabled: !!token && !!clinicId,
    retry: false,
  })
}

// جلب مواعيد طبيب معين (للأدمن) — ضفنا clinic_id كمان عشان الأدمن يقدر يشوف
// بس مواعيد أطباء عيادته
export const useGetDoctorAvailabilityAdmin = (doctorId: number | null) => {
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useQuery({
    queryKey: ['admin-doctor-availability', doctorId, clinicId],
    queryFn: async () => {
      const token = useAuthStore.getState().token
      const response = await api.get('/admin/availability', {
        params: { doctor_id: doctorId, clinic_id: clinicId },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      return response.data
    },
    enabled: !!doctorId && !!clinicId,
  })
}

// حذف أي ميعاد (للأدمن)
export const useAdminDeleteAvailability = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: (id: number) => {
      const token = useAuthStore.getState().token
      return api.delete(`/admin/availability/${id}`, {
        params: { clinic_id: clinicId },
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['admin-doctor-availability'],
      }),
  })
}

// جلب كل الحجوزات (للأدمن) — كانت بتجيب حجوزات كل العيادات، دلوقتي بتتفلتر
// بعيادة الأدمن الحالي زي useGetAdminStats
export const useGetAdminAppointments = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useQuery({
    queryKey: ['admin-appointments', clinicId],
    queryFn: async () => {
      const { data } = await api.get('/admin/appointments', {
        params: { clinic_id: clinicId },
      })
      return data
    },
    enabled: !!token && !!clinicId,
    retry: false,
  })
}

// حذف حجز (للأدمن)
export const useDeleteAdminAppointment = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/admin/appointments/${id}`, {
        params: { clinic_id: clinicId },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments', clinicId] })
    },
  })
}

// جلب رسائل "اتصل بنا" الخاصة بالعيادة (للأدمن)
export const useGetAdminContactMessages = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useQuery({
    queryKey: ['admin-contact-messages', clinicId],
    queryFn: async () => {
      const res = await api.get('/admin/contact-messages', {
        params: { clinic_id: clinicId },
      })
      return res.data // يرجع ك object يحتوي على { success: true, data: [...] }
    },
    enabled: !!token && !!clinicId,
    retry: false,
  })
}

// حذف رسالة "اتصل بنا"
export const useDeleteContactMessage = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/admin/contact-messages/${id}`, {
        params: { clinic_id: clinicId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages', clinicId] })
      toast.success('تم حذف الرسالة بنجاح')
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'فشل حذف الرسالة، يرجى المحاولة لاحقاً'
      toast.error(errorMessage)
    },
  })
}
// جلب كل التقييمات (للأدمن) — كانت بتجيب تقييمات كل العيادات، دلوقتي بتتفلتر
export const useGetAdminReviews = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useQuery({
    queryKey: ['admin-reviews', clinicId],
    queryFn: async () => {
      const res = await api.get('/admin/reviews', {
        params: { clinic_id: clinicId },
      })
      return res.data // يرجع ك objeto يحتوي على { success: true, data: [...] }
    },
    enabled: !!token && !!clinicId,
    retry: false,
  })
}

// حذف تقييم (للأدمن)
export const useDeleteReview = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinic_id || user?.clinic?.id

  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/admin/reviews/${id}`, {
        params: { clinic_id: clinicId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews', clinicId] })
    },
  })
}

// جلب إحصائيات الداشبورد الخاصة بعيادة الأدمن الحالي
export const useGetAdminStats = () => {
  // سحب البيانات من الـ Zustand Store
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // استخراج معرف العيادة بالطريقة الآمنة بعد تحديث الـ AuthUser
  const clinicId = user?.clinic_id || user?.clinic?.id;

  return useQuery({
    queryKey: ['adminStats', clinicId],
    queryFn: async () => {
      // إرسال معرف العيادة في الـ Parameters لتجنب أخطاء السيرفر 500
      const { data } = await api.get('/admin/dashboard-stats', {
        params: { clinic_id: clinicId },
      });
      return data.data;
    },
    // التأكد من توفر التوكن ومعرف العيادة قبل تنفيذ الطلب لتفادي انهيار الباك إند
    enabled: !!token && !!clinicId,
    retry: false,
  });
};