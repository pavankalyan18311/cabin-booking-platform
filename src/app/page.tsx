import type { Metadata } from 'next';
import Hero from '@/components/shared/Hero';
import FeaturedRooms from '@/components/shared/FeaturedRooms';
import AmenitiesSection from '@/components/shared/AmenitiesSection';
import TestimonialsSection from '@/components/shared/TestimonialsSection';
import StatsSection from '@/components/shared/StatsSection';
import CabinShowcaseSection from '@/components/shared/CabinShowcaseSection';
import FAQSection from '@/components/shared/FAQSection';
import ContactSection from '@/components/shared/ContactSection';
import GallerySection from '@/components/shared/GallerySection';
import NearbyLocationsSection from '@/components/shared/NearbyLocationsSection';

export const metadata: Metadata = {
  title: 'Relax Cabin — Premium Cabin & Property Rentals',
  description: 'Discover handpicked luxury cabin retreats nestled in nature. Book your perfect escape today with Relax Cabin.',
  openGraph: {
    title: 'Relax Cabin — Premium Cabin & Property Rentals',
    description: 'Discover handpicked luxury cabin retreats nestled in nature.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsSection />
      <CabinShowcaseSection />
      <FeaturedRooms />
      <AmenitiesSection />
      <GallerySection />
      <NearbyLocationsSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}
