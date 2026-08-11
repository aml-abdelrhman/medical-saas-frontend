import { Hero } from './Hero';
import { ContentSection } from './all-specialities';
import { DoctorsList } from './doctors';
import { ServicesSection } from './ServicesSection';
import { AboutAndFeatures } from './about-us';
import { ClinicContactSection } from './news';
import { LocationSection } from './WhereToFindUs';
import { TestimonialsSection } from './Testimonials';

export function LandingPages() {
  return (
    <>
      <Hero />
      
      <div id="services">
        <ContentSection />
      </div>

      <div id="doctors">
        <DoctorsList />
      </div>

      <ServicesSection />

      <div id="features">
        <AboutAndFeatures />
      </div>

      <TestimonialsSection />

      <div id="contact">
        <ClinicContactSection />
      </div>

      {/* <LocationSection /> */}
    </>
  );
}