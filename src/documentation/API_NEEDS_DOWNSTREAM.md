# API Needs Document — Downstream Partner (Farmers-AgroConnect)

> **Course**: API Planning & Development — Week 2 Lab  
> **Partner Role**: Downstream API Consumer  
> **Consumer App**: Farmers-AgroConnect ([GitHub Repository](https://github.com/Jmukami/farmers-agroconnect.git))  
> **Provider App**: SkillBridge ([GitHub Repository](c:\Users\bill7\OneDrive%20-%20Strathmore%20University\Documents\SkillBridge-1))  

---

## Part A — Consumer Overview & Workflow Context

**Farmers-AgroConnect** is an agricultural platform that connects farmers with agricultural specialists, soil scientists, agronomists, and farm tech tutors. Following our structured 10-minute downstream partner interview, Farmers-AgroConnect identified a core operational problem: their farmers urgently need to discover and consult with agricultural experts based on **geographic proximity** and **specialized domain knowledge** to receive timely on-site or virtual farm advice.

---

## Part D — API Needs Statements

Each statement follows the required consumer-first format:  
`"[Consumer team] needs to [verb] [resource] in order to [reason]."`

### Needs Statement 1: Expert Proximity & Location Discovery
> **"Farmers-AgroConnect needs to read a list of verified expert profiles with geolocation coordinates, estate locations, and overall rating scores in order to display nearest agricultural mentors on an interactive proximity search map for local farmers."**

- **Freshness**: Updated within the hour (mentor location and active status change infrequently).
- **Volume**: Moderate (~100 to 300 requests/hour), called whenever a farmer opens the expert discovery page or executes a location search.
- **Auth**: Public API Key (read-only expert directory endpoint).

---

### Needs Statement 2: Expert Domain & Skill Specialization Filtering
> **"Farmers-AgroConnect needs to read categorized skill offers and teaching domains filtered by agricultural tags (e.g., Agronomy, Soil Health, Irrigation Systems, Farm Tech) in order to populate category dropdown filters on their mentor search interface."**

- **Freshness**: Daily refresh / static caching fine (skill categories and offered topics change rarely).
- **Volume**: Low volume, fetched once on application startup or cached on the client side.
- **Auth**: Public read-only (no authentication required).

---

### Needs Statement 3: Real-Time Expert Calendar Availability
> **"Farmers-AgroConnect needs to read real-time available session dates, time slots, and meeting durations for a selected expert in order to render a calendar booking widget on the farmer's consultation detail page."**

- **Freshness**: Real-time (must be live to prevent double-booking of mentor calendar slots).
- **Volume**: High frequency per booking interaction (called whenever a farmer views a specific mentor profile or selects a booking date).
- **Auth**: Bearer Token / Authenticated session key required.

---

### Needs Statement 4: Direct Consultation Booking Request
> **"Farmers-AgroConnect needs to create exchange booking requests containing farmer details, requested agricultural topic, target expert ID, and proposed session date in order to send direct consultation proposals to SkillBridge mentors."**

- **Freshness**: Real-time transactional write (immediate request dispatch).
- **Volume**: Low to moderate volume (transactional action triggered when a farmer submits a consultation request).
- **Auth**: Authenticated User Session / OAuth 2.0 API Key with request creation permissions.

---

### Needs Statement 5: Expert Ratings & Trust Verification
> **"Farmers-AgroConnect needs to read aggregate star ratings, review counts, and completed session badges for individual experts in order to display verified trust metrics on mentor preview cards."**

- **Freshness**: Updated hourly or background revalidated.
- **Volume**: Batch loaded alongside expert profile listing queries.
- **Auth**: Public read-only.

---

## Part E — Sanity-Check Against Week 1 Audit (`PART_B_AUDIT.md`)

We cross-referenced every downstream needs statement against our Week 1 resource and action audit for SkillBridge:

| Needs Statement | Mapped Week 1 Resource | Mapped Week 1 User Action | Audit Alignment Status |
| :--- | :--- | :--- | :--- |
| **Statement 1** (Location Search) | Resource #1: *Student Profiles / Users* | "View student directory", "Search students" | ⚠️ **Gap Flagged** (See below) |
| **Statement 2** (Skill Filtering) | Resource #2: *Skills & Categories* | "Filter by category", "Add skill offer" | ✅ Fully Supported |
| **Statement 3** (Availability Slots) | Resource #4: *Booked Sessions* | "View calendar schedule", "Book a session" | ✅ Fully Supported |
| **Statement 4** (Booking Request) | Resource #3: *Exchange Requests* | "Send skill swap request", "Send skill coin request" | ✅ Fully Supported |
| **Statement 5** (Ratings & Reviews) | Resource #1: *Student Profiles / Users* | "View student details", "Review a session" | ✅ Fully Supported |

### 🚩 Flagged Audit Gap
- **Gap Identified**: In our Week 1 audit, *Student Profiles* stored `name`, `department`, `initials`, `ratings`, and `Skill Coin balance`, but did **not** include explicit geographic parameters like latitude/longitude or estate neighborhood locations.
- **Action Plan**: SkillBridge must extend the `Student Profiles` resource schema to include `location_estate` and `coordinates` before building the Week 3 endpoint list, directly addressing Farmers-AgroConnect's proximity requirement.

---

## Part F — Partner Interview Reflection

> **Reflection on Downstream Partner Interview:**  
> During our interview with the Farmers-AgroConnect team, we were genuinely surprised to discover how critical precise geographic proximity is to their users. We had originally assumed that skill sharing over SkillBridge would happen almost entirely through virtual video calls or text chats. However, Farmers-AgroConnect explained that farmers frequently require hands-on, physical on-site assistance—such as inspecting soil quality, setting up irrigation drip lines, or evaluating crop disease in person. This insight completely shifted our perspective: instead of serving just a generic list of online mentors, our API must provide estate-level location data and proximity sorting. Furthermore, learning that they needed live calendar availability rather than asynchronous messaging forced us to prioritize real-time session slot endpoints over simple message dispatching.
