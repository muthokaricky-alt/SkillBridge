-- SkillBridge Database Schema
-- Compatible with MySQL 8.0+, PostgreSQL 12+, and SQLite 3+

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS coin_transactions;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS exchange_requests;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 1. USERS TABLE
-- Stores student user profiles and metrics
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    initials VARCHAR(10) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    reviews_count INT DEFAULT 0,
    swaps_count INT DEFAULT 0,
    skill_coins INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES TABLE
-- High-level categories for skills (e.g. Technology, Design, Business)
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. SKILLS TABLE
-- Catalog of skills available for offering or learning
CREATE TABLE skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. USER_SKILLS TABLE (Junction Table)
-- Maps skills offered (teach) or wanted (learn) by a user
CREATE TABLE user_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    skill_type VARCHAR(10) NOT NULL CHECK (skill_type IN ('offer', 'want')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_skill_type UNIQUE (user_id, skill_id, skill_type)
);

-- 5. EXCHANGE_REQUESTS TABLE
-- Tracks peer-to-peer exchange requests between students (Skill Swap or Skill Coin)
CREATE TABLE exchange_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    offered_skill_id INT,
    wanted_skill_id INT NOT NULL,
    request_type VARCHAR(10) NOT NULL CHECK (request_type IN ('swap', 'coin')),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'incoming' CHECK (status IN ('incoming', 'sent', 'accepted', 'declined')),
    time_label VARCHAR(50) DEFAULT 'Just now',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (offered_skill_id) REFERENCES skills(id) ON DELETE SET NULL,
    FOREIGN KEY (wanted_skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 6. SESSIONS TABLE
-- Scheduled peer learning/tutoring sessions
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    partner_name VARCHAR(100) NOT NULL,
    partner_user_id INT,
    skill_name VARCHAR(100) NOT NULL,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    color_code VARCHAR(10) DEFAULT '#8B6BF5',
    is_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. COIN_TRANSACTIONS TABLE
-- Audit log for Skill Coin earnings and spending
CREATE TABLE coin_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action_description VARCHAR(255) NOT NULL,
    coin_change INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXES FOR PERFORMANCE OPTIMIZATION
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX idx_requests_from_user ON exchange_requests(from_user_id);
CREATE INDEX idx_requests_to_user ON exchange_requests(to_user_id);
CREATE INDEX idx_requests_status ON exchange_requests(status);
CREATE INDEX idx_sessions_user_date ON sessions(user_id, session_date);
CREATE INDEX idx_coin_transactions_user ON coin_transactions(user_id);
