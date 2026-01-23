import { describe, it, expect, vi } from 'vitest';
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

describe('Funkcionalnost: Autentifikacija (Security)', () => {
  it('TC-4.1: Treba vratiti 401 za neispravan token', async () => {
    const res = await request(app)
      .get('/me') 
      .set('Cookie', ['token=neispravan-token-123']);
    console.log('TC-4.1 Odgovor:', res.body);
    expect(res.statusCode).toBe(401);
  });
});