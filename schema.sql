-- User Authentication and Profiles
CREATE TABLE auth (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE profile (
    id INT PRIMARY KEY REFERENCES auth(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE student (
    student_id SERIAL PRIMARY KEY,
    auth_id INT UNIQUE REFERENCES auth(id) ON DELETE CASCADE
);

CREATE TABLE librarian (
    librarian_id SERIAL PRIMARY KEY,
    auth_id INT UNIQUE REFERENCES auth(id) ON DELETE CASCADE,
    librarian_name VARCHAR(255) NOT NULL
);

-- Library Metadata
CREATE TABLE author (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE publisher (
    publisher_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Core Library Items
CREATE TABLE book (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    published_year INT,
    author_id INT REFERENCES author(author_id) ON DELETE SET NULL,
    category_id INT REFERENCES category(category_id) ON DELETE SET NULL,
    publisher_id INT REFERENCES publisher(publisher_id) ON DELETE SET NULL,
    librarian_id INT REFERENCES librarian(librarian_id) ON DELETE SET NULL
);

-- Physical Copies (Libraries have multiple copies of the same book)
CREATE TABLE book_copy (
    copy_id SERIAL PRIMARY KEY,
    book_id INT REFERENCES book(book_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, ISSUED, LOST, DAMAGED
    shelf_location VARCHAR(100)
);

-- Transactions
CREATE TABLE issue (
    issue_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    copy_id INT REFERENCES book_copy(copy_id) ON DELETE CASCADE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE
);

CREATE TABLE fine (
    fine_id SERIAL PRIMARY KEY,
    issue_id INT UNIQUE REFERENCES issue(issue_id) ON DELETE CASCADE,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE
);

-- Reservations (When a book is not currently available)
CREATE TABLE reservation (
    reservation_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    book_id INT REFERENCES book(book_id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'PENDING' -- PENDING, FULFILLED, CANCELLED
);
