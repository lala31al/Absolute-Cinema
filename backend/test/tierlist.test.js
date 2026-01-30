const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('3. Tier List Endpoints', () => {
    let token, listId, filmId;
    const user = { username: 'tier_user', email: 'tier@test.com', password: '123' };

    beforeAll(async () => {
        await db.query("DELETE FROM users WHERE email = ?", [user.email]);
        await request(app).post('/api/auth/register').send(user);
        const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
        token = login.body.token;

        const film = await request(app).post('/api/films').send({ tmdb_id: 155 });
        filmId = film.body.film_id;
    });

    afterAll(async () => {
        await db.query("DELETE FROM users WHERE email = ?", [user.email]);
    });

    test('POST /api/tierlists - Buat List Baru', async () => {
        const res = await request(app)
            .post('/api/tierlists')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: "Best Action Movies", description: "Top tier list" });

        expect(res.statusCode).toBe(200);
        listId = res.body.tier_list_id;
    });

    test('POST /api/tierlists/:id/films - Tambah Film ke List', async () => {
        const res = await request(app)
            .post(`/api/tierlists/${listId}/films`)
            .set('Authorization', `Bearer ${token}`)
            .send({ film_id: filmId, position: 1 });

        expect(res.statusCode).toBe(200);
    });

    test('DELETE /api/tierlists/:id - Hapus List', async () => {
        const res = await request(app)
            .delete(`/api/tierlists/${listId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });
});