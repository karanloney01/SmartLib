-- =========================================
-- SMARTLIB LIBRARY MANAGEMENT SYSTEM
-- DAY 1: AUTH & PROFILE TABLES
-- =========================================

-- Drop tables if already exist (to avoid errors while re-running)
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
-- SAMPLE DATA
-- =========================================
INSERT INTO auth (email, password, full_name, role)
VALUES 
('student1@gmail.com', 'pass123', 'Karan Kumar', 'student'),
('librarian1@gmail.com', 'pass123', 'Admin User', 'librarian');

INSERT INTO profile (id, role, completed)
VALUES 
(1, 'student', FALSE),
(2, 'librarian', FALSE);
