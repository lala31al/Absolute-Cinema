const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('4. Review Endpoints', () => {
    let token;
    let localFilmId;
    let reviewId;

    const user = { username: 'rev_user', email: 'review@test.com', password: '123' };

    beforeAll(async () => {
        await db.query("DELETE FROM users WHERE email = ?", [user.email]);
        await request(app).post('/api/auth/register').send(user);
        const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
        token = login.body.token;

        const filmRes = await request(app).post('/api/films').send({ tmdb_id: 155 });
        localFilmId = filmRes.body.film_id;
    });

    afterAll(async () => {
        await db.query("DELETE FROM users WHERE email = ?", [user.email]);
    });

    test('POST /api/reviews - Create Review', async () => {
        const res = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${token}`)
            .send({ 
                film_id: localFilmId, 
                review_text: "Masterpiece movie!" 
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('review_id');
        reviewId = res.body.review_id;
    });

    test('PUT /api/reviews/:id - Update Review', async () => {
        const res = await request(app)
            .put(`/api/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ review_text: "Updated: The best Batman movie!" });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/updated/i);
    });

    test('DELETE /api/reviews/:id - Delete Review', async () => {
        const res = await request(app)
            .delete(`/api/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });
});