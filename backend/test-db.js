const db = require('./config/db');

async function test() {
    try {
        const [rows] = await db.execute('SELECT 1');
        console.log('Database connected ✅');
        process.exit();
    } catch (err) {
        console.error('DB error:', err);
    }
}

test();
