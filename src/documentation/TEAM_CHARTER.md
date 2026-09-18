# Team Charter: SkillBridge

---

## 1. Team Information & Roles

- **Team Name**: Team SkillBridge
- **Repository**: `SkillBridge-webapp`

### Team Members & Initial Roles (Rotation Cycle 1)

| Member Name | Role | Core Responsibilities |
| :--- | :--- | :--- |
| **Rick Kyalo** | **API Lead** | Endpoint & API contract decisions, request/response schema design |
| **Bill Amani** | **Backend Dev** | Express API endpoints, database SQL schema, business logic |
| **Vincent Chege** | **Integration / QA Lead** | API contract testing, ring partner endpoint validation, quality assurance |
| **Stephanie Jessica** | **Docs / DevOps Lead** | README maintenance, environment configuration, team deployment |

*Note: Roles rotate every 4 weeks per course guidelines.*

---

## 2. Existing App Summary

**SkillBridge** is a peer-to-peer student skill exchange web application designed for university students to share knowledge, learn new skills, and connect across academic departments. Students publish skills they can teach (*Offers*) and skills they wish to learn (*Wants*). SkillBridge facilitates collaboration either through direct peer skill-swapping or by using **Skill Coins**—an internal gamified currency earned by hosting tutoring sessions, adding offer listings, and reviewing completed learning sessions.

---

## 3. Part B App Audit (Resources & User Actions)

### Core Resources ("Things" Stored)

1. **Users / Profiles**: Student profiles containing name, department, ratings, online status, swap counts, and coin balance.
2. **Skills & Categories**: Catalog of normalized skills categorised by domain (Technology, Design, Business, etc.) mapped as offers or wants.
3. **Exchange Requests**: Skill swap or coin exchange proposals sent between students with custom messages and status tracking (`incoming`, `sent`, `accepted`, `declined`).
4. **Booked Sessions**: Scheduled mentoring sessions containing date, time, duration, skill topic, partner info, and review status.
5. **Coin Transactions**: Audit log recording Skill Coin earnings and expenditures (+10 welcome, +1 add offer, +2 accept swap, +1 review session, -3 coin request).

### User Actions Summary

| Resource | Action | Description |
| :--- | :--- | :--- |
| **Users** | `Browse & Search` | View all students, search by keyword, filter by skill tag/category, view match score % |
| **Users** | `View Detail` | Inspect student's profile, ratings, offers, and wants |
| **Profile** | `Manage Skills` | Add new skill offers (+1 coin) or wants; remove existing skills |
| **Profile** | `View Wallet` | View current Skill Coins and chronological coin history |
| **Requests** | `Send Request` | Submit a skill swap request or spend 3 coins for a direct request |
| **Requests** | `Manage Requests` | View incoming/sent requests; accept incoming request (+2 coins) or decline |
| **Sessions** | `Book Session` | Schedule a learning session on calendar with date, time, duration |
| **Sessions** | `Review Session` | Rate a completed session (+1 coin) and mark as reviewed |

---

## 4. Ring Position Configuration

- **Our Team Position**: Team SkillBridge
- **Upstream Partner** *Team 4*
- **Downstream Partner** *Team 6*

---

## 5. Repository Deliverables Checklist
