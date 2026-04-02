require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================
   1. Register User
========================= */
app.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const result = await db.query(
      'INSERT INTO auth (email, password, role) VALUES ($1,$2,$3) RETURNING id',
      [email, password, role]
    );

    const id = result.rows[0].id;

    await db.query(
      'INSERT INTO profile (id, role, completed) VALUES ($1,$2,false)',
      [id, role]
    );

    res.json({ message: 'User registered', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

/* =========================
   2. Login
========================= */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT * FROM auth WHERE email=$1 AND password=$2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid login' });
    }

    res.json({ message: 'Login success', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   3. Complete Profile
========================= */
app.post('/profile', async (req, res) => {
  try {
    const { id, full_name } = req.body;

    await db.query(
      'UPDATE auth SET full_name=$1 WHERE id=$2',
      [full_name, id]
    );

    await db.query(
      'UPDATE profile SET completed=true WHERE id=$1',
      [id]
    );

    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating profile' });
  }
});

/* =========================
   4. Get Profile
========================= */
app.get('/profile', async (req, res) => {
  try {
    const { id } = req.query;

    const result = await db.query(
      'SELECT * FROM profile WHERE id=$1',
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

/* =========================
   5. Issue Book
========================= */
app.post('/issue', async (req, res) => {
  try {
    const { student_id } = req.body;

    const result = await db.query(
      "INSERT INTO issue (student_id, issue_date, due_date) VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days') RETURNING *",
      [student_id]
    );

    res.json({ message: 'Book issued', issue: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error issuing book' });
  }
});

/* =========================
   6. Return Book
========================= */
app.post('/return', async (req, res) => {
  try {
    const { issue_id } = req.body;

    const result = await db.query(
      'UPDATE issue SET return_date = CURRENT_DATE WHERE issue_id=$1 RETURNING *',
      [issue_id]
    );

    const issue = result.rows[0];

    if (!issue) {
      return res.status(404).json({ error: 'Not found' });
    }

    let fine = 0;

    if (new Date(issue.return_date) > new Date(issue.due_date)) {
      fine = 50;
    }

    res.json({ message: 'Book returned', fine });
  } catch (err) {
    res.status(500).json({ error: 'Error returning book' });
  }
});

/* =========================
   7. View Issues
========================= */
app.get('/issues', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM issue');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching issues' });
  }
});

/* =========================
   8. View Fines
========================= */
app.get('/fines', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM fine');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching fines' });
  }
});

/* =========================
   Start Server
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});