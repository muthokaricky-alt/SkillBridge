-- SkillBridge Seed Data DML Script
-- Pre-populates the database with initial mock data from server/db.js

-- 1. INSERT CATEGORIES
INSERT INTO categories (id, name) VALUES
(1, 'Technology'),
(2, 'Design'),
(3, 'Business'),
(4, 'Languages'),
(5, 'Music & Arts'),
(6, 'Fitness & Sports'),
(7, 'Academic Subjects'),
(8, 'Life Skills');

-- 2. INSERT USERS
INSERT INTO users (id, name, department, initials, is_online, rating, reviews_count, swaps_count, skill_coins) VALUES
(1, 'Bill Amani', 'Technology', 'BA', TRUE, 4.90, 23, 12, 12),
(2, 'Jessica', 'Design', 'J', TRUE, 4.80, 17, 8, 10),
(3, 'William Kasongo', 'Business', 'WK', FALSE, 5.00, 31, 15, 10),
(4, 'K.Dot', 'Music & Arts', 'KD', TRUE, 4.70, 12, 6, 10),
(5, 'La Pulga', 'Fitness & Sports', 'LP', FALSE, 4.90, 40, 20, 10),
(6, 'Walter White', 'Academic Subjects', 'WW', TRUE, 4.60, 19, 9, 10),
(7, 'Bruce Wayne', 'Business', 'BW', FALSE, 4.80, 22, 11, 10),
(8, 'Lelouch', 'Life Skills', 'L', TRUE, 4.50, 8, 4, 10),
(9, 'Naruto Uzumaki', 'Fitness & Sports', 'NU', TRUE, 4.70, 14, 7, 10),
(10, 'Ichigoat', 'Fitness & Sports', 'IG', FALSE, 4.90, 26, 13, 10),
(11, 'Jordan Lee', 'Languages', 'JL', TRUE, 4.80, 17, 8, 10),
(12, 'Priya Sharma', 'Academic Subjects', 'PS', FALSE, 5.00, 31, 15, 10);

-- 3. INSERT SKILLS
INSERT INTO skills (id, name, category_id) VALUES
(1, 'AI & Automation', 1),
(2, 'Web Development', 1),
(3, 'Python', 1),
(4, 'UI/UX Design', 2),
(5, 'Figma', 2),
(6, 'Content Creation', 2),
(7, 'Data Analysis', 1),
(8, 'Digital Marketing', 3),
(9, 'Sales', 3),
(10, 'Taxes', 3),
(11, 'Cybersecurity', 1),
(12, 'Public Speaking', 8),
(13, 'Music Production', 5),
(14, 'Songwriting', 5),
(15, 'Football Coaching', 6),
(16, 'Fitness Training', 6),
(17, 'Chemistry', 7),
(18, 'Academic Tutoring', 7),
(19, 'Cloud Computing', 1),
(20, 'Strategy & Planning', 8),
(21, 'Karate', 6),
(22, 'Spanish', 4),
(23, 'French', 4),
(24, 'Translation', 4),
(25, 'Statistics', 7),
(26, 'Flask', 1),
(27, 'Git', 1),
(28, 'UI Design', 2),
(29, 'Piano', 5);

-- 4. INSERT USER SKILLS (OFFERS & WANTS)
-- User 1 (Bill Amani)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(1, 1, 'offer'), (1, 2, 'offer'), (1, 3, 'offer'), -- Offers: AI & Automation, Web Development, Python
(1, 4, 'want'), (1, 12, 'want'), (1, 9, 'want');   -- Wants: UI/UX Design, Public Speaking, Sales

-- User 2 (Jessica)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(2, 4, 'offer'), (2, 5, 'offer'), (2, 6, 'offer'), -- Offers: UI/UX Design, Figma, Content Creation
(2, 2, 'want'), (2, 7, 'want'), (2, 8, 'want');   -- Wants: Web Development, Data Analysis, Digital Marketing

-- User 3 (William Kasongo)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(3, 9, 'offer'), (3, 10, 'offer'), (3, 8, 'offer'),
(3, 2, 'want'), (3, 11, 'want'), (3, 12, 'want');

-- User 4 (K.Dot)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(4, 13, 'offer'), (4, 14, 'offer'), (4, 6, 'offer'),
(4, 8, 'want'), (4, 9, 'want'), (4, 1, 'want');

-- User 5 (La Pulga)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(5, 15, 'offer'), (5, 16, 'offer'),
(5, 9, 'want'), (5, 8, 'want'), (5, 12, 'want');

-- User 6 (Walter White)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(6, 17, 'offer'), (6, 18, 'offer'),
(6, 4, 'want'), (6, 12, 'want'), (6, 9, 'want');

-- User 7 (Bruce Wayne)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(7, 11, 'offer'), (7, 19, 'offer'), (7, 9, 'offer'),
(7, 12, 'want'), (7, 6, 'want'), (7, 1, 'want');

-- User 8 (Lelouch)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(8, 12, 'offer'), (8, 20, 'offer'),
(8, 2, 'want'), (8, 11, 'want'), (8, 8, 'want');

-- User 9 (Naruto Uzumaki)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(9, 16, 'offer'), (9, 12, 'offer'),
(9, 1, 'want'), (9, 19, 'want'), (9, 9, 'want');

-- User 10 (Ichigoat)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(10, 21, 'offer'), (10, 16, 'offer'),
(10, 2, 'want'), (10, 8, 'want'), (10, 13, 'want');

-- User 11 (Jordan Lee)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(11, 22, 'offer'), (11, 23, 'offer'), (11, 24, 'offer'),
(11, 2, 'want'), (11, 7, 'want'), (11, 11, 'want');

-- User 12 (Priya Sharma)
INSERT INTO user_skills (user_id, skill_id, skill_type) VALUES
(12, 7, 'offer'), (12, 25, 'offer'), (12, 18, 'offer'),
(12, 2, 'want'), (12, 11, 'want'), (12, 4, 'want');

-- 5. INSERT EXCHANGE REQUESTS
INSERT INTO exchange_requests (id, from_user_id, to_user_id, offered_skill_id, wanted_skill_id, request_type, message, status, time_label) VALUES
(1, 2, 1, 4, 2, 'swap', 'Hey! I want to learn web dev. I could teach you UI/UX in return!', 'incoming', '10m ago'),
(2, 4, 1, 13, 1, 'swap', 'I want to learn AI & Automation for my next project. Happy to teach music production!', 'incoming', '2h ago'),
(3, 11, 11, NULL, 7, 'coin', 'I used 3 Skill Coins for this. I really need Data Analysis skills!', 'sent', '1d ago');

-- 6. INSERT SESSIONS
INSERT INTO sessions (id, user_id, partner_name, partner_user_id, skill_name, session_date, session_time, duration_minutes, color_code, is_reviewed) VALUES
(1, 1, 'Jessica', 2, 'UI/UX Design basics', '2026-06-26', '14:00:00', 60, '#1FD4A0', FALSE),
(2, 1, 'K.Dot', 4, 'Music Production intro', '2026-06-28', '10:30:00', 45, '#F5B731', FALSE),
(3, 1, 'Jordan Lee', 11, 'Spanish for beginners', '2026-06-30', '16:00:00', 60, '#8B6BF5', FALSE);

-- 7. INSERT COIN TRANSACTIONS
INSERT INTO coin_transactions (id, user_id, action_description, coin_change) VALUES
(1, 1, 'Joined SkillBridge', 10),
(2, 1, 'Completed swap with Jordan Lee', 2);
