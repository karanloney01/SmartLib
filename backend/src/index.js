const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartLib Backend is running' });
});

// Books API
app.get('/api/books', async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: { author: true, category: true, publisher: true }
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Students API
app.get('/api/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { auth: true }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Issues API
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      include: { student: { include: { auth: true } }, copy: { include: { book: true } } }
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
