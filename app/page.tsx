import Navbar from '@/components/sections/Navbar';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import TrustStrip from '@/components/sections/TrustStrip';
import EdgeHighlights from '@/components/sections/EdgeHighlights';
import DomainExpertise from '@/components/sections/DomainExpertise';
import CourseSegmentation from '@/components/sections/CourseSegmentation';
import WhoShouldJoin from '@/components/sections/WhoShouldJoin';
import Framework from '@/components/sections/Framework';
import Faq from '@/components/sections/Faq';
import Testimonials from '@/components/sections/Testimonials';
import CtaBanner from '@/components/sections/CtaBanner';
import Footer from '@/components/sections/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <TrustStrip />
        <EdgeHighlights />
        <DomainExpertise />
        <CourseSegmentation />
        <WhoShouldJoin />
        <Framework />
        <Faq />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
