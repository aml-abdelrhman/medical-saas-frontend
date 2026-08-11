import { SaasHero } from "@/pages/medical/SaasLandingPage/SaasHero";
import { SaasFeatures } from "@/pages/medical/SaasLandingPage/SaasFeatures";
import { SaasPricing } from "@/pages/medical/SaasLandingPage/SaasPricing";
import { SaasFAQ } from "@/pages/medical/SaasLandingPage/SaasFAQ";
import { SaasContact } from "@/pages/medical/SaasLandingPage/SaasContact";
import { Testimonials } from "@/pages/medical/SaasLandingPage/Testimonials";

export function SaasLandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <div id="home">
                <SaasHero />
            </div>
            
            <div id="features">
                <SaasFeatures />
            </div>
            
            <div id="pricing">
                <SaasPricing />
            </div>
            
            <SaasFAQ />
            
            <Testimonials />
            
            <div id="contact">
                <SaasContact />
            </div>
        </div>
    );
}