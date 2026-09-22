# API Needs Document — Upstream Partner (Maji Website)

> **Course**: API Planning & Development — Week 2 Lab  
> **Partner Role**: Upstream API Provider  
> **Provider App**: Maji Website ([GitHub Repository](https://github.com/NgwonoJeremy/maji-website))  
> **Consumer App**: SkillBridge ([GitHub Repository](c:\Users\bill7\OneDrive%20-%20Strathmore%20University\Documents\SkillBridge-1))  

---

## Part A — Upstream Integration Context

**Maji Website** is a utility and logistics platform managing water distribution, vendor stations, payment gateways, and estate delivery zones. Following our structured 15-minute upstream partner interview, SkillBridge investigated how we can consume Maji Website's APIs to support physical peer-learning workshops and student study sessions. When students and agricultural mentors schedule group tutoring sessions on SkillBridge, they often require clean water deliveries and logistical supplies at designated vendor stations across various residential estates.

---

## Part D — API Needs Statements

Each statement follows the required consumer-first format:  
`"[Consumer team] needs to [verb] [resource] in order to [reason]."`

### Needs Statement 1: Vendor Station & Pickup Hub Discovery
> **"SkillBridge needs to read active vendor station locations, station IDs, operating hours, and current stock levels from Maji Website in order to display nearby water distribution pickup hubs for students scheduling physical group study sessions."**

- **Freshness**: Updated hourly (station operational status and stock levels change periodically).
- **Volume**: Moderate (~50 to 150 requests/hour), invoked when a user configures a physical session venue on SkillBridge.
- **Auth**: Public API Key (read-only hub listing endpoint).

---

### Needs Statement 2: Operational Estate Coverage Verification
> **"SkillBridge needs to read the list of supported delivery estates and operational zone boundaries from Maji Website in order to validate whether a student's proposed meeting location falls within an active delivery service area."**

- **Freshness**: Daily or weekly cache fine (estate delivery zone boundaries change infrequently).
- **Volume**: Low volume, cached locally during session address setup or user location selection.
- **Auth**: Public read-only endpoint.

---

### Needs Statement 3: Payment Method & Gateway Options Query
> **"SkillBridge needs to read supported payment methods (e.g., M-Pesa paybill, cash on delivery, mobile wallet), transaction fee structures, and gateway statuses from Maji Website in order to dynamically render payment options in our group session checkout modal."**

- **Freshness**: Daily refresh (gateway configurations and payment rules are static day-to-day).
- **Volume**: Called once per user checkout session initiation.
- **Auth**: Authenticated API Key / Client Token.

---

### Needs Statement 4: Real-Time Delivery Dispatch Tracking
> **"SkillBridge needs to read real-time order delivery status, courier dispatch updates, and estimated arrival times from Maji Website in order to render a live logistics progress bar on the host student's upcoming session dashboard."**

- **Freshness**: Real-time / live updates (polling every 15–30 seconds during active dispatch).
- **Volume**: High frequency during active order delivery windows.
- **Auth**: Authenticated Order Token / Bearer Token.

---

### Needs Statement 5: Water Delivery Order Creation
> **"SkillBridge needs to create water delivery orders containing selected vendor station ID, destination estate address, contact phone number, and chosen payment method on Maji Website in order to automatically dispatch water supplies for scheduled peer learning workshops."**

- **Freshness**: Real-time transactional write (immediate processing).
- **Volume**: Low to moderate volume (transactional trigger upon session checkout confirmation).
- **Auth**: OAuth 2.0 / Secret Key Bearer Authentication with write permissions.

---

## Part E — Sanity-Check Against Week 1 Audit (`PART_B_AUDIT.md`)

We cross-referenced our upstream API needs against SkillBridge's Week 1 resource and action audit:

| Needs Statement | Mapped Week 1 Resource | Mapped Week 1 User Action | Audit Alignment Status |
| :--- | :--- | :--- | :--- |
| **Statement 1** (Vendor Stations) | Resource #4: *Booked Sessions* | "Book a session", "View calendar schedule" | ✅ Supported (Enhances session logistics) |
| **Statement 2** (Estate Coverage) | Resource #1: *Student Profiles / Users* | "Search students", "Filter by category" | ✅ Supported (Location validation) |
| **Statement 3** (Payment Methods) | Resource #5: *Skill Coin Transactions* | "View coin balance", "Spend coins" | ⚠️ **Gap Flagged** (See below) |
| **Statement 4** (Delivery Status) | Resource #4: *Booked Sessions* | "View calendar schedule", "Book a session" | ✅ Supported (Session tracking) |
| **Statement 5** (Order Creation) | Resource #4 & #5: *Sessions & Wallet* | "Book a session", "Spend coins" | ⚠️ **Gap Flagged** (See below) |

### 🚩 Flagged Audit Gaps
- **Gap 1 (External Payment Handling)**: SkillBridge's Week 1 audit only accounted for internal *Skill Coin* virtual transactions. Consuming Maji Website's payment methods requires SkillBridge to integrate external fiat/M-Pesa payment flows alongside internal coin balances.
- **Gap 2 (Supply Logistics Resource)**: Our Week 1 audit focused on tutoring appointments without a dedicated `Supply Delivery` resource. SkillBridge will need to map Maji Website's external `order_id` to SkillBridge's internal `session_id`.

---

## Part F — Partner Interview Reflection

> **Reflection on Upstream Partner Interview:**  
> Our interview with the Maji Website team revealed a crucial technical surprise regarding how tightly payment options are bound to delivery locations. We had initially assumed we could request a single, global list of payment methods and vendor stations across the entire platform. However, the Maji Website team explained that payment gateways (such as specific M-Pesa till numbers or card options) and available vendor stations are dynamically scoped by **estate location**. Certain residential estates operate strictly via designated local vendor pickup hubs and specific mobile money paybills due to regional distributor agreements. This insight completely altered our implementation plan: we cannot present payment options to the user upfront; instead, SkillBridge must first query and validate the student's estate location before requesting the specific vendor stations and payment methods active for that zone.
