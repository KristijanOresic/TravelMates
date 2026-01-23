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

describe('Funkcionalnost: Provjera emaila', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('TC-3.1: Email već postoji u bazi', async () => {
    mPool.query.mockResolvedValueOnce({ rows: [{ email: 'test@fer.hr' }], rowCount: 1 });
    const res = await request(app).post('/check-email').send({ email: 'test@fer.hr' });
    console.log('TC-3.1 Odgovor:', res.body);
    expect(res.body.exists).toBe(true);
  });

  it('TC-3.2: Odbijanje bez emaila', async () => {
    const res = await request(app).post('/check-email').send({});
    console.log('TC-3.2 Odgovor:', res.body);
    expect(res.statusCode).toBe(400);
  });
});