import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

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

describe('Funkcionalnost: Pogreške i Rutiranje', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('TC-6.1: Treba vratiti 404 za nepoznatu rutu', async () => {
    const res = await request(app).get('/api/nepostojece-putanje');
    console.log('TC-6.1 Odgovor:', res.body);
    expect(res.statusCode).toBe(404);
  });

  it('TC-6.2: Pad baze podataka (500)', async () => {
    mPool.query.mockImplementationOnce(() => { throw new Error("Simulirani pad baze"); });
    const res = await request(app).get('/api/attractions');
    console.log('TC-6.2 Odgovor:', res.body);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Greška na serveru");
  });
});