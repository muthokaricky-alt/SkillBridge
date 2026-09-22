# Endpoint List — Week 3 Lab Deliverable

> **Course**: API Planning & Development — Week 3 Lab: Resources, Verbs, and REST Principles  
> **App Name**: SkillBridge  
> **Repository Root Deliverable**: `ENDPOINT_LIST.md`  
> **Source Needs Document**: [`API_NEEDS.md`](file:///c:/Users/bill7/OneDrive%20-%20Strathmore%20University/Documents/SkillBridge-1/API_NEEDS.md)  
> **Downstream Consumer**: Farmers-AgroConnect  
> **Upstream Provider**: Maji Website  
> **Needs Statement Count**: 10 Total (5 Downstream + 5 Upstream)  

---

## Overview

This document translates our Week 2 needs statements from `API_NEEDS.md` into well-formed REST endpoints adhering to standard API design conventions:

- **URLs are nouns**: Collection and single-item resources are nouns (`/experts`, `/skills`, `/stations`), avoiding verbs in paths.
- **HTTP verbs carry the action**: `GET` is used strictly for safe, idempotent reads; `POST` is used for creating new transactional records.
- **Consistent pluralization**: Standard plural naming conventions are maintained across all collections.
- **Controlled nesting**: Sub-resources are nested at most one level deep (`/experts/{id}/availability`, `/experts/{id}/reviews`) where clear ownership exists.
- **Sensible query parameters**: Resource identifiers live in the path, while filters, categories, and sorting reside in query parameters.

---

## Part A — Quick Setup Summary

- **Source Needs Document**: `API_NEEDS.md`
- **Needs Statements Count**: 10 statements total (5 Downstream for Farmers-AgroConnect + 5 Upstream for Maji Website).
- **Target File**: `ENDPOINT_LIST.md` at repository root.
- **Table Schema**: `Method | Path | Purpose | Maps to Need`

---

## Part B — Draft Endpoint List (Initial Draft)

### 1. Downstream API Endpoints (Provided by SkillBridge for Farmers-AgroConnect)

| Method | Path | Purpose | Maps to Need |
| :--- | :--- | :--- | :--- |
| `GET` | `/experts` | Return list of verified expert profiles filtered by estate/location and sorted by rating or proximity. | "Farmers-AgroConnect needs to read a list of verified expert profiles with geolocation coordinates, estate locations, and overall rating scores in order to display nearest agricultural mentors on an interactive proximity search map for local farmers." |
| `GET` | `/experts/{id}` | Return detailed profile information, bio, and exact coordinates for a specific expert. | "Farmers-AgroConnect needs to read a list of verified expert profiles with geolocation coordinates, estate locations, and overall rating scores in order to display nearest agricultural mentors on an interactive proximity search map for local farmers." |
| `GET` | `/skills` | Return categorized skill offers and teaching domains filtered by agricultural tags or categories. | "Farmers-AgroConnect needs to read categorized skill offers and teaching domains filtered by agricultural tags (e.g., Agronomy, Soil Health, Irrigation Systems) in order to populate category dropdown filters on their mentor search interface." |
| `GET` | `/experts/{id}/availability` | Return real-time available session dates, time slots, and durations for a selected expert. | "Farmers-AgroConnect needs to read real-time available session dates, time slots, and meeting durations for a selected expert in order to render a calendar booking widget on the farmer's consultation detail page." |
| `POST` | `/requests` | Create a new consultation exchange request containing farmer details, topic, expert ID, and date. | "Farmers-AgroConnect needs to create exchange booking requests containing farmer details, requested agricultural topic, target expert ID, and proposed session date in order to send direct consultation proposals to SkillBridge mentors." |
| `GET` | `/experts/{id}/reviews` | Return aggregate star ratings, review counts, and completed session badges for an expert. | "Farmers-AgroConnect needs to read aggregate star ratings, review counts, and completed session badges for individual experts in order to display verified trust metrics on mentor preview cards." |

---

### 2. Upstream API Endpoints (Consumed by SkillBridge from Maji Website)

| Method | Path | Purpose | Maps to Need |
| :--- | :--- | :--- | :--- |
| `GET` | `/stations` | Return active vendor stations, operating hours, and inventory stock levels by estate. | "SkillBridge needs to read active vendor station locations, station IDs, operating hours, and current stock levels from Maji Website in order to display nearby water distribution pickup hubs for students scheduling physical group study sessions." |
| `GET` | `/estates` | Return list of supported delivery estates and operational service zone boundaries. | "SkillBridge needs to read the list of supported delivery estates and operational zone boundaries from Maji Website in order to validate whether a student's proposed meeting location falls within an active delivery service area." |
| `GET` | `/payment-methods` | Return available payment methods, transaction fee structures, and gateway status. | "SkillBridge needs to read supported payment methods (e.g., M-Pesa paybill, cash on delivery, mobile wallet), transaction fee structures, and gateway statuses from Maji Website in order to dynamically render payment options in our group session checkout modal." |
| `GET` | `/deliveries/{id}` | Return real-time delivery status, courier dispatch updates, and estimated arrival time. | "SkillBridge needs to read real-time order delivery status, courier dispatch updates, and estimated arrival times from Maji Website in order to render a live logistics progress bar on the host student's upcoming session dashboard." |
| `POST` | `/deliveries` | Create a new water delivery order with station ID, destination address, and payment method. | "SkillBridge needs to create water delivery orders containing selected vendor station ID, destination estate address, contact phone number, and chosen payment method on Maji Website in order to automatically dispatch water supplies for scheduled peer learning workshops." |

---

## Part C — Peer Review Audit (Feedback Received from Reviewing Team 11)

Team 11 audited our initial draft against the lab's REST Convention Audit checklist and provided the following feedback:

> **Peer Reviewer Comments:**  
> *"Rows 1 and 3 (`/experts`, `/skills`) describe filters/sorting in the Purpose text that aren't reflected as query parameters in the Path. They should be added explicitly (e.g. `?estate=`, `?sort=`) so that the endpoint's interface matches what it claims to do.*  
> *Everything else such as their nouns, verbs, consistent pluralization, nesting and no caller-specific flags checks out."*

---

## Part D — Revisions Based on Feedback

We went through the peer review feedback and made the following updates and design decisions:

1. **Fixed (`GET /experts`):**  
   Updated the path from `/experts` to `GET /experts?estate={estate}&sort={rating|proximity}`. The reviewer correctly noted that because our purpose explicitly mentions filtering by estate location and sorting by rating or proximity, declaring these query parameters in the path makes the contract transparent and aligned with its stated functionality.

2. **Fixed (`GET /skills`):**  
   Updated the path from `/skills` to `GET /skills?tag={agriculturalTag}`. This makes the agricultural tag filter (e.g., Agronomy, Soil Health, Irrigation) explicitly visible in the endpoint signature as required by Downstream Need #2.

3. **Fixed (`GET /stations` - Upstream self-audit alignment):**  
   Applying the reviewer's feedback across our upstream table as well, we updated `/stations` to `GET /stations?estate={estate}` so that the estate inventory filter mentioned in the purpose is clearly declared as a query parameter.

4. **Pushback / Kept As-Is (`GET /experts/{id}/availability`):**  
   We considered whether `/availability` should be renamed or further segmented (e.g., `/availability-slots`). We decided to keep `/experts/{id}/availability` as-is: availability represents the calendar schedule state of an expert, and nesting it one level deep under `/experts/{id}` is clean, concise, and standard REST design.

---

## Part E — Final Endpoint List

### 1. Downstream API Endpoints (Provided by SkillBridge for Farmers-AgroConnect)

| Method | Path | Purpose | Maps to Need |
| :--- | :--- | :--- | :--- |
| `GET` | `/experts?estate={estate}&sort={rating\|proximity}` | Return list of verified expert profiles filtered by estate location and sorted by rating or proximity. | "Farmers-AgroConnect needs to read a list of verified expert profiles with geolocation coordinates, estate locations, and overall rating scores in order to display nearest agricultural mentors on an interactive proximity search map for local farmers." |
| `GET` | `/experts/{id}` | Return detailed profile information, bio, and exact coordinates for a specific expert. | "Farmers-AgroConnect needs to read a list of verified expert profiles with geolocation coordinates, estate locations, and overall rating scores in order to display nearest agricultural mentors on an interactive proximity search map for local farmers." |
| `GET` | `/skills?tag={agriculturalTag}` | Return categorized skill offers and teaching domains filtered by agricultural tags (e.g., Agronomy, Soil Health, Irrigation Systems). | "Farmers-AgroConnect needs to read categorized skill offers and teaching domains filtered by agricultural tags (e.g., Agronomy, Soil Health, Irrigation Systems) in order to populate category dropdown filters on their mentor search interface." |
| `GET` | `/experts/{id}/availability` | Return real-time available session dates, time slots, and durations for a selected expert. | "Farmers-AgroConnect needs to read real-time available session dates, time slots, and meeting durations for a selected expert in order to render a calendar booking widget on the farmer's consultation detail page." |
| `POST` | `/requests` | Create a new consultation exchange booking request containing farmer details, topic, expert ID, and proposed session date. | "Farmers-AgroConnect needs to create exchange booking requests containing farmer details, requested agricultural topic, target expert ID, and proposed session date in order to send direct consultation proposals to SkillBridge mentors." |
| `GET` | `/experts/{id}/reviews` | Return aggregate star ratings, review counts, and completed session badges for an expert. | "Farmers-AgroConnect needs to read aggregate star ratings, review counts, and completed session badges for individual experts in order to display verified trust metrics on mentor preview cards." |

---

### 2. Upstream API Endpoints (Consumed by SkillBridge from Maji Website)

| Method | Path | Purpose | Maps to Need |
| :--- | :--- | :--- | :--- |
| `GET` | `/stations?estate={estate}` | Return active vendor stations, operating hours, and inventory stock levels filtered by estate. | "SkillBridge needs to read active vendor station locations, station IDs, operating hours, and current stock levels from Maji Website in order to display nearby water distribution pickup hubs for students scheduling physical group study sessions." |
| `GET` | `/estates` | Return list of supported delivery estates and operational service zone boundaries. | "SkillBridge needs to read the list of supported delivery estates and operational zone boundaries from Maji Website in order to validate whether a student's proposed meeting location falls within an active delivery service area." |
| `GET` | `/payment-methods` | Return available payment methods, transaction fee structures, and gateway status. | "SkillBridge needs to read supported payment methods (e.g., M-Pesa paybill, cash on delivery, mobile wallet), transaction fee structures, and gateway statuses from Maji Website in order to dynamically render payment options in our group session checkout modal." |
| `GET` | `/deliveries/{id}` | Return real-time delivery status, courier dispatch updates, and estimated arrival time. | "SkillBridge needs to read real-time order delivery status, courier dispatch updates, and estimated arrival times from Maji Website in order to render a live logistics progress bar on the host student's upcoming session dashboard." |
| `POST` | `/deliveries` | Create a new water delivery order with station ID, destination address, contact phone, and payment method. | "SkillBridge needs to create water delivery orders containing selected vendor station ID, destination estate address, contact phone number, and chosen payment method on Maji Website in order to automatically dispatch water supplies for scheduled peer learning workshops." |
