-- =========================================
-- SMARTLIB LIBRARY MANAGEMENT SYSTEM
-- FULL DATABASE SCHEMA
-- =========================================

-- Drop tables if already exist (to avoid errors while re-running)
DROP TABLE IF EXISTS fine CASCADE;
DROP TABLE IF EXISTS issue CASCADE;
DROP TABLE IF EXISTS librarian CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS profile CASCADE;
DROP TABLE IF EXISTS auth CASCADE;

-- =========================================
-- 1. AUTH TABLE (LOGIN DATA)
-- =========================================
CREATE TABLE auth (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'librarian'))
);

-- =========================================
-- 2. PROFILE TABLE (MAIN USER ENTITY)
-- =========================================
CREATE TABLE profile (
    id INT PRIMARY KEY REFERENCES auth(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'librarian')),
    completed BOOLEAN DEFAULT FALSE
);

-- =========================================
-- 3. STUDENT TABLE
-- =========================================
CREATE TABLE student (
    student_id SERIAL PRIMARY KEY,
    profile_id INT UNIQUE REFERENCES profile(id) ON DELETE CASCADE
);

-- =========================================
-- 4. LIBRARIAN TABLE
-- =========================================
CREATE TABLE librarian (
    librarian_id SERIAL PRIMARY KEY,
    profile_id INT UNIQUE REFERENCES profile(id) ON DELETE CASCADE,
    librarian_name VARCHAR(255) NOT NULL
);

-- =========================================
-- 5. ISSUE TABLE (BOOK TRANSACTIONS)
-- =========================================
CREATE TABLE issue (
    issue_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE
);

-- =========================================
-- 6. FINE TABLE
-- =========================================
CREATE TABLE fine (
    fine_id SERIAL PRIMARY KEY,
    issue_id INT UNIQUE REFERENCES issue(issue_id) ON DELETE CASCADE,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE
);

-- =========================================
-- SAMPLE DATA (FOR DEMO PURPOSE)
-- =========================================

-- Insert into auth
INSERT INTO auth (email, password, full_name, role)
VALUES 
('student1@gmail.com', 'pass123', 'Karan Kumar', 'student'),
('librarian1@gmail.com', 'pass123', 'Admin User', 'librarian');

-- Insert into profile
INSERT INTO profile (id, role, completed)
VALUES 
(1, 'student', TRUE),
(2, 'librarian', TRUE);

-- Insert into student
INSERT INTO student (profile_id)
VALUES (1);

-- Insert into librarian
INSERT INTO librarian (profile_id, librarian_name)
VALUES (2, 'Main Librarian');

-- Issue a book
INSERT INTO issue (student_id, due_date)
VALUES (1, CURRENT_DATE + INTERVAL '7 days');

-- Add fine (example)
INSERT INTO fine (issue_id, student_id, amount, is_paid)
VALUES (1, 1, 50.00, FALSE);

-- =========================================
-- USEFUL TEST QUERIES
-- =========================================

-- View all users
SELECT * FROM auth;

-- View profiles
SELECT * FROM profile;

-- View students
SELECT * FROM student;

-- View librarians
SELECT * FROM librarian;

-- View issued books
SELECT * FROM issue;

-- View fines
SELECT * FROM fine;