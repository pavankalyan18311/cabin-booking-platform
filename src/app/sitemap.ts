import type { MetadataRoute } from 'next';
import { getAllRoomsAdmin } from '@/services/rooms.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://relaxcabin.web.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/rooms`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  try {
    const rooms = await getAllRoomsAdmin();
    const roomRoutes: MetadataRoute.Sitemap = rooms.map((room) => ({
      url: `${baseUrl}/rooms/${room.id}`,
      lastModified: new Date(room.updatedAt),
      changeFrequency: 'weekly',
      priority: room.isFeatured ? 0.9 : 0.7,
    }));
    return [...staticRoutes, ...roomRoutes];
  } catch {
    return staticRoutes;
  }
}
