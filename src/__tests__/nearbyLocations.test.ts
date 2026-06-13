import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NearbyLocation } from '@/types';

// ── Mock Firebase Firestore (used only for getNearbyLocations) ────────────────
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs:    vi.fn(),
  orderBy:    vi.fn(),
  query:      vi.fn(),
}));

vi.mock('@/lib/firebase/config', () => ({
  db:   {},
  auth: {
    currentUser: { getIdToken: vi.fn().mockResolvedValue('test-token') },
  },
}));

vi.mock('@/lib/firebase/collections', () => ({
  COLLECTIONS: { NEARBY_LOCATIONS: 'nearby_locations' },
}));

import * as firestore from 'firebase/firestore';
import {
  getNearbyLocations,
  addNearbyLocation,
  updateNearbyLocation,
  deleteNearbyLocation,
} from '@/services/nearbyLocations.service';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeLocation(overrides: Partial<NearbyLocation> = {}): NearbyLocation {
  return {
    id:         'loc-1',
    name:       'Mountain View Cafe',
    distance:   2.5,
    approxTime: '~5 min drive',
    createdAt:  '2025-01-01T00:00:00.000Z',
    updatedAt:  '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// ─── getNearbyLocations ───────────────────────────────────────────────────────

describe('getNearbyLocations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an empty array when there are no documents', async () => {
    vi.mocked(firestore.query).mockReturnValue('q' as never);
    vi.mocked(firestore.getDocs).mockResolvedValue({ docs: [] } as never);

    const result = await getNearbyLocations();
    expect(result).toEqual([]);
  });

  it('maps Firestore documents to NearbyLocation objects', async () => {
    const loc = makeLocation();
    const { id, ...locData } = loc;
    vi.mocked(firestore.query).mockReturnValue('q' as never);
    vi.mocked(firestore.getDocs).mockResolvedValue({
      docs: [{ id, data: () => locData }],
    } as never);

    const result = await getNearbyLocations();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(loc.id);
    expect(result[0].name).toBe(loc.name);
    expect(result[0].approxTime).toBe(loc.approxTime);
  });

  it('sorts by distance ascending', async () => {
    const far   = makeLocation({ id: 'c', distance: 10 });
    const close = makeLocation({ id: 'a', distance: 0.5 });
    const mid   = makeLocation({ id: 'b', distance: 3 });

    vi.mocked(firestore.query).mockReturnValue('q' as never);
    vi.mocked(firestore.getDocs).mockResolvedValue({
      docs: [far, close, mid].map((l) => {
        const { id, ...data } = l;
        return { id, data: () => data };
      }),
    } as never);

    const result = await getNearbyLocations();
    expect(result[0].distance).toBe(0.5);
    expect(result[1].distance).toBe(3);
    expect(result[2].distance).toBe(10);
  });
});

// ─── addNearbyLocation ────────────────────────────────────────────────────────

describe('addNearbyLocation', () => {
  const mockFetch = vi.fn();

  beforeEach(() => vi.stubGlobal('fetch', mockFetch));
  afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it('returns the new location id from the API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'new-loc-id' }),
    });

    const id = await addNearbyLocation({ name: 'Pine Store', distance: 0.5, approxTime: '~2 min drive' });
    expect(id).toBe('new-loc-id');
  });

  it('sends the correct data in the request body', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'x' }) });

    await addNearbyLocation({ name: 'Trail Head', distance: 1.2, approxTime: '~8 min drive' });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.name).toBe('Trail Head');
    expect(body.distance).toBe(1.2);
    expect(body.approxTime).toBe('~8 min drive');
  });

  it('throws when the API returns an error', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Forbidden' }) });

    await expect(
      addNearbyLocation({ name: 'X', distance: 1, approxTime: '~5 min' })
    ).rejects.toThrow('Forbidden');
  });
});

// ─── updateNearbyLocation ─────────────────────────────────────────────────────

describe('updateNearbyLocation', () => {
  const mockFetch = vi.fn();

  beforeEach(() => vi.stubGlobal('fetch', mockFetch));
  afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it('calls PATCH with the correct URL and data', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });

    await updateNearbyLocation('loc-1', { distance: 3.5 });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/nearby/loc-1',
      expect.objectContaining({ method: 'PATCH' })
    );
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.distance).toBe(3.5);
  });

  it('throws when the API returns an error', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Not found' }) });

    await expect(updateNearbyLocation('bad-id', { name: 'X' })).rejects.toThrow('Not found');
  });
});

// ─── deleteNearbyLocation ─────────────────────────────────────────────────────

describe('deleteNearbyLocation', () => {
  const mockFetch = vi.fn();

  beforeEach(() => vi.stubGlobal('fetch', mockFetch));
  afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it('calls DELETE with the correct URL', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });

    await deleteNearbyLocation('loc-42');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/nearby/loc-42',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('throws when the API returns an error', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Server error' }) });

    await expect(deleteNearbyLocation('x')).rejects.toThrow('Server error');
  });
});
