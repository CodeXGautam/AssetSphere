import { LandingNav }    from "@/components/landing/landing-nav";
import { Hero }          from "@/components/landing/hero";
import { HowItWorks }   from "@/components/landing/how-it-works";
import { Features }     from "@/components/landing/features";
import { ForWho }       from "@/components/landing/for-who";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[--bg] text-[--fg]">
      <LandingNav />
      <Hero />
      <HowItWorks />
      <Features />
      <ForWho />
      <LandingFooter />
    </div>
  );
}
