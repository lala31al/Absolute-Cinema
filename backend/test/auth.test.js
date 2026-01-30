const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('1. Auth Endpoints', () => {
    const testUser = {
        username: 'test_auth_user',
        email: 'auth_test@example.com',
        password: 'password123'
    };

    beforeAll(async () => {
        await db.query("DELETE FROM users WHERE email = ?", [testUser.email]);
    });

    afterAll(async () => {
        await db.query("DELETE FROM users WHERE email = ?", [testUser.email]);
    });

    test('POST /api/auth/register - Harus berhasil register user baru', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        expect(res.statusCode).toBeLessThan(300);
        expect(res.body).toHaveProperty('message');
    });

    test('POST /api/auth/login - Harus berhasil login & dapat token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});