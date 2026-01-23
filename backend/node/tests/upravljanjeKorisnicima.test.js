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


describe('Funkcionalnost: Upravljanje korisnicima', () => {
  const adminToken = jwt.sign({ id: 1, role: 'admin' }, TAJNA);
  beforeEach(() => { vi.resetAllMocks(); });

  it('TC-5.1: Uspješno brisanje', async () => {
    mPool.query.mockResolvedValueOnce({ rowCount: 1 }); 
    const res = await request(app)
      .delete('/api/admin/users/10')
      .set('Cookie', [`token=${adminToken}`]);
    console.log('TC-5.1 Odgovor:', res.body);
    expect(res.statusCode).toBe(200);
  });

  it('TC-5.2: Korisnik ne postoji', async () => {
    mPool.query.mockResolvedValueOnce({ rowCount: 0 }); 
    const res = await request(app)
      .delete('/api/admin/users/999')
      .set('Cookie', [`token=${adminToken}`]);
    console.log('TC-5.2 Odgovor:', res.body);
    expect([200, 404]).toContain(res.statusCode);
  });
});