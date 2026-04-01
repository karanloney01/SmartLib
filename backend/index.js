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
    const { email, password, role } = req.body;
    await client.query('BEGIN');
    const authRes = await client.query(
      'INSERT INTO auth (email, password, role) VALUES ($1, $2, $3) RETURNING id',
      [email, password, role]
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

// 1.5. Onboarding (Complete Profile)
app.post('/api/profile/complete', async (req, res) => {
  const client = await db.connect();
  try {
    const { id, full_name, librarian_name } = req.body;
    await client.query('BEGIN');
    const profileRes = await client.query('SELECT * FROM profile WHERE id = $1', [id]);
    if (profileRes.rows.length === 0) return res.status(404).json({error: 'Profile not found'});
    
    const role = profileRes.rows[0].role;
    await client.query('UPDATE auth SET full_name = $1 WHERE id = $2', [full_name, id]);
    
    if (role === 'student') {
      await client.query('INSERT INTO student (profile_id) VALUES ($1) ON CONFLICT DO NOTHING', [id]);
    } else {
      await client.query('INSERT INTO librarian (profile_id, librarian_name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, librarian_name || full_name]);
    }
    await client.query('UPDATE profile SET completed = true WHERE id = $1', [id]);
    
    const updatedAuth = await client.query('SELECT * FROM auth WHERE id = $1', [id]);
    await client.query('COMMIT');
    
    res.status(200).json({ message: 'Profile completed successfully', user: updatedAuth.rows[0] });
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

// 2. Profile
app.get('/api/profile', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Profile ID is required' });
    const profileRes = await db.query('SELECT * FROM profile WHERE id = $1', [id]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    let specificData = {};
    if (profileRes.rows[0].role === 'student') {
      const resSpecific = await db.query('SELECT * FROM student WHERE profile_id = $1', [id]);
      specificData = resSpecific.rows[0];
    } else {
      const resSpecific = await db.query('SELECT * FROM librarian WHERE profile_id = $1', [id]);
      specificData = resSpecific.rows[0];
    }
    res.status(200).json({ profile: profileRes.rows[0], details: specificData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Issue Book
app.post('/api/issue', async (req, res) => {
  try {
    const { student_id } = req.body;
    const issueRes = await db.query(
      "INSERT INTO issue (student_id, issue_date, due_date) VALUES ($1, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days') RETURNING *",
      [student_id]
    );
    res.status(201).json({ message: 'Book issued successfully', issue: issueRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Return Book
app.post('/api/return', async (req, res) => {
  const client = await db.connect();
  try {
    const { issue_id } = req.body;
    await client.query('BEGIN');
    const updateRes = await client.query(
      'UPDATE issue SET return_date = CURRENT_DATE WHERE issue_id = $1 RETURNING *',
      [issue_id]
    );
    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Issue record not found' });
    }
    const issue = updateRes.rows[0];
    const dueDate = new Date(issue.due_date);
    const returnDate = new Date(issue.return_date);
    let fineAmount = 0;
    let message = 'Book returned successfully';
    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 10;
      await client.query(
        'INSERT INTO fine (issue_id, student_id, amount, is_paid) VALUES ($1, $2, $3, false)',
        [issue_id, issue.student_id, fineAmount]
      );
      message += `. A fine of ${fineAmount} was added.`;
    }
    await client.query('COMMIT');
    res.status(200).json({ message, fineAmount });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// 5. Pay Fine
app.post('/api/fine/pay', async (req, res) => {
  try {
    const { fine_id } = req.body;
    const result = await db.query(
      'UPDATE fine SET is_paid = true, paid_date = CURRENT_DATE WHERE fine_id = $1 RETURNING *',
      [fine_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fine not found' });
    }
    res.status(200).json({ message: 'Fine paid successfully', fine: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.student_id, a.full_name, a.email, p.completed 
       FROM student s 
       JOIN profile p ON s.profile_id = p.id 
       JOIN auth a ON a.id = p.id`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/issues', async (req, res) => {
  try {
    const { student_id } = req.query;
    let query = 'SELECT * FROM issue';
    let params = [];
    if (student_id) {
       query += ' WHERE student_id = $1';
       params.push(student_id);
    }
    query += ' ORDER BY issue_date DESC';
    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/fines', async (req, res) => {
  try {
    const { student_id } = req.query;
    let query = 'SELECT * FROM fine';
    let params = [];
    if (student_id) {
       query += ' WHERE student_id = $1';
       params.push(student_id);
    }
    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});