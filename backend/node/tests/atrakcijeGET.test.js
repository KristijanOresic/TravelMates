import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import 'dotenv/config';

const TAJNA = process.env.SESSION_SECRET || 'fallback_secret'; 

const { mPool } = vi.hoisted(() => {
  return {
    mPool: {
      query: vi.fn(),
      connect: vi.fn(),
      on: vi.fn(),
    }
  };
});

vi.mock('pg', () => {
  const Pool = vi.fn(function () { return mPool; });
  return { default: { Pool }, Pool };
});

import { app } from '../server.js';

describe('Funkcionalnost: Dohvat atrakcija (GET)', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('TC-1.1: Treba vratiti 200 OK i listu atrakcija', async () => {
    const mockData = [{ idAttraction: 1, nameAttraction: 'Dubrovnik' }];
    mPool.query.mockResolvedValueOnce({ rows: mockData });
    const res = await request(app).get('/api/attractions');
    console.log('TC-1.1 Odgovor:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  it('TC-1.2: Treba vratiti 200 i praznu listu', async () => {
    mPool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/attractions');
    console.log('TC-1.2 Odgovor:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});