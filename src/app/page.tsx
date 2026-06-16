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
  title: 'Relaxin Cabins — New Lisbon, WI Cabin Rentals',
  description: '7 unique rentals in New Lisbon, WI — traditional log cabins, beachside luxury suites, and a grand lodge. Open year-round, pet-friendly, minutes from Castle Rock Lake.',
  openGraph: {
    title: 'Relaxin Cabins — New Lisbon, WI Cabin Rentals',
    description: '7 unique rentals in New Lisbon, WI. Open year-round, pet-friendly, minutes from Castle Rock Lake.',
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
