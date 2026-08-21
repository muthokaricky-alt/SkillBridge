# Part B — App Audit: SkillBridge

> **Lab Assignment**: Week 1 API Development — Part B (Audit your existing app)  
> **Goal**: List every "thing" SkillBridge stores (*resources*) and every action a user can take on those things.

---

## 1. Every "Thing" SkillBridge Stores (Resources)

SkillBridge stores **5 main resources**:

1. **Student Profiles / Users**
   - Stores student information: name, department, initials, online status, ratings, number of reviews, number of swaps completed, and Skill Coin balance.

2. **Skills & Categories**
   - Stores skill titles categorized by domain (e.g. *Technology*, *Design*, *Languages*, *Business*) and whether a skill is offered to teach (*Offer*) or requested to learn (*Want*).

3. **Exchange Requests**
   - Stores proposals between students. Includes sender, receiver, offered skill, wanted skill, request type (*Skill Swap* vs *Skill Coin*), custom message, and request status (*Incoming*, *Sent*, *Accepted*, *Declined*).

4. **Booked Sessions**
   - Stores scheduled peer tutoring appointments: student name, partner name, skill topic, session date, session time, duration (minutes), calendar color, and review status.

5. **Skill Coin Transactions**
   - Stores the user's wallet audit log: action description, coin amount gained or spent, and timestamp.

---

## 2. Every Action a User Can Take

Below is every action a user can perform in SkillBridge, organized by resource:

### 👤 Actions on Student Profiles & Discovery
- **View student directory**: Browse the complete list of students on the platform.
- **View student details**: Inspect a student's profile card, ratings, department, and skills.
- **Search students**: Search by student name, department, or skill keyword.
- **Filter by category**: Filter student listings by skill categories or tag pills.
- **Calculate match score**: View automated % compatibility match based on shared offers and wants.

### 📚 Actions on Skills & Profile Setup
- **Add skill offer**: Add a skill to "Skills I Can Teach" (earns **+1 Skill Coin**).
- **Add skill want**: Add a skill to "Skills I Want to Learn".
- **Remove skill offer**: Remove a skill from "Skills I Can Teach".
- **Remove skill want**: Remove a skill from "Skills I Want to Learn".

### 📩 Actions on Exchange Requests
- **Send skill swap request**: Propose exchanging a skill you teach for a skill you want from another student.
- **Send skill coin request**: Use **3 Skill Coins** to request a skill without offering a swap.
- **View incoming requests**: View pending requests sent to you by other students.
- **View sent requests**: View requests you have submitted to other students.
- **Accept request**: Accept an incoming exchange proposal (earns **+2 Skill Coins**).
- **Decline request**: Decline an incoming request or cancel a sent request.

### 📅 Actions on Sessions & Schedule
- **View calendar schedule**: View booked learning sessions by month and day.
- **Book a session**: Schedule a learning session specifying partner, skill topic, date, time, and duration.
- **Review a session**: Submit a star rating for a completed session (earns **+1 Skill Coin**).

### 🪙 Actions on Skill Coins & Wallet
- **View coin balance**: View current active Skill Coin total.
- **View transaction history**: View chronological log of earned and spent Skill Coins.
- **Earn coins**: Gain coins by performing key actions (joining platform, adding skills to teach, accepting swaps, completing reviews).
- **Spend coins**: Deduct coins when sending direct requests.

---

## 3. Team Audit Summary Table

| Resource | What it Stores | Core User Actions |
| :--- | :--- | :--- |
| **Student Profiles** | Student info, ratings, department, coin balance | View, Search, Filter by category, Calculate match % |
| **Skills** | Offers (teach) and Wants (learn) by category | Add offer (+1 coin), Add want, Remove offer/want |
| **Exchange Requests** | Proposals, messages, status (swap or coin) | Send swap, Send coin (-3 coins), Accept (+2 coins), Decline |
| **Booked Sessions** | Scheduled tutoring sessions, date, time, duration | View calendar, Book session, Review completed session (+1 coin) |
| **Skill Coin Wallet** | Balance and transaction log | View balance, View transaction history, Earn/Spend coins |
