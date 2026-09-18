# API Needs Document — Week 2 Deliverable: SkillBridge Platform

> **Course**: API Planning & Development — Week 2 Lab  
> **Repository Root Deliverable**: `API_NEEDS.md`  
> **App Name**: SkillBridge ([GitHub Repository](c:\Users\bill7\OneDrive%20-%20Strathmore%20University\Documents\SkillBridge-1))  
> **Downstream Partner**: Farmers-AgroConnect ([GitHub Repository](https://github.com/Jmukami/farmers-agroconnect.git))  
> **Upstream Partner**: Maji Website ([GitHub Repository](https://github.com/NgwonoJeremy/maji-website))  

---

## Executive Summary & Navigation

This document serves as the master API Needs planning document for SkillBridge, covering both our **downstream consumer** (Farmers-AgroConnect) and our **upstream provider** (Maji Website). Detailed sub-documents are also maintained in the repository:
- 📄 [Downstream API Needs Document (Farmers-AgroConnect)](file:///c:/Users/bill7/OneDrive%20-%20Strathmore%20University/Documents/SkillBridge-1/API_NEEDS_DOWNSTREAM.md)
- 📄 [Upstream API Needs Document (Maji Website)](file:///c:/Users/bill7/OneDrive%20-%20Strathmore%20University/Documents/SkillBridge-1/API_NEEDS_UPSTREAM.md)

---

## Section 1 — Downstream API Needs (Farmers-AgroConnect)

Farmers-AgroConnect consumes SkillBridge APIs to discover agricultural experts, view mentor locations, check real-time calendar availability, and dispatch consultation requests for farmers.

### API Needs Statements

1. **Expert Proximity & Location Discovery**  
   `"Farmers-AgroConnect needs to read a list of verified expert profiles with geolocation coordinates, estate locations, and overall rating scores in order to display nearest agricultural mentors on an interactive proximity search map for local farmers."`  
   - **Freshness**: Updated within the hour.  
   - **Volume**: Moderate (~100–300 requests/hour per search interaction).  
   - **Auth**: Public API Key.

2. **Expert Domain & Skill Specialization Filtering**  
   `"Farmers-AgroConnect needs to read categorized skill offers and teaching domains filtered by agricultural tags (e.g., Agronomy, Soil Health, Irrigation Systems) in order to populate category dropdown filters on their mentor search interface."`  
   - **Freshness**: Daily cache fine.  
   - **Volume**: Low volume, fetched once on app startup or cached client-side.  
   - **Auth**: Public read-only.

3. **Real-Time Expert Calendar Availability**  
   `"Farmers-AgroConnect needs to read real-time available session dates, time slots, and meeting durations for a selected expert in order to render a calendar booking widget on the farmer's consultation detail page."`  
   - **Freshness**: Real-time (prevents double-booking).  
   - **Volume**: High frequency per booking interaction.  
   - **Auth**: Bearer Token required.

4. **Direct Consultation Booking Request**  
   `"Farmers-AgroConnect needs to create exchange booking requests containing farmer details, requested agricultural topic, target expert ID, and proposed session date in order to send direct consultation proposals to SkillBridge mentors."`  
   - **Freshness**: Real-time transactional write.  
   - **Volume**: Low to moderate volume (transactional upon booking submission).  
   - **Auth**: Authenticated User Session / OAuth 2.0 API Key.

5. **Expert Ratings & Trust Verification**  
   `"Farmers-AgroConnect needs to read aggregate star ratings, review counts, and completed session badges for individual experts in order to display verified trust metrics on mentor preview cards."`  
   - **Freshness**: Updated hourly.  
   - **Volume**: Batch loaded alongside expert profile listing queries.  
   - **Auth**: Public read-only.

---

## Section 2 — Upstream API Needs (Maji Website)

SkillBridge consumes Maji Website APIs to fetch vendor delivery station data, available payment methods, estate coverage zones, and live dispatch tracking for physical study session water/resource deliveries.

### API Needs Statements

1. **Vendor Station & Pickup Hub Discovery**  
   `"SkillBridge needs to read active vendor station locations, station IDs, operating hours, and current stock levels from Maji Website in order to display nearby water distribution pickup hubs for students scheduling physical group study sessions."`  
   - **Freshness**: Updated hourly.  
   - **Volume**: Moderate (~50–150 requests/hour).  
   - **Auth**: Public API Key.

2. **Operational Estate Coverage Verification**  
   `"SkillBridge needs to read the list of supported delivery estates and operational zone boundaries from Maji Website in order to validate whether a student's proposed meeting location falls within an active delivery service area."`  
   - **Freshness**: Daily/weekly cache fine.  
   - **Volume**: Low volume, cached locally during location entry.  
   - **Auth**: Public read-only endpoint.

3. **Payment Method & Gateway Options Query**  
   `"SkillBridge needs to read supported payment methods (e.g., M-Pesa paybill, cash on delivery, mobile wallet), transaction fee structures, and gateway statuses from Maji Website in order to dynamically render payment options in our group session checkout modal."`  
   - **Freshness**: Daily refresh.  
   - **Volume**: Called once per user checkout modal opening.  
   - **Auth**: Authenticated API Key.

4. **Real-Time Delivery Dispatch Tracking**  
   `"SkillBridge needs to read real-time order delivery status, courier dispatch updates, and estimated arrival times from Maji Website in order to render a live logistics progress bar on the host student's upcoming session dashboard."`  
   - **Freshness**: Real-time / live updates (polling every 15–30 s).  
   - **Volume**: High frequency during active delivery dispatch windows.  
   - **Auth**: Authenticated Order Token / Bearer Token.

5. **Water Delivery Order Creation**  
   `"SkillBridge needs to create water delivery orders containing selected vendor station ID, destination estate address, contact phone number, and chosen payment method on Maji Website in order to automatically dispatch water supplies for scheduled peer learning workshops."`  
   - **Freshness**: Real-time transactional write.  
   - **Volume**: Low to moderate volume (triggered on session checkout).  
   - **Auth**: OAuth 2.0 / Secret Key Bearer Authentication.

---

## Section 3 — Sanity-Check Against Week 1 Audit (`PART_B_AUDIT.md`)

All 10 needs statements were verified against our Week 1 resource/action audit:

- **Mapped Successfully**:
  - Expert Directory & Search $\rightarrow$ Resource #1 (*Student Profiles*)
  - Skill Categories $\rightarrow$ Resource #2 (*Skills & Categories*)
  - Availability & Booking $\rightarrow$ Resource #4 (*Booked Sessions*) & Resource #3 (*Exchange Requests*)
  - Vendor Stations & Estate Coverage $\rightarrow$ Resource #4 (*Booked Sessions*)

- **Flagged Audit Gaps**:
  1. 🚩 **Geographic Proximity Schema Gap**: Week 1 *Student Profiles* lacked explicit geolocation coordinates / estate neighborhood fields. `Student Profiles` must be updated to include `location_estate` and `coordinates`.
  2. 🚩 **External Payment & Delivery Logistics Gap**: Week 1 audit focused on internal *Skill Coins*. Integrating Maji Website requires mapping external `order_id` and fiat payment gateways to SkillBridge's `session_id`.

---

## Section 4 — Partner Interview Reflection

> **Reflection on Downstream & Upstream Partner Interviews:**  
> Conducting structured interviews with both our downstream partner (Farmers-AgroConnect) and upstream partner (Maji Website) completely transformed our assumptions regarding API scope and data dependencies.  
>  
> From **Farmers-AgroConnect**, we were surprised to learn that farmers require physical, on-site expert assistance for agricultural diagnostics rather than purely virtual video calls. This forced us to shift from a simple mentor listing endpoint to an estate-level proximity query API with real-time calendar availability.  
>  
> From **Maji Website**, we discovered that payment methods, vendor stations, and operational hours are dynamically scoped by specific **estate zones**. We had assumed we could fetch a single static list of payment methods; instead, Maji Website showed us that estate location validation must strictly precede any vendor hub or payment gateway query. These conversations saved us from building disconnected endpoints and ensured our Week 3 endpoint design directly targets real operational workflows.
