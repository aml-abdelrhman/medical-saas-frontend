import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import App from './App'
import LandingLayout from '@/components/layout/LandingLayout';
import ClinicLayout from '@/components/layout/clinicLayout';

import { SaasLandingPage } from '@/pages/medical/SaasLandingPage/landingpages' 
import { AboutDetails } from '@/pages/medical/landing-pages/AboutPage' 
import { LoginPage } from './pages/auth/LoginPage'
import { LandingPages } from '@/pages/medical/landing-pages/landingpages' 
import { RegisterPage } from './pages/auth/RegisterPage'
import { FavoritesIcon } from '@/pages/medical/favorites'
import { SaasPricing } from '@/pages/medical/SaasLandingPage/SaasPricing'

import AdminDashboard from '@/components/dashboard/admin/page'
import AdminDoctorsDashboard from '@/components/dashboard/admin/AdminDoctorsDashboard'
import { AdminLayout } from '@/components/dashboard/admin/AdminLayout'
import AdminSpecialtiesDashboard from '@/components/dashboard/admin/Admin-specialities'
import AdminServicesTable from '@/components/dashboard/admin/AdminServicesTable'
import AddServicePage from '@/components/dashboard/admin/AddServicePage'
import EditServicePage from '@/components/dashboard/admin/EditService' 
import AdminAvailabilityManagement from '@/components/dashboard/admin/AdminAvailabilityManagement'
import AdminAppointments from '@/components/dashboard/admin/AdminAppointments'
import AdminReviews from '@/components/dashboard/admin/AdminReviews'
import AdminUsersDashboard from '@/components/dashboard/admin/Users'
import Messages from '@/components/dashboard/admin/Messages';

import DoctorDashboard from '@/components/dashboard/doctor/page'
import PatientDashboard from '@/components/dashboard/patient/page'
import SpecialtyPage from '@/pages/medical/specialties/[slug]/page'
import { DoctorDetails } from './pages/medical/landing-pages/doctor-details'
import { DoctorsList } from '@/pages/medical/landing-pages/doctors'
import DoctorServicesDashboard from '@/components/dashboard/doctor/DoctorMyServices'
import { DoctorLayout } from '@/components/dashboard/doctor/DoctorLayout'
import DoctorAddService from '@/components/dashboard/doctor/DoctorAddService'
import DoctorEditService from '@/components/dashboard/doctor/EditServicePage'
import DoctorAvailabilityDashboard from '@/components/dashboard/doctor/DoctorAvailabilityDashboard'
import DoctorAppointments from '@/components/dashboard/doctor/DoctorAppointments' 
import DoctorReviews from '@/components/dashboard/doctor/DoctorReviews'

import { ServicesSection } from '@/pages/medical/landing-pages/ServicesSection' 
import { ServiceDetailsPage } from '@/pages/medical/landing-pages/ServiceDetailsPage' 
// @ts-ignore: Module has no declaration file
import { ClinicRegisterForm } from '@/pages/medical/ClinicRegisterForm'
import { MockCheckoutPage } from '@/pages/medical/checkout'
import { ClinicContactSection } from '@/pages/medical/landing-pages/news'


import SuperAdminDashboard from '@/components/dashboard/super-admin/page'
import { SuperAdminLayout } from '@/components/dashboard/super-admin/SuperAdminLayout'
import SuperAdminClinics from '@/components/dashboard/super-admin/clinics/page'
import SuperAdminPlans from '@/components/dashboard/super-admin/plans/page' 
import SuperAdminSubscriptions from '@/components/dashboard/super-admin/Subscriptions/page'
import SuperAdminAddClinic from '@/components/dashboard/super-admin/clinics/new/page'
import SuperAdminEditClinic from '@/components/dashboard/super-admin/clinics/[id]/edit/page'
import { AdminContactMessages } from '@/components/dashboard/super-admin/Contact/page'
const rootRoute = createRootRoute({ component: App })

// 1. مسار الـ LandingLayout العام
const landingLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'landing-layout',
  component: LandingLayout,
})

// 2. مسار تخطيط العيادة الواحدة (ClinicLayout)
const clinicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'clinics/$slug',
  component: ClinicLayout,
})

// الصفحات التسويقية العامة
const indexRoute = createRoute({ getParentRoute: () => landingLayoutRoute, path: '/', component: SaasLandingPage })
const aboutRoute = createRoute({ getParentRoute: () => landingLayoutRoute, path: '/AboutPage', component: AboutDetails })
const registerRoute = createRoute({ getParentRoute: () => landingLayoutRoute, path: '/register', component: RegisterPage })
const loginRoute = createRoute({ getParentRoute: () => landingLayoutRoute, path: '/login', component: LoginPage })
const favoritesRoute = createRoute({ getParentRoute: () => landingLayoutRoute, path: '/favorites', component: FavoritesIcon })
const servicesPageListRoute = createRoute({ getParentRoute: () => landingLayoutRoute, path: '/services', component: ServicesSection })
const serviceDetailsRoute = createRoute({ getParentRoute: () => landingLayoutRoute, path: 'services/$id', component: ServiceDetailsPage })

const clinicServiceDetailsRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute,
  path: 'services/$id',
  component: ServiceDetailsPage,
})

const registerClinicRoute = createRoute({
  getParentRoute: () => landingLayoutRoute,
  path: 'register-clinic',
  component: ClinicRegisterForm,
})

// 3. مسارات العيادة الفرعية التسويقية
const clinicLandingRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute,
  path: '/',
  component: LandingPages,
})

const clinicAboutRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute,
  path: 'about',
  component: AboutDetails,
})

const clinicDoctorsRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute,
  path: 'doctors',
  component: DoctorsList,
})

const clinicDoctorDetailsRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute,
  path: 'doctors/$doctorSlug',
  component: DoctorDetails,
})

const clinicSpecialtiesRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute,
  path: 'specialties/$specialtySlug',
  component: SpecialtyPage,
})

const clinicServicesRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute,
  path: 'services',
  component: ServicesSection,
})


// مسارات لوحات التحكم الخاصة بالعيادة (عبر Slug العيادة)
const clinicAdminLayoutRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute,
  path: 'dashboard/admin',
  component: () => <AdminLayout><Outlet /></AdminLayout>
})

const clinicDoctorLayoutRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute,
  path: 'dashboard/doctor',
  component: () => <DoctorLayout><Outlet /></DoctorLayout>
})

// مسارات الأدمن العامة للعيادة
const clinicAdminDashboardRoute = createRoute({ getParentRoute: () => clinicAdminLayoutRoute, path: '/', component: AdminDashboard })
const clinicAdminDoctorsRoute = createRoute({ getParentRoute: () => clinicAdminLayoutRoute, path: 'doctors', component: AdminDoctorsDashboard })
const clinicAdminSpecialtiesRoute = createRoute({ getParentRoute: () => clinicAdminLayoutRoute, path: 'specialties', component: AdminSpecialtiesDashboard })
const clinicAdminServicesRoute = createRoute({ getParentRoute: () => clinicAdminLayoutRoute, path: 'services', component: AdminServicesTable }) 
const clinicAddServiceRoute = createRoute({ getParentRoute: () => clinicAdminLayoutRoute, path: 'services/add', component: AddServicePage })
const clinicEditServiceRoute = createRoute({ getParentRoute: () => clinicAdminLayoutRoute, path: 'services/edit/$id', component: EditServicePage })
const clinicAdminAppointmentsRoute = createRoute({ getParentRoute: () => clinicAdminLayoutRoute, path: 'appointments', component: AdminAppointments })
const clinicAdminReviewsRoute = createRoute({ getParentRoute: () => clinicAdminLayoutRoute, path: 'reviews', component: AdminReviews })
const clinicDoctorScheduleRoute = createRoute({ getParentRoute: () => clinicAdminLayoutRoute, path: 'work-schedule/$doctorId', component: AdminAvailabilityManagement })
const clinicAdminUsersRoute = createRoute({ getParentRoute: () => clinicAdminLayoutRoute, path: 'users', component: AdminUsersDashboard })
const adminContactMessagesRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute, // أو الروت الأب المناسب عندك
  path: 'contact-messages',
  component: AdminContactMessages,
})

// مسارات الدكتور الخاصة بالعيادة
const clinicDoctorDashboardRoute = createRoute({ getParentRoute: () => clinicDoctorLayoutRoute, path: '/', component: DoctorDashboard })
const clinicDoctorServicesRoute = createRoute({ getParentRoute: () => clinicDoctorLayoutRoute, path: 'my-services', component: DoctorServicesDashboard })
const clinicAddDoctorServiceRoute = createRoute({ getParentRoute: () => clinicDoctorLayoutRoute, path: 'my-services/add', component: DoctorAddService })
const clinicEditDoctorServiceRoute = createRoute({ getParentRoute: () => clinicDoctorLayoutRoute, path: 'my-services/edit/$id', component: DoctorEditService })
const clinicDoctorAvailabilityRoute = createRoute({ getParentRoute: () => clinicDoctorLayoutRoute, path: 'availability', component: DoctorAvailabilityDashboard })
const clinicDoctorAppointmentsRoute = createRoute({ getParentRoute: () => clinicDoctorLayoutRoute, path: 'appointments', component: DoctorAppointments }) 
const clinicDoctorReviewsRoute = createRoute({ getParentRoute: () => clinicDoctorLayoutRoute, path: 'reviews', component: DoctorReviews }) 

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: SaasPricing,
})

export const mockCheckoutRoute = createRoute ({
  getParentRoute: () => rootRoute,
  path: '/mock-checkout',
  component: MockCheckoutPage,
})

// 4. تخطيط الأدمن (عام - للموقع الرئيسي)
const adminLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: 'dashboard/admin', component: () => <AdminLayout><Outlet /></AdminLayout> })

const adminDashboardRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/', component: AdminDashboard })
const adminDoctorsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'doctors', component: AdminDoctorsDashboard })
const adminSpecialtiesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'specialties', component: AdminSpecialtiesDashboard })
const adminServicesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'services', component: AdminServicesTable }) 
const addServiceRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'services/add', component: AddServicePage })
const editServiceRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'services/edit/$id', component: EditServicePage })
export const adminAppointmentsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'appointments', component: AdminAppointments })
export const adminReviewsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'reviews', component: AdminReviews })
export const doctorScheduleRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'work-schedule/$doctorId', component: AdminAvailabilityManagement })
const adminUsersRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: 'users', component: AdminUsersDashboard })
const MessagesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'contact-messages', // سيصبح مسارها الكامل /dashboard/admin/contact-messages
  component: Messages,
})

// 5. تخطيط الدكتور (عام) والمريض
const patientRoute = createRoute({ getParentRoute: () => rootRoute, path: '/dashboard/patient', component: PatientDashboard })
const doctorLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: 'dashboard/doctor', component: () => <DoctorLayout><Outlet /></DoctorLayout> })

const doctorDashboardRoute = createRoute({ getParentRoute: () => doctorLayoutRoute, path: '/', component: DoctorDashboard })
const doctorServicesRoute = createRoute({ getParentRoute: () => doctorLayoutRoute, path: 'my-services', component: DoctorServicesDashboard })
const addDoctorServiceRoute = createRoute({ getParentRoute: () => doctorLayoutRoute, path: 'my-services/add', component: DoctorAddService })
const editDoctorServiceRoute = createRoute({ getParentRoute: () => doctorLayoutRoute, path: 'my-services/edit/$id', component: DoctorEditService })
const doctorAvailabilityRoute = createRoute({ getParentRoute: () => doctorLayoutRoute, path: 'availability', component: DoctorAvailabilityDashboard })
const doctorAppointmentsRoute = createRoute({ getParentRoute: () => doctorLayoutRoute, path: 'appointments', component: DoctorAppointments }) 
const doctorReviewsRoute = createRoute({ getParentRoute: () => doctorLayoutRoute, path: 'reviews', component: DoctorReviews }) 

// 6. تخطيط السوبر أدمن (Super Admin Layout & Routes)
const superAdminLayoutRoute = createRoute({ 
  getParentRoute: () => rootRoute, 
  path: 'dashboard/super-admin', 
  component: SuperAdminLayout 
})

const superAdminDashboardRoute = createRoute({ 
  getParentRoute: () => superAdminLayoutRoute, 
  path: '/', 
  component: SuperAdminDashboard 
})

const superAdminClinicsRoute = createRoute({ 
  getParentRoute: () => superAdminLayoutRoute, 
  path: 'clinics', 
  component: SuperAdminClinics 
})

const superAdminAddClinicRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: 'clinics/new',
  component: SuperAdminAddClinic,
})

const superAdminEditClinicRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: 'clinics/$clinicId/edit',
  component: SuperAdminEditClinic,
})

const superAdminPlansRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: 'plans', 
  component: SuperAdminPlans,
})

const superAdminSubscriptionsRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: 'subscriptions', 
  component: SuperAdminSubscriptions,
})

export const contactMessagesRoute = createRoute({
  getParentRoute: () => superAdminLayoutRoute,
  path: 'contact-messages',
  component: AdminContactMessages,
})

const clinicPatientRoute = createRoute({
  getParentRoute: () => clinicLayoutRoute,
  path: 'dashboard/patient',
  component: PatientDashboard,
})

export const consultationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/consultation',
  component: ClinicContactSection,
})

// 7. تجميع الروتر مع ربط كافة المسارات ومعالجة الأخطاء (404)
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    landingLayoutRoute.addChildren([
      indexRoute, 
      aboutRoute, 
      registerRoute, 
      loginRoute, 
      servicesPageListRoute, 
      favoritesRoute,
      serviceDetailsRoute,
      registerClinicRoute, 
      pricingRoute,
      mockCheckoutRoute,
      consultationRoute,
    ]),
    clinicLayoutRoute.addChildren([
      clinicLandingRoute,
      clinicAboutRoute,
      clinicDoctorsRoute,
      clinicDoctorDetailsRoute,
      clinicSpecialtiesRoute,
      clinicServicesRoute,
      clinicServiceDetailsRoute,
      // إضافة لوحات التحكم الخاصة بالعيادة هنا لكي يتعرف عليها النظام تماماً
      clinicAdminLayoutRoute.addChildren([
        clinicAdminDashboardRoute,
        clinicAdminDoctorsRoute,
        clinicAdminSpecialtiesRoute,
        clinicAdminServicesRoute,
        clinicAddServiceRoute,
        clinicEditServiceRoute,
        clinicAdminAppointmentsRoute,
        clinicAdminReviewsRoute,
        clinicDoctorScheduleRoute,
        clinicAdminUsersRoute,
      ]),
      clinicDoctorLayoutRoute.addChildren([
        clinicDoctorDashboardRoute,
        clinicDoctorServicesRoute,
        clinicAddDoctorServiceRoute,
        clinicEditDoctorServiceRoute,
        clinicDoctorAvailabilityRoute,
        clinicDoctorAppointmentsRoute,
        clinicDoctorReviewsRoute,
      ]),
    ]),
    adminLayoutRoute.addChildren([
      adminDashboardRoute, adminDoctorsRoute, adminSpecialtiesRoute, adminServicesRoute,
      addServiceRoute, editServiceRoute, doctorScheduleRoute, adminAppointmentsRoute,
      adminReviewsRoute, adminUsersRoute,
    MessagesRoute, // تأكد من وجودها هنا
    ]),
    doctorLayoutRoute.addChildren([
      doctorDashboardRoute, doctorServicesRoute, addDoctorServiceRoute, editDoctorServiceRoute,
      doctorAvailabilityRoute, doctorAppointmentsRoute, doctorReviewsRoute,
    ]),
    superAdminLayoutRoute.addChildren([
      superAdminDashboardRoute,
      superAdminClinicsRoute,
      superAdminAddClinicRoute,
      superAdminEditClinicRoute,
      superAdminPlansRoute,
      superAdminSubscriptionsRoute,
      contactMessagesRoute,
    ]),
    patientRoute,
    clinicPatientRoute
  ]),

  defaultNotFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center" dir="rtl">
      <h1 className="text-4xl font-bold mb-4 text-teal-400">404</h1>
      <p className="text-slate-300 mb-6">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
      <a href="/" className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all">
        العودة للرئيسية
      </a>
    </div>
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}