import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
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
describe('Funkcionalnost: Dodavanje atrakcija (POST)', () => {
  const adminToken = jwt.sign({ id: 1, role: 'editor' }, TAJNA);
  beforeEach(() => { vi.resetAllMocks(); });

  it('TC-2.1: Uspješno dodavanje s admin tokenom', async () => {
    mPool.query.mockResolvedValueOnce({ rows: [{ idAttraction: 1 }] });
    const res = await request(app)
      .post('/api/attractions')
      .set('Cookie', [`token=${adminToken}`])
      .send({ name: "Split", description: "Opis", location_lat: 43.5, location_lng: 16.4 });
    console.log('TC-2.1 Odgovor:', res.body);
    expect([200, 201]).toContain(res.statusCode);
  });

  it('TC-2.2: Prihvaćanje koordinata kao tekst', async () => {
    mPool.query.mockResolvedValueOnce({ rows: [{ idAttraction: 2 }] });
    const res = await request(app)
      .post('/api/attractions')
      .set('Cookie', [`token=${adminToken}`])
      .send({ name: "Zadar", description: "Opis", location_lat: "44.1", location_lng: "15.2" });
    expect(res.statusCode).not.toBe(400);
  });

  it('TC-2.3: Odbijanje zahtjeva bez naziva', async () => {
    const res = await request(app)
      .post('/api/attractions')
      .set('Cookie', [`token=${adminToken}`])
      .send({ location_lat: 44.1, location_lng: 15.2 });
    console.log('TC-2.3 Odgovor:', res.body);
    expect(res.statusCode).toBe(400);
  });
});