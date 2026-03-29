require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes

// 1. Auth & Registration
app.post('/api/auth/register', async (req, res) => {
  const client = await db.connect();
  try {
    const { email, password, role, full_name } = req.body;
    await client.query('BEGIN');
    const authRes = await client.query(
      'INSERT INTO auth (email, password, role, full_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, password, role, full_name || '']
    );
    const authId = authRes.rows[0].id;
    await client.query(
      'INSERT INTO profile (id, role, completed) VALUES ($1, $2, false)',
      [authId, role]
    );
    await client.query('COMMIT');
    res.status(201).json({ message: 'User registered successfully', id: authId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const authRes = await db.query('SELECT * FROM auth WHERE email = $1 AND password = $2', [email, password]);
    if (authRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = authRes.rows[0];
    const profileRes = await db.query('SELECT * FROM profile WHERE id = $1', [user.id]);
    res.status(200).json({ message: 'Login successful', user: { id: user.id, role: user.role, email: user.email, full_name: user.full_name }, completed: profileRes.rows[0].completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
